import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Search, History } from "lucide-react";

export const Route = createFileRoute("/students")({
  head: () => ({ meta: [{ title: "Students — Smart Campus" }] }),
  component: () => <AppShell><StudentsPage /></AppShell>,
});

function StudentsPage() {
  const { students, addStudent, removeStudent, attendance } = useApp();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [historyFor, setHistoryFor] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    rfid: "",
    className: "",
    parentPhone: "",
    email: "",
    password: "student123",
    roomNumber: "",
  });

  const filtered = useMemo(
    () => students.filter((s) =>
      [s.name, s.rfid, s.className].join(" ").toLowerCase().includes(query.toLowerCase())
    ),
    [students, query]
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.rfid.trim() || !form.className.trim()) {
      toast.error("Name, RFID and Class are required");
      return;
    }
    if (students.some((s) => s.rfid.toLowerCase() === form.rfid.trim().toLowerCase())) {
      toast.error("RFID already exists");
      return;
    }
    const slug = form.name.trim().toLowerCase().split(" ")[0] || "student";
    addStudent({
      name: form.name.trim(),
      rfid: form.rfid.trim(),
      className: form.className.trim(),
      parentPhone: form.parentPhone.trim(),
      email: form.email.trim() || `${slug}@campus.edu`,
      password: form.password.trim() || "student123",
      roomNumber: form.roomNumber.trim() || `R-${form.rfid.slice(-3)}`,
    });
    toast.success(`${form.name} added — student can login with email/RFID`);
    setForm({ name: "", rfid: "", className: "", parentPhone: "", email: "", password: "student123", roomNumber: "" });
    setOpen(false);
  };

  const historyStudent = students.find((s) => s.id === historyFor);
  const studentHistory = historyFor ? attendance.filter((a) => a.studentId === historyFor) : [];

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto">
      <PageHeader
        title="Student Management"
        subtitle="Add students and view their attendance history"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-eco"><Plus className="h-4 w-4 mr-1" /> Add Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Student</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>RFID ID</Label><Input value={form.rfid} onChange={(e) => setForm({ ...form, rfid: e.target.value })} placeholder="e.g. RFID009" /></div>
                <div><Label>Class</Label><Input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="e.g. 10-A" /></div>
                <div><Label>Parent Phone (optional)</Label><Input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} placeholder="+91 ..." /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@campus.edu" /></div>
                <div><Label>Room</Label><Input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} placeholder="A-101" /></div>
                <div><Label>Password</Label><Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <DialogFooter>
                  <Button type="submit" className="bg-gradient-eco">Register Student</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="shadow-card">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by name, RFID, class..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Badge variant="secondary">{filtered.length} students</Badge>
          </div>

          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>RFID ID</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="hidden md:table-cell">Parent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-eco text-primary-foreground flex items-center justify-center text-xs font-semibold">
                          {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">{s.rfid}</code></TableCell>
                    <TableCell><Badge variant="outline">{s.className}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{s.parentPhone || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setHistoryFor(s.id)}>
                        <History className="h-4 w-4 mr-1" /> History
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { removeStudent(s.id); toast.success("Student removed"); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No students found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!historyFor} onOpenChange={(o) => !o && setHistoryFor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Attendance History — {historyStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {studentHistory.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">No attendance records yet</div>
            ) : (
              studentHistory.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                  <div>
                    <Badge className={a.status === "present" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                      {a.status.toUpperCase()}
                    </Badge>
                    {a.smsSent && <span className="ml-2 text-xs text-muted-foreground">📱 SMS Sent</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
