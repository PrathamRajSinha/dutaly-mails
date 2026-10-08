import { ArrowRight, BookOpen, Mail, ShieldCheck } from "lucide-react";
const steps = [
  { number: "I", icon: Mail, title: "Connect your inbox", text: "Bring your Gmail or IMAP inbox into Dutaly. Keep using the email address your customers already know." },
  { number: "II", icon: BookOpen, title: "Make it your own", text: "Add your business knowledge and set the rules. Your policies, tone, and templates shape every answer." },
  { number: "III", icon: ShieldCheck, title: "Stay in control", text: "Let confident replies go out automatically, review drafts, and take over when a conversation needs you." },
];
export function InteractiveDemoSection() {
  return <section id="how-it-works" className="landing-band scroll-mt-20 bg-landing-surface"><div className="landing-wrap">
    <p className="landing-label mb-8"><span>03</span> How it works</p>
    <h2 className="landing-title mb-14">Your inbox. Your expertise.<br /><em>A quieter working day.</em></h2>
    <div className="grid gap-10 md:grid-cols-3">{steps.map((step, index) => <div key={step.number} className="border-t border-landing-line pt-6"><div className="mb-8 flex items-center justify-between"><span className="font-display text-xl text-landing-accent">{step.number}</span>{index < 2 ? <ArrowRight className="h-5 w-5 text-landing-muted" /> : <ShieldCheck className="h-5 w-5 text-landing-muted" />}</div><step.icon className="mb-5 h-6 w-6 text-landing-muted" /><h3 className="text-[26px]">{step.title}</h3><p className="mt-4 max-w-[350px] text-[15px] leading-[1.8] text-landing-muted">{step.text}</p></div>)}</div>
  </div></section>;
}
