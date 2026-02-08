"use client";

import { AdminShell, ThumbnailUpload } from "@/components/admin";
import { projectsApi, getErrorMessage, logApiError } from "@/lib/api";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/components/providers/notification-provider";

// ============================================================================
// Types & Constants
// ============================================================================

interface ProjectForm {
  title: string;
  slug: string;
  tagline: string;
  description: string;
  type: string;
  status: string;
  year: string;
  stack: string;
  tags: string;
  thumbnailUrl: string;
  liveUrl: string;
  repoUrl: string;
  featured: boolean;
  highlights: string;
  challenges: string;
  results: string;
}

interface FieldError {
  [key: string]: string;
}

const PROJECT_TYPES = ["Web App", "Mobile", "Open Source", "API", "Tool"];
const PROJECT_STATUS = ["LIVE", "IN_PROGRESS", "ARCHIVED"];

const INITIAL_FORM: ProjectForm = {
  title: "",
  slug: "",
  tagline: "",
  description: "",
  type: "Web App",
  status: "IN_PROGRESS",
  year: new Date().getFullYear().toString(),
  stack: "",
  tags: "",
  thumbnailUrl: "",
  liveUrl: "",
  repoUrl: "",
  featured: false,
  highlights: "",
  challenges: "",
  results: "",
};

// Validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ============================================================================
// Validation Functions
// ============================================================================

