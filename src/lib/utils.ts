import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseSiteURL(): string {
  return import.meta.env.PROD
    ? "https://anishshobithps.com/"
    : "http://localhost:4321/";
}
