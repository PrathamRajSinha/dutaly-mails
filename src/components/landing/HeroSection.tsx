import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const words = ["Stop reading.", "Start replying.", "Automatically."];

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { once: true } as IntersectionObserverInit
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Pure CSS animated blobs — no JS, no re-renders */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] animate-[blob1_20s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-[blob2_25s_ease-in-out_infinite]" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] animate-[blob3_18s_ease-in-out_infinite]" />

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

      <div className={`relative z-10 max-w-5xl mx-auto px-6 text-center transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-8 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          AI-Powered Email Assistant
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
          {words.map((word, i) => (
            <span
              key={i}
              className={`block transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${i === 2 ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent" : "text-white"}`}
              style={{ transitionDelay: `${200 + i * 150}ms` }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          style={{ transitionDelay: "700ms" }}
        >
          MailReplAI reads your emails, understands context from your knowledge base, 
          and drafts perfect replies — so you can focus on what matters.
        </p>

        {/* CTAs */}
        <div
          className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          style={{ transitionDelay: "900ms" }}
        >
          <Link to="/auth">
            <Button className="h-12 px-8 text-base bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 rounded-2xl shadow-lg shadow-indigo-500/25 transition-shadow hover:shadow-xl hover:shadow-indigo-500/30">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a href="#demo">
            <Button variant="ghost" className="h-12 px-8 text-base text-zinc-300 hover:text-white hover:bg-white/5 rounded-2xl border border-white/10">
              See it in action
            </Button>
          </a>
        </div>

        {/* Product card */}
        <div
          className={`mt-16 relative group transition-all duration-800 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
          style={{ transitionDelay: "1100ms" }}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
          <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
              <span className="ml-3 text-xs text-zinc-500">MailReplAI Dashboard</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400">JD</div>
                <div className="flex-1">
                  <div className="h-3 w-48 bg-white/10 rounded" />
                  <div className="h-2 w-32 bg-white/5 rounded mt-1.5" />
                </div>
                <div className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  Auto-replied
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs text-purple-400">SM</div>
                <div className="flex-1">
                  <div className="h-3 w-56 bg-white/10 rounded" />
                  <div className="h-2 w-40 bg-white/5 rounded mt-1.5" />
                </div>
                <div className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  Review
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xs text-cyan-400">AK</div>
                <div className="flex-1">
                  <div className="h-3 w-44 bg-white/10 rounded" />
                  <div className="h-2 w-28 bg-white/5 rounded mt-1.5" />
                </div>
                <div className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  Auto-replied
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
