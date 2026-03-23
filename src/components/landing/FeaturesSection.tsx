import { motion } from "framer-motion";

const features = [
  { title: "Automatic classification", text: "Every email is categorized by intent, urgency, and sentiment — before anyone opens it." },
  { title: "Smart reply generation", text: "AI drafts accurate replies using your knowledge base. Review, edit, or let confident ones send automatically." },
  { title: "Structured ticket tracking", text: "Each email becomes a trackable ticket with status, priority, SLA deadlines, and full history." },
  { title: "Intelligent escalation", text: "Low-confidence replies and angry customers are flagged instantly. Nothing slips through." },
  { title: "Automation with control", text: "Set confidence thresholds per category. Define exactly when AI acts and when it defers to you." },
  { title: "Slack integration", text: "Get notified in Slack when tickets need attention. Keep your team in the loop without switching tabs." },
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
          className="grid md:grid-cols-[1fr_1.2fr] gap-16 mb-20 items-end"
        >
          <div>
            <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-400 mb-4">Features</p>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1]">
              A smarter way to handle customer emails.
            </h2>
          </div>
          <p className="text-[15px] text-zinc-500 leading-[1.8] max-w-[420px] md:ml-auto">
            Every feature is designed to reduce manual work while keeping you in full control of your customer communication.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-0">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.1 }}
              className="py-8 border-b border-zinc-100 group"
            >
              <span className="text-[11px] font-mono text-zinc-300 mb-3 block">0{i + 1}</span>
              <h3 className="text-[17px] font-semibold text-zinc-900 mb-2 group-hover:text-zinc-600 transition-colors duration-300">{f.title}</h3>
              <p className="text-[14px] text-zinc-500 leading-[1.7]">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
