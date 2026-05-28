import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { useEffect } from "react";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart3,
  LogOut,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
  { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AppShell() {
  const { isAuthed, logout, arduinoConnected, firebaseSync } = useApp();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isAuthed) navigate({ to: "/login" });
  }, [isAuthed, navigate]);

  if (!isAuthed) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <img src={logo} alt="Smart Campus" className="h-11 w-11 rounded-lg bg-white p-1 object-contain" />
          <div>
            <div className="font-bold text-sm leading-tight">Smart Campus</div>
            <div className="text-[11px] text-sidebar-foreground/60">Automation System</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
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
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="px-3 py-2 rounded-lg bg-sidebar-accent text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sidebar-foreground/60">Arduino</span>
              <span className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full pulse-dot",
                    arduinoConnected ? "text-success bg-success" : "text-destructive bg-destructive"
                  )}
                />
                {arduinoConnected ? "Online" : "Offline"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sidebar-foreground/60">Firebase</span>
              <span className="flex items-center gap-1.5">
                <CircleDot className={cn("h-3 w-3", firebaseSync ? "text-success" : "text-destructive")} />
                {firebaseSync ? "Synced" : "Down"}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="h-8 w-8 rounded bg-white p-0.5 object-contain" />
          <span className="font-semibold text-sm">Smart Campus</span>
        </div>
        <button
          onClick={() => {
            logout();
            navigate({ to: "/login" });
          }}
          className="text-xs flex items-center gap-1"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <main className="flex-1 min-w-0 pt-14 md:pt-0 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-sidebar border-t border-sidebar-border flex">
        {nav.map((n) => {
          const active = path.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex-1 flex flex-col items-center py-2 text-[10px] gap-1",
                active ? "text-sidebar-primary" : "text-sidebar-foreground/60"
              )}
            >
              <Icon className="h-5 w-5" />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
