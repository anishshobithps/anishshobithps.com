"use client";

import { buttonVariants } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { Text } from "@repo/ui/components/typography";
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
  XIcon,
} from "@repo/ui/icons";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastRegion,
  ToastTitle,
} from "@ui-sdk/react/toast";

const ICONS = {
  success: <CheckCircleIcon aria-hidden="true" className="size-4" />,
  info: <InfoIcon aria-hidden="true" className="size-4" />,
  warning: <WarningIcon aria-hidden="true" className="size-4" />,
  error: <XCircleIcon aria-hidden="true" className="size-4" />,
  loading: <Spinner aria-hidden="true" className="size-4" />,
  default: null,
};

export function Toaster() {
  return (
    <ToastRegion side="bottom" align="end" data-toaster="">
      {(item) => (
        <Toast className="flex items-center gap-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg">
          {ICONS[item.type ?? "default"]}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <ToastTitle render={<Text as="div" variant="title" />} />
            {item.description != null && (
              <ToastDescription render={<Text as="div" variant="caption" />} />
            )}
          </div>
          {item.cancel && (
            <ToastClose
              action={item.cancel.onCancel}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {item.cancel.label}
            </ToastClose>
          )}
          {item.action && (
            <ToastAction className={buttonVariants({ size: "sm" })} />
          )}
          {item.duration === Infinity && !item.cancel && (
            <ToastClose
              aria-label="Close"
              className={buttonVariants({ variant: "ghost", size: "icon-xs" })}
            >
              <XIcon aria-hidden="true" />
            </ToastClose>
          )}
        </Toast>
      )}
    </ToastRegion>
  );
}
