import { motion } from "framer-motion";
import { ClassificationMockup, ReplyMockup, DashboardMockup, AskAnythingMockup } from "./FeatureMockups";
import { MagicBentoCard } from "./MagicBentoCard";
import { Clock, Sparkles, BellOff, Keyboard } from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

function SendLaterMockup() {
  return (
    <div className="p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>I appreciate the insightful disc...</p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>forward to our next steps.</p>
      </div>
      <div className="flex items-center gap-3 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-xs font-medium" style={{ color: "#7C6FE0" }}>Send: Wednesday at 9am</span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Remind me</span>
      </div>
    </div>
  );
}

function InstantReplyMockup() {
  return (
    <div className="p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: "rgba(124,111,224,0.2)", color: "#A89EF0" }}>ai</span>
        <span className="px-2.5 py-1 rounded-md text-xs" style={{ border: "1px solid rgba(124,111,224,0.4)", color: "#A89EF0" }}>Reviewing</span>
        <span className="px-2.5 py-1 rounded-md text-xs" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>Need time</span>
        <span className="px-2.5 py-1 rounded-md text-xs" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>Thank you, do...</span>
      </div>
      <p className="text-xs" style={{ color: "#A89EF0" }}>Hi Amelia, thanks for the heads-up! I'll review...</p>
    </div>
  );
}

function SnoozeMockup() {
  return (
    <div className="p-4 space-y-2" style={{ background: "rgba(255,255,255,0.02)" }}>
      {[
        { label: "1 hour", icon: "⏰" },
        { label: "Tomorrow morning", icon: "🌅" },
        { label: "Next week", icon: "📅" },
      ].map((opt) => (
        <div key={opt.label} className="flex items-center gap-2.5 rounded-md px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-sm">{opt.icon}</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{opt.label}</span>
        </div>
      ))}
    </div>
  );
}

