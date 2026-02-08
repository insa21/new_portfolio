"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/ui/notification-center";
import { ExternalLink, ChevronRight, Home, Menu } from "lucide-react";
import { useAuth } from "./auth-provider";
import Link from "next/link";

interface AdminHeaderProps {
  onMobileMenuClick?: () => void;
}

// Map paths to breadcrumb labels
const pathLabels: Record<string, string> = {
  admin: "Dashboard",
  projects: "Projects",
  posts: "Blog Posts",
  certifications: "Certifications",
  services: "Services",
  experiments: "Experiments",
  media: "Media Library",
  contact: "Messages",
  users: "Users",
  settings: "Settings",
  new: "Create New",
  edit: "Edit",
  home: "Home Settings",
};

export function AdminHeader({ onMobileMenuClick }: AdminHeaderProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname?.split("/").filter(Boolean) || [];
    const breadcrumbs: { label: string; href: string }[] = [];

    segments.forEach((segment, index) => {
      // Skip ID-like segments (UUIDs or long alphanumeric strings)
      if (segment.length > 20 || /^[0-9a-f-]{36}$/i.test(segment)) {
        return;
      }

      const href = "/" + segments.slice(0, index + 1).join("/");
      const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, href });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-xl border-b border-border transition-all duration-300">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left side - Breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuClick}
            className="lg:hidden text-muted-foreground hover:text-foreground -ml-2"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <nav className="flex items-center gap-1.5 text-sm">
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
            {breadcrumbs.slice(1).map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                {index === breadcrumbs.length - 2 ? (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1">
          {/* Notification Center */}
          <NotificationCenter />

          {/* Theme toggle */}
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Divider */}
          <div className="w-px h-6 bg-border mx-2" />

          {/* View site */}
          <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/" target="_blank">
              <span className="hidden sm:inline">View Site</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>

          {/* User avatar */}
          {user && (
            <div className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20 flex items-center justify-center text-sm font-semibold text-accent">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
