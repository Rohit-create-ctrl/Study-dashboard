"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { 
  Plus, Check, Trash2, Loader2, 
  Filter, Calendar, ChevronDown, CheckCircle2, 
  Circle, AlertCircle, Clock, BookOpen, Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TasksPage() {
  const { data: tasksRes, isLoading: tasksLoading } = useSWR("/api/tasks", fetcher);
  const { data: subsRes } = useSWR("/api/subjects", fetcher);
  
  const tasks = tasksRes?.data || [];
  const subjects = subsRes?.data || [];

  const [newTitle, setNewTitle] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a task title first!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newTitle.trim(), 
          subjectId: selectedSubject || undefined 
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Task added");
        mutate("/api/tasks");
        setNewTitle("");
        setSelectedSubject("");
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTask = async (task: any) => {
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (res.ok) {
        mutate("/api/tasks");
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Task deleted");
        mutate("/api/tasks");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredTasks = tasks.filter((t: any) => {
    if (filter === "today") {
      // If no createdAt, assume today for demo purposes
      const taskDate = t.createdAt ? new Date(t.createdAt) : new Date();
      return taskDate.toDateString() === new Date().toDateString();
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Tasks</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {filteredTasks.filter((t: any) => t.completed).length} of {filteredTasks.length} tasks completed
          </p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-1 shadow-sm">
          <button 
            onClick={() => setFilter("all")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${filter === "all" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
          >
            All Tasks
          </button>
          <button 
            onClick={() => setFilter("today")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${filter === "today" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
          >
            Today
          </button>
        </div>
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleAdd} className="group relative">
        <div className="flex flex-col md:flex-row gap-3 p-3 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 shadow-xl transition-all focus-within:border-indigo-500/50 focus-within:shadow-indigo-500/10">
          <input 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Write your next goal..."
            className="flex-1 px-6 py-4 bg-transparent text-slate-800 dark:text-white font-bold text-lg outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
          />
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="appearance-none pl-10 pr-10 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <option value="">No Subject</option>
                {subjects.map((sub: any) => (
                  <option key={sub._id} value={sub._id}>{sub.title}</option>
                ))}
              </select>
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </form>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasksLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-white/5" />
          ))
        ) : (
          <AnimatePresence initial={false}>
            {filteredTasks.map((task: any, i: number) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
                className={`group flex items-center gap-6 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all ${task.completed ? "opacity-60" : ""}`}
              >
                <button 
                  onClick={() => toggleTask(task)}
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-all ${
                    task.completed 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "bg-slate-100 dark:bg-slate-800 text-transparent border-2 border-slate-200 dark:border-white/5 hover:border-indigo-500"
                  }`}
                >
                  <Check className={`w-5 h-5 ${task.completed ? "scale-100" : "scale-0"} transition-transform`} />
                </button>

                <div className="flex-1 min-w-0">
                  <h4 className={`text-lg font-bold text-slate-800 dark:text-white transition-all ${task.completed ? "line-through text-slate-400 dark:text-slate-600" : ""}`}>
                    {task.title}
                  </h4>
                  {task.subjectId && (
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      {subjects.find((s: any) => s._id === task.subjectId)?.title || "Subject"}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(task._id)}
                    className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!tasksLoading && filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-full shadow-lg mb-6">
              <CheckCircle2 className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </div>
            <h4 className="text-xl font-black text-slate-800 dark:text-white">All caught up!</h4>
            <p className="text-sm font-medium text-slate-500 mt-2">You have no pending tasks. Take a break!</p>
          </div>
        )}
      </div>
    </div>
  );
}
