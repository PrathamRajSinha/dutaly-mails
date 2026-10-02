import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle, XCircle, Forward, Send, FileEdit, Mail, type LucideIcon } from "lucide-react";

interface ActivityItemProps {
  email: {
    from: string;
    subject: string;
    action: string;
    time: string;
    fullTime: string;
    confidence?: number;
    accountEmail?: string;
  };
}

export const actionConfig: Record<string, { icon: LucideIcon; label: string; badgeBg: string; badgeColor: string; iconBg: string; iconColor: string }> = {
  replied: {
    icon: Check,
    label: "Auto-resolved",
    badgeBg: "#ECFDF5",
    badgeColor: "#065F46",
    iconBg: "#ECFDF5",
    iconColor: "#10B981",
  },
  auto_replied: {
    icon: Send,
    label: "Auto-resolved",
    badgeBg: "#ECFDF5",
    badgeColor: "#065F46",
    iconBg: "#ECFDF5",
    iconColor: "#10B981",
  },
  auto_sent: {
    icon: Send,
    label: "Sent",
    badgeBg: "#ECFDF5",
    badgeColor: "#065F46",
    iconBg: "#ECFDF5",
    iconColor: "#10B981",
  },
  drafted: {
    icon: FileEdit,
    label: "Drafted",
    badgeBg: "#F0EFFF",
    badgeColor: "#5850EC",
    iconBg: "#F0EFFF",
    iconColor: "#7C6FE0",
  },
  ignored: {
    icon: XCircle,
    label: "Ignored",
    badgeBg: "#F3F4F6",
    badgeColor: "#374151",
    iconBg: "#F3F4F6",
    iconColor: "#6B7280",
  },
  queued: {
    icon: Clock,
    label: "Needs Review",
    badgeBg: "#FFFBEB",
    badgeColor: "#92400E",
    iconBg: "#FFFBEB",
    iconColor: "#F59E0B",
  },
  forwarded: {
    icon: Forward,
    label: "Forwarded",
    badgeBg: "#F0EFFF",
    badgeColor: "#5850EC",
    iconBg: "#F0EFFF",
    iconColor: "#7C6FE0",
  },
  labeled: {
    icon: Check,
    label: "Labeled",
    badgeBg: "#EFF6FF",
    badgeColor: "#1E40AF",
    iconBg: "#EFF6FF",
    iconColor: "#3B82F6",
  },
};

const defaultConfig = {
  icon: AlertCircle,
  label: "Processing",
  badgeBg: "#F3F4F6",
  badgeColor: "#374151",
  iconBg: "#F3F4F6",
  iconColor: "#6B7280",
};

export function ActivityItem({ email }: ActivityItemProps) {
  const config = actionConfig[email.action] || defaultConfig;
  const Icon = config.icon;

  return (
    <div className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border shadow-sm"
        style={{ backgroundColor: config.iconBg }}
      >
        <Icon className="h-5 w-5" style={{ color: config.iconColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate text-[14px] font-semibold text-foreground transition-colors group-hover:text-primary">
              {email.subject}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[12px] font-medium text-muted-foreground">From: {email.from}</span>
              {email.accountEmail && (
                <>
                  <span className="text-[#E2E8F0]">•</span>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{email.accountEmail}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <time 
            className="whitespace-nowrap rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground" 
            title={email.fullTime}
          >
            {email.time}
          </time>
        </div>
        
        <div className="mt-3 flex items-center gap-3">
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider shadow-sm border border-white/20"
            style={{ backgroundColor: config.badgeBg, color: config.badgeColor }}
          >
            {config.label}
          </span>
          
          {email.confidence !== undefined && email.confidence > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
                <div 
                  className="h-full bg-[#10B981]" 
                  style={{ width: `${email.confidence}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {email.confidence}% confidence
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
