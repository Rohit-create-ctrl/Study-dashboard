"use client";

import { useState, useEffect } from "react";
import { Play, Square, History, Clock, Loader2, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Session {
  _id: string;
  duration: number; // in minutes
  date: string;
}

export default function SessionLog() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      if (res.ok && data.data) setSessions(data.data);
    } catch (error) {
      toast.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const startSession = () => {
    setIsTracking(true);
    setStartTime(Date.now());
    setElapsed(0);
    toast.success("Session started. Focus time!");
  };

  const stopSession = async () => {
    if (!startTime) return;
    const durationMinutes = Math.max(1, Math.round(elapsed / 60));
    
    setIsTracking(false);
    setStartTime(null);
    setElapsed(0);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: durationMinutes }),
      });
      if (res.ok) {
        toast.success(`Session logged: ${durationMinutes} mins`);
        fetchSessions();
      }
    } catch (error) {
      toast.error("Failed to log session");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-800 dark:text-white">Study Timer</h3>
        <History className="w-5 h-5 text-slate-300 dark:text-slate-700" />
      </div>

      <div className="flex flex-col items-center justify-center space-y-8 py-6">
        <div className="relative">
          <svg className="w-48 h-48 -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="552.92"
              initial={{ strokeDashoffset: 552.92 }}
              animate={{ strokeDashoffset: isTracking ? 0 : 552.92 }}
              transition={{ duration: isTracking ? (elapsed % 60 === 0 ? 60 : 60 - (elapsed % 60)) : 0, ease: "linear" }}
              className="text-indigo-600"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-slate-800 dark:text-white mb-1">
              {formatTime(elapsed)}
            </span>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {isTracking ? "Focusing..." : "Ready?"}
            </span>
          </div>
        </div>

        <div className="flex gap-4 w-full px-4">
          {!isTracking ? (
            <button 
              onClick={startSession}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" /> Start Session
            </button>
          ) : (
            <button 
              onClick={stopSession}
              className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-500/20 hover:bg-rose-400 transition-all flex items-center justify-center gap-2"
            >
              <Square className="w-5 h-5 fill-current" /> Stop & Log
            </button>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Recent Sessions</h4>
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
        ) : sessions.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No sessions logged today.</p>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 3).map((s) => (
              <div key={s._id} className="flex items-center justify-between text-sm py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="font-bold text-slate-600 dark:text-slate-300">{s.duration} mins</span>
                <span className="text-[10px] text-slate-400">{new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
