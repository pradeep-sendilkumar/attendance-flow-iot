import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useApp, GasStatus } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoSimulationPanel } from "@/components/DemoSimulationPanel";
import { Flame, Siren, Activity, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gas-monitoring")({
  head: () => ({ meta: [{ title: "Gas Monitoring — Smart Campus" }] }),
  component: () => (
    <AppShell>
      <GasMonitoringPage />
    </AppShell>
  ),
});

const statusConfig: Record<GasStatus, { label: string; className: string }> = {
  safe: { label: "Safe", className: "bg-success text-success-foreground" },
  warning: { label: "Warning", className: "bg-warning text-warning-foreground" },
  critical: { label: "Critical Alert", className: "bg-destructive text-destructive-foreground animate-pulse" },
};

function GasMonitoringPage() {
  const { gasStatus, emergencyActive, gasLogs, simulateGasLeak, resolveEmergency, setGasStatus } = useApp();
  const cfg = statusConfig[gasStatus];

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto">
      <PageHeader
        title="Gas Sensor Monitoring"
        subtitle="MQ-series gas detection • Arduino Uno ready"
        actions={
          <Badge className={cfg.className}>{cfg.label}</Badge>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className={cn("shadow-card lg:col-span-2", emergencyActive && "border-destructive ring-2 ring-destructive/30")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-4 w-4" /> Gas Sensor Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "rounded-2xl p-8 text-center transition-all",
                gasStatus === "safe" && "bg-success/10",
                gasStatus === "warning" && "bg-warning/15",
                gasStatus === "critical" && "bg-destructive/15",
              )}
            >
              {emergencyActive ? (
                <Siren className="h-16 w-16 mx-auto text-destructive animate-bounce mb-3" />
              ) : (
                <Flame className="h-16 w-16 mx-auto text-muted-foreground mb-3" />
              )}
              <div className="text-2xl font-bold">{cfg.label}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {gasStatus === "critical" ? "Evacuate — leak detected" : "Air quality within safe limits"}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => setGasStatus("warning", "Elevated readings", "demo")}>
                Simulate Warning
              </Button>
              <Button size="sm" variant="destructive" onClick={simulateGasLeak} disabled={emergencyActive}>
                Simulate Gas Leak
              </Button>
              <Button size="sm" variant="secondary" onClick={resolveEmergency} disabled={!emergencyActive}>
                Resolve Gas Leak
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Emergency</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={emergencyActive ? "bg-destructive" : "bg-muted text-muted-foreground"}>
              {emergencyActive ? "ACTIVE" : "Inactive"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-3">
              Buzzer/siren animation triggers on admin & student dashboards when critical.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Gas Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {gasLogs.length === 0 ? (
                <li className="text-sm text-muted-foreground py-4 text-center">No logs yet</li>
              ) : (
                gasLogs.map((log) => (
                  <li key={log.id} className="flex justify-between gap-2 p-2 rounded-lg bg-muted/40 text-sm">
                    <span>{log.message}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="h-4 w-4" /> Arduino Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Placeholder: Serial.read() → Firebase → real-time gas updates.</p>
            <p>Toggle hardware mode when Uno + MQ sensor is connected.</p>
            <Badge variant="outline">Demo Simulation Mode</Badge>
          </CardContent>
        </Card>
      </div>

      <DemoSimulationPanel />
    </div>
  );
}
