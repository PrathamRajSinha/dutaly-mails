import { motion } from "framer-motion";
import { useRef } from "react";

export function InteractiveDemoSection() {
  const steps = [
    { num: "01", title: "Email received", text: "A customer sends an email to your connected inbox." },
    { num: "02", title: "AI understands it", text: "Intent, sentiment, and category are detected automatically." },
    { num: "03", title: "Ticket created", text: "A structured ticket is created with priority and SLA timer." },
    { num: "04", title: "Reply generated", text: "A confident draft is generated from your knowledge base." },
    { num: "05", title: "Resolved or escalated", text: "High-confidence replies send automatically. The rest come to you." },
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="how-it-works" className="py-24 sm:py-32 border-t border-zinc-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-400 mb-4">How it works</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[500px]">
            From email to resolution.
          </h2>
        </motion.div>

        <div ref={containerRef} className="relative">
          {/* Mobile/tablet: stacked cards */}
          <div className="lg:hidden grid sm:grid-cols-2 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-xl border border-zinc-200 bg-white shadow-sm"
              >
                <span className="text-[48px] font-semibold text-zinc-200 leading-none block mb-3 tracking-tighter">{s.num}</span>
                <h3 className="text-[15px] font-medium text-zinc-900 mb-1.5">{s.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Desktop: stacked cards that fan out */}
          <div className="hidden lg:flex gap-5 items-start">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{
                  opacity: 0,
                  x: -60 * i,
                  scale: 0.92,
                  rotateZ: -2 + i * 0.5,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  rotateZ: 0,
                }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 1,
                  delay: i * 0.25,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="flex-1 p-6 rounded-xl border border-zinc-200 bg-white shadow-[0_2px_20px_-6px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] transition-shadow duration-300 relative"
                style={{ zIndex: i + 1 }}
              >
                <span className="text-[48px] font-semibold text-zinc-200 leading-none block mb-3 tracking-tighter">{s.num}</span>
                <h3 className="text-[15px] font-medium text-zinc-900 mb-1.5">{s.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{s.text}</p>
                {i < steps.length - 1 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 1.2 + i * 0.25 }}
                    className="absolute top-1/2 -right-3.5 -translate-y-1/2 text-zinc-300 text-lg"
                  >
                    →
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
