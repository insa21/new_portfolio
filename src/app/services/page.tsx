"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/layout/command-palette";
import { useServicesData } from "@/components/providers/data-provider";
import { StartProjectModal } from "@/components/start-project-modal";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ServicesPage() {
  const { services, isLoading } = useServicesData();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  const handleStart = (serviceName: string = "") => {
    setSelectedService(serviceName);
    setModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <CommandPalette />

      <div className="container mx-auto px-6 py-32">
        <div className="max-w-2xl mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Services</h1>
          <p className="text-xl text-muted-foreground">
            Premium development services tailored for ambitious brands and startups.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No services available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id || service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                data-testid={`service-card-${index}`}
                className="flex flex-col p-8 rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md hover:border-accent/30 transition-all group"
              >
                <h3 className="text-2xl font-bold font-display mb-4 text-foreground group-hover:text-accent transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-6 flex-1">
                  {service.description}
                </p>

                {service.deliverables && service.deliverables.length > 0 && (
                  <div className="mb-8">
                    <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">Deliverables</div>
                    <ul className="space-y-2">
                      {service.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start text-sm text-foreground/80">
                          <CheckCircle2 className="w-4 h-4 mr-2 text-accent mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button onClick={() => handleStart(service.title)} className="w-full group-hover:bg-accent group-hover:text-accent-foreground">
                  Inquire Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-24 p-12 rounded-3xl bg-gradient-to-r from-secondary/50 to-transparent border border-white/5 text-center">
          <h2 className="text-3xl font-bold font-display mb-6">Not sure what you need?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Let&apos;s schedule a quick discovery call to discuss your goals and how I can help.
          </p>
          <Button size="lg" variant="outline" onClick={() => handleStart("Consultation")}>
            Book a Free Consultation
          </Button>
        </div>
      </div>

      <Footer />
      <StartProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultService={selectedService}
      />
    </main>
  );
}
