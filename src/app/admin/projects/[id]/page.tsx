"use client";

import { AdminShell, ThumbnailUpload } from "@/components/admin";
import { projectsApi, getErrorMessage, logApiError } from "@/lib/api";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  featured: boolean;
  year: string;
  stack: string[];
  tags: string[];
  thumbnailUrl: string;
  liveUrl: string;
  repoUrl: string;
  highlights: string[];
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
  status: "LIVE",
  featured: false,
  year: new Date().getFullYear().toString(),
  stack: [],
  tags: [],
  thumbnailUrl: "",
  liveUrl: "",
  repoUrl: "",
  highlights: [],
  challenges: "",
  results: "",
};

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ============================================================================
// Validation Functions
// ============================================================================

function validateForm(form: ProjectForm, stackInput: string, tagsInput: string): FieldError {
  const errors: FieldError = {};

  // Title validation
  if (!form.title.trim()) {
    errors.title = "Title is required";
  } else if (form.title.length < 3) {
    errors.title = "Title must be at least 3 characters";
  } else if (form.title.length > 100) {
    errors.title = "Title must be less than 100 characters";
  }

  // Slug validation
  if (!form.slug.trim()) {
    errors.slug = "Slug is required";
  } else if (!SLUG_REGEX.test(form.slug)) {
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
  const stackItems = stackInput.split(",").map(s => s.trim()).filter(Boolean);
  if (stackItems.length === 0) {
    errors.stack = "At least one tech stack item is required";
  }

  // Tags validation
  const tagItems = tagsInput.split(",").map(s => s.trim()).filter(Boolean);
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

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const {
    error: showError,
    loading: showLoading,
    update: updateToast,
    warning,
    info
  } = useNotification();

  // Form state
  const [form, setForm] = useState<ProjectForm>(INITIAL_FORM);
  const [originalForm, setOriginalForm] = useState<ProjectForm>(INITIAL_FORM);
  const [stackInput, setStackInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [highlightsInput, setHighlightsInput] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const submitCountRef = useRef(0);

  // ============================================================================
  // Effects
  // ============================================================================

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await projectsApi.getById(projectId);
        const project = response.data as ProjectForm & { tags: Array<{ tag: string }> | string[] };

        // Handle tags array format from API
        const normalizedTags = Array.isArray(project.tags)
          ? project.tags.map((t: { tag: string } | string) => typeof t === 'object' ? t.tag : t)
          : [];

        const loadedForm = {
          ...project,
          // Ensure string fields are never null
          title: project.title || "",
          slug: project.slug || "",
          tagline: project.tagline || "",
          description: project.description || "",
          type: project.type || "Web App",
          status: project.status || "IN_PROGRESS",
          thumbnailUrl: project.thumbnailUrl || "",
          liveUrl: project.liveUrl || "",
          repoUrl: project.repoUrl || "",
          challenges: project.challenges || "",
          results: project.results || "",
          // Array fields
          tags: normalizedTags,
          stack: project.stack || [],
          highlights: project.highlights || [],
        };

        setForm(loadedForm);
        setOriginalForm(loadedForm);
        setStackInput((project.stack || []).join(", "));
        setTagsInput(normalizedTags.join(", "));
        setHighlightsInput((project.highlights || []).join("\n"));
      } catch (err) {
        logApiError("Failed to load project", err);
        const errorMessage = getErrorMessage(err, "Could not fetch project data");
        setLoadError(errorMessage);
        showError("Failed to load project", errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, showError]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm) ||
      stackInput !== (originalForm.stack || []).join(", ") ||
      tagsInput !== (originalForm.tags || []).join(", ") ||
      highlightsInput !== (originalForm.highlights || []).join("\n");

    setHasUnsavedChanges(hasChanges);
  }, [form, originalForm, stackInput, tagsInput, highlightsInput]);

  // Warn on unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));

    // Validate single field
    const errors = validateForm(form, stackInput, tagsInput);
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

  const handleTitleChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      title: value,
      // Auto-generate slug if slug is empty or matches the previous auto-generated slug
      slug: prev.slug === slugify(prev.title) || prev.slug === ""
        ? slugify(value)
        : prev.slug
    }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSaving) {
      warning("Please wait", "Already saving changes...");
      return;
    }

    // Validate all fields
    const errors = validateForm(form, stackInput, tagsInput);
    setFieldErrors(errors);
    setTouchedFields(new Set(Object.keys(errors)));

    if (Object.keys(errors).length > 0) {
      showError("Validation failed", "Please fix the errors before saving");
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSaving(true);
    submitCountRef.current++;
    const currentSubmitCount = submitCountRef.current;
    const toastId = showLoading("Saving project...", "Updating project information");

    try {
      const data = {
        ...form,
        stack: stackInput.split(",").map((s) => s.trim()).filter(Boolean),
        tags: tagsInput.split(",").map((s) => s.trim()).filter(Boolean),
        highlights: highlightsInput.split("\n").map((s) => s.trim()).filter(Boolean),
      };

      await projectsApi.update(projectId, data);

      // Check if this is still the current submission
      if (currentSubmitCount !== submitCountRef.current) return;

      updateToast(toastId, "success", {
        title: "Project updated",
        message: "Changes have been saved successfully"
      });

      // Update original form to reflect saved state
      setOriginalForm(form);
      setHasUnsavedChanges(false);

      router.push("/admin/projects");
    } catch (err) {
      // Check if this is still the current submission
      if (currentSubmitCount !== submitCountRef.current) return;

      logApiError("Failed to update project", err);
      updateToast(toastId, "error", {
        title: "Failed to save",
        message: getErrorMessage(err, "Please check your input and try again"),
        action: {
          label: "Retry",
          onClick: () => handleSubmit(e)
        }
      });
    } finally {
      if (currentSubmitCount === submitCountRef.current) {
        setIsSaving(false);
      }
    }
  }, [form, stackInput, tagsInput, highlightsInput, projectId, isSaving, router, showError, showLoading, updateToast, warning]);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (!confirm("You have unsaved changes. Are you sure you want to leave?")) {
        return;
      }
    }
    router.push("/admin/projects");
  };

  const handleRetryLoad = () => {
    setLoadError(null);
    setIsLoading(true);
    // Trigger re-fetch by changing a dependency
    window.location.reload();
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
  // Loading State
  // ============================================================================

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================

  if (loadError) {
    return (
      <AdminShell>
        <div className="max-w-lg mx-auto py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load project</h2>
          <p className="text-muted-foreground mb-6">{loadError}</p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={handleRetryLoad}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/admin/projects">Back to Projects</Link>
            </Button>
          </div>
        </div>
      </AdminShell>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <AdminShell>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-display">Edit Project</h1>
              {hasUnsavedChanges && (
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  Unsaved changes
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Update project information
            </p>
          </div>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-muted/50 border border-border rounded-xl p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Basic Information
              {Object.keys(fieldErrors).filter(k => ['title', 'slug', 'tagline', 'description', 'type', 'status', 'year'].includes(k)).length > 0 && (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div data-error={!!fieldErrors.title && touchedFields.has('title')}>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onBlur={() => handleFieldBlur('title')}
                  className={getFieldClassName('title', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
                  placeholder="My Awesome Project"
                  maxLength={100}
                />
                <div className="flex justify-between">
                  {renderFieldError('title')}
                  <span className="text-xs text-muted-foreground ml-auto">{form.title.length}/100</span>
                </div>
              </div>

              <div data-error={!!fieldErrors.slug && touchedFields.has('slug')}>
                <label className="block text-sm font-medium mb-2">
                  Slug <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                  onBlur={() => handleFieldBlur('slug')}
                  className={getFieldClassName('slug', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
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
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                onBlur={() => handleFieldBlur('tagline')}
                className={getFieldClassName('tagline', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
                placeholder="A brief description of what your project does"
                maxLength={200}
              />
              <div className="flex justify-between">
                {renderFieldError('tagline')}
                <span className="text-xs text-muted-foreground ml-auto">{form.tagline.length}/200</span>
              </div>
            </div>

            <div data-error={!!fieldErrors.description && touchedFields.has('description')}>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                onBlur={() => handleFieldBlur('description')}
                rows={4}
                className={getFieldClassName('description', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none resize-none transition-colors')}
                placeholder="Detailed description of your project (minimum 50 characters)"
                maxLength={2000}
              />
              <div className="flex justify-between">
                {renderFieldError('description')}
                <span className="text-xs text-muted-foreground ml-auto">{form.description.length}/2000</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors"
                >
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors"
                >
                  {PROJECT_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {status === "IN_PROGRESS" ? "In Progress" : status}
                    </option>
                  ))}
                </select>
              </div>

              <div data-error={!!fieldErrors.year && touchedFields.has('year')}>
                <label className="block text-sm font-medium mb-2">
                  Year <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  onBlur={() => handleFieldBlur('year')}
                  className={getFieldClassName('year', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
                  placeholder="2024"
                  maxLength={4}
                />
                {renderFieldError('year')}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 accent-accent"
              />
              <label htmlFor="featured" className="text-sm cursor-pointer">
                Featured Project (will be highlighted on homepage)
              </label>
            </div>
          </div>

          {/* Tech & Tags */}
          <div className="bg-muted/50 border border-border rounded-xl p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold">Tech Stack & Tags</h2>

            <div data-error={!!fieldErrors.stack && touchedFields.has('stack')}>
              <label className="block text-sm font-medium mb-2">
                Tech Stack <span className="text-red-400">*</span>
                <span className="text-muted-foreground font-normal ml-2">(comma separated)</span>
              </label>
              <input
                type="text"
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                onBlur={() => handleFieldBlur('stack')}
                placeholder="Next.js, Python, TensorFlow, PostgreSQL"
                className={getFieldClassName('stack', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
              />
              {renderFieldError('stack')}
              {stackInput && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {stackInput.split(",").map((s, i) => s.trim()).filter(Boolean).map((item, i) => (
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
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onBlur={() => handleFieldBlur('tags')}
                placeholder="AI, Fintech, Dashboard, E-commerce"
                className={getFieldClassName('tags', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
              />
              {renderFieldError('tags')}
              {tagsInput && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tagsInput.split(",").map((s, i) => s.trim()).filter(Boolean).map((item, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white/10 text-xs rounded">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* URLs */}
          <div className="bg-muted/50 border border-border rounded-xl p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold">Links & Media</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div data-error={!!fieldErrors.liveUrl && touchedFields.has('liveUrl')}>
                <label className="block text-sm font-medium mb-2">Live URL</label>
                <input
                  type="url"
                  value={form.liveUrl}
                  onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                  onBlur={() => handleFieldBlur('liveUrl')}
                  placeholder="https://example.com"
                  className={getFieldClassName('liveUrl', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
                />
                {renderFieldError('liveUrl')}
              </div>

              <div data-error={!!fieldErrors.repoUrl && touchedFields.has('repoUrl')}>
                <label className="block text-sm font-medium mb-2">Repository URL</label>
                <input
                  type="url"
                  value={form.repoUrl}
                  onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                  onBlur={() => handleFieldBlur('repoUrl')}
                  placeholder="https://github.com/..."
                  className={getFieldClassName('repoUrl', 'w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors')}
                />
                {renderFieldError('repoUrl')}
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium mb-3">Thumbnail</label>
              <ThumbnailUpload
                value={form.thumbnailUrl}
                onChange={(url) => setForm({ ...form, thumbnailUrl: url })}
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Case Study */}
          <div className="bg-muted/50 border border-border rounded-xl p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold">Case Study Details</h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Highlights
                <span className="text-muted-foreground font-normal ml-2">(one per line)</span>
              </label>
              <textarea
                value={highlightsInput}
                onChange={(e) => setHighlightsInput(e.target.value)}
                rows={4}
                placeholder={"Reduced forecasting error by 45%\nProcessed over $50M in transaction data\nDeployed to 10,000+ daily active users"}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none resize-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Challenges</label>
              <textarea
                value={form.challenges}
                onChange={(e) => setForm({ ...form, challenges: e.target.value })}
                rows={3}
                placeholder="Describe the main challenges faced during this project..."
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none resize-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Results</label>
              <textarea
                value={form.results}
                onChange={(e) => setForm({ ...form, results: e.target.value })}
                rows={3}
                placeholder="Describe the outcomes and results of this project..."
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent outline-none resize-none transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 rounded-xl border border-border shadow-lg">
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-yellow-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Unsaved changes
                </span>
              )}
              {!hasUnsavedChanges && !isLoading && (
                <span className="text-sm text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  All changes saved
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !hasUnsavedChanges}
                className="min-w-[140px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
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
