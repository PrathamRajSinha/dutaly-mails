import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SYSTEM = `You are the Dutaly inbox agent. You answer questions about the user's emails AND you can take actions for them.

ANSWERING:
- Answer questions using ONLY the email data provided. Mention the sender name/address and subject when referencing emails.
- Plain text only. No markdown (no **, #, bullets with *). Simple numbered lists are fine.

ACTIONS (the app shows each as a card the user approves; you never perform them yourself):
- send_email: { "type": "send_email", "to": email, "subject": string, "body": plain-text email body including greeting and sign-off }
- task / reminder: { "type": "task" | "reminder", "title": string, "details": string|null, "due_at": ISO 8601 datetime or null }
- forward_rule: { "type": "forward_rule", "title": short description, "forward_to": email, "label_match": string|null, "subject_contains": string|null, "from_match": string|null, "sentiment_below": number 0-1 or null, "note": string|null }
- When the user asks you to email/mail/send/write to someone, IMMEDIATELY propose a send_email action with a complete, polished draft. Do not ask "should I?" first. Do not say you cannot send — the user sends it with one click on the card.
- Your "reply" should be one short sentence like "Here's the email, ready to send." Do not repeat the full email in "reply".
- If the user asks to change a draft, propose a new send_email action with the revision.
- If the recipient is a name, resolve it from the known contacts list. If you can't resolve it, ask for the address.
- Never claim an action is done.
- Current time: __NOW__ (user timezone: __TZ__). Resolve relative dates like "tomorrow" in that timezone.

Respond with ONLY valid JSON (no fences): { "reply": string, "actions": [] }`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Please sign in again." }, 401);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return json({ error: "Please sign in again." }, 401);

    const body = await req.json();
    const { start_date, end_date, timezone } = body ?? {};
    let history: { role: string; content: string }[] = Array.isArray(body?.messages) ? body.messages : [];
    if (!history.length && typeof body?.question === "string") history = [{ role: "user", content: body.question }];
    history = history
      .filter((m) => m && typeof m.content === "string" && m.content.trim())
      .slice(-20)
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content.slice(0, 6000) }));
    if (!history.length || history[history.length - 1].role !== "user") return json({ error: "Please type a message." }, 400);

    const { data: canAsk } = await supabase.rpc("check_usage_limit", { p_user_id: user.id, p_resource_type: "ai_questions" });
    if (!canAsk) return json({ error: "You've used all your AI questions for this month. Upgrade your plan to keep going." }, 403);

    let query = supabase
      .from("email_queue")
      .select("from_address, from_name, subject, body, suggested_reply, status, intent, queued_at, confidence_score")
      .eq("user_id", user.id)
      .order("queued_at", { ascending: false })
      .limit(250);
    if (start_date) query = query.gte("queued_at", start_date);
    if (end_date) query = query.lte("queued_at", end_date);
    const { data: emails, error: emailsError } = await query;
    if (emailsError) throw new Error("Failed to fetch emails");
    const list = (emails || []).reverse();

    const contacts = new Map<string, string>();
    for (const e of list) if (e.from_address) contacts.set(e.from_address.toLowerCase(), e.from_name || "");

    const emailContext = list.map((e: any) => {
      let entry = `From ${e.from_name || ""} <${e.from_address}> [${e.queued_at}]\nSubject: ${e.subject}\nIntent: ${e.intent || "unknown"} | Status: ${e.status}\n${String(e.body || "").slice(0, 1500)}`;
      if (e.suggested_reply) entry += `\nAI Reply: ${String(e.suggested_reply).slice(0, 600)}`;
      return entry;
    }).join("\n===\n");

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);

    const tz = typeof timezone === "string" && timezone.length < 60 ? timezone : "UTC";
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning_effort: "low",
        messages: [
          { role: "system", content: SYSTEM.replace("__NOW__", new Date().toISOString()).replace("__TZ__", tz) },
          { role: "system", content: `Known contacts: ${JSON.stringify([...contacts].map(([a, n]) => (n ? `${n} <${a}>` : a))).slice(0, 6000)}` },
          { role: "system", content: `EMAILS (${list.length}):\n${emailContext || "(none in this range)"}`.slice(0, 120000) },
          ...history,
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.error("AI gateway error", res.status, await res.text());
      const message = res.status === 429
        ? "The AI is busy right now. Please try again in a minute."
        : res.status === 402
          ? "AI credits are used up. Please add credits to continue."
          : "The AI could not answer just now. Please try again.";
      return json({ error: message }, res.status);
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { parsed = { reply: raw, actions: [] }; }

    const s = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
    const actions = (Array.isArray(parsed.actions) ? parsed.actions : []).slice(0, 3).map((a: Record<string, unknown>) => {
      if (a?.type === "send_email") {
        const to = s(a.to, 320);
        const b = s(a.body, 10000);
        if (!to || !EMAIL_RE.test(to) || !b) return null;
        return { type: "send_email", to, subject: s(a.subject, 250) || "(no subject)", body: b };
      }
      if (a?.type === "forward_rule") {
        const to = s(a.forward_to, 320);
        if (!to || !EMAIL_RE.test(to)) return null;
        const sb = typeof a.sentiment_below === "number" && a.sentiment_below > 0 && a.sentiment_below <= 1 ? a.sentiment_below : null;
        return { type: "forward_rule", title: s(a.title, 120) || "Forwarding rule", forward_to: to,
          label_match: s(a.label_match, 40), subject_contains: s(a.subject_contains, 120), from_match: s(a.from_match, 200),
          sentiment_below: sb, note: s(a.note, 1000) };
      }
      if (a?.type === "task" || a?.type === "reminder") {
        const title = s(a.title, 200);
        if (!title) return null;
        const due = s(a.due_at, 40);
        return { type: a.type, title, details: s(a.details, 1000), due_at: due && !isNaN(Date.parse(due)) ? new Date(due).toISOString() : null };
      }
      return null;
    }).filter(Boolean);

    await supabase.rpc("increment_usage", { p_user_id: user.id, p_resource_type: "ai_questions" });

    const emailSummaries = list.slice(-50).map((e: any) => ({
      from_name: e.from_name, from_address: e.from_address, subject: e.subject, body: e.body, status: e.status,
      intent: e.intent, queued_at: e.queued_at, confidence_score: e.confidence_score, suggested_reply: e.suggested_reply,
    }));

    return json({
      answer: typeof parsed.reply === "string" && parsed.reply ? parsed.reply : "Done.",
      actions,
      email_count: actions.length ? 0 : list.length,
      emails: actions.length ? [] : emailSummaries,
    });
  } catch (error) {
    console.error("ask-about-emails error:", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
