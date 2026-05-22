import { Inbox } from "lucide-react";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { useSelectedAccount } from "@/contexts/SelectedAccountContext";
import { cn } from "@/lib/utils";

export function AccountTabs() {
  const { accounts, isLoading } = useEmailAccounts();
  const { selectedAccountId, setSelectedAccountId } = useSelectedAccount();

  // Hide tabs when nothing to switch between
  if (isLoading || accounts.length <= 1) return null;

  return (
    <div className="border-b border-border bg-background px-8 pt-3">
      <div className="flex items-center gap-1 overflow-x-auto">
        <TabButton
          active={selectedAccountId === "all"}
          onClick={() => setSelectedAccountId("all")}
          label="All accounts"
          icon={<Inbox className="h-3.5 w-3.5" />}
        />
        {accounts.map((acc) => (
          <TabButton
            key={acc.id}
            active={selectedAccountId === acc.id}
            onClick={() => setSelectedAccountId(acc.id)}
            label={acc.email_address}
            muted={!acc.is_active}
          />
        ))}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
  muted,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap rounded-t-md px-3 py-2 text-[12px] font-medium transition-colors",
        "border-b-2",
        active
          ? "border-[#7C6FE0] text-[#1A1730]"
          : "border-transparent text-[#9490B8] hover:text-[#1A1730] hover:bg-[#F4F3FF]",
        muted && !active && "opacity-60"
      )}
    >
      {icon}
      <span className="max-w-[220px] truncate">{label}</span>
    </button>
  );
}
