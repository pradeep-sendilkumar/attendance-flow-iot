import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export interface Student {
  id: string;
  name: string;
  rfid: string;
  className: string;
  parentPhone?: string;
  createdAt: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rfid: string;
  status: "present" | "absent";
  timestamp: number;
  sessionId: string;
  smsSent?: boolean;
  smsTimestamp?: number;
}

export interface FoodSession {
  sessionId: string;
  date: number;
  presentCount: number;
  totalPrepared: number;
  consumed: number;
  saved: number;
  wastePercent: number;
}

interface State {
  isAuthed: boolean;
  students: Student[];
  attendance: AttendanceRecord[];
  rainDetected: boolean;
  servoActive: boolean;
  arduinoConnected: boolean;
  firebaseSync: boolean;
  lastDataReceived: number;
  currentSessionId: string;
  foodHistory: FoodSession[];
}

interface Ctx extends State {
  login: (u: string, p: string) => boolean;
  logout: () => void;
  addStudent: (s: Omit<Student, "id" | "createdAt">) => void;
  removeStudent: (id: string) => void;
  scanRfid: (rfid: string) => { ok: boolean; message: string };
  setRain: (v: boolean) => void;
  endSession: () => FoodSession | null;
  startNewSession: () => void;
}

const KEY = "scas-state-v1";

const seedStudents: Student[] = [
  { id: "s1", name: "Aarav Sharma", rfid: "RFID001", className: "10-A", parentPhone: "+91 98765 43210", createdAt: Date.now() - 86400000 * 30 },
  { id: "s2", name: "Diya Patel", rfid: "RFID002", className: "10-A", parentPhone: "+91 98765 43211", createdAt: Date.now() - 86400000 * 29 },
  { id: "s3", name: "Arjun Reddy", rfid: "RFID003", className: "10-B", parentPhone: "+91 98765 43212", createdAt: Date.now() - 86400000 * 28 },
  { id: "s4", name: "Ananya Iyer", rfid: "RFID004", className: "10-B", parentPhone: "+91 98765 43213", createdAt: Date.now() - 86400000 * 27 },
  { id: "s5", name: "Vihaan Khan", rfid: "RFID005", className: "11-A", parentPhone: "+91 98765 43214", createdAt: Date.now() - 86400000 * 26 },
  { id: "s6", name: "Saanvi Singh", rfid: "RFID006", className: "11-A", parentPhone: "+91 98765 43215", createdAt: Date.now() - 86400000 * 25 },
  { id: "s7", name: "Ishaan Gupta", rfid: "RFID007", className: "11-B", parentPhone: "+91 98765 43216", createdAt: Date.now() - 86400000 * 24 },
  { id: "s8", name: "Myra Joshi", rfid: "RFID008", className: "12-A", parentPhone: "+91 98765 43217", createdAt: Date.now() - 86400000 * 23 },
];

function genFoodHistory(): FoodSession[] {
  const arr: FoodSession[] = [];
  for (let i = 14; i >= 1; i--) {
    const present = 5 + Math.floor(Math.random() * 4);
    const prepared = 8 + Math.floor(Math.random() * 2);
    const consumed = present;
    const saved = prepared - consumed;
    arr.push({
      sessionId: `sess-${i}`,
      date: Date.now() - i * 86400000,
      presentCount: present,
      totalPrepared: prepared,
      consumed,
      saved: Math.max(0, saved),
      wastePercent: prepared > 0 ? Math.round(((Math.max(0, saved)) / prepared) * 100) : 0,
    });
  }
  return arr;
}

