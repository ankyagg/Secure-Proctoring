import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { auth } from "../../services/firebase";
import {
  Trophy, Users, Send, TrendingUp, Activity, ArrowRight, AlertTriangle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const API = "http://localhost:3000/api";

const admins = ["admin1@gmail.com", "admin2@gmail.com"];


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [contests, setContests] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !admins.includes(user.email || "")) {
      navigate("/admin");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [qs, cs, subs] = await Promise.all([
          fetch(`${API}/questions`).then(res => res.json()),
          fetch(`${API}/contests`).then(res => res.json()),
          fetch(`${API}/submissions`).then(res => res.json()),
        ]);
        setQuestions(qs);
        setContests(cs);
        setSubmissions(subs);
        setRecentSubmissions(subs.slice(0, 5));
      } catch (err: any) {
        console.error(err);
        setError("Failed to connect to backend. Please ensure the server is running on port 3000.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate stats
  const totalContests = contests.length;
  const activeContests = contests.filter(c => {
    const now = new Date();
    const sStr = (c.startTime || c.start_time || "").replace(" ", "T");
    const eStr = (c.endTime || c.end_time || "").replace(" ", "T");
    
    if (!sStr) return false;
    const start = new Date(sStr);
    const end = eStr ? new Date(eStr) : null;
    
    return !isNaN(start.getTime()) && start <= now && (!end || end >= now);
  }).length;
  const totalParticipants = new Set(submissions.map(s => s.user_email)).size;
  const totalSubmissions = submissions.length;

  const statCardsData = [
    { label: "Total Contests",  value: String(totalContests),    sub: `${contests.length} total`,  icon: Trophy   },
    { label: "Active Now",      value: String(activeContests),    sub: activeContests > 0 ? "Contest Live" : "No Contests Live", icon: Activity },
    { label: "Participants",    value: String(totalParticipants), sub: "Unique users",  icon: Users    },
    { label: "Submissions",     value: String(totalSubmissions),  sub: "Total attempts", icon: Send     },
  ];

  // Prepare chart data
  const submissionsChartData = submissions.slice(0, 10).reverse().map(s => ({
    time: s.timestamp ? s.timestamp.split('T')[1].substring(0, 5) : '00:00',
    submissions: 1 
  }));

  const verdictCounts = submissions.reduce((acc: any, s: any) => {
    const v = s.passed_all ? "Accepted" : "Wrong Answer";
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});

  const verdictChartData = [
    { name: "Accepted",     value: verdictCounts["Accepted"] || 0, color: "#16a34a" },
    { name: "Wrong Answer", value: verdictCounts["Wrong Answer"] || 0,  color: "#dc2626" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
       <div className="animate-pulse text-slate-400">Loading Dashboard Data...</div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
        <AlertTriangle className="w-5 h-5" />
        <div>
          <p className="font-bold">Backend Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm"
      >
        Retry Connection
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm">Contest Monitoring Panel</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardsData.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <Icon className="w-5 h-5 text-blue-600" />
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-xl font-bold">{card.value}</div>
              <div className="text-xs text-slate-500">{card.label}</div>
              <div className="text-xs text-slate-400">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border rounded-xl p-4">
          <h2 className="font-semibold mb-4">Last 10 Submissions (Timeline)</h2>
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
                <div className="text-sm font-medium">{sub.user_name}</div>
                <div className="text-xs text-slate-400">{sub.question_title} · {new Date(sub.timestamp).toLocaleTimeString()}</div>
              </div>
              <div className={`text-sm font-medium ${sub.passed_all ? "text-green-600" : "text-red-500"}`}>
                {sub.passed_all ? "Accepted" : "Wrong Answer"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}