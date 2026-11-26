import { QueryProvider } from "@/lib/query/provider";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
