"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { settingsApi, TechStackItem } from "@/lib/api";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiNodedotjs,
  SiPython,
  SiTailwindcss,
  SiPostgresql,
  SiMongodb,
  SiDocker,
  SiGit,
  SiGithub,
  SiFigma,
  SiVercel,
  SiPrisma,
  SiRedux,
  SiGraphql,
  SiFirebase,
  SiAmazon,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiRust,
  SiGo,
  SiKubernetes,
  SiTensorflow,
  SiPytorch,
  SiOpenai,
  SiSupabase,
  SiStripe,
  SiLinux,
  SiNginx,
  SiRedis,
  SiElasticsearch,
  SiJest,
  SiCypress,
  SiStorybook,
  SiFramer,
  SiSass,
  SiLess,
  SiWebpack,
  SiVite,
  SiExpress,
  SiNestjs,
  SiFastapi
} from "react-icons/si";
import { Code2, Loader2 } from "lucide-react";

// Icon mapping for tech stack items
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  react: SiReact,
  nextjs: SiNextdotjs,
  typescript: SiTypescript,
  javascript: SiJavascript,
  nodejs: SiNodedotjs,
  node: SiNodedotjs,
  python: SiPython,
  tailwindcss: SiTailwindcss,
  tailwind: SiTailwindcss,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  mongodb: SiMongodb,
  mongo: SiMongodb,
  docker: SiDocker,
  git: SiGit,
  github: SiGithub,
  figma: SiFigma,
  vercel: SiVercel,
  prisma: SiPrisma,
  redux: SiRedux,
  graphql: SiGraphql,
  firebase: SiFirebase,
  aws: SiAmazon,
  amazon: SiAmazon,
  vue: SiVuedotjs,
  vuejs: SiVuedotjs,
  angular: SiAngular,
  svelte: SiSvelte,
  rust: SiRust,
  go: SiGo,
  golang: SiGo,
  kubernetes: SiKubernetes,
  k8s: SiKubernetes,
  tensorflow: SiTensorflow,
  pytorch: SiPytorch,
  openai: SiOpenai,
  supabase: SiSupabase,
  stripe: SiStripe,
  linux: SiLinux,
  nginx: SiNginx,
  redis: SiRedis,
  elasticsearch: SiElasticsearch,
  elastic: SiElasticsearch,
  jest: SiJest,
  cypress: SiCypress,
  storybook: SiStorybook,
  framer: SiFramer,
  "framer-motion": SiFramer,
  sass: SiSass,
  scss: SiSass,
  less: SiLess,
  webpack: SiWebpack,
  vite: SiVite,
  express: SiExpress,
  expressjs: SiExpress,
  nestjs: SiNestjs,
  nest: SiNestjs,
  fastapi: SiFastapi,
};

function getIcon(iconName: string | null | undefined): React.ComponentType<{ className?: string }> {
  if (!iconName) return Code2;
  const normalizedName = iconName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return iconMap[normalizedName] || Code2;
}

interface MarqueeRowProps {
  items: TechStackItem[];
  category: string;
  direction: "left" | "right";
  speed?: number;
}

function MarqueeRow({ items, category, direction, speed = 40 }: MarqueeRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Triple the items to ensure seamless loop
  const displayItems = [...items, ...items, ...items];

  // Handle touch/drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    if (rowRef.current) {
      setScrollLeft(rowRef.current.scrollLeft);
    }
  };

  // Handle touch/drag move
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const walk = (clientX - startX) * 2;
    if (rowRef.current) {
      rowRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  // Handle touch/drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative mb-4">
      {/* Category Label */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-background via-background to-transparent pr-8 pl-2">
        <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium">
          {category}
        </span>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background via-background/80 to-transparent z-[5] pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background via-background/80 to-transparent z-[5] pointer-events-none" />

      {/* Marquee Container */}
      <div
        ref={rowRef}
        className="marquee-pause-on-hover overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        style={{
          "--marquee-duration": `${speed}s`,
          userSelect: "none",
        } as React.CSSProperties}
      >
        <div
          className={`flex gap-4 py-3 ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
            } ${isDragging ? "[animation-play-state:paused]" : ""}`}
          style={{ width: "fit-content" }}
        >
          {displayItems.map((tech, index) => {
            const IconComponent = getIcon(tech.icon);
            return (
              <motion.div
                key={`${tech.id || tech.name}-${index}`}
                whileHover={{
                  y: -4,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group/item relative flex items-center gap-3 px-5 py-3 rounded-xl 
                  bg-secondary/40 border border-white/5 
                  backdrop-blur-sm cursor-default whitespace-nowrap
                  transition-all duration-300
                  hover:bg-secondary/60 hover:border-accent/30 
                  hover:shadow-[0_8px_30px_rgba(0,207,200,0.15),0_0_20px_rgba(0,207,200,0.1)]"
              >
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />

                <IconComponent className="w-5 h-5 text-accent transition-all duration-300 group-hover/item:scale-110 group-hover/item:drop-shadow-[0_0_8px_rgba(0,207,200,0.5)]" />
                <span className="text-sm font-medium text-foreground/80 group-hover/item:text-foreground transition-colors duration-300">
                  {tech.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TechStack() {
  const [techStack, setTechStack] = useState<TechStackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTechStack = async () => {
      try {
        const response = await settingsApi.getHomeSettings();
        if (response.data?.techStack) {
          setTechStack(response.data.techStack);
        }
      } catch (error) {
        console.error("Failed to load tech stack:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTechStack();
  }, []);

  // Group tech items by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, TechStackItem[]> = {};

    techStack.forEach((tech) => {
      const category = tech.category || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(tech);
    });

    // Convert to array of [category, items] and sort by number of items
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [techStack]);

  if (isLoading) {
    return (
      <section className="py-16 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        </div>
      </section>
    );
  }

  if (techStack.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-3">
            Technologies
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            Tech Stack
          </h2>
        </motion.div>

        {/* Marquee Rows */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {groupedByCategory.map(([category, items], index) => (
            <MarqueeRow
              key={category}
              items={items}
              category={category}
              direction={index % 2 === 0 ? "right" : "left"}
              speed={35 + index * 5} // Vary speed slightly per row for visual interest
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
