import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ShinyText } from "@/components/landing/ShinyText";
import { AntigravityDots } from "@/components/landing/AntigravityDots";

const fade = { duration: 0.6, ease: [0.25, 0.4, 0, 1] as const };

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  return (
    <section ref={ref} className="relative pt-40 pb-24 sm:pt-48 sm:pb-32 overflow-hidden">
      {/* Antigravity dots background */}
      <AntigravityDots
        count={250}
        color="160, 160, 220"
        magnetRadius={140}
        particleSize={2.5}
        className="opacity-70"
      />

      {/* Subtle radial glow */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-[1080px] mx-auto px-6">
        <div className="max-w-[720px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...fade, delay: 0.05 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[13px] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI-powered helpdesk
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...fade, delay: 0.1 }}
            className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold tracking-[-0.035em] text-white leading-[1.08]"
          >
            Every customer email.
            <br />
            <ShinyText
              text="Handled."
              speed={4}
              className="text-zinc-400"
            />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...fade, delay: 0.25 }}
            className="mt-6 text-[17px] text-zinc-500 leading-[1.7] max-w-[540px] mx-auto"
          >
            Automatically read incoming emails, create tickets, generate replies, and resolve
            repetitive queries — while keeping your team in control.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...fade, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Link to={ctaLink}>
              <Button className="h-11 px-7 text-[14px] bg-white text-zinc-900 hover:bg-zinc-200 rounded-lg font-medium">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <span className="text-[14px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                See how it works
              </span>
            </a>
          </motion.div>
        </div>

        {/* Product mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...fade, delay: 0.55 }}
          className="mt-20 max-w-[780px] mx-auto"
        >
          <div className="rounded-xl border border-white/[0.08] bg-zinc-900/60 overflow-hidden shadow-2xl shadow-black/30">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
              <div className="w-2 h-2 rounded-full bg-zinc-700" />
              <div className="w-2 h-2 rounded-full bg-zinc-700" />
              <div className="w-2 h-2 rounded-full bg-zinc-700" />
              <span className="ml-3 text-[11px] text-zinc-600 font-mono">dutaly.com/inbox</span>
            </div>
            <div className="p-4 space-y-2">
              {[
                { from: "sarah@acme.co", subject: "Refund request for order #4821", status: "Auto-resolved", color: "text-emerald-500", score: "92%" },
                { from: "mike@startup.io", subject: "API rate limiting question", status: "Needs review", color: "text-amber-500", score: "67%" },
                { from: "lisa@brand.com", subject: "Update billing address", status: "Auto-resolved", color: "text-emerald-500", score: "96%" },
                { from: "dev@agency.co", subject: "Integration webhook failing", status: "Escalated", color: "text-red-500", score: "41%" },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.08, ease: [0.25, 0.4, 0, 1] as const }}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-zinc-300">{t.from}</span>
                    <p className="text-[12px] text-zinc-600 truncate">{t.subject}</p>
                  </div>
                  <span className="text-[11px] text-zinc-600 font-mono">{t.score}</span>
                  <span className={`text-[11px] font-medium ${t.color}`}>{t.status}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
