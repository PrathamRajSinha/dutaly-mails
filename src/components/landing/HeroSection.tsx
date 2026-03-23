import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Inbox, CheckCircle2, Clock, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const floatingCards = [
  { icon: Inbox, label: "New ticket created", detail: "Billing inquiry · High", x: -60, y: 80, delay: 0.8 },
  { icon: CheckCircle2, label: "Auto-resolved", detail: "Shipping status · 94%", x: 50, y: 160, delay: 1.0 },
  { icon: Clock, label: "SLA tracked", detail: "2h 14m remaining", x: -40, y: 240, delay: 1.2 },
  { icon: Zap, label: "Reply sent", detail: "Return request · Approved", x: 60, y: 320, delay: 1.4 },
];

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={ref} className="relative pt-36 pb-24 sm:pt-44 sm:pb-32 overflow-hidden">
      {/* Animated gradient background with parallax */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900" />
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-indigo-500/[0.05] rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-[100px] right-[10%] w-[400px] h-[400px] bg-violet-500/[0.03] rounded-full blur-[120px]" />
      </motion.div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.25, 0.4, 0, 1] }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[13px] font-medium text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI-powered customer support
            </span>
          </motion.div>

          {/* Headline — staggered word animation */}
          <motion.h1
            className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold tracking-[-0.035em] text-white leading-[1.05]"
          >
            {"Every customer email.".split(" ").map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.25, 0.4, 0, 1] }}
                className="inline-block mr-[0.3em]"
              >
                {word}
              </motion.span>
            ))}
            <br />
            {"Handled.".split(" ").map((word, i) => (
              <motion.span
                key={`b-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: [0.25, 0.4, 0, 1] }}
                className="inline-block mr-[0.3em] bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.4, 0, 1] }}
            className="mt-7 text-[17px] sm:text-lg text-zinc-400 max-w-[580px] mx-auto leading-[1.7]"
          >
            Automatically read incoming emails, turn them into structured tickets, 
            generate replies, and resolve repetitive queries — all while keeping your 
            team in control.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.65, ease: [0.25, 0.4, 0, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to={ctaLink}>
              <Button className="h-11 px-7 text-[14px] bg-white text-zinc-900 hover:bg-zinc-200 rounded-full font-semibold shadow-lg shadow-white/[0.06] transition-all duration-300">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="ghost" className="h-11 px-7 text-[14px] text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-full transition-all duration-300">
                See how it works
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Floating UI cards — product mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.8, ease: [0.25, 0.4, 0, 1] }}
          className="mt-20 sm:mt-24 relative max-w-[800px] mx-auto"
        >
          {/* Main mock panel */}
          <div className="relative rounded-2xl border border-white/[0.08] bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-zinc-800/60 text-[11px] text-zinc-500 font-mono">
                  dyuticai.com/inbox
                </div>
              </div>
            </div>

            {/* Mock ticket list */}
            <div className="p-5 space-y-3">
              {[
                { from: "sarah@acme.co", subject: "Refund request for order #4821", status: "Auto-resolved", statusColor: "text-emerald-400", confidence: "92%", time: "2m ago" },
                { from: "mike@startup.io", subject: "API rate limiting question", status: "Needs review", statusColor: "text-amber-400", confidence: "67%", time: "8m ago" },
                { from: "lisa@brand.com", subject: "Update billing address", status: "Auto-resolved", statusColor: "text-emerald-400", confidence: "96%", time: "14m ago" },
                { from: "dev@agency.co", subject: "Integration webhook failing", status: "Escalated", statusColor: "text-red-400", confidence: "41%", time: "22m ago" },
              ].map((ticket, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 1.0 + i * 0.1 }}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl bg-zinc-800/40 border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-zinc-300 truncate">{ticket.from}</span>
                      <span className="text-[11px] text-zinc-600">{ticket.time}</span>
                    </div>
                    <p className="text-[12px] text-zinc-500 truncate mt-0.5">{ticket.subject}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] font-mono text-zinc-500">{ticket.confidence}</span>
                    <span className={`text-[11px] font-medium ${ticket.statusColor}`}>{ticket.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Decorative glow */}
          <div className="absolute -inset-6 bg-gradient-to-b from-indigo-500/[0.06] via-transparent to-transparent rounded-3xl blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
