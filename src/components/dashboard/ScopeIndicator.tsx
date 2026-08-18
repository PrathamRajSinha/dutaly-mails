import { useSelectedAccount } from "@/contexts/SelectedAccountContext";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { Globe, Mail, Calendar } from "lucide-react";

interface ScopeIndicatorProps {
  dateRange?: string;
  className?: string;
}

export function ScopeIndicator({ dateRange = "This month", className }: ScopeIndicatorProps) {
  const { selectedAccountId } = useSelectedAccount();
  const { accounts } = useEmailAccounts();

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const accountLabel =
    selectedAccountId === "all" ? "All accounts" : selectedAccount?.email_address || "Unknown account";

  return (
    <div className={`flex items-center gap-3 text-[11px] text-[#64748B] ${className}`}>
      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
        {selectedAccountId === "all" ? (
          <Globe className="h-3 w-3" />
        ) : (
          <Mail className="h-3 w-3" />
        )}
        <span className="font-medium">{accountLabel}</span>
      </div>
      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
        <Calendar className="h-3 w-3" />
        <span className="font-medium">{dateRange}</span>
      </div>
    </div>
  );
}
