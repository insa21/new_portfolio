"use client";

import { useEffect, useState } from "react";
import { settingsApi, BrandingSettings } from "@/lib/api";

/**
 * DynamicFavicon component
 * Fetches branding settings and updates the favicon link in the document head.
 * Uses cache-busting to ensure favicon updates are reflected immediately.
 */
export function DynamicFavicon() {
  const [branding, setBranding] = useState<BrandingSettings | null>(null);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await settingsApi.getBrandingSettings();
        if (response.success && response.data) {
          setBranding(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch branding for favicon:", err);
      }
    };
    fetchBranding();
  }, []);

  useEffect(() => {
    if (!branding?.faviconUrl) return;

    // Add cache-busting query param
    const faviconUrl = `${branding.faviconUrl}${branding.faviconUrl.includes('?') ? '&' : '?'}v=${branding.updatedAt || Date.now()}`;

    // Find existing favicon link or create new one
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.href = faviconUrl;
    link.type = branding.faviconUrl.includes('.svg') ? 'image/svg+xml'
      : branding.faviconUrl.includes('.ico') ? 'image/x-icon'
        : 'image/png';

    // Also update apple-touch-icon if present
    let appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      document.head.appendChild(appleLink);
    }
    appleLink.href = faviconUrl;

  }, [branding]);

  // This component doesn't render anything visible
  return null;
}
