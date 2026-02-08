import { CaseStudy } from "@/types";

export const caseStudies: CaseStudy[] = [
  {
    title: "AI Customer Support Chatbot",
    slug: "ai-support-chatbot",
    heroImage: "/placeholders/case-1.svg",
    overview: {
      problem: "High volume of repetitive support tickets overwhelmed the human support team, leading to slow response times.",
      solution: "Developed a RAG-based chatbot using knowledge base embeddings to answer common queries instantly.",
      role: "Lead AI Engineer",
      timeline: "3 Months",
    },
    aiFlow: {
      input: "User Query + Context",
      model: "GPT-4 + Vector Database (Pinecone)",
      output: "Context-aware automated response",
    },
    architecture: [
      "Next.js Frontend",
      "Python/FastAPI Backend",
      "LangChain Orchestration",
      "PostgreSQL (User Data)",
      "Pinecone (Vector Store)"
    ],
    results: [
      { metric: "Ticket Deflection", value: "45%" },
      { metric: "Response Time", value: "< 2s" },
      { metric: "Cost Savings", value: "$12k/mo" }
    ]
  },
  {
    title: "AI Document Summarizer",
    slug: "ai-document-summarizer",
    heroImage: "/placeholders/case-2.svg",
    overview: {
      problem: "Executives needed to digest 50+ page reports quickly before quarterly meetings.",
      solution: "Built a secure document processing pipeline that generates executive summaries and key insights.",
      role: "Fullstack Developer",
      timeline: "6 Weeks",
    },
    aiFlow: {
      input: "PDF / Word Documents",
      model: "Custom Fine-tuned Llama 3",
      output: "Structured Executive Summary",
    },
    architecture: [
      "React/Redux UI",
      "Node.js Queue System",
      "Python Colorization Service",
      "AWS Textract"
    ],
    results: [
      { metric: "Time Saved", value: "15 hrs/wk" },
      { metric: "Accuracy", value: "94%" },
    ]
  },
  {
    title: "Fullstack Admin Dashboard",
    slug: "fullstack-admin-dashboard",
    heroImage: "/placeholders/case-3.svg",
    overview: {
      problem: "Legacy internal tools were fragmented, causing data discrepancies and workflow bottlenecks.",
      solution: "Unified analytics dashboard aggregating data from 5 different sources with real-time visualization.",
      role: "Frontend Lead",
      timeline: "4 Months",
    },
    architecture: [
      "Next.js App Router",
      "Tremor UI / Tailwind",
      "Server Actions",
      "Prisma ORM"
    ],
    results: [
      { metric: "Workflow Speed", value: "2x Faster" },
      { metric: "Data Latency", value: "Real-time" },
    ]
  }
];
