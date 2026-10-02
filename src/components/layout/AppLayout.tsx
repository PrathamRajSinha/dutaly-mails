import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AccountTabs } from "./AccountTabs";
import { RefreshButton } from "./RefreshButton";
import { UnsendToastProvider } from "@/components/UnsendToastProvider";
import { WelcomeWizard } from "@/components/WelcomeWizard";
import { SelectedAccountProvider } from "@/contexts/SelectedAccountContext";

export function AppLayout() {
  return (
    <SelectedAccountProvider>
      <div className="flex h-dvh bg-background">
        <AppSidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center border-b border-border bg-background">
            <div className="min-w-0 flex-1"><AccountTabs /></div>
            <div className="shrink-0 px-3"><RefreshButton /></div>
          </div>
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
        <UnsendToastProvider />
        <WelcomeWizard />
      </div>
    </SelectedAccountProvider>
  );
}
