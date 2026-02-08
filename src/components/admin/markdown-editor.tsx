"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold,
  Italic,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  List,
  Eye,
  Edit2,
  Maximize2,
  Minimize2,
  Upload,
  Library,
  X,
  Loader2,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { mediaApi } from "@/lib/api";
import { useNotification } from "@/components/providers/notification-provider";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimetype: string;
  createdAt: string;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

export function MarkdownEditor({ value, onChange, className, required }: MarkdownEditorProps) {
  const [mode, setMode] = useState<"write" | "preview" | "split">("write");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageMenuRef = useRef<HTMLDivElement>(null);
  const { loading, update: updateToast, error: showError } = useNotification();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (imageMenuRef.current && !imageMenuRef.current.contains(e.target as Node)) {
        setShowImageMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchMediaLibrary = async () => {
    setLoadingMedia(true);
    try {
      const response = await mediaApi.list();
      const items = (response.data as any[]).filter((m: any) =>
        m.mimetype?.startsWith('image/')
      );
      setMediaItems(items);
    } catch (error) {
      showError("Failed to load", "Could not load media library");
    } finally {
      setLoadingMedia(false);
    }
  };

  const openLibraryModal = () => {
    setShowImageMenu(false);
    setShowLibraryModal(true);
    fetchMediaLibrary();
  };

  const insertMediaImage = (media: MediaItem) => {
    const altText = media.filename.split('.')[0];
    insertText(`![${altText}](${media.url})`);
    setShowLibraryModal(false);
  };

  const handleUploadClick = () => {
    setShowImageMenu(false);
    fileInputRef.current?.click();
  };

  const insertText = (startTag: string, endTag: string = "") => {
    const textarea = document.getElementById("markdown-editor-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = `${before}${startTag}${selection}${endTag}${after}`;
    onChange(newText);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, end + startTag.length);
    }, 0);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError("Invalid file", "Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("File too large", "Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const toastId = loading("Uploading image...", file.name);

    try {
      const response = await mediaApi.upload(file);
      const result = response.data as any; // Media object

      updateToast(toastId, "success", {
        title: "Image uploaded",
        message: "Image inserted into editor"
      });

      // Insert markdown
      insertText(`![${file.name.split('.')[0]}](${result.url})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      updateToast(toastId, "error", {
        title: "Upload failed",
        message
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const tools = [
    { icon: Bold, label: "Bold", action: () => insertText("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertText("*", "*") },
    { icon: Heading2, label: "Heading", action: () => insertText("## ") },
    { icon: LinkIcon, label: "Link", action: () => insertText("[", "](url)") },
    { icon: ImageIcon, label: "Image", action: handleImageClick, isActive: isUploading },
    { icon: Code, label: "Code Block", action: () => insertText("```\n", "\n```") },
    { icon: Quote, label: "Quote", action: () => insertText("> ") },
    { icon: List, label: "List", action: () => insertText("- ") },
  ];

  return (
    <div className={cn(
      "flex flex-col border border-border rounded-xl bg-surface overflow-hidden transition-all duration-200",
      isFullscreen && "fixed inset-0 z-50 rounded-none h-screen",
      className
    )}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-zinc-50 dark:bg-muted/30">
        <div className="flex items-center gap-1">
          {tools.filter(t => t.label !== "Image").map((tool) => (
            <Button
              key={tool.label}
              type="button"
              variant="ghost"
              size="sm"
              onClick={tool.action}
              disabled={isUploading}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}

          {/* Image dropdown */}
          <div className="relative" ref={imageMenuRef}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowImageMenu(!showImageMenu)}
              disabled={isUploading}
              className={cn(
                "h-8 px-2 gap-1 text-muted-foreground hover:text-foreground hover:bg-muted",
                isUploading && "animate-pulse"
              )}
              title="Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </Button>

            {showImageMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-secondary border border-zinc-200 dark:border-border rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-muted transition-colors"
                >
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={openLibraryModal}
                  className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-muted transition-colors"
                >
                  <Library className="w-4 h-4 text-muted-foreground" />
                  From Library
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-2 ml-2">
          <div className="flex bg-muted/50 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                mode === "write" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setMode("split")}
              className={cn(
                "hidden md:block px-3 py-1 text-xs font-medium rounded-md transition-all",
                mode === "split" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Split
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                mode === "preview" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Preview
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex min-h-[500px] relative">
        {/* Write Pane */}
        <div className={cn(
          "flex-1 flex flex-col transition-all",
          mode === "preview" && "hidden"
        )}>
          <textarea
            id="markdown-editor-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 w-full p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed"
            placeholder="Write your story..."
            required={required}
            disabled={isUploading}
          />
        </div>

        {/* Divider for Split Mode */}
        {mode === "split" && (
          <div className="w-px bg-border hover:bg-accent/50 cursor-col-resize transition-colors" />
        )}

        {/* Preview Pane */}
        <div className={cn(
          "flex-1 bg-muted/10 overflow-y-auto transition-all",
          mode === "write" && "hidden",
          mode === "split" && "border-l border-border"
        )}>
          <div className="prose prose-sm dark:prose-invert max-w-none p-6 md:p-8 prose-headings:font-display prose-headings:font-bold prose-a:text-accent prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value || "*Nothing to preview*"}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="px-4 py-2 border-t border-border bg-zinc-50 dark:bg-muted/30 text-xs text-muted-foreground flex justify-between items-center">
        <span>Markdown Supported {isUploading && "• Uploading image..."}</span>
        <span>{value.length} chars • {value.split(/\s+/).filter(Boolean).length} words</span>
      </div>

      {/* Media Library Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden border border-zinc-200 dark:border-border">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-border">
              <h2 className="font-semibold text-lg">Media Library</h2>
              <button
                type="button"
                onClick={() => setShowLibraryModal(false)}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loadingMedia ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Library className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No images in library</p>
                  <p className="text-sm">Upload images to see them here</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaItems.map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => insertMediaImage(media)}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-border hover:border-accent transition-colors"
                    >
                      <img
                        src={media.url}
                        alt={media.filename}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Insert
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
