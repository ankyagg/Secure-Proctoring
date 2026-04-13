import { useState } from "react";
import {
  ShieldAlert,
  MonitorOff,
  Maximize,
  Camera,
  Users,
  AlertTriangle,
  CheckCircle2,
  Ban,
  MessageSquare,
  Filter,
  RefreshCw,
  Eye,
} from "lucide-react";
const antiCheatEvents = [
  { id: 1, user: "recursion_king",  event: "Tab Switch",      time: "10:13:22", details: "Switched to external browser tab",  severity: "High",   count: 3 },
  { id: 2, user: "newbie_coder_22", event: "Fullscreen Exit", time: "10:16:45", details: "Exited fullscreen mode",             severity: "Medium", count: 1 },
  { id: 3, user: "sort_queen",      event: "Multiple Faces",  time: "10:18:12", details: "2 faces detected in webcam feed",   severity: "High",   count: 2 },
  { id: 4, user: "graph_guru",      event: "Camera Off",      time: "10:21:03", details: "Webcam feed interrupted",           severity: "High",   count: 1 },
  { id: 5, user: "recursion_king",  event: "Tab Switch",      time: "10:24:38", details: "Switched to external browser tab",  severity: "High",   count: 4 },
  { id: 6, user: "BinaryBoss",      event: "Fullscreen Exit", time: "10:27:54", details: "Exited fullscreen mode",            severity: "Medium", count: 2 },
  { id: 7, user: "dp_wizard",       event: "Tab Switch",      time: "10:30:11", details: "Switched to external browser tab",  severity: "High",   count: 1 },
  { id: 8, user: "newbie_coder_22", event: "Multiple Faces",  time: "10:33:27", details: "2 faces detected in webcam feed",   severity: "High",   count: 1 },
];

