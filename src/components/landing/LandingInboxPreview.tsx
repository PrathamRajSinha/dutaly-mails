import { useState } from "react";
import { BookOpen, Check, ChevronRight, Inbox, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const examples = [
  { name: "Sarah Chen", initials: "SC", subject: "What is your return policy?", label: "Returns", status: "Auto-replied", kind: "success", time: "2m", message: "Hi, I ordered a jacket last week. Can I return it if the size isn't right?", reply: "Hi Sarah, of course. You can return unworn items within 30 days of delivery. Keep the original tags attached and contact us with your order number to start your return.", source: "Returns policy", explanation: "Answer found in the knowledge base. Confidence is above your auto-send threshold." },
  { name: "Alex Morgan", initials: "AM", subject: "Can we change our subscription?", label: "Billing", status: "Needs review", kind: "warning", time: "8m", message: "Hello, we're considering a different plan. Can you help us work out which one is right for our business?", reply: "Hi Alex, happy to help you find the right plan. Could you share how many inboxes you need and your approximate monthly email volume?", source: "Subscription FAQ", explanation: "Dutaly has prepared a reply. You review it before anything is sent." },
  { name: "Jamie Lee", initials: "JL", subject: "I still haven't received an answer", label: "Complaint", status: "Escalated", kind: "danger", time: "14m", message: "This is my third email about the same problem. I'm really frustrated that nobody has helped me yet.", reply: "No automatic reply sent. This conversation needs your attention.", source: "Sentiment safeguard", explanation: "Frustrated customer detected. Automatic replies are paused for this conversation." },
] as const;

export function LandingInboxPreview() {
  const [selected, setSelected] = useState(0);
  const current = examples[selected] ?? examples[0];
  return (
    <div className="landing-inbox" aria-label="Interactive example inbox">
      <div className="landing-inbox-top"><span className="flex items-center gap-2"><Inbox className="h-4 w-4" /> Dutaly / Customer inbox</span><span className="text-landing-muted text-xs">Example inbox</span></div>
      <div className="grid md:grid-cols-[180px_1fr] lg:grid-cols-[180px_340px_1fr]">
        <aside className="hidden border-r border-landing-line p-5 md:block">
          <div className="mb-8 text-lg font-medium">dutaly<span className="text-landing-accent">.</span></div>
          <div className="landing-nav-active"><Inbox className="h-4 w-4" /> Inbox <span className="ml-auto">3</span></div>
          <div className="landing-demo-nav"><MessageSquare className="h-4 w-4" /> Intelligence</div>
          <div className="landing-demo-nav"><BookOpen className="h-4 w-4" /> Knowledge base</div>
          <div className="landing-demo-nav"><ShieldCheck className="h-4 w-4" /> Instructions</div>
          <div className="mt-16 border-t border-landing-line pt-4 text-xs text-landing-muted">Connected inbox<br /><span className="mt-2 block text-landing-foreground">support@example.com</span></div>
        </aside>
        <div className="border-b border-landing-line lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 py-4 text-sm font-medium">All emails <span className="text-xs font-normal text-landing-muted">3 conversations</span></div>
          {examples.map((email, index) => <Button key={email.name} variant="ghost" onClick={() => setSelected(index)} aria-pressed={selected === index} className={`landing-email-row ${selected === index ? "is-selected" : ""}`}>
            <span className="flex w-full items-center justify-between gap-3"><span className="font-medium">{email.name}</span><span className="text-xs text-landing-muted">{email.time}</span></span>
            <span className="w-full truncate text-left text-sm text-landing-muted">{email.subject}</span>
            <span className="flex w-full items-center gap-3 text-xs"><span className={`landing-status ${email.kind}`}>{email.status}</span><span className="text-landing-muted">{email.label}</span></span>
          </Button>)}
        </div>
        <div className="p-6 md:col-start-2 lg:col-start-auto">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-landing-raised text-xs">{current.initials}</div><div><p className="text-sm font-medium">{current.name}</p><p className="text-xs text-landing-muted">To support@example.com</p></div></div>
          <h3 className="landing-ui mt-5 text-base font-medium">{current.subject}</h3>
          <p className="mt-3 min-h-[70px] text-sm leading-relaxed text-landing-muted">{current.message}</p>
          <div className="mt-5 border-t border-landing-line pt-5">
            <div className="flex items-center justify-between gap-2 text-xs"><span className="flex items-center gap-2 text-landing-accent"><Sparkles className="h-3.5 w-3.5" /> {current.kind === "danger" ? "Human attention needed" : "Dutaly reply"}</span><span className={`landing-status ${current.kind}`}>{current.status}</span></div>
            <p className="mt-4 min-h-[96px] text-sm leading-relaxed">{current.reply}</p>
            <div className="mt-4 flex items-center gap-2 border-t border-landing-line pt-3 text-xs text-landing-muted"><BookOpen className="h-3.5 w-3.5" /> {current.source} <Check className="ml-auto h-3.5 w-3.5 text-landing-success" /></div>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-3 border-t border-landing-line px-5 py-4 text-xs leading-relaxed text-landing-muted"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-landing-accent" /><p className="flex-1">{current.explanation}</p><ChevronRight className="h-4 w-4 shrink-0" /></div>
    </div>
  );
}
