import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Mail, Brain, Ticket, MessageSquare, CheckCircle } from "lucide-react";
import { TextPressure } from "./TextPressure";

function StepCard({
  step,
  index,
  total,
}: {
  step: { icon: React.ReactNode; title: string; text: string; num: string };
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.35"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);

  return (
    <div ref={ref} style={{ position: "sticky", top: `${160 + index * 56}px`, zIndex: index }}>
      <motion.div
        style={{
          opacity,
          y,
          background: `rgba(255,255,255,${0.02 + index * 0.008})`,
          borderColor: "rgba(124,111,224,0.12)",
        }}
        className="rounded-2xl border p-6 sm:p-8 backdrop-blur-sm"
      >
        <div className="flex items-start gap-5">
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <span className="text-[11px] font-mono tracking-wider" style={{ color: "rgba(124,111,224,0.4)" }}>
              {step.num}
            </span>
            <div
              className="w-[48px] h-[48px] rounded-xl flex items-center justify-center border"
              style={{
                background: "rgba(124,111,224,0.08)",
                borderColor: "rgba(124,111,224,0.2)",
                color: "#7C6FE0",
              }}
            >
              {step.icon}
            </div>
          </div>
          <div className="pt-1">
            <h3 className="text-[17px] sm:text-[19px] font-semibold mb-2" style={{ color: "#F0EEF8" }}>
              {step.title}
            </h3>
            <p className="text-[14px] leading-relaxed max-w-[440px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              {step.text}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function InteractiveDemoSection() {
  const steps = [
    { icon: <Mail className="h-5 w-5" />, title: "Email received", text: "A customer sends an email to your connected inbox.", num: "01" },
    { icon: <Brain className="h-5 w-5" />, title: "AI understands it", text: "Intent, sentiment, and category are detected automatically.", num: "02" },
    { icon: <Ticket className="h-5 w-5" />, title: "Ticket created", text: "A structured ticket is created with priority and SLA timer.", num: "03" },
    { icon: <MessageSquare className="h-5 w-5" />, title: "Reply drafted", text: "A confident draft is generated from your knowledge base.", num: "04" },
    { icon: <CheckCircle className="h-5 w-5" />, title: "Resolved or escalated", text: "High-confidence replies send automatically. The rest come to you.", num: "05" },
  ];

  return (
    <section id="how-it-works" className="relative" style={{ background: "#0A0A0F" }}>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10 pt-28 sm:pt-36">
        {/* TextPressure headline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            How it works
          </p>
        </motion.div>

        <div className="w-full h-[120px] sm:h-[160px] lg:h-[200px] mb-20">
          <TextPressure
            text="through thick & thin."
            textColor="#E8E4FF"
            weight={true}
            width={true}
            italic={true}
            alpha={false}
            flex={true}
            stroke={false}
            minFontSize={28}
          />
        </div>

        {/* Scroll-stack cards */}
        <div className="relative max-w-[700px] mx-auto pb-[30vh]">
          <div className="flex flex-col gap-6">
            {steps.map((s, i) => (
              <StepCard key={s.title} step={s} index={i} total={steps.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
