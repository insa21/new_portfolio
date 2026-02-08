"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ExternalLink,
  Github,
  Star,
  LayoutGrid,
  X,
  Play,
  Code2,
  Zap,
  ArrowRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { Project, Experiment } from "@/types";
import { useData } from "@/components/providers/data-provider";

// --- Types ---
// Imported from @/types

// --- Dummy Data ---
// Imported from @/data/projects

const FILTERS = ["All", "Web App", "Mobile", "Open Source", "AI", "UI/UX"];

// --- Helper Components ---

function ProjectCard({ project, onClick }: { project: Project, onClick: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6 }}
      onClick={onClick}
      data-testid={`project-card-${project.id}`}
      className="group cursor-pointer bg-surface/40 border border-border/80 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-accent/5 hover:border-accent/40 transition-all duration-300 flex flex-col h-full backdrop-blur-sm"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <Image
          src={project.thumbnailUrl || '/placeholders/project.svg'}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Overlay Action */}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-10">
          <Button size="sm" className="rounded-full scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl h-8 text-xs">
            View Details
          </Button>
        </div>

        {/* Top Floating Badge */}
        <div className="absolute top-2 right-2 z-20">
          <Badge variant={project.status === "Live" ? "default" : "secondary"} className={cn("uppercase tracking-wider text-[10px] font-bold shadow-sm px-1.5 py-0 h-5", project.status === "Live" ? "bg-accent/90 text-accent-foreground backdrop-blur-md" : "bg-background/80 backdrop-blur-md")}>
            {project.status === "Live" && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />}
            {project.status}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 relative">
        {/* Decorative Gradient Line */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-border to-transparent group-hover:via-accent/50 transition-colors" />

        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold font-display group-hover:text-accent transition-colors leading-tight">{project.title}</h3>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity -mr-1">
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-full hover:bg-accent/10 hover:text-accent transition-colors">
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">{project.tagline}</p>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="font-mono">{project.year} — {project.type}</span>
          {project.stars ? (
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent" /> {project.stars}</span>
          ) : null}
        </div>

        {/* Stack Tags (Bottom) */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-dashed border-border/60">
          {project.stack.slice(0, 3).map(tech => (
            <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary/30 text-muted-foreground font-medium">
              {tech}
            </span>
          ))}
          {project.stack.length > 3 && (
            <span className="text-[10px] text-muted-foreground self-center px-1">+{project.stack.length - 3}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function FeaturedProject({ project, onClick }: { project: Project, onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative grid grid-cols-1 lg:grid-cols-2 gap-0 bg-surface/30 border border-border/60 rounded-3xl overflow-hidden hover:border-accent/30 transition-all duration-500 shadow-sm hover:shadow-xl"
    >
      {/* Preview Side */}
      <div className="relative aspect-video lg:aspect-auto lg:h-full overflow-hidden bg-muted cursor-pointer min-h-[300px]" onClick={onClick}>
        <Image
          src={project.thumbnailUrl || '/placeholders/project.svg'}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/10 lg:to-black/80 opacity-60" />

        {/* Play Icon Overlay */}
        {project.previewType === "video" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Info Side */}
      <div className="flex flex-col justify-center p-6 lg:p-8 relative">
        <div className="absolute top-0 right-0 p-4 opacity-30 text-[80px] leading-none font-bold font-display text-surface -z-10 bg-clip-text text-transparent bg-gradient-to-b from-foreground/5 to-transparent select-none">
          0{project.id}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge className="bg-accent text-accent-foreground shadow-lg shadow-accent/20 border-0 px-2.5 py-0.5 text-xs">Featured</Badge>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-border" />
            {project.type}
          </span>
        </div>

        <h2 className="text-3xl lg:text-4xl font-display font-bold mb-3 group-hover:text-accent transition-colors cursor-pointer tracking-tight" onClick={onClick}>
          {project.title}
        </h2>
        <p className="text-sm lg:text-base text-muted-foreground mb-6 leading-relaxed max-w-lg">
          {project.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {project.highlights.slice(0, 2).map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface/50 border border-border/50">
              <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-foreground/80 leading-snug pt-0.5">{item}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-8">
          {project.stack.map(tech => (
            <Badge key={tech} variant="outline" className="border-border/60 bg-background/30 text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors px-2 py-0 text-[10px]">
              {tech}
            </Badge>
          ))}
        </div>

        <div className="flex gap-3 mt-auto">
          {project.liveUrl && (
            <Button size="default" className="rounded-full shadow-lg shadow-accent/10 hover:shadow-accent/20 h-10 px-6 text-sm transition-all duration-300 hover:scale-105 active:scale-95" asChild>
              <a href={project.liveUrl} target="_blank" rel="noreferrer">
                View Live <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          )}
          {project.repoUrl && (
            <Button variant="outline" size="default" className="rounded-full border-foreground/10 bg-background/50 hover:bg-accent hover:text-accent-foreground hover:border-accent h-10 px-6 text-sm transition-all duration-300" asChild>
              <a href={project.repoUrl} target="_blank" rel="noreferrer">
                <Github className="w-4 h-4 mr-2" /> Code
              </a>
            </Button>
          )}
          <Button variant="ghost" size="default" className="rounded-full text-muted-foreground hover:text-accent h-10 px-4 text-sm hover:bg-accent/10 transition-colors" onClick={onClick}>
            Details
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function ExperimentCard({ experiment }: { experiment: Experiment }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex flex-col p-4 rounded-xl border border-border bg-black/5 dark:bg-white/5 overflow-hidden hover:bg-surface hover:border-accent/40 hover:shadow-lg transition-all duration-300"
    >
      {/* Terminal Header Look */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-border/50 group-hover:border-accent/20">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/20" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
          <div className="w-2 h-2 rounded-full bg-green-500/20" />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground opacity-50">~/{experiment.date}</span>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-accent font-bold text-xs">➜</span>
          <h3 className="font-bold font-mono text-sm">{experiment.title}</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4 pl-4 border-l border-border/50 group-hover:border-accent/30 transition-colors ml-1">
          {experiment.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3 pl-1">
        {experiment.tags.map(tag => (
          <Badge key={tag} variant="outline" className="text-[10px] py-0 h-4 border-border bg-transparent font-mono font-normal px-1.5">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
        {experiment.demoUrl && (
          <a href={experiment.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-foreground hover:text-accent transition-colors bg-surface px-2 py-0.5 rounded border border-border">
            <Play className="w-2.5 h-2.5" /> RUN
          </a>
        )}
        {experiment.repoUrl && (
          <a href={experiment.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5">
            <Code2 className="w-2.5 h-2.5" /> SRC
          </a>
        )}
      </div>

      {/* Glow Effect */}
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  )
}

function ProjectModal({ project, isOpen, onClose }: { project: Project | null, isOpen: boolean, onClose: () => void }) {
  if (!isOpen || !project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Close Btn */}
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>

          {/* Header Media */}
          <div className="relative h-64 sm:h-80 bg-muted shrink-0">
            <Image src={project.thumbnailUrl || '/placeholders/project.svg'} alt={project.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <Badge className="bg-accent text-accent-foreground">{project.type}</Badge>
                <span className="text-foreground/80 font-mono text-sm">{project.year}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">{project.title}</h2>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left Content */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-accent" /> Overview</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </div>

                {project.challenges && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-accent" /> Challenges & Solutions</h3>
                    <p className="text-muted-foreground leading-relaxed">{project.challenges}</p>
                  </div>
                )}

                {project.results && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Star className="w-5 h-5 text-accent" /> Key Results</h3>
                    <p className="text-muted-foreground leading-relaxed">{project.results}</p>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <Button className="w-full justify-between" asChild disabled={!project.liveUrl}>
                    <a href={project.liveUrl || '#'} target="_blank" rel="noreferrer">
                      Live Demo <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-between" asChild disabled={!project.repoUrl}>
                    <a href={project.repoUrl || '#'} target="_blank" rel="noreferrer">
                      Source Code <Github className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>

                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.stack.map(t => (
                      <Badge key={t} variant="secondary" className="font-normal bg-secondary/50">{t}</Badge>
                    ))}
                  </div>
                </div>

                {project.stars !== undefined && (
                  <div className="p-4 bg-secondary/20 rounded-lg flex items-center justify-between border border-border/50">
                    <span className="text-sm font-medium flex items-center gap-2"><Github className="w-4 h-4" /> Stars</span>
                    <span className="font-mono font-bold">{project.stars}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// --- Main Page Component ---

export default function ProjectsExperimentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get data from DataProvider
  const { projects: PROJECTS_DATA, experiments: EXPERIMENTS_DATA, isLoading: dataLoading } = useData();

  // State
  const [activeTab, setActiveTab] = useState<"projects" | "experiments">("projects");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeFilters, setActiveFilters] = useState<string[]>(() => {
    const filterParam = searchParams.get("filters");
    return filterParam ? filterParam.split(",") : [];
  });
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [showLiveOnly, setShowLiveOnly] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Load
  useEffect(() => {
    if (!dataLoading) {
      const t = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(t);
    }
  }, [dataLoading]);

  // Sync URL (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query); else params.delete("q");
      if (activeFilters.length > 0) params.set("filters", activeFilters.join(",")); else params.delete("filters");
      if (sort !== "newest") params.set("sort", sort); else params.delete("sort");
      // Tab state not usually synced unless requested, but good for UX. Let's sync it.
      if (activeTab !== "projects") params.set("tab", activeTab); else params.delete("tab");

      router.replace(`?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeFilters, sort, activeTab]);

  // Restore Tab from URL - using callback to avoid setState in effect
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "experiments" && activeTab !== "experiments") {
      setActiveTab("experiments");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);


  // Filter & Sort Logic
  const filteredItems = useMemo(() => {
    if (activeTab === "projects") {
      let result = PROJECTS_DATA;

      // Live Only
      if (showLiveOnly) {
        result = result.filter(p => p.status === "Live");
      }

      // Filter Tag/Type (Multi-select with AND/intersection logic)
      if (activeFilters.length > 0) {
        result = result.filter(p => {
          // Project must match ALL selected filters
          return activeFilters.every(filter =>
            p.type === filter || p.tags.includes(filter)
          );
        });
      }

      // Search
      if (query) {
        const q = query.toLowerCase();
        result = result.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.stack.some(s => s.toLowerCase().includes(q))
        );
      }

      // Sort
      if (sort === "newest") {
        // Mock year sort for now
        result = [...result].sort((a, b) => parseInt(b.year) - parseInt(a.year));
      } else if (sort === "popular") {
        result = [...result].sort((a, b) => (b.stars || 0) - (a.stars || 0));
      } else if (sort === "featured") {
        result = [...result].sort((a, b) => (a.featured === b.featured) ? 0 : a.featured ? -1 : 1);
      }

      return result;
    } else {
      // Experiments Logic
      let result = EXPERIMENTS_DATA;
      if (query) {
        const q = query.toLowerCase();
        result = result.filter(e =>
          e.title.toLowerCase().includes(q) ||
          e.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return result; // Simple filter for experiments
    }
  }, [activeTab, query, activeFilters, sort, showLiveOnly, PROJECTS_DATA, EXPERIMENTS_DATA]);

  const featuredProjects = useMemo(() => {
    if (activeTab !== "projects" || query || activeFilters.length > 0) return [];
    return filteredItems.filter(p => (p as Project).featured).slice(0, 2) as Project[];
  }, [filteredItems, activeTab, query, activeFilters]);

  // Exclude featured from main grid if we are showing them in the featured slot
  // Only if we are in "Default" view (no search/filter)
  const gridItems = useMemo(() => {
    if (activeTab === "experiments") return filteredItems as Experiment[];
    const featuredIds = featuredProjects.map(p => p.id);
    // If we are showing featured section, exclude them from grid. Else show all.
    if (featuredProjects.length > 0) {
      return (filteredItems as Project[]).filter(p => !featuredIds.includes(p.id));
    }
    return filteredItems as Project[];
  }, [filteredItems, featuredProjects, activeTab]);


  // Stats
  const totalProjects = PROJECTS_DATA.length;
  const totalExperiments = EXPERIMENTS_DATA.length;
  const featuredCount = PROJECTS_DATA.filter(p => p.featured).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Header */}
      {/* 1. Header */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/40 to-background pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-6 border border-accent/20">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Engineering Portfolio</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight leading-tight">
                  Building <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/60">Digital</span> <br />
                  Experiences.
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                  A curated collection of technical projects, open source tools, and creative experiments. pushing the boundaries of what&apos;s possible on the web.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="rounded-full shadow-lg hover:shadow-accent/25 transition-all duration-300" asChild>
                    <Link href="/contact">Start a Project <ArrowRight className="w-4 h-4 ml-2" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full bg-background/50 backdrop-blur-sm hover:bg-background border-border/50" asChild>
                    <Link href="https://github.com/example" target="_blank">
                      <Github className="w-4 h-4 mr-2" /> GitHub Profile
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-3 gap-px bg-border/50 rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-black/5"
            >
              <div className="bg-surface/40 backdrop-blur-md p-6 text-center hover:bg-surface/60 transition-colors">
                <div className="text-3xl font-bold font-display">{totalProjects}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Projects</div>
              </div>
              <div className="bg-surface/40 backdrop-blur-md p-6 text-center hover:bg-surface/60 transition-colors">
                <div className="text-3xl font-bold font-display text-accent">{featuredCount}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Featured</div>
              </div>
              <div className="bg-surface/40 backdrop-blur-md p-6 text-center hover:bg-surface/60 transition-colors">
                <div className="text-3xl font-bold font-display">{totalExperiments}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Labs</div>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Decorative Gradient Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent blur-[1px]" />
      </section>

      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-12">

        {/* 2. Controls */}
        <div className="sticky top-20 z-30 bg-background/95 backdrop-blur-md py-4 mb-10 -mx-4 px-4 md:mx-0 md:px-0 border-b border-border/50">
          <div className="flex flex-col gap-6">
            {/* Top Row: Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab("projects")}
                  className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all", activeTab === "projects" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                >
                  Projects
                </button>
                <button
                  onClick={() => setActiveTab("experiments")}
                  className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all", activeTab === "experiments" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                >
                  Experiments
                </button>
              </div>

              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-surface rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-all"
                />
              </div>
            </div>

            {/* Bottom Row: Filters & Sort (Only for Projects usually) */}
            {activeTab === "projects" && (
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mask-fade-right">
                  {FILTERS.map(filter => {
                    const isAll = filter === "All";
                    const isActive = isAll ? activeFilters.length === 0 : activeFilters.includes(filter);

                    const handleClick = () => {
                      if (isAll) {
                        setActiveFilters([]);
                      } else {
                        setActiveFilters(prev =>
                          prev.includes(filter)
                            ? prev.filter(f => f !== filter)
                            : [...prev, filter]
                        );
                      }
                    };

                    return (
                      <button
                        key={filter}
                        data-testid={`filter-chip-${filter.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={handleClick}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all duration-200",
                          isActive
                            ? "bg-foreground text-background border-foreground font-bold"
                            : "bg-surface text-muted-foreground border-border hover:border-accent/50 hover:text-foreground"
                        )}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                    <input type="checkbox" checked={showLiveOnly} onChange={() => setShowLiveOnly(!showLiveOnly)} className="accent-accent w-4 h-4 rounded border-border" />
                    Live Only
                  </label>

                  <div className="h-4 w-px bg-border" />

                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="appearance-none bg-transparent hover:bg-surface text-sm font-medium py-1 pl-2 pr-6 rounded cursor-pointer outline-none focus:text-accent transition-colors"
                    >
                      <option value="newest">Newest</option>
                      <option value="popular">Popular</option>
                      <option value="featured">Featured First</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 opacity-50 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Featured Section (Projects Tab Only) */}
        {activeTab === "projects" && featuredProjects.length > 0 && (
          <div className="mb-16 space-y-8">
            {featuredProjects.map(project => (
              <FeaturedProject
                key={project.id}
                project={project}
                onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
              />
            ))}
          </div>
        )}

        {/* 4. Main Grid */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[4/3] rounded-xl bg-muted/20 animate-pulse" />)}
            </div>
          ) : gridItems.length > 0 ? (
            <motion.div
              layout
              className={cn(
                "grid gap-6",
                activeTab === "projects" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              )}
            >
              <AnimatePresence>
                {gridItems.map((item) => (
                  activeTab === "projects" ? (
                    <ProjectCard
                      key={item.id}
                      project={item as Project}
                      onClick={() => { setSelectedProject(item as Project); setIsModalOpen(true); }}
                    />
                  ) : (
                    <ExperimentCard
                      key={item.id}
                      experiment={item as Experiment}
                    />
                  )
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No {activeTab} found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search query.</p>
              <Button variant="outline" onClick={() => { setQuery(""); setActiveFilters([]); setShowLiveOnly(false); }}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
