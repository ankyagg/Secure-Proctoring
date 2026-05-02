import { useState } from "react";
import { useNavigate } from "react-router";
import { Shield, Lock, ArrowRight, Code2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const allowedEmails = ["mansiparande2006@gmail.com", "ixaaniketwalanj@gmail.com"];
    
    if (allowedEmails.includes(email) && password === "am@1234") {
      localStorage.setItem("admin_auth", "true");
      navigate("/admin");
    } else {
      alert("Invalid admin credentials");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] font-sans selection:bg-[#0099ff]/30 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-10 space-y-8 bg-[#090909] rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0099ff] to-transparent opacity-50" />
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#0099ff]/10 border border-[#0099ff]/20 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(0,153,255,0.2)]">
            <Shield className="w-8 h-8 text-[#0099ff]" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-white tracking-tight uppercase">
              Admin <span className="text-[#0099ff]">Portal</span>
            </h2>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
              Secure Operations Command
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252] ml-1">
              Email Identity
            </label>
            <div className="relative">
               <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
               <input
                 type="email"
                 placeholder="admin@codearena.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full pl-11 pr-4 py-4 bg-[#000000] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 focus:ring-4 focus:ring-[#0099ff]/5 transition-all placeholder:text-[#333]"
                 required
               />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#525252] ml-1">
              Access Code
            </label>
            <div className="relative">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
               <input
                 type="password"
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full pl-11 pr-4 py-4 bg-[#000000] border border-white/5 rounded-2xl text-sm font-bold tracking-tight text-white outline-none focus:border-[#0099ff]/50 focus:ring-4 focus:ring-[#0099ff]/5 transition-all placeholder:text-[#333]"
                 required
               />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-2xl text-[11px] font-semibold uppercase tracking-wider text-white bg-[#0099ff] hover:bg-white hover:text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,153,255,0.3)] disabled:opacity-50 mt-4 group"
          >
            {loading ? "Authenticating..." : (
              <>
                Initialize Session
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
