"use client";

import { AdminShell } from "@/components/admin";
import { settingsApi, FooterSettings, FooterSitemapLink, mediaApi } from "@/lib/api";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Save,
  Loader2,
  FileText,
  Link2,
  Plus,
  Trash2,
  GripVertical,
  LayoutGrid,
  Users,
  Type,
  ImageIcon,
  Upload,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";

const defaultSettings: FooterSettings = {
  logoUrl: null,
  logoPublicId: null,
  logoDarkUrl: null,
  logoDarkPublicId: null,
  logoAltText: 'Site Logo',
  showLogo: false,
  siteName: 'Indra Saepudin',
  description: 'Building scalable web products and AI-powered automation for real-world impact.',
  copyright: '© {year} Indra Saepudin. All rights reserved.',
  sitemapLinks: [
    { id: '1', label: 'Projects', href: '/projects', order: 1 },
    { id: '2', label: 'Blog', href: '/blog', order: 2 },
    { id: '3', label: 'Services', href: '/services', order: 3 },
    { id: '4', label: 'About', href: '/about', order: 4 },
    { id: '5', label: 'Contact', href: '/contact', order: 5 },
  ],
  showSitemap: true,
  showConnect: true,
};

export default function AdminFooterSettingsPage() {
  const { error: showError, success: showSuccess } = useNotification();
  const [settings, setSettings] = useState<FooterSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const darkLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await settingsApi.getFooterSettings();
      setSettings(response.data || defaultSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
      showError("Failed to load settings", "Could not fetch footer settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.updateFooterSettings(settings);
      showSuccess("Success!", "Footer settings have been saved.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showError("Failed to save", "Could not save footer settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof FooterSettings, value: string | boolean | null) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await mediaApi.upload(file);
      const media = response.data as { url: string; publicId: string };
      setSettings(prev => ({
        ...prev,
        logoUrl: media.url,
        logoPublicId: media.publicId,
      }));
      showSuccess("Logo uploaded!", "Your logo has been uploaded successfully.");
    } catch (error) {
      console.error("Failed to upload logo:", error);
      showError("Upload failed", "Could not upload logo image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDarkLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await mediaApi.upload(file);
      const media = response.data as { url: string; publicId: string };
      setSettings(prev => ({
        ...prev,
        logoDarkUrl: media.url,
        logoDarkPublicId: media.publicId,
      }));
      showSuccess("Dark Mode Logo uploaded!", "Your dark mode logo has been uploaded successfully.");
    } catch (error) {
      console.error("Failed to upload dark logo:", error);
      showError("Upload failed", "Could not upload dark logo image.");
    } finally {
      setIsUploading(false);
      if (darkLogoInputRef.current) darkLogoInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setSettings(prev => ({
      ...prev,
      logoUrl: null,
      logoPublicId: null,
    }));
  };

  const handleRemoveDarkLogo = () => {
    setSettings(prev => ({
      ...prev,
      logoDarkUrl: null,
      logoDarkPublicId: null,
    }));
  };

  const handleAddLink = () => {
    const newLink: FooterSitemapLink = {
      id: crypto.randomUUID(),
      label: '',
      href: '/',
      order: (settings.sitemapLinks?.length || 0) + 1,
    };
    setSettings(prev => ({
      ...prev,
      sitemapLinks: [...(prev.sitemapLinks || []), newLink],
    }));
  };

  const handleRemoveLink = (id: string) => {
    setSettings(prev => ({
      ...prev,
      sitemapLinks: (prev.sitemapLinks || []).filter(link => link.id !== id),
    }));
  };

  const handleLinkChange = (id: string, field: keyof FooterSitemapLink, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      sitemapLinks: (prev.sitemapLinks || []).map(link =>
        link.id === id ? { ...link, [field]: value } : link
      ),
    }));
  };

  const inputClasses = "w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-surface border border-input-border focus:border-accent outline-none transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground text-sm sm:text-base";

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-0"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground">Footer Settings</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage footer content displayed across the website
              </p>
            </div>
          </div>
          <Button
            variant="glow"
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 sm:p-6 rounded-2xl bg-surface border border-border space-y-4 sm:space-y-6 shadow-sm"
        >
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-3 text-foreground">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            Logo
          </h2>

          <div className="space-y-6">
            {/* Show Logo Toggle */}
            <label className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-surface border border-border shadow-sm cursor-pointer hover:border-accent transition-colors">
              <div>
                <p className="font-medium text-foreground text-sm sm:text-base">Show Logo</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Display logo next to site name</p>
              </div>
              <input
                type="checkbox"
                checked={settings.showLogo === true}
                onChange={(e) => handleChange('showLogo', e.target.checked)}
                className="w-5 h-5 rounded accent-accent"
              />
            </label>

            {/* Light Mode Logo */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground/80">Light Mode Logo</h3>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-full sm:w-32 h-24 sm:h-32 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden">
                  {settings.logoUrl ? (
                    <Image
                      src={settings.logoUrl}
                      alt="Light Mode Logo"
                      width={100}
                      height={100}
                      className="object-contain max-h-full"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Upload Light Logo
                    </Button>
                    {settings.logoUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveLogo}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Mode Logo */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground/80">Dark Mode Logo</h3>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-full sm:w-32 h-24 sm:h-32 rounded-xl bg-gray-900 border border-border flex items-center justify-center overflow-hidden">
                  {settings.logoDarkUrl ? (
                    <Image
                      src={settings.logoDarkUrl}
                      alt="Dark Mode Logo"
                      width={100}
                      height={100}
                      className="object-contain max-h-full"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <input
                    ref={darkLogoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleDarkLogoUpload}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => darkLogoInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Upload Dark Logo
                    </Button>
                    {settings.logoDarkUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveDarkLogo}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Alt Text */}
            <div className="space-y-1 pt-2 border-t border-border">
              <label className="text-xs sm:text-sm font-medium text-foreground/80">Alt Text (for both)</label>
              <input
                type="text"
                value={settings.logoAltText || ''}
                onChange={(e) => handleChange('logoAltText', e.target.value)}
                placeholder="Logo description for accessibility"
                className={inputClasses}
              />
            </div>
          </div>
        </motion.div>

        {/* Branding Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 sm:p-6 rounded-2xl bg-surface border border-border space-y-4 sm:space-y-6 shadow-sm"
        >
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-3 text-foreground">
            <Type className="w-5 h-5 text-accent" />
            Branding & Text
          </h2>

          <div className="space-y-4">
            {/* Site Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/80">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName || ''}
                onChange={(e) => handleChange('siteName', e.target.value)}
                placeholder="Your Name or Brand"
                className={inputClasses}
              />
              <p className="text-xs text-muted-foreground">
                Displayed at the top of the footer
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/80">
                <FileText className="w-4 h-4 text-accent" />
                Description
              </label>
              <textarea
                value={settings.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description or tagline"
                rows={3}
                className={`${inputClasses} resize-none`}
              />
            </div>

            {/* Copyright */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground/80">
                Copyright Text
              </label>
              <input
                type="text"
                value={settings.copyright || ''}
                onChange={(e) => handleChange('copyright', e.target.value)}
                placeholder="© {year} Your Name. All rights reserved."
                className={inputClasses}
              />
              <p className="text-xs text-muted-foreground">
                Use <code className="bg-secondary px-1 rounded">{'{year}'}</code> to automatically insert the current year
              </p>
            </div>
          </div>
        </motion.div>

        {/* Visibility Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 sm:p-6 rounded-2xl bg-surface border border-border space-y-4 sm:space-y-6 shadow-sm"
        >
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-3 text-foreground">
            <Users className="w-5 h-5 text-green-400" />
            Section Visibility
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Show Sitemap */}
            <label className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-surface border border-border shadow-sm cursor-pointer hover:border-accent transition-colors">
              <div>
                <p className="font-medium text-foreground text-sm sm:text-base">Show Sitemap</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Display navigation links</p>
              </div>
              <input
                type="checkbox"
                checked={settings.showSitemap !== false}
                onChange={(e) => handleChange('showSitemap', e.target.checked)}
                className="w-5 h-5 rounded accent-accent"
              />
            </label>

            {/* Show Connect */}
            <label className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-surface border border-border shadow-sm cursor-pointer hover:border-accent transition-colors">
              <div>
                <p className="font-medium text-foreground text-sm sm:text-base">Show Connect</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Display social links & copyright</p>
              </div>
              <input
                type="checkbox"
                checked={settings.showConnect !== false}
                onChange={(e) => handleChange('showConnect', e.target.checked)}
                className="w-5 h-5 rounded accent-accent"
              />
            </label>
          </div>
        </motion.div>

        {/* Sitemap Links Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 sm:p-6 rounded-2xl bg-surface border border-border space-y-4 sm:space-y-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-3 text-foreground">
              <Link2 className="w-5 h-5 text-blue-400" />
              Sitemap Links
            </h2>
            <Button variant="outline" size="sm" onClick={handleAddLink} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Configure the navigation links displayed in the footer
          </p>

          <div className="space-y-3">
            {(settings.sitemapLinks || [])
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((link, index) => (
                <div
                  key={link.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-xl bg-surface border border-border shadow-sm"
                >
                  <div className="hidden sm:block text-muted-foreground cursor-move">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-1 grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
                    <input
                      type="number"
                      value={link.order || index + 1}
                      onChange={(e) => handleLinkChange(link.id, 'order', parseInt(e.target.value) || 0)}
                      placeholder="#"
                      className={`${inputClasses} text-center`}
                      min={1}
                    />
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleLinkChange(link.id, 'label', e.target.value)}
                      placeholder="Label"
                      className={inputClasses}
                    />
                    <input
                      type="text"
                      value={link.href}
                      onChange={(e) => handleLinkChange(link.id, 'href', e.target.value)}
                      placeholder="/path"
                      className={inputClasses}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLink(link.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 self-end sm:self-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

            {(!settings.sitemapLinks || settings.sitemapLinks.length === 0) && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No sitemap links configured. Click &quot;Add Link&quot; to create one.
              </p>
            )}
          </div>
        </motion.div>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end pt-4 pb-8">
          <Button
            variant="glow"
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </AdminShell>
  );
}
