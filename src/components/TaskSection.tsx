"use client";

import { useState, useEffect } from "react";
import { Plus, CheckSquare, Square, Trash2, Loader2, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  subjectId: string;
}

interface Subject {
  _id: string;
  title: string;
}

export default function TaskSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", subjectId: "" });

  const fetchData = async () => {
    try {
      const [tasksRes, subjectsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/subjects")
      ]);
      const tasksData = await tasksRes.json();
      const subjectsData = await subjectsRes.json();
      
      if (tasksRes.ok) setTasks(tasksData.data || []);
      if (subjectsRes.ok) setSubjects(subjectsData.data || []);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleTask = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (res.ok) {
        setTasks(tasks.map(t => t._id === task._id ? { ...t, completed: !t.completed } : t));
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.subjectId) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        toast.success("Task added!");
        setNewTask({ title: "", subjectId: "" });
        setShowAdd(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(tasks.filter(t => t._id !== id));
        toast.success("Task deleted");
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-800 dark:text-white">Next Tasks</h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
        >
          {showAdd ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleAddTask}
            className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-white/5 space-y-4"
          >
            <input 
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold outline-none"
            />
            <select 
              value={newTask.subjectId}
              onChange={(e) => setNewTask({...newTask, subjectId: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold outline-none"
            >
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
            </select>
            <button type="submit" className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-sm font-black">
              Save Task
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <CheckSquare className="w-10 h-10 text-slate-200 dark:text-slate-800" />
          <p className="text-sm font-bold text-slate-400">All tasks completed!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const subject = subjects.find(s => s._id === task.subjectId);
            return (
              <motion.div 
                layout
                key={task._id}
                className="group flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-2xl transition-all"
              >
                <button 
                  onClick={() => handleToggleTask(task)}
                  className={`flex-shrink-0 transition-colors ${task.completed ? "text-emerald-500" : "text-slate-300 dark:text-slate-700 hover:text-indigo-500"}`}
                >
                  {task.completed ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${task.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"}`}>
                    {task.title}
                  </p>
                  <span className="text-[10px] font-black uppercase text-indigo-500/70 tracking-widest">{subjects.find((s: any) => s._id === task.subjectId)?.title || "No Subject"}</span>
                </div>
                <button 
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
