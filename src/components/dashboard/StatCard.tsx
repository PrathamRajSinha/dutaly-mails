import { LucideIcon } from "lucide-react";

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
}

const variantStyles = {
  primary: { borderColor: '#7C6FE0', iconBg: '#EBE9FF', iconColor: '#7C6FE0' },
  success: { borderColor: '#1D9E75', iconBg: '#E1F5EE', iconColor: '#1D9E75' },
  warning: { borderColor: '#BA7517', iconBg: '#FAEEDA', iconColor: '#BA7517' },
  default: { borderColor: '#185FA5', iconBg: '#E6F1FB', iconColor: '#185FA5' },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className="rounded-xl border bg-card"
      style={{ borderLeft: `3px solid ${styles.borderColor}` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em]" style={{ color: '#9490B8' }}>
              {title}
            </p>
            <p className="text-[28px] font-medium leading-none" style={{ color: '#1A1730' }}>
              {value}
            </p>
            {subtitle && (
              <p className="text-[11px]" style={{ color: '#9490B8' }}>{subtitle}</p>
            )}
            {trend && (
              <p className={`text-[11px] font-medium ${trend.isPositive ? "text-[#1D9E75]" : "text-[#DC2626]"}`}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last week
              </p>
            )}
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: styles.iconBg }}
          >
            <Icon className="h-5 w-5" style={{ color: styles.iconColor }} />
          </div>
        </div>
      </div>
    </div>
  );
}
