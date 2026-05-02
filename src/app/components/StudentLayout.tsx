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
  ShieldCheck,
  ChevronLeft,
  Binary,
  Target,
  Shield
} from "lucide-react";
import { account, databases, APPWRITE_DB_ID } from "../services/appwrite";
import { fetchContests } from "../services/contest";
import AIProctor from "./AIProctor";
import { motion, AnimatePresence } from "framer-motion";
import { ID } from "appwrite";

type AntiCheatSettings = {
  enabled: boolean;
  fullscreen: boolean;
  tabSwitch: boolean;
  webcam: boolean;
  faceDetection: boolean;
} | null;

interface StudentContextType {
  timeRemaining: number;
  warningCount: number;
  addWarning: (type?: string, message?: string, screenshot?: string | null) => void;
  currentUser: { username: string; email?: string; avatar?: string; id?: string };
  antiCheat: AntiCheatSettings;
  currentCode: string;
  setCurrentCode: (code: string) => void;
  webcamStream: MediaStream | null;
  watchdogState: 'happy' | 'suspicious' | 'angry';
  setWatchdogState: (state: 'happy' | 'suspicious' | 'angry') => void;
  proctorReason: string;
  setProctorReason: (reason: string) => void;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
  proctorStatus: 'inactive' | 'active' | 'error';
  setProctorStatus: (status: 'inactive' | 'active' | 'error') => void;
}

