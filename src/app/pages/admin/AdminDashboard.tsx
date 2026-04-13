import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { auth } from "../../services/firebase";
import {
  Trophy, Users, Send, TrendingUp, Activity, ArrowRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const API = "http://localhost:3000/api";

const admins = ["admin1@gmail.com", "admin2@gmail.com"];

const statCards = [
  { label: "Total Contests",  value: "5",    sub: "2 upcoming",   icon: Trophy   },
  { label: "Active Now",      value: "1",    sub: "Contest Live",  icon: Activity },
  { label: "Participants",    value: "1284", sub: "+342 today",    icon: Users    },
  { label: "Submissions",     value: "3941", sub: "+352 today",    icon: Send     },
];

const submissionsChartData = [
  { time: "10:00", submissions: 0  },
  { time: "10:10", submissions: 18 },
  { time: "10:20", submissions: 47 },
  { time: "10:30", submissions: 62 },
  { time: "10:40", submissions: 55 },
  { time: "10:50", submissions: 73 },
  { time: "11:00", submissions: 84 },
  { time: "11:10", submissions: 91 },
  { time: "11:20", submissions: 68 },
  { time: "11:30", submissions: 77 },
  { time: "11:40", submissions: 95 },
  { time: "11:50", submissions: 103},
];

const verdictChartData = [
  { name: "Accepted",     value: 187, color: "#16a34a" },
  { name: "Wrong Answer", value: 94,  color: "#dc2626" },
  { name: "TLE",          value: 42,  color: "#ea580c" },
  { name: "MLE",          value: 18,  color: "#7c3aed" },
  { name: "CE",           value: 11,  color: "#6b7280" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !admins.includes(user.email || "")) {
      navigate("/admin");
    }
  }, []);

  // fetch real questions count from backend
  useEffect(() => {
    fetch(`${API}/questions`)
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(err => console.error(err));
  }, []);

  // recent submissions — still from mockdata for now
  // (replace when you add a submissions collection to Firestore)
  useEffect(() => {
    setRecentSubmissions([
      { id: "s001", user: "AlgoMaster_X",  problem: "A - Two Sum",           verdict: "Accepted",     timestamp: "10:12:34" },
      { id: "s002", user: "devstar_priya", problem: "B - Longest Palindrome", verdict: "Wrong Answer", timestamp: "10:14:02" },
      { id: "s003", user: "CodeNinja_99",  problem: "C - Binary Tree Path",   verdict: "Accepted",     timestamp: "10:15:44" },
      { id: "s004", user: "alex_coder",    problem: "A - Two Sum",            verdict: "Accepted",     timestamp: "10:17:21" },
      { id: "s005", user: "recursion_king",problem: "D - Merge K Lists",      verdict: "TLE",          timestamp: "10:18:55" },
    ]);
  }, []);

  const verdictColor: Record<string, string> = {
    "Accepted":     "text-green-600",
    "Wrong Answer": "text-red-500",
    "TLE":          "text-orange-500",
    "MLE":          "text-purple-500",
    "CE":           "text-slate-500",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm">Contest Monitoring Panel</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          // override questions count with live data
          const value = card.label === "Total Contests"
            ? String(questions.length || card.value)
            : card.value;
          return (
            <div key={card.label} className="bg-white border rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <Icon className="w-5 h-5 text-blue-600" />
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-xl font-bold">{value}</div>
              <div className="text-xs text-slate-500">{card.label}</div>
              <div className="text-xs text-slate-400">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border rounded-xl p-4">
          <h2 className="font-semibold mb-4">Submissions Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={submissionsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="submissions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <h2 className="font-semibold mb-4">Verdict Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={verdictChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                {verdictChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Recent Submissions</h2>
          <button
            onClick={() => navigate("/admin/submissions")}
            className="text-blue-600 text-sm flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {recentSubmissions.map((sub) => (
            <div key={sub.id} className="flex justify-between border-b pb-2 last:border-0">
              <div>
                <div className="text-sm font-medium">{sub.user}</div>
                <div className="text-xs text-slate-400">{sub.problem} · {sub.timestamp}</div>
              </div>
              <div className={`text-sm font-medium ${verdictColor[sub.verdict] || "text-slate-600"}`}>
                {sub.verdict}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}