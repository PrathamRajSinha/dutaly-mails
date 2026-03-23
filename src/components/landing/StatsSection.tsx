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
    { number: 10, suffix: "×", label: "faster response times" },
    { number: 85, suffix: "%", label: "auto-resolved tickets" },
    { number: 0, suffix: "", label: "emails missed", from: 100 },
    { number: 24, suffix: "/7", label: "always-on support", static: "24/7" },
  ];

  return (
    <section className="py-24 sm:py-32 border-t border-zinc-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[500px] mb-20"
        >
          Support that actually scales.
        </motion.h2>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-12 sm:gap-0">
          {metrics.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="sm:flex-1 text-center sm:text-left relative"
            >
              {i > 0 && (
                <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-px bg-zinc-200" />
              )}
              <div className="sm:pl-8">
                <span className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-[-0.04em] text-zinc-900 leading-none">
                  {item.static ? item.static : <AnimatedCounter from={item.from} value={item.number} suffix={item.suffix} />}
                </span>
                <p className="text-[14px] text-zinc-500 mt-2">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
