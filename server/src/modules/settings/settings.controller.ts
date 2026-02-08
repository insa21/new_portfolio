import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database.js';
import { sendSuccess } from '../../utils/response.js';
import { AuthRequest } from '../../middlewares/auth.js';
import { z } from 'zod';

const updateSettingSchema = z.object({
  value: z.any(),
});

// Contact settings schema
const contactSettingsSchema = z.object({
  email: z.string().email().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  availabilityStatus: z.string().optional().nullable(),
  availabilityDate: z.string().optional().nullable(),
  responseTime: z.string().optional().nullable(),
  socialLinks: z.object({
    github: z.string().optional().nullable().or(z.literal('')),
    linkedin: z.string().optional().nullable().or(z.literal('')),
    instagram: z.string().optional().nullable().or(z.literal('')),
  }).optional(),
});

type ContactSettings = z.infer<typeof contactSettingsSchema>;

const CONTACT_SETTINGS_KEY = 'contact_settings';

const defaultContactSettings: ContactSettings = {
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

// ==================== BRANDING SETTINGS ====================

// Branding settings schema
const brandingSettingsSchema = z.object({
  // Site name fallback
  siteName: z.string().optional().nullable(),

  // Main logo (light mode)
  logoUrl: z.string().optional().nullable(),
  logoPublicId: z.string().optional().nullable(),
  logoAltText: z.string().optional().nullable(),
  logoWidth: z.number().optional().nullable(),
  logoHeight: z.number().optional().nullable(),

  // Dark mode logo (optional)
  darkLogoUrl: z.string().optional().nullable(),
  darkLogoPublicId: z.string().optional().nullable(),

  // Favicon (optional)
  faviconUrl: z.string().optional().nullable(),
  faviconPublicId: z.string().optional().nullable(),

  // Responsive sizing
  desktopLogoHeight: z.number().optional().nullable(),
  mobileLogoHeight: z.number().optional().nullable(),

  updatedAt: z.string().optional().nullable(),
});

type BrandingSettings = z.infer<typeof brandingSettingsSchema>;

const BRANDING_SETTINGS_KEY = 'branding_settings';

const defaultBrandingSettings: BrandingSettings = {
  siteName: 'Insacode',
  logoUrl: null,
  logoPublicId: null,
  logoAltText: 'Site Logo',
  logoWidth: null,
  logoHeight: null,
  darkLogoUrl: null,
  darkLogoPublicId: null,
  faviconUrl: null,
  faviconPublicId: null,
  desktopLogoHeight: 40,
  mobileLogoHeight: 32,
  updatedAt: null,
};

// ==================== FOOTER SETTINGS ====================

// Footer settings schema
const footerSettingsSchema = z.object({
  // Logo settings
  logoUrl: z.string().optional().nullable(),
  logoPublicId: z.string().optional().nullable(),
  logoAltText: z.string().optional().nullable(),
  showLogo: z.boolean().optional(),

  // Dark Mode Logo settings
  logoDarkUrl: z.string().optional().nullable(),
  logoDarkPublicId: z.string().optional().nullable(),

  // Site name displayed in footer
  siteName: z.string().optional().nullable(),

  // Description tagline
  description: z.string().optional().nullable(),

  // Copyright text (supports {year} placeholder)
  copyright: z.string().optional().nullable(),

  // Sitemap links
  sitemapLinks: z.array(z.object({
    id: z.string(),
    label: z.string(),
    href: z.string(),
    order: z.number().optional(),
  })).optional(),

  // Show sitemap section
  showSitemap: z.boolean().optional(),

  // Show connect section (social links from contact settings)
  showConnect: z.boolean().optional(),
});

type FooterSettings = z.infer<typeof footerSettingsSchema>;

const FOOTER_SETTINGS_KEY = 'footer_settings';

const defaultFooterSettings: FooterSettings = {
  logoUrl: null,
  logoPublicId: null,
  logoAltText: 'Site Logo',
  showLogo: false,
  logoDarkUrl: null,
  logoDarkPublicId: null,
  siteName: 'Indra Saepudin',
  description: 'Building scalable web products and AI-powered automation for real-world impact.',
  copyright: '© {year} Indra Saepudin. All rights reserved.',
  sitemapLinks: [
    { id: '1', label: 'Projects', href: '/projects', order: 1 },
    { id: '2', label: 'Blog', href: '/blog', order: 2 },
    { id: '3', label: 'Services', href: '/services', order: 3 },
    { id: '4', label: 'About', href: '/about', order: 4 },
    { id: '5', label: 'Contact', href: '/contact', order: 5 },
  ],
  showSitemap: true,
  showConnect: true,
};


export class SettingsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await prisma.setting.findMany();

      // Convert to object
      const settingsObject: Record<string, unknown> = {};
      settings.forEach((s) => {
        settingsObject[s.key] = s.value;
      });

      sendSuccess(res, settingsObject);
    } catch (error) {
      next(error);
    }
  }

  async findByKey(req: Request, res: Response, next: NextFunction) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: req.params.key as string },
      });

      if (!setting) {
        res.status(404).json({ success: false, message: 'Setting tidak ditemukan.' });
        return;
      }

      sendSuccess(res, setting.value);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = updateSettingSchema.parse(req.body);

      const key = req.params.key as string;
      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value: parsed.value },
        create: { key, value: parsed.value },
      });

      sendSuccess(res, setting, 'Setting berhasil diperbarui.');
    } catch (error) {
      next(error);
    }
  }

  // GET contact settings (public)
  async getContactSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: CONTACT_SETTINGS_KEY },
      });

      if (!setting) {
        sendSuccess(res, defaultContactSettings, 'Contact settings retrieved');
        return;
      }

      const settings = {
        ...defaultContactSettings,
        ...(setting.value as ContactSettings),
      };

      sendSuccess(res, settings, 'Contact settings retrieved');
    } catch (error) {
      next(error);
    }
  }

  // PUT contact settings (admin only)
  async updateContactSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parseResult = contactSettingsSchema.safeParse(req.body);

      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          message: 'Data settings tidak valid',
          errors: parseResult.error.errors
        });
        return;
      }

      const setting = await prisma.setting.upsert({
        where: { key: CONTACT_SETTINGS_KEY },
        update: { value: parseResult.data },
        create: {
          key: CONTACT_SETTINGS_KEY,
          value: parseResult.data,
        },
      });

      sendSuccess(res, setting.value, 'Contact settings berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  // ==================== HOME SETTINGS ====================

  // GET home settings (public)
  async getHomeSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: HOME_SETTINGS_KEY },
      });

      if (!setting) {
        sendSuccess(res, defaultHomeSettings, 'Home settings retrieved');
        return;
      }

      const settings = {
        ...defaultHomeSettings,
        ...(setting.value as HomeSettings),
      };

      sendSuccess(res, settings, 'Home settings retrieved');
    } catch (error) {
      next(error);
    }
  }

  // PUT home settings (admin only)
  async updateHomeSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parseResult = homeSettingsSchema.safeParse(req.body);

      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          message: 'Data settings tidak valid',
          errors: parseResult.error.errors
        });
        return;
      }

      const setting = await prisma.setting.upsert({
        where: { key: HOME_SETTINGS_KEY },
        update: { value: parseResult.data },
        create: {
          key: HOME_SETTINGS_KEY,
          value: parseResult.data,
        },
      });

      sendSuccess(res, setting.value, 'Home settings berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  // ==================== ABOUT SETTINGS ====================

  // GET about settings (public)
  async getAboutSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: ABOUT_SETTINGS_KEY },
      });

      if (!setting) {
        sendSuccess(res, defaultAboutSettings, 'About settings retrieved');
        return;
      }

      const settings = {
        ...defaultAboutSettings,
        ...(setting.value as AboutSettings),
      };

      sendSuccess(res, settings, 'About settings retrieved');
    } catch (error) {
      next(error);
    }
  }

  // PUT about settings (admin only)
  async updateAboutSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parseResult = aboutSettingsSchema.safeParse(req.body);

      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          message: 'Data settings tidak valid',
          errors: parseResult.error.errors
        });
        return;
      }

      const setting = await prisma.setting.upsert({
        where: { key: ABOUT_SETTINGS_KEY },
        update: { value: parseResult.data },
        create: {
          key: ABOUT_SETTINGS_KEY,
          value: parseResult.data,
        },
      });

      sendSuccess(res, setting.value, 'About settings berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  // ==================== BRANDING SETTINGS ====================

  // GET branding settings (public)
  async getBrandingSettings(req: Request, res: Response, next: NextFunction) {
    try {
      // Disable caching for branding settings to ensure fresh data
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const setting = await prisma.setting.findUnique({
        where: { key: BRANDING_SETTINGS_KEY },
      });

      if (!setting) {
        sendSuccess(res, defaultBrandingSettings, 'Branding settings retrieved');
        return;
      }

      const settings = {
        ...defaultBrandingSettings,
        ...(setting.value as BrandingSettings),
      };

      sendSuccess(res, settings, 'Branding settings retrieved');
    } catch (error) {
      next(error);
    }
  }

  // PUT branding settings (admin only)
  async updateBrandingSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parseResult = brandingSettingsSchema.safeParse(req.body);

      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          message: 'Data settings tidak valid',
          errors: parseResult.error.errors
        });
        return;
      }

      // Add updatedAt timestamp
      const dataToSave = {
        ...parseResult.data,
        updatedAt: new Date().toISOString(),
      };

      const setting = await prisma.setting.upsert({
        where: { key: BRANDING_SETTINGS_KEY },
        update: { value: dataToSave },
        create: {
          key: BRANDING_SETTINGS_KEY,
          value: dataToSave,
        },
      });

      sendSuccess(res, setting.value, 'Branding settings berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  // ==================== FOOTER SETTINGS ====================

  // GET footer settings (public)
  async getFooterSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: FOOTER_SETTINGS_KEY },
      });

      if (!setting) {
        sendSuccess(res, defaultFooterSettings, 'Footer settings retrieved');
        return;
      }

      const settings = {
        ...defaultFooterSettings,
        ...(setting.value as FooterSettings),
      };

      sendSuccess(res, settings, 'Footer settings retrieved');
    } catch (error) {
      next(error);
    }
  }

  // PUT footer settings (admin only)
  async updateFooterSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parseResult = footerSettingsSchema.safeParse(req.body);

      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          message: 'Data settings tidak valid',
          errors: parseResult.error.errors
        });
        return;
      }

      const setting = await prisma.setting.upsert({
        where: { key: FOOTER_SETTINGS_KEY },
        update: { value: parseResult.data },
        create: {
          key: FOOTER_SETTINGS_KEY,
          value: parseResult.data,
        },
      });

      sendSuccess(res, setting.value, 'Footer settings berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }
}

