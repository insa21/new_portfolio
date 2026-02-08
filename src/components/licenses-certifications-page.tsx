"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  X,
  Award,
  BadgeCheck,
  Building2,
  Hash,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useData } from "@/components/providers/data-provider";
import type { Certification } from "@/types";

// --- Types ---
// Using Certification type from @/types

const FILTERS = ["All", "License", "Certification", "Cloud", "DevOps", "Frontend", "Backend", "AI", "Security", "Management"];

// --- Helper Functions ---

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
};

const isExpired = (expiresAt?: string) => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

const getStatus = (expiresAt?: string): "Active" | "Expired" => {
  return isExpired(expiresAt) ? "Expired" : "Active";
};

// --- Sub-Components ---

function CredentialCard({
  credential,
  onOpenDetail
}: {
  credential: Certification,
  onOpenDetail: (c: Certification) => void
}) {
  const status = getStatus(credential.expiresAt);
  const isActive = status === "Active";

  const copyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (credential.credentialId) {
      navigator.clipboard.writeText(credential.credentialId);
      alert("Credential ID copied!");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex flex-col bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300"
    >
      {/* Status Stripe */}
      <div className={cn("h-1 w-full", isActive ? "bg-accent" : "bg-muted")} />

      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white p-1.5 flex items-center justify-center border border-border shrink-0 overflow-hidden relative">
              {credential.issuerLogo ? (
                <Image
                  src={credential.issuerLogo}
                  alt={credential.issuer}
                  fill
                  className="object-contain p-1"
                />
              ) : (
                <Award className="w-6 h-6 text-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors line-clamp-2">
                {credential.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{credential.issuer}</p>
            </div>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider h-5", isActive ? "border-accent/20 text-accent bg-accent/5" : "border-muted text-muted-foreground")}>
            {isActive ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
            {status}
          </Badge>
          <Badge variant="secondary" className="text-[10px] h-5 bg-secondary/50 text-muted-foreground">{credential.type}</Badge>
        </div>

        {/* Dates & ID */}
        <div className="space-y-2 text-xs text-muted-foreground mb-6">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Issued
            </span>
            <span className="font-mono">{formatDate(credential.issuedAt)}</span>
          </div>
          {credential.expiresAt && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Expires
              </span>
              <span className={cn("font-mono", isActive ? "" : "text-destructive")}>
                {formatDate(credential.expiresAt)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> ID
            </span>
            <button
              onClick={copyId}
              className="flex items-center gap-1 font-mono hover:text-accent transition-colors group/copy"
              title="Copy ID"
            >
              {credential.credentialId ? `${credential.credentialId.slice(0, 12)}...` : 'N/A'}
              <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-auto mb-6 flex flex-wrap gap-1.5">
          {credential.skills.slice(0, 3).map(skill => (
            <span key={skill} className="px-1.5 py-0.5 rounded bg-muted/30 text-[10px] text-muted-foreground border border-border">
              {skill}
            </span>
          ))}
          {credential.skills.length > 3 && (
            <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground">+{credential.skills.length - 3}</span>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => onOpenDetail(credential)}>
            Details
          </Button>
          <Button size="sm" className="w-full text-xs gap-1.5" asChild>
            <a href={credential.credentialUrl} target="_blank" rel="noreferrer">
              Verify <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}


// --- Helper for Preview ---
function CredentialPreview({ credential }: { credential: Certification }) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!credential.previewUrl) return null;

  return (
    <div className="mb-8 rounded-lg overflow-hidden border border-border bg-muted/20 relative min-h-[300px] flex items-center justify-center">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {credential.previewType === "pdf" ? (
        <iframe
          src={`${credential.previewUrl}#view=FitH`}
          className="w-full h-[400px]"
          onLoad={() => setIsLoaded(true)}
          title="Credential PDF Preview"
        />
      ) : (
        <div className="relative w-full h-auto">
          <Image
            src={credential.previewUrl}
            alt="Credential Preview"
            width={800}
            height={600}
            className="w-full h-auto object-contain"
            onLoadingComplete={() => setIsLoaded(true)}
          />
        </div>
      )}
    </div>
  )
}


function CredentialModal({
  credential,
  isOpen,
  onClose
}: {
  credential: Certification | null,
  isOpen: boolean,
  onClose: () => void
}) {
  if (!isOpen || !credential) return null;

  const isActive = !isExpired(credential.expiresAt);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header bg */}
          <div className="h-32 bg-gradient-to-r from-accent/10 to-transparent relative shrink-0">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full bg-background/50 hover:bg-background z-20" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
            <div className="absolute -bottom-8 left-8 w-20 h-20 rounded-xl bg-surface border-4 border-surface shadow-lg flex items-center justify-center overflow-hidden">
              <Award className="w-10 h-10 text-accent" />
            </div>
          </div>

          <div className="px-8 pt-12 pb-8 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-display leading-tight">{credential.title}</h2>
                  <p className="text-muted-foreground mt-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> {credential.issuer}
                  </p>
                </div>
                <Badge variant={isActive ? "default" : "destructive"} className={cn("shrink-0", isActive && "bg-accent text-accent-foreground")}>
                  {isActive ? "Active" : "Expired"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issued Date</label>
                  <p className="font-mono text-foreground mt-1">{formatDate(credential.issuedAt)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expiration Date</label>
                  <p className="font-mono text-foreground mt-1">{credential.expiresAt ? formatDate(credential.expiresAt) : "Does not expire"}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Credential ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded text-xs">{credential.credentialId}</code>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { if (credential.credentialId) { navigator.clipboard.writeText(credential.credentialId); alert("Copied!") } }}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {credential.description || "No description available."}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills Validated</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {credential.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs font-normal bg-secondary/50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section - Lazy Loaded */}
            {credential.previewUrl && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Certificate Preview</label>
                <CredentialPreview credential={credential} />
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t border-border">
              <Button className="flex-1" asChild>
                <a href={credential.credentialUrl} target="_blank" rel="noreferrer">
                  Verify Credential <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              {/* Prioritize PDF Download if explicit URL, else generic download if preview is image */}
              {(credential.pdfUrl || (credential.previewType === "image" && credential.previewUrl)) && (
                <Button variant="outline" className="flex-1" asChild>
                  <a href={credential.pdfUrl || credential.previewUrl} target="_blank" rel="noreferrer" download>
                    Download {credential.previewType === 'pdf' ? 'PDF' : 'Image'} <Download className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// --- Main Page Component ---

export default function LicensesCertificationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get data from DataProvider
  const { certifications: CREDENTIALS_DATA, isLoading: dataLoading } = useData();

  // State
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeFilter, setActiveFilter] = useState(searchParams.get("type") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [activeOnly, setActiveOnly] = useState(searchParams.get("active") === "1");

  const [selectedCredential, setSelectedCredential] = useState<Certification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync URL with Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query); else params.delete("q");
      if (activeFilter && activeFilter !== "All") params.set("type", activeFilter); else params.delete("type");
      if (sort !== "newest") params.set("sort", sort); else params.delete("sort");
      if (activeOnly) params.set("active", "1"); else params.delete("active");

      router.replace(`?${params.toString()}`, { scroll: false });
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeFilter, sort, activeOnly]);

  // Note: Loading handled with inline filtering


  // Filter Logic
  const filteredCredentials = useMemo(() => {
    let result = CREDENTIALS_DATA;

    // Active Only
    if (activeOnly) {
      result = result.filter((c: Certification) => !isExpired(c.expiresAt));
    }

    // Type / Category Filter
    if (activeFilter !== "All") {
      // Check matching Type or Category or Skill (for simpler UX usually mixed in "Filter Chips")
      // Here we treat FILTERS as mixed tags
      result = result.filter((c: Certification) =>
        c.type === activeFilter ||
        c.type.toLowerCase() === activeFilter.toLowerCase() ||
        c.category === activeFilter ||
        c.skills.includes(activeFilter)
      );
    }

    // Search
    if (query) {
      const lowerQ = query.toLowerCase();
      result = result.filter((c: Certification) =>
        c.title.toLowerCase().includes(lowerQ) ||
        c.issuer.toLowerCase().includes(lowerQ) ||
        (c.credentialId?.toLowerCase() || '').includes(lowerQ) ||
        c.skills.some((s: string) => s.toLowerCase().includes(lowerQ))
      );
    }

    // Sort
    if (sort === "newest") {
      result = [...result].sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
    } else if (sort === "issuer") {
      result = [...result].sort((a, b) => a.issuer.localeCompare(b.issuer));
    } else if (sort === "expiring") {
      // Sort by expiration date (asc), putting nulls last or first?
      // "Expiring Soon" usually means active ones close to expire.
      // Let's simplified sort by expiresAt asc, ignoring those without expiry
      result = [...result].sort((a, b) => {
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      });
    }

    return result;
  }, [query, activeFilter, sort, activeOnly, CREDENTIALS_DATA]);

  // Derived Stats
  const totalItems = CREDENTIALS_DATA.length;
  const activeItems = CREDENTIALS_DATA.filter((c: Certification) => !isExpired(c.expiresAt)).length;
  const featuredItems = filteredCredentials.filter((c: Certification) => c.featured);
  const displayedItems = filteredCredentials;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Header Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="max-w-3xl">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-6 border border-accent/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Credentials</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tight">
                  Licenses & <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/50">Certifications</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  Professional qualifications demonstrating expertise in Cloud Architecture, DevOps Engineering, and Fullstack Development.
                </p>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-px bg-border/50 rounded-2xl overflow-hidden border border-border/50 shadow-lg"
            >
              <div className="bg-surface/40 backdrop-blur-md px-8 py-5 text-center min-w-[100px] hover:bg-surface/60 transition-colors">
                <div className="text-3xl font-bold font-display text-foreground">{totalItems}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Total</div>
              </div>
              <div className="bg-surface/40 backdrop-blur-md px-8 py-5 text-center min-w-[100px] hover:bg-surface/60 transition-colors">
                <div className="text-3xl font-bold font-display text-accent">{activeItems}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Active</div>
              </div>
            </motion.div>
          </div>
        </div>


        {/* Decorative Gradient Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent blur-[1px]" />
      </section >

      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-12">

        {/* 2. Controls */}
        <div className="sticky top-20 z-30 bg-background/95 backdrop-blur py-4 mb-8 space-y-4 border-b border-border/50">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                placeholder="Search credentials, ID, or issuer..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-surface rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground/60 text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Sort */}
              <div className="relative">
                <select
                  className="h-10 pl-3 pr-8 appearance-none bg-surface border border-border rounded-lg text-sm focus:border-accent outline-none cursor-pointer hover:bg-muted/50 transition-colors"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest Issued</option>
                  <option value="issuer">Issuer (A-Z)</option>
                  <option value="expiring">Expiring Soon</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Toggle Active */}
              <button
                onClick={() => setActiveOnly(!activeOnly)}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all", activeOnly ? "bg-accent/10 border-accent text-accent" : "bg-surface border-border hover:bg-muted/50")}
              >
                <ShieldCheck className="w-4 h-4" />
                Active Only
              </button>
            </div>
          </div>

          {/* Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mask-fade-right">
            {FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all duration-200",
                  activeFilter === filter
                    ? "bg-foreground text-background border-foreground font-bold"
                    : "bg-surface text-muted-foreground border-border hover:border-accent/50 hover:text-foreground"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Featured Highlights (if any and on page 1/no filter) */}
        {!query && activeFilter === "All" && featuredItems.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <BadgeCheck className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold font-display">Featured Credentials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map(item => (
                <CredentialCard
                  key={item.id}
                  credential={item}
                  onOpenDetail={(c) => { setSelectedCredential(c); setIsModalOpen(true); }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. Main Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold font-display mb-6">All Credentials ({displayedItems.length})</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 rounded-xl bg-muted/20 animate-pulse" />)}
            </div>
          ) : displayedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedItems.map(item => (
                <CredentialCard
                  key={item.id}
                  credential={item}
                  onOpenDetail={(c) => { setSelectedCredential(c); setIsModalOpen(true); }}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-border rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No credentials found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setActiveFilter("All");
                  setActiveOnly(false);
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-20 p-8 rounded-2xl bg-secondary/10 border border-white/5 text-center">
          <h3 className="text-2xl font-bold font-display mb-4">Want to see these skills in action?</h3>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Check out my projects portfolio to see how I apply these certifications to solve real-world problems.
          </p>
          <Button size="lg" asChild>
            <Link href="/projects">View Projects</Link>
          </Button>
        </div>

      </div>

      {/* Modal */}
      <CredentialModal
        credential={selectedCredential}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div >
  );
}
