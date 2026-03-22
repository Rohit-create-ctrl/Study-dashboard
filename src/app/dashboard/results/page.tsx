"use client";

import { useState } from "react";
import { 
  GraduationCap, Plus, Trash2, Check, X, 
  FileUp, ExternalLink, Image as ImageIcon, 
  FileText, Calendar, Sparkles, TrendingUp
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type SemesterCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
const semesters: SemesterCount[] = [1, 2, 3, 4, 5, 6, 7, 8];

interface ResultEntry {
  id: string;
  subject: string;
  marks: string;
}

interface ResultFile {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
}

interface SemesterData {
  entries: ResultEntry[];
  files: ResultFile[];
}

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState<SemesterCount>(1);
  const { data: resultsRes, isLoading } = useSWR("/api/results", fetcher);
  const allResults = resultsRes?.data || {};

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({ subject: "", marks: "" });
  const [isSaving, setIsSaving] = useState(false);

  const currentData = allResults[activeTab] || { entries: [], files: [] };

  const saveResults = async (semester: number, updatedData: SemesterData) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semester, ...updatedData })
      });
      if (res.ok) {
        mutate("/api/results");
      }
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const entry: ResultEntry = { id: Date.now().toString(), ...newEntry };
    const updated = { ...currentData, entries: [entry, ...currentData.entries] };
    await saveResults(activeTab, updated);
    setIsAddOpen(false);
    setNewEntry({ subject: "", marks: "" });
    toast.success("Result added!");
  };

  const deleteEntry = async (id: string) => {
    const updated = { ...currentData, entries: currentData.entries.filter((e: ResultEntry) => e.id !== id) };
    await saveResults(activeTab, updated);
    toast.error("Entry removed");
  };

  const deleteFile = async (id: string) => {
    const updated = { ...currentData, files: currentData.files.filter((f: ResultFile) => f.id !== id) };
    await saveResults(activeTab, updated);
    toast.error("File removed");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, you'd upload to S3/Cloudinary. 
    // Here we use Base64 as a shortcut since we don't have a storage bucket configured
    const reader = new FileReader();
    reader.onloadend = async () => {
      const resultFile: ResultFile = {
        id: Date.now().toString(),
        fileName: file.name,
        fileType: file.type,
        fileUrl: reader.result as string
      };
      const updated = { ...currentData, files: [resultFile, ...currentData.files] };
      await saveResults(activeTab, updated);
      toast.success("File uploaded");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Academic Records</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Track your growth across all semesters.</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-1 shadow-sm">
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => setActiveTab(sem)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === sem
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              S{sem}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Results Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
              Semester {activeTab} Results
            </h3>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {currentData.entries.map((entry: ResultEntry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{entry.subject}</p>
                      <p className="text-2xl font-black text-emerald-500">{entry.marks}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteEntry(entry.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {currentData.entries.length === 0 && (
            <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No manual entries yet</p>
            </div>
          )}
        </div>

        {/* Sidebar: Documents */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-600" />
            Documents
          </h3>
          
          <label className="block p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-indigo-500/20 hover:border-indigo-500/50 transition-all cursor-pointer text-center group">
            <div className="p-4 bg-indigo-500/10 rounded-3xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
              <FileUp className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-white">Upload Transcript</p>
            <p className="text-xs font-medium text-slate-500 mt-1">PDF or image supported</p>
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>

          <div className="space-y-3">
            {currentData.files.map((file: ResultFile) => (
              <div key={file.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {file.fileType.includes("image") ? <ImageIcon className="w-4 h-4 text-slate-400" /> : <FileText className="w-4 h-4 text-slate-400" />}
                  </div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{file.fileName}</p>
                </div>
                <div className="flex items-center gap-1">
                  <a href={file.fileUrl} target="_blank" className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => deleteFile(file.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-white/10"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">New Record</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
                <input 
                  required autoFocus value={newEntry.subject} 
                  onChange={e => setNewEntry({...newEntry, subject: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-800 dark:text-white font-bold outline-none ring-indigo-500/20 focus:ring-4 transition-all"
                  placeholder="e.g. Thermodynamics"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marks / Grade</label>
                <input 
                  required value={newEntry.marks} 
                  onChange={e => setNewEntry({...newEntry, marks: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-800 dark:text-white font-bold outline-none ring-indigo-500/20 focus:ring-4 transition-all"
                  placeholder="e.g. 9.8 or A+"
                />
              </div>
              <button className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/30 transition-all">
                Add Entry
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
