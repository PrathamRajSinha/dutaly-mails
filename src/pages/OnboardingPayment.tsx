import logoAsset from "@/assets/dutaly-mails-logo.png.asset.json";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Tag, Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_ScH5fy8kSUSwRs";

const planDetails: Record<string, { name: string; monthly: number; yearly: number }> = {
  starter: { name: "Starter", monthly: 999, yearly: 799 },
  growth: { name: "Growth", monthly: 2999, yearly: 2399 },
  scale: { name: "Scale", monthly: 7999, yearly: 6399 },
};

const planAliases: Record<string, string[]> = {
  starter: ["starter"],
  growth: ["growth", "pro"],
  scale: ["scale", "enterprise"],
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function OnboardingPayment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const stored = JSON.parse(localStorage.getItem("dutaly_selected_plan") || "{}");
  const planKey = stored.plan || "starter";
  const billingPeriod: "monthly" | "yearly" = stored.billing_period || "monthly";
  const plan = planDetails[planKey] || planDetails.starter;
  const basePrice = billingPeriod === "monthly" ? plan.monthly : plan.yearly;

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState<{
    discount_type: string;
    discount_value: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(typeof window !== "undefined" && typeof window.Razorpay !== "undefined");

  const discount = couponApplied
    ? couponApplied.discount_type === "percent"
      ? Math.round(basePrice * (couponApplied.discount_value / 100))
      : couponApplied.discount_value
    : 0;
  const finalPrice = Math.max(0, basePrice - discount);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleLoad = () => setRazorpayReady(true);
    const handleError = () => {
      setRazorpayReady(false);
      setCouponError("Unable to load Razorpay checkout. Please refresh and try again.");
    };

    if (window.Razorpay) {
      setRazorpayReady(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]') as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);

      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, []);

  const syncUserSubscription = useCallback(async () => {
    if (!user) return;

    const aliases = planAliases[planKey] || [planKey];

    const { data: matchingPlans, error: planError } = await supabase
      .from("subscription_plans")
      .select("id, name")
      .in("name", aliases);

    if (planError) throw planError;

    const matchedPlan = matchingPlans?.find((row) => row.name === planKey) || matchingPlans?.[0] || null;

    if (!matchedPlan) {
      // No matching free plan — leave subscription as-is; paid activation flows
      // through the verified Razorpay handler with service-role privileges.
      return;
    }

    const { data, error: subscriptionError } = await supabase.functions.invoke(
      "activate-subscription",
      {
        body: {
          plan_id: matchedPlan.id,
          billing_period: billingPeriod === "yearly" ? "yearly" : "monthly",
        },
      }
    );

    if (subscriptionError) throw subscriptionError;
    if (data?.error) throw new Error(data.error);

    await queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
  }, [planKey, billingPeriod, queryClient, user]);


  const completeOnboarding = async () => {
    if (!user) return;
    try {
      await syncUserSubscription();
      await supabase.from("profiles").update({ 
        onboarding_completed: true,
        plan: planKey 
      }).eq("id", user.id);
      await queryClient.invalidateQueries({ queryKey: ["profile-onboarding"] });
      localStorage.removeItem("dutaly_selected_plan");
      navigate("/dashboard", { replace: true });
    } catch (e) {
      console.error("Failed to complete onboarding:", e);
      navigate("/dashboard", { replace: true });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponApplied(null);

    try {
      const { data, error } = await supabase.functions.invoke("validate-coupon", {
        body: { code: couponCode.trim() },
      });
      if (error) throw error;
      if (data.valid) {
        setCouponApplied({
          discount_type: data.discount_type,
          discount_value: data.discount_value,
        });
      } else {
        setCouponError(data.error || "Invalid coupon");
      }
    } catch (e: any) {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError("");
  };

  const handlePay = useCallback(async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setPayLoading(true);

    try {
      // 100% discount → free activation
      if (finalPrice === 0) {
        const { error } = await supabase.functions.invoke("activate-free-subscription", {
          body: { plan: planKey, coupon_code: couponCode.trim() || null },
        });
        if (error) throw error;
        await completeOnboarding();
        return;
      }

      if (!window.Razorpay) {
        throw new Error("Payment checkout is still loading. Please try again in a moment.");
      }

      // Create Razorpay subscription
      const { data, error } = await supabase.functions.invoke("create-razorpay-subscription", {
        body: {
          plan: planKey,
          billing_period: billingPeriod,
          email: user.email,
          name: user.user_metadata?.full_name || "",
          coupon_code: couponCode.trim() || null,
        },
      });

      if (error || !data?.subscription_id) {
        throw new Error(data?.error || "Failed to create subscription");
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        subscription_id: data.subscription_id,
        name: "dutaly",
        description: `${plan.name} Plan - ${billingPeriod}`,
        prefill: {
          email: user.email,
          name: user.user_metadata?.full_name || "",
        },
        theme: { color: "#7C6FE0" },
        handler: async (response: any) => {
          try {
            const subscriptionPayload = {
              user_id: user.id,
              plan: planKey,
              status: "active",
              razorpay_subscription_id: data.subscription_id,
              razorpay_customer_id: data.customer_id,
              razorpay_payment_id: response.razorpay_payment_id,
              coupon_used: couponCode.trim() || null,
              amount_paid: finalPrice,
            };

            const { data: existingSubscription } = await supabase
              .from("subscriptions")
              .select("id")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (existingSubscription?.id) {
              await supabase
                .from("subscriptions")
                .update(subscriptionPayload)
                .eq("id", existingSubscription.id);
            } else {
              await supabase.from("subscriptions").insert(subscriptionPayload);
            }
          } catch (e) {
            console.error("Post-payment DB update error:", e);
          }

          await completeOnboarding();
        },
        modal: {
          ondismiss: () => setPayLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error("Payment error:", e);
      setCouponError(e.message || "Payment failed");
      setPayLoading(false);
    }
  }, [user, finalPrice, planKey, billingPeriod, couponCode, navigate, plan.name]);

  return (
    <div className="flex min-h-screen flex-col items-center p-6" style={{ background: "#0A0A0F" }}>
      <img src={logoAsset.url} alt="Dutaly Mails" style={{ height: 26, width: "auto", marginTop: 32 }} />
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 12 }}>Step 2 of 2</p>

      <h2 style={{ color: "#F0EEF8", fontSize: 28, fontWeight: 500, marginTop: 32, textAlign: "center" }}>
        Complete your setup
      </h2>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginTop: 8, textAlign: "center", maxWidth: 420 }}>
        You'll be charged the plan price today. Cancel anytime.
      </p>

      <div
        style={{
          marginTop: 40,
          width: "100%",
          maxWidth: 440,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "32px 28px",
        }}
      >
        <h3 style={{ color: "#F0EEF8", fontSize: 16, fontWeight: 500, marginBottom: 20 }}>
          Order Summary
        </h3>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
            {plan.name} - {billingPeriod}
          </span>
          <span style={{ color: "#F0EEF8", fontSize: 14 }}>₹{basePrice.toLocaleString("en-IN")}/mo</span>
        </div>

        {couponApplied && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "#4ADE80", fontSize: 14 }}>
              Coupon ({couponApplied.discount_type === "percent" ? `${couponApplied.discount_value}%` : `₹${couponApplied.discount_value}`})
            </span>
            <span style={{ color: "#4ADE80", fontSize: 14 }}>−₹{discount.toLocaleString("en-IN")}</span>
          </div>
        )}

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            marginTop: 12,
            paddingTop: 12,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "#F0EEF8", fontSize: 16, fontWeight: 500 }}>Total due today</span>
          <span style={{ color: "#F0EEF8", fontSize: 16, fontWeight: 500 }}>
            {finalPrice === 0 ? "FREE" : `₹${finalPrice.toLocaleString("en-IN")}/mo`}
          </span>
        </div>

        {/* Coupon input */}
        <div style={{ marginTop: 24 }}>
          <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, display: "block", marginBottom: 8 }}>
            Have a coupon?
          </label>
          {couponApplied ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: "rgba(74,222,128,0.1)",
                borderRadius: 8,
                border: "1px solid rgba(74,222,128,0.3)",
              }}
            >
              <Tag size={14} style={{ color: "#4ADE80" }} />
              <span style={{ color: "#4ADE80", fontSize: 13, flex: 1 }}>{couponCode.toUpperCase()} applied</span>
              <button
                onClick={handleRemoveCoupon}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Enter code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#F0EEF8",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(124,111,224,0.5)",
                  background: "transparent",
                  color: "#A89EF0",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  opacity: couponLoading || !couponCode.trim() ? 0.5 : 1,
                }}
              >
                {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
              </button>
            </div>
          )}
          {couponError && (
            <p style={{ color: "#F87171", fontSize: 12, marginTop: 6 }}>{couponError}</p>
          )}
        </div>

        <button
          onClick={handlePay}
          disabled={payLoading}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 10,
            border: "none",
            background: "#7C6FE0",
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: 500,
            cursor: payLoading ? "not-allowed" : "pointer",
            marginTop: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: payLoading ? 0.7 : 1,
          }}
        >
          {payLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : finalPrice === 0 ? (
            "Activate Free Access"
          ) : (
            `Pay ₹${finalPrice.toLocaleString("en-IN")}/mo`
          )}
        </button>

        {!razorpayReady && finalPrice > 0 && (
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 10, textAlign: "center" }}>
            Loading secure checkout…
          </p>
        )}

        {finalPrice > 0 && (
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.5, marginTop: 10, textAlign: "center" }}>
            Razorpay may ask for a mobile number to set up recurring auto-pay for your subscription.
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16 }}>
          <Shield size={12} style={{ color: "rgba(255,255,255,0.25)" }} />
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>
            Secured by Razorpay · 256-bit SSL encryption
          </span>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 16, alignItems: "center" }}>
        <Link
          to="/onboarding/plan"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
        >
          <ArrowLeft size={14} /> Change plan
        </Link>
      </div>

      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 20, marginBottom: 32, textAlign: "center" }}>
        Cancel anytime · No setup fees
      </p>
    </div>
  );
}
