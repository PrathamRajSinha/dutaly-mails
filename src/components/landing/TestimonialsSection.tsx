import { motion } from "framer-motion";
import { useState } from "react";
import { Check } from "lucide-react";

const useCases = [
  {
    tab: "SaaS",
    headline: "Route, resolve, repeat.",
    text: "Route bug reports to engineering, handle billing questions automatically, and keep feature requests organized — all without lifting a finger. Answers are grounded in your docs and release notes.",
    bullets: ["Auto-categorize by intent", "Escalate bugs instantly", "Track feature requests"],
  },
  {
    tab: "D2C / E-commerce",
    headline: "Route, resolve, repeat.",
    text: "Handle order status, returns, and common product questions automatically, and escalate complex issues to support.",
    bullets: [
      "Auto-answer FAQs from your knowledge base",
      "Create tickets for disputed refunds or delivery issues",
      "Tag by order, product, and issue type",
    ],
  },
  {
    tab: "Agencies",
    headline: "Route, resolve, repeat.",
    text: "Manage client requests, status updates, and routine queries across multiple brands without chaos.",
    bullets: [
      "Separate inboxes per client or project",
      "Auto-reply to common status questions",
      "Escalate urgent or high-value client issues",
    ],
  },
];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const current = useCases[active];

  return (
    <section id="use-cases" className="relative py-28 sm:py-36" style={{ background: "#FBFAFF" }}>
      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-[720px] text-center"
        >
          <p className="eyebrow mb-5" style={{ color: "#9490B8" }}>Use cases</p>
          <h2
            className="text-[clamp(2rem,3.8vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.03em]"
            style={{ color: "#141227" }}
          >
            Built for teams that handle customer emails daily.
          </h2>
        </motion.div>

        {/* Tabs */}
        <div
          className="mx-auto mt-12 flex w-fit flex-wrap justify-center gap-1 rounded-full p-1"
          style={{ background: "#EFEDFA", border: "1px solid rgba(20,18,39,0.06)" }}
          role="tablist"
          aria-label="Use case categories"
        >
          {useCases.map((uc, i) => (
            <button
              key={uc.tab}
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className="font-display rounded-full px-6 py-2.5 text-[13px] font-semibold transition-all duration-300"
              style={
                active === i
                  ? { background: "#FFFFFF", color: "#4A3FB0", boxShadow: "0 4px 14px -6px rgba(20,18,39,0.25)" }
                  : { background: "transparent", color: "#6E6A8C" }
              }
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
          className="mx-auto mt-14 max-w-[1000px]"
        >
          <div
            className="grid items-start gap-10 rounded-3xl p-8 sm:p-12 md:grid-cols-[1fr_1fr] md:gap-14"
            style={{ background: "#FFFFFF", border: "1px solid rgba(20,18,39,0.07)", boxShadow: "0 24px 60px -34px rgba(20,18,39,0.18)" }}
          >
            <div>
              <h3
                className="text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold tracking-[-0.025em]"
                style={{ color: "#141227" }}
              >
                {current.headline}
              </h3>
              <p className="mt-4 text-[15.5px] leading-[1.85]" style={{ color: "#5C5878" }}>
                {current.text}
              </p>
            </div>
            <div className="space-y-3">
              {current.bullets.map((b, i) => (
                <motion.div
                  key={b}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="flex items-center gap-4 rounded-xl px-5 py-4"
                  style={{ background: "#FAF9FF", border: "1px solid rgba(124,111,224,0.14)" }}
                >
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white"
                    style={{ background: "#7C6FE0" }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[14.5px] font-medium" style={{ color: "#2C2947" }}>{b}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
