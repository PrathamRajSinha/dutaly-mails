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

const actionConfig: Record<string, { icon: typeof Check; label: string; badgeBg: string; badgeColor: string; iconBg: string; iconColor: string }> = {
  replied: {
    icon: Check,
    label: "Auto-resolved",
    badgeBg: "#E1F5EE",
    badgeColor: "#0F6E56",
    iconBg: "#E1F5EE",
    iconColor: "#1D9E75",
  },
  auto_replied: {
    icon: Send,
    label: "Auto-resolved",
    badgeBg: "#E1F5EE",
    badgeColor: "#0F6E56",
    iconBg: "#E1F5EE",
    iconColor: "#1D9E75",
  },
  auto_sent: {
    icon: Send,
    label: "Sent",
    badgeBg: "#E1F5EE",
    badgeColor: "#0F6E56",
    iconBg: "#E1F5EE",
    iconColor: "#1D9E75",
  },
  drafted: {
    icon: FileEdit,
    label: "Drafted",
    badgeBg: "#EBE9FF",
    badgeColor: "#7C6FE0",
    iconBg: "#EBE9FF",
    iconColor: "#7C6FE0",
  },
  ignored: {
    icon: XCircle,
    label: "Ignored",
    badgeBg: "#F1EFE8",
    badgeColor: "#5F5E5A",
    iconBg: "#F1EFE8",
    iconColor: "#5F5E5A",
  },
  queued: {
    icon: Clock,
    label: "Queued for review",
    badgeBg: "#FAEEDA",
    badgeColor: "#BA7517",
    iconBg: "#FAEEDA",
    iconColor: "#BA7517",
  },
  forwarded: {
    icon: Forward,
    label: "Forwarded",
    badgeBg: "#EBE9FF",
    badgeColor: "#7C6FE0",
    iconBg: "#EBE9FF",
    iconColor: "#7C6FE0",
  },
  labeled: {
    icon: Check,
    label: "Labeled",
    badgeBg: "#E6F1FB",
    badgeColor: "#185FA5",
    iconBg: "#E6F1FB",
    iconColor: "#185FA5",
  },
};

const defaultConfig = {
  icon: AlertCircle,
  label: "Unknown",
  badgeBg: "#F1EFE8",
  badgeColor: "#5F5E5A",
  iconBg: "#F1EFE8",
  iconColor: "#5F5E5A",
};

export function ActivityItem({ email }: ActivityItemProps) {
  const config = actionConfig[email.action] || defaultConfig;
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 rounded-[10px] bg-card p-3 px-4 border border-border">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
        style={{ backgroundColor: config.iconBg }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: config.iconColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium" style={{ color: '#1A1730' }}>
              {email.subject}
            </p>
            <p className="text-[11px]" style={{ color: '#9490B8' }}>From: {email.from}</p>
          </div>
          <span className="whitespace-nowrap text-[11px]" style={{ color: '#9490B8' }}>
            {email.time}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: config.badgeBg, color: config.badgeColor }}
          >
            {config.label}
          </span>
          {email.confidence !== undefined && email.confidence > 0 && (
            <span className="text-[11px]" style={{ color: '#9490B8' }}>
              {email.confidence}% confidence
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
