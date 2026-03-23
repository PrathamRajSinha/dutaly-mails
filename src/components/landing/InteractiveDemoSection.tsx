import { motion } from "framer-motion";

export function InteractiveDemoSection() {
  const steps = [
    { num: "01", title: "Email received", text: "A customer sends an email to your connected inbox." },
    { num: "02", title: "AI understands it", text: "Intent, sentiment, and category are detected automatically." },
    { num: "03", title: "Ticket created", text: "A structured ticket is created with priority and SLA timer." },
    { num: "04", title: "Reply generated", text: "A confident draft is generated from your knowledge base." },
    { num: "05", title: "Resolved or escalated", text: "High-confidence replies send automatically. The rest come to you." },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 border-t border-zinc-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-400 mb-4">How it works</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[500px]">
            From email to resolution.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative p-5 rounded-lg border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all duration-300"
            >
              <span className="text-[48px] font-semibold text-zinc-200 leading-none block mb-3 tracking-tighter">{s.num}</span>
              <h3 className="text-[15px] font-medium text-zinc-900 mb-1.5">{s.title}</h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">{s.text}</p>
              {i < steps.length - 1 && (
                <span className="hidden lg:block absolute top-6 -right-3.5 text-zinc-300 text-lg">→</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
