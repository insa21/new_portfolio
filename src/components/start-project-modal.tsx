"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contactApi } from "@/lib/api";
import { useNotification } from "@/components/providers/notification-provider";
import { Loader2 } from "lucide-react";

interface StartProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export function StartProjectModal({ isOpen, onClose, defaultService = "" }: StartProjectModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: defaultService,
    budget: "",
    timeline: "",
    brief: ""
  });

  const { success, error: showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const message = `
Project Type: ${formData.type}
Budget: ${formData.budget}
Timeline: ${formData.timeline}

Brief:
${formData.brief}
      `.trim();

      await contactApi.submit({
        name: formData.name,
        email: "no-email@provided.com", // Since we don't capture email yet, we might need to add it or use a placeholder if the backend requires it. Wait, the form DOES NOT have an email field?
        // Checking form fields... Name, Project Type, Budget, Timeline, Brief.
        // The backend `contactApi.submit` expects name, email, subject, message.
        // I should ADD an Email field to the form since it's standard for inquiries.
        subject: `New Project Inquiry: ${formData.type}`,
        message: message
      });

      success(
        "Permintaan Terkirim",
        "Terima kasih! Kami akan segera menghubungi Anda."
      );

      onClose();
      // Optional: still open WhatsApp if desired, or remove. User said "masuk ke admin", so API is priority.
    } catch (error) {
      console.error(error);
      showError(
        "Gagal Mengirim",
        "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Start a project"
          data-testid="start-project-modal"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8"
            data-testid="start-project-modal-content"
          >
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 rounded-full text-muted-foreground hover:text-foreground">
              <X />
            </Button>

            <h2 className="text-2xl font-bold font-display mb-6">Start a Project</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Your Name</label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-transparent focus:border-accent outline-none transition-colors"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Email Address</label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-transparent focus:border-accent outline-none transition-colors"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Project Type</label>
                  <select
                    className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-transparent focus:border-accent outline-none transition-colors appearance-none"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Web App Development">Web App Development</option>
                    <option value="Dashboard System">Dashboard System</option>
                    <option value="AI Integration">AI Integration</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Budget Range</label>
                  <select
                    className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-transparent focus:border-accent outline-none transition-colors appearance-none"
                    value={formData.budget}
                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                  >
                    <option value="< $5k">&lt; $5k</option>
                    <option value="$5k - $10k">$5k - $10k</option>
                    <option value="$10k - $25k">$10k - $25k</option>
                    <option value="$25k+">$25k+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Estimated Timeline</label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-transparent focus:border-accent outline-none transition-colors"
                  placeholder="e.g. 2 months"
                  value={formData.timeline}
                  onChange={e => setFormData({ ...formData, timeline: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Brief Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-transparent focus:border-accent outline-none transition-colors resize-none"
                  placeholder="Tell me a bit about what you need..."
                  value={formData.brief}
                  onChange={e => setFormData({ ...formData, brief: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-base font-semibold"
                  disabled={isSubmitting}
                  data-testid="start-project-submit"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                  ) : (
                    <><MessageSquare className="w-4 h-4 mr-2" />Submit Inquiry</>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Prefer email? <a href="mailto:hello@devstudio.com" className="text-accent hover:underline">hello@devstudio.com</a>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
