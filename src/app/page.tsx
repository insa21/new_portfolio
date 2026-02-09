import { Hero } from "@/components/home/hero";
import { TechStack } from "@/components/home/tech-stack";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { AboutPreview } from "@/components/home/about-preview";
import { ServicesPreview } from "@/components/home/services-preview";
import { ContactCTA } from "@/components/home/contact-cta";
import { HomeBackground } from "@/components/home/home-background";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Premium Tech Background - Only for Home page */}
      <HomeBackground />

      {/* Content Layer */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <AboutPreview />
          <ServicesPreview />
          <FeaturedProjects />
          <TechStack />
          <ContactCTA />
        </main>
        {/* Remove default footer margin on home page */}
        <div className="[&>footer]:mt-0">
          <Footer />
        </div>
      </div>
    </div>
  );
}
