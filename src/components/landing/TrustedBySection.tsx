import { motion } from "framer-motion";

const logos = [
  "Acme Corp", "Globex", "Initech", "Umbrella", "Stark Industries", "Wayne Enterprises",
  "Acme Corp", "Globex", "Initech", "Umbrella", "Stark Industries", "Wayne Enterprises",
];

export function TrustedBySection() {
  return (
    <section className="relative py-16 border-t border-white/5">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-sm text-zinc-500 mb-8"
      >
        Trusted by teams at
      </motion.p>

      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10" />
        
        <motion.div
          className="flex gap-12 items-center"
          animate={{ x: [0, -50 * logos.length] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {logos.map((name, i) => (
            <span key={i} className="text-zinc-600 font-semibold text-lg whitespace-nowrap select-none">
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
