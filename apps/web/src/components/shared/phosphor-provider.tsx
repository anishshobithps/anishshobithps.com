"use client";

import { IconContext } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export function PhosphorProvider({ children }: { children: ReactNode }) {
  return (
    <IconContext.Provider value={{ weight: "fill" }}>
      {children}
    </IconContext.Provider>
  );
}
