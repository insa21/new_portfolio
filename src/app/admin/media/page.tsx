"use client";

import { AdminShell } from "@/components/admin";
import { mediaApi } from "@/lib/api";
import { useEffect, useState, useRef, useCallback } from "react";
import { format } from "date-fns";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Copy,
  Check,
  X,
  FileText,
  Search,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

// ============================================================================
// Types
// ============================================================================

interface Media {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  alt?: string;
  publicId?: string;
  resourceType?: string;
  format?: string;
  bytes?: number;
  createdAt: string;
}

// ============================================================================
// Preview Modal Component
// ============================================================================

function MediaPreviewModal({
  isOpen,
  onClose,
  media,
}: {
  isOpen: boolean;
  onClose: () => void;
  media: Media | null;
}) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !media) return null;

  const isImage = media.mimetype.startsWith("image/");
  const isPdf = media.mimetype === "application/pdf";

  /**
   * Ensure proper filename with correct extension
   */
  const ensureFilename = (filename: string, format?: string): string => {
    if (!format) return filename;
    const ext = `.${format.toLowerCase()}`;
    if (filename.toLowerCase().endsWith(ext)) return filename;
    const baseName = filename.replace(/\.[^.]+$/, '');
    return `${baseName}${ext}`;
  };

  /**
   * Download file using blob approach - same as About page resume download
   */
  const handleDownload = async (e: React.MouseEvent, item: Media) => {
    e.preventDefault();
    e.stopPropagation();

    const filename = ensureFilename(item.filename, item.format);

    try {
      // Fetch the file as blob (same as resume page)
      const response = await fetch(item.url);
      if (!response.ok) throw new Error('Failed to fetch file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open URL directly
      window.open(item.url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2 rounded-lg shrink-0 ${isImage
                ? "bg-purple-500/20 text-purple-400"
                : "bg-blue-500/20 text-blue-400"
                }`}
            >
              {isImage ? (
                <ImageIcon className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{media.filename}</h3>
              <p className="text-sm text-muted-foreground">
                {(media.size / 1024).toFixed(1)} KB •{" "}
                {format(new Date(media.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="#"
              onClick={(e) => handleDownload(e, media)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-muted/20 p-4 flex items-center justify-center overflow-auto">
          {isImage && (
            <img
              src={media.url}
              alt={media.alt || media.filename}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          )}
          {isPdf && (
            <div className="w-full h-full relative rounded-lg overflow-hidden bg-surface shadow-lg border border-border group flex flex-col">
              {/* Attempt to show page 1 as an image (Cloudinary PDF-to-Image) */}
              <div className="flex-1 relative bg-white dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                <img
                  src={media.url.replace(/\.pdf$/i, ".jpg")}
                  alt="PDF Preview"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    // Fallback if image conversion fails -> show icon
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement?.classList.add("hidden");
                  }}
                />

                {/* Fallback Icon (visible if img hidden or just as background) */}
                <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center p-8 text-center bg-muted/20">
                  <FileText className="w-20 h-20 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">Preview Image Unavailable</p>
                </div>
              </div>

              {/* Controls Overlay */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button asChild variant="default" size="lg" className="shadow-xl">
                  <a
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(media.url)}&embedded=false`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Open PDF Viewer
                  </a>
                </Button>
              </div>

              {/* Footer Actions */}
              <div className="bg-surface/90 backdrop-blur border-t border-border p-3 flex justify-between items-center">
                <span className="text-xs text-muted-foreground px-2">Page 1 Preview</span>
                <Button asChild size="sm" variant="outline">
                  <a
                    href="#"
                    onClick={(e) => handleDownload(e, media)}
                    className="cursor-pointer"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          )}
          {!isImage && !isPdf && (
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No preview available.</p>
              <Button asChild>
                <a
                  href="#"
                  onClick={(e) => handleDownload(e, media)}
                  className="cursor-pointer"
                >
                  Download to View
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function AdminMediaPage() {
  const {
    error: showError,
    success,
    loading: showLoading,
    update: updateToast,
    info,
  } = useNotification();

  // Data State
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // UI State
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "images" | "documents">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");

  // Modal State
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const limit = 24;

  const loadMedia = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      try {
        const response = await mediaApi.list({
          page,
          limit,
          q: searchQuery || undefined,
          type: typeFilter !== "all" ? typeFilter : undefined,
          sort: sortBy,
        });
        setMedia(response.data as Media[]);
        setTotal(response.meta?.total || 0);
      } catch (error) {
        console.error("Failed to load media:", error);
        showError("Failed to load media", "Could not fetch media library");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, searchQuery, typeFilter, sortBy, showError]
  );

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  useEffect(() => {
    if (page !== 1) setPage(1);
    else loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, typeFilter, sortBy]);

  const handleRefresh = () => {
    if (!isRefreshing) {
      loadMedia(true);
      info("Refreshing", "Fetching latest media...");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = showLoading("Uploading file...", file.name);

    try {
      await mediaApi.upload(file);
      updateToast(toastId, "success", {
        title: "Upload complete",
        message: `${file.name} uploaded successfully`,
      });
      loadMedia();
    } catch (error) {
      console.error("Failed to upload:", error);
      updateToast(toastId, "error", {
        title: "Upload failed",
        message: "Could not upload file. Try again.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!mediaToDelete) return;
    try {
      await mediaApi.delete(mediaToDelete.id);
      success("File deleted", `"${mediaToDelete.filename}" removed permanently`);
      setDeleteModalOpen(false);
      setMediaToDelete(null);
      loadMedia();
    } catch (error) {
      showError("Delete failed", "Could not delete file. Please try again.");
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    success("Link copied", "URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isImage = (mimetype: string) => mimetype.startsWith("image/");
  const totalPages = Math.ceil(total / limit);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display">Media Library</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your assets ({total} files)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*, application/pdf"
              onChange={handleUpload}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload File
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-surface border border-border focus:border-accent outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {/* Type Filter */}
            <div className="flex bg-surface border border-border rounded-lg p-1">
              {(["all", "images", "documents"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${typeFilter === type
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:border-accent outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          /* Skeleton Loading */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] bg-surface rounded-xl border border-border animate-pulse"
              />
            ))}
          </div>
        ) : media.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-2xl border-2 border-dashed border-border">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No media files found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              {searchQuery
                ? "Try adjusting your search or filters."
                : "Upload your first file to get started."}
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              Upload File
            </Button>
          </div>
        ) : (
          /* Media Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="group relative bg-surface rounded-xl border border-border shadow-sm hover:shadow-md hover:border-accent/50 transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Thumbnail */}
                <div
                  className="aspect-square bg-muted/30 flex items-center justify-center relative cursor-pointer overflow-hidden"
                  onClick={() => setPreviewMedia(item)}
                >
                  {isImage(item.mimetype) ? (
                    <img
                      src={item.url}
                      alt={item.alt || item.filename}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="w-12 h-12 mb-2 opacity-60" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        {item.format || "PDF"}
                      </span>
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewMedia(item);
                      }}
                      className="p-2.5 bg-white text-gray-900 rounded-full shadow-lg hover:scale-110 transition-transform"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();

                        // Ensure proper filename with extension
                        const format = item.format;
                        let filename = item.filename;
                        if (format && !filename.toLowerCase().endsWith(`.${format.toLowerCase()}`)) {
                          filename = `${filename.replace(/\.[^.]+$/, '')}.${format}`;
                        }

                        try {
                          // Fetch the file as blob (same as resume page)
                          const response = await fetch(item.url);
                          if (!response.ok) throw new Error('Failed to fetch file');

                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);

                          // Create temporary link and trigger download
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = filename;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);

                          // Cleanup
                          window.URL.revokeObjectURL(url);
                          success("Download complete", filename);
                        } catch (error) {
                          console.error('Download failed:', error);
                          showError("Download failed", "Could not download file");
                          window.open(item.url, '_blank');
                        }
                      }}
                      className="p-2.5 bg-white text-gray-900 rounded-full shadow-lg hover:scale-110 transition-transform"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(item.url, item.id);
                      }}
                      className="p-2.5 bg-white text-gray-900 rounded-full shadow-lg hover:scale-110 transition-transform"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaToDelete(item);
                        setDeleteModalOpen(true);
                      }}
                      className="p-2.5 bg-white text-red-600 rounded-full shadow-lg hover:scale-110 transition-transform hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="p-3 border-t border-border">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p
                      className="font-medium text-sm truncate flex-1"
                      title={item.filename}
                    >
                      {item.filename}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide shrink-0 ${isImage(item.mimetype)
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-blue-500/20 text-blue-400"
                        }`}
                    >
                      {item.format || (isImage(item.mimetype) ? "IMG" : "PDF")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {format(new Date(item.createdAt), "MMM d, yyyy")}
                    </span>
                    <span>{(item.size / 1024).toFixed(0)} KB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="flex justify-center pt-4">
            <div className="inline-flex items-center bg-surface border border-border rounded-full px-2 py-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="h-8 w-8 rounded-full p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-4 text-xs font-medium text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="h-8 w-8 rounded-full p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <MediaPreviewModal
        isOpen={!!previewMedia}
        onClose={() => setPreviewMedia(null)}
        media={previewMedia}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Media"
        message={`Are you sure you want to delete "${mediaToDelete?.filename}"? This cannot be undone.`}
        confirmLabel="Delete Permanently"
        confirmVariant="destructive"
        previewImage={
          mediaToDelete && isImage(mediaToDelete.mimetype)
            ? mediaToDelete.url
            : undefined
        }
      />
    </AdminShell>
  );
}
