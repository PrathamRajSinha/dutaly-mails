import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const quickReplies = [
  { label: "Reviewing", text: "Thank you for reaching out. I'm currently reviewing your request and will get back to you shortly." },
  { label: "Need time", text: "I appreciate your patience. I need a bit more time to look into this and will follow up with a detailed response soon." },
  { label: "Thank you", text: "Thank you for your message! I've noted your request and will take care of it right away." },
  { label: "Escalating", text: "I'm escalating this to our team lead for further review. You'll hear back from us within 24 hours." },
];

interface QuickReplyChipsProps {
  onSelect: (text: string) => void;
}

export function QuickReplyChips({ onSelect }: QuickReplyChipsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3" style={{ color: "#7C6FE0" }} />
        Quick:
      </span>
      {quickReplies.map((qr) => (
        <button
          key={qr.label}
          onClick={() => onSelect(qr.text)}
          className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
        >
          {qr.label}
        </button>
      ))}
    </div>
  );
}
