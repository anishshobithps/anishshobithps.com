export const siteConfig = {
    name: "Anish Shobith P S",
    domain: "anishshobithps.com",
    role: "Software Developer",
    email: "anish.shobith19@gmail.com",
    description:
        "I design and build high-performance web experiences with a focus on clarity, motion, and precision. Specializing in TypeScript, React, and Next.js.",
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

export const projects = [
    {
        title: "Tiara 2024 Tech Fest",
        description:
            "A full-scale event website for a national techno-cultural fest. Built with structured architecture, dynamic content, and zero room for things breaking mid-event (mostly).",
        highlights: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
        live: "https://tiara.anishshobithps.com/",
        github: "https://github.com/tiarasjec/website",
    },
    {
        title: "Reddit → Discord Meme Curator",
        description:
            "A bot that scrapes memes from Reddit and pipes them into Discord. Because manually sending memes is inefficient and I have priorities.",
        highlights: ["Node.js", "Reddit API", "Discord.js", "Automation"],
        live: null,
        github: "https://github.com/anishshobithps/reddit-discord-meme-curator",
    },
    {
        title: "Codelyra",
        description:
            "A Discord bot supporting 600+ programming languages. Slightly over-engineered. Definitely useful. Probably unnecessary.",
        highlights: ["TypeScript", "Discord.js", "Docker"],
        live: null,
        github: "https://github.com/anishshobithps/codelyra",
    },
    {
        title: "Certificate Generator",
        description:
            "Automates certificate creation so I never have to manually edit names into templates again. Laziness, but productive.",
        highlights: ["Python", "Pillow", "PDF Automation"],
        live: null,
        github: "https://github.com/gdgsjec/certificate-generator",
    },
    {
        title: "Sorting Algorithm Visualizer",
        description:
            "A C++ + OpenGL visualizer for sorting algorithms. Built to understand algorithms better and to make them look cooler than they actually are.",
        highlights: ["C++", "OpenGL", "Algorithms"],
        live: null,
        github:
            "https://github.com/anishshobithpscollege/sortingalgorithmvisualizer",
    },
    {
        title: "TL;DR News",
        description:
            "A cross-platform news app summarizing tech content. Because reading full articles is admirable but unrealistic.",
        highlights: ["Flutter", "TypeScript", "Dart"],
        live: null,
        github: "https://github.com/anishshobithpscollege/tldrnewsapp",
    },
];
