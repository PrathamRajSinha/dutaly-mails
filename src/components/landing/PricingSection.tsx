import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { MagneticButton } from "./LandingNavbar";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For individuals getting started",
    features: ["Limited emails/month", "1 email account", "Basic AI replies", "Community support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Pro",
    period: "",
    description: "For growing teams",
    features: ["More emails/month", "Multiple email accounts", "Knowledge base", "Custom instructions", "Email templates", "Priority support"],
    cta: "Coming Soon",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: ["Unlimited emails", "Unlimited accounts", "Custom integrations", "SLA guarantee", "Dedicated support", "SSO & SAML"],
    cta: "Contact Us",
    highlighted: false,
  },
];

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-indigo-400">Pricing</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">Simple, transparent pricing</h2>
          <p className="mt-4 text-zinc-400">Start free. Scale as you grow.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 sm:p-8 border ${
                plan.highlighted
                  ? "bg-gradient-to-b from-indigo-500/10 to-purple-500/5 border-indigo-500/30"
                  : "bg-zinc-900/50 border-white/5"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="text-sm text-zinc-400 mt-1">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-zinc-500">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/auth">
                  <MagneticButton>
                    <Button
                      className={`w-full rounded-xl ${
                        plan.highlighted
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                          : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </MagneticButton>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
