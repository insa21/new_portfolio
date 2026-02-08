"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PostEditor, type PostFormData } from "@/components/admin";
import { postsApi } from "@/lib/api";
import { useNotification } from "@/components/providers/notification-provider";
import { BlogPost } from "@/types";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { error: showError, success } = useNotification();

  const [post, setPost] = useState<PostFormData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const response = await postsApi.get(postId);
        const data = response.data as BlogPost;

        // Transform API data to form data
        setPost({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          coverUrl: data.coverUrl || "",
          categoryId: data.categoryId,
          tags: data.tags || [],
          readTime: data.readTime?.toString() || "5",
          featured: data.featured,
          published: data.published,
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          ogImage: data.ogImage || "",
        });
      } catch (error) {
        console.error("Failed to load post:", error);
        showError("Error", "Failed to load post details");
        router.push("/admin/posts");
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId, router, showError]);

  const handleSubmit = async (data: PostFormData) => {
    setIsSaving(true);
    try {
      await postsApi.update(postId, {
        ...data,
        readTime: parseInt(data.readTime) || 5,
        // Ensure tags are an array if not already
        tags: Array.isArray(data.tags) ? data.tags : [],
      });
      success("Post updated", "Changes saved successfully");
      router.push("/admin/posts");
    } catch (error) {
      console.error("Failed to update:", error);
      showError("Failed to update", "Could not save changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PostEditor
      headerTitle="Edit Article"
      headerDescription="Update your blog article"
      initialData={post}
      isLoading={isLoading}
      isEditing={true}
      onSubmit={handleSubmit}
      isSaving={isSaving}
    />
  );
}
