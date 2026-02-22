import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  serverExternalPackages: ["@takumi-rs/image-response"],
  images: {
    remotePatterns: [
        {
            protocol: "https",
            hostname: "discord.com",
            pathname: "/**"
        }
    ]
  }
};

export default withMDX(config);
