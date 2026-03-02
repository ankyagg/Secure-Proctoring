import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  X,
  Code2,
  FileText,
  TestTube,
} from "lucide-react";
import { adminQuestions } from "../../data/mockData";

type Question = typeof adminQuestions[0];

const difficultyConfig = {
  Easy: "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard: "bg-red-50 text-red-700 border-red-200",
};

interface QuestionModalProps {
  question?: Question | null;
  onClose: () => void;
  onSave: (q: Partial<Question>) => void;
}

function QuestionModal({ question, onClose, onSave }: QuestionModalProps) {
  const [form, setForm] = useState({
    title: question?.title ?? "",
    difficulty: question?.difficulty ?? "Medium",
    category: question?.category ?? "",
    timeLimit: question?.timeLimit ?? "2s",
    memoryLimit: question?.memoryLimit ?? "256MB",
    statement: "",
    constraints: "",
    boilerplate: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Solution\n    return 0;\n}`,
  });

  const [activeTab, setActiveTab] = useState<"basic" | "statement" | "boilerplate">("basic");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-slate-900" style={{ fontWeight: 600 }}>
            {question ? "Edit Question" : "Add New Question"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-200 flex-shrink-0">
          {(["basic", "statement", "boilerplate"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm capitalize rounded-t-lg transition-colors -mb-px border-b-2 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-700 bg-blue-50/50"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
              style={{ fontWeight: activeTab === tab ? 500 : 400 }}
            >
              {tab === "boilerplate" ? "Boilerplate" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {activeTab === "basic" && (
            <>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Problem Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="e.g. Two Sum"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
                    placeholder="e.g. Hash Map"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Time Limit</label>
                  <input
                    value={form.timeLimit}
                    onChange={(e) => setForm({ ...form, timeLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
                    placeholder="e.g. 2s"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Memory Limit</label>
                  <input
                    value={form.memoryLimit}
                    onChange={(e) => setForm({ ...form, memoryLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
                    placeholder="e.g. 256MB"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Constraints</label>
                <textarea
                  value={form.constraints}
                  onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all resize-none h-24"
                  placeholder="One constraint per line, e.g.:&#10;1 ≤ n ≤ 10^5&#10;-10^9 ≤ a[i] ≤ 10^9"
                />
              </div>

              {/* Test cases upload */}
              <div>
                <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Test Cases</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Drop .zip file or click to upload</p>
                  <p className="text-slate-300 text-xs mt-1">Each test case: input.txt + expected_output.txt</p>
                </div>
              </div>
            </>
          )}

          {activeTab === "statement" && (
            <div>
              <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Problem Statement (Markdown supported)</label>
              <textarea
                value={form.statement}
                onChange={(e) => setForm({ ...form, statement: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all resize-none h-64"
                placeholder="Write the full problem statement here. Use **bold**, `code`, and newlines as needed."
              />
              <p className="text-slate-400 text-xs mt-2">
                Use markdown syntax: **bold**, `inline code`, newlines for paragraphs
              </p>
            </div>
          )}

          {activeTab === "boilerplate" && (
            <div className="space-y-4">
              <p className="text-slate-500 text-sm">
                Provide starting code templates for each supported language. These appear
                in the student's editor when they open the problem.
              </p>
              {["C++", "Java", "Python"].map((lang) => (
                <div key={lang}>
                  <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>
                    {lang} Boilerplate
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg text-xs outline-none resize-none h-28"
                    style={{ fontFamily: "monospace" }}
                    defaultValue={lang === "C++" ? form.boilerplate : ""}
                    placeholder={`${lang} starter code...`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-3 flex-shrink-0 border-t border-slate-100 pt-4">
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
            {question ? "Save Changes" : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuestionManagement() {
  const [questions, setQuestions] = useState(adminQuestions);
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);

  const filtered = questions.filter((q) => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.category.toLowerCase().includes(search.toLowerCase());
    const matchDiff = filterDiff === "All" || q.difficulty === filterDiff;
    return matchSearch && matchDiff;
  });

  const handleSave = (data: Partial<Question>) => {
    if (editingQ) {
      setQuestions(questions.map((q) => q.id === editingQ.id ? { ...q, ...data } : q));
    } else {
      setQuestions([...questions, { id: Date.now(), testCases: 0, usedIn: 0, ...data } as Question]);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.4rem" }}>
            Question Bank
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{questions.length} problems in the bank</p>
        </div>
        <button
          onClick={() => { setEditingQ(null); setShowModal(true); }}
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
          { label: "Easy", count: questions.filter(q => q.difficulty === "Easy").length, color: "text-green-600", bg: "bg-green-50 border-green-200" },
          { label: "Medium", count: questions.filter(q => q.difficulty === "Medium").length, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
          { label: "Hard", count: questions.filter(q => q.difficulty === "Hard").length, color: "text-red-600", bg: "bg-red-50 border-red-200" },
        ].map((item) => (
          <div key={item.label} className={`border rounded-xl p-4 ${item.bg}`}>
            <div className={`text-2xl mb-0.5 ${item.color}`} style={{ fontWeight: 700 }}>{item.count}</div>
            <div className={`text-sm ${item.color}`}>{item.label} Problems</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div
          className="grid px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-400"
          style={{ gridTemplateColumns: "1fr 100px 160px 80px 80px 80px 80px 80px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}
        >
          <span>Title</span>
          <span>Difficulty</span>
          <span>Category</span>
          <span>Time</span>
          <span>Memory</span>
          <span>Tests</span>
          <span>Used In</span>
          <span>Actions</span>
        </div>

        {filtered.map((q) => (
          <div
            key={q.id}
            className="grid px-5 py-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50/50 transition-colors"
            style={{ gridTemplateColumns: "1fr 100px 160px 80px 80px 80px 80px 80px" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-slate-800 text-sm" style={{ fontWeight: 500 }}>
                {q.title}
              </span>
            </div>

            <span className={`text-xs px-2 py-0.5 rounded-full border inline-block w-fit ${difficultyConfig[q.difficulty as keyof typeof difficultyConfig]}`}>
              {q.difficulty}
            </span>

            <span className="text-slate-500 text-xs">{q.category}</span>
            <span className="text-slate-500 text-xs">{q.timeLimit}</span>
            <span className="text-slate-500 text-xs">{q.memoryLimit}</span>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <TestTube className="w-3.5 h-3.5 text-slate-400" />
              {q.testCases}
            </div>

            <span className="text-xs text-slate-500">{q.usedIn} contest{q.usedIn !== 1 ? "s" : ""}</span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setEditingQ(q); setShowModal(true); }}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setQuestions(questions.filter((x) => x.id !== q.id))}
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

      {showModal && (
        <QuestionModal
          question={editingQ}
          onClose={() => { setShowModal(false); setEditingQ(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
