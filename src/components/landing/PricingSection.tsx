import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For individuals exploring AI support.",
    features: ["100 tickets/month", "20 AI responses", "2 email accounts", "Basic SLA tracking"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "TBD",
    period: "/mo",
    description: "For teams scaling support operations.",
    features: ["500 tickets/month", "100 AI responses", "5 email accounts", "Advanced SLA & escalation", "Slack & webhook integrations"],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "Custom",
    period: "",
    description: "For teams with advanced requirements.",
    features: ["Unlimited tickets", "Unlimited AI responses", "Unlimited accounts", "Custom integrations", "Dedicated support"],
    cta: "Contact us",
    highlighted: false,
  },
];

export function PricingSection() {
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
          <p className="mt-4 text-[16px]" style={{ color: "rgba(255,255,255,0.45)" }}>No hidden fees. No surprises.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
          {plans.map((plan, i) => (
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
                <span className="text-[32px] font-bold tracking-tight" style={{ color: "#E8E4FF" }}>{plan.price}</span>
                <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.35)" }}>{plan.period}</span>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[13px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                    <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#7C6FE0" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/auth">
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
          ))}
        </div>

        <p className="text-center mt-10 text-[13px] max-w-[480px] mx-auto" style={{ color: "rgba(255,255,255,0.3)" }}>
          Designed for growing teams that want structure without enterprise pricing.
        </p>
      </div>
    </section>
  );
}
