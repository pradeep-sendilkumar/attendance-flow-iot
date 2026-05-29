import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import {
  useApp,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES: ComplaintCategory[] = [
  "Electricity",
  "Water",
  "Food",
  "WiFi",
  "Cleanliness",
  "Room Maintenance",
  "Safety",
  "Other",
];
const PRIORITIES: ComplaintPriority[] = ["low", "medium", "high", "emergency"];
const STATUSES: ComplaintStatus[] = ["pending", "in_progress", "resolved"];

export const Route = createFileRoute("/complaints")({
  head: () => ({ meta: [{ title: "Complaints — Smart Campus" }] }),
  component: () => (
    <AppShell>
      <ComplaintsPage />
    </AppShell>
  ),
});

function priorityClass(p: ComplaintPriority) {
  if (p === "emergency") return "bg-destructive text-destructive-foreground";
  if (p === "high") return "bg-warning text-warning-foreground";
  if (p === "medium") return "bg-primary/20 text-primary";
  return "bg-muted text-muted-foreground";
}

function statusClass(s: ComplaintStatus) {
  if (s === "resolved") return "bg-success/15 text-success";
  if (s === "in_progress") return "bg-primary/15 text-primary";
  return "bg-muted text-muted-foreground";
}

function ComplaintsPage() {
  const {
    role,
    complaints,
    addComplaint,
    updateComplaint,
    setComplaintStatus,
    getCurrentStudent,
  } = useApp();
  const student = getCurrentStudent();
  const isAdmin = role === "admin";

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortPriority, setSortPriority] = useState(false);

  const [form, setForm] = useState({
    category: "Other" as ComplaintCategory,
    title: "",
    description: "",
    priority: "medium" as ComplaintPriority,
    imageDataUrl: "" as string | undefined,
  });

  const visible = useMemo(() => {
    let list = isAdmin ? [...complaints] : complaints.filter((c) => c.studentId === student?.id);
    if (filterStatus !== "all") list = list.filter((c) => c.status === filterStatus);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.studentName.toLowerCase().includes(q) ||
          c.roomNumber.toLowerCase().includes(q),
      );
    }
    if (sortPriority) {
      const order = { emergency: 0, high: 1, medium: 2, low: 3 };
      list.sort((a, b) => order[a.priority] - order[b.priority]);
    } else {
      list.sort((a, b) => b.createdAt - a.createdAt);
    }
    return list;
  }, [complaints, isAdmin, student?.id, filterStatus, query, sortPriority]);

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, imageDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description required");
      return;
    }
    addComplaint({
      studentId: student.id,
      studentName: student.name,
      roomNumber: student.roomNumber,
      category: form.category,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      imageDataUrl: form.imageDataUrl,
    });
    toast.success("Complaint submitted");
    setForm({ category: "Other", title: "", description: "", priority: "medium", imageDataUrl: undefined });
    setOpen(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto">
      <PageHeader
        title="Hostel Complaints"
        subtitle={isAdmin ? "Manage all student tickets" : "Submit and track your complaints"}
        actions={
          !isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-eco">
                  <Plus className="h-4 w-4 mr-1" /> New Complaint
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit Complaint</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-3">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v as ComplaintCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={form.priority}
                      onValueChange={(v) => setForm({ ...form, priority: v as ComplaintPriority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" /> Image (optional)
                    </Label>
                    <Input type="file" accept="image/*" onChange={onImage} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-gradient-eco">
                      Submit
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {isAdmin && (
          <>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setSortPriority((x) => !x)}>
              Sort {sortPriority ? "by date" : "by priority"}
            </Button>
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {visible.length === 0 ? (
          <Card className="md:col-span-2 shadow-card">
            <CardContent className="py-12 text-center text-muted-foreground">No complaints found</CardContent>
          </Card>
        ) : (
          visible.map((c) => (
            <Card key={c.id} className="shadow-card hover:shadow-elevated transition-shadow animate-in fade-in">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap gap-2 justify-between">
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <div className="flex gap-1">
                    <Badge className={priorityClass(c.priority)}>{c.priority}</Badge>
                    <Badge className={statusClass(c.status)}>{c.status.replace("_", " ")}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {c.studentName} • Room {c.roomNumber} • {c.category}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{c.description}</p>
                {c.imageDataUrl && (
                  <img src={c.imageDataUrl} alt="" className="rounded-lg max-h-40 object-cover w-full border" />
                )}
                <p className="text-[10px] text-muted-foreground">
                  Created {new Date(c.createdAt).toLocaleString()}
                  {c.updatedAt !== c.createdAt && ` • Updated ${new Date(c.updatedAt).toLocaleString()}`}
                </p>
                {isAdmin && (
                  <Select value={c.status} onValueChange={(v) => setComplaintStatus(c.id, v as ComplaintStatus)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {!isAdmin && c.status === "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const title = prompt("Edit title", c.title);
                      if (title && updateComplaint(c.id, { title })) toast.success("Updated");
                    }}
                  >
                    Edit (pending only)
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
