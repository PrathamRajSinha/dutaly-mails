import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const str = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");

const FORMAT_RULES = `Formatting: the body is plain text with line breaks. You MAY use only these inline tags for emphasis: <b>, <i>, <u>, <ul><li>, <ol><li>, <a href="https://...">. Use them sparingly.
Variables available (keep any that exist exactly as written): {{sender_name}} (customer's name), {{subject}}, {{my_name}} (the sender/business), {{date}}.
Never invent prices, timelines, policies or links — use a clear placeholder like [your refund window] when a fact is unknown.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Please sign in again." }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return json({ error: "Please sign in again." }, 401);

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI is not configured." }, 500);

    const input = await req.json().catch(() => ({}));
    const mode = input.mode === "improve" ? "improve" : "generate";
    const prompt = str(input.prompt, 1000).trim();
    const body = str(input.body, 8000);
    const tone = str(input.tone, 40);
    if (mode === "generate" && !prompt) return json({ error: "Describe the template you want." }, 400);
    if (mode === "improve" && !body.trim()) return json({ error: "Write something first, then improve it." }, 400);

    const system = mode === "generate"
      ? `You write reusable customer-support email templates for a business.
${FORMAT_RULES}
Start with a greeting using {{sender_name}} and end with a sign-off using {{my_name}}.
Return ONLY JSON: {"name": short template name, "category": one lowercase word, "body": the template, "footer_text": short sign-off/footer line or ""}`
      : `You improve an existing email template. Keep the author's intent, facts and all {{variables}} and formatting tags. Fix grammar, clarity and flow.
${FORMAT_RULES}
Return ONLY JSON: {"body": the improved template}`;

    const userMsg = mode === "generate"
      ? `Template request: ${prompt}${tone ? `\nTone: ${tone}` : ""}`
      : `Current template:\n${body}\n\nInstructions: ${prompt || "Make it clearer, warmer and more professional."}${tone ? `\nTone: ${tone}` : ""}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: system,
        input: [{ role: "user", content: userMsg }],
        reasoning: { effort: "low" },
        text: { format: { type: "json_object" } },
        store: false,
        stream: true,
      }),
    });
    if (!res.ok || !res.body) {
      console.error("AI error", res.status, await res.text().catch(() => ""));
      if (res.status === 429) return json({ error: "The AI is busy. Please try again in a minute." }, 429);
      if (res.status === 402) return json({ error: "AI credits are used up. Please add credits to continue." }, 402);
      if (res.status === 403) return json({ error: "AI writing is unavailable for this workspace right now." }, 403);
      return json({ error: "The AI couldn't write that. Please try again." }, 502);
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", out = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue;
        const p = line.slice(5).trim();
        if (!p || p === "[DONE]") continue;
        try {
          const ev = JSON.parse(p);
          if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") out += ev.delta;
          if (ev.type === "response.failed" || ev.type === "error") return json({ error: "The AI couldn't write that. Please try again." }, 502);
        } catch { /* partial */ }
      }
    }

    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(out.replace(/```json|```/g, "").trim()); } catch { parsed = { body: out.trim() }; }
    const resultBody = str(parsed.body, 8000).trim();
    if (!resultBody) return json({ error: "The AI didn't return a template. Please try again." }, 502);

    return json({
      body: resultBody,
      name: str(parsed.name, 80).trim() || undefined,
      category: str(parsed.category, 30).trim().toLowerCase() || undefined,
      footer_text: typeof parsed.footer_text === "string" ? str(parsed.footer_text, 300) : undefined,
    });
  } catch (e) {
    console.error("template-ai error", e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
