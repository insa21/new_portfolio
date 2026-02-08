"use client";

import { memo } from "react";
import { Certification } from "@/data/certifications";
import { BadgeCheck, Calendar, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CertificationCardProps {
  certification: Certification;
  index: number;
}

function CertificationCardComponent({ certification, index }: CertificationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative flex flex-col p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/10 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
        <BadgeCheck className="w-12 h-12 text-white/5 group-hover:text-accent/20 transition-colors" />
      </div>

      <div className="mb-4">
        <div className="text-xs text-accent font-medium mb-2 uppercase tracking-wider flex items-center gap-2">
          {certification.issuer}
        </div>
        <h3 className="text-xl font-bold font-display leading-tight group-hover:text-accent transition-colors">
          {certification.title}
        </h3>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Calendar className="w-4 h-4" />
        <span>Issued {certification.date}</span>
        {certification.credentialId && (
          <>
            <span>•</span>
            <span className="font-mono text-xs">ID: {certification.credentialId}</span>
          </>
        )}
      </div>

      <div className="mt-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          {certification.skills.map(skill => (
            <span key={skill} className="px-2 py-1 text-xs rounded-md bg-white/5 border border-white/5 text-muted-foreground/80">
              {skill}
            </span>
          ))}
        </div>

        {certification.url && (
          <Button variant="outline" size="sm" className="w-full justify-between group/btn bg-transparent border-white/10 hover:bg-white/10 text-foreground" asChild>
            <a href={certification.url} target="_blank" rel="noreferrer">
              Verify Credential
              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover/btn:text-accent transition-colors" />
            </a>
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Memoized CertificationCard component to prevent unnecessary re-renders in list views.
 * Only re-renders when certification data or index changes.
 */
export const CertificationCard = memo(CertificationCardComponent);
