import React, { useRef, useState, useEffect } from "react";
import { useStudentContext } from "./StudentLayout";
import { Mic, Keyboard, Eye, Shield, AlertCircle, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WebcamPreviewProps {
  username?: string;
  className?: string;
}

const WebcamPreview: React.FC<WebcamPreviewProps> = ({ username, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { 
    webcamStream, 
    watchdogState, 
    proctorReason, 
    voiceActive, 
    proctorStatus 
  } = useStudentContext();

  useEffect(() => {
    if (videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  return (
    <div className={`relative group overflow-hidden ${className || "w-48 h-32 bg-[#090909] border border-white/5 rounded-2xl shadow-2xl z-30"} transition-all duration-500 ${
      watchdogState === 'angry' ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-black shadow-[0_0_30px_rgba(239,68,68,0.3)]' :
      watchdogState === 'suspicious' ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-black shadow-[0_0_30px_rgba(245,158,11,0.2)]' :
      ''
    }`}>
      {!webcamStream ? (
        <div className="flex flex-col items-center justify-center h-full bg-[#000000] relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center mb-4 relative z-10"
          >
            <Shield className="w-4 h-4 text-[#a6a6a6]" />
          </motion.div>
          <div className="text-[8px] font-semibold text-[#a6a6a6] uppercase tracking-wider relative z-10 text-center px-4">
            Initializing Secure Feed
          </div>
          <div className="mt-2 w-24 h-0.5 bg-white/5 rounded-full overflow-hidden relative z-10">
            <motion.div 
              animate={{ x: [-100, 100] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-1/2 h-full bg-[#0099ff]/40"
            />
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[1.2s] ease-out mirrored"
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {/* Center Alert Icon (Only on violation) */}
          <AnimatePresence>
            {watchdogState !== 'happy' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              >
                <div className={`p-4 rounded-full backdrop-blur-2xl shadow-2xl ${
                  watchdogState === 'suspicious' ? 'bg-amber-500/30 text-amber-500' : 'bg-red-500/30 text-red-500'
                }`}>
                  {watchdogState === 'suspicious' ? <EyeOff size={24} /> : <AlertCircle size={24} />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>


              {/* Telemetry Dots */}
              <div className="flex gap-1.5">
                {[
                  { icon: Mic, active: voiceActive },
                  { icon: Keyboard, active: false },
                  { icon: Eye, active: proctorStatus === 'active' }
                ].map((node, i) => (
                  <div 
                    key={i}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-500 ${
                      node.active 
                      ? 'bg-[#0099ff]/20 text-[#0099ff] shadow-[0_0_10px_rgba(0,153,255,0.2)]' 
                      : 'bg-white/5 text-white/20'
                    }`}
                  >
                    <node.icon size={8} />
                  </div>
                ))}
              </div>


          {/* Premium Glass Shine */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </>
      )}
    </div>
  );
};

export default WebcamPreview;
