import {
  IconBrandReact,
  IconBrandNextjs,
  IconBrandTypescript,
  IconBrandTailwind,
  IconDatabase,
  IconServer,
  IconApi,
  IconCreditCard,
  IconUsers,
  IconTools,
  IconRocket,
} from "@tabler/icons-react";
import type { ExperienceItemType } from "@/components/ui/experience";

export const siteConfig = {
  name: "Anish Shobith P S",
  domain: "anishshobithps.com",
  role: "Software Developer",
  description:
    "I design and build high-performance web experiences with a focus on clarity, motion, and precision.",
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  availableForHire: true,
  resumeURL:
    "https://github.com/anishshobithps/resume/releases/latest/download/Anish_Shobith_P_S_Resume.pdf",
  avatarURL: "https://avatars.githubusercontent.com/u/38991749?v=4",
  nav: [
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/blogs", label: "Blogs" },
    { href: "/contact", label: "Contact" },
  ] as const,
  social: [
    {
      platform: "github",
      href: "https://github.com/anishshobithps",
      label: "GitHub",
    },
    {
      platform: "linkedin",
      href: "https://www.linkedin.com/in/anishshobithps/",
      label: "LinkedIn",
    },
    { platform: "x", href: "https://x.com/n10nce", label: "X" },
  ] as const,
} as const;

export const experiences: ExperienceItemType[] = [
  {
    id: "exp-1",
    companyName: "Zenduty",
    acquiredBy: {
      name: "Xurrent",
      renamedTo: "Xurrent IMR",
      // date: "2024",
    },
    positions: [
      {
        id: "pos-1",
        title: "SDE Intern",
        employmentType: "Internship",
        employmentPeriod: "Feb 2025 – Nov 2025",
        isExpanded: true,
        description: [
          "Developed new application pages and introduced feature enhancements across the platform.",
          "Improved UI/UX consistency and optimized loading performance across critical views.",
          "Refactored testing architecture for improved maintainability and faster execution.",
        ],
        skills: [
          { label: "React", icon: <IconBrandReact size={14} /> },
          { label: "Next.js", icon: <IconBrandNextjs size={14} /> },
          { label: "TypeScript", icon: <IconBrandTypescript size={14} /> },
          { label: "Performance Optimization", icon: <IconRocket size={14} /> },
          { label: "Testing Architecture", icon: <IconTools size={14} /> },
        ],
      },
    ],
  },
  {
    id: "exp-2",
    companyName: "Headway",
    positions: [
      {
        id: "pos-2",
        title: "Tech Intern",
        employmentType: "Internship",
        employmentPeriod: "Feb 2024 – Jun 2024",
        description: [
          "Built a scalable full-stack web application from scratch.",
          "Implemented secure authentication using NextAuth.",
          "Integrated Razorpay for streamlined payment processing.",
          "Managed frontend and backend integration ensuring seamless data flow.",
        ],
        skills: [
          { label: "Next.js", icon: <IconBrandNextjs size={14} /> },
          { label: "Tailwind CSS", icon: <IconBrandTailwind size={14} /> },
          { label: "Authentication", icon: <IconTools size={14} /> },
          { label: "Payment Integration", icon: <IconCreditCard size={14} /> },
          { label: "Backend Systems", icon: <IconServer size={14} /> },
        ],
      },
    ],
  },
  {
    id: "exp-3",
    companyName: "Akto.io",
    positions: [
      {
        id: "pos-3",
        title: "SDE Intern",
        employmentType: "Internship",
        employmentPeriod: "Aug 2023 – Oct 2023",
        description: [
          "Worked on backend-integrated internal tooling features.",
          "Improved data handling and API reliability.",
        ],
        skills: [
          { label: "APIs", icon: <IconApi size={14} /> },
          { label: "Backend Development", icon: <IconServer size={14} /> },
          { label: "Database Systems", icon: <IconDatabase size={14} /> },
        ],
      },
    ],
  },
  {
    id: "exp-4",
    companyName: "GDSC SJEC",
    positions: [
      {
        id: "pos-4",
        title: "Lead",
        employmentType: "Leadership",
        employmentPeriod: "Jun 2023 – May 2024",
        description: [
          "Led developer community initiatives and technical workshops.",
          "Mentored peers in foundational software engineering concepts.",
          "Organized events to strengthen developer collaboration.",
        ],
        skills: [
          { label: "Leadership", icon: <IconUsers size={14} /> },
          { label: "Community Building", icon: <IconUsers size={14} /> },
          { label: "Mentorship", icon: <IconTools size={14} /> },
        ],
      },
    ],
  },
] as const;
