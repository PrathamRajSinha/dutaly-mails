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
    <section id="faq" style={{ background: "#0A0A0F" }} aria-labelledby="landing-faq-heading">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t pt-12" style={{ borderColor: "rgba(237,235,245,0.12)" }}>
          <div className="md:col-span-4">
            <div className="md:sticky md:top-24">
              <p className="text-[10px] uppercase tracking-[0.22em] mb-6" style={{ color: "#6E62C4" }}>06 / FAQ</p>
              <h2 id="landing-faq-heading" className="text-[clamp(1.9rem,3.2vw,2.5rem)] leading-[1.08]" style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}>
                Frequently asked <span className="italic">questions</span>
              </h2>
            </div>
          </div>

          <div className="md:col-span-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} style={{ borderColor: "rgba(237,235,245,0.12)" }}>
                  <AccordionTrigger
                    className="text-left text-[17px] py-6 hover:no-underline"
                    style={{ fontFamily: "Lora, serif", color: "#EDEBF5" }}
                  >
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[14px] leading-[1.85] pb-6 max-w-2xl" style={{ color: "rgba(237,235,245,0.55)" }}>
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
