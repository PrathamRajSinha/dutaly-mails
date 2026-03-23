import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Rocket, ShoppingBag, Users } from "lucide-react";

const useCases = [
  {
    icon: Rocket,
    title: "SaaS",
    description: "Route bug reports to engineering, handle billing questions automatically, and keep feature requests organized.",
  },
  {
    icon: ShoppingBag,
    title: "D2C",
    description: "Resolve refund requests, order inquiries, and shipping questions without overwhelming your support team.",
  },
  {
    icon: Users,
    title: "Agencies",
    description: "Manage client communication across shared inboxes. Keep every thread structured and assigned.",
  },
];

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="use-cases" className="relative py-28 sm:py-36" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/20 to-zinc-950" />

      <div className="relative max-w-[1100px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0, 1] }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-widest uppercase text-indigo-400/80 mb-4">Use cases</p>
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-white tracking-[-0.02em] leading-tight">
            Built for teams that handle<br className="hidden sm:block" /> customer emails daily.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {useCases.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 0.4, 0, 1] }}
                className="group p-8 rounded-2xl bg-zinc-900/50 border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-5 group-hover:bg-indigo-500/10 transition-colors duration-300">
                  <Icon className="h-[18px] w-[18px] text-zinc-400 group-hover:text-indigo-400 transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{uc.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-[1.7]">{uc.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
