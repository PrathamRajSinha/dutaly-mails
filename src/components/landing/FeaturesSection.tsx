import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, MessageSquareReply, LayoutList, AlertCircle, Settings2, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Automatic classification",
    description: "Every email is categorized by intent, urgency, and sentiment — before anyone opens it.",
  },
  {
    icon: MessageSquareReply,
    title: "Smart reply generation",
    description: "AI drafts accurate replies using your knowledge base. Review, edit, or let confident ones send automatically.",
  },
  {
    icon: LayoutList,
    title: "Structured ticket tracking",
    description: "Each email becomes a trackable ticket with status, priority, SLA deadlines, and full history.",
  },
  {
    icon: AlertCircle,
    title: "Intelligent escalation",
    description: "Low-confidence replies and angry customers are flagged instantly. Nothing slips through.",
  },
  {
    icon: Settings2,
    title: "Automation with control",
    description: "Set confidence thresholds per category. Define exactly when AI acts and when it defers to you.",
  },
  {
    icon: MessageCircle,
    title: "Slack integration",
    description: "Get notified in Slack when tickets need attention. Keep your team in the loop without switching tabs.",
  },
];

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-28 sm:py-36" ref={ref}>
      <div className="max-w-[1100px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0, 1] }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-widest uppercase text-indigo-400/80 mb-4">Features</p>
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-white tracking-[-0.02em] leading-tight">
            A smarter way to handle<br className="hidden sm:block" /> customer emails.
          </h2>
          <p className="mt-4 text-base text-zinc-500 max-w-lg mx-auto">
            Automatically read, classify, and respond. Complex ones get routed. Every conversation stays tracked.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.25, 0.4, 0, 1] }}
                className="group relative p-7 rounded-2xl bg-zinc-900/40 border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/[0.03]"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-5 group-hover:bg-indigo-500/10 transition-colors duration-300">
                  <Icon className="h-[18px] w-[18px] text-zinc-400 group-hover:text-indigo-400 transition-colors duration-300" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-[1.7]">{f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
