"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Note {
  _id: string;
  title: string;
  content: string;
  subjectId: string;
}

interface Subject {
  _id: string;
  title: string;
}

export default function NoteSection() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", subjectId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [notesRes, subjectsRes] = await Promise.all([
        fetch("/api/notes"),
        fetch("/api/subjects")
      ]);
      const notesData = await notesRes.json();
      const subjectsData = await subjectsRes.json();
      
      if (notesRes.ok) setNotes(notesData.data || []);
      if (subjectsRes.ok) setSubjects(subjectsData.data || []);
    } catch (error) {
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.content.trim() || !newNote.subjectId) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
      if (res.ok) {
        toast.success("Note saved!");
        setNewNote({ title: "", content: "", subjectId: "" });
        setShowAdd(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to save note");
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes(notes.filter(n => n._id !== id));
        toast.success("Note deleted");
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-800 dark:text-white">Study Notes</h3>
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleAddNote}
            className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-500/5 rounded-3xl border border-indigo-100 dark:border-white/5 space-y-4"
          >
            <select 
              required
              value={newNote.subjectId}
              onChange={(e) => setNewNote({...newNote, subjectId: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold outline-none focus:ring-4 ring-indigo-500/10 transition-all"
            >
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
            </select>
            <input 
              required
              value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              placeholder="Note title"
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold outline-none focus:ring-4 ring-indigo-500/10 transition-all"
            />
            <textarea 
              required
              rows={4}
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              placeholder="What did you learn today?"
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium outline-none focus:ring-4 ring-indigo-500/10 transition-all resize-none"
            />
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save Note
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : notes.length === 0 ? (
        <div className="text-center py-10">
          <FileText className="w-12 h-12 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400">No notes yet. Knowledge is power!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notes.map((note) => {
            const subject = subjects.find(s => s._id === note.subjectId);
            return (
              <motion.div 
                layout
                key={note._id}
                className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all relative group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white line-clamp-1">{note.title}</h4>
                  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-wider ml-auto">
                    {subject?.title || "General"}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed line-clamp-3">
                  {note.content}
                </p>
                <button 
                  onClick={() => handleDeleteNote(note._id)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
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
