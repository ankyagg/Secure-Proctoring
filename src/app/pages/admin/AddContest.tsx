
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Check, ArrowLeft } from "lucide-react";
import { createContest, updateContest } from "../../services/contest";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
type Question = {
  id: string;
  title?: string;
  difficulty?: string;
  points?: number;
  time_limit?: string;
  memory_limit?: string;
};

export default function AddContest() {
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";
  const contestName = searchParams.get("name") ?? "";

  const [form, setForm] = useState({
    name: contestName,
    startTime: (searchParams.get("startTime") ?? "2026-04-16 10:00").replace(" ", "T"),
    endTime: (searchParams.get("endTime") ?? "2026-04-16 13:00").replace(" ", "T"),
    problems: Number(searchParams.get("problems")) || 5,
  });
const [questions, setQuestions] = useState<Question[]>([]);
const [selectedQuestions, setSelectedQuestions] = useState<string[]>(() => {
  const qStr = searchParams.get("questionIds");
  try {
    if (qStr) return JSON.parse(qStr);
  } catch (e) {
    console.error("Failed to parse questionIds", e);
  }
  return [];
});

  const [antiCheat, setAntiCheat] = useState(() => {
    const raw = searchParams.get("antiCheat");
    const parsed =
      raw && raw !== "true" && raw !== "false" && raw !== "[object Object]"
        ? (() => {
            try {
              return JSON.parse(raw);
            } catch {
              return null;
            }
          })()
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

  // 🔹 Fetch questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const snap = await getDocs(collection(db, "questions"));
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuestions(data);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };

    fetchQuestions();
  }, []);

  // 🔹 Toggle question selection
  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((q) => q !== id)
        : [...prev, id];
      return updated;
    });
  };

  // 🔹 Save contest
  const handleSave = async () => {
    if (!form.name || !form.startTime || !form.endTime) {
      alert("Please fill all fields");
      return;
    }

    if (selectedQuestions.length === 0) {
      alert("Select at least one question");
      return;
    }

    const payload = {
      name: form.name,
      start_time: form.startTime,
      end_time: form.endTime,
      problems: selectedQuestions.length,
      anti_cheat: antiCheat,
      question_ids: selectedQuestions,
    };
    console.log("FINAL PAYLOAD:", payload);

    try {
      if (isEdit) {
        const id = searchParams.get("id");
        if (!id) {
          alert("Contest ID missing");
          return;
        }
        await updateContest(id, payload);
        window.opener?.postMessage(
          { type: "c-updated", id, updates: payload },
          window.location.origin
        );
      } else {
        const newContest = await createContest(payload);
        window.opener?.postMessage(
          { type: "c-added", c: newContest },
          window.location.origin
        );
      }

      setSaved(true);
      setTimeout(() => window.close(), 1200);
    } catch (err) {
      alert(
        "Failed to save: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.close()}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-slate-900 text-lg font-semibold">
            {isEdit ? "Edit Contest" : "Create New Contest"}
          </h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.close()}
            className="px-5 py-2 border border-slate-200 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            {saved ? "Saved ✓" : isEdit ? "Save Changes" : "Create Contest"}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto py-10 px-6 space-y-6">
        <div className="bg-white p-6 rounded-xl border space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contest Name</label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="e.g. Weekly DSA Championship run #42"
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                placeholder="Start Time"
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) =>
                  setForm({ ...form, endTime: e.target.value })
                }
                placeholder="End Time"
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* 🔥 Anti Cheat Options */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">Proctoring Options</h2>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={antiCheat.enabled}
                onChange={(e) => setAntiCheat({ ...antiCheat, enabled: e.target.checked })}
              />
              Enable Full Proctoring Suite
            </label>
          </div>
          
          <div className={`grid grid-cols-2 gap-3 transition-opacity ${!antiCheat.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {Object.entries(antiCheat).filter(([k]) => k !== 'enabled').map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 border p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => setAntiCheat({ ...antiCheat, [key]: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 🔥 Question Selection */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="mb-3 font-semibold">Select Questions</h2>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {questions.map((q) => (
              <label key={q.id} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(q.id)}
                  onChange={() => toggleQuestion(q.id)}
                />
                <span>
                  {q.title} ({q.difficulty})
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

