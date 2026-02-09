"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { postsApi } from "@/lib/api";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  category?: { name: string } | null;
  createdAt: string;
  readTime?: number | null;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BlogPreview() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await postsApi.list({ published: true, limit: 3 });
        if (response.data) {
          setPosts(response.data as Post[]);
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
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

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 lg:py-28 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-14"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-accent" />
              <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium">
                Latest Articles
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight">
              From The Blog
            </h2>
          </div>
          <Button variant="ghost" className="group self-start sm:self-auto" asChild>
            <Link href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              Read All Articles
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {posts.slice(0, 3).map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="relative overflow-hidden rounded-2xl bg-card dark:bg-secondary/30 
                  border border-border hover:border-accent/30 transition-all duration-500 
                  h-full flex flex-col hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {post.thumbnail ? (
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-purple-500/20" />
                    )}

                    {/* Category Badge */}
                    {post.category && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-[10px] sm:text-xs font-medium rounded-full 
                          bg-background/90 backdrop-blur-sm text-accent border border-accent/30 shadow-sm">
                          {post.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.createdAt)}
                      </span>
                      {post.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime} min read
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-display font-semibold mb-2 
                      group-hover:text-accent transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Read More */}
                    <div className="mt-4 flex items-center gap-2 text-sm text-accent font-medium
                      opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 
                      transition-all duration-300">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
