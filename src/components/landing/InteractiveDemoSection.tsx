import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Mail, Brain, Ticket, MessageSquare, CheckCircle } from "lucide-react";
import { TextPressure } from "./TextPressure";
import { useState } from "react";

const steps = [
  { icon: Mail, title: "Email received", text: "A customer sends an email to your connected inbox.", num: "01" },
  { icon: Brain, title: "AI understands it", text: "Intent, sentiment, and category are detected instantly.", num: "02" },
  { icon: Ticket, title: "Ticket created", text: "A structured ticket with priority and SLA timer.", num: "03" },
  { icon: MessageSquare, title: "Reply drafted", text: "A confident reply generated from your knowledge base.", num: "04" },
  { icon: CheckCircle, title: "Resolved or escalated", text: "High-confidence replies auto-send. The rest come to you.", num: "05" },
];

export function InteractiveDemoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // Map scroll progress to step index (0 to steps.length-1)
    const idx = Math.min(
      steps.length - 1,
      Math.max(0, Math.floor(v * steps.length))
    );
    setActiveStep(idx);
  });

  const step = steps[activeStep];
  const Icon = step.icon;

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative"
      style={{ background: "#0A0A0F", height: `${steps.length * 100}vh` }}
    >
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
          {/* Progress dots */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-500"
                style={{
                  background: i === activeStep
                    ? "#7C6FE0"
                    : i < activeStep
                    ? "rgba(124,111,224,0.5)"
                    : "rgba(255,255,255,0.12)",
                  boxShadow: i === activeStep ? "0 0 12px rgba(124,111,224,0.6)" : "none",
                  transform: i === activeStep ? "scale(1.5)" : "scale(1)",
                }}
              />
            ))}
          </div>

          {/* Active step content */}
          <div className="max-w-[560px] w-full relative" style={{ height: "320px" }}>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="flex flex-col items-center text-center">
                  <span
                    className="text-[80px] sm:text-[100px] lg:text-[120px] font-bold leading-none tracking-[-0.04em] select-none"
                    style={{ color: "rgba(124,111,224,0.08)" }}
                  >
                    {step.num}
                  </span>

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

                  <h3 className="text-[22px] sm:text-[26px] lg:text-[30px] font-semibold mb-3 tracking-[-0.02em]" style={{ color: "#F0EEF8" }}>
                    {step.title}
                  </h3>

                  <p className="text-[15px] sm:text-[16px] leading-relaxed max-w-[400px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {step.text}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Step counter - bottom right */}
          <div className="absolute bottom-8 right-8 hidden sm:flex items-center gap-2">
            <span className="text-[13px] font-mono" style={{ color: "rgba(124,111,224,0.6)" }}>
              {String(activeStep + 1).padStart(2, "0")}
            </span>
            <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.15)" }} />
            <span className="text-[13px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
              {String(steps.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
