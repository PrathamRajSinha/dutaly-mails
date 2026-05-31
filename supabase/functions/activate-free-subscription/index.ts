import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { plan, coupon_code } = await req.json();

    if (!plan) {
      return new Response(
        JSON.stringify({ error: "plan is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const subscriptionPayload = {
      user_id: user.id,
      plan,
      status: "active",
      coupon_used: coupon_code || null,
      amount_paid: 0,
    };

    // Select-then-insert/update (no unique constraint on user_id)
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { error: updErr } = await supabase
        .from("subscriptions")
        .update(subscriptionPayload)
        .eq("id", existing.id);
      if (updErr) console.error("Subscription update error:", updErr);
    } else {
      const { error: insErr } = await supabase
        .from("subscriptions")
        .insert(subscriptionPayload);
      if (insErr) console.error("Subscription insert error:", insErr);
    }

    // Also activate managed user_subscriptions row so ProtectedRoute lets the user in.
    // Try to match the selected plan in subscription_plans (handles aliases like growth/pro, scale/enterprise).
    const aliases: Record<string, string[]> = {
      starter: ["starter"],
      growth: ["growth", "pro"],
      scale: ["scale", "enterprise"],
    };
    const planNames = aliases[plan] || [plan];
    const { data: matchedPlans } = await supabase
      .from("subscription_plans")
      .select("id, name")
      .in("name", planNames);
    const matchedPlan = matchedPlans?.find((p) => p.name === plan) || matchedPlans?.[0] || null;

    const nowDate = new Date();
    const periodEnd = new Date(nowDate);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await supabase
      .from("user_subscriptions")
      .update({
        status: "active",
        plan_id: matchedPlan?.id || null,
        current_period_start: nowDate.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .eq("user_id", user.id);

    // Update profile
    await supabase
      .from("profiles")
      .update({ plan, onboarding_completed: true })
      .eq("id", user.id);


    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("activate-free-subscription error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
