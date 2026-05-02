import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Shield, ChevronRight, Trophy, Zap, Globe, Lock, Cpu, Activity, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { BackgroundRippleEffect } from "../components/ui/background-ripple-effect";
import { databases, APPWRITE_DB_ID } from "../services/appwrite";

export default function Landing() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    questions: "87",
    contests: "12",
    submissions: "4.2k",
    users: "1,284"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [qs, cs, subs] = await Promise.all([
          databases.listDocuments(APPWRITE_DB_ID, "questions"),
          databases.listDocuments(APPWRITE_DB_ID, "contests"),
          databases.listDocuments(APPWRITE_DB_ID, "submissions"),
        ]);
        setStats({
          questions: qs.total.toLocaleString(),
          contests: cs.total.toLocaleString(),
          submissions: subs.total.toLocaleString(),
          users: "1.2k+" // Mocked for now or can derive from unique emails
        });
      } catch (err) {
        console.error("Stats sync failed:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-[#0099ff]/30 overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <BackgroundRippleEffect />
      </div>

      {/* Glass Navigation */}
      <header className="px-8 py-8 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-3xl sticky top-0 z-[100]">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-12 h-12 bg-[#0099ff] rounded-[1.25rem] flex items-center justify-center shadow-[0_0_30px_rgba(0,153,255,0.4)] group-hover:rotate-12 transition-all duration-500">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-2xl tracking-tight font-semibold leading-none uppercase">
              Secure<span className="text-[#0099ff]">Proctor</span>
            </span>
            <span className="text-[9px] text-[#525252] font-semibold uppercase tracking-wider mt-1">Global Security Standard</span>
          </div>
        </motion.div>

        <div className="flex items-center gap-10">
          <nav className="hidden md:flex items-center gap-10 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#integrity" className="hover:text-white transition-colors">Anti-Cheat</a>
            <a href="#stats" className="hover:text-white transition-colors">Activity</a>
          </nav>
          <button
            onClick={() => navigate("/login")}
            className="text-[10px] font-semibold uppercase tracking-wider text-white bg-white/5 border border-white/10 hover:bg-[#0099ff] hover:border-[#0099ff] rounded-2xl px-10 py-4 transition-all active:scale-95 shadow-2xl"
          >
            Login System
          </button>
        </div>
      </header>

      {/* Hero: The Void Aesthetic */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-40 relative z-10">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[-1]">
          <div className="w-[800px] h-[800px] bg-[#0099ff]/5 rounded-full blur-[150px] animate-pulse" />
        </div>

        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-32 max-w-5xl"
        >
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/5 rounded-full px-6 py-2.5 text-[9px] font-semibold text-[#0099ff] uppercase tracking-wider mb-12">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0099ff] animate-ping" />
            <span>Deployment v4.0.2 Active</span>
          </div>

          <h1 className="text-4xl md:text-[140px] font-semibold text-white mb-10 tracking-tight leading-[0.85] text-balance uppercase">
            Code with <br />
            <span className="text-[#0099ff] italic">Absolute</span> Zero.
          </h1>

          <p className="text-[#525252] max-w-3xl mx-auto text-xl md:text-2xl font-medium leading-relaxed mb-16 tracking-tight text-balance">
            The world's most sophisticated proctoring engine. Zero latency. Zero compromise. Zero cheating. Built for the elite.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="group relative flex items-center justify-center gap-4 text-white bg-[#0099ff] hover:bg-white hover:text-black rounded-[2rem] px-14 py-7 text-[11px] font-semibold uppercase tracking-wider shadow-[0_0_50px_rgba(0,153,255,0.3)] transition-all duration-500 active:scale-95"
            >
              Start Testing
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-[2rem] px-14 py-7 text-[11px] font-semibold uppercase tracking-wider transition-all backdrop-blur-3xl"
            >
              About Us
            </button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl px-4">
          
          <motion.div 
            whileHover={{ y: -12 }}
            className="group relative bg-[#090909] border border-white/5 rounded-[3rem] p-12 overflow-hidden shadow-2xl transition-all duration-700"
          >
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-20 transition-opacity">
              <Cpu className="w-32 h-32 text-[#0099ff]" />
            </div>
            <div className="w-20 h-20 bg-[#0099ff]/10 border border-[#0099ff]/20 rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(0,153,255,0.15)] group-hover:scale-110 transition-transform duration-500">
              <Trophy className="w-8 h-8 text-[#0099ff]" />
            </div>
            <h2 className="text-4xl font-semibold text-white mb-6 tracking-tight uppercase">For Candidates</h2>
              Access the coding platform. High-quality editor, real-time feedback, and world-class problem sets.
            <button
              onClick={() => navigate("/signup")}
              className="w-full flex items-center justify-center gap-3 text-white bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl py-5 text-[10px] font-semibold uppercase tracking-wider transition-all"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -12 }}
            className="group relative bg-[#090909] border border-white/5 rounded-[3rem] p-12 overflow-hidden shadow-2xl transition-all duration-700"
          >
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-20 transition-opacity">
              <Lock className="w-32 h-32 text-white" />
            </div>
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-semibold text-white mb-6 tracking-tight uppercase">For Commands</h2>
              Create and manage contests. AI-driven gaze tracking, real-time monitoring, and detailed reports.
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center justify-center gap-3 text-white bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl py-5 text-[10px] font-semibold uppercase tracking-wider transition-all"
            >
              Admin Login
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Global Telemetry Stats */}
        <div className="mt-48 w-full max-w-6xl border-t border-white/5 pt-24 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
            {[
              { label: "Global Contests", value: stats.contests, icon: Globe },
              { label: "Active Users", value: stats.users, icon: Activity },
              { label: "Total Submissions", value: stats.submissions, icon: Layers },
              { label: "Coding Problems", value: stats.questions, icon: Cpu },
            ].map((stat) => (
              <div key={stat.label} className="text-center group cursor-default">
                <div className="flex justify-center mb-6">
                  <stat.icon className="w-5 h-5 text-[#2a2a2a] group-hover:text-[#0099ff] transition-colors duration-500" />
                </div>
                <div className="text-4xl font-semibold text-white mb-4 tracking-tight group-hover:scale-110 transition-transform duration-700">
                  {stat.value}
                </div>
                <div className="text-[10px] text-[#525252] font-semibold uppercase tracking-wider group-hover:text-white transition-colors">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Minimalist Footer */}
      <footer className="px-12 py-16 flex flex-col md:flex-row items-center justify-between border-t border-white/5 bg-[#000000] relative z-10">
        <div className="flex items-center gap-5 opacity-40">
          <Shield className="w-5 h-5 text-white" />
          <span className="text-white text-[9px] font-semibold uppercase tracking-wider">
            © 2026 Void Protocol · Secure Proctoring System
          </span>
        </div>
        <div className="flex gap-12 text-[9px] text-[#525252] font-semibold uppercase tracking-wider mt-8 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
          <a href="#" className="hover:text-white transition-colors">Manifesto</a>
        </div>
      </footer>
    </div>
  );
}