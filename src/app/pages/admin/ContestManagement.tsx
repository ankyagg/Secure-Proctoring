import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Shield,
  ShieldOff,
  Users,
  BookOpen,
  X,
  Check,
  Calendar,
  Clock,
} from "lucide-react";
import { adminContests } from "../../data/mockData";

type Contest = typeof adminContests[0];

const statusConfig = {
  Live: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
  Upcoming: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  Ended: { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-400" },
};

interface ModalProps {
  contest?: Contest | null;
  onClose: () => void;
  onSave: (c: Partial<Contest>) => void;
}

function ContestModal({ contest, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState({
    name: contest?.name ?? "",
    startTime: contest?.startTime ?? "2026-03-10 11:00",
    endTime: contest?.endTime ?? "2026-03-10 14:00",
    problems: contest?.problems ?? 5,
    antiCheat: contest?.antiCheat ?? true,
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h2 className="text-slate-900" style={{ fontWeight: 600 }}>
            {contest ? "Edit Contest" : "Create New Contest"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Contest Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="e.g. Weekly DSA Championship #43"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Start Time</label>
              <input
                type="text"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="YYYY-MM-DD HH:MM"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>End Time</label>
              <input
                type="text"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="YYYY-MM-DD HH:MM"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Number of Problems</label>
            <input
              type="number"
              value={form.problems}
              onChange={(e) => setForm({ ...form, problems: Number(e.target.value) })}
              min={1}
              max={20}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-3" style={{ fontWeight: 500 }}>Anti-Cheat Features</label>
            <div className="space-y-2.5">
              {[
                { id: "ac", label: "Enable Anti-Cheat Monitoring", main: true },
                { id: "fs", label: "Fullscreen required", sub: true },
                { id: "tab", label: "Tab switch detection", sub: true },
                { id: "cam", label: "Webcam required", sub: true },
                { id: "face", label: "Multiple face detection", sub: true },
              ].map((item) => (
                <label key={item.id} className={`flex items-center gap-3 cursor-pointer ${item.sub ? "ml-5" : ""}`}>
                  <div
                    onClick={() => item.main && setForm({ ...form, antiCheat: !form.antiCheat })}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      (!item.sub && form.antiCheat) || (item.sub && form.antiCheat)
                        ? "bg-blue-600 border-blue-600"
                        : "border-slate-300"
                    } ${item.sub && !form.antiCheat ? "opacity-40" : ""}`}
                  >
                    {((!item.sub && form.antiCheat) || (item.sub && form.antiCheat)) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-sm ${item.sub ? "text-slate-500" : "text-slate-700"}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            style={{ fontWeight: 500 }}
          >
            {contest ? "Save Changes" : "Create Contest"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContestManagement() {
  const [contests, setContests] = useState(adminContests);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = contests.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data: Partial<Contest>) => {
    if (editingContest) {
      setContests(contests.map((c) => (c.id === editingContest.id ? { ...c, ...data } : c)));
    } else {
      setContests([
        ...contests,
        { id: String(Date.now()), participants: 0, status: "Upcoming", ...data } as Contest,
      ]);
    }
  };

  const handleDelete = (id: string) => {
    setContests(contests.filter((c) => c.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.4rem" }}>
            Contest Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{contests.length} contests total</p>
        </div>
        <button
          onClick={() => { setEditingContest(null); setShowModal(true); }}
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
          placeholder="Search contests..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="grid px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-400"
          style={{ gridTemplateColumns: "1fr 120px 180px 80px 80px 100px 100px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          <span>Contest</span>
          <span>Status</span>
          <span>Schedule</span>
          <span>Problems</span>
          <span>Users</span>
          <span>Anti-Cheat</span>
          <span>Actions</span>
        </div>

        {filtered.map((contest) => {
          const s = statusConfig[contest.status as keyof typeof statusConfig];
          return (
            <div
              key={contest.id}
              className="grid px-5 py-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50/50 transition-colors"
              style={{ gridTemplateColumns: "1fr 120px 180px 80px 80px 100px 100px" }}
            >
              <div>
                <div className="text-slate-800 text-sm" style={{ fontWeight: 500 }}>
                  {contest.name}
                </div>
              </div>

              <div>
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${contest.status === "Live" ? "animate-pulse" : ""}`} />
                  {contest.status}
                </span>
              </div>

              <div className="text-xs text-slate-500 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {contest.startTime.split(" ")[0]}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {contest.startTime.split(" ")[1]} – {contest.endTime.split(" ")[1]}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                {contest.problems}
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {contest.participants}
              </div>

              <div>
                {contest.antiCheat ? (
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
                  onClick={() => { setEditingContest(contest); setShowModal(true); }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(contest.id)}
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
            <p className="text-sm">No contests found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ContestModal
          contest={editingContest}
          onClose={() => { setShowModal(false); setEditingContest(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-slate-900 mb-2" style={{ fontWeight: 600 }}>Delete Contest?</h3>
            <p className="text-slate-500 text-sm mb-5">This action cannot be undone. All submissions and data for this contest will be permanently deleted.</p>
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
