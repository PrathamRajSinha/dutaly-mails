import { motion } from "framer-motion";

export function StatsSection() {
  const metrics = [
    { number: "10×", label: "faster response times" },
    { number: "85%", label: "auto-resolved tickets" },
    { number: "0", label: "emails missed" },
    { number: "24/7", label: "always-on support" },
  ];

  return (
    <section className="py-24 sm:py-32 border-t border-zinc-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[500px] mb-20"
        >
          Support that actually scales.
        </motion.h2>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-12 sm:gap-0">
          {metrics.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="sm:flex-1 text-center sm:text-left relative"
            >
              {i > 0 && (
                <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-px bg-zinc-200" />
              )}
              <div className="sm:pl-8">
                <span className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-[-0.04em] text-zinc-900 leading-none">
                  {item.number}
                </span>
                <p className="text-[14px] text-zinc-500 mt-2">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
