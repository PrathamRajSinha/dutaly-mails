import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const outcomes = [
  { bold: "Handle more", rest: "without growing your team", text: "Resolve repetitive queries automatically. Your team focuses on what actually needs a human." },
  { bold: "Respond faster", rest: "every single time", text: "AI-drafted replies go out in seconds. SLA timers ensure nothing falls behind." },
  { bold: "Track everything", rest: "with full visibility", text: "Every conversation is a ticket. Every ticket has a status, timeline, and owner." },
  { bold: "Stay in control", rest: "at every step", text: "Set confidence thresholds. Review before sending. Override any AI decision instantly." },
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
          className="max-w-[560px] mb-16"
        >
          <h2 className="text-3xl sm:text-[2.5rem] font-bold text-white tracking-[-0.02em] leading-tight">
            Support that actually scales.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
          {outcomes.map((o, i) => (
            <motion.div
              key={o.bold}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...fade, delay: i * 0.06 }}
            >
              <h3 className="text-[16px] text-white mb-1.5">
                <span className="font-semibold">{o.bold}</span>{" "}
                <span className="text-zinc-500">{o.rest}</span>
              </h3>
              <p className="text-[14px] text-zinc-500 leading-relaxed">{o.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
