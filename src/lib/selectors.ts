import type { AttendanceRecord, FoodPreference, Student } from "./store";

export function getPresentStudentIds(
  attendance: AttendanceRecord[],
  sessionId: string,
): Set<string> {
  return new Set(
    attendance
      .filter((a) => a.sessionId === sessionId && a.status === "present")
      .map((a) => a.studentId),
  );
}

export function getFoodPreference(
  studentId: string,
  foodPreferences: Record<string, FoodPreference>,
): FoodPreference {
  return foodPreferences[studentId] ?? "eating";
}

export function computeFoodStats(
  students: Student[],
  attendance: AttendanceRecord[],
  sessionId: string,
  foodPreferences: Record<string, FoodPreference>,
) {
  const presentIds = getPresentStudentIds(attendance, sessionId);
  const present = students.filter((s) => presentIds.has(s.id));
  let eating = 0;
  let notEating = 0;
  let pendingResponse = 0;

  for (const s of present) {
    if (!(s.id in foodPreferences)) {
      pendingResponse++;
      eating++;
      continue;
    }
    if (foodPreferences[s.id] === "not_eating") notEating++;
    else eating++;
  }

  const foodRequired = eating;
  const prepared = Math.max(students.length, present.length + 2);
  const optOutSaved = notEating;
  const participationRate =
    present.length > 0 ? Math.round((eating / present.length) * 100) : 0;

  return {
    presentCount: present.length,
    eating,
    notEating,
    pendingResponse,
    foodRequired,
    prepared,
    consumed: foodRequired,
    saved: Math.max(0, prepared - foodRequired),
    optOutSaved,
    participationRate,
    wastePrevented: optOutSaved,
  };
}

export function studentAttendancePercent(
  studentId: string,
  attendance: AttendanceRecord[],
): number {
  const records = attendance.filter((a) => a.studentId === studentId);
  if (records.length === 0) return 0;
  const present = records.filter((a) => a.status === "present").length;
  return Math.round((present / records.length) * 100);
}
