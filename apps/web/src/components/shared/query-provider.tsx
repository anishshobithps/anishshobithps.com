"use client";

import { QueryProvider as BaseQueryProvider } from "@repo/query/provider";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { toastError } from "@/lib/toast";

const notify = {
  success: (message: string) => {
    toast.success(message);
  },
  error: toastError,
};

export function QueryProvider({ children }: { children: ReactNode }) {
  return <BaseQueryProvider notify={notify}>{children}</BaseQueryProvider>;
}
