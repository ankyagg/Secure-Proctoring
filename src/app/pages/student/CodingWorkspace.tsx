import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronLeft,
  Play,
  Send,
  ChevronDown,
  Copy,
  RotateCcw,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  X,
  Mail,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import Watermark from "../../components/Watermark";
import WebcamPreview from "../../components/WebcamPreview";
import { useStudentContext } from "../../components/StudentLayout";
import { db, auth } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

const API_BASE = "http://localhost:3000/api";

const LANGUAGES = ["C++", "Java", "Python"];

const WANDBOX_URL = "https://wandbox.org/api/compile.json";
const WANDBOX_COMPILERS: Record<string, string> = {
  "C++": "gcc-head",
  Java: "openjdk-jdk-21+35",
  Python: "cpython-3.12.3",
};

const LANGUAGE_MAP: Record<string, string> = {
  "C++": "cpp",
  Java: "java",
  Python: "python",
};

async function parseWandbox(res: Response): Promise<Record<string, string>> {
  const text = await res.text();
  try {
    return JSON.parse(text) as Record<string, string>;
  } catch {
    return { program_error: text, program_output: "" };
  }
}

type FirestoreProblem = {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  timeLimit: string;
  memoryLimit: string;
  statement: string;
  constraints: string;
  boilerplates: Record<string, string>;
  sampleInput?: string;
  sampleOutput?: string;
  explanation?: string;
  points?: number;
};

type Verdict = "Accepted" | "Wrong Answer" | "TLE" | "MLE" | "CE" | null;

const verdictConfig: Record<
  NonNullable<Verdict>,
  { bg: string; text: string; border: string; icon: React.ElementType; label: string }
> = {
  Accepted: {
    bg: "bg-green-50", text: "text-green-700", border: "border-green-300",
    icon: CheckCircle2, label: "Accepted",
  },
  "Wrong Answer": {
    bg: "bg-red-50", text: "text-red-700", border: "border-red-300",
    icon: XCircle, label: "Wrong Answer",
  },
  TLE: {
    bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300",
    icon: Clock, label: "Time Limit Exceeded",
  },
  MLE: {
    bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-300",
    icon: Zap, label: "Memory Limit Exceeded",
  },
  CE: {
    bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300",
    icon: XCircle, label: "Compilation Error",
  },
};

const difficultyConfig = {
  Easy: "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard: "bg-red-50 text-red-700 border-red-200",
};

