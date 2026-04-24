import { useState, useEffect } from "react";
import {
  Plus, Edit2, Trash2, Search, Code2, FileText, TestTube,
} from "lucide-react";

const API = "http://localhost:3000/api";

const difficultyConfig: Record<string, string> = {
  easy:   "bg-green-50 text-green-700 border-green-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard:   "bg-red-50 text-red-700 border-red-200",
};

export default function QuestionManagement() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterDiff, setFilterDiff] = useState("All");

  useEffect(() => {
    fetch(`${API}/questions`)
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(err => console.error("Failed to load questions:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = questions.filter((q) => {
    const matchSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.category || "").toLowerCase().includes(search.toLowerCase());
    const matchDiff =
      filterDiff === "All" ||
      q.difficulty.toLowerCase() === filterDiff.toLowerCase();
    return matchSearch && matchDiff;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question and all its test cases?")) return;
    try {
      const res = await fetch(`${API}/questions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setQuestions(questions.filter(q => q.id !== id));
      } else {
        alert("Failed to delete question");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  if (loading) return (
    <div className="p-6 text-slate-400 text-sm">Loading questions...</div>
  );

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.4rem" }}>
            Question Bank
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {questions.length} problems in the bank
          </p>
        </div>
        <button
          onClick={() => window.open("/admin/questions/new", "_blank")}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          style={{ fontWeight: 500 }}
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or category..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex gap-1.5">
          {["All", "Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDiff(d)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filterDiff === d
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Easy",   color: "text-green-600", bg: "bg-green-50 border-green-200" },
          { label: "Medium", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
          { label: "Hard",   color: "text-red-600",   bg: "bg-red-50 border-red-200"     },
        ].map((item) => (
          <div key={item.label} className={`border rounded-xl p-4 ${item.bg}`}>
            <div className={`text-2xl mb-0.5 ${item.color}`} style={{ fontWeight: 700 }}>
              {questions.filter(q => q.difficulty === item.label.toLowerCase()).length}
            </div>
            <div className={`text-sm ${item.color}`}>{item.label} Problems</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div
          className="grid px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-400"
          style={{ gridTemplateColumns: "1fr 100px 160px 80px 80px 80px 80px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}
        >
          <span>Title</span>
          <span>Difficulty</span>
          <span>Category</span>
          <span>Time</span>
          <span>Memory</span>
          <span>Tests</span>
          <span>Actions</span>
        </div>

        {filtered.map((q) => (
          <div
            key={q.id}
            className="grid px-5 py-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50/50 transition-colors"
            style={{ gridTemplateColumns: "1fr 100px 160px 80px 80px 80px 80px" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-slate-800 text-sm" style={{ fontWeight: 500 }}>
                {q.title}
              </span>
            </div>

            <span className={`text-xs px-2 py-0.5 rounded-full border inline-block w-fit ${difficultyConfig[q.difficulty]}`}>
              {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
            </span>

            <span className="text-slate-500 text-xs">{q.category || "—"}</span>
            <span className="text-slate-500 text-xs">{q.time_limit || "—"}</span>
            <span className="text-slate-500 text-xs">{q.memory_limit || "—"}</span>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <TestTube className="w-3.5 h-3.5 text-slate-400" />
              {q.test_cases?.length ?? "—"}
            </div>

            <div className="flex items-center gap-1.5">
              <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(q.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Code2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No questions found</p>
          </div>
        )}
      </div>
    </div>
  );
}