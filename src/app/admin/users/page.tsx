"use client";

import { AdminShell, useRequireAdmin } from "@/components/admin";
import { usersApi } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, User, Shield, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { isLoading: authLoading, user: currentUser } = useRequireAdmin();
  const { error: showError, warning, promise } = useNotification();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Delete state
  const [deleteAction, setDeleteAction] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const limit = 10;

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.list({ q: search, page, limit });
      setUsers(response.data as UserData[]);
      setTotal(response.meta?.total || 0);
    } catch (error) {
      console.error("Failed to load users:", error);
      showError("Failed to load users", "Could not fetch user list from the server");
    } finally {
      setIsLoading(false);
    }
  }, [search, page, limit, showError]);

  useEffect(() => {
    if (!authLoading) {
      loadUsers();
    }
  }, [authLoading, loadUsers]);

  const confirmDelete = (id: string, name: string) => {
    if (id === currentUser?.id) {
      warning("Cannot delete yourself", "You cannot delete your own account");
      return;
    }
    setDeleteAction({ id, name });
  };

  const handleDelete = async () => {
    if (!deleteAction) return;

    setIsDeleting(true);
    const { id, name } = deleteAction;

    // Optimistic Update
    const previousUsers = [...users];
    setUsers(prev => prev.filter(u => u.id !== id));
    setTotal(prev => Math.max(0, prev - 1));

    try {
      await promise(
        usersApi.delete(id),
        {
          loading: "Deleting user...",
          success: `User "${name}" has been deleted`,
          error: "Failed to delete user",
        }
      );

      // If we're on a page with no items now, go back a page
      if (users.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      }
      setDeleteAction(null);
      loadUsers();
    } catch (error) {
      // Error already handled by promise()
      console.error("Failed to delete:", error);
      // Rollback
      setUsers(previousUsers);
      setTotal(prev => prev + 1);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (authLoading) return null;

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Users</h1>
            <p className="text-muted-foreground mt-1">
              Manage admin panel users
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/users/new">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
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
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  User
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Joined
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
                      <div className="h-6 bg-muted rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-accent" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.name}
                            {user.id === currentUser?.id && (
                              <span className="ml-2 text-xs text-accent">(You)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${user.role === "ADMIN"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-blue-500/20 text-blue-400"
                          }`}
                      >
                        {user.role === "ADMIN" ? (
                          <ShieldAlert className="w-3 h-3" />
                        ) : (
                          <Shield className="w-3 h-3" />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-US")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(user.id, user.name)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
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
                {Math.min(page * limit, total)} of {total}
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

      <ConfirmDialog
        isOpen={!!deleteAction}
        onClose={() => setDeleteAction(null)}
        onConfirm={handleDelete}
        title="Delete User?"
        description={`Are you sure you want to delete user "${deleteAction?.name}"?`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </AdminShell>
  );
}
