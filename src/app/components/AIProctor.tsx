import React, { useEffect, useRef, useState } from 'react';
import { useStudentContext } from './StudentLayout';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Eye, EyeOff, Mic, MicOff, Keyboard, Loader2 } from 'lucide-react';
import { auth } from '../services/firebase.js';
import ProctorGazeDetector from '../services/ProctorGazeDetector';

const API = "http://localhost:3000/api";

export default function AIProctor() {
  const { addWarning } = useStudentContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const detectorRef = useRef<ProctorGazeDetector | null>(null);
  const [status, setStatus] = useState<'loading' | 'active' | 'error'>('loading');
  const [watchdogState, setWatchdogState] = useState<'happy' | 'suspicious' | 'angry'>('happy');
  const [voiceActive, setVoiceActive] = useState(false);
  const [proctorDetails, setProctorDetails] = useState({ reason: '', confidence: 1, rawStatus: '' });

  // Internal tracking to prevent redundant UI updates
  const lastState = useRef<'happy' | 'suspicious' | 'angry'>('happy');
  const lastDetails = useRef({ reason: '', confidence: 1, rawStatus: '' });
  const lastViolationTime = useRef(0);
  const lastVoiceViolationTime = useRef(0);

  // Initialize Detector and Webcam
  useEffect(() => {
    const initDetector = async () => {
      if (!videoRef.current) return;

      try {
        // 1. Connect Webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, frameRate: 30 }
        });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // 2. Initialize Human-based Detector
        const detector = new ProctorGazeDetector(videoRef.current, {
          // Fallback to CDN models if local ones aren't hosted yet
          modelBasePath: 'https://vladmandic.github.io/human-models/models',
        });

        const success = await detector.init();
        if (success) {
          detectorRef.current = detector;
          detector.start();
          setStatus('active');

          // 3. Start Sync Loop (Bridges the Detector's internal state to React UI)
          const syncLoop = () => {
            type ProctorStatus = {
              status: 'CHEATING_DETECTED' | 'POSSIBLE_CHEATING' | 'NORMAL';
              reason: string;
              confidence: number;
            };
            const data = detector.getStatus() as ProctorStatus;

            // Map Human statuses to Watchdog states
            let newState: 'happy' | 'suspicious' | 'angry' = 'happy';
            if (data.status === 'CHEATING_DETECTED') {
              newState = 'angry';
            } else if (data.status === 'POSSIBLE_CHEATING') {
              newState = 'suspicious';
            }

            // Real-time Visual Update (Fixes the "locked" issue)
            if (newState !== lastState.current) {
              setWatchdogState(newState);
              lastState.current = newState;
            }

            if (
              data.reason !== lastDetails.current.reason ||
              data.confidence !== lastDetails.current.confidence ||
              data.status !== lastDetails.current.rawStatus
            ) {
              setProctorDetails({ reason: data.reason, confidence: data.confidence, rawStatus: data.status });
              lastDetails.current = { reason: data.reason, confidence: data.confidence, rawStatus: data.status };
            }

            // Throttled AddWarning / Remote Logging (Faster feedback)
            if (data.status === 'CHEATING_DETECTED' && Date.now() - lastViolationTime.current > 3000) {
              logViolation(data.reason, `Confidence: ${data.confidence}`);
              addWarning();
              lastViolationTime.current = Date.now();
            }

            requestAnimationFrame(syncLoop);
          };
          syncLoop();
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error("AI Initialization Failed:", err);
        setStatus('error');
      }
    };

    initDetector();

    return () => {
      detectorRef.current?.stop();
    };
  }, [addWarning]);

  // Keyboard Monitoring (Independent)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const forbidden = [
        (e.ctrlKey || e.metaKey) && e.key === 'c',
        (e.ctrlKey || e.metaKey) && e.key === 'v',
        (e.ctrlKey || e.metaKey) && e.key === 'f',
        e.key === 'PrintScreen',
        e.key === 'F12',
      ];

      if (forbidden.some(cond => cond)) {
        e.preventDefault();
        logViolation('Keyboard Shortcut Attempt', `User tried shortcut: ${e.key}`);
        addWarning();
        triggerWatchdog('suspicious');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addWarning]);

  // Tab Switching / Visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation('Tab Switching', 'User left the contest window');
        addWarning();
        triggerWatchdog('angry');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [addWarning]);

  // Voice Monitoring
  useEffect(() => {
    let audioCtx: AudioContext;
    let stream: MediaStream;

    const startAudio = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudio = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const isActive = average > 35;
          setVoiceActive(isActive);

          if (isActive && Date.now() - lastVoiceViolationTime.current > 10000) {
            logViolation('Voice Detected', 'Audio activity detected in the room');
            triggerWatchdog('suspicious');
            lastVoiceViolationTime.current = Date.now();
          }

          requestAnimationFrame(checkAudio);
        };
        checkAudio();
      } catch (err) {
        console.warn("Audio monitoring skipped:", err);
      }
    };
    startAudio();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
      audioCtx?.close();
    };
  }, []);

  const triggerWatchdog = (state: 'happy' | 'suspicious' | 'angry') => {
    setWatchdogState(state);
    setTimeout(() => setWatchdogState('happy'), 3000);
  };

  const logViolation = async (type: string, details: string) => {
    const user = auth.currentUser;
    try {
      await fetch(`${API}/proctor/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.uid || 'anonymous',
          user_email: user?.email || 'anonymous',
          user_name: user?.displayName || user?.email?.split('@')[0] || 'User',
          contest_id: new URLSearchParams(window.location.search).get('contestId') || 'unknown',
          type,
          message: details,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Failed to log violation:", err);
    }
  };

  return (
    <>
      <video ref={videoRef} className="fixed opacity-0 pointer-events-none" width="640" height="480" muted playsInline />

      <AnimatePresence>
        <motion.div
          initial={{ bottom: -100, right: 20 }}
          animate={{ bottom: 100, right: 20 }}
          className="fixed z-50 flex flex-col items-center"
        >
          <motion.div
            animate={
              status !== 'active' ? { y: 0 } : {
                y: [0, -10, 0],
                scale: watchdogState === 'happy' ? 1 : watchdogState === 'suspicious' ? 1.1 : 1.2
              }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-16 h-16 rounded-full border-4 shadow-2xl flex items-center justify-center transition-colors duration-300 ${status === 'loading' ? 'bg-slate-500 border-slate-300' :
              status === 'error' ? 'bg-slate-800 border-slate-600' :
                watchdogState === 'happy' ? 'bg-blue-600 border-blue-400' :
                  watchdogState === 'suspicious' ? 'bg-amber-500 border-amber-300' :
                    'bg-red-600 border-red-400'
              }`}
          >
            {status === 'loading' && <Loader2 className="text-white w-8 h-8 animate-spin" />}
            {status === 'error' && <EyeOff className="text-gray-400 w-8 h-8" />}
            {status === 'active' && watchdogState === 'happy' && <Eye className="text-white w-8 h-8" />}
            {status === 'active' && watchdogState === 'suspicious' && <EyeOff className="text-white w-8 h-8 animate-pulse" />}
            {status === 'active' && watchdogState === 'angry' && <AlertCircle className="text-white w-8 h-8 animate-bounce" />}
          </motion.div>

          <div className="mt-2 bg-white/90 backdrop-blur px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm border border-slate-200 min-w-[120px] text-center">
            {status === 'loading' ? 'Initializing AI...' :
              status === 'error' ? 'AI Offline' :
                watchdogState === 'happy' ? 'Monitoring...' : watchdogState === 'suspicious' ? 'I See You!' : 'Action Required'}
          </div>

          {status === 'active' && proctorDetails.rawStatus && (
            <div className="mt-2 flex flex-col items-center gap-1 w-[150px]">
              <div className="bg-slate-900/80 backdrop-blur w-full text-center text-white text-[9px] px-2 py-0.5 rounded shadow">
                {proctorDetails.rawStatus.replace(/_/g, ' ')}
              </div>
              <div className="bg-slate-900/80 backdrop-blur w-full text-center text-emerald-400 text-[9px] px-2 py-0.5 rounded shadow whitespace-normal leading-tight">
                {proctorDetails.reason} ({(proctorDetails.confidence * 100).toFixed(0)}%)
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <div className={`p-1 rounded transition-colors ${voiceActive ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
              {voiceActive ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
            </div>
            <div className="p-1 rounded bg-slate-100 text-slate-400">
              <Keyboard className="w-3 h-3" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
