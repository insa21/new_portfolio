import { Service } from "@/types";

export const services: Service[] = [
  {
    title: "Web App Development",
    description: "Scalable, high-performance web applications built with modern frameworks to solve complex business problems.",
    bestFor: "Startups & Enterprise",
    deliverables: ["Fullstack Architecture", "Responsive UI/UX", "API Integration", "Secure Auth Systems"],
    process: ["Discovery", "Architecture", "Development", "Testing", "Deployment"],
  },
  {
    title: "Dashboard & Admin Systems",
    description: "Internal tools and analytics dashboards designed for data clarity and operational efficiency.",
    bestFor: "Operations Teams",
    deliverables: ["Data Visualization", "Role-based Access", "Real-time Updates", "Export & Reporting"],
    process: ["Data Audit", "UX Design", "Implementation", "Integration", "Training"],
  },
  {
    title: "AI Integration & Automation",
    description: "Custom AI solutions to automate workflows, analyze text/data, and enhance user experience.",
    bestFor: "Innovation Labs",
    deliverables: ["Custom LLM Agents", "RAG Pipelines", "Workflow Automation", "Chatbot Interfaces"],
    process: ["Feasibility Study", "Prototyping", "Integration", "Fine-tuning", "Monitoring"],
  },
];
