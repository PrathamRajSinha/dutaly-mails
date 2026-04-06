import { motion } from "framer-motion";

export function TrustedBySection() {
  return (
    <section className="py-28 sm:py-36 relative" style={{ background: "#0A0A0F" }}>
      <div className="max-w-[1000px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em] leading-[1.15]" style={{ color: "#E8E4FF" }}>
            Support becomes harder
            <br />
            <span style={{ color: "rgba(255,255,255,0.3)" }}>as you grow.</span>
          </h2>
          <p className="mt-5 text-[15px] max-w-[440px] mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            Email hasn't changed in decades. But your team's workload has.
          </p>
        </motion.div>

        <div className="space-y-0 divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {[
            {
              number: "47",
              label: "unread emails every morning",
              text: "No structure. No priority. Your team triages manually — and something always slips through.",
            },
            {
              number: "∞",
              label: "copy-pasting the same reply",
              text: "The same questions, over and over. Your team writes identical responses dozens of times a week.",
            },
            {
              number: "6h",
              label: "average response time",
              text: "Customers wait hours for answers that could've been instant. Volume grows, quality drops.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-12 py-10"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="sm:w-[200px] flex-shrink-0">
                <span
                  className="text-[3rem] sm:text-[3.5rem] font-bold tracking-[-0.04em] leading-none"
                  style={{ color: "#7C6FE0" }}
                >
                  {item.number}
                </span>
              </div>
              <div>
                <span
                  className="block text-[15px] sm:text-[16px] font-medium mb-1"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {item.label}
                </span>
                <p className="text-[14px] sm:text-[15px] leading-relaxed max-w-[460px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {item.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
