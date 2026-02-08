"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "./button";

// ============================================================================
// Types
// ============================================================================

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive";
  isLoading?: boolean;
  previewImage?: string;
  previewAlt?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "default",
  isLoading = false,
  previewImage,
  previewAlt,
}: ConfirmationModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading]);

  const handleClose = () => {
    if (isLoading) return;
    setIsAnimating(false);
    setTimeout(onClose, 150); // Wait for animation
  };

  const handleConfirm = () => {
    if (isLoading) return;
    onConfirm();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-150 ${isAnimating ? "opacity-100" : "opacity-0"
        }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 transition-all duration-150 ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h2
            id="modal-title"
            className="text-xl font-bold text-zinc-900 dark:text-white mb-2"
          >
            {title}
          </h2>

          {/* Message */}
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">{message}</p>

          {/* Preview Image (if provided) */}
          {previewImage && (
            <div className="mb-6 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <img
                src={previewImage}
                alt={previewAlt || "Preview"}
                className="w-full h-32 object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              variant={confirmVariant}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
