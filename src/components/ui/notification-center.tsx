"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Trash2,
} from "lucide-react";
import { useNotification, NotificationHistoryItem } from "@/components/providers/notification-provider";
import { cn } from "@/lib/utils";
import { ToastType } from "./toast";

const typeIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  error: <XCircle className="w-4 h-4 text-red-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  info: <Info className="w-4 h-4 text-blue-400" />,
  loading: <Info className="w-4 h-4 text-accent" />,
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NotificationItem({ item }: { item: NotificationHistoryItem }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
    >
      <div className="flex-shrink-0 mt-0.5">{typeIcons[item.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {item.title}
        </p>
        {item.message && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {item.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground/60 mt-1">
          {formatTimeAgo(item.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { history, clearHistory } = useNotification();

  const unreadCount = history.filter(
    (item) =>
      new Date().getTime() - item.timestamp.getTime() < 60000 // Consider "unread" if < 1 minute old
  ).length;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          "hover:bg-secondary/50",
          isOpen && "bg-secondary/50"
        )}
        aria-label="Notification Center"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute right-0 top-full mt-2 z-50",
                "w-80 max-h-96 overflow-hidden",
                "bg-surface/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <h3 className="font-medium text-sm">Activity Log</h3>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="p-1.5 rounded-md hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                      aria-label="Clear all notifications"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-md hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-72 p-2">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {history.map((item) => (
                      <NotificationItem key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
