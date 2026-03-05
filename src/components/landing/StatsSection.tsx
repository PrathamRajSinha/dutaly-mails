import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { X, Check } from "lucide-react";

const traditional = [
  "Complex, bloated workflows",
  "Heavy configuration needed",
  "AI bolted on as an afterthought",
  "Separate tools for email & tickets",
];

const dyuticai = [
  "Connects to your inbox in minutes",
  "AI-first from day one",
  "Rule-based control you can trust",
  "Lightweight and laser-focused",
];

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Not another helpdesk.
          </h2>
          <p className="mt-4 text-lg text-zinc-500">
            dyuticAI is purpose-built for teams that use email as their primary support channel.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl bg-zinc-900/60 border border-white/5 p-8"
          >
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-6">Traditional Helpdesk</h3>
            <ul className="space-y-4">
              {traditional.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-zinc-500">
                  <X className="h-4 w-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl bg-zinc-900/60 border border-indigo-500/20 p-8"
          >
            <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-6">dyuticAI</h3>
            <ul className="space-y-4">
              {dyuticai.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-zinc-300">
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
