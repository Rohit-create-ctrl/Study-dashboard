"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { 
  BookOpen, Plus, Trash2, Edit2, Check, X, 
  Loader2, Calculator, Atom, Code, Globe, Dna, 
  Search, Filter, Sparkles, FileUp, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const IconMap: Record<string, any> = {
  Calculator, Atom, Code, BookOpen, Globe, Dna
};

interface MaterialFile {
  id: string;
  name: string;
  type: string;
  url: string;
}

export default function SubjectsPage() {
  const { data: response, isLoading } = useSWR("/api/subjects", fetcher);
  const subjects = response?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSub, setNewSub] = useState({ title: "", icon: "BookOpen" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSub),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Subject added successfully!");
        mutate("/api/subjects");
        setIsModalOpen(false);
        setNewSub({ title: "", icon: "BookOpen" });
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure? This will delete all tasks and notes for this subject.")) return;

    try {
      const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Subject deleted");
        mutate("/api/subjects");
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete subject");
    }
  };

  const handleFileUpload = async (subjectId: string, currentMaterials: MaterialFile[] = [], e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("File is too large (max 4MB)");
      return;
    }

    setUploadingId(subjectId);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const resultFile = { 
        id: Date.now().toString(), 
        name: file.name, 
        type: file.type, 
        url: reader.result as string 
      };
      
      const updatedMaterials = [...currentMaterials, resultFile];
      
      try {
        const res = await fetch(`/api/subjects/${subjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ materials: updatedMaterials })
        });
        if (res.ok) {
          mutate("/api/subjects");
          toast.success("Material uploaded");
        } else {
          toast.error("Failed to upload material");
        }
      } catch (err) {
        toast.error("Upload error");
      } finally {
        setUploadingId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteMaterial = async (subjectId: string, materialId: string, currentMaterials: MaterialFile[]) => {
    if (!confirm("Delete this material?")) return;
    const updatedMaterials = currentMaterials.filter(m => m.id !== materialId);
    try {
      const res = await fetch(`/api/subjects/${subjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materials: updatedMaterials })
      });
      if (res.ok) {
        mutate("/api/subjects");
        toast.error("Material deleted");
      }
    } catch (err) {
      toast.error("Failed to delete material");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Subjects</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage your course modules and track progress.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Add New Subject
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-[2rem] bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-white/5" />
          ))
        ) : (
          <AnimatePresence>
            {subjects.map((sub: any, i: number) => {
              const Icon = IconMap[sub.icon] || BookOpen;
              const materials = sub.materials || [];
              const isExpanded = expandedId === sub._id;
              
              return (
                <motion.div
                  key={sub._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className="p-8 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : sub._id)}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8" />
                      </div>
                      <button 
                        onClick={(e) => handleDelete(sub._id, e)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 line-clamp-1">{sub.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5" />
                      Custom Subject
                    </div>

                    <div className={`mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 transition-opacity ${isExpanded ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}>
                      View Materials ({materials.length})
                      <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-45"}`}>
                        <X className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-8 border-t border-dashed border-slate-200 dark:border-white/10"
                      >
                        <div className="mt-6 flex flex-col gap-4">
                          <label className="w-full flex items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer group/upload">
                            {uploadingId === sub._id ? (
                              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                            ) : (
                              <>
                                <FileUp className="w-5 h-5 text-slate-400 group-hover/upload:text-indigo-500 transition-colors" />
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover/upload:text-indigo-500 transition-colors">Upload Material</span>
                              </>
                            )}
                            <input type="file" className="hidden" accept="image/*,application/pdf" disabled={uploadingId === sub._id} onChange={(e) => handleFileUpload(sub._id, materials, e)} />
                          </label>

                          <div className="space-y-3 mt-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {materials.map((m: MaterialFile) => (
                              <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-white/5 group/file hover:border-indigo-500/30 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg shrink-0">
                                    {m.type.includes("pdf") ? <FileUp className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                                  </div>
                                  <a href={m.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate hover:text-indigo-600 transition-colors mb-0.5">
                                    {m.name}
                                  </a>
                                </div>
                                <button onClick={() => deleteMaterial(sub._id, m.id, materials)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors opacity-0 group-hover/file:opacity-100 shrink-0">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                            {materials.length === 0 && (
                              <p className="text-xs text-center text-slate-400 font-medium py-2">No materials uploaded yet.</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Empty State */}
      {!isLoading && subjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-full shadow-lg mb-6">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          </div>
          <h4 className="text-xl font-black text-slate-800 dark:text-white">No subjects found</h4>
          <p className="text-sm font-medium text-slate-500 mt-2">Start by adding your first course module.</p>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-white/10"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">New Subject</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Subject Name</label>
                <input 
                  required
                  autoFocus
                  value={newSub.title}
                  onChange={(e) => setNewSub({...newSub, title: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-800 dark:text-white font-bold focus:ring-4 ring-indigo-500/10 outline-none transition-all"
                  placeholder="e.g. Advanced Calculus"
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Pick an Icon</label>
                <div className="grid grid-cols-6 gap-3">
                  {Object.keys(IconMap).map((key) => {
                    const Icon = IconMap[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewSub({...newSub, icon: key})}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          newSub.icon === key 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-110" 
                            : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Subject"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
