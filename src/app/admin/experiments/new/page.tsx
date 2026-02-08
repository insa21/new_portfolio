"use client";

import { AdminShell, ThumbnailUpload } from "@/components/admin";
import { experimentsApi } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/components/providers/notification-provider";

export default function NewExperimentPage() {
  const router = useRouter();
  const { success, error: showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    date: new Date().toISOString().split("T")[0],
    previewUrl: "",
    repoUrl: "",
    demoUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await experimentsApi.create({
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      success("Experiment created", "New experiment has been saved");
      router.push("/admin/experiments");
    } catch (error) {
      console.error("Failed to create:", error);
      showError("Failed to create", "Could not save experiment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AdminShell>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/experiments">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-display">Tambah Experiment</h1>
            <p className="text-muted-foreground mt-1">
              Buat proyek eksperimental baru
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-secondary/30 border border-white/5 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">Informasi Dasar</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                placeholder="AI Voice Clone"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tags (pisahkan dengan koma)
                </label>
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                  placeholder="AI, Python, TTS"
                />
              </div>
            </div>
          </div>

          <div className="bg-secondary/30 border border-white/5 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">Links & Media</h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Repository URL</label>
                <input
                  name="repoUrl"
                  value={formData.repoUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Demo URL</label>
                <input
                  name="demoUrl"
                  value={formData.demoUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Preview Image with Cloudinary Upload */}
            <div>
              <label className="block text-sm font-medium mb-3">Preview Image</label>
              <ThumbnailUpload
                value={formData.previewUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, previewUrl: url }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/experiments">Batal</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Simpan Experiment
            </Button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
