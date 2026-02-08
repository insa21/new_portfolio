"use client";

import { AdminShell, ThumbnailUpload } from "@/components/admin";
import { FileUpload } from "@/components/admin/file-upload";
import { certificationsApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Award, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface CertificationForm {
  title: string;
  type: string;
  issuer: string;
  issuerLogo: string;
  category: string;
  skills: string[];
  issuedAt: string;
  expiresAt: string;
  credentialId: string;
  credentialUrl: string;
  pdfUrl: string;
  previewUrl: string;
  previewType: "pdf" | "image";
  featured: boolean;
  description: string;
}

const CERT_TYPES = [
  { value: "CERTIFICATION", label: "Certification" },
  { value: "LICENSE", label: "License" },
];

const CATEGORIES = ["Cloud", "AI & ML", "Development", "Data", "Security", "DevOps", "Other"];

export default function EditCertificationPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error: showError } = useNotification();
  const certId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState<CertificationForm>({
    title: "",
    type: "CERTIFICATION",
    issuer: "",
    issuerLogo: "",
    category: "Cloud",
    skills: [],
    issuedAt: "",
    expiresAt: "",
    credentialId: "",
    credentialUrl: "",
    pdfUrl: "",
    previewUrl: "",
    previewType: "image",
    featured: false,
    description: "",
  });

  const [skillsInput, setSkillsInput] = useState("");

  useEffect(() => {
    const loadCertification = async () => {
      try {
        const response = await certificationsApi.get(certId);
        const cert = response.data as CertificationForm;
        setForm({
          ...cert,
          issuerLogo: cert.issuerLogo || "",
          pdfUrl: cert.pdfUrl || "",
          previewUrl: cert.previewUrl || "",
          previewType: cert.previewType || "image",
          credentialId: cert.credentialId || "",
          credentialUrl: cert.credentialUrl || "",
          expiresAt: cert.expiresAt || "",
          description: cert.description || "",
        });
        setSkillsInput((cert.skills || []).join(", "));
      } catch (err) {
        console.error("Failed to load certification:", err);
        showError("Error", "Gagal memuat data certification");
      } finally {
        setIsLoading(false);
      }
    };

    loadCertification();
  }, [certId, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.title.trim()) {
      showError("Validasi", "Title wajib diisi");
      return;
    }
    if (!form.issuer.trim()) {
      showError("Validasi", "Issuer wajib diisi");
      return;
    }
    if (!form.issuedAt) {
      showError("Validasi", "Tanggal penerbitan wajib diisi");
      return;
    }
    // Expiry date validation
    if (form.expiresAt && form.expiresAt < form.issuedAt) {
      showError("Validasi", "Tanggal kadaluarsa harus setelah tanggal terbit");
      return;
    }

    setIsSaving(true);

    try {
      const data = {
        ...form,
        skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
      };

      await certificationsApi.update(certId, data);
      success("Berhasil", "Certification berhasil diperbarui");
      router.push("/admin/certifications");
    } catch (err) {
      console.error("Failed to update certification:", err);
      showError("Error", "Gagal memperbarui certification");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await certificationsApi.delete(certId);
      success("Berhasil", `"${form.title}" telah dihapus`);
      setShowDeleteConfirm(false);
      router.push("/admin/certifications");
    } catch (err) {
      console.error("Failed to delete:", err);
      showError("Error", "Gagal menghapus certification");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMediaChange = (url: string) => {
    const isPdf = url.toLowerCase().endsWith('.pdf');
    setForm(prev => ({
      ...prev,
      previewUrl: url,
      previewType: isPdf ? 'pdf' : 'image',
      // Auto-set pdfUrl if it's a PDF and pdfUrl is empty
      pdfUrl: (isPdf && !prev.pdfUrl) ? url : prev.pdfUrl
    }));
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground/60";
  const labelClasses = "block text-sm font-medium text-foreground mb-2";

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            </div>
            <p className="text-muted-foreground">Memuat data certification...</p>
          </div>
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
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/certifications">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Edit Certification</h1>
              <p className="text-muted-foreground text-sm">
                Perbarui informasi sertifikasi
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="text-red-400 border-red-400/30 hover:bg-red-500/10"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Hapus
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="p-6 rounded-2xl bg-muted/50 border border-border shadow-sm space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              Informasi Dasar
            </h2>

            <div>
              <label className={labelClasses}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClasses}
                placeholder="AWS Solutions Architect Associate"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Type *</label>
                <div className="flex gap-2">
                  {CERT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: t.value })}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${form.type === t.value
                        ? "bg-accent text-white shadow-sm"
                        : "bg-muted border border-border text-muted-foreground hover:bg-muted/80 hover:border-accent/30"
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClasses}>Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputClasses}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Issuer *</label>
                <input
                  type="text"
                  value={form.issuer}
                  onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                  className={inputClasses}
                  placeholder="Amazon Web Services"
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>Issuer Logo</label>
                <ThumbnailUpload
                  value={form.issuerLogo || ""}
                  onChange={(url) => setForm({ ...form, issuerLogo: url })}
                  disabled={isSaving}
                  compact
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Description</label>
              <textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className={`${inputClasses} resize-none`}
                placeholder="Deskripsi singkat tentang sertifikasi ini..."
              />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-300 dark:border-white/20 accent-amber-500"
              />
              <label htmlFor="featured" className="flex-1">
                <span className="font-medium text-amber-700 dark:text-amber-400">Featured Certification</span>
                <p className="text-sm text-zinc-500 dark:text-muted-foreground">Tampilkan di halaman utama</p>
              </label>
            </div>
          </div>

          {/* Credential Details */}
          <div className="p-6 rounded-2xl bg-muted/50 border border-border shadow-sm space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Credential Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Issued Date *</label>
                <input
                  type="date"
                  value={form.issuedAt || ""}
                  onChange={(e) => setForm({ ...form, issuedAt: e.target.value })}
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className={labelClasses}>Expiry Date</label>
                <input
                  type="date"
                  value={form.expiresAt || ""}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className={inputClasses}
                />
                <p className="text-xs text-muted-foreground mt-1">Kosongkan jika tidak ada masa berlaku</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Credential ID</label>
                <input
                  type="text"
                  value={form.credentialId || ""}
                  onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
                  className={inputClasses}
                  placeholder="ABC123XYZ"
                />
              </div>

              <div>
                <label className={labelClasses}>Credential URL</label>
                <input
                  type="url"
                  value={form.credentialUrl || ""}
                  onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })}
                  placeholder="https://..."
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Skills (pisahkan dengan koma)</label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Cloud Architecture, AWS, Security..."
                className={inputClasses}
              />
              {skillsInput && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skillsInput.split(",").map((s, i) => s.trim() && (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Media */}
          <div className="p-6 rounded-2xl bg-muted/50 border border-border shadow-sm space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Media
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Certificate File (PDF/Image)</label>
                <small className="block text-muted-foreground mb-2">
                  Upload file sertifikat. Mendukung PDF atau Gambar.
                </small>
                <FileUpload
                  value={form.previewUrl || ""}
                  onChange={handleMediaChange}
                  disabled={isSaving}
                  label="Upload Certificate"
                  helperText="PDF or Image up to 10MB"
                />
              </div>

              <div>
                <label className={labelClasses}>Downloadable File (Optional)</label>
                <small className="block text-muted-foreground mb-2">
                  File khusus untuk download (jika berbeda dari preview).
                </small>
                <FileUpload
                  value={form.pdfUrl || ""}
                  onChange={(url) => setForm({ ...form, pdfUrl: url })}
                  disabled={isSaving}
                  label="Upload PDF"
                  helperText="PDF up to 10MB"
                  accept="application/pdf"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/certifications">Batal</Link>
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </motion.div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus Certification?"
        description={`Apakah kamu yakin ingin menghapus "${form.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Certification"
        cancelText="Batal"
        variant="destructive"
        isLoading={isDeleting}
      />
    </AdminShell>
  );
}
