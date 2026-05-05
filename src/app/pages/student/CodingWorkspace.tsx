import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  TerminalSquare, 
  Binary, 
  Clock, 
  Zap, 
  Layout, 
  History, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  Play, 
  Send, 
  AlertTriangle, 
  Trophy, 
  Target,
  ChevronDown,
  Sparkles,
  Loader2,
  RotateCcw
} from "lucide-react";
import { fetchContests, registerParticipant, finishParticipant } from "../../services/contest";
import WebcamPreview from "../../components/WebcamPreview";
import { useStudentContext } from "../../components/StudentLayout";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { databases, APPWRITE_DB_ID } from "../../services/appwrite";
import Watermark from "../../components/Watermark";
import { API_BASE } from "../../config";

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
  const [expectedOutput, setExpectedOutput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"statement" | "input" | "output">("statement");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [allQuestionIds, setAllQuestionIds] = useState<string[]>([]);
  const [nextQuestionId, setNextQuestionId] = useState<string | null>(null);

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
        // Handle Timer
        const contestEnd = new Date(data.end_time).getTime();
        const duration = Number(data.duration) || 0;
        
        let finalEnd = contestEnd;
        
        if (duration > 0) {
          const startTimeKey = `contest_start_${contestId}_${currentUser?.id || 'anon'}`;
          let studentStartTime = localStorage.getItem(startTimeKey);
          if (!studentStartTime) {
            studentStartTime = Date.now().toString();
            localStorage.setItem(startTimeKey, studentStartTime);
          }
          const studentEnd = Number(studentStartTime) + (duration * 60 * 1000);
          finalEnd = Math.min(studentEnd, contestEnd);
        }

        const now = Date.now();
        const diff = finalEnd - now;
        
        if (diff <= 0) {
          alert("Time is up or contest has ended!");
          navigate("/student/lobby");
        } else {
          setTimeLeft(diff);
        }

        // Handle Navigation
        let qIds = data.question_ids;
        if (typeof qIds === 'string') {
          try { qIds = JSON.parse(qIds); } catch(e) { qIds = []; }
        }
        if (Array.isArray(qIds)) {
          setAllQuestionIds(qIds);
          const currentIndex = qIds.indexOf(id || "");
          if (currentIndex !== -1 && currentIndex < qIds.length - 1) {
            setNextQuestionId(qIds[currentIndex + 1]);
          } else {
            setNextQuestionId(null);
          }
        }
      })
      .catch(err => console.error("Appwrite Contest fetch failed:", err));
  }, [id, navigate]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev !== null && prev <= 1000) {
          clearInterval(interval);
          handleSubmit(); 
          
          // Finish the participant session when time is up
          const qp = new URLSearchParams(window.location.search);
          const cId = qp.get("contestId");
          const pId = sessionStorage.getItem(`active_session_${cId}`);
          if (pId) finishParticipant(pId);
          
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

  const [startTime] = useState(Date.now());
  const [isPredicting, setIsPredicting] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (problem?.boilerplates?.[lang]) {
      setCode(problem.boilerplates[lang]);
    } else {
      // Generate default signature
      const signature = generateSignature(problem?.title || "Solution", lang);
      setCode(signature);
    }
  };

  const generateSignature = (title: string, lang: string) => {
    // Convert "Two Sum" to "twoSum" for methods and "TwoSum" for classes
    const sanitized = title.replace(/[^a-zA-Z0-9 ]/g, "");
    const words = sanitized.split(" ");
    const className = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    const methodName = words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    
    if (lang === "C++") return `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <map>\n#include <set>\n#include <queue>\n#include <stack>\n\nusing namespace std;\n\n/*\n * Problem: ${title}\n * Implement the solution within the Solution class.\n */\nclass Solution {\npublic:\n    void ${methodName}() {\n        // Enter your code here\n        \n    }\n};\n\nint main() {\n    // Standard I/O Optimization\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    Solution sol;\n    sol.${methodName}();\n    \n    return 0;\n}`;
    
    if (lang === "Java") return `import java.util.*;\nimport java.io.*;\n\n/**\n * Problem: ${title}\n * Implement your logic in the ${methodName} method.\n */\npublic class Solution {\n    public void ${methodName}() {\n        // Enter your code here\n        \n    }\n\n    public static void main(String[] args) throws IOException {\n        // Faster I/O\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        Solution sol = new Solution();\n        sol.${methodName}();\n    }\n}`;
    
    if (lang === "Python") return `import sys\nimport math\nfrom collections import Counter, deque\nimport heapq\n\n# Problem: ${title}\n# Implement your solution in the ${methodName} function.\n\ndef ${methodName}():\n    \"\"\"\n    Write your solution logic here.\n    To read input optimally: input = sys.stdin.read().split()\n    \"\"\"\n    # Example: line = sys.stdin.readline()\n    pass\n\nif __name__ == "__main__":\n    ${methodName}()`;
    
    return "";
  };

  const handlePredictExpectedOutput = async () => {
    if (!customInput) return;
    setIsPredicting(true);
    try {
      const res = await fetch(`${API_BASE}/ai/predict-output`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          problem_statement: problem?.statement,
          input_format: problem?.inputFormat,
          output_format: problem?.outputFormat,
          sample_input: problem?.sampleInput,
          sample_output: problem?.sampleOutput,
          custom_input: customInput 
        })
      });
      const data = await res.json();
      if (res.ok && data.expected_output) {
         setExpectedOutput(data.expected_output);
      } else {
         console.error("AI Prediction failed:", data.error || "Unknown error");
         setExpectedOutput("⚠️ Prediction failed: " + (data.error || "Server returned non-JSON response"));
      }
    } catch (err: any) {
      console.error("AI Prediction failed", err);
      setExpectedOutput("⚠️ Prediction failed: " + err.message);
    } finally {
      setIsPredicting(false);
    }
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
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

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
          contest_id: contestId,
          time_taken: timeSpent
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOutputText(data.passed_all
          ? `✅ SUCCESS: ALL TESTCASES PASSED (${data.total}/${data.total})`
          : `❌ FAILED: ${data.passed}/${data.total} TESTCASES PASSED.`
        );
        
        
        // If they passed all testcases and it was the last problem, finish their session
        if (data.passed_all && !nextQuestionId && contestId) {
          const pId = sessionStorage.getItem(`active_session_${contestId}`);
          if (pId) finishParticipant(pId);
        }

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-transparent">
        <div className="w-10 h-10 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Loading Workspace...</span>
      </div>
    );
  }

  if (!problem) return null;

  return (
    <div className="flex h-screen bg-transparent text-white selection:bg-[#0099ff]/30 overflow-hidden font-sans relative">
      
      {/* ── LEFT PANEL: PROBLEM SPEC ───────────────────────────────────── */}
      <div className="w-[600px] flex flex-col border-r border-white/5 bg-transparent relative">
        
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

            {warningCount > 0 && (
              <div className="flex items-center gap-3 px-4 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">{warningCount}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={async () => {
              const queryParams = new URLSearchParams(window.location.search);
              const cId = queryParams.get("contestId");
              
              if (cId) {
                const pId = sessionStorage.getItem(`active_session_${cId}`);
                if (pId) {
                  try {
                    await finishParticipant(pId);
                    sessionStorage.removeItem(`active_session_${cId}`);
                  } catch (err) {
                    console.error("Error ending session:", err);
                  }
                }
              }
              
              navigate(cId ? `/student/problems?contestId=${cId}` : "/student/problems");
            }}
            className="flex items-center gap-2 h-9 px-4 rounded-lg text-[#525252] hover:text-white bg-white/5 border border-white/5 transition-all group active:scale-95 hover:bg-white/[0.08]"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Exit</span>
          </button>
        </div>

        {/* Intelligence Tabs */}
        <div className="flex px-6 pt-2 gap-2 bg-black/20 backdrop-blur-xl border-b border-white/5">
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
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-black/10 backdrop-blur-lg relative">
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

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider ml-2">Expected Output (Predicted)</h3>
                    <button
                      onClick={handlePredictExpectedOutput}
                      disabled={isPredicting || !customInput}
                      className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#0099ff]/10 text-[#0099ff] text-[9px] font-bold uppercase tracking-wider hover:bg-[#0099ff] hover:text-white transition-all disabled:opacity-30"
                    >
                      {isPredicting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Predict
                    </button>
                  </div>
                  <div className="w-full min-h-[100px] bg-[#050505] border border-white/5 rounded-[2rem] p-8 text-xs font-mono text-emerald-500/80 whitespace-pre-wrap shadow-2xl">
                    {expectedOutput || "Click predict to generate expected output"}
                  </div>
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
                className="space-y-8 pb-20"
              >
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Execution Output</h3>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                         <span className="text-[9px] font-bold text-[#525252] uppercase tracking-wider">{isRunning ? "Running" : "Idle"}</span>
                      </div>
                      <button onClick={() => setOutputText("")} className="text-[#525252] hover:text-white transition-colors">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                   </div>
                </div>
                
                <div className="w-full min-h-[300px] bg-[#000000] border border-white/5 rounded-[2.5rem] p-10 font-mono text-[13px] leading-relaxed relative overflow-hidden shadow-2xl group border-t-white/10">
                   <div className="absolute inset-0 bg-gradient-to-br from-[#0099ff]/[0.02] to-transparent pointer-events-none" />
                   <div className={`whitespace-pre-wrap relative z-10 ${outputText.includes("❌") ? "text-rose-400" : outputText.includes("✅") ? "text-emerald-400" : "text-[#d1d1d1]"}`}>
                      {outputText || "Your program output will appear here after clicking 'Run Sample'..."}
                   </div>
                   
                   {/* Compare with Expected */}
                   {expectedOutput && outputText && !isRunning && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="mt-12 pt-8 border-t border-white/5 space-y-6 relative z-10"
                     >
                        <div className="flex items-center gap-3 text-[10px] font-bold text-[#0099ff] uppercase tracking-wider">
                           <Target className="w-4 h-4" />
                           Expected vs Actual
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <span className="text-[9px] font-bold text-[#2a2a2a] uppercase tracking-wider">Expected</span>
                              <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-[12px] text-emerald-500/80 font-mono">
                                 {expectedOutput}
                              </div>
                           </div>
                           <div className="space-y-3">
                              <span className="text-[9px] font-bold text-[#2a2a2a] uppercase tracking-wider">Actual (First line)</span>
                              <div className={`p-6 border rounded-2xl text-[12px] font-mono ${outputText.toLowerCase().includes(expectedOutput.trim().toLowerCase()) ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" : "bg-rose-500/5 border-rose-500/10 text-rose-400"}`}>
                                 {outputText.replace("✅ RESULTS:\n\n", "").split('\n')[0].trim() || "(empty)"}
                              </div>
                           </div>
                        </div>
                        
                        {outputText.toLowerCase().includes(expectedOutput.trim().toLowerCase()) ? (
                          <div className="flex items-center gap-3 text-emerald-400 text-[10px] font-bold uppercase tracking-widest pt-4">
                             <CheckCircle2 className="w-4 h-4" />
                             Outputs Match! You are ready to submit.
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-rose-400 text-[10px] font-bold uppercase tracking-widest pt-4">
                             <XCircle className="w-4 h-4" />
                             Mismatch detected. Please check your logic.
                          </div>
                        )}
                     </motion.div>
                   )}
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

            {nextQuestionId && (
              <button
                onClick={() => {
                  const qp = new URLSearchParams(window.location.search);
                  const cId = qp.get("contestId");
                  navigate(`/student/workspace/${nextQuestionId}${cId ? `?contestId=${cId}` : ""}`);
                }}
                className="group flex items-center gap-3 h-10 px-6 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] text-[#0099ff] hover:text-white bg-[#0099ff]/10 border border-[#0099ff]/20 hover:bg-[#0099ff] transition-all shadow-2xl active:scale-95"
              >
                Next
                <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
              </button>
            )}

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
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").includes(currentUser?.email || "") 
                  ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" 
                  : "bg-[#0099ff] shadow-[0_0_10px_#0099ff]"
                }`} />
                <span className="text-[8px] font-bold text-white uppercase tracking-[0.2em]">
                  {(import.meta.env.VITE_ADMIN_EMAILS || "").split(",").includes(currentUser?.email || "") 
                  ? "Admin Mode" 
                  : "Anti-Cheat Active"}
                </span>
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
                className="bg-[#090909] border border-white/10 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] relative"
              >
                 <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#0099ff] to-transparent" />
                 
                 <div className="p-12 text-center space-y-8">
                   <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center border shadow-2xl ${verdictDetails.passed_all ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
                      {verdictDetails.passed_all ? <CheckCircle2 className="w-10 h-10 text-emerald-500" /> : <XCircle className="w-10 h-10 text-rose-500" />}
                   </div>
                   
                   <div className="space-y-3">
                     <h2 className={`text-3xl font-semibold tracking-tight uppercase ${verdictDetails.passed_all ? 'text-white' : 'text-rose-500'}`}>
                       {verdictDetails.passed_all ? "Correct" : "Wrong Answer"}
                     </h2>
                     <p className="text-[#525252] font-semibold uppercase tracking-wider text-[9px]">
                       {verdictDetails.passed} / {verdictDetails.total} Testcases Passed
                     </p>
                   </div>

                   <div className="bg-black border border-white/5 rounded-[2rem] p-8 grid grid-cols-2 gap-8 shadow-2xl">
                     <div className="space-y-2">
                       <span className="text-[9px] text-[#2a2a2a] font-semibold uppercase tracking-wider">Score</span>
                       <div className="text-3xl font-semibold text-white tracking-tighter italic">{verdictDetails.score}</div>
                     </div>
                     <div className="space-y-2">
                       <span className="text-[9px] text-[#2a2a2a] font-semibold uppercase tracking-wider">Points</span>
                       <div className="text-3xl font-semibold text-[#0099ff] tracking-tighter italic">+{verdictDetails.points}</div>
                     </div>
                   </div>

                   {verdictDetails.aiAnalysis && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="p-6 bg-[#0099ff]/5 border border-[#0099ff]/10 rounded-[1.5rem] space-y-3 text-left"
                     >
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-[#0099ff]" />
                              <h4 className="text-[9px] font-bold text-white uppercase tracking-widest">AI Intelligence Report</h4>
                           </div>
                           <div className="flex gap-3">
                              <div className="text-[8px] font-bold text-[#0099ff] uppercase">{verdictDetails.aiAnalysis.timeComplexity}</div>
                              <div className="text-[8px] font-bold text-emerald-500 uppercase">{verdictDetails.aiAnalysis.spaceComplexity}</div>
                           </div>
                        </div>
                        <p className="text-[10px] text-[#525252] font-medium leading-relaxed italic">
                          "{verdictDetails.aiAnalysis.explanation}"
                        </p>
                     </motion.div>
                   )}

                   <div className="flex gap-4">
                     <button 
                       onClick={async () => {
                         const qp = new URLSearchParams(window.location.search);
                         const cId = qp.get("contestId");
                         
                         if (cId) {
                           const pId = sessionStorage.getItem(`active_session_${cId}`);
                           if (pId) {
                             try {
                               await finishParticipant(pId);
                               sessionStorage.removeItem(`active_session_${cId}`);
                             } catch (err) {
                               console.error("Error ending session:", err);
                             }
                           }
                         }
                         
                         navigate(cId ? `/student/problems?contestId=${cId}` : "/student/problems");
                       }}
                       className="flex-1 py-4 bg-black border border-white/10 text-[#525252] font-semibold uppercase tracking-wider text-[10px] rounded-2xl hover:text-white transition-all shadow-2xl"
                     >
                       Exit
                     </button>
                     <button 
                       onClick={() => setShowModal(false)}
                       className="flex-[1.5] py-4 bg-[#0099ff] text-white font-semibold uppercase tracking-wider text-[10px] rounded-2xl hover:bg-white hover:text-black transition-all shadow-[0_20px_50px_-10px_rgba(0,153,255,0.4)]"
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
