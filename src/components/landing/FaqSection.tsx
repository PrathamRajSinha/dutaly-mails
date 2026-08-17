import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does Dutaly actually work?",
    a: "Dutaly connects to your support inbox and knowledge base. It reads every incoming email, detects intent and confidence, then either auto-sends a reply, drafts for your review, or escalates to your team — while creating and updating tickets automatically.",
  },
  {
    q: "How long does setup take?",
    a: "Most teams connect their inbox and knowledge base in under 15 minutes. You can then tune rules and confidence thresholds as you see real emails flowing in.",
  },
  {
    q: "Which email providers do you support?",
    a: "We support Gmail and Google Workspace via OAuth, plus any custom SMTP/IMAP inbox (Zoho, Fastmail, hosted domains). Outlook is not currently supported. If you're unsure, reach out and we'll confirm your setup.",
  },
  {
    q: "Where does the AI get its answers from?",
    a: "Primarily from your knowledge base, docs, and past tickets. You can also add custom instructions and rules so Dutaly answers in your voice and follows your policies.",
  },
  {
    q: "How do approvals and auto-send work?",
    a: "You set confidence thresholds. Above a certain threshold, Dutaly auto-sends replies. Below that, it drafts for your review or escalates to the right teammate with context.",
  },
  {
    q: "What happens with angry or high-risk emails?",
    a: "Sensitive or high-risk emails (refunds, escalations, legal, etc.) are automatically routed for human review. You control which topics always require approval.",
  },
  {
    q: "Can I control the AI's tone and rules?",
    a: "Yes. You can define tone guidelines, do/don't lists, and topic-specific rules so Dutaly replies consistently with your brand and policies.",
  },
  {
    q: "How do you handle data privacy?",
    a: "Your emails and knowledge base are used only to power your instance of Dutaly. We don't train shared models on your data. You can review our security and data policy for details.",
  },
  {
    q: "How does pricing work?",
    a: "We charge based on mailbox volume and features. There's a free tier to get started, and paid plans for higher volume and advanced controls. See pricing or talk to us for a custom quote.",
  },
];


export function FaqSection() {
  return (
    <section id="faq" className="py-28 md:py-36" style={{ background: "#0A0A0F" }} aria-labelledby="landing-faq-heading">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid gap-12 lg:grid-cols-[380px_1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-5" style={{ color: "rgba(255,255,255,0.38)" }}>FAQ</p>
            <h2
              id="landing-faq-heading"
              className="text-[clamp(2rem,3.6vw,2.9rem)] font-semibold leading-[1.1] tracking-[-0.03em]"
              style={{ color: "#F7F6FC" }}
            >
              Frequently asked questions
            </h2>
            <p className="mt-5 text-[15px] leading-[1.75]" style={{ color: "rgba(255,255,255,0.45)" }}>
              Everything about setup, control, and how Dutaly keeps your team in the loop.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <AccordionTrigger
                  className="font-display py-5 text-left text-[15.5px] font-semibold tracking-[-0.005em] hover:no-underline"
                  style={{ color: "#F0EEF8" }}
                >
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 pr-6 text-[14.5px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.52)" }}>
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