// Home settings schema
const homeSettingsSchema = z.object({
  // Hero Section
  hero: z.object({
    title: z.string().optional().nullable(),
    subtitle: z.string().optional().nullable(),
    badge: z.object({
      enabled: z.boolean().optional(),
      text: z.string().optional().nullable(),
    }).optional(),
    ctaButtons: z.array(z.object({
      label: z.string(),
      href: z.string(),
      variant: z.enum(['primary', 'secondary', 'outline']).optional(),
    })).optional(),
  }).optional(),

  // Stats/Metrics
  stats: z.array(z.object({
    id: z.string().optional(),
    value: z.string(),
    label: z.string(),
    icon: z.string().optional().nullable(),
    mode: z.enum(['auto', 'manual']).optional(),
    autoSource: z.enum(['projects', 'posts', 'experiments']).optional().nullable(),
  })).optional(),

  // Tech Stack
  techStack: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    icon: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    orderIndex: z.number().optional().nullable(),
  })).optional(),

  // Featured Highlights
  featuredHighlights: z.object({
    enabled: z.boolean().optional(),
    items: z.array(z.object({
      id: z.string(),
      type: z.enum(['project', 'post']),
    })).optional(),
  }).optional(),

  // SEO Settings
  seo: z.object({
    metaTitle: z.string().optional().nullable(),
    metaDescription: z.string().optional().nullable(),
    ogImage: z.string().optional().nullable(),
    keywords: z.string().optional().nullable(),
  }).optional(),
});

