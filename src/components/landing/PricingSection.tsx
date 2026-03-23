import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { StarBorder } from "@/components/landing/StarBorder";

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

const fade = { duration: 0.5, ease: [0.25, 0.4, 0, 1] as const };

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" className="py-24 sm:py-32 border-t border-white/[0.04]" ref={ref}>
      <div className="max-w-[1080px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={fade}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-widest uppercase text-zinc-500 mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-[2.5rem] font-bold text-white tracking-[-0.02em]">
            Simple, transparent pricing.
          </h2>
          <p className="mt-3 text-zinc-500 text-[15px]">No hidden fees. No surprises.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
          {plans.map((plan, i) => {
            const card = (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...fade, delay: i * 0.06 }}
                className={`rounded-xl p-6 border ${
                  plan.highlighted
                    ? "bg-zinc-900/80 border-transparent"
                    : "bg-zinc-900/30 border-white/[0.06]"
                }`}
              >
                <h3 className="text-[15px] font-semibold text-white">{plan.name}</h3>
                <p className="text-[12px] text-zinc-500 mt-1">{plan.description}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{plan.price}</span>
                  <span className="text-[13px] text-zinc-600">{plan.period}</span>
                </div>
                <ul className="mt-5 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-zinc-400">
                      <Check className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link to="/auth">
                    <Button
                      className={`w-full text-[13px] h-9 font-medium rounded-lg ${
                        plan.highlighted
                          ? "bg-white text-zinc-900 hover:bg-zinc-200"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );

            if (plan.highlighted) {
              return (
                <StarBorder key={plan.name} color="rgba(99,102,241,0.6)" speed="8s" thickness={1} className="rounded-xl">
                  {card}
                </StarBorder>
              );
            }
            return card;
          })}
        </div>
      </div>
    </section>
  );
}
