import { motion } from "framer-motion";
import { Repeat, UserCheck, Gauge } from "lucide-react";

export function StatsSection() {
  const points = [
    {
      icon: Repeat,
      title: "Most repetitive emails are handled automatically",
      desc: "Refunds, status checks, password resets — Dutaly resolves them without involving your team.",
    },
    {
      icon: UserCheck,
      title: "Your team only reviews edge cases",
      desc: "Dutaly drafts when needed and routes the rest, so humans focus on what actually needs judgment.",
    },
    {
      icon: Gauge,
      title: "Faster responses without growing the team",
      desc: "Customers get answers in minutes, not hours — even as your inbox volume scales.",
    },
  ];

  return (
    <section className="relative overflow-hidden py-28 sm:py-36" style={{ background: "#0A0A0F" }}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.10), transparent)" }}
      />
      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-[720px] text-center"
        >
          <p className="eyebrow mb-5" style={{ color: "rgba(255,255,255,0.38)" }}>Scale</p>
          <h2
            className="text-[clamp(2rem,3.8vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.03em]"
            style={{ color: "#F7F6FC" }}
          >
            Support that actually{" "}
            <span style={{ color: "#7C6FE0" }}>scales.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.45)" }}>
            Dutaly handles the volume. Your team handles the nuance.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-[1060px] grid-cols-1 gap-5 md:grid-cols-3">
          {points.map((p, i) => {
            const I = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex flex-col rounded-2xl p-8 transition-colors duration-300"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(124,111,224,0.12)", border: "1px solid rgba(124,111,224,0.22)" }}
                >
                  <I className="h-4 w-4" style={{ color: "#A89EF0" }} />
                </div>
                <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em]" style={{ color: "#F0EEF8" }}>
                  {p.title}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.75]" style={{ color: "rgba(255,255,255,0.46)" }}>
                  {p.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
