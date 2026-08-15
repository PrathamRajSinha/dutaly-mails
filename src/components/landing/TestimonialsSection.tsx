import { motion } from "framer-motion";
import { useState } from "react";

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
    <section id="use-cases" style={{ background: "#0A0A0F" }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="border-t pt-12"
          style={{ borderColor: "rgba(237,235,245,0.12)" }}
        >
          <div className="flex items-baseline justify-between gap-8 mb-12">
            <h2 className="text-[clamp(1.9rem,3.2vw,2.75rem)] leading-[1.08] max-w-[620px]" style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}>
              Built for teams that handle <span className="italic">customer emails daily.</span>
            </h2>
            <span className="text-[10px] uppercase tracking-[0.22em] whitespace-nowrap" style={{ color: "rgba(237,235,245,0.35)" }}>
              05 / Use cases
            </span>
          </div>

          <div className="flex flex-wrap gap-8 border-b pb-4 mb-14" style={{ borderColor: "rgba(237,235,245,0.12)" }}>
            {useCases.map((uc, i) => (
              <button
                key={uc.tab}
                onClick={() => setActive(i)}
                className="text-[11px] uppercase tracking-[0.2em] pb-1 transition-colors"
                style={{
                  color: active === i ? "#EDEBF5" : "rgba(237,235,245,0.35)",
                  borderBottom: active === i ? "1px solid #6E62C4" : "1px solid transparent",
                }}
              >
                {uc.tab}
              </button>
            ))}
          </div>

          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-12 gap-12"
          >
            <div className="md:col-span-5">
              <h3 className="text-[clamp(1.5rem,2.4vw,2.1rem)] leading-tight mb-5" style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}>
                {current.headline}
              </h3>
              <p className="text-[15px] leading-[1.85]" style={{ color: "rgba(237,235,245,0.55)" }}>{current.text}</p>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              {current.bullets.map((b, i) => (
                <div
                  key={b}
                  className="flex items-baseline gap-6 py-5 border-t"
                  style={{ borderColor: "rgba(237,235,245,0.12)" }}
                >
                  <span className="text-[11px] tracking-[0.16em]" style={{ color: "#6E62C4" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[15px]" style={{ color: "rgba(237,235,245,0.7)" }}>{b}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
