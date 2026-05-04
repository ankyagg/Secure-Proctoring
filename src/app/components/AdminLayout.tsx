import { Outlet, useLocation, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Trophy,
  HelpCircle,
  Send,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Bell,
  Settings,
  Sun,
  Moon,
  Command,
  BookOpen,
  BarChart3,
  Menu,
  ChevronLeft,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { account } from "../services/appwrite";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Questions", path: "/admin/questions", icon: BookOpen },
  { name: "Contests", path: "/admin/contests", icon: Trophy },
  { name: "Anti-Cheat", path: "/admin/anticheat", icon: ShieldAlert },
  { name: "Submissions", path: "/admin/submissions", icon: BarChart3 },
];

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [userName, setUserName] = useState("ADMINISTRATOR");
  const [userInitials, setUserInitials] = useState("AD");

  const [loading, setLoading] = useState(true);
  const admins = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await account.get();
        if (admins.includes(user.email)) {
          setUserName(user.name.toUpperCase());
          const initials = user.name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase();
          setUserInitials(initials.slice(0, 2));
        } else {
          navigate("/admin/login");
        }
      } catch (e) {
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

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

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="w-10 h-10 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.3em]">Authenticating Terminal...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-transparent text-white font-sans selection:bg-[#0099ff]/30 overflow-hidden relative">
      
      {/* Exit Overlay */}
      <AnimatePresence>
        {isExiting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center gap-6"
          >
            <div className="w-10 h-10 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.3em]">Exiting Admin Terminal...</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 100 : 280 }}
        className="relative flex flex-col bg-black/70 backdrop-blur-2xl border-r border-white/5 z-50 shadow-[20px_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out"
      >
        {/* Brand Section */}
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-[#0099ff] rounded-[1rem] flex items-center justify-center shadow-[0_0_20px_rgba(0,153,255,0.4)] group-hover:rotate-12 transition-all duration-500">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-white text-[15px] tracking-tight font-semibold leading-none uppercase">
                  Secure<span className="text-[#0099ff]">Proctor</span>
                </span>
                <span className="text-[9px] font-bold text-[#525252] uppercase tracking-wider mt-1.5">Admin v4.0</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all group ${
                  isActive
                    ? "bg-[#0099ff] text-white shadow-[0_10px_20px_rgba(0,153,255,0.3)]"
                    : "text-[#525252] hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#525252]'}`} />
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1"
                  >
                    {item.name}
                  </motion.span>
                )}
                {isActive && !isCollapsed && <ChevronRight className="w-3 h-3 opacity-50" />}
              </Link>
            );
          })}
        </nav>
        
        {/* Toggle Collapse */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-28 w-6 h-6 bg-[#0099ff] rounded-full flex items-center justify-center border border-black shadow-xl z-50 text-white hover:scale-110 transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        <div className="px-4 py-6 border-t border-white/5">
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider text-[#525252] hover:text-white hover:bg-white/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                {!isCollapsed && <span>Exit Admin</span>}
              </button>
        </div>

      </motion.aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="bg-black/40 backdrop-blur-xl border-b border-white/5 px-10 flex items-center justify-between h-24 z-40">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-white tracking-tight uppercase leading-none">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Admin Core'}
            </h1>
            <p className="text-[9px] font-bold text-[#525252] uppercase tracking-wider mt-2">Administrative Control Panel</p>
          </div>
          
          <div className="flex items-center gap-6">

            <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-1.5 rounded-2xl">
              <button className="p-2.5 rounded-xl hover:bg-white/5 text-[#525252] hover:text-white transition-all">
                <Bell className="w-4 h-4" />
              </button>
              <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-white/5 text-[#525252] hover:text-white transition-all">
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button className="p-2.5 rounded-xl hover:bg-white/5 text-[#525252] hover:text-white transition-all">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <div className="h-10 w-px bg-white/5" />

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-semibold text-white uppercase tracking-tighter">{userName}</span>
                 <span className="text-[8px] font-bold text-[#0099ff] uppercase tracking-wider">Administrator</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-white/10 flex items-center justify-center shadow-2xl">
                <span className="font-semibold text-black text-[10px]">{userInitials}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto relative custom-scrollbar bg-transparent">
          <div className="p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}