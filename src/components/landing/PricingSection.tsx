import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For individuals exploring AI support.",
    features: ["100 tickets/month", "20 AI responses", "2 email accounts", "Basic SLA tracking", "Email templates"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "TBD",
    period: "/mo",
    description: "For teams scaling support operations.",
    features: ["500 tickets/month", "100 AI responses", "5 email accounts", "Advanced SLA & escalation", "Slack & webhook integrations", "Priority support"],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "Custom",
    period: "",
    description: "For teams with advanced requirements.",
    features: ["Unlimited tickets", "Unlimited AI responses", "Unlimited accounts", "Custom integrations", "SLA guarantee", "Dedicated support"],
    cta: "Contact us",
    highlighted: false,
  },
];

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="relative py-28 sm:py-36" ref={ref}>
      <div className="max-w-[1100px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0, 1] }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-widest uppercase text-indigo-400/80 mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-white tracking-[-0.02em]">
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-base text-zinc-500">No hidden fees. No surprises.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-[900px] mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 0.4, 0, 1] }}
              className={`relative rounded-2xl p-7 border transition-all duration-300 ${
                plan.highlighted
                  ? "bg-zinc-900/80 border-indigo-500/20 shadow-lg shadow-indigo-500/[0.04]"
                  : "bg-zinc-900/40 border-white/[0.05] hover:border-white/[0.08]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-500 text-[11px] font-medium text-white">
                  Most Popular
                </div>
              )}
              <h3 className="text-[15px] font-semibold text-white">{plan.name}</h3>
              <p className="text-[12px] text-zinc-500 mt-1">{plan.description}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-[13px] text-zinc-600">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-zinc-400">
                    <Check className="h-3.5 w-3.5 text-indigo-400/70 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <Link to="/auth">
                  <Button
                    className={`w-full rounded-full text-[13px] h-10 font-medium transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-white text-zinc-900 hover:bg-zinc-200"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
