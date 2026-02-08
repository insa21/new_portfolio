"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { settingsApi, ContactSettings, FooterSettings } from "@/lib/api";
import { useTheme } from "next-themes";

const defaultContactSettings: ContactSettings = {
  email: null,
  whatsapp: null,
  location: null,
  availabilityStatus: null,
  availabilityDate: null,
  responseTime: null,
  socialLinks: {
    github: null,
    linkedin: null,
    instagram: null,
  },
};

const defaultFooterSettings: FooterSettings = {
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

export function Footer() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [contactSettings, setContactSettings] = useState<ContactSettings>(defaultContactSettings);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadSettings = async () => {
      try {
        const [contactResponse, footerResponse] = await Promise.all([
          settingsApi.getContactSettings(),
          settingsApi.getFooterSettings(),
        ]);
        setContactSettings(contactResponse.data || defaultContactSettings);
        setFooterSettings(footerResponse.data || defaultFooterSettings);
      } catch (error) {
        console.error("Failed to load footer settings:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  // Determine effective theme
  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = (mounted && currentTheme === "dark" && footerSettings.logoDarkUrl)
    ? footerSettings.logoDarkUrl
    : footerSettings.logoUrl;

  // Build social links array from contact settings
  const socialLinks = [
    contactSettings.socialLinks?.github && {
      icon: Github,
      href: contactSettings.socialLinks.github,
      label: "GitHub"
    },
    contactSettings.socialLinks?.linkedin && {
      icon: Linkedin,
      href: contactSettings.socialLinks.linkedin,
      label: "LinkedIn"
    },
    contactSettings.socialLinks?.instagram && {
      icon: Instagram,
      href: contactSettings.socialLinks.instagram,
      label: "Instagram"
    },
  ].filter(Boolean) as { icon: typeof Github; href: string; label: string }[];

  // Parse copyright text with year placeholder
  const getCopyrightText = () => {
    const copyrightTemplate = footerSettings.copyright || '© {year} All rights reserved.';
    return copyrightTemplate.replace('{year}', new Date().getFullYear().toString());
  };

  // Sort sitemap links by order
  const sortedSitemapLinks = [...(footerSettings.sitemapLinks || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  // Determine if we need 4-column, 3-column, or 2-column layout
  const showSitemap = footerSettings.showSitemap !== false && sortedSitemapLinks.length > 0;
  const showConnect = footerSettings.showConnect !== false;

  return (
    <footer className="border-t border-border bg-background py-8 sm:py-12 mt-12 sm:mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Main Footer Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* Brand Section */}
          <div className="sm:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              {footerSettings.showLogo && logoSrc ? (
                <div className="relative h-10 w-10">
                  <Image
                    src={logoSrc}
                    alt={footerSettings.logoAltText || 'Logo'}
                    fill
                    className="object-contain"
                    sizes="40px"
                  />
                </div>
              ) : null}
              <span className="text-xl font-bold tracking-tight font-display">
                {footerSettings.siteName || 'Indra Saepudin'}
              </span>
            </Link>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-sm">
              {footerSettings.description || 'Building scalable web products and AI-powered automation for real-world impact.'}
            </p>
          </div>

          {/* Sitemap Section */}
          {showSitemap && (
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm uppercase tracking-wider text-foreground/80">Sitemap</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {sortedSitemapLinks.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="hover:text-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Connect Section */}
          {showConnect && (
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm uppercase tracking-wider text-foreground/80">Connect</h3>
              <div className="flex flex-wrap gap-2">
                {isLoaded && socialLinks.length > 0 ? (
                  socialLinks.map((social) => (
                    <Button key={social.label} variant="ghost" size="icon" asChild className="h-9 w-9 sm:h-10 sm:w-10">
                      <a href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                        <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </a>
                    </Button>
                  ))
                ) : isLoaded && socialLinks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No social links configured</p>
                ) : (
                  // Loading skeleton
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted animate-pulse" />
                    ))}
                  </div>
                )}
              </div>
              {contactSettings.email && (
                <a
                  href={`mailto:${contactSettings.email}`}
                  className="block mt-3 sm:mt-4 text-sm text-muted-foreground hover:text-accent transition-colors break-all"
                >
                  {contactSettings.email}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Copyright Bar */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            {getCopyrightText()}
          </p>
        </div>
      </div>
    </footer>
  );
}
