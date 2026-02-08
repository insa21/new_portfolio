"use client";

import { AdminShell } from "@/components/admin";
import { servicesApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceForm {
  title: string;
  description: string;
  bestFor: string;
  deliverables: string[];
  process: string[];
  order: number;
  active: boolean;
}

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ServiceForm>({
    title: "",
    description: "",
    bestFor: "",
    deliverables: [""],
    process: [""],
    order: 1,
    active: true,
  });

  useEffect(() => {
    const loadService = async () => {
      try {
        const response = await servicesApi.get(serviceId);
        const service = response.data as ServiceForm;
        setForm({
          ...service,
          deliverables: service.deliverables?.length ? service.deliverables : [""],
          process: service.process?.length ? service.process : [""],
        });
      } catch (err) {
        console.error("Failed to load service:", err);
        setError("Gagal memuat data service");
      } finally {
        setIsLoading(false);
      }
    };

    loadService();
  }, [serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const data = {
        ...form,
        deliverables: form.deliverables.filter(Boolean),
        process: form.process.filter(Boolean),
      };

      await servicesApi.update(serviceId, data);
      router.push("/admin/services");
    } catch (err) {
      console.error("Failed to update service:", err);
      setError("Gagal memperbarui service.");
    } finally {
      setIsSaving(false);
    }
  };

  const addDeliverable = () => {
    setForm({ ...form, deliverables: [...form.deliverables, ""] });
  };

  const removeDeliverable = (index: number) => {
    setForm({
      ...form,
      deliverables: form.deliverables.filter((_, i) => i !== index),
    });
  };

  const updateDeliverable = (index: number, value: string) => {
    const updated = [...form.deliverables];
    updated[index] = value;
    setForm({ ...form, deliverables: updated });
  };

  const addProcess = () => {
    setForm({ ...form, process: [...form.process, ""] });
  };

  const removeProcess = (index: number) => {
    setForm({
      ...form,
      process: form.process.filter((_, i) => i !== index),
    });
  };

  const updateProcess = (index: number, value: string) => {
    const updated = [...form.process];
    updated[index] = value;
    setForm({ ...form, process: updated });
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
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/services">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-display">Edit Service</h1>
            <p className="text-muted-foreground mt-1">
              Perbarui informasi layanan
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
            <h2 className="text-lg font-semibold">Informasi Dasar</h2>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Best For</label>
                <input
                  type="text"
                  value={form.bestFor}
                  onChange={(e) => setForm({ ...form, bestFor: e.target.value })}
                  placeholder="e.g. Startups & Enterprise"
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Order</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 rounded border-white/20"
              />
              <label htmlFor="active" className="text-sm">
                Active (tampilkan di website)
              </label>
            </div>
          </div>

          {/* Deliverables */}
          <div className="bg-secondary/30 border border-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Deliverables</h2>
              <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {form.deliverables.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateDeliverable(index, e.target.value)}
                  placeholder="e.g. Fullstack Architecture"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none"
                />
                {form.deliverables.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDeliverable(index)}
                    className="text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Process */}
          <div className="bg-secondary/30 border border-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Process Steps</h2>
              <Button type="button" variant="outline" size="sm" onClick={addProcess}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {form.process.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-accent/20 text-accent rounded-full text-sm font-medium">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateProcess(index, e.target.value)}
                  placeholder="e.g. Discovery"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none"
                />
                {form.process.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProcess(index)}
                    className="text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
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
              <Link href="/admin/services">Batal</Link>
            </Button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
