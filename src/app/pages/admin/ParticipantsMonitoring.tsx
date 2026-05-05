import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  RefreshCw, 
  Filter, 
  ExternalLink, 
  Clock, 
  User as UserIcon,
  Activity,
  Shield,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { databases, client, APPWRITE_DB_ID } from "../../services/appwrite";
import { Query } from "appwrite";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router";

export default function ParticipantsMonitoring() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedContest, setSelectedContest] = useState(searchParams.get("contestId") || "All");
  const [contests, setContests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'live' | 'attended'>('live');

  const fetchData = async () => {
    try {
      setLoading(true);
      const contestsRes = await databases.listDocuments(APPWRITE_DB_ID, "contests");
      setContests(contestsRes.documents);

      try {
        const response = await databases.listDocuments(APPWRITE_DB_ID, "participants", [
          Query.orderDesc("$createdAt"),
          Query.limit(100)
        ]);
        setParticipants(response.documents);
      } catch (e) {
        console.warn("Participants collection not found.");
        setParticipants([]);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time subscription
    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_DB_ID}.collections.participants.documents`,
      () => {
        fetchData(); // Refresh list on any change to any participant document
      }
    );

    return () => unsubscribe();
  }, []);

  const filtered = participants.filter(p => {
    const matchesSearch = (p.user_email || "").toLowerCase().includes(search.toLowerCase()) || 
                          (p.user_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesContest = selectedContest === "All" || p.contest_id === selectedContest;
    const statusMatch = activeTab === 'live' ? p.status === 'active' : p.status === 'finished';
    return matchesSearch && matchesContest && statusMatch;
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex items-center gap-6">
             <button 
               onClick={() => navigate("/admin/contests")}
               className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[#525252] hover:text-white transition-all"
             >
               <ArrowLeft className="w-5 h-5" />
             </button>
             <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-[#0099ff] rounded-full shadow-[0_0_15px_rgba(0,153,255,0.5)]" />
                    <h1 className="text-4xl font-semibold tracking-tight uppercase">
                       {activeTab === 'live' ? 'Monitor' : 'History'} <span className="text-[#525252]">{activeTab === 'live' ? 'Live' : 'Attended'}</span>
                    </h1>
                </div>
                <p className="text-[#0099ff] text-[10px] font-bold uppercase tracking-widest px-1">
                  {contests.find(c => c.$id === selectedContest)?.name || "Participant Metrics"}
                </p>
             </div>
          </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a2a2a] group-focus-within:text-[#0099ff] transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Student..."
              className="pl-12 pr-6 py-4 bg-[#090909] border border-white/5 rounded-2xl text-[10px] font-semibold uppercase tracking-wider text-white outline-none focus:border-[#0099ff]/50 transition-all w-72 placeholder:text-[#2a2a2a]"
            />
          </div>
          <button 
            onClick={fetchData}
            className="p-4 bg-[#090909] border border-white/5 rounded-2xl text-[#525252] hover:text-white transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-[#0099ff]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        {[
          { id: 'live', label: 'Live Now', icon: Activity, count: participants.filter(p => p.status === 'active').length },
          { id: 'attended', label: 'Attended', icon: Users, count: participants.filter(p => p.status === 'finished').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${
              activeTab === tab.id 
              ? 'bg-[#0099ff]/10 border-[#0099ff]/30 text-[#0099ff] shadow-[0_0_30px_rgba(0,153,255,0.1)]' 
              : 'bg-white/5 border-white/5 text-[#525252] hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-md text-[8px] ${activeTab === tab.id ? 'bg-[#0099ff] text-white' : 'bg-white/10 text-[#525252]'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-[#090909] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="grid px-10 py-6 bg-white/[0.02] border-b border-white/5 text-[9px] font-semibold text-[#2a2a2a] uppercase tracking-wider"
          style={{ gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 0.5fr" }}>
          <span>Student</span>
          <span>Contest</span>
          <span>Status</span>
          <span>Time</span>
          <span className="text-right">Activity</span>
        </div>

        <div className="divide-y divide-white/5">
          {filtered.length === 0 && !loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-6 text-center px-10">
              <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center border border-white/5 shadow-2xl">
                <Users className="w-10 h-10 text-[#2a2a2a]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold uppercase tracking-tight">No {activeTab === 'live' ? 'Live' : 'Attended'} Participants</h3>
                <p className="text-[10px] font-bold text-[#525252] uppercase tracking-widest">
                  {activeTab === 'live' ? 'No students are currently taking a test.' : 'No students have finished their tests yet.'}
                </p>
              </div>
            </div>
          ) : filtered.map((participant, index) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              key={participant.$id}
              className="grid px-10 py-8 items-center hover:bg-white/[0.01] transition-all group/row"
              style={{ gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 0.5fr" }}
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#000000] border border-white/5 flex items-center justify-center group-hover/row:border-[#0099ff]/30 transition-all overflow-hidden">
                  {participant.avatar ? (
                    <img src={participant.avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-[10px] font-semibold text-[#525252]">{participant.user_name?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div>
                  <div className="text-white text-base font-semibold tracking-[-0.02em] uppercase group-hover/row:text-[#0099ff] transition-colors">
                    {participant.user_name}
                  </div>
                  <div className="text-[9px] text-[#2a2a2a] font-bold tracking-widest mt-1">{participant.user_email}</div>
                </div>
              </div>

              <div className="text-sm font-semibold text-[#a6a6a6] uppercase tracking-tight truncate max-w-[200px]">
                {participant.contest_name}
              </div>

              <div>
                <span className={`inline-flex items-center gap-2.5 text-[8px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border ${
                  participant.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-[#525252] border-white/5'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${participant.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-[#525252]'}`} />
                  {participant.status || "Registered"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2.5 text-[10px] font-bold text-white uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5 text-[#525252]" />
                    {new Date(participant.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </div>
                 <div className="text-[9px] font-semibold text-[#2a2a2a] uppercase tracking-widest">
                    {new Date(participant.$createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                 </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => navigate(`/admin/anticheat?email=${participant.user_email}`)}
                  className="p-3 bg-white/5 border border-white/5 rounded-xl text-[#2a2a2a] hover:text-[#0099ff] hover:border-[#0099ff]/30 transition-all group/btn"
                >
                  <Activity className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
