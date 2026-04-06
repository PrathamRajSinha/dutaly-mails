import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, Brain, Ticket, MessageSquare, CheckCircle } from "lucide-react";
import { TextPressure } from "./TextPressure";

const steps = [
  { icon: Mail, title: "Email received", text: "A customer sends an email to your connected inbox.", num: "01" },
  { icon: Brain, title: "AI understands it", text: "Intent, sentiment, and category are detected instantly.", num: "02" },
  { icon: Ticket, title: "Ticket created", text: "A structured ticket with priority and SLA timer.", num: "03" },
  { icon: MessageSquare, title: "Reply drafted", text: "A confident reply generated from your knowledge base.", num: "04" },
  { icon: CheckCircle, title: "Resolved or escalated", text: "High-confidence replies auto-send. The rest come to you.", num: "05" },
];

function StepIndicator({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col gap-3 items-center">
      {steps.map((_, i) => {
        const stepStart = i / steps.length;
        const stepEnd = (i + 1) / steps.length;
        const isActive = progress >= stepStart && progress < stepEnd;
        const isPast = progress >= stepEnd;

        return (
          <div key={i} className="relative">
            <div
              className="w-2 h-2 rounded-full transition-all duration-500"
              style={{
                background: isActive
                  ? "#7C6FE0"
                  : isPast
                  ? "rgba(124,111,224,0.5)"
                  : "rgba(255,255,255,0.12)",
                boxShadow: isActive ? "0 0 12px rgba(124,111,224,0.6)" : "none",
                transform: isActive ? "scale(1.5)" : "scale(1)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function InteractiveDemoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="how-it-works" ref={sectionRef} className="relative" style={{ background: "#0A0A0F", height: `${(steps.length + 1) * 100}vh` }}>
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <div className="pt-24 pb-8 px-6 text-center flex-shrink-0">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            How it works
          </p>
          <div className="w-full max-w-[900px] mx-auto h-[100px] sm:h-[130px] lg:h-[160px]">
            <TextPressure
              text="through thick & thin."
              textColor="#E8E4FF"
              weight={true}
              width={true}
              italic={true}
              alpha={false}
              flex={true}
              stroke={false}
              minFontSize={24}
            />
          </div>
        </div>

        {/* Steps area */}
        <div className="flex-1 flex items-center justify-center px-6 relative">
          {/* Progress dots - left side */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex">
            <ProgressDots scrollYProgress={scrollYProgress} />
          </div>

          {/* Active step */}
          <div className="max-w-[560px] w-full">
            {steps.map((step, i) => (
              <StepContent key={step.num} step={step} index={i} scrollYProgress={scrollYProgress} total={steps.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressDots({ scrollYProgress }: { scrollYProgress: any }) {
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="flex flex-col gap-3 items-center">
      {steps.map((_, i) => (
        <ProgressDot key={i} index={i} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}

function ProgressDot({ index, scrollYProgress }: { index: number; scrollYProgress: any }) {
  const stepStart = index / steps.length;
  const stepEnd = (index + 1) / steps.length;
  const mid = (stepStart + stepEnd) / 2;

  const scale = useTransform(scrollYProgress, [stepStart, mid, stepEnd], [1, 1.6, 1]);
  const bg = useTransform(scrollYProgress, (v: number) => {
    if (v >= stepStart && v < stepEnd) return "#7C6FE0";
    if (v >= stepEnd) return "rgba(124,111,224,0.5)";
    return "rgba(255,255,255,0.12)";
  });
  const shadow = useTransform(scrollYProgress, (v: number) =>
    v >= stepStart && v < stepEnd ? "0 0 12px rgba(124,111,224,0.6)" : "none"
  );

  return (
    <motion.div
      className="w-2 h-2 rounded-full"
      style={{ scale, backgroundColor: bg, boxShadow: shadow }}
    />
  );
}

function StepContent({
  step,
  index,
  scrollYProgress,
  total,
}: {
  step: (typeof steps)[0];
  index: number;
  scrollYProgress: any;
  total: number;
}) {
  const Icon = step.icon;

  const segmentSize = 1 / total;
  const start = index * segmentSize;
  const fadeIn = start + segmentSize * 0.1;
  const peak = start + segmentSize * 0.3;
  const fadeOut = start + segmentSize * 0.85;
  const end = (index + 1) * segmentSize;

  const opacity = useTransform(
    scrollYProgress,
    [start, fadeIn, peak, fadeOut, end],
    [0, 1, 1, 1, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [start, fadeIn, fadeOut, end],
    [50, 0, 0, -30]
  );

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ opacity, y }}
    >
      <div className="flex flex-col items-center text-center">
        {/* Large number */}
        <span
          className="text-[80px] sm:text-[100px] lg:text-[120px] font-bold leading-none tracking-[-0.04em] select-none"
          style={{ color: "rgba(124,111,224,0.08)" }}
        >
          {step.num}
        </span>

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center -mt-6 mb-6 border"
          style={{
            background: "rgba(124,111,224,0.1)",
            borderColor: "rgba(124,111,224,0.2)",
            color: "#7C6FE0",
          }}
        >
          <Icon className="h-6 w-6" />
        </div>

        {/* Title */}
        <h3 className="text-[22px] sm:text-[26px] lg:text-[30px] font-semibold mb-3 tracking-[-0.02em]" style={{ color: "#F0EEF8" }}>
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-[15px] sm:text-[16px] leading-relaxed max-w-[400px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          {step.text}
        </p>
      </div>
    </motion.div>
  );
}
