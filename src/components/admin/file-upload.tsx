"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";

export interface FileUploadProps {
  /** Current file URL value */
  value: string;
  /** Callback when file changes */
  onChange: (url: string) => void;
  /** Disable the upload component */
  disabled?: boolean;
  /** Optional className for the container */
  className?: string;
  /** Accept types (e.g. "image/*,application/pdf") */
  accept?: string;
  /** Button label */
  label?: string;
  /** Helper text */
  helperText?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload({
  value,
  onChange,
  disabled = false,
  className = "",
  accept = "image/*,application/pdf",
  label = "Upload File",
  helperText = "PDF or Image up to 10MB"
}: FileUploadProps) {
  const { loading: showLoading, update: updateToast, error: showError, warning } = useNotification();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf = value?.toLowerCase().endsWith('.pdf');
  const isImage = value?.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i);

  const handleUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      showError("File too large", "Maximum file size is 10MB");
      return;
    }

    setIsUploading(true);
    const toastId = showLoading("Uploading...", file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      onChange(result.data.secureUrl);
      updateToast(toastId, "success", {
        title: "Upload complete",
        message: file.name
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      updateToast(toastId, "error", { title: "Upload failed", message });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, [disabled, isUploading]);

  return (
    <div className={className}>
      {value ? (
        <div className="relative group border border-border rounded-xl overflow-hidden bg-secondary/30">
          <div className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              {isPdf ? (
                <FileText className="w-6 h-6 text-red-400" />
              ) : isImage ? (
                <img src={value} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <File className="w-6 h-6 text-blue-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {value.split('/').pop()}
              </p>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline mt-0.5 inline-block"
              >
                View file
              </a>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => onChange("")}
              disabled={disabled || isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
            ${dragActive ? "border-accent bg-accent/5" : "border-border hover:border-input-border hover:bg-secondary"}
            ${(disabled || isUploading) ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            disabled={disabled || isUploading}
          />

          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{helperText}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
