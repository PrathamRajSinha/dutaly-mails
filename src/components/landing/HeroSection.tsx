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
        <h1 className="text-[clamp(2.8rem,6vw,5rem)] font-semibold tracking-[-0.04em] text-zinc-900 leading-[1.05] max-w-[800px]">
          Every customer email.
          <br />
          <span className="text-zinc-400">Handled.</span>
        </h1>

        <p className="mt-6 text-[18px] text-zinc-500 leading-[1.7] max-w-[520px]">
          Automatically read incoming emails, create tickets, generate replies,
          and resolve repetitive queries — while keeping your team in control.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <Link to={ctaLink}>
            <Button className="h-10 px-5 text-[13px] bg-zinc-900 text-white hover:bg-zinc-800 rounded-md font-medium">
              Start free trial
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
          <a href="#how-it-works" className="text-[13px] text-zinc-500 hover:text-zinc-900 transition-colors">
            See how it works →
          </a>
        </div>
      </div>

      {/* Product screenshot mockup */}
      <div className="mt-16 sm:mt-20 max-w-[1200px] mx-auto px-6">
        <div className="rounded-t-xl border border-b-0 border-zinc-200 bg-zinc-50 overflow-hidden shadow-[0_4px_40px_-12px_rgba(0,0,0,0.1)]">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 bg-zinc-100">
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

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
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
      </div>
    </section>
  );
}
