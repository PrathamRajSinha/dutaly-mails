import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const features = [
  { title: "Automatic classification", text: "Every email is categorized by intent, urgency, and sentiment — before anyone opens it." },
  { title: "Smart reply generation", text: "AI drafts accurate replies using your knowledge base. Review, edit, or let confident ones send automatically." },
  { title: "Structured ticket tracking", text: "Each email becomes a trackable ticket with status, priority, SLA deadlines, and full history." },
  { title: "Intelligent escalation", text: "Low-confidence replies and angry customers are flagged instantly. Nothing slips through." },
  { title: "Automation with control", text: "Set confidence thresholds per category. Define exactly when AI acts and when it defers to you." },
  { title: "Slack integration", text: "Get notified in Slack when tickets need attention. Keep your team in the loop without switching tabs." },
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
          className="max-w-[560px] mb-16"
        >
          <p className="text-[13px] font-medium tracking-widest uppercase text-zinc-500 mb-3">Features</p>
          <h2 className="text-3xl sm:text-[2.5rem] font-bold text-white tracking-[-0.02em] leading-tight">
            A smarter way to handle customer emails.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...fade, delay: i * 0.05 }}
            >
              <h3 className="text-[15px] font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-[14px] text-zinc-500 leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
