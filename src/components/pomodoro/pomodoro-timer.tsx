"use client";

import { useEffect, useState, useRef } from "react";
import { Play, Pause, RotateCcw, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PomodoroTimer({ onComplete }: { onComplete?: (durationSeconds: number) => void }) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  
  const [state, setState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // Constants
  const CIRCUMFERENCE = 2 * Math.PI * 132;

  // Helpers
  const formatTime = (seconds: number) => {
    const sec = Math.max(0, Math.round(seconds));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
  };

  const getElapsedPercentage = () => {
    if (totalSeconds <= 0) return 0;
    const elapsed = totalSeconds - remainingSeconds;
    return Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100));
  };

  const getProgressHue = (percent: number) => {
    return Math.max(0, 210 - (percent / 100) * 210);
  };

  const playCompletionSound = () => {
    try {
      // @ts-expect-error webkitAudioContext is not strictly typed on Window
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.15);
        osc.stop(audioCtx.currentTime + i * 0.15 + 0.4);
      });
    } catch (e) {
      console.warn("Audio not supported");
    }
  };

  // Timer Tick
  const tick = () => {
    if (!endTimeRef.current) return;
    const now = Date.now();
    const newRemaining = Math.max(0, (endTimeRef.current - now) / 1000);
    setRemainingSeconds(newRemaining);

    if (newRemaining <= 0.05) {
      completeTimer();
    }
  };

  const completeTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    endTimeRef.current = null;
    setRemainingSeconds(0);
    setState('completed');
    
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
    playCompletionSound();
    
    if (onComplete) {
      onComplete(totalSeconds);
    }
    
    setTimeout(() => {
      setState(prev => prev === 'completed' ? 'idle' : prev);
    }, 3000);
  };

  // Actions
  const handleStartPause = () => {
    if (state === 'idle') {
      const total = hours * 3600 + minutes * 60;
      if (total <= 0) return;
      setTotalSeconds(total);
      setRemainingSeconds(total);
      endTimeRef.current = Date.now() + total * 1000;
      setState('running');
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, 80);
    } else if (state === 'running') {
      const now = Date.now();
      if (endTimeRef.current) {
        setRemainingSeconds(Math.max(0, (endTimeRef.current - now) / 1000));
      }
      setState('paused');
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      endTimeRef.current = null;
    } else if (state === 'paused') {
      endTimeRef.current = Date.now() + remainingSeconds * 1000;
      setState('running');
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, 80);
    } else if (state === 'completed') {
      handleReset();
    }
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    endTimeRef.current = null;
    setState('idle');
    const total = hours * 3600 + minutes * 60;
    setTotalSeconds(total);
    setRemainingSeconds(total);
  };

  // Sync inputs with remaining seconds when idle
  useEffect(() => {
    if (state === 'idle') {
      const total = hours * 3600 + minutes * 60;
      setTotalSeconds(total);
      setRemainingSeconds(total);
    }
  }, [hours, minutes, state]);

  // Page visibility to prevent drift
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && state === 'running' && endTimeRef.current) {
        const now = Date.now();
        const newRemaining = Math.max(0, (endTimeRef.current - now) / 1000);
        if (newRemaining <= 0.05) {
          completeTimer();
        } else {
          setRemainingSeconds(newRemaining);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [state]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body) return; // Don't trigger if typing in inputs
      if (e.code === 'Space') {
        e.preventDefault();
        handleStartPause();
      }
      if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state, hours, minutes, remainingSeconds]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const percent = getElapsedPercentage();
  const hue = getProgressHue(percent);
  const strokeColor = `hsl(${hue}, 75%, 52%)`;
  const dashOffset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div className="relative w-full max-w-[460px] mx-auto p-5 z-10 flex flex-col items-center gap-6 rounded-3xl bg-gray-900 text-white shadow-2xl border border-white/10 overflow-hidden isolate">
      {/* Background Orbs */}
      <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] rounded-full bg-indigo-500/20 blur-[80px] -z-10 animate-pulse" />
      <div className="absolute -bottom-[80px] -right-[80px] w-[250px] h-[250px] rounded-full bg-fuchsia-500/20 blur-[80px] -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Ring */}
      <div className={`relative w-[270px] h-[270px] shrink-0 transition-all duration-500 ${state === 'running' ? 'drop-shadow-[0_0_35px_rgba(99,102,241,0.3)]' : ''}`}>
        <svg className="w-full h-full -rotate-90 transition-all duration-500" viewBox="0 0 300 300" style={{ filter: state === 'running' ? `drop-shadow(0 0 30px hsla(${hue}, 75%, 52%, 0.4))` : 'none' }}>
          <circle cx="150" cy="150" r="132" fill="none" className="stroke-gray-800" strokeWidth="10" />
          <circle 
            cx="150" cy="150" r="132" fill="none" 
            stroke={strokeColor} 
            strokeWidth="10" strokeLinecap="round" 
            strokeDasharray={CIRCUMFERENCE} 
            strokeDashoffset={dashOffset} 
            style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.5s ease' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="text-5xl font-bold tabular-nums tracking-tighter" style={{ fontFamily: 'monospace' }}>
            {formatTime(remainingSeconds)}
          </span>
          <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">remaining</span>
          <span className="text-2xl font-bold tabular-nums mt-1" style={{ color: strokeColor }}>
            {percent.toFixed(1)}%
          </span>
          
          <span className={`mt-2 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider transition-colors ${
            state === 'completed' ? 'bg-pink-500/20 text-pink-400 animate-pulse' :
            state === 'paused' ? 'bg-amber-500/20 text-amber-400' :
            state === 'running' ? 'bg-indigo-500/20 text-indigo-400' :
            'bg-gray-800 text-gray-400'
          }`}>
            {state === 'idle' ? 'READY' : state === 'running' ? (percent >= 90 ? 'ALMOST DONE' : 'RUNNING') : state === 'paused' ? 'PAUSED' : 'DONE!'}
          </span>
        </div>
      </div>

      {/* Inputs */}
      <div className="flex gap-4 w-full">
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hours</label>
          <input 
            type="number" 
            min="0" max="99" 
            value={hours} 
            onChange={(e) => setHours(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
            disabled={state === 'running' || state === 'paused'}
            className="w-full bg-gray-800 border-2 border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-center text-lg font-bold outline-none disabled:opacity-50 transition-colors"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Minutes</label>
          <input 
            type="number" 
            min="0" max="59" 
            value={minutes} 
            onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            disabled={state === 'running' || state === 'paused'}
            className="w-full bg-gray-800 border-2 border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-center text-lg font-bold outline-none disabled:opacity-50 transition-colors"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full">
        <button 
          onClick={handleStartPause}
          disabled={state === 'idle' && hours === 0 && minutes === 0}
          className={`flex-[1.5] flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
            state === 'running' ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-[0_8px_24px_rgba(245,158,11,0.3)]' :
            'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_8px_24px_rgba(99,102,241,0.3)]'
          }`}
        >
          {state === 'running' ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          {state === 'running' ? 'Pause' : state === 'paused' ? 'Resume' : 'Start'}
        </button>
        <button 
          onClick={handleReset}
          className="flex-[0.8] flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold bg-transparent border-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all active:scale-[0.98]"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>
    </div>
  );
}
