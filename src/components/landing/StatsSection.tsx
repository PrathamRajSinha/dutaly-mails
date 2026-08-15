import { motion } from "framer-motion";

const points = [
  {
    n: "01",
    title: "Most repetitive emails are handled automatically",
    desc: "Refunds, status checks, password resets — Dutaly resolves them without involving your team.",
  },
  {
    n: "02",
    title: "Your team only reviews edge cases",
    desc: "Dutaly drafts when needed and routes the rest, so humans focus on what actually needs judgment.",
  },
  {
    n: "03",
    title: "Faster responses without growing the team",
    desc: "Customers get answers in minutes, not hours — even as your inbox volume scales.",
  },
];

export function StatsSection() {
  return (
    <section style={{ background: "#16161E" }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end border-b pb-12 mb-12"
          style={{ borderColor: "rgba(237,235,245,0.12)" }}
        >
          <div className="md:col-span-7">
            <p className="text-[10px] uppercase tracking-[0.22em] mb-6" style={{ color: "#6E62C4" }}>04 / Scale</p>
            <h2 className="text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05]" style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}>
              Support that <span className="italic">actually</span> scales
            </h2>
          </div>
          <p className="md:col-span-5 text-[16px] leading-relaxed" style={{ color: "rgba(237,235,245,0.55)" }}>
            Dutaly handles the volume. Your team handles the nuance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {points.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="py-2 md:py-0 md:px-10 md:first:pl-0 md:last:pr-0"
              style={{ borderRight: i < 2 ? "1px solid rgba(237,235,245,0.12)" : undefined }}
            >
              <span className="text-[10px] uppercase tracking-[0.22em] block mb-5" style={{ color: "rgba(237,235,245,0.3)" }}>{p.n}</span>
              <p className="text-[20px] leading-snug mb-4" style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}>{p.title}</p>
              <p className="text-[14px] leading-[1.75]" style={{ color: "rgba(237,235,245,0.5)" }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
