"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { Menu, X, MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useContactSettings } from "@/components/providers/data-provider";
import { settingsApi, BrandingSettings } from "@/lib/api";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/certifications", label: "Certifications" },
  { href: "/blog", label: "Blog" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function NavItem({ link, pathname }: { link: { href: string; label: string }; pathname: string }) {
  const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={link.href}
      className={cn(
        "relative text-sm font-medium transition-colors duration-300 py-1",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {link.label}
      {isActive ? (
        <motion.div
          layoutId="nav-underline"
          className="absolute left-0 right-0 -bottom-1 h-px bg-accent"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      ) : (
        <motion.div
          className="absolute left-0 right-0 -bottom-1 h-px bg-foreground/20 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </Link>
  );
}

// Logo component that switches based on theme with responsive sizing
// Shows both logo image AND site name when both are present
function SiteLogo({ branding, isScrolled }: { branding: BrandingSettings | null; isScrolled: boolean }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the appropriate logo URL based on theme
  const baseLogoUrl = mounted && resolvedTheme === "dark"
    ? (branding?.darkLogoUrl || branding?.logoUrl)
    : branding?.logoUrl;

  // Add cache-busting using updatedAt timestamp if available
  const logoUrl = baseLogoUrl
    ? `${baseLogoUrl}${baseLogoUrl.includes('?') ? '&' : '?'}v=${branding?.updatedAt || Date.now()}`
    : null;

  const siteName = branding?.siteName || "Insacode";
  const altText = branding?.logoAltText || siteName;

  // Responsive sizing from settings
  const desktopHeight = branding?.desktopLogoHeight || 40;
  const mobileHeight = branding?.mobileLogoHeight || 32;

  return (
    <Link href="/" className="relative z-50 flex items-center gap-2 shrink-0">
      {/* Show logo image if available */}
      {logoUrl && (
        <Image
          src={logoUrl}
          alt={altText}
          width={branding?.logoWidth || 120}
          height={desktopHeight}
          style={{
            height: isScrolled ? Math.max(desktopHeight - 4, mobileHeight) : desktopHeight,
            width: 'auto',
            objectFit: 'contain',
          }}
          className="transition-all duration-300 max-w-[100px] md:max-w-[140px]"
          priority
          unoptimized
        />
      )}
      {/* Show site name text - hidden on mobile, visible on desktop */}
      {siteName && (
        <span className={cn(
          "font-bold tracking-tight font-display transition-all duration-300",
          "hidden md:inline", // Hide on mobile, show on md+
          isScrolled ? "text-base md:text-lg" : "text-lg md:text-xl"
        )}>
          {siteName}
        </span>
      )}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { contactSettings } = useContactSettings();
  const [branding, setBranding] = useState<BrandingSettings | null>(null);

  // Fetch branding settings with cache-busting
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await settingsApi.getBrandingSettings();
        if (response.success && response.data) {
          setBranding(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch branding settings:", err);
      }
    };
    fetchBranding();
  }, []);

  // Get WhatsApp number from settings or fallback
  const whatsappNumber = contactSettings?.whatsapp?.replace(/\D/g, "") || "";
  const chatLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "/contact";

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] pointer-events-auto transition-all duration-500 ease-in-out",
          isScrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border py-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
            : "bg-transparent border-b border-transparent py-5"
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <SiteLogo branding={branding} isScrolled={isScrolled} />

          {/* Desktop Nav - Visible on Laptop/Desktop (1025px+) */}
          <nav className="hidden lg:flex items-center gap-8 relative">
            {navLinks.map((link) => (
              <NavItem key={link.href} link={link} pathname={pathname} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Search Button */}
            {/* Mobile (<600px): Hidden */}
            {/* Tablet (600-1024px): Icon + Label, No Kbd */}
            {/* Desktop (1025px+): Icon + Label + Kbd */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-10 rounded-lg border border-border bg-surface hover:bg-secondary hover:border-accent/30 transition-all",
                "hidden md:flex items-center gap-2 px-3 text-muted-foreground hover:text-foreground"
              )}
              onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
              aria-label="Search"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="leading-none whitespace-nowrap">Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 h-5 text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded ml-1">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            {/* Theme Toggle - Always visible as Icon Button */}
            <div className="shrink-0">
              <ThemeToggle className="h-10 w-10 rounded-lg border border-border bg-surface hover:bg-secondary hover:border-accent/30 transition-all text-muted-foreground hover:text-foreground" />
            </div>

            {/* Chat CTA - Primary Button */}
            {/* Mobile (<600px): Hidden (in drawer) */}
            {/* Tablet/Desktop: Visible */}
            <motion.div whileHover={{ y: -1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="hidden md:block shrink-0">
              <Button
                size="default"
                className="relative h-10 px-5 gap-2 font-medium tracking-wide shadow-lg shadow-primary/20 overflow-hidden group"
                asChild
              >
                <a href={chatLink} target={whatsappNumber ? "_blank" : undefined} rel={whatsappNumber ? "noopener noreferrer" : undefined}>
                  {/* Sheen Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <MessageSquare className="size-4 shrink-0 relative z-10" />
                  <span className="leading-none pb-px relative z-10">Let's Chat</span>
                </a>
              </Button>
            </motion.div>

            {/* Mobile Menu Toggle - Visible < 1024px (lg) if nav links are hidden there */}
            {/* Requirement: Tablet hides center links, so toggle needed on Tablet? */}
            {/* Requirement 2) Tablet: Hide center nav links. So yes, Menu needed. */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-10 w-10 ml-1"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-accent origin-left z-50"
          style={{ scaleX }}
        />
      </header>

      {/* Mobile Menu Overlay / Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-30 bg-background/98 backdrop-blur-xl lg:hidden flex flex-col pt-24 px-6 border-l border-border"
          >
            <div className="flex flex-col gap-6">
              {/* Search in Drawer for Mobile */}
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-muted-foreground border-border bg-surface"
                onClick={() => {
                  window.dispatchEvent(new Event("open-command-palette"));
                  setMobileMenuOpen(false);
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Search...
              </Button>

              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-xl font-display font-medium transition-colors hover:text-accent border-b border-border/50 pb-3",
                      pathname === link.href ? "text-accent" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-4 flex flex-col gap-4">
                <Button size="lg" className="w-full" asChild>
                  <a href={chatLink} target={whatsappNumber ? "_blank" : undefined}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat on WhatsApp
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  Download CV
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
