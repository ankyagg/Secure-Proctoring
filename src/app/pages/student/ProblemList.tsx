import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trophy, 
  Zap, 
  Code2,
  Filter,
  Target,
  Flame,
  ArrowRight,
  ChevronLeft,
  CircleDashed,
  Binary
} from "lucide-react";
import { databases, APPWRITE_DB_ID } from "../../services/appwrite";
import { Query } from "appwrite";
import { motion } from "framer-motion";

const difficultyConfig: Record<string, { bg: string; text: string; border: string }> = {
  easy:   { bg: "bg-emerald-500/10",  text: "text-emerald-400",  border: "border-emerald-500/20" },
  medium: { bg: "bg-amber-500/10",    text: "text-amber-400",    border: "border-amber-500/20" },
  hard:   { bg: "bg-rose-500/10",     text: "text-rose-400",     border: "border-rose-500/20"   },
};

export default function ProblemList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get("contestId");

  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [contest, setContest] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (contestId) {
          // 1. Fetch contest to get question_ids
          const contestDoc = await databases.getDocument(APPWRITE_DB_ID, 'contests', contestId);
          setContest(contestDoc);
          let questionIds = contestDoc.question_ids;
          
          if (typeof questionIds === 'string') {
            try { questionIds = JSON.parse(questionIds); } catch(e) { questionIds = []; }
          }

          if (questionIds && questionIds.length > 0) {
            // 2. Fetch specific questions
            const response = await databases.listDocuments(APPWRITE_DB_ID, 'questions', [
              Query.equal('$id', questionIds)
            ]);
            setProblems(response.documents);
          } else {
            setProblems([]);
          }
        } else {
          const response = await databases.listDocuments(APPWRITE_DB_ID, 'questions');
          setProblems(response.documents);
        }
      } catch (err) {
        console.error("Failed to load problems:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [contestId]);

  const masteryPercentage = Math.round((0 / (problems.length || 1)) * 100);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#000]">
      <div className="w-10 h-10 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Loading Contests...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#0099ff]/30 pb-32">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#0099ff]/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[90rem] mx-auto px-8 pt-10">
        
        {/* Navigation */}
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/student/lobby")}
          className="flex items-center gap-3 text-[#525252] hover:text-white transition-all text-[10px] font-semibold uppercase tracking-wider group mb-10"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Lobby
        </motion.button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[8px] font-semibold text-[#0099ff] uppercase tracking-wider mb-4">
               <Binary className="w-3 h-3" />
               Test Started
            </div>
            <h1 className="text-4xl md:text-4xl font-semibold tracking-tight leading-[0.85] uppercase">
              {contest ? contest.name : (
                <>Coding <span className="text-[#0099ff] italic">Challenges.</span></>
              )}
            </h1>
            <p className="text-lg md:text-xl text-[#525252] font-medium tracking-tight max-w-xl text-balance">
              {contest ? contest.description : "Solve the challenges below. Your work is being saved in real-time."}
            </p>
          </div>

          <button
            onClick={() => navigate("/student/leaderboard")}
            className="flex items-center gap-4 px-8 py-4 bg-[#090909] border border-white/5 rounded-2xl text-[9px] font-semibold text-white uppercase tracking-wider hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95"
          >
            <Trophy className="w-4 h-4" />
            Rankings
          </button>
        </div>

        {/* Intelligence Board */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="md:col-span-2 bg-[#090909] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between group transition-all relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-[#2a2a2a]">Your Progress</span>
              <div className="p-3 rounded-xl bg-[#0099ff]/5 border border-[#0099ff]/10">
                <Target className="w-5 h-5 text-[#0099ff]" />
              </div>
            </div>
            <div>
              <div className="flex items-end gap-4 mb-6">
                <span className="text-4xl font-semibold tracking-tight leading-none">{masteryPercentage}%</span>
                <div className="flex flex-col mb-1">
                  <span className="text-[#0099ff] text-[9px] font-semibold uppercase tracking-widest leading-none">Status</span>
                  <span className="text-[#2a2a2a] text-[9px] font-semibold uppercase tracking-widest mt-1">In Progress</span>
                </div>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${masteryPercentage}%` }}
                  className="h-full bg-[#0099ff] shadow-[0_0_20px_rgba(0,153,255,0.5)]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-[#2a2a2a] mb-8">Solved</div>
            <div>
              <div className="text-4xl font-semibold tracking-tight leading-none mb-3">00</div>
              <div className="text-[9px] font-semibold text-[#525252] uppercase tracking-wider">Completed</div>
            </div>
          </div>

          <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-[#2a2a2a] mb-8">Total Score</div>
            <div>
              <div className="text-4xl font-semibold tracking-tight leading-none mb-3">000</div>
              <div className="text-[9px] font-semibold text-[#525252] uppercase tracking-wider">Total Points</div>
            </div>
          </div>
        </div>

        {/* Problem Matrix */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-10 px-6">
            <div className="flex items-center gap-10">
               <div className="flex items-center gap-3 text-[10px] font-semibold text-white uppercase tracking-wider">
                 <Flame className="w-4 h-4 text-[#0099ff]" />
                 All Problems
               </div>
               <div className="flex items-center gap-3 text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-wider hover:text-[#525252] cursor-pointer transition-colors">
                 <Filter className="w-4 h-4" />
                 Filter
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {problems.map((problem, i) => {
              const diff = difficultyConfig[(problem.difficulty || 'easy').toLowerCase()] || difficultyConfig.easy;
              const idxLabel = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;

              return (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={problem.$id}
                  onClick={() => navigate(`/student/workspace/${problem.$id}${contestId ? `?contestId=${contestId}` : ""}`)}
                  className="group relative flex items-center gap-10 p-8 rounded-[2rem] bg-[#090909] border border-white/5 hover:border-[#0099ff]/30 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl"
                >
                  <div className="absolute inset-0 bg-[#0099ff]/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
                  
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-[11px] font-semibold text-[#2a2a2a] group-hover:text-white group-hover:border-[#0099ff]/30 transition-all shadow-2xl">
                    {idxLabel}
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col gap-3">
                    <div className="flex items-center gap-6">
                      <h3 className="text-3xl font-semibold text-white uppercase tracking-tight group-hover:text-[#0099ff] transition-colors">
                        {problem.title}
                      </h3>
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-semibold uppercase tracking-wider border ${diff.bg} ${diff.text} ${diff.border}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2.5 text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-wider group-hover:text-[#525252] transition-colors">
                        <Clock className="w-4 h-4" />
                        {problem.time_limit || "2.0"}S
                      </div>
                      <div className="flex items-center gap-2.5 text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-wider group-hover:text-[#525252] transition-colors">
                        <Zap className="w-4 h-4 text-[#0099ff]/40" />
                        {problem.points || "100"} POINTS
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-10">
                    <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-[9px] font-semibold text-[#2a2a2a] uppercase tracking-wider">
                      Locked
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-[#0099ff] group-hover:border-[#0099ff] group-hover:scale-110 transition-all shadow-2xl">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}