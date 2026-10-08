import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const cases = [
  { tab: "E-commerce", title: "The everyday questions, answered.", text: "Returns, product questions, and shipping policies don't need to start from scratch every time. Give customers answers from your own knowledge base.", bullets: ["Consistent answers from your store policies", "Branded replies with your saved templates", "Human review for sensitive complaints"] },
  { tab: "Software & SaaS", title: "Support that knows your product.", text: "Keep account questions, billing conversations, and technical issues organized. Routine answers come from your docs; the difficult questions come to you.", bullets: ["Topic labels for bugs, billing, and account help", "Confidence controls for different categories", "Slack alerts for conversations that matter"] },
  { tab: "Agencies", title: "Many inboxes. One place to focus.", text: "Keep connected inboxes in view without losing the context of each conversation. Find client emails, refine your draft, and reply in your own voice.", bullets: ["Unified and individual account views", "Ask Inbox Intelligence to find conversations", "Improve drafts without losing your intent"] },
];
export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const current = cases[active] ?? cases[0];
  return <section id="use-cases" className="landing-band scroll-mt-20"><div className="landing-wrap"><p className="landing-label mb-8"><span>04</span> A place in your business</p><h2 className="landing-title">Different businesses.<br />The same need to be heard.</h2>
    <div role="tablist" aria-label="Business types" className="mt-10 flex border-b border-landing-line">{cases.map((item, index) => <Button key={item.tab} id={`use-case-tab-${index}`} role="tab" aria-selected={active === index} aria-controls="use-case-panel" variant="ghost" className="landing-tab" onClick={() => setActive(index)} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); const next = (active + (event.key === "ArrowRight" ? 1 : -1) + cases.length) % cases.length; setActive(next); document.getElementById(`use-case-tab-${next}`)?.focus(); } }}>{item.tab}</Button>)}</div>
    <div id="use-case-panel" role="tabpanel" aria-labelledby={`use-case-tab-${active}`} className="grid gap-10 pt-10 md:grid-cols-2"><div><h3 className="text-[30px]">{current.title}</h3><p className="mt-5 max-w-[520px] text-base leading-[1.8] text-landing-muted">{current.text}</p><Button asChild variant="link" className="mt-5 px-0 text-landing-accent"><Link to="/pricing">Find your plan<ArrowRight /></Link></Button></div><ul className="space-y-0">{current.bullets.map(bullet => <li key={bullet} className="flex items-start gap-4 border-b border-landing-line py-5 text-[15px]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-landing-success" />{bullet}</li>)}</ul></div>
  </div></section>;
}
