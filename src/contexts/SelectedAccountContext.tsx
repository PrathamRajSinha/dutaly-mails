import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";

export type SelectedAccountValue = string | "all";

interface SelectedAccountContextType {
  selectedAccountId: SelectedAccountValue;
  setSelectedAccountId: (id: SelectedAccountValue) => void;
  /** IDs of currently connected (deduped) accounts. Used to scope "all" queries. */
  connectedAccountIds: string[];
  /** True while account list is still loading. */
  accountsLoading: boolean;
}

const SelectedAccountContext = createContext<SelectedAccountContextType | undefined>(undefined);

function storageKey(userId: string | undefined) {
  return userId ? `selected-account:${userId}` : "selected-account:anon";
}

export function SelectedAccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { accounts, isLoading: accountsLoading } = useEmailAccounts();
  const [selectedAccountId, setSelectedAccountIdState] = useState<SelectedAccountValue>("all");

  // Dedupe by email_address — keep newest (accounts are ordered desc)
  const uniqueAccounts = useMemo(
    () =>
      Array.from(
        new Map(accounts.map((a) => [a.email_address.toLowerCase(), a])).values()
      ),
    [accounts]
  );
  const connectedAccountIds = useMemo(
    () => uniqueAccounts.map((a) => a.id),
    [uniqueAccounts]
  );

  useEffect(() => {
    const stored = localStorage.getItem(storageKey(user?.id));
    setSelectedAccountIdState(stored || "all");
  }, [user?.id]);

  useEffect(() => {
    if (selectedAccountId === "all") return;
    if (accountsLoading) return;
    const exists = connectedAccountIds.includes(selectedAccountId);
    if (!exists) {
      setSelectedAccountIdState("all");
      localStorage.setItem(storageKey(user?.id), "all");
    }
  }, [connectedAccountIds, selectedAccountId, accountsLoading, user?.id]);

  const setSelectedAccountId = (id: SelectedAccountValue) => {
    setSelectedAccountIdState(id);
    localStorage.setItem(storageKey(user?.id), id);
  };

  const value = useMemo(
    () => ({ selectedAccountId, setSelectedAccountId, connectedAccountIds, accountsLoading }),
    [selectedAccountId, connectedAccountIds, accountsLoading]
  );

  return (
    <SelectedAccountContext.Provider value={value}>{children}</SelectedAccountContext.Provider>
  );
}

export function useSelectedAccount() {
  const ctx = useContext(SelectedAccountContext);
  if (!ctx) {
    return {
      selectedAccountId: "all" as SelectedAccountValue,
      setSelectedAccountId: () => {},
      connectedAccountIds: [] as string[],
      accountsLoading: false,
    };
  }
  return ctx;
}
