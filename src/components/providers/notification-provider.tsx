"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import { ToastContainer, ToastProps, ToastType } from "@/components/ui/toast";

// Maximum number of visible toasts
const MAX_TOASTS = 5;
// Default auto-dismiss duration in ms
const DEFAULT_DURATION = 4000;
// Duration for loading toasts (longer)
const LOADING_DURATION = 30000;

interface NotificationOptions {
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  // Core toast methods
  toast: (type: ToastType, options: NotificationOptions) => string;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string, retry?: () => void) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  loading: (title: string, message?: string) => string;

  // Update existing toast (useful for loading -> success/error)
  update: (id: string, type: ToastType, options: NotificationOptions) => void;

  // Dismiss toast(s)
  dismiss: (id: string) => void;
  dismissAll: () => void;

  // Promise-based helper for async operations
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ) => Promise<T>;

  // Notification history
  history: NotificationHistoryItem[];
  clearHistory: () => void;
}

export interface NotificationHistoryItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  timestamp: Date;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const recentTitlesRef = useRef<Map<string, number>>(new Map());

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Listen for custom notification events (used by auth-provider to avoid circular deps)
  useEffect(() => {
    const handleNotificationEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message?: string;
      }>;
      const { type, title, message } = customEvent.detail;

      // We need to call toast directly here to avoid stale closures
      // Check for duplicates (except loading toasts)
      const now = Date.now();
      const lastTime = recentTitlesRef.current.get(title);
      if (lastTime && now - lastTime < 2000) {
        return;
      }
      recentTitlesRef.current.set(title, now);

      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const duration = type === "error" ? 6000 : DEFAULT_DURATION;

      const newToast: ToastProps = {
        id,
        type,
        title,
        message,
        duration,
        dismissible: true,
      };

      setToasts((prev) => {
        const updated = prev.length >= MAX_TOASTS ? prev.slice(1) : prev;
        return [...updated, newToast];
      });

      // Add to history
      setHistory((prev) => [
        { id, type, title, message, timestamp: new Date() },
        ...prev.slice(0, 49),
      ]);

      // Set auto-dismiss timer
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        timersRef.current.delete(id);
      }, duration);
      timersRef.current.set(id, timer);
    };

    window.addEventListener('show-notification', handleNotificationEvent);
    return () => {
      window.removeEventListener('show-notification', handleNotificationEvent);
    };
  }, []);

  // Generate unique ID
  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Check for duplicate notifications (within 2 seconds)
  const isDuplicate = (title: string): boolean => {
    const now = Date.now();
    const lastTime = recentTitlesRef.current.get(title);
    if (lastTime && now - lastTime < 2000) {
      return true;
    }
    recentTitlesRef.current.set(title, now);

    // Clean old entries
    recentTitlesRef.current.forEach((time, key) => {
      if (now - time > 5000) {
        recentTitlesRef.current.delete(key);
      }
    });

    return false;
  };

  // Add to history
  const addToHistory = (
    id: string,
    type: ToastType,
    title: string,
    message?: string
  ) => {
    // Don't add loading states to history
    if (type === "loading") return;

    setHistory((prev) => [
      { id, type, title, message, timestamp: new Date() },
      ...prev.slice(0, 49), // Keep last 50 items
    ]);
  };

  // Dismiss a toast
  const dismiss = useCallback((id: string) => {
    // Clear timer if exists
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  // Core toast method
  const toast = useCallback(
    (type: ToastType, options: NotificationOptions): string => {
      // Check for duplicates (except loading toasts)
      if (type !== "loading" && isDuplicate(options.title)) {
        return "";
      }

      const id = generateId();
      const duration =
        options.duration ??
        (type === "loading" ? LOADING_DURATION : DEFAULT_DURATION);

      const newToast: ToastProps = {
        id,
        type,
        title: options.title,
        message: options.message,
        duration,
        dismissible: options.dismissible ?? true,
        action: options.action,
      };

      setToasts((prev) => {
        // Remove oldest if at max
        const updated = prev.length >= MAX_TOASTS ? prev.slice(1) : prev;
        return [...updated, newToast];
      });

      // Add to history
      addToHistory(id, type, options.title, options.message);

      // Set auto-dismiss timer (except for non-dismissible loading)
      if (type !== "loading" || options.dismissible !== false) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss]
  );

  // Update existing toast
  const update = useCallback(
    (id: string, type: ToastType, options: NotificationOptions) => {
      // Clear existing timer
      const existingTimer = timersRef.current.get(id);
      if (existingTimer) {
        clearTimeout(existingTimer);
        timersRef.current.delete(id);
      }

      setToasts((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
              ...t,
              type,
              title: options.title,
              message: options.message,
              action: options.action,
              dismissible: options.dismissible ?? true,
            }
            : t
        )
      );

      // Add to history
      addToHistory(id, type, options.title, options.message);

      // Set new timer
      const duration = options.duration ?? DEFAULT_DURATION;
      const timer = setTimeout(() => {
        dismiss(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  // Convenience methods
  const success = useCallback(
    (title: string, message?: string) =>
      toast("success", { title, message }),
    [toast]
  );

  const error = useCallback(
    (title: string, message?: string, retry?: () => void) =>
      toast("error", {
        title,
        message,
        duration: 6000, // Errors stay longer
        action: retry
          ? {
            label: "Retry",
            onClick: () => {
              dismissAll();
              retry();
            },
          }
          : undefined,
      }),
    [toast, dismissAll]
  );

  const warning = useCallback(
    (title: string, message?: string) =>
      toast("warning", { title, message }),
    [toast]
  );

  const info = useCallback(
    (title: string, message?: string) => toast("info", { title, message }),
    [toast]
  );

  const loading = useCallback(
    (title: string, message?: string) =>
      toast("loading", { title, message, dismissible: false }),
    [toast]
  );

  // Promise helper for async operations
  const promiseHelper = useCallback(
    async <T,>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((err: unknown) => string);
      }
    ): Promise<T> => {
      const id = loading(options.loading);

      try {
        const result = await promise;
        const successMessage =
          typeof options.success === "function"
            ? options.success(result)
            : options.success;
        update(id, "success", { title: successMessage });
        return result;
      } catch (err) {
        const errorMessage =
          typeof options.error === "function"
            ? options.error(err)
            : options.error;
        update(id, "error", {
          title: errorMessage,
          duration: 6000,
        });
        throw err;
      }
    },
    [loading, update]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        toast,
        success,
        error,
        warning,
        info,
        loading,
        update,
        dismiss,
        dismissAll,
        promise: promiseHelper,
        history,
        clearHistory,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}
