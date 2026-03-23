import { motion } from "framer-motion";
import { Brain, MessageSquare, TicketCheck, AlertTriangle, SlidersHorizontal, Bell } from "lucide-react";

const features = [
  { icon: Brain, title: "Automatic classification", text: "Every email is categorized by intent, urgency, and sentiment — before anyone opens it.", accent: "bg-blue-50 text-blue-600" },
  { icon: MessageSquare, title: "Smart reply generation", text: "AI drafts accurate replies using your knowledge base. Review, edit, or let confident ones send automatically.", accent: "bg-emerald-50 text-emerald-600" },
  { icon: TicketCheck, title: "Structured ticket tracking", text: "Each email becomes a trackable ticket with status, priority, SLA deadlines, and full history.", accent: "bg-violet-50 text-violet-600" },
  { icon: AlertTriangle, title: "Intelligent escalation", text: "Low-confidence replies and angry customers are flagged instantly. Nothing slips through.", accent: "bg-amber-50 text-amber-600" },
  { icon: SlidersHorizontal, title: "Automation with control", text: "Set confidence thresholds per category. Define exactly when AI acts and when it defers to you.", accent: "bg-rose-50 text-rose-600" },
  { icon: Bell, title: "Slack integration", text: "Get notified in Slack when tickets need attention. Keep your team in the loop without switching tabs.", accent: "bg-cyan-50 text-cyan-600" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 border-t border-zinc-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-400 mb-4">Features</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[500px]">
            A smarter way to handle customer emails.
          </h2>
        </motion.div>

        <div className="space-y-6 sm:space-y-0">
          {features.map((f, i) => {
            const Icon = f.icon;
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 py-8 ${
                  i < features.length - 1 ? "border-b border-zinc-100" : ""
                } ${isEven ? "" : "sm:flex-row-reverse sm:text-right"}`}
              >
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${f.accent}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex-1 ${isEven ? "" : "sm:flex sm:flex-col sm:items-end"}`}>
                  <h3 className="text-[17px] font-semibold text-zinc-900 mb-1.5">{f.title}</h3>
                  <p className="text-[14px] text-zinc-500 leading-[1.7] max-w-[440px]">{f.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
