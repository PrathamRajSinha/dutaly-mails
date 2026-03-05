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
    description: "For individuals and small teams getting started.",
    features: ["100 tickets/month", "20 AI responses", "2 email accounts", "Basic SLA tracking", "Email templates"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "TBD",
    period: "/mo",
    description: "For teams scaling their support operations.",
    features: ["500 tickets/month", "100 AI responses", "5 email accounts", "Advanced SLA & escalation", "Slack & webhook integrations", "Priority support"],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "Custom",
    period: "",
    description: "For teams with advanced requirements.",
    features: ["Unlimited tickets", "Unlimited AI responses", "Unlimited accounts", "Custom integrations", "SLA guarantee", "Dedicated support"],
    cta: "Contact Us",
    highlighted: false,
  },
];

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-indigo-400 mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-lg text-zinc-500">No hidden fees. No surprises.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 border ${
                plan.highlighted
                  ? "bg-zinc-900 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                  : "bg-zinc-900/40 border-white/5"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-500 text-xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="text-sm text-zinc-500 mt-1">{plan.description}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-zinc-600">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                    <Check className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/auth">
                  <Button
                    className={`w-full rounded-full ${
                      plan.highlighted
                        ? "bg-white text-zinc-900 hover:bg-zinc-100 font-semibold"
                        : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
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
