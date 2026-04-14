const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RAZORPAY_KEY_ID = Deno.env.get("VITE_RAZORPAY_KEY_ID") || Deno.env.get("RAZORPAY_KEY_ID") || "rzp_live_ScH5fy8kSUSwRs";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

const planIdMap: Record<string, string> = {
  starter: Deno.env.get("RAZORPAY_PLAN_STARTER") || "",
  growth: Deno.env.get("RAZORPAY_PLAN_GROWTH") || "",
  scale: Deno.env.get("RAZORPAY_PLAN_SCALE") || "",
};

async function razorpayFetch(endpoint: string, body: Record<string, unknown>) {
  const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
  const res = await fetch(`https://api.razorpay.com/v1${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { plan, billing_period, email, name, coupon_code } = await req.json();

    if (!plan || !billing_period || !email) {
      return new Response(
        JSON.stringify({ error: "plan, billing_period, and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const razorpayPlanId = planIdMap[plan];
    if (!razorpayPlanId) {
      return new Response(
        JSON.stringify({ error: `No Razorpay plan ID configured for "${plan}"` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize name: Razorpay is strict about allowed chars and minimum length
    const rawName = (name || email.split("@")[0] || "Customer").trim();
    const safeName = rawName
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[_+]+/g, " ")
      .replace(/[^a-zA-Z0-9\s.\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 50);
    const customerName = safeName.length >= 3 ? safeName : "Customer";

    // Create customer
    const customer = await razorpayFetch("/customers", {
      name: customerName,
      email,
    });

    if (customer.error) {
      console.error("Customer creation error:", customer.error);
      return new Response(
        JSON.stringify({ error: "Failed to create customer" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create subscription with 14-day trial
    const subPayload: Record<string, unknown> = {
      plan_id: razorpayPlanId,
      customer_id: customer.id,
      total_count: billing_period === "yearly" ? 12 : 120,
      quantity: 1,
      start_at: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60, // 14 days from now
    };

    if (coupon_code) {
      subPayload.notes = { coupon_code };
    }

    const subscription = await razorpayFetch("/subscriptions", subPayload);

    if (subscription.error) {
      console.error("Subscription creation error:", subscription.error);
      return new Response(
        JSON.stringify({ error: "Failed to create subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        subscription_id: subscription.id,
        customer_id: customer.id,
        razorpay_plan_id: razorpayPlanId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-razorpay-subscription error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
