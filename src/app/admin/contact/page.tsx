"use client";

import { AdminShell } from "@/components/admin";
import { contactApi } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Trash2,
  Mail,
  MailOpen,
  Eye,
  Filter,
  Loader2,
  Inbox,
  Clock,
  User,
  Sparkles,
  MessageCircle,
  ChevronRight,
  MailCheck,
  X,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

type FilterStatus = "all" | "unread" | "read";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function AdminContactPage() {
  const { success: showSuccess, error: showError } = useNotification();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null);
  const [deleteAction, setDeleteAction] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const limit = 10;

  const loadSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: { page: number; limit: number; read?: boolean } = { page, limit };

      if (filterStatus === "unread") {
        params.read = false;
      } else if (filterStatus === "read") {
        params.read = true;
      }

      const [response, countResponse] = await Promise.all([
        contactApi.list(params),
        contactApi.getUnreadCount()
      ]);

      setSubmissions(response.data as ContactSubmission[]);
      setTotal(response.meta?.total || 0);
      setUnreadCount(countResponse.data.count);
    } catch (error) {
      console.error("Failed to load messages:", error);
      showError("Failed to load messages", "Could not fetch message list from the server");
    } finally {
      setIsLoading(false);
    }
  }, [page, filterStatus, showError]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Open confirmation modal
  const confirmDelete = (id: string, name: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeleteAction({ id, name });
  };

  // Perform actual delete
  const handleDelete = async () => {
    if (!deleteAction) return;

    setIsDeleting(true);
    try {
      await contactApi.delete(deleteAction.id);

      showSuccess(`Pesan dari "${deleteAction.name}" telah dihapus`);

      // Optimistic update
      setSubmissions(prev => prev.filter(s => s.id !== deleteAction.id));
      setTotal(prev => Math.max(0, prev - 1));

      if (selectedMessage?.id === deleteAction.id) {
        setSelectedMessage(null);
      }

      // Reload to ensure sync
      loadSubmissions();

      setDeleteAction(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
      showError("Gagal menghapus pesan", "Terjadi kesalahan saat menghapus pesan.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsRead = async (submission: ContactSubmission) => {
    if (!submission.read) {
      try {
        await contactApi.markAsRead(submission.id);
        setSubmissions(prev =>
          prev.map(s => s.id === submission.id ? { ...s, read: true } : s)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        // Dispatch custom event to update sidebar badge
        window.dispatchEvent(new CustomEvent('message-read'));
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
    setSelectedMessage({ ...submission, read: true });
  };

  const filteredSubmissions = submissions.filter(submission =>
    search === "" ||
    submission.name.toLowerCase().includes(search.toLowerCase()) ||
    submission.email.toLowerCase().includes(search.toLowerCase()) ||
    submission.subject.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const mins = Math.floor(diffInHours * 60);
      return `${mins} menit lalu`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} jam lalu`;
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("id-ID", { weekday: "short", hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <AdminShell>
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center border border-accent/10">
              <Inbox className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display flex items-center gap-3 text-foreground">
                Inbox Pesan
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-accent to-cyan-400 text-black font-bold rounded-full flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {unreadCount} baru
                  </motion.span>
                )}
              </h1>
              <p className="text-muted-foreground mt-1">
                {total} pesan total • {unreadCount} belum dibaca
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama, email, atau subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border shadow-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all duration-300 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <div className="flex rounded-lg overflow-hidden border border-border bg-surface p-1 shadow-sm">
              {(["all", "unread", "read"] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${filterStatus === status
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {status === "all" ? "Semua" : status === "unread" ? "Baru" : "Dibaca"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Message List */}
          <div className={`w-full lg:w-1/2 xl:w-2/5 flex-col bg-surface border border-border rounded-xl shadow-sm overflow-hidden ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  <p className="text-muted-foreground text-sm">Memuat pesan...</p>
                </div>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <MailCheck className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-base font-medium mb-1 text-foreground">Tidak ada pesan</p>
                <p className="text-sm text-center text-muted-foreground">
                  {filterStatus === "unread"
                    ? "Semua pesan sudah dibaca!"
                    : "Belum ada pesan yang masuk"}
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto divide-y divide-border"
              >
                {filteredSubmissions.map((submission) => (
                  <motion.div
                    key={submission.id}
                    variants={itemVariants}
                    onClick={() => handleMarkAsRead(submission)}
                    className={`flex items-start gap-4 p-4 cursor-pointer transition-all duration-200 ${selectedMessage?.id === submission.id
                      ? "bg-accent/5 border-l-4 border-l-accent pl-3"
                      : !submission.read
                        ? "bg-surface hover:bg-muted/30 border-l-4 border-l-transparent pl-3"
                        : "bg-surface/50 hover:bg-muted/30 opacity-70 hover:opacity-100 border-l-4 border-l-transparent pl-3"
                      }`}
                  >
                    {/* Avatar / Status */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${!submission.read
                        ? "bg-gradient-to-br from-accent to-cyan-400 text-black"
                        : "bg-muted text-muted-foreground border border-border"
                        }`}>
                        {submission.name.charAt(0).toUpperCase()}
                      </div>
                      {!submission.read && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-surface" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`text-sm truncate ${!submission.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                          {submission.name}
                        </span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                          {formatDate(submission.createdAt)}
                        </span>
                      </div>
                      <p className={`text-sm truncate mb-0.5 ${!submission.read ? "font-medium text-foreground" : "text-muted-foreground/80"}`}>
                        {submission.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {submission.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/5">
                <p className="text-xs text-muted-foreground">
                  {(page - 1) * limit + 1} - {Math.min(page * limit, total)} dari {total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="h-8 text-xs"
                  >
                    Prev
                  </Button>
                  <span className="px-2 py-1 rounded bg-muted/50 text-xs font-medium text-foreground">
                    {page}/{totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="h-8 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Message Detail Panel */}
          <div className={`lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-surface border border-border rounded-xl shadow-sm overflow-hidden ${selectedMessage ? 'flex fixed inset-0 z-50 lg:static w-full h-full lg:h-auto' : 'hidden'}`}>
            <AnimatePresence mode="wait">
              {selectedMessage ? (
                <motion.div
                  key={selectedMessage.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col bg-surface"
                >
                  {/* Detail Header */}
                  <div className="p-6 border-b border-border bg-gradient-to-r from-muted/20 to-transparent">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="lg:hidden -ml-2 mr-2"
                          onClick={() => setSelectedMessage(null)}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center text-lg font-bold shadow-sm border border-accent/10 text-foreground">
                          {selectedMessage.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold font-display mb-0.5 text-foreground">
                            {selectedMessage.name}
                          </h2>
                          <a
                            href={`mailto:${selectedMessage.email}`}
                            className="text-accent hover:underline text-sm font-medium"
                          >
                            {selectedMessage.email}
                          </a>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {formatFullDate(selectedMessage.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hidden sm:flex"
                          asChild
                        >
                          <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                            <Mail className="w-3.5 h-3.5 mr-2" />
                            Balas
                          </a>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => confirmDelete(selectedMessage.id, selectedMessage.name, e)}
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:mr-2" />
                          <span className="hidden sm:inline">Hapus</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMessage(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="px-6 py-4 border-b border-border bg-surface">
                    <h3 className="text-lg font-semibold flex items-center gap-3 text-foreground">
                      <MessageCircle className="w-5 h-5 text-accent" />
                      {selectedMessage.subject}
                    </h3>
                  </div>

                  {/* Message Body */}
                  <div className="flex-1 p-6 overflow-y-auto bg-surface">
                    <div className="prose prose-invert max-w-none text-foreground">
                      <div className="whitespace-pre-wrap leading-relaxed text-base text-muted-foreground">
                        {selectedMessage.message}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-4 border-t border-border bg-muted/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Balas ke <span className="text-foreground font-medium">{selectedMessage.email}</span>
                      </span>
                      <Button variant="glow" size="sm" asChild>
                        <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                          Kirim Balasan
                        </a>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground bg-surface"
                >
                  <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4 border border-border">
                    <Inbox className="w-10 h-10 opacity-40" />
                  </div>
                  <p className="text-lg font-medium mb-1 text-foreground">Pilih Pesan</p>
                  <p className="text-sm text-center max-w-xs text-muted-foreground">
                    Klik pada pesan di sebelah kiri untuk melihat detailnya
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteAction}
        onClose={() => setDeleteAction(null)}
        onConfirm={handleDelete}
        title="Hapus Pesan?"
        description={`Apakah Anda yakin ingin menghapus pesan dari "${deleteAction?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Pesan"
        cancelText="Batal"
        variant="destructive"
        isLoading={isDeleting}
      />
    </AdminShell>
  );
}
