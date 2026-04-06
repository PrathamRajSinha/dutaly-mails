import { motion } from "framer-motion";
import { Mail, Brain, Ticket, MessageSquare, CheckCircle } from "lucide-react";
import { TextPressure } from "./TextPressure";

export function InteractiveDemoSection() {
  const steps = [
    { icon: <Mail className="h-5 w-5" />, title: "Email received", text: "A customer sends an email to your connected inbox.", num: "01" },
    { icon: <Brain className="h-5 w-5" />, title: "AI understands it", text: "Intent, sentiment, and category are detected automatically.", num: "02" },
    { icon: <Ticket className="h-5 w-5" />, title: "Ticket created", text: "A structured ticket is created with priority and SLA timer.", num: "03" },
    { icon: <MessageSquare className="h-5 w-5" />, title: "Reply drafted", text: "A confident draft is generated from your knowledge base.", num: "04" },
    { icon: <CheckCircle className="h-5 w-5" />, title: "Resolved or escalated", text: "High-confidence replies send automatically. The rest come to you.", num: "05" },
  ];

  return (
    <section id="how-it-works" className="py-28 sm:py-36 relative" style={{ background: "#0A0A0F" }}>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
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

        {/* Steps - vertical timeline on dark bg */}
        <div className="relative max-w-[800px] mx-auto">
          {/* Vertical line */}
          <div className="absolute left-[23px] sm:left-[27px] top-0 bottom-0 w-px" style={{ background: "rgba(124,111,224,0.15)" }} />

          <div className="flex flex-col gap-0">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex items-start gap-6 py-8 group"
              >
                {/* Node */}
                <div
                  className="relative z-10 flex-shrink-0 w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] rounded-xl flex items-center justify-center border transition-colors duration-300"
                  style={{
                    background: "rgba(124,111,224,0.08)",
                    borderColor: "rgba(124,111,224,0.2)",
                    color: "#7C6FE0",
                  }}
                >
                  {s.icon}
                </div>

                {/* Content */}
                <div className="pt-1">
                  <span className="text-[11px] font-mono tracking-wider block mb-1.5" style={{ color: "rgba(124,111,224,0.5)" }}>
                    {s.num}
                  </span>
                  <h3 className="text-[16px] sm:text-[18px] font-semibold mb-2" style={{ color: "#F0EEF8" }}>
                    {s.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed max-w-[420px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {s.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
