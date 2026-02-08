import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/layout/command-palette";
import ProjectsExperimentsPageContent from "@/components/projects-experiments-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects & Experiments | Portfolio",
  description: "Showcase of my technical projects, open source contributions, and creative experiments.",
};

export default function ProjectsPage() {
  return (
    <main>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen pt-32 pb-20 px-6 text-center">Loading projects...</div>}>
        <ProjectsExperimentsPageContent />
      </Suspense>
      <Footer />
      <CommandPalette />
    </main>
  );
}
