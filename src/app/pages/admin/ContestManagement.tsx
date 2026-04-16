import { useState,useEffect } from "react";
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
} from "lucide-react";
import { fetchContests, deleteContest } from "../../services/contest";

type Contest = {id: string ; [key:string]:any};

const statusConfig = {
  Live: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
  Upcoming: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  Ended: { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-400" },
};

export default function ContestManagement() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchContests().then(setContests);

    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data.type === "c-added") {
        setContests(c => [...c, e.data.c]);
      } else if (e.data.type === "c-updated") {
        setContests(c =>
          c.map(x => (x.id === e.data.id ? { ...x, ...e.data.updates } : x))
        );
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);
  const handleDelete = async (id: string) => {
    await deleteContest(id)
    setContests(c=> c.filter((c) => c.id !== id));
    setDeleteId(null);
  };
  const filtered = contests.filter(c =>
  c.name.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.4rem" }}>
            Contest Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{contests.length} Contests total</p>
        </div>
        <button
          onClick={() => window.open("/admin/contests/new", "_blank")}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          style={{ fontWeight: 500 }}
        >
          <Plus className="w-4 h-4" />
          Create Contest
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Contest..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="grid px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-400"
          style={{ gridTemplateColumns: "1fr 120px 180px 80px 80px 100px 100px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          <span>Contests</span>
          <span>Status</span>
          <span>Schedule</span>
          <span>Problems</span>
          <span>Users</span>
          <span>Anti-Cheat</span>
          <span>Actions</span>
        </div>

        {filtered.map((c) => {
          const s = statusConfig[c.status as keyof typeof statusConfig] || {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
  dot: "bg-gray-500"
          }

          const start = c.startTime || c.start_time || "";
          const end = c.endTime || c.end_time || "";
          const problemsCount = c.problems || (c.question_ids ? c.question_ids.length : 0);

          return (
            <div
              key={c.id}
              className="grid px-5 py-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50/50 transition-colors"
              style={{ gridTemplateColumns: "1fr 120px 180px 80px 80px 100px 100px" }}
            >
              <div>
                <div className="text-slate-800 text-sm" style={{ fontWeight: 500 }}>
                  {c.name}
                </div>
              </div>

              <div>
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${c.status === "Live" ? "animate-pulse" : ""}`} />
                  {c.status || "Live"}
                </span>
              </div>

              <div className="text-xs text-slate-500 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {start.split(" ")[0]}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {start.split(" ")[1] || "00:00"} – {end.split(" ")[1] || "23:59"}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                {problemsCount}
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {c.participants || 0}
              </div>

              <div>
                {c.antiCheat || c.anti_cheat ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    <Shield className="w-3 h-3" />
                    On
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                    <ShieldOff className="w-3 h-3" />
                    Off
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      edit: "true",
                      id: c.id,
                      name: c.name,
                      startTime: start,
                      endTime: end,
                      problems: String(problemsCount),
                      antiCheat: typeof (c.antiCheat || c.anti_cheat) === "object" ? JSON.stringify(c.antiCheat || c.anti_cheat) : String(c.antiCheat || c.anti_cheat),
                      questionIds: JSON.stringify(c.question_ids || c.questionIds || []),
                    });
                    window.open(`/admin/contests/new?${params.toString()}`, "_blank");
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(c.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Trophy className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No cs found</p>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-slate-900 mb-2" style={{ fontWeight: 600 }}>Delete c?</h3>
            <p className="text-slate-500 text-sm mb-5">This action cannot be undone. All submissions and data for this c will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700" style={{ fontWeight: 500 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
