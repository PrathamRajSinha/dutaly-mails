import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Inbox, BarChart3, Clock } from "lucide-react";

const problems = [
  {
    icon: Inbox,
    title: "Messages get buried",
    description: "Shared inboxes create chaos. Important customer emails slip through the cracks.",
  },
  {
    icon: BarChart3,
    title: "No visibility or ownership",
    description: "Without structure, nobody knows who's handling what — or if it's even been seen.",
  },
  {
    icon: Clock,
    title: "Slow, error-prone replies",
    description: "Manual responses take time, lack consistency, and miss SLA deadlines.",
  },
];

export function TrustedBySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Email alone isn't enough.
          </h2>
          <p className="mt-4 text-lg text-zinc-500 max-w-xl mx-auto">
            Your team deserves better than a cluttered inbox.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-8">
          {problems.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center sm:text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 mx-auto sm:mx-0">
                  <Icon className="h-5 w-5 text-zinc-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-[15px] text-zinc-500 leading-relaxed">{p.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
