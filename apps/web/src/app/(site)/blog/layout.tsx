import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
