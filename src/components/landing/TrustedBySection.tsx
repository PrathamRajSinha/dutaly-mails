export function TrustedBySection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-white leading-[1.1]">
              Support becomes harder
              <br />
              <span className="text-zinc-400">as you grow.</span>
            </h2>
          </div>
          <div className="space-y-8">
            {[
              { title: "Emails pile up", text: "Teams still read every email manually. Nothing is prioritized — everything looks urgent." },
              { title: "Requests get lost", text: "Sorting and assigning by hand means important messages slip through the cracks." },
              { title: "Responses slow down", text: "As volume grows, response time increases. Customers notice." },
              { title: "No visibility", text: "Without structure, there's no way to track who handled what — or what was missed." },
            ].map((item) => (
              <div key={item.title} className="border-l-2 border-zinc-700 pl-5">
                <h3 className="text-[15px] font-medium text-white mb-1">{item.title}</h3>
                <p className="text-[14px] text-zinc-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
