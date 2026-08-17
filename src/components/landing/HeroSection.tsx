import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, Inbox } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const proofPoints = [
  { icon: Zap, label: "Replies in minutes, not hours" },
  { icon: ShieldCheck, label: "Human approval where it matters" },
  { icon: Inbox, label: "Gmail & IMAP in under 15 min" },
];

export function HeroSection() {
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  return (
    <section className="relative overflow-hidden pt-32 pb-0 sm:pt-40" style={{ background: "#0A0A0F" }}>
      {/* Ambient light */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 h-[560px]"
        style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(124,111,224,0.16) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(70% 50% at 50% 20%, black, transparent)",
          WebkitMaskImage: "radial-gradient(70% 50% at 50% 20%, black, transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <div className="mx-auto max-w-[860px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <span
              className="font-display inline-flex items-center gap-2.5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                background: "rgba(124,111,224,0.10)",
                border: "1px solid rgba(124,111,224,0.28)",
                borderRadius: "999px",
                color: "#A89EF0",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              AI-powered email support
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
            className="mt-8 text-[clamp(2.6rem,6vw,5rem)] font-semibold leading-[1.04] tracking-[-0.035em]"
            style={{ color: "#F7F6FC" }}
          >
            Every customer email.
            <br />
            Handled — by{" "}
            <span
              style={{
                background: "linear-gradient(120deg, #A89EF0 0%, #7C6FE0 60%, #6055C8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Dutaly.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease }}
            className="mx-auto mt-7 max-w-[640px] text-[17px] leading-[1.75] sm:text-[18px]"
            style={{ color: "rgba(255,255,255,0.56)" }}
          >
            An autonomous email agent for support teams. Dutaly connects to your support inbox,
            reads every message, answers from your knowledge base, auto-sends replies, and creates
            tickets — while keeping your team in control.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.42, ease }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
          >
            <Link to={ctaLink} className="w-full sm:w-auto">
              <Button
                className="font-display h-12 w-full px-7 text-[14px] font-semibold tracking-[0.01em] text-white transition-all duration-300 sm:w-auto"
                style={{
                  background: "#7C6FE0",
                  borderRadius: "8px",
                  boxShadow: "0 12px 34px -12px rgba(124,111,224,0.75)",
                }}
              >
                Let Dutaly handle your inbox
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a
              href="#how-it-works"
              className="font-display inline-flex h-12 items-center justify-center rounded-lg px-6 text-[14px] font-medium transition-colors"
              style={{
                color: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              See how it works →
            </a>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          >
            {proofPoints.map((p) => {
              const I = p.icon;
              return (
                <li key={p.label} className="flex items-center gap-2 text-[13px]" style={{ color: "rgba(255,255,255,0.42)" }}>
                  <I className="h-3.5 w-3.5" style={{ color: "#7C6FE0" }} />
                  {p.label}
                </li>
              );
            })}
          </motion.ul>
        </div>
      </div>

      {/* Product preview */}
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.75, ease }}
        className="relative mx-auto mt-20 max-w-[1140px] px-6 sm:mt-24"
      >
        <div
          className="relative overflow-hidden rounded-t-[18px] border border-b-0"
          style={{
            borderColor: "rgba(255,255,255,0.10)",
            background: "linear-gradient(180deg, #12121B 0%, #0D0D14 100%)",
            boxShadow: "0 -1px 0 rgba(255,255,255,0.06) inset, 0 40px 120px -30px rgba(0,0,0,0.85)",
          }}
        >
          {/* Window chrome */}
          <div
            className="flex items-center gap-3 border-b px-4 py-3"
            style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
          >
            <div className="flex gap-1.5">
              <div className="h-[10px] w-[10px] rounded-full bg-[#FF5F57]" />
              <div className="h-[10px] w-[10px] rounded-full bg-[#FEBC2E]" />
              <div className="h-[10px] w-[10px] rounded-full bg-[#28C840]" />
            </div>
            <div className="flex flex-1 justify-center">
              <div
                className="rounded-md px-10 py-1 text-[11px]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.32)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                dutaly.com/inbox
              </div>
            </div>
          </div>

          {/* Caption */}
          <div className="flex flex-col gap-1 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div>
              <p className="font-display text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.82)" }}>
                Customer Inbox
              </p>
              <p className="mt-1 max-w-[680px] text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                See Dutaly in action: routine emails auto-resolved, edge cases flagged for review,
                complex issues escalated with context.
              </p>
            </div>
            <span
              className="font-display w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ background: "rgba(52,211,153,0.10)", color: "#34D399" }}
            >
              Live
            </span>
          </div>

          {/* Inbox UI */}
          <div className="flex min-h-[440px]">
            {/* Sidebar */}
            <div
              className="hidden w-[204px] space-y-1 border-r p-3 sm:block"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0B0B12" }}
            >
              <div className="font-display rounded-lg px-3 py-2 text-[12px] font-semibold" style={{ background: "rgba(124,111,224,0.16)", color: "#BDB4F5" }}>
                Customer Inbox
              </div>
              {["Auto-Sent", "Knowledge Base", "Instructions", "Templates"].map((l) => (
                <div key={l} className="px-3 py-2 text-[12px]" style={{ color: "rgba(255,255,255,0.38)" }}>
                  {l}
                </div>
              ))}
              <div className="mt-6 px-3 py-2 text-[12px]" style={{ color: "rgba(255,255,255,0.26)" }}>
                Settings
              </div>
            </div>

            {/* Ticket list */}
            <div className="flex-1 border-r" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0E0E16" }}>
              <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="font-display text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
                  All Tickets
                </span>
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>4 open</span>
              </div>
              {[
                { from: "Sarah Chen", subject: "Refund request for order #4821", status: "Auto-resolved", statusColor: "#34D399", statusBg: "rgba(52,211,153,0.1)", time: "2m", score: "92%" },
                { from: "Mike Torres", subject: "API rate limiting question", status: "Needs review", statusColor: "#FBBF24", statusBg: "rgba(251,191,36,0.1)", time: "8m", score: "67%", active: true },
                { from: "Lisa Wang", subject: "Update billing address", status: "Auto-resolved", statusColor: "#34D399", statusBg: "rgba(52,211,153,0.1)", time: "14m", score: "96%" },
                { from: "Dev Team", subject: "Integration webhook failing", status: "Escalated", statusColor: "#F87171", statusBg: "rgba(248,113,113,0.1)", time: "22m", score: "41%" },
              ].map((t, i) => (
                <div
                  key={i}
                  className="relative cursor-default border-b px-5 py-3.5"
                  style={{
                    borderColor: "rgba(255,255,255,0.04)",
                    background: t.active ? "rgba(124,111,224,0.07)" : "transparent",
                  }}
                >
                  {t.active && <span className="absolute inset-y-0 left-0 w-[2px]" style={{ background: "#7C6FE0" }} />}
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-display text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.88)" }}>
                      {t.from}
                    </span>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{t.time}</span>
                  </div>
                  <p className="mb-2 truncate text-[12.5px]" style={{ color: "rgba(255,255,255,0.46)" }}>{t.subject}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-display rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: t.statusColor, background: t.statusBg }}>
                      {t.status}
                    </span>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.26)" }}>{t.score} confidence</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            <div className="hidden w-[352px] p-5 lg:block" style={{ background: "#0E0E16" }}>
              <div className="mb-5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-display text-[14px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                    Mike Torres
                  </span>
                  <span className="font-display rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: "#FBBF24", background: "rgba(251,191,36,0.1)" }}>
                    Needs review
                  </span>
                </div>
                <span className="text-[11.5px]" style={{ color: "rgba(255,255,255,0.3)" }}>mike@startup.io</span>
              </div>

              <div className="mb-6 text-[13px] leading-relaxed">
                <p className="font-display mb-2 text-[13.5px] font-semibold" style={{ color: "rgba(255,255,255,0.86)" }}>
                  API rate limiting question
                </p>
                <p style={{ color: "rgba(255,255,255,0.46)" }}>
                  Hi, we've been hitting rate limits on the /v2/messages endpoint. Our integration
                  sends about 500 requests per minute during peak hours. Can you increase our limit
                  or suggest a batching approach?
                </p>
              </div>

              <div className="rounded-xl p-4" style={{ background: "rgba(124,111,224,0.07)", border: "1px solid rgba(124,111,224,0.16)" }}>
                <div className="mb-2.5 flex items-center gap-2">
                  <div className="flex h-4 w-4 items-center justify-center rounded" style={{ background: "rgba(124,111,224,0.22)" }}>
                    <span className="font-display text-[8px] font-bold" style={{ color: "#A89EF0" }}>AI</span>
                  </div>
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.34)" }}>Suggested reply · 67% confidence</span>
                </div>
                <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.48)" }}>
                  Hi Mike, thanks for reaching out. Our standard rate limit is 300 req/min. I'd
                  recommend implementing request batching using our bulk endpoint at
                  /v2/messages/batch...
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
