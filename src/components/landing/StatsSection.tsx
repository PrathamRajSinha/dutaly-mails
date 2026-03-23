import { motion } from "framer-motion";

export function StatsSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-zinc-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[500px] mb-16"
        >
          Support that actually scales.
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { metric: "Handle more", desc: "without growing your team" },
            { metric: "Respond faster", desc: "every single time" },
            { metric: "Track everything", desc: "with full visibility" },
            { metric: "Stay in control", desc: "at every step" },
          ].map((item, i) => (
            <motion.div
              key={item.metric}
              initial={{ opacity: 0, y: -80, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                y: { type: "spring", stiffness: 300, damping: 18, delay: i * 0.15 },
                scale: { type: "spring", stiffness: 300, damping: 18, delay: i * 0.15 },
                opacity: { duration: 0.3, delay: i * 0.15 },
              }}
              className="p-8 rounded-lg border border-zinc-100 hover:border-zinc-200 hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-[20px] font-semibold text-zinc-900 mb-1">{item.metric}</h3>
              <p className="text-[14px] text-zinc-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
