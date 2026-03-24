import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function TypedWord({ word, delay = 0.6 }: { word: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!isInView) return;
    let i = 0;
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(word.slice(0, i));
        if (i >= word.length) {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 800);
        }
      }, 150);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(startTimeout);
  }, [isInView, word, delay]);

  return (
    <span ref={ref} className="bg-gradient-to-r from-zinc-400 to-zinc-500 bg-clip-text text-transparent">
      {displayed}
      {showCursor && isInView && (
        <span className="inline-block w-[3px] h-[0.85em] bg-zinc-400 ml-0.5 align-baseline animate-pulse" />
      )}
    </span>
  );
}

export function HeroSection() {
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  return (
    <section className="pt-36 pb-0 sm:pt-44 relative overflow-hidden">
      {/* Subtle radial gradient behind hero */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-zinc-100/80 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-[12px] font-medium text-zinc-500 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI-powered email support
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-[clamp(2.8rem,6.5vw,5.5rem)] font-semibold tracking-[-0.04em] text-zinc-900 leading-[1.05] mx-auto max-w-[900px]"
        >
          Every customer email.
          <br />
          <TypedWord word="Handled." delay={1.2} />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-6 text-[17px] sm:text-[19px] text-zinc-500 leading-[1.7] max-w-[560px] mx-auto"
        >
          Automatically read incoming emails, create tickets, generate replies,
          and resolve repetitive queries — while keeping your team in control.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-10 flex items-center justify-center gap-5"
        >
          <Link to={ctaLink}>
            <Button className="h-11 px-6 text-[14px] bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a href="#how-it-works" className="text-[14px] text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
            See how it works →
          </a>
        </motion.div>
      </div>

      {/* Product screenshot mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-20 sm:mt-24 max-w-[1100px] mx-auto px-6"
      >
        <div className="rounded-t-2xl border border-b-0 border-zinc-200 bg-zinc-50 overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.2)]">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 bg-zinc-100/80">
            <div className="flex gap-1.5">
              <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-12 py-1 rounded-md bg-white text-[11px] text-zinc-400 font-mono border border-zinc-200">
                dutaly.com/inbox
              </div>
            </div>
          </div>

          {/* Realistic inbox UI */}
          <div className="flex min-h-[420px]">
            {/* Sidebar */}
            <div className="hidden sm:block w-[200px] border-r border-zinc-200 p-3 space-y-1 bg-zinc-50">
              <div className="px-3 py-1.5 rounded-md bg-zinc-900 text-[12px] text-white font-medium">Customer Inbox</div>
              <div className="px-3 py-1.5 text-[12px] text-zinc-500">Auto-Sent</div>
              <div className="px-3 py-1.5 text-[12px] text-zinc-500">Knowledge Base</div>
              <div className="px-3 py-1.5 text-[12px] text-zinc-500">Instructions</div>
              <div className="px-3 py-1.5 text-[12px] text-zinc-500">Templates</div>
              <div className="mt-6 px-3 py-1.5 text-[12px] text-zinc-500">Settings</div>
            </div>

            {/* Ticket list */}
            <div className="flex-1 border-r border-zinc-200 bg-white">
              <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
                <span className="text-[12px] font-medium text-zinc-600">All Tickets</span>
                <span className="text-[11px] text-zinc-400">4 open</span>
              </div>
              {[
                { from: "Sarah Chen", subject: "Refund request for order #4821", status: "Auto-resolved", statusBg: "bg-emerald-50 text-emerald-600", time: "2m", score: "92%" },
                { from: "Mike Torres", subject: "API rate limiting question", status: "Needs review", statusBg: "bg-amber-50 text-amber-600", time: "8m", score: "67%", active: true },
                { from: "Lisa Wang", subject: "Update billing address", status: "Auto-resolved", statusBg: "bg-emerald-50 text-emerald-600", time: "14m", score: "96%" },
                { from: "Dev Team", subject: "Integration webhook failing", status: "Escalated", statusBg: "bg-red-50 text-red-600", time: "22m", score: "41%" },
              ].map((t, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 border-b border-zinc-100 cursor-default ${t.active ? "bg-zinc-50" : "hover:bg-zinc-50/50"}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[13px] font-medium text-zinc-800">{t.from}</span>
                    <span className="text-[10px] text-zinc-400">{t.time}</span>
                  </div>
                  <p className="text-[12px] text-zinc-500 truncate mb-1.5">{t.subject}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${t.statusBg}`}>{t.status}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{t.score} confidence</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            <div className="hidden lg:block w-[340px] p-4 bg-white">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] font-medium text-zinc-900">Mike Torres</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">Needs review</span>
                </div>
                <span className="text-[11px] text-zinc-400">mike@startup.io</span>
              </div>

              <div className="text-[13px] text-zinc-500 leading-relaxed mb-6">
                <p className="mb-2 text-zinc-800 font-medium">API rate limiting question</p>
                <p>Hi, we've been hitting rate limits on the /v2/messages endpoint. Our integration sends about 500 requests per minute during peak hours. Can you increase our limit or suggest a batching approach?</p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded bg-indigo-100 flex items-center justify-center">
                    <span className="text-[8px] text-indigo-600 font-semibold">AI</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">Suggested reply · 67% confidence</span>
                </div>
                <p className="text-[12px] text-zinc-500 leading-relaxed">
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
