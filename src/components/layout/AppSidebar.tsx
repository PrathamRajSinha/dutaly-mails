import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Inbox,
  Settings,
  Pause,
  Play,
  Sparkles,
  Ticket,
} from "lucide-react";
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
  const { signOut, user } = useAuth();
  const [isAutomationActive, setIsAutomationActive] = useState(true);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    "";
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col" style={{ backgroundColor: '#0A0A0F' }}>
      {/* Logo */}
      <div className="flex items-center px-5 py-5">
        <span style={{ color: '#E8E4FF', fontSize: '18px', fontWeight: 500 }}>dutaly</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-2.5 transition-colors"
              style={{
                backgroundColor: isActive ? '#7C6FE0' : 'transparent',
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                borderRadius: '6px',
                fontSize: '13px',
                height: '36px',
                padding: '0 12px',
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
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Automation
            </span>
            <span className="flex items-center gap-1.5" style={{ fontSize: '11px', fontWeight: 500, color: isAutomationActive ? '#34D399' : '#6B7280' }}>
              {isAutomationActive && <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />}
              {isAutomationActive ? "Active" : "Paused"}
            </span>
          </div>
          <button
            className="flex w-full items-center justify-center gap-1.5 text-white transition-colors"
            style={{ backgroundColor: '#7C6FE0', borderRadius: '8px', fontSize: '12px', fontWeight: 500, padding: '6px 12px' }}
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

      {/* Sign Out */}
      <div className="flex items-center justify-center py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleSignOut}
          style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}
          className="transition-colors hover:text-white/60"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
