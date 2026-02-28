import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Inbox, BarChart3, Clock } from "lucide-react";

const problems = [
  {
    icon: Inbox,
    title: "Emails get buried",
    description: "Important support emails get lost in shared inboxes with no structure or accountability.",
    iconBg: "from-rose-400 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "No ticket tracking",
    description: "No structured ticket tracking or SLA visibility means issues slip through the cracks.",
    iconBg: "from-amber-400 to-orange-500",
  },
  {
    icon: Clock,
    title: "Manual replies slow you down",
    description: "Writing every response from scratch wastes hours that could be spent growing your business.",
    iconBg: "from-cyan-400 to-teal-500",
  },
];

export function TrustedBySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-medium text-indigo-400 mb-3 tracking-wider uppercase">
            The Problem
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Your Inbox Was Never Built for{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Customer Support
            </span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
          {problems.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-8"
              >
                <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${p.iconBg} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-[15px] text-zinc-400 leading-relaxed">{p.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center text-zinc-500 text-sm"
        >
          Growing businesses need structure — without enterprise complexity.
        </motion.p>
      </div>
    </section>
  );
}
