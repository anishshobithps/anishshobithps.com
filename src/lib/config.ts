export const siteConfig = {
    name: "Anish Shobith P S",
    domain: "anishshobithps.com",
    role: "Software Developer",
    description:
        "I design and build high-performance web experiences with a focus on clarity, motion, and precision.",
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL
        ?? (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
            : "http://localhost:3000"),
    availableForHire: true,
    resumeURL: "https://github.com/anishshobithps/resume/releases/latest/download/Anish_Shobith_P_S_Resume.pdf",
    nav: [
        { href: "/about", label: "About" },
        { href: "/projects", label: "Projects" },
        { href: "/blogs", label: "Blogs" },
        { href: "/contact", label: "Contact" },
    ] as const,

    social: [
        { platform: "github", href: "https://github.com/anishshobithps", label: "GitHub" },
        { platform: "linkedin", href: "https://www.linkedin.com/in/anishshobithps/", label: "LinkedIn" },
        { platform: "x", href: "https://x.com/n10nce", label: "X" }
    ] as const,
} as const;
