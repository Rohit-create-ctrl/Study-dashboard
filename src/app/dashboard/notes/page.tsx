"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { 
  Plus, Search, Trash2, Edit2, Check, X, 
  Loader2, Notebook, FileText, Sparkles, 
  BookOpen, ChevronDown, MoreVertical, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NotesPage() {
  const { data: notesRes, isLoading: notesLoading } = useSWR("/api/notes", fetcher);
  const { data: subsRes } = useSWR("/api/subjects", fetcher);
  
  const notes = notesRes?.data || [];
  const subjects = subsRes?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", subjectId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Note created!");
        mutate("/api/notes");
        setIsModalOpen(false);
        setNewNote({ title: "", content: "", subjectId: "" });
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Note deleted");
        mutate("/api/notes");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredNotes = notes.filter((n: any) => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Personal Notes</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Capture your thoughts and organize study materials.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 ring-indigo-500/10 transition-all w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" /> New Note
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notesLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-64 rounded-[2rem] bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-white/5" />
          ))
        ) : (
          <AnimatePresence>
            {filteredNotes.map((note: any, i: number) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative flex flex-col h-72 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-violet-500/10 rounded-2xl text-violet-600 dark:text-violet-400">
                    <Notebook className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-hidden">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white line-clamp-1">{note.title}</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-4 leading-relaxed">
                    {note.content}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                  {note.subjectId && (
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-tighter">
                      {subjects.find((s: any) => s._id === note.subjectId)?.title || "Subject"}
                    </span>
                  )}
                </div>

                {/* Aesthetic Glow */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 group-hover:bg-indigo-500/10 rounded-full blur-3xl transition-colors pointer-events-none" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Empty State */}
      {!notesLoading && filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-full shadow-lg mb-6">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          </div>
          <h4 className="text-xl font-black text-slate-800 dark:text-white">No notes found</h4>
          <p className="text-sm font-medium text-slate-500 mt-2">Create your first study note to stay organized.</p>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-white/10"
          >
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                  <Notebook className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Create Note</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Title</label>
                  <input 
                    required
                    autoFocus
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-800 dark:text-white font-bold outline-none focus:ring-4 ring-indigo-500/10 transition-all"
                    placeholder="Note heading..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Subject</label>
                  <div className="relative">
                    <select 
                      value={newNote.subjectId}
                      onChange={(e) => setNewNote({...newNote, subjectId: e.target.value})}
                      className="w-full appearance-none px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      <option value="">General / No Subject</option>
                      {subjects.map((sub: any) => (
                        <option key={sub._id} value={sub._id}>{sub.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Content</label>
                <textarea 
                  required
                  rows={8}
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-800 dark:text-white font-medium outline-none focus:ring-4 ring-indigo-500/10 transition-all resize-none"
                  placeholder="Start typing your brilliance..."
                />
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Note"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
