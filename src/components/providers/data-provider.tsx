"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Project, Experiment, Service, Certification, HeroStats, BlogPost, BlogCategory } from "@/types";
import { projectsApi, experimentsApi, servicesApi, certificationsApi, settingsApi, postsApi, categoriesApi, ContactSettings } from "@/lib/api";

// Fallback static data
import { projects as staticProjects } from "@/data/projects";
import { experiments as staticExperiments } from "@/data/experiments";
import { services as staticServices } from "@/data/services";

interface DataContextType {
  projects: Project[];
  experiments: Experiment[];
  services: Service[];
  certifications: Certification[];
  posts: BlogPost[];
  categories: BlogCategory[];
  heroStats: HeroStats;
  contactSettings: ContactSettings | null;
  isLoading: boolean;
  isApiConnected: boolean;
  refresh: () => Promise<void>;
}

const defaultHeroStats: HeroStats = {
  projects: "50+",
  aiModels: "25+",
  successRate: "98%",
};

const DataContext = createContext<DataContextType>({
  projects: [],
  experiments: [],
  services: [],
  certifications: [],
  posts: [],
  categories: [],
  heroStats: defaultHeroStats,
  contactSettings: null,
  isLoading: true,
  isApiConnected: false,
  refresh: async () => { },
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [heroStats, setHeroStats] = useState<HeroStats>(defaultHeroStats);
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiConnected, setIsApiConnected] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      // Try to fetch from API
      const [projectsRes, experimentsRes, servicesRes, certificationsRes, postsRes, categoriesRes, statsRes, contactRes] = await Promise.all([
        projectsApi.list({ limit: 100 }).catch(() => null),
        experimentsApi.list({ limit: 100 }).catch(() => null),
        servicesApi.list().catch(() => null),
        certificationsApi.list({ limit: 100 }).catch(() => null),
        postsApi.list({ limit: 100, published: true }).catch(() => null),
        categoriesApi.list().catch(() => null),
        settingsApi.get("hero_stats").catch(() => null),
        settingsApi.getContactSettings().catch(() => null),
      ]);

      // Check if API is connected
      if (projectsRes?.success) {
        setIsApiConnected(true);
        setProjects(projectsRes.data as Project[]);
      } else {
        setProjects(staticProjects);
      }

      if (experimentsRes?.success) {
        setExperiments(experimentsRes.data as Experiment[]);
      } else {
        setExperiments(staticExperiments);
      }

      if (servicesRes?.success) {
        const activeServices = (servicesRes.data as Service[]).filter(s => s.active !== false);
        setServices(activeServices);
      } else {
        setServices(staticServices);
      }

      if (certificationsRes?.success) {
        setCertifications(certificationsRes.data as Certification[]);
      }

      if (postsRes?.success) {
        setPosts(postsRes.data as BlogPost[]);
      }

      if (categoriesRes?.success) {
        setCategories(categoriesRes.data as BlogCategory[]);
      }

      if (statsRes?.success && statsRes?.data) {
        setHeroStats(statsRes.data as HeroStats);
      }

      if (contactRes?.success && contactRes?.data) {
        setContactSettings(contactRes.data as ContactSettings);
      }
    } catch {
      // Fallback to static data on error
      console.log("API not available, using static data");
      setProjects(staticProjects);
      setExperiments(staticExperiments);
      setServices(staticServices);
      setIsApiConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        projects,
        experiments,
        services,
        certifications,
        posts,
        categories,
        heroStats,
        contactSettings,
        isLoading,
        isApiConnected,
        refresh: fetchData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

// Individual data hooks with fallback
export function useProjectsData(params?: { featured?: boolean; limit?: number }) {
  const { projects, isLoading } = useData();

  let filteredProjects = projects;

  if (params?.featured !== undefined) {
    filteredProjects = filteredProjects.filter(p => p.featured === params.featured);
  }

  if (params?.limit) {
    filteredProjects = filteredProjects.slice(0, params.limit);
  }

  return { projects: filteredProjects, isLoading };
}

export function useExperimentsData(params?: { limit?: number }) {
  const { experiments, isLoading } = useData();

  let filteredExperiments = experiments;

  if (params?.limit) {
    filteredExperiments = filteredExperiments.slice(0, params.limit);
  }

  return { experiments: filteredExperiments, isLoading };
}

export function useServicesData() {
  const { services, isLoading } = useData();
  return { services, isLoading };
}

export function useCertificationsData(params?: { featured?: boolean; type?: string; limit?: number }) {
  const { certifications, isLoading } = useData();

  let filtered = certifications;

  if (params?.featured !== undefined) {
    filtered = filtered.filter(c => c.featured === params.featured);
  }

  if (params?.type) {
    filtered = filtered.filter(c => c.type === params.type);
  }

  if (params?.limit) {
    filtered = filtered.slice(0, params.limit);
  }

  return { certifications: filtered, isLoading };
}

export function useHeroStatsData() {
  const { heroStats, isLoading } = useData();
  return { stats: heroStats, isLoading };
}

export function usePostsData(params?: { featured?: boolean; category?: string; limit?: number }) {
  const { posts, isLoading } = useData();

  let filtered = posts;

  if (params?.featured !== undefined) {
    filtered = filtered.filter(p => p.featured === params.featured);
  }

  if (params?.category) {
    filtered = filtered.filter(p => p.category?.slug === params.category || p.category?.name === params.category);
  }

  if (params?.limit) {
    filtered = filtered.slice(0, params.limit);
  }

  return { posts: filtered, isLoading };
}

export function useCategoriesData() {
  const { categories, isLoading } = useData();
  return { categories, isLoading };
}

export function useContactSettings() {
  const { contactSettings, isLoading } = useData();
  return { contactSettings, isLoading };
}
