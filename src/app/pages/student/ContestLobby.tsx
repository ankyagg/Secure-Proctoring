import { useState, useEffect } from "react";
import { 
  Trophy, 
  Users, 
  Clock, 
  ChevronRight, 
  Shield, 
  Search,
  Activity,
  Flame,
  Eye,
  Lock,
  Sparkles,
  ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router";
import { fetchContests } from "../../services/contest";
import { motion, AnimatePresence } from "framer-motion";

export default function ContestLobby() {
  const navigate = useNavigate();
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContest, setSelectedContest] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchContests();
      setContests(data);
      setLoading(false);
    };
    load();
  }, []);

  const enterContest = (contest: any) => {
    setSelectedContest(contest);
  };

  const confirmEnterContest = () => {
    if (!selectedContest) return;
    navigate(`/student/problems?contestId=${selectedContest.id}`);
  };

  const filteredContests = contests.filter(c => {
    const searchStr = (c.name || "").toLowerCase();
    return searchStr.includes((searchQuery || "").toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#0099ff]/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0099ff]/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#0099ff]/[0.02] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[90rem] mx-auto px-8 py-5">
        
        <div className="mb-10" />

        {/* Header Section */}
        <div className="mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-semibold text-[#0099ff] uppercase tracking-wider mb-10 shadow-2xl">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Leaderboard
            </div>
            <h1 className="text-4xl md:text-7xl font-semibold tracking-tight leading-[0.85] uppercase mb-7">
              Browse <br />
              <span className="text-[#0099ff] italic">Challenges.</span>
            </h1>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
               <p className="text-xl md:text-2xl text-[#525252] font-medium tracking-tight max-w-2xl leading-tight text-balance">
                Solve these coding challenges to score points. Play fair and have fun!
               </p>
               
               <div className="relative group w-full md:w-96">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a2a2a] group-focus-within:text-[#0099ff] transition-colors" />
                 <input 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   placeholder="Search Contests..."
                   className="w-full bg-[#090909] border border-white/5 rounded-[2rem] py-6 pl-16 pr-8 text-[11px] font-semibold uppercase tracking-wider text-white outline-none focus:border-[#0099ff]/50 transition-all placeholder:text-[#2a2a2a]"
                 />
               </div>
            </div>
          </motion.div>
        </div>

        {/* Contest Matrix Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[450px] rounded-[3rem] bg-[#090909] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredContests.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center gap-8 border border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center opacity-20">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2a2a2a]">Your Progress</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredContests.map((contest, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                key={contest.id}
                onClick={() => enterContest(contest)}
                className="group relative cursor-pointer"
              >
                <div className="absolute inset-0 bg-[#0099ff]/10 rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="relative h-full bg-[#090909] border border-white/5 rounded-[3.5rem] p-12 flex flex-col hover:border-[#0099ff]/30 transition-all duration-500 overflow-hidden shadow-2xl">
                  
                  {/* Backdrop Image */}
                  {contest.backdrop_url && (
                    <div className="absolute inset-0 z-0">
                      <img src={contest.backdrop_url} className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-700" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/80 to-transparent" />
                    </div>
                  )}

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between mb-12 relative z-10">
                    <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#0099ff]/10 group-hover:border-[#0099ff]/20 transition-all duration-500 overflow-hidden">
                      {contest.logo_url ? (
                        <img src={contest.logo_url} className="w-full h-full object-cover" alt={contest.name} />
                      ) : (
                        <Flame className="w-8 h-8 text-[#525252] group-hover:text-[#0099ff]" />
                      )}
                    </div>
                    <div className={`px-5 py-2 rounded-full text-[9px] font-semibold uppercase tracking-wider border shadow-2xl ${
                      contest.status === 'Live' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20 animate-pulse' : 'bg-white/5 text-[#525252] border-white/5'
                    }`}>
                      {contest.status}
                    </div>
                  </div>

                  <h3 className="text-4xl font-semibold tracking-tight uppercase leading-[0.9] mb-6 group-hover:text-[#0099ff] transition-colors relative z-10">
                    {contest.name}
                  </h3>
                  
                  <p className="text-[#525252] text-lg font-bold tracking-tight line-clamp-2 mb-12 text-balance leading-snug relative z-10">
                    {contest.description || "Solve coding challenges to win points."}
                  </p>

                  <div className="mt-auto space-y-10 relative z-10">
                    <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-10">
                      <div>
                        <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Loading Problems...</span>
                        <div className="flex items-center gap-3 text-white">
                          <Users className="w-4 h-4 text-[#0099ff]" />
                          <span className="text-base font-semibold tracking-tighter">1.2k+</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] font-semibold text-[#2a2a2a] uppercase tracking-wider block mb-3">Security</span>
                        <div className="flex items-center gap-3 text-white">
                          <Shield className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                          <span className="text-base font-semibold tracking-tighter uppercase">High</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between group/btn">
                      <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
                        <Clock className="w-4 h-4 text-[#0099ff]/40" />
                        {contest.points || "100"} POINTS
                      </div>
                      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#0099ff] group-hover:border-[#0099ff] group-hover:scale-110 transition-all shadow-2xl">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Authorization Modal */}
      <AnimatePresence>
        {selectedContest && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContest(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-[#090909] border border-white/10 rounded-[4rem] p-16 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#0099ff]/50 to-transparent" />
              
              <div className="flex flex-col relative z-10 text-center items-center">
                <div className="w-24 h-24 rounded-[2.5rem] bg-white border border-white/10 flex items-center justify-center mb-10 shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)]">
                  <Lock className="w-12 h-12 text-black" />
                </div>
                
                <h2 className="text-4xl font-semibold text-white tracking-tight uppercase leading-[0.9] mb-4">
                  Join <span className="text-[#0099ff]">Contest</span>
                </h2>
                <div className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Problems Solved</div>
                <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-12">Joining Contest: {selectedContest.name}</p>

                <div className="grid grid-cols-1 gap-4 w-full mb-16 text-left">
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex items-center gap-8 group hover:bg-[#0099ff]/5 hover:border-[#0099ff]/20 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-[#0099ff] shadow-2xl">
                      <Eye className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white uppercase tracking-tight mb-1">Gaze Tracking</h4>
                      <span className="text-[#0099ff] text-[10px] font-semibold uppercase tracking-widest leading-none">Result</span>
                      <p className="text-[11px] text-[#525252] font-bold uppercase tracking-widest">Our AI tracks your focus to prevent cheating.</p>
                    </div>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex items-center gap-8 group hover:bg-[#0099ff]/5 hover:border-[#0099ff]/20 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-[#0099ff] shadow-2xl">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white uppercase tracking-tight mb-1">Security Scan</h4>
                      <p className="text-[11px] text-[#525252] font-bold uppercase tracking-widest">We verify your identity and device setup.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 w-full">
                  <button 
                    onClick={() => setSelectedContest(null)}
                    className="flex-1 px-10 py-6 rounded-[1.5rem] bg-[#000000] border border-white/5 text-[#525252] text-[10px] font-semibold uppercase tracking-wider hover:text-white transition-all"
                  >
                    All Problems
                  </button>
                  <button 
                    onClick={confirmEnterContest}
                    className="flex-[2] px-12 py-6 rounded-[1.5rem] bg-[#0099ff] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-500 shadow-[0_20px_50px_-10px_rgba(0,153,255,0.4)] active:scale-95"
                  >
                    Start Contest
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}