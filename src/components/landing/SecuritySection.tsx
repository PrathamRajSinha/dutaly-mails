import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, ShieldCheck, Database, UserCheck } from "lucide-react";

const items = [
  { icon: Lock, title: "Encrypted connections", description: "All email data encrypted in transit and at rest." },
  { icon: ShieldCheck, title: "Secure authentication", description: "Industry-standard auth with OAuth and MFA support." },
  { icon: Database, title: "Data isolation", description: "Row-level security ensures complete tenant separation." },
  { icon: UserCheck, title: "Controlled AI", description: "Confidence thresholds prevent unsupervised actions." },
];

export function SecuritySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-28" ref={ref}>
      <div className="max-w-[900px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0, 1] }}
          className="text-center mb-12"
        >
          <p className="text-[13px] font-medium tracking-widest uppercase text-zinc-500 mb-4">Security</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-[-0.02em]">
            Built on trust.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.25, 0.4, 0, 1] }}
                className="text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800/60 flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-4 w-4 text-zinc-500" />
                </div>
                <h3 className="text-[13px] font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-[12px] text-zinc-600 leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
