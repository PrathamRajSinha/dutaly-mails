import { BookOpen, MessageSquare, SlidersHorizontal, Tags } from "lucide-react";
const features = [
  { icon: Tags, number: "01", title: "Less sorting. More solving.", text: "Turn incoming email into organized conversations. Topic labels, sentiment, and priorities put the messages that matter within reach." },
  { icon: BookOpen, number: "02", title: "Your knowledge, not guesswork.", text: "Add your policies, upload documents, or talk your knowledge base into shape. Dutaly grounds support answers in the information you provide." },
  { icon: MessageSquare, number: "03", title: "An agent you can talk to.", text: "Find a conversation, draft an email, or use a saved template. Inbox Intelligence prepares the message for you to review and send." },
  { icon: SlidersHorizontal, number: "04", title: "Automation on your terms.", text: "Choose your tone, set confidence thresholds, and require approval where it matters. Sensitive conversations stay in human hands." },
];
export function FeaturesSection() {
  return <section id="features" className="landing-band scroll-mt-20"><div className="landing-wrap">
    <p className="landing-label mb-8"><span>02</span> Built around your work</p>
    <div className="mb-14 grid gap-6 lg:grid-cols-[1.4fr_1fr]"><h2 className="landing-title max-w-[650px]">A thoughtful answer.<br />Not another task.</h2><p className="max-w-[420px] self-end text-base leading-[1.8] text-landing-muted lg:justify-self-end">From the first question to the final reply, everything belongs in one connected flow.</p></div>
    <div className="grid gap-x-16 md:grid-cols-2">{features.map(feature => <div className="landing-feature" key={feature.number}><div className="flex items-center justify-between"><feature.icon className="h-5 w-5 text-landing-accent" /><span className="text-xs text-landing-muted">{feature.number}</span></div><h3>{feature.title}</h3><p>{feature.text}</p></div>)}</div>
  </div></section>;
}
