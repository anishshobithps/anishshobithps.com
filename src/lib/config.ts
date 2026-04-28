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

export const projects = [
    {
        title: "Luma",
        description:
            "A small, expressive programming language with a full lexer, recursive-descent parser, and tree-walking interpreter. Supports closures, first-class functions, pattern matching, arbitrary-precision integers, and more. Work in progress.",
        highlights: ["Bun", "TypeScript", "Compilers", "Interpreters"],
        live: null,
        github: "https://github.com/anishshobithps/luma",
    },
    {
        title: "Tiara 2024 Tech Fest",
        description:
            "A full-scale event website for a national techno-cultural fest. Built with structured architecture, dynamic content, and zero room for things breaking mid-event (mostly).",
        highlights: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
        live: "https://tiara.anishshobithps.com/",
        github: "https://github.com/tiarasjec/website",
    },
    {
        title: "snipshot",
        description:
            "A CLI tool that turns any source file into a clean, themed screenshot. Uses Monaco Editor rendered headlessly via Puppeteer with Shiki for syntax highlighting. Supports 235 languages, 65 themes, interactive and direct modes, and fixed-size output for OG/social images.",
        highlights: ["Bun", "TypeScript", "Puppeteer", "Monaco Editor", "Shiki"],
        live: null,
        github: "https://github.com/anishshobithps/snipshot",
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
        title: "FRAxis",
        description:
            "A frame-based glitch renderer that generates stylized animated GIFs from an input SVG. Applies analog-inspired distortions — horizontal slice displacement, camera shake, CRT noise, and temporal stutter — then encodes into a palette-constrained GIF via FFmpeg.",
        highlights: ["Bun", "TypeScript", "Sharp", "FFmpeg"],
        live: null,
        github: "https://github.com/anishshobithps/FRAxis",
    },
    {
        title: "Sorting Algorithm Visualizer",
        description:
            "A C++ + OpenGL visualizer for sorting algorithms. Built to understand algorithms better and to make them look cooler than they actually are.",
        highlights: ["C++", "OpenGL", "Algorithms"],
        live: null,
        github: "https://github.com/anishshobithpscollege/sortingalgorithmvisualizer",
    },
    {
        title: "Reddit -> Discord Meme Curator",
        description:
            "A bot that scrapes memes from Reddit and pipes them into Discord. Because manually sending memes is inefficient and I have priorities.",
        highlights: ["Node.js", "Reddit API", "Discord.js", "Automation"],
        live: null,
        github: "https://github.com/anishshobithps/reddit-discord-meme-curator",
    },
    {
        title: "Certificate Generator",
        description:
            "Automates certificate creation so I never have to manually edit names into templates again. Laziness, but productive.",
        highlights: ["Python", "Pillow", "PDF Automation"],
        live: null,
        github: "https://github.com/gdgsjec/certificate-generator",
    },
];
