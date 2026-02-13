import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { question, start_date, end_date } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch emails within date range
    let query = supabase
      .from("email_queue")
      .select("from_address, from_name, subject, body, suggested_reply, status, intent, queued_at, confidence_score")
      .eq("user_id", user.id)
      .order("queued_at", { ascending: true });

    if (start_date) {
      query = query.gte("queued_at", start_date);
    }
    if (end_date) {
      query = query.lte("queued_at", end_date);
    }

    const { data: emails, error: emailsError } = await query;

    if (emailsError) {
      console.error("Error fetching emails:", emailsError);
      throw new Error("Failed to fetch emails");
    }

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ answer: "No emails found in the selected date range." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format emails as context
    const emailContext = emails.map((e: any, i: number) => {
      let entry = `Email #${i + 1} [${e.queued_at}]\nFrom: ${e.from_name || e.from_address}\nSubject: ${e.subject}\nIntent: ${e.intent || "unknown"} | Status: ${e.status}\n\n${e.body}`;
      if (e.suggested_reply) {
        entry += `\n\nAI Reply: ${e.suggested_reply}`;
      }
      return entry;
    }).join("\n\n===\n\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an email analyst assistant. The user will ask questions about their emails. Answer based ONLY on the email data provided below. Be specific, cite email subjects/senders when relevant. If you can't find the answer in the emails, say so.

IMPORTANT: Respond in PLAIN TEXT only. Do NOT use any markdown formatting such as bold (**text**), italics, bullet points (* or -), headers (#), or code blocks. Use simple numbered lists or dashes if needed, but no markdown syntax.

EMAILS (${emails.length} total):
${emailContext}`,
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      throw new Error("Failed to get AI response");
    }

    const aiResult = await aiResponse.json();
    const answer = aiResult.choices?.[0]?.message?.content || "No response generated.";

    return new Response(
      JSON.stringify({ answer, email_count: emails.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in ask-about-emails:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
