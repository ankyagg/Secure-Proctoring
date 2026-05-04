import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useStudentContext } from "../../components/StudentLayout";
import { ChevronLeft, History, CheckCircle2, XCircle, Target, Clock, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE } from "../../config";

export default function StudentActivity() {
  const navigate = useNavigate();
  const { currentUser } = useStudentContext();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.email) return;

    const fetchActivity = async () => {
      try {
        const response = await fetch(`${API_BASE}/submissions?user_email=${encodeURIComponent(currentUser.email!)}`);
        const data = await response.json();
        setSubmissions(data);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-transparent">
        <div className="w-10 h-10 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Loading Activity...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-[#0099ff]/30 pb-32">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-[500px] h-[500px] bg-[#0099ff]/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20">
        
        {/* Navigation */}
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/student/lobby")}
          className="flex items-center gap-3 text-[#525252] hover:text-white transition-all text-[10px] font-semibold uppercase tracking-wider group mb-20"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Lobby
        </motion.button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-semibold text-[#0099ff] uppercase tracking-wider mb-6">
               <History className="w-3 h-3" />
               Submission Log
            </div>
            <h1 className="text-4xl md:text-4xl font-semibold tracking-tight leading-[0.85] uppercase">
              Recent <br />
              <span className="text-[#0099ff] italic">Activity.</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#525252] font-medium tracking-tight max-w-xl text-balance">
              Review your past submissions and track your progress.
            </p>
          </div>
        </div>

        {/* Submissions Matrix */}
        <div className="bg-[#090909] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1.5fr] items-center bg-white/[0.02] px-12 py-8 text-[9px] font-semibold text-[#2a2a2a] uppercase tracking-wider border-b border-white/5">
            <span>Status</span>
            <span>Problem ID</span>
            <span>Testcases</span>
            <span>Points</span>
            <span className="text-right">Time</span>
          </div>

          <div className="divide-y divide-white/5">
            {submissions.length === 0 ? (
              <div className="p-20 text-center text-[#525252] text-sm uppercase tracking-wider font-semibold">
                No recent activity found. Start coding!
              </div>
            ) : (
              submissions.map((sub, index) => (
                <motion.div
                  key={sub.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1.5fr] items-center px-12 py-8 hover:bg-white/[0.01] transition-all group"
                >
                  <div className="flex items-center">
                    {sub.passed_all ? (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Accepted</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
                        <XCircle className="w-4 h-4" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Failed</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center text-[#525252] group-hover:text-white transition-colors">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-white uppercase tracking-wider">
                      {sub.question_id?.substring(0, 8)}...
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-[#525252] group-hover:text-[#0099ff] transition-colors" />
                    <span className="text-[11px] font-semibold text-white tracking-widest">
                      {sub.passed} <span className="text-[#525252]">/ {sub.total}</span>
                    </span>
                  </div>

                  <div className="text-xl font-semibold text-white tracking-tighter">
                    +{sub.points || 0}
                  </div>

                  <div className="flex items-center justify-end gap-3 text-[#525252] group-hover:text-white transition-colors">
                    <Clock className="w-4 h-4" />
                    <span className="text-[11px] font-semibold tabular-nums tracking-wider uppercase">
                      {new Date(sub.timestamp || sub.$createdAt).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
