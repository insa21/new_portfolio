"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Github,
  Sparkles,
  Loader2,
  Rocket,
  Code2,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/components/providers/data-provider";
import { ProjectModal } from "@/components/project-modal";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

type FilterCategory = "all" | "web" | "ai" | "dashboard" | "opensource";

const filterCategories: { key: FilterCategory; label: string; icon?: React.ReactNode }[] = [
  { key: "all", label: "All" },
  { key: "web", label: "Web App", icon: <Layers className="w-3.5 h-3.5" /> },
  { key: "ai", label: "AI / ML", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { key: "dashboard", label: "Dashboard", icon: <Code2 className="w-3.5 h-3.5" /> },
  { key: "opensource", label: "Open Source", icon: <Github className="w-3.5 h-3.5" /> },
];

function getStatusBadge(status?: string) {
  if (!status) return null;

  const normalizedStatus = status.toLowerCase().replace(/_/g, " ");

  const statusConfig: Record<string, { label: string; className: string }> = {
    "live": {
      label: "Live",
      className: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
    },
    "in progress": {
      label: "In Progress",
      className: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
    },
    "in_progress": {
      label: "In Progress",
      className: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
    },
    "archived": {
      label: "Archived",
      className: "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"
    },
  };

  const config = statusConfig[normalizedStatus];
  if (!config) return null;

  return (
    <span className={cn(
      "px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full border",
      config.className
    )}>
      {config.label}
    </span>
  );
}

export function FeaturedProjects() {
  // Use DataProvider - same data source as Projects page
  const { projects: allProjects, isLoading } = useData();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  // Use projects directly from provider, just slice the first 6
  const projects = useMemo(() => {
    return allProjects.slice(0, 6);
  }, [allProjects]);

  // Modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  // Filter projects based on active category
  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") return projects;

    return projects.filter((project) => {
      const type = project.type?.toLowerCase() || "";
      const technologies = project.stack?.map(t => t.toLowerCase()) || [];

      switch (activeFilter) {
        case "web":
          return type.includes("web") || type.includes("fullstack") || type.includes("frontend");
        case "ai":
          return type.includes("ai") || type.includes("ml") ||
            technologies.some(t => t.includes("python") || t.includes("tensorflow") || t.includes("pytorch"));
        case "dashboard":
          return type.includes("dashboard") || type.includes("admin") || type.includes("analytics");
        case "opensource":
          return !!project.repoUrl;
        default:
          return true;
      }
    });
  }, [projects, activeFilter]);

  // Separate featured project from rest
  const featuredProject = filteredProjects[0];
  const otherProjects = filteredProjects.slice(1);

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
    <section className="py-16 sm:py-20 lg:py-28 relative overflow-hidden" id="projects">
      {/* Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Background Decorations */}
      <div className="absolute top-1/4 -right-64 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/20">
              Portfolio
            </span>
            <span className="h-px w-12 bg-accent/30" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-6"
          >
            Selected <span className="text-accent">Work</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl"
          >
            A collection of projects demonstrating my expertise in full-stack development,
            AI integration, and modern UI engineering.
          </motion.p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-12">
          {filterCategories.map((category, index) => (
            <motion.button
              key={category.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
              onClick={() => setActiveFilter(category.key)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                activeFilter === category.key
                  ? "bg-accent text-white shadow-lg shadow-accent/25 scale-105"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {category.icon}
              {category.label}
            </motion.button>
          ))}
        </div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl bg-secondary/5">
                <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
                  <Code2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Projects Found</h3>
                <p className="text-muted-foreground max-w-md">
                  We couldn't find any projects matching the selected filter.
                  Try switching to a different category.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setActiveFilter("all")}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Featured Project (Spans 2 columns on large screens) */}
                {featuredProject && (
                  <motion.div
                    className="lg:col-span-2 group relative h-full min-h-[400px] lg:min-h-[500px] rounded-3xl overflow-hidden bg-background border border-border shadow-md hover:shadow-xl hover:border-accent/30 transition-all duration-500 cursor-pointer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    onClick={() => handleOpenModal(featuredProject)}
                  >
                    {/* Background Image with Parallax Effect */}
                    <div className="absolute inset-0 overflow-hidden">
                      {featuredProject.thumbnailUrl ? (
                        <Image
                          src={featuredProject.thumbnailUrl}
                          alt={featuredProject.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 66vw"
                          priority
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-purple-500/20" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent/30" />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-end">
                      <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="px-3 py-1 rounded-full bg-accent text-white text-xs font-bold shadow-lg shadow-accent/20 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Featured
                          </span>
                          {featuredProject.type && (
                            <span className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground/80 text-xs font-medium">
                              {featuredProject.type}
                            </span>
                          )}
                          {getStatusBadge(featuredProject.status)}
                        </div>

                        <h3 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground mb-3">
                          {featuredProject.title}
                        </h3>

                        <p className="text-muted-foreground text-base sm:text-lg line-clamp-3 mb-4">
                          {featuredProject.description || featuredProject.tagline}
                        </p>

                        {/* Technologies */}
                        {featuredProject.stack && featuredProject.stack.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {featuredProject.stack.slice(0, 5).map((tech) => (
                              <span
                                key={tech}
                                className="px-3 py-1 text-xs rounded-full bg-secondary/50 dark:bg-white/10 text-foreground/70 border border-border/50"
                              >
                                {tech}
                              </span>
                            ))}
                            {featuredProject.stack.length > 5 && (
                              <span className="px-3 py-1 text-xs rounded-full bg-secondary/30 text-muted-foreground">
                                +{featuredProject.stack.length - 5}
                              </span>
                            )}
                          </div>
                        )}

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          <Button size="sm" className="gap-1.5" onClick={(e) => { e.stopPropagation(); handleOpenModal(featuredProject); }}>
                            View Details
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                          {featuredProject.liveUrl && (
                            <Button size="sm" variant="outline" className="gap-1.5" asChild>
                              <a href={featuredProject.liveUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                <ExternalLink className="w-3.5 h-3.5" />
                                Live Demo
                              </a>
                            </Button>
                          )}
                          {featuredProject.repoUrl && (
                            <Button size="sm" variant="ghost" className="gap-1.5" asChild>
                              <a href={featuredProject.repoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                <Github className="w-3.5 h-3.5" />
                                Source
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Other Projects Grid */}
                {otherProjects.length > 0 && (
                  <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                    {otherProjects.slice(0, 2).map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group relative h-full min-h-[300px] rounded-2xl overflow-hidden bg-background border border-border shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300 cursor-pointer"
                        onClick={() => handleOpenModal(project)}
                      >
                        {/* Image */}
                        <div className="absolute inset-0">
                          {project.thumbnailUrl ? (
                            <Image
                              src={project.thumbnailUrl}
                              alt={project.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-background" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent opacity-90" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                          <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-2">
                              {project.type && (
                                <span className="text-[10px] uppercase tracking-wider text-accent font-bold">
                                  {project.type}
                                </span>
                              )}
                              {getStatusBadge(project.status)}
                            </div>

                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                              {project.title}
                            </h3>

                            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                              {project.description || project.tagline}
                            </p>

                            <div className="flex items-center gap-2 text-sm font-medium text-foreground/80 group-hover:text-accent">
                              View Project <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Remaining projects logic */}
                {otherProjects.length > 2 && (
                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {otherProjects.slice(2).map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                        className="group relative h-full min-h-[280px] rounded-2xl overflow-hidden bg-background border border-border shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300 cursor-pointer"
                        onClick={() => handleOpenModal(project)}
                      >
                        <div className="absolute inset-0">
                          {project.thumbnailUrl ? (
                            <Image
                              src={project.thumbnailUrl}
                              alt={project.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-background" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent opacity-90" />
                        </div>

                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                          <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-2">
                              {getStatusBadge(project.status)}
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-accent transition-colors">
                              {project.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                              View Details <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
