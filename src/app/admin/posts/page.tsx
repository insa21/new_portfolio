"use client";

import { AdminShell } from "@/components/admin";
import { postsApi } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, ExternalLink, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  featured: boolean;
  views: number;
  category: { id: string; name: string };
  author: { name: string };
  createdAt: string;
}

export default function AdminPostsPage() {
  const { error: showError, promise } = useNotification();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Delete state
  const [deleteAction, setDeleteAction] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const limit = 10;

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await postsApi.list({ q: search, page, limit });
      setPosts(response.data as Post[]);
      setTotal(response.meta?.total || 0);
    } catch (error) {
      console.error("Failed to load posts:", error);
      showError("Failed to load posts", "Could not fetch post list from the server");
    } finally {
      setIsLoading(false);
    }
  }, [search, page, limit, showError]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const confirmDelete = (id: string, title: string) => {
    setDeleteAction({ id, title });
  };

  const handleDelete = async () => {
    if (!deleteAction) return;

    setIsDeleting(true);
    const { id, title } = deleteAction;

    // Optimistic Update
    const previousPosts = [...posts];
    setPosts(prev => prev.filter(p => p.id !== id));
    setTotal(prev => Math.max(0, prev - 1));

    try {
      await promise(
        postsApi.delete(id),
        {
          loading: "Deleting post...",
          success: `Post "${title}" has been deleted`,
          error: "Failed to delete post",
        }
      );

      // If we're on a page with no items now, go back a page
      if (posts.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      }
      setDeleteAction(null);
      // Reload to ensure data consistency
      loadPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
      // Rollback
      setPosts(previousPosts);
      setTotal(prev => prev + 1);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Blog Posts</h1>
            <p className="text-muted-foreground mt-1">
              Manage all blog articles
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/posts/new">
              <Plus className="w-4 h-4 mr-2" />
              Write Article
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface border border-border focus:border-accent outline-none transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Views
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-6 bg-muted/50 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No articles found
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr
                      key={post.id}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {post.featured && (
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          )}
                          <div>
                            <p className="font-medium">{post.title}</p>
                            <p className="text-sm text-muted-foreground">
                              by {post.author.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-secondary/50 rounded-full text-xs">
                          {post.category?.name || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs ${post.published
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                            }`}
                        >
                          {post.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/posts/${post.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(post.id, post.title)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1} -{" "}
                  {Math.min(page * limit, total)} of {total} articles
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteAction}
        onClose={() => setDeleteAction(null)}
        onConfirm={handleDelete}
        title="Delete Post?"
        description={`Are you sure you want to delete "${deleteAction?.title}"? This action cannot be undone.`}
        confirmText="Delete Post"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </AdminShell>
  );
}
