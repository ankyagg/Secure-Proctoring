import { useNavigate } from "react-router";
import {
  Trophy,
  Users,
  Send,
  Zap,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { submissionsChartData, verdictChartData, adminSubmissions } from "../../data/mockData";

const statCards = [
  { label: "Total Contests", value: "5", sub: "2 upcoming", icon: Trophy, color: "bg-blue-600", light: "bg-blue-50 text-blue-600" },
  { label: "Active Now", value: "1", sub: "WDC #42 — Live", icon: Activity, color: "bg-green-600", light: "bg-green-50 text-green-600" },
  { label: "Participants", value: "1,284", sub: "+342 today", icon: Users, color: "bg-violet-600", light: "bg-violet-50 text-violet-600" },
  { label: "Submissions", value: "3,941", sub: "+352 today", icon: Send, color: "bg-amber-500", light: "bg-amber-50 text-amber-600" },
];

const verdictBadge: Record<string, string> = {
  Accepted: "bg-green-50 text-green-700 border-green-200",
  "Wrong Answer": "bg-red-50 text-red-700 border-red-200",
  TLE: "bg-orange-50 text-orange-700 border-orange-200",
  MLE: "bg-purple-50 text-purple-700 border-purple-200",
  CE: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.4rem" }}>
            Overview
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Monday, March 2, 2026 · Weekly DSA Championship #42 is LIVE
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm text-green-700">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          System Healthy
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${card.light} flex items-center justify-center`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.6rem", lineHeight: 1 }}>
                {card.value}
              </div>
              <div className="text-slate-400 text-xs mt-1">{card.label}</div>
              <div className="text-slate-500 text-xs mt-0.5">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Submissions chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
                Submissions Over Time
              </h2>
              <p className="text-slate-400 text-xs">Today · WDC #42</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={submissionsChartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar dataKey="submissions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Verdict distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="mb-5">
            <h2 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
              Verdict Distribution
            </h2>
            <p className="text-slate-400 text-xs">All submissions today</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={verdictChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
              >
                {verdictChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {verdictChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-500">{item.name}</span>
                </div>
                <span className="text-slate-700" style={{ fontWeight: 500 }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent submissions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
              Recent Submissions
            </h2>
            <button
              onClick={() => navigate("/admin/submissions")}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            {adminSubmissions.slice(0, 6).map((sub) => (
              <div key={sub.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-600" style={{ fontWeight: 600 }}>
                    {sub.user.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-slate-700 text-xs" style={{ fontWeight: 500 }}>
                      {sub.user}
                    </div>
                    <div className="text-slate-400 text-xs">{sub.problem}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${verdictBadge[sub.verdict] ?? verdictBadge["CE"]}`}>
                    {sub.verdict}
                  </span>
                  <span className="text-slate-400 text-xs">{sub.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>
            System Health
          </h2>
          <div className="space-y-3">
            {[
              { name: "Judge Server", status: "Operational", ok: true },
              { name: "Database", status: "Operational", ok: true },
              { name: "Anti-Cheat Engine", status: "Operational", ok: true },
              { name: "Webcam Processing", status: "Operational", ok: true },
              { name: "Submission Queue", status: "14 pending", ok: true },
              { name: "Active Violations", status: "6 flagged", ok: false },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-slate-600 text-sm">{item.name}</span>
                <div className={`flex items-center gap-1.5 text-xs ${item.ok ? "text-green-600" : "text-amber-600"}`}>
                  <span className={`w-2 h-2 rounded-full ${item.ok ? "bg-green-500" : "bg-amber-500"}`} />
                  {item.status}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate("/admin/anticheat")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              View Anti-Cheat Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
