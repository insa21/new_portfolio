/**
 * Background Engine Presets
 * 
 * This file defines visual presets for different routes.
 * Each preset controls the opacity and appearance of background layers:
 * - Grid pattern
 * - Dot pattern  
 * - Noise overlay
 * - Radial glow effects
 */

export type ThemeValue<T> = {
  light: T;
  dark: T;
};

export type BackgroundPreset = {
  name: string;
  gridOpacity: ThemeValue<number>;
  dotOpacity: ThemeValue<number>;
  noiseOpacity: ThemeValue<number>;
  glowColor1: ThemeValue<string>;
  glowColor2: ThemeValue<string>;
  glowColor3?: ThemeValue<string>;  // Optional third glow
  glowPos1: string;
  glowPos2: string;
  glowPos3?: string;  // Optional
  glowSize1: string;
  glowSize2: string;
  glowSize3?: string;  // Optional
};

// Default fallback preset
const defaultPreset: BackgroundPreset = {
  name: "default",
  gridOpacity: { light: 0.03, dark: 0.04 },
  dotOpacity: { light: 0, dark: 0 },
  noiseOpacity: { light: 0.02, dark: 0.03 },
  glowColor1: {
    light: "rgba(13, 148, 136, 0.12)",
    dark: "rgba(45, 212, 191, 0.1)"
  },
  glowColor2: {
    light: "rgba(20, 184, 166, 0.08)",
    dark: "rgba(20, 184, 166, 0.06)"
  },
  glowPos1: "30% 0%",
  glowPos2: "70% 100%",
  glowSize1: "600px 400px",
  glowSize2: "500px 350px",
};

/**
 * Route-to-preset mapping
 * Keys should match the first segment of pathname (after /)
 */
