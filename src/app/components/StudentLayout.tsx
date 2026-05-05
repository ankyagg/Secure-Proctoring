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
  refreshUser: () => Promise<void>;
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

  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

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

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",");
    if (user?.email && adminEmails.includes(user.email)) {
      setIsAdmin(true);
      // Automatically disable anti-cheat for admins
      setAntiCheat(null);
    }
  }, [user]);

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
  
  const refreshUser = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (e) {
      console.error("Failed to refresh user:", e);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cid = params.get("contestId");
    if (cid && !isAdmin) {
      fetchContests().then((cs: any[]) => {
        const found = cs.find((x) => String(x.id) === String(cid));
        if (found) {
          setActiveContest(found);
          
          // Calculate time remaining
          const globalEnd = new Date(found.end_time || found.endTime).getTime();
          const now = new Date().getTime();
          
          let remaining = Math.max(0, Math.floor((globalEnd - now) / 1000));

          // Handle individual duration if specified (e.g. "Contest ends in 3hrs for this user")
          if (found.duration && found.duration > 0 && user?.email) {
            const storageKey = `contest_start_${found.id}_${user.email}`;
            let startTimeStr = localStorage.getItem(storageKey);
            
            if (!startTimeStr) {
              startTimeStr = now.toString();
              localStorage.setItem(storageKey, startTimeStr);
            }
            
            const startTime = parseInt(startTimeStr);
            const durationMs = found.duration * 60 * 1000;
            const individualEnd = startTime + durationMs;
            
            // The actual remaining time is the minimum of individual duration and global end time
            const individualRemaining = Math.max(0, Math.floor((individualEnd - now) / 1000));
            remaining = Math.min(remaining, individualRemaining);
          }
          
          setTimeRemaining(remaining);

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
  }, [location.search, isAdmin, user]);

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
  }, [antiCheat?.fullscreen, antiCheat?.enabled, user]);

  const [isDisqualified, setIsDisqualified] = useState(false);
  const [tabViolationCount, setTabViolationCount] = useState(() => {
    const cid = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : "").get("contestId");
    if (!cid) return 0;
    return parseInt(sessionStorage.getItem(`tab_violations_${cid}`) || "0");
  });

  useEffect(() => {
    if (!antiCheat?.tabSwitch || !antiCheat?.enabled || isAdmin) return;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        const newCount = tabViolationCount + 1;
        setTabViolationCount(newCount);
        
        const cid = new URLSearchParams(location.search).get("contestId");
        if (cid) sessionStorage.setItem(`tab_violations_${cid}`, newCount.toString());

        if (newCount > 3) {
          handleDisqualification();
        } else {
          addWarning("TAB_SWITCH", `Warning ${newCount}/3: Do not switch tabs! Your session will be terminated on the next violation.`);
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [antiCheat?.tabSwitch, antiCheat?.enabled, isAdmin, tabViolationCount, location.search]);

  const handleDisqualification = async () => {
    setIsDisqualified(true);
    const cid = new URLSearchParams(location.search).get("contestId");
    if (cid) {
      const pId = sessionStorage.getItem(`active_session_${cid}`);
      if (pId) {
        try {
          const { finishParticipant } = await import("../services/contest");
          await finishParticipant(pId, "disqualified");
          sessionStorage.removeItem(`active_session_${cid}`);
        } catch (e) {
          console.error("Disqualification sync error:", e);
        }
      }
    }
    
    // Auto-exit fullscreen to emphasize the kick
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().catch(console.error);
  };

  useEffect(() => {
    // Revoke all restrictions when returning to lobby or library
    const nonProctorPaths = ["/student/lobby", "/student/problems", "/student/activity", "/student/leaderboard", "/student/settings"];
    const contestIdInUrl = new URLSearchParams(location.search).get("contestId");

    if (nonProctorPaths.includes(location.pathname) && !contestIdInUrl) {
      setAntiCheat(null);
      setWarningCount(0);
      setWatchdogState('happy');
      setProctorStatus('inactive');
      
      // Cleanup lingering sessions
      const cleanup = async () => {
        const keys = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('active_session_')) {
            keys.push(key);
          }
        }

        for (const key of keys) {
          const pId = sessionStorage.getItem(key);
          if (pId) {
            try {
              const { finishParticipant } = await import("../services/contest");
              await finishParticipant(pId);
              sessionStorage.removeItem(key);
            } catch (e) {
              console.error("Layout cleanup error:", e);
            }
          }
        }
      };
      cleanup();

      // Stop webcam tracks if they exist
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [location.pathname, location.search, webcamStream]);

  const memoizedContextValue = {
    timeRemaining,
    warningCount,
    addWarning,
    currentUser: user ? { 
      username: user.name || user.email.split('@')[0], 
      email: user.email, 
      id: user.$id,
      avatar: user.prefs?.avatar || null
    } : { username: "node" },
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
    setProctorStatus,
    refreshUser
  };

  const [isExiting, setIsExiting] = useState(false);

  const handleLogout = async () => {
    setIsExiting(true);
    setTimeout(async () => {
      try {
        await account.deleteSession('current');
        navigate("/");
      } catch (e) {
        setIsExiting(false);
      }
    }, 800);
  };

  const isWorkspace = location.pathname.includes("/workspace");

  return (
    <StudentContext.Provider value={memoizedContextValue}>
      <div className="h-screen bg-transparent flex flex-col text-white font-sans selection:bg-[#0099ff]/30 overflow-hidden relative">
        
        {/* Logout/Exit Overlay */}
        <AnimatePresence>
          {isExiting && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center gap-6"
            >
              <div className="w-10 h-10 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.3em]">Securing Session...</span>
            </motion.div>
          )}
        </AnimatePresence>
        
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
                  <h2 className="text-4xl font-semibold text-white tracking-tight uppercase leading-none">Security Required</h2>
                  <p className="text-[#525252] text-sm font-semibold uppercase tracking-widest">
                    This test requires fullscreen mode. Please click the button below to start.
                  </p>
                </div>
                <button
                  onClick={enterFullscreen}
                  className="px-12 py-6 bg-[#0099ff] text-white font-semibold text-[11px] uppercase tracking-wider rounded-[1.5rem] hover:bg-white hover:text-black transition-all shadow-[0_20px_50px_-10px_rgba(0,153,255,0.4)] active:scale-95"
                >
                  Enter Fullscreen
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disqualification Lockout Overlay */}
        <AnimatePresence>
          {isDisqualified && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[10001] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-xl space-y-12"
              >
                <div className="w-24 h-24 bg-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(244,63,94,0.4)]">
                  <XCircle className="w-12 h-12 text-white animate-pulse" />
                </div>
                <div className="space-y-6">
                  <h2 className="text-4xl font-semibold text-white tracking-tight uppercase leading-none">System Lockout</h2>
                  <div className="space-y-2">
                    <p className="text-rose-400 text-sm font-bold uppercase tracking-widest">Disqualified: Multiple Tab Switches</p>
                    <p className="text-[#525252] text-xs font-medium leading-relaxed max-w-sm mx-auto">
                      You have exceeded the maximum of 3 allowed tab switches for this contest. Your session has been terminated and flagged for administrator review.
                    </p>
                  </div>
                </div>
                <div className="pt-8">
                  <button
                    onClick={() => navigate("/student/lobby")}
                    className="px-12 py-5 bg-white text-black font-bold text-[10px] uppercase tracking-wider rounded-[1.5rem] hover:bg-[#0099ff] hover:text-white transition-all active:scale-95 shadow-2xl"
                  >
                    Return to Lobby
                  </button>
                </div>
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
                <span className="text-[9px] font-semibold uppercase tracking-wider mb-1 opacity-50">Security Alert</span>
                <p className="text-sm font-semibold tracking-tight leading-none">
                  {proctorReason}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Toolbar */}
        {!isWorkspace && (
          <header className="flex items-center justify-between px-8 py-3.5 border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-[100]">
            <div className="max-w-[90rem] mx-auto w-full flex items-center justify-between relative">
              <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-[#0099ff] rounded-[1rem] flex items-center justify-center shadow-[0_0_20px_rgba(0,153,255,0.3)] group-hover:rotate-12 transition-all duration-500">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-[15px] tracking-tight font-semibold leading-none uppercase">
                      Secure<span className="text-[#0099ff]">Proctor</span>
                    </span>
                    <div className="flex items-center gap-2 mt-1.5 overflow-hidden w-48 relative border-l border-white/5 pl-3">
                      <motion.div 
                        animate={{ x: [0, -460] }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                        className="flex items-center gap-8 whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.2em]"
                      >
                        <div className="flex items-center gap-8">
                          <span className="flex items-center gap-2 text-[#0099ff]">
                            <div className="w-1 h-1 bg-[#0099ff] rounded-full shadow-[0_0_8px_#0099ff]" />
                            System Encrypted
                          </span>
                          <span className="text-[#333333]">Active_Guard: v4.2</span>
                          <span className="text-[#0099ff]">Neural_Shield: Active</span>
                          <span className="text-[#333333]">VOID_PROTOCOL_STABLE</span>
                        </div>
                        <div className="flex items-center gap-8">
                          <span className="flex items-center gap-2 text-[#0099ff]">
                            <div className="w-1 h-1 bg-[#0099ff] rounded-full shadow-[0_0_8px_#0099ff]" />
                            System Encrypted
                          </span>
                          <span className="text-[#333333]">Active_Guard: v4.2</span>
                          <span className="text-[#0099ff]">Neural_Shield: Active</span>
                          <span className="text-[#333333]">VOID_PROTOCOL_STABLE</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </Link>

                <div className="h-8 w-px bg-white/5 hidden md:block" />
                {!location.search.includes("contestId") && (
                  <div className="hidden md:flex items-center gap-8  ">
                    {[
                      { name: "Active Contests", path: "/student/lobby" },
                      { name: "Library", path: "/student/problems" },
                      { name: "Recent Activity", path: "/student/activity" },
                      { name: "Leaderboard", path: "/student/leaderboard" },
                      { name: "Settings", path: "/student/settings" }
                    ].map((item) => (
                      <Link 
                        key={item.path}
                        to={item.path} 
                        className={`text-[12px] font-bold uppercase tracking-wider transition-colors ${location.pathname === item.path ? "text-[#0099ff]" : "text-[#525252] hover:text-white"}`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">

                {location.search.includes("contestId") && (
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 px-5 py-2 rounded-xl bg-[#0099ff]/5 border border-[#0099ff]/10 text-[#0099ff]">
                      <div className="w-1.5 h-1.5 bg-[#0099ff] rounded-full animate-ping" />
                      <span className="text-[9px] font-semibold uppercase tracking-wider">Anti-Cheat</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[#525252]">
                        <Clock className="w-3.5 h-3.5 text-[#0099ff]" />
                        <span className="text-[10px] font-semibold tabular-nums tracking-widest">{formatTime(timeRemaining)}</span>
                      </div>
                      {warningCount > 0 && (
                        <div className="flex items-center gap-3 px-5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-semibold">{warningCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!location.search.includes("contestId") && (
                  <>
                    <div className="h-8 w-px bg-white/5" />

                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-white font-semibold text-xs shadow-2xl overflow-hidden group/avatar relative">
                        {user?.prefs?.avatar ? (
                          <img 
                            key={user.prefs.avatar}
                            src={`${user.prefs.avatar}${user.prefs.avatar.includes('?') ? '&' : '?'}v=${new Date().getTime()}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" 
                            alt="Profile" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#0099ff]/20 to-black flex items-center justify-center">
                            <span className="tracking-tighter">{user?.name ? user.name.substring(0, 2).toUpperCase() : (user?.email ? user.email.substring(0, 2).toUpperCase() : "??")}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[#0099ff]/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                      </div>
                      <button onClick={handleLogout} className="p-3 text-[#2a2a2a] hover:text-white transition-colors">
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 relative flex flex-col overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {antiCheat?.enabled && <AIProctor />}

        <AnimatePresence>
          {antiCheat?.webcam && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-12 right-12 z-[100]"
            >
              <div className="relative p-2 rounded-[2.5rem] bg-black border border-white/10 shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden group">
                <WebcamPreview username={user?.name || "node"} className="w-64 h-40 rounded-[2rem] overflow-hidden group-hover:scale-105 transition-all duration-700" />
                <div className="absolute top-6 left-6 flex items-center gap-3 px-4 py-2 rounded-full bg-black/80 border border-white/10 backdrop-blur-xl">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_#f43f5e]" />
                  <span className="text-[9px] font-semibold text-white uppercase tracking-wider">Live Monitoring</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StudentContext.Provider>
  );
}
