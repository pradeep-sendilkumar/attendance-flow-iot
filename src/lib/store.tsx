import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { toast } from "sonner";

export type UserRole = "admin" | "student";
export type FoodPreference = "eating" | "not_eating";
export type GasStatus = "safe" | "warning" | "critical";
export type ComplaintStatus = "pending" | "in_progress" | "resolved";
export type ComplaintPriority = "low" | "medium" | "high" | "emergency";
export type ComplaintCategory =
  | "Electricity"
  | "Water"
  | "Food"
  | "WiFi"
  | "Cleanliness"
  | "Room Maintenance"
  | "Safety"
  | "Other";

export interface Student {
  id: string;
  name: string;
  rfid: string;
  className: string;
  parentPhone?: string;
  email: string;
  password: string;
  roomNumber: string;
  createdAt: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rfid: string;
  status: "present" | "absent";
  attendanceStatus: "present" | "absent";
  foodPreference?: FoodPreference;
  timestamp: number;
  updatedAt: number;
  sessionId: string;
  smsSent?: boolean;
  smsTimestamp?: number;
}

export interface FoodSession {
  sessionId: string;
  date: number;
  presentCount: number;
  eatingCount: number;
  notEatingCount: number;
  totalPrepared: number;
  consumed: number;
  saved: number;
  optOutSaved: number;
  wastePercent: number;
  participationRate: number;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  imageDataUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppNotification {
  id: string;
  type:
    | "attendance"
    | "food"
    | "complaint"
    | "complaint_status"
    | "gas"
    | "emergency";
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
}

export interface GasLog {
  id: string;
  status: GasStatus;
  message: string;
  timestamp: number;
  source: "demo" | "hardware";
}

export interface EmergencyLog {
  id: string;
  type: "gas_leak";
  active: boolean;
  message: string;
  timestamp: number;
  resolvedAt?: number;
}

interface State {
  isAuthed: boolean;
  role: UserRole | null;
  currentStudentId: string | null;
  students: Student[];
  attendance: AttendanceRecord[];
  rainDetected: boolean;
  servoActive: boolean;
  arduinoConnected: boolean;
  firebaseSync: boolean;
  lastDataReceived: number;
  currentSessionId: string;
  foodHistory: FoodSession[];
  foodPreferences: Record<string, FoodPreference>;
  sessionActive: boolean;
  sessionFinalized: boolean;
  sessionEndsAt: number;
  gasStatus: GasStatus;
  emergencyActive: boolean;
  gasLogs: GasLog[];
  emergencyLogs: EmergencyLog[];
  complaints: Complaint[];
  notifications: AppNotification[];
  demoMode: boolean;
  hardwareMode: boolean;
}

interface Ctx extends State {
  login: (u: string, p: string) => boolean;
  loginStudent: (identifier: string, password: string) => boolean;
  logout: () => void;
  addStudent: (s: Omit<Student, "id" | "createdAt">) => void;
  removeStudent: (id: string) => void;
  scanRfid: (rfid: string) => { ok: boolean; message: string };
  setRain: (v: boolean) => void;
  setFoodPreference: (studentId: string, pref: FoodPreference) => boolean;
  canEditFoodPreference: () => boolean;
  endSession: () => FoodSession | null;
  startNewSession: () => void;
  setGasStatus: (status: GasStatus, message?: string, source?: "demo" | "hardware") => void;
  simulateGasLeak: () => void;
  resolveEmergency: () => void;
  addComplaint: (c: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "status">) => void;
  updateComplaint: (id: string, patch: Partial<Pick<Complaint, "title" | "description" | "category" | "priority" | "imageDataUrl">>) => boolean;
  setComplaintStatus: (id: string, status: ComplaintStatus) => void;
  addNotification: (n: Omit<AppNotification, "id" | "read" | "timestamp">) => void;
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  markAllNotificationsRead: () => void;
  setDemoMode: (v: boolean) => void;
  getCurrentStudent: () => Student | undefined;
}

const KEY = "scas-state-v2";
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;
const DEMO_STUDENT_PASSWORD = "student123";

const seedStudents: Student[] = [
  { id: "s1", name: "Aarav Sharma", rfid: "RFID001", className: "10-A", parentPhone: "+91 98765 43210", email: "aarav@campus.edu", password: DEMO_STUDENT_PASSWORD, roomNumber: "A-101", createdAt: Date.now() - 86400000 * 30 },
  { id: "s2", name: "Diya Patel", rfid: "RFID002", className: "10-A", parentPhone: "+91 98765 43211", email: "diya@campus.edu", password: DEMO_STUDENT_PASSWORD, roomNumber: "A-102", createdAt: Date.now() - 86400000 * 29 },
  { id: "s3", name: "Arjun Reddy", rfid: "RFID003", className: "10-B", parentPhone: "+91 98765 43212", email: "arjun@campus.edu", password: DEMO_STUDENT_PASSWORD, roomNumber: "B-201", createdAt: Date.now() - 86400000 * 28 },
  { id: "s4", name: "Ananya Iyer", rfid: "RFID004", className: "10-B", parentPhone: "+91 98765 43213", email: "ananya@campus.edu", password: DEMO_STUDENT_PASSWORD, roomNumber: "B-202", createdAt: Date.now() - 86400000 * 27 },
  { id: "s5", name: "Vihaan Khan", rfid: "RFID005", className: "11-A", parentPhone: "+91 98765 43214", email: "vihaan@campus.edu", password: DEMO_STUDENT_PASSWORD, roomNumber: "C-301", createdAt: Date.now() - 86400000 * 26 },
  { id: "s6", name: "Saanvi Singh", rfid: "RFID006", className: "11-A", parentPhone: "+91 98765 43215", email: "saanvi@campus.edu", password: DEMO_STUDENT_PASSWORD, roomNumber: "C-302", createdAt: Date.now() - 86400000 * 25 },
  { id: "s7", name: "Ishaan Gupta", rfid: "RFID007", className: "11-B", parentPhone: "+91 98765 43216", email: "ishaan@campus.edu", password: DEMO_STUDENT_PASSWORD, roomNumber: "D-401", createdAt: Date.now() - 86400000 * 24 },
  { id: "s8", name: "Myra Joshi", rfid: "RFID008", className: "12-A", parentPhone: "+91 98765 43217", email: "myra@campus.edu", password: DEMO_STUDENT_PASSWORD, roomNumber: "D-402", createdAt: Date.now() - 86400000 * 23 },
];

function genFoodHistory(): FoodSession[] {
  const arr: FoodSession[] = [];
  for (let i = 14; i >= 1; i--) {
    const present = 5 + Math.floor(Math.random() * 4);
    const notEating = Math.floor(Math.random() * 2);
    const eating = present - notEating;
    const prepared = 8 + Math.floor(Math.random() * 2);
    const consumed = eating;
    const saved = prepared - consumed;
    arr.push({
      sessionId: `sess-${i}`,
      date: Date.now() - i * 86400000,
      presentCount: present,
      eatingCount: eating,
      notEatingCount: notEating,
      totalPrepared: prepared,
      consumed,
      saved: Math.max(0, saved),
      optOutSaved: notEating,
      wastePercent: prepared > 0 ? Math.round((Math.max(0, saved) / prepared) * 100) : 0,
      participationRate: present > 0 ? Math.round((eating / present) * 100) : 0,
    });
  }
  return arr;
}

function migrateStudent(s: Partial<Student> & { id: string; name: string; rfid: string; className: string; createdAt: number }): Student {
  const slug = s.name.toLowerCase().split(" ")[0] ?? "student";
  return {
    ...s,
    email: s.email ?? `${slug}@campus.edu`,
    password: s.password ?? DEMO_STUDENT_PASSWORD,
    roomNumber: s.roomNumber ?? `R-${s.rfid.slice(-3)}`,
  } as Student;
}

const defaultState: State = {
  isAuthed: false,
  role: null,
  currentStudentId: null,
  students: seedStudents,
  attendance: [],
  rainDetected: false,
  servoActive: false,
  arduinoConnected: true,
  firebaseSync: true,
  lastDataReceived: Date.now(),
  currentSessionId: `sess-${Date.now()}`,
  foodHistory: genFoodHistory(),
  foodPreferences: {},
  sessionActive: true,
  sessionFinalized: false,
  sessionEndsAt: Date.now() + SESSION_DURATION_MS,
  gasStatus: "safe",
  emergencyActive: false,
  gasLogs: [],
  emergencyLogs: [],
  complaints: [],
  notifications: [],
  demoMode: false,
  hardwareMode: false,
};

function loadState(): State {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem("scas-state-v1");
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      students: (parsed.students ?? defaultState.students).map(migrateStudent),
      role: parsed.isAuthed ? (parsed.role ?? "admin") : null,
      currentStudentId: parsed.currentStudentId ?? null,
      foodPreferences: parsed.foodPreferences ?? {},
      gasStatus: parsed.gasStatus ?? "safe",
      emergencyActive: parsed.emergencyActive ?? false,
      gasLogs: parsed.gasLogs ?? [],
      emergencyLogs: parsed.emergencyLogs ?? [],
      complaints: parsed.complaints ?? [],
      notifications: parsed.notifications ?? [],
      demoMode: parsed.demoMode ?? false,
    };
  } catch {
    return defaultState;
  }
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(loadState);
  const demoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    const t = setInterval(() => {
      setState((s) => ({ ...s, lastDataReceived: Date.now() }));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const addNotification = useCallback((n: Omit<AppNotification, "id" | "read" | "timestamp">) => {
    const item: AppNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      read: false,
      timestamp: Date.now(),
    };
    setState((s) => ({ ...s, notifications: [item, ...s.notifications].slice(0, 100) }));
  }, []);

  const logout = useCallback(
    () =>
      setState((s) => ({
        ...s,
        isAuthed: false,
        role: null,
        currentStudentId: null,
      })),
    [],
  );

  const login = useCallback((u: string, p: string) => {
    if (u === "admin" && p === "admin123") {
      setState((s) => ({
        ...s,
        isAuthed: true,
        role: "admin",
        currentStudentId: null,
      }));
      return true;
    }
    return false;
  }, []);

  const loginStudent = useCallback((identifier: string, password: string) => {
    const id = identifier.trim().toLowerCase();
    let ok = false;
    setState((prev) => {
      const stu = prev.students.find(
        (s) =>
          s.email.toLowerCase() === id ||
          s.id.toLowerCase() === id ||
          s.rfid.toLowerCase() === id,
      );
      if (stu && stu.password === password) {
        ok = true;
        return { ...prev, isAuthed: true, role: "student", currentStudentId: stu.id };
      }
      return prev;
    });
    return ok;
  }, []);

  const getCurrentStudent = useCallback(
    () => state.students.find((s) => s.id === state.currentStudentId),
    [state.students, state.currentStudentId],
  );

  const canEditFoodPreference = useCallback(
    () => state.sessionActive && !state.sessionFinalized,
    [state.sessionActive, state.sessionFinalized],
  );

  const setFoodPreference = useCallback(
    (studentId: string, pref: FoodPreference): boolean => {
      if (!state.sessionActive || state.sessionFinalized) return false;
      setState((prev) => {
        const nextPrefs = { ...prev.foodPreferences, [studentId]: pref };
        const attendance = prev.attendance.map((a) =>
          a.studentId === studentId && a.sessionId === prev.currentSessionId && a.status === "present"
            ? { ...a, foodPreference: pref, updatedAt: Date.now() }
            : a,
        );
        return { ...prev, foodPreferences: nextPrefs, attendance };
      });
      const stu = state.students.find((s) => s.id === studentId);
      addNotification({
        type: "food",
        title: "Food preference updated",
        message: `${stu?.name ?? "Student"} selected ${pref === "eating" ? "Will Eat" : "Will Not Eat"}`,
      });
      return true;
    },
    [state.sessionActive, state.sessionFinalized, state.students, state.currentSessionId, addNotification],
  );

  const addStudent = useCallback((s: Omit<Student, "id" | "createdAt">) => {
    setState((prev) => ({
      ...prev,
      students: [
        ...prev.students,
        {
          ...s,
          password: s.password || DEMO_STUDENT_PASSWORD,
          id: `s-${Date.now()}`,
          createdAt: Date.now(),
        },
      ],
    }));
  }, []);

  const removeStudent = useCallback((id: string) => {
    setState((prev) => ({ ...prev, students: prev.students.filter((s) => s.id !== id) }));
  }, []);

  const scanRfid = useCallback(
    (rfid: string) => {
      let result = { ok: false, message: "Unknown RFID card" };
      setState((prev) => {
        const stu = prev.students.find((s) => s.rfid.toLowerCase() === rfid.toLowerCase());
        if (!stu) return prev;
        const already = prev.attendance.find(
          (a) => a.studentId === stu.id && a.sessionId === prev.currentSessionId && a.status === "present",
        );
        if (already) {
          result = { ok: false, message: `${stu.name} already marked present` };
          return prev;
        }
        result = { ok: true, message: `${stu.name} marked present` };
        const now = Date.now();
        const rec: AttendanceRecord = {
          id: `att-${now}-${Math.random().toString(36).slice(2, 7)}`,
          studentId: stu.id,
          studentName: stu.name,
          rfid: stu.rfid,
          status: "present",
          attendanceStatus: "present",
          foodPreference: prev.foodPreferences[stu.id] ?? "eating",
          timestamp: now,
          updatedAt: now,
          sessionId: prev.currentSessionId,
        };
        return { ...prev, attendance: [rec, ...prev.attendance], lastDataReceived: now };
      });
      if (result.ok) {
        addNotification({
          type: "attendance",
          title: "Attendance recorded",
          message: result.message,
        });
      }
      return result;
    },
    [addNotification],
  );

  const setRain = useCallback((v: boolean) => {
    setState((prev) => ({ ...prev, rainDetected: v, servoActive: v, lastDataReceived: Date.now() }));
  }, []);

  const setGasStatus = useCallback(
    (status: GasStatus, message?: string, source: "demo" | "hardware" = "demo") => {
      const log: GasLog = {
        id: `gas-${Date.now()}`,
        status,
        message: message ?? `Gas sensor: ${status}`,
        timestamp: Date.now(),
        source,
      };
      setState((prev) => ({
        ...prev,
        gasStatus: status,
        gasLogs: [log, ...prev.gasLogs].slice(0, 50),
        lastDataReceived: Date.now(),
      }));
    },
    [],
  );

  const simulateGasLeak = useCallback(() => {
    setGasStatus("critical", "Gas leak detected — emergency protocols activated", "demo");
    setState((prev) => {
      const log: EmergencyLog = {
        id: `em-${Date.now()}`,
        type: "gas_leak",
        active: true,
        message: "Gas leak detected in hostel block",
        timestamp: Date.now(),
      };
      return {
        ...prev,
        emergencyActive: true,
        emergencyLogs: [log, ...prev.emergencyLogs],
      };
    });
    addNotification({
      type: "gas",
      title: "Gas leak detected",
      message: "Emergency mode activated. Evacuate if necessary.",
    });
    toast.error("Gas leak detected — emergency mode active", { duration: 8000 });
  }, [setGasStatus, addNotification]);

  const resolveEmergency = useCallback(() => {
    setGasStatus("safe", "Gas levels normalized — emergency resolved", "demo");
    setState((prev) => ({
      ...prev,
      emergencyActive: false,
      emergencyLogs: prev.emergencyLogs.map((e, i) =>
        i === 0 && e.active ? { ...e, active: false, resolvedAt: Date.now() } : e,
      ),
    }));
    addNotification({
      type: "emergency",
      title: "Emergency resolved",
      message: "Gas monitoring returned to safe levels.",
    });
    toast.success("Emergency resolved");
  }, [setGasStatus, addNotification]);

  const startNewSession = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentSessionId: `sess-${Date.now()}`,
      foodPreferences: {},
      sessionActive: true,
      sessionFinalized: false,
      sessionEndsAt: Date.now() + SESSION_DURATION_MS,
    }));
    addNotification({ type: "attendance", title: "New session started", message: "Attendance & food session is now active." });
  }, [addNotification]);

  const endSession = useCallback((): FoodSession | null => {
    let session: FoodSession | null = null;
    setState((prev) => {
      const sid = prev.currentSessionId;
      const presentIds = new Set(
        prev.attendance.filter((a) => a.sessionId === sid && a.status === "present").map((a) => a.studentId),
      );
      let eatingCount = 0;
      let notEatingCount = 0;
      presentIds.forEach((id) => {
        const pref = prev.foodPreferences[id] ?? "eating";
        if (pref === "not_eating") notEatingCount++;
        else eatingCount++;
      });
      const presentCount = presentIds.size;
      const prepared = Math.max(prev.students.length, presentCount + 2);
      const consumed = eatingCount;
      const saved = Math.max(0, prepared - consumed);
      const wastePercent = prepared > 0 ? Math.round((saved / prepared) * 100) : 0;
      const participationRate = presentCount > 0 ? Math.round((eatingCount / presentCount) * 100) : 0;

      const absentRecs: AttendanceRecord[] = prev.students
        .filter((s) => !presentIds.has(s.id))
        .map((s) => {
          const now = Date.now();
          return {
            id: `att-${now}-${s.id}`,
            studentId: s.id,
            studentName: s.name,
            rfid: s.rfid,
            status: "absent" as const,
            attendanceStatus: "absent" as const,
            timestamp: now,
            updatedAt: now,
            sessionId: sid,
            smsSent: true,
            smsTimestamp: now,
          };
        });

      session = {
        sessionId: sid,
        date: Date.now(),
        presentCount,
        eatingCount,
        notEatingCount,
        totalPrepared: prepared,
        consumed,
        saved,
        optOutSaved: notEatingCount,
        wastePercent,
        participationRate,
      };

      return {
        ...prev,
        attendance: [...absentRecs, ...prev.attendance],
        foodHistory: [...prev.foodHistory, session],
        sessionActive: false,
        sessionFinalized: true,
        foodPreferences: {},
      };
    });
    return session;
  }, []);

  const addComplaint = useCallback(
    (c: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "status">) => {
      const now = Date.now();
      const complaint: Complaint = {
        ...c,
        id: `cmp-${now}`,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      };
      setState((prev) => ({ ...prev, complaints: [complaint, ...prev.complaints] }));
      addNotification({
        type: "complaint",
        title: "Complaint submitted",
        message: `${c.title} (${c.priority} priority)`,
      });
    },
    [addNotification],
  );

  const updateComplaint = useCallback((id: string, patch: Partial<Pick<Complaint, "title" | "description" | "category" | "priority" | "imageDataUrl">>) => {
    let ok = false;
    setState((prev) => {
      const idx = prev.complaints.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const c = prev.complaints[idx];
      if (c.status !== "pending") return prev;
      ok = true;
      const updated = { ...c, ...patch, updatedAt: Date.now() };
      const complaints = [...prev.complaints];
      complaints[idx] = updated;
      return { ...prev, complaints };
    });
    return ok;
  }, []);

  const setComplaintStatus = useCallback(
    (id: string, status: ComplaintStatus) => {
      setState((prev) => {
        const complaints = prev.complaints.map((c) =>
          c.id === id ? { ...c, status, updatedAt: Date.now() } : c,
        );
        return { ...prev, complaints };
      });
      const c = state.complaints.find((x) => x.id === id);
      addNotification({
        type: "complaint_status",
        title: "Complaint status updated",
        message: `${c?.title ?? "Complaint"} is now ${status.replace("_", " ")}`,
      });
    },
    [state.complaints, addNotification],
  );

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const setDemoMode = useCallback((v: boolean) => {
    setState((s) => ({ ...s, demoMode: v }));
    if (!v && demoRef.current) {
      clearInterval(demoRef.current);
      demoRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!state.demoMode || !state.isAuthed) {
      if (demoRef.current) clearInterval(demoRef.current);
      demoRef.current = null;
      return;
    }
    demoRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev.sessionActive || prev.sessionFinalized) return prev;
        const unmarked = prev.students.filter(
          (s) =>
            !prev.attendance.some(
              (a) => a.studentId === s.id && a.sessionId === prev.currentSessionId && a.status === "present",
            ),
        );
        if (unmarked.length > 0 && Math.random() > 0.6) {
          const stu = unmarked[Math.floor(Math.random() * unmarked.length)];
          const now = Date.now();
          const rec: AttendanceRecord = {
            id: `att-demo-${now}`,
            studentId: stu.id,
            studentName: stu.name,
            rfid: stu.rfid,
            status: "present",
            attendanceStatus: "present",
            foodPreference: Math.random() > 0.75 ? "not_eating" : "eating",
            timestamp: now,
            updatedAt: now,
            sessionId: prev.currentSessionId,
          };
          const foodPreferences = {
            ...prev.foodPreferences,
            [stu.id]: rec.foodPreference ?? "eating",
          };
          return {
            ...prev,
            attendance: [rec, ...prev.attendance],
            foodPreferences,
            lastDataReceived: now,
          };
        }
        return prev;
      });
    }, 8000);
    return () => {
      if (demoRef.current) clearInterval(demoRef.current);
    };
  }, [state.demoMode, state.isAuthed]);

  const value: Ctx = {
    ...state,
    login,
    loginStudent,
    logout,
    addStudent,
    removeStudent,
    scanRfid,
    setRain,
    setFoodPreference,
    canEditFoodPreference,
    endSession,
    startNewSession,
    setGasStatus,
    simulateGasLeak,
    resolveEmergency,
    addComplaint,
    updateComplaint,
    setComplaintStatus,
    addNotification,
    markNotificationRead,
    dismissNotification,
    markAllNotificationsRead,
    setDemoMode,
    getCurrentStudent,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
