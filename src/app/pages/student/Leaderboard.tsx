import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Trophy, RefreshCw, ArrowLeft, Medal, Crown } from "lucide-react";
const leaderboard = [
  { rank: 1, username: "AlgoMaster_X",      avatar: "AM", solved: 5, score: 1100, penalty: 142, isCurrentUser: false },
  { rank: 2, username: "CodeNinja_99",       avatar: "CN", solved: 5, score: 1100, penalty: 187, isCurrentUser: false },
  { rank: 3, username: "devstar_priya",      avatar: "DP", solved: 4, score: 900,  penalty: 203, isCurrentUser: false },
  { rank: 4, username: "you (alex_coder)",   avatar: "AC", solved: 3, score: 600,  penalty: 89,  isCurrentUser: true  },
  { rank: 5, username: "recursion_king",     avatar: "RK", solved: 3, score: 600,  penalty: 134, isCurrentUser: false },
  { rank: 6, username: "hash_table_hero",    avatar: "HH", solved: 3, score: 500,  penalty: 156, isCurrentUser: false },
  { rank: 7, username: "BinaryBoss",         avatar: "BB", solved: 2, score: 400,  penalty: 67,  isCurrentUser: false },
  { rank: 8, username: "sort_queen",         avatar: "SQ", solved: 2, score: 300,  penalty: 210, isCurrentUser: false },
  { rank: 9, username: "dp_wizard",          avatar: "DW", solved: 2, score: 300,  penalty: 245, isCurrentUser: false },
  { rank: 10, username: "graph_guru",        avatar: "GG", solved: 1, score: 100,  penalty: 32,  isCurrentUser: false },
  { rank: 11, username: "stack_overflow_fan",avatar: "SO", solved: 1, score: 100,  penalty: 78,  isCurrentUser: false },
  { rank: 12, username: "newbie_coder_22",   avatar: "NC", solved: 0, score: 0,    penalty: 0,   isCurrentUser: false },
];

const PROBLEM_LABELS = ["A", "B", "C", "D", "E"];

const statusColor = {
  Solved: "bg-green-500",
  Attempted: "bg-amber-400",
  Unattempted: "bg-slate-200",
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/student/problems")}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.4rem" }}>
              Leaderboard
            </h1>
            <p className="text-slate-500 text-sm">Weekly DSA Championship #42</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm text-green-700">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Last updated */}
      <p className="text-xs text-slate-400 mb-5">
        Last updated: {lastUpdated.toLocaleTimeString()} · 342 participants
      </p>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* 2nd place */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center pt-6">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-2" style={{ fontWeight: 700 }}>
            CN
          </div>
          <div className="text-xs text-slate-400 mb-0.5">CodeNinja_99</div>
          <div className="text-slate-800 text-sm mb-1" style={{ fontWeight: 700 }}>1100 pts</div>
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-sm" style={{ fontWeight: 700 }}>
            2
          </div>
        </div>

        {/* 1st place */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col items-center text-center -mt-3">
          <Crown className="w-5 h-5 text-amber-500 mb-2" />
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mb-2" style={{ fontWeight: 700 }}>
            AM
          </div>
          <div className="text-xs text-amber-700 mb-0.5">AlgoMaster_X</div>
          <div className="text-amber-800 text-sm mb-1" style={{ fontWeight: 700 }}>1100 pts</div>
          <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white text-sm" style={{ fontWeight: 700 }}>
            1
          </div>
        </div>

        {/* 3rd place */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center pt-6">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2" style={{ fontWeight: 700 }}>
            DP
          </div>
          <div className="text-xs text-slate-400 mb-0.5">devstar_priya</div>
          <div className="text-slate-800 text-sm mb-1" style={{ fontWeight: 700 }}>900 pts</div>
          <div className="w-8 h-8 bg-amber-700/20 rounded-full flex items-center justify-center text-amber-800 text-sm" style={{ fontWeight: 700 }}>
            3
          </div>
        </div>
      </div>

      {/* Full Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid items-center bg-slate-50 border-b border-slate-200 px-5 py-3 text-xs text-slate-400" style={{ gridTemplateColumns: "52px 1fr 200px 100px 90px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <span>Rank</span>
          <span>Participant</span>
          <span>Problems</span>
          <span className="text-right">Score</span>
          <span className="text-right">Penalty</span>
        </div>

        {/* Rows */}
        {leaderboard.map((entry) => (
          <div
            key={entry.rank}
            className={`grid items-center px-5 py-3.5 border-b border-slate-100 last:border-0 ${
              entry.isCurrentUser
                ? "bg-blue-50 border-l-2 border-l-blue-500"
                : "hover:bg-slate-50"
            } transition-colors`}
            style={{ gridTemplateColumns: "52px 1fr 200px 100px 90px" }}
          >
            {/* Rank */}
            <div className="flex items-center">
              {entry.rank <= 3 ? (
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                    entry.rank === 1
                      ? "bg-amber-100 text-amber-700"
                      : entry.rank === 2
                      ? "bg-slate-200 text-slate-600"
                      : "bg-orange-100 text-orange-700"
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  {entry.rank}
                </div>
              ) : (
                <span className="text-slate-500 text-sm w-7 text-center" style={{ fontWeight: 500 }}>
                  {entry.rank}
                </span>
              )}
            </div>

            {/* User */}
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                  entry.isCurrentUser
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
                style={{ fontWeight: 600 }}
              >
                {entry.avatar}
              </div>
              <div>
                <div className={`text-sm ${entry.isCurrentUser ? "text-blue-700" : "text-slate-800"}`} style={{ fontWeight: entry.isCurrentUser ? 600 : 400 }}>
                  {entry.username}
                </div>
                {entry.isCurrentUser && (
                  <div className="text-blue-500 text-xs">You</div>
                )}
              </div>
            </div>

            {/* Problem dots */}
            {PROBLEM_LABELS.map((label, i) => {
  const isSolved = entry.solved >= i + 1;
  return (
    <div
      key={label}
      className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
        isSolved
          ? "bg-green-100 text-green-700 border border-green-200"
          : "bg-slate-100 text-slate-400 border border-slate-200"
      }`}
      style={{ fontWeight: 600 }}
      title={`Problem ${label}`}
    >
      {label}
    </div>
  );
})}

            {/* Score */}
            <div className="text-right">
              <span className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
                {entry.score}
              </span>
            </div>

            {/* Penalty */}
            <div className="text-right text-slate-400 text-sm">
              {entry.penalty > 0 ? `+${entry.penalty}` : "—"}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        Showing all 342 participants · Sorted by score, then penalty time
      </p>
    </div>
  );
}
