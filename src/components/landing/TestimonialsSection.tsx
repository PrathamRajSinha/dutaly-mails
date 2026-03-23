import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const useCases = [
  { title: "SaaS", text: "Route bug reports to engineering, handle billing questions automatically, and keep feature requests organized." },
  { title: "D2C", text: "Resolve refund requests, order inquiries, and shipping questions without overwhelming your support team." },
  { title: "Agencies", text: "Manage client communication across shared inboxes. Keep every thread structured and assigned." },
];

const fade = { duration: 0.5, ease: [0.25, 0.4, 0, 1] };

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="use-cases" className="py-24 sm:py-32" ref={ref}>
      <div className="max-w-[1080px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={fade}
          className="max-w-[560px] mb-16"
        >
          <p className="text-[13px] font-medium tracking-widest uppercase text-zinc-500 mb-3">Use cases</p>
          <h2 className="text-3xl sm:text-[2.5rem] font-bold text-white tracking-[-0.02em] leading-tight">
            Built for teams that handle customer emails daily.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-x-12 gap-y-10">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...fade, delay: i * 0.06 }}
            >
              <h3 className="text-[15px] font-semibold text-white mb-1.5">{uc.title}</h3>
              <p className="text-[14px] text-zinc-500 leading-relaxed">{uc.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
