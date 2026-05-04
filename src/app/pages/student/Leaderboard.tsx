import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Trophy, RefreshCw, Crown, Zap, Clock, ChevronLeft, Binary, Target, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { databases, APPWRITE_DB_ID } from "../../services/appwrite";
import { Query } from "appwrite";
import { API_BASE } from "../../config";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE}/leaderboard`);
      const leaderData = await response.json();
      setData(leaderData);
    } catch (err) {
      console.error("Leaderboard synchronization failed:", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-transparent">
      <div className="w-10 h-10 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Loading Rankings...</span>
    </div>
  );

  const top3 = data.slice(0, 3);

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-[#0099ff]/30 pb-32">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0099ff]/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[90rem] mx-auto px-8 pt-10">
        
        {/* Navigation */}
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/student/lobby")}
          className="flex items-center gap-3 text-[#525252] hover:text-white transition-all text-[10px] font-semibold uppercase tracking-wider group mb-10"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Lobby
        </motion.button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-semibold text-[#0099ff] uppercase tracking-wider mb-6">
               <Binary className="w-3 h-3" />
               Live Rankings
            </div>
            <h1 className="text-4xl md:text-4xl font-semibold tracking-tight leading-[0.85] uppercase">
              The <br />
              <span className="text-[#0099ff] italic">Leaderboard.</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#525252] font-medium tracking-tight max-w-xl text-balance">
              View the top performing students and their scores.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-[#0099ff] rounded-full animate-pulse" />
              <span className="text-[10px] text-[#525252] font-semibold uppercase tracking-wider">Live Sync</span>
            </div>
            <button
              onClick={fetchLeaderboard}
              className="p-5 bg-white text-black rounded-2xl hover:bg-[#0099ff] hover:text-white transition-all active:scale-95 shadow-2xl"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32 items-end">
          {/* 2nd Place */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="order-2 md:order-1 bg-[#090909] border border-white/5 rounded-[3.5rem] p-12 text-center relative overflow-hidden h-[350px] flex flex-col justify-end shadow-2xl hover:border-white/10 transition-all"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5" />
            <div className="text-4xl font-semibold text-[#2a2a2a] absolute top-12 left-12 italic opacity-20">#02</div>
            <div className="w-24 h-24 bg-white/5 rounded-[2rem] mx-auto flex items-center justify-center text-white font-semibold text-2xl border border-white/10 mb-10">
              {top3[1]?.user?.substring(0, 2).toUpperCase() || "??"}
            </div>
            <div>
              <div className="text-2xl font-semibold text-white uppercase tracking-tighter mb-2">{top3[1]?.user || "---"}</div>
              <div className="text-[10px] text-[#0099ff] font-semibold uppercase tracking-wider">{top3[1]?.total_points || 0} POINTS</div>
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="order-1 md:order-2 bg-[#090909] border border-[#0099ff]/30 rounded-[4rem] p-16 text-center relative overflow-hidden h-[450px] flex flex-col justify-end shadow-[0_0_80px_rgba(0,153,255,0.2)] group transition-all"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-[#0099ff]" />
            <div className="absolute inset-0 bg-[#0099ff]/5 blur-3xl rounded-full opacity-50" />
            <Crown className="w-20 h-20 text-[#0099ff] mx-auto mb-10 animate-bounce shadow-2xl" />
            <div className="text-4xl font-semibold text-[#0099ff]/10 absolute top-16 left-16 italic uppercase">#01</div>
            <div className="w-32 h-32 bg-white text-black rounded-[2.5rem] mx-auto flex items-center justify-center font-semibold text-4xl shadow-2xl group-hover:scale-105 transition-all mb-10">
              {top3[0]?.user?.substring(0, 2).toUpperCase() || "??"}
            </div>
            <div>
              <div className="text-4xl font-semibold text-white uppercase tracking-tight mb-3">{top3[0]?.user || "---"}</div>
              <div className="text-[12px] text-[#0099ff] font-semibold uppercase tracking-wider">{top3[0]?.total_points || 0} POINTS</div>
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-3 bg-[#090909] border border-white/5 rounded-[3rem] p-10 text-center relative overflow-hidden h-[300px] flex flex-col justify-end shadow-2xl hover:border-white/10 transition-all"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5" />
            <div className="text-4xl font-semibold text-[#2a2a2a] absolute top-10 left-10 italic opacity-20">#03</div>
            <div className="w-20 h-20 bg-white/5 rounded-[1.5rem] mx-auto flex items-center justify-center text-white font-semibold text-xl border border-white/10 mb-8">
              {top3[2]?.user?.substring(0, 2).toUpperCase() || "??"}
            </div>
            <div>
              <div className="text-xl font-semibold text-white uppercase tracking-tighter mb-2">{top3[2]?.user || "---"}</div>
              <div className="text-[10px] text-[#0099ff] font-semibold uppercase tracking-wider">{top3[2]?.total_points || 0} POINTS</div>
            </div>
          </motion.div>
        </div>

        {/* Main Ranking Matrix */}
        <div className="bg-[#090909] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-[120px_1fr_200px_160px_200px] items-center bg-white/[0.02] px-12 py-8 text-[9px] font-semibold text-[#2a2a2a] uppercase tracking-wider border-b border-white/5">
            <span>Rank</span>
            <span>Student Name</span>
            <span className="text-center">Challenges Solved</span>
            <span className="text-right">Points</span>
            <span className="text-right">Last Activity</span>
          </div>

          <div className="divide-y divide-white/5">
            {data.map((entry, index) => (
              <motion.div
                key={entry.email}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="grid grid-cols-[120px_1fr_200px_160px_200px] items-center px-12 py-10 hover:bg-white/[0.01] transition-all group relative"
              >
                <div className="flex items-center">
                  <span className={`text-3xl font-semibold tracking-tighter ${index < 3 ? 'text-white' : 'text-[#2a2a2a]'} group-hover:text-[#0099ff] transition-colors`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xs font-semibold uppercase border transition-all ${
                    index === 0 ? "bg-white text-black border-transparent" : "bg-black border-white/5 text-[#525252]"
                  }`}>
                    {entry.user?.substring(0, 2).toUpperCase() || "??"}
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white uppercase tracking-tighter group-hover:text-[#0099ff] transition-colors">
                      {entry.user}
                    </div>
                    <div className="text-[9px] text-[#2a2a2a] font-bold uppercase tracking-widest mt-1">
                      {entry.email}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                   <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/5">
                      <Target className="w-4 h-4 text-[#0099ff]" />
                      <span className="text-[10px] font-semibold text-white uppercase tracking-widest">{entry.solved} Challenges</span>
                   </div>
                </div>

                <div className="text-right">
                  <span className="text-3xl font-semibold text-white group-hover:text-[#0099ff] transition-colors tracking-tighter">{entry.total_points}</span>
                </div>

                <div className="flex items-center justify-end gap-3 text-[#2a2a2a]">
                  <Clock className="w-4 h-4" />
                  <span className="text-[12px] font-semibold tabular-nums tracking-tighter uppercase">
                    {new Date(entry.last_submission).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
           <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/5 text-[9px] font-semibold text-[#525252] uppercase tracking-wider">
             <ShieldCheck className="w-4 h-4 text-emerald-500" />
             Secured by AI Anti-Cheat
           </div>
        </div>
      </div>
    </div>
  );
}
