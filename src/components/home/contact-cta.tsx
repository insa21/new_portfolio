"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle, Send, Mail, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsApi, ContactSettings } from "@/lib/api";

export function ContactCTA() {
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsApi.getContactSettings();
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error("Failed to load contact settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
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

  return (
    <section className="py-16 sm:py-20 lg:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl 
              bg-gradient-to-br from-accent/20 to-accent/5 
              border border-accent/20 mb-6"
          >
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
          </motion.div>

          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent" />
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium">
              Get In Touch
            </p>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-4">
            Let&apos;s Build Something
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-purple-500">
              Amazing Together
            </span>
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Have a project in mind or want to collaborate? I&apos;d love to hear from you.
            {settings?.responseTime && (
              <span className="block mt-2 text-sm">
                Average response time: <span className="text-accent font-medium">{settings.responseTime}</span>
              </span>
            )}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button size="lg" className="group w-full sm:w-auto rounded-full px-6 sm:px-8" asChild>
              <Link href="/contact" className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Start a Conversation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            {settings?.email && (
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full px-6 sm:px-8 bg-muted/50 border-border hover:bg-muted dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
                asChild
              >
                <a href={`mailto:${settings.email}`} className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send Email
                </a>
              </Button>
            )}
          </div>

          {/* Availability Status */}
          {settings?.availabilityStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full 
                bg-green-500/10 border border-green-500/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-sm text-green-400 font-medium">
                {settings.availabilityStatus}
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
