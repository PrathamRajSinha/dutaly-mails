import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, MessageSquareReply, LayoutList, AlertCircle, Settings2, MessageCircle } from "lucide-react";

const features = [
  { icon: Brain, title: "Automatic classification", text: "Every email is categorized by intent, urgency, and sentiment — before anyone opens it." },
  { icon: MessageSquareReply, title: "Smart reply generation", text: "AI drafts accurate replies using your knowledge base. Review, edit, or let confident ones send automatically." },
  { icon: LayoutList, title: "Structured ticket tracking", text: "Each email becomes a trackable ticket with status, priority, SLA deadlines, and full history." },
  { icon: AlertCircle, title: "Intelligent escalation", text: "Low-confidence replies and angry customers are flagged instantly. Nothing slips through." },
  { icon: Settings2, title: "Automation with control", text: "Set confidence thresholds per category. Define exactly when AI acts and when it defers to you." },
  { icon: MessageCircle, title: "Slack integration", text: "Get notified in Slack when tickets need attention. Keep your team in the loop without switching tabs." },
];

const fade = { duration: 0.5, ease: [0.25, 0.4, 0, 1] as const };

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-24 sm:py-32" ref={ref}>
      <div className="max-w-[1080px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={fade}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-widest uppercase text-zinc-500 mb-3">Features</p>
          <h2 className="text-3xl sm:text-[2.5rem] font-bold text-white tracking-[-0.02em] leading-tight">
            A smarter way to handle<br className="hidden sm:block" /> customer emails.
          </h2>
          <p className="mt-4 text-zinc-500 text-[15px] max-w-lg mx-auto">
            Automatically read, classify, and respond. Complex ones get routed. Every conversation stays tracked.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...fade, delay: i * 0.05 }}
                className="group p-6 rounded-xl bg-zinc-900/40 border border-white/[0.06] hover:border-white/[0.1] transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center mb-4 group-hover:bg-zinc-800 transition-colors">
                  <Icon className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{f.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
