import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

function AnimatedCounter({ from = 0, value, suffix = "", prefix = "" }: { from?: number; value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const count = useMotionValue(from);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (isInView) {
      animate(count, value, { duration: 1.8, ease: [0.16, 1, 0.3, 1] });
    }
  }, [isInView, count, value]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = prefix + v + suffix;
    });
    return unsubscribe;
  }, [rounded, suffix, prefix]);

  return <span ref={ref}>{prefix}{from}{suffix}</span>;
}

export function StatsSection() {
  const points = [
    { title: "Most repetitive emails are handled automatically", desc: "Refunds, status checks, password resets - Dutaly resolves them without waking up your team." },
    { title: "Your team only reviews edge cases", desc: "Dutaly drafts when needed and routes the rest, so humans focus on what actually needs judgment." },
    { title: "Faster responses without growing the team", desc: "Customers get answers in minutes - not hours - even as your inbox volume scales." },
  ];

  return (
    <section className="py-28 sm:py-36 relative overflow-hidden" style={{ background: "#0A0A0F" }}>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] leading-[1.1] max-w-[640px] mx-auto" style={{ color: "#F0EEF8" }}>
            Support that <em>actually</em>{" "}
            <span style={{ color: "#7C6FE0" }}>scales.</span>
          </h2>
          <p className="mt-4 text-[16px] max-w-[480px] mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
            Dutaly handles the volume. Your team handles the nuance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
          {points.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-7 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-[17px] font-medium leading-snug" style={{ color: "#F0EEF8" }}>{p.title}</p>
              <p className="text-[13px] mt-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
