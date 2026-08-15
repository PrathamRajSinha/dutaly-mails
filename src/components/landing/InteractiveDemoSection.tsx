import { motion } from "framer-motion";

const steps = [
  { numeral: "I.", title: "Email received", text: "A customer sends an email to your connected inbox." },
  { numeral: "II.", title: "Dutaly understands", text: "Intent, sentiment, and category are detected instantly." },
  { numeral: "III.", title: "Dutaly decides", text: "A structured ticket is created with priority and SLA." },
  { numeral: "IV.", title: "Dutaly replies or escalates", text: "High-confidence replies auto-send. The rest are drafted or handed to your team." },
  { numeral: "V.", title: "Action taken", text: "Issues are resolved automatically — or escalated with full context." },
];

export function InteractiveDemoSection() {
  return (
    <section id="how-it-works" style={{ background: "#0A0A0F" }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-24">
              <p className="text-[10px] uppercase tracking-[0.22em] mb-6" style={{ color: "#6E62C4" }}>03 / How it works</p>
              <h2 className="text-[clamp(1.9rem,3.2vw,2.75rem)] leading-[1.08]" style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}>
                From inbox <br />
                <span className="italic">to resolution.</span>
              </h2>
              <p className="mt-6 text-[14px]" style={{ color: "rgba(237,235,245,0.4)" }}>Five steps, start to finish.</p>
            </div>
          </div>

          <div className="md:col-span-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.numeral}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 1, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-8 border-t pt-8 pb-14"
                style={{ borderColor: "rgba(237,235,245,0.12)" }}
              >
                <span className="text-[22px] italic shrink-0 w-10" style={{ fontFamily: "Lora, serif", color: "#6E62C4" }}>
                  {s.numeral}
                </span>
                <div>
                  <h3 className="text-[20px] mb-3" style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}>{s.title}</h3>
                  <p className="text-[15px] leading-[1.75] max-w-xl" style={{ color: "rgba(237,235,245,0.55)" }}>{s.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
