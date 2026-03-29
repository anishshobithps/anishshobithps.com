import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  allowedDevOrigins: ["http://127.0.0.1:3000"],
  serverExternalPackages: ["@takumi-rs/image-response"],
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "@phosphor-icons/react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "discord.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/stats/script.js",
        destination: "https://cloud.umami.is/script.js",
      },
      {
        source: "/stats/api/send",
        destination: "https://cloud.umami.is/api/send",
      },
      {
        source: "/blog/:path*.mdx",
        destination: "/llms.mdx/blog/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/anishshobithps",
        permanent: true,
      },
      {
        source: "/linkedin",
        destination: "https://linkedin.com/in/anishshobithps",
        permanent: true,
      },
      {
        source: "/mail",
        destination: "mailto:anish.shobith19@gmail.com",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.anishshobithps.com https://*.clerk.accounts.dev https://*.clerk.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' blob: https://clerk.anishshobithps.com https://*.clerk.accounts.dev https://*.clerk.com https:",
              "worker-src 'self' blob:",
              "frame-src 'self' https://clerk.anishshobithps.com https://*.clerk.accounts.dev https://*.clerk.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withMDX(config);