const defaultState: State = {
  isAuthed: false,
  students: seedStudents,
  attendance: [],
  rainDetected: false,
  servoActive: false,
  arduinoConnected: true,
  firebaseSync: true,
  lastDataReceived: Date.now(),
  currentSessionId: `sess-${Date.now()}`,
  foodHistory: genFoodHistory(),
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => {
    if (typeof window === "undefined") return defaultState;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...defaultState, ...JSON.parse(raw) };
    } catch {}
    return defaultState;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(state));
    }
  }, [state]);

  // simulate live "last received" tick
  useEffect(() => {
    const t = setInterval(() => {
      setState((s) => ({ ...s, lastDataReceived: Date.now() }));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const login = useCallback((u: string, p: string) => {
    if (u === "admin" && p === "admin123") {
      setState((s) => ({ ...s, isAuthed: true }));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setState((s) => ({ ...s, isAuthed: false })), []);

  const addStudent = useCallback((s: Omit<Student, "id" | "createdAt">) => {
    setState((prev) => ({
      ...prev,
      students: [...prev.students, { ...s, id: `s-${Date.now()}`, createdAt: Date.now() }],
    }));
  }, []);

  const removeStudent = useCallback((id: string) => {
    setState((prev) => ({ ...prev, students: prev.students.filter((s) => s.id !== id) }));
  }, []);

  const scanRfid = useCallback((rfid: string) => {
    let result = { ok: false, message: "Unknown RFID card" };
    setState((prev) => {
      const stu = prev.students.find((s) => s.rfid.toLowerCase() === rfid.toLowerCase());
      if (!stu) return prev;
      const already = prev.attendance.find(
        (a) => a.studentId === stu.id && a.sessionId === prev.currentSessionId && a.status === "present"
      );
      if (already) {
        result = { ok: false, message: `${stu.name} already marked present` };
        return prev;
      }
      result = { ok: true, message: `${stu.name} marked present` };
      const rec: AttendanceRecord = {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        studentId: stu.id,
        studentName: stu.name,
        rfid: stu.rfid,
        status: "present",
        timestamp: Date.now(),
        sessionId: prev.currentSessionId,
      };
      return { ...prev, attendance: [rec, ...prev.attendance], lastDataReceived: Date.now() };
    });
    return result;
  }, []);

  const setRain = useCallback((v: boolean) => {
    setState((prev) => ({ ...prev, rainDetected: v, servoActive: v, lastDataReceived: Date.now() }));
  }, []);

  const startNewSession = useCallback(() => {
    setState((prev) => ({ ...prev, currentSessionId: `sess-${Date.now()}` }));
  }, []);

  const endSession = useCallback((): FoodSession | null => {
    let session: FoodSession | null = null;
    setState((prev) => {
      const sid = prev.currentSessionId;
      const presentIds = new Set(
        prev.attendance.filter((a) => a.sessionId === sid && a.status === "present").map((a) => a.studentId)
      );
      const absentRecs: AttendanceRecord[] = prev.students
        .filter((s) => !presentIds.has(s.id))
        .map((s) => ({
          id: `att-${Date.now()}-${s.id}`,
          studentId: s.id,
          studentName: s.name,
          rfid: s.rfid,
          status: "absent" as const,
          timestamp: Date.now(),
          sessionId: sid,
          smsSent: true,
          smsTimestamp: Date.now(),
        }));
      const presentCount = presentIds.size;
      const prepared = Math.max(prev.students.length, presentCount + 2);
      const consumed = presentCount;
      const saved = Math.max(0, prepared - consumed);
      const wastePercent = prepared > 0 ? Math.round((saved / prepared) * 100) : 0;
      session = {
        sessionId: sid,
        date: Date.now(),
        presentCount,
        totalPrepared: prepared,
        consumed,
        saved,
        wastePercent,
      };
      return {
        ...prev,
        attendance: [...absentRecs, ...prev.attendance],
        foodHistory: [...prev.foodHistory, session],
        currentSessionId: `sess-${Date.now()}`,
      };
    });
    return session;
  }, []);

  return (
    <AppContext.Provider
      value={{ ...state, login, logout, addStudent, removeStudent, scanRfid, setRain, endSession, startNewSession }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
