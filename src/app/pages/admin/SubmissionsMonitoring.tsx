import { useState, useEffect } from "react";
import { 
  Search, 
  Download, 
  Code2, 
  X, 
  Maximize2, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Activity, 
  Clock, 
  Cpu,
  RefreshCw,
  Terminal,
  Layers,
  ChevronRight
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { databases, APPWRITE_DB_ID } from "../../services/appwrite";
import { Query } from "appwrite";

const verdictConfig: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  "Accepted":     { bg: "bg-emerald-500/10",  text: "text-emerald-400",  border: "border-emerald-500/20",  glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]" },
  "Wrong Answer": { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/20",    glow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]" },
  "TLE":          { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]" },
  "MLE":          { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]" },
  "CE":           { bg: "bg-slate-500/10",  text: "text-slate-400",  border: "border-slate-500/20",  glow: "shadow-[0_0_15px_rgba(100,116,139,0.3)]" },
};

const langMap: Record<number, string> = {
  54: "C++",
  62: "Java",
  71: "Python",
};

const MONACO_LANGS: Record<string, string> = {
  "C++": "cpp",
  "Java": "java",
  "Python": "python",
};

export default function SubmissionsMonitoring() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVerdict, setFilterVerdict] = useState("All");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(APPWRITE_DB_ID, "submissions", [
        Query.orderDesc("$createdAt"),
        Query.limit(50)
      ]);
      setSubmissions(response.documents);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();

    const unsubscribe = databases.client.subscribe(
      `databases.${APPWRITE_DB_ID}.collections.submissions.documents`,
      (response) => {
        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          setSubmissions(prev => [response.payload, ...prev]);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const filtered = submissions.filter(s => {
    const matchesSearch = (s.user_email || "").toLowerCase().includes(search.toLowerCase()) || 
                          (s.question_title || "").toLowerCase().includes(search.toLowerCase());
    const verdict = s.passed_all ? "Accepted" : "Wrong Answer";
    const matchesVerdict = filterVerdict === "All" || verdict === filterVerdict;
    return matchesSearch && matchesVerdict;
  });

  const acceptedCount = submissions.filter(s => s.passed_all).length;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-[#0099ff] rounded-full shadow-[0_0_15px_rgba(0,153,255,0.5)]" />
              <h1 className="text-4xl font-semibold tracking-tight uppercase">
                 Submission <span className="text-[#525252]">History</span>
              </h1>
          </div>
          <p className="text-[#525252] text-sm font-bold uppercase tracking-widest">
            Monitoring <span className="text-white">{submissions.length}</span> submissions in real-time.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a2a2a] group-focus-within:text-[#0099ff] transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-12 pr-6 py-4 bg-[#090909] border border-white/5 rounded-2xl text-[10px] font-semibold uppercase tracking-wider text-white outline-none focus:border-[#0099ff]/50 transition-all w-72 placeholder:text-[#2a2a2a]"
            />
          </div>
          <button 
            onClick={fetchSubmissions}
            className="p-4 bg-[#090909] border border-white/5 rounded-2xl text-[#525252] hover:text-white transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-[#0099ff]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Submissions", value: submissions.length, icon: Layers, color: "text-[#0099ff]" },
          { label: "Correct Answers", value: acceptedCount, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Wrong Answers", value: submissions.length - acceptedCount, icon: XCircle, color: "text-rose-500" },
          { label: "Submission Rate", value: "8.2 /s", icon: Zap, color: "text-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#090909] border border-white/5 rounded-[2rem] p-8 space-y-4">
            <div className="flex items-center justify-between">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div className="px-2 py-1 bg-white/5 rounded-lg text-[8px] font-semibold uppercase tracking-widest text-[#2a2a2a]">System</div>
            </div>
            <div>
              <div className="text-3xl font-semibold tracking-tight">{stat.value}</div>
              <div className="text-[10px] font-bold text-[#2a2a2a] uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {["All", "Accepted", "Wrong Answer", "TLE", "CE"].map(v => (
          <button 
            key={v}
            onClick={() => setFilterVerdict(v)}
            className={`px-8 py-3.5 rounded-2xl text-[9px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap border ${
              filterVerdict === v ? "bg-[#0099ff] text-white border-[#0099ff]/50 shadow-[0_0_20px_rgba(0,153,255,0.2)]" : "bg-[#090909] text-[#525252] border-white/5 hover:text-white"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="grid px-10 py-6 bg-white/[0.02] border-b border-white/5 text-[9px] font-semibold text-[#2a2a2a] uppercase tracking-wider"
          style={{ gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 0.5fr" }}>
          <span>Student Name</span>
          <span>Problem Title</span>
          <span>Result</span>
          <span>Execution Time</span>
          <span>Time</span>
          <span className="text-right">Inspect</span>
        </div>

        <div className="divide-y divide-white/5">
          {loading && submissions.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Loading Submissions...</span>
            </div>
          ) : filtered.map((sub, index) => {
            const verdict = sub.passed_all ? "Accepted" : "Wrong Answer";
            const vc = verdictConfig[verdict] || verdictConfig.CE;
            const lang = langMap[Number(sub.language_id)] || "Unknown";
            let results = [];
            try {
              results = sub.results ? JSON.parse(sub.results) : [];
            } catch (e) {
              console.error("Result parse error", e);
            }
            const time = results[0]?.time || "0.0s";

            return (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                key={sub.$id}
                className="grid px-10 py-8 items-center hover:bg-white/[0.01] transition-all group/row cursor-pointer"
                style={{ gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 0.5fr" }}
                onClick={() => setSelectedSubmission(sub)}
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#000000] border border-white/5 flex items-center justify-center group-hover/row:border-[#0099ff]/30 transition-all">
                    <span className="text-[10px] font-semibold text-[#525252]">{sub.user_email.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="text-white text-base font-semibold tracking-[-0.02em] uppercase group-hover/row:text-[#0099ff] transition-colors">
                      {sub.user_email.split('@')[0]}
                    </div>
                    <div className="text-[9px] text-[#2a2a2a] font-bold uppercase tracking-widest mt-1">ID: {sub.$id.slice(-6)}</div>
                  </div>
                </div>

                <div className="text-sm font-semibold text-[#a6a6a6] uppercase tracking-tight truncate max-w-[200px]">
                  {sub.question_title}
                </div>

                <div>
                  <span className={`inline-flex items-center gap-2.5 text-[9px] font-semibold uppercase tracking-wider px-4 py-2 rounded-full border ${vc.bg} ${vc.text} ${vc.border} ${vc.glow}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${vc.text.replace('text-', 'bg-')}`} />
                    {verdict}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-2.5 text-[10px] font-bold text-white uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5 text-[#525252]" />
                      {time}
                   </div>
                   <div className="text-[9px] font-semibold text-[#2a2a2a] uppercase tracking-widest">ENV: {lang}</div>
                </div>

                <div className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">
                  {new Date(sub.$createdAt).toLocaleTimeString()}
                </div>

                <div className="flex justify-end">
                  <ChevronRight className="w-5 h-5 text-[#2a2a2a] group-hover/row:text-white transition-all group-hover/row:translate-x-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Submission Inspector */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-[100] p-8"
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#090909] border border-white/10 rounded-[3rem] w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[2rem] bg-[#0099ff]/10 border border-[#0099ff]/20 flex items-center justify-center">
                    <Terminal className="w-8 h-8 text-[#0099ff]" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold uppercase tracking-tight">{selectedSubmission.question_title}</h2>
                    <p className="text-[10px] font-bold text-[#525252] uppercase tracking-wider mt-1">
                      Submitted by <span className="text-white">{selectedSubmission.user_email}</span>
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedSubmission(null)} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                  <X className="w-6 h-6 text-[#525252]" />
                </button>
              </div>

              <div className="flex-1 relative bg-black">
                <Editor
                  height="100%"
                  language={MONACO_LANGS[langMap[Number(selectedSubmission.language_id)] || "Python"]}
                  theme="vs-dark"
                  value={selectedSubmission.source_code}
                  options={{
                    readOnly: true,
                    fontSize: 14,
                    minimap: { enabled: true },
                    padding: { top: 40, left: 40 },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    lineNumbersMinChars: 3,
                  }}
                />
              </div>

              <div className="px-10 py-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex gap-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-semibold text-[#525252] uppercase tracking-wider">Result</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${selectedSubmission.passed_all ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedSubmission.passed_all ? 'Accepted' : 'Wrong Answer'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-semibold text-[#525252] uppercase tracking-wider">Language</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-white">{langMap[selectedSubmission.language_id]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="px-6 py-3 bg-[#0099ff] text-white text-[10px] font-semibold uppercase tracking-wider rounded-2xl hover:scale-105 active:scale-95 transition-all">
                    Download Source
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 153, 255, 0.3); }
      `}</style>
    </div>
  );
}