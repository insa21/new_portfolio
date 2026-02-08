"use client";

import { AdminShell } from "@/components/admin";
import { certificationsApi } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit, Trash2, Award, ExternalLink, Loader2,
  Filter, ChevronDown, RefreshCw, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface Certification {
  id: string;
  title: string;
  type: string;
  issuer: string;
  category: string;
  featured: boolean;
  issuedAt: string;
  credentialUrl?: string;
}

const CATEGORIES = ["All", "Cloud", "AI & ML", "Development", "Data", "Security", "DevOps", "Other"];
const TYPES = ["All", "CERTIFICATION", "LICENSE"];

export default function AdminCertificationsPage() {
  const { success, error: showError, promise } = useNotification();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Delete state
  const [deleteAction, setDeleteAction] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 10;

  const loadCertifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { page, limit };
      if (search) params.q = search;
      if (category !== "All") params.category = category;
      if (type !== "All") params.type = type;

      const response = await certificationsApi.list(params as never);
      setCertifications(response.data as Certification[]);
      setTotal(response.meta?.total || 0);
    } catch (error) {
      console.error("Failed to load certifications:", error);
      showError("Error", "Gagal memuat data certifications");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, type, showError]);

  useEffect(() => {
    loadCertifications();
  }, [loadCertifications]);

  const confirmDelete = (id: string, title: string) => {
    setDeleteAction({ id, title });
  };

  const handleDelete = async () => {
    if (!deleteAction) return;

    setIsDeleting(true);
    const { id, title } = deleteAction;

    // Optimistic Update
    const previousCertifications = [...certifications];
    setCertifications(prev => prev.filter(c => c.id !== id));
    setTotal(prev => Math.max(0, prev - 1));

    try {
      await promise(
        certificationsApi.delete(id),
        {
          loading: "Deleting certification...",
          success: `"${title}" has been deleted`,
          error: "Failed to delete certification",
        }
      );

      // If we're on a page with no items now, go back a page
      if (certifications.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      }
      setDeleteAction(null);
      loadCertifications();
    } catch (error) {
      console.error("Failed to delete:", error);
      // Rollback
      setCertifications(previousCertifications);
      setTotal(prev => prev + 1);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const activeFilters = (category !== "All" ? 1 : 0) + (type !== "All" ? 1 : 0);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <AdminShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Award className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">Certifications</h1>
              <p className="text-muted-foreground mt-1">
                Kelola sertifikasi dan lisensi profesional
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadCertifications} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/admin/certifications/new">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Baru
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: total, color: "text-zinc-900 dark:text-foreground", bg: "bg-zinc-50 dark:bg-surface" },
            { label: "Certifications", value: certifications.filter(c => c.type === "CERTIFICATION").length, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10" },
            { label: "Licenses", value: certifications.filter(c => c.type === "LICENSE").length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
            { label: "Featured", value: certifications.filter(c => c.featured).length, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
          ].map((stat) => (
            <div key={stat.label} className={`p-4 rounded-xl ${stat.bg} border border-zinc-200 dark:border-border shadow-sm`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-zinc-500 dark:text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="p-4 rounded-xl bg-white dark:bg-surface border border-zinc-200 dark:border-border shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari certification..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-background/50 border border-zinc-200 dark:border-border focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-colors text-zinc-900 dark:text-foreground placeholder:text-zinc-400 dark:placeholder:text-muted-foreground/50"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={activeFilters > 0 ? "border-accent text-accent" : ""}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
              {activeFilters > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-accent text-accent-foreground text-xs">
                  {activeFilters}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted-foreground font-medium">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => { setCategory(cat); setPage(1); }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === cat
                            ? "bg-accent text-white"
                            : "bg-zinc-100 dark:bg-secondary text-zinc-600 dark:text-muted-foreground hover:bg-zinc-200 dark:hover:bg-secondary/80"
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted-foreground font-medium">Type</label>
                    <div className="flex gap-2">
                      {TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => { setType(t); setPage(1); }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${type === t
                            ? "bg-accent text-white"
                            : "bg-zinc-100 dark:bg-secondary text-zinc-600 dark:text-muted-foreground hover:bg-zinc-200 dark:hover:bg-secondary/80"
                            }`}
                        >
                          {t === "All" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-surface border border-zinc-200 dark:border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted/40">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-700 dark:text-muted-foreground">
                    Certification
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-700 dark:text-muted-foreground">
                    Issuer
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-700 dark:text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-700 dark:text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-700 dark:text-muted-foreground">
                    Issued
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700 dark:text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-2" />
                      <p className="text-muted-foreground">Memuat data...</p>
                    </td>
                  </tr>
                ) : certifications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground mb-2">Tidak ada certification ditemukan</p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/certifications/new">
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah Certification
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ) : (
                  certifications.map((cert) => (
                    <motion.tr
                      key={cert.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-zinc-100 dark:border-border transition-colors hover:bg-zinc-50 dark:hover:bg-muted/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cert.featured
                            ? "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20"
                            : "bg-zinc-100 dark:bg-white/5"
                            }`}>
                            <Award className={`w-5 h-5 ${cert.featured ? "text-amber-600 dark:text-amber-400" : "text-zinc-400 dark:text-muted-foreground"}`} />
                          </div>
                          <div>
                            <span className="font-medium block text-zinc-900 dark:text-foreground">{cert.title}</span>
                            {cert.featured && (
                              <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-muted-foreground">
                        {cert.issuer}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cert.type === "LICENSE"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                          }`}>
                          {cert.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-zinc-100 dark:bg-secondary rounded-full text-xs text-zinc-700 dark:text-zinc-300">
                          {cert.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-muted-foreground text-sm">
                        {formatDate(cert.issuedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {cert.credentialUrl && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-accent" asChild>
                              <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-accent" asChild>
                            <Link href={`/admin/certifications/${cert.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={() => confirmDelete(cert.id, cert.title)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Menampilkan {(page - 1) * limit + 1} -{" "}
                {Math.min(page * limit, total)} dari {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-muted-foreground">
                  {page} / {totalPages}
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
            </div>
          )}
        </div>
      </motion.div>

      <ConfirmDialog
        isOpen={!!deleteAction}
        onClose={() => setDeleteAction(null)}
        onConfirm={handleDelete}
        title="Hapus Certification?"
        description={`Apakah kamu yakin ingin menghapus "${deleteAction?.title}"?`}
        confirmText="Hapus Certification"
        cancelText="Batal"
        variant="destructive"
        isLoading={isDeleting}
      />
    </AdminShell>
  );
}
