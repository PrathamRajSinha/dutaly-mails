import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Inbox,
  Settings,
  Pause,
  Play,
  LogOut,
  Sparkles,
  Ticket,
} from "lucide-react";
import logoDarkBg from "@/assets/logo-dark-bg.png";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Inbox, label: "Inbox", path: "/inbox" },
  { icon: BookOpen, label: "Knowledge Base", path: "/knowledge-base" },
  { icon: FileText, label: "Instructions", path: "/instructions" },
  { icon: Ticket, label: "Templates", path: "/templates" },
  { icon: Sparkles, label: "Inbox Intelligence", path: "/ask" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isAutomationActive, setIsAutomationActive] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col" style={{ backgroundColor: '#0A0A0F' }}>
      {/* Logo */}
      <div className="flex items-center px-5 py-5">
        <img src={logoDarkBg} alt="Dutaly" className="h-[42px] w-auto" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 text-[13px] font-normal transition-colors",
                "h-9"
              )}
              style={{
                backgroundColor: isActive ? '#7C6FE0' : 'transparent',
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                borderRadius: '8px',
              }}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Automation Control */}
      <div className="px-3 pb-2">
        <div className="rounded-lg px-3 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Automation
            </span>
            <span
              className={cn(
                "text-[11px] font-medium",
                isAutomationActive ? "text-green-400" : "text-gray-500"
              )}
            >
              {isAutomationActive ? "Active" : "Paused"}
            </span>
          </div>
          <button
            className="flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-white transition-colors"
            style={{ backgroundColor: '#7C6FE0' }}
            onClick={() => setIsAutomationActive(!isAutomationActive)}
          >
            {isAutomationActive ? (
              <><Pause className="h-3 w-3" /> Pause</>
            ) : (
              <><Play className="h-3 w-3" /> Resume</>
            )}
          </button>
        </div>
      </div>

      {/* Sign Out Icon */}
      <div className="flex items-center justify-center border-t px-3 py-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleSignOut}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
