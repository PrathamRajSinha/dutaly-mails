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
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Features</p>
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] leading-[1.1] max-w-[600px] mx-auto" style={{ color: "#F0EEF8" }}>
            A <span style={{ color: "#7C6FE0" }}>smarter</span> way to handle customer emails.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Classification — wide */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.05 }} className="lg:col-span-7">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3" style={{ background: "rgba(124,111,224,0.15)", color: "#A89EF0" }}>
                    Classification
                  </span>
                  <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold tracking-[-0.02em] leading-[1.2] mb-2" style={{ color: "#F0EEF8" }}>
                    Automatic classification
                  </h3>
                  <p className="text-[14px] leading-[1.7] max-w-[440px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Every email is categorized by intent, urgency, and sentiment — before anyone opens it.
                  </p>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <ClassificationMockup />
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>

          {/* AI Replies — narrow */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-5">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3" style={{ background: "rgba(124,111,224,0.15)", color: "#A89EF0" }}>
                    AI Replies
                  </span>
                  <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold tracking-[-0.02em] leading-[1.2] mb-2" style={{ color: "#F0EEF8" }}>
                    Smart reply & auto-send
                  </h3>
                  <p className="text-[14px] leading-[1.7] max-w-[440px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    AI drafts replies <em>powered by your rules</em>. High-confidence ones send automatically — the rest queue for review.
                  </p>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <ReplyMockup />
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>

          {/* Send Later — narrow */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.15 }} className="lg:col-span-5">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3" style={{ background: "rgba(124,111,224,0.15)", color: "#A89EF0" }}>
                    Timing
                  </span>
                  <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold tracking-[-0.02em] leading-[1.2] mb-2" style={{ color: "#F0EEF8" }}>
                    Have perfect timing with Send Later
                  </h3>
                  <p className="text-[14px] leading-[1.7] max-w-[440px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Schedule replies to land in inboxes at the right moment — even while you sleep.
                  </p>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <SendLaterMockup />
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>

          {/* Instant Reply — wide */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-7">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3" style={{ background: "rgba(124,111,224,0.15)", color: "#A89EF0" }}>
                    Speed
                  </span>
                  <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold tracking-[-0.02em] leading-[1.2] mb-2" style={{ color: "#F0EEF8" }}>
                    Reply faster with Instant Reply
                  </h3>
                  <p className="text-[14px] leading-[1.7] max-w-[440px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    One-click reply templates powered by AI. Pick a tone, customize if needed, and send in seconds.
                  </p>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <InstantReplyMockup />
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>

          {/* Snooze — narrow */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.25 }} className="lg:col-span-5">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3" style={{ background: "rgba(124,111,224,0.15)", color: "#A89EF0" }}>
                    Focus
                  </span>
                  <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold tracking-[-0.02em] leading-[1.2] mb-2" style={{ color: "#F0EEF8" }}>
                    Snooze emails for later
                  </h3>
                  <p className="text-[14px] leading-[1.7] max-w-[440px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Not ready to deal with it? Snooze it and it'll pop back up when you are.
                  </p>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <SnoozeMockup />
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>

          {/* Keyboard Shortcuts — narrow */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.3 }} className="lg:col-span-3">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3" style={{ background: "rgba(124,111,224,0.15)", color: "#A89EF0" }}>
                    Productivity
                  </span>
                  <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold tracking-[-0.02em] leading-[1.2] mb-2" style={{ color: "#F0EEF8" }}>
                    Keyboard shortcuts
                  </h3>
                  <p className="text-[14px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Hit Inbox Zero without touching the mouse.
                  </p>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <ShortcutsMockup />
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>

          {/* Ask Anything — narrow */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.35 }} className="lg:col-span-4">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3" style={{ background: "rgba(124,111,224,0.15)", color: "#A89EF0" }}>
                    Intelligence
                  </span>
                  <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold tracking-[-0.02em] leading-[1.2] mb-2" style={{ color: "#F0EEF8" }}>
                    Ask anything about your emails
                  </h3>
                  <p className="text-[14px] leading-[1.7] max-w-[440px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Chat with AI about your inbox. Get instant answers with direct references to the emails behind every insight.
                  </p>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <AskAnythingMockup />
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>

          {/* Dashboard — wide */}
          <motion.div {...fade} transition={{ duration: 0.5, delay: 0.4 }} className="lg:col-span-5">
            <MagicBentoCard className="h-full">
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-5">
                  <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3" style={{ background: "rgba(124,111,224,0.15)", color: "#A89EF0" }}>
                    Visibility
                  </span>
                  <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-semibold tracking-[-0.02em] leading-[1.2] mb-2" style={{ color: "#F0EEF8" }}>
                    Full visibility & tracking
                  </h3>
                  <p className="text-[14px] leading-[1.7] max-w-[440px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Each email becomes a trackable ticket with status, priority, SLA deadlines, and full history.
                  </p>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <DashboardMockup />
                </div>
              </div>
            </MagicBentoCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
