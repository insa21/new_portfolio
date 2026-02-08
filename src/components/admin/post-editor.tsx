"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  Clock,
  Hash,
  Files,
  Image as ImageIcon,
  Globe,
  LayoutTemplate,
  Pencil,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/admin/shell";
import { ThumbnailUpload } from "@/components/admin/thumbnail-upload";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { categoriesApi } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  categoryId: string;
  tags: string[];
  readTime: string;
  featured: boolean;
  published: boolean;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

interface PostEditorProps {
  initialData?: PostFormData;
  isEditing?: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
  headerTitle: string;
  headerDescription: string;
  onSubmit: (data: PostFormData) => Promise<void>;
}

export function PostEditor({
  initialData,
  isEditing = false,
  isLoading = false,
  isSaving = false,
  headerTitle,
  headerDescription,
  onSubmit
}: PostEditorProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [slugMode, setSlugMode] = useState<'auto' | 'manual'>('auto');

  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverUrl: "",
    categoryId: "",
    tags: [],
    readTime: "5",
    featured: false,
    published: false,
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  });

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setTagsInput(initialData.tags.join(", "));
    }
  }, [initialData]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesApi.list();
        setCategories(response.data as Category[]);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  // Update slug from title if in auto mode
  useEffect(() => {
    if (slugMode === 'auto' && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, slugMode]);

  const handleChange = (field: keyof PostFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value.split(",").map(t => t.trim()).filter(Boolean);
    handleChange("tags", tags);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <form onSubmit={handleSubmit} className="max-w-[1600px] mx-auto pb-20">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-0 z-40 bg-background/80 backdrop-blur-md py-4 -mx-6 px-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/admin/posts">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-display">{headerTitle}</h1>
              <p className="text-sm text-muted-foreground hidden md:block">
                {headerDescription}
              </p>
            </div>
            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${formData.published
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
              }`}>
              {formData.published ? "Published" : "Draft"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                const newData = { ...formData, published: false };
                setFormData(newData);
                onSubmit(newData);
              }}
              className="hidden sm:flex"
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {formData.published ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">

          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-8">

            {/* Title & Slug */}
            <div className="space-y-4">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Article Title..."
                className="w-full text-4xl font-display font-bold bg-transparent border-0 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0 px-0 py-2 text-foreground"
                required
              />
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-zinc-100 dark:bg-muted text-zinc-600 dark:text-muted-foreground px-2 py-1 rounded">
                  slug:
                </span>
                {slugMode === 'auto' ? (
                  <span className="font-mono text-sm text-muted-foreground flex-1">
                    {formData.slug || 'auto-generated-slug'}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    className="flex-1 bg-white dark:bg-secondary border border-zinc-200 dark:border-border rounded-md px-2 py-1 text-foreground font-mono text-sm focus:outline-none focus:border-accent"
                    placeholder="custom-slug"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setSlugMode(slugMode === 'auto' ? 'manual' : 'auto')}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${slugMode === 'auto'
                    ? 'bg-zinc-100 dark:bg-muted text-zinc-600 dark:text-muted-foreground hover:bg-zinc-200 dark:hover:bg-muted/80'
                    : 'bg-accent/10 text-accent hover:bg-accent/20'
                    }`}
                  title={slugMode === 'auto' ? 'Click to edit slug manually' : 'Click to use auto-generated slug'}
                >
                  {slugMode === 'auto' ? (
                    <><Pencil className="w-3 h-3" /> Edit</>
                  ) : (
                    <><Check className="w-3 h-3" /> Auto</>
                  )}
                </button>
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleChange("excerpt", e.target.value)}
                rows={3}
                className="w-full bg-transparent border-none resize-none focus:ring-0 p-0 text-base leading-relaxed"
                placeholder="Brief summary or introduction..."
                required
              />
            </div>

            {/* Markdown Editor */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">Content</label>
              <MarkdownEditor
                value={formData.content}
                onChange={(value) => handleChange("content", value)}
                className="min-h-[600px] shadow-sm"
                required
              />
            </div>

          </div>

          {/* Sidebar (Right Column) */}
          <div className="space-y-6">

            {/* Organization */}
            <div className="bg-surface rounded-xl border border-border p-5 shadow-sm space-y-5">
              <div className="flex items-center gap-2 font-medium pb-2 border-b border-border">
                <Hash className="w-4 h-4 text-accent" />
                Organization
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-accent outline-none text-sm"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Tags</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="React, Next.js, Design..."
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-accent outline-none text-sm"
                />
                <p className="text-xs text-muted-foreground">Comma separated</p>
              </div>
            </div>

            {/* Publish Settings */}
            <div className="bg-surface rounded-xl border border-border p-5 shadow-sm space-y-5">
              <div className="flex items-center gap-2 font-medium pb-2 border-b border-border">
                <Calendar className="w-4 h-4 text-accent" />
                Publish Settings
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium cursor-pointer" htmlFor="publish-toggle">Published</label>
                <button
                  type="button"
                  onClick={() => handleChange("published", !formData.published)}
                  className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${formData.published
                      ? "bg-emerald-500"
                      : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.published ? "translate-x-5" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium cursor-pointer" htmlFor="feat-toggle">Featured</label>
                <button
                  type="button"
                  onClick={() => handleChange("featured", !formData.featured)}
                  className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${formData.featured
                      ? "bg-amber-500"
                      : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.featured ? "translate-x-5" : ""}`} />
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Read Time (min)
                </label>
                <input
                  type="number"
                  value={formData.readTime}
                  onChange={(e) => handleChange("readTime", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-accent outline-none text-sm"
                  min="1"
                />
              </div>
            </div>

            {/* Media */}
            <div className="bg-surface rounded-xl border border-border p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-medium pb-2 border-b border-border">
                <ImageIcon className="w-4 h-4 text-accent" />
                Cover Image
              </div>
              <ThumbnailUpload
                value={formData.coverUrl}
                onChange={(url) => handleChange("coverUrl", url)}
                disabled={isSaving}
                className="w-full"
                compact
              />
            </div>

            {/* SEO */}
            <div className="bg-surface rounded-xl border border-border p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-medium pb-2 border-b border-border">
                <Globe className="w-4 h-4 text-accent" />
                SEO
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Meta Title</label>
                <input
                  type="text"
                  value={formData.metaTitle || ""}
                  onChange={(e) => handleChange("metaTitle", e.target.value)}
                  placeholder="Optional SEO Title"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-accent outline-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Meta Description</label>
                <textarea
                  value={formData.metaDescription || ""}
                  onChange={(e) => handleChange("metaDescription", e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-accent outline-none text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">OG Image</label>
                <input
                  type="text"
                  value={formData.ogImage || ""}
                  onChange={(e) => handleChange("ogImage", e.target.value)}
                  placeholder="Optional URL"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-accent outline-none text-sm"
                />
              </div>
            </div>

          </div>
        </div>
      </form>
    </AdminShell>
  );
}
