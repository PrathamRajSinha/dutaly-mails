export function FeaturesSection() {
  const features = [
    { title: "Automatic classification", text: "Every email is categorized by intent, urgency, and sentiment — before anyone opens it." },
    { title: "Smart reply generation", text: "AI drafts accurate replies using your knowledge base. Review, edit, or let confident ones send automatically." },
    { title: "Structured ticket tracking", text: "Each email becomes a trackable ticket with status, priority, SLA deadlines, and full history." },
    { title: "Intelligent escalation", text: "Low-confidence replies and angry customers are flagged instantly. Nothing slips through." },
    { title: "Automation with control", text: "Set confidence thresholds per category. Define exactly when AI acts and when it defers to you." },
    { title: "Slack integration", text: "Get notified in Slack when tickets need attention. Keep your team in the loop without switching tabs." },
  ];

  return (
    <section id="features" className="py-24 sm:py-32 border-t border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-500 mb-4">Features</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-white leading-[1.1] max-w-[500px]">
            A smarter way to handle customer emails.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-12">
          {features.map((f) => (
            <div key={f.title}>
              <h3 className="text-[15px] font-medium text-white mb-2">{f.title}</h3>
              <p className="text-[14px] text-zinc-500 leading-[1.7]">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
