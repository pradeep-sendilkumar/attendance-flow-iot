import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Siren } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmergencyOverlay() {
  const { emergencyActive, gasStatus, emergencyLogs, role, resolveEmergency } = useApp();
  if (!emergencyActive) return null;

  const latest = emergencyLogs.find((e) => e.active) ?? emergencyLogs[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-destructive/40 backdrop-blur-sm animate-in fade-in">
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl border-4 border-destructive bg-card p-6 shadow-2xl",
          "animate-pulse ring-4 ring-destructive/30",
        )}
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-bold uppercase tracking-wider">
          Emergency
        </div>
        <div className="flex flex-col items-center text-center gap-4 pt-4">
          <div className="relative">
            <Siren className="h-16 w-16 text-destructive animate-bounce" />
            <span className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-destructive">Gas Leak Detected</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Status: <span className="font-semibold uppercase">{gasStatus}</span>
            </p>
          </div>
          <div className="w-full rounded-xl bg-destructive/10 p-4 text-left text-sm space-y-2">
            <p className="font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Suggested actions
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Evacuate the affected area immediately</li>
              <li>Do not use electrical switches or open flames</li>
              <li>Contact warden and emergency services</li>
              <li>Wait for all-clear from admin</li>
            </ul>
            {latest && (
              <p className="text-xs text-muted-foreground pt-2 border-t">
                Detected: {new Date(latest.timestamp).toLocaleString()}
              </p>
            )}
          </div>
          {role === "admin" && (
            <Button className="w-full" variant="destructive" onClick={resolveEmergency}>
              Resolve Emergency
            </Button>
          )}
          {role === "student" && (
            <p className="text-xs text-muted-foreground">Admin will resolve when safe. Follow evacuation procedures.</p>
          )}
        </div>
      </div>
    </div>
  );
}