function validateForm(form: ProjectForm): FieldError {
  const errors: FieldError = {};

  // Title validation
  if (!form.title.trim()) {
    errors.title = "Title is required";
  } else if (form.title.length < 3) {
    errors.title = "Title must be at least 3 characters";
  } else if (form.title.length > 100) {
    errors.title = "Title must be less than 100 characters";
  }

  // Slug validation (optional - auto-generated if empty)
  if (form.slug && !SLUG_REGEX.test(form.slug)) {
    errors.slug = "Slug must be lowercase letters, numbers, and hyphens only";
  } else if (form.slug.length > 100) {
    errors.slug = "Slug must be less than 100 characters";
  }

  // Tagline validation
  if (!form.tagline.trim()) {
    errors.tagline = "Tagline is required";
  } else if (form.tagline.length < 10) {
    errors.tagline = "Tagline must be at least 10 characters";
  } else if (form.tagline.length > 200) {
    errors.tagline = "Tagline must be less than 200 characters";
  }

  // Description validation
  if (!form.description.trim()) {
    errors.description = "Description is required";
  } else if (form.description.length < 50) {
    errors.description = "Description must be at least 50 characters";
  } else if (form.description.length > 2000) {
    errors.description = "Description must be less than 2000 characters";
  }

  // Year validation
  const yearNum = parseInt(form.year);
  if (!form.year.trim()) {
    errors.year = "Year is required";
  } else if (isNaN(yearNum) || yearNum < 2000 || yearNum > new Date().getFullYear() + 1) {
    errors.year = `Year must be between 2000 and ${new Date().getFullYear() + 1}`;
  }

  // URL validations (optional but must be valid if provided)
  if (form.liveUrl && !URL_REGEX.test(form.liveUrl)) {
    errors.liveUrl = "Please enter a valid URL";
  }
  if (form.repoUrl && !URL_REGEX.test(form.repoUrl)) {
    errors.repoUrl = "Please enter a valid URL";
  }

  // Stack validation
  const stackItems = form.stack.split(",").map(s => s.trim()).filter(Boolean);
  if (stackItems.length === 0) {
    errors.stack = "At least one tech stack item is required";
  }

  // Tags validation
  const tagItems = form.tags.split(",").map(s => s.trim()).filter(Boolean);
  if (tagItems.length === 0) {
    errors.tags = "At least one tag is required";
  }

  return errors;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// Component
// ============================================================================

export default function NewProjectPage() {
  const router = useRouter();
  const {
    loading: showLoading,
    update: updateToast,
    error: showError,
    warning
  } = useNotification();

  // Form state
  const [formData, setFormData] = useState<ProjectForm>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Refs
  const submitCountRef = useRef(0);

  // ============================================================================
  // Effects
  // ============================================================================

  // Warn on unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasInteracted && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasInteracted, isSubmitting]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));

    // Validate single field
    const errors = validateForm(formData);
    if (errors[fieldName]) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: errors[fieldName] }));
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setHasInteracted(true);

    if (name === 'title') {
      // Auto-generate slug when title changes
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: prev.slug === slugify(prev.title) || prev.slug === ""
          ? slugify(value)
          : prev.slug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) {
      warning("Please wait", "Already creating project...");
      return;
    }

    // Validate all fields
    const errors = validateForm(formData);
    setFieldErrors(errors);
    setTouchedFields(new Set(Object.keys(errors)));

    if (Object.keys(errors).length > 0) {
      showError("Validation failed", "Please fix the errors before saving");
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    submitCountRef.current++;
    const currentSubmitCount = submitCountRef.current;
    const toastId = showLoading("Creating project...", "Saving project data");

    try {
      await projectsApi.create({
        ...formData,
        stack: formData.stack.split(",").map((s) => s.trim()).filter(Boolean),
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        highlights: formData.highlights.split("\n").map((h) => h.trim()).filter(Boolean),
      });

      // Check if this is still the current submission
      if (currentSubmitCount !== submitCountRef.current) return;

      updateToast(toastId, "success", {
        title: "Project created",
        message: "Your project has been saved successfully"
      });
      router.push("/admin/projects");
    } catch (err) {
      // Check if this is still the current submission
      if (currentSubmitCount !== submitCountRef.current) return;

      logApiError("Failed to create project", err);
      const errorMessage = getErrorMessage(err, "Could not save project");

      // Check for specific errors
      if (errorMessage.toLowerCase().includes('slug')) {
        setFieldErrors(prev => ({ ...prev, slug: "This slug is already in use" }));
        setTouchedFields(prev => new Set(prev).add('slug'));
      }

      updateToast(toastId, "error", {
        title: "Failed to create",
        message: errorMessage,
        action: {
          label: "Retry",
          onClick: () => handleSubmit(e)
        }
      });
    } finally {
      if (currentSubmitCount === submitCountRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [formData, isSubmitting, router, showError, showLoading, updateToast, warning]);

  const handleCancel = () => {
    if (hasInteracted) {
      if (!confirm("You have unsaved changes. Are you sure you want to leave?")) {
        return;
      }
    }
    router.push("/admin/projects");
  };

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const renderFieldError = (fieldName: string) => {
    const error = fieldErrors[fieldName];
    const isTouched = touchedFields.has(fieldName);

    if (!error || !isTouched) return null;

    return (
      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    );
  };

  const getFieldClassName = (fieldName: string, baseClass: string) => {
    const hasError = fieldErrors[fieldName] && touchedFields.has(fieldName);
    return `${baseClass} ${hasError ? 'border-red-500/50 focus:border-red-500' : ''}`;
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <AdminShell>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-display">New Project</h1>
              {hasInteracted && (
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  Unsaved
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Create a new project for your portfolio
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-muted/50 border border-border rounded-xl p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Basic Information
              {Object.keys(fieldErrors).filter(k => ['title', 'slug', 'tagline', 'description', 'year'].includes(k)).length > 0 && (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div data-error={!!fieldErrors.title && touchedFields.has('title')}>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('title')}
                  className={getFieldClassName('title', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all')}
                  placeholder="My Awesome Project"
                  maxLength={100}
                />
                <div className="flex justify-between">
                  {renderFieldError('title')}
                  <span className="text-xs text-muted-foreground ml-auto">{formData.title.length}/100</span>
                </div>
              </div>

              <div data-error={!!fieldErrors.slug && touchedFields.has('slug')}>
                <label className="block text-sm font-medium mb-2">
                  Slug
                  <span className="text-muted-foreground font-normal ml-2">(auto-generated)</span>
                </label>
                <input
                  name="slug"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }));
                    setHasInteracted(true);
                  }}
                  onBlur={() => handleFieldBlur('slug')}
                  className={getFieldClassName('slug', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all')}
                  placeholder="my-awesome-project"
                  maxLength={100}
                />
                {renderFieldError('slug')}
              </div>
            </div>

            <div data-error={!!fieldErrors.tagline && touchedFields.has('tagline')}>
              <label className="block text-sm font-medium mb-2">
                Tagline <span className="text-red-400">*</span>
              </label>
              <input
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('tagline')}
                className={getFieldClassName('tagline', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
                placeholder="A brief, catchy description of your project"
                maxLength={200}
              />
              <div className="flex justify-between">
                {renderFieldError('tagline')}
                <span className="text-xs text-muted-foreground ml-auto">{formData.tagline.length}/200</span>
              </div>
            </div>

            <div data-error={!!fieldErrors.description && touchedFields.has('description')}>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('description')}
                rows={4}
                className={getFieldClassName('description', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none resize-none transition-colors')}
                placeholder="Detailed description of your project (minimum 50 characters)"
                maxLength={2000}
              />
              <div className="flex justify-between">
                {renderFieldError('description')}
                <span className="text-xs text-muted-foreground ml-auto">{formData.description.length}/2000</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Type <span className="text-red-400">*</span></label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors"
                >
                  {PROJECT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status <span className="text-red-400">*</span></label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors"
                >
                  {PROJECT_STATUS.map(status => (
                    <option key={status} value={status}>
                      {status === "IN_PROGRESS" ? "In Progress" : status}
                    </option>
                  ))}
                </select>
              </div>
              <div data-error={!!fieldErrors.year && touchedFields.has('year')}>
                <label className="block text-sm font-medium mb-2">Year <span className="text-red-400">*</span></label>
                <input
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('year')}
                  className={getFieldClassName('year', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
                  placeholder="2024"
                  maxLength={4}
                />
                {renderFieldError('year')}
              </div>
            </div>

            <div data-error={!!fieldErrors.stack && touchedFields.has('stack')}>
              <label className="block text-sm font-medium mb-2">
                Tech Stack <span className="text-red-400">*</span>
                <span className="text-muted-foreground font-normal ml-2">(comma separated)</span>
              </label>
              <input
                name="stack"
                value={formData.stack}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('stack')}
                className={getFieldClassName('stack', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
                placeholder="Next.js, TypeScript, PostgreSQL, Tailwind CSS"
              />
              {renderFieldError('stack')}
              {formData.stack && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.stack.split(",").map(s => s.trim()).filter(Boolean).map((item, i) => (
                    <span key={i} className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div data-error={!!fieldErrors.tags && touchedFields.has('tags')}>
              <label className="block text-sm font-medium mb-2">
                Tags <span className="text-red-400">*</span>
                <span className="text-muted-foreground font-normal ml-2">(comma separated)</span>
              </label>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('tags')}
                className={getFieldClassName('tags', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
                placeholder="AI, Fintech, Dashboard, E-commerce"
              />
              {renderFieldError('tags')}
              {formData.tags && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.tags.split(",").map(s => s.trim()).filter(Boolean).map((item, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white/10 text-xs rounded">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 rounded accent-accent"
              />
              <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                Featured Project (will be highlighted on homepage)
              </label>
            </div>
          </div>

          {/* Links */}
          <div className="bg-muted/50 border border-border rounded-xl p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-semibold">Links & Media</h2>

            <div className="grid grid-cols-2 gap-6">
              <div data-error={!!fieldErrors.liveUrl && touchedFields.has('liveUrl')}>
                <label className="block text-sm font-medium mb-2">Live URL</label>
                <input
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('liveUrl')}
                  className={getFieldClassName('liveUrl', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
                  placeholder="https://example.com"
                />
                {renderFieldError('liveUrl')}
              </div>
              <div data-error={!!fieldErrors.repoUrl && touchedFields.has('repoUrl')}>
                <label className="block text-sm font-medium mb-2">Repository URL</label>
                <input
                  name="repoUrl"
                  value={formData.repoUrl}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('repoUrl')}
                  className={getFieldClassName('repoUrl', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
                  placeholder="https://github.com/..."
                />
                {renderFieldError('repoUrl')}
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium mb-3">Thumbnail</label>
              <ThumbnailUpload
                value={formData.thumbnailUrl}
                onChange={(url) => {
                  setFormData(prev => ({ ...prev, thumbnailUrl: url }));
                  setHasInteracted(true);
                }}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Details */}
          <div className="bg-muted/50 border border-border rounded-xl p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-semibold">Case Study Details</h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Highlights
                <span className="text-muted-foreground font-normal ml-2">(one per line)</span>
              </label>
              <textarea
                name="highlights"
                value={formData.highlights}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none resize-none transition-colors"
                placeholder={"Reduced loading time by 50%\nUsed by 1000+ daily active users\nAchieved 99.9% uptime"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Challenges</label>
              <textarea
                name="challenges"
                value={formData.challenges}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none resize-none transition-colors"
                placeholder="Describe the main challenges faced during development..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Results</label>
              <textarea
                name="results"
                value={formData.results}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none resize-none transition-colors"
                placeholder="Describe the outcomes and results of this project..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 rounded-xl border border-border shadow-lg">
            <div className="flex items-center gap-2">
              {Object.keys(fieldErrors).length > 0 && touchedFields.size > 0 && (
                <span className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {Object.keys(fieldErrors).length} validation error(s)
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
