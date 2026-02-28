import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { X, Check } from "lucide-react";

const traditional = [
  "Complex workflows",
  "Heavy configuration",
  "AI added later as an afterthought",
  "Separate tools for email and tickets",
];

const mailreplai = [
  "Inbox-native — connect in minutes",
  "AI-first architecture",
  "Rule-based behavioral control",
  "Lightweight and focused",
];

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-medium text-indigo-400 mb-3 tracking-wider uppercase">
            Why Us
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Built Differently
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Traditional */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8"
          >
            <h3 className="text-lg font-semibold text-zinc-400 mb-6">Traditional Helpdesk</h3>
            <ul className="space-y-4">
              {traditional.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-zinc-500">
                  <X className="h-4 w-4 text-red-400/70 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* MailReplAI */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/5 to-transparent p-8"
          >
            <h3 className="text-lg font-semibold text-white mb-6">MailReplAI</h3>
            <ul className="space-y-4">
              {mailreplai.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
