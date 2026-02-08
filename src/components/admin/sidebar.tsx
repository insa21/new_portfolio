"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Award,
  Briefcase,
  FlaskConical,
  Image,
  Mail,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Home,
  Palette,
} from "lucide-react";
import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { contactApi } from "@/lib/api";

// Type definitions for navigation items
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasBadge?: boolean;
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// Grouped navigation sections
const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/posts", label: "Blog Posts", icon: FileText },
      { href: "/admin/experiments", label: "Experiments", icon: FlaskConical },
      { href: "/admin/certifications", label: "Certifications", icon: Award },
      { href: "/admin/services", label: "Services", icon: Briefcase },
    ],
  },
  {
    title: "Media & Messages",
    items: [
      { href: "/admin/media", label: "Media Library", icon: Image },
      { href: "/admin/contact", label: "Messages", icon: Mail, hasBadge: true },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
      { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
    ],
  },
];

export interface AdminSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function AdminSidebar({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await contactApi.getUnreadCount();
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Listen for custom events to refresh count (when message is marked as read)
  useEffect(() => {
    const handleMessageRead = () => {
      fetchUnreadCount();
    };
    window.addEventListener('message-read', handleMessageRead);
    return () => window.removeEventListener('message-read', handleMessageRead);
  }, [fetchUnreadCount]);

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Header / Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-border shrink-0",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20">
              <Palette className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Admin</span>
          </Link>
        )}

        {/* Desktop Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>

        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={() => setIsMobileOpen(false)}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        {navSections.map((section) => {
          // Filter items based on admin role
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || user?.role === "ADMIN"
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="mb-6 last:mb-0">
              {/* Section Title */}
              {!isCollapsed && (
                <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 font-display">
                  {section.title}
                </h3>
              )}

              {/* Section Items */}
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
                          active
                            ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/80",
                          isCollapsed && "justify-center px-0 h-10 w-10 mx-auto"
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        {/* Active Indicator for Collapsed Mode */}
                        {isCollapsed && active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent-foreground rounded-r-full" />
                        )}

                        <Icon className={cn(
                          "w-5 h-5 shrink-0 transition-all duration-200",
                          !active && "group-hover:scale-110",
                          isCollapsed && "w-5 h-5"
                        )} />
                        {!isCollapsed && <span>{item.label}</span>}

                        {item.hasBadge && !isCollapsed && unreadCount > 0 && (
                          <span className="ml-auto flex items-center gap-1">
                            <span className="min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold bg-amber-500 text-white rounded-full shadow-sm">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          </span>
                        )}

                        {/* Dot badge for collapsed state */}
                        {item.hasBadge && isCollapsed && unreadCount > 0 && (
                          <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-background" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="border-t border-border p-3 shrink-0 bg-secondary/10">
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-surface border border-border/50 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-inner">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{user.name}</p>
              <p className="text-[11px] font-medium text-muted-foreground tracking-wide">{user.role}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          className={cn(
            "w-full text-muted-foreground hover:text-destructive hover:bg-destructive-light/50 transition-colors",
            isCollapsed ? "justify-center h-9 w-9 mx-auto" : "justify-start"
          )}
          onClick={() => logout()}
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background/95 backdrop-blur-xl border-r border-border shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 z-40 bg-surface/50 border-r border-border transition-all duration-300 flex-col backdrop-blur-sm",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
