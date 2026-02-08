import { Suspense } from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/layout/command-palette";
import BlogsPageContent from "@/components/blogs-page";

export const metadata: Metadata = {
  title: "Blog | Insights & Engineering",
  description: "Deep dives into software architecture, AI engineering, and modern web development.",
};

export default function BlogPage() {
  return (
    <main>
      <Navbar />
      <CommandPalette />
      <Suspense fallback={<div className="min-h-screen pt-32 pb-20 px-6 text-center">Loading articles...</div>}>
        <BlogsPageContent />
      </Suspense>
      <Footer />
    </main>
  );
}
