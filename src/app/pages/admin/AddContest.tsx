import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Check, ArrowLeft, Trophy, ShieldCheck, ListChecks, Info } from "lucide-react";
import { createContest, updateContest } from "../../services/contest";
import { motion } from "framer-motion";

type Question = {
  id: string;
  title?: string;
  difficulty?: string;
  points?: number;
};

export default function AddContest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = searchParams.get("edit") === "true";
  const contestName = searchParams.get("name") ?? "";

  const [form, setForm] = useState({
    name: contestName,
    startTime: (searchParams.get("startTime") ?? "2026-04-25T10:00"),
    endTime: (searchParams.get("endTime") ?? "2026-04-25T13:00"),
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { databases, APPWRITE_DB_ID } = await import("../../services/appwrite");
        const response = await databases.listDocuments(APPWRITE_DB_ID, "questions");
        const data = response.documents.map((doc) => ({
          id: doc.$id,
          title: doc.title,
          difficulty: doc.difficulty,
          points: doc.points || 100,
        })) as Question[];
        setQuestions(data);
      } catch (err) {
        console.error("Error fetching questions from Appwrite:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) => {
      return prev.includes(id)
        ? prev.filter((q) => q !== id)
        : [...prev, id];
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.startTime || !form.endTime) {
      alert("Please fill all fields");
      return;
    }

    if (selectedQuestions.length === 0) {
      alert("Select at least one question");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      start_time: form.startTime,
      end_time: form.endTime,
      problems: selectedQuestions.length,
      anti_cheat: antiCheat,
      question_ids: selectedQuestions,
    };

    try {
      if (isEdit) {
        const id = searchParams.get("id");
        if (!id) return;
        await updateContest(id, payload);
      } else {
        await createContest(payload);
      }

      setSaved(true);
      setTimeout(() => navigate("/admin/contests"), 1200);
    } catch (err) {
      console.error("Save contest error:", err);
      alert("Failed to save contest.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#0099ff]/30">
      <div className="bg-[#000000]/80 backdrop-blur-xl border-b border-white/5 px-8 py-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/admin/contests")}
            className="p-3 text-[#525252] hover:text-white hover:bg-white/5 rounded-2xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-[-0.05em] uppercase">
              {isEdit ? "Edit" : "Create"} <span className="text-[#0099ff]">Contest</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/admin/contests")}
            className="px-8 py-3.5 border border-white/5 text-[#a6a6a6] text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="px-8 py-3.5 bg-[#0099ff] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,153,255,0.2)] disabled:opacity-50"
          >
            {saved ? "Saved ✓" : saving ? "Saving…" : isEdit ? "Save Changes" : "Create Contest"}
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto py-16 px-8">
        <div className="grid grid-cols-12 gap-12">
          
          <div className="col-span-7 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-[#0099ff]" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#525252]">Contest Details</h2>
              </div>
              <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">Contest Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Winter Coding Challenge"
                    className="w-full bg-[#000000] border border-white/5 rounded-2xl px-6 py-4 text-white font-black text-sm placeholder:text-[#2a2a2a] focus:border-[#0099ff]/50 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">Start Time</label>
                    <input
                      type="datetime-local"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full bg-[#000000] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold text-sm focus:border-[#0099ff]/50 transition-all outline-none [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#525252]">End Time</label>
                    <input
                      type="datetime-local"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full bg-[#000000] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold text-sm focus:border-[#0099ff]/50 transition-all outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <ListChecks className="w-4 h-4 text-[#0099ff]" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#525252]">Select Questions</h2>
              </div>
              <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] p-10 space-y-4 shadow-2xl">
                {loading ? (
                  <div className="py-20 text-center text-[#525252] text-[10px] font-black uppercase tracking-widest animate-pulse">Loading Questions...</div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto pr-4 space-y-3 custom-scrollbar">
                    {questions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => toggleQuestion(q.id)}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                          selectedQuestions.includes(q.id)
                            ? "bg-[#0099ff]/10 border-[#0099ff]/30 text-white"
                            : "bg-[#000000] border-white/5 text-[#525252] hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                            selectedQuestions.includes(q.id) ? "bg-[#0099ff] border-transparent shadow-[0_0_15px_rgba(0,153,255,0.4)]" : "bg-white/5 border-white/10"
                          }`}>
                            {selectedQuestions.includes(q.id) ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-[11px] font-black uppercase tracking-wider">{q.title}</p>
                            <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${
                              q.difficulty === 'Hard' ? 'text-rose-400' : q.difficulty === 'Medium' ? 'text-blue-400' : 'text-emerald-400'
                            }`}>{q.difficulty}</p>
                          </div>
                        </div>
                        <div className="text-[10px] font-black text-[#333]">
                           {q.points} PTS
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="col-span-5 space-y-12">
            <section className="space-y-6 sticky top-32">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#0099ff]" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#525252]">Anti-Cheat Settings</h2>
              </div>
              <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] p-10 space-y-10 shadow-2xl">
                <div className="flex items-center justify-between p-6 bg-[#000000] border border-white/5 rounded-3xl">
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-wider">Security Status</p>
                    <p className="text-[9px] font-bold text-[#525252] uppercase tracking-[0.2em] mt-1">Enabled</p>
                  </div>
                  <button 
                    onClick={() => setAntiCheat({ ...antiCheat, enabled: !antiCheat.enabled })}
                    className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${
                      antiCheat.enabled ? 'bg-[#0099ff]' : 'bg-[#1a1a1a]'
                    }`}
                  >
                    <motion.div layout className="w-6 h-6 bg-white rounded-full shadow-2xl" />
                  </button>
                </div>

                <div className={`space-y-3 transition-all duration-500 ${!antiCheat.enabled ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
                  {Object.entries(antiCheat).filter(([k]) => k !== 'enabled').map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setAntiCheat({ ...antiCheat, [key]: !value })}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                        value 
                          ? "bg-[#000000] border-[#0099ff]/30 text-white" 
                          : "bg-transparent border-white/5 text-[#525252]"
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${value ? 'bg-[#0099ff] shadow-[0_0_10px_rgba(0,153,255,0.5)]' : 'bg-[#2a2a2a]'}`} />
                    </button>
                  ))}
                </div>

                <div className="pt-8 border-t border-white/5">
                  <div className="flex items-start gap-4 px-1">
                    <Info className="w-4 h-4 text-[#0099ff] shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.1em] leading-relaxed">
                      Anti-cheat rules will be active during the contest.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 153, 255, 0.3); }
      `}</style>
    </div>
  );
}
