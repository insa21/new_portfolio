"use client";

import { AdminShell } from "@/components/admin";
import { settingsApi, HomeSettings, StatItem, TechStackItem } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Loader2,
  Home,
  Type,
  MousePointerClick,
  BarChart3,
  Code2,
  Search,
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

const defaultSettings: HomeSettings = {
  hero: {
    title: 'Fullstack Engineer & AI Developer',
    subtitle: 'Building scalable web products and AI-powered automation for real-world impact.',
    badge: {
      enabled: true,
      text: 'Available for Freelance',
    },
    ctaButtons: [
      { label: 'View Projects', href: '/projects', variant: 'primary' },
      { label: 'Contact Me', href: '/contact', variant: 'secondary' },
    ],
  },
  stats: [
    { id: '1', value: '10+', label: 'Projects Completed', icon: 'folder' },
    { id: '2', value: '3+', label: 'Years Experience', icon: 'clock' },
    { id: '3', value: '100%', label: 'Project Completion', icon: 'check' },
  ],
  techStack: [
    // Frontend
    { id: '1', name: 'React', icon: 'react', category: 'Frontend' },
    { id: '2', name: 'Next.js', icon: 'nextjs', category: 'Frontend' },
    { id: '3', name: 'TypeScript', icon: 'typescript', category: 'Frontend' },
    { id: '4', name: 'Tailwind CSS', icon: 'tailwindcss', category: 'Frontend' },
    { id: '5', name: 'Framer Motion', icon: 'framer', category: 'Frontend' },
    { id: '6', name: 'Redux', icon: 'redux', category: 'Frontend' },
    // Backend
    { id: '7', name: 'Node.js', icon: 'nodejs', category: 'Backend' },
    { id: '8', name: 'Express', icon: 'express', category: 'Backend' },
    { id: '9', name: 'NestJS', icon: 'nestjs', category: 'Backend' },
    { id: '10', name: 'Python', icon: 'python', category: 'Backend' },
    { id: '11', name: 'FastAPI', icon: 'fastapi', category: 'Backend' },
    { id: '12', name: 'GraphQL', icon: 'graphql', category: 'Backend' },
    // Database
    { id: '13', name: 'PostgreSQL', icon: 'postgresql', category: 'Database' },
    { id: '14', name: 'MongoDB', icon: 'mongodb', category: 'Database' },
    { id: '15', name: 'Redis', icon: 'redis', category: 'Database' },
    { id: '16', name: 'Prisma', icon: 'prisma', category: 'Database' },
    { id: '17', name: 'Supabase', icon: 'supabase', category: 'Database' },
    { id: '18', name: 'Firebase', icon: 'firebase', category: 'Database' },
    // DevOps & Tools
    { id: '19', name: 'Docker', icon: 'docker', category: 'DevOps' },
    { id: '20', name: 'Git', icon: 'git', category: 'DevOps' },
    { id: '21', name: 'GitHub', icon: 'github', category: 'DevOps' },
    { id: '22', name: 'Vercel', icon: 'vercel', category: 'DevOps' },
    { id: '23', name: 'AWS', icon: 'aws', category: 'DevOps' },
    { id: '24', name: 'Linux', icon: 'linux', category: 'DevOps' },
    // AI & Machine Learning
    { id: '25', name: 'OpenAI', icon: 'openai', category: 'AI/ML' },
    { id: '26', name: 'TensorFlow', icon: 'tensorflow', category: 'AI/ML' },
    { id: '27', name: 'PyTorch', icon: 'pytorch', category: 'AI/ML' },
  ],
  featuredHighlights: {
    enabled: false,
    items: [],
  },
  seo: {
    metaTitle: 'Indra Saepudin - Fullstack Engineer & AI Developer',
    metaDescription: 'Building scalable web products and AI-powered automation for real-world impact.',
    ogImage: null,
    keywords: 'fullstack, web developer, AI, machine learning',
  },
};

type DeleteAction =
  | { type: 'cta'; index: number }
  | { type: 'stat'; index: number }
  | { type: 'tech'; index: number }
  | null;

