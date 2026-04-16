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
  const [data, setData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("http://localhost:3000/api/leaderboard");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Leaderboard fetch failed:", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const top3 = data.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  if (loading) return <div className="p-8 text-center text-slate-500">Loading leaderboard...</div>;

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
            <p className="text-slate-500 text-sm">Real-time Competition Rankings</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm text-green-700">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </div>
          <button
            onClick={fetchLeaderboard}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Last updated */}
      <p className="text-xs text-slate-400 mb-5">
        Last updated: {lastUpdated.toLocaleTimeString()} · {data.length} participants
      </p>

      {/* Top 3 Podium */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd place */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center pt-6 opacity-90">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-2 font-bold uppercase">
              {second?.user?.substring(0, 2) || "2"}
            </div>
            <div className="text-xs text-slate-400 mb-0.5 truncate w-full px-2">{second?.user || "—"}</div>
            <div className="text-slate-800 text-sm mb-1 font-bold">{second?.total_points || 0} pts</div>
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-sm font-bold">2</div>
          </div>

          {/* 1st place */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col items-center text-center -mt-3">
            <Crown className="w-5 h-5 text-amber-500 mb-2" />
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mb-2 font-bold uppercase">
              {first?.user?.substring(0, 2) || "1"}
            </div>
            <div className="text-xs text-amber-700 mb-0.5 truncate w-full px-2">{first?.user || "—"}</div>
            <div className="text-amber-800 text-sm mb-1 font-bold">{first?.total_points || 0} pts</div>
            <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
          </div>

          {/* 3rd place */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center pt-6 opacity-80">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2 font-bold uppercase">
              {third?.user?.substring(0, 2) || "3"}
            </div>
            <div className="text-xs text-slate-400 mb-0.5 truncate w-full px-2">{third?.user || "—"}</div>
            <div className="text-slate-800 text-sm mb-1 font-bold">{third?.total_points || 0} pts</div>
            <div className="w-8 h-8 bg-amber-700/20 rounded-full flex items-center justify-center text-amber-800 text-sm font-bold">3</div>
          </div>
        </div>
      )}

      {/* Full Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid items-center bg-slate-50 border-b border-slate-200 px-5 py-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider" style={{ gridTemplateColumns: "52px 1fr 100px 100px 120px" }}>
          <span>Rank</span>
          <span>Participant</span>
          <span className="text-center">Solved</span>
          <span className="text-right">Score</span>
          <span className="text-right">Last Submission</span>
        </div>

        {data.map((entry, index) => (
          <div
            key={entry.email}
            className={`grid items-center px-5 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors`}
            style={{ gridTemplateColumns: "52px 1fr 100px 100px 120px" }}
          >
            <div className="flex items-center">
              {index < 3 ? (
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? "bg-amber-100 text-amber-700" : index === 1 ? "bg-slate-200 text-slate-600" : "bg-orange-100 text-orange-700"}`}>
                  {index + 1}
                </div>
              ) : (
                <span className="text-slate-500 text-sm w-7 text-center font-medium">{index + 1}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                {entry.user?.substring(0, 2)}
              </div>
              <div className="text-sm text-slate-800 font-medium truncate">{entry.user}</div>
            </div>

            <div className="text-center">
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                {entry.solved} solved
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-900 text-sm font-bold">{entry.total_points}</span>
            </div>

            <div className="text-right text-slate-400 text-xs">
              {new Date(entry.last_submission).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-sm">No submissions yet</div>
        )}
      </div>

      <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-medium">
        Rewards and certificates will be based on final standings
      </p>
    </div>
  );
}

