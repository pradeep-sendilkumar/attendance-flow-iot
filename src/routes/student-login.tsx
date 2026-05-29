import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { GraduationCap, Loader2 } from "lucide-react";

export const Route = createFileRoute("/student-login")({
  head: () => ({ meta: [{ title: "Student Login — Smart Campus" }] }),
  component: StudentLoginPage,
});

function StudentLoginPage() {
  const { loginStudent, isAuthed, role } = useApp();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthed && role === "student") navigate({ to: "/student-dashboard" });
    if (isAuthed && role === "admin") navigate({ to: "/dashboard" });
  }, [isAuthed, role, navigate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = loginStudent(identifier.trim(), password);
      setLoading(false);
      if (ok) {
        toast.success("Welcome to Student Portal");
        navigate({ to: "/student-dashboard" });
      } else {
        toast.error("Invalid credentials. Use email/RFID + student123");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src={logo} alt="" className="h-12 w-12 rounded-xl" />
          <div>
            <div className="font-bold">Smart Campus</div>
            <div className="text-xs text-muted-foreground">Student Portal</div>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <GraduationCap className="h-3.5 w-3.5" /> Student access only
          </div>
          <h1 className="text-xl font-bold">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Use email or RFID ID. Accounts are created by admin — no self-registration.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">Email or RFID ID</Label>
              <Input
                id="id"
                placeholder="aarav@campus.edu or RFID001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sp">Password</Label>
              <Input
                id="sp"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-eco" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Demo: <span className="font-mono">RFID001</span> / <span className="font-mono">student123</span>
          </p>
          <p className="mt-4 text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Admin login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
