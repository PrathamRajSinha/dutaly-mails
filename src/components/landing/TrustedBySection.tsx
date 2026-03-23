import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const problems = [
  { title: "Emails pile up", text: "Teams still read every email manually. Nothing is prioritized — everything looks urgent." },
  { title: "Requests get lost", text: "Sorting and assigning by hand means important messages slip through the cracks." },
  { title: "Responses slow down", text: "As volume grows, response time increases. Customers wait longer." },
  { title: "No visibility", text: "Without structure, there's no way to track who handled what — or what was missed entirely." },
];

const fade = { duration: 0.5, ease: [0.25, 0.4, 0, 1] as const };

export function TrustedBySection() {
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
            Support becomes harder as you grow.
          </h2>
          <p className="mt-4 text-zinc-500 text-[15px]">
            These problems don't go away — they compound.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...fade, delay: i * 0.06 }}
              className="p-6 rounded-xl bg-zinc-900/50 border border-white/[0.06] hover:border-white/[0.1] transition-colors"
            >
              <h3 className="text-[15px] font-semibold text-white mb-2">{p.title}</h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
