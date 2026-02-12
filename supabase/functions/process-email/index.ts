import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProcessEmailRequest {
  email_id?: string;
  from_address: string;
  from_name?: string;
  subject: string;
  body: string;
  email_account_id?: string;
}

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  extracted_text: string | null;
}

interface AIInstructions {
  system_prompt: string;
  tone: string;
  reply_length: string;
  signature: string;
  auto_reply_enabled: boolean;
  escalate_unknown: boolean;
  ignore_spam: boolean;
  ignore_promotions: boolean;
  auto_reply_confidence_threshold: number;
  greeting_response_enabled: boolean;
  greeting_template: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailData: ProcessEmailRequest = await req.json();
    console.log("Processing email:", emailData.subject);

    // Fetch user's knowledge base
    const { data: knowledgeEntries, error: kbError } = await supabase
      .from("knowledge_base_entries")
      .select("id, title, content, category, extracted_text")
      .eq("user_id", user.id);

    if (kbError) {
      console.error("Error fetching knowledge base:", kbError);
      throw new Error("Failed to fetch knowledge base");
    }

    // Fetch user's AI instructions
    const { data: instructions, error: instError } = await supabase
      .from("ai_instructions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (instError && instError.code !== "PGRST116") {
      console.error("Error fetching instructions:", instError);
      throw new Error("Failed to fetch instructions");
    }

    const aiInstructions: AIInstructions = instructions || {
      system_prompt: "You are a helpful email assistant.",
      tone: "professional",
      reply_length: "medium",
      signature: "Best regards",
      auto_reply_enabled: false,
      escalate_unknown: true,
      ignore_spam: true,
      ignore_promotions: true,
      auto_reply_confidence_threshold: 0.8,
      greeting_response_enabled: true,
      greeting_template: "Hello! Thank you for reaching out. How can I assist you today?",
    };

    // Build context from knowledge base
    const knowledgeContext = (knowledgeEntries || []).map((entry: KnowledgeEntry) => {
      const content = entry.extracted_text 
        ? `${entry.content}\n\nExtracted content:\n${entry.extracted_text}`
        : entry.content;
      return `[${entry.category.toUpperCase()}] ${entry.title}:\n${content}`;
    }).join("\n\n");

    // Classify the email and generate response using Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `${aiInstructions.system_prompt}

KNOWLEDGE BASE:
${knowledgeContext || "No knowledge entries available."}

INSTRUCTIONS:
- Tone: ${aiInstructions.tone}
- Reply length: ${aiInstructions.reply_length}
- Add this signature at the end: ${aiInstructions.signature}

GREETING DETECTION:
${aiInstructions.greeting_response_enabled ? `- If the email is a simple greeting (hi, hello, hey, good morning/afternoon/evening, etc.) from a REAL PERSON with no specific question:
  - Set intent to "greeting"
  - Set action to "reply"
  - Set confidence to 0.95
  - Use this greeting template as the reply: "${aiInstructions.greeting_template}"
  - You can personalize the greeting using the sender's name if available
  - This does NOT require knowledge base lookup
- IMPORTANT: Automated/transactional emails (order confirmations, delivery notifications, account alerts, newsletters, marketing, no-reply addresses) are NOT greetings even if they contain "Hello [Name]". These should be classified as "newsletter", "spam", or their actual intent and IGNORED.` : "- Greeting auto-response is disabled"}

AUTOMATED EMAIL DETECTION:
- Emails from no-reply, noreply, alerts@, notifications@, care@, support@ (from businesses), marketing@, boom@, info@ (bulk senders) are typically automated
- Order confirmations, delivery updates, account alerts, banking notifications, promotional offers are automated - IGNORE them
- Only classify as "greeting" if the email body is primarily a personal greeting from a real person (e.g., "hi how are you", "hello, just checking in")

RESPONSE FORMAT:
You must respond with a valid JSON object containing:
{
  "intent": "support" | "sales" | "personal" | "newsletter" | "spam" | "greeting" | "unknown",
  "action": "reply" | "ignore" | "queue",
  "confidence": 0.0 to 1.0,
  "reason": "Brief explanation of your decision",
  "suggested_reply": "The email reply if action is 'reply', otherwise null"
}

DECISION RULES:
- If the email is automated/transactional (order updates, banking alerts, promotions, newsletters), set action to "ignore" regardless of content
- If the email is a simple greeting FROM A REAL PERSON and greeting response is enabled, reply with the greeting template (high confidence)
- If the email is spam or promotional and ignore_spam is enabled, set action to "ignore"
- If you can confidently answer using the knowledge base, set action to "reply"
- If you're uncertain (confidence < 0.7) or the topic isn't in the knowledge base, set action to "queue"
- Never make up information not in the knowledge base`
          },
          {
            role: "user",
            content: `From: ${emailData.from_name || emailData.from_address}
Subject: ${emailData.subject}

${emailData.body}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      throw new Error("Failed to process email with AI");
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.choices[0]?.message?.content || "";
    
    // Parse AI response
    let parsedResponse;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      parsedResponse = JSON.parse(jsonMatch ? jsonMatch[0] : aiContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      parsedResponse = {
        intent: "unknown",
        action: "queue",
        confidence: 0.3,
        reason: "Failed to parse AI response",
        suggested_reply: null,
      };
    }

    console.log("AI decision:", parsedResponse);

    // Determine status for the queue entry
    const shouldAutoSend = aiInstructions.auto_reply_enabled && 
      parsedResponse.action === "reply" &&
      parsedResponse.confidence >= aiInstructions.auto_reply_confidence_threshold;

    let queueStatus: string;
    if (parsedResponse.action === "ignore") {
      queueStatus = "ignored";
    } else if (shouldAutoSend) {
      // Will be updated to "sent" after actual send in fetch-gmail-emails
      queueStatus = "sending";
    } else if (parsedResponse.action === "reply") {
      // Has a draft reply but not auto-sending
      queueStatus = "pending";
    } else {
      // Queued for review
      queueStatus = "pending";
    }

    // Always insert into email_queue for tracking
    const { error: queueError } = await supabase
      .from("email_queue")
      .insert({
        user_id: user.id,
        email_account_id: emailData.email_account_id || null,
        external_email_id: emailData.email_id,
        from_address: emailData.from_address,
        from_name: emailData.from_name,
        subject: emailData.subject,
        body: emailData.body,
        suggested_reply: parsedResponse.suggested_reply,
        confidence_score: parsedResponse.confidence,
        flag_reason: parsedResponse.reason,
        intent: parsedResponse.intent === "greeting" ? "personal" : parsedResponse.intent,
        status: queueStatus,
      });

    if (queueError) {
      console.error("Error adding to queue:", queueError);
      throw new Error("Failed to add email to queue");
    }

    // Log the action
    const logAction = parsedResponse.action === "ignore" ? "ignored" 
      : shouldAutoSend ? "auto_replied" 
      : parsedResponse.action === "reply" ? "drafted"
      : "queued";

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: logAction,
      email_subject: emailData.subject,
      email_from: emailData.from_address,
      details: { 
        reason: parsedResponse.reason, 
        confidence: parsedResponse.confidence,
        intent: parsedResponse.intent,
        auto_send: shouldAutoSend,
      },
    });

    return new Response(
      JSON.stringify({
        action: parsedResponse.action,
        suggested_reply: parsedResponse.suggested_reply,
        confidence: parsedResponse.confidence,
        auto_send: shouldAutoSend,
        intent: parsedResponse.intent,
        reason: parsedResponse.reason,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error processing email:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});