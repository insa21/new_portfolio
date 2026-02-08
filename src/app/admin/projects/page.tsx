"use client";

import { AdminShell } from "@/components/admin";
import { projectsApi, getErrorMessage, logApiError } from "@/lib/api";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  Loader2,
  RefreshCw,
  Filter,
  ChevronDown,
  AlertCircle,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface Project {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  type: string;
  status: string;
  featured: boolean;
  year: string;
  stack: string[];
  tags: string[];
  thumbnailUrl?: string;
  createdAt: string;
}

type ProjectStatus = "ALL" | "LIVE" | "IN_PROGRESS" | "ARCHIVED";
type ProjectType = "ALL" | "Web App" | "Mobile" | "Open Source" | "API" | "Tool";
type SortBy = "createdAt" | "title" | "year";
type SortOrder = "asc" | "desc";

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "ALL", label: "All Status" },
  { value: "LIVE", label: "Live" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "ARCHIVED", label: "Archived" },
];

const TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: "ALL", label: "All Types" },
  { value: "Web App", label: "Web App" },
  { value: "Mobile", label: "Mobile" },
  { value: "Open Source", label: "Open Source" },
  { value: "API", label: "API" },
  { value: "Tool", label: "Tool" },
];

export default function AdminProjectsPage() {
  const { error: showError, warning, promise, info } = useNotification();

  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters & pagination state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus>("ALL");
  const [typeFilter, setTypeFilter] = useState<ProjectType>("ALL");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Delete state
  const [deleteAction, setDeleteAction] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const limit = 10;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Load projects
  const loadProjects = useCallback(async (isRefresh = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setLoadError(null);

    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page,
        limit,
        sort: `${sortBy}:${sortOrder}`,
      };

      if (debouncedSearch) {
        params.q = debouncedSearch;
      }
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      if (typeFilter !== "ALL") {
        params.type = typeFilter;
      }

      const response = await projectsApi.list(params);
      setProjects(response.data as Project[]);
      setTotal(response.meta?.total || 0);
    } catch (err) {
      // Don't show error for aborted requests
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      logApiError("Failed to load projects", err);
      const errorMessage = getErrorMessage(err, "Could not fetch project list");
      setLoadError(errorMessage);
      showError("Failed to load projects", errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [debouncedSearch, page, statusFilter, typeFilter, sortBy, sortOrder, showError]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Open confirmation modal
  const confirmDelete = (id: string, title: string) => {
    setDeleteAction({ id, title });
  };

  // Perform actual delete
  const handleDelete = async () => {
    if (!deleteAction) return;

    setIsDeleting(true);
    const { id, title } = deleteAction;

    // Optimistic update - remove from UI immediately
    const previousProjects = [...projects];
    setProjects(prev => prev.filter(p => p.id !== id));
    setTotal(prev => Math.max(0, prev - 1));

    try {
      await promise(
        projectsApi.delete(id),
        {
          loading: `Deleting "${title}"...`,
          success: `"${title}" has been deleted`,
          error: `Failed to delete "${title}"`,
        }
      );

      // If we're on a page with no items now, go back a page
      if (projects.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      }
      setDeleteAction(null);
    } catch (err) {
      // Rollback on error
      logApiError("Failed to delete project", err);
      setProjects(previousProjects);
      setTotal(prev => prev + 1);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    if (!isRefreshing) {
      loadProjects(true);
      info("Refreshing", "Fetching latest projects...");
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const hasActiveFilters = statusFilter !== "ALL" || typeFilter !== "ALL" || debouncedSearch !== "";
  const totalPages = Math.ceil(total / limit);
  const showingFrom = total > 0 ? (page - 1) * limit + 1 : 0;
  const showingTo = Math.min(page * limit, total);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage your portfolio projects ({total} total)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh"
              className="border-border hover:bg-muted"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button asChild className="shadow-sm">
              <Link href="/admin/projects/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Link>
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface border border-border focus:border-accent outline-none transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? "border-accent text-accent" : ""}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 px-1.5 py-0.5 bg-accent text-accent-foreground rounded text-xs">
                  {[statusFilter !== "ALL", typeFilter !== "ALL", debouncedSearch !== ""].filter(Boolean).length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as ProjectStatus);
                      setPage(1);
                    }}
                    className="px-3 py-2 rounded-lg bg-background border border-border focus:border-accent outline-none text-sm"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value as ProjectType);
                      setPage(1);
                    }}
                    className="px-3 py-2 rounded-lg bg-background border border-border focus:border-accent outline-none text-sm"
                  >
                    {TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Sort by</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className="px-3 py-2 rounded-lg bg-background border border-border focus:border-accent outline-none text-sm"
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="title">Title</option>
                      <option value="year">Year</option>
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                      className="px-3 py-2 rounded-lg bg-background border border-border focus:border-accent outline-none text-sm"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {loadError && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="font-medium text-red-400">Failed to load projects</p>
                <p className="text-sm text-muted-foreground">{loadError}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => loadProjects()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Project
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Year
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-muted rounded animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-16 bg-white/5 rounded-full animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-12 bg-white/5 rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-lg font-medium mb-1">
                        {hasActiveFilters ? "No projects found" : "No projects yet"}
                      </p>
                      <p className="text-muted-foreground text-sm mb-4">
                        {hasActiveFilters
                          ? "Try adjusting your filters or search terms"
                          : "Get started by creating your first project"
                        }
                      </p>
                      {hasActiveFilters ? (
                        <Button variant="outline" onClick={resetFilters}>
                          Reset Filters
                        </Button>
                      ) : (
                        <Button asChild>
                          <Link href="/admin/projects/new">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Project
                          </Link>
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {project.thumbnailUrl ? (
                            <img
                              src={project.thumbnailUrl}
                              alt={project.title}
                              className="w-12 h-8 object-cover rounded border border-border"
                            />
                          ) : (
                            <div className="w-12 h-8 bg-secondary rounded border border-border flex items-center justify-center">
                              <FolderOpen className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{project.title}</p>
                              {project.featured && (
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {project.tagline}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-muted border border-border rounded-full text-xs font-medium text-foreground">
                          {project.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${project.status === "LIVE"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : project.status === "IN_PROGRESS"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400"
                            }`}
                        >
                          {project.status === "IN_PROGRESS" ? "In Progress" : project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {project.year}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="View project"
                          >
                            <Link href={`/projects/${project.slug}`} target="_blank">
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="Edit project"
                          >
                            <Link href={`/admin/projects/${project.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(project.id, project.title)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 0 && !isLoading && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {total > 0 ? (
                    <>Showing {showingFrom} - {showingTo} of {total} projects</>
                  ) : (
                    "No projects"
                  )}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1 || isRefreshing}
                      onClick={() => setPage(1)}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1 || isRefreshing}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="px-3 text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages || isRefreshing}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages || isRefreshing}
                      onClick={() => setPage(totalPages)}
                    >
                      Last
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteAction}
        onClose={() => setDeleteAction(null)}
        onConfirm={handleDelete}
        title="Delete Project?"
        description={`Are you sure you want to delete "${deleteAction?.title}"? This action cannot be undone.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </AdminShell>
  );
}
