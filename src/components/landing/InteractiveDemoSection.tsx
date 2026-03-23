import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Brain, LayoutList, Pen, CheckCircle } from "lucide-react";

const steps = [
  { icon: Mail, num: "01", title: "Email received", text: "A customer sends an email to your connected inbox." },
  { icon: Brain, num: "02", title: "AI understands it", text: "Intent, sentiment, and category are detected automatically." },
  { icon: LayoutList, num: "03", title: "Ticket created", text: "A structured ticket is created with priority and SLA timer." },
  { icon: Pen, num: "04", title: "Reply generated", text: "A confident draft is generated from your knowledge base." },
  { icon: CheckCircle, num: "05", title: "Resolved or escalated", text: "High-confidence replies send automatically. The rest come to you." },
];

const fade = { duration: 0.5, ease: [0.25, 0.4, 0, 1] as const };

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
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-widest uppercase text-zinc-500 mb-3">How it works</p>
          <h2 className="text-3xl sm:text-[2.5rem] font-bold text-white tracking-[-0.02em] leading-tight">
            From email to resolution —<br className="hidden sm:block" /> automatically.
          </h2>
        </motion.div>

        {/* Horizontal flow on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...fade, delay: i * 0.08 }}
                className="relative text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-white/[0.06] flex flex-col items-center justify-center mx-auto mb-4">
                  <span className="text-[9px] font-mono text-zinc-600 mb-0.5">{s.num}</span>
                  <Icon className="h-4 w-4 text-zinc-400" />
                </div>
                <h3 className="text-[14px] font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-[12px] text-zinc-500 leading-relaxed max-w-[180px] mx-auto">{s.text}</p>

                {/* Arrow between steps — desktop only */}
                {i < steps.length - 1 && (
                  <span className="hidden lg:block absolute top-7 -right-3 text-zinc-700 text-sm">→</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
