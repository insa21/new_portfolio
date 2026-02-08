"use client";

import { AdminShell } from "@/components/admin";
import { contactApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  Mail,
  MailOpen,
  User,
  Clock,
  FileText,
  MessageSquare,
  Loader2,
  ExternalLink,
  Send,
  Calendar,
  Reply,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { error: showError, promise } = useNotification();
  const [submission, setSubmission] = useState<ContactSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    const loadSubmission = async () => {
      setIsLoading(true);
      try {
        const response = await contactApi.get(id);
        const found = response.data as ContactSubmission;

        if (found) {
          setSubmission(found);
          if (!found.read) {
            await contactApi.markAsRead(id);
            setSubmission(prev => prev ? { ...prev, read: true } : null);
            // Dispatch custom event to update sidebar badge
            window.dispatchEvent(new CustomEvent('message-read'));
          }
        } else {
          showError("Pesan tidak ditemukan", "Pesan yang Anda cari tidak ada atau sudah dihapus.");
          router.push("/admin/contact");
        }
      } catch (error) {
        console.error("Failed to load message:", error);
        showError("Gagal memuat pesan", "Tidak dapat mengambil data pesan.");
        router.push("/admin/contact");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadSubmission();
    }
  }, [id, router, showError]);

  const handleDelete = async () => {
    if (!submission) return;
    if (!confirm(`Yakin ingin menghapus pesan dari "${submission.name}"?`)) return;

    try {
      await promise(
        contactApi.delete(id),
        {
          loading: "Menghapus pesan...",
          success: "Pesan berhasil dihapus",
          error: "Gagal menghapus pesan",
        }
      );
      router.push("/admin/contact");
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const mins = Math.floor(diffInHours * 60);
      return `${mins} menit lalu`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} jam lalu`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} hari lalu`;
    }
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
            <p className="text-muted-foreground">Memuat pesan...</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  if (!submission) {
    return (
      <AdminShell>
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
            <MessageSquare className="w-10 h-10 opacity-50" />
          </div>
          <p className="text-xl font-medium mb-2">Pesan tidak ditemukan</p>
          <p className="text-sm mb-6">Pesan mungkin sudah dihapus</p>
          <Button asChild>
            <Link href="/admin/contact">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Inbox
            </Link>
          </Button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="hover:bg-white/10">
              <Link href="/admin/contact">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-display flex items-center gap-3">
                Detail Pesan
                {!submission.read && (
                  <span className="px-2.5 py-1 text-xs bg-accent text-black font-bold rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Baru
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                {getTimeAgo(submission.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="glow"
              size="sm"
              asChild
            >
              <a href={`mailto:${submission.email}?subject=Re: ${submission.subject}`}>
                <Reply className="w-4 h-4 mr-2" />
                Balas Email
              </a>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>

        {/* Sender Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-secondary/40 via-secondary/20 to-transparent border border-border"
        >
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center text-2xl font-bold text-black">
              {submission.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-accent" />
                  {submission.name}
                </h2>
                <a
                  href={`mailto:${submission.email}`}
                  className="text-accent hover:underline flex items-center gap-2 text-sm mt-1"
                >
                  <Mail className="w-4 h-4" />
                  {submission.email}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(submission.createdAt)}
                </span>
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${submission.read
                  ? "bg-white/5 text-muted-foreground"
                  : "bg-accent/20 text-accent"
                  }`}>
                  {submission.read ? <MailOpen className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                  {submission.read ? "Sudah dibaca" : "Belum dibaca"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subject */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl bg-secondary/20 border border-white/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Subject</p>
              <h3 className="text-lg font-semibold">{submission.subject}</h3>
            </div>
          </div>
        </motion.div>

        {/* Message Body */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-secondary/30 border border-border overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-secondary/20">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm font-medium">Isi Pesan</span>
          </div>
          <div className="p-6 md:p-8">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed text-lg">
                {submission.message}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Reply Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Send className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold mb-0.5">Balas Pesan Ini</h4>
                <p className="text-sm text-muted-foreground">
                  Klik tombol untuk membuka email client Anda
                </p>
              </div>
            </div>
            <Button variant="glow" asChild>
              <a href={`mailto:${submission.email}?subject=Re: ${submission.subject}&body=%0A%0A---%0APada ${formatDate(submission.createdAt)}, ${submission.name} menulis:%0A${encodeURIComponent(submission.message)}`}>
                <Mail className="w-4 h-4 mr-2" />
                Kirim Balasan
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center pt-4"
        >
          <Button variant="ghost" size="lg" asChild>
            <Link href="/admin/contact" className="group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Inbox
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </AdminShell>
  );
}
