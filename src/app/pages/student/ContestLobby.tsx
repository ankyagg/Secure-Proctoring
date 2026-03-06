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
import { contest } from "../../data/mockData";

export default function ContestLobby() {
  const navigate = useNavigate();

  const [rulesChecked, setRulesChecked] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email || "");
      }
    });

    return () => unsubscribe();
  }, []);

  const enterContest = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        contestsEntered: arrayUnion(contest.name)
      });

      navigate("/student/problems");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* USER INFO */}
      <div className="mb-6 text-sm text-slate-500">
        Logged in as{" "}
        <span className="font-semibold text-slate-800">
          {userEmail}
        </span>
      </div>

      {/* LIVE STATUS */}
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          LIVE NOW
        </span>

        <span className="text-slate-400 text-sm">
          {contest.registeredParticipants} participants online
        </span>
      </div>

      {/* CONTEST CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-7 mb-5">
        <h1 className="text-slate-900 mb-2 font-bold text-2xl">
          {contest.name}
        </h1>

        <p className="text-slate-500 mb-6">{contest.description}</p>

        <div className="flex items-center gap-6 pt-5 border-t border-slate-100">

          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span><strong>5</strong> Problems</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Users className="w-4 h-4 text-blue-500" />
            <span><strong>{contest.registeredParticipants}</strong> Participants</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Trophy className="w-4 h-4 text-blue-500" />
            <span><strong>1100</strong> Max Points</span>
          </div>

        </div>
      </div>

      {/* WARNING */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600" />
        <p className="text-amber-700 text-sm">
          This contest uses active anti-cheat monitoring including webcam and tab tracking.
        </p>
      </div>

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

          <div className="flex flex-col items-center text-xs bg-slate-50 text-slate-500 p-3 rounded-lg">
            <Monitor className="w-5 h-5"/>
            Fullscreen Mode
          </div>

          <div className="flex flex-col items-center text-xs bg-green-50 text-green-700 p-3 rounded-lg">
            <Shield className="w-5 h-5"/>
            Anti-Cheat Active
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

        <button
          onClick={enterContest}
          disabled={!rulesChecked}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm ${
            rulesChecked
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          Enter Contest
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}