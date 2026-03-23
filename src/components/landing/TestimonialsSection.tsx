import { motion } from "framer-motion";

export function TestimonialsSection() {
  return (
    <section id="use-cases" className="py-24 sm:py-32 border-t border-zinc-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-zinc-400 mb-4">Use cases</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[600px]">
            Built for teams that handle customer emails daily.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "SaaS", text: "Route bug reports to engineering, handle billing questions automatically, and keep feature requests organized." },
            { title: "D2C", text: "Resolve refund requests, order inquiries, and shipping questions without overwhelming your support team." },
            { title: "Agencies", text: "Manage client communication across shared inboxes. Keep every thread structured and assigned." },
          ].map((uc, i) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-8 rounded-lg border border-zinc-100 hover:border-zinc-200 hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-[18px] font-semibold text-zinc-900 mb-3">{uc.title}</h3>
              <p className="text-[14px] text-zinc-500 leading-[1.7]">{uc.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
