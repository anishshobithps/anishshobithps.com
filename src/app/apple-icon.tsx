import { ImageResponse } from "next/og";
import { LogoIcon } from "@/components/shared/logo-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          borderRadius: 40,
        }}
      >
        <LogoIcon size={120} color="#fff" />
      </div>
    ),
    size,
  );
}
