import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Smart Campus" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthed } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthed) navigate({ to: "/dashboard" as any });
  }, [isAuthed, navigate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Enter username and password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = login(username.trim(), password);
      setLoading(false);
      if (ok) {
        toast.success("Welcome back, Admin");
        navigate({ to: "/dashboard" as any });
      } else {
        toast.error("Invalid credentials. Try admin / admin123");
      }
    }, 500);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: brand */}
      <div className="hidden lg:flex bg-gradient-hero text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <img src={logo} alt="" className="h-12 w-12 rounded-xl bg-white p-1" />
          <div>
            <div className="font-bold text-lg">Smart Campus</div>
            <div className="text-xs opacity-70">Automation System</div>
          </div>
        </div>
        <div className="relative space-y-6">
          <img src={logo} alt="Smart Campus" className="w-80 max-w-full rounded-2xl bg-white/95 p-4 shadow-elevated" />
          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Smarter Campus.<br />
              <span className="text-accent">Better Future.</span>
            </h1>
            <p className="mt-3 text-white/70 max-w-md">
              IoT-powered attendance, food optimization, rain detection and parent
              notifications — all in one control center.
            </p>
          </div>
        </div>
        <div className="relative text-xs text-white/50">© {new Date().getFullYear()} Smart Campus Automation System</div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src={logo} alt="" className="h-12 w-12 rounded-xl" />
            <div>
              <div className="font-bold">Smart Campus</div>
              <div className="text-xs text-muted-foreground">Automation System</div>
            </div>
          </div>
          <div className="space-y-1 mb-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-2">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin Console
            </div>
            <h2 className="text-2xl font-bold">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground">Manage RFID attendance, food and IoT systems.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u">Username</Label>
              <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full bg-gradient-eco hover:opacity-90" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 p-3 rounded-lg bg-muted text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Demo credentials:</span> admin / admin123
          </div>
        </div>
      </div>
    </div>
  );
}
