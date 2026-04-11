import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    monthly: 999,
    yearly: 799,
    description: "For solo founders getting started.",
    features: ["1 email account", "300 emails/month", "AI drafts (manual send)", "20 KB entries", "Basic dashboard"],
    cta: "Start 14-day trial",
    highlighted: false,
  },
  {
    name: "Growth",
    monthly: 2999,
    yearly: 2399,
    description: "For growing teams that need automation.",
    features: ["3 email accounts", "1,500 emails/month", "Auto-send enabled", "Unlimited KB entries", "Slack + webhooks", "SLA tracking"],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Scale",
    monthly: 7999,
    yearly: 6399,
    description: "For high-volume operations.",
    features: ["Unlimited email accounts", "10,000 emails/month", "Everything in Growth", "Per-account AI instructions", "Custom integrations", "Dedicated onboarding"],
    cta: "Start 14-day trial",
    highlighted: false,
  },
];

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" className="py-28 sm:py-36 relative" style={{ background: "#0A0A0F" }}>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Pricing</p>
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] leading-[1.1]" style={{ color: "#E8E4FF" }}>
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-[16px]" style={{ color: "rgba(255,255,255,0.45)" }}>14-day free trial on all plans. No hidden fees.</p>

          {/* Billing toggle */}
          <div className="flex justify-center mt-8">
            <div
              style={{
                display: "flex",
                borderRadius: 20,
                overflow: "hidden",
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
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
          {plans.map((plan, i) => {
            const price = billing === "monthly" ? plan.monthly : plan.yearly;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`p-8 rounded-2xl border transition-all duration-500 ${
                  plan.highlighted
                    ? "relative shadow-xl hover:shadow-2xl"
                    : "hover:shadow-lg"
                }`}
                style={{
                  background: plan.highlighted ? "rgba(124,111,224,0.08)" : "rgba(255,255,255,0.03)",
                  borderColor: plan.highlighted ? "rgba(124,111,224,0.4)" : "rgba(255,255,255,0.08)",
                }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-white text-[11px] font-semibold tracking-wide" style={{ background: "#7C6FE0" }}>
                      Most popular
                    </span>
                  </div>
                )}
                <h3 className="text-[16px] font-semibold" style={{ color: "#E8E4FF" }}>{plan.name}</h3>
                <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-[32px] font-bold tracking-tight" style={{ color: "#E8E4FF" }}>
                    ₹{price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.35)" }}>/mo</span>
                </div>
                {billing === "yearly" && (
                  <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>billed annually</p>
                )}
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-[13px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                      <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#7C6FE0" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link to="/signup">
                    <Button
                      className={`w-full text-[13px] h-10 font-medium transition-all duration-300 ${
                        plan.highlighted
                          ? "text-white shadow-lg hover:shadow-xl"
                          : "text-white/80 hover:text-white"
                      }`}
                      style={
                        plan.highlighted
                          ? { background: "#7C6FE0", borderRadius: "6px" }
                          : { background: "rgba(255,255,255,0.08)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)" }
                      }
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center mt-10 text-[13px] max-w-[480px] mx-auto" style={{ color: "rgba(255,255,255,0.3)" }}>
          All plans include a 14-day trial · Cancel anytime · No setup fees
        </p>
      </div>
    </section>
  );
}
