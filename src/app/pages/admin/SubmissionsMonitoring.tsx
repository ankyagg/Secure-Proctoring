import { useState, useEffect } from "react";
import { Search, Filter, Download, Code2 } from "lucide-react";

const verdictConfig: Record<string, { bg: string; text: string; border: string }> = {
  "Accepted":     { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  "Wrong Answer": { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"    },
  "TLE":          { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  "MLE":          { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "CE":           { bg: "bg-slate-100", text: "text-slate-600",  border: "border-slate-200"  },
};

const langColor: Record<string, string> = {
  "C++":    "text-blue-700 bg-blue-50 border-blue-200",
  "Java":   "text-orange-700 bg-orange-50 border-orange-200",
  "Python": "text-yellow-700 bg-yellow-50 border-yellow-200",
};

const initialSubmissions = [
  { id: "s001", user: "AlgoMaster_X",   problem: "A - Two Sum",            verdict: "Accepted",     time: "0.04s", memory: "12MB",  language: "C++",    timestamp: "10:12:34" },
  { id: "s002", user: "devstar_priya",  problem: "B - Longest Palindrome", verdict: "Wrong Answer", time: "0.12s", memory: "14MB",  language: "Python", timestamp: "10:14:02" },
  { id: "s003", user: "CodeNinja_99",   problem: "C - Binary Tree Path",   verdict: "Accepted",     time: "0.08s", memory: "18MB",  language: "Java",   timestamp: "10:15:44" },
  { id: "s004", user: "alex_coder",     problem: "A - Two Sum",            verdict: "Accepted",     time: "0.02s", memory: "10MB",  language: "C++",    timestamp: "10:17:21" },
  { id: "s005", user: "recursion_king", problem: "D - Merge K Lists",      verdict: "TLE",          time: "2.01s", memory: "45MB",  language: "Python", timestamp: "10:18:55" },
  { id: "s006", user: "hash_table_hero",problem: "E - Coin Change",        verdict: "Accepted",     time: "0.06s", memory: "11MB",  language: "C++",    timestamp: "10:21:03" },
  { id: "s007", user: "BinaryBoss",     problem: "B - Longest Palindrome", verdict: "Wrong Answer", time: "0.09s", memory: "13MB",  language: "Java",   timestamp: "10:22:47" },
  { id: "s008", user: "AlgoMaster_X",   problem: "D - Merge K Lists",      verdict: "Accepted",     time: "0.11s", memory: "22MB",  language: "C++",    timestamp: "10:24:10" },
  { id: "s009", user: "sort_queen",     problem: "A - Two Sum",            verdict: "MLE",          time: "1.02s", memory: "512MB", language: "Java",   timestamp: "10:25:38" },
  { id: "s010", user: "dp_wizard",      problem: "E - Coin Change",        verdict: "Accepted",     time: "0.05s", memory: "12MB",  language: "Python", timestamp: "10:27:14" },
  { id: "s011", user: "devstar_priya",  problem: "A - Two Sum",            verdict: "Accepted",     time: "0.03s", memory: "11MB",  language: "Python", timestamp: "10:28:59" },
  { id: "s012", user: "newbie_coder_22",problem: "A - Two Sum",            verdict: "Wrong Answer", time: "0.04s", memory: "12MB",  language: "C++",    timestamp: "10:31:02" },
];

const liveQueue = [
  { id: "s013", user: "AlgoMaster_X",  problem: "E - Coin Change",        verdict: "Accepted",     time: "0.04s", memory: "11MB", language: "C++",    timestamp: "10:35:41" },
  { id: "s014", user: "CodeNinja_99",  problem: "E - Coin Change",        verdict: "Accepted",     time: "0.06s", memory: "12MB", language: "Python", timestamp: "10:36:28" },
  { id: "s015", user: "graph_guru",    problem: "B - Longest Palindrome", verdict: "Wrong Answer", time: "0.09s", memory: "13MB", language: "Java",   timestamp: "10:37:14" },
];

export default function SubmissionsMonitoring() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]           = useState("");
  const [filterVerdict, setFilterVerdict] = useState("All");
  const [filterLang, setFilterLang]   = useState("All");
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const API = "http://localhost:3000/api";

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`${API}/submissions`);
      const data = await res.json();
      
      const formatted = data.map((s: any) => ({
        id: s.id,
        user: s.user_email || "Anonymous",
        problem: s.problem_name || s.problem_id || "Unknown Problem",
        verdict: s.passed_all ? "Accepted" : "Wrong Answer",
        time: s.results?.[0]?.time || "0.0s",
        memory: s.results?.[0]?.memory || "0MB",
        language: s.language || "Unknown",
        timestamp: s.timestamp ? new Date(s.timestamp).toLocaleTimeString() : "00:00"
      }));
      setSubmissions(formatted);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    if (!liveEnabled) return;
    const interval = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(interval);
  }, [liveEnabled]);

  const verdicts = ["All", "Accepted", "Wrong Answer", "TLE", "MLE"];
  const langs    = ["All", "C++", "Java", "Python", "Javascript"];

  const filtered = submissions.filter(s => {
    const matchSearch  = s.user.toLowerCase().includes(search.toLowerCase()) ||
                         s.problem.toLowerCase().includes(search.toLowerCase());
    const matchVerdict = filterVerdict === "All" || s.verdict === filterVerdict;
    const matchLang    = filterLang === "All"    || s.language === filterLang;
    return matchSearch && matchVerdict && matchLang;
  });

  const acceptedCount = submissions.filter(s => s.verdict === "Accepted").length;
  const rejectedCount = submissions.length - acceptedCount;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.4rem" }}>
            Submissions Monitor
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {submissions.length} total · Last updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setLiveEnabled(!liveEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
              liveEnabled
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-slate-100 border-slate-200 text-slate-500"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${liveEnabled ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
            {liveEnabled ? "Live" : "Paused"}
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total",       value: submissions.length,                                         color: "text-slate-800" },
          { label: "Accepted",    value: acceptedCount,                                               color: "text-green-700" },
          { label: "Rejected",    value: rejectedCount,                                               color: "text-red-700"   },
          { label: "Accept Rate", value: `${Math.round((acceptedCount / submissions.length) * 100)}%`,color: "text-blue-700"  },
        ].map(item => (
          <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className={`text-xl mb-0.5 ${item.color}`} style={{ fontWeight: 700 }}>{item.value}</div>
            <div className="text-slate-400 text-xs">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search user or problem..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1">
            {verdicts.map(v => (
              <button key={v} onClick={() => setFilterVerdict(v)}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  filterVerdict === v ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}>{v}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-1">
          {langs.map(l => (
            <button key={l} onClick={() => setFilterLang(l)}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                filterLang === l ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="grid px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-400"
          style={{ gridTemplateColumns: "52px 180px 1fr 130px 80px 80px 90px 80px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          <span>#</span><span>Participant</span><span>Problem</span>
          <span>Verdict</span><span>Time</span><span>Memory</span>
          <span>Language</span><span>Submitted</span>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.map((sub, idx) => {
            const vc = verdictConfig[sub.verdict] ?? verdictConfig["CE"];
            return (
              <div key={sub.id}
                className={`grid px-5 py-3.5 items-center hover:bg-slate-50/50 transition-colors ${idx === 0 && liveEnabled && liveIndex > 0 ? "bg-blue-50/40" : ""}`}
                style={{ gridTemplateColumns: "52px 180px 1fr 130px 80px 80px 90px 80px" }}>
                <span className="text-slate-400 text-xs">{submissions.length - submissions.indexOf(sub)}</span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-600 flex-shrink-0" style={{ fontWeight: 600 }}>
                    {sub.user.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-slate-700 text-xs truncate" style={{ fontWeight: 500 }}>{sub.user}</span>
                </div>
                <span className="text-slate-600 text-xs">{sub.problem}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full border inline-block w-fit ${vc.bg} ${vc.text} ${vc.border}`}>
                  {sub.verdict}
                </span>
                <span className="text-slate-500 text-xs">{sub.time}</span>
                <span className="text-slate-500 text-xs">{sub.memory}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border inline-block w-fit ${langColor[sub.language] ?? ""}`}>
                  {sub.language}
                </span>
                <span className="text-slate-400 text-xs" style={{ fontFamily: "monospace" }}>{sub.timestamp}</span>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Code2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No submissions match the current filters</p>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 text-center">
        Showing {filtered.length} of {submissions.length} submissions
        {liveEnabled && " · Live updates every 4 seconds"}
      </p>
    </div>
  );
}