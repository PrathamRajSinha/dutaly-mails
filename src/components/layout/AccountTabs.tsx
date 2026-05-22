import { useState } from "react";
import { Inbox, X } from "lucide-react";
import { useEmailAccounts, type EmailAccount } from "@/hooks/useEmailAccounts";
import { useSelectedAccount } from "@/contexts/SelectedAccountContext";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AccountTabs() {
  const { accounts, isLoading, disconnectAccount } = useEmailAccounts();
  const { selectedAccountId, setSelectedAccountId } = useSelectedAccount();
  const [pendingDisconnect, setPendingDisconnect] = useState<EmailAccount | null>(null);

  // Deduplicate by email_address (keep newest — first because ordered desc)
  const uniqueAccounts = Array.from(
    new Map(accounts.map((a) => [a.email_address.toLowerCase(), a])).values()
  );

  if (isLoading || uniqueAccounts.length <= 1) return null;

  return (
    <>
      <div className="border-b border-border bg-background px-8 pt-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          <TabButton
            active={selectedAccountId === "all"}
            onClick={() => setSelectedAccountId("all")}
            label="All accounts"
            icon={<Inbox className="h-3.5 w-3.5" />}
          />
          {uniqueAccounts.map((acc) => (
            <TabButton
              key={acc.id}
              active={selectedAccountId === acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              onClose={() => setPendingDisconnect(acc)}
              label={acc.email_address}
              muted={!acc.is_active}
            />
          ))}
        </div>
      </div>

      <AlertDialog
        open={!!pendingDisconnect}
        onOpenChange={(open) => !open && setPendingDisconnect(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect this email?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDisconnect?.email_address} will be disconnected. Its tab will be
              removed, and existing emails/tickets will remain in the database but won't
              be shown until you reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDisconnect) {
                  disconnectAccount.mutate(pendingDisconnect.id);
                }
                setPendingDisconnect(null);
              }}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TabButton({
  active,
  onClick,
  onClose,
  label,
  icon,
  muted,
}: {
  active: boolean;
  onClick: () => void;
  onClose?: () => void;
  label: string;
  icon?: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-1 whitespace-nowrap rounded-t-md border-b-2 transition-colors",
        active
          ? "border-[#7C6FE0]"
          : "border-transparent hover:bg-[#F4F3FF]",
        muted && !active && "opacity-60"
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex items-center gap-1.5 pl-3 py-2 text-[12px] font-medium transition-colors",
          onClose ? "pr-1" : "pr-3",
          active ? "text-[#1A1730]" : "text-[#9490B8] hover:text-[#1A1730]"
        )}
      >
        {icon}
        <span className="max-w-[220px] truncate">{label}</span>
      </button>
      {onClose && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label={`Disconnect ${label}`}
          className={cn(
            "mr-1 flex h-5 w-5 items-center justify-center rounded text-[#9490B8] opacity-0 transition-opacity hover:bg-[#E8E5FA] hover:text-[#1A1730] group-hover:opacity-100",
            active && "opacity-100"
          )}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
