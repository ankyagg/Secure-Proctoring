import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Trophy,
  AlertCircle,
  BookOpen
} from "lucide-react";

import { auth, db } from "../../services/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { fetchContests } from "../../services/contest";

type Contest = {
  id: string;
  name: string;
  description?: string;
  registeredParticipants?: number;
  problems?: number;
  antiCheat?: { enabled?: boolean };
  anti_cheat?: { enabled?: boolean };
  startTime?: string;
  start_time?: string;
  endTime?: string;
  end_time?: string;
  status?: string;
};

export default function ContestLobby() {
  const navigate = useNavigate();

  const [liveContests, setLiveContests] = useState<Contest[]>([]);
  const [rulesChecked, setRulesChecked] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserEmail(user.email || "");
    });

    fetchContests().then((contests) => {
      console.log("RAW contests:", contests);

      const now = new Date();

      const filtered = contests.filter((c: any) => {
        const sTime = c.start_time || c.startTime;
        const eTime = c.end_time || c.endTime;

        if (!sTime) return false;

        const startTimeStr = sTime.replace(" ", "T");
        const endTimeStr = eTime ? eTime.replace(" ", "T") : "";

        const start = new Date(startTimeStr);
        const end = endTimeStr ? new Date(endTimeStr) : null;

        if (isNaN(start.getTime())) return false;

        // LIVE
        if (start <= now && (!end || end >= now)) return true;

        // UPCOMING
        if (start > now) return true;

        return false;
      });

      console.log("FILTERED:", filtered);

      setLiveContests(filtered);
    });

    return () => unsubscribe();
  }, []);

  const enterContest = (contest: Contest) => {
    setSelectedContest(contest);
  };

  const confirmEnterContest = async () => {
    if (!selectedContest || entering) return;

    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in");
      return;
    }

    const now = new Date();
    const start = new Date((selectedContest.start_time || selectedContest.startTime || "").replace(" ", "T"));

    if (now < start) {
      alert("Contest has not started yet");
      return;
    }

    setEntering(true);

    try {
      // update user
      await updateDoc(doc(db, "users", user.uid), {
        contestsEntered: arrayUnion(selectedContest.id)
      });

      // update contest participants
      await updateDoc(doc(db, "contests", selectedContest.id), {
        registeredParticipants:
          (selectedContest.registeredParticipants || 0) + 1
      });

      // Request fullscreen as this is a user-initiated click
      if (selectedContest.antiCheat?.enabled || selectedContest.anti_cheat?.enabled) {
        document.documentElement.requestFullscreen().catch(() => {
          console.log("Fullscreen request failed in Lobby - will retry in Workspace");
        });
      }

      navigate(`/student/problems?contestId=${selectedContest.id}`);
    } catch (error) {
      console.log(error);
      alert("Error entering contest");
    } finally {
      setEntering(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* USER */}
      <div className="mb-6 text-sm text-slate-500">
        Logged in as{" "}
        <span className="font-semibold text-slate-800">
          {userEmail}
        </span>
      </div>

      {selectedContest ? (
        <>
          {/* HEADER */}
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
              CONTEST DETAILS
            </span>
            <span className="text-slate-400 text-sm">
              {selectedContest.registeredParticipants || 0} participants
            </span>
          </div>

          {/* CARD */}
          <div className="bg-white border p-6 rounded-xl mb-5">
            <h1 className="text-xl font-bold mb-2">
              {selectedContest.name}
            </h1>
            <p className="text-sm text-slate-500 mb-4">
              {selectedContest.description || "No description"}
            </p>

            <div className="flex gap-5 text-sm text-slate-500">
              <span>
                <BookOpen className="inline w-4 h-4" />{" "}
                {selectedContest.problems || 5} Problems
              </span>
              <span>
                <Users className="inline w-4 h-4" />{" "}
                {selectedContest.registeredParticipants || 0}
              </span>
              <span>
                <Trophy className="inline w-4 h-4" /> 1100 pts
              </span>
            </div>
          </div>

          {/* WARNING */}
          {(selectedContest.antiCheat?.enabled || selectedContest.anti_cheat?.enabled) && (
            <div className="bg-amber-50 border p-3 mb-5 rounded">
              <AlertCircle className="inline w-4 h-4 mr-2" />
              Anti-cheat monitoring enabled
            </div>
          )}

          {/* RULES */}
          <div className="bg-white border p-5 rounded-xl">
            <label className="flex gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={rulesChecked}
                onChange={() => setRulesChecked(!rulesChecked)}
              />
              <span className="text-sm">
                I agree to contest rules
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedContest(null)}
                className="flex-1 border px-4 py-2 rounded"
              >
                Back
              </button>

              <button
                onClick={confirmEnterContest}
                disabled={!rulesChecked || entering}
                className={`flex-1 px-4 py-2 rounded ${
                  rulesChecked
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {entering ? "Entering..." : "Enter Contest"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* LIST */}
          {liveContests.length === 0 ? (
            <div className="text-center text-slate-400">
              No contests available
            </div>
          ) : (
            <div className="space-y-4">
              {liveContests.map((contest) => (
                <div
                  key={contest.id}
                  className="bg-white border p-4 rounded flex justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{contest.name}</h3>
                    <p className="text-sm text-slate-500">
                      {contest.description || "No description"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Starts: {(contest.start_time || contest.startTime || "").replace("T", " ")}
                    </p>
                  </div>

                  <button
                    onClick={() => enterContest(contest)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
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