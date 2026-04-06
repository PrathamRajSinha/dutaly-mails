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
    <section id="pricing" className="py-28 sm:py-36 relative" style={{ background: "#F8F7FF" }}>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-400 mb-4">Pricing</p>
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1]">
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-[16px] text-zinc-500">No hidden fees. No surprises.</p>
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
                  ? "border-zinc-300 shadow-xl hover:shadow-2xl bg-white relative"
                  : "border-zinc-200/80 hover:border-zinc-300 hover:shadow-lg bg-white"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-white text-[11px] font-semibold tracking-wide" style={{ background: "#7C6FE0" }}>
                    Most popular
                  </span>
                </div>
              )}
              <h3 className="text-[16px] font-semibold text-zinc-900">{plan.name}</h3>
              <p className="text-[13px] text-zinc-500 mt-1">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-[32px] font-bold text-zinc-900 tracking-tight">{plan.price}</span>
                <span className="text-[14px] text-zinc-400">{plan.period}</span>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[13px] text-zinc-600">
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
                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                    }`}
                    style={plan.highlighted ? { background: "#7C6FE0", borderRadius: "6px" } : { borderRadius: "6px" }}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center mt-10 text-[13px] text-zinc-400 max-w-[480px] mx-auto">
          Designed for growing teams that want structure without enterprise pricing.
        </p>
      </div>
    </section>
  );
}
