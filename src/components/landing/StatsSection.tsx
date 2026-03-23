import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Clock, BarChart3, Shield } from "lucide-react";

const outcomes = [
  {
    icon: TrendingUp,
    stat: "Handle more",
    title: "without growing your team",
    description: "Resolve repetitive queries automatically. Your team focuses on what actually needs a human.",
  },
  {
    icon: Clock,
    stat: "Respond faster",
    title: "every single time",
    description: "AI-drafted replies go out in seconds. SLA timers ensure nothing falls behind.",
  },
  {
    icon: BarChart3,
    stat: "Track everything",
    title: "with full visibility",
    description: "Every conversation is a ticket. Every ticket has a status, timeline, and owner.",
  },
  {
    icon: Shield,
    stat: "Stay in control",
    title: "at every step",
    description: "Set confidence thresholds. Review before sending. Override any AI decision instantly.",
  },
];

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-28 sm:py-36" ref={ref}>
      <div className="max-w-[1100px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-white tracking-[-0.02em] leading-tight">
            Support that actually scales.
          </h2>
          <p className="mt-4 text-base text-zinc-500 max-w-md mx-auto">
            Not a bigger team. A smarter system.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {outcomes.map((o, i) => {
            const Icon = o.icon;
            return (
              <motion.div
                key={o.stat}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 0.4, 0, 1] }}
                className="p-8 rounded-2xl bg-zinc-900/40 border border-white/[0.05] hover:border-white/[0.08] transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-11 h-11 rounded-xl bg-zinc-800/80 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-[18px] w-[18px] text-indigo-400/80" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-white">
                      {o.stat} <span className="font-normal text-zinc-400">{o.title}</span>
                    </h3>
                    <p className="text-[13px] text-zinc-500 leading-[1.7] mt-2">{o.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
