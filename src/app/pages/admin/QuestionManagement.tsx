import { useState, useEffect } from "react";
import {
  Plus, Edit2, Trash2, Search, Code2, FileText, TestTube, Zap, Layers, Cpu, Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";

const difficultyConfig: Record<string, { bg: string, text: string, border: string }> = {
  easy:   { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  medium: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  hard:   { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
};

export default function QuestionManagement() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterDiff, setFilterDiff] = useState("All");

  useEffect(() => {
    import("../../services/appwrite").then(({ databases, APPWRITE_DB_ID }) => {
      databases.listDocuments(APPWRITE_DB_ID, 'questions')
        .then(res => {
          setQuestions(res.documents.map((d: any) => ({
            ...d,
            id: d.$id,
            time_limit: d.timeLimit,
            memory_limit: d.memoryLimit
          })));
        })
        .catch(err => console.error("Failed to load questions from Appwrite:", err))
        .finally(() => setLoading(false));
    });
  }, []);

  const filtered = questions.filter((q) => {
    const matchSearch =
      (q.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (q.category || "").toLowerCase().includes(search.toLowerCase());
    const matchDiff =
      filterDiff === "All" ||
      (q.difficulty || "").toLowerCase() === filterDiff.toLowerCase();
    return matchSearch && matchDiff;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      const { databases, APPWRITE_DB_ID } = await import("../../services/appwrite");
      await databases.deleteDocument(APPWRITE_DB_ID, 'questions', id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error("Failed to delete question:", err);
      alert("Failed to delete question.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-[#000000]">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-2 border-[#0099ff]/20 border-t-[#0099ff] rounded-full"
      />
      <p className="text-[#a6a6a6] text-[10px] font-semibold uppercase tracking-wider">Loading Questions...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 bg-transparent text-white p-8 min-h-screen font-sans selection:bg-[#0099ff]/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-3"
          >
            <div className="w-1.5 h-10 bg-[#0099ff] rounded-full shadow-[0_0_20px_rgba(0,153,255,0.6)]" />
            <h1 className="text-4xl font-semibold tracking-tight uppercase">
              Question <span className="text-[#0099ff]">Bank</span>
            </h1>
          </motion.div>
          <p className="text-[#a6a6a6] text-sm font-medium tracking-wide">
            Managing <span className="text-white font-bold">{questions.length}</span> coding questions.
          </p>
        </div>
        
        <button
          onClick={() => navigate("/admin/questions/new")}
          className="group relative flex items-center gap-3 px-8 py-4 bg-[#0099ff] text-white text-[11px] font-semibold uppercase tracking-wider rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(0,153,255,0.2)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Plus className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Add New Question</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative group flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252] group-focus-within:text-[#0099ff] transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, category, or ID..."
            className="w-full pl-14 pr-8 py-4 bg-[#090909] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 focus:ring-4 focus:ring-[#0099ff]/5 transition-all placeholder:text-[#525252]"
          />
        </div>
        <div className="flex gap-2 p-1.5 bg-[#090909] border border-white/5 rounded-2xl">
          {["All", "Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDiff(d)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all ${
                filterDiff === d
                  ? "bg-[#0099ff] text-white shadow-[0_0_20px_rgba(0,153,255,0.3)]"
                  : "text-[#525252] hover:text-[#a6a6a6] hover:bg-white/5"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total", count: questions.length, icon: Database, color: "text-[#0099ff]", border: "border-[#0099ff]/20", bg: "bg-[#0099ff]/5" },
          { label: "Easy", count: questions.filter(q => q.difficulty?.toLowerCase() === "easy").length, icon: Zap, color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
          { label: "Medium", count: questions.filter(q => q.difficulty?.toLowerCase() === "medium").length, icon: Layers, color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5" },
          { label: "Hard", count: questions.filter(q => q.difficulty?.toLowerCase() === "hard").length, icon: Cpu, color: "text-rose-400", border: "border-rose-500/20", bg: "bg-rose-500/5" },
        ].map((item) => (
          <div key={item.label} className={`relative group border ${item.border} rounded-3xl p-8 ${item.bg} overflow-hidden hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all`}>
             <div className="relative z-10">
                <item.icon className={`w-8 h-8 ${item.color} mb-4 opacity-40`} />
                <div className="text-4xl font-semibold text-white tracking-tight mb-1">
                  {item.count}
                </div>
                <div className={`text-[10px] font-semibold uppercase tracking-wider ${item.color}`}>
                  {item.label} Questions
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Bank Table */}
      <div className="bg-[#090909] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div
          className="grid px-10 py-6 bg-white/[0.02] border-b border-white/5 text-[10px] font-semibold text-[#525252] uppercase tracking-wider"
          style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 0.8fr" }}
        >
          <span>Problem Title</span>
          <span>Difficulty</span>
          <span>Category</span>
          <span>Time Limit</span>
          <span>Memory</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-white/5">
          <AnimatePresence>
            {filtered.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                className="grid px-10 py-8 items-center hover:bg-white/[0.02] transition-all group/row"
                style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 0.8fr" }}
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/row:border-[#0099ff]/40 transition-all group-hover/row:scale-110">
                    <FileText className="w-6 h-6 text-[#525252] group-hover/row:text-[#0099ff] transition-colors" />
                  </div>
                  <div>
                    <span className="text-white text-lg font-semibold tracking-[-0.03em] uppercase group-hover/row:text-[#0099ff] transition-colors">
                      {q.title}
                    </span>
                    <div className="text-[9px] text-[#525252] font-bold uppercase tracking-wider mt-1.5 flex items-center gap-2">
                      <span className="text-[#333]">ID:</span> {q.id?.slice(0, 12)}
                    </div>
                  </div>
                </div>

                <div>
                  <span className={`text-[9px] font-semibold uppercase tracking-wider px-4 py-2 rounded-full border ${difficultyConfig[q.difficulty?.toLowerCase()]?.bg || "bg-white/5"} ${difficultyConfig[q.difficulty?.toLowerCase()]?.text || "text-white"} ${difficultyConfig[q.difficulty?.toLowerCase()]?.border || "border-white/10"}`}>
                    {q.difficulty}
                  </span>
                </div>

                <span className="text-[#a6a6a6] text-[10px] font-bold uppercase tracking-wider">{q.category || "General"}</span>
                <span className="text-white font-semibold text-xs tracking-widest">{q.time_limit || "2"}s</span>
                <span className="text-white font-semibold text-xs tracking-widest">{q.memory_limit || "256"}MB</span>

                <div className="flex items-center justify-end gap-4">
                  <button 
                    onClick={() => navigate(`/admin/questions/new?edit=true&id=${q.id}`)}
                    className="p-3.5 bg-white/5 border border-white/10 text-[#525252] hover:text-white hover:border-[#0099ff]/50 hover:bg-[#0099ff]/10 rounded-2xl transition-all shadow-xl active:scale-90"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-3.5 bg-white/5 border border-white/10 text-[#525252] hover:text-rose-500 hover:border-rose-500/50 hover:bg-rose-500/10 rounded-2xl transition-all shadow-xl active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center mb-8">
                <Code2 className="w-10 h-10 text-[#525252] opacity-30" />
              </div>
              <h3 className="text-2xl font-semibold text-white tracking-tight uppercase mb-2">No Questions Found</h3>
              <p className="text-[#525252] text-[10px] font-semibold uppercase tracking-wider max-w-xs">No questions match your search parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}