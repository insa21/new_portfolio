"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ExternalLink,
  Github,
  Star,
  LayoutGrid,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";

export function ProjectModal({ project, isOpen, onClose }: { project: Project | null, isOpen: boolean, onClose: () => void }) {
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
