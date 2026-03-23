import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Inbox, Users, Clock, AlertTriangle } from "lucide-react";

const problems = [
  {
    icon: Inbox,
    title: "Emails pile up",
    description: "Teams still read every email manually. Nothing is prioritized — everything looks urgent.",
  },
  {
    icon: Users,
    title: "Requests get lost",
    description: "Sorting and assigning by hand means important messages slip through the cracks.",
  },
  {
    icon: Clock,
    title: "Responses slow down",
    description: "As volume grows, response time increases. Customers wait longer. Satisfaction drops.",
  },
  {
    icon: AlertTriangle,
    title: "No visibility",
    description: "Without structure, there's no way to track who handled what — or what was missed entirely.",
  },
];

export function TrustedBySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-28 sm:py-36" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/30 to-zinc-950" />

      <div className="relative max-w-[1100px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-white tracking-[-0.02em] leading-tight">
            Support becomes harder<br className="hidden sm:block" /> as you grow.
          </h2>
          <p className="mt-4 text-base text-zinc-500 max-w-md mx-auto">
            These problems don't go away — they compound.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {problems.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 0.4, 0, 1] }}
                className="group p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.05] hover:border-white/[0.1] hover:bg-zinc-900/70 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-4 group-hover:bg-zinc-800 transition-colors">
                  <Icon className="h-4.5 w-4.5 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{p.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
