import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle, XCircle, Forward } from "lucide-react";

interface ActivityItemProps {
  email: {
    from: string;
    subject: string;
    action: "replied" | "ignored" | "queued" | "forwarded";
    time: string;
    confidence?: number;
  };
}

const actionConfig = {
  replied: {
    icon: Check,
    label: "Auto-replied",
    className: "text-green-600 bg-green-50",
  },
  ignored: {
    icon: XCircle,
    label: "Ignored",
    className: "text-muted-foreground bg-muted/50",
  },
  queued: {
    icon: Clock,
    label: "Queued for review",
    className: "text-amber-600 bg-amber-50",
  },
  forwarded: {
    icon: Forward,
    label: "Forwarded",
    className: "text-primary bg-primary/10",
  },
};

export function ActivityItem({ email }: ActivityItemProps) {
  const config = actionConfig[email.action];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/30">
      <div className={cn("rounded-full p-2", config.className)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-card-foreground">
              {email.subject}
            </p>
            <p className="text-sm text-muted-foreground">From: {email.from}</p>
          </div>
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {email.time}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", config.className)}>
            {config.label}
          </span>
          {email.confidence && (
            <span className="text-xs text-muted-foreground">
              {email.confidence}% confidence
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
