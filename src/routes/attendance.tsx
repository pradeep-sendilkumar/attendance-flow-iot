import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Radio, CloudRain, Zap, StopCircle, Smartphone, Play } from "lucide-react";
import { computeFoodStats, getFoodPreference } from "@/lib/selectors";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/attendance")({
  head: () => ({ meta: [{ title: "Attendance — Smart Campus" }] }),
  component: () => <AppShell><AttendancePage /></AppShell>,
});

function AttendancePage() {
  const {
    students,
    attendance,
    currentSessionId,
    scanRfid,
    setRain,
    rainDetected,
    endSession,
    startNewSession,
    sessionActive,
    sessionFinalized,
    foodPreferences,
    setFoodPreference,
    canEditFoodPreference,
  } = useApp();
  const [rfidInput, setRfidInput] = useState("");
  const [pickStudent, setPickStudent] = useState("");

  const sessionRecords = useMemo(
    () => attendance.filter((a) => a.sessionId === currentSessionId),
    [attendance, currentSessionId]
  );
  const presentIds = new Set(sessionRecords.filter((a) => a.status === "present").map((a) => a.studentId));

  // Combined: show all students, with their live status
  const rows = students.map((s) => {
    const rec = sessionRecords.find((a) => a.studentId === s.id);
    return { student: s, status: rec?.status ?? "pending", timestamp: rec?.timestamp, smsSent: rec?.smsSent };
  });

  const handleScan = (rfid: string) => {
    if (!rfid.trim()) return;
    const result = scanRfid(rfid.trim());
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
    setRfidInput("");
  };

  const food = computeFoodStats(students, attendance, currentSessionId, foodPreferences);

  const handleEnd = () => {
    const session = endSession();
    if (session) {
      toast.success(`Session ended • ${session.presentCount} present, ${students.length - session.presentCount} absent`);
      toast.info(
        `Food: ${session.eatingCount} eating, ${session.notEatingCount} opted out • ${session.saved} meals saved`,
      );
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto">
      <PageHeader
        title="Live Attendance"
        subtitle={`Session: ${currentSessionId.slice(-10)} • ${presentIds.size} of ${students.length} present`}
        actions={
          <div className="flex gap-2">
            {(!sessionActive || sessionFinalized) && (
              <Button variant="outline" onClick={() => { startNewSession(); toast.success("New session started"); }}>
                <Play className="h-4 w-4 mr-1" /> New Session
              </Button>
            )}
            <Button variant="destructive" onClick={handleEnd} disabled={sessionFinalized}>
              <StopCircle className="h-4 w-4 mr-1" /> End Session
            </Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {/* RFID scan */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className="h-4 w-4 text-primary" /> Live RFID Input Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); handleScan(rfidInput); }} className="flex gap-2">
              <Input
                placeholder="Scan or type RFID ID (e.g. RFID001)"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                className="font-mono"
              />
              <Button type="submit" className="bg-gradient-eco">
                <Zap className="h-4 w-4 mr-1" /> Scan
              </Button>
            </form>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
              <Select value={pickStudent} onValueChange={setPickStudent}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Quick scan: pick a student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.filter((s) => !presentIds.has(s.id)).map((s) => (
                    <SelectItem key={s.id} value={s.rfid}>{s.name} • {s.rfid}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => { if (pickStudent) { handleScan(pickStudent); setPickStudent(""); } }}>
                Simulate Scan
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Food required: <strong>{food.foodRequired}</strong> (present & will eat) • Opt-out: {food.notEating}
            </p>
            <p className="text-xs text-muted-foreground">
              Demo • Arduino RFID → Firebase → dashboard
            </p>
          </CardContent>
        </Card>

        {/* Rain simulator */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CloudRain className="h-4 w-4 text-primary" /> Rain Sensor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={cn(
              "rounded-xl p-4 text-center",
              rainDetected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              <div className="text-lg font-bold">{rainDetected ? "🌧 Rain Detected" : "☀ No Rain"}</div>
              <div className="text-xs mt-1">Servo {rainDetected ? "ACTIVE" : "IDLE"}</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <span className="text-sm">Simulate Rain</span>
              <Switch checked={rainDetected} onCheckedChange={setRain} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Real-Time Attendance Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>RFID ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Food</TableHead>
                  <TableHead className="hidden md:table-cell">SMS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ student, status, timestamp, smsSent }) => {
                  const pref = getFoodPreference(student.id, foodPreferences);
                  const canEdit = canEditFoodPreference() && status === "present";
                  return (
                  <TableRow key={student.id} className={status === "present" ? "bg-success/5" : ""}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">{student.rfid}</code></TableCell>
                    <TableCell>
                      <Badge className={cn(
                        status === "present" && "bg-success text-success-foreground",
                        status === "absent" && "bg-destructive text-destructive-foreground",
                        status === "pending" && "bg-muted text-muted-foreground",
                      )}>
                        {status === "pending" ? "AWAITING" : status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {timestamp ? new Date(timestamp).toLocaleTimeString() : "—"}
                    </TableCell>
                    <TableCell>
                      {status === "present" ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={pref === "eating" ? "default" : "outline"}
                            className="h-7 text-[10px] px-2"
                            disabled={!canEdit}
                            onClick={() => setFoodPreference(student.id, "eating")}
                          >
                            Eat
                          </Button>
                          <Button
                            size="sm"
                            variant={pref === "not_eating" ? "destructive" : "outline"}
                            className="h-7 text-[10px] px-2"
                            disabled={!canEdit}
                            onClick={() => setFoodPreference(student.id, "not_eating")}
                          >
                            Skip
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {smsSent ? (
                        <span className="inline-flex items-center gap-1 text-xs text-primary">
                          <Smartphone className="h-3 w-3" /> Sent to parent
                        </span>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                  </TableRow>
                );})}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
