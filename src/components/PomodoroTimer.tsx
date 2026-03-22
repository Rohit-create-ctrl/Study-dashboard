"use client";

import { useState, useEffect } from "react";
import { Timer, Play, Pause, RotateCcw, X, Coffee, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function PomodoroTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      audio.play().catch(() => {});
      
      if (mode === "work") {
        toast.success("Work session complete! Take a break.");
        setMode("break");
        setTimeLeft(5 * 60);
      } else {
        toast.success("Break over! Time to focus.");
        setMode("work");
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9998]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl text-center"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {mode === "work" ? <Brain className="w-4 h-4 text-indigo-400" /> : <Coffee className="w-4 h-4 text-emerald-400" />}
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  {mode === "work" ? "Focus" : "Break"}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-5xl font-black text-white tracking-tighter mb-8 font-mono">
              {formatTime(timeLeft)}
            </h3>

            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={toggleTimer}
                className={`p-4 rounded-2xl shadow-lg transition-all active:scale-95 ${
                  isActive 
                    ? "bg-amber-500 text-white shadow-amber-500/20" 
                    : "bg-indigo-600 text-white shadow-indigo-600/20"
                }`}
              >
                {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button 
                onClick={resetTimer}
                className="p-4 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-2xl transition-all"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-6 flex justify-center gap-2">
              <button 
                onClick={() => { setMode("work"); setTimeLeft(25*60); setIsActive(false); }}
                className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-tighter transition-all ${mode === "work" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
              >
                Focus
              </button>
              <button 
                onClick={() => { setMode("break"); setTimeLeft(5*60); setIsActive(false); }}
                className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-tighter transition-all ${mode === "break" ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
              >
                Break
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-slate-900 border border-white/10 shadow-2xl flex items-center justify-center group overflow-hidden relative"
      >
        <div className={`absolute inset-0 bg-indigo-600 transition-transform duration-1000 origin-bottom ${isActive ? 'scale-y-100 opacity-20' : 'scale-y-0'}`} 
             style={{ transform: `scaleY(${timeLeft / (mode === "work" ? 25*60 : 5*60)})` }} />
        <Timer className={`w-6 h-6 text-white transition-all ${isActive ? 'animate-pulse scale-110' : ''}`} />
      </motion.button>
    </div>
  );
}
