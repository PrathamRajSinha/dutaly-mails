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
  const metrics = [
    { number: 2, suffix: " min", prefix: "~", label: "avg AI response time", from: 0 },
    { number: 80, suffix: "%+", label: "emails auto-handled", from: 0 },
    { number: 0, suffix: "", label: "emails missed", from: 100 },
    { static: "24/7", label: "coverage" },
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
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] leading-[1.1] max-w-[600px] mx-auto" style={{ color: "#F0EEF8" }}>
            Support that <em>actually</em>{" "}
            <span style={{ color: "#7C6FE0" }}>scales.</span>
          </h2>
          <p className="mt-4 text-[16px] max-w-[440px] mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
            Numbers that speak for themselves.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-[900px] mx-auto">
          {metrics.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-[clamp(2.5rem,5vw,3.5rem)] font-bold tracking-[-0.04em] leading-none block" style={{ color: "#F0EEF8" }}>
                {item.static ? item.static : <AnimatedCounter from={item.from ?? 0} value={item.number!} suffix={item.suffix} prefix={item.prefix} />}
              </span>
              <p className="text-[13px] mt-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{item.label}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-center mt-8 text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          Based on internal testing.
        </p>
      </div>
    </section>
  );
}
