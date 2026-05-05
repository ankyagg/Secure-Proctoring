import { useNavigate } from "react-router";
import { Shield, Users, Target, ShieldCheck, ChevronLeft, Globe, Zap, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-[#0099ff]/30 overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#0099ff]/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#0099ff]/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-10 pb-32">
        
        {/* Navigation */}
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-[#525252] hover:text-white transition-all text-[10px] font-semibold uppercase tracking-[0.3em] group mb-20"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Terminal
        </motion.button>

        {/* Hero Section */}
        <section className="mb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-semibold text-[#0099ff] uppercase tracking-wider mb-10">
               <Shield className="w-3 h-3" />
               Our Mission
            </div>
            <h1 className="text-5xl md:text-[100px] font-semibold tracking-tight leading-[0.9] uppercase mb-12">
              Securing the <br />
              <span className="text-[#0099ff] italic text-balance">Future of Code.</span>
            </h1>
            <p className="text-xl md:text-3xl text-[#525252] font-medium tracking-tight leading-relaxed max-w-3xl">
              We believe that the integrity of a developer's skill is the cornerstone of the tech industry. Secure Proctoring was built to ensure a level playing field for every coder, everywhere.
            </p>
          </motion.div>
        </section>

        {/* Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-40">
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-[#090909] border border-white/5 rounded-[3rem] p-16 relative overflow-hidden group"
          >
             <div className="w-20 h-20 bg-[#0099ff]/10 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
               <Target className="w-8 h-8 text-[#0099ff]" />
             </div>
             <h3 className="text-4xl font-semibold text-white mb-6 uppercase tracking-tight">The Vision</h3>
             <p className="text-lg text-[#525252] leading-relaxed font-medium">
               To create a world where talent is measured by nothing but pure ability. Our platform leverages cutting-edge AI to eliminate bias and prevent unfair advantages in technical assessments.
             </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-[#090909] border border-white/5 rounded-[3rem] p-16 relative overflow-hidden group"
          >
             <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
               <ShieldCheck className="w-8 h-8 text-white" />
             </div>
             <h3 className="text-4xl font-semibold text-white mb-6 uppercase tracking-tight">The Standard</h3>
             <p className="text-lg text-[#525252] leading-relaxed font-medium">
               Security isn't just a feature; it's our identity. From real-time gaze tracking to deep code analysis, we provide the most comprehensive proctoring suite ever built for the coding ecosystem.
             </p>
          </motion.div>
        </div>

        {/* Creators Section */}
        <section className="mt-60 mb-40">
          <div className="text-center mb-24">
             <h2 className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#525252] mb-6">The Command Unit</h2>
             <div className="h-[1px] w-20 bg-[#0099ff] mx-auto opacity-30" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="group cursor-default relative z-20"
            >
              <div className="aspect-[4/5] bg-white border border-white/10 rounded-[4rem] mb-10 flex items-center justify-center overflow-hidden transition-all duration-700 shadow-[0_0_50px_rgba(255,255,255,0.05)] group-hover:scale-[1.02]">
                <img 
                  src="/aniket.png" 
                  alt="Aniket Walanj" 
                  className="w-full h-full object-cover object-[center_15%] transition-all duration-700 block"
                  onError={(e) => console.error("Aniket image load failed:", e)}
                />
              </div>
              <h4 className="text-4xl font-semibold text-white uppercase tracking-tight mb-2">Aniket Walanj</h4>
              <p className="text-[10px] font-semibold text-[#0099ff] uppercase tracking-widest">Co-Founder & Lead Architect</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="group cursor-default relative z-20"
            >
              <div className="aspect-[4/5] bg-white border border-white/10 rounded-[4rem] mb-10 flex items-center justify-center overflow-hidden transition-all duration-700 shadow-[0_0_50px_rgba(255,255,255,0.05)] group-hover:scale-[1.02]">
                <img 
                  src="/mansi.png" 
                  alt="Mansi Parande" 
                  className="w-full h-full object-cover object-[center_40%] transition-all duration-700 block"
                  onError={(e) => console.error("Image load failed:", e)}
                />
              </div>
              <h4 className="text-4xl font-semibold text-white uppercase tracking-tight mb-2">Mansi Parande</h4>
              <p className="text-[10px] font-semibold text-[#0099ff] uppercase tracking-widest">Co-Founder & Security Strategist</p>
            </motion.div>
          </div>
        </section>

        {/* Global Stats Footer */}
        <section className="border-t border-white/5 pt-32 grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-4">
            <Globe className="w-6 h-6 text-[#525252]" />
            <div className="text-3xl font-semibold uppercase tracking-tight">Global.</div>
            <p className="text-sm text-[#525252] font-medium leading-relaxed">Deployed across multiple regions ensuring low latency for every candidate.</p>
          </div>
          <div className="space-y-4">
            <Zap className="w-6 h-6 text-[#525252]" />
            <div className="text-3xl font-semibold uppercase tracking-tight">Instant.</div>
            <p className="text-sm text-[#525252] font-medium leading-relaxed">Real-time monitoring and reporting with zero-delay telemetry.</p>
          </div>
          <div className="space-y-4">
            <Cpu className="w-6 h-6 text-[#525252]" />
            <div className="text-3xl font-semibold uppercase tracking-tight">Elite.</div>
            <p className="text-sm text-[#525252] font-medium leading-relaxed">Built for top-tier enterprises and world-class coding challenges.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
