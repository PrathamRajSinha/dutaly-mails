import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Rocket, ShoppingBag, Users, Briefcase } from "lucide-react";

const useCases = [
  {
    icon: Rocket,
    title: "SaaS Platforms",
    description: "Handle bug reports, billing issues, and feature requests with full traceability.",
  },
  {
    icon: ShoppingBag,
    title: "E-Commerce Brands",
    description: "Manage refund requests, complaints, and order inquiries with AI-powered precision.",
  },
  {
    icon: Users,
    title: "Agencies",
    description: "Organize shared inboxes and keep client communications structured across teams.",
  },
  {
    icon: Briefcase,
    title: "Service Providers",
    description: "Convert email traffic into actionable, trackable support workflows.",
  },
];

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="use-cases" className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-indigo-400 mb-4">Use Cases</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Built for teams that care<br className="hidden sm:block" /> about their customers.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {useCases.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-8 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{uc.title}</h3>
                <p className="text-[15px] text-zinc-500 leading-relaxed">{uc.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