export default function CodingWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addWarning, currentUser, antiCheat } = useStudentContext();

  const [problem, setProblem] = useState<FirestoreProblem | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);

  const [language, setLanguage] = useState("C++");
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [activeTab, setActiveTab] = useState<"statement" | "input" | "output">("statement");
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);


  // ── Fetch problem from Firestore ──────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoadingProblem(true);
    getDoc(doc(db, "questions", id))
      .then((snap) => {
        if (!snap.exists()) {
          navigate("/student/problems");
          return;
        }
        const rawData = snap.data();
        const data = {
          ...rawData,
          id: snap.id,
          timeLimit: rawData?.timeLimit || rawData?.time_limit || "1s",
          memoryLimit: rawData?.memoryLimit || rawData?.memory_limit || "256MB",
          sampleInput: rawData?.sampleInput || rawData?.sample_input || "",
          sampleOutput: rawData?.sampleOutput || rawData?.sample_output || "",
          statement: rawData?.statement || rawData?.description || "",
        } as unknown as FirestoreProblem;

        setProblem(data);
        setCode(data.boilerplates?.[language] || "");
        setCustomInput(data.sampleInput || "");
      })
      .catch(console.error)
      .finally(() => setLoadingProblem(false));
  }, [id]);

  // ── Fullscreen enforcement ────────────────────────────────────────────────
  useEffect(() => {
    if (!antiCheat?.enabled || !antiCheat.fullscreen) return;

    // Initial check
    if (!document.fullscreenElement) {
      setShowFullscreenPrompt(true);
      document.documentElement.requestFullscreen().catch(() => {
        console.log("Fullscreen request blocked - waiting for user click");
      });
    }

    const onFsChange = () => {
      const inFs = !!document.fullscreenElement;
      setIsFullscreen(inFs);
      if (!inFs) {
        setShowFullscreenPrompt(true);
        addWarning();
      } else {
        setShowFullscreenPrompt(false);
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [antiCheat, addWarning]);

  // ── Tab-switch detection ──────────────────────────────────────────────────
  useEffect(() => {
    if (!antiCheat?.enabled || !antiCheat.tabSwitch) return;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") addWarning();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [antiCheat, addWarning]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(problem?.boilerplates?.[lang] ?? "");
  };

  const handleRun = async () => {
    setIsRunning(true);
    setActiveTab("output");
    setOutputText("⏳ Running your code...");
    try {
      const res = await fetch(WANDBOX_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compiler: WANDBOX_COMPILERS[language],
          code,
          stdin: customInput,
        }),
      });
      const data = await parseWandbox(res);
      if (data.compiler_error) {
        setOutputText(`❌ Compilation Error:\n${data.compiler_error}`);
      } else if (data.program_error) {
        setOutputText(`⚠️ Runtime Error:\n${data.program_error}`);
      } else {
        setOutputText(`✅ Output:\n${data.program_output || "(no output)"}`);
      }
    } catch (err: unknown) {
      setOutputText(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem || !auth.currentUser) return;
    setIsSubmitting(true);
    setActiveTab("output");
    setOutputText("⏳ Judging your code...");
    setVerdict(null);

    const queryParams = new URLSearchParams(window.location.search);
    const contestId = queryParams.get("contestId");

    try {
      const res = await fetch(`${API_BASE}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: id,
          source_code: code,
          language_id: language === "C++" ? 54 : language === "Java" ? 62 : 71, // Judge0 IDs
          user_email: auth.currentUser.email,
          user_name: currentUser.username,
          contest_id: contestId
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setVerdict(data.passed_all ? "Accepted" : "Wrong Answer");
        setOutputText(data.passed_all
          ? `✅ All ${data.total} test cases passed!`
          : `❌ ${data.passed}/${data.total} test cases passed.`
        );
        // Show detailed results in modal
        setVerdictDetails(data);
        setShowModal(true);
      } else {
        setOutputText(`❌ Error: ${data.error || "Submission failed"}`);
      }
    } catch (err: unknown) {
      setOutputText(`❌ Failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [verdictDetails, setVerdictDetails] = useState<any>(null);

  // ── Loading / error states ────────────────────────────────────────────────
  if (loadingProblem) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading problem...</span>
        </div>
      </div>
    );
  }

  if (!problem) return null;

  if (showFullscreenPrompt && antiCheat?.fullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center animate-pulse">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-white text-2xl font-bold tracking-tight">Security Protocol Violation</h2>
          <p className="text-slate-400 text-base max-w-sm mx-auto leading-relaxed">
            Fullscreen mode is mandatory for this contest. Your interaction has been blocked, and this event has been logged to the examiner.
          </p>
        </div>

        <button
          onClick={() => {
            document.documentElement.requestFullscreen()
              .then(() => setShowFullscreenPrompt(false))
              .catch((err) => {
                console.error("Fullscreen failed:", err);
                alert("Please click anywhere on the page and then try the button again to allow fullscreen.");
              });
          }}
          className="group relative flex items-center gap-3 px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/25"
        >
          <Zap className="w-5 h-5 text-blue-200" />
          Re-enable Fullscreen
          <div className="absolute inset-0 rounded-xl group-hover:bg-white/10 transition-colors" />
        </button>

        <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mt-4">
          Attempted Bypass ID: {auth.currentUser?.uid?.slice(0, 8) || "ANON"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">

      <div className="flex flex-1 overflow-hidden">
        {/* ===== LEFT PANEL ===== */}
        <div className="w-[420px] min-w-[320px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          {/* Problem header */}
          <div className="px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => {
                  const queryParams = new URLSearchParams(window.location.search);
                  const contestId = queryParams.get("contestId");
                  navigate(`/student/problems${contestId ? `?contestId=${contestId}` : ""}`);
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                {new URLSearchParams(window.location.search).get("contestId") ? "Contest Problems" : "Problems"}
              </button>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-slate-900 text-base mb-1.5" style={{ fontWeight: 600 }}>
                  {problem.title}
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyConfig[problem.difficulty]}`}>
                    {problem.difficulty}
                  </span>
                  {problem.points && (
                    <span className="text-xs text-slate-400">{problem.points} pts</span>
                  )}
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400">{problem.timeLimit}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400">{problem.memoryLimit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 px-5">
            {(["statement", "input", "output"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2.5 text-xs capitalize border-b-2 transition-colors -mb-px ${activeTab === tab
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                style={{ fontWeight: 500 }}
              >
                {tab === "input" ? "Custom Input" : tab === "output" ? "Output" : "Statement"}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-5 text-sm text-slate-600 leading-relaxed space-y-5 relative">
            <Watermark />
            {activeTab === "statement" && (
              <>
                <div>
                  <p className="whitespace-pre-line">{problem.statement}</p>
                </div>

                {problem.constraints && (
                  <div>
                    <h4 className="text-slate-800 text-xs mb-2" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Constraints
                    </h4>
                    <ul className="space-y-1">
                      {(typeof problem.constraints === "string"
                        ? problem.constraints.split("\n")
                        : Array.isArray(problem.constraints)
                          ? problem.constraints
                          : []
                      ).filter(Boolean).map((c, i) => (
                        <li key={i} className="text-slate-500 flex items-start gap-2">
                          <span className="mt-1.5 w-1 h-1 bg-slate-400 rounded-full flex-shrink-0" />
                          <code className="text-xs bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">
                            {c}
                          </code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(problem.sampleInput || problem.sampleOutput) && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h4 className="text-slate-800 text-xs mb-3" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Sample
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-slate-400 text-xs mb-1.5">Input</div>
                        <pre className="text-xs bg-white border border-slate-200 rounded-lg p-2.5 text-slate-700 overflow-x-auto">
                          {problem.sampleInput}
                        </pre>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs mb-1.5">Output</div>
                        <pre className="text-xs bg-white border border-slate-200 rounded-lg p-2.5 text-slate-700 overflow-x-auto">
                          {problem.sampleOutput}
                        </pre>
                      </div>
                    </div>
                    {problem.explanation && (
                      <div className="mt-3 text-xs text-slate-500 border-t border-slate-200 pt-3">
                        <strong className="text-slate-600">Explanation: </strong>
                        {problem.explanation}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "input" && (
              <div className="space-y-3">
                <label className="text-xs text-slate-500">Custom Input</label>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full h-48 bg-slate-900 text-green-400 text-xs p-3 rounded-lg resize-none outline-none border border-slate-700"
                  style={{ fontFamily: "monospace" }}
                  placeholder="Enter custom input..."
                />
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-xs rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  {isRunning ? "Running..." : "Run on this Input"}
                </button>
              </div>
            )}

            {activeTab === "output" && (
              <pre className="text-xs font-mono bg-slate-900 text-green-400 p-3 rounded-lg min-h-32 whitespace-pre-wrap">
                {outputText || "Output will appear here after running..."}
              </pre>
            )}
          </div>
        </div>

        {/* ===== RIGHT PANEL: Editor ===== */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex-shrink-0">
            <div className="relative">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="appearance-none bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 pr-7 cursor-pointer outline-none hover:bg-slate-600 transition-colors"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 text-red-400 text-xs mr-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                0
              </div>
              <button
                onClick={() => setCode(problem?.boilerplates?.[language] ?? "")}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
                title="Reset to boilerplate"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigator.clipboard?.writeText(code)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
                title="Copy code"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Code editor */}
          <div className="flex-1 overflow-hidden flex relative group">
            <Watermark />
            <Editor
              height="100%"
              language={LANGUAGE_MAP[language]}
              value={code}
              theme="vs-dark"
              onChange={(value) => setCode(value || "")}
              options={{
                fontSize: 13,
                fontFamily: "monospace",
                lineHeight: 1.6,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                readOnly: isSubmitting || isRunning,
                wordWrap: "on",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                contextmenu: true,
              }}
            />

          </div>

          {/* Console */}
          <div className="border-t border-slate-700 flex-shrink-0" style={{ maxHeight: "160px" }}>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 text-xs">Console Output</span>
            </div>
            <div className="px-4 py-3 bg-slate-950 overflow-auto" style={{ height: "96px" }}>
              <pre className="text-xs text-green-400" style={{ fontFamily: "monospace" }}>
                {outputText || "// Press 'Run' to execute with custom input\n// Press 'Submit' to judge against all test cases"}
              </pre>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-t border-slate-700 flex-shrink-0">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-200 text-sm rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {isRunning ? "Running..." : "Run"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-60"
              style={{ fontWeight: 500 }}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Judging..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      <WebcamPreview username={currentUser?.username} />

      {/* Verdict Modal */}
      {showModal && verdict && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className={`px-6 py-5 ${verdictConfig[verdict].bg} border-b ${verdictConfig[verdict].border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => { const Icon = verdictConfig[verdict].icon; return <Icon className={`w-6 h-6 ${verdictConfig[verdict].text}`} />; })()}
                  <div>
                    <div className={`text-lg ${verdictConfig[verdict].text}`} style={{ fontWeight: 700 }}>
                      {verdictConfig[verdict].label}
                    </div>
                    <div className="text-slate-500 text-sm">{problem.title}</div>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <div className="text-slate-500 text-xs mb-2" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Test Cases
                </div>
                <div className="flex gap-2 flex-wrap">
                  {verdictDetails?.results?.map((res: any, i: number) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center ${res.passed ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}
                      style={{ fontWeight: 600 }}
                      title={res.status}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <p className={`text-xs mt-2 ${verdict === "Accepted" ? "text-green-600" : "text-slate-400"}`}>
                  {verdictDetails ? `${verdictDetails.passed}/${verdictDetails.total} test cases passed` : ""}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Execution Time", value: verdict === "TLE" ? "2.01s" : "0.08s", sub: `limit: ${problem.timeLimit}` },
                  { label: "Memory Used", value: verdict === "MLE" ? "512 MB" : "14 MB", sub: `limit: ${problem.memoryLimit}` },
                  { label: "Score", value: verdict === "Accepted" ? `+${problem.points ?? 0}` : "+0", sub: "pts earned", accent: verdict === "Accepted" },
                ].map(({ label, value, sub, accent }) => (
                  <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-slate-400 text-xs mb-1">{label}</div>
                    <div className={`text-sm ${accent ? "text-green-700" : "text-slate-800"}`} style={{ fontWeight: 700 }}>{value}</div>
                    <div className="text-slate-400 text-xs">{sub}</div>
                  </div>
                ))}
              </div>

              {verdict === "Accepted" && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-green-700 text-sm" style={{ fontWeight: 500 }}>🎉 Great job! Problem solved successfully.</p>
                </div>
              )}
            </div>

            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                Keep Editing
              </button>
              <button onClick={() => {
                setShowModal(false);
                const queryParams = new URLSearchParams(window.location.search);
                const contestId = queryParams.get("contestId");
                navigate(`/student/problems${contestId ? `?contestId=${contestId}` : ""}`);
              }} className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors" style={{ fontWeight: 500 }}>
                Back to {new URLSearchParams(window.location.search).get("contestId") ? "Contest" : "Problems"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}