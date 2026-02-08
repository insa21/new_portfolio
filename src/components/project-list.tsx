"use client";

import { useState } from "react";
import { Project } from "@/types";
import { ProjectCard } from "@/components/project-card";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations";

interface ProjectListProps {
  initialProjects: Project[];
}

const CATEGORIES = ["All", "Fullstack", "AI", "Mobile", "Automation"];

export function ProjectList({ initialProjects }: ProjectListProps) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredProjects = initialProjects.filter((project) => {
    const matchesFilter = filter === "All" || project.tags.some(tag => tag.includes(filter)) || (filter === "Fullstack" && project.tags.includes("Fullstack"));
    // Simple tag matching logic
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase()) ||
      project.stack.some(s => s.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${filter === cat
                ? "bg-foreground text-background font-medium"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/50 border border-transparent focus:border-accent rounded-full py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.slug}
              layout
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No projects found matching your criteria.
        </div>
      )}
    </div>
  );
}
