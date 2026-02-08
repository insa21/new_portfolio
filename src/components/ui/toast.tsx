"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: (id: string) => void;
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  loading: <Loader2 className="w-5 h-5 animate-spin" />,
};

const toastStyles: Record<ToastType, string> = {
  success:
    "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  error:
    "bg-red-500/10 border-red-500/20 text-red-400 dark:bg-red-500/10 dark:border-red-500/20",
  warning:
    "bg-amber-500/10 border-amber-500/20 text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
  info: "bg-blue-500/10 border-blue-500/20 text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  loading:
    "bg-accent/10 border-accent/20 text-accent dark:bg-accent/10 dark:border-accent/20",
};

const iconBgStyles: Record<ToastType, string> = {
  success: "bg-emerald-500/20",
  error: "bg-red-500/20",
  warning: "bg-amber-500/20",
  info: "bg-blue-500/20",
  loading: "bg-accent/20",
};

export function Toast({
  id,
  type,
  title,
  message,
  dismissible = true,
  action,
  onDismiss,
}: ToastProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-lg",
        "min-w-[320px] max-w-[420px]",
        toastStyles[type]
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 p-1.5 rounded-lg",
          iconBgStyles[type]
        )}
      >
        {toastIcons[type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="font-medium text-sm text-foreground">{title}</p>
        {message && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {message}
          </p>
        )}

        {/* Action button */}
        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              "inline-flex items-center gap-1.5 mt-2 text-sm font-medium",
              "hover:underline transition-colors",
              type === "error" && "text-red-400 hover:text-red-300",
              type === "success" && "text-emerald-400 hover:text-emerald-300",
              type === "warning" && "text-amber-400 hover:text-amber-300",
              type === "info" && "text-blue-400 hover:text-blue-300",
              type === "loading" && "text-accent hover:text-accent/80"
            )}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && type !== "loading" && (
        <button
          onClick={() => onDismiss?.(id)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Progress bar for loading state */}
      {type === "loading" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-xl">
          <motion.div
            className="h-full bg-accent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "linear",
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: ToastProps[]; onDismiss: (id: string) => void }) {
  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
