import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";

const plans = {
  starter: {
    name: "Starter",
    monthly: 999,
    yearly: 799,
    description: "For solo founders getting started",
    features: [
      "1 email account",
      "300 emails/month",
      "AI drafts replies (manual send)",
      "20 knowledge base entries",
      "Basic dashboard",
    ],
  },
  growth: {
    name: "Growth",
    monthly: 2999,
    yearly: 2399,
    description: "For growing teams that need automation",
    featured: true,
    features: [
      "3 email accounts",
      "1,500 emails/month",
      "Auto-send enabled",
      "Unlimited knowledge base",
      "Slack + webhook integrations",
      "SLA tracking",
      "Priority support",
    ],
  },
  scale: {
    name: "Scale",
    monthly: 7999,
    yearly: 6399,
    description: "For high-volume operations",
    features: [
      "Unlimited email accounts",
      "10,000 emails/month",
      "Everything in Growth",
      "Per-account AI instructions",
      "Custom integrations",
      "Dedicated onboarding call",
    ],
  },
};

type PlanKey = keyof typeof plans;

export default function OnboardingPlan() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const handleSignIn = () => {
    localStorage.removeItem("dutaly_selected_plan");
    navigate("/login");
  };

  const handleSelect = (planKey: PlanKey) => {
    localStorage.setItem(
      "dutaly_selected_plan",
      JSON.stringify({ plan: planKey, billing_period: billing })
    );
    navigate("/onboarding/payment");
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center p-6"
      style={{ background: "#0A0A0F" }}
    >
      {/* Back to home */}
      <Link
        to="/mails"
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "rgba(255,255,255,0.55)",
          fontSize: 13,
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={14} />
        Back to home
      </Link>

      {/* Logo */}
      <Link to="/mails" style={{ color: "#7C6FE0", fontSize: 20, fontWeight: 500, marginTop: 32, textDecoration: "none" }}>
        dutaly
      </Link>

      {/* Step */}
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 12 }}>
        Step 1 of 2
      </p>

      {/* Heading */}
      <h2
        style={{
          color: "#F0EEF8",
          fontSize: 28,
          fontWeight: 500,
          marginTop: 32,
          textAlign: "center",
        }}
      >
        Choose your plan
      </h2>
      <p
        style={{
          color: "rgba(255,255,255,0.45)",
          fontSize: 14,
          marginTop: 8,
          textAlign: "center",
          maxWidth: 420,
        }}
      >
        Pick the plan that fits your team. Cancel anytime.
      </p>

      {/* Billing toggle */}
      <div
        style={{
          display: "flex",
          borderRadius: 20,
          overflow: "hidden",
          marginTop: 28,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <button
          onClick={() => setBilling("monthly")}
          style={{
            padding: "8px 20px",
            fontSize: 13,
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            borderRadius: 20,
            background: billing === "monthly" ? "#7C6FE0" : "transparent",
            color: billing === "monthly" ? "#FFFFFF" : "rgba(255,255,255,0.5)",
          }}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling("yearly")}
          style={{
            padding: "8px 20px",
            fontSize: 13,
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            borderRadius: 20,
            background: billing === "yearly" ? "#7C6FE0" : "transparent",
            color: billing === "yearly" ? "#FFFFFF" : "rgba(255,255,255,0.5)",
          }}
        >
          Yearly (save 20%)
        </button>
      </div>

      {/* Plan cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          maxWidth: 900,
          width: "100%",
          marginTop: 40,
        }}
      >
        {(Object.keys(plans) as PlanKey[]).map((key) => {
          const plan = plans[key];
          const price = billing === "monthly" ? plan.monthly : plan.yearly;
          const isFeatured = "featured" in plan && plan.featured;

          return (
            <div
              key={key}
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.04)",
                border: isFeatured
                  ? "2px solid #7C6FE0"
                  : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Badge */}
              {isFeatured && (
                <div
                  style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#7C6FE0",
                    color: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "4px 14px",
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                  }}
                >
                  Most popular
                </div>
              )}

              {/* Plan name */}
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}
              >
                {plan.name}
              </p>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                <span
                  style={{ color: "#F0EEF8", fontSize: 38, fontWeight: 500 }}
                >
                  ₹{price.toLocaleString("en-IN")}
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>
                  /mo
                </span>
              </div>
              {billing === "yearly" && (
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>
                  billed annually
                </p>
              )}

              {/* Description */}
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  marginTop: 8,
                  marginBottom: 20,
                }}
              >
                {plan.description}
              </p>

              {/* Features */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  flex: 1,
                }}
              >
                {plan.features.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Check size={14} style={{ color: "#7C6FE0", flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleSelect(key)}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  marginTop: 24,
                  ...(isFeatured
                    ? {
                        background: "#7C6FE0",
                        color: "#FFFFFF",
                        border: "none",
                      }
                    : {
                        background: "transparent",
                        color: "#A89EF0",
                        border: "1px solid rgba(124,111,224,0.5)",
                      }),
                }}
              >
                Choose {plan.name}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p
        style={{
          color: "rgba(255,255,255,0.25)",
          fontSize: 12,
          marginTop: 32,
          textAlign: "center",
        }}
      >
        Cancel anytime · No setup fees
      </p>
      <p
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: 13,
          marginTop: 12,
          marginBottom: 32,
        }}
      >
        Already have an account?{" "}
        <button
          type="button"
          onClick={handleSignIn}
          style={{ color: "#7C6FE0", textDecoration: "none" }}
        >
          Sign in →
        </button>
      </p>
    </div>
  );
}
