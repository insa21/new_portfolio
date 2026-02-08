"use client";

import { AdminShell } from "@/components/admin";
import { ThumbnailUpload } from "@/components/admin/thumbnail-upload";
import { settingsApi, AboutSettings, AboutParagraph, AboutToolkitItem } from "@/lib/api";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Loader2,
  User,
  Type,
  AlignLeft,
  Wrench,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Upload,
  Download,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";
import Link from "next/link";

const defaultSettings: AboutSettings = {
  headline: {
    text: 'Engineering the future of',
    highlightText: 'web & AI.',
  },
  paragraphs: [
    { id: '1', content: "I'm a Fullstack Engineer with a deep specialization in Artificial Intelligence.", order: 1 },
  ],
  toolkit: [
    { id: '1', name: 'Next.js', category: 'Frontend', order: 1 },
  ],
  resume: {
    enabled: true,
    label: 'Download Resume',
    url: null,
    publicId: null,
    resourceType: null,
    format: null,
    downloadName: 'resume',
  },
  media: {
    type: 'image',
    imageUrl: null,
    imagePublicId: null,
    imageAlt: 'Profile',
    showPlaceholder: true,
    enabled: true,
  },
  seo: {
    metaTitle: 'About | Fullstack Engineer & AI Developer',
    metaDescription: 'My background, experience, and technical approach.',
  },
};

// Tab definitions
const tabs = [
  { id: 'headline', label: 'Headline', icon: Type },
  { id: 'paragraphs', label: 'Bio', icon: AlignLeft },
  { id: 'toolkit', label: 'Toolkit', icon: Wrench },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'media', label: 'Media', icon: ImageIcon },
] as const;

type TabId = typeof tabs[number]['id'];

