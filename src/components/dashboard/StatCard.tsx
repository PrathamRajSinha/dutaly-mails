import { LucideIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning";
  isLoading?: boolean;
  hasData?: boolean;
}

const variantStyles = {
  primary: { borderColor: '#7C6FE0', iconBg: '#F0EFFF', iconColor: '#7C6FE0' },
  success: { borderColor: '#10B981', iconBg: '#ECFDF5', iconColor: '#10B981' },
  warning: { borderColor: '#F59E0B', iconBg: '#FFFBEB', iconColor: '#F59E0B' },
  default: { borderColor: '#3B82F6', iconBg: '#EFF6FF', iconColor: '#3B82F6' },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  isLoading = false,
  hasData = true,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className="rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
      style={{ borderLeft: `4px solid ${styles.borderColor}` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              {title}
            </p>
            
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse bg-slate-100 rounded" />
            ) : !hasData ? (
              <div className="flex items-center gap-1.5 text-[14px] text-[#9490B8] py-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>N/A</span>
              </div>
            ) : (
              <p className="text-[26px] font-bold leading-none tracking-tight text-[#1A1730]">
                {value}
              </p>
            )}

            {hasData && subtitle && (
              <p className="text-[12px] font-medium text-[#64748B]">{subtitle}</p>
            )}
            
            {hasData && trend && (
              <p className={cn(
                "text-[11px] font-semibold flex items-center gap-1 mt-1",
                trend.isPositive ? "text-[#10B981]" : "text-[#EF4444]"
              )}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% 
                <span className="font-normal text-[#9490B8]">from last week</span>
              </p>
            )}
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg shadow-inner"
            style={{ backgroundColor: styles.iconBg }}
          >
            <Icon className="h-5.5 w-5.5" style={{ color: styles.iconColor }} />
          </div>
        </div>
      </div>
    </div>
  );
}
