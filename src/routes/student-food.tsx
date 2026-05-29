import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { getFoodPreference } from "@/lib/selectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodPreferenceToggle } from "@/components/FoodPreferenceToggle";
import { Utensils, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/student-food")({
  head: () => ({ meta: [{ title: "Food Preference — Smart Campus" }] }),
  component: () => (
    <AppShell>
      <StudentFoodPage />
    </AppShell>
  ),
});

function StudentFoodPage() {
  const { getCurrentStudent, foodPreferences, canEditFoodPreference, setFoodPreference, attendance, currentSessionId } =
    useApp();
  const student = getCurrentStudent();
  if (!student) return null;

  const isPresent = attendance.some(
    (a) => a.studentId === student.id && a.sessionId === currentSessionId && a.status === "present",
  );
  const pref = getFoodPreference(student.id, foodPreferences);
  const canEdit = canEditFoodPreference() && isPresent;

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <PageHeader title="Food Preference" subtitle="Opt in or out of today's meal" />
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Utensils className="h-4 w-4 text-accent" /> Today&apos;s meal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canEditFoodPreference() && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted">
              <Lock className="h-4 w-4" /> Session finalized — editing locked.
            </div>
          )}
          {!isPresent && canEditFoodPreference() && (
            <p className="text-sm text-warning-foreground">You must be marked present to set food preference.</p>
          )}
          <FoodPreferenceToggle
            value={pref}
            disabled={!canEdit}
            onChange={(v) => {
              if (setFoodPreference(student.id, v)) {
                toast.success(v === "eating" ? "You will eat today" : "Opted out of meal");
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Food required = students present who will eat. If you don&apos;t choose during an active session, default is
            Will Eat.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
