"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Loader2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsApi, AboutSettings } from "@/lib/api";

export function AboutPreview() {
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const response = await settingsApi.getAboutSettings();
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error("Failed to load about settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAbout();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        </div>
      </section>
    );
  }

  if (!settings) {
    return null;
  }

  // Get first paragraph for preview
  const previewText = settings.paragraphs?.[0]?.content ||
    "Passionate developer creating innovative solutions.";

  // Get headline text
  const headlineText = typeof settings.headline === 'string'
    ? settings.headline
    : settings.headline?.text || "Building Digital Experiences";

  const highlightText = typeof settings.headline === 'object'
    ? settings.headline?.highlightText
    : null;

  // Get toolkit preview
  const toolkitPreview = settings.toolkit?.slice(0, 6) || [];

  return (
    <section className="py-16 sm:py-20 lg:py-28 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative aspect-square max-w-md mx-auto lg:mx-0">
              {/* Main Image */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden 
                border border-border shadow-2xl shadow-accent/10 dark:border-white/10">
                {settings.media?.imageUrl ? (
                  <Image
                    src={settings.media.imageUrl}
                    alt={settings.media.imageAlt || "Profile"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-purple-500/30" />
                )}
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl 
                bg-gradient-to-br from-accent to-accent/50 blur-sm opacity-50" />
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-xl 
                bg-gradient-to-br from-purple-500 to-purple-500/50 blur-sm opacity-40" />

              {/* Toolkit Badge */}
              {toolkitPreview.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute -right-4 sm:-right-8 top-8 p-4 rounded-2xl 
                    bg-card/95 backdrop-blur-xl border border-border
                    shadow-xl dark:bg-background/90 dark:border-white/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="w-4 h-4 text-accent" />
                    <p className="text-xs text-muted-foreground font-medium">
                      Toolkit
                    </p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-display font-bold text-accent">
                    {settings.toolkit?.length || 0}+
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Technologies
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-accent" />
              <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium">
                About Me
              </p>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
              {headlineText}
              {highlightText && (
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">
                  {highlightText}
                </span>
              )}
            </h2>

            <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-4">
              {previewText}
            </p>

            {/* Toolkit Preview */}
            {toolkitPreview.length > 0 && (
              <div className="mb-8">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Technologies I work with
                </p>
                <div className="flex flex-wrap gap-2">
                  {toolkitPreview.map((item) => (
                    <span
                      key={item.id}
                      className="px-3 py-1.5 text-xs rounded-lg bg-muted/50 dark:bg-secondary/50 
                        border border-border text-foreground/80"
                    >
                      {item.name}
                    </span>
                  ))}
                  {(settings.toolkit?.length || 0) > 6 && (
                    <span className="px-3 py-1.5 text-xs rounded-lg bg-accent/10 
                      border border-accent/20 text-accent">
                      +{(settings.toolkit?.length || 0) - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <Button className="group rounded-full px-6" asChild>
              <Link href="/about" className="flex items-center gap-2">
                Learn More About Me
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

