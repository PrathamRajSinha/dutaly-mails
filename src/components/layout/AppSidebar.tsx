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
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("dutaly:sidebar:collapsed") === "1";
  });

  useEffect(() => {
    localStorage.setItem("dutaly:sidebar:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    "";
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const width = collapsed ? 64 : 220;

  return (
    <aside
      className="flex h-screen shrink-0 flex-col transition-[width] duration-200"
      style={{ backgroundColor: '#0A0A0F', width }}
    >
      {/* Logo + collapse */}
      <div className="flex items-center justify-between px-3 py-5" style={{ paddingLeft: collapsed ? 12 : 20, paddingRight: 8 }}>
        {!collapsed && (
          <span style={{ color: '#E8E4FF', fontSize: '18px', fontWeight: 500 }}>dutaly</span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-2.5 transition-colors"
              style={{
                backgroundColor: isActive ? '#7C6FE0' : 'transparent',
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                borderRadius: '6px',
                fontSize: '13px',
                height: '36px',
                padding: collapsed ? '0' : '0 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Automation Control */}
      {!collapsed && (
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
      )}

      {collapsed && (
        <div className="px-3 pb-2 flex justify-center">
          <button
            className="flex h-9 w-9 items-center justify-center text-white"
            style={{ backgroundColor: '#7C6FE0', borderRadius: '8px' }}
            onClick={() => setIsAutomationActive(!isAutomationActive)}
            title={isAutomationActive ? "Pause automation" : "Resume automation"}
          >
            {isAutomationActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}

      {/* User + Sign Out */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {displayName && (
          <div className={`mb-2 flex items-center gap-2 ${collapsed ? 'justify-center' : 'px-1'}`}>
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: '#7C6FE0', fontSize: '12px', fontWeight: 600 }}
              title={collapsed ? displayName : undefined}
            >
              {initial}
            </div>
            {!collapsed && (
              <span
                className="truncate"
                style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: 500 }}
                title={displayName}
              >
                {displayName}
              </span>
            )}
          </div>
        )}
        {!collapsed && (
          <button
            onClick={handleSignOut}
            style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}
            className="w-full text-center transition-colors hover:text-white/60"
          >
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
