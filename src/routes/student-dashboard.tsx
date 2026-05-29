import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { getFoodPreference, studentAttendancePercent } from "@/lib/selectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  ClipboardCheck,
  Utensils,
  MessageSquare,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { FoodPreferenceToggle } from "@/components/FoodPreferenceToggle";

export const Route = createFileRoute("/student-dashboard")({
  head: () => ({ meta: [{ title: "Student Dashboard — Smart Campus" }] }),
  component: () => (
    <AppShell>
      <StudentDashboardPage />
    </AppShell>
  ),
});

function StudentDashboardPage() {
  const {
    getCurrentStudent,
    attendance,
    currentSessionId,
    foodPreferences,
    canEditFoodPreference,
    setFoodPreference,
    notifications,
    emergencyActive,
    complaints,
  } = useApp();

  const student = getCurrentStudent();
  const pref = student ? getFoodPreference(student.id, foodPreferences) : "eating";
  const canEdit = canEditFoodPreference();

  const todayRecord = useMemo(() => {
    if (!student) return null;
    return attendance.find(
      (a) => a.studentId === student.id && a.sessionId === currentSessionId,
    );
  }, [attendance, student, currentSessionId]);

  const attPct = student ? studentAttendancePercent(student.id, attendance) : 0;
  const myComplaints = complaints.filter((c) => c.studentId === student?.id);
  const unread = notifications.filter((n) => !n.read).length;

  if (!student) return null;

  const isPresent = todayRecord?.status === "present";

  return (
    <div className="p-4 md:p-8 max-w-[900px] mx-auto">
      <PageHeader title={`Welcome, ${student.name.split(" ")[0]}`} subtitle="Your campus dashboard" />

      <Card className="shadow-card mb-4 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
        <CardContent className="p-5 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="font-bold text-lg">{student.name}</div>
              <div className="text-sm text-muted-foreground">Room {student.roomNumber}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{attPct}%</div>
            <div className="text-xs text-muted-foreground">Attendance</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" /> Today&apos;s Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={cn(
                isPresent && "bg-success text-success-foreground",
                todayRecord?.status === "absent" && "bg-destructive text-destructive-foreground",
                !todayRecord && "bg-muted text-muted-foreground",
              )}
            >
              {!todayRecord ? "NOT MARKED" : isPresent ? "PRESENT" : "ABSENT"}
            </Badge>
            {todayRecord && (
              <p className="text-xs text-muted-foreground mt-2">
                Last update: {new Date(todayRecord.timestamp).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Utensils className="h-4 w-4 text-accent" /> Food Preference
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FoodPreferenceToggle
              value={pref}
              disabled={!canEdit || !isPresent}
              onChange={(v) => {
                if (setFoodPreference(student.id, v)) {
                  // toast handled in store
                }
              }}
            />
            {!canEdit && (
              <p className="text-xs text-muted-foreground">Session closed — preferences locked.</p>
            )}
            {!isPresent && canEdit && (
              <p className="text-xs text-warning-foreground">Mark attendance first to set meal preference.</p>
            )}
            <p className="text-xs text-muted-foreground">Default: Will Eat if no selection during session.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Button variant="outline" asChild className="h-auto py-3 flex-col gap-1">
            <Link to="/student-food">
              <Utensils className="h-4 w-4" />
              <span className="text-xs">Food Preference</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto py-3 flex-col gap-1">
            <Link to="/complaints">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">Complaints</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
            {unread > 0 && <Badge variant="destructive">{unread}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-48 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.slice(0, 8).map((n) => (
              <div
                key={n.id}
                className={cn("p-2 rounded-lg text-sm", !n.read && "bg-primary/5 border border-primary/10")}
              >
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground">{n.message}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {emergencyActive && (
        <Card className="mt-4 border-destructive bg-destructive/10">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive shrink-0" />
            <div>
              <div className="font-bold text-destructive">Emergency Alert Active</div>
              <p className="text-sm text-muted-foreground">Gas leak detected. Follow warden instructions.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {myComplaints.length > 0 && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          {myComplaints.filter((c) => c.status !== "resolved").length} open complaint(s)
        </p>
      )}
    </div>
  );
}
