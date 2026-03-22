"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, BookOpen, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Subject {
  _id: string;
  title: string;
  icon?: string;
}

export default function SubjectSection() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      if (res.ok) setSubjects(data.data || []);
    } catch (error) {
      toast.error("Failed to load subjects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSubjectName }),
      });
      if (res.ok) {
        toast.success("Subject added!");
        setNewSubjectName("");
        setIsAdding(false);
        fetchSubjects();
      }
    } catch (error) {
      toast.error("Failed to add subject");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure? This will delete all tasks and notes for this subject.")) return;

    try {
      const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Subject deleted");
        fetchSubjects();
      }
    } catch (error) {
      toast.error("Failed to delete subject");
    }
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-800 dark:text-white">Your Subjects</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddSubject}
            className="mb-6 flex gap-2"
          >
            <input 
              autoFocus
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="e.g. Mathematics, History..."
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold outline-none ring-indigo-500/20 focus:ring-4 transition-all"
            />
            <button type="submit" className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-sm font-black hover:opacity-90 transition-all">
              Add
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-10 text-slate-400 font-medium text-sm">No subjects yet. Add one to get started!</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {subjects.map((subject) => (
            <motion.div 
              layout
              key={subject._id}
              className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">{subject.title}</span>
              </div>
              <button 
                onClick={() => handleDeleteSubject(subject._id)}
                className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple X icon as it wasn't imported from lucide-react in the above code block
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
