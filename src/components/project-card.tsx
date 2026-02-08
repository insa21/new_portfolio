"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@/types";
import { ArrowUpRight, Github } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: Project;
  layout?: "grid" | "list";
}

function ProjectCardComponent({ project, layout = "grid" }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-500",
        // Light Mode: Clean white card with soft shadow and subtle border
        "bg-surface border border-black/5 shadow-sm hover:shadow-xl",
        // Dark Mode: Deep glass/dark surface with delicate border
        "dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:hover:border-white/20 dark:shadow-none",
        layout === "list" && "md:flex-row"
      )}
    >
      {/* Image Container - Links to Case Study */}
      <Link href={`/projects`} className={cn("relative overflow-hidden block cursor-pointer bg-secondary/20", layout === "list" ? "md:w-2/5 h-64 md:h-auto" : "aspect-[4/3]")}>
        <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        <Image
          src={project.thumbnailUrl || '/placeholders/project.svg'}
          alt={project.title}
          width={800}
          height={600}
          className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Floating Tags (Top Left) */}
        <div className="absolute top-4 left-4 z-20 flex gap-2 flex-wrap">
          {project.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-white/90 text-black shadow-sm dark:bg-black/80 dark:text-white backdrop-blur-md border border-white/20 dark:border-white/10">
              {tag}
            </span>
          ))}
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 p-6 md:p-8 flex flex-col relative z-20">
        <div className="flex justify-between items-start mb-4">
          <Link href={`/projects`} className="group/title">
            <h3 className="text-2xl font-bold font-display tracking-tight text-foreground transition-colors group-hover/title:text-accent flex items-center gap-2">
              {project.title}
              <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 translate-y-2 transition-all duration-300 group-hover/title:opacity-100 group-hover/title:translate-x-0 group-hover/title:translate-y-0 text-accent" />
            </h3>
            <span className="text-xs font-mono text-muted-foreground/60 block mt-1 uppercase tracking-wider">
              {project.type}
            </span>
          </Link>

          <div className="flex gap-2 -mt-1 ml-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
            {project.repoUrl && (
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-secondary/50 hover:bg-accent hover:text-white transition-colors" asChild>
                <a href={project.repoUrl} target="_blank" rel="noreferrer" aria-label="GitHub Repo">
                  <Github className="w-4 h-4" />
                </a>
              </Button>
            )}
            {/* If there is a demo, maybe show it, but the main click is the case study now */}
          </div>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-8 flex-1">
          {project.description}
        </p>

        <div className="mt-auto border-t border-border pt-6 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {project.stack.slice(0, 3).map((tech) => (
              <span key={tech} className="text-xs font-mono text-muted-foreground/80 bg-secondary/50 px-2 py-1 rounded">
                {tech}
              </span>
            ))}
            {project.stack.length > 3 && (
              <span className="text-xs font-mono text-muted-foreground/60 px-2 py-1">+{project.stack.length - 3}</span>
            )}
          </div>

          <span className="text-xs font-medium text-accent uppercase tracking-widest ">
            {project.year}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Memoized ProjectCard component to prevent unnecessary re-renders in list views.
 * Only re-renders when project data or layout changes.
 */
export const ProjectCard = memo(ProjectCardComponent);
