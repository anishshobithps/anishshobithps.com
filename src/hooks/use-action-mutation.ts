"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import type { ActionResult } from "@/lib/action-result";
import { toastError } from "@/lib/toast";
import { toast } from "sonner";

export function useActionMutation<TVariables>({
  action,
  invalidate,
  successMessage,
  onDone,
}: {
  action: (variables: TVariables) => Promise<ActionResult>;
  invalidate?: readonly QueryKey[];
  successMessage?: string | ((variables: TVariables) => string);
  onDone?: (variables: TVariables) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const result = await action(variables);
      if (!result.success) throw new Error(result.error);
      return variables;
    },
    onSuccess: (variables) => {
      if (successMessage) {
        toast.success(
          typeof successMessage === "function"
            ? successMessage(variables)
            : successMessage,
        );
      }
      onDone?.(variables);
    },
    onError: (error: Error) => toastError(error.message),
    onSettled: () => {
      for (const queryKey of invalidate ?? []) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
