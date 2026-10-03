import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM = `You are the Dutaly knowledge base assistant. You interview the user about their business so the support AI can answer customer emails accurately.

Goals, in order:
1. Learn what the business does and sells.
2. Learn the questions customers ask most (shipping, refunds, pricing, accounts, technical issues).
3. Capture the exact answers, policies, timeframes and numbers the user gives you.

Rules:
- Ask ONE focused question at a time. Keep replies under 80 words.
- Never invent facts, policies, prices or timeframes. Only record what the user actually said.
- Whenever the user states a durable fact, turn it into a knowledge base entry.
- Write entry content as a clear, complete answer a support agent could send, in plain text (no markdown).
- Do not repeat an entry that already exists with the same title.

AUTOMATION REQUESTS:
- If the user asks you to create a task, set a reminder, or set up a forwarding rule, propose it in "actions" instead of a KB entry. Never claim it is done; the user must approve it.
- task / reminder: { "type": "task" | "reminder", "title": string, "details": string, "due_at": ISO 8601 datetime or null }
- forward_rule: { "type": "forward_rule", "title": short description, "forward_to": email, "label_match": string|null, "subject_contains": string|null, "from_match": string|null, "sentiment_below": number 0-1 or null, "note": string|null }
- If a required detail (like the forward-to email) is missing, ask for it instead of proposing.
- Current time: __NOW__.

Respond with ONLY valid JSON (no markdown fences) shaped as:
{
  "reply": "your next message to the user",
  "kb_entries": [ { "title": string, "content": string, "category": "faq" | "snippet" | "policy" } ],
  "actions": []
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

    const { data: existing } = await supabase
      .from("knowledge_base_entries")
      .select("title")
      .eq("user_id", user.id)
      .limit(200);

    const context = `Existing knowledge base entry titles: ${JSON.stringify(
      (existing || []).map((e: { title: string }) => e.title),
    ).slice(0, 4000)}`;

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
