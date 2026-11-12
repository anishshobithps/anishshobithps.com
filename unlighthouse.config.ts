import { readdirSync } from "node:fs";

const posts = readdirSync("apps/web/content/blog")
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => `/blog/${file.replace(/\.mdx$/, "")}`);

export default {
  site: "https://anishshobithps.com",
  urls: [
    "/",
    "/blogs",
    "/projects",
    "/resume",
    "/guestbook",
    "/branding",
    "/privacy-policy",
    ...posts,
  ],
  scanner: {
    crawler: false,
    device: "mobile",
    exclude: ["/blogs?tags=*"],
  },
};
