import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

const STOP = new Set("the a an and or to of in on for with is are was be it this that you your we our i me my have has can will do not".split(" "));
const words = (t: string) =>
  [...new Set(t.toLowerCase().match(/[a-z0-9]{3,}/g) || [])].filter((w) => !STOP.has(w));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Please sign in again." }, 401);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return json({ error: "Please sign in again." }, 401);

    const input = await req.json().catch(() => ({}));
    const body = str(input.body, 20000);
    if (!body) return json({ error: "Email body is required" }, 400);
    const subject = str(input.subject, 500);
    const from_name = str(input.from_name, 200);
    const from_address = str(input.from_address, 320);
    const intent = str(input.intent, 50);
    const draft = str(input.draft, 5000).trim();
    const extra = str(input.instructions, 500).trim();
    const emailId = str(input.email_id, 64);

    const { data: instructions } = await supabase
      .from("ai_instructions")
      .select("tone, reply_length, signature, system_prompt")
      .eq("user_id", user.id)
      .maybeSingle();

    // Customer sentiment from the linked ticket, if any
    let sentiment: number | null = null;
    if (emailId) {
      const { data: q } = await supabase
        .from("email_queue").select("ticket_id").eq("id", emailId).eq("user_id", user.id).maybeSingle();
      if (q?.ticket_id) {
        const { data: t } = await supabase
          .from("tickets").select("sentiment_score").eq("id", q.ticket_id).eq("user_id", user.id).maybeSingle();
        sentiment = t?.sentiment_score ?? null;
      }
    }

    // Relevant knowledge base entries (simple keyword match)
    const { data: kb } = await supabase
      .from("knowledge_base_entries")
      .select("title, content, extracted_text")
      .eq("user_id", user.id)
      .limit(300);
    const qWords = words(`${subject} ${body} ${draft}`);
    const kbContext = (kb || [])
      .map((e) => {
        const text = `${e.title}\n${e.content || ""}\n${e.extracted_text || ""}`;
        const lw = text.toLowerCase();
        return { e, text, score: qWords.reduce((s, w) => s + (lw.includes(w) ? 1 : 0), 0) };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => `### ${x.e.title}\n${x.text.slice(0, 1500)}`)
      .join("\n\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const senderName = from_name || from_address.split("@")[0] || "the sender";
    const mood = sentiment === null ? "unknown" : sentiment < 0.3 ? "upset" : sentiment < 0.6 ? "neutral" : "positive";

    const task = draft
      ? `The user has started a reply. IMPROVE it into a complete, polished email.
- Keep the user's intent, key points, commitments and any specific details (dates, names, numbers) exactly.
- Expand and polish; do not replace their message with a different one or change their decision.
- Only add facts that appear in the knowledge base below.`
      : `Write a reply to the email. Only state facts found in the knowledge base below; if the answer isn't there, say you'll look into it.`;

    const system = `You are a helpful email reply assistant.
${task}

Tone: ${instructions?.tone || "professional"}
Length: ${instructions?.reply_length || "medium"} (short = 1-2 sentences, medium = 3-5 sentences, long = detailed paragraph)
Customer mood: ${mood}${mood === "upset" ? " — be empathetic and calm." : ""}
${instructions?.signature ? `Sign off with: ${instructions.signature}` : ""}
${instructions?.system_prompt ? `Additional instructions: ${instructions.system_prompt}` : ""}
${extra ? `User's instructions for this reply (follow these): ${extra}` : ""}

KNOWLEDGE BASE:
${kbContext || "(no relevant entries)"}

Write ONLY the reply text. No subject line, no "Re:", no markdown. Plain text only.`;

    const userMsg = `Email from ${senderName} (${from_address || "unknown"})
Subject: ${subject || "No subject"}
${intent ? `Detected intent: ${intent}` : ""}

${body}${draft ? `\n\n---\nUSER'S DRAFT REPLY:\n${draft}` : ""}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "fetch",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: system,
        input: [{ role: "user", content: userMsg }],
        reasoning: { effort: "low" },
        store: false,
        stream: true,
      }),
    });

    if (!aiResponse.ok || !aiResponse.body) {
      if (aiResponse.status === 429) return json({ error: "Too many requests right now. Please try again in a moment." }, 429);
      if (aiResponse.status === 402) return json({ error: "AI credits have run out. Please add more to keep writing replies." }, 402);
      if (aiResponse.status === 403) return json({ error: "AI writing is currently unavailable for this workspace." }, 403);
      console.error("AI Gateway error:", aiResponse.status, await aiResponse.text());
      throw new Error("We couldn't write a reply. Please try again.");
    }

    // Read the streamed response and collect the reply text
    const reader = aiResponse.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let reply = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") reply += ev.delta;
          if (ev.type === "response.failed" || ev.type === "error") {
            console.error("AI stream error:", payload);
            throw new Error("We couldn't write a reply. Please try again.");
          }
        } catch (e) {
          if (e instanceof Error && e.message.startsWith("We couldn't")) throw e;
        }
      }
    }

    if (!reply.trim()) return json({ error: "The AI didn't return a reply. Please try again." }, 502);
    return json({ reply: reply.trim() });
  } catch (error: unknown) {
    console.error("Error in generate-reply:", error);
    return json({ error: error instanceof Error ? error.message : "Something went wrong." }, 500);
  }
});
