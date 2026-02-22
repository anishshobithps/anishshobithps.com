import { ImageResponse } from "next/og";
import { LogoIcon } from "@/components/shared/logo-icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<LogoIcon size={32} color="#000" />, size);
}
