import { useState } from "react";
import { useSearchParams } from "react-router";
import { Check, ArrowLeft } from "lucide-react";
import { createContest, updateContest } from "../../services/contest";
export default function AddContest() {
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";
  const contestName = searchParams.get("name") ?? "";

  const [form, setForm] = useState({
    name: contestName,
    startTime: searchParams.get("startTime") ?? "2026-03-10 11:00",
    endTime: searchParams.get("endTime") ?? "2026-03-10 14:00",
    problems: Number(searchParams.get("problems")) || 5,
  });

  const [antiCheat, setAntiCheat] = useState(() => {
    // When editing, try to parse stored sub-flags from URL (best-effort)
    const raw = searchParams.get("antiCheat");
    const parsed = raw && raw !== "true" && raw !== "false" && raw !== "[object Object]"
      ? (() => { try { return JSON.parse(raw); } catch { return null; } })()
      : null;
    return {
      enabled: parsed ? parsed.enabled : raw !== "false",
      fullscreen: parsed ? parsed.fullscreen : true,
      tabSwitch: parsed ? parsed.tabSwitch : true,
      webcam: parsed ? parsed.webcam : true,
      faceDetection: parsed ? parsed.faceDetection : true,
    };
  });

  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const payload = {...form, antiCheat};
    try {
      if (isEdit) {
        const id = searchParams.get("id");
        if (!id) {
          alert("Contest ID is missing. Please close this window and reopen the edit button from the contest list.");
          return;
        }
        await updateContest(id, payload);
        window.opener?.postMessage(
          { type: "contest-updated", id },
          window.location.origin
        );
      } else {
        const newContest = await createContest(payload);
        window.opener?.postMessage(
          { type: "contest-added", contest: newContest },
          window.location.origin
        );
      }
      setSaved(true);
      setTimeout(() => window.close(),1200);
    }
    catch(err){
      alert("Failed to save: " + (err instanceof Error ? err.message : String(err)));
    }
    
    
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.close()}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-slate-900 text-lg" style={{ fontWeight: 600 }}>
            {isEdit ? "Edit Contest" : "Create New Contest"}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.close()}
            className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            style={{ fontWeight: 500 }}
          >
            {saved ? "Saved ✓" : isEdit ? "Save Changes" : "Create Contest"}
          </button>
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-2xl mx-auto py-10 px-6 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-slate-800 text-base" style={{ fontWeight: 600 }}>
            Contest Details
          </h2>

          <div>
            <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Contest Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="e.g. Weekly DSA Championship #43"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Start Time</label>
              <input
                type="text"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="YYYY-MM-DD HH:MM"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>End Time</label>
              <input
                type="text"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="YYYY-MM-DD HH:MM"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Number of Problems</label>
            <input
              type="number"
              value={form.problems}
              onChange={(e) => setForm({ ...form, problems: Number(e.target.value) })}
              min={1}
              max={20}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-slate-800 text-base" style={{ fontWeight: 600 }}>
            Anti-Cheat Features
          </h2>

          <div className="space-y-2.5">
            {/* Master toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox"
                checked={antiCheat.enabled}
                onChange={e => {
                  const next = e.target.checked;
                  setAntiCheat({
                    enabled: next,
                    fullscreen: next,
                    tabSwitch: next,
                    webcam: next,
                    faceDetection: next,
                  });
                }}
                className="form-checkbox h-5 w-5 text-blue-600"
                 />
              <span className="text-sm text-slate-700">Enable Anti-Cheat Monitoring</span>
            </label>

            {/* Individual sub-toggles */}
            {([
              { key: "fullscreen" as const, label: "Fullscreen required" },
              { key: "tabSwitch" as const, label: "Tab switch detection" },
              { key: "webcam" as const, label: "Webcam required" },
              { key: "faceDetection" as const, label: "Multiple face detection" },
            ]).map((item) => (
              <label key={item.key} className="flex items-center gap-3 cursor-pointer ml-5">
                <input
                type = "checkbox"
                checked = {antiCheat[item.key]}
                disabled = {!antiCheat.enabled}
                  onChange={e => {
                    if (!antiCheat.enabled) return;
                    const updated = { ...antiCheat, [item.key]: e.target.checked };
                    // If all sub-items are unchecked, disable master
                    const anyOn = updated.fullscreen || updated.tabSwitch || updated.webcam || updated.faceDetection;
                    setAntiCheat({ ...updated, enabled: anyOn });
                  }}
                  
                />
                <span className={`text-sm text-slate-500 ${!antiCheat.enabled ? "opacity-40" : ""}`}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
