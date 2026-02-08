"use client";

import { AdminShell, useRequireAdmin } from "@/components/admin";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Home,
  Contact2,
  Settings as UserIcon,
  FileText,
  Trash2,
  RotateCcw,
  ChevronRight,
  Settings,
  Image,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useNotification } from "@/components/providers/notification-provider";

interface SettingsCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  href: string;
}

const settingsCards: SettingsCard[] = [
  {
    title: "Home Page Settings",
    description: "Manage hero section, stats, tech stack, and SEO for the homepage",
    icon: Home,
    iconColor: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    href: "/admin/settings/home",
  },
  {
    title: "About Page Settings",
    description: "Manage headline, bio, toolkit, resume, and profile media",
    icon: UserIcon,
    iconColor: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    href: "/admin/settings/about",
  },
  {
    title: "Contact Settings",
    description: "Update email, social media links, and availability status",
    icon: Contact2,
    iconColor: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    href: "/admin/settings/contact",
  },
  {
    title: "Branding & Logo",
    description: "Upload and manage your site logo for light and dark modes",
    icon: Image,
    iconColor: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    href: "/admin/settings/branding",
  },
  {
    title: "Footer Settings",
    description: "Manage footer links, copyright, and visibility settings",
    icon: LayoutGrid,
    iconColor: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
    href: "/admin/settings/footer",
  },
];

function SettingsCardLink({ card }: { card: SettingsCard }) {
  const Icon = card.icon;
  return (
    <Link
      href={card.href}
      className="group flex items-center gap-4 p-5 rounded-xl bg-surface border border-border hover:border-accent/50 hover:shadow-sm transition-all duration-300"
    >
      <div className={`p-3 rounded-xl ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base mb-0.5 text-foreground">{card.title}</h3>
        <p className="text-sm text-muted-foreground">{card.description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300" />
    </Link>
  );
}

export default function AdminSettingsPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const { success } = useNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<"cache" | "reset" | null>(null);

  if (authLoading) return null;

  const handleAction = async () => {
    // Simulate async action
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (actionType === "cache") {
      success("Cache Cleared", "The application cache has been successfully cleared.");
    } else {
      success("Statistics Reset", "All statistics have been reset to zero.");
    }
    setConfirmOpen(false);
  };

  const openConfirm = (type: "cache" | "reset") => {
    setActionType(type);
    setConfirmOpen(true);
  };

  return (
    <AdminShell>
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5">
              <Settings className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-3xl font-bold font-display text-foreground">Settings</h1>
          </div>
          <p className="text-muted-foreground ml-12">
            Configure your portfolio website settings
          </p>
        </motion.div>

        {/* Settings Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid gap-4"
        >
          {settingsCards.map((card) => (
            <SettingsCardLink key={card.href} card={card} />
          ))}
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl bg-surface border border-border p-5 border-dashed"
        >
          <h2 className="font-semibold mb-3 text-muted-foreground flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Coming Soon
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Resume/CV Upload</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Theme Preferences</span>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl bg-red-50 border border-red-100 overflow-hidden dark:bg-rose-950/10 dark:border-rose-500/20"
        >
          <div className="p-5 border-b border-red-100 dark:border-rose-500/10 bg-red-50/50">
            <h2 className="font-semibold text-red-600 dark:text-rose-400">Danger Zone</h2>
            <p className="text-sm text-red-500/80 dark:text-rose-400/70 mt-1">
              Irreversible actions that affect your website
            </p>
          </div>
          <div className="p-5 flex flex-wrap gap-3 bg-white dark:bg-transparent">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openConfirm("cache")}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openConfirm("reset")}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Statistics
            </Button>
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleAction}
        title={actionType === "cache" ? "Clear Application Cache?" : "Reset All Statistics?"}
        description={
          actionType === "cache"
            ? "This will remove all cached data. The next page load might be slower as cache is rebuilt."
            : "This will reset all manual and automatic statistics to zero. This action cannot be undone."
        }
        confirmText={actionType === "cache" ? "Clear Cache" : "Reset Stats"}
        variant="destructive"
      />
    </AdminShell>
  );
}
