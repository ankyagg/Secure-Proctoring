import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { account } from "../../services/appwrite";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Lock, Mail, ChevronLeft, Binary, Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        await account.getSession('current');
        navigate("/student/lobby");
      } catch (error) {
        // No session, stay on login page
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await account.createEmailPasswordSession(email, password);
      navigate("/student/lobby");
    } catch (error: any) {
      if (error.code === 401 && error.type === 'user_session_already_exists') {
        // User is already logged in, just redirect
        navigate("/student/lobby");
      } else {
        alert(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-transparent text-white selection:bg-[#0099ff]/30 overflow-hidden font-sans"
    >
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0099ff]/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        
        {/* Navigation */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-12 left-12 flex items-center gap-4 cursor-pointer group z-50"
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

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl bg-[#090909] border border-white/5 rounded-[4rem] p-16 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#0099ff]/50 to-transparent" />
          
          <div className="text-center space-y-10 mb-16">
            <div className="flex justify-center">
               <div className="w-24 h-24 bg-white border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">
                  <Shield className="w-12 h-12 text-black" />
               </div>
            </div>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-semibold text-[#0099ff] uppercase tracking-wider">
                 <Binary className="w-3 h-3" />
                 Secure Login
              </div>
              <h2 className="text-4xl font-semibold text-white tracking-tight uppercase leading-none">
                Welcome <span className="text-[#0099ff]">Back.</span>
              </h2>
              <p className="text-[#525252] text-[10px] font-semibold uppercase tracking-wider">
                Sign in to access your dashboard.
              </p>
            </div>
          </div>

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="space-y-4">
              <label className="text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-wider ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a2a2a] group-focus-within:text-[#0099ff] transition-colors" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-[#000000] border border-white/5 rounded-3xl text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-[#0099ff]/50 transition-all font-semibold text-[11px] tracking-wider"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-wider">Password</label>
                <button type="button" className="text-[9px] font-semibold text-[#0099ff] uppercase tracking-wider hover:text-white transition-colors">Forgot?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a2a2a] group-focus-within:text-[#0099ff] transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-[#000000] border border-white/5 rounded-3xl text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-[#0099ff]/50 transition-all font-semibold text-[11px] uppercase tracking-wider"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 px-8 bg-[#0099ff] hover:bg-white text-white hover:text-black rounded-3xl text-[11px] font-semibold uppercase tracking-wider shadow-[0_20px_50px_-10px_rgba(0,153,255,0.4)] transition-all duration-500 flex items-center justify-center gap-3 group disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? "Logging In..." : "Sign In"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-16 text-center">
            <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-[#0099ff] hover:text-white transition-colors"
              >
                Create Account
              </button>
            </p>
          </div>
        </motion.div>

        <div className="mt-12 flex items-center gap-4 opacity-20">
           <div className="h-px w-12 bg-white/50" />
           <Shield className="w-4 h-4 text-white" />
           <div className="h-px w-12 bg-white/50" />
        </div>
      </div>
    </motion.div>

  );
}