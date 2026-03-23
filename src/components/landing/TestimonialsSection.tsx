export function TestimonialsSection() {
  return (
    <section id="use-cases" className="py-24 sm:py-32 border-t border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-16">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-500 mb-4">Use cases</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-white leading-[1.1] max-w-[600px]">
            Built for teams that handle customer emails daily.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-white/[0.06] rounded-lg overflow-hidden">
          {[
            { title: "SaaS", text: "Route bug reports to engineering, handle billing questions automatically, and keep feature requests organized." },
            { title: "D2C", text: "Resolve refund requests, order inquiries, and shipping questions without overwhelming your support team." },
            { title: "Agencies", text: "Manage client communication across shared inboxes. Keep every thread structured and assigned." },
          ].map((uc) => (
            <div key={uc.title} className="bg-[#0A0A0B] p-8">
              <h3 className="text-[18px] font-semibold text-white mb-3">{uc.title}</h3>
              <p className="text-[14px] text-zinc-500 leading-[1.7]">{uc.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