export default function AdminHomeSettingsPage() {
  const { error: showError, success: showSuccess } = useNotification();
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'tech' | 'seo'>('hero');
  const [deleteAction, setDeleteAction] = useState<DeleteAction>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await settingsApi.getHomeSettings();
      setSettings(response.data || defaultSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
      showError("Failed to load settings", "Could not fetch home settings.");
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
      await settingsApi.updateHomeSettings(settings);
      showSuccess("Success!", "Home settings have been saved.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showError("Failed to save", "Could not save home settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (!deleteAction) return;

    if (deleteAction.type === 'cta') {
      setSettings(prev => ({
        ...prev,
        hero: {
          ...prev.hero,
          ctaButtons: (prev.hero?.ctaButtons || []).filter((_, i) => i !== deleteAction.index),
        } as typeof prev.hero,
      }));
      showSuccess("Deleted", "CTA Button removed.");
    }
    else if (deleteAction.type === 'stat') {
      setSettings(prev => ({
        ...prev,
        stats: (prev.stats || []).filter((_, i) => i !== deleteAction.index),
      }));
      showSuccess("Deleted", "Statistic removed.");
    }
    else if (deleteAction.type === 'tech') {
      setSettings(prev => ({
        ...prev,
        techStack: (prev.techStack || []).filter((_, i) => i !== deleteAction.index),
      }));
      showSuccess("Deleted", "Technology removed.");
    }

    setDeleteAction(null);
  };

  // Hero handlers
  const handleHeroChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value,
      } as typeof prev.hero,
    }));
  };

  const handleBadgeChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        badge: {
          ...(prev.hero?.badge || { enabled: true, text: '' }),
          [field]: value,
        },
      } as typeof prev.hero,
    }));
  };

  const handleCtaChange = (index: number, field: string, value: string) => {
    setSettings(prev => {
      const ctaButtons = [...(prev.hero?.ctaButtons || [])];
      ctaButtons[index] = { ...ctaButtons[index], [field]: value };
      return {
        ...prev,
        hero: {
          ...prev.hero,
          ctaButtons,
        } as typeof prev.hero,
      };
    });
  };

  const addCtaButton = () => {
    setSettings(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        ctaButtons: [
          ...(prev.hero?.ctaButtons || []),
          { label: 'New Button', href: '/', variant: 'secondary' as const },
        ],
      } as typeof prev.hero,
    }));
  };

  const confirmRemoveCtaButton = (index: number) => {
    setDeleteAction({ type: 'cta', index });
  };

  // Stats handlers
  const handleStatChange = (index: number, field: keyof StatItem, value: string) => {
    setSettings(prev => {
      const stats = [...(prev.stats || [])];
      stats[index] = { ...stats[index], [field]: value };
      return { ...prev, stats };
    });
  };

  const addStat = () => {
    setSettings(prev => ({
      ...prev,
      stats: [
        ...(prev.stats || []),
        { id: Date.now().toString(), value: '0+', label: 'New Stat', icon: 'star' },
      ],
    }));
  };

  const confirmRemoveStat = (index: number) => {
    setDeleteAction({ type: 'stat', index });
  };

  // Tech Stack handlers
  const handleTechChange = (index: number, field: keyof TechStackItem, value: string) => {
    setSettings(prev => {
      const techStack = [...(prev.techStack || [])];
      techStack[index] = { ...techStack[index], [field]: value };
      return { ...prev, techStack };
    });
  };

  const addTech = () => {
    setSettings(prev => ({
      ...prev,
      techStack: [
        ...(prev.techStack || []),
        { id: Date.now().toString(), name: 'New Tech', icon: null, category: 'Other' },
      ],
    }));
  };

  const confirmRemoveTech = (index: number) => {
    setDeleteAction({ type: 'tech', index });
  };

  // SEO handlers
  const handleSeoChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      seo: {
        ...(prev.seo || { metaTitle: null, metaDescription: null, ogImage: null, keywords: null }),
        [field]: value || null,
      },
    }));
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-surface border border-input-border focus:border-accent outline-none transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground";
  const labelClasses = "block text-sm font-medium text-foreground/80 mb-2";

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: Home },
    { id: 'stats', label: 'Stats/Metrics', icon: BarChart3 },
    { id: 'tech', label: 'Tech Stack', icon: Code2 },
    { id: 'seo', label: 'SEO Settings', icon: Search },
  ] as const;

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
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
              <Home className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground">Home Settings</h1>
              <p className="text-muted-foreground">
                Manage content displayed on the home page
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={loadSettings}>
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh
            </Button>
            <Button
              variant="glow"
              size="lg"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-surface rounded-xl border border-border shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Hero Section Tab */}
          {activeTab === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Main Content */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-6 shadow-sm">
                <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
                  <Type className="w-5 h-5 text-accent" />
                  Main Content
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className={labelClasses}>Title (Headline)</label>
                    <input
                      type="text"
                      value={settings.hero?.title || ''}
                      onChange={(e) => handleHeroChange('title', e.target.value)}
                      placeholder="Fullstack Engineer & AI Developer"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>Description (Subtitle)</label>
                    <textarea
                      rows={3}
                      value={settings.hero?.subtitle || ''}
                      onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                      placeholder="Building scalable web products..."
                      className={`${inputClasses} resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Badge/Status */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Hero Badge/Status
                  </h2>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.hero?.badge?.enabled || false}
                        onChange={(e) => handleBadgeChange('enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary/50 rounded-full peer peer-checked:bg-accent transition-colors" />
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />
                    </div>
                  </label>
                </div>

                {settings.hero?.badge?.enabled && (
                  <div>
                    <label className={labelClasses}>Badge Text</label>
                    <input
                      type="text"
                      value={settings.hero?.badge?.text || ''}
                      onChange={(e) => handleBadgeChange('text', e.target.value)}
                      placeholder="Available for Freelance"
                      className={inputClasses}
                    />
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
                    <MousePointerClick className="w-5 h-5 text-blue-400" />
                    CTA Buttons
                  </h2>
                  <Button variant="outline" size="sm" onClick={addCtaButton}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Button
                  </Button>
                </div>

                <div className="space-y-4">
                  {(settings.hero?.ctaButtons || []).map((cta, index) => (
                    <div key={index} className="flex gap-4 items-start p-4 rounded-xl bg-secondary/30 border border-border">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border text-muted-foreground">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Label</label>
                          <input
                            type="text"
                            value={cta.label}
                            onChange={(e) => handleCtaChange(index, 'label', e.target.value)}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Link/Href</label>
                          <input
                            type="text"
                            value={cta.href}
                            onChange={(e) => handleCtaChange(index, 'href', e.target.value)}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Variant</label>
                          <select
                            value={cta.variant || 'primary'}
                            onChange={(e) => handleCtaChange(index, 'variant', e.target.value)}
                            className={inputClasses}
                          >
                            <option value="primary">Primary</option>
                            <option value="secondary">Secondary</option>
                            <option value="outline">Outline</option>
                          </select>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmRemoveCtaButton(index)}
                        className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 rounded-2xl bg-surface border border-border space-y-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    Stats/Metrics
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use Auto mode to calculate automatically, or Manual for custom values
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addStat}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stat
                </Button>
              </div>

              <div className="space-y-4">
                {(settings.stats || []).map((stat, index) => (
                  <div key={stat.id || index} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border text-muted-foreground">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-foreground">{stat.label || 'New Stat'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Mode Toggle */}
                        <div className="flex rounded-lg overflow-hidden border border-border bg-surface">
                          <button
                            onClick={() => handleStatChange(index, 'mode', 'manual')}
                            className={`px-3 py-1.5 text-xs font-medium transition-all ${(stat.mode || 'manual') === 'manual'
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                              }`}
                          >
                            Manual
                          </button>
                          <button
                            onClick={() => handleStatChange(index, 'mode', 'auto')}
                            className={`px-3 py-1.5 text-xs font-medium transition-all ${stat.mode === 'auto'
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                              }`}
                          >
                            Auto
                          </button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmRemoveStat(index)}
                          className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Fields Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Value</label>
                        {stat.mode === 'auto' ? (
                          <div className="px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold flex items-center gap-2">
                            <RefreshCw className="w-3 h-3" />
                            Auto
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={stat.value}
                            onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                            placeholder="10+"
                            className={inputClasses}
                          />
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Label</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                          placeholder="Projects Completed"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Icon</label>
                        <input
                          type="text"
                          value={stat.icon || ''}
                          onChange={(e) => handleStatChange(index, 'icon', e.target.value)}
                          placeholder="folder, clock..."
                          className={inputClasses}
                        />
                      </div>
                      {stat.mode === 'auto' && (
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Data Source</label>
                          <select
                            value={stat.autoSource || 'projects'}
                            onChange={(e) => handleStatChange(index, 'autoSource', e.target.value)}
                            className={inputClasses}
                          >
                            <option value="projects">Projects</option>
                            <option value="posts">Blog Posts</option>
                            <option value="experiments">Experiments</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {stat.mode === 'auto' && (
                      <p className="text-xs text-muted-foreground">
                        💡 Value will be calculated automatically from the number of {stat.autoSource || 'projects'} saved
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {(settings.stats || []).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No stats yet. Click "Add Stat" to add.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tech Stack Tab */}
          {activeTab === 'tech' && (
            <motion.div
              key="tech"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
                      <Code2 className="w-5 h-5 text-purple-400" />
                      Tech Stack
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage technologies displayed in the home page marquee
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addTech}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tech
                  </Button>
                </div>

                {/* Categories Legend */}
                <div className="flex flex-wrap gap-2">
                  {['Frontend', 'Backend', 'Database', 'DevOps', 'AI/ML', 'Other'].map(cat => {
                    const count = (settings.techStack || []).filter(t => (t.category || 'Other') === cat).length;
                    if (count === 0) return null;
                    return (
                      <span key={cat} className="px-3 py-1.5 rounded-full bg-secondary text-foreground border border-border text-xs font-medium">
                        {cat} <span className="text-accent ml-1">{count}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Tech Items by Category */}
              {['Frontend', 'Backend', 'Database', 'DevOps', 'AI/ML', 'Other'].map(category => {
                const items = (settings.techStack || [])
                  .map((tech, index) => ({ ...tech, originalIndex: index }))
                  .filter(t => (t.category || 'Other') === category);

                if (items.length === 0) return null;

                return (
                  <div key={category} className="p-4 rounded-2xl bg-surface border border-border shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                      <span className="w-2 h-2 rounded-full bg-accent"></span>
                      {category}
                      <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {items.map((tech) => (
                        <div key={tech.id || tech.originalIndex} className="flex gap-3 items-center p-3 rounded-xl bg-secondary/30 border border-border hover:border-accent/30 transition-all">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border text-muted-foreground shrink-0">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={tech.name}
                              onChange={(e) => handleTechChange(tech.originalIndex, 'name', e.target.value)}
                              placeholder="Tech name"
                              className="w-full bg-transparent border-0 outline-none text-sm font-medium placeholder:text-muted-foreground/40 text-foreground"
                            />
                            <div className="flex gap-2 mt-1">
                              <input
                                type="text"
                                value={tech.icon || ''}
                                onChange={(e) => handleTechChange(tech.originalIndex, 'icon', e.target.value)}
                                placeholder="icon"
                                className="flex-1 bg-transparent border-0 outline-none text-xs text-muted-foreground placeholder:text-muted-foreground/30"
                              />
                              <select
                                value={tech.category || 'Other'}
                                onChange={(e) => handleTechChange(tech.originalIndex, 'category', e.target.value)}
                                className="bg-transparent border-0 outline-none text-xs text-muted-foreground cursor-pointer"
                              >
                                <option value="Frontend">Frontend</option>
                                <option value="Backend">Backend</option>
                                <option value="Database">Database</option>
                                <option value="DevOps">DevOps</option>
                                <option value="AI/ML">AI/ML</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmRemoveTech(tech.originalIndex)}
                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {(settings.techStack || []).length === 0 && (
                <div className="p-6 rounded-2xl bg-surface border border-border text-center py-12 text-muted-foreground shadow-sm">
                  <Code2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="mb-2">No tech stack yet.</p>
                  <p className="text-sm">Click "Add Tech" to add technology.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <motion.div
              key="seo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 rounded-2xl bg-surface border border-border space-y-6 shadow-sm"
            >
              <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
                <Search className="w-5 h-5 text-blue-400" />
                SEO Settings for Home
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>Meta Title</label>
                  <input
                    type="text"
                    value={settings.seo?.metaTitle || ''}
                    onChange={(e) => handleSeoChange('metaTitle', e.target.value)}
                    placeholder="Indra Saepudin - Fullstack Engineer & AI Developer"
                    className={inputClasses}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Title that appears in browser tab and search results</p>
                </div>

                <div>
                  <label className={labelClasses}>Meta Description</label>
                  <textarea
                    rows={3}
                    value={settings.seo?.metaDescription || ''}
                    onChange={(e) => handleSeoChange('metaDescription', e.target.value)}
                    placeholder="Building scalable web products and AI-powered automation..."
                    className={`${inputClasses} resize-none`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Description that appears in Google search results</p>
                </div>

                <div>
                  <label className={labelClasses}>Keywords</label>
                  <input
                    type="text"
                    value={settings.seo?.keywords || ''}
                    onChange={(e) => handleSeoChange('keywords', e.target.value)}
                    placeholder="fullstack, web developer, AI, react, nextjs"
                    className={inputClasses}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Keywords separated by commas</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <ConfirmDialog
        isOpen={!!deleteAction}
        onClose={() => setDeleteAction(null)}
        onConfirm={handleConfirmDelete}
        title="Are you sure?"
        description={
          deleteAction?.type === 'cta' ? "This will remove the CTA button from the hero section." :
            deleteAction?.type === 'stat' ? "This will remove this statistic from the homepage." :
              deleteAction?.type === 'tech' ? "This will remove this technology from the tech stack." :
                "This action cannot be undone."
        }
        confirmText="Delete"
        variant="destructive"
      />
    </AdminShell>
  );
}
