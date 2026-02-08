"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AdminShell, useRequireAdmin } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { settingsApi, BrandingSettings } from "@/lib/api";
import { useNotification } from "@/components/providers/notification-provider";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
  ArrowLeft,
  Sun,
  Moon,
  AlertCircle,
  Save,
  RefreshCw,
  Globe,
  Monitor,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const FAVICON_TYPES = ["image/png", "image/x-icon", "image/vnd.microsoft.icon", "image/svg+xml"];

interface UploadCardProps {
  title: string;
  description: string;
  imageUrl: string | null;
  icon: React.ReactNode;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  isUploading: boolean;
  isRemoving: boolean;
  acceptTypes?: string[];
  updatedAt?: string | null;
}

function UploadCard({
  title,
  description,
  imageUrl,
  icon,
  onUpload,
  onRemove,
  isUploading,
  isRemoving,
  acceptTypes = ALLOWED_TYPES,
  updatedAt,
}: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    if (!acceptTypes.includes(file.type)) {
      setError("Invalid file type.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 5MB.");
      return false;
    }

    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (validateFile(file)) {
      await onUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // Add cache-busting to image URL
  const displayUrl = imageUrl
    ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${updatedAt || Date.now()}`
    : null;

  return (
    <div className="p-6 rounded-2xl bg-surface border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-base">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {imageUrl && (
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Uploaded</span>
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
          ${dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-secondary/30"}
          ${isUploading ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes.join(",")}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
            e.target.value = "";
          }}
          className="hidden"
        />

        {displayUrl ? (
          <div className="relative w-full max-w-[200px] aspect-[3/1] bg-secondary/30 rounded-lg overflow-hidden">
            <NextImage
              src={displayUrl}
              alt="Preview"
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>
        ) : (
          <>
            {isUploading ? (
              <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="w-10 h-10 text-muted-foreground mb-2" />
            )}
            <p className="text-sm text-muted-foreground text-center">
              {isUploading ? "Uploading..." : "Click or drag to upload"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Max 5MB
            </p>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 mt-3 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Actions */}
      {imageUrl && (
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Replace
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async (e) => {
              e.stopPropagation();
              await onRemove();
            }}
            disabled={isRemoving}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            {isRemoving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BrandingSettingsPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const { success, error: errorToast } = useNotification();

  const [settings, setSettings] = useState<BrandingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Upload states
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadingDark, setUploadingDark] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [removingLight, setRemovingLight] = useState(false);
  const [removingDark, setRemovingDark] = useState(false);
  const [removingFavicon, setRemovingFavicon] = useState(false);

  // Form state
  const [siteName, setSiteName] = useState("");
  const [logoAltText, setLogoAltText] = useState("");
  const [desktopLogoHeight, setDesktopLogoHeight] = useState(40);
  const [mobileLogoHeight, setMobileLogoHeight] = useState(32);

  const loadSettings = useCallback(async () => {
    try {
      const response = await settingsApi.getBrandingSettings();
      if (response.success && response.data) {
        setSettings(response.data);
        setSiteName(response.data.siteName || "");
        setLogoAltText(response.data.logoAltText || "");
        setDesktopLogoHeight(response.data.desktopLogoHeight || 40);
        setMobileLogoHeight(response.data.mobileLogoHeight || 32);
      }
    } catch (err) {
      console.error("Failed to load branding settings:", err);
      errorToast("Error", "Failed to load branding settings");
    } finally {
      setIsLoading(false);
    }
  }, [errorToast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const uploadToCloudinary = async (file: File, folder: string, tags: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('tags', tags);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.message || "Upload failed");
    }

    return result.data as { secureUrl: string; publicId: string; width?: number; height?: number };
  };

  const handleUploadLogo = async (file: File, type: 'light' | 'dark' | 'favicon') => {
    const setUploading = type === 'light' ? setUploadingLight
      : type === 'dark' ? setUploadingDark
        : setUploadingFavicon;

    setUploading(true);

    try {
      const folder = type === 'favicon' ? 'portfolio/branding/favicon' : 'portfolio/branding';
      const tags = type === 'favicon' ? 'favicon' : `logo,${type}`;

      const uploaded = await uploadToCloudinary(file, folder, tags);

      const updateData: Partial<BrandingSettings> =
        type === 'light' ? {
          logoUrl: uploaded.secureUrl,
          logoPublicId: uploaded.publicId,
          logoWidth: uploaded.width || null,
          logoHeight: uploaded.height || null,
        }
          : type === 'dark' ? {
            darkLogoUrl: uploaded.secureUrl,
            darkLogoPublicId: uploaded.publicId,
          }
            : {
              faviconUrl: uploaded.secureUrl,
              faviconPublicId: uploaded.publicId,
            };

      const response = await settingsApi.updateBrandingSettings({
        ...settings,
        ...updateData,
        updatedAt: new Date().toISOString(),
      });

      if (response.success && response.data) {
        setSettings(response.data);
        const typeLabel = type === 'light' ? 'Light mode logo' : type === 'dark' ? 'Dark mode logo' : 'Favicon';
        success("Uploaded", `${typeLabel} has been updated.`);
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      errorToast("Upload Failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async (type: 'light' | 'dark' | 'favicon') => {
    const setRemoving = type === 'light' ? setRemovingLight
      : type === 'dark' ? setRemovingDark
        : setRemovingFavicon;

    setRemoving(true);

    try {
      const updateData: Partial<BrandingSettings> =
        type === 'light' ? {
          logoUrl: null,
          logoPublicId: null,
          logoWidth: null,
          logoHeight: null,
        }
          : type === 'dark' ? {
            darkLogoUrl: null,
            darkLogoPublicId: null,
          }
            : {
              faviconUrl: null,
              faviconPublicId: null,
            };

      const response = await settingsApi.updateBrandingSettings({
        ...settings,
        ...updateData,
        updatedAt: new Date().toISOString(),
      });

      if (response.success && response.data) {
        setSettings(response.data);
        const typeLabel = type === 'light' ? 'Light mode logo' : type === 'dark' ? 'Dark mode logo' : 'Favicon';
        success("Removed", `${typeLabel} has been removed.`);
      }
    } catch (err) {
      console.error("Remove failed:", err);
      errorToast("Remove Failed", "Please try again.");
    } finally {
      setRemoving(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await settingsApi.updateBrandingSettings({
        ...settings,
        siteName: siteName || null,
        logoAltText: logoAltText || null,
        desktopLogoHeight: desktopLogoHeight || 40,
        mobileLogoHeight: mobileLogoHeight || 32,
        updatedAt: new Date().toISOString(),
      });

      if (response.success && response.data) {
        setSettings(response.data);
        success("Settings Saved", "Branding settings have been updated.");
      }
    } catch (err) {
      console.error("Save failed:", err);
      errorToast("Save Failed", "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </AdminShell>
    );
  }

  const previewUrl = settings?.logoUrl
    ? `${settings.logoUrl}?t=${settings.updatedAt || Date.now()}`
    : null;
  const darkPreviewUrl = (settings?.darkLogoUrl || settings?.logoUrl)
    ? `${settings.darkLogoUrl || settings.logoUrl}?t=${settings.updatedAt || Date.now()}`
    : null;

  return (
    <AdminShell>
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/settings">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-display">Branding & Logo</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Configure your site logo, favicon, and branding settings
            </p>
          </div>
        </div>

        {/* General Settings */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-6">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-accent" />
            General Settings
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Site Name (Fallback)
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Insacode"
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/30 border border-border focus:border-accent/50 outline-none transition-all text-sm"
              />
              <p className="text-xs text-muted-foreground/60 mt-1">
                Displayed when no logo is uploaded
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Logo Alt Text
              </label>
              <input
                type="text"
                value={logoAltText}
                onChange={(e) => setLogoAltText(e.target.value)}
                placeholder="Site Logo"
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/30 border border-border focus:border-accent/50 outline-none transition-all text-sm"
              />
              <p className="text-xs text-muted-foreground/60 mt-1">
                Accessibility text for screen readers
              </p>
            </div>
          </div>

          {/* Responsive Sizing */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium flex items-center gap-2 mb-4">
              <Monitor className="w-4 h-4" />
              Responsive Logo Sizing
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5" />
                  Desktop Height (px)
                </label>
                <input
                  type="number"
                  value={desktopLogoHeight}
                  onChange={(e) => setDesktopLogoHeight(parseInt(e.target.value) || 40)}
                  min={20}
                  max={80}
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary/30 border border-border focus:border-accent/50 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile Height (px)
                </label>
                <input
                  type="number"
                  value={mobileLogoHeight}
                  onChange={(e) => setMobileLogoHeight(parseInt(e.target.value) || 32)}
                  min={16}
                  max={60}
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary/30 border border-border focus:border-accent/50 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>

        {/* Logo Uploads */}
        <div className="grid gap-6 md:grid-cols-2">
          <UploadCard
            title="Light Mode Logo"
            description="PNG, JPG, WEBP, SVG"
            imageUrl={settings?.logoUrl || null}
            icon={<Sun className="w-5 h-5" />}
            onUpload={(file) => handleUploadLogo(file, 'light')}
            onRemove={() => handleRemoveLogo('light')}
            isUploading={uploadingLight}
            isRemoving={removingLight}
            updatedAt={settings?.updatedAt}
          />

          <UploadCard
            title="Dark Mode Logo"
            description="PNG, JPG, WEBP, SVG"
            imageUrl={settings?.darkLogoUrl || null}
            icon={<Moon className="w-5 h-5" />}
            onUpload={(file) => handleUploadLogo(file, 'dark')}
            onRemove={() => handleRemoveLogo('dark')}
            isUploading={uploadingDark}
            isRemoving={removingDark}
            updatedAt={settings?.updatedAt}
          />
        </div>

        {/* Favicon Upload */}
        <UploadCard
          title="Favicon"
          description="PNG 512x512 recommended, or ICO"
          imageUrl={settings?.faviconUrl || null}
          icon={<Globe className="w-5 h-5" />}
          onUpload={(file) => handleUploadLogo(file, 'favicon')}
          onRemove={() => handleRemoveLogo('favicon')}
          isUploading={uploadingFavicon}
          isRemoving={removingFavicon}
          acceptTypes={FAVICON_TYPES}
          updatedAt={settings?.updatedAt}
        />

        {/* Live Preview */}
        <div className="p-6 rounded-2xl bg-surface border border-border">
          <h3 className="font-semibold text-base mb-4">Live Preview</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-6 rounded-xl bg-white border text-center">
              <p className="text-xs text-gray-500 mb-3">Light Mode</p>
              {previewUrl ? (
                <div className="relative mx-auto" style={{ height: desktopLogoHeight, width: 'auto', maxWidth: 200 }}>
                  <NextImage
                    src={previewUrl}
                    alt={logoAltText || "Logo"}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="text-xl font-bold text-gray-900">{siteName || "Insacode"}</span>
              )}
            </div>

            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 text-center">
              <p className="text-xs text-gray-500 mb-3">Dark Mode</p>
              {darkPreviewUrl ? (
                <div className="relative mx-auto" style={{ height: desktopLogoHeight, width: 'auto', maxWidth: 200 }}>
                  <NextImage
                    src={darkPreviewUrl}
                    alt={logoAltText || "Logo"}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="text-xl font-bold text-white">{siteName || "Insacode"}</span>
              )}
            </div>
          </div>

          {/* Mobile preview */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5" />
              Mobile Preview (height: {mobileLogoHeight}px)
            </p>
            <div className="flex gap-4">
              <div className="p-4 rounded-lg bg-white border flex-1 flex items-center justify-center">
                {previewUrl ? (
                  <div className="relative" style={{ height: mobileLogoHeight, width: 'auto', maxWidth: 120 }}>
                    <NextImage
                      src={previewUrl}
                      alt={logoAltText || "Logo"}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className="text-sm font-bold text-gray-900">{siteName || "Insacode"}</span>
                )}
              </div>
              <div className="p-4 rounded-lg bg-gray-900 border border-gray-800 flex-1 flex items-center justify-center">
                {darkPreviewUrl ? (
                  <div className="relative" style={{ height: mobileLogoHeight, width: 'auto', maxWidth: 120 }}>
                    <NextImage
                      src={darkPreviewUrl}
                      alt={logoAltText || "Logo"}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className="text-sm font-bold text-white">{siteName || "Insacode"}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
