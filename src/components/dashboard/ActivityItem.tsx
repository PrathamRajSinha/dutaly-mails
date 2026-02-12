import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle, XCircle, Forward, Send, FileEdit } from "lucide-react";

interface ActivityItemProps {
  email: {
    from: string;
    subject: string;
    action: string;
    time: string;
    confidence?: number;
  };
}

const actionConfig: Record<string, { icon: typeof Check; label: string; className: string }> = {
  replied: {
    icon: Check,
    label: "Auto-replied",
    className: "text-green-600 bg-green-50",
  },
  auto_replied: {
    icon: Send,
    label: "Auto-replied",
    className: "text-green-600 bg-green-50",
  },
  auto_sent: {
    icon: Send,
    label: "Sent",
    className: "text-green-600 bg-green-50",
  },
  drafted: {
    icon: FileEdit,
    label: "Drafted",
    className: "text-primary bg-primary/10",
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
  labeled: {
    icon: Check,
    label: "Labeled",
    className: "text-blue-600 bg-blue-50",
  },
};

const defaultConfig = {
  icon: AlertCircle,
  label: "Unknown",
  className: "text-muted-foreground bg-muted/50",
};

export function ActivityItem({ email }: ActivityItemProps) {
  const config = actionConfig[email.action] || defaultConfig;
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
          {email.confidence !== undefined && email.confidence > 0 && (
            <span className="text-xs text-muted-foreground">
              {email.confidence}% confidence
            </span>
          )}
        </div>
      </div>
    </div>
  );
}