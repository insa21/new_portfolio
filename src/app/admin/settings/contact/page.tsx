"use client";

import { AdminShell } from "@/components/admin";
import { settingsApi, ContactSettings } from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Loader2,
  Mail,
  MapPin,
  Clock,
  Phone,
  Github,
  Linkedin,
  Instagram,
  Settings,
  Globe,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";

const defaultSettings: ContactSettings = {
  email: null,
  whatsapp: null,
  location: null,
  availabilityStatus: 'available',
  availabilityDate: null,
  responseTime: '< 24 jam',
  socialLinks: {
    github: null,
    linkedin: null,
    instagram: null,
  },
};

export default function AdminContactSettingsPage() {
  const { error: showError, success: showSuccess } = useNotification();
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await settingsApi.getContactSettings();
      setSettings(response.data || defaultSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
      showError("Failed to load settings", "Could not fetch contact settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.updateContactSettings(settings);
      showSuccess("Success!", "Contact settings have been saved.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showError("Failed to save", "Could not save contact settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleSocialChange = (platform: 'github' | 'linkedin' | 'instagram', value: string) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || { github: null, linkedin: null, instagram: null }),
        [platform]: value || null,
      },
    }));
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-surface border border-input-border focus:border-accent outline-none transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground";

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
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
              <Settings className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground">Contact Settings</h1>
              <p className="text-muted-foreground">
                Manage contact information and social media displayed on the website
              </p>
            </div>
          </div>
          <Button
            variant="glow"
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>

        {/* Contact Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-surface border border-border space-y-6 shadow-sm"
        >
          <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
            <Globe className="w-5 h-5 text-accent" />
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                <Mail className="w-4 h-4 text-accent" />
                Email
              </label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
                className={inputClasses}
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                <Phone className="w-4 h-4 text-green-400" />
                WhatsApp
              </label>
              <input
                type="text"
                value={settings.whatsapp || ''}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="+62..."
                className={inputClasses}
              />
              <p className="text-xs text-muted-foreground">Format: +62812345678 (with country code)</p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                <MapPin className="w-4 h-4 text-purple-400" />
                Location
              </label>
              <input
                type="text"
                value={settings.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Jakarta, Indonesia"
                className={inputClasses}
              />
            </div>

            {/* Response Time */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                <Clock className="w-4 h-4 text-orange-400" />
                Response Time
              </label>
              <input
                type="text"
                value={settings.responseTime || ''}
                onChange={(e) => handleChange('responseTime', e.target.value)}
                placeholder="< 24 jam"
                className={inputClasses}
              />
            </div>
          </div>
        </motion.div>

        {/* Availability Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-2xl bg-surface border border-border space-y-6 shadow-sm"
        >
          <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Availability Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Availability Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Status</label>
              <select
                value={settings.availabilityStatus || 'available'}
                onChange={(e) => handleChange('availabilityStatus', e.target.value)}
                className={inputClasses}
              >
                <option value="available">Available for New Projects</option>
                <option value="limited">Limited Availability</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            {/* Availability Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">
                Available From
              </label>
              <input
                type="text"
                value={settings.availabilityDate || ''}
                onChange={(e) => handleChange('availabilityDate', e.target.value)}
                placeholder="February 2026"
                className={inputClasses}
              />
            </div>
          </div>
        </motion.div>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-surface border border-border space-y-6 shadow-sm"
        >
          <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
            <Globe className="w-5 h-5 text-blue-400" />
            Social Media
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter full URL for each social media platform. Leave blank if you don't want to display it.
          </p>

          <div className="space-y-4">
            {/* GitHub */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Github className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">GitHub</label>
                <input
                  type="url"
                  value={settings.socialLinks?.github || ''}
                  onChange={(e) => handleSocialChange('github', e.target.value)}
                  placeholder="https://github.com/username"
                  className={`${inputClasses} mt-2`}
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Linkedin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">LinkedIn</label>
                <input
                  type="url"
                  value={settings.socialLinks?.linkedin || ''}
                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className={`${inputClasses} mt-2`}
                />
              </div>
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center flex-shrink-0">
                <Instagram className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">Instagram</label>
                <input
                  type="url"
                  value={settings.socialLinks?.instagram || ''}
                  onChange={(e) => handleSocialChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/username"
                  className={`${inputClasses} mt-2`}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end pt-4">
          <Button
            variant="glow"
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[200px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </AdminShell>
  );
}
