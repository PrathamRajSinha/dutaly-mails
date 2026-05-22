import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";

export type SelectedAccountValue = string | "all";

interface SelectedAccountContextType {
  selectedAccountId: SelectedAccountValue;
  setSelectedAccountId: (id: SelectedAccountValue) => void;
}

const SelectedAccountContext = createContext<SelectedAccountContextType | undefined>(undefined);

function storageKey(userId: string | undefined) {
  return userId ? `selected-account:${userId}` : "selected-account:anon";
}

export function SelectedAccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { accounts } = useEmailAccounts();
  const [selectedAccountId, setSelectedAccountIdState] = useState<SelectedAccountValue>("all");

  // Load from localStorage when user changes
  useEffect(() => {
    const stored = localStorage.getItem(storageKey(user?.id));
    if (stored) {
      setSelectedAccountIdState(stored);
    } else {
      setSelectedAccountIdState("all");
    }
  }, [user?.id]);

  // If selected account no longer exists, fall back to "all"
  useEffect(() => {
    if (selectedAccountId === "all") return;
    if (accounts.length === 0) return;
    const exists = accounts.some((a) => a.id === selectedAccountId);
    if (!exists) {
      setSelectedAccountIdState("all");
      localStorage.setItem(storageKey(user?.id), "all");
    }
  }, [accounts, selectedAccountId, user?.id]);

  const setSelectedAccountId = (id: SelectedAccountValue) => {
    setSelectedAccountIdState(id);
    localStorage.setItem(storageKey(user?.id), id);
  };

  const value = useMemo(
    () => ({ selectedAccountId, setSelectedAccountId }),
    [selectedAccountId, user?.id]
  );

  return (
    <SelectedAccountContext.Provider value={value}>{children}</SelectedAccountContext.Provider>
  );
}

export function useSelectedAccount() {
  const ctx = useContext(SelectedAccountContext);
  if (!ctx) {
    // Safe default for components rendered outside the provider (e.g. auth pages)
    return { selectedAccountId: "all" as SelectedAccountValue, setSelectedAccountId: () => {} };
  }
  return ctx;
}
