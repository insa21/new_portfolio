"use client";

import { AdminShell, ThumbnailUpload } from "@/components/admin";
import { experimentsApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExperimentForm {
  title: string;
  description: string;
  tags: string[];
  date: string;
  demoUrl: string;
  repoUrl: string;
  previewUrl: string;
}

export default function EditExperimentPage() {
  const router = useRouter();
  const params = useParams();
  const experimentId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ExperimentForm>({
    title: "",
    description: "",
    tags: [],
    date: "",
    demoUrl: "",
    repoUrl: "",
    previewUrl: "",
  });

  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    const loadExperiment = async () => {
      try {
        const response = await experimentsApi.get(experimentId);
        const experiment = response.data as ExperimentForm;
        setForm(experiment);
        setTagsInput((experiment.tags || []).join(", "));
      } catch (err) {
        console.error("Failed to load experiment:", err);
        setError("Gagal memuat data experiment");
      } finally {
        setIsLoading(false);
      }
    };

    loadExperiment();
  }, [experimentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const data = {
        ...form,
        tags: tagsInput.split(",").map((s) => s.trim()).filter(Boolean),
      };

      await experimentsApi.update(experimentId, data);
      router.push("/admin/experiments");
    } catch (err) {
      console.error("Failed to update experiment:", err);
      setError("Gagal memperbarui experiment.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/experiments">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-display">Edit Experiment</h1>
            <p className="text-muted-foreground mt-1">
              Perbarui informasi experiment
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-secondary/30 border border-white/5 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Python, TensorFlow, AI"
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="text"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="Dec 2024"
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Demo URL</label>
                <input
                  type="url"
                  value={form.demoUrl || ""}
                  onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Repository URL</label>
                <input
                  type="url"
                  value={form.repoUrl || ""}
                  onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none"
                />
              </div>
            </div>

            {/* Preview Image */}
            <div>
              <label className="block text-sm font-medium mb-3">Preview Image</label>
              <ThumbnailUpload
                value={form.previewUrl || ""}
                onChange={(url) => setForm({ ...form, previewUrl: url })}
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Simpan Perubahan
            </Button>
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/experiments">Batal</Link>
            </Button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
