"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, X, Timer, BookOpen } from "lucide-react";
import useSWR, { mutate } from "swr";
import { toast } from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PomodoroWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [selectedSubject, setSelectedSubject] = useState("");
  
  const { data: subsRes } = useSWR("/api/subjects", fetcher);
  const subjects = subsRes?.data || [];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      audio.play().catch(() => {});

      if (mode === "work") {
        handleSessionComplete();
        setMode("break");
        setTimeLeft(5 * 60);
      } else {
        toast.success("Break over! Time to focus.");
        setMode("work");
        setTimeLeft(25 * 60);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handleSessionComplete = async () => {
    toast.success("Focus session complete! 🎉", { duration: 5000 });
    
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: 25, // minutes
          subjectId: selectedSubject || undefined
        }),
      });
      if (res.ok) {
        mutate("/api/stats");
        mutate("/api/sessions");
      }
    } catch (err) {
      console.error("Failed to save session", err);
    }
  };

  const toggleTimer = () => {
    if (!isActive && timeLeft === 25 * 60) {
      toast.success("Deep work session started!");
    }
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateProgress = () => {
    const total = mode === "work" ? 25 * 60 : 5 * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const circumference = 2 * Math.PI * 76;
  const strokeDashoffset = circumference * (calculateProgress() / 100);

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-6">
      {/* Widget Panel */}
      {isOpen && (
        <div className="w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center animate-in slide-in-from-bottom-5 fade-in duration-500 relative overflow-hidden transition-colors">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="flex justify-between items-center w-full mb-8 relative z-10">
            <h3 className="text-slate-800 dark:text-white font-black flex items-center gap-2 tracking-tight uppercase text-xs">
              <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Focus Timer
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-50 dark:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subject Picker */}
          <div className="relative w-full mb-8 z-20">
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full appearance-none pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
              disabled={isActive}
            >
              <option value="">No Subject</option>
              {subjects.map((sub: any) => (
                <option key={sub._id} value={sub._id}>{sub.title}</option>
              ))}
            </select>
            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
          </div>

          {/* Circular UI */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-8">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="76"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="96"
                cy="96"
                r="76"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={mode === "work" ? "text-indigo-600 transition-all duration-1000 ease-linear shadow-lg" : "text-emerald-500 transition-all duration-1000 ease-linear shadow-lg"}
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col items-center">
              <div className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                {formatTime(timeLeft)}
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-2 px-3 py-1 rounded-full ${mode === "work" ? "bg-indigo-500/10 text-indigo-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                {isActive ? (mode === "work" ? "Flow State" : "Resting") : "Ready"}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 relative z-10 w-full">
            <button 
              onClick={resetTimer}
              className="flex-1 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all font-bold text-xs uppercase tracking-widest border border-slate-100 dark:border-white/5 shadow-sm"
            >
              <RotateCcw className="w-5 h-5 mx-auto" />
            </button>
            <button 
              onClick={toggleTimer}
              className={`flex-[2] py-4 rounded-2xl flex items-center justify-center text-white transition-all duration-300 shadow-xl font-black text-xs uppercase tracking-widest ${
                isActive 
                  ? "bg-rose-500 shadow-rose-500/30 hover:bg-rose-600" 
                  : "bg-indigo-600 shadow-indigo-500/30 hover:bg-indigo-700"
              }`}
            >
              {isActive ? (
                <><Pause className="w-5 h-5 mr-2" /> Pause</>
              ) : (
                <><Play className="w-5 h-5 mr-2" /> Resume</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xl hover:scale-110 transition-all duration-300 group ring-4 ring-indigo-500/5"
        >
          <Timer className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          {isActive && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
          )}
        </button>
      )}
    </div>
  );
}
