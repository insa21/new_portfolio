"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  ChevronDown,
  ArrowRight,
  Clock,
  Calendar,
  Tag,
  TrendingUp,
  Mail,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useData } from "@/components/providers/data-provider";
import type { BlogPost } from "@/types";

// --- Static fallback data for when API is not connected ---
const STATIC_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "Building Scalable RAG Pipelines with Python & Pinecone",
    slug: "scalable-rag-pipelines",
    excerpt: "Learn how to architect a robust Retrieval-Augmented Generation system that handles millions of vectors with sub-second latency.",
    content: "Full content here...",
    coverUrl: "/placeholders/case-1.svg",
    tags: ["AI", "RAG", "Python", "Vector DB"],
    categoryId: "1",
    category: { id: "1", name: "AI Engineering", slug: "ai-engineering" },
    authorId: "1",
    author: { id: "1", name: "Indra Saepudin", avatar: "/placeholders/avatar.svg" },
    publishedAt: "2024-03-15",
    readTime: 8,
    views: 1250,
    featured: true,
    published: true
  },
  {
    id: "2",
    title: "The Future of Frontend: Server Components & Beyond",
    slug: "future-of-frontend-rsc",
    excerpt: "Deep dive into React Server Components, streaming SSR, and how Next.js App Router changes the mental model of web development.",
    content: "Full content here...",
    coverUrl: "/placeholders/case-2.svg",
    tags: ["Next.js", "React", "Frontend"],
    categoryId: "2",
    category: { id: "2", name: "Frontend", slug: "frontend" },
    authorId: "1",
    author: { id: "1", name: "Indra Saepudin", avatar: "/placeholders/avatar.svg" },
    publishedAt: "2024-02-28",
    readTime: 6,
    views: 980,
    featured: false,
    published: true
  },
  {
    id: "3",
    title: "Optimizing WebGL Performance in React Applications",
    slug: "optimizing-webgl-react",
    excerpt: "Strategies for managing three.js instances, texture memory, and frame budgets in complex 3D web applications.",
    content: "Full content here...",
    coverUrl: "/placeholders/case-3.svg",
    tags: ["Three.js", "WebGL", "Performance"],
    categoryId: "2",
    category: { id: "2", name: "Frontend", slug: "frontend" },
    authorId: "1",
    author: { id: "1", name: "Indra Saepudin", avatar: "/placeholders/avatar.svg" },
    publishedAt: "2024-01-10",
    readTime: 12,
    views: 850,
    featured: false,
    published: true
  }
];

const STATIC_CATEGORIES = ["All", "AI Engineering", "Frontend", "Backend", "System Design", "Career"];

