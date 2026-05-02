import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { ArrowLeft, Upload, Save, X, Info } from "lucide-react";
import { ID } from "appwrite";
import { motion, AnimatePresence } from "framer-motion";

export default function AddQuestion() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    points: 100,
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

  useEffect(() => {
    if (isEdit && editId) {
      import("../../services/appwrite").then(({ databases, APPWRITE_DB_ID }) => {
        databases.getDocument(APPWRITE_DB_ID, "questions", editId).then((doc) => {
          setForm({
            title: doc.title || "",
            difficulty: doc.difficulty || "Medium",
            category: doc.category || "",
            timeLimit: doc.timeLimit || "2s",
            memoryLimit: doc.memoryLimit || "256MB",
            statement: doc.statement || "",
            constraints: doc.constraints || "",
            inputFormat: doc.inputFormat || "",
            outputFormat: doc.outputFormat || "",
            sampleInput: doc.sampleInput || "",
            sampleOutput: doc.sampleOutput || "",
            explanation: doc.explanation || "",
            points: doc.points || 100,
          });
          if (doc.boilerplates) {
            try {
              setBoilerplates(JSON.parse(doc.boilerplates));
            } catch(e){}
          }
        }).catch(err => {
          console.error("Failed to fetch document for editing:", err);
          setError("Failed to fetch existing question data.");
        });
      });
    }
  }, [isEdit, editId]);

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
      points: Number(form.points),
      boilerplates: JSON.stringify(boilerplates),
      updatedAt: new Date().toISOString(),
    };

    try {
      const { databases, APPWRITE_DB_ID } = await import("../../services/appwrite");
      if (isEdit && editId) {
        await databases.updateDocument(APPWRITE_DB_ID, "questions", editId, payload);
      } else {
        await databases.createDocument(APPWRITE_DB_ID, "questions", ID.unique(), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
      }
      setSaved(true);
      setTimeout(() => navigate("/admin/questions"), 1200);
    } catch (err: any) {
      console.error("Appwrite error:", err);
      setError("Failed to save question. Check your Appwrite config and rules.");
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
    <div className="space-y-2">
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">
        {label}
      </label>
      <textarea
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        rows={rows}
        className={`w-full px-5 py-4 bg-[#090909] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 focus:ring-4 focus:ring-[#0099ff]/5 transition-all resize-none placeholder:text-[#333] ${mono ? "font-mono text-xs" : ""}`}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#0099ff]/30">
      {/* Top bar */}
      <div className="bg-[#000000]/80 backdrop-blur-xl border-b border-white/5 px-8 py-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/admin/questions")}
            className="p-3 text-[#525252] hover:text-white hover:bg-white/5 rounded-2xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-[-0.05em] uppercase">
              {isEdit ? "Edit" : "New"} <span className="text-[#0099ff]">Question</span>
            </h1>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/admin/questions")}
            className="px-8 py-3.5 border border-white/5 text-[#a6a6a6] text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-white/5 transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="px-8 py-3.5 bg-[#0099ff] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,153,255,0.2)] disabled:opacity-50"
          >
            {saved ? "Saved ✓" : saving ? "Saving…" : isEdit ? "Save Changes" : "Create Question"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-8">
        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest rounded-2xl px-6 py-4 flex items-center gap-3"
            >
              <X className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-[#090909] border border-white/5 rounded-3xl mb-12">
          {(["basic", "statement", "boilerplate"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${
                activeTab === tab
                  ? "bg-[#0099ff] text-white shadow-[0_0_20px_rgba(0,153,255,0.3)]"
                  : "text-[#525252] hover:text-[#a6a6a6] hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form content */}
        <div className="space-y-12">

          {/* ── BASIC TAB ── */}
          {activeTab === "basic" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-[#0099ff]" />
                  <h2 className="text-xl font-black tracking-[-0.03em] uppercase">Basic Details</h2>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">
                    Problem Title <span className="text-[#0099ff]">*</span>
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-6 py-4 bg-[#000000] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 focus:ring-4 focus:ring-[#0099ff]/5 transition-all placeholder:text-[#333]"
                    placeholder="e.g. Array Summation"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">Difficulty</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                      className="w-full px-6 py-4 bg-[#000000] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 transition-all appearance-none cursor-pointer"
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">Category</label>
                    <input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-6 py-4 bg-[#000000] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 transition-all placeholder:text-[#333]"
                      placeholder="e.g. Dynamic Programming"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">Time Limit</label>
                    <input
                      value={form.timeLimit}
                      onChange={(e) => setForm({ ...form, timeLimit: e.target.value })}
                      className="w-full px-6 py-4 bg-[#000000] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 transition-all placeholder:text-[#333]"
                      placeholder="e.g. 2s"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">Memory Limit</label>
                    <input
                      value={form.memoryLimit}
                      onChange={(e) => setForm({ ...form, memoryLimit: e.target.value })}
                      className="w-full px-6 py-4 bg-[#000000] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 transition-all placeholder:text-[#333]"
                      placeholder="e.g. 256MB"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">Points</label>
                    <input
                      type="number"
                      value={form.points}
                      onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                      className="w-full px-6 py-4 bg-[#000000] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 transition-all placeholder:text-[#333]"
                      placeholder="e.g. 100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">Constraints</label>
                  <textarea
                    value={form.constraints}
                    onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                    className="w-full px-6 py-4 bg-[#000000] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 transition-all resize-none h-32 placeholder:text-[#333]"
                    placeholder={"One constraint per line, e.g.:\n1 ≤ n ≤ 10^5\n-10^9 ≤ a[i] ≤ 10^9"}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">Test Cases</label>
                  <div className="border-2 border-dashed border-white/5 rounded-3xl p-12 text-center hover:border-[#0099ff]/30 transition-all cursor-pointer bg-[#000000]">
                    <Upload className="w-10 h-10 text-[#333] mx-auto mb-4 group-hover:text-[#0099ff] transition-colors" />
                    <p className="text-[#a6a6a6] text-[10px] font-black uppercase tracking-[0.2em]">Drop .zip or browse</p>
                    <p className="text-[#333] text-[9px] font-bold uppercase tracking-[0.1em] mt-2">Required: input.txt + expected_output.txt</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STATEMENT TAB ── */}
          {activeTab === "statement" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] p-10 space-y-10 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-[#0099ff]" />
                  <h2 className="text-xl font-black tracking-[-0.03em] uppercase">Problem Statement</h2>
                </div>

                {inputField(
                  "Description",
                  "statement",
                  "Define the core algorithm objective and scenario...",
                  10
                )}

                <div className="grid grid-cols-2 gap-8">
                  {inputField(
                    "Input Format",
                    "inputFormat",
                    "Define how the data is fed to stdin...",
                    5
                  )}
                  {inputField(
                    "Output Format",
                    "outputFormat",
                    "Define the required stdout format...",
                    5
                  )}
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">
                      Sample Input
                    </label>
                    <textarea
                      value={form.sampleInput}
                      onChange={(e) => setForm({ ...form, sampleInput: e.target.value })}
                      rows={5}
                      className="w-full px-5 py-4 bg-[#000000] text-emerald-400 border border-white/5 rounded-2xl text-xs font-mono outline-none resize-none placeholder:text-[#222]"
                      placeholder={"4 9\n2 7 11 15"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">
                      Sample Output
                    </label>
                    <textarea
                      value={form.sampleOutput}
                      onChange={(e) => setForm({ ...form, sampleOutput: e.target.value })}
                      rows={5}
                      className="w-full px-5 py-4 bg-[#000000] text-emerald-400 border border-white/5 rounded-2xl text-xs font-mono outline-none resize-none placeholder:text-[#222]"
                      placeholder={"0 1"}
                    />
                  </div>
                </div>

                {inputField(
                  "Explanation",
                  "explanation",
                  "Describe why the sample output is correct based on the input...",
                  4
                )}

                <p className="text-[#333] text-[9px] font-black uppercase tracking-[0.2em]">
                  Markdown rendering enabled for description and explanations.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── BOILERPLATE TAB ── */}
          {activeTab === "boilerplate" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] p-10 space-y-10 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Save className="w-5 h-5 text-[#0099ff]" />
                  <h2 className="text-xl font-black tracking-[-0.03em] uppercase">Starter Code</h2>
                </div>

                {/* Input format reminder */}
                {form.inputFormat && (
                  <div className="bg-[#0099ff]/5 border border-[#0099ff]/10 rounded-2xl px-6 py-5">
                    <p className="text-[#0099ff] text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <ArrowLeft className="w-3 h-3 rotate-180" /> Input Reference
                    </p>
                    <p className="text-[#a6a6a6] text-xs font-medium leading-relaxed whitespace-pre-line">{form.inputFormat}</p>
                  </div>
                )}

                <div className="space-y-12">
                  {(["C++", "Java", "Python"] as const).map((lang) => (
                    <div key={lang} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">
                          {lang} Starter Code
                        </label>
                      </div>
                      <textarea
                        value={boilerplates[lang]}
                        onChange={(e) =>
                          setBoilerplates((prev) => ({ ...prev, [lang]: e.target.value }))
                        }
                        className="w-full px-6 py-6 bg-[#000000] text-blue-100 border border-white/5 rounded-3xl text-xs font-mono outline-none resize-none h-64 focus:border-[#0099ff]/30 transition-all shadow-inner"
                        placeholder={`${lang} starter code...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}