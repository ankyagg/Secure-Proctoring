import { useState } from "react";
import { useNavigate } from "react-router";
import { account, ID, databases, APPWRITE_DB_ID } from "../../services/appwrite";
import { motion } from "framer-motion";
import { Shield, ArrowRight, User, Mail, Lock, ChevronLeft, Binary, ShieldCheck } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userId = ID.unique();
      await account.create(userId, email, password, username);
      
      // Create user profile in Database
      await databases.createDocument(APPWRITE_DB_ID, 'users', userId, {
        username: username,
        email: email,
        score: 0,
        id: userId,
        created_at: new Date().toISOString()
      });

      await account.createEmailPasswordSession(email, password);
      navigate("/student/lobby");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-white selection:bg-[#0099ff]/30 overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#0099ff]/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        
        {/* Navigation */}
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="absolute top-12 left-12 flex items-center gap-3 text-[#525252] hover:text-white transition-all text-[10px] font-semibold uppercase tracking-wider group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Go Back
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl bg-[#090909] border border-white/5 rounded-[4rem] p-16 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#0099ff]/50 to-transparent" />
          
          <div className="text-center space-y-10 mb-16">
            <div className="flex justify-center">
               <div className="w-24 h-24 bg-white border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)]">
                  <User className="w-12 h-12 text-black" />
               </div>
            </div>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-semibold text-[#0099ff] uppercase tracking-wider">
                 <Binary className="w-3 h-3" />
                 Create Your Account
              </div>
              <h2 className="text-4xl font-semibold text-white tracking-tight uppercase leading-none">
                Join <span className="text-[#0099ff]">Now.</span>
              </h2>
              <p className="text-[#525252] text-[10px] font-semibold uppercase tracking-wider">
                Sign up to start your journey.
              </p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSignup}>
            <div className="space-y-3">
              <label className="text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-wider ml-2">Username</label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a2a2a] group-focus-within:text-[#0099ff] transition-colors" />
                <input
                  type="text"
                  placeholder="CHOOSE_A_USERNAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-16 pr-8 py-5 bg-[#000000] border border-white/5 rounded-3xl text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-[#0099ff]/50 transition-all font-semibold text-[11px] uppercase tracking-wider"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-wider ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a2a2a] group-focus-within:text-[#0099ff] transition-colors" />
                <input
                  type="email"
                  placeholder="YOUR@EMAIL.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-16 pr-8 py-5 bg-[#000000] border border-white/5 rounded-3xl text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-[#0099ff]/50 transition-all font-semibold text-[11px] uppercase tracking-wider"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-wider ml-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a2a2a] group-focus-within:text-[#0099ff] transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-16 pr-8 py-5 bg-[#000000] border border-white/5 rounded-3xl text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-[#0099ff]/50 transition-all font-semibold text-[11px] uppercase tracking-wider"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 px-8 bg-[#0099ff] hover:bg-white text-white hover:text-black rounded-3xl text-[11px] font-semibold uppercase tracking-wider shadow-[0_20px_50px_-10px_rgba(0,153,255,0.4)] transition-all duration-500 flex items-center justify-center gap-3 group disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Creating Account..." : "Get Started"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          <div className="mt-12 flex items-start gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
             <ShieldCheck className="w-5 h-5 text-[#0099ff] flex-shrink-0" />
             <p className="text-[9px] text-[#525252] font-semibold uppercase tracking-wider leading-relaxed">
               We use AI monitoring to keep contests fair. Please play by the rules.
             </p>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">
                Sign In
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}