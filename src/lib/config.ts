export const siteConfig = {
  name: "Anish Shobith P S",
  domain: "anishshobithps.com",
  role: "Software Developer",
  email: "anish.shobith19@gmail.com",
  description:
    "I design and build high-performance web experiences with a focus on clarity, motion, and precision.",
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  availableForHire: true,
  twitterHandle: "n10nce",
  resumeURL:
    "https://github.com/anishshobithps/resume/releases/latest/download/Anish_Shobith_P_S_Resume.pdf",
  avatarURL: "https://avatars.githubusercontent.com/u/38991749?v=4",
  nav: [
    { href: "/blogs", label: "Blogs" },
    { href: "/resume", label: "Resume" },
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
