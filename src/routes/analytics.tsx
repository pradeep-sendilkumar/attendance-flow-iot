import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, Utensils, Leaf, Award } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Smart Campus" }] }),
  component: () => <AppShell><AnalyticsPage /></AppShell>,
});

function AnalyticsPage() {
  const { students, foodHistory } = useApp();
  const total = students.length;

  const trend = useMemo(() => foodHistory.slice(-7).map((f) => ({
    date: new Date(f.date).toLocaleDateString("en", { weekday: "short" }),
    Present: f.presentCount,
    Absent: Math.max(0, total - f.presentCount),
    Attendance: total > 0 ? Math.round((f.presentCount / total) * 100) : 0,
  })), [foodHistory, total]);

  const foodChart = foodHistory.slice(-7).map((f) => ({
    date: new Date(f.date).toLocaleDateString("en", { weekday: "short" }),
    Prepared: f.totalPrepared,
    Consumed: f.consumed,
    Saved: f.saved,
  }));

  const avgAttendance = trend.length
    ? Math.round(trend.reduce((s, t) => s + t.Attendance, 0) / trend.length)
    : 0;
  const totalSaved = foodHistory.reduce((s, f) => s + f.saved, 0);
  const totalPrepared = foodHistory.reduce((s, f) => s + f.totalPrepared, 0);
  const avgWaste = foodHistory.length
    ? Math.round(foodHistory.reduce((s, f) => s + f.wastePercent, 0) / foodHistory.length)
    : 0;

  const lastSession = foodHistory[foodHistory.length - 1];
  const pieData = lastSession ? [
    { name: "Consumed", value: lastSession.consumed, color: "oklch(0.42 0.14 255)" },
    { name: "Saved", value: lastSession.saved, color: "oklch(0.65 0.18 145)" },
  ] : [];

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto">
      <PageHeader title="Analytics" subtitle="Performance trends & food optimization insights" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <SummaryCard icon={TrendingUp} label="Avg Attendance" value={`${avgAttendance}%`} accent="primary" />
        <SummaryCard icon={Utensils} label="Meals Prepared" value={totalPrepared} accent="warning" />
        <SummaryCard icon={Leaf} label="Meals Saved" value={totalSaved} accent="success" />
        <SummaryCard icon={Award} label="Avg Waste" value={`${avgWaste}%`} accent={avgWaste > 20 ? "destructive" : "success"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Attendance Trend (7 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.42 0.14 255)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.42 0.14 255)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 240)" />
                <XAxis dataKey="date" stroke="oklch(0.5 0.03 250)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 250)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 240)" }} />
                <Area type="monotone" dataKey="Attendance" stroke="oklch(0.42 0.14 255)" strokeWidth={2} fill="url(#attGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Present vs Absent</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 240)" />
                <XAxis dataKey="date" stroke="oklch(0.5 0.03 250)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 250)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 240)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Present" fill="oklch(0.65 0.18 145)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Absent" fill="oklch(0.6 0.22 25)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Food Consumption vs Wastage</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={foodChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 240)" />
                <XAxis dataKey="date" stroke="oklch(0.5 0.03 250)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 250)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 240)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Prepared" stroke="oklch(0.78 0.16 75)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Consumed" stroke="oklch(0.42 0.14 255)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Saved" stroke="oklch(0.65 0.18 145)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Last Session Breakdown</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                    {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 240)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                No session data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent: "primary" | "success" | "destructive" | "warning" }) {
  const colors = {
    primary: "from-primary/20 to-primary/5 text-primary",
    success: "from-success/20 to-success/5 text-success",
    destructive: "from-destructive/20 to-destructive/5 text-destructive",
    warning: "from-warning/30 to-warning/5 text-warning-foreground",
  } as const;
  return (
    <Card className="shadow-card overflow-hidden">
      <CardContent className={`p-4 md:p-5 bg-gradient-to-br ${colors[accent]}`}>
        <Icon className="h-5 w-5 mb-2 opacity-80" />
        <div className="text-xs font-medium opacity-80 uppercase tracking-wide">{label}</div>
        <div className="text-2xl md:text-3xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}
