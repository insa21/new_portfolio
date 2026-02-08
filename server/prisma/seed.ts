import { PrismaClient, UserRole, ProjectStatus, CredentialType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@portfolio.com' },
    update: {},
    create: {
      email: 'admin@portfolio.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create blog categories
  const categories = await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: 'ai-engineering' },
      update: {},
      create: { name: 'AI Engineering', slug: 'ai-engineering' },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'frontend' },
      update: {},
      create: { name: 'Frontend', slug: 'frontend' },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'backend' },
      update: {},
      create: { name: 'Backend', slug: 'backend' },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'system-design' },
      update: {},
      create: { name: 'System Design', slug: 'system-design' },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'career' },
      update: {},
      create: { name: 'Career', slug: 'career' },
    }),
  ]);
  console.log('✅ Blog categories created:', categories.length);

  // Create sample projects
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { slug: 'nexfinance-ai' },
      update: {},
      create: {
        title: 'NexFinance AI',
        slug: 'nexfinance-ai',
        tagline: 'Intelligent financial forecasting platform for SMEs.',
        description: 'A comprehensive financial dashboard that uses predictive AI to forecast cash flow and identify spending anomalies. Built for small to medium enterprises to replace complex spreadsheets.',
        type: 'Web App',
        featured: true,
        status: ProjectStatus.LIVE,
        year: '2024',
        stack: ['Next.js', 'Python', 'TensorFlow', 'PostgreSQL'],
        thumbnailUrl: '/placeholders/project-1.svg',
        previewType: 'image',
        liveUrl: 'https://example.com',
        repoUrl: 'https://github.com/example',
        stars: 124,
        views: 4500,
        highlights: [
          'Reduced forecasting error by 45% using a custom LSTM model.',
          'Processed over $50M in dummy transaction data securely.',
          'Real-time visualization with D3.js and Recharts.',
        ],
        challenges: 'Handling large datasets in real-time on the client-side without compromising performance.',
        results: 'Onboarded 50+ beta users in the first month with a 90% retention rate.',
        publishedAt: new Date(),
        tags: {
          create: [
            { tag: 'AI' },
            { tag: 'Fintech' },
            { tag: 'Dashboard' },
          ],
        },
      },
    }),
    prisma.project.upsert({
      where: { slug: 'vocalize' },
      update: {},
      create: {
        title: 'Vocalize',
        slug: 'vocalize',
        tagline: 'Real-time speech-to-text translation for conferences.',
        description: 'Break down language barriers in live events with instant, accurate subtitles projected on user devices.',
        type: 'Mobile',
        featured: true,
        status: ProjectStatus.IN_PROGRESS,
        year: '2023',
        stack: ['React Native', 'WebSockets', 'Node.js', 'OpenAI Whisper'],
        thumbnailUrl: '/placeholders/project-2.svg',
        previewType: 'image',
        repoUrl: 'https://github.com/example',
        stars: 89,
        highlights: [
          'Sub-200ms latency for speech transcription.',
          'Support for 12 major languages including dialects.',
          'Offline mode support for basic transcription.',
        ],
        tags: {
          create: [
            { tag: 'Mobile' },
            { tag: 'AI' },
            { tag: 'Real-time' },
          ],
        },
      },
    }),
    prisma.project.upsert({
      where: { slug: 'devui-kit' },
      update: {},
      create: {
        title: 'DevUI Kit',
        slug: 'devui-kit',
        tagline: 'A modern, accessible UI component library for React.',
        description: 'Opinionated yet flexible component library built on top of Radix UI and Tailwind CSS.',
        type: 'Open Source',
        featured: false,
        status: ProjectStatus.LIVE,
        year: '2023',
        stack: ['React', 'TypeScript', 'Tailwind', 'Storybook'],
        thumbnailUrl: '/placeholders/project-3.svg',
        previewType: 'image',
        liveUrl: 'https://example.com',
        repoUrl: 'https://github.com/example',
        stars: 340,
        views: 890,
        highlights: ['Used by 200+ developers.', '100% test coverage with Vitest.'],
        tags: {
          create: [
            { tag: 'UI/UX' },
            { tag: 'Library' },
            { tag: 'Design System' },
          ],
        },
      },
    }),
    prisma.project.upsert({
      where: { slug: 'ecotrack' },
      update: {},
      create: {
        title: 'EcoTrack',
        slug: 'ecotrack',
        tagline: 'Carbon footprint tracking for remote teams.',
        description: 'Helps distributed companies measure and offset their environmental impact.',
        type: 'Web App',
        featured: false,
        status: ProjectStatus.ARCHIVED,
        year: '2022',
        stack: ['Vue.js', 'Firebase', 'Google Maps API'],
        thumbnailUrl: '/placeholders/project-4.svg',
        previewType: 'image',
        repoUrl: 'https://github.com/example',
        views: 1200,
        highlights: ['Winner of GreenTech Hackathon 2022.'],
        tags: {
          create: [
            { tag: 'Sustainability' },
            { tag: 'Tool' },
          ],
        },
      },
    }),
    prisma.project.upsert({
      where: { slug: 'astro-blog' },
      update: {},
      create: {
        title: 'AstroBlog',
        slug: 'astro-blog',
        tagline: 'Ultra-fast static blog template.',
        description: 'Showcasing the power of Islands Architecture.',
        type: 'Open Source',
        featured: false,
        status: ProjectStatus.LIVE,
        year: '2024',
        stack: ['Astro', 'Preact', 'Markdown'],
        thumbnailUrl: '/placeholders/project-5.svg',
        previewType: 'image',
        liveUrl: 'https://example.com',
        repoUrl: 'https://github.com/example',
        stars: 56,
        highlights: ['Lighthouse score of 100/100 across all metrics.'],
        tags: {
          create: [
            { tag: 'Performance' },
            { tag: 'SSG' },
          ],
        },
      },
    }),
    prisma.project.upsert({
      where: { slug: 'taskflow-cli' },
      update: {},
      create: {
        title: 'TaskFlow CLI',
        slug: 'taskflow-cli',
        tagline: 'Developer productivity tool for terminal lovers.',
        description: 'Manage tasks, git branches, and deployments from a single TUI.',
        type: 'Open Source',
        featured: true,
        status: ProjectStatus.LIVE,
        year: '2023',
        stack: ['Rust', 'Ratatui'],
        thumbnailUrl: '/placeholders/project-6.svg',
        previewType: 'image',
        repoUrl: 'https://github.com/example',
        stars: 890,
        highlights: ['Blazing fast startup time.', 'Cross-platform support (Windows, Mac, Linux).'],
        tags: {
          create: [
            { tag: 'CLI' },
            { tag: 'Productivity' },
            { tag: 'Rust' },
          ],
        },
      },
    }),
  ]);
  console.log('✅ Projects created:', projects.length);

  // Create sample experiments
  const experiments = await Promise.all([
    prisma.experiment.upsert({
      where: { id: 'exp-1' },
      update: {},
      create: {
        id: 'exp-1',
        title: 'AI Voice Clone',
        description: 'Real-time voice cloning using deep learning. Trained custom TTS model on personal voice samples for realistic speech synthesis.',
        tags: ['Python', 'TensorFlow', 'TTS'],
        date: 'Dec 2024',
        repoUrl: 'https://github.com',
        demoUrl: '#',
      },
    }),
    prisma.experiment.upsert({
      where: { id: 'exp-2' },
      update: {},
      create: {
        id: 'exp-2',
        title: 'Gesture-Controlled UI',
        description: 'Hand gesture recognition for controlling web interfaces. Uses MediaPipe for hand tracking and custom gesture classification.',
        tags: ['JavaScript', 'MediaPipe', 'WebRTC'],
        date: 'Nov 2024',
        repoUrl: 'https://github.com',
      },
    }),
    prisma.experiment.upsert({
      where: { id: 'exp-3' },
      update: {},
      create: {
        id: 'exp-3',
        title: 'LLM Code Reviewer',
        description: 'Automated code review assistant using fine-tuned LLM. Analyzes PRs for bugs, security issues, and style improvements.',
        tags: ['Python', 'LangChain', 'GPT-4'],
        date: 'Oct 2024',
        repoUrl: 'https://github.com',
      },
    }),
    prisma.experiment.upsert({
      where: { id: 'exp-4' },
      update: {},
      create: {
        id: 'exp-4',
        title: 'Edge AI Object Detection',
        description: 'Real-time object detection running on edge devices. Optimized YOLOv8 model for Raspberry Pi 4 with TensorRT.',
        tags: ['Python', 'YOLO', 'TensorRT'],
        date: 'Sep 2024',
        repoUrl: 'https://github.com',
      },
    }),
    prisma.experiment.upsert({
      where: { id: 'exp-5' },
      update: {},
      create: {
        id: 'exp-5',
        title: 'Generative Music AI',
        description: 'Neural network that generates original music compositions. Trained on MIDI datasets with transformer architecture.',
        tags: ['Python', 'PyTorch', 'MIDI'],
        date: 'Aug 2024',
        repoUrl: 'https://github.com',
        demoUrl: '#',
      },
    }),
    prisma.experiment.upsert({
      where: { id: 'exp-6' },
      update: {},
      create: {
        id: 'exp-6',
        title: '3D Scene Reconstruction',
        description: 'Photogrammetry pipeline for creating 3D models from photos. Implements NeRF for novel view synthesis.',
        tags: ['Python', 'NeRF', 'Computer Vision'],
        date: 'Jul 2024',
        repoUrl: 'https://github.com',
      },
    }),
    prisma.experiment.upsert({
      where: { id: 'exp-7' },
      update: {},
      create: {
        id: 'exp-7',
        title: 'Three.js Particle Galaxy',
        description: 'Interactive 3D particle system reacting to mouse movement and audio input.',
        tags: ['Three.js', 'WebGL', 'Audio'],
        date: 'Mar 2024',
        demoUrl: '#',
      },
    }),
    prisma.experiment.upsert({
      where: { id: 'exp-8' },
      update: {},
      create: {
        id: 'exp-8',
        title: 'WebGPU Compute Shader',
        description: 'First steps into GPGPU on the web. Simulating Game of Life.',
        tags: ['WebGPU', 'Shaders'],
        date: 'Jan 2024',
        demoUrl: '#',
      },
    }),
  ]);
  console.log('✅ Experiments created:', experiments.length);

  // Create sample blog posts
  const blogPosts = await Promise.all([
    prisma.blogPost.upsert({
      where: { slug: 'scalable-rag-pipelines' },
      update: {},
      create: {
        title: 'Building Scalable RAG Pipelines with Python & Pinecone',
        slug: 'scalable-rag-pipelines',
        excerpt: 'A deep dive into architecting production-ready Retrieval Augmented Generation systems that can handle millions of documents.',
        content: '<p>This is the full content of the blog post about RAG pipelines...</p>',
        coverUrl: '/placeholders/blog-1.svg',
        categoryId: categories[0].id,
        authorId: admin.id,
        tags: ['Python', 'LLMs', 'RAG', 'Architecture'],
        readTime: '8 min',
        views: 1250,
        featured: true,
        published: true,
        publishedAt: new Date('2024-03-15'),
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: 'nextjs-15-app-router' },
      update: {},
      create: {
        title: 'Mastering Next.js 15 App Router: Server Components Demystified',
        slug: 'nextjs-15-app-router',
        excerpt: 'Understanding the mental model shift from Pages Router to App Router and how to leverage Server Components effectively.',
        content: '<p>This is the full content of the blog post about Next.js 15...</p>',
        coverUrl: '/placeholders/blog-2.svg',
        categoryId: categories[1].id,
        authorId: admin.id,
        tags: ['Next.js', 'React', 'Frontend'],
        readTime: '6 min',
        views: 980,
        featured: false,
        published: true,
        publishedAt: new Date('2024-02-28'),
      },
    }),
  ]);
  console.log('✅ Blog posts created:', blogPosts.length);

  // Create sample certifications
  const certifications = await Promise.all([
    prisma.certification.upsert({
      where: { id: 'cert-1' },
      update: {},
      create: {
        id: 'cert-1',
        title: 'AWS Certified Solutions Architect – Associate',
        type: CredentialType.CERTIFICATION,
        issuer: 'Amazon Web Services (AWS)',
        issuerLogo: '/logos/aws.svg',
        category: 'Cloud',
        skills: ['Cloud Architecture', 'AWS', 'Distributed Systems', 'Security'],
        issuedAt: '2023-06-15',
        expiresAt: '2026-06-15',
        credentialId: 'AWS-SAA-123456',
        credentialUrl: 'https://aws.amazon.com/verification',
        featured: true,
        description: 'Validates expertise in designing distributed systems on AWS.',
      },
    }),
    prisma.certification.upsert({
      where: { id: 'cert-2' },
      update: {},
      create: {
        id: 'cert-2',
        title: 'Professional Cloud DevOps Engineer',
        type: CredentialType.CERTIFICATION,
        issuer: 'Google Cloud',
        issuerLogo: '/logos/gcp.svg',
        category: 'DevOps',
        skills: ['Google Cloud', 'CI/CD', 'Kubernetes', 'Monitoring'],
        issuedAt: '2023-09-20',
        expiresAt: '2025-09-20',
        credentialId: 'GCP-DEVOPS-999',
        credentialUrl: 'https://google.com/verification',
        featured: true,
        description: 'Demonstrates proficiency in efficient development operations on Google Cloud.',
      },
    }),
    prisma.certification.upsert({
      where: { id: 'cert-3' },
      update: {},
      create: {
        id: 'cert-3',
        title: 'Meta Front-End Developer Professional Certificate',
        type: CredentialType.CERTIFICATION,
        issuer: 'Meta',
        issuerLogo: '/logos/meta.svg',
        category: 'Frontend',
        skills: ['React', 'JavaScript', 'UI/UX', 'Web Development'],
        issuedAt: '2023-05-10',
        credentialId: 'META-FE-2023',
        credentialUrl: 'https://coursera.org/verify',
        featured: false,
        description: 'Professional certificate in modern front-end development with React.',
      },
    }),
  ]);
  console.log('✅ Certifications created:', certifications.length);

  // Create sample services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'svc-1' },
      update: {},
      create: {
        id: 'svc-1',
        title: 'Web App Development',
        description: 'Scalable, high-performance web applications built with modern frameworks to solve complex business problems.',
        bestFor: 'Startups & Enterprise',
        deliverables: ['Fullstack Architecture', 'Responsive UI/UX', 'API Integration', 'Secure Auth Systems'],
        process: ['Discovery', 'Architecture', 'Development', 'Testing', 'Deployment'],
        order: 1,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'svc-2' },
      update: {},
      create: {
        id: 'svc-2',
        title: 'Dashboard & Admin Systems',
        description: 'Internal tools and analytics dashboards designed for data clarity and operational efficiency.',
        bestFor: 'Operations Teams',
        deliverables: ['Data Visualization', 'Role-based Access', 'Real-time Updates', 'Export & Reporting'],
        process: ['Data Audit', 'UX Design', 'Implementation', 'Integration', 'Training'],
        order: 2,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'svc-3' },
      update: {},
      create: {
        id: 'svc-3',
        title: 'AI Integration & Automation',
        description: 'Custom AI solutions to automate workflows, analyze text/data, and enhance user experience.',
        bestFor: 'Innovation Labs',
        deliverables: ['Custom LLM Agents', 'RAG Pipelines', 'Workflow Automation', 'Chatbot Interfaces'],
        process: ['Feasibility Study', 'Prototyping', 'Integration', 'Fine-tuning', 'Monitoring'],
        order: 3,
        active: true,
      },
    }),
  ]);
  console.log('✅ Services created:', services.length);

  // Create sample case studies
  const caseStudies = await Promise.all([
    prisma.caseStudy.upsert({
      where: { slug: 'ai-support-chatbot' },
      update: {},
      create: {
        title: 'AI Customer Support Chatbot',
        slug: 'ai-support-chatbot',
        heroImage: '/placeholders/case-1.svg',
        problem: 'High volume of repetitive support tickets overwhelmed the human support team, leading to slow response times.',
        solution: 'Developed a RAG-based chatbot using knowledge base embeddings to answer common queries instantly.',
        role: 'Lead AI Engineer',
        timeline: '3 Months',
        aiFlowInput: 'User Query + Context',
        aiFlowModel: 'GPT-4 + Vector Database (Pinecone)',
        aiFlowOutput: 'Context-aware automated response',
        architecture: ['Next.js Frontend', 'Python/FastAPI Backend', 'LangChain Orchestration', 'PostgreSQL (User Data)', 'Pinecone (Vector Store)'],
        challenges: ['Handling ambiguous queries', 'Maintaining context across sessions'],
        results: {
          create: [
            { metric: 'Ticket Deflection', value: '45%' },
            { metric: 'Response Time', value: '< 2s' },
            { metric: 'Cost Savings', value: '$12k/mo' },
          ],
        },
      },
    }),
  ]);
  console.log('✅ Case studies created:', caseStudies.length);

  // Create default settings
  await prisma.setting.upsert({
    where: { key: 'hero_stats' },
    update: {},
    create: {
      key: 'hero_stats',
      value: {
        projects: '10+',
        aiModels: '5+',
        successRate: '100%',
      },
    },
  });

  await prisma.setting.upsert({
    where: { key: 'site_info' },
    update: {},
    create: {
      key: 'site_info',
      value: {
        name: 'Portfolio',
        email: 'hello@devstudio.com',
        whatsapp: '+1234567890',
        location: 'San Francisco, CA',
        github: 'https://github.com/example',
        linkedin: 'https://linkedin.com/in/example',
        twitter: 'https://twitter.com/example',
      },
    },
  });

  // Create home settings with tech stack
  await prisma.setting.upsert({
    where: { key: 'home_settings' },
    update: {
      value: {
        hero: {
          title: 'Fullstack Engineer & AI Developer',
          subtitle: 'Building scalable web products and AI-powered automation for real-world impact.',
          badge: { enabled: true, text: 'Available for Freelance' },
          ctaButtons: [
            { label: 'View Projects', href: '/projects', variant: 'primary' },
            { label: 'Contact Me', href: '/contact', variant: 'secondary' },
          ],
        },
        stats: [
          { id: '1', value: '10+', label: 'Projects Completed', icon: 'folder' },
          { id: '2', value: '3+', label: 'Years Experience', icon: 'clock' },
          { id: '3', value: '100%', label: 'Client Satisfaction', icon: 'check' },
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
        featuredHighlights: { enabled: false, items: [] },
        seo: {
          metaTitle: 'Indra Saepudin - Fullstack Engineer & AI Developer',
          metaDescription: 'Building scalable web products and AI-powered automation for real-world impact.',
          ogImage: null,
          keywords: 'fullstack, web developer, AI, machine learning, react, nextjs',
        },
      },
    },
    create: {
      key: 'home_settings',
      value: {
        hero: {
          title: 'Fullstack Engineer & AI Developer',
          subtitle: 'Building scalable web products and AI-powered automation for real-world impact.',
          badge: { enabled: true, text: 'Available for Freelance' },
          ctaButtons: [
            { label: 'View Projects', href: '/projects', variant: 'primary' },
            { label: 'Contact Me', href: '/contact', variant: 'secondary' },
          ],
        },
        stats: [
          { id: '1', value: '10+', label: 'Projects Completed', icon: 'folder' },
          { id: '2', value: '3+', label: 'Years Experience', icon: 'clock' },
          { id: '3', value: '100%', label: 'Client Satisfaction', icon: 'check' },
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
        featuredHighlights: { enabled: false, items: [] },
        seo: {
          metaTitle: 'Indra Saepudin - Fullstack Engineer & AI Developer',
          metaDescription: 'Building scalable web products and AI-powered automation for real-world impact.',
          ogImage: null,
          keywords: 'fullstack, web developer, AI, machine learning, react, nextjs',
        },
      },
    },
  });
  console.log('✅ Settings created');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
