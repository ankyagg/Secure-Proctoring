import React, { useEffect, useRef, useState } from 'react';
import { useStudentContext } from './StudentLayout';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Eye, EyeOff, Mic, MicOff, Keyboard, AlertCircle } from 'lucide-react';
import { account, databases, APPWRITE_DB_ID } from '../services/appwrite';
import { ID } from 'appwrite';
import ProctorGazeDetector from '@/app/services/ProctorGazeDetector';

export default function AIProctor() {
  const { 
    addWarning, 
    currentCode, 
    webcamStream,
    setWatchdogState,
    setProctorReason,
    setVoiceActive,
    setProctorStatus,
    proctorStatus,
    antiCheat
  } = useStudentContext();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const detectorRef = useRef<ProctorGazeDetector | null>(null);
  const lastState = useRef<'happy' | 'suspicious' | 'angry'>('happy');
  const lastReason = useRef('');
  const lastViolationTime = useRef(0);
  const userRef = useRef<any>(null);

  // Keep a ref to addWarning so the effect doesn't re-run when it changes
  const addWarningRef = useRef(addWarning);
  addWarningRef.current = addWarning;
  const initedRef = useRef(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await account.get();
        userRef.current = u;
      } catch (e) {
        console.warn("No active session for proctor logging");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (initedRef.current || !videoRef.current || !webcamStream || !antiCheat?.enabled) return;
    initedRef.current = true;

    let cancelled = false;
    let syncTimer: ReturnType<typeof setInterval> | null = null;

    const initDetector = async () => {
      try {
        videoRef.current!.srcObject = webcamStream;
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(resolve);
            };
          }
        });

        if (cancelled) return;
        const detector = new ProctorGazeDetector(videoRef.current!);
        await detector.init();
        if (cancelled) { detector.stop(); return; }

        detectorRef.current = detector;
        detector.start();
        setProctorStatus('active');
        setProctorReason('Anti-Cheat Active');
        
        syncTimer = setInterval(() => {
          const data = detector.getStatus();
          let newState: 'happy' | 'suspicious' | 'angry' = 'happy';
          if (data.status === 'CHEATING_DETECTED') {
            newState = 'angry';
          } else if (data.status === 'POSSIBLE_CHEATING') {
            newState = 'suspicious';
          }

          if (newState !== lastState.current || data.reason !== lastReason.current) {
            setWatchdogState(newState);
            setProctorReason(newState === 'happy' ? 'Anti-Cheat Active' : data.reason);
            lastState.current = newState;
            lastReason.current = data.reason;
          }

          if (data.status === 'CHEATING_DETECTED' && Date.now() - lastViolationTime.current > 5000) {
            captureAndLog(data.reason, `Confidence: ${(data.confidence * 100).toFixed(0)}%`);
            lastViolationTime.current = Date.now();
          }
        }, 200);
      } catch (err) {
        console.error("AI Initialization Failed:", err);
        setProctorStatus('error');
        setProctorReason('Module Failed');
      }
    };

    initDetector();
    return () => {
      cancelled = true;
      if (syncTimer) clearInterval(syncTimer);
      detectorRef.current?.stop();
    };
  }, [webcamStream]);

  const captureAndLog = (type: string, details: string) => {
    let screenshot: string | null = null;
    if (videoRef.current && videoRef.current.readyState >= 2) {
      const canvas = document.createElement('canvas');
      canvas.width  = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        screenshot = canvas.toDataURL('image/jpeg', 0.6); // Lower quality to save space
      }
    }
    addWarningRef.current(type, details, screenshot);
  };

  useEffect(() => {
    if (!antiCheat?.enabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const forbidden = [(e.ctrlKey || e.metaKey) && ['c','v','f'].includes(e.key), e.key === 'PrintScreen', e.key === 'F12'];
      if (forbidden.some(cond => cond)) {
        e.preventDefault();
        captureAndLog('FORBIDDEN_SHORTCUT', `Blocked: ${e.key}`);
        setWatchdogState('suspicious');
        setProctorReason('Shortcut Blocked');
        setTimeout(() => {
          setWatchdogState('happy');
          setProctorReason('Anti-Cheat Active');
        }, 3000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [antiCheat?.enabled]);

  useEffect(() => {
    if (!antiCheat?.enabled) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Don't log here — StudentLayout.tsx already logs TAB_SWITCH
        // Just update the watchdog face state
        setWatchdogState('angry');
        setProctorReason('Warning: Tab Switched');
        setTimeout(() => {
          setWatchdogState('happy');
          setProctorReason('Anti-Cheat Active');
        }, 5000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [antiCheat?.enabled]);

  useEffect(() => {
    if (!antiCheat?.enabled) return;
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
          if (!stream.active) return;
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVoiceActive(average > 38);
          requestAnimationFrame(checkAudio);
        };
        checkAudio();
      } catch (err) { console.warn("Audio monitoring skipped"); }
    };
    startAudio();
    return () => { stream?.getTracks().forEach(t => t.stop()); audioCtx?.close(); };
  }, [antiCheat?.enabled]);



  return (
    <video 
      ref={videoRef} 
      style={{ position: 'fixed', top: '-10000px', left: '-10000px', width: '640px', height: '480px', pointerEvents: 'none' }} 
      muted 
      playsInline 
      autoPlay
    />

  );
}

