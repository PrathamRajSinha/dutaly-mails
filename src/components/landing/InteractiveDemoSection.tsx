import { motion } from "framer-motion";
import { Mail, Brain, Ticket, MessageSquare, CheckCircle } from "lucide-react";

export function InteractiveDemoSection() {
  const steps = [
    { icon: <Mail className="h-5 w-5" />, title: "Email received", text: "A customer sends an email to your connected inbox." },
    { icon: <Brain className="h-5 w-5" />, title: "AI understands it", text: "Intent, sentiment, and category are detected automatically." },
    { icon: <Ticket className="h-5 w-5" />, title: "Ticket created", text: "A structured ticket is created with priority and SLA timer." },
    { icon: <MessageSquare className="h-5 w-5" />, title: "Reply generated", text: "A confident draft is generated from your knowledge base." },
    { icon: <CheckCircle className="h-5 w-5" />, title: "Resolved or escalated", text: "High-confidence replies send automatically. The rest come to you." },
  ];

  return (
    <section id="how-it-works" className="py-28 sm:py-36 relative" style={{ background: "#F8F7FF" }}>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-400 mb-4">How it works</p>
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[600px] mx-auto">
            From email to <span style={{ color: "#7C6FE0" }}>resolution.</span>
          </h2>
        </motion.div>

        {/* Horizontal timeline */}
        <div className="relative max-w-[1000px] mx-auto">
          <div className="hidden lg:block absolute top-[36px] left-[40px] right-[40px] h-px bg-zinc-200" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="mx-auto w-[72px] h-[72px] rounded-2xl bg-white border-2 border-zinc-200 flex items-center justify-center mb-5 shadow-sm relative z-10" style={{ color: "#7C6FE0" }}>
                  {s.icon}
                </div>
                <h3 className="text-[14px] font-semibold text-zinc-900 mb-2">{s.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[180px] mx-auto">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
