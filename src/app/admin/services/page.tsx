"use client";

import { AdminShell, useRequireAdmin } from "@/components/admin";
import { servicesApi } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, GripVertical, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/providers/notification-provider";

interface Service {
  id: string;
  title: string;
  description: string;
  bestFor: string;
  deliverables: string[];
  active: boolean;
  order: number;
}

export default function AdminServicesPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const { error: showError, success, promise } = useNotification();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await servicesApi.list();
      setServices(response.data as Service[]);
    } catch (error) {
      console.error("Failed to load services:", error);
      showError("Failed to load services", "Could not fetch services from the server");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (!authLoading) {
      loadServices();
    }
  }, [authLoading, loadServices]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await promise(
        servicesApi.delete(id),
        {
          loading: "Deleting service...",
          success: `"${title}" has been deleted`,
          error: "Failed to delete service",
        }
      );
      loadServices();
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleToggleActive = async (id: string, title: string, currentActive: boolean) => {
    try {
      await servicesApi.update(id, { active: !currentActive });
      success(
        currentActive ? "Service deactivated" : "Service activated",
        `"${title}" is now ${currentActive ? "hidden" : "visible"}`
      );
      loadServices();
    } catch (error) {
      console.error("Failed to update:", error);
      showError("Failed to update", "Could not change service status");
    }
  };

  if (authLoading) return null;

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Services</h1>
            <p className="text-muted-foreground mt-1">
              Kelola layanan yang ditawarkan
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/services/new">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Service
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-xl p-6 shadow-sm animate-pulse"
              >
                <div className="h-6 w-48 bg-muted rounded mb-2" />
                <div className="h-4 w-96 bg-muted rounded" />
              </div>
            ))
          ) : services.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-sm">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Belum ada service</p>
              <Button asChild className="mt-4">
                <Link href="/admin/services/new">Tambah Service Pertama</Link>
              </Button>
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className={`bg-surface border rounded-xl p-6 shadow-sm transition-all hover:shadow-md ${service.active ? "border-border" : "border-yellow-500/20 opacity-75 bg-yellow-50/50"
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className="cursor-grab text-muted-foreground hover:text-foreground mt-1">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                      {!service.active && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">{service.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-secondary/50 text-foreground/80 border border-border">
                        <strong>Best for:</strong> {service.bestFor}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-secondary/50 text-foreground/80 border border-border">
                        <strong>Deliverables:</strong> {service.deliverables.length} items
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(service.id, service.title, service.active)}
                    >
                      {service.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/services/${service.id}`}>
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(service.id, service.title)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
