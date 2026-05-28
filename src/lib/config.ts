export const siteConfig = {
    name: "Anish Shobith P S",
    domain: "anishshobithps.com",
    role: "Software Developer",
    email: "anish.shobith19@gmail.com",
    description:
        "I build interfaces, bots, and questionable automation scripts — mostly so I don't have to repeat myself. TypeScript, React, and Next.js.",
    baseUrl:
        process.env.NEXT_PUBLIC_BASE_URL ??
        (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
            : "http://localhost:3000"),
    availableForHire: true,
    handle: "n10nce",
    twitterHandle: "n10nce",
    sameAs: [
        "https://github.com/anishshobithps",
        "https://x.com/n10nce",
        "https://www.linkedin.com/in/anishshobithps/",
    ] as const,
    resumeURL:
        "https://github.com/anishshobithps/resume/releases/latest/download/Anish_Shobith_P_S_Resume.pdf",
    nav: [
        { href: "/projects", label: "Projects" },
        { href: "/blogs", label: "Blogs" },
        { href: "/resume", label: "Resume" },
        { href: "/guestbook", label: "Guestbook" },
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
