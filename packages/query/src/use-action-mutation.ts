"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import type { ActionResult } from "@repo/core/action-result";
import { useNotify } from "./notify";

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
  const notify = useNotify();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const result = await action(variables);
      if (!result.success) throw new Error(result.error);
      return variables;
    },
    onSuccess: (variables) => {
      if (successMessage) {
        notify.success(
          typeof successMessage === "function"
            ? successMessage(variables)
            : successMessage,
        );
      }
      onDone?.(variables);
    },
    onError: (error: Error) => notify.error(error.message),
    onSettled: () => {
      for (const queryKey of invalidate ?? []) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
