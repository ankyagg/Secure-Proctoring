import { useState } from "react";
import { useSearchParams } from "react-router";
import { ArrowLeft, Upload } from "lucide-react";

export default function AddQuestion() {
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";

  const [form, setForm] = useState({
    title: searchParams.get("title") ?? "",
    difficulty: searchParams.get("difficulty") ?? "Medium",
    category: searchParams.get("category") ?? "",
    timeLimit: searchParams.get("timeLimit") ?? "2s",
    memoryLimit: searchParams.get("memoryLimit") ?? "256MB",
    statement: "",
    constraints: "",
    boilerplate: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Solution\n    return 0;\n}`,
  });

  const [activeTab, setActiveTab] = useState<"basic" | "statement" | "boilerplate">("basic");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => window.close(), 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.close()}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-slate-900 text-lg" style={{ fontWeight: 600 }}>
            {isEdit ? "Edit Question" : "Add New Question"}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.close()}
            className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            style={{ fontWeight: 500 }}
          >
            {saved ? "Saved ✓" : isEdit ? "Save Changes" : "Add Question"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto pt-6 px-6">
        <div className="flex gap-1 border-b border-slate-200">
          {(["basic", "statement", "boilerplate"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm capitalize rounded-t-lg transition-colors -mb-px border-b-2 ${
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
      </div>

      {/* Form content */}
      <div className="max-w-3xl mx-auto py-6 px-6 space-y-6">
        {activeTab === "basic" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-slate-800 text-base" style={{ fontWeight: 600 }}>
              Basic Information
            </h2>

            <div>
              <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Problem Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="e.g. Two Sum"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
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
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
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
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. 2s"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Memory Limit</label>
                <input
                  value={form.memoryLimit}
                  onChange={(e) => setForm({ ...form, memoryLimit: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. 256MB"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Constraints</label>
              <textarea
                value={form.constraints}
                onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all resize-none h-28"
                placeholder={"One constraint per line, e.g.:\n1 ≤ n ≤ 10^5\n-10^9 ≤ a[i] ≤ 10^9"}
              />
            </div>

            {/* Test cases upload */}
            <div>
              <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Test Cases</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors cursor-pointer">
                <Upload className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Drop .zip file or click to upload</p>
                <p className="text-slate-300 text-xs mt-1">Each test case: input.txt + expected_output.txt</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "statement" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-slate-800 text-base" style={{ fontWeight: 600 }}>
              Problem Statement
            </h2>
            <textarea
              value={form.statement}
              onChange={(e) => setForm({ ...form, statement: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all resize-none h-80"
              placeholder="Write the full problem statement here. Use **bold**, `code`, and newlines as needed."
            />
            <p className="text-slate-400 text-xs">
              Use markdown syntax: **bold**, `inline code`, newlines for paragraphs
            </p>
          </div>
        )}

        {activeTab === "boilerplate" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div>
              <h2 className="text-slate-800 text-base" style={{ fontWeight: 600 }}>
                Boilerplate Code
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Provide starting code templates for each supported language. These appear
                in the student's editor when they open the problem.
              </p>
            </div>
            {["C++", "Java", "Python"].map((lang) => (
              <div key={lang}>
                <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>
                  {lang} Boilerplate
                </label>
                <textarea
                  className="w-full px-3 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg text-xs outline-none resize-none h-32"
                  style={{ fontFamily: "monospace" }}
                  defaultValue={lang === "C++" ? form.boilerplate : ""}
                  placeholder={`${lang} starter code...`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
