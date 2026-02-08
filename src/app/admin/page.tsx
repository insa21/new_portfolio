"use client";

import { AdminShell } from "@/components/admin";
import { statsApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FolderKanban,
  FileText,
  Award,
  FlaskConical,
  Mail,
  Plus,
  ArrowUpRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Stats {
  projectsCount: number;
  postsCount: number;
  certificationsCount: number;
  experimentsCount: number;
  unreadContactsCount: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
  delay = 0,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  href: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Link
        href={href}
        className="group block p-6 rounded-xl bg-surface border border-border shadow-sm hover:shadow-md hover:border-accent/50 transition-all duration-300"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{label}</p>
            <p className="text-4xl font-bold font-display tracking-tight">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${color} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-muted-foreground group-hover:text-accent transition-colors">
          <span>View all</span>
          <ArrowUpRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}

function QuickActionCard({
  label,
  href,
  icon: Icon,
  description,
  color,
}: {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-accent/50 hover:shadow-sm transition-all duration-300"
    >
      <div className={`p-3 rounded-xl ${color} transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await statsApi.get();
        setStats(response.data as Stats);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <AdminShell>
      <div className="space-y-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-3xl font-bold font-display">Dashboard</h1>
          </div>
          <p className="text-muted-foreground ml-12">
            Welcome back! Here is your portfolio summary.
          </p>
        </motion.div>

        {/* Stats grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-surface border border-border shadow-sm animate-pulse"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="h-4 w-20 bg-muted rounded mb-3" />
                    <div className="h-10 w-16 bg-muted rounded" />
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-xl" />
                </div>
                <div className="h-3 w-16 bg-muted rounded mt-4" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard
              label="Projects"
              value={stats.projectsCount}
              icon={FolderKanban}
              color="bg-blue-500/20 text-blue-400"
              href="/admin/projects"
              delay={0}
            />
            <StatCard
              label="Blog Posts"
              value={stats.postsCount}
              icon={FileText}
              color="bg-emerald-500/20 text-emerald-400"
              href="/admin/posts"
              delay={0.05}
            />
            <StatCard
              label="Certifications"
              value={stats.certificationsCount}
              icon={Award}
              color="bg-purple-500/20 text-purple-400"
              href="/admin/certifications"
              delay={0.1}
            />
            <StatCard
              label="Experiments"
              value={stats.experimentsCount}
              icon={FlaskConical}
              color="bg-orange-500/20 text-orange-400"
              href="/admin/experiments"
              delay={0.15}
            />
            <StatCard
              label="Unread Messages"
              value={stats.unreadContactsCount}
              icon={Mail}
              color="bg-rose-500/20 text-rose-400"
              href="/admin/contact"
              delay={0.2}
            />
          </div>
        ) : null}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="p-6 rounded-xl bg-surface border border-border shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <QuickActionCard
                label="New Project"
                href="/admin/projects/new"
                icon={FolderKanban}
                description="Add a new project to showcase"
                color="bg-blue-500/20 text-blue-400"
              />
              <QuickActionCard
                label="New Blog Post"
                href="/admin/posts/new"
                icon={FileText}
                description="Write a new blog article"
                color="bg-emerald-500/20 text-emerald-400"
              />
              <QuickActionCard
                label="New Certification"
                href="/admin/certifications/new"
                icon={Award}
                description="Add a new credential"
                color="bg-purple-500/20 text-purple-400"
              />
              <QuickActionCard
                label="New Experiment"
                href="/admin/experiments/new"
                icon={FlaskConical}
                description="Document a new experiment"
                color="bg-orange-500/20 text-orange-400"
              />
            </div>
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-purple-500/10 border border-accent/20"
        >
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Tips
          </h2>
          <p className="text-sm text-muted-foreground">
            Customize your homepage content including hero section, tech stack, and SEO settings from the{" "}
            <Link href="/admin/settings/home" className="text-accent hover:underline">
              Home Settings
            </Link>{" "}
            page. You can also manage contact information from{" "}
            <Link href="/admin/settings/contact" className="text-accent hover:underline">
              Contact Settings
            </Link>.
          </p>
        </motion.div>
      </div>
    </AdminShell>
  );
}
