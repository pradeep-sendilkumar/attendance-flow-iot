import { useApp } from "@/lib/store";
import { computeFoodStats } from "@/lib/selectors";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SessionStatusBar() {
  const {
    students,
    attendance,
    currentSessionId,
    sessionActive,
    sessionFinalized,
    sessionEndsAt,
    foodPreferences,
    role,
  } = useApp();
  const [, tick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(i);
  }, []);

  if (role !== "admin") return null;

  const SESSION_TOTAL = 2 * 60 * 60 * 1000;
  const stats = computeFoodStats(students, attendance, currentSessionId, foodPreferences);
  const remaining = Math.max(0, sessionEndsAt - Date.now());
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const progressPct = sessionActive
    ? Math.min(100, ((SESSION_TOTAL - remaining) / SESSION_TOTAL) * 100)
    : 100;

  return (
    <div
      className={cn(
        "border-b px-4 py-2.5 md:px-8",
        sessionActive && !sessionFinalized ? "bg-primary/5 border-primary/20" : "bg-muted/40",
      )}
    >
      <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              sessionActive && !sessionFinalized ? "bg-success animate-pulse" : "bg-muted-foreground",
            )}
          />
          <span className="text-sm font-semibold">
            {sessionActive && !sessionFinalized ? "Session Active" : "Session Closed"}
          </span>
        </div>
        {sessionActive && !sessionFinalized && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono">
              {mins}:{secs.toString().padStart(2, "0")} remaining
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0 hidden sm:block">
          <Progress value={progressPct} className="h-1.5" />
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            <strong>{stats.presentCount}</strong> present
          </span>
          <span className="flex items-center gap-1.5">
            <Utensils className="h-3.5 w-3.5 text-accent" />
            <strong>{stats.pendingResponse}</strong> food pending
          </span>
          <span className="text-muted-foreground">
            Food required: <strong className="text-foreground">{stats.foodRequired}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
