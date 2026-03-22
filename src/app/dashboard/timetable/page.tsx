"use client";

import { useState } from "react";
import { 
  Calendar, Plus, Trash2, Check, X, 
  Clock, FileUp, ExternalLink, BookOpen, 
  Sparkles, LayoutGrid, List
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const semesters = ["sem1", "sem2", "sem3", "sem4", "sem5", "sem6", "sem7", "sem8"] as const;
type SemesterID = typeof semesters[number];

interface TimetableEntry {
  id: string;
  subject: string;
  day: string;
  time: string;
}

interface TimetableFile {
  id: string;
  name: string;
  type: string;
  url: string;
}

interface SemesterData {
  classes: TimetableEntry[];
  files: TimetableFile[];
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TimetablePage() {
  const [activeSem, setActiveSem] = useState<SemesterID>("sem1");
  const { data: timetableRes, isLoading } = useSWR("/api/timetable", fetcher);
  const allTimetables = timetableRes?.data || {};

  const [isSaving, setIsSaving] = useState(false);

  const currentData = allTimetables[activeSem] || { classes: [], files: [] };

  const saveTimetable = async (semester: string, updatedData: SemesterData) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semester, ...updatedData })
      });
      if (!res.ok) {
        let errMessage = `Server error ${res.status}`;
        try {
          const data = await res.json();
          errMessage = data.error || errMessage;
        } catch {
          if (res.status === 413) errMessage = "File is too large (413 Payload Too Large).";
        }
        throw new Error(errMessage);
      }
      mutate("/api/timetable");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to save schedule");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);

    if (file.type.startsWith('image/')) {
      // Compress image client-side to avoid 413 Payload Too Large from Next.js API limits
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200; // max dimension

          if (width > height && width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          } else if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            const resultFile = { 
              id: Date.now().toString(), 
              name: file.name, 
              type: 'image/jpeg', 
              url: compressedUrl 
            };
            const updated = { ...currentData, files: [resultFile, ...(currentData.files || [])] };
            const success = await saveTimetable(activeSem, updated);
            if (success) toast.success("Timetable uploaded");
          }
          setIsSaving(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // Non-image files like PDF (limit to roughly 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large (max 2MB for PDFs).");
        setIsSaving(false);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const resultFile = { 
          id: Date.now().toString(), 
          name: file.name, 
          type: file.type, 
          url: reader.result as string 
        };
        const updated = { ...currentData, files: [resultFile, ...(currentData.files || [])] };
        const success = await saveTimetable(activeSem, updated);
        if (success) toast.success("Timetable uploaded");
        setIsSaving(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...currentData, files: currentData.files.filter((f: TimetableFile) => f.id !== id) };
    const success = await saveTimetable(activeSem, updated);
    if (success) {
      toast.error("File removed");
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Weekly Schedule</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Upload and manage your timetable.</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-1 shadow-sm overflow-x-auto max-w-full">
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => setActiveSem(sem)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSem === sem
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              Sem {sem.replace("sem", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tight text-xs bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
          Semester {activeSem.replace("sem", "")} Timetable
        </h3>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 cursor-pointer">
            <FileUp className="w-5 h-5" />
            {isSaving ? "Uploading..." : "Upload Screenshot"}
            <input type="file" className="hidden" accept="image/*,application/pdf" disabled={isSaving} onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 gap-6">
        {currentData.files.length === 0 ? (
          <div className="p-12 bg-slate-50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] text-center">
            <FileUp className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h4 className="text-xl font-black text-slate-800 dark:text-white mb-2">No timetable uploaded</h4>
            <p className="text-sm font-medium text-slate-500">Upload a screenshot or PDF of your semester's schedule.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {currentData.files.map((file: TimetableFile) => (
              <motion.div 
                layout
                key={file.id} 
                className="relative group rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all"
              >
                {file.type.includes("image") ? (
                  <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
                    <img 
                      src={file.url} 
                      alt="Timetable" 
                      className="max-w-full max-h-full object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-4 text-rose-500">
                      <ExternalLink className="w-10 h-10" />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white line-clamp-2 px-4">{file.name}</span>
                  </div>
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl text-white transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button 
                    onClick={(e) => deleteFile(file.id, e)} 
                    className="p-3 bg-rose-500/80 hover:bg-rose-500 backdrop-blur-md rounded-xl text-white transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
