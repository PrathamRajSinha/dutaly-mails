import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  { num: "01", title: "Email received", text: "A customer sends an email to your connected inbox." },
  { num: "02", title: "AI understands it", text: "Intent, sentiment, and category are detected automatically." },
  { num: "03", title: "Ticket created", text: "A structured ticket is created with priority and SLA timer." },
  { num: "04", title: "Reply generated", text: "A confident draft is generated from your knowledge base." },
  { num: "05", title: "Resolved or escalated", text: "High-confidence replies send automatically. The rest come to you." },
];

const fade = { duration: 0.5, ease: [0.25, 0.4, 0, 1] };

export function InteractiveDemoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="py-24 sm:py-32 border-t border-white/[0.04]" ref={ref}>
      <div className="max-w-[1080px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={fade}
          className="max-w-[560px] mb-16"
        >
          <p className="text-[13px] font-medium tracking-widest uppercase text-zinc-500 mb-3">How it works</p>
          <h2 className="text-3xl sm:text-[2.5rem] font-bold text-white tracking-[-0.02em] leading-tight">
            From email to resolution.
          </h2>
        </motion.div>

        <div className="space-y-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...fade, delay: i * 0.07 }}
              className="flex gap-6 items-start"
            >
              <span className="text-[13px] font-mono text-zinc-600 pt-0.5 w-6 flex-shrink-0">{s.num}</span>
              <div>
                <h3 className="text-[15px] font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-[14px] text-zinc-500 leading-relaxed">{s.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
