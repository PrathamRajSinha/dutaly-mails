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

    // Find tickets where SLA is breached: sla_due_at < now() and status is not resolved/closed
    const { data: breachedTickets, error } = await supabase
      .from("tickets")
      .select("id, user_id, subject, customer_email, priority, category, sentiment_score, sla_due_at")
      .not("status", "in", '("resolved","closed")')
      .not("sla_due_at", "is", null)
      .lt("sla_due_at", new Date().toISOString());

    if (error) {
      console.error("Error fetching breached tickets:", error);
      throw error;
    }

    if (!breachedTickets || breachedTickets.length === 0) {
      return new Response(
        JSON.stringify({ message: "No SLA breaches detected", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${breachedTickets.length} SLA breached tickets`);

    // Check which tickets already have an sla_breached event to avoid duplicates
    const ticketIds = breachedTickets.map((t) => t.id);
    const { data: existingEvents } = await supabase
      .from("integration_events")
      .select("payload_json")
      .eq("event_type", "ticket.sla_breached")
      .in("payload_json->>ticket_id", ticketIds);

    const alreadyEmitted = new Set(
      (existingEvents || []).map((e: any) => {
        const payload = typeof e.payload_json === "string" ? JSON.parse(e.payload_json) : e.payload_json;
        return payload.ticket_id;
      })
    );

    const newBreaches = breachedTickets.filter((t) => !alreadyEmitted.has(t.id));

    if (newBreaches.length === 0) {
      return new Response(
        JSON.stringify({ message: "All breaches already emitted", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Emit integration events for new breaches
    const events = newBreaches.map((ticket) => ({
      user_id: ticket.user_id,
      event_type: "ticket.sla_breached",
      payload_json: {
        ticket_id: ticket.id,
        subject: ticket.subject,
        customer_email: ticket.customer_email,
        priority: ticket.priority,
        category: ticket.category,
        sentiment_score: ticket.sentiment_score,
        sla_due_at: ticket.sla_due_at,
        breached_at: new Date().toISOString(),
      },
    }));

    const { error: insertError } = await supabase
      .from("integration_events")
      .insert(events);

    if (insertError) {
      console.error("Error inserting SLA breach events:", insertError);
      throw insertError;
    }

    // Also escalate priority on breached tickets
    for (const ticket of newBreaches) {
      if (ticket.priority !== "urgent") {
        await supabase
          .from("tickets")
          .update({ priority: "urgent", escalation_flag: true })
          .eq("id", ticket.id);
      }
    }

    return new Response(
      JSON.stringify({ message: `Emitted ${newBreaches.length} SLA breach events`, count: newBreaches.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("SLA check error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to check SLA breaches" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
