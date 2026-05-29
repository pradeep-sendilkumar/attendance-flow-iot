import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { useEffect, ReactNode } from "react";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart3,
  LogOut,
  CircleDot,
  Flame,
  MessageSquare,
  Utensils,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";
import { SessionStatusBar } from "@/components/SessionStatusBar";

const adminNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
  { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/gas-monitoring", label: "Gas Monitoring", icon: Flame },
  { to: "/complaints", label: "Complaints", icon: MessageSquare },
] as const;

const studentNav = [
  { to: "/student-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student-food", label: "Food Preference", icon: Utensils },
  { to: "/complaints", label: "Complaints", icon: MessageSquare },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const {
    isAuthed,
    role,
    logout,
    arduinoConnected,
    firebaseSync,
    emergencyActive,
  } = useApp();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const nav = role === "student" ? studentNav : adminNav;
  const loginPath = role === "student" ? "/student-login" : "/login";

  useEffect(() => {
    if (!isAuthed) navigate({ to: loginPath as "/login" });
    else if (role === "student" && path.startsWith("/dashboard")) {
      navigate({ to: "/student-dashboard" });
    } else if (role === "admin" && path.startsWith("/student-")) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthed, role, navigate, loginPath, path]);

  if (!isAuthed) return null;

  return (
    <div
      className={cn(
        "min-h-screen flex bg-background",
        emergencyActive && "ring-2 ring-inset ring-destructive/40",
      )}
    >
      {emergencyActive && (
        <div className="fixed top-0 inset-x-0 z-50 bg-destructive text-destructive-foreground text-center text-xs font-semibold py-1.5 animate-pulse md:pl-64">
          EMERGENCY — Gas leak detected • Follow evacuation procedures
        </div>
      )}

      <aside
        className={cn(
          "hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border sticky top-0 h-screen",
          emergencyActive && "mt-7 h-[calc(100vh-1.75rem)]",
        )}
      >
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <img src={logo} alt="Smart Campus" className="h-11 w-11 rounded-lg bg-white p-1 object-contain" />
          <div>
            <div className="font-bold text-sm leading-tight">Smart Campus</div>
            <div className="text-[11px] text-sidebar-foreground/60">
              {role === "student" ? "Student Portal" : "Automation System"}
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((n) => {
            const active = path.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {role === "admin" && (
            <div className="px-3 py-2.5 rounded-lg bg-sidebar-accent text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sidebar-foreground/60">Arduino</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      arduinoConnected ? "bg-success" : "bg-destructive",
                    )}
                  />
                  {arduinoConnected ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sidebar-foreground/60">Firebase</span>
                <span className="flex items-center gap-1.5">
                  <CircleDot
                    className={cn("h-3 w-3", firebaseSync ? "text-success" : "text-destructive")}
                  />
                  {firebaseSync ? "Synced" : "Down"}
                </span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              logout();
              navigate({ to: loginPath as "/login" });
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div
          className={cn(
            "md:hidden fixed top-0 inset-x-0 z-30 bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center justify-between border-b border-sidebar-border",
            emergencyActive && "top-7",
          )}
        >
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-8 w-8 rounded bg-white p-0.5 object-contain" />
            <span className="font-semibold text-sm">Smart Campus</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell className="text-sidebar-foreground hover:bg-sidebar-accent" />
            <button
              type="button"
              onClick={() => {
                logout();
                navigate({ to: loginPath as "/login" });
              }}
              className="text-xs flex items-center gap-1 px-2"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-end gap-2 px-6 py-2 border-b bg-card/50">
          <NotificationBell />
        </div>

        <SessionStatusBar />

        <main
          className={cn(
            "flex-1 min-w-0 pt-14 md:pt-0 pb-20 md:pb-0",
            emergencyActive && "md:pt-7",
            emergencyActive && "pt-[4.25rem]",
          )}
        >
          <div
            className={cn(
              emergencyActive && "animate-[emergency-glow_2s_ease-in-out_infinite]",
            )}
          >
            {children}
          </div>
        </main>

        <nav
          className={cn(
            "md:hidden fixed bottom-0 inset-x-0 z-30 bg-sidebar border-t border-sidebar-border flex",
            emergencyActive && "pb-safe",
          )}
        >
          {nav.slice(0, 4).map((n) => {
            const active = path.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex-1 flex flex-col items-center py-2 text-[10px] gap-1",
                  active ? "text-sidebar-primary" : "text-sidebar-foreground/60",
                )}
              >
                <Icon className="h-5 w-5" />
                {n.label.split(" ")[0]}
              </Link>
            );
          })}
          <Link
            to="/complaints"
            className={cn(
              "flex-1 flex flex-col items-center py-2 text-[10px] gap-1",
              path.startsWith("/complaints") ? "text-sidebar-primary" : "text-sidebar-foreground/60",
            )}
          >
            <Bell className="h-5 w-5" />
            Alerts
          </Link>
        </nav>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
