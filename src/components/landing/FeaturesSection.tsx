import { motion } from "framer-motion";

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
};

const features = [
  {
    n: "01",
    kicker: "Understanding",
    title: "Dutaly understands every email",
    text: "Intent, sentiment, and category are detected on every message — before a human ever opens it.",
  },
  {
    n: "02",
    kicker: "Automation",
    title: "Dutaly handles emails automatically",
    text: "Replies are sent on its own when confidence is high, and tickets are created or updated as conversations evolve.",
  },
  {
    n: "03",
    kicker: "Collaboration",
    title: "Dutaly supports your team",
    text: "When unsure, it drafts replies, suggests next actions, and keeps humans firmly in control.",
  },
  {
    n: "04",
    kicker: "Knowledge",
    title: "Dutaly knows your business",
    text: "Powered by your knowledge base, instructions, and rules — Dutaly answers the way you would.",
  },
  {
    n: "05",
    kicker: "Conversational",
    title: "Talk to Dutaly",
    text: "Ask which emails need attention, get a summary of today's issues, or list unresolved queries — with direct links to every email.",
  },
  {
    n: "06",
    kicker: "Tickets",
    title: "Full visibility & tracking",
    text: "Every email becomes a structured ticket with status, priority, SLA, and full history.",
  },
];

const confidence = [
  { label: "High confidence — Auto sent", desc: "Dutaly replies on its own.", color: "#34D399" },
  { label: "Medium confidence — Review", desc: "Dutaly drafts, you approve.", color: "#FBBF24" },
  { label: "Low confidence — Escalate", desc: "Dutaly hands it to your team.", color: "#F87171" },
];

export function FeaturesSection() {
  return (
    <section id="features" style={{ background: "#0A0A0F" }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">
        <div className="border-t pt-12" style={{ borderColor: "rgba(237,235,245,0.12)" }}>
          <motion.div {...fade} className="flex items-baseline justify-between gap-8 mb-16">
            <h2 className="text-[clamp(1.9rem,3.4vw,3rem)] leading-[1.05]" style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}>
              Everything Dutaly does <span className="italic">for your inbox.</span>
            </h2>
            <span className="text-[10px] uppercase tracking-[0.22em] whitespace-nowrap" style={{ color: "rgba(237,235,245,0.35)" }}>
              02 / Features
            </span>
          </motion.div>

          {/* Ruled editorial run, staggered second column */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ borderLeft: "1px solid rgba(237,235,245,0.12)" }}>
            {features.map((f, i) => (
              <motion.div
                key={f.n}
                {...fade}
                transition={{ duration: 0.9, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className={`p-8 lg:p-10 transition-colors hover:bg-[#16161E] ${i % 3 === 1 ? "md:mt-12" : ""}`}
                style={{ borderRight: "1px solid rgba(237,235,245,0.12)", borderBottom: "1px solid rgba(237,235,245,0.12)" }}
              >
                <div className="w-8 h-8 mb-6 flex items-center justify-center" style={{ background: "rgba(110,98,196,0.1)", border: "1px solid rgba(110,98,196,0.3)" }}>
                  <span className="text-[11px] font-medium" style={{ color: "#6E62C4" }}>{f.n}</span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.22em] mb-3" style={{ color: "rgba(237,235,245,0.35)" }}>{f.kicker}</p>
                <h3 className="text-[21px] leading-snug mb-4" style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}>{f.title}</h3>
                <p className="text-[14px] leading-[1.75]" style={{ color: "rgba(237,235,245,0.55)" }}>{f.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Confidence ladder */}
          <motion.div {...fade} className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-20">
            <div className="md:col-span-4">
              <p className="text-[10px] uppercase tracking-[0.22em] mb-4" style={{ color: "#6E62C4" }}>Confidence</p>
              <h3 className="text-[28px] leading-tight" style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}>
                Smart automation <span className="italic">with control</span>
              </h3>
            </div>
            <div className="md:col-span-8">
              {confidence.map((c) => (
                <div key={c.label} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 py-6 border-t" style={{ borderColor: "rgba(237,235,245,0.12)" }}>
                  <span className="text-[12px] uppercase tracking-[0.16em] sm:w-[280px] shrink-0" style={{ color: c.color }}>{c.label}</span>
                  <span className="text-[15px]" style={{ color: "rgba(237,235,245,0.6)" }}>{c.desc}</span>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2 pt-8 border-t" style={{ borderColor: "rgba(237,235,245,0.12)" }}>
                <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgba(237,235,245,0.3)" }}>Plus utilities for everyday flow</span>
                {["Snooze", "Send later", "Shortcuts"].map((u) => (
                  <span key={u} className="text-[13px]" style={{ color: "rgba(237,235,245,0.5)" }}>{u}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
