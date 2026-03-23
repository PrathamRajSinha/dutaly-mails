import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function HeroSection() {
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  return (
    <section className="pt-32 pb-0 sm:pt-40">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Left-aligned massive headline — Linear style */}
        <h1 className="text-[clamp(2.8rem,6vw,5rem)] font-semibold tracking-[-0.04em] text-white leading-[1.05] max-w-[800px]">
          Every customer email.
          <br />
          <span className="text-zinc-400">Handled.</span>
        </h1>

        <p className="mt-6 text-[18px] text-zinc-400 leading-[1.7] max-w-[520px]">
          Automatically read incoming emails, create tickets, generate replies,
          and resolve repetitive queries — while keeping your team in control.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <Link to={ctaLink}>
            <Button className="h-10 px-5 text-[13px] bg-white text-black hover:bg-zinc-200 rounded-md font-medium">
              Start free trial
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
          <a href="#how-it-works" className="text-[13px] text-zinc-400 hover:text-white transition-colors">
            See how it works →
          </a>
        </div>
      </div>

      {/* Full-width product screenshot */}
      <div className="mt-16 sm:mt-20 max-w-[1200px] mx-auto px-6">
        <div className="rounded-t-xl border border-b-0 border-white/[0.08] bg-[#111113] overflow-hidden shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)]">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0F0F11]">
            <div className="flex gap-1.5">
              <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-12 py-1 rounded-md bg-white/[0.06] text-[11px] text-zinc-400 font-mono">
                dutaly.com/inbox
              </div>
            </div>
          </div>

          {/* Realistic inbox UI */}
          <div className="flex min-h-[420px]">
            {/* Sidebar */}
            <div className="hidden sm:block w-[200px] border-r border-white/[0.06] p-3 space-y-1">
              <div className="px-3 py-1.5 rounded-md bg-white/[0.06] text-[12px] text-white font-medium">Customer Inbox</div>
              <div className="px-3 py-1.5 text-[12px] text-zinc-400">Auto-Sent</div>
              <div className="px-3 py-1.5 text-[12px] text-zinc-400">Knowledge Base</div>
              <div className="px-3 py-1.5 text-[12px] text-zinc-400">Instructions</div>
              <div className="px-3 py-1.5 text-[12px] text-zinc-400">Templates</div>
              <div className="mt-6 px-3 py-1.5 text-[12px] text-zinc-400">Settings</div>
            </div>

            {/* Ticket list */}
            <div className="flex-1 border-r border-white/[0.06]">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-[12px] font-medium text-zinc-400">All Tickets</span>
                <span className="text-[11px] text-zinc-400">4 open</span>
              </div>
              {[
                { from: "Sarah Chen", email: "sarah@acme.co", subject: "Refund request for order #4821", status: "Auto-resolved", statusBg: "bg-emerald-500/10 text-emerald-400", time: "2m", score: "92%" },
                { from: "Mike Torres", email: "mike@startup.io", subject: "API rate limiting question", status: "Needs review", statusBg: "bg-amber-500/10 text-amber-400", time: "8m", score: "67%", active: true },
                { from: "Lisa Wang", email: "lisa@brand.com", subject: "Update billing address", status: "Auto-resolved", statusBg: "bg-emerald-500/10 text-emerald-400", time: "14m", score: "96%" },
                { from: "Dev Team", email: "dev@agency.co", subject: "Integration webhook failing", status: "Escalated", statusBg: "bg-red-500/10 text-red-400", time: "22m", score: "41%" },
              ].map((t, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 border-b border-white/[0.04] cursor-default ${t.active ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[13px] font-medium text-zinc-300">{t.from}</span>
                    <span className="text-[10px] text-zinc-400">{t.time}</span>
                  </div>
                  <p className="text-[12px] text-zinc-400 truncate mb-1.5">{t.subject}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${t.statusBg}`}>{t.status}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{t.score} confidence</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            <div className="hidden lg:block w-[340px] p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] font-medium text-white">Mike Torres</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Needs review</span>
                </div>
                <span className="text-[11px] text-zinc-400">mike@startup.io</span>
              </div>

              <div className="text-[13px] text-zinc-400 leading-relaxed mb-6">
                <p className="mb-2 text-zinc-300 font-medium">API rate limiting question</p>
                <p>Hi, we've been hitting rate limits on the /v2/messages endpoint. Our integration sends about 500 requests per minute during peak hours. Can you increase our limit or suggest a batching approach?</p>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded bg-indigo-500/20 flex items-center justify-center">
                    <span className="text-[8px] text-indigo-400">AI</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">Suggested reply · 67% confidence</span>
                </div>
                <p className="text-[12px] text-zinc-400 leading-relaxed">
                  Hi Mike, thanks for reaching out. Our standard rate limit is 300 req/min. I'd recommend implementing request batching using our bulk endpoint at /v2/messages/batch...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
