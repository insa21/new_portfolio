"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/layout/command-palette";
import { Button } from "@/components/ui/button";
import { contactApi, settingsApi, ContactSettings, ApiError } from "@/lib/api";
import {
  Send,
  Mail,
  User,
  MessageSquare,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MapPin,
  Clock,
  Sparkles,
  Github,
  Linkedin,
  Instagram,
  ArrowRight,
  Zap,
  Phone
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

const defaultSettings: ContactSettings = {
  email: null,
  whatsapp: null,
  location: null,
  availabilityStatus: 'available',
  availabilityDate: null,
  responseTime: '< 24 jam',
  socialLinks: {
    github: null,
    linkedin: null,
    instagram: null,
  },
};

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [contactSettings, setContactSettings] = useState<ContactSettings>(defaultSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Load contact settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsApi.getContactSettings();
        setContactSettings(response.data || defaultSettings);
      } catch (error) {
        console.error("Failed to load contact settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      await contactApi.submit(formData);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setSubmitStatus("error");
      if (error instanceof ApiError) {
        if (error.statusCode === 429) {
          setErrorMessage("You have sent too many messages. Please try again in 15 minutes.");
        } else {
          setErrorMessage(error.message || "Failed to send message. Please try again.");
        }
      } else {
        setErrorMessage("An error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (submitStatus !== "idle") {
      setSubmitStatus("idle");
    }
  };

  const inputClasses = (fieldName: string, hasError: boolean) =>
    `w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 ${hasError
      ? "border-red-500/50 focus:border-red-500"
      : focusedField === fieldName
        ? "border-accent shadow-[0_0_20px_rgba(0,207,200,0.15)]"
        : "border-white/5 hover:border-white/10"
    } outline-none transition-all duration-300 placeholder:text-muted-foreground/40 text-lg`;

  // Build social links array from settings
  const socialLinks = [
    contactSettings.socialLinks?.github && {
      icon: Github,
      href: contactSettings.socialLinks.github,
      label: "GitHub"
    },
    contactSettings.socialLinks?.linkedin && {
      icon: Linkedin,
      href: contactSettings.socialLinks.linkedin,
      label: "LinkedIn"
    },
    contactSettings.socialLinks?.instagram && {
      icon: Instagram,
      href: contactSettings.socialLinks.instagram,
      label: "Instagram"
    },
  ].filter(Boolean) as { icon: typeof Github; href: string; label: string }[];

  // Get availability status text and color
  const getAvailabilityInfo = () => {
    switch (contactSettings.availabilityStatus) {
      case 'available':
        return {
          text: 'Available for New Projects',
          color: 'green',
          bgClass: 'from-green-500/10 to-emerald-500/10 border-green-500/20',
          textClass: 'text-green-400',
          dotClass: 'bg-green-500'
        };
      case 'limited':
        return {
          text: 'Limited Availability',
          color: 'yellow',
          bgClass: 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20',
          textClass: 'text-yellow-400',
          dotClass: 'bg-yellow-500'
        };
      case 'unavailable':
        return {
          text: 'Currently Unavailable',
          color: 'red',
          bgClass: 'from-red-500/10 to-rose-500/10 border-red-500/20',
          textClass: 'text-red-400',
          dotClass: 'bg-red-500'
        };
      default:
        return {
          text: 'Available for New Projects',
          color: 'green',
          bgClass: 'from-green-500/10 to-emerald-500/10 border-green-500/20',
          textClass: 'text-green-400',
          dotClass: 'bg-green-500'
        };
    }
  };

  const availabilityInfo = getAvailabilityInfo();

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      <CommandPalette />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent/5 to-transparent opacity-50" />
      </div>

      <div className="container mx-auto px-6 py-32 relative">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-accent/20 to-purple-500/20 text-accent text-sm font-semibold mb-8 border border-accent/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Let's Collaborate</span>
            <Zap className="w-4 h-4" />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-display font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text"
          >
            Contact Me
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
          >
            Have an interesting project or want to collaborate?{" "}
            <span className="text-accent">Send me a message</span> and I will
            respond within <span className="text-foreground font-medium">{contactSettings.responseTime || '24 hours'}</span>.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="relative p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-secondary/40 via-secondary/20 to-transparent border border-white/10 backdrop-blur-xl shadow-2xl">
              {/* Decorative corner accent */}
              <div className="absolute -top-px -left-px w-24 h-24 bg-gradient-to-br from-accent/50 to-transparent rounded-tl-[2rem]" />
              <div className="absolute -bottom-px -right-px w-24 h-24 bg-gradient-to-tl from-purple-500/30 to-transparent rounded-br-[2rem]" />

              <AnimatePresence mode="wait">
                {submitStatus === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center py-16 text-center relative z-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-500/20 flex items-center justify-center mb-8 border border-green-400/30"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                      >
                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                      </motion.div>
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-3xl font-bold font-display mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                    >
                      Message Sent!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-muted-foreground max-w-md mb-10 text-lg"
                    >
                      Thank you for reaching out. I will get back to you shortly.
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Button
                        onClick={() => setSubmitStatus("idle")}
                        variant="outline"
                        size="lg"
                        className="group"
                      >
                        Send Another Message
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6 relative z-10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-foreground/80 mb-1">
                          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-accent" />
                          </div>
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="John Doe"
                          className={inputClasses("name", !!errors.name)}
                          data-testid="contact-name"
                        />
                        <AnimatePresence>
                          {errors.name && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="text-sm text-red-400 flex items-center gap-1.5"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.name}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-foreground/80 mb-1">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-purple-400" />
                          </div>
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="john@example.com"
                          className={inputClasses("email", !!errors.email)}
                          data-testid="contact-email"
                        />
                        <AnimatePresence>
                          {errors.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="text-sm text-red-400 flex items-center gap-1.5"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.email}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <label htmlFor="subject" className="flex items-center gap-2 text-sm font-medium text-foreground/80 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-orange-400" />
                        </div>
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("subject")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Regarding new project..."
                        className={inputClasses("subject", !!errors.subject)}
                        data-testid="contact-subject"
                      />
                      <AnimatePresence>
                        {errors.subject && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm text-red-400 flex items-center gap-1.5"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.subject}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label htmlFor="message" className="flex items-center gap-2 text-sm font-medium text-foreground/80 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-blue-400" />
                        </div>
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("message")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Tell me about your project, timeline, and budget..."
                        className={`${inputClasses("message", !!errors.message)} resize-none`}
                        data-testid="contact-message"
                      />
                      <AnimatePresence>
                        {errors.message && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm text-red-400 flex items-center gap-1.5"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {submitStatus === "error" && errorMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="p-5 rounded-2xl bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 text-red-400 flex items-center gap-4"
                        >
                          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <p className="text-sm">{errorMessage}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      variant="glow"
                      className="w-full text-lg py-7 rounded-2xl group"
                      disabled={isSubmitting}
                      data-testid="contact-submit"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Main Info Card */}
            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-accent/10 via-secondary/30 to-purple-500/10 border border-white/10 backdrop-blur-sm">
              <h3 className="text-2xl font-bold font-display mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-accent" />
                Contact Info
              </h3>

              <div className="space-y-5">
                {/* Email */}
                {contactSettings.email && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/30 transition-colors group">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-0.5">Email</p>
                      <a href={`mailto:${contactSettings.email}`} className="font-semibold text-lg hover:text-accent transition-colors">
                        {contactSettings.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {contactSettings.whatsapp && (
                  <a
                    href={`https://wa.me/${contactSettings.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-green-500/30 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-0.5">WhatsApp</p>
                      <p className="font-semibold text-lg">{contactSettings.whatsapp}</p>
                    </div>
                  </a>
                )}

                {/* Location */}
                {contactSettings.location && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors group">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-0.5">Location</p>
                      <p className="font-semibold text-lg">{contactSettings.location}</p>
                    </div>
                  </div>
                )}

                {/* Response Time */}
                {contactSettings.responseTime && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-colors group">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-0.5">Response Time</p>
                      <p className="font-semibold text-lg">{contactSettings.responseTime}</p>
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {isLoadingSettings && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="p-6 rounded-2xl bg-secondary/20 border border-white/5">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Find me on</h4>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent text-muted-foreground hover:text-accent-foreground transition-all duration-300 hover:scale-110"
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tips Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tip for Faster Response</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Include details about your project, timeline, and budget for a faster and more accurate response.
                  </p>
                </div>
              </div>
            </div>

            {/* Availability Status */}
            <div className={`p-6 rounded-2xl bg-gradient-to-r ${availabilityInfo.bgClass}`}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-4 h-4 rounded-full ${availabilityInfo.dotClass} animate-pulse`} />
                  <div className={`absolute inset-0 w-4 h-4 rounded-full ${availabilityInfo.dotClass} animate-ping opacity-50`} />
                </div>
                <div>
                  <p className={`font-semibold ${availabilityInfo.textClass}`}>{availabilityInfo.text}</p>
                  {contactSettings.availabilityDate && (
                    <p className="text-sm text-muted-foreground">Starting from {contactSettings.availabilityDate}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
