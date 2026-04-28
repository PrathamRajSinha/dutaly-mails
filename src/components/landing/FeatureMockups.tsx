import { AlertCircle, Clock, CheckCircle2, Search, Send, Flag, Mail, Zap, Edit, ChevronDown } from "lucide-react";

/* ── Mini mockup: Ticket list with classification badges ── */
export function ClassificationMockup() {
  const tickets = [
    { subject: "Can't access my account", from: "sarah@acme.co", category: "Bug Report", priority: "urgent", sentiment: "Frustrated", status: "open", time: "2m ago" },
    { subject: "Upgrade to Pro plan", from: "mike@startup.io", category: "Billing", priority: "medium", sentiment: "Neutral", time: "8m ago", status: "pending" },
    { subject: "API rate limiting issue", from: "dev@techcorp.com", category: "Technical", priority: "high", sentiment: "Concerned", time: "14m ago", status: "open" },
    { subject: "Love the new dashboard!", from: "jane@design.co", category: "Feedback", priority: "low", sentiment: "Positive", time: "22m ago", status: "resolved" },
  ];

  const priorityColors: Record<string, string> = {
    low: "bg-zinc-100 text-zinc-500",
    medium: "bg-blue-50 text-blue-600",
    high: "bg-orange-50 text-orange-600",
    urgent: "bg-red-50 text-red-600",
  };

  const statusDot: Record<string, string> = {
    open: "bg-blue-500",
    pending: "bg-yellow-500",
    resolved: "bg-green-500",
  };

  const categoryColors: Record<string, string> = {
    "Bug Report": "bg-red-50 text-red-600 border-red-100",
    "Billing": "bg-emerald-50 text-emerald-600 border-emerald-100",
    "Technical": "bg-violet-50 text-violet-600 border-violet-100",
    "Feedback": "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden text-left select-none pointer-events-none">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-zinc-900">Tickets</span>
          <span className="text-[11px] text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">24</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-50 rounded-md border border-zinc-200">
            <Search className="h-3 w-3 text-zinc-400" />
            <span className="text-[11px] text-zinc-400">Search...</span>
          </div>
        </div>
      </div>
      {/* Tab bar */}
      <div className="px-5 py-2 border-b border-zinc-100 flex items-center gap-1">
        {[
          { label: "All", icon: null, active: true },
          { label: "Open", icon: <AlertCircle className="h-3 w-3" />, active: false },
          { label: "Pending", icon: <Clock className="h-3 w-3" />, active: false },
          { label: "Resolved", icon: <CheckCircle2 className="h-3 w-3" />, active: false },
        ].map((tab) => (
          <div
            key={tab.label}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium ${
              tab.active ? "bg-zinc-900 text-white" : "text-zinc-500"
            }`}
          >
            {tab.icon}
            {tab.label}
          </div>
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-zinc-50">
        {tickets.map((t) => (
          <div key={t.subject} className="px-5 py-3 flex items-center gap-3 hover:bg-zinc-50/50">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[t.status]}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[12px] font-medium text-zinc-900 truncate">{t.subject}</span>
                {t.status === "open" && t.priority === "urgent" && <Flag className="h-3 w-3 text-red-500 flex-shrink-0" />}
              </div>
              <span className="text-[11px] text-zinc-400">{t.from}</span>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${categoryColors[t.category]}`}>{t.category}</span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[t.priority]}`}>{t.priority}</span>
            <span className="text-[10px] text-zinc-400 flex-shrink-0 w-12 text-right">{t.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mini mockup: AI reply editor with confidence ── */
export function ReplyMockup() {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden text-left select-none pointer-events-none">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-[13px] font-semibold text-zinc-900">Dutaly draft reply</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-100">
            <Zap className="h-3 w-3 text-green-600" />
            <span className="text-[11px] font-semibold text-green-600">92%</span>
            <span className="text-[10px] text-green-500">confidence</span>
          </div>
        </div>
      </div>
      {/* Original email */}
      <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-medium text-zinc-500">From:</span>
          <span className="text-[11px] text-zinc-700">sarah@acme.co</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Hi, I've been trying to log in but keep getting an error. Can you help me reset my password? I have an important deadline...
        </p>
      </div>
      {/* Draft reply */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Edit className="h-3 w-3 text-zinc-400" />
          <span className="text-[11px] font-medium text-zinc-500">Generated by Dutaly</span>
        </div>
        <div className="rounded-lg border border-zinc-200 p-3.5">
          <p className="text-[12px] text-zinc-700 leading-[1.7]">
            Hi Sarah,
            <br /><br />
            I understand the urgency. I've sent a password reset link to your email address. Please check your inbox (and spam folder) for the reset instructions.
            <br /><br />
            If you continue to experience issues, I'll be happy to help further.
            <br /><br />
            Best regards
          </p>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 text-white">
            <Send className="h-3 w-3" />
            <span className="text-[11px] font-medium">Send</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 text-zinc-600">
            <Edit className="h-3 w-3" />
            <span className="text-[11px] font-medium">Edit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mini mockup: Dashboard stats ── */
export function DashboardMockup() {
  const stats = [
    { label: "Emails today", value: "142", icon: <Mail className="h-3.5 w-3.5" />, change: "+12%", color: "text-blue-600 bg-blue-50" },
    { label: "Auto-resolved", value: "89", icon: <Zap className="h-3.5 w-3.5" />, change: "63%", color: "text-emerald-600 bg-emerald-50" },
    { label: "Avg response", value: "1.2m", icon: <Clock className="h-3.5 w-3.5" />, change: "-40%", color: "text-violet-600 bg-violet-50" },
    { label: "Escalated", value: "3", icon: <AlertCircle className="h-3.5 w-3.5" />, change: "2.1%", color: "text-amber-600 bg-amber-50" },
  ];

  const activity = [
    { action: "Auto-replied", subject: "Re: Billing inquiry", time: "1m ago", icon: <Send className="h-3 w-3 text-emerald-500" /> },
    { action: "Escalated", subject: "Re: API outage report", time: "4m ago", icon: <Flag className="h-3 w-3 text-red-500" /> },
    { action: "Classified", subject: "Feature request: Dark mode", time: "6m ago", icon: <CheckCircle2 className="h-3 w-3 text-blue-500" /> },
  ];

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden text-left select-none pointer-events-none">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-zinc-100">
        <span className="text-[13px] font-semibold text-zinc-900">Dashboard</span>
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-zinc-100 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <span className="text-[10px] font-medium text-emerald-600">{s.change}</span>
            </div>
            <span className="text-[18px] font-bold text-zinc-900 block">{s.value}</span>
            <span className="text-[10px] text-zinc-400">{s.label}</span>
          </div>
        ))}
      </div>
      {/* Activity */}
      <div className="px-4 pb-4">
        <span className="text-[11px] font-medium text-zinc-500 mb-2 block">Recent activity</span>
        <div className="space-y-2">
          {activity.map((a) => (
            <div key={a.subject} className="flex items-center gap-2.5 py-1.5">
              {a.icon}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-zinc-700 truncate block">{a.subject}</span>
              </div>
              <span className="text-[10px] text-zinc-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Mini mockup: Ask Me Anything chat ── */
export function AskAnythingMockup() {
  const references = [
    { from: "sarah@acme.co", subject: "Can't access my account", time: "Mar 2, 09:14" },
    { from: "dev@techcorp.com", subject: "API rate limiting issue", time: "Mar 2, 10:31" },
    { from: "mike@startup.io", subject: "Upgrade to Pro plan", time: "Mar 3, 14:02" },
  ];

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden text-left select-none pointer-events-none">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-violet-500" />
        <span className="text-[13px] font-semibold text-zinc-900">Talk to Dutaly</span>
      </div>

      {/* Chat */}
      <div className="p-4 space-y-3">
        {/* User bubble */}
        <div className="flex justify-end">
          <div className="bg-zinc-900 text-white rounded-xl rounded-br-sm px-3.5 py-2 max-w-[75%]">
            <p className="text-[11px] leading-relaxed">Dutaly, which emails need attention?</p>
          </div>
        </div>

        {/* AI bubble */}
        <div className="flex justify-start">
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%]">
            <p className="text-[11px] text-zinc-700 leading-relaxed mb-2">
              3 emails had confidence scores below 70%. These were flagged for manual review:
            </p>
            {/* References */}
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-400 mb-1">Referenced emails:</p>
              {references.map((ref) => (
                <div key={ref.subject} className="flex items-center gap-1.5 py-1 px-2 rounded-md bg-white border border-zinc-100">
                  <Mail className="h-2.5 w-2.5 text-violet-500 flex-shrink-0" />
                  <span className="text-[10px] font-medium text-violet-600 truncate">{ref.from}</span>
                  <span className="text-[10px] text-zinc-400 truncate">- {ref.subject}</span>
                  <span className="text-[9px] text-zinc-300 ml-auto flex-shrink-0">{ref.time}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">Based on 142 emails</p>
          </div>
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
        {["Dutaly, summarize today's issues", "Dutaly, list unresolved queries", "Dutaly, who's frustrated?"].map((s) => (
          <span key={s} className="text-[10px] px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-500">{s}</span>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 border border-zinc-200 rounded-lg px-3 py-2">
          <span className="text-[11px] text-zinc-400 flex-1">Ask a question about your emails...</span>
          <Send className="h-3 w-3 text-zinc-300" />
        </div>
      </div>
    </div>
  );
}