const suspicionScores = [
  { user: "recursion_king",  score: 82, tabSwitch: 4, fullscreenExit: 0, cameraOff: 0, multiFace: 0, status: "Warning Sent"  },
  { user: "sort_queen",      score: 74, tabSwitch: 0, fullscreenExit: 0, cameraOff: 0, multiFace: 2, status: "Warning Sent"  },
  { user: "graph_guru",      score: 65, tabSwitch: 0, fullscreenExit: 0, cameraOff: 1, multiFace: 0, status: "Under Review"  },
  { user: "newbie_coder_22", score: 58, tabSwitch: 1, fullscreenExit: 1, cameraOff: 0, multiFace: 1, status: "Flagged"       },
  { user: "BinaryBoss",      score: 28, tabSwitch: 0, fullscreenExit: 2, cameraOff: 0, multiFace: 0, status: "Warned"        },
  { user: "dp_wizard",       score: 15, tabSwitch: 1, fullscreenExit: 0, cameraOff: 0, multiFace: 0, status: "Monitoring"    },
];
const eventConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  "Tab Switch": { icon: MonitorOff, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  "Fullscreen Exit": { icon: Maximize, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  "Camera Off": { icon: Camera, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  "Multiple Faces": { icon: Users, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
};

const severityConfig = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-green-50 text-green-700 border-green-200",
};

const scoreColor = (score: number) => {
  if (score >= 70) return { bar: "bg-red-500", text: "text-red-700", label: "High Risk" };
  if (score >= 40) return { bar: "bg-amber-500", text: "text-amber-700", label: "Medium Risk" };
  return { bar: "bg-green-500", text: "text-green-700", label: "Low Risk" };
};

export default function AntiCheatMonitoring() {
  const [events, setEvents] = useState(antiCheatEvents);
  const [scores, setScores] = useState(suspicionScores);
  const [filterType, setFilterType] = useState("All");
  const [warnings, setWarnings] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const eventTypes = ["All", "Tab Switch", "Fullscreen Exit", "Camera Off", "Multiple Faces"];

  const filteredEvents = events.filter(
    (e) => !dismissed.has(e.id) && (filterType === "All" || e.event === filterType)
  );

  const totalFlags = filteredEvents.length;
  const highSeverity = filteredEvents.filter((e) => e.severity === "High").length;

  const sendWarning = (user: string) => {
    setWarnings((prev) => ({ ...prev, [user]: true }));
    setScores((prev) =>
      prev.map((s) =>
        s.user === user ? { ...s, status: "Warning Sent" } : s
      )
    );
  };

  const disqualify = (user: string) => {
    setScores((prev) =>
      prev.map((s) =>
        s.user === user ? { ...s, status: "Disqualified" } : s
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.4rem" }}>
            Anti-Cheat Monitor
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time integrity monitoring · WDC #42
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-sm text-red-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            {highSeverity} High-Risk Flags
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: totalFlags, icon: ShieldAlert, color: "text-slate-700 bg-slate-100" },
          { label: "High Severity", value: highSeverity, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
          { label: "Users Flagged", value: scores.length, icon: Eye, color: "text-amber-600 bg-amber-50" },
          { label: "Warnings Sent", value: Object.values(warnings).filter(Boolean).length, icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="text-slate-900 mb-0.5" style={{ fontWeight: 700, fontSize: "1.5rem" }}>
                {card.value}
              </div>
              <div className="text-slate-400 text-xs">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Violation Log */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
              Violation Log
            </h2>
            <div className="flex gap-1">
              {eventTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    filterType === t
                      ? "bg-slate-800 text-white"
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t === "All" ? "All" : t.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No violations in this category</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredEvents.map((event) => {
                  const cfg = eventConfig[event.event] ?? eventConfig["Tab Switch"];
                  const Icon = cfg.icon;
                  const sev = severityConfig[event.severity as keyof typeof severityConfig];

                  return (
                    <div key={event.id} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.border} border`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
                            {event.user}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            {event.event}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${sev}`}>
                            {event.severity}
                          </span>
                          {event.count > 1 && (
                            <span className="text-xs text-slate-400">×{event.count}</span>
                          )}
                        </div>
                        <div className="text-slate-500 text-xs">{event.details}</div>
                        <div className="text-slate-400 text-xs mt-0.5" style={{ fontFamily: "monospace" }}>
                          {event.time}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => sendWarning(event.user)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                            warnings[event.user]
                              ? "bg-slate-100 text-slate-400 cursor-default"
                              : "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
                          }`}
                          disabled={!!warnings[event.user]}
                        >
                          <MessageSquare className="w-3 h-3" />
                          {warnings[event.user] ? "Sent" : "Warn"}
                        </button>
                        <button
                          onClick={() => setDismissed((prev) => new Set([...prev, event.id]))}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-xs"
                          title="Dismiss"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Suspicion Scores */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
            Suspicion Scores
          </h2>

          <div className="space-y-3">
            {scores
              .sort((a, b) => b.score - a.score)
              .map((entry) => {
                const sc = scoreColor(entry.score);
                return (
                  <div key={entry.user} className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-600" style={{ fontWeight: 600 }}>
                          {entry.user.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-slate-800 text-xs" style={{ fontWeight: 600 }}>
                            {entry.user}
                          </div>
                          <div className={`text-xs ${sc.text}`}>{sc.label}</div>
                        </div>
                      </div>
                      <div className={`text-lg ${sc.text}`} style={{ fontWeight: 700 }}>
                        {entry.score}
                      </div>
                    </div>

                    {/* Score bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-1.5 rounded-full transition-all ${sc.bar}`}
                        style={{ width: `${entry.score}%` }}
                      />
                    </div>

                    {/* Event breakdown */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {entry.tabSwitch > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full">
                          Tab ×{entry.tabSwitch}
                        </span>
                      )}
                      {entry.fullscreenExit > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
                          FS ×{entry.fullscreenExit}
                        </span>
                      )}
                      {entry.cameraOff > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full">
                          Cam ×{entry.cameraOff}
                        </span>
                      )}
                      {entry.multiFace > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-full">
                          Face ×{entry.multiFace}
                        </span>
                      )}
                    </div>

                    {/* Status + actions */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.status === "Disqualified"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : entry.status === "Warning Sent"
                          ? "bg-amber-50 text-amber-600 border border-amber-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        {entry.status}
                      </span>

                      <div className="flex gap-1">
                        <button
                          onClick={() => sendWarning(entry.user)}
                          disabled={entry.status === "Warning Sent" || entry.status === "Disqualified"}
                          className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Send Warning"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => disqualify(entry.user)}
                          disabled={entry.status === "Disqualified"}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Disqualify"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
