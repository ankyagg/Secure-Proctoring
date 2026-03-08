import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Trophy,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Wifi,
  Camera,
  Monitor,
  Shield
} from "lucide-react";

import { auth, db } from "../../services/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { fetchContests } from "../../services/contest";

type Contest = { id: string; name: string; description: string; registeredParticipants: number; problems: number; antiCheat: boolean; [key: string]: any };

export default function ContestLobby() {
  const navigate = useNavigate();
  const [liveContests, setLiveContests] = useState<Contest[]>([]);
  const [rulesChecked, setRulesChecked] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email || "");
      }
    });

    // Fetch live contests
    fetchContests().then((contests:Contest[]) => {
      const now = new Date();
      const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
      const upcomingContests = contests.filter(c => {
        if (c.status === "Ended") return false;
        const start = new Date(c.startTime.replace(" ", "T"));
        return start >= now && start <= fiveDaysLater;
      });
      setLiveContests(upcomingContests);
    });

    return () => unsubscribe();
  }, []);

  const enterContest = async (contest: Contest) => {
    setSelectedContest(contest);
  };

  const confirmEnterContest = async () => {
    if (!selectedContest) return;
    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        contestsEntered: arrayUnion(selectedContest.name)
      });

      navigate(`/student/problems?contestId=${selectedContest.id}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* USER INFO */}
      <div className="mb-6 text-sm text-slate-500">
        Logged in as{" "}
        <span className="font-semibold text-slate-800">
          {userEmail}
        </span>
      </div>

      {selectedContest ? (
        // DETAILED CONTEST VIEW
        <>
          {/* LIVE STATUS */}
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              CONTEST DETAILS
            </span>
            <span className="text-slate-400 text-sm">
              {selectedContest.registeredParticipants} participants expected
            </span>
          </div>

          {/* CONTEST CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 mb-5">
            <h1 className="text-slate-900 mb-2 font-bold text-2xl">
              {selectedContest.name}
            </h1>
            <p className="text-slate-500 mb-6">{selectedContest.description || "No description available"}</p>

            <div className="flex items-center gap-6 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span><strong>{selectedContest.problems || 5}</strong> Problems</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Users className="w-4 h-4 text-blue-500" />
                <span><strong>{selectedContest.registeredParticipants || 0}</strong> Participants</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Trophy className="w-4 h-4 text-blue-500" />
                <span><strong>1100</strong> Max Points</span>
              </div>
            </div>
          </div>

          {/* WARNING */}
          {selectedContest.antiCheat && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-amber-700 text-sm">
                This contest uses active anti-cheat monitoring including webcam and tab tracking.
              </p>
            </div>
          )}

          {/* SYSTEM REQUIREMENTS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
            <h3 className="text-slate-800 text-sm mb-4 font-semibold">
              System Requirements
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col items-center text-xs bg-green-50 text-green-700 p-3 rounded-lg">
                <Wifi className="w-5 h-5"/>
                Stable Internet
              </div>
              <div className="flex flex-col items-center text-xs bg-green-50 text-green-700 p-3 rounded-lg">
                <Camera className="w-5 h-5"/>
                Webcam Ready
              </div>
              <div className={`flex flex-col items-center text-xs p-3 rounded-lg ${selectedContest.antiCheat ? "bg-slate-50 text-slate-500" : "bg-green-50 text-green-700"}`}>
                <Monitor className="w-5 h-5"/>
                Fullscreen Mode
              </div>
              <div className={`flex flex-col items-center text-xs p-3 rounded-lg ${selectedContest.antiCheat ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-500"}`}>
                <Shield className="w-5 h-5"/>
                Anti-Cheat {selectedContest.antiCheat ? "Active" : "Off"}
              </div>
            </div>
          </div>

          {/* RULES + BUTTON */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <label className="flex items-start gap-3 cursor-pointer mb-5">
              <div
                onClick={() => setRulesChecked(!rulesChecked)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  rulesChecked ? "bg-blue-600 border-blue-600" : "border-slate-300"
                }`}
              >
                {rulesChecked && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <span className="text-slate-600 text-sm">
                I agree to the contest rules and understand violations may result in disqualification.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedContest(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={confirmEnterContest}
                disabled={!rulesChecked}
                className={`flex-1 px-4 py-2.5 text-sm rounded-lg ${
                  rulesChecked
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Enter Contest
              </button>
            </div>
          </div>
        </>
      ) : (
        // CONTEST LIST
        <>
          {/* UPCOMING CONTESTS HEADER */}
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              UPCOMING CONTESTS
            </span>
            <span className="text-slate-400 text-sm">
              
            </span>
          </div>

          {/* CONTEST LIST */}
          {liveContests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Trophy className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No upcoming contests in the next 5 days</p>
            </div>
          ) : (
            <div className="space-y-4">
              {liveContests.map((contest) => (
                <div key={contest.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-slate-900 font-semibold text-lg">{contest.name}</h3>
                    <p className="text-slate-500 text-sm">{contest.description || "No description available"}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>Starts: {contest.startTime}</span>
                      <span>Problems: {contest.problems || 5}</span>
                      <span>Participants: {contest.registeredParticipants || 0}</span>
                      {contest.antiCheat && <span className="text-green-600">Anti-Cheat On</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => enterContest(contest)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Enter
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}