type HomeSettings = z.infer<typeof homeSettingsSchema>;

const HOME_SETTINGS_KEY = 'home_settings';

const defaultHomeSettings: HomeSettings = {
  hero: {
    title: 'Fullstack Engineer & AI Developer',
    subtitle: 'Building scalable web products and AI-powered automation for real-world impact.',
    badge: {
      enabled: true,
      text: 'Available for Freelance',
    },
    ctaButtons: [
      { label: 'View Projects', href: '/projects', variant: 'primary' },
      { label: 'Contact Me', href: '/contact', variant: 'secondary' },
    ],
  },
  stats: [
    { id: '1', value: '10+', label: 'Projects Completed', icon: 'folder' },
    { id: '2', value: '3+', label: 'Years Experience', icon: 'clock' },
    { id: '3', value: '100%', label: 'Project Completion', icon: 'check' },
  ],
  techStack: [
    // Frontend
    { id: '1', name: 'React', icon: 'react', category: 'Frontend' },
    { id: '2', name: 'Next.js', icon: 'nextjs', category: 'Frontend' },
    { id: '3', name: 'TypeScript', icon: 'typescript', category: 'Frontend' },
    { id: '4', name: 'Tailwind CSS', icon: 'tailwindcss', category: 'Frontend' },
    { id: '5', name: 'Framer Motion', icon: 'framer', category: 'Frontend' },
    { id: '6', name: 'Redux', icon: 'redux', category: 'Frontend' },
    // Backend
    { id: '7', name: 'Node.js', icon: 'nodejs', category: 'Backend' },
    { id: '8', name: 'Express', icon: 'express', category: 'Backend' },
    { id: '9', name: 'NestJS', icon: 'nestjs', category: 'Backend' },
    { id: '10', name: 'Python', icon: 'python', category: 'Backend' },
    { id: '11', name: 'FastAPI', icon: 'fastapi', category: 'Backend' },
    { id: '12', name: 'GraphQL', icon: 'graphql', category: 'Backend' },
    // Database
    { id: '13', name: 'PostgreSQL', icon: 'postgresql', category: 'Database' },
    { id: '14', name: 'MongoDB', icon: 'mongodb', category: 'Database' },
    { id: '15', name: 'Redis', icon: 'redis', category: 'Database' },
    { id: '16', name: 'Prisma', icon: 'prisma', category: 'Database' },
    { id: '17', name: 'Supabase', icon: 'supabase', category: 'Database' },
    { id: '18', name: 'Firebase', icon: 'firebase', category: 'Database' },
    // DevOps & Tools
    { id: '19', name: 'Docker', icon: 'docker', category: 'DevOps' },
    { id: '20', name: 'Git', icon: 'git', category: 'DevOps' },
    { id: '21', name: 'GitHub', icon: 'github', category: 'DevOps' },
    { id: '22', name: 'Vercel', icon: 'vercel', category: 'DevOps' },
    { id: '23', name: 'AWS', icon: 'aws', category: 'DevOps' },
    { id: '24', name: 'Linux', icon: 'linux', category: 'DevOps' },
    // AI & Machine Learning
    { id: '25', name: 'OpenAI', icon: 'openai', category: 'AI/ML' },
    { id: '26', name: 'TensorFlow', icon: 'tensorflow', category: 'AI/ML' },
    { id: '27', name: 'PyTorch', icon: 'pytorch', category: 'AI/ML' },
  ],
  featuredHighlights: {
    enabled: false,
    items: [],
  },
  seo: {
    metaTitle: 'Indra Saepudin - Fullstack Engineer & AI Developer',
    metaDescription: 'Building scalable web products and AI-powered automation for real-world impact.',
    ogImage: null,
    keywords: 'fullstack, web developer, AI, machine learning, react, nextjs',
  },
};

