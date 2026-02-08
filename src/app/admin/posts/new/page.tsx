"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PostEditor, type PostFormData } from "@/components/admin";
import { postsApi } from "@/lib/api";
import { useNotification } from "@/components/providers/notification-provider";

export default function NewPostPage() {
  const router = useRouter();
  const { success, error: showError } = useNotification();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (data: PostFormData) => {
    setIsSaving(true);
    try {
      await postsApi.create({
        ...data,
        readTime: parseInt(data.readTime) || 5,
        // Ensure tags are an array if not already
        tags: Array.isArray(data.tags) ? data.tags : [],
      });
      success("Post created", "Article has been saved successfully");
      router.push("/admin/posts");
    } catch (error) {
      console.error("Failed to create:", error);
      showError("Failed to create", "Could not save article");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PostEditor
      headerTitle="Write Article"
      headerDescription="Create a new blog article"
      onSubmit={handleSubmit}
      isSaving={isSaving}
    />
  );
}
