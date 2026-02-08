"use client";

import { AdminShell } from "@/components/admin";
import { experimentsApi } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, FlaskConical, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface Experiment {
  id: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  repoUrl?: string;
  demoUrl?: string;
}

export default function AdminExperimentsPage() {
  const { error: showError, promise } = useNotification();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Delete state
  const [deleteAction, setDeleteAction] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const limit = 10;

  const loadExperiments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await experimentsApi.list({ q: search, page, limit });
      setExperiments(response.data as Experiment[]);
      setTotal(response.meta?.total || 0);
    } catch (error) {
      console.error("Failed to load experiments:", error);
      showError("Failed to load experiments", "Could not fetch experiment list");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, showError]);

  useEffect(() => {
    loadExperiments();
  }, [loadExperiments]);

  const confirmDelete = (id: string, title: string) => {
    setDeleteAction({ id, title });
  };

  const handleDelete = async () => {
    if (!deleteAction) return;

    setIsDeleting(true);
    const { id, title } = deleteAction;

    // Optimistic Update
    const previousExperiments = [...experiments];
    setExperiments(prev => prev.filter(e => e.id !== id));
    setTotal(prev => Math.max(0, prev - 1));

    try {
      await promise(
        experimentsApi.delete(id),
        {
          loading: "Deleting experiment...",
          success: `Experiment "${title}" has been deleted`,
          error: "Failed to delete experiment",
        }
      );

      // If we're on a page with no items now, go back a page
      if (experiments.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      }
      setDeleteAction(null);
      loadExperiments();
    } catch (error) {
      console.error("Failed to delete:", error);
      // Rollback
      setExperiments(previousExperiments);
      setTotal(prev => prev + 1);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Experiments</h1>
            <p className="text-muted-foreground mt-1">
              Kelola proyek eksperimental dan lab
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/experiments/new">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Experiment
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari experiment..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface border border-border focus:border-accent outline-none transition-colors"
            />
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-xl p-6 shadow-sm overflow-hidden"
              >
                <div className="h-6 w-32 bg-muted rounded mb-3 animate-pulse" />
                <div className="h-4 w-full bg-muted rounded mb-2 animate-pulse" />
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : experiments.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-sm">
            <FlaskConical className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Tidak ada experiment ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.map((exp) => (
              <div
                key={exp.id}
                className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-accent/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <FlaskConical className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    {exp.repoUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={exp.repoUrl} target="_blank" rel="noopener">
                          <Github className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {exp.demoUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={exp.demoUrl} target="_blank" rel="noopener">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold mb-2">{exp.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {exp.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {exp.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-secondary/50 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{exp.date}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/experiments/${exp.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(exp.id, exp.title)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteAction}
        onClose={() => setDeleteAction(null)}
        onConfirm={handleDelete}
        title="Hapus Experiment?"
        description={`Apakah kamu yakin ingin menghapus experiment "${deleteAction?.title}"?`}
        confirmText="Hapus Experiment"
        cancelText="Batal"
        variant="destructive"
        isLoading={isDeleting}
      />
    </AdminShell>
  );
}
