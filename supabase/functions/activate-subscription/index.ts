import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Server-side subscription activation. Prevents privilege escalation by
// validating plan_id against subscription_plans and refusing to mark a
// subscription as 'active' for paid plans without a verified Razorpay payment.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { plan_id, billing_period } = body as {
      plan_id?: string;
      billing_period?: "monthly" | "yearly";
    };

    if (!plan_id) {
      return new Response(JSON.stringify({ error: "plan_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Validate plan exists
    const { data: plan, error: planError } = await admin
      .from("subscription_plans")
      .select("id, name, price_monthly, price_yearly")
      .eq("id", plan_id)
      .maybeSingle();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isFree =
      (Number(plan.price_monthly) || 0) === 0 &&
      (Number(plan.price_yearly) || 0) === 0;

    // Only free/starter plans can be self-activated. Paid plans must go
    // through verified Razorpay flow which writes via service role separately.
    if (!isFree) {
      return new Response(
        JSON.stringify({
          error: "Paid plans require verified payment",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + (billing_period === "yearly" ? 12 : 1));

    const { error: upsertError } = await admin
      .from("user_subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan_id: plan.id,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: end.toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("activate-subscription upsert error:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to activate" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("activate-subscription error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