// --- Components ---

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border", className)}>
      {children}
    </span>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group flex flex-col h-full bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-accent/5 transition-all duration-300"
    >
      <Link href={`/blog/${post.slug}`} className="relative aspect-[16/9] overflow-hidden bg-secondary/30">
        <Image
          src={post.coverUrl || '/placeholders/blog.svg'}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-background/90 backdrop-blur text-foreground border-border">
            {post.category?.name || 'Uncategorized'}
          </Badge>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime || 5} min</span>
        </div>

        <Link href={`/blog/${post.slug}`} className="block mb-3">
          <h3 className="text-xl font-bold font-display leading-tight group-hover:text-accent transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((tag: string) => (
              <span key={tag} className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded">#{tag}</span>
            ))}
          </div>

          <Link href={`/blog/${post.slug}`} className="text-sm font-medium text-accent hover:underline inline-flex items-center gap-1">
            Read more <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function FeaturedPost({ post }: { post: BlogPost }) {
  if (!post) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border group">
      <div className="absolute inset-0 bg-background/80 md:bg-transparent z-10 md:z-0" /> {/* Mobile overlay */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 h-full">
        <div className="relative h-64 md:h-auto lg:col-span-3 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent md:bg-gradient-to-r z-10 opacity-60" />
          <Image
            src={post.coverUrl || '/placeholders/blog.svg'}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="relative z-20 flex flex-col justify-center p-6 md:p-10 lg:col-span-2 bg-gradient-to-t from-background via-background to-transparent md:from-background md:via-background md:to-background/50">
          <Badge className="bg-accent/10 text-accent border-accent/20 w-fit mb-4">Featured Article</Badge>
          <Link href={`/blog/${post.slug}`}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 leading-tight group-hover:text-accent transition-colors">
              {post.title}
            </h2>
          </Link>
          <p className="text-muted-foreground text-lg mb-6 line-clamp-3">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.readTime || 5} min</span>
          </div>
          <Button size="lg" className="w-fit rounded-full" asChild>
            <Link href={`/blog/${post.slug}`}>
              Read Article <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Main Page Component ---

export default function BlogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get data from DataProvider
  const { posts: apiPosts, categories: apiCategories, isLoading: dataLoading, isApiConnected } = useData();

  // Use API data if connected, otherwise use static fallback
  const POSTS_DATA = isApiConnected && apiPosts.length > 0 ? apiPosts : STATIC_POSTS;
  const CATEGORIES = isApiConnected && apiCategories.length > 0
    ? ["All", ...apiCategories.map(c => c.name)]
    : STATIC_CATEGORIES;

  // State
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedSort, setSelectedSort] = useState(searchParams.get("sort") || "newest");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [isLoading, setIsLoading] = useState(false);

  const postsPerPage = 6;

  // Debounced Search Sync
  useEffect(() => {
    const timer = setTimeout(() => {
      // Sync URL
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query); else params.delete("q");
      if (selectedCategory && selectedCategory !== "All") params.set("category", selectedCategory); else params.delete("category");
      if (selectedSort !== "newest") params.set("sort", selectedSort); else params.delete("sort");
      params.set("page", "1"); // Reset page on filter change

      router.replace(`?${params.toString()}`, { scroll: false });
      setIsLoading(false); // Simulate data fetch done
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedCategory, selectedSort]);

  // Note: Loading state handled inline with filtering


  // Filtering Logic
  const filteredPosts = useMemo(() => {
    let result = POSTS_DATA;

    // Search
    if (query) {
      const lowerQ = query.toLowerCase();
      result = result.filter((p: BlogPost) =>
        p.title.toLowerCase().includes(lowerQ) ||
        p.content.toLowerCase().includes(lowerQ) ||
        p.tags.some((t: string) => t.toLowerCase().includes(lowerQ))
      );
    }

    // Category
    if (selectedCategory !== "All") {
      result = result.filter((p: BlogPost) =>
        p.category?.name === selectedCategory ||
        p.category?.slug === selectedCategory.toLowerCase().replace(' ', '-')
      );
    }

    // Sort
    if (selectedSort === "newest") {
      result = [...result].sort((a, b) => new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime());
    } else if (selectedSort === "popular") {
      result = [...result].sort((a, b) => b.views - a.views);
    } else if (selectedSort === "read_time") {
      result = [...result].sort((a, b) => (a.readTime || 0) - (b.readTime || 0));
    }

    return result;
  }, [query, selectedCategory, selectedSort, POSTS_DATA]);


  // Pagination Logic
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const featuredPost = POSTS_DATA.find((p: BlogPost) => p.featured) || POSTS_DATA[0];
  // Don't show featured post in grid if it's the only one, or maybe show it? 
  // Requirement says "Featured Post" section then "Posts Grid". 
  // Usually featured is excluded from grid or duplicated. Let's exclude it from grid for "Newest" sort if we are on page 1?
  // For simplicity, let's keep it in grid too OR better, exclude it if it is the featured one.
  const displayPosts = paginatedPosts.filter((p: BlogPost) => selectedSort !== "newest" || currentPage !== 1 || p.id !== featuredPost?.id);


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Header Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">The Engineer&apos;s <span className="text-accent">Log</span></h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Insights on software architecture, AI engineering, and the evolving landscape of web technology.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 md:px-6 pb-24">

        {/* 2. Featured Post (Only on Page 1 & No filters active) */}
        {!query && selectedCategory === "All" && currentPage === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-20"
          >
            <FeaturedPost post={featuredPost} />
          </motion.div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-10">

            {/* 3. Controls */}
            <div className="space-y-6">
              {/* Search & Sort */}
              <div className="flex flex-col md:flex-row gap-4 justify-between h-auto">
                <div className="relative w-full md:w-96 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-surface rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground/60 text-sm"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <select
                      className="h-11 pl-4 pr-10 appearance-none bg-surface border border-border rounded-lg text-sm focus:border-accent outline-none cursor-pointer min-w-[160px]"
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="popular">Most Popular</option>
                      <option value="read_time">Read Time</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Category Chips */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mask-fade-right">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-200",
                      selectedCategory === cat
                        ? "bg-accent text-accent-foreground border-accent shadow-glow"
                        : "bg-surface text-muted-foreground border-border hover:border-accent/50 hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Posts Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 rounded-xl bg-muted/20 animate-pulse" />
                ))}
              </div>
            ) : displayPosts.length > 0 ? (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 gap-8" // Changed to 2 cols on desktop inside the main column, effectively 2 cols
                >
                  {/* Wait, design said 3 cols on Desktop. Since we have a sidebar that takes 1 col, remaining is 3 cols? 
                                Grid is 12 cols usually. Main is 3/4 = 9 cols. inside 9 cols, can we fit 3 cards? 
                                9 cols is roughly 75%. 3 cards might be tight. Let's do 2 columns in the main content area for better readability, 
                                OR removed sidebar and do 3 columns full width? 
                                Requirement says: "Desktop: 3 columns". Sidebar is "Desktop Only".
                                So layout is: Sidebar + 3 Columns Grid? That's very wide.
                                Usually "Blog with Sidebar": Main(2 cols) + Sidebar.
                                Or "Blog full width": Main(3 cols).
                                Let's try 3 cols grid if space permits, else 2.
                                Tailwind 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                            */}
                  {displayPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-16">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(Math.max(1, currentPage - 1));
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 font-mono text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage(Math.min(totalPages, currentPage + 1));
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center border border-dashed border-border rounded-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setSelectedCategory("All");
                    setSelectedSort("newest");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>

          {/* 5. Sidebar (Desktop Only) */}
          <div className="hidden lg:block space-y-10 pl-8 border-l border-border h-fit sticky top-28">
            {/* Subscribe */}
            <div className="p-6 rounded-2xl bg-surface border border-border">
              <h3 className="font-display font-bold text-xl mb-2">Subscribe</h3>
              <p className="text-xs text-muted-foreground mb-4">Get the latest articles delivered to your inbox. No spam.</p>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full h-10 pl-9 pr-3 bg-background rounded-lg border border-border text-sm focus:border-accent outline-none"
                  />
                </div>
                <Button size="sm" className="w-full">Subscribe</Button>
              </div>
            </div>

            {/* Popular Posts */}
            <div>
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" /> Popular Now
              </h3>
              <div className="flex flex-col gap-4">
                {[...POSTS_DATA].sort((a: BlogPost, b: BlogPost) => b.views - a.views).slice(0, 4).map((post: BlogPost, index: number) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-4 items-start">
                    <span className="text-2xl font-display font-bold text-muted-foreground/20 group-hover:text-accent/50 transition-colors">0{index + 1}</span>
                    <div>
                      <h4 className="font-medium text-sm text-foreground/90 group-hover:text-accent transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <span className="text-xs text-muted-foreground mt-1 block">{post.readTime || 5} min read</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags Cloud */}
            <div>
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-accent" /> Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* Derive unique tags from posts */}
                {Array.from(new Set(POSTS_DATA.flatMap((p: BlogPost) => p.tags))).slice(0, 10).map((tag: string) => (
                  <Link
                    key={tag}
                    href={`?q=${tag}`}
                    className="text-xs px-2.5 py-1 rounded bg-secondary/50 text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
