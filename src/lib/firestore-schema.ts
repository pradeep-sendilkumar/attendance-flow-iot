/**
 * Firestore-ready collection shapes (demo uses localStorage via store).
 * Wire these to Firebase when integrating production backend.
 */
export const FIRESTORE_COLLECTIONS = {
  students: "students",
  attendance: "attendance",
  complaints: "complaints",
  gas_logs: "gas_logs",
  notifications: "notifications",
  food_sessions: "food_sessions",
  emergency_logs: "emergency_logs",
} as const;
