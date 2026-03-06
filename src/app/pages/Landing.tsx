import { useNavigate } from "react-router";
import { Code2, Shield, ChevronRight, Trophy, Zap } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col">

      {/* Header */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-900 tracking-tight font-semibold">
            CodeArena
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-slate-400">
            Student-Friendly DSA Contest Platform
          </span>

          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-blue-700 border border-blue-300 rounded-lg px-4 py-1.5 hover:bg-blue-50 transition-colors"
          >
            Login
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center mb-14 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-4 py-1.5 text-sm mb-6">
            <Zap className="w-3.5 h-3.5" />
            <span>Weekly DSA Championship #42 is LIVE</span>
          </div>

          <h1
            className="text-slate-900 mb-4"
            style={{ fontSize: "2.75rem", fontWeight: 700, lineHeight: 1.15 }}
          >
            Compete. Code. Conquer.
          </h1>

          <p className="text-slate-500 max-w-lg mx-auto">
            A clean, distraction-free competitive programming environment designed
            for students. Sharpen your DSA skills in timed, proctored contests.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">

          {/* Student Card */}
          <div className="group bg-white border border-slate-200 rounded-2xl p-8 text-left hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-200">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-700 transition-colors">
              <Trophy className="w-6 h-6 text-white" />
            </div>

            <h2
              className="text-slate-900 mb-2"
              style={{ fontWeight: 600, fontSize: "1.2rem" }}
            >
              Enter as Student
            </h2>

            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Join active contests, solve problems, and climb the leaderboard.
              Real-time judging with instant feedback.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/signup")}
                className="flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2 border border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Login
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Admin Card */}
          <button
            onClick={() => navigate("/admin")}
            className="group bg-white border border-slate-200 rounded-2xl p-8 text-left hover:border-slate-400 hover:shadow-lg hover:shadow-slate-100/80 transition-all duration-200 cursor-pointer"
          >
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-5 group-hover:bg-slate-900 transition-colors">
              <Shield className="w-6 h-6 text-white" />
            </div>

            <h2
              className="text-slate-900 mb-2"
              style={{ fontWeight: 600, fontSize: "1.2rem" }}
            >
              Enter as Admin
            </h2>

            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Manage contests, questions, and participants. Monitor live submissions
              and anti-cheat alerts in real time.
            </p>

            <div className="flex items-center gap-2 text-slate-700 text-sm">
              <span>Go to Admin Dashboard</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="mt-14 flex items-center gap-8 text-center">
          {[
            { label: "Active Contests", value: "2" },
            { label: "Registered Users", value: "1,284" },
            { label: "Submissions Today", value: "3,941" },
            { label: "Problems Available", value: "87" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span
                className="text-slate-900"
                style={{ fontWeight: 700, fontSize: "1.35rem" }}
              >
                {stat.value}
              </span>
              <span className="text-slate-400 text-xs">{stat.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-sm text-slate-400 border-t border-slate-100">
        © 2026 CodeArena — DSA Contest Platform
      </footer>
    </div>
  );
}