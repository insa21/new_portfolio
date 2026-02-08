"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";
import { useNotification } from "@/components/providers/notification-provider";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // We can't use useNotification here directly because it would cause issues
  // when AuthProvider is mounted before NotificationProvider
  // Instead, we'll use a ref to store the notification function
  const [notification, setNotification] = useState<{
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
  } | null>(null);

  // Update notification ref when context is available
  useEffect(() => {
    // Defer notification setup to avoid provider ordering issues
    const timer = setTimeout(() => {
      try {
        // This will work because by this time, NotificationProvider should be mounted
        setNotification({
          success: (title: string, message?: string) => {
            // Use custom event to communicate with NotificationProvider
            window.dispatchEvent(new CustomEvent('show-notification', {
              detail: { type: 'success', title, message }
            }));
          },
          error: (title: string, message?: string) => {
            window.dispatchEvent(new CustomEvent('show-notification', {
              detail: { type: 'error', title, message }
            }));
          }
        });
      } catch {
        // Fallback - notification not available
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const checkAuth = async () => {
    // Prevent concurrent checks
    if (hasChecked) return;

    try {
      const response = await authApi.me();
      setUser(response.data as User);
    } catch {
      setUser(null);
      // Try to refresh token
      try {
        await authApi.refresh();
        const response = await authApi.me();
        setUser(response.data as User);
      } catch {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
      setHasChecked(true);
    }
  };

  // Check auth only ONCE on initial mount (when on admin routes)
  useEffect(() => {
    if (pathname?.startsWith("/admin") && !hasChecked) {
      checkAuth();
    } else if (!pathname?.startsWith("/admin")) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run only on mount

  // Listen for session expired event from API client
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      notification?.error("Session expired", "Please log in again");
      router.push("/admin/login");
    };

    window.addEventListener('auth-session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth-session-expired', handleSessionExpired);
  }, [notification, router]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const userData = (response.data as { user: User }).user;
      setUser(userData);
      setHasChecked(true);
      notification?.success("Welcome back!", `Logged in as ${userData.name}`);
      router.push("/admin");
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      notification?.success("Logged out", "You have been signed out successfully");
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      setHasChecked(false);
      router.push("/admin/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return { user, isLoading };
}

export function useRequireAdmin() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/admin/login");
      } else if (user?.role !== "ADMIN") {
        router.push("/admin");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return { user, isLoading };
}
