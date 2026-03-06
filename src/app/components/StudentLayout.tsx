import { useState, useEffect, createContext, useContext } from "react";
import WebcamPreview from "./WebcamPreview";
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import {
  Code2,
  AlertTriangle,
  Clock,
  LayoutList,
  Trophy,
  LogOut,
  Eye,
} from "lucide-react";
import { contest } from "../data/mockData";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface StudentContextType {
  timeRemaining: number;
  warningCount: number;
  addWarning: () => void;
  currentUser: { username: string; avatar?: string };
}

export const StudentContext = createContext<StudentContextType>({
  timeRemaining: 6332,
  warningCount: 1,
  addWarning: () => {},
  currentUser: { username: "user" },
});

export function useStudentContext() {
  return useContext(StudentContext);
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [timeRemaining, setTimeRemaining] = useState(6332);
  const [warningCount, setWarningCount] = useState(1);
  const [username, setUsername] = useState("user");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        const name = user.email.split("@")[0];
        setUsername(name);
      }
    });

    return () => unsubscribe();
  }, []);

  const addWarning = () => setWarningCount((w) => w + 1);

  const isWorkspace = location.pathname.includes("/workspace");

  const timerColor =
    timeRemaining < 600
      ? "text-red-600"
      : timeRemaining < 1800
      ? "text-amber-600"
      : "text-slate-700";

  const timerBg =
    timeRemaining < 600
      ? "bg-red-50 border-red-200"
      : timeRemaining < 1800
      ? "bg-amber-50 border-amber-200"
      : "bg-slate-50 border-slate-200";

  const avatarLetters = username.substring(0, 2).toUpperCase();

  return (
    <StudentContext.Provider
      value={{ timeRemaining, warningCount, addWarning, currentUser: { username } }}
    >
      <div className="min-h-screen bg-slate-50 flex flex-col">

        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-5 py-0 flex items-center justify-between h-14 sticky top-0 z-40">

          {/* Left */}
          <div className="flex items-center gap-4">
            <Link to="/student/lobby" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-800 hidden sm:block" style={{ fontWeight: 600 }}>
                CodeArena
              </span>
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <span className="text-slate-600 text-sm hidden md:block truncate max-w-56">
              {contest.shortName}
            </span>
          </div>

          {/* Center Nav */}
          {!isWorkspace && (
            <nav className="hidden md:flex items-center gap-1">

              <Link
                to="/student/problems"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                  location.pathname === "/student/problems"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <LayoutList className="w-4 h-4" />
                Problems
              </Link>

              <Link
                to="/student/leaderboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                  location.pathname === "/student/leaderboard"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Link>

            </nav>
          )}

          {/* Right */}
          <div className="flex items-center gap-2.5">

            {/* Timer */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm ${timerBg} ${timerColor}`}>
              <Clock className="w-3.5 h-3.5" />
              <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
                {formatTime(timeRemaining)}
              </span>
            </div>

            {/* Warning */}
            {warningCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{warningCount}</span>
              </div>
            )}

            {/* Webcam Indicator */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs">
              <Eye className="w-3 h-3" />
              <span className="hidden sm:block">Live</span>
            </div>

            {/* User */}
            <div className="hidden sm:flex items-center gap-2 pl-2">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                {avatarLetters}
              </div>

              <span className="text-sm text-slate-700 hidden lg:block">
                {username}
              </span>
            </div>

            {/* Exit */}
            <button
              onClick={() => navigate("/")}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              title="Exit Contest"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* Webcam */}
        <WebcamPreview username={username} />

      </div>
    </StudentContext.Provider>
  );
}