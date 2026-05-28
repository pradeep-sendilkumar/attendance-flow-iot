import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users, UserCheck, UserX, Utensils, CloudRain, Sun, Smartphone,
  Activity, TrendingUp, Wifi, Database, Clock, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Smart Campus" }] }),
  component: () => <AppShell><DashboardPage /></AppShell>,
});

function DashboardPage() {
  const { students, attendance, currentSessionId, rainDetected, servoActive, arduinoConnected, firebaseSync, lastDataReceived } = useApp();
  const [, force] = useState(0);
  useEffect(() => { const i = setInterval(() => force((x) => x + 1), 1000); return () => clearInterval(i); }, []);

  const presentIds = useMemo(() => new Set(
    attendance.filter((a) => a.sessionId === currentSessionId && a.status === "present").map((a) => a.studentId)
  ), [attendance, currentSessionId]);

  const total = students.length;
  const present = presentIds.size;
  const absent = total - present;
  const foodRequired = present;
  const prepared = Math.max(total, present + 2);
  const consumed = present;
  const saved = Math.max(0, prepared - consumed);
  const wastePct = prepared > 0 ? Math.round((saved / prepared) * 100) : 0;
  const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;

  const recent = attendance.slice(0, 8);
  const secondsAgo = Math.floor((Date.now() - lastDataReceived) / 1000);

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto">
      <PageHeader
        title="Control Center"
        subtitle="Live overview of campus IoT systems"
        actions={
          <Badge variant="outline" className="gap-1.5 py-1.5">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Live
          </Badge>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={Users} label="Total Students" value={total} accent="primary" />
        <StatCard icon={UserCheck} label="Present" value={present} sub={`${attendancePct}%`} accent="success" />
        <StatCard icon={UserX} label="Absent" value={absent} accent="destructive" />
        <StatCard icon={Utensils} label="Food Required" value={foodRequired} sub="meals" accent="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {/* Food */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Utensils className="h-4 w-4 text-accent" /> Smart Food Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FoodTile label="Breakfast" value={present} />
              <FoodTile label="Lunch" value={present} />
              <FoodTile label="Dinner" value={present} />
              <FoodTile label="Total Prepared" value={prepared} />
            </div>
            <div className="mt-5 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Consumed</span>
                  <span className="font-medium">{consumed} / {prepared}</span>
                </div>
                <Progress value={prepared > 0 ? (consumed / prepared) * 100 : 0} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <MiniStat label="Consumed" value={consumed} color="text-primary" />
                <MiniStat label="Saved" value={saved} color="text-success" />
                <MiniStat label="Waste %" value={`${wastePct}%`} color={wastePct > 20 ? "text-destructive" : "text-success"} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rain + SMS */}
        <div className="space-y-4">
          <Card className={cn("shadow-card border-2", rainDetected ? "border-primary/40" : "border-transparent")}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {rainDetected ? <CloudRain className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-warning" />}
                Rain Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={cn(
                "rounded-xl p-4 text-center",
                rainDetected ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning-foreground"
              )}>
                <div className="text-2xl font-bold">{rainDetected ? "Rain Detected" : "Clear Skies"}</div>
                <div className="text-xs opacity-70 mt-1">Sensor live reading</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Cloth Protection
                </div>
                <Badge className={servoActive ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                  Servo {servoActive ? "ACTIVE" : "IDLE"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Smartphone className="h-4 w-4 text-primary" /> SMS Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{attendance.filter((a) => a.smsSent).length}</div>
              <p className="text-xs text-muted-foreground mt-1">Parent notifications sent</p>
              <div className="mt-3 text-xs text-muted-foreground">Visual SMS status only • API integration ready</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent activity + system status */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" /> Recent Attendance Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No activity yet. Scan an RFID card on the Attendance page.
              </div>
            ) : (
              <ul className="space-y-2">
                {recent.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                        r.status === "present" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                      )}>
                        {r.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{r.studentName}</div>
                        <div className="text-xs text-muted-foreground">{r.rfid} • {r.status === "present" ? "Marked Present" : "SMS Sent to Parent"}</div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(r.timestamp).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-accent" /> System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusRow icon={Wifi} label="Arduino Uno" value={arduinoConnected ? "Connected" : "Disconnected"} ok={arduinoConnected} />
            <StatusRow icon={Database} label="Firebase Sync" value={firebaseSync ? "Live" : "Offline"} ok={firebaseSync} />
            <StatusRow icon={Clock} label="Last Data" value={`${secondsAgo}s ago`} ok={secondsAgo < 15} />
            <div className="pt-2 border-t text-xs text-muted-foreground">
              Session ID: <span className="font-mono">{currentSessionId.slice(-8)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: number | string; sub?: string; accent: "primary" | "success" | "destructive" | "warning" }) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 text-warning-foreground",
  } as const;
  return (
    <Card className="shadow-card">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</div>
            <div className="text-3xl font-bold mt-1.5">{value}</div>
            {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
          </div>
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", colors[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FoodTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-muted/60 to-muted/20 p-3 border border-border/50">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className={cn("text-xl font-bold", color)}>{value}</div>
    </div>
  );
}

function StatusRow({ icon: Icon, label, value, ok }: { icon: any; label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", ok ? "bg-success animate-pulse" : "bg-destructive")} />
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}
