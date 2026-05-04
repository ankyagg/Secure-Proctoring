import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronLeft,
  Play,
  Send,
  ChevronDown,
  RotateCcw,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Trophy,
  History,
  Code2,
  Binary,
  Target,
  Maximize2,
  Layout,
  TerminalSquare,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import WebcamPreview from "../../components/WebcamPreview";
import { useStudentContext } from "../../components/StudentLayout";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { databases, APPWRITE_DB_ID } from "../../services/appwrite";
import Watermark from "../../components/Watermark";

const API_BASE = "http://localhost:3000/api";

const LANGUAGES = ["C++", "Java", "Python"];
const MONACO_LANGS: Record<string, string> = {
  "C++": "cpp",
  "Java": "java",
  "Python": "python"
};

const WANDBOX_URL = "https://wandbox.org/api/compile.json";
const WANDBOX_COMPILERS: Record<string, string> = {
  "C++": "gcc-head",
  Java: "openjdk-jdk-22+36",
  Python: "cpython-3.14.0",
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
  timeComplexity?: string;
  spaceComplexity?: string;
};

type Verdict = "Accepted" | "Wrong Answer" | "TLE" | "MLE" | "CE" | null;

const difficultyConfig = {
  Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Hard: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function CodingWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, setCurrentCode, timeRemaining, warningCount } = useStudentContext();

  const [problem, setProblem] = useState<FirestoreProblem | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);

  const [language, setLanguage] = useState("C++");
  const [langOpen, setLangOpen] = useState(false);
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"statement" | "input" | "output">("statement");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);
    setCurrentCode(newCode);
  };

  useEffect(() => {
    if (!id) return;
    setLoadingProblem(true);
    
    databases.getDocument(APPWRITE_DB_ID, "questions", id)
      .then((doc) => {
        const data = {
          ...doc,
          id: doc.$id,
          title: doc.title || "",
          difficulty: doc.difficulty || "Medium",
          points: doc.points || 100,
          statement: doc.statement || "",
          constraints: doc.constraints || "",
          inputFormat: doc.inputFormat || doc.input_format || "",
          outputFormat: doc.outputFormat || doc.output_format || "",
          timeLimit: doc.timeLimit || doc.time_limit || "2.0s",
          memoryLimit: doc.memoryLimit || doc.memory_limit || "256MB",
          sampleInput: doc.sampleInput || doc.sample_input || "",
          sampleOutput: doc.sampleOutput || doc.sample_output || "",
          explanation: (doc.explanation || "").split("\n\n[TC]")[0],
        } as unknown as FirestoreProblem;

        let parsedBoilerplates: Record<string, string> = {
          "C++": "",
          "Java": "",
          "Python": ""
        };

        if (doc.boilerplates) {
          try {
            const bp = typeof doc.boilerplates === 'string' ? JSON.parse(doc.boilerplates) : doc.boilerplates;
            parsedBoilerplates = { ...parsedBoilerplates, ...bp };
          } catch(e){
            console.error("Boilerplate parse failed", e);
          }
        }

        setProblem({ ...data, boilerplates: parsedBoilerplates });
        
        // Initialize source code from boilerplates
        const initialCode = parsedBoilerplates[language] || "";
        setCode(initialCode);
        setCurrentCode(initialCode);
        setCustomInput(data.sampleInput || "");
      })
      .catch((err) => {
        console.error("Appwrite fetch failed", err);
        navigate("/student/lobby");
      })
      .finally(() => setLoadingProblem(false));
  }, [id, navigate]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const contestId = queryParams.get("contestId");
    if (!contestId) return;

    databases.getDocument(APPWRITE_DB_ID, "contests", contestId)
      .then((data: any) => {
        const end = new Date(data.end_time).getTime();
        const now = Date.now();
        const diff = end - now;
        if (diff <= 0) {
          alert("Contest has ended!");
          navigate("/student/lobby");
        } else {
          setTimeLeft(diff);
        }
      })
      .catch(err => console.error("Appwrite Contest fetch failed:", err));
  }, [navigate]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev !== null && prev <= 1000) {
          clearInterval(interval);
          handleSubmit(); 
          return 0;
        }
        return prev !== null ? prev - 1000 : null;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimeSeconds = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(problem?.boilerplates?.[lang] ?? "");
  };

  const handleRun = async () => {
    setIsRunning(true);
    setActiveTab("output");
    setOutputText("⏳ Running code...");
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
        setOutputText(`✅ RESULTS:\n\n${data.program_output || "(no output returned)"}`);
    } catch (err: any) {
      setOutputText(`❌ NODE_FAILURE: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setActiveTab("output");
    setOutputText("⏳ Submitting your code...");
    
    const queryParams = new URLSearchParams(window.location.search);
    const contestId = queryParams.get("contestId");

    try {
      const res = await fetch(`${API_BASE}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: id,
          source_code: code,
          language_id: language === "C++" ? 54 : language === "Java" ? 62 : 71, 
          user_email: currentUser?.email || "anonymous@node",
          user_name: currentUser?.username || "ANON",
          user_id: currentUser?.id || "ANON",
          contest_id: contestId
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOutputText(data.passed_all
          ? `✅ SUCCESS: ALL TESTCASES PASSED (${data.total}/${data.total})`
          : `❌ FAILED: ${data.passed}/${data.total} TESTCASES PASSED.`
        );
        
        // Parallel call to AI Analyzer to save time
        fetch(`${API_BASE}/ai/analyze-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language })
        }).then(res => res.json()).then(aiData => {
           setVerdictDetails(prev => ({ ...prev, ...data, aiAnalysis: aiData }));
        }).catch(e => {
           setVerdictDetails(prev => ({ ...prev, ...data }));
        });

        setShowModal(true);
      } else {
        setOutputText(`❌ ERROR: ${data.error || "Submission failed"}`);
      }
    } catch (err: any) {
      setOutputText(`❌ NODE_FAILURE: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [verdictDetails, setVerdictDetails] = useState<any>(null);

  if (loadingProblem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#000]">
        <div className="w-10 h-10 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Loading Workspace...</span>
      </div>
    );
  }

  if (!problem) return null;

  return (
    <div className="flex h-screen bg-[#000000] text-white selection:bg-[#0099ff]/30 overflow-hidden font-sans relative">
      
      {/* ── LEFT PANEL: PROBLEM SPEC ───────────────────────────────────── */}
      <div className="w-[600px] flex flex-col border-r border-white/5 bg-[#000000] relative">
        
        {/* Workspace Toolbar */}
        <div className="px-8 h-16 border-b border-white/5 flex items-center justify-between bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <TerminalSquare className="w-4 h-4 text-[#0099ff]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[#525252] uppercase tracking-[0.2em] leading-none mb-1">Workspace</span>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">{problem.title}</span>
              </div>
            </div>

            <div className="h-6 w-px bg-white/5" />

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0099ff]/5 border border-[#0099ff]/10 text-[#0099ff]">
                <div className="w-1.5 h-1.5 bg-[#0099ff] rounded-full animate-ping" />
                <span className="text-[8px] font-bold uppercase tracking-wider">Secure</span>
              </div>

              <div className="flex items-center gap-3 px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[#525252]">
                <Clock className="w-3.5 h-3.5 text-[#0099ff]" />
                <span className="text-[10px] font-bold tabular-nums tracking-widest">{formatTimeSeconds(timeRemaining)}</span>
              </div>

              {warningCount > 0 && (
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">{warningCount}</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => {
              const queryParams = new URLSearchParams(window.location.search);
              const cId = queryParams.get("contestId");
              navigate(cId ? `/student/problems?contestId=${cId}` : "/student/problems");
            }}
            className="flex items-center gap-2 h-9 px-4 rounded-lg text-[#525252] hover:text-white bg-white/5 border border-white/5 transition-all group active:scale-95 hover:bg-white/[0.08]"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Exit</span>
          </button>
        </div>

        {/* Intelligence Tabs */}
        <div className="flex px-6 pt-2 gap-2 bg-[#050505] border-b border-white/5">
          {[
            { id: "statement", label: "Problem", icon: TerminalSquare },
            { id: "input",     label: "Custom Input", icon: Layout },
            { id: "output",    label: "Console", icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-4 text-[10px] font-semibold uppercase tracking-wider transition-all relative group ${
                activeTab === tab.id ? "text-[#0099ff]" : "text-[#2a2a2a] hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabGlow"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-[#0099ff] shadow-[0_0_20px_rgba(0,153,255,1)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Spec Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#000000] relative">
          <Watermark />
          <AnimatePresence mode="wait">
            {activeTab === "statement" && (
              <motion.div 
                key="statement"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`px-5 py-2 rounded-xl text-[9px] font-semibold uppercase tracking-wider border shadow-2xl ${difficultyConfig[problem.difficulty]}`}>
                      {problem.difficulty}
                    </div>
                    <div className="px-5 py-2 rounded-xl text-[9px] text-[#525252] font-semibold uppercase tracking-wider bg-white/5 border border-white/5 shadow-2xl">
                      Problem ID: {id?.slice(-6).toUpperCase()}
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-normal leading-[1.2] uppercase">
                    {problem.title}
                  </h1>
                  <div className="flex gap-10 items-center pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-[10px] text-[#525252] font-semibold uppercase tracking-wider">
                       <Clock className="w-4 h-4 text-[#0099ff]" /> 
                       {problem.timeLimit} Limit
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[#525252] font-semibold uppercase tracking-wider">
                       <Zap className="w-4 h-4 text-[#0099ff]" /> 
                       {problem.memoryLimit} Limit
                    </div>
                  </div>
                </div>

                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-[#a6a6a6] text-[15px] font-medium leading-[1.6] tracking-tight whitespace-pre-wrap">
                    {problem.statement}
                  </div>
                </div>

                {problem.constraints && (
                  <div className="p-10 bg-[#050505] border border-white/5 rounded-[2.5rem] space-y-6 shadow-2xl">
                    <h3 className="text-[10px] font-semibold text-[#0099ff] uppercase tracking-wider flex items-center gap-3">
                      <Binary className="w-4 h-4" />
                      Constraints
                    </h3>
                    <div className="text-sm text-[#525252] font-semibold uppercase tracking-wider leading-relaxed">
                      {problem.constraints}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "input" && (
              <motion.div 
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="space-y-4">
                  <h3 className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider ml-2">Enter Input</h3>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter stdin here..."
                    className="w-full h-48 bg-[#000000] border border-white/5 rounded-[2rem] p-8 text-xs font-mono text-[#0099ff] outline-none focus:border-[#0099ff]/50 transition-all placeholder:text-[#2a2a2a] shadow-2xl"
                  />
                </div>

                {problem.sampleInput && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                       <h3 className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Examples</h3>
                       <button 
                         onClick={() => setCustomInput(problem.sampleInput || "")}
                         className="text-[10px] font-semibold text-[#0099ff] uppercase tracking-wider hover:text-white transition-all"
                       >
                         Use Sample
                       </button>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-4">
                        <div className="text-[9px] text-[#2a2a2a] font-semibold uppercase tracking-wider ml-2">Input</div>
                        <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] text-xs font-mono text-[#525252] whitespace-pre-wrap shadow-2xl">
                          {problem.sampleInput}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="text-[9px] text-[#2a2a2a] font-semibold uppercase tracking-wider ml-2">Expected Output</div>
                        <div className="p-8 bg-[#0099ff]/5 border border-[#0099ff]/10 rounded-[2rem] text-xs font-mono text-[#0099ff] whitespace-pre-wrap shadow-2xl">
                          {problem.sampleOutput}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "output" && (
              <motion.div 
                key="output"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Output</h3>
                  <button onClick={() => setOutputText("")} className="text-[#525252] hover:text-white transition-colors">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-[#000000] border border-white/5 rounded-[2.5rem] p-10 min-h-[400px] font-mono text-xs text-[#a6a6a6] whitespace-pre-wrap leading-relaxed shadow-2xl border-t-white/10">
                  {outputText || <span className="text-[#2a2a2a] italic uppercase tracking-wider">Run your code to see output.</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Node Status */}
        <div className="p-6 bg-[#050505] border-t border-white/5 flex items-center gap-5 shadow-2xl">
          <div className="w-12 h-12 bg-white border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
            <Target className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1">
             <div className="text-[9px] text-[#525252] font-semibold uppercase tracking-wider mb-1">Signed In</div>
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse" />
                <div className="text-sm text-white font-semibold uppercase tracking-tighter">{currentUser?.username || "GUEST"}</div>
             </div>
          </div>
          <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 shadow-2xl">
             <Trophy className="w-4 h-4 text-[#0099ff]" />
             <span className="text-[10px] font-semibold text-white tracking-wider">{problem.points || 100}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN AREA: CODE MATRIX ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-[#000000] relative">
        
        {/* Editor Toolbar */}
        <div className="h-16 border-b border-white/5 bg-[#050505] flex items-center justify-between px-8 z-40 shadow-2xl">
          <div className="flex items-center gap-8">
            <div className="relative">
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2.5 h-10 px-5 rounded-xl bg-black border border-white/10 text-white text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-all shadow-2xl group"
              >
                <Binary className="w-3.5 h-3.5 text-[#0099ff]" />
                {language}
                <ChevronDown className={`w-3 h-3 transition-transform duration-500 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-4 w-56 bg-[#050505] border border-white/10 rounded-[1.5rem] shadow-[0_40px_80px_rgba(0,0,0,1)] py-4 z-50 overflow-hidden"
                    >
                      <div className="px-6 py-3 text-[8px] font-semibold text-[#525252] uppercase tracking-wider border-b border-white/5 mb-2">
                        Select Language
                      </div>
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleLanguageChange(lang);
                            setLangOpen(false);
                          }}
                          className={`w-full text-left px-6 py-4 text-[13px] font-semibold uppercase tracking-wider transition-all flex items-center justify-between ${
                            language === lang ? 'bg-[#0099ff] text-white' : 'text-[#525252] hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {lang}
                          {language === lang && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-white/5" />
            
            <div className="hidden lg:flex items-center gap-6">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-9 h-9 rounded-lg bg-black border border-white/5 flex items-center justify-center text-[10px] font-bold text-[#2a2a2a] shadow-2xl">
                      {i}
                    </div>
                  ))}
               </div>
               <span className="text-[9px] font-bold text-[#2a2a2a] uppercase tracking-[0.15em]">History</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {timeLeft !== null && (
              <div className={`flex items-center gap-2.5 h-10 px-6 rounded-xl border transition-all duration-700 ${timeLeft < 300000 ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse' : 'bg-[#0099ff]/5 border-[#0099ff]/10 text-[#0099ff]'}`}>
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[12px] font-bold tabular-nums tracking-[0.2em]">{formatTimeSeconds(Math.floor(timeLeft / 1000))}</span>
              </div>
            )}
            
            <div className="h-6 w-px bg-white/5" />

            <button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              className="group flex items-center gap-2.5 h-10 px-6 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] text-[#525252] hover:text-white bg-white/5 border border-white/5 hover:border-[#0099ff]/50 transition-all shadow-2xl active:scale-95 disabled:opacity-20"
            >
              <Play className={`w-3 h-3 ${isRunning ? 'animate-spin' : 'text-[#0099ff]'}`} />
              Run Code
            </button>

            <button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
              className="group flex items-center gap-3 h-10 px-8 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all bg-[#0099ff] hover:bg-white hover:text-black shadow-[0_20px_50px_-10px_rgba(0,153,255,0.4)] disabled:opacity-20 active:scale-95"
            >
              {isSubmitting ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3 h-3" />}
              Submit
            </button>
          </div>
        </div>

        {/* Monaco Matrix */}
        <div className="flex-1 relative bg-[#000000]">
          <Watermark />
          <Editor
            height="100%"
            defaultLanguage="cpp"
            language={MONACO_LANGS[language]}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              fontSize: 16,
              fontFamily: "'JetBrains Mono', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 40, bottom: 40 },
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              lineNumbersMinChars: 4,
              renderLineHighlight: "all",
              fontLigatures: true,
              backgroundColor: "#000000",
            }}
          />
          
          {/* Neural Guard Overlay */}
          <div className="absolute bottom-10 right-10 z-30 pointer-events-none">
             <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-black/80 border border-[#0099ff]/20 backdrop-blur-xl shadow-2xl">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0099ff] animate-pulse" />
                <span className="text-[8px] font-bold text-[#0099ff] uppercase tracking-[0.2em]">Anti-Cheat Active</span>
             </div>
          </div>
        </div>
      </div>

      {/* ── VERDICT MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && verdictDetails && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/95 backdrop-blur-2xl">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 30 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 30 }}
               className="bg-[#090909] border border-white/10 rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] relative"
             >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-[#0099ff] to-transparent" />
                
                <div className="p-20 text-center space-y-12">
                  <div className={`w-32 h-32 mx-auto rounded-[2.5rem] flex items-center justify-center border shadow-2xl ${verdictDetails.passed_all ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
                     {verdictDetails.passed_all ? <CheckCircle2 className="w-16 h-16 text-emerald-500" /> : <XCircle className="w-16 h-16 text-rose-500" />}
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className={`text-4xl font-semibold tracking-tight uppercase ${verdictDetails.passed_all ? 'text-white' : 'text-rose-500'}`}>
                      {verdictDetails.passed_all ? "Correct" : "Wrong Answer"}
                    </h2>
                    <p className="text-[#525252] font-semibold uppercase tracking-wider text-[10px]">
                      {verdictDetails.passed} / {verdictDetails.total} Testcases Passed
                    </p>
                  </div>

                  <div className="bg-black border border-white/5 rounded-[2.5rem] p-10 grid grid-cols-2 gap-10 shadow-2xl">
                    <div className="space-y-3">
                      <span className="text-[10px] text-[#2a2a2a] font-semibold uppercase tracking-wider">Score</span>
                      <div className="text-4xl font-semibold text-white tracking-tighter italic">{verdictDetails.score}</div>
                    </div>
                    <div className="space-y-3">
                      <span className="text-[10px] text-[#2a2a2a] font-semibold uppercase tracking-wider">Points</span>
                      <div className="text-4xl font-semibold text-[#0099ff] tracking-tighter italic">+{verdictDetails.points}</div>
                    </div>
                  </div>

                  {verdictDetails.aiAnalysis && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-8 bg-[#0099ff]/5 border border-[#0099ff]/10 rounded-[2rem] space-y-4 text-left"
                    >
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <Sparkles className="w-4 h-4 text-[#0099ff]" />
                             <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">AI Intelligence Report</h4>
                          </div>
                          <div className="flex gap-4">
                             <div className="text-[9px] font-bold text-[#0099ff] uppercase">{verdictDetails.aiAnalysis.timeComplexity} Time</div>
                             <div className="text-[9px] font-bold text-emerald-500 uppercase">{verdictDetails.aiAnalysis.spaceComplexity} Space</div>
                          </div>
                       </div>
                       <p className="text-[11px] text-[#525252] font-medium leading-relaxed italic">
                         "{verdictDetails.aiAnalysis.explanation}"
                       </p>
                    </motion.div>
                  )}

                  <div className="flex gap-6">
                    <button 
                      onClick={() => {
                        const qp = new URLSearchParams(window.location.search);
                        const cId = qp.get("contestId");
                        navigate(cId ? `/student/problems?contestId=${cId}` : "/student/problems");
                      }}
                      className="flex-1 py-6 bg-black border border-white/10 text-[#525252] font-semibold uppercase tracking-wider text-[11px] rounded-[1.5rem] hover:text-white transition-all shadow-2xl"
                    >
                      Exit
                    </button>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="flex-[1.5] py-6 bg-[#0099ff] text-white font-semibold uppercase tracking-wider text-[11px] rounded-[1.5rem] hover:bg-white hover:text-black transition-all shadow-[0_20px_50px_-10px_rgba(0,153,255,0.4)]"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
