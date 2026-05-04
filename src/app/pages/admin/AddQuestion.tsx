import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { ArrowLeft, Upload, Save, X, Info, FileText, FileCheck, Loader2, Sparkles, Terminal, Wand2, Zap } from "lucide-react";
import { ID } from "appwrite";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";

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

  const [activeTab, setActiveTab] = useState<"basic" | "statement" | "boilerplate" | "ai">("basic");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test Case Upload State
  const [testCases, setTestCases] = useState<{ input: string; output: string }[]>([]);
  const [parsingZip, setParsingZip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      setError("Please upload a .zip file containing test cases.");
      return;
    }

    setParsingZip(true);
    setError(null);

    try {
      const zip = await JSZip.loadAsync(file);
      const files = Object.keys(zip.files).filter(f => !zip.files[f].dir);
      
      const parsed: Record<string, { input?: string; output?: string }> = {};

      for (const filename of files) {
        const content = await zip.files[filename].async("string");
        const basename = filename.split('/').pop() || "";
        const base = basename.replace(/\.(in|out|txt)$/, "").replace(/^(input|output)_?/, "");
        
        if (!parsed[base]) parsed[base] = {};

        if (basename.includes("input") || basename.endsWith(".in")) {
          parsed[base].input = content;
        } else if (basename.includes("output") || basename.endsWith(".out")) {
          parsed[base].output = content;
        }
      }

      const finalCases = Object.values(parsed)
        .filter(c => c.input !== undefined && c.output !== undefined)
        .map(c => ({ input: c.input!, output: c.output! }));

      if (finalCases.length === 0) {
        throw new Error("No matching input/output pairs found in ZIP. Files should be named like '1.in'/'1.out' or 'input1.txt'/'output1.txt'.");
      }

      setTestCases(finalCases);
    } catch (err: any) {
      console.error("ZIP Error:", err);
      setError(err.message || "Failed to parse ZIP file.");
    } finally {
      setParsingZip(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
          if (doc.testCases) {
            try {
              setTestCases(JSON.parse(doc.testCases));
            } catch(e){}
          }
          if (doc.boilerplates) {
            try {
              const bp = JSON.parse(doc.boilerplates);
              if (bp.__test_cases__) {
                setTestCases(JSON.parse(bp.__test_cases__));
                delete bp.__test_cases__;
              }
              setBoilerplates(bp);
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
      title: form.title,
      difficulty: form.difficulty,
      points: Number(form.points),
      statement: form.statement,
      inputFormat: form.inputFormat,
      outputFormat: form.outputFormat,
      timeLimit: form.timeLimit,
      memoryLimit: form.memoryLimit,
      sampleInput: form.sampleInput,
      sampleOutput: form.sampleOutput,
      constraints: form.constraints,
      explanation: form.explanation,
      category: form.category,
      boilerplates: JSON.stringify({
        ...boilerplates,
        __test_cases__: JSON.stringify(testCases)
      }),
    };

    try {
      const { databases, APPWRITE_DB_ID } = await import("../../services/appwrite");
      let qid = editId;
      if (isEdit && editId) {
        await databases.updateDocument(APPWRITE_DB_ID, "questions", editId, payload);
      } else {
        const ref = await databases.createDocument(APPWRITE_DB_ID, "questions", ID.unique(), payload);
        qid = ref.$id;
      }

      // Save Test Cases if any
      if (qid && testCases.length > 0) {
        // Simpler approach for the query
        const { Query } = await import("appwrite");
        if (isEdit) {
          const old = await databases.listDocuments(APPWRITE_DB_ID, "test_cases", [
            Query.equal("question_id", qid)
          ]);
          for (const doc of old.documents) {
            await databases.deleteDocument(APPWRITE_DB_ID, "test_cases", doc.$id);
          }
        }

        // Appwrite client doesn't support batch out of the box so we iterate
        for (const tc of testCases) {
          await databases.createDocument(APPWRITE_DB_ID, "test_cases", ID.unique(), {
            question_id: qid,
            input: tc.input,
            expected_output: tc.output,
            is_hidden: false,
          });
        }
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
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
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
            <h1 className="text-3xl font-semibold tracking-tight uppercase">
              {isEdit ? "Edit" : "New"} <span className="text-[#0099ff]">Question</span>
            </h1>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/admin/questions")}
            className="px-8 py-3.5 border border-white/5 text-[#a6a6a6] text-[10px] font-semibold uppercase tracking-wider rounded-full hover:bg-white/5 transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="px-8 py-3.5 bg-[#0099ff] text-white text-[10px] font-semibold uppercase tracking-wider rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,153,255,0.2)] disabled:opacity-50"
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
              className="mb-8 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-widest rounded-2xl px-6 py-4 flex items-center gap-3"
            >
              <X className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-[#090909] border border-white/5 rounded-3xl mb-12">
          {(["basic", "statement", "boilerplate", "ai"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-[10px] font-semibold uppercase tracking-wider rounded-2xl transition-all ${
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
                  <h2 className="text-xl font-semibold tracking-[-0.03em] uppercase">Basic Details</h2>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
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
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252]">Difficulty</label>
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
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252]">Category</label>
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
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252]">Time Limit</label>
                    <input
                      value={form.timeLimit}
                      onChange={(e) => setForm({ ...form, timeLimit: e.target.value })}
                      className="w-full px-6 py-4 bg-[#000000] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 transition-all placeholder:text-[#333]"
                      placeholder="e.g. 2s"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252]">Memory Limit</label>
                    <input
                      value={form.memoryLimit}
                      onChange={(e) => setForm({ ...form, memoryLimit: e.target.value })}
                      className="w-full px-6 py-4 bg-[#000000] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 transition-all placeholder:text-[#333]"
                      placeholder="e.g. 256MB"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252]">Points</label>
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
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252]">Constraints</label>
                  <textarea
                    value={form.constraints}
                    onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                    className="w-full px-6 py-4 bg-[#000000] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 transition-all resize-none h-32 placeholder:text-[#333]"
                    placeholder={"One constraint per line, e.g.:\n1 ≤ n ≤ 10^5\n-10^9 ≤ a[i] ≤ 10^9"}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252]">Test Cases</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".zip"
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
                      testCases.length > 0 ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 hover:border-[#0099ff]/30 bg-[#000000]"
                    }`}
                  >
                    {parsingZip ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-[#0099ff] animate-spin mb-4" />
                        <p className="text-[#a6a6a6] text-[10px] font-semibold uppercase tracking-wider">Processing ZIP...</p>
                      </div>
                    ) : testCases.length > 0 ? (
                      <div className="flex flex-col items-center">
                        <FileCheck className="w-10 h-10 text-emerald-500 mb-4" />
                        <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">{testCases.length} Test Cases Loaded</p>
                        <p className="text-emerald-500/60 text-[9px] font-bold uppercase tracking-wider mt-2">Click to replace ZIP</p>
                      </div>
                    ) : (
                      <div className="group">
                        <Upload className="w-10 h-10 text-[#333] mx-auto mb-4 group-hover:text-[#0099ff] transition-colors" />
                        <p className="text-[#a6a6a6] text-[10px] font-semibold uppercase tracking-wider">Drop .zip or browse</p>
                        <p className="text-[#333] text-[9px] font-bold uppercase tracking-wider mt-2">Required: input.txt + expected_output.txt</p>
                      </div>
                    )}
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
                  <h2 className="text-xl font-semibold tracking-[-0.03em] uppercase">Problem Statement</h2>
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
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
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
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
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

                <p className="text-[#333] text-[9px] font-semibold uppercase tracking-wider">
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
                  <h2 className="text-xl font-semibold tracking-[-0.03em] uppercase">Starter Code</h2>
                </div>

                {/* Input format reminder */}
                {form.inputFormat && (
                  <div className="bg-[#0099ff]/5 border border-[#0099ff]/10 rounded-2xl px-6 py-5">
                    <p className="text-[#0099ff] text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <ArrowLeft className="w-3 h-3 rotate-180" /> Input Reference
                    </p>
                    <p className="text-[#a6a6a6] text-xs font-medium leading-relaxed whitespace-pre-line">{form.inputFormat}</p>
                  </div>
                )}

                <div className="space-y-12">
                  {(["C++", "Java", "Python"] as const).map((lang) => (
                    <div key={lang} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
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

          {/* ── AI GENERATOR TAB ── */}
          {activeTab === "ai" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Sparkles className="w-64 h-64 text-[#0099ff]" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Wand2 className="w-5 h-5 text-[#0099ff]" />
                    <h2 className="text-xl font-semibold tracking-[-0.03em] uppercase">AI Lab</h2>
                  </div>
                  <p className="text-[#525252] text-xs font-medium max-w-xl leading-relaxed mb-10">
                    Describe your test case requirements in natural language. Our engine will generate edge cases, random distributions, and large datasets automatically.
                  </p>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-wider ml-2">Generation Prompt</label>
                      <textarea 
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        placeholder="e.g. Generate 10 test cases. N between 1 and 1000. Each case has an array of N integers between -10^9 and 10^9."
                        className="w-full px-8 py-6 bg-[#000000] border border-white/5 rounded-3xl text-sm font-medium text-white outline-none focus:border-[#0099ff]/50 transition-all h-32 placeholder:text-[#222]"
                      />
                    </div>

                    <button 
                      onClick={async () => {
                        if (!aiPrompt.trim()) return;
                        setGenerating(true);
                        setError(null);
                        
                        try {
                          const response = await fetch("http://localhost:3000/api/ai/generate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              title: form.title,
                              statement: form.statement,
                              inputFormat: form.inputFormat,
                              outputFormat: form.outputFormat,
                              timeComplexity: form.timeComplexity,
                              spaceComplexity: form.spaceComplexity,
                              prompt: aiPrompt
                            })
                          });

                          if (!response.ok) {
                            const rawText = await response.text();
                            let errorMessage = `Server Error (${response.status})`;
                            try {
                              const errData = JSON.parse(rawText);
                              errorMessage = errData.error || errorMessage;
                            } catch (e) {
                              errorMessage = `${errorMessage}: ${rawText.substring(0, 100)}`;
                            }
                            throw new Error(errorMessage);
                          }
                          
                          const data = await response.json();
                          const rawCases = data.testCases || data || [];
                          
                          if (Array.isArray(rawCases)) {
                            const formattedCases = rawCases.map((tc: any, idx: number) => ({
                              id: `ai_${Date.now()}_${idx}`,
                              input: tc.input || "",
                              expected_output: tc.output || tc.expected_output || "",
                            }));
                            
                            setTestCases(formattedCases);
                            if (data.suggestedTimeComplexity || data.suggestedSpaceComplexity) {
                              setForm({
                                ...form,
                                timeComplexity: data.suggestedTimeComplexity || form.timeComplexity,
                                spaceComplexity: data.suggestedSpaceComplexity || form.spaceComplexity
                              });
                            }
                            setAiPrompt("");
                            setActiveTab("basic");
                          } else {
                            throw new Error("Invalid response from AI");
                          }
                        } catch (err: any) {
                          console.error("AI Generation Error:", err);
                          setError(err.message || "Failed to generate test cases. Check backend logs.");
                        } finally {
                          setGenerating(false);
                        }
                      }}
                      disabled={generating || !aiPrompt.trim()}
                      className="w-full h-16 rounded-3xl bg-[#0099ff] hover:bg-[#0099ff]/90 disabled:bg-[#333] disabled:cursor-not-allowed text-white font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-[#0099ff]/20"
                    >
                      {generating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          <span>Generate Lab Dataset</span>
                        </>
                      )}
                    </button>

                    {testCases.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 pt-10 border-t border-white/5"
                      >
                        <div className="flex items-center justify-between px-4">
                          <div className="flex items-center gap-3">
                            <FileCheck className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Review Dataset</h3>
                          </div>
                          <span className="text-[10px] font-bold text-[#525252] uppercase">{testCases.length} Cases Generated</span>
                        </div>

                        <div className="bg-[#050505] border border-white/5 rounded-3xl overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#090909] border-b border-white/5">
                              <tr>
                                <th className="px-6 py-4 font-bold text-[#2a2a2a] uppercase tracking-wider">#</th>
                                <th className="px-6 py-4 font-bold text-[#2a2a2a] uppercase tracking-wider w-1/2">Input</th>
                                <th className="px-6 py-4 font-bold text-[#2a2a2a] uppercase tracking-wider">Expected Output</th>
                                <th className="px-6 py-4 font-bold text-[#2a2a2a] uppercase tracking-wider text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {testCases.map((tc, idx) => (
                                <tr key={tc.id} className="group hover:bg-white/[0.02] transition-colors">
                                  <td className="px-6 py-4 font-mono text-[#333]">{idx + 1}</td>
                                  <td className="px-6 py-4">
                                    <textarea 
                                      value={tc.input}
                                      onChange={(e) => {
                                        const newCases = [...testCases];
                                        newCases[idx].input = e.target.value;
                                        setTestCases(newCases);
                                      }}
                                      className="w-full bg-transparent border-none outline-none text-[#a6a6a6] font-mono resize-none focus:text-white"
                                      rows={2}
                                    />
                                  </td>
                                  <td className="px-6 py-4">
                                    <input 
                                      value={tc.expected_output}
                                      onChange={(e) => {
                                        const newCases = [...testCases];
                                        newCases[idx].expected_output = e.target.value;
                                        setTestCases(newCases);
                                      }}
                                      className="w-full bg-transparent border-none outline-none text-[#0099ff] font-mono font-bold focus:text-[#0099ff]/100"
                                    />
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button 
                                      onClick={() => setTestCases(testCases.filter((_, i) => i !== idx))}
                                      className="p-2 rounded-lg hover:bg-rose-500/10 text-[#333] hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-12">
                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                    <Zap className="w-4 h-4 text-[#0099ff] mb-3" />
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">Edge Case Detection</h4>
                    <p className="text-[9px] text-[#525252] leading-relaxed uppercase font-semibold">Empty inputs, maximum constraints, and null values included.</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                    <Terminal className="w-4 h-4 text-emerald-500 mb-3" />
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">Pattern Matching</h4>
                    <p className="text-[9px] text-[#525252] leading-relaxed uppercase font-semibold">Supports arrays, trees, graphs, and custom string structures.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}