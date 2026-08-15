import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const tickets = [
  { from: "Sarah Chen", subject: "Refund request for order #4821", status: "Auto-resolved", statusColor: "#34D399", time: "2m", score: "92%" },
  { from: "Mike Torres", subject: "API rate limiting question", status: "Needs review", statusColor: "#FBBF24", time: "8m", score: "67%", active: true },
  { from: "Lisa Wang", subject: "Update billing address", status: "Auto-resolved", statusColor: "#34D399", time: "14m", score: "96%" },
  { from: "Dev Team", subject: "Integration webhook failing", status: "Escalated", statusColor: "#F87171", time: "22m", score: "41%" },
];

export function HeroSection() {
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  return (
    <section style={{ background: "#0A0A0F" }}>
      {/* Masthead-style hero */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-28 pb-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end border-b pb-14"
          style={{ borderColor: "rgba(237,235,245,0.12)" }}
        >
          <div className="md:col-span-8">
            <span className="text-[10px] uppercase tracking-[0.22em] font-medium block mb-7" style={{ color: "#6E62C4" }}>
              01 / Autonomous email agent
            </span>
            <h1
              className="text-[clamp(2.75rem,6.5vw,6.5rem)] leading-[0.92] tracking-[-0.02em]"
              style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}
            >
              Every customer email. Handled — by <span className="italic">Dutaly.</span>
            </h1>
          </div>

          <div className="md:col-span-4 md:pl-10 md:border-l" style={{ borderColor: "rgba(237,235,245,0.12)" }}>
            <p className="text-[16px] leading-[1.75] mb-9" style={{ color: "rgba(237,235,245,0.6)" }}>
              An autonomous email agent for support teams. Dutaly connects to your support inbox,
              reads every message, answers from your knowledge base, auto-sends replies, and
              creates tickets — while keeping your team in control.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={ctaLink}>
                <button
                  className="w-full sm:w-auto whitespace-nowrap px-8 py-3 text-[13px] font-medium transition-colors"
                  style={{ background: "#EDEBF5", color: "#0A0A0F" }}
                >
                  Let Dutaly handle your inbox
                </button>
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto whitespace-nowrap px-8 py-3 text-[13px] font-medium text-center transition-colors hover:bg-[#16161E]"
                style={{ border: "1px solid rgba(237,235,245,0.2)", color: "rgba(237,235,245,0.75)" }}
              >
                See how it works →
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product artifact */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
            <p className="md:col-span-4 text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgba(237,235,245,0.35)" }}>
              Fig. 01 — Customer Inbox
            </p>
            <p className="md:col-span-8 text-[14px] leading-relaxed" style={{ color: "rgba(237,235,245,0.55)" }}>
              See Dutaly in action: routine emails auto-resolved, edge cases flagged for review,
              complex issues escalated with context.
            </p>
          </div>

          <div className="relative overflow-hidden" style={{ background: "#16161E", border: "1px solid rgba(237,235,245,0.1)" }}>
            <div className="px-5 py-3.5 flex items-center gap-4 border-b" style={{ borderColor: "rgba(237,235,245,0.08)" }}>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "rgba(237,235,245,0.2)" }} />
                <div className="w-2 h-2 rounded-full" style={{ background: "rgba(237,235,245,0.2)" }} />
                <div className="w-2 h-2 rounded-full" style={{ background: "rgba(237,235,245,0.2)" }} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(237,235,245,0.4)" }}>
                dutaly.com/inbox — agent active
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Ticket list */}
              <div className="lg:col-span-7 lg:border-r" style={{ borderColor: "rgba(237,235,245,0.08)" }}>
                <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(237,235,245,0.08)" }}>
                  <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(237,235,245,0.45)" }}>All tickets</span>
                  <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(237,235,245,0.3)" }}>4 open</span>
                </div>
                {tickets.map((t) => (
                  <div
                    key={t.from}
                    className="px-6 py-5 border-b"
                    style={{ borderColor: "rgba(237,235,245,0.06)", background: t.active ? "rgba(110,98,196,0.06)" : "transparent" }}
                  >
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[15px]" style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}>{t.from}</span>
                      <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(237,235,245,0.3)" }}>{t.time}</span>
                    </div>
                    <p className="text-[13px] mb-2.5" style={{ color: "rgba(237,235,245,0.5)" }}>{t.subject}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: t.statusColor }}>{t.status}</span>
                      <span className="h-px w-4" style={{ background: "rgba(237,235,245,0.15)" }} />
                      <span className="text-[10px] tracking-[0.1em]" style={{ color: "rgba(237,235,245,0.3)" }}>{t.score} confidence</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detail */}
              <div className="lg:col-span-5 p-6">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[17px]" style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}>Mike Torres</span>
                  <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: "#FBBF24" }}>Needs review</span>
                </div>
                <p className="text-[11px] mb-6" style={{ color: "rgba(237,235,245,0.35)" }}>mike@startup.io</p>

                <p className="text-[14px] mb-3" style={{ fontFamily: "Lora, serif", color: "rgba(237,235,245,0.9)" }}>
                  API rate limiting question
                </p>
                <p className="text-[13px] leading-[1.75] mb-8" style={{ color: "rgba(237,235,245,0.5)" }}>
                  Hi, we've been hitting rate limits on the /v2/messages endpoint. Our integration
                  sends about 500 requests per minute during peak hours. Can you increase our limit
                  or suggest a batching approach?
                </p>

                <div className="p-5" style={{ background: "rgba(10,10,15,0.5)", border: "1px solid rgba(110,98,196,0.25)" }}>
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#6E62C4" }}>AI suggested reply</span>
                    <span className="text-[10px] tracking-[0.1em]" style={{ color: "rgba(237,235,245,0.3)" }}>67% confidence</span>
                  </div>
                  <p className="text-[13px] leading-[1.75]" style={{ color: "rgba(237,235,245,0.55)" }}>
                    Hi Mike, thanks for reaching out. Our standard rate limit is 300 req/min. I'd
                    recommend implementing request batching using our bulk endpoint at
                    /v2/messages/batch…
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
