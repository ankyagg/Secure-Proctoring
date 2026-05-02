import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { account, databases, APPWRITE_DB_ID } from "../../services/appwrite";
import {
  Trophy, Users, Send, TrendingUp, Activity, ArrowRight, AlertTriangle, ShieldCheck, Zap, Layers, Cpu
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Query } from "appwrite";
import { motion } from "framer-motion";

const admins = [
  "mansiparande2006@gmail.com",
  "ixaaniketwalanj@gmail.com",
  "admin@proctor.com"
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [contests, setContests] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await account.get();
        if (!admins.includes(user.email)) {
          navigate("/");
        }
      } catch (e) {
        navigate("/login");
      }
    };
    checkAuth();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [qs, cs, subs, us] = await Promise.all([
        databases.listDocuments(APPWRITE_DB_ID, "questions", [Query.limit(100)]),
        databases.listDocuments(APPWRITE_DB_ID, "contests", [Query.limit(100)]),
        databases.listDocuments(APPWRITE_DB_ID, "submissions", [Query.orderDesc("$createdAt"), Query.limit(100)]),
        databases.listDocuments(APPWRITE_DB_ID, "users", [Query.limit(100)]),
      ]);
      setQuestions(qs.documents);
      setContests(cs.documents);
      setSubmissions(subs.documents);
      setUsers(us.documents);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load data from Appwrite.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalParticipants = users.length;
  const activeContests = contests.filter(c => {
    const now = new Date();
    const start = new Date(c.start_time);
    const end = new Date(c.end_time);
    return start <= now && end >= now;
  }).length;

  const statCardsData = [
    { label: "Live Contests", value: String(activeContests), sub: "Running now", icon: Activity, color: "text-[#0099ff]" },
    { label: "Submissions", value: String(submissions.length), sub: "Total today", icon: Layers, color: "text-emerald-500" },
    { label: "Total Users", value: String(totalParticipants), sub: "Unique students", icon: Users, color: "text-purple-500" },
    { label: "Total Contests", value: String(contests.length), sub: "Hosted so far", icon: Trophy, color: "text-amber-500" },
  ];

  const submissionsChartData = submissions.slice(0, 15).reverse().map(s => ({
    time: new Date(s.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    count: 1 
  }));

  const verdictCounts = submissions.reduce((acc: any, s: any) => {
    const v = s.passed_all ? "Accepted" : "Failed";
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});

  const verdictChartData = [
    { name: "Accepted", value: verdictCounts["Accepted"] || 0, color: "#10b981" },
    { name: "Failed", value: verdictCounts["Failed"] || 0, color: "#f43f5e" },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
       <div className="w-10 h-10 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin" />
       <span className="text-[10px] font-black text-[#525252] uppercase tracking-[0.3em]">System Online</span>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-6 bg-[#0099ff] rounded-full shadow-[0_0_15px_rgba(0,153,255,0.5)]" />
           <h1 className="text-5xl font-black tracking-[-0.05em] uppercase">
              Dashboard
           </h1>
        </div>
        <p className="text-[#525252] text-sm font-bold uppercase tracking-widest">
          Real-time data from <span className="text-white">Appwrite Cloud</span>.
        </p>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCardsData.map((card, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={card.label} 
            className="bg-[#090909] border border-white/5 rounded-[2rem] p-8 space-y-6 hover:border-[#0099ff]/30 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-[#0099ff]/10 group-hover:border-[#0099ff]/20 transition-all`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest text-[#2a2a2a]">Real-Time</div>
            </div>
            <div>
              <div className="text-4xl font-black tracking-tight mb-1">{card.value}</div>
              <div className="text-[10px] font-bold text-white uppercase tracking-widest">{card.label}</div>
              <div className="text-[9px] font-bold text-[#2a2a2a] uppercase tracking-widest mt-1">{card.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#090909] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <TrendingUp className="w-5 h-5 text-[#0099ff] opacity-20" />
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2a2a2a] mb-10">Activity Level</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={submissionsChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#2a2a2a', fontWeight: 900 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#2a2a2a', fontWeight: 900 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#000', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                />
                <Bar dataKey="count" fill="#0099ff" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2a2a2a] mb-10">Pass/Fail Rate</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={verdictChartData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={8}
                >
                  {verdictChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <Cpu className="w-5 h-5 text-[#0099ff]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2a2a2a]">Latest Submissions</h2>
          </div>
          <button
            onClick={() => navigate("/admin/submissions")}
            className="text-[9px] font-black uppercase tracking-widest text-[#525252] hover:text-white transition-all flex items-center gap-2"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {submissions.slice(0, 5).map((sub, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={sub.$id} 
              className="grid grid-cols-3 items-center p-6 rounded-2xl bg-[#000000] border border-white/5 hover:border-[#0099ff]/20 transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[10px] font-black text-[#525252] group-hover:text-white transition-colors">
                  {sub.user_email.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-black text-white tracking-tight uppercase group-hover:text-[#0099ff] transition-colors">
                  {sub.user_email.split('@')[0]}
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#525252] uppercase tracking-widest truncate">{sub.question_title}</div>
              <div className={`text-[10px] font-black tracking-widest uppercase text-right ${sub.passed_all ? "text-emerald-400" : "text-rose-400"}`}>
                {sub.passed_all ? "Accepted" : "Failed"}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
