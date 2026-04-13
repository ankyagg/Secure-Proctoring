import { useState } from "react";
import { useSearchParams } from "react-router";
import { ArrowLeft, Upload } from "lucide-react";
import { db } from "../../services/firebase";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function AddQuestion() {
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";
  const editId = searchParams.get("id") ?? null;

  const [form, setForm] = useState({
    title: searchParams.get("title") ?? "",
    difficulty: searchParams.get("difficulty") ?? "Medium",
    category: searchParams.get("category") ?? "",
    timeLimit: searchParams.get("timeLimit") ?? "2s",
    memoryLimit: searchParams.get("memoryLimit") ?? "256MB",
    statement: "",
    constraints: "",
    inputFormat: "",
    outputFormat: "",
    sampleInput: "",
    sampleOutput: "",
    explanation: "",
  });

  const [boilerplates, setBoilerplates] = useState<Record<string, string>>({
    "C++": `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Solution\n    return 0;\n}`,
    Java: "",
    Python: "",
  });

  const [activeTab, setActiveTab] = useState<"basic" | "statement" | "boilerplate">("basic");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Problem title is required.");
      setActiveTab("basic");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      boilerplates,
      updatedAt: serverTimestamp(),
    };

    try {
      if (isEdit && editId) {
        await updateDoc(doc(db, "questions", editId), payload);
      } else {
        await addDoc(collection(db, "questions"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setSaved(true);
      setTimeout(() => window.close(), 1200);
    } catch (err: any) {
      console.error("Firebase error:", err);
      setError("Failed to save question. Check your Firebase config and rules.");
    } finally {
      setSaving(false);
    }
  };

  const inputField = (
    label: string,
    key: keyof typeof form,
    placeholder: string,
    rows: number = 3,
    mono: boolean = false
  ) => (
    <div>
      <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>
        {label}
      </label>
      <textarea
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        rows={rows}
        className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all resize-none ${mono ? "text-xs" : ""}`}
        style={mono ? { fontFamily: "monospace" } : {}}
        placeholder={placeholder}
      />
    </div>
  );

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
            disabled={saving || saved}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            style={{ fontWeight: 500 }}
          >
            {saved ? "Saved ✓" : saving ? "Saving…" : isEdit ? "Save Changes" : "Add Question"}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="max-w-3xl mx-auto mt-4 px-6">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        </div>
      )}

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

        {/* ── BASIC TAB ── */}
        {activeTab === "basic" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-slate-800 text-base" style={{ fontWeight: 600 }}>
              Basic Information
            </h2>

            <div>
              <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>
                Problem Title <span className="text-red-500">*</span>
              </label>
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

        {/* ── STATEMENT TAB ── */}
        {activeTab === "statement" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-slate-800 text-base" style={{ fontWeight: 600 }}>
              Problem Statement
            </h2>

            {inputField(
              "Statement",
              "statement",
              "Write the full problem statement here...",
              8
            )}

            {/* Input / Output format side by side */}
            <div className="grid grid-cols-2 gap-4">
              {inputField(
                "Input Format",
                "inputFormat",
                "e.g.\nFirst line: n and target\nSecond line: n space-separated integers",
                4
              )}
              {inputField(
                "Output Format",
                "outputFormat",
                "e.g.\nPrint two space-separated integers — the 0-based indices",
                4
              )}
            </div>

            {/* Sample Input / Output side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>
                  Sample Input
                </label>
                <textarea
                  value={form.sampleInput}
                  onChange={(e) => setForm({ ...form, sampleInput: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2.5 bg-slate-900 text-green-400 border border-slate-700 rounded-lg text-xs outline-none resize-none"
                  style={{ fontFamily: "monospace" }}
                  placeholder={"4 9\n2 7 11 15"}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>
                  Sample Output
                </label>
                <textarea
                  value={form.sampleOutput}
                  onChange={(e) => setForm({ ...form, sampleOutput: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2.5 bg-slate-900 text-green-400 border border-slate-700 rounded-lg text-xs outline-none resize-none"
                  style={{ fontFamily: "monospace" }}
                  placeholder={"0 1"}
                />
              </div>
            </div>

            {inputField(
              "Explanation",
              "explanation",
              "e.g. nums[0] + nums[1] = 2 + 7 = 9, so return [0, 1].",
              3
            )}

            <p className="text-slate-400 text-xs">
              Use markdown syntax in the statement: **bold**, `inline code`, newlines for paragraphs
            </p>
          </div>
        )}

        {/* ── BOILERPLATE TAB ── */}
        {activeTab === "boilerplate" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div>
              <h2 className="text-slate-800 text-base" style={{ fontWeight: 600 }}>
                Boilerplate Code
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Provide starting code templates for each supported language. The{" "}
                <span className="font-medium text-slate-700">input format</span> you defined
                above should be handled by the boilerplate's{" "}
                <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">main()</code> — Wandbox
                will feed <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">sampleInput</code>{" "}
                directly as stdin when judging.
              </p>
            </div>

            {/* Input format reminder */}
            {form.inputFormat && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <p className="text-blue-700 text-xs" style={{ fontWeight: 500 }}>
                  📋 Input Format (for reference while writing boilerplate)
                </p>
                <p className="text-blue-600 text-xs mt-1 whitespace-pre-line">{form.inputFormat}</p>
              </div>
            )}

            {(["C++", "Java", "Python"] as const).map((lang) => (
              <div key={lang}>
                <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>
                  {lang} Boilerplate
                </label>
                <textarea
                  value={boilerplates[lang]}
                  onChange={(e) =>
                    setBoilerplates((prev) => ({ ...prev, [lang]: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg text-xs outline-none resize-none h-48"
                  style={{ fontFamily: "monospace" }}
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