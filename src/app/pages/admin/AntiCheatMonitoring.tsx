import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Activity, 
  User, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Terminal, 
  FileCode, 
  RefreshCw,
  Search,
  ChevronRight,
  ShieldCheck,
  Zap,
  EyeOff,
  X
} from "lucide-react";
import { databases, APPWRITE_DB_ID } from "../../services/appwrite";
import { Query } from "appwrite";
import { motion, AnimatePresence } from "framer-motion";

type ProctorLog = {
  $id: string;
  user_name: string;
  user_email: string;
  type: string;
  message: string;
  timestamp: string;
  screenshot_url?: string;
  code_snapshot?: string;
  contest_id: string;
};

export default function AntiCheatMonitoring() {
  const [logs, setLogs] = useState<ProctorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedLog, setSelectedLog] = useState<ProctorLog | null>(null);
  
  // New states for Contest Filtering and Stats
  const [contests, setContests] = useState<{id: string, name: string}[]>([]);
  const [selectedContest, setSelectedContest] = useState<string>("All");
  const [totalViolations, setTotalViolations] = useState(0);

  // Derived stats
  const riskyStudentsCount = new Set(logs.map(log => log.user_email)).size;
  const violationTypes = ["All", ...Array.from(new Set(logs.map(log => log.type).filter(Boolean)))];

  const fetchContests = async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DB_ID, "contests");
      setContests(response.documents.map((d: any) => ({ id: d.$id, name: d.name })));
    } catch (error) {
      console.error("Failed to fetch contests:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const url = new URL("http://localhost:3000/api/proctor/stats");
      if (selectedContest !== "All") {
        url.searchParams.append("contest_id", selectedContest);
      }
      const res = await fetch(url.toString());
      const data = await res.json();
      const total = data.reduce((acc: number, curr: any) => acc + (curr.total_violations || 0), 0);
      setTotalViolations(total);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      // Fallback
      setTotalViolations(logs.length);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queries = [
        Query.orderDesc("$createdAt"),
        Query.limit(50)
      ];
      if (selectedContest !== "All") {
        queries.push(Query.equal("contest_id", selectedContest));
      }
      const response = await databases.listDocuments(APPWRITE_DB_ID, "proctor_logs", queries);
      setLogs(response.documents as any);
      fetchStats();
    } catch (error) {
      console.error("Failed to fetch proctor logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    fetchLogs();

    // Subscribe to real-time updates
    const unsubscribe = databases.client.subscribe(
      [`databases.${APPWRITE_DB_ID}.collections.proctor_logs.documents`],
      (response) => {
        // Broaden event match to handle various Appwrite versions/formats
        const isCreate = response.events.some(e => 
          e.includes('.create') || e.includes('documents.create')
        );
        
        if (isCreate) {
          const newLog = response.payload as ProctorLog;
          setLogs((prev) => {
            if (prev.some(log => log.$id === newLog.$id)) return prev;
            return [newLog, ...prev];
          });
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.user_name || "").toLowerCase().includes(search.toLowerCase()) || 
                          (log.message || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || log.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getSeverity = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("tab") || t.includes("gaze")) return "High";
    if (t.includes("face") || t.includes("multiple")) return "Critical";
    return "Medium";
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-[#0099ff] rounded-full shadow-[0_0_15px_rgba(0,153,255,0.5)]" />
             <h1 className="text-4xl font-medium tracking-tight uppercase font-sans">
                Anti-Cheat <span className="text-[#525252]">System</span>
             </h1>
          </div>
          <p className="text-[#525252] text-[10px] font-bold uppercase tracking-widest">
            Real-time <span className="text-[#0099ff]">integrity monitoring</span> across all active sessions.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <select
              value={selectedContest}
              onChange={(e) => setSelectedContest(e.target.value)}
              className="pl-6 pr-10 py-4 bg-[#090909] border border-white/5 rounded-full text-[9px] font-semibold uppercase tracking-wider text-white outline-none focus:border-[#0099ff]/50 transition-all placeholder:text-[#2a2a2a] shadow-[rgba(0,153,255,0.05)_0px_0px_20px_0px] appearance-none"
            >
              <option value="All">All Contests</option>
              {contests.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a2a2a] group-focus-within:text-[#0099ff] transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH NODE LOGS..."
              className="pl-12 pr-6 py-4 bg-[#090909] border border-white/5 rounded-full text-[9px] font-semibold uppercase tracking-wider text-white outline-none focus:border-[#0099ff]/50 transition-all w-80 placeholder:text-[#2a2a2a] shadow-[rgba(0,153,255,0.05)_0px_0px_20px_0px]"
            />
          </div>
          <button 
            onClick={fetchLogs}
            className="p-4 bg-[#090909] border border-white/5 rounded-full text-[#525252] hover:text-white transition-all active:scale-95 shadow-[rgba(0,153,255,0.05)_0px_0px_20px_0px]"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-[#0099ff]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Sessions", value: "142", icon: Activity, color: "text-[#0099ff]" },
          { label: "Total Violations", value: totalViolations.toString(), icon: ShieldAlert, color: "text-rose-500" },
          { label: "Integrity Score", value: Math.max(0, 100 - (totalViolations * 2)).toFixed(1) + "%", icon: ShieldCheck, color: "text-emerald-500" },
          { label: "Risky Students", value: riskyStudentsCount.toString(), icon: Zap, color: "text-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#090909] border border-white/5 rounded-[2rem] p-8 space-y-4 shadow-[rgba(0,153,255,0.05)_0px_0px_0px_1px]">
            <div className="flex items-center justify-between">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div className="px-2 py-1 bg-white/5 rounded-lg text-[8px] font-semibold uppercase tracking-widest text-[#2a2a2a]">Node_{i+1}</div>
            </div>
            <div>
              <div className="text-3xl font-medium tracking-tight">{stat.value}</div>
              <div className="text-[10px] font-bold text-[#525252] uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {violationTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-8 py-3.5 rounded-2xl text-[10px] font-semibold uppercase tracking-wider transition-all duration-500 whitespace-nowrap border ${
              filter === type 
                ? "bg-[#0c0c0c] text-[#0099ff] border-[#0099ff]/40 shadow-[0_10px_40px_rgba(0,153,255,0.15)] scale-[1.02]" 
                : "bg-[#090909] text-[#444] border-white/5 hover:border-white/10 hover:text-[#888]"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black">
        <div className="grid px-10 py-6 bg-white/[0.01] border-b border-white/5 text-[9px] font-semibold text-[#2a2a2a] uppercase tracking-wider"
          style={{ gridTemplateColumns: "1.5fr 1fr 1.5fr 1fr 0.8fr 0.5fr" }}>
          <span>Candidate Information</span>
          <span>Violation Type</span>
          <span>Violation Details</span>
          <span>Time</span>
          <span>Severity</span>
          <span className="text-right">Inspect</span>
        </div>

        <div className="divide-y divide-white/5">
          {loading && logs.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Synchronizing Logs...</span>
            </div>
          ) : filteredLogs.map((log, index) => {
            const severity = getSeverity(log.type);
            return (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                key={log.$id}
                className="grid px-10 py-8 items-center hover:bg-white/[0.01] transition-all group/row cursor-pointer"
                style={{ gridTemplateColumns: "1.5fr 1fr 1.5fr 1fr 0.8fr 0.5fr" }}
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#000000] border border-white/5 flex items-center justify-center group-hover/row:border-rose-500/30 transition-all">
                    <User className="w-5 h-5 text-[#2a2a2a] group-hover/row:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-white text-base font-semibold tracking-[-0.02em] uppercase group-hover/row:text-rose-400 transition-colors">
                      {log.user_email || "anonymous@system.void"}
                    </div>
                    <div className="text-[9px] text-[#2a2a2a] font-bold uppercase tracking-widest mt-1">
                      {log.user_name && log.user_name !== "Student" ? log.user_name : "Identity Not Verified"}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-[#a6a6a6] uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-xl">
                    {log.type || "General Violation"}
                  </span>
                </div>

                <div className="text-[11px] text-[#525252] font-medium leading-relaxed max-w-[200px] truncate">
                  {log.message}
                </div>

                <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#2a2a2a] uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5 opacity-20" />
                  {new Date(log.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>

                <div>
                  <span className={`text-[9px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                    severity === 'Critical' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                    severity === 'High' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    'bg-[#0099ff]/10 text-[#0099ff] border-[#0099ff]/20'
                  }`}>
                    {severity}
                  </span>
                </div>

                <div className="flex justify-end">
                  <ChevronRight className="w-5 h-5 text-[#2a2a2a] group-hover/row:text-white transition-all group-hover/row:translate-x-1" />
                </div>
              </motion.div>
            );
          })}

          {!loading && filteredLogs.length === 0 && (
            <div className="py-40 text-center">
              <ShieldCheck className="w-12 h-12 text-[#2a2a2a] mx-auto mb-6 opacity-20" />
              <h3 className="text-2xl font-medium text-white uppercase tracking-tight">No Violations Found</h3>
              <p className="text-[10px] font-bold text-[#2a2a2a] uppercase tracking-wider mt-2">The system has detected zero integrity breaches in this node cycle.</p>
            </div>
          )}
        </div>
      </div>

      {/* Inspect Modal */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-[100] p-8"
            onClick={() => setSelectedLog(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#000000] border border-white/10 rounded-[3rem] w-full max-w-5xl h-[80vh] overflow-hidden flex flex-col shadow-[rgba(0,153,255,0.1)_0px_0px_50px_0px]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold uppercase tracking-tight">{selectedLog.user_email || "ANONYMOUS"}</h2>
                    <p className="text-[10px] font-bold text-[#525252] uppercase tracking-wider mt-1">{selectedLog.user_name || "Identity Not Verified"} • Incident Report: {selectedLog.$id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/5">
                  <X className="w-5 h-5 text-[#525252]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Telemetry Data */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#2a2a2a]">Violation Data</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#000000] border border-white/5 p-6 rounded-[2rem] shadow-[rgba(0,153,255,0.05)_0px_0px_10px_0px]">
                          <p className="text-[9px] font-bold text-[#2a2a2a] uppercase tracking-widest mb-1">Violation Category</p>
                          <p className="text-[10px] font-semibold uppercase text-rose-500">{selectedLog.type || "Undefined"}</p>
                        </div>
                        <div className="bg-[#090909] border border-white/5 p-6 rounded-[2rem] shadow-[rgba(0,153,255,0.05)_0px_0px_10px_0px]">
                          <p className="text-[9px] font-bold text-[#2a2a2a] uppercase tracking-widest mb-1">Temporal Node</p>
                          <p className="text-[10px] font-semibold text-white">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#090909] border border-white/5 p-8 rounded-[2rem]">
                      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#2a2a2a] mb-4">AI Analysis</h4>
                      <p className="text-sm font-bold text-[#a6a6a6] leading-relaxed italic">
                        "{selectedLog.message}"
                      </p>
                    </div>

                    {selectedLog.code_snapshot && (
                      <div className="bg-[#090909] border border-white/5 rounded-[2rem] overflow-hidden">
                        <div className="px-8 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileCode className="w-4 h-4 text-[#0099ff]" />
                            <span className="text-[9px] font-semibold uppercase tracking-widest text-[#a6a6a6]">Code Snapshot</span>
                          </div>
                        </div>
                        <pre className="p-8 text-[11px] font-mono text-[#0099ff]/80 overflow-x-auto bg-[#050505]">
                          <code>{selectedLog.code_snapshot}</code>
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Visual Evidence */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#525252]">Security Settings</h3>
                    {selectedLog.screenshot_url ? (
                      <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 group">
                        <img 
                          src={selectedLog.screenshot_url} 
                          alt="Proctor Evidence" 
                          className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#000] to-transparent opacity-60" />
                        <div className="absolute bottom-8 left-8 flex items-center gap-3">
                          <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                          <span className="text-[10px] font-semibold uppercase tracking-widest">Evidence Node_{selectedLog.$id.slice(-4)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[400px] bg-[#090909] border border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12">
                        <EyeOff className="w-12 h-12 text-[#2a2a2a] mb-4" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#2a2a2a]">No image captured for this violation.</p>
                      </div>
                    )}
                  </div>
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(244, 63, 94, 0.3); }
      `}</style>
    </div>
  );
}
