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
  thread_id?: string;
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
  do_rules: string[];
  do_not_rules: string[];
  sla_first_response_hours: number;
  sla_resolution_hours: number;
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

    // Check usage limit
    const { data: canProcess } = await supabase.rpc("check_usage_limit", {
      p_user_id: user.id,
      p_resource_type: "emails",
    });

    if (!canProcess) {
      return new Response(
        JSON.stringify({ error: "Email processing limit reached. Please upgrade your plan." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
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
      do_rules: [],
      do_not_rules: [],
      sla_first_response_hours: 4,
      sla_resolution_hours: 24,
    };

    // Fetch thread history if thread_id is provided
    let threadContext = "";
    if (emailData.thread_id) {
      const { data: threadEmails } = await supabase
        .from("email_queue")
        .select("from_address, from_name, subject, body, suggested_reply, queued_at, status")
        .eq("user_id", user.id)
        .eq("thread_id", emailData.thread_id)
        .order("queued_at", { ascending: true });

      if (threadEmails && threadEmails.length > 0) {
        threadContext = "\n\nCONVERSATION HISTORY (previous emails in this thread):\n" +
          threadEmails.map((e: any) => {
            let entry = `[${e.queued_at}] From: ${e.from_name || e.from_address}\nSubject: ${e.subject}\n${e.body}`;
            if (e.suggested_reply && (e.status === "sent" || e.status === "approved" || e.status === "edited")) {
              entry += `\n\nOur Reply:\n${e.suggested_reply}`;
            }
            return entry;
          }).join("\n---\n");
      }
    }

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
${threadContext}

INSTRUCTIONS:
- Tone: ${aiInstructions.tone}
- Reply length: ${aiInstructions.reply_length}
- Add this signature at the end: ${aiInstructions.signature}
${(aiInstructions.do_rules && aiInstructions.do_rules.length > 0) ? `
DO (you MUST follow these rules):
${aiInstructions.do_rules.map((r: string) => `- ${r}`).join("\n")}` : ""}
${(aiInstructions.do_not_rules && aiInstructions.do_not_rules.length > 0) ? `
DO NOT (you must NEVER do these):
${aiInstructions.do_not_rules.map((r: string) => `- ${r}`).join("\n")}` : ""}
- NEVER use markdown formatting (no **, no ##, no bullet points with -). Write replies as plain, natural email text. Use line breaks for paragraphs.
- NEVER invent, guess, or fabricate information. If the knowledge base does NOT contain specific details (like pricing, dates, features), DO NOT make them up. Instead, set action to "queue" so a human can respond.
- ONLY reply with information that is EXPLICITLY stated in the knowledge base above. If the knowledge base only has a link or brief mention without details, say you'll forward the inquiry — do NOT fabricate details.
- When answering questions, include SPECIFIC DETAILS from the knowledge base. Do NOT just reference that information exists — actually extract and present the relevant facts.
- If the knowledge base entry only contains a URL or vague reference without actual details, set action to "queue" — do NOT guess what might be on that URL.

GREETING DETECTION:
${aiInstructions.greeting_response_enabled ? `- If the email is a simple greeting (hi, hello, hey, good morning/afternoon/evening, etc.) from a REAL PERSON with no specific question:
  - Set intent to "greeting"
  - Set action to "reply"
  - Set confidence to 0.95
  - Use this greeting template as the reply: "${aiInstructions.greeting_template}"
  - You can personalize the greeting using the sender's name if available
  - This does NOT require knowledge base lookup
- IMPORTANT: Automated/transactional emails (order confirmations, delivery updates, account alerts, newsletters, marketing, no-reply addresses) are NOT greetings even if they contain "Hello [Name]". These should be classified as "newsletter", "spam", or their actual intent and IGNORED.` : "- Greeting auto-response is disabled"}

AUTOMATED EMAIL DETECTION:
- Emails from no-reply, noreply, alerts@, notifications@, care@, support@ (from businesses), marketing@, boom@, info@ (bulk senders) are typically automated
- Order confirmations, delivery updates, account alerts, banking notifications, promotional offers are automated - IGNORE them
- Only classify as "greeting" if the email body is primarily a personal greeting from a real person (e.g., "hi how are you", "hello, just checking in")

RESPONSE FORMAT:
You must respond with a valid JSON object containing:
{
  "intent": "support" | "sales" | "personal" | "newsletter" | "spam" | "greeting" | "unknown",
  "category": "refund" | "billing" | "technical_issue" | "complaint" | "feature_request" | "general",
  "sentiment_score": 0.0 to 1.0 (0 = very negative/angry, 0.5 = neutral, 1.0 = very positive),
  "escalation_flag": true if the customer sounds angry, threatening, or the issue is risky — false otherwise,
  "action": "reply" | "ignore" | "queue",
  "confidence": 0.0 to 1.0,
  "reason": "Brief explanation of your decision",
  "suggested_reply": "The email reply if action is 'reply', otherwise null"
}

DECISION RULES:
- If the email is automated/transactional (order updates, banking alerts, promotions, newsletters), set action to "ignore" regardless of content
- If the email is a simple greeting FROM A REAL PERSON and greeting response is enabled, reply with the greeting template (high confidence)
- If the email is spam or promotional and ignore_spam is enabled, set action to "ignore"
- If you can confidently answer using EXPLICIT information in the knowledge base, set action to "reply" — include only facts directly from the knowledge base, written in plain text (no markdown)
- If the knowledge base only has a vague mention, a link, or no relevant info, set action to "queue" — do NOT guess or fabricate an answer
- Never make up information not in the knowledge base. When in doubt, queue it.`
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
        category: "general",
        sentiment_score: 0.5,
        escalation_flag: false,
        action: "queue",
        confidence: 0.3,
        reason: "Failed to parse AI response",
        suggested_reply: null,
      };
    }

    // Ensure new fields have defaults if AI didn't return them
    const category = parsedResponse.category || "general";
    const sentimentScore = typeof parsedResponse.sentiment_score === "number" ? parsedResponse.sentiment_score : 0.5;
    const escalationFlag = parsedResponse.escalation_flag === true;

    console.log("AI decision:", parsedResponse);

    // Check for per-category threshold override
    let effectiveThreshold = aiInstructions.auto_reply_confidence_threshold;
    if (category) {
      const { data: catThreshold } = await supabase
        .from("category_thresholds")
        .select("confidence_threshold")
        .eq("user_id", user.id)
        .eq("category", category)
        .maybeSingle();
      if (catThreshold) {
        effectiveThreshold = catThreshold.confidence_threshold;
        console.log(`Using category threshold for "${category}": ${effectiveThreshold}`);
      }
    }

    // Determine status for the queue entry
    const shouldAutoSend = aiInstructions.auto_reply_enabled && 
      parsedResponse.action === "reply" &&
      parsedResponse.confidence >= effectiveThreshold;

    let queueStatus: string;
    if (parsedResponse.action === "ignore") {
      queueStatus = "ignored";
    } else if (shouldAutoSend) {
      queueStatus = "sending";
    } else if (parsedResponse.action === "reply") {
      queueStatus = "pending";
    } else {
      queueStatus = "pending";
    }

    // Always insert into email_queue for tracking
    const { data: insertedEmail, error: queueError } = await supabase
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
        thread_id: emailData.thread_id || null,
      })
      .select("id")
      .single();

    if (queueError) {
      console.error("Error adding to queue:", queueError);
      throw new Error("Failed to add email to queue");
    }

    // --- AUTO-SEND LOGIC ---
    if (shouldAutoSend && emailData.email_account_id && parsedResponse.suggested_reply) {
      try {
        console.log("Auto-sending reply via provider...");

        // Get the email account to determine provider
        const { data: emailAccount } = await supabase
          .from("email_accounts")
          .select("provider")
          .eq("id", emailData.email_account_id)
          .single();

        if (emailAccount) {
          const sendFunctionName = emailAccount.provider === "gmail" 
            ? "send-gmail-reply" 
            : "send-imap-reply";

          const sendPayload: Record<string, unknown> = {
            email_account_id: emailData.email_account_id,
            to_address: emailData.from_address,
            subject: emailData.subject,
            body: parsedResponse.suggested_reply,
          };

          if (emailData.thread_id) {
            sendPayload.thread_id = emailData.thread_id;
          }
          if (emailData.email_id) {
            sendPayload.message_id = emailData.email_id;
          }

          const sendResponse = await fetch(
            `${supabaseUrl}/functions/v1/${sendFunctionName}`,
            {
              method: "POST",
              headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(sendPayload),
            }
          );

          if (sendResponse.ok) {
            console.log("Auto-reply sent successfully");
            await supabase
              .from("email_queue")
              .update({ status: "sent", reviewed_at: new Date().toISOString() })
              .eq("id", insertedEmail.id);
          } else {
            const errText = await sendResponse.text();
            console.error("Auto-reply send failed:", errText);
            // Revert to pending so user can manually review/send
            await supabase
              .from("email_queue")
              .update({ status: "pending" })
              .eq("id", insertedEmail.id);
          }
        }
      } catch (sendErr) {
        console.error("Auto-send error (non-fatal):", sendErr);
        // Revert to pending on failure
        await supabase
          .from("email_queue")
          .update({ status: "pending" })
          .eq("id", insertedEmail.id);
      }
    }

    // --- TICKET LOGIC ---
    let ticketId: string | null = null;
    let ticketEvent = "ticket.updated";

    try {
      if (emailData.thread_id) {
        // Check if a ticket already exists for this thread
        const { data: existingTicket } = await supabase
          .from("tickets")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("thread_id", emailData.thread_id)
          .single();

        if (existingTicket) {
          ticketId = existingTicket.id;
          // Re-open if it was resolved/closed
          const updateData: any = { last_customer_reply_at: new Date().toISOString() };
          if (existingTicket.status === "resolved" || existingTicket.status === "closed") {
            updateData.status = "open";
          }
          if (escalationFlag) {
            updateData.priority = "urgent";
            updateData.escalation_flag = true;
          }
          await supabase.from("tickets").update(updateData).eq("id", ticketId);
          ticketEvent = "ticket.updated";
        }
      }

      // No existing ticket found — create one (only for actionable emails, not ignored/spam)
      if (!ticketId && parsedResponse.action !== "ignore") {
        // Calculate SLA due date
        const slaHours = aiInstructions.sla_resolution_hours || 24;
        const slaDueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

        const { data: newTicket, error: ticketError } = await supabase
          .from("tickets")
          .insert({
            user_id: user.id,
            subject: emailData.subject,
            customer_email: emailData.from_address,
            status: "open",
            priority: escalationFlag ? "urgent" : "medium",
            category,
            sentiment_score: sentimentScore,
            escalation_flag: escalationFlag,
            thread_id: emailData.thread_id || null,
            last_customer_reply_at: new Date().toISOString(),
            sla_due_at: slaDueAt,
          })
          .select("id")
          .single();

        if (ticketError) {
          console.error("Error creating ticket:", ticketError);
        } else if (newTicket) {
          ticketId = newTicket.id;
          ticketEvent = "ticket.created";
        }
      }

      // Link email_queue row to ticket
      if (ticketId && insertedEmail) {
        await supabase
          .from("email_queue")
          .update({ ticket_id: ticketId })
          .eq("id", insertedEmail.id);
      }

      // Emit integration events
      if (ticketId) {
        const eventPayload = {
          ticket_id: ticketId,
          subject: emailData.subject,
          customer_email: emailData.from_address,
          priority: escalationFlag ? "urgent" : "medium",
          category,
          sentiment_score: sentimentScore,
        };

        await supabase.from("integration_events").insert({
          user_id: user.id,
          event_type: ticketEvent,
          payload_json: eventPayload,
        });

        if (escalationFlag) {
          await supabase.from("integration_events").insert({
            user_id: user.id,
            event_type: "ticket.angry_detected",
            payload_json: eventPayload,
          });
        }
      }
    } catch (ticketErr) {
      // Ticket logic should not break email processing
      console.error("Ticket logic error (non-fatal):", ticketErr);
    }

    // Increment usage counter
    await supabase.rpc("increment_usage", {
      p_user_id: user.id,
      p_resource_type: "emails",
    });

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
        ticket_id: ticketId,
        category,
        sentiment_score: sentimentScore,
        escalation_flag: escalationFlag,
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
        ticket_id: ticketId,
        category,
        sentiment_score: sentimentScore,
        escalation_flag: escalationFlag,
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
