import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch undelivered events (limit 50 per run)
    const { data: events, error: eventsError } = await supabase
      .from("integration_events")
      .select("*")
      .eq("delivered", false)
      .order("created_at", { ascending: true })
      .limit(50);

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw eventsError;
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending events", dispatched: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${events.length} integration events`);

    // Group events by user_id for efficient integration lookup
    const userIds = [...new Set(events.map((e: any) => e.user_id))];

    // Fetch all active integrations for these users
    const { data: integrations, error: intError } = await supabase
      .from("integrations")
      .select("*")
      .in("user_id", userIds)
      .eq("is_active", true);

    if (intError) {
      console.error("Error fetching integrations:", intError);
      throw intError;
    }

    if (!integrations || integrations.length === 0) {
      // No active integrations, mark all events as delivered (no target)
      const eventIds = events.map((e: any) => e.id);
      await supabase
        .from("integration_events")
        .update({ delivered: true })
        .in("id", eventIds);

      return new Response(
        JSON.stringify({ message: "No active integrations, events marked delivered", dispatched: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build user -> integrations map
    const userIntegrations: Record<string, any[]> = {};
    for (const integration of integrations) {
      if (!userIntegrations[integration.user_id]) {
        userIntegrations[integration.user_id] = [];
      }
      userIntegrations[integration.user_id].push(integration);
    }

    let dispatched = 0;
    let failed = 0;

    for (const event of events) {
      const userIntgs = userIntegrations[event.user_id] || [];
      let allSucceeded = true;

      for (const integration of userIntgs) {
        const config = typeof integration.config_json === "string"
          ? JSON.parse(integration.config_json)
          : integration.config_json || {};

        // Check event filter if configured
        if (config.events && Array.isArray(config.events) && !config.events.includes(event.event_type)) {
          continue; // Skip this integration for this event type
        }

        try {
          if (integration.provider === "webhook") {
            await dispatchWebhook(config, event);
          } else if (integration.provider === "slack") {
            await dispatchSlack(config, event);
          }
          // Other providers can be added here
        } catch (err) {
          console.error(`Failed to dispatch to ${integration.provider} (integration ${integration.id}):`, err);
          allSucceeded = false;
        }
      }

      if (allSucceeded) {
        await supabase
          .from("integration_events")
          .update({ delivered: true })
          .eq("id", event.id);
        dispatched++;
      } else {
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ message: `Dispatched ${dispatched} events, ${failed} failed`, dispatched, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Dispatch error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to dispatch events" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function dispatchWebhook(config: any, event: any) {
  const url = config.url;
  if (!url) {
    console.warn("Webhook integration missing URL");
    return;
  }

  const payload = {
    event: event.event_type,
    timestamp: event.created_at,
    data: typeof event.payload_json === "string"
      ? JSON.parse(event.payload_json)
      : event.payload_json,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Support optional secret for HMAC or simple auth header
  if (config.secret) {
    headers["X-Webhook-Secret"] = config.secret;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook POST to ${url} failed with status ${response.status}`);
  }

  console.log(`Webhook dispatched to ${url} for event ${event.event_type}`);
}

async function dispatchSlack(config: any, event: any) {
  const webhookUrl = config.webhook_url;
  if (!webhookUrl) {
    console.warn("Slack integration missing webhook_url");
    return;
  }

  const payload = typeof event.payload_json === "string"
    ? JSON.parse(event.payload_json)
    : event.payload_json;

  const eventLabels: Record<string, string> = {
    "ticket.created": "🎫 New Ticket Created",
    "ticket.updated": "🔄 Ticket Updated",
    "ticket.resolved": "✅ Ticket Resolved",
    "ticket.sla_breached": "🚨 SLA Breached",
    "ticket.angry_detected": "😡 Angry Customer Detected",
  };

  const priorityEmoji: Record<string, string> = {
    low: "🟢",
    medium: "🟡",
    high: "🟠",
    urgent: "🔴",
  };

  const title = eventLabels[event.event_type] || `📋 ${event.event_type}`;
  const pEmoji = priorityEmoji[payload.priority] || "⚪";

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: title, emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Subject:*\n${payload.subject || "N/A"}` },
        { type: "mrkdwn", text: `*Customer:*\n${payload.customer_email || "N/A"}` },
        { type: "mrkdwn", text: `*Priority:*\n${pEmoji} ${payload.priority || "N/A"}` },
        { type: "mrkdwn", text: `*Category:*\n${payload.category || "N/A"}` },
      ],
    },
  ];

  if (payload.sentiment_score !== undefined && payload.sentiment_score !== null) {
    const sentiment = parseFloat(payload.sentiment_score);
    const sentimentLabel = sentiment < 0.3 ? "😡 Negative" : sentiment < 0.6 ? "😐 Neutral" : "😊 Positive";
    blocks.push({
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Sentiment:*\n${sentimentLabel} (${sentiment.toFixed(2)})` },
      ],
    } as any);
  }

  if (event.event_type === "ticket.sla_breached" && payload.sla_due_at) {
    blocks.push({
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*SLA Due:*\n${new Date(payload.sla_due_at).toLocaleString()}` },
        { type: "mrkdwn", text: `*Breached At:*\n${new Date(payload.breached_at || Date.now()).toLocaleString()}` },
      ],
    } as any);
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed with status ${response.status}`);
  }

  console.log(`Slack message sent for event ${event.event_type}`);
}
