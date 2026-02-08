"use client";

import { AdminShell, useRequireAdmin } from "@/components/admin";
import { servicesApi } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";

export default function NewServicePage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bestFor: "",
    deliverables: [""],
    process: [""],
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await servicesApi.create({
        ...formData,
        deliverables: formData.deliverables.filter(Boolean),
        process: formData.process.filter(Boolean),
      });
      router.push("/admin/services");
    } catch (error) {
      console.error("Failed to create:", error);
      alert("Gagal membuat service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addDeliverable = () => {
    setFormData((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, ""],
    }));
  };

  const removeDeliverable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.map((d, i) => (i === index ? value : d)),
    }));
  };

  const addProcess = () => {
    setFormData((prev) => ({
      ...prev,
      process: [...prev.process, ""],
    }));
  };

  const removeProcess = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      process: prev.process.filter((_, i) => i !== index),
    }));
  };

  const updateProcess = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      process: prev.process.map((p, i) => (i === index ? value : p)),
    }));
  };

  if (authLoading) return null;

  return (
    <AdminShell>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/services">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-display">Tambah Service</h1>
            <p className="text-muted-foreground mt-1">Buat layanan baru</p>
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
                placeholder="Full-Stack Development"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Best For *</label>
              <input
                name="bestFor"
                value={formData.bestFor}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                placeholder="Startups, MVPs, Web Applications"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="active"
                id="active"
                checked={formData.active}
                onChange={handleChange}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="active" className="text-sm font-medium">
                Active (tampilkan di website)
              </label>
            </div>
          </div>

          <div className="bg-secondary/30 border border-white/5 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Deliverables</h2>
              <Button type="button" variant="ghost" size="sm" onClick={addDeliverable}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {formData.deliverables.map((deliverable, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={deliverable}
                    onChange={(e) => updateDeliverable(index, e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                    placeholder="Custom web application"
                  />
                  {formData.deliverables.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDeliverable(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary/30 border border-white/5 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Process Steps</h2>
              <Button type="button" variant="ghost" size="sm" onClick={addProcess}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {formData.process.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-accent/20 text-accent rounded-full text-sm font-medium">
                    {index + 1}
                  </span>
                  <input
                    value={step}
                    onChange={(e) => updateProcess(index, e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                    placeholder="Discovery & Planning"
                  />
                  {formData.process.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProcess(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/services">Batal</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Simpan Service
            </Button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
