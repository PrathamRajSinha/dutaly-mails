import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Rocket, ShoppingBag, Users } from "lucide-react";

const useCases = [
  { icon: Rocket, title: "SaaS", text: "Route bug reports to engineering, handle billing questions automatically, and keep feature requests organized." },
  { icon: ShoppingBag, title: "D2C", text: "Resolve refund requests, order inquiries, and shipping questions without overwhelming your support team." },
  { icon: Users, title: "Agencies", text: "Manage client communication across shared inboxes. Keep every thread structured and assigned." },
];

const fade = { duration: 0.5, ease: [0.25, 0.4, 0, 1] as const };

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
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-widest uppercase text-zinc-500 mb-3">Use cases</p>
          <h2 className="text-3xl sm:text-[2.5rem] font-bold text-white tracking-[-0.02em] leading-tight">
            Built for teams that handle<br className="hidden sm:block" /> customer emails daily.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {useCases.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...fade, delay: i * 0.06 }}
                className="group p-6 rounded-xl bg-zinc-900/50 border border-white/[0.06] hover:border-white/[0.1] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center mb-4 group-hover:bg-zinc-800 transition-colors">
                  <Icon className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-2">{uc.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{uc.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