// ==================== ABOUT SETTINGS ====================

// About settings schema
const aboutSettingsSchema = z.object({
  // Headline with highlight support
  headline: z.object({
    text: z.string().optional().nullable(),
    highlightText: z.string().optional().nullable(),
  }).optional(),

  // Bio paragraphs (array-based for add/remove/reorder)
  paragraphs: z.array(z.object({
    id: z.string(),
    content: z.string(),
    order: z.number().optional(),
  })).optional(),

  // Technical toolkit (chips)
  toolkit: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string().optional().nullable(),
    order: z.number().optional(),
  })).optional(),

  // Resume button settings
  resume: z.object({
    enabled: z.boolean().optional(),
    label: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
    publicId: z.string().optional().nullable(),
    resourceType: z.string().optional().nullable(),
    format: z.string().optional().nullable(),
    downloadName: z.string().optional().nullable(),
  }).optional(),

  // Media settings (profile image)
  media: z.object({
    type: z.enum(['image', 'video']).optional(),
    imageUrl: z.string().optional().nullable(),
    imagePublicId: z.string().optional().nullable(),
    imageAlt: z.string().optional().nullable(),
    showPlaceholder: z.boolean().optional(),
    enabled: z.boolean().optional(),
  }).optional(),

  // SEO Settings
  seo: z.object({
    metaTitle: z.string().optional().nullable(),
    metaDescription: z.string().optional().nullable(),
  }).optional(),
});

