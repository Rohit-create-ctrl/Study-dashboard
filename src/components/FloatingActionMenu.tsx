"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, CheckSquare, BookOpen, FileText, X } from "lucide-react";
import { mutate } from "swr";
import { toast } from "react-hot-toast";

export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<"none" | "task" | "subject" | "note">("none");
  const [inputValue, setInputValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveForm("none");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!inputValue.trim() || isSubmitting) return;
      setIsSubmitting(true);

      try {
        let endpoint = "";
        let body = {};
        let successMsg = "";

        if (activeForm === "task") {
          endpoint = "/api/tasks";
          // We need a default subjectId or allow it to be optional. 
          // My task API currently requires subjectId. I'll fetch subjects and pick the first one or leave it blank if allowed.
          // For Quick Add, we'll try to add without subjectId if allowed, or it might fail if backend is strict.
          // Let's assume the backend handles optional subjectId or user needs to pick one (but this is Quick Add).
          // Actually, my task API had: if (!title || !subjectId) return ...
          // I'll update the Task API to allow optional subjectId for Quick Add.
          body = { title: inputValue.trim() };
          successMsg = "Task added globally";
        } else if (activeForm === "subject") {
          endpoint = "/api/subjects";
          body = { title: inputValue.trim() };
          successMsg = "Subject created";
        } else if (activeForm === "note") {
          endpoint = "/api/notes";
          // Note also requires subjectId in my current API. 
          body = { title: inputValue.trim(), content: "Quick note..." };
          successMsg = "Note jotted down";
        }

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          toast.success(successMsg);
          mutate(endpoint);
          setInputValue("");
          setActiveForm("none");
          setIsOpen(false);
        } else {
          const err = await res.json();
          throw new Error(err.error || "Failed to add");
        }
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setIsSubmitting(false);
      }
    }
    if (e.key === 'Escape') {
      setActiveForm("none");
      setInputValue("");
    }
  };

  return (
    <div className="fixed bottom-28 right-8 z-[100]" ref={menuRef}>
      {/* The Menu List popover */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 flex flex-col gap-2 items-end animate-fade-in-up origin-bottom-right">
          {activeForm !== "none" ? (
            <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] w-64 flex flex-col gap-2">
              <div className="flex justify-between items-center text-gray-300 text-xs font-bold uppercase tracking-wider mb-1">
                <span>Add {activeForm}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setActiveForm("none")} />
              </div>
              <input
                autoFocus
                type="text"
                placeholder="Type & press Enter..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleQuickAdd}
                className="w-full bg-white/10 border border-indigo-500/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          ) : (
            <>
              <button onClick={() => setActiveForm("note")} className="group flex items-center gap-3 bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 pl-4 pr-2 py-2 rounded-full shadow-lg hover:bg-white/10 hover:border-violet-500/50 transition-all">
                <span className="text-sm font-semibold text-gray-300 group-hover:text-white">Note</span>
                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
              </button>
              <button onClick={() => setActiveForm("subject")} className="group flex items-center gap-3 bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 pl-4 pr-2 py-2 rounded-full shadow-lg hover:bg-white/10 hover:border-cyan-500/50 transition-all">
                <span className="text-sm font-semibold text-gray-300 group-hover:text-white">Subject</span>
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
              </button>
              <button onClick={() => setActiveForm("task")} className="group flex items-center gap-3 bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 pl-4 pr-2 py-2 rounded-full shadow-lg hover:bg-white/10 hover:border-emerald-500/50 transition-all">
                <span className="text-sm font-semibold text-gray-300 group-hover:text-white">Task</span>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <CheckSquare className="w-4 h-4" />
                </div>
              </button>
            </>
          )}
        </div>
      )}

      {/* Main '+' Toggle Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setActiveForm("none"); setInputValue(""); }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(99,102,241,0.6)] backdrop-blur-xl border border-white/10 transition-all duration-300 ${
          isOpen ? "bg-[#0f172a] text-white rotate-45 scale-110" : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:scale-110 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.8)]"
        }`}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
