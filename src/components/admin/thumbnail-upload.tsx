"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";
import { MediaSelectorModal, type Media } from "@/components/ui/media-selector-modal";
import { mediaApi } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

export interface ThumbnailUploadProps {
  /** Current thumbnail URL value */
  value: string;
  /** Callback when thumbnail changes. publicId is provided for Cloudinary cleanup. */
  onChange: (url: string, publicId?: string) => void;
  /** Disable the upload component */
  disabled?: boolean;
  /** Optional className for the container */
  className?: string;
  /** Show compact mode without drag/drop area */
  compact?: boolean;
}

interface UploadApiResponse {
  success: boolean;
  data?: {
    secureUrl: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
  error?: string;
  message?: string;
}

// ============================================================================
// Constants
// ============================================================================

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.gif,.avif';

// ============================================================================
// Component
// ============================================================================

export function ThumbnailUpload({
  value,
  onChange,
  disabled = false,
  className = "",
  compact = false
}: ThumbnailUploadProps) {
  const {
    loading: showLoading,
    update: updateToast,
    error: showError,
    warning
  } = useNotification();

  // State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url' | 'library'>('file');
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInProgressRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset preview error when value changes
  useEffect(() => {
    setPreviewError(false);
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ============================================================================
  // Validation
  // ============================================================================

  const validateFile = useCallback((file: File): string | null => {
    // Check type
    if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
      return 'Invalid file type. Allowed: JPG, PNG, WebP, GIF, AVIF';
    }

    // Check size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }

    // Check minimum size
    if (file.size < 1024) {
      return 'File is too small';
    }

    return null;
  }, []);

  const validateUrl = useCallback((url: string): string | null => {
    const trimmed = url.trim();

    if (!trimmed) {
      return 'Please enter an image URL';
    }

    if (trimmed.length > 2048) {
      return 'URL is too long';
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return 'URL must start with http:// or https://';
      }
    } catch {
      return 'Please enter a valid URL';
    }

    return null;
  }, []);

  // ============================================================================
  // Upload Handlers
  // ============================================================================

  const handleFileUpload = useCallback(async (file: File) => {
    // Prevent concurrent uploads
    if (uploadInProgressRef.current) {
      warning("Please wait", "Upload already in progress");
      return;
    }

    // Validate
    const error = validateFile(file);
    if (error) {
      showError("Invalid file", error);
      return;
    }

    uploadInProgressRef.current = true;
    setIsUploading(true);
    setUploadProgress(0);

    // Create abort controller for this upload
    abortControllerRef.current = new AbortController();

    const toastId = showLoading("Uploading...", file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (real progress would need XMLHttpRequest)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 150);

      // Use mediaApi for upload
      const response = await mediaApi.upload(file);
      const result = response.data as any; // Cast because mediaApi types return unknown

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Success - backend returns Media object
      // Media object has url, publicId, etc.
      onChange(result.url, result.publicId);

      const sizeKB = Math.round(result.size / 1024);
      updateToast(toastId, "success", {
        title: "Upload complete",
        message: `${result.format?.toUpperCase() || 'FILE'} • ${sizeKB}KB`
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        updateToast(toastId, "error", {
          title: "Upload cancelled",
          message: "The upload was cancelled"
        });
        return;
      }

      const message = error instanceof Error ? error.message : 'Upload failed';
      updateToast(toastId, "error", {
        title: "Upload failed",
        message,
        action: {
          label: "Retry",
          onClick: () => handleFileUpload(file)
        }
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      uploadInProgressRef.current = false;
      abortControllerRef.current = null;

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [onChange, showError, showLoading, updateToast, validateFile, warning]);

  const handleUrlUpload = useCallback(async () => {
    // Prevent concurrent uploads
    if (uploadInProgressRef.current) {
      warning("Please wait", "Upload already in progress");
      return;
    }

    const trimmedUrl = urlInput.trim();

    // Validate
    const error = validateUrl(trimmedUrl);
    if (error) {
      setUrlError(error);
      return;
    }

    uploadInProgressRef.current = true;
    setIsUploading(true);
    setUrlError("");

    abortControllerRef.current = new AbortController();

    const toastId = showLoading("Importing image...", "Fetching from URL");

    try {
      // Use mediaApi for URL upload
      const response = await mediaApi.uploadByUrl(trimmedUrl);
      const result = response.data as any;

      // Success
      onChange(result.url, result.publicId);
      setUrlInput("");
      setUploadMode('file'); // Switch back to file mode

      updateToast(toastId, "success", {
        title: "Import complete",
        message: `${result.format?.toUpperCase() || 'IMAGE'} • Imported`
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        updateToast(toastId, "error", {
          title: "Import cancelled",
          message: "The import was cancelled"
        });
        return;
      }

      const message = error instanceof Error ? error.message : 'Import failed';
      setUrlError(message);
      updateToast(toastId, "error", {
        title: "Import failed",
        message
      });
    } finally {
      setIsUploading(false);
      uploadInProgressRef.current = false;
      abortControllerRef.current = null;
    }
  }, [urlInput, onChange, showLoading, updateToast, validateUrl, warning]);

  const handleRemove = useCallback(() => {
    onChange("", undefined);
  }, [onChange]);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        handleFileUpload(file);
      } else {
        showError("Invalid file", "Please drop an image file");
      }
    }
  }, [disabled, isUploading, handleFileUpload, showError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && uploadMode === 'url' && urlInput.trim()) {
      e.preventDefault();
      handleUrlUpload();
    }
  }, [uploadMode, urlInput, handleUrlUpload]);

  // ============================================================================
  // Render
  // ============================================================================

  const handleLibrarySelect = useCallback((media: Media) => {
    onChange(media.url, media.publicId || undefined);
    setLibraryModalOpen(false);
  }, [onChange]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Mode Toggle */}
      <div className="flex items-center gap-2" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={uploadMode === 'file'}
          onClick={() => { setUploadMode('file'); setUrlError(""); }}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${uploadMode === 'file'
            ? 'bg-accent text-accent-foreground'
            : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`}
          disabled={disabled || isUploading}
        >
          <Upload className="w-3.5 h-3.5 inline mr-1.5" />
          Upload File
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={uploadMode === 'url'}
          onClick={() => { setUploadMode('url'); setUrlError(""); }}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${uploadMode === 'url'
            ? 'bg-accent text-accent-foreground'
            : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`}
          disabled={disabled || isUploading}
        >
          <LinkIcon className="w-3.5 h-3.5 inline mr-1.5" />
          From URL
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={uploadMode === 'library'}
          onClick={() => { setUploadMode('library'); setUrlError(""); }}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${uploadMode === 'library'
            ? 'bg-accent text-accent-foreground'
            : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`}
          disabled={disabled || isUploading}
        >
          <ImageIcon className="w-3.5 h-3.5 inline mr-1.5" />
          From Library
        </button>
      </div>

      {/* Current Preview */}
      {value && (
        <div className="relative inline-block group">
          {previewError ? (
            <div className="w-48 h-32 rounded-lg border border-border bg-secondary/30 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-xs">Preview unavailable</p>
              </div>
            </div>
          ) : (
            <img
              src={value}
              alt="Thumbnail preview"
              className="w-48 h-32 object-cover rounded-lg border border-border transition-opacity group-hover:opacity-90"
              onError={() => setPreviewError(true)}
              loading="lazy"
            />
          )}
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
            title="Remove thumbnail"
            aria-label="Remove thumbnail"
          >
            <X className="w-3 h-3" />
          </button>
          {!previewError && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-white flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              Uploaded
            </div>
          )}
        </div>
      )}

      {/* File Upload Mode */}
      {uploadMode === 'file' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-xl transition-all
            ${compact ? 'p-4' : 'p-6'}
            ${isUploading
              ? 'border-accent/50 bg-accent/5'
              : isDragOver
                ? 'border-accent bg-accent/10'
                : 'border-zinc-200 dark:border-border hover:border-accent/50 hover:bg-zinc-50 dark:hover:bg-secondary/50'
            }
            ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
          `}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload image file"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isUploading}
            aria-hidden="true"
          />

          {isUploading ? (
            <div className="text-center space-y-3">
              <div className="relative inline-flex">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Uploading...</p>
              <div className="w-48 h-1.5 bg-secondary rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); cancelUpload(); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className={`mx-auto text-muted-foreground/50 mb-3 ${compact ? 'w-8 h-8' : 'w-10 h-10'}`} />
              <p className="text-sm text-muted-foreground mb-2">
                {isDragOver ? 'Drop image here' : 'Drag & drop an image, or click to select'}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                disabled={disabled}
              >
                <Upload className="w-4 h-4 mr-2" />
                {value ? "Replace Image" : "Choose File"}
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                JPG, PNG, WebP, GIF, AVIF • Max 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL Upload Mode */}
      {uploadMode === 'url' && (
        <div className="space-y-3" onKeyDown={handleKeyDown}>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
                onPaste={(e) => {
                  // Auto-submit on paste if valid URL
                  const pasted = e.clipboardData.getData('text');
                  if (pasted && !validateUrl(pasted)) {
                    setTimeout(() => handleUrlUpload(), 100);
                  }
                }}
                placeholder="https://example.com/image.jpg"
                className={`w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-secondary/50 border outline-none transition-colors ${urlError
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-zinc-200 dark:border-border focus:border-accent'
                  }`}
                disabled={disabled || isUploading}
                aria-invalid={!!urlError}
                aria-describedby={urlError ? "url-error" : undefined}
              />
              {urlError && (
                <p id="url-error" className="text-red-400 text-xs mt-1 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3" />
                  {urlError}
                </p>
              )}
            </div>
            <Button
              type="button"
              onClick={handleUrlUpload}
              disabled={disabled || isUploading || !urlInput.trim()}
              className="shrink-0"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Paste a direct link to an image. The image will be uploaded to our servers.
          </p>
        </div>
      )}

      {/* Library Mode */}
      {uploadMode === 'library' && (
        <div className="text-center py-6">
          <Button
            type="button"
            onClick={() => setLibraryModalOpen(true)}
            disabled={disabled || isUploading}
            className="w-full"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            {value ? "Choose Different Image" : "Choose from Library"}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Select an existing image from your media library.
          </p>
        </div>
      )}

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={libraryModalOpen}
        onClose={() => setLibraryModalOpen(false)}
        onSelect={handleLibrarySelect}
        title="Select Image from Library"
        allowedTypes="images"
      />
    </div>
  );
}

export default ThumbnailUpload;
