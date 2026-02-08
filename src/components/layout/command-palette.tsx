"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Briefcase,
  User,
  Code,
  Mail,
  Download,
  MessageSquare
} from "lucide-react";

type CommandItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  group: "Navigation" | "Actions" | "Social";
};

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Toggle and ESC key logic
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Open with Ctrl/Cmd + K
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      // Close with ESC
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        close();
      }
    };

    const openHandler = () => setIsOpen(true);

    document.addEventListener("keydown", down);
    window.addEventListener("open-command-palette", openHandler);

    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-palette", openHandler);
    };
  }, [isOpen]);

  // Auto-close on route change
  useEffect(() => {
    if (isOpen) {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const close = () => {
    setIsOpen(false);
    setQuery("");
  };

  const navTo = (path: string) => {
    router.push(path);
    close();
  };

  const items: CommandItem[] = [
    { id: "home", label: "Home", icon: User, group: "Navigation", action: () => navTo("/") },
    { id: "projects", label: "Projects", icon: Code, group: "Navigation", action: () => navTo("/projects") },
    { id: "blog", label: "Blog", icon: FileText, group: "Navigation", action: () => navTo("/blog") },
    { id: "services", label: "Services", icon: Briefcase, group: "Navigation", action: () => navTo("/services") },
    { id: "contact", label: "Contact", icon: Mail, group: "Navigation", action: () => navTo("/contact") },
    {
      id: "email",
      label: "Copy Email",
      icon: Mail,
      group: "Actions",
      action: () => {
        navigator.clipboard.writeText("hello@devstudio.com");
        close();
        alert("Email copied to clipboard!");
      }
    },
    {
      id: "whatsapp",
      label: "Open WhatsApp",
      icon: MessageSquare,
      group: "Social",
      action: () => {
        window.open("https://wa.me/1234567890", "_blank");
        close();
      }
    },
    {
      id: "cv",
      label: "Download CV",
      icon: Download,
      group: "Actions",
      action: () => {
        // Trigger download
        close();
      }
    },
  ];

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          data-testid="command-palette"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
            data-testid="command-palette-backdrop"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                className="flex-1 h-12 px-3 bg-transparent outline-none placeholder:text-muted-foreground"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <div className="text-xs text-muted-foreground px-1.5 py-0.5 border border-border rounded">Esc</div>
            </div>

            <div className="py-2 max-h-[60vh] overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No results found.
                </div>
              ) : (
                <div className="flex flex-col">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-muted/50 transition-colors group"
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                      <span className="flex-1">{item.label}</span>
                      <span className="text-xs text-muted-foreground opacity-50">{item.group}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-2 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Navigation</span>
              <div className="flex gap-2">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