export const StudentContext = createContext<StudentContextType>({
  timeRemaining: 6332,
  warningCount: 0,
  addWarning: () => {},
  currentUser: { username: "node" },
  antiCheat: null,
  currentCode: "",
  setCurrentCode: () => {},
  webcamStream: null,
  watchdogState: 'happy',
  setWatchdogState: () => {},
  proctorReason: 'Anti-Cheat Active',
  setProctorReason: () => {},
  voiceActive: false,
  setVoiceActive: () => {},
  proctorStatus: 'inactive',
  setProctorStatus: () => {},
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
  const [warningCount, setWarningCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [activeContest, setActiveContest] = useState<any>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  
  const [watchdogState, setWatchdogState] = useState<'happy' | 'suspicious' | 'angry'>('happy');
  const [proctorReason, setProctorReason] = useState('Anti-Cheat Active');
  const [proctorStatus, setProctorStatus] = useState<'inactive' | 'active' | 'error'>('inactive');
  const [voiceActive, setVoiceActive] = useState(false);
  const [currentCode, setCurrentCode] = useState("");

  const [antiCheat, setAntiCheat] = useState<AntiCheatSettings | null>(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : "");
    if (params.get("contestId")) {
      return {
        enabled: true,
        fullscreen: true,
        tabSwitch: true,
        webcam: true,
        faceDetection: true
      };
    }
    return null;
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const session = await account.get();
        setUser(session);
      } catch (e) {
        navigate("/login");
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cid = params.get("contestId");
    if (cid) {
      fetchContests().then((cs: any[]) => {
        const found = cs.find((x) => String(x.id) === String(cid));
        if (found) {
          setActiveContest(found);
          const config = found.antiCheat || found.anti_cheat;
          if (config && typeof config === "object") {
            setAntiCheat({
              enabled: !!config.enabled,
              fullscreen: config.fullscreen ?? true,
              tabSwitch: config.tabSwitch ?? true,
              webcam: config.webcam ?? true,
              faceDetection: config.faceDetection ?? true
            });
          }
        }
      });
    }
  }, [location.search]);

  useEffect(() => {
    if ((antiCheat?.webcam || antiCheat?.faceDetection) && !webcamStream) {
      navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: false 
      }).then(setWebcamStream).catch(console.error);
    }
  }, [antiCheat?.webcam, webcamStream]);

  const addWarning = async (type: string = "general", message: string = "Suspicious behavior detected", screenshot: string | null = null) => {
    setWarningCount((w) => w + 1);
    
    // Log to Appwrite proctor_logs
    if (user) {
      const contestId = new URLSearchParams(location.search).get("contestId") || "none";
      try {
        await databases.createDocument(APPWRITE_DB_ID, "proctor_logs", ID.unique(), {
          user_id: user.$id,
          user_email: user.email,
          user_name: user.name || user.email.split('@')[0] || "Student",
          contest_id: contestId,
          type: type.toUpperCase(),
          message: message,
          timestamp: new Date().toISOString(),
          screenshot_url: screenshot
        });
      } catch (err) {
        console.error("Failed to log proctor violation:", err);
      }
    }
  };

  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);

  useEffect(() => {
    if (!antiCheat?.fullscreen) {
      setShowFullscreenPrompt(false);
      return;
    }

    const checkFs = () => {
      const isFs = !!document.fullscreenElement;
      setShowFullscreenPrompt(!isFs);
      if (!isFs && antiCheat.enabled) {
        addWarning("FULLSCREEN_EXIT", "User exited fullscreen mode");
      }
    };

    document.addEventListener("fullscreenchange", checkFs);
    if (!document.fullscreenElement) setShowFullscreenPrompt(true);
    return () => document.removeEventListener("fullscreenchange", checkFs);
  }, [antiCheat?.fullscreen, antiCheat?.enabled, user, currentCode]);

  useEffect(() => {
    if (!antiCheat?.tabSwitch || !antiCheat?.enabled) return;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        addWarning("TAB_SWITCH", "User switched tabs or minimized browser");
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [antiCheat?.tabSwitch, antiCheat?.enabled, user, currentCode]);

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().catch(console.error);
  };

  const isWorkspace = location.pathname.includes("/workspace");

  return (
    <StudentContext.Provider
      value={{ 
        timeRemaining, 
        warningCount, 
        addWarning, 
        currentUser: user ? { username: user.name || user.email.split('@')[0], email: user.email, id: user.$id } : { username: "node" }, 
        antiCheat,
        currentCode,
        setCurrentCode,
        webcamStream,
        watchdogState,
        setWatchdogState,
        proctorReason,
        setProctorReason,
        voiceActive,
        setVoiceActive,
        proctorStatus,
        setProctorStatus
      }}
    >
      <div className="h-screen bg-[#000000] flex flex-col text-white font-sans selection:bg-[#0099ff]/30 overflow-hidden">
        
        {/* Background Ambience */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0099ff]/[0.02] blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#0099ff]/[0.01] blur-[120px] rounded-full" />
        </div>

        {/* Security Overlay */}
        <AnimatePresence>
          {showFullscreenPrompt && antiCheat?.fullscreen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-xl space-y-12"
              >
                <div className="w-24 h-24 bg-white border border-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl">
                  <ShieldCheck className="w-12 h-12 text-black" />
                </div>
                <div className="space-y-6">
                  <h2 className="text-5xl font-black text-white tracking-[-0.05em] uppercase leading-none">Security Required</h2>
                    This test requires fullscreen mode. Please click the button below to start.
                </div>
                <button
                  onClick={enterFullscreen}
                  className="px-12 py-6 bg-[#0099ff] text-white font-black text-[11px] uppercase tracking-[0.4em] rounded-[1.5rem] hover:bg-white hover:text-black transition-all shadow-[0_20px_50px_-10px_rgba(0,153,255,0.4)] active:scale-95"
                >
                  Enter Fullscreen
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Violation Warning */}
        <AnimatePresence>
          {(watchdogState === 'suspicious' || watchdogState === 'angry') && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className={`fixed top-12 left-1/2 z-[100] px-10 py-6 rounded-[2rem] border backdrop-blur-3xl flex items-center gap-6 shadow-2xl transition-colors duration-700 ${
                watchdogState === 'angry' ? 'bg-rose-500/20 border-rose-500/30 text-rose-500' : 'bg-amber-500/20 border-amber-500/30 text-amber-500'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] mb-1 opacity-50">Security Alert</span>
                <p className="text-sm font-black uppercase tracking-widest leading-none">
                  {watchdogState === 'angry' ? "Please look back at the screen!" : "Please focus on the screen."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Toolbar */}
        <header className="h-24 sticky top-0 z-50 flex items-center justify-between px-12 border-b border-white/5 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-10">
            <Link to="/student/lobby" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                <Code2 className="w-6 h-6 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-[11px] font-black tracking-[0.4em] uppercase leading-none mb-1.5">Proctor</span>
                <span className="text-[9px] text-[#525252] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0099ff] rounded-full shadow-[0_0_8px_rgba(0,153,255,1)] animate-pulse" />
                  System Online
                </span>
              </div>
            </Link>

            <div className="h-8 w-px bg-white/5 hidden md:block" />

            <div className="hidden md:flex items-center gap-10">
              {[
                { to: "/student/problems", label: "Library", icon: LayoutList },
                { to: "/student/leaderboard", label: "Rankings", icon: Trophy }
              ].map((item) => {
                const isActive = location.pathname.includes(item.to);
                return (
                  <Link
                    key={item.to}
                    to={`${item.to}${location.search}`}
                    className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${isActive ? "text-[#0099ff]" : "text-[#525252] hover:text-white"}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#0099ff]/5 border border-[#0099ff]/10 text-[#0099ff]">
               <div className="w-2 h-2 bg-[#0099ff] rounded-full animate-ping" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Anti-Cheat</span>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-[#525252]">
                 <Clock className="w-4 h-4 text-[#0099ff]" />
                 <span className="text-[11px] font-black tabular-nums tracking-widest">{formatTime(timeRemaining)}</span>
               </div>
               {warningCount > 0 && (
                 <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-pulse">
                   <AlertTriangle className="w-4 h-4" />
                   <span className="text-[11px] font-black">{warningCount}</span>
                 </div>
               )}
            </div>

            <div className="h-8 w-px bg-white/5" />

            <div className="flex items-center gap-6">
               <div className="w-12 h-12 rounded-2xl bg-white border border-white/10 flex items-center justify-center text-black font-black text-xs shadow-2xl">
                 {user?.name?.substring(0, 2).toUpperCase() || "??"}
               </div>
               <button onClick={async () => { await account.deleteSession('current'); navigate("/"); }} className="p-3 text-[#2a2a2a] hover:text-white transition-colors">
                 <LogOut className="w-5 h-5" />
               </button>
            </div>
          </div>
        </header>

        <main className="flex-1 relative flex flex-col overflow-y-auto">
          <Outlet />
        </main>

        <AIProctor />

        <AnimatePresence>
          {antiCheat?.webcam && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed bottom-12 right-12 z-[100]"
            >
              <div className="relative p-2 rounded-[2.5rem] bg-black border border-white/10 shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden group">
                <WebcamPreview username={user?.name || "node"} className="w-64 h-40 rounded-[2rem] overflow-hidden group-hover:scale-105 transition-all duration-700" />
                <div className="absolute top-6 left-6 flex items-center gap-3 px-4 py-2 rounded-full bg-black/80 border border-white/10 backdrop-blur-xl">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_#f43f5e]" />
                  <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Live Monitoring</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StudentContext.Provider>
  );
}
