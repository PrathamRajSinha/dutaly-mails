import { format } from "date-fns";
import { Mail } from "lucide-react";
import type { EmailSummary } from "./EmailDetailDialog";

interface EmailReferenceListProps {
  emails: EmailSummary[];
  onEmailClick: (email: EmailSummary) => void;
}

export function EmailReferenceList({ emails, onEmailClick }: EmailReferenceListProps) {
  if (!emails.length) return null;

  return (
    <div className="mt-3 space-y-1">
      <p className="text-xs text-muted-foreground mb-1">Referenced emails — click for details:</p>
      <div className="flex flex-col gap-1">
        {emails.map((email, i) => (
          <button
            key={i}
            onClick={() => onEmailClick(email)}
            className="flex items-center gap-2 text-left text-xs rounded-md px-2 py-1.5 hover:bg-accent transition-colors group"
          >
            <Mail className="h-3 w-3 text-primary shrink-0" />
            <span className="text-primary group-hover:underline truncate">
              {email.from_name || email.from_address}
            </span>
            <span className="text-muted-foreground truncate">— {email.subject}</span>
            <span className="text-muted-foreground/60 ml-auto shrink-0">
              {format(new Date(email.queued_at), "MMM d, HH:mm")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
