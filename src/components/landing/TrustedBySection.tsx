import { motion } from "framer-motion";

export function TrustedBySection() {
  const problems = [
    { title: "Emails pile up", text: "Teams still read every email manually. Nothing is prioritized — everything looks urgent." },
    { title: "Requests get lost", text: "Sorting and assigning by hand means important messages slip through the cracks." },
    { title: "Responses slow down", text: "As volume grows, response time increases. Customers notice." },
    { title: "No visibility", text: "Without structure, there's no way to track who handled what — or what was missed." },
  ];

  // Scrolling team tags like Superhuman
  const teams = [
    "Support", "Sales", "Engineering", "Product", "Operations",
    "Customer Success", "Marketing", "Leadership", "Finance", "HR",
    "Design", "Analytics", "Legal", "Recruiting", "Strategy",
  ];

  return (
    <section className="py-28 sm:py-36 relative">
      {/* Gradient bg transition */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-zinc-50/50 to-white pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Big statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.15] max-w-[700px] mx-auto">
            Support becomes harder
            <br />
            <span className="text-zinc-400">as you grow.</span>
          </h2>
          <p className="mt-5 text-[16px] text-zinc-500 max-w-[480px] mx-auto leading-relaxed">
            Email hasn't changed in decades. But your team's workload has. Here's what breaks first.
          </p>
        </motion.div>

        {/* Scrolling team marquee */}
        <div className="relative overflow-hidden mb-20">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
          <div className="flex gap-3 animate-marquee">
            {[...teams, ...teams].map((team, i) => (
              <span
                key={i}
                className="flex-shrink-0 px-5 py-2 rounded-full bg-zinc-100 text-[13px] font-medium text-zinc-500 border border-zinc-200/60 whitespace-nowrap"
              >
                {team}
              </span>
            ))}
          </div>
        </div>

        {/* Problem cards - 2x2 grid */}
        <div className="grid sm:grid-cols-2 gap-5 max-w-[800px] mx-auto">
          {problems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-7 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-lg transition-all duration-500"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-5">
                <span className="text-[14px] font-bold text-zinc-400">{i + 1}</span>
              </div>
              <h3 className="text-[16px] font-semibold text-zinc-900 mb-2">{item.title}</h3>
              <p className="text-[14px] text-zinc-500 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
