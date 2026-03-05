import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronLeft,
  Play,
  Send,
  ChevronDown,
  Copy,
  RotateCcw,
  Maximize2,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  AlertTriangle,
  X,
  Terminal,
} from "lucide-react";
import WebcamPreview from "../../components/WebcamPreview";
import { problems } from "../../data/mockData";
import { useStudentContext } from "../../components/StudentLayout";

const LANGUAGES = ["C++", "Java", "Python"];

// Wandbox API - Free compiler service, no API key needed
const WANDBOX_URL = "https://wandbox.org/api/compile.json";
const WANDBOX_COMPILERS: Record<string, string> = {
  "C++": "gcc-head",
  "Java": "openjdk-jdk-21+35",
  "Python": "cpython-3.12.0",
};

const BOILERPLATES: Record<string, Record<string, string>> = {
  "C++": {
    A: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.count(complement)) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    return {};
}

int main() {
    int n, target;
    cin >> n >> target;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    vector<int> result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`,
    default: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Your solution here

    return 0;
}`,
  },
  Java: {
    default: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your solution here

    }
}`,
  },
  Python: {
    default: `import sys
input = sys.stdin.readline

def solve():
    # Your solution here
    pass

solve()`,
  },
};

type Verdict = "Accepted" | "Wrong Answer" | "TLE" | "MLE" | "CE" | null;

const verdictConfig: Record<
  NonNullable<Verdict>,
  { bg: string; text: string; border: string; icon: React.ElementType; label: string }
> = {
  Accepted: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-300",
    icon: CheckCircle2,
    label: "Accepted",
  },
  "Wrong Answer": {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
    icon: XCircle,
    label: "Wrong Answer",
  },
  TLE: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-300",
    icon: Clock,
    label: "Time Limit Exceeded",
  },
  MLE: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-300",
    icon: Zap,
    label: "Memory Limit Exceeded",
  },
  CE: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    icon: XCircle,
    label: "Compilation Error",
  },
};

export default function CodingWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addWarning, currentUser } = useStudentContext();

  const problem = problems.find((p) => p.id === id) ?? problems[0];

  const [language, setLanguage] = useState("C++");
  const [code, setCode] = useState(
    BOILERPLATES["C++"][problem.id] ?? BOILERPLATES["C++"]["default"]
  );
  const [customInput, setCustomInput] = useState(problem.sampleInput);
  const [outputText, setOutputText] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [activeTab, setActiveTab] = useState<"statement" | "input" | "output">("statement");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [violations, setViolations] = useState(0);
  const lineCount = code.split("\n").length;
  useEffect(() => {
    // Proctoring restrictions disabled
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const boilerplate =
      BOILERPLATES[lang]?.[problem.id] ?? BOILERPLATES[lang]?.["default"] ?? "";
    setCode(boilerplate);
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
      const data = await res.json();
      if (data.compiler_error) {
        setOutputText(`❌ Compilation Error:\n${data.compiler_error}`);
      } else if (data.program_error) {
        setOutputText(`⚠️ Runtime Error:\n${data.program_error}`);
      } else {
        setOutputText(`✅ Output:\n${data.program_output || "(no output)"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOutputText(`❌ Error: ${msg}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setActiveTab("output");
    setOutputText("⏳ Judging your code...");
    try {
      const res = await fetch(WANDBOX_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compiler: WANDBOX_COMPILERS[language],
          code,
          stdin: problem.sampleInput,
        }),
      });
      const data = await res.json();
      if (data.compiler_error) {
        setVerdict("CE");
        setOutputText(`❌ Compilation Error:\n${data.compiler_error}`);
      } else if (data.program_output?.trim() === problem.sampleOutput.trim()) {
        setVerdict("Accepted");
        setOutputText(`✅ Sample test passed!\n\nOutput: ${data.program_output}`);
      } else {
        setVerdict("Wrong Answer");
        setOutputText(`❌ Wrong Answer\n\nExpected:\n${problem.sampleOutput}\n\nGot:\n${data.program_output || "(no output)"}${data.program_error ? `\n\nError:\n${data.program_error}` : ""}`);
      }
      setIsSubmitting(false);
      setShowModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`❌ Failed: ${msg}`);
      setIsSubmitting(false);
    }
  };

  const difficultyConfig = {
    Easy: "bg-green-50 text-green-700 border-green-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Hard: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Main layout: left panel + right panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* ===== LEFT PANEL: Problem ===== */}
        <div className="w-[420px] min-w-[320px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          {/* Problem header */}
          <div className="px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => navigate("/student/problems")}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Problems
              </button>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-600" style={{ fontWeight: 700 }}>
                    {problem.id}
                  </span>
                  <h2 className="text-slate-900 text-base" style={{ fontWeight: 600 }}>
                    {problem.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyConfig[problem.difficulty]}`}>
                    {problem.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">{problem.points} pts</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400">{problem.timeLimit}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400">{problem.memoryLimit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Problem tabs */}
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

          {/* Problem content */}
          <div className="flex-1 overflow-y-auto p-5 text-sm text-slate-600 leading-relaxed space-y-5">
            {activeTab === "statement" && (
              <>
                <div>
                  <p className="whitespace-pre-line">{problem.statement}</p>
                </div>

                <div>
                  <h4 className="text-slate-800 text-xs mb-2" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Input Format
                  </h4>
                  <p className="whitespace-pre-line text-slate-500">{problem.inputFormat}</p>
                </div>

                <div>
                  <h4 className="text-slate-800 text-xs mb-2" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Output Format
                  </h4>
                  <p className="text-slate-500">{problem.outputFormat}</p>
                </div>

                <div>
                  <h4 className="text-slate-800 text-xs mb-2" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Constraints
                  </h4>
                  <ul className="space-y-1">
                    {problem.constraints.map((c, i) => (
                      <li key={i} className="text-slate-500 flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 bg-slate-400 rounded-full flex-shrink-0" />
                        <code className="text-xs bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">
                          {c}
                        </code>
                      </li>
                    ))}
                  </ul>
                </div>

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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-xs rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  {isRunning ? "Running..." : "Run on this Input"}
                </button>
              </div>
            )}

            {activeTab === "output" && (
              <div>
                <pre className="text-xs font-mono bg-slate-900 text-green-400 p-3 rounded-lg min-h-32 whitespace-pre-wrap">
                  {outputText || "Output will appear here after running..."}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT PANEL: Editor ===== */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              {/* Language selector */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="appearance-none bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 pr-7 cursor-pointer outline-none hover:bg-slate-600 transition-colors"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 text-red-400 text-xs ml-3">
                <AlertTriangle className="w-3.5 h-3.5" />
                {violations}
              </div>
              <button
                onClick={() => {
                  const boilerplate =
                    BOILERPLATES[language]?.[problem.id] ?? BOILERPLATES[language]?.["default"] ?? "";
                  setCode(boilerplate);
                }}
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

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden flex relative">
            {/* Line numbers */}
            <div
              className="select-none text-right pr-3 pt-3 pb-3 pl-3 text-slate-600 bg-slate-900 border-r border-slate-700/50 overflow-hidden flex-shrink-0"
              style={{
                fontFamily: "monospace",
                fontSize: "13px",
                lineHeight: "1.6",
                minWidth: "48px",
              }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  const start = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  const newCode = code.substring(0, start) + "    " + code.substring(end);
                  setCode(newCode);
                  setTimeout(() => {
                    if (textareaRef.current) {
                      textareaRef.current.selectionStart = start + 4;
                      textareaRef.current.selectionEnd = start + 4;
                    }
                  }, 0);
                }
              }}
              className="flex-1 bg-slate-900 text-slate-100 p-3 resize-none outline-none overflow-auto"
              style={{
                fontFamily: "monospace",
                fontSize: "13px",
                lineHeight: "1.6",
                caretColor: "#60a5fa",
              }}
              spellCheck={false}
            />
          </div>

          {/* Bottom Console */}
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

      {/* Webcam preview */}
      <WebcamPreview username={currentUser?.username} />

      {/* Submission Result Modal */}
      {showModal && verdict && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Verdict header */}
            <div className={`px-6 py-5 ${verdictConfig[verdict].bg} border-b ${verdictConfig[verdict].border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = verdictConfig[verdict].icon;
                    return <Icon className={`w-6 h-6 ${verdictConfig[verdict].text}`} />;
                  })()}
                  <div>
                    <div className={`text-lg ${verdictConfig[verdict].text}`} style={{ fontWeight: 700 }}>
                      {verdictConfig[verdict].label}
                    </div>
                    <div className="text-slate-500 text-sm">Problem {problem.id} · {problem.title}</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/60 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="px-6 py-5 space-y-4">
              {/* Test cases */}
              <div>
                <div className="text-slate-500 text-xs mb-2" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Test Cases
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: 12 }, (_, i) => {
                    const pass = verdict === "Accepted" ? true : i < (verdict === "Wrong Answer" ? 7 : 4);
                    return (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center ${pass ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        style={{ fontWeight: 600 }}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
                {verdict !== "Accepted" && (
                  <p className="text-slate-400 text-xs mt-2">
                    {verdict === "Wrong Answer" ? "7/12" : verdict === "TLE" ? "4/12" : "0/12"} test cases passed
                  </p>
                )}
                {verdict === "Accepted" && (
                  <p className="text-green-600 text-xs mt-2">All 12/12 test cases passed</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-slate-400 text-xs mb-1">Execution Time</div>
                  <div className="text-slate-800 text-sm" style={{ fontWeight: 700 }}>
                    {verdict === "TLE" ? "2.01s" : "0.08s"}
                  </div>
                  <div className="text-slate-400 text-xs">limit: {problem.timeLimit}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-slate-400 text-xs mb-1">Memory Used</div>
                  <div className="text-slate-800 text-sm" style={{ fontWeight: 700 }}>
                    {verdict === "MLE" ? "512 MB" : "14 MB"}
                  </div>
                  <div className="text-slate-400 text-xs">limit: {problem.memoryLimit}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-slate-400 text-xs mb-1">Score</div>
                  <div className={`text-sm ${verdict === "Accepted" ? "text-green-700" : "text-slate-400"}`} style={{ fontWeight: 700 }}>
                    {verdict === "Accepted" ? `+${problem.points}` : "+0"}
                  </div>
                  <div className="text-slate-400 text-xs">pts earned</div>
                </div>
              </div>

              {verdict === "Accepted" && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-green-700 text-sm" style={{ fontWeight: 500 }}>
                    🎉 Great job! Problem solved successfully.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={() => { setShowModal(false); navigate("/student/problems"); }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                style={{ fontWeight: 500 }}
              >
                Back to Problems
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
