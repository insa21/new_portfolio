"use client";

import { AdminShell, ThumbnailUpload } from "@/components/admin";
import { FileUpload } from "@/components/admin/file-upload";
import { certificationsApi } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";

const CERT_TYPES = [
  { value: "CERTIFICATION", label: "Certification" },
  { value: "LICENSE", label: "License" },
];

const CATEGORIES = ["Cloud", "AI & ML", "Development", "Data", "Security", "DevOps", "Other"];

export default function NewCertificationPage() {
  const router = useRouter();
  const { success, error: showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "CERTIFICATION",
    issuer: "",
    issuerLogo: "",
    category: "Cloud",
    skills: "",
    issuedAt: "",
    expiresAt: "",
    credentialId: "",
    credentialUrl: "",
    pdfUrl: "",
    featured: false,
    description: "",
    previewUrl: "",
    previewType: "image",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      showError("Validasi", "Title wajib diisi");
      return;
    }
    if (!formData.issuer.trim()) {
      showError("Validasi", "Issuer wajib diisi");
      return;
    }
    if (!formData.issuedAt) {
      showError("Validasi", "Tanggal penerbitan wajib diisi");
      return;
    }
    // Expiry date validation
    if (formData.expiresAt && formData.expiresAt < formData.issuedAt) {
      showError("Validasi", "Tanggal kadaluarsa harus setelah tanggal terbit");
      return;
    }

    setIsSubmitting(true);

    try {
      await certificationsApi.create({
        ...formData,
        skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      success("Berhasil", "Certification baru telah ditambahkan");
      router.push("/admin/certifications");
    } catch (error) {
      console.error("Failed to create:", error);
      showError("Error", "Gagal membuat certification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaChange = (url: string) => {
    const isPdf = url.toLowerCase().endsWith('.pdf');
    setFormData(prev => ({
      ...prev,
      previewUrl: url,
      previewType: isPdf ? 'pdf' : 'image',
      // Auto-set pdfUrl if it's a PDF and pdfUrl is empty
      pdfUrl: (isPdf && !prev.pdfUrl) ? url : prev.pdfUrl
    }));
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground/60";
  const labelClasses = "block text-sm font-medium text-foreground mb-2";

  return (
    <AdminShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
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
            <h1 className="text-2xl font-bold font-display">Tambah Certification</h1>
            <p className="text-muted-foreground text-sm">
              Buat certification atau lisensi baru
            </p>
          </div>
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
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                      onClick={() => setFormData({ ...formData, type: t.value })}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${formData.type === t.value
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
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  className={inputClasses}
                  placeholder="Amazon Web Services"
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>Issuer Logo</label>
                <ThumbnailUpload
                  value={formData.issuerLogo}
                  onChange={(url) => setFormData({ ...formData, issuerLogo: url })}
                  disabled={isSubmitting}
                  compact
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`${inputClasses} resize-none`}
                placeholder="Deskripsi singkat tentang sertifikasi ini..."
              />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
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
                  value={formData.issuedAt}
                  onChange={(e) => setFormData({ ...formData, issuedAt: e.target.value })}
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className={labelClasses}>Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
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
                  value={formData.credentialId}
                  onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                  className={inputClasses}
                  placeholder="ABC123XYZ"
                />
              </div>

              <div>
                <label className={labelClasses}>Credential URL</label>
                <input
                  type="url"
                  value={formData.credentialUrl}
                  onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                  placeholder="https://..."
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Skills (pisahkan dengan koma)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="Cloud Architecture, AWS, Security..."
                className={inputClasses}
              />
              {formData.skills && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.split(",").map((s, i) => s.trim() && (
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
                  value={formData.previewUrl}
                  onChange={handleMediaChange}
                  disabled={isSubmitting}
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
                  value={formData.pdfUrl}
                  onChange={(url) => setFormData({ ...formData, pdfUrl: url })}
                  disabled={isSubmitting}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Simpan Certification
            </Button>
          </div>
        </form>
      </motion.div>
    </AdminShell>
  );
}
