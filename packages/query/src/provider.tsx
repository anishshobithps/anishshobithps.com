"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getQueryClient } from "./client";
import { type Notify, NotifyContext, silent } from "./notify";

export function QueryProvider({
  children,
  notify,
}: {
  children: ReactNode;
  notify?: Notify;
}) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <NotifyContext.Provider value={notify ?? silent}>
        {children}
      </NotifyContext.Provider>
    </QueryClientProvider>
  );
}
