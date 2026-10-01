export const features = {
  photos: process.env.NODE_ENV === "development",
} as const;
