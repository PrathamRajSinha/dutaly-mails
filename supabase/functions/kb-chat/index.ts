import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM = `You are the Dutaly knowledge base strategist. You interview the user about their business so the support AI can answer customer emails accurately. Every fact you capture is saved AUTOMATICALLY — there is no approval step.

Interview plan, in order (skip anything already covered in the existing knowledge base):
1. What the business does, sells, and who the customers are.
2. Top customer questions that came in but could not be answered (listed under "Unanswered customer topics" — prioritise these!).
3. Shipping/delivery, refunds/returns, pricing/plans, business hours/contact, account help, technical issues.
4. Tone and anything the AI must never say.

Rules:
- Ask ONE focused question at a time. Keep replies under 80 words. Briefly acknowledge what you saved, then ask the next question.
- Never invent facts, policies, prices or timeframes. Only record what the user actually said.
- Whenever the user states a durable fact, turn it into a knowledge base entry. Split separate topics into separate entries.
- Write entry content as a clear, complete answer a support agent could send, in plain text (no markdown).
- Never create an entry whose title duplicates an existing one. If the user corrects an existing fact, create an entry titled "<existing title> (updated)".
- If the user asks you to send an email, set a reminder, create a task or a forwarding rule, say that's done in Inbox Intelligence (sidebar), and return no entries.

Respond with ONLY valid JSON (no markdown fences) shaped as:
{
  "reply": "your next message to the user",
  "kb_entries": [ { "title": string, "content": string, "category": "faq" | "snippet" | "policy" } ]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Please sign in again." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI is not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Please sign in again." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages = [] } = await req.json();

    const [{ data: existing }, { data: gaps }] = await Promise.all([
      supabase
        .from("knowledge_base_entries")
        .select("title, content")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(150),
      supabase
        .from("kb_gap_events")
        .select("detected_topic")
        .eq("user_id", user.id)
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    const kbSummary = (existing || [])
      .map((e: { title: string; content: string }) => `- ${e.title}: ${(e.content || "").slice(0, 120)}`)
      .join("\n")
      .slice(0, 8000);
    const gapTopics = [...new Set((gaps || []).map((g: { detected_topic: string }) => g.detected_topic))].slice(0, 15);

    const context = `Existing knowledge base:\n${kbSummary || "(empty)"}\n\nUnanswered customer topics: ${
      gapTopics.length ? gapTopics.join("; ") : "(none)"
    }`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning_effort: "low",
        messages: [
          { role: "system", content: SYSTEM.replace("__NOW__", new Date().toISOString()) },
          { role: "system", content: context },
          ...(messages as { role: string; content: string }[]).slice(-24).map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("AI gateway error", res.status, detail);
      const message =
        res.status === 429
          ? "The AI is busy right now. Please try again in a minute."
          : res.status === 402
            ? "AI credits are used up. Please add credits to continue."
            : "The AI could not answer just now. Please try again.";
      return new Response(JSON.stringify({ error: message }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      parsed = { reply: raw || "Sorry, could you say that another way?", kb_entries: [] };
    }

    const kb_entries = (Array.isArray(parsed.kb_entries) ? parsed.kb_entries : [])
      .filter((e: { title?: string; content?: string }) => e?.title && e?.content)
      .slice(0, 5)
      .map((e: { title: string; content: string; category?: string }) => ({
        title: String(e.title).slice(0, 200),
        content: String(e.content).slice(0, 5000),
        category: ["faq", "snippet", "policy"].includes(String(e.category))
          ? String(e.category)
          : "snippet",
      }));

    const s = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
    const actions = (Array.isArray(parsed.actions) ? parsed.actions : [])
      .slice(0, 3)
      .map((a: Record<string, unknown>) => {
        if (a?.type === "forward_rule") {
          const to = s(a.forward_to, 320);
          if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return null;
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
      })
      .filter(Boolean);

    return new Response(
      JSON.stringify({
        reply: typeof parsed.reply === "string" ? parsed.reply : "Got it.",
        kb_entries,
        actions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("kb-chat error", e);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
