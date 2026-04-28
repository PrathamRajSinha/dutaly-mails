import { motion } from "framer-motion";
import { Mail, Brain, Ticket, MessageSquare, CheckCircle } from "lucide-react";
import { TextPressure } from "./TextPressure";

const steps = [
  { icon: Mail, title: "Email received", text: "A customer sends an email to your connected inbox." },
  { icon: Brain, title: "Dutaly understands", text: "Intent, sentiment, and category are detected instantly." },
  { icon: Ticket, title: "Dutaly decides", text: "A structured ticket is created with priority and SLA." },
  { icon: MessageSquare, title: "Dutaly replies or escalates", text: "High-confidence replies auto-send. The rest come to you." },
  { icon: CheckCircle, title: "Action taken", text: "Resolved automatically - or handed to your team with full context." },
];

export function InteractiveDemoSection() {
  return (
    <section id="how-it-works" style={{ background: "#0A0A0F" }} className="py-24 sm:py-32">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-4 text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
          How it works
        </p>
        <div className="w-full max-w-[900px] mx-auto h-[100px] sm:h-[130px] lg:h-[160px] mb-16">
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

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px" style={{ background: "rgba(124,111,224,0.15)" }} />

          <div className="space-y-12">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="relative flex gap-6 sm:gap-8"
                >
                  {/* Dot on line */}
                  <div className="relative z-10 flex-shrink-0 w-12 sm:w-16 flex justify-center pt-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: "#7C6FE0",
                        boxShadow: "0 0 8px rgba(124,111,224,0.4)",
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 + i * 0.15 }}
                      >
                        <Icon className="w-4 h-4" style={{ color: "#7C6FE0" }} />
                      </motion.div>
                      <h3 className="text-[17px] sm:text-[19px] font-medium" style={{ color: "#F0EEF8" }}>
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-[14px] sm:text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {step.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
