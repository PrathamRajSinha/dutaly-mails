import { motion } from "framer-motion";

const testimonials = [
  { name: "Sarah Chen", role: "Head of Support, Acme", text: "MailReplAI cut our response time by 80%. Our customers think we hired 10 more people." },
  { name: "Marcus Johnson", role: "Founder, Launchpad", text: "I used to spend 3 hours on email. Now it's 15 minutes. The AI gets our tone perfectly." },
  { name: "Elena Rossi", role: "Operations, Globex", text: "The escalation feature is brilliant. Important emails always reach the right person." },
  { name: "David Park", role: "CTO, Initech", text: "We connected it to our knowledge base and it handles 90% of technical queries autonomously." },
  { name: "Ava Thompson", role: "CEO, Brightside", text: "The confidence scoring gives us peace of mind. We trust it completely." },
  { name: "James Wu", role: "Sales Lead, Nova", text: "Our sales team responds to leads instantly now. Conversion rates are up 40%." },
];

const doubled = [...testimonials, ...testimonials];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-sm font-medium text-indigo-400">Testimonials</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">Loved by teams everywhere</h2>
        </motion.div>
      </div>

      {/* Infinite marquee */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

        <motion.div
          className="flex gap-6"
          animate={{ x: [0, -50 * doubled.length] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[340px] p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors"
            >
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{t.name}</div>
                  <div className="text-xs text-zinc-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
