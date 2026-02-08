"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { settingsApi, HomeSettings, StatItem, projectsApi, postsApi, experimentsApi } from "@/lib/api";

const Scene = dynamic(() => import("@/components/3d/scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-transparent" />,
});

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
    { id: '1', value: '10+', label: 'Projects', icon: 'folder' },
    { id: '2', value: '3+', label: 'Years Exp', icon: 'clock' },
    { id: '3', value: '100%', label: 'Success', icon: 'check' },
  ],
  techStack: [],
  featuredHighlights: { enabled: false, items: [] },
  seo: null,
};

// Helper to fetch count based on source
async function getAutoCount(source: string | null | undefined): Promise<number> {
  try {
    switch (source) {
      case 'projects': {
        const res = await projectsApi.list({ limit: 1 });
        return res.meta?.total || 0;
      }
      case 'posts': {
        const res = await postsApi.list({ limit: 1 });
        return res.meta?.total || 0;
      }
      case 'experiments': {
        const res = await experimentsApi.list({ limit: 1 });
        return res.meta?.total || 0;
      }
      default:
        return 0;
    }
  } catch {
    return 0;
  }
}

export function Hero() {
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [autoCounts, setAutoCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsApi.getHomeSettings();
        if (response.data) {
          const data = response.data;

          // Process stats with auto mode
          const stats = data.stats ?? defaultSettings.stats ?? [];
          const countsToFetch: { id: string; source: string }[] = [];

          stats.forEach((stat, index) => {
            if (stat.mode === 'auto' && stat.autoSource) {
              countsToFetch.push({ id: stat.id || index.toString(), source: stat.autoSource });
            }
          });

          // Fetch all auto counts in parallel
          const counts: Record<string, number> = {};
          await Promise.all(
            countsToFetch.map(async ({ id, source }) => {
              counts[id] = await getAutoCount(source);
            })
          );
          setAutoCounts(counts);

          setSettings(prev => ({
            ...prev,
            hero: {
              title: data.hero?.title ?? prev.hero?.title ?? null,
              subtitle: data.hero?.subtitle ?? prev.hero?.subtitle ?? null,
              badge: data.hero?.badge ?? prev.hero?.badge ?? null,
              ctaButtons: data.hero?.ctaButtons ?? prev.hero?.ctaButtons ?? null,
            },
            stats: stats,
            techStack: data.techStack ?? prev.techStack,
            featuredHighlights: data.featuredHighlights ?? prev.featuredHighlights,
            seo: data.seo ?? prev.seo,
          }));
        }
      } catch (error) {
        console.error("Failed to load home settings:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  // Helper to get stat value (auto or manual)
  const getStatValue = (stat: StatItem, index: number) => {
    if (stat.mode === 'auto') {
      const count = autoCounts[stat.id || index.toString()];
      return count !== undefined ? `${count}+` : '...';
    }
    return stat.value;
  };

  // Parse title to split first word and rest for gradient effect
  const parseTitle = (title: string | null | undefined) => {
    if (!title) return { firstLine: 'Fullstack', secondLine: 'Engineer' };

    const words = title.split(' ');
    if (words.length <= 1) {
      return { firstLine: title, secondLine: '' };
    }

    // Take first word for first line, rest for gradient second line
    return {
      firstLine: words[0],
      secondLine: words.slice(1).join(' '),
    };
  };

  const { firstLine, secondLine } = parseTitle(settings.hero?.title);

  // Get button variant classes
  const getButtonVariant = (variant: string | undefined) => {
    switch (variant) {
      case 'primary':
        return "rounded-full px-8 py-6 text-base shadow-[0_0_20px_rgba(0,207,200,0.15)] hover:shadow-[0_0_30px_rgba(0,207,200,0.25)] transition-shadow duration-300";
      case 'secondary':
      case 'outline':
      default:
        return "rounded-full px-8 py-6 text-base bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-sm";
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-28 lg:pt-32 pb-16 overflow-hidden">
      {/* 3D Scene Container */}
      <div className="absolute inset-0 z-0 pointer-events-none lg:left-1/2 lg:w-1/2">
        <Scene />
        {/* Mobile Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/10 lg:hidden" />
        {/* Desktop Glow Effect */}
        <div className="absolute inset-0 bg-accent/5 blur-[100px] -z-10 rounded-full hidden lg:block" />
        {/* Dark Mode Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full mix-blend-screen opacity-0 dark:opacity-40 transition-opacity duration-1000 -z-20" />
      </div>

      <div className="container mx-auto px-6 relative z-10 h-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center h-full">

          {/* Left Column: Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.2
                }
              }
            }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left w-full"
          >
            {/* Badge */}
            {settings.hero?.badge?.enabled && settings.hero?.badge?.text && (
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-secondary/30 border border-white/5 backdrop-blur-md text-sm font-medium mb-8 hover:bg-secondary/50 transition-colors cursor-default"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
                <span className="text-foreground/80 tracking-wide">{settings.hero.badge.text}</span>
              </motion.div>
            )}

            {/* Headline */}
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 30 } } }}
              className="text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter mb-8 leading-[1.05]"
            >
              {firstLine}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-purple-500 animate-gradient-x bg-[length:200%_auto]">
                {secondLine}
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-lg md:text-xl text-muted-foreground/90 max-w-xl md:max-w-2xl mb-10 leading-relaxed font-light"
            >
              {settings.hero?.subtitle || 'Expertly crafting scalable web architectures and AI-driven solutions.'}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-wrap gap-4 items-center justify-center lg:justify-start mb-16"
            >
              {(settings.hero?.ctaButtons || []).map((cta, index) => (
                <Button
                  key={index}
                  size="lg"
                  variant={cta.variant === 'primary' ? 'default' : 'outline'}
                  className={getButtonVariant(cta.variant)}
                  asChild
                >
                  <Link href={cta.href}>
                    {cta.variant === 'secondary' && <MessageSquare className="w-4 h-4 mr-2 text-accent" />}
                    {cta.label}
                    {cta.variant === 'primary' && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Link>
                </Button>
              ))}

              {/* Fallback if no buttons configured */}
              {(!settings.hero?.ctaButtons || settings.hero.ctaButtons.length === 0) && (
                <>
                  <Button size="lg" className="rounded-full px-8 py-6 text-base shadow-[0_0_20px_rgba(0,207,200,0.15)] hover:shadow-[0_0_30px_rgba(0,207,200,0.25)] transition-shadow duration-300" asChild>
                    <Link href="/projects">
                      View Projects
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-sm" asChild>
                    <Link href="/contact">
                      <MessageSquare className="w-4 h-4 mr-2 text-accent" />
                      Contact Me
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>

            {/* Stats Dashboard */}
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              className="grid grid-cols-3 gap-8 md:gap-12 pl-4 border-l border-white/10"
            >
              {(settings.stats || []).slice(0, 3).map((stat, index) => (
                <div key={stat.id || index} className="flex flex-col gap-1">
                  <p className="text-3xl lg:text-4xl font-display font-bold text-foreground tracking-tight">
                    {getStatValue(stat, index)}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}

              {/* Fallback if no stats configured */}
              {(!settings.stats || settings.stats.length === 0) && (
                <>
                  <div className="flex flex-col gap-1">
                    <p className="text-3xl lg:text-4xl font-display font-bold text-foreground tracking-tight">10+</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Projects</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-3xl lg:text-4xl font-display font-bold text-foreground tracking-tight">3+</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Years</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-3xl lg:text-4xl font-display font-bold text-foreground tracking-tight">100%</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Success</p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Right Column: Spacer for 3D Scene */}
          <div className="hidden lg:block w-full h-full" />

        </div>
      </div>
    </section>
  );
}
