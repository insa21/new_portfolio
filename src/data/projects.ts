import { Project, Experiment } from "@/types";

export const projects: Project[] = [
  {
    id: "1",
    title: "NexFinance AI",
    slug: "nexfinance-ai",
    tagline: "Intelligent financial forecasting platform for SMEs.",
    description: "A comprehensive financial dashboard that uses predictive AI to forecast cash flow and identify spending anomalies. Built for small to medium enterprises to replace complex spreadsheets.",
    type: "Web App",
    featured: true,
    status: "Live",
    year: "2024",
    stack: ["Next.js", "Python", "TensorFlow", "PostgreSQL"],
    tags: ["AI", "Fintech", "Dashboard"],
    thumbnailUrl: "/placeholders/project-1.svg",
    previewType: "image",
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/example",
    stars: 124,
    views: 4500,
    highlights: [
      "Reduced forecasting error by 45% using a custom LSTM model.",
      "Processed over $50M in dummy transaction data securely.",
      "Real-time visualization with D3.js and Recharts."
    ],
    challenges: "Handling large datasets in real-time on the client-side without compromising performance.",
    results: "Onboarded 50+ beta users in the first month with a 90% retention rate."
  },
  {
    id: "2",
    title: "Vocalize",
    slug: "vocalize",
    tagline: "Real-time speech-to-text translation for conferences.",
    description: "Break down language barriers in live events with instant, accurate subtitles projected on user devices.",
    type: "Mobile",
    featured: true,
    status: "In Progress",
    year: "2023",
    stack: ["React Native", "WebSockets", "Node.js", "OpenAI Whisper"],
    tags: ["Mobile", "AI", "Real-time"],
    thumbnailUrl: "/placeholders/project-2.svg",
    previewType: "image",
    repoUrl: "https://github.com/example",
    stars: 89,
    highlights: [
      "Sub-200ms latency for speech transcription.",
      "Support for 12 major languages including dialects.",
      "Offline mode support for basic transcription."
    ]
  },
  {
    id: "3",
    title: "DevUI Kit",
    slug: "devui-kit",
    tagline: "A modern, accessible UI component library for React.",
    description: "Opinionated yet flexible component library built on top of Radix UI and Tailwind CSS.",
    type: "Open Source",
    featured: false,
    status: "Live",
    year: "2023",
    stack: ["React", "TypeScript", "Tailwind", "Storybook"],
    tags: ["UI/UX", "Library", "Design System"],
    thumbnailUrl: "/placeholders/project-3.svg",
    previewType: "image",
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/example",
    stars: 340,
    highlights: ["Used by 200+ developers.", "100% test coverage with Vitest."],
    views: 890
  },
  {
    id: "4",
    title: "EcoTrack",
    slug: "ecotrack",
    tagline: "Carbon footprint tracking for remote teams.",
    description: "Helps distributed companies measure and offset their environmental impact.",
    type: "Web App",
    featured: false,
    status: "Archived",
    year: "2022",
    stack: ["Vue.js", "Firebase", "Google Maps API"],
    tags: ["Sustainability", "Tool"],
    thumbnailUrl: "/placeholders/project-4.svg",
    previewType: "image",
    repoUrl: "https://github.com/example",
    views: 1200,
    highlights: ["Winner of GreenTech Hackathon 2022."]
  },
  {
    id: "5",
    title: "AstroBlog",
    slug: "astro-blog",
    tagline: "Ultra-fast static blog template.",
    description: "Showcasing the power of Islands Architecture.",
    type: "Open Source",
    featured: false,
    status: "Live",
    year: "2024",
    stack: ["Astro", "Preact", "Markdown"],
    tags: ["Performance", "SSG"],
    thumbnailUrl: "/placeholders/project-5.svg",
    previewType: "image",
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/example",
    stars: 56,
    highlights: ["Lighthouse score of 100/100 across all metrics."]
  },
  {
    id: "6",
    title: "TaskFlow CLI",
    slug: "taskflow-cli",
    tagline: "Developer productivity tool for terminal lovers.",
    description: "Manage tasks, git branches, and deployments from a single TUI.",
    type: "Open Source",
    featured: true,
    status: "Live",
    year: "2023",
    stack: ["Rust", "Ratatui"],
    tags: ["CLI", "Productivity", "Rust"],
    thumbnailUrl: "/placeholders/project-6.svg",
    previewType: "image",
    repoUrl: "https://github.com/example",
    stars: 890,
    highlights: ["Blazing fast startup time.", "Cross-platform support (Windows, Mac, Linux)."]
  }
];

export const experiments: Experiment[] = [
  {
    id: "e1",
    title: "Three.js Particle Galaxy",
    description: "Interactive 3D particle system reacting to mouse movement and audio input.",
    tags: ["Three.js", "WebGL", "Audio"],
    date: "2024-03",
    demoUrl: "#"
  },
  {
    id: "e2",
    title: "CSS-only Parallax",
    description: "Exploring parallax scrolling techniques without a single line of JavaScript.",
    tags: ["CSS", "Animation"],
    date: "2024-02",
    repoUrl: "#"
  },
  {
    id: "e3",
    title: "GPT-3 Prompt Chainer",
    description: "A small script to chain LLM prompts for complex reasoning tasks.",
    tags: ["AI", "Python", "LLM"],
    date: "2023-11",
    repoUrl: "#"
  },
  {
    id: "e4",
    title: "WebGPU Compute Shader",
    description: "First steps into GPGPU on the web. Simulating Game of Life.",
    tags: ["WebGPU", "Shaders"],
    date: "2024-01",
    demoUrl: "#"
  }
];
