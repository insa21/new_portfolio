import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/layout/command-palette";
import LicensesCertificationsPageContent from "@/components/licenses-certifications-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Licenses & Certifications | Verified Credentials",
  description: "Explore verified licenses, certifications, and professional qualifications in Cloud Computing, AI, and Software Engineering.",
};

export default function CertificationsPage() {
  return (
    <main>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen pt-32 pb-20 px-6 text-center">Loading certifications...</div>}>
        <LicensesCertificationsPageContent />
      </Suspense>
      <Footer />
      <CommandPalette />
    </main>
  );
}
