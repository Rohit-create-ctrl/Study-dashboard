"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";
import { motion } from "framer-motion";
import { 
  Clock, Flame, CheckCircle2, BookOpen, Quote, 
  ArrowRight, Sparkles, TrendingUp 
} from "lucide-react";
import { useState, useEffect } from "react";
import SubjectSection from "@/components/SubjectSection";
import TaskSection from "@/components/TaskSection";
import NoteSection from "@/components/NoteSection";
import SessionLog from "@/components/SessionLog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: statsData } = useSWR("/api/stats", fetcher);
  const [quote, setQuote] = useState({ content: "Loading daily inspiration...", author: "StudySpace" });

  useEffect(() => {
    fetch("https://api.quotable.io/random")
      .then(async res => {
        if (!res.ok) throw new Error('API Error');
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           throw new Error("Response not JSON");
        }
        return res.json();
      })
      .then(data => {
        if (data && data.content) setQuote({ content: data.content, author: data.author });
      })
      .catch(() => {
        setQuote({ content: "The best way to predict the future is to create it.", author: "Abraham Lincoln" });
      });
  }, []);

  const stats = [
    { 
      label: "Study Hours", 
      value: statsData?.totalStudyHours ?? 0, 
      icon: Clock, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10",
      description: "Total time invested" 
    },
    { 
      label: "Day Streak", 
      value: statsData?.streak ?? 0, 
      icon: Flame, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10",
      description: "Consistent learning" 
    },
    { 
      label: "Tasks Done", 
      value: statsData?.completedTasks ?? 0, 
      icon: CheckCircle2, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10",
      description: "Productivity boost" 
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 md:p-12 shadow-2xl shadow-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-bold uppercase tracking-widest"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Welcome back, {user?.name?.split(' ')[0] || 'Scholar'}
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Ready to crush your <br />
              <span className="text-indigo-200">learning goals?</span>
            </h2>
            <p className="text-indigo-100/80 max-w-md text-lg font-medium">
              Track your progress, manage tasks, and harness AI to supercharge your study sessions.
            </p>
          </div>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full md:w-80 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4"
          >
            <div className="flex items-center gap-3 text-white">
              <Quote className="w-5 h-5 text-indigo-300" />
              <span className="text-xs font-bold uppercase tracking-widest">Daily Wisdom</span>
            </div>
            <p className="text-sm font-medium italic text-indigo-50 leading-relaxed">
              "{quote.content}"
            </p>
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-tighter">— {quote.author}</p>
          </motion.div>
        </div>

        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />
      </section>

      {/* Stats Grid */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Performance Overview</h3>
          </div>
          <Link href="/results" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group">
            Detailed Analytics <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {statsData === undefined ? (
                    <div className="h-9 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                  ) : stat.value}
                </h4>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SubjectSection />
            <TaskSection />
          </div>
          <NoteSection />
        </div>
        <div className="xl:col-span-1">
          <SessionLog />
        </div>
      </div>
    </div>
  );
}
