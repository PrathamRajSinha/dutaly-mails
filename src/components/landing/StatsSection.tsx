import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Clock, BarChart3, Shield } from "lucide-react";

const outcomes = [
  { icon: TrendingUp, bold: "Handle more", rest: "without growing your team", text: "Resolve repetitive queries automatically. Your team focuses on what actually needs a human." },
  { icon: Clock, bold: "Respond faster", rest: "every single time", text: "AI-drafted replies go out in seconds. SLA timers ensure nothing falls behind." },
  { icon: BarChart3, bold: "Track everything", rest: "with full visibility", text: "Every conversation is a ticket. Every ticket has a status, timeline, and owner." },
  { icon: Shield, bold: "Stay in control", rest: "at every step", text: "Set confidence thresholds. Review before sending. Override any AI decision instantly." },
];

const fade = { duration: 0.5, ease: [0.25, 0.4, 0, 1] as const };

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 sm:py-32 border-t border-white/[0.04]" ref={ref}>
      <div className="max-w-[1080px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={fade}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-[2.5rem] font-bold text-white tracking-[-0.02em] leading-tight">
            Support that actually scales.
          </h2>
          <p className="mt-4 text-zinc-500 text-[15px]">
            Not a bigger team. A smarter system.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {outcomes.map((o, i) => {
            const Icon = o.icon;
            return (
              <motion.div
                key={o.bold}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...fade, delay: i * 0.06 }}
                className="p-7 rounded-xl bg-zinc-900/40 border border-white/[0.06] hover:border-white/[0.1] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div>
                    <h3 className="text-[16px] text-white mb-1.5">
                      <span className="font-semibold">{o.bold}</span>{" "}
                      <span className="text-zinc-500">{o.rest}</span>
                    </h3>
                    <p className="text-[13px] text-zinc-500 leading-relaxed">{o.text}</p>
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
