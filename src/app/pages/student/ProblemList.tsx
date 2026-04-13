import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, Circle, Clock, AlertCircle, ChevronRight, Trophy, Zap } from "lucide-react";

const API = "http://localhost:3000/api";

const difficultyConfig = {
  easy:   { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  medium: { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  hard:   { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"   },
};

const statusConfig = {
  Solved:      { icon: CheckCircle2, color: "text-green-500", label: "Solved",   bg: "bg-green-50" },
  Attempted:   { icon: AlertCircle,  color: "text-amber-500", label: "Attempted",bg: "bg-amber-50" },
  Unattempted: { icon: Circle,       color: "text-slate-300", label: "—",        bg: ""            },
};

export default function ProblemList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get("contestId");

  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/questions`)
      .then(res => res.json())
      .then((data: any[]) => {
        // normalize + add default status since it's not in DB
        const normalized = data.map((q, i) => ({
          ...q,
          id: q.id,
          difficulty: q.difficulty,          // already lowercase from Firestore
          status: "Unattempted",             // default; replace with real user progress later
          points: q.points || 0,
          timeLimit: q.time_limit || "2s",
          memoryLimit: q.memory_limit || "256MB",
        }));
        setProblems(normalized);
      })
      .catch(() => setError("Failed to load problems. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const solved   = problems.filter(p => p.status === "Solved").length;
  const attempted = problems.filter(p => p.status === "Attempted").length;
  const totalScore = problems
    .filter(p => p.status === "Solved")
    .reduce((sum, p) => sum + p.points, 0);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-6 py-8 text-center text-slate-400 text-sm">
      Loading problems...
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-6 py-8 text-center text-red-500 text-sm">
      {error}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900 mb-1" style={{ fontWeight: 700, fontSize: "1.4rem" }}>
            Problem Set
          </h1>
          <p className="text-slate-500 text-sm">
            Weekly DSA Championship #42 · {problems.length} problems
          </p>
        </div>
        <button
          onClick={() => navigate("/student/leaderboard")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <Trophy className="w-4 h-4 text-blue-500" />
          Leaderboard
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-600 text-sm">Your Progress</span>
          <span className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
            {solved} / {problems.length} solved · {totalScore} pts
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-2 bg-blue-500 rounded-full transition-all"
            style={{ width: `${problems.length ? (solved / problems.length) * 100 : 0}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            {solved} Solved
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            {attempted} Attempted
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-slate-200 rounded-full" />
            {problems.length - solved - attempted} Untouched
          </span>
        </div>
      </div>

      {/* Problem List */}
      <div className="space-y-2.5">
        {problems.map((problem, index) => {
          const diff = difficultyConfig[problem.difficulty as keyof typeof difficultyConfig] || difficultyConfig.easy;
          const stat = statusConfig[problem.status as keyof typeof statusConfig] || statusConfig.Unattempted;
          const StatusIcon = stat.icon;
          const label = String.fromCharCode(65 + index); // A, B, C...

          return (
            <button
              key={problem.id}
              onClick={() => navigate(`/student/workspace/${problem.id}${contestId ? `?contestId=${contestId}` : ""}`)}
              className="w-full bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-5 text-left hover:border-blue-300 hover:shadow-sm hover:shadow-blue-100/60 transition-all group"
            >
              {/* Letter */}
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors" style={{ fontWeight: 700 }}>
                {label}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <span className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
                    {problem.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${diff.bg} ${diff.text} ${diff.border}`}>
                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {problem.timeLimit}
                  </span>
                  <span>{problem.memoryLimit}</span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-blue-400" />
                    {problem.points} pts
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs flex-shrink-0 ${stat.bg}`}>
                <StatusIcon className={`w-4 h-4 ${stat.color}`} />
                <span className={`hidden sm:block ${stat.color}`} style={{ fontWeight: 500 }}>
                  {stat.label}
                </span>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        Click on a problem to open the coding workspace
      </p>
    </div>
  );
}