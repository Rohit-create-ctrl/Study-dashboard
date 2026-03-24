"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileImage, FileText, Trash2 } from "lucide-react";
import UploadNoteModal from "@/components/UploadNoteModal";

function inferNoteType(file) {
  if (!file) return "pdf";
  if (file.type?.startsWith("image/")) return "image";
  return "pdf";
}

function TypeBadge({ type }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        type === "image"
          ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-100"
          : "border-rose-300/40 bg-rose-300/15 text-rose-100",
      ].join(" ")}
    >
      {type === "image" ? "Image" : "PDF"}
    </span>
  );
}

function NotePreview({ note }) {
  if (note.type === "image") {
    return (
      <img
        src={note.url}
        alt={note.title}
        className="h-36 w-full rounded-xl border border-white/20 object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-36 w-full items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4">
      <div className="rounded-lg border border-white/20 bg-white/10 p-3">
        <FileText className="h-6 w-6 text-rose-200" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{note.fileName}</p>
        <p className="text-xs text-white/70">PDF document</p>
      </div>
    </div>
  );
}

function NoteCard({ note, onOpen, onDelete }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={() => onOpen(note.url)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/25 bg-white/10 p-4 shadow-xl shadow-sky-950/20 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-200/40 hover:bg-white/15"
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(note.url);
        }
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">{note.title}</h3>
          <p className="mt-1 text-xs text-white/60">Click to open in new tab</p>
        </div>
        <TypeBadge type={note.type} />
      </div>

      <NotePreview note={note} />

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(note.id);
        }}
        aria-label={`Delete ${note.title}`}
        className="absolute right-3 top-3 rounded-lg border border-white/20 bg-black/25 p-2 text-white/80 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="pointer-events-none absolute -bottom-10 -right-10 h-20 w-20 rounded-full bg-cyan-300/15 blur-2xl transition group-hover:bg-cyan-200/30" />
    </motion.article>
  );
}

export default function NotesGrid() {
  const [notes, setNotes] = useState([]);
  const activeUrlsRef = useRef(new Set());

  useEffect(() => {
    return () => {
      activeUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      activeUrlsRef.current.clear();
    };
  }, []);

  const sortedNotes = useMemo(() => [...notes].reverse(), [notes]);

  const handleUpload = ({ file, title }) => {
    const type = inferNoteType(file);
    const url = URL.createObjectURL(file);
    activeUrlsRef.current.add(url);

    const uploadedNote = {
      id: crypto.randomUUID(),
      title,
      url,
      type,
      fileName: file.name,
    };

    setNotes((current) => [...current, uploadedNote]);
  };

  const handleDelete = (id) => {
    setNotes((current) => {
      const target = current.find((note) => note.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        activeUrlsRef.current.delete(target.url);
      }
      return current.filter((note) => note.id !== id);
    });
  };

  const handleOpen = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-700 via-indigo-700 to-slate-900 p-6 shadow-2xl shadow-indigo-950/40 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(125,211,252,0.28),transparent_40%),radial-gradient(circle_at_80%_100%,rgba(196,181,253,0.22),transparent_50%)]" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Uploaded Notes</h2>
            <p className="mt-1 text-sm text-sky-100/85">Store and preview your study files instantly.</p>
          </div>
          <UploadNoteModal onUpload={handleUpload} />
        </div>

        {notes.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-white/25 bg-white/5 px-4 text-center">
            <FileImage className="h-10 w-10 text-white/70" />
            <p className="mt-3 text-sm font-medium text-white">No notes uploaded yet</p>
            <p className="mt-1 text-xs text-white/70">Use Upload Notes to add PDFs or images.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            <AnimatePresence>
              {sortedNotes.map((note) => (
                <NoteCard key={note.id} note={note} onOpen={handleOpen} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}