import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { ShinyText } from "./ShinyText";
import { AntigravityDots } from "./AntigravityDots";
import { StarBorder } from "./StarBorder";

const benefits = [
  "Automatically convert emails into tickets",
  "Detect urgency and sentiment instantly",
  "Track SLAs and escalations in real time",
];

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <>
      <style>{`@keyframes gradient-shift { 0%, 100% { background-position: 0% center; } 50% { background-position: 100% center; } }`}</style>
      <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <AntigravityDots count={250} magnetRadius={140} particleSize={1.8} color="180, 180, 255" />

      <motion.div
        animate={{ x: [0, 60, -40, 20, 0], y: [0, -50, 30, -20, 0], scale: [1, 1.2, 0.9, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px]"
      />
      <motion.div
        animate={{ x: [0, -50, 40, -30, 0], y: [0, 40, -60, 20, 0], scale: [1, 0.9, 1.15, 0.95, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]"
      />
      <motion.div
        animate={{ x: [0, 30, -50, 40, 0], y: [0, -30, 50, -40, 0], scale: [1, 1.1, 0.85, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]"
      />

      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

      <motion.div style={{ opacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-8"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          AI-Powered Customer Inbox
        </motion.div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0, 1] }}
            className="block text-white"
          >
            AI Helpdesk for
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.4, 0, 1] }}
            className="block"
          >
            <ShinyText
              text="Modern Teams"
              speed={3}
              className="bg-[length:200%_auto] animate-[gradient-shift_4s_ease-in-out_infinite] bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
            />
          </motion.span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          Turn customer emails into structured tickets, respond with AI-powered precision, 
          and manage support with clarity — all inside your inbox.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/auth">
            <StarBorder color="hsl(239, 84%, 67%)" speed="5s" thickness={2}>
              <Button className="h-12 px-8 text-base bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 rounded-2xl shadow-lg shadow-indigo-500/25 transition-shadow hover:shadow-xl hover:shadow-indigo-500/30">
                Start Managing Support Smarter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </StarBorder>
          </Link>
          <a href="#demo">
            <Button variant="ghost" className="h-12 px-8 text-base text-zinc-300 hover:text-white hover:bg-white/5 rounded-2xl border border-white/10">
              See How It Works
            </Button>
          </a>
        </motion.div>

        {/* Benefit bullets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          {benefits.map((b, i) => (
            <motion.div
              key={b}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 1.0 + i * 0.1 }}
              className="flex items-center gap-2 text-sm text-zinc-400"
            >
              <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
              {b}
            </motion.div>
          ))}
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.3, ease: [0.25, 0.4, 0, 1] }}
          className="mt-16 relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
          <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
              <span className="ml-3 text-xs text-zinc-500">dyuticAI — Customer Inbox</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400">JD</div>
                <div className="flex-1">
                  <div className="h-3 w-48 bg-white/10 rounded" />
                  <div className="h-2 w-32 bg-white/5 rounded mt-1.5" />
                </div>
                <div className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  Ticket Created
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs text-purple-400">SM</div>
                <div className="flex-1">
                  <div className="h-3 w-56 bg-white/10 rounded" />
                  <div className="h-2 w-40 bg-white/5 rounded mt-1.5" />
                </div>
                <div className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  SLA Tracked
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-xs text-red-400">AK</div>
                <div className="flex-1">
                  <div className="h-3 w-44 bg-white/10 rounded" />
                  <div className="h-2 w-28 bg-white/5 rounded mt-1.5" />
                </div>
                <div className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  Escalated
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
    </>
  );
}
