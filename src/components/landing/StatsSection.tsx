import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

function AnimatedCounter({ from = 0, value, suffix = "" }: { from?: number; value: number; suffix?: string }) {
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
      if (ref.current) ref.current.textContent = v + suffix;
    });
    return unsubscribe;
  }, [rounded, suffix]);

  return <span ref={ref}>{from}{suffix}</span>;
}

export function StatsSection() {
  const metrics = [
    { number: 10, suffix: "×", label: "faster response times", from: 0 },
    { number: 85, suffix: "%", label: "auto-resolved tickets", from: 0 },
    { number: 0, suffix: "", label: "emails missed", from: 100 },
    { number: 24, suffix: "/7", label: "always-on support", static: "24/7" },
  ];

  return (
    <section className="py-28 sm:py-36 relative overflow-hidden">
      {/* Dark gradient background like Superhuman */}
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(100,100,120,0.15)_0%,transparent_70%)]" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] text-white leading-[1.1] max-w-[600px] mx-auto">
            Support that actually scales.
          </h2>
          <p className="mt-4 text-[16px] text-zinc-400 max-w-[440px] mx-auto">
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
              className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <span className="text-[clamp(2.5rem,5vw,3.5rem)] font-bold tracking-[-0.04em] text-white leading-none block">
                {item.static ? item.static : <AnimatedCounter from={item.from} value={item.number} suffix={item.suffix} />}
              </span>
              <p className="text-[13px] text-zinc-400 mt-3 leading-relaxed">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
