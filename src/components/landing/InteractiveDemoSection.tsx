import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Brain, LayoutList, Pen, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Mail,
    title: "Email received",
    description: "A customer sends an email to your connected inbox.",
  },
  {
    icon: Brain,
    title: "AI understands it",
    description: "Intent, sentiment, and category are detected automatically.",
  },
  {
    icon: LayoutList,
    title: "Ticket created",
    description: "A structured ticket is created with priority and SLA timer.",
  },
  {
    icon: Pen,
    title: "Reply generated",
    description: "A confident draft is generated from your knowledge base.",
  },
  {
    icon: CheckCircle,
    title: "Resolved or escalated",
    description: "High-confidence replies send automatically. The rest come to you.",
  },
];

export function InteractiveDemoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="relative py-28 sm:py-36" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/20 to-zinc-950" />

      <div className="relative max-w-[1100px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0, 1] }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-widest uppercase text-indigo-400/80 mb-4">How it works</p>
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-white tracking-[-0.02em] leading-tight">
            From email to resolution —<br className="hidden sm:block" /> automatically.
          </h2>
        </motion.div>

        {/* Horizontal flow on desktop, vertical on mobile */}
        <div className="relative">
          {/* Connecting line — desktop */}
          <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.4, 0, 1] }}
                  className="relative text-center lg:text-center"
                >
                  {/* Step number + icon */}
                  <div className="relative z-10 w-[88px] h-[88px] rounded-2xl bg-zinc-900 border border-white/[0.06] flex flex-col items-center justify-center mx-auto mb-5 hover:border-white/[0.12] transition-colors duration-300">
                    <span className="text-[10px] font-mono text-zinc-600 mb-1">0{i + 1}</span>
                    <Icon className="h-5 w-5 text-zinc-400" />
                  </div>

                  <h3 className="text-[14px] font-semibold text-white mb-1.5">{step.title}</h3>
                  <p className="text-[12px] text-zinc-500 leading-[1.6] max-w-[200px] mx-auto">{step.description}</p>

                  {/* Arrow between steps — desktop only */}
                  {i < steps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                      className="hidden lg:block absolute top-[44px] -right-3 text-zinc-700"
                    >
                      →
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
