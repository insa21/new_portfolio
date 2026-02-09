"use client";

/**
 * HomeBackground - Premium tech-inspired background for Home page only
 * Three layers: Grid + Aurora Glows + Noise texture
 * Fully responsive and theme-aware (dark/light mode)
 */

export function HomeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Layer 1: Subtle Grid Pattern */}
      <div
        className="absolute inset-0 
          opacity-[0.04] dark:opacity-[0.03]
          [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]
          [background-size:60px_60px]
          text-slate-600 dark:text-blue-300"
        aria-hidden="true"
      />

      {/* Layer 2a: Aurora Glow - Top Right */}
      <div
        className="absolute -top-[20%] -right-[15%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px]
          rounded-full blur-[100px] 
          bg-gradient-to-br from-sky-400/[0.08] via-teal-300/[0.05] to-transparent
          dark:from-sky-500/[0.12] dark:via-teal-400/[0.08] dark:to-transparent"
        aria-hidden="true"
      />

      {/* Layer 2b: Aurora Glow - Bottom Left */}
      <div
        className="absolute -bottom-[15%] -left-[10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px]
          rounded-full blur-[120px]
          bg-gradient-to-tr from-indigo-400/[0.06] via-purple-300/[0.04] to-transparent
          dark:from-indigo-500/[0.10] dark:via-purple-400/[0.06] dark:to-transparent"
        aria-hidden="true"
      />

      {/* Layer 2c: Subtle center glow for depth */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[80vw] h-[60vh] max-w-[1200px]
          rounded-full blur-[150px]
          bg-gradient-to-r from-transparent via-accent/[0.02] to-transparent
          dark:via-accent/[0.04]"
        aria-hidden="true"
      />

      {/* Layer 3: Noise/Grain Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]
          [background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]"
        aria-hidden="true"
      />

      {/* Layer 4: Hero section fade mask for smooth transition */}
      <div
        className="absolute inset-x-0 top-[80vh] h-[30vh]
          bg-gradient-to-b from-transparent via-background/50 to-background/80"
        aria-hidden="true"
      />
    </div>
  );
}
