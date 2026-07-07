"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "uploading" | "success";

export function UploadDropzone() {
  const [dragging, setDragging] = React.useState(false);
  const [state, setState] = React.useState<UploadState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [fileName, setFileName] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  function startUpload(name: string) {
    setFileName(name);
    setState("uploading");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setState("success");
          setTimeout(() => setState("idle"), 2200);
          return 100;
        }
        return p + Math.random() * 18 + 8;
      });
    }, 220);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) startUpload(f.name);
      }}
      onClick={() => state === "idle" && inputRef.current?.click()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        dragging ? "border-primary bg-primary-tint" : "border-border bg-surface hover:border-primary/40"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) startUpload(f.name); }}
      />
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-tint text-primary">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Drag & drop a SEBI circular here, or click to browse</p>
            <p className="text-xs text-foreground-muted">Supports PDF, DOCX up to 25MB — AI extraction starts automatically</p>
          </motion.div>
        )}
        {state === "uploading" && (
          <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full max-w-sm flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-tint text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
            <Progress value={Math.min(progress, 100)} className="w-full" />
            <p className="text-xs text-foreground-muted">Extracting obligations · {Math.round(Math.min(progress, 100))}%</p>
          </motion.div>
        )}
        {state === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="flex h-12 w-12 items-center justify-center rounded-full bg-success-tint text-success">
              <CheckCircle2 className="h-6 w-6" />
            </motion.div>
            <p className="text-sm font-medium text-foreground">Upload complete — AI analysis in progress</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
