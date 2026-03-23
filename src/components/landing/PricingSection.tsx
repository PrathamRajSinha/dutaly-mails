import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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
    <section id="pricing" className="py-24 sm:py-32 border-t border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-400 mb-4">Pricing</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-white leading-[1.1]">
            Simple, transparent pricing.
          </h2>
          <p className="mt-3 text-[15px] text-zinc-400">No hidden fees. No surprises.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-white/[0.06] rounded-lg overflow-hidden max-w-[960px]">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 ${plan.highlighted ? "bg-[#111113]" : "bg-[#0A0A0B]"}`}
            >
              <h3 className="text-[15px] font-medium text-white">{plan.name}</h3>
              <p className="text-[12px] text-zinc-400 mt-1">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-[28px] font-semibold text-white tracking-tight">{plan.price}</span>
                <span className="text-[13px] text-zinc-400">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[13px] text-zinc-300">
                    <Check className="h-3 w-3 text-zinc-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/auth">
                  <Button
                    className={`w-full text-[13px] h-9 font-medium rounded-md ${
                      plan.highlighted
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
