import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ["http://127.0.0.1:3000"],
  serverExternalPackages: ["@takumi-rs/image-response"],
  typedRoutes: true,
  experimental: {
    optimizePackageImports: [
      "@phosphor-icons/react",
      "radix-ui",
      "fumadocs-ui",
      "fumadocs-core",
    ],
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
      {
        source:
          "/blog/i-built-a-4am-alert-system-to-get-RCB-tickets-and%20-it-actually-worked",
        destination:
          "/blog/rcb-tickets-are-broken-so-i-built-an-alert-system-at-4am",
        permanent: true,
      },
    ];
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";

    const clerkHosts = [
      "https://clerk.anishshobithps.com",
      "https://*.clerk.accounts.dev",
      "https://*.clerk.com",
    ];

    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      ...clerkHosts,
      // Turbopack HMR and eval needed only in development
      ...(isProd ? [] : ["'unsafe-eval'", "http://localhost:8400"]),
    ].join(" ");

    const connectSrc = [
      "'self'",
      "blob:",
      ...clerkHosts,
      "https://clerk-telemetry.com",
      // Umami is proxied same-origin via /stats rewrites — no external host needed
      ...(isProd ? [] : ["http://localhost:8400", "ws:"]),
    ].join(" ");

    const imgSrc = [
      "'self'",
      "data:",
      "blob:",
      "https://img.clerk.com",
      "https://i.scdn.co",
      "https://discord.com",
      "https://cdn.discordapp.com",
      "https://res.cloudinary.com",
    ].join(" ");

    const cspDirectives = [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      `img-src ${imgSrc}`,
      `connect-src ${connectSrc}`,
      "media-src 'self' https://res.cloudinary.com",
      "worker-src 'self' blob:",
      `frame-src 'self' ${clerkHosts.join(" ")}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    const securityHeaders = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: cspDirectives.join("; ") },
    ];

    if (isProd) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default withMDX(config);
