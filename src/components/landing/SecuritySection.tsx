import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, Lock, UserCheck, Database } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Secure Authentication", description: "Industry-standard auth with email, OAuth, and MFA support." },
  { icon: Lock, title: "Encrypted Connections", description: "All email connections use TLS/SSL encryption by default." },
  { icon: UserCheck, title: "Role-Based Access", description: "Control who can view, approve, and send replies." },
  { icon: Database, title: "Data Isolation via RLS", description: "Row-level security ensures complete tenant data isolation." },
];

export function SecuritySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-medium text-indigo-400 mb-3 tracking-wider uppercase">
            Security
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Enterprise-Grade Security, Built on Supabase
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
