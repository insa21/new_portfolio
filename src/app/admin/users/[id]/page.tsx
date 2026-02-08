"use client";

import { AdminShell } from "@/components/admin";
import { usersApi, getErrorMessage, logApiError } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";

interface UserForm {
  name: string;
  email: string;
  role: string;
  password?: string;
}

const USER_ROLES = ["USER", "EDITOR", "ADMIN"];

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { success, error: showError, loading: showLoading, update: updateToast } = useNotification();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    role: "USER",
    password: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await usersApi.get(userId);
        const user = response.data as UserForm;
        setForm({
          name: user.name,
          email: user.email,
          role: user.role,
          password: "",
        });
      } catch (err) {
        logApiError("Failed to load user", err);
        showError("Failed to load user", getErrorMessage(err, "Could not fetch user data from the server"));
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [userId, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = showLoading("Saving changes...", "Updating user information");

    try {
      const data: Record<string, string> = {
        name: form.name,
        email: form.email,
        role: form.role,
      };

      // Only include password if it's provided
      if (form.password) {
        data.password = form.password;
      }

      await usersApi.update(userId, data);
      updateToast(toastId, "success", { title: "User updated", message: "Changes have been saved successfully" });
      router.push("/admin/users");
    } catch (err) {
      logApiError("Failed to update user", err);
      updateToast(toastId, "error", {
        title: "Validation failed",
        message: getErrorMessage(err, "Could not save changes. Please try again."),
        action: {
          label: "Retry",
          onClick: () => handleSubmit(e)
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-display">Edit User</h1>
            <p className="text-muted-foreground mt-1">
              Update user information
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-secondary/30 border border-white/5 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none"
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                New Password (leave blank to keep unchanged)
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/5 focus:border-accent outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/users">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
