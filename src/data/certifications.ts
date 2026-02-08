
export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
  url?: string;
  logo?: string;
  verificationUrl?: string; // e.g. verify.link
  skills: string[];
}

export const certifications: Certification[] = [
  {
    id: "1",
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    date: "2023-11",
    credentialId: "AWS-12345678",
    url: "https://aws.amazon.com/verification",
    skills: ["Cloud Architecture", "AWS", "Distributed Systems"],
  },
  {
    id: "2",
    title: "Professional Cloud DevOps Engineer",
    issuer: "Google Cloud",
    date: "2023-08",
    credentialId: "GCP-98765432",
    url: "https://google.com/verification",
    skills: ["Google Cloud", "CI/CD", "Kubernetes"],
  },
  {
    id: "3",
    title: "Meta Front-End Developer Professional Certificate",
    issuer: "Meta",
    date: "2023-05",
    skills: ["React", "JavaScript", "UI/UX"],
  }
];