type AboutSettings = z.infer<typeof aboutSettingsSchema>;

const ABOUT_SETTINGS_KEY = 'about_settings';

const defaultAboutSettings: AboutSettings = {
  headline: {
    text: 'Engineering the future of',
    highlightText: 'web & AI.',
  },
  paragraphs: [
    { id: '1', content: "I'm a Fullstack Engineer with a deep specialization in Artificial Intelligence. My passion lies in bridging the gap between cutting-edge research and production-ready applications.", order: 1 },
    { id: '2', content: "With over 5 years of experience, I've worked with startups and enterprises to build scalable systems, integrating LLMs into existing workflows to drive efficiency and innovation.", order: 2 },
    { id: '3', content: "When I'm not coding, I'm exploring new model architectures, contributing to open source, or designing 3D interactive experiences.", order: 3 },
  ],
  toolkit: [
    { id: '1', name: 'Next.js', category: 'Frontend', order: 1 },
    { id: '2', name: 'React', category: 'Frontend', order: 2 },
    { id: '3', name: 'TypeScript', category: 'Language', order: 3 },
    { id: '4', name: 'Node.js', category: 'Backend', order: 4 },
    { id: '5', name: 'Python', category: 'Language', order: 5 },
    { id: '6', name: 'PyTorch', category: 'AI/ML', order: 6 },
    { id: '7', name: 'LangChain', category: 'AI/ML', order: 7 },
    { id: '8', name: 'OpenAI', category: 'AI/ML', order: 8 },
    { id: '9', name: 'PostgreSQL', category: 'Database', order: 9 },
    { id: '10', name: 'Tailwind CSS', category: 'Frontend', order: 10 },
    { id: '11', name: 'Three.js', category: 'Frontend', order: 11 },
    { id: '12', name: 'Docker', category: 'DevOps', order: 12 },
    { id: '13', name: 'AWS', category: 'DevOps', order: 13 },
  ],
  resume: {
    enabled: true,
    label: 'Download Resume',
    url: null,
    publicId: null,
    resourceType: null,
    format: null,
    downloadName: 'resume',
  },
  media: {
    type: 'image',
    imageUrl: null,
    imagePublicId: null,
    imageAlt: 'Profile',
    showPlaceholder: true,
    enabled: true,
  },
  seo: {
    metaTitle: 'About | Fullstack Engineer & AI Developer',
    metaDescription: 'My background, experience, and technical approach.',
  },
};

export const settingsController = new SettingsController();
