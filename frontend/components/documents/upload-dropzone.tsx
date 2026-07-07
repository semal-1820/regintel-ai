"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, XCircle, X, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "uploading" | "success" | "error";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadDropzone() {
  const [dragging, setDragging] = React.useState(false);
  const [state, setState] = React.useState<UploadState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [file, setFile] = React.useState<{ name: string; size: number } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  function startUpload(f: { name: string; size: number }) {
    const okType = /\.(pdf|docx?|pptx?)$/i.test(f.name);
    if (!okType) {
      toast({ variant: "error", title: "Unsupported file type", description: "Upload a PDF or Word document." });
      return;
    }

    setFile(f);
    setState("uploading");
    setProgress(0);

    const willFail = Math.random() < 0.15;
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 18 + 8;
        if (next >= 100) {
          clearInterval(interval);
          if (willFail) {
            setState("error");
            toast({ variant: "error", title: "Upload failed", description: `${f.name} could not be processed. Check the file and try again.` });
          } else {
            setState("success");
            toast({ variant: "success", title: "Upload complete", description: `${f.name} is now being analyzed by RegIntel-AI.` });
            setTimeout(() => { setState("idle"); setFile(null); }, 2400);
          }
          return 100;
        }
        return next;
      });
    }, 220);
  }

  function reset() {
    setState("idle");
    setFile(null);
    setProgress(0);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (state === "idle") setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f && state === "idle") startUpload({ name: f.name, size: f.size });
      }}
      onClick={() => state === "idle" && inputRef.current?.click()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        dragging ? "border-primary bg-primary-tint" : "border-border bg-surface hover:border-primary/40",
        state !== "idle" && "cursor-default"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) startUpload({ name: f.name, size: f.size }); }}
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

        {state === "uploading" && file && (
          <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full max-w-sm flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-muted p-3 text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary"><FileText className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{file.name}</p>
                <p className="text-[11px] text-foreground-muted">{formatBytes(file.size)}</p>
              </div>
            </div>
            <Progress value={Math.min(progress, 100)} className="w-full" />
            <p className="text-xs text-foreground-muted">Extracting obligations · {Math.round(Math.min(progress, 100))}%</p>
          </motion.div>
        )}

        {state === "success" && file && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="flex h-12 w-12 items-center justify-center rounded-full bg-success-tint text-success">
              <CheckCircle2 className="h-6 w-6" />
            </motion.div>
            <p className="text-sm font-medium text-foreground">{file.name} uploaded — AI analysis in progress</p>
          </motion.div>
        )}

        {state === "error" && file && (
          <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-tint text-danger">
              <XCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">{file.name} failed to upload</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={reset}><X className="h-3.5 w-3.5" /> Cancel</Button>
              <Button size="sm" onClick={() => startUpload(file)}><RotateCcw className="h-3.5 w-3.5" /> Retry</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}