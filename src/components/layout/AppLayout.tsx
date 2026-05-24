import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AccountTabs } from "./AccountTabs";
import { UnsendToastProvider } from "@/components/UnsendToastProvider";
import { WelcomeWizard } from "@/components/WelcomeWizard";
import { SelectedAccountProvider } from "@/contexts/SelectedAccountContext";

export function AppLayout() {
  return (
    <SelectedAccountProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <AccountTabs />
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
        <UnsendToastProvider />
      </div>
    </SelectedAccountProvider>
  );
}
