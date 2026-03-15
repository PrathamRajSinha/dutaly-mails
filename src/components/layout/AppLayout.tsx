import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { UnsendToastProvider } from "@/components/UnsendToastProvider";

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <UnsendToastProvider />
    </div>
  );
}
