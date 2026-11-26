"use client";

import { useEffect } from "react";
import { ConsentDraftProvider, useModel, useTranslations } from "@c15t/nextjs";
import {
  useConsentTextDirection,
  useHeadlessConsentUI,
  useIABPolicyGuard,
} from "@c15t/nextjs/headless";
import { XIcon } from "@repo/ui/icons";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { cn } from "@repo/ui/lib/cn";
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

  useEffect(() => {
    if (!open || !dialog.blocking) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeUI();
    }
    document.addEventListener("keydown", closeOnEscape, true);
    return () => document.removeEventListener("keydown", closeOnEscape, true);
  }, [open, dialog.blocking, closeUI]);

  return (
    <Dialog
      open={open}
      modal={dialog.blocking}
      onOpenChange={(isOpen) => {
        if (!isOpen && !dialog.blocking) closeUI();
      }}
    >
      <DialogContent
        dir={dir}
        showCloseButton={false}
        className={cn("sm:max-w-lg", className)}
      >
        <ConsentDraftProvider>
          <DialogHeader className="pe-8">
            <DialogTitle>{consentManagerDialog.title}</DialogTitle>
            <DialogDescription>
              {consentManagerDialog.description}
            </DialogDescription>
          </DialogHeader>
          <ConsentPreferences className="-mx-2 max-h-[60vh] overflow-x-hidden overflow-y-auto px-2 py-1" />
          <DialogFooter>
            <ConsentPreferencesActions className="flex-1" />
          </DialogFooter>
        </ConsentDraftProvider>
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={common.close}
            onClick={closeUI}
            className="absolute top-2 end-2"
          >
            <XIcon aria-hidden="true" />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
