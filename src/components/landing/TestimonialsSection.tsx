import { motion } from "framer-motion";
import { useState } from "react";
import { Check } from "lucide-react";

const useCases = [
  {
    tab: "SaaS",
    headline: "Route, resolve, repeat.",
    text: "Route bug reports to engineering, handle billing questions automatically, and keep feature requests organized — all without lifting a finger.",
    bullets: ["Auto-categorize by intent", "Escalate bugs instantly", "Track feature requests"],
  },
  {
    tab: "D2C / E-commerce",
    headline: "Happy customers, less effort.",
    text: "Resolve refund requests, order inquiries, and shipping questions without overwhelming your support team. Customers get answers in minutes, not hours.",
    bullets: ["Instant order-status replies", "Refund flow automation", "Sentiment-based prioritization"],
  },
  {
    tab: "Agencies",
    headline: "Every client, every thread.",
    text: "Manage client communication across shared inboxes. Keep every thread structured, assigned, and visible to the right people.",
    bullets: ["Multi-inbox management", "Client-specific routing", "Full audit trail"],
  },
];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const current = useCases[active];

  return (
    <section id="use-cases" className="py-28 sm:py-36 relative" style={{ background: "#FFFFFF" }}>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-400 mb-4">Use cases</p>
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[650px] mx-auto">
            Built for teams that handle customer emails daily.
          </h2>
        </motion.div>

        <div className="flex justify-center gap-2 mb-14">
          {useCases.map((uc, i) => (
            <button
              key={uc.tab}
              onClick={() => setActive(i)}
              className={`px-6 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                active === i
                  ? "text-white shadow-lg"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
              }`}
              style={active === i ? { background: "#7C6FE0", borderRadius: "6px" } : { borderRadius: "6px" }}
            >
              {uc.tab}
            </button>
          ))}
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-[800px] mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-[clamp(1.5rem,2.5vw,2rem)] font-semibold text-zinc-900 tracking-[-0.02em] mb-4">
                {current.headline}
              </h3>
              <p className="text-[15px] text-zinc-500 leading-[1.8]">
                {current.text}
              </p>
            </div>
            <div className="space-y-3">
              {current.bullets.map((b, i) => (
                <motion.div
                  key={b}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="flex items-center gap-4 py-4 px-5 rounded-xl bg-white border border-zinc-200/80 shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full text-white flex items-center justify-center flex-shrink-0" style={{ background: "#7C6FE0" }}>
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[14px] font-medium text-zinc-700">{b}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
