"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ImageIcon, Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ACCEPTED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg"];
const ACCEPTED_MIME_TYPES = ["application/pdf", "image/png", "image/jpg", "image/jpeg"];

function isAcceptedFile(file) {
  if (!file) return false;

  const extension = file.name.split(".").pop()?.toLowerCase();
  return ACCEPTED_MIME_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(extension || "");
}

export default function UploadNoteModal({ onUpload }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  function resetForm() {
    setFile(null);
    setTitle("");
    setError("");
    setPreviewUrl("");
    setIsDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleDialogChange(nextOpen) {
    if (!nextOpen && !isUploading) {
      resetForm();
    }
    setOpen(nextOpen);
  }

  function handleFileSelection(selectedFile) {
    if (!selectedFile) return;

    if (!isAcceptedFile(selectedFile)) {
      setError("Only PDF, PNG, JPG, and JPEG files are allowed.");
      return;
    }

    setError("");
    setFile(selectedFile);
  }

  function handleInputChange(event) {
    const selectedFile = event.target.files?.[0];
    handleFileSelection(selectedFile);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragOver(false);

    const droppedFile = event.dataTransfer.files?.[0];
    handleFileSelection(droppedFile);
  }

  async function handleUpload() {
    if (!file || !title.trim()) {
      setError("Please add a note title and select a file.");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      if (onUpload) {
        await Promise.resolve(onUpload({ file, title: title.trim() }));
      }
      resetForm();
      setOpen(false);
    } catch (uploadError) {
      setError(uploadError?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-lg transition hover:bg-white/20"
        >
          <Upload className="h-4 w-4" />
          Upload Notes
        </motion.button>
      </DialogTrigger>

      <DialogContent className="rounded-xl border border-white/20 bg-white/10 p-0 text-white shadow-2xl backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="p-6"
        >
          <DialogHeader className="mb-5">
            <DialogTitle className="text-xl">Upload Notes</DialogTitle>
            <DialogDescription className="text-white/70">
              Add a title and upload a PDF or image note.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/90">Note Title</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Organic Chemistry Revision"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none transition focus:border-sky-300/70 focus:ring-2 focus:ring-sky-300/40"
                disabled={isUploading}
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={[
                "relative flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition",
                isDragOver
                  ? "border-sky-300 bg-sky-300/10"
                  : "border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10",
              ].join(" ")}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleInputChange}
                className="hidden"
                disabled={isUploading}
              />

              <Upload className="mb-2 h-6 w-6 text-white/80" />
              <p className="text-sm font-medium text-white">Drag and drop your file here</p>
              <p className="mt-1 text-xs text-white/70">or click to browse (PDF, PNG, JPG, JPEG)</p>
            </motion.div>

            <AnimatePresence>
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="rounded-xl border border-white/20 bg-white/10 p-3"
                >
                  {file.type.startsWith("image/") && previewUrl ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={previewUrl}
                        alt="Selected file preview"
                        className="h-16 w-16 rounded-lg border border-white/20 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{file.name}</p>
                        <p className="text-xs text-white/70">Image file selected</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-white/20 bg-white/10 p-3">
                        <FileText className="h-5 w-5 text-rose-200" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{file.name}</p>
                        <p className="text-xs text-white/70">PDF document selected</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="text-sm text-rose-200">{error}</p>}
          </div>

          <DialogFooter className="mt-6">
            <button
              type="button"
              onClick={() => handleDialogChange(false)}
              disabled={isUploading}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Cancel
            </button>

            <motion.button
              whileHover={{ scale: isUploading ? 1 : 1.02 }}
              whileTap={{ scale: isUploading ? 1 : 0.98 }}
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !file || !title.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              {isUploading ? "Uploading..." : "Upload"}
            </motion.button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