export const ROUTE_PRESETS: Record<string, BackgroundPreset> = {
  // Home - "wow" effect with stronger, more vibrant glows
  home: {
    name: "home",
    gridOpacity: { light: 0.035, dark: 0.045 },
    dotOpacity: { light: 0.015, dark: 0.025 },
    noiseOpacity: { light: 0.02, dark: 0.025 },
    glowColor1: {
      light: "rgba(13, 148, 136, 0.28)",   // Teal - primary, prominent
      dark: "rgba(45, 212, 191, 0.25)"     // Stronger teal for dark
    },
    glowColor2: {
      light: "rgba(99, 102, 241, 0.18)",   // Indigo accent
      dark: "rgba(139, 92, 246, 0.2)"      // Purple/violet for dark mode
    },
    glowColor3: {
      light: "rgba(236, 72, 153, 0.1)",    // Pink accent for light
      dark: "rgba(244, 114, 182, 0.12)"    // Brighter pink for dark
    },
    glowPos1: "10% 0%",
    glowPos2: "90% 80%",
    glowPos3: "50% 50%",
    glowSize1: "900px 650px",
    glowSize2: "750px 550px",
    glowSize3: "500px 400px",
  },

  // About - calm, minimal glow
  about: {
    name: "about",
    gridOpacity: { light: 0.02, dark: 0.03 },
    dotOpacity: { light: 0, dark: 0 },
    noiseOpacity: { light: 0.02, dark: 0.025 },
    glowColor1: {
      light: "rgba(13, 148, 136, 0.08)",
      dark: "rgba(45, 212, 191, 0.06)"
    },
    glowColor2: {
      light: "rgba(20, 184, 166, 0.05)",
      dark: "rgba(20, 184, 166, 0.04)"
    },
    glowPos1: "50% 30%",
    glowPos2: "50% 80%",
    glowSize1: "500px 350px",
    glowSize2: "400px 300px",
  },

  // Projects - engineering feel, grid more prominent
  projects: {
    name: "projects",
    gridOpacity: { light: 0.06, dark: 0.07 },
    dotOpacity: { light: 0.02, dark: 0.03 },
    noiseOpacity: { light: 0.02, dark: 0.025 },
    glowColor1: {
      light: "rgba(13, 148, 136, 0.12)",
      dark: "rgba(45, 212, 191, 0.1)"
    },
    glowColor2: {
      light: "rgba(99, 102, 241, 0.08)",
      dark: "rgba(129, 140, 248, 0.06)"
    },
    glowPos1: "10% 20%",
    glowPos2: "90% 80%",
    glowSize1: "550px 400px",
    glowSize2: "500px 350px",
  },

  // Blog - clean, light noise
  blog: {
    name: "blog",
    gridOpacity: { light: 0.02, dark: 0.03 },
    dotOpacity: { light: 0, dark: 0 },
    noiseOpacity: { light: 0.015, dark: 0.02 },
    glowColor1: {
      light: "rgba(13, 148, 136, 0.06)",
      dark: "rgba(45, 212, 191, 0.05)"
    },
    glowColor2: {
      light: "rgba(20, 184, 166, 0.04)",
      dark: "rgba(20, 184, 166, 0.03)"
    },
    glowPos1: "50% 20%",
    glowPos2: "50% 70%",
    glowSize1: "600px 300px",
    glowSize2: "500px 250px",
  },

  // Contact - center-bottom focus glow
  contact: {
    name: "contact",
    gridOpacity: { light: 0.03, dark: 0.04 },
    dotOpacity: { light: 0, dark: 0.01 },
    noiseOpacity: { light: 0.02, dark: 0.025 },
    glowColor1: {
      light: "rgba(13, 148, 136, 0.14)",
      dark: "rgba(45, 212, 191, 0.12)"
    },
    glowColor2: {
      light: "rgba(20, 184, 166, 0.1)",
      dark: "rgba(20, 184, 166, 0.08)"
    },
    glowPos1: "50% 70%",
    glowPos2: "50% 100%",
    glowSize1: "700px 500px",
    glowSize2: "800px 400px",
  },

  // Services - modern professional, dot+glow subtle
  services: {
    name: "services",
    gridOpacity: { light: 0.03, dark: 0.04 },
    dotOpacity: { light: 0.03, dark: 0.04 },
    noiseOpacity: { light: 0.02, dark: 0.025 },
    glowColor1: {
      light: "rgba(13, 148, 136, 0.1)",
      dark: "rgba(45, 212, 191, 0.08)"
    },
    glowColor2: {
      light: "rgba(59, 130, 246, 0.06)",
      dark: "rgba(96, 165, 250, 0.05)"
    },
    glowPos1: "30% 20%",
    glowPos2: "70% 80%",
    glowSize1: "550px 400px",
    glowSize2: "500px 350px",
  },

  // Certifications - clean + credible, very subtle
  certifications: {
    name: "certifications",
    gridOpacity: { light: 0.015, dark: 0.02 },
    dotOpacity: { light: 0, dark: 0 },
    noiseOpacity: { light: 0.015, dark: 0.02 },
    glowColor1: {
      light: "rgba(13, 148, 136, 0.05)",
      dark: "rgba(45, 212, 191, 0.04)"
    },
    glowColor2: {
      light: "rgba(20, 184, 166, 0.03)",
      dark: "rgba(20, 184, 166, 0.025)"
    },
    glowPos1: "50% 30%",
    glowPos2: "50% 70%",
    glowSize1: "500px 300px",
    glowSize2: "400px 250px",
  },
};

/**
 * Get preset for a route segment
 * Falls back to home preset if route not found
 */
export function getPresetForRoute(routeSegment: string): BackgroundPreset {
  return ROUTE_PRESETS[routeSegment] ?? ROUTE_PRESETS.home ?? defaultPreset;
}

/**
 * Extract route segment from pathname
 * "/" -> "home"
 * "/about" -> "about"
 * "/projects/123" -> "projects"
 */
export function getRouteSegment(pathname: string): string {
  if (pathname === "/") return "home";
  const segment = pathname.split("/")[1];
  return segment || "home";
}
