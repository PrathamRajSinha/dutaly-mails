import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const items = [
  { title: "Encrypted connections", text: "All email data encrypted in transit and at rest." },
  { title: "Secure authentication", text: "Industry-standard auth with OAuth and MFA support." },
  { title: "Data isolation", text: "Row-level security ensures complete tenant separation." },
  { title: "Controlled AI", text: "Confidence thresholds prevent unsupervised actions." },
];

const fade = { duration: 0.5, ease: [0.25, 0.4, 0, 1] as const };

export function SecuritySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 sm:py-28" ref={ref}>
      <div className="max-w-[1080px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={fade}
          className="max-w-[560px] mb-12"
        >
          <p className="text-[13px] font-medium tracking-widest uppercase text-zinc-500 mb-3">Security</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-[-0.02em]">
            Built on trust.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-8">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...fade, delay: i * 0.05 }}
            >
              <h3 className="text-[13px] font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-[12px] text-zinc-600 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
