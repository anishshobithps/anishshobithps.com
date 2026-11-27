"use client";

import { ConsentDraftProvider, useModel, useTranslations } from "@c15t/nextjs";
import {
  useConsentTextDirection,
  useHeadlessConsentUI,
  useIABPolicyGuard,
} from "@c15t/nextjs/headless";
import { XIcon } from "@repo/ui/icons";
import { Button } from "@repo/ui/components/button";
import { Text } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/react/dialog";
import {
  ConsentPreferences,
  ConsentPreferencesActions,
} from "@/components/consent/consent-preferences";

export function ConsentDialog({ className }: { className?: string }) {
  useIABPolicyGuard();
  const model = useModel();
  const { dialog, closeUI } = useHeadlessConsentUI();
  const { common, consentManagerDialog } = useTranslations();
  const dir = useConsentTextDirection();
  const open = dialog.isVisible && model !== "iab";

  return (
    <Dialog
      open={open}
      modal={dialog.blocking}
      closeOnOutsidePress={!dialog.blocking}
      onOpenChange={(next) => {
        if (!next) closeUI();
      }}
    >
      <DialogBackdrop className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
      <DialogContent
        dir={dir}
        className={cn(
          "fixed inset-0 z-50 m-auto grid h-fit max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] gap-4 rounded-lg border border-border bg-background p-6 text-foreground shadow-lg outline-none transition duration-200 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none sm:max-w-lg",
          className,
        )}
      >
        <ConsentDraftProvider>
          <div className="flex flex-col gap-2 pe-8 text-center sm:text-start">
            <DialogTitle render={<Text as="h2" variant="large" />}>
              {consentManagerDialog.title}
            </DialogTitle>
            <DialogDescription render={<Text variant="muted" />}>
              {consentManagerDialog.description}
            </DialogDescription>
          </div>
          <ConsentPreferences className="-mx-2 max-h-[60vh] overflow-x-hidden overflow-y-auto px-2 py-1" />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <ConsentPreferencesActions className="flex-1" />
          </div>
        </ConsentDraftProvider>
        <DialogClose
          aria-label={common.close}
          className="absolute end-2 top-2"
          render={<Button variant="ghost" size="icon-sm" />}
        >
          <XIcon aria-hidden="true" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
