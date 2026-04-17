import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export function HeroSection() {
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  return (
    <section className="pt-36 pb-0 sm:pt-44 relative overflow-hidden" style={{ background: "#0A0A0F" }}>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 text-[12px] font-medium tracking-wide"
            style={{
              background: "rgba(124,111,224,0.15)",
              border: "1px solid rgba(124,111,224,0.3)",
              borderRadius: "9999px",
              color: "#A89EF0",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI-powered email support
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-[clamp(2.8rem,6.5vw,5.5rem)] font-semibold tracking-[-0.04em] leading-[1.05] mx-auto max-w-[900px]"
          style={{ color: "#F0EEF8" }}
        >
          Every customer email.
          <br />
          <em className="not-italic" style={{ color: "#7C6FE0" }}>Handled.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-6 text-[17px] sm:text-[19px] leading-[1.7] max-w-[560px] mx-auto"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Automatically read incoming emails, create tickets, generate replies,
          and resolve repetitive queries — while <em>keeping your team in control</em>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-10 flex items-center justify-center gap-5"
        >
          <Link to={ctaLink}>
            <Button className="h-11 px-6 text-[14px] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: "#7C6FE0", borderRadius: "6px" }}>
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a href="#how-it-works" className="text-[14px] font-medium transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
            See how it works →
          </a>
        </motion.div>
      </div>

      {/* Product screenshot mockup with glow */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-20 sm:mt-24 max-w-[1100px] mx-auto px-6 relative"
      >
        {/* Subtle glow behind screenshot */}
        <div
          className="absolute inset-0 -top-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,111,224,0.12) 0%, transparent 70%)" }}
        />

        <div className="relative rounded-t-2xl border border-b-0 overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)]" style={{ borderColor: "rgba(255,255,255,0.1)", background: "#111118" }}>
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
            <div className="flex gap-1.5">
              <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-12 py-1 rounded-md text-[11px] font-mono" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                dutaly.com/inbox
              </div>
            </div>
          </div>

          {/* Realistic inbox UI */}
          <div className="flex min-h-[420px]">
            {/* Sidebar */}
            <div className="hidden sm:block w-[200px] border-r p-3 space-y-1" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0D0D14" }}>
              <div className="px-3 py-1.5 rounded-md text-[12px] font-medium" style={{ background: "#7C6FE0", color: "white" }}>Customer Inbox</div>
              <div className="px-3 py-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>Auto-Sent</div>
              <div className="px-3 py-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>Knowledge Base</div>
              <div className="px-3 py-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>Instructions</div>
              <div className="px-3 py-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>Templates</div>
              <div className="mt-6 px-3 py-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>Settings</div>
            </div>

            {/* Ticket list */}
            <div className="flex-1 border-r" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0F0F16" }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>All Tickets</span>
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
                  className="px-4 py-3 border-b cursor-default"
                  style={{ borderColor: "rgba(255,255,255,0.04)", background: t.active ? "rgba(124,111,224,0.06)" : "transparent" }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{t.from}</span>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{t.time}</span>
                  </div>
                  <p className="text-[12px] truncate mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>{t.subject}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: t.statusColor, background: t.statusBg }}>{t.status}</span>
                    <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{t.score} confidence</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            <div className="hidden lg:block w-[340px] p-4" style={{ background: "#0F0F16" }}>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>Mike Torres</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: "#FBBF24", background: "rgba(251,191,36,0.1)" }}>Needs review</span>
                </div>
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>mike@startup.io</span>
              </div>

              <div className="text-[13px] leading-relaxed mb-6">
                <p className="mb-2 font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>API rate limiting question</p>
                <p style={{ color: "rgba(255,255,255,0.45)" }}>Hi, we've been hitting rate limits on the /v2/messages endpoint. Our integration sends about 500 requests per minute during peak hours. Can you increase our limit or suggest a batching approach?</p>
              </div>

              <div className="p-3 rounded-lg" style={{ background: "rgba(124,111,224,0.08)", border: "1px solid rgba(124,111,224,0.15)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: "rgba(124,111,224,0.2)" }}>
                    <span className="text-[8px] font-semibold" style={{ color: "#A89EF0" }}>AI</span>
                  </div>
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>Suggested reply · 67% confidence</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Hi Mike, thanks for reaching out. Our standard rate limit is 300 req/min. I'd recommend implementing request batching using our bulk endpoint at /v2/messages/batch...
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
