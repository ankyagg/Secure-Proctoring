import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Shield,
  ShieldOff,
  Users,
  BookOpen,
  Calendar,
  Clock,
  Trophy,
  Zap,
  Box
} from "lucide-react";
import { fetchContests, deleteContest } from "../../services/contest";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";

type Contest = { id: string; [key: string]: any };

const statusConfig = {
  Live: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-500 shadow-[0_0_8px_#10b981]" },
  Upcoming: { bg: "bg-[#0099ff]/10", text: "text-[#0099ff]", border: "border-[#0099ff]/20", dot: "bg-[#0099ff] shadow-[0_0_8px_#0099ff]" },
  Ended: { bg: "bg-white/5", text: "text-[#525252]", border: "border-white/10", dot: "bg-[#2a2a2a]" },
};

export default function ContestManagement() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadContests = async () => {
    setLoading(true);
    const data = await fetchContests();
    setContests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadContests();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteContest(id);
    setContests(c => c.filter((c) => c.id !== id));
    setDeleteId(null);
  };

  const filtered = contests.filter(c =>
    (c.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-[#0099ff] rounded-full shadow-[0_0_15px_rgba(0,153,255,0.5)]" />
              <h1 className="text-5xl font-black tracking-[-0.05em] uppercase">
                 Contests
              </h1>
          </div>
          <p className="text-[#525252] text-sm font-bold uppercase tracking-widest">
            You are managing <span className="text-white">{contests.length}</span> active contests.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a2a2a] group-focus-within:text-[#0099ff] transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Contests..."
              className="pl-12 pr-6 py-4 bg-[#090909] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white outline-none focus:border-[#0099ff]/50 transition-all w-72 placeholder:text-[#2a2a2a]"
            />
          </div>
          
          <button
            onClick={() => navigate("/admin/contests/new")}
            className="flex items-center gap-3 px-8 py-4 bg-[#0099ff] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,153,255,0.2)]"
          >
            <Plus className="w-4 h-4" />
            New Contest
          </button>
        </div>
      </div>

      {/* Main Table Interface */}
      <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="grid px-10 py-6 bg-white/[0.02] border-b border-white/5 text-[9px] font-black text-[#2a2a2a] uppercase tracking-[0.3em]"
          style={{ gridTemplateColumns: "1.8fr 1fr 1.5fr 0.8fr 1fr 1fr" }}>
          <span>Contest Name</span>
          <span>Status</span>
          <span>Schedule</span>
          <span>Questions</span>
          <span>Anti-Cheat</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
             <div className="py-32 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black text-[#525252] uppercase tracking-[0.2em]">Loading Contests...</span>
             </div>
          ) : filtered.map((c, index) => {
            const s = statusConfig[c.status as keyof typeof statusConfig] || statusConfig.Live;
            const start = c.startTime || c.start_time || "";
            const end = c.endTime || c.end_time || "";
            const problemsCount = c.problems || (c.question_ids ? c.question_ids.length : 0);

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={c.id}
                className="grid px-10 py-8 items-center hover:bg-white/[0.01] transition-all group/row"
                style={{ gridTemplateColumns: "1.8fr 1fr 1.5fr 0.8fr 1fr 1fr" }}
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#000000] border border-white/5 flex items-center justify-center group-hover/row:border-[#0099ff]/30 transition-all">
                    <Trophy className="w-5 h-5 text-[#2a2a2a] group-hover/row:text-[#0099ff] transition-colors" />
                  </div>
                  <div>
                    <div className="text-white text-base font-black tracking-[-0.02em] uppercase group-hover/row:text-[#0099ff] transition-colors">
                      {c.name}
                    </div>
                    <div className="text-[9px] text-[#2a2a2a] font-bold uppercase tracking-widest mt-1">SIG: {c.id.slice(0, 8)}</div>
                  </div>
                </div>

                <div>
                  <span className={`inline-flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${c.status === "Live" ? "animate-pulse" : ""}`} />
                    {c.status || "Live"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#525252] uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5 opacity-30" />
                    {start.split("T")[0]}
                  </div>
                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#2a2a2a] uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5 opacity-20" />
                    {start.split("T")[1]?.slice(0, 5) || "00:00"} — {end.split("T")[1]?.slice(0, 5) || "23:59"}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white font-black text-xs tracking-widest">
                  <Box className="w-4 h-4 text-[#2a2a2a]" />
                  {problemsCount}
                </div>

                <div>
                  {c.antiCheat ? (
                    <div className="flex items-center gap-2.5 text-[#0099ff] text-[9px] font-black uppercase tracking-[0.2em] bg-[#0099ff]/5 border border-[#0099ff]/20 px-4 py-2 rounded-xl w-fit">
                      <Shield className="w-3.5 h-3.5" />
                      Locked
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 text-[#2a2a2a] text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/5 px-4 py-2 rounded-xl w-fit">
                      <ShieldOff className="w-3.5 h-3.5" />
                      Open
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams({
                        edit: "true",
                        id: c.id,
                        name: c.name,
                        startTime: start,
                        endTime: end,
                        problems: String(problemsCount),
                        antiCheat: typeof c.antiCheat === "object" ? JSON.stringify(c.antiCheat) : String(c.antiCheat),
                        questionIds: JSON.stringify(c.question_ids || []),
                      });
                      navigate(`/admin/contests/new?${params.toString()}`);
                    }}
                    className="p-3.5 bg-[#000000] border border-white/5 text-[#2a2a2a] hover:text-white hover:border-[#0099ff]/50 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(c.id)}
                    className="p-3.5 bg-[#000000] border border-white/5 text-[#2a2a2a] hover:text-rose-500 hover:border-rose-500/50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-center mb-8">
                <Zap className="w-10 h-10 text-[#2a2a2a]" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase mb-3">No Contests</h3>
              <p className="text-[#2a2a2a] text-[10px] font-black uppercase tracking-[0.3em] max-w-xs">Create your first contest to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-[100] p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#090909] border border-white/10 p-12 rounded-[3rem] w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,1)]"
            >
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mb-8">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-4xl font-black text-white tracking-tight uppercase mb-4">Delete Contest?</h3>
              <p className="text-[#525252] text-sm font-bold uppercase tracking-widest leading-relaxed mb-10">
                This will permanently delete the contest and all its data.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteId(null)} 
                  className="flex-1 px-8 py-5 bg-[#000000] border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(deleteId)} 
                  className="flex-1 px-8 py-5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-700 shadow-[0_0_30px_rgba(225,29,72,0.3)] transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

