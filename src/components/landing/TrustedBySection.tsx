import { motion } from "framer-motion";

export function TrustedBySection() {
  const problems = [
    { title: "Emails pile up", text: "Teams still read every email manually. Nothing is prioritized — everything looks urgent." },
    { title: "Requests get lost", text: "Sorting and assigning by hand means important messages slip through the cracks." },
    { title: "Responses slow down", text: "As volume grows, response time increases. Customers notice." },
    { title: "No visibility", text: "Without structure, there's no way to track who handled what — or what was missed." },
  ];

  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1]">
              Support becomes harder
              <br />
              <span className="text-zinc-400">as you grow.</span>
            </h2>
          </motion.div>
          <div className="relative">
            {/* Vertical progress line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-zinc-300 via-zinc-200 to-transparent" />
            <div className="space-y-10">
              {problems.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-5"
                >
                  <div className="relative flex-shrink-0 w-[30px] h-[30px] rounded-full bg-zinc-100 border-2 border-zinc-300 flex items-center justify-center">
                    <span className="text-[12px] font-bold text-zinc-500">{i + 1}</span>
                  </div>
                  <div className="pt-0.5">
                    <h3 className="text-[15px] font-semibold text-zinc-900 mb-1">{item.title}</h3>
                    <p className="text-[14px] text-zinc-500 leading-relaxed">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