function ShortcutsMockup() {
  return (
    <div className="p-4 space-y-1.5" style={{ background: "rgba(255,255,255,0.02)" }}>
      {[
        { key: "j / k", desc: "Navigate tickets" },
        { key: "r", desc: "Reply" },
        { key: "e", desc: "Resolve" },
        { key: "s", desc: "Snooze" },
      ].map((s) => (
        <div key={s.key} className="flex items-center justify-between py-1.5">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{s.desc}</span>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>{s.key}</kbd>
        </div>
      ))}
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-28 sm:py-36 relative" style={{ background: "#0A0A0F" }}>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div {...fade} className="text-center mb-16">
          <p className="eyebrow mb-5" style={{ color: "rgba(255,255,255,0.38)" }}>Features</p>
          <h2 className="text-[clamp(2rem,3.8vw,3.1rem)] font-semibold tracking-[-0.03em] leading-[1.08] max-w-[720px] mx-auto" style={{ color: "#F0EEF8" }}>
            Everything <span style={{ color: "#7C6FE0" }}>Dutaly</span> does for your inbox.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 1. Understands every email - wide */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.05 }} className="lg:col-span-7">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="eyebrow inline-block mb-4" style={{ color: "#A89EF0" }}>
                    Understanding
                  </span>
                  <h3 className="text-[clamp(1.3rem,2vw,1.6rem)] font-semibold tracking-[-0.022em] leading-[1.2] mb-2.5" style={{ color: "#F0EEF8" }}>
                    Dutaly understands every email
                  </h3>
                  <p className="text-[14.5px] leading-[1.75] max-w-[460px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Intent, sentiment, and category are detected on every message - before a human ever opens it.
                  </p>

                </div>
                <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <ClassificationMockup />
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>

          {/* 2. Handles automatically - narrow */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-5">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="eyebrow inline-block mb-4" style={{ color: "#A89EF0" }}>
                    Automation
                  </span>
                  <h3 className="text-[clamp(1.3rem,2vw,1.6rem)] font-semibold tracking-[-0.022em] leading-[1.2] mb-2.5" style={{ color: "#F0EEF8" }}>
                    Dutaly handles emails automatically
                  </h3>
                  <p className="text-[14.5px] leading-[1.75] max-w-[460px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Replies are sent on its own when confidence is high, and tickets are created or updated as conversations evolve.
                  </p>

                </div>
                <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <ReplyMockup />
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>

          {/* 3. Supports your team - narrow */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.15 }} className="lg:col-span-5">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="eyebrow inline-block mb-4" style={{ color: "#A89EF0" }}>
                    Collaboration
                  </span>
                  <h3 className="text-[clamp(1.3rem,2vw,1.6rem)] font-semibold tracking-[-0.022em] leading-[1.2] mb-2.5" style={{ color: "#F0EEF8" }}>
                    Dutaly supports your team
                  </h3>
                  <p className="text-[14.5px] leading-[1.75] max-w-[460px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    When unsure, it drafts replies, suggests next actions, and keeps humans firmly in control.
                  </p>

                </div>
                <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <InstantReplyMockup />
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>

          {/* 4. Knows your business - wide */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-7">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="eyebrow inline-block mb-4" style={{ color: "#A89EF0" }}>
                    Knowledge
                  </span>
                  <h3 className="text-[clamp(1.3rem,2vw,1.6rem)] font-semibold tracking-[-0.022em] leading-[1.2] mb-2.5" style={{ color: "#F0EEF8" }}>
                    Dutaly knows your business
                  </h3>
                  <p className="text-[14.5px] leading-[1.75] max-w-[460px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Powered by your knowledge base, instructions, and rules - Dutaly answers the way you would.
                  </p>

                </div>
                <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <DashboardMockup />
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>

          {/* Confidence states - full width */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.25 }} className="lg:col-span-12">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8">
                <div className="mb-6 max-w-[640px]">
                  <span className="eyebrow inline-block mb-4" style={{ color: "#A89EF0" }}>
                    Confidence
                  </span>
                  <h3 className="text-[clamp(1.3rem,2vw,1.6rem)] font-semibold tracking-[-0.022em] leading-[1.2] mb-2.5" style={{ color: "#F0EEF8" }}>
                    Smart automation with control
                  </h3>
                  <p className="text-[14px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Dutaly sends replies automatically when confidence is high. When it's unsure, it asks you.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { tag: "High", label: "Auto sent", desc: "Dutaly replies on its own.", color: "#34D399", bg: "rgba(52,211,153,0.1)" },
                    { tag: "Medium", label: "Review", desc: "Dutaly drafts, you approve.", color: "#FBBF24", bg: "rgba(251,191,36,0.1)" },
                    { tag: "Low", label: "Escalate", desc: "Dutaly hands it to your team.", color: "#F87171", bg: "rgba(248,113,113,0.1)" },
                  ].map((s) => (
                    <div key={s.tag} className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ color: s.color, background: s.bg }}>{s.tag} confidence</span>
                      <p className="mt-3 text-[16px] font-semibold" style={{ color: "#F0EEF8" }}>{s.label}</p>
                      <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>

          {/* Talk to Dutaly - narrow */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.3 }} className="lg:col-span-7">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="eyebrow inline-block mb-4" style={{ color: "#A89EF0" }}>
                    Conversational
                  </span>
                  <h3 className="text-[clamp(1.3rem,2vw,1.6rem)] font-semibold tracking-[-0.022em] leading-[1.2] mb-2.5" style={{ color: "#F0EEF8" }}>
                    Talk to Dutaly
                  </h3>
                  <p className="text-[14.5px] leading-[1.75] max-w-[460px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Ask which emails need attention, get a summary of today's issues, or list unresolved queries - with direct links to every email.
                  </p>

                </div>
                <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <AskAnythingMockup />
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>

          {/* Tickets - narrow */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.35 }} className="lg:col-span-5">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="eyebrow inline-block mb-4" style={{ color: "#A89EF0" }}>
                    Tickets
                  </span>
                  <h3 className="text-[clamp(1.3rem,2vw,1.6rem)] font-semibold tracking-[-0.022em] leading-[1.2] mb-2.5" style={{ color: "#F0EEF8" }}>
                    Full visibility & tracking
                  </h3>
                  <p className="text-[14.5px] leading-[1.75] max-w-[460px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Every email becomes a structured ticket with status, priority, SLA, and full history.
                  </p>

                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { icon: Clock, label: "Snooze" },
                    { icon: Sparkles, label: "Send later" },
                    { icon: Keyboard, label: "Shortcuts" },
                  ].map((u) => {
                    const I = u.icon;
                    return (
                      <div key={u.label} className="flex items-center gap-2 px-2.5 py-2 rounded-md" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <I className="w-3 h-3" style={{ color: "rgba(255,255,255,0.4)" }} />
                        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>{u.label}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Plus utilities for everyday flow
                </p>

              </div>
            </MagicBentoCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
