"use client";

import { useEffect, useState, useCallback } from "react";
import {
  X,
  Search,
  Check,
  Loader2,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { Button } from "./button";
import { mediaApi } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

export interface Media {
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

export interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: Media) => void;
  title?: string;
  allowedTypes?: "all" | "images" | "documents";
}

// ============================================================================
// Component
// ============================================================================

export function MediaSelectorModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select Media",
  allowedTypes = "all",
}: MediaSelectorModalProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const limit = 12;

  const loadMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await mediaApi.list({
        page,
        limit,
        q: searchQuery || undefined,
        type: allowedTypes !== "all" ? allowedTypes : undefined,
        sort: "newest",
      });
      setMedia(response.data as Media[]);
      setTotal(response.meta?.total || 0);
    } catch (error) {
      console.error("Failed to load media:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, allowedTypes]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      loadMedia();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, loadMedia]);

  useEffect(() => {
    if (page !== 1) setPage(1);
    else loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 150);
  };

  const handleSelect = (item: Media) => {
    setSelectedId(item.id);
    setTimeout(() => {
      onSelect(item);
      handleClose();
    }, 200);
  };

  const isImage = (mimetype: string) => mimetype.startsWith("image/");
  const totalPages = Math.ceil(total / limit);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-200 ${isAnimating ? "opacity-100" : "opacity-0"
        }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-surface rounded-2xl shadow-2xl max-w-4xl w-full border border-border max-h-[85vh] flex flex-col overflow-hidden transition-all duration-200 transform ${isAnimating
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-accent" />
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 bg-muted/20 border-b border-border">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:border-accent outline-none transition-colors"
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Loading library...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No media found</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {searchQuery
                  ? "Try a different search term"
                  : "Upload files in the Media Library first"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {media.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`group relative aspect-square bg-surface border rounded-xl overflow-hidden transition-all duration-200 ${selectedId === item.id
                      ? "border-accent ring-2 ring-accent/30 shadow-md scale-[0.98]"
                      : "border-border hover:border-accent/50 hover:shadow-md"
                    }`}
                >
                  {isImage(item.mimetype) ? (
                    <img
                      src={item.url}
                      alt={item.alt || item.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-muted/30">
                      <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-[10px] text-muted-foreground font-medium truncate w-full text-center px-2">
                        {item.filename}
                      </span>
                    </div>
                  )}

                  {/* Selected Indicator */}
                  {selectedId === item.id && (
                    <div className="absolute inset-0 bg-accent/10 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="bg-accent text-accent-foreground rounded-full p-2 shadow-lg">
                        <Check className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  {selectedId !== item.id && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
                      <span className="bg-surface/90 text-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                        Select
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border bg-surface flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1 || isLoading}
                onClick={() => setPage(page - 1)}
                className="h-8 px-3"
              >
                Previous
              </Button>
              <span className="text-xs font-medium text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages || isLoading}
                onClick={() => setPage(page + 1)}
                className="h-8 px-3"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
