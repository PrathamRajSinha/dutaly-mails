export function StatsSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-zinc-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[500px] mb-16">
          Support that actually scales.
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 rounded-lg overflow-hidden">
          {[
            { metric: "Handle more", desc: "without growing your team" },
            { metric: "Respond faster", desc: "every single time" },
            { metric: "Track everything", desc: "with full visibility" },
            { metric: "Stay in control", desc: "at every step" },
          ].map((item) => (
            <div key={item.metric} className="bg-white p-8">
              <h3 className="text-[20px] font-semibold text-zinc-900 mb-1">{item.metric}</h3>
              <p className="text-[14px] text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
