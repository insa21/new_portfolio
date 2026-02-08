"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo, CSSProperties } from "react";
import {
  getPresetForRoute,
  getRouteSegment,
  BackgroundPreset
} from "@/config/backgroundPresets";

/**
 * BackgroundEngine
 * 
 * A global background layer component that:
 * 1. Reads current pathname to determine active route
 * 2. Selects appropriate visual preset for that route
 * 3. Injects CSS custom properties for background layers
 * 4. Renders fixed background with grid, dots, noise, and glow effects
 * 
 * Should be placed high in the component tree (Root Layout)
 */
export function BackgroundEngine({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine route segment
  const routeSegment = useMemo(() => getRouteSegment(pathname), [pathname]);

  // Get preset for current route
  const preset = useMemo(() => getPresetForRoute(routeSegment), [routeSegment]);

  // Build CSS custom properties based on preset and theme
  const cssVars = useMemo((): CSSProperties => {
    const isDark = resolvedTheme === "dark";

    const vars: Record<string, string | number> = {
      "--bg-grid-opacity": isDark ? preset.gridOpacity.dark : preset.gridOpacity.light,
      "--bg-dot-opacity": isDark ? preset.dotOpacity.dark : preset.dotOpacity.light,
      "--bg-noise-opacity": isDark ? preset.noiseOpacity.dark : preset.noiseOpacity.light,
      "--bg-glow-1": isDark ? preset.glowColor1.dark : preset.glowColor1.light,
      "--bg-glow-2": isDark ? preset.glowColor2.dark : preset.glowColor2.light,
      "--bg-glow-pos-1": preset.glowPos1,
      "--bg-glow-pos-2": preset.glowPos2,
      "--bg-glow-size-1": preset.glowSize1,
      "--bg-glow-size-2": preset.glowSize2,
    };

    // Add optional third glow if present
    if (preset.glowColor3) {
      vars["--bg-glow-3"] = isDark ? preset.glowColor3.dark : preset.glowColor3.light;
      vars["--bg-glow-pos-3"] = preset.glowPos3 || "50% 50%";
      vars["--bg-glow-size-3"] = preset.glowSize3 || "400px 300px";
      vars["--bg-has-glow-3"] = "1";
    } else {
      vars["--bg-has-glow-3"] = "0";
    }

    return vars as CSSProperties;
  }, [preset, resolvedTheme]);

  // Fallback before mount to prevent flash
  if (!mounted) {
    return (
      <div className="bg-engine-wrapper" data-route={routeSegment}>
        <div className="bg-engine-layer" aria-hidden="true" />
        {children}
      </div>
    );
  }

  return (
    <div
      className="bg-engine-wrapper"
      data-route={routeSegment}
      style={cssVars}
    >
      <div className="bg-engine-layer" aria-hidden="true" />
      {children}
    </div>
  );
}
