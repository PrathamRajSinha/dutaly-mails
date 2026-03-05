import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Brain, Pen, Send, BarChart } from "lucide-react";

const steps = [
  {
    icon: Mail,
    number: "01",
    title: "Email arrives",
    description: "Customer sends an email to your connected inbox. dyuticAI picks it up instantly.",
  },
  {
    icon: Brain,
    number: "02",
    title: "AI classifies it",
    description: "Intent, sentiment, and priority are detected automatically. A ticket is created.",
  },
  {
    icon: Pen,
    number: "03",
    title: "Reply is drafted",
    description: "Using your knowledge base and rules, an accurate reply is generated with a confidence score.",
  },
  {
    icon: Send,
    number: "04",
    title: "Review & send",
    description: "Approve as-is, edit, or let high-confidence replies send automatically.",
  },
  {
    icon: BarChart,
    number: "05",
    title: "Track & resolve",
    description: "SLA timers track every ticket. Escalation alerts fire before deadlines are missed.",
  },
];

export function InteractiveDemoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="demo" className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-indigo-400 mb-4">How it works</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            From email to resolution<br className="hidden sm:block" /> in five steps.
          </h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-zinc-800" />

          <div className="space-y-12">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative flex gap-6 sm:gap-8"
                >
                  {/* Step dot */}
                  <div className="relative z-10 flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
                  </div>
                  <div className="pt-1 sm:pt-3">
                    <span className="text-xs font-mono text-zinc-600 uppercase tracking-wider">{step.number}</span>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mt-1">{step.title}</h3>
                    <p className="text-[15px] text-zinc-500 leading-relaxed mt-1 max-w-md">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
