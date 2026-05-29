import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CloudRain, Flame, Play, Square } from "lucide-react";

export function DemoSimulationPanel() {
  const {
    demoMode,
    setDemoMode,
    rainDetected,
    setRain,
    emergencyActive,
    simulateGasLeak,
    resolveEmergency,
    hardwareMode,
  } = useApp();

  return (
    <Card className="shadow-card border-dashed border-2 border-accent/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Play className="h-4 w-4 text-accent" /> Smart Demo Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Auto simulation</div>
            <div className="text-xs text-muted-foreground">
              Attendance scans, food prefs, complaints & gas events
            </div>
          </div>
          <Switch checked={demoMode} onCheckedChange={setDemoMode} />
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-xs flex items-center gap-1">
              <CloudRain className="h-3 w-3" /> Rain
            </span>
            <Switch checked={rainDetected} onCheckedChange={setRain} />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 text-xs"
              onClick={simulateGasLeak}
              disabled={emergencyActive}
            >
              <Flame className="h-3 w-3 mr-1" /> Gas Leak
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={resolveEmergency}
              disabled={!emergencyActive}
            >
              <Square className="h-3 w-3 mr-1" /> Resolve
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Mode: {hardwareMode ? "Hardware (Arduino serial)" : "Demo simulation"} • Firebase-ready placeholders
        </p>
      </CardContent>
    </Card>
  );
}
