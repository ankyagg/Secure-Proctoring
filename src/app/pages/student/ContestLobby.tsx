import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Clock,
  Users,
  Trophy,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Wifi,
  Camera,
  Monitor,
  Shield,
} from "lucide-react";
import { contest } from "../../data/mockData";

export default function ContestLobby() {
  const navigate = useNavigate();
  const [rulesChecked, setRulesChecked] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Status badge */}
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          LIVE NOW
        </span>
        <span className="text-slate-400 text-sm">342 participants online</span>
      </div>

      {/* Contest Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-7 mb-5">
        <h1 className="text-slate-900 mb-2" style={{ fontWeight: 700, fontSize: "1.6rem" }}>
          {contest.name}
        </h1>
        <p className="text-slate-500 leading-relaxed mb-6">{contest.description}</p>

        {/* Time info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-slate-400 text-xs mb-1">Start Time</div>
            <div className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
              March 2, 2026
            </div>
            <div className="text-slate-600 text-sm">10:00 AM IST</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-slate-400 text-xs mb-1">End Time</div>
            <div className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
              March 2, 2026
            </div>
            <div className="text-slate-600 text-sm">1:00 PM IST</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-blue-500 text-xs mb-1">Duration</div>
            <div className="text-blue-800 text-sm" style={{ fontWeight: 700 }}>
              {contest.duration}
            </div>
            <div className="text-blue-600 text-sm">~1h 45m remaining</div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span><strong className="text-slate-700">5</strong> Problems</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Users className="w-4 h-4 text-blue-500" />
            <span><strong className="text-slate-700">{contest.registeredParticipants}</strong> Participants</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Trophy className="w-4 h-4 text-blue-500" />
            <span><strong className="text-slate-700">1100</strong> Max Points</span>
          </div>
        </div>
      </div>

      {/* Anti-cheat notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-amber-800 text-sm mb-1" style={{ fontWeight: 600 }}>
            Proctored Contest
          </div>
          <p className="text-amber-700 text-sm leading-relaxed">
            This contest uses active anti-cheat monitoring. Your webcam feed, tab
            activity, and browser focus will be recorded throughout.
          </p>
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
        <h3 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>
          System Requirements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Wifi, label: "Stable Internet", ok: true },
            { icon: Camera, label: "Webcam Ready", ok: true },
            { icon: Monitor, label: "Fullscreen Mode", ok: false },
            { icon: Shield, label: "Anti-Cheat Active", ok: true },
          ].map(({ icon: Icon, label, ok }) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg text-center text-xs ${
                ok ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
              <span className={ok ? "text-green-500" : "text-amber-500"}>
                {ok ? "✓ Ready" : "Click to Enable"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
        <h3 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>
          Contest Rules
        </h3>
        <ul className="space-y-3">
          {contest.rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <span className="text-slate-600 text-sm leading-relaxed">{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Agreement + Enter */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <label className="flex items-start gap-3 cursor-pointer mb-5">
          <div
            onClick={() => setRulesChecked(!rulesChecked)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              rulesChecked ? "bg-blue-600 border-blue-600" : "border-slate-300"
            }`}
          >
            {rulesChecked && <CheckCircle className="w-4 h-4 text-white" />}
          </div>
          <span className="text-slate-600 text-sm leading-relaxed">
            I have read and agree to all contest rules. I understand that violations of
            these rules may result in disqualification.
          </span>
        </label>

        <button
          onClick={() => navigate("/student/problems")}
          disabled={!rulesChecked}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm transition-all ${
            rulesChecked
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md cursor-pointer"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
          style={{ fontWeight: 600 }}
        >
          Enter Contest
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
