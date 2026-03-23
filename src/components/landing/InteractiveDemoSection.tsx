export function InteractiveDemoSection() {
  const steps = [
    { num: "01", title: "Email received", text: "A customer sends an email to your connected inbox." },
    { num: "02", title: "AI understands it", text: "Intent, sentiment, and category are detected automatically." },
    { num: "03", title: "Ticket created", text: "A structured ticket is created with priority and SLA timer." },
    { num: "04", title: "Reply generated", text: "A confident draft is generated from your knowledge base." },
    { num: "05", title: "Resolved or escalated", text: "High-confidence replies send automatically. The rest come to you." },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 border-t border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-500 mb-4">How it works</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-white leading-[1.1] max-w-[500px]">
            From email to resolution.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              <span className="text-[48px] font-semibold text-zinc-900 leading-none block mb-3 tracking-tighter">{s.num}</span>
              <h3 className="text-[15px] font-medium text-white mb-1.5">{s.title}</h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">{s.text}</p>
              {i < steps.length - 1 && (
                <span className="hidden lg:block absolute top-6 -right-5 text-zinc-800 text-lg">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
