"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Palette,
  Smartphone,
  Database,
  Cloud,
  BarChart3,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { servicesApi } from "@/lib/api";

interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string | null;
  color?: string | null;
  orderIndex?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code2,
  code2: Code2,
  design: Palette,
  palette: Palette,
  mobile: Smartphone,
  smartphone: Smartphone,
  database: Database,
  cloud: Cloud,
  analytics: BarChart3,
  barchart: BarChart3,
  sparkles: Sparkles,
};

function getIcon(iconName: string | null | undefined): React.ComponentType<{ className?: string }> {
  if (!iconName) return Code2;
  const normalized = iconName.toLowerCase().replace(/[^a-z]/g, "");
  return iconMap[normalized] || Code2;
}

export function ServicesPreview() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await servicesApi.list();
        if (response.data) {
          setServices(response.data as Service[]);
        }
      } catch (error) {
        console.error("Failed to load services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadServices();
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

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 lg:py-28 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent" />
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium">
              What I Do
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
            Services I Offer
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Transforming ideas into exceptional digital experiences through modern technologies and best practices.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {services.slice(0, 6).map((service, index) => {
            const IconComponent = getIcon(service.icon);
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group relative p-6 sm:p-8 rounded-2xl
                  bg-card/50 dark:bg-gradient-to-br dark:from-secondary/50 dark:to-secondary/20
                  border border-border hover:border-accent/30
                  transition-all duration-500
                  hover:shadow-xl hover:shadow-accent/10
                  hover:-translate-y-1"
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                  transition-opacity duration-500 
                  bg-gradient-to-br from-accent/5 via-transparent to-purple-500/5 
                  pointer-events-none" />

                {/* Icon */}
                <div className="relative mb-4 inline-flex p-3 rounded-xl 
                  bg-gradient-to-br from-accent/20 to-accent/5
                  group-hover:from-accent/30 group-hover:to-accent/10
                  transition-all duration-300">
                  <IconComponent className="w-6 h-6 text-accent 
                    group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Content */}
                <h3 className="relative text-lg sm:text-xl font-display font-semibold mb-2 
                  group-hover:text-accent transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="relative text-sm text-muted-foreground line-clamp-3">
                  {service.description}
                </p>

                {/* Decorative arrow */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 
                  translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight className="w-5 h-5 text-accent" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Button variant="outline" className="group rounded-full px-6" asChild>
            <Link href="/services" className="flex items-center gap-2">
              View All Services
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