// Resume Tab Content Component
function ResumeTabContent({
  settings,
  setSettings,
  inputClasses
}: {
  settings: AboutSettings;
  setSettings: React.Dispatch<React.SetStateAction<AboutSettings>>;
  inputClasses: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { error: showError, success: showSuccess, loading: showLoading, update: updateToast } = useNotification();

  const handleResumeChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      resume: {
        enabled: prev.resume?.enabled ?? true,
        label: prev.resume?.label ?? 'Download Resume',
        url: prev.resume?.url ?? null,
        publicId: prev.resume?.publicId ?? null,
        resourceType: prev.resume?.resourceType ?? null,
        format: prev.resume?.format ?? null,
        downloadName: prev.resume?.downloadName ?? 'resume',
        [field]: value,
      },
    }));
  };

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      showError("Invalid file", "Only PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError("File too large", "Maximum file size is 10MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const toastId = showLoading("Uploading...", file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 150);

      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      setSettings(prev => ({
        ...prev,
        resume: {
          enabled: prev.resume?.enabled ?? true,
          label: prev.resume?.label ?? 'Download Resume',
          url: result.data.secureUrl,
          publicId: result.data.publicId,
          resourceType: result.data.resourceType,
          format: result.data.format || 'pdf',
          downloadName: prev.resume?.downloadName ?? 'resume',
        },
      }));

      updateToast(toastId, "success", {
        title: "Upload complete",
        message: `${file.name} uploaded successfully`
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      updateToast(toastId, "error", {
        title: "Upload failed",
        message
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveResume = () => {
    setSettings(prev => ({
      ...prev,
      resume: {
        enabled: prev.resume?.enabled ?? true,
        label: prev.resume?.label ?? 'Download Resume',
        url: null,
        publicId: null,
        resourceType: null,
        format: null,
        downloadName: prev.resume?.downloadName ?? 'resume',
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">CV / Resume Upload</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload your resume (PDF, max 10MB) to be displayed on the About page
        </p>
      </div>
      <div className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border hover:border-zinc-300 transition-colors">
          <input
            type="checkbox"
            id="resumeEnabled"
            checked={settings.resume?.enabled ?? true}
            onChange={(e) => handleResumeChange('enabled', e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-background text-accent focus:ring-accent"
          />
          <label htmlFor="resumeEnabled" className="text-sm font-medium">
            Show resume download button
          </label>
        </div>

        {/* Button Label */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Button Label
          </label>
          <input
            value={settings.resume?.label || ''}
            onChange={(e) => handleResumeChange('label', e.target.value)}
            className={inputClasses}
            placeholder="Download Resume"
          />
        </div>

        {/* Download Filename */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Download Filename
          </label>
          <div className="flex items-center gap-2">
            <input
              value={settings.resume?.downloadName || ''}
              onChange={(e) => handleResumeChange('downloadName', e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              className={inputClasses}
              placeholder="resume"
            />
            <span className="text-sm text-muted-foreground">.{settings.resume?.format || 'pdf'}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This controls the downloaded file name (e.g., resume, cv, firstname-lastname-cv)
          </p>
        </div>

        {/* Upload Section */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Resume File
          </label>

          {settings.resume?.url ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="p-2 rounded-lg bg-accent/20">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Resume uploaded</p>
                <p className="text-xs text-muted-foreground truncate">{settings.resume.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(settings.resume!.url!, '_blank')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={handleRemoveResume}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer
                ${isUploading
                  ? 'border-accent/50 bg-accent/5'
                  : 'border-border hover:border-accent/50 hover:bg-muted/50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
                disabled={isUploading}
              />

              {isUploading ? (
                <div className="text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                  <div className="w-48 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    PDF only • Max 10MB
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Media Tab Content Component  
function MediaTabContent({
  settings,
  setSettings,
  inputClasses
}: {
  settings: AboutSettings;
  setSettings: React.Dispatch<React.SetStateAction<AboutSettings>>;
  inputClasses: string;
}) {
  const handleImageChange = (url: string, publicId?: string) => {
    setSettings(prev => ({
      ...prev,
      media: {
        type: prev.media?.type ?? 'image',
        imageUrl: url || null,
        imagePublicId: publicId || null,
        imageAlt: prev.media?.imageAlt ?? 'Profile',
        showPlaceholder: prev.media?.showPlaceholder ?? true,
        enabled: prev.media?.enabled ?? true,
      },
    }));
  };

  const handleMediaChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      media: {
        type: prev.media?.type ?? 'image',
        imageUrl: prev.media?.imageUrl ?? null,
        imagePublicId: prev.media?.imagePublicId ?? null,
        imageAlt: prev.media?.imageAlt ?? 'Profile',
        showPlaceholder: prev.media?.showPlaceholder ?? true,
        enabled: prev.media?.enabled ?? true,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Profile Photo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a profile photo to be displayed on the About page
        </p>
      </div>
      <div className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border hover:border-zinc-300 transition-colors">
          <input
            type="checkbox"
            id="mediaEnabled"
            checked={settings.media?.enabled ?? true}
            onChange={(e) => handleMediaChange('enabled', e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-background text-accent focus:ring-accent"
          />
          <label htmlFor="mediaEnabled" className="text-sm font-medium">
            Show profile photo
          </label>
        </div>

        {/* Profile Photo Upload */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Profile Photo
          </label>
          <ThumbnailUpload
            value={settings.media?.imageUrl || ''}
            onChange={handleImageChange}
          />
        </div>

        {/* Alt Text */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Image Alt Text
          </label>
          <input
            value={settings.media?.imageAlt || ''}
            onChange={(e) => handleMediaChange('imageAlt', e.target.value)}
            className={inputClasses}
            placeholder="Profile photo"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Describe the image for accessibility
          </p>
        </div>

        {/* Show Placeholder Toggle */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border hover:border-zinc-300 transition-colors">
          <input
            type="checkbox"
            id="showPlaceholder"
            checked={settings.media?.showPlaceholder ?? true}
            onChange={(e) => handleMediaChange('showPlaceholder', e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-background text-accent focus:ring-accent"
          />
          <label htmlFor="showPlaceholder" className="text-sm font-medium">
            Show placeholder if no image is set
          </label>
        </div>
      </div>
    </div>
  );
}

export default function AdminAboutSettingsPage() {
  const { error: showError, success: showSuccess } = useNotification();
  const [settings, setSettings] = useState<AboutSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('headline');

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await settingsApi.getAboutSettings();
      setSettings(response.data || defaultSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
      showError("Failed to load settings", "Could not fetch about settings.");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.updateAboutSettings(settings);
      showSuccess("Success!", "About settings have been saved.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showError("Failed to save", "Could not save about settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Headline handlers
  const handleHeadlineChange = (field: 'text' | 'highlightText', value: string) => {
    setSettings(prev => ({
      ...prev,
      headline: {
        ...prev.headline,
        [field]: value,
      } as typeof prev.headline,
    }));
  };

  // Paragraph handlers
  const addParagraph = () => {
    const newParagraph: AboutParagraph = {
      id: Date.now().toString(),
      content: '',
      order: (settings.paragraphs?.length || 0) + 1,
    };
    setSettings(prev => ({
      ...prev,
      paragraphs: [...(prev.paragraphs || []), newParagraph],
    }));
  };

  const updateParagraph = (id: string, content: string) => {
    setSettings(prev => ({
      ...prev,
      paragraphs: (prev.paragraphs || []).map(p =>
        p.id === id ? { ...p, content } : p
      ),
    }));
  };

  const removeParagraph = (id: string) => {
    setSettings(prev => ({
      ...prev,
      paragraphs: (prev.paragraphs || []).filter(p => p.id !== id),
    }));
  };

  const moveParagraph = (id: string, direction: 'up' | 'down') => {
    setSettings(prev => {
      const paragraphs = [...(prev.paragraphs || [])];
      const index = paragraphs.findIndex(p => p.id === id);
      if (direction === 'up' && index > 0) {
        [paragraphs[index - 1], paragraphs[index]] = [paragraphs[index], paragraphs[index - 1]];
      } else if (direction === 'down' && index < paragraphs.length - 1) {
        [paragraphs[index], paragraphs[index + 1]] = [paragraphs[index + 1], paragraphs[index]];
      }
      return { ...prev, paragraphs };
    });
  };

  // Toolkit handlers
  const addToolkitItem = () => {
    const newItem: AboutToolkitItem = {
      id: Date.now().toString(),
      name: '',
      category: 'Other',
      order: (settings.toolkit?.length || 0) + 1,
    };
    setSettings(prev => ({
      ...prev,
      toolkit: [...(prev.toolkit || []), newItem],
    }));
  };

  const updateToolkitItem = (id: string, field: keyof AboutToolkitItem, value: string) => {
    setSettings(prev => ({
      ...prev,
      toolkit: (prev.toolkit || []).map(t =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    }));
  };

  const removeToolkitItem = (id: string) => {
    setSettings(prev => ({
      ...prev,
      toolkit: (prev.toolkit || []).filter(t => t.id !== id),
    }));
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all duration-300 placeholder:text-muted-foreground/40 shadow-sm";
  const textareaClasses = `${inputClasses} min-h-[100px] resize-none`;

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display">About Page Settings</h1>
                <p className="text-sm text-muted-foreground">
                  Manage all content for the About page
                </p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border mb-6"
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl bg-muted/50 border border-border p-6 shadow-sm"
        >
          {/* Headline Tab */}
          {activeTab === 'headline' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Page Headline</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The headline appears at the top of the About page. The highlight text will be displayed in the accent color.
                </p>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Main Text
                  </label>
                  <input
                    value={settings.headline?.text || ''}
                    onChange={(e) => handleHeadlineChange('text', e.target.value)}
                    className={inputClasses}
                    placeholder="Engineering the future of"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Highlighted Text (accent color)
                  </label>
                  <input
                    value={settings.headline?.highlightText || ''}
                    onChange={(e) => handleHeadlineChange('highlightText', e.target.value)}
                    className={inputClasses}
                    placeholder="web & AI."
                  />
                </div>
              </div>
              <div className="p-6 rounded-xl bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <p className="text-2xl font-bold font-display">
                  {settings.headline?.text || 'Your headline'}{' '}
                  <span className="text-accent">{settings.headline?.highlightText || 'highlighted text'}</span>
                </p>
              </div>
            </div>
          )}

          {/* Paragraphs Tab */}
          {activeTab === 'paragraphs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Bio Paragraphs</h3>
                  <p className="text-sm text-muted-foreground">
                    Add, edit, or reorder your bio paragraphs
                  </p>
                </div>
                <Button onClick={addParagraph} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Paragraph
                </Button>
              </div>
              <div className="space-y-4">
                {(settings.paragraphs || []).map((para, index) => (
                  <div
                    key={para.id}
                    className="p-4 rounded-xl bg-muted/50 border border-border space-y-3 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Paragraph {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveParagraph(para.id, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveParagraph(para.id, 'down')}
                          disabled={index === (settings.paragraphs?.length || 0) - 1}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => removeParagraph(para.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <textarea
                      value={para.content}
                      onChange={(e) => updateParagraph(para.id, e.target.value)}
                      className={textareaClasses}
                      placeholder="Write your paragraph here..."
                    />
                  </div>
                ))}
                {(settings.paragraphs?.length || 0) === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlignLeft className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No paragraphs yet. Add your first paragraph above.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Toolkit Tab */}
          {activeTab === 'toolkit' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Technical Toolkit</h3>
                  <p className="text-sm text-muted-foreground">
                    Add technologies that will be displayed as chips
                  </p>
                </div>
                <Button onClick={addToolkitItem} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tech
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(settings.toolkit || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border hover:shadow-sm transition-all"
                  >
                    <input
                      value={item.name}
                      onChange={(e) => updateToolkitItem(item.id, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-accent outline-none text-sm shadow-sm"
                      placeholder="Technology name"
                    />
                    <select
                      value={item.category || 'Other'}
                      onChange={(e) => updateToolkitItem(item.id, 'category', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-background border border-border focus:border-accent outline-none text-sm shadow-sm"
                    >
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Database">Database</option>
                      <option value="DevOps">DevOps</option>
                      <option value="AI/ML">AI/ML</option>
                      <option value="Language">Language</option>
                      <option value="Other">Other</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => removeToolkitItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {(settings.toolkit?.length || 0) > 0 && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-3">Preview:</p>
                  <div className="flex flex-wrap gap-2">
                    {settings.toolkit?.map(item => (
                      <span
                        key={item.id}
                        className="px-3 py-1.5 rounded-md bg-muted text-sm font-medium border border-border shadow-sm"
                      >
                        {item.name || 'Tech Name'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resume Tab */}
          {activeTab === 'resume' && (
            <ResumeTabContent
              settings={settings}
              setSettings={setSettings}
              inputClasses={inputClasses}
            />
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <MediaTabContent
              settings={settings}
              setSettings={setSettings}
              inputClasses={inputClasses}
            />
          )}
        </motion.div>
      </div>
    </AdminShell>
  );
}
