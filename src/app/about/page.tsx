"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/layout/command-palette";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { settingsApi, AboutSettings } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";

const defaultSettings: AboutSettings = {
  headline: {
    text: 'Engineering the future of',
    highlightText: 'web & AI.',
  },
  paragraphs: [
    { id: '1', content: "I'm a Fullstack Engineer with a deep specialization in Artificial Intelligence. My passion lies in bridging the gap between cutting-edge research and production-ready applications.", order: 1 },
    { id: '2', content: "With over 5 years of experience, I've worked with startups and enterprises to build scalable systems, integrating LLMs into existing workflows to drive efficiency and innovation.", order: 2 },
    { id: '3', content: "When I'm not coding, I'm exploring new model architectures, contributing to open source, or designing 3D interactive experiences.", order: 3 },
  ],
  toolkit: [
    { id: '1', name: 'Next.js', order: 1 },
    { id: '2', name: 'React', order: 2 },
    { id: '3', name: 'TypeScript', order: 3 },
    { id: '4', name: 'Node.js', order: 4 },
    { id: '5', name: 'Python', order: 5 },
    { id: '6', name: 'PyTorch', order: 6 },
    { id: '7', name: 'LangChain', order: 7 },
    { id: '8', name: 'OpenAI', order: 8 },
    { id: '9', name: 'PostgreSQL', order: 9 },
    { id: '10', name: 'Tailwind CSS', order: 10 },
    { id: '11', name: 'Three.js', order: 11 },
    { id: '12', name: 'Docker', order: 12 },
    { id: '13', name: 'AWS', order: 13 },
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
};

/**
 * Download file using blob approach - works for all file types including PDFs
 */
async function downloadResume(settings: AboutSettings): Promise<void> {
  const resume = settings.resume;
  if (!resume?.url) return;

  const downloadName = resume.downloadName || 'resume';
  const format = resume.format || 'pdf';
  const filename = `${downloadName}.${format}`;

  try {
    // Fetch the file as blob
    const response = await fetch(resume.url);
    if (!response.ok) throw new Error('Failed to fetch file');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: open URL directly
    window.open(resume.url, '_blank');
  }
}

export default function AboutPage() {
  const [settings, setSettings] = useState<AboutSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const response = await settingsApi.getAboutSettings();
      setSettings(response.data || defaultSettings);
    } catch (error) {
      console.warn("Failed to load about settings, using defaults:", error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Sort paragraphs by order
  const sortedParagraphs = [...(settings.paragraphs || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  // Sort toolkit by order
  const sortedToolkit = [...(settings.toolkit || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <CommandPalette />
        <div className="container mx-auto px-6 py-32 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <CommandPalette />

      <div className="container mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">
              {settings.headline?.text || 'Engineering the future of'}{' '}
              <span className="text-accent">
                {settings.headline?.highlightText || 'web & AI.'}
              </span>
            </h1>

            {/* Bio Paragraphs */}
            <div className="prose prose-invert prose-lg text-muted-foreground">
              {sortedParagraphs.length > 0 ? (
                sortedParagraphs.map((para, index) => (
                  <p key={para.id} className={index < sortedParagraphs.length - 1 ? "mb-6" : ""}>
                    {para.content}
                  </p>
                ))
              ) : (
                <p>No bio content available.</p>
              )}
            </div>

            {/* Technical Toolkit */}
            {sortedToolkit.length > 0 && (
              <div className="mt-10">
                <h3 className="font-bold text-foreground mb-4 font-display">Technical Toolkit</h3>
                <div className="flex flex-wrap gap-2">
                  {sortedToolkit.map(skill => (
                    <span key={skill.id} className="px-3 py-1.5 rounded-md bg-secondary text-sm font-medium border border-white/5">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume Button */}
            {settings.resume?.enabled && settings.resume?.url && (
              <div className="mt-12">
                <Button size="lg" onClick={() => downloadResume(settings)}>
                  <Download />
                  {settings.resume.label || 'Download Resume'}
                </Button>
              </div>
            )}
          </div>

          {/* Profile Image */}
          {(settings.media?.enabled ?? true) && (
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 relative z-10 bg-secondary/20">
                {settings.media?.imageUrl ? (
                  <Image
                    src={settings.media.imageUrl}
                    alt={settings.media.imageAlt || 'Profile'}
                    width={600}
                    height={750}
                    className="object-cover w-full h-full"
                  />
                ) : settings.media?.showPlaceholder ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary text-muted-foreground/30 font-bold text-4xl">
                    IMAGE
                  </div>
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -z-10" />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
