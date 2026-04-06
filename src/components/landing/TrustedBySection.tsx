import { motion } from "framer-motion";

export function TrustedBySection() {
  const pains = [
    { number: "47", label: "unread emails", text: "Every morning starts the same. A wall of unread messages, no structure, no priority. Your team triages manually — and something always slips." },
    { number: "∞", label: "copy-pasting the same reply", text: "The same questions, over and over. Your team writes the same response dozens of times a week. It's not support — it's busywork." },
    { number: "6h", label: "customers waiting", text: "Response times stretch as volume grows. Customers wait hours for answers that could have been instant." },
  ];

  return (
    <section className="py-28 sm:py-36 relative" style={{ background: "#FFFFFF" }}>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.15] max-w-[700px] mx-auto">
            Support becomes harder
            <br />
            <span className="text-zinc-400">as you grow.</span>
          </h2>
          <p className="mt-5 text-[16px] text-zinc-500 max-w-[480px] mx-auto leading-relaxed">
            Email hasn't changed in decades. But your team's workload has.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
          {pains.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-7 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-lg transition-all duration-500"
            >
              <div className="mb-5">
                <span className="text-[2.5rem] font-bold tracking-[-0.04em] text-zinc-900 leading-none">{item.number}</span>
                <span className="block text-[13px] text-zinc-400 mt-1">{item.label}</span>
              </div>
              <p className="text-[14px] text-zinc-500 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
