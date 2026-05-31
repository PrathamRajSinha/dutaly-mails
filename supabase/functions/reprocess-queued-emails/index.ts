import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReprocessRequest {
  email_ids?: string[]; // optional; if omitted reprocess all eligible
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ReprocessRequest = await req.json().catch(() => ({}));

    // Fetch target emails: explicit ids OR all "needs review" style entries
    let query = supabase
      .from("email_queue")
      .select("id, from_address, from_name, subject, body, thread_id, suggested_reply, confidence_score, status")
      .eq("user_id", user.id);

    if (body.email_ids && body.email_ids.length > 0) {
      query = query.in("id", body.email_ids);
    } else {
      // Default: pending emails with no reply or low confidence
      query = query.eq("status", "pending");
    }

    const { data: targets, error: targetsErr } = await query;
    if (targetsErr) throw targetsErr;

    const eligible = (targets || []).filter((e: any) => {
      if (body.email_ids?.length) return true;
      return !e.suggested_reply || (e.confidence_score !== null && e.confidence_score < 0.7);
    });

    if (eligible.length === 0) {
      return new Response(
        JSON.stringify({ reprocessed: 0, message: "No emails needed reprocessing" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch KB + instructions once
    const [{ data: knowledgeEntries }, { data: instructions }] = await Promise.all([
      supabase
        .from("knowledge_base_entries")
        .select("id, title, content, category, extracted_text")
        .eq("user_id", user.id),
      supabase.from("ai_instructions").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

    const ai = instructions || {
      system_prompt: "You are a helpful email assistant.",
      tone: "professional",
      reply_length: "medium",
      signature: "",
      do_rules: [],
      do_not_rules: [],
      greeting_response_enabled: true,
      greeting_template: "Hello! Thank you for reaching out.",
    };

    const knowledgeContext = (knowledgeEntries || [])
      .map((e: any) => {
        const c = e.extracted_text ? `${e.content}\n\nExtracted:\n${e.extracted_text}` : e.content;
        return `[${(e.category || "general").toUpperCase()}] ${e.title}:\n${c}`;
      })
      .join("\n\n");

    let reprocessed = 0;
    let updated = 0;

    for (const email of eligible) {
      try {
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `${ai.system_prompt}

KNOWLEDGE BASE:
${knowledgeContext || "No knowledge entries available."}

INSTRUCTIONS:
- Tone: ${ai.tone}
- Reply length: ${ai.reply_length}
- Signature: ${ai.signature || ""}
${ai.do_rules?.length ? `DO:\n${ai.do_rules.map((r: string) => `- ${r}`).join("\n")}` : ""}
${ai.do_not_rules?.length ? `DO NOT:\n${ai.do_not_rules.map((r: string) => `- ${r}`).join("\n")}` : ""}
- NEVER use markdown formatting.
- ONLY reply with information explicitly stated in the knowledge base.
- If the knowledge base does NOT cover the question, set action to "queue".

Respond ONLY with a JSON object:
{
  "intent": "support" | "sales" | "personal" | "newsletter" | "spam" | "greeting" | "unknown",
  "category": "refund" | "billing" | "technical_issue" | "complaint" | "feature_request" | "general",
  "sentiment_score": 0.0 to 1.0,
  "escalation_flag": boolean,
  "action": "reply" | "ignore" | "queue",
  "confidence": 0.0 to 1.0,
  "reason": "Brief explanation",
  "suggested_reply": "Reply text if action is reply, else null"
}`,
              },
              {
                role: "user",
                content: `From: ${email.from_name || email.from_address}\nSubject: ${email.subject}\n\n${email.body}`,
              },
            ],
            temperature: 0.3,
          }),
        });

        if (!aiRes.ok) {
          console.error("AI error for", email.id, await aiRes.text());
          continue;
        }

        const aiJson = await aiRes.json();
        const content = aiJson.choices?.[0]?.message?.content || "";
        const match = content.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(match ? match[0] : content);

        await supabase
          .from("email_queue")
          .update({
            suggested_reply: parsed.suggested_reply || null,
            confidence_score: parsed.confidence ?? null,
            flag_reason: parsed.reason || null,
            intent: parsed.intent === "greeting" ? "personal" : parsed.intent,
            status: "pending",
          })
          .eq("id", email.id)
          .eq("user_id", user.id);

        updated += 1;
        reprocessed += 1;
      } catch (err) {
        console.error("Reprocess failed for", email.id, err);
      }
    }

    return new Response(
      JSON.stringify({ reprocessed, updated, total_eligible: eligible.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("reprocess-queued-emails error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
