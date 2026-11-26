"use client";

import { useId } from "react";
import type { AllConsentNames, PresentationAction } from "@c15t/nextjs";
import {
  useConsentDraft,
  useExplicitChoice,
  useRestrictions,
  useTranslations,
} from "@c15t/nextjs";
import {
  useConsentLabels,
  useHeadlessConsentUI,
  useVendorsListedUnder,
} from "@c15t/nextjs/headless";
import { CaretDownIcon } from "@repo/ui/icons";
import { Button } from "@repo/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { Switch } from "@repo/ui/components/switch";
import { Text } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";

const defaultVendorCopy = {
  disabledByCategory: "Turn on this category to choose vendors.",
  privacyPolicy: "Privacy policy",
  switchLabel: "Allow {vendor}",
  title: "Vendors ({count})",
};

function ConsentVendors({ category }: { category: AllConsentNames }) {
  const vendors = useVendorsListedUnder(category);
  const id = useId();
  const draft = useConsentDraft();
  const { consentManagerDialog } = useTranslations();
  const copy = { ...defaultVendorCopy, ...consentManagerDialog.vendors };
  const categoryOn = draft.values[category] === true;
  const title = copy.title.replace("{count}", String(vendors.length));

  if (vendors.length === 0) return null;

  return (
    <Collapsible className="group rounded-lg border">
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <Text variant="small" as="span">
          {title}
        </Text>
        <CaretDownIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent
        aria-label={title}
        className="grid gap-3 border-t px-3 py-3 text-start"
      >
        {!categoryOn && (
          <Text variant="caption">{copy.disabledByCategory}</Text>
        )}
        {vendors.map((vendor) => {
          const name = vendor.name ?? vendor.id;
          const nameId = `${id}-${vendor.id}-name`;
          return (
            <div key={vendor.id} className="grid gap-1">
              <div className="flex items-center justify-between gap-4">
                <Text variant="small" as="span" id={nameId}>
                  {name}
                </Text>
                {vendor.disabled !== true && (
                  <Switch
                    size="sm"
                    aria-label={copy.switchLabel.replace("{vendor}", name)}
                    aria-describedby={nameId}
                    checked={draft.vendors[vendor.id] ?? true}
                    disabled={!categoryOn}
                    onCheckedChange={(checked) =>
                      draft.setVendor(vendor.id, checked)
                    }
                  />
                )}
              </div>
              {vendor.description && (
                <Text variant="caption">{vendor.description}</Text>
              )}
              {vendor.privacyPolicyUrl && (
                <Text variant="caption" asChild>
                  <a
                    href={vendor.privacyPolicyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit underline underline-offset-4 hover:text-foreground"
                  >
                    {copy.privacyPolicy}
                  </a>
                </Text>
              )}
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ConsentPreferences({ className }: { className?: string }) {
  const id = useId();
  const draft = useConsentDraft();
  const explicitChoice = useExplicitChoice();
  const restrictions = useRestrictions();
  const { consentTypes } = useTranslations();

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {draft.displayedCategories.map((category) => {
        const titleId = `${id}-${category}-title`;
        const descriptionId = `${id}-${category}-description`;
        const restrictionId = `${id}-${category}-restriction`;
        const description = consentTypes[category]?.description;
        const restricted =
          category !== "necessary" &&
          explicitChoice?.categories[category]?.value === true &&
          (restrictions[category]?.length ?? 0) > 0;
        const describedBy = [
          description && descriptionId,
          restricted && restrictionId,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div key={category} className="grid gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-1 text-start">
                <Text variant="title" as="span" id={titleId}>
                  {consentTypes[category]?.title ?? category}
                </Text>
                {description && (
                  <Text variant="muted" as="span" id={descriptionId}>
                    {description}
                  </Text>
                )}
              </div>
              <Switch
                aria-labelledby={titleId}
                aria-describedby={describedBy || undefined}
                checked={draft.values[category]}
                disabled={category === "necessary"}
                onCheckedChange={(checked) => draft.set(category, checked)}
              />
            </div>
            {restricted && (
              <Text variant="caption" asChild>
                <output id={restrictionId} className="text-start">
                  Your saved choice is restricted by the current privacy
                  settings.
                </output>
              </Text>
            )}
            <ConsentVendors category={category} />
          </div>
        );
      })}
    </div>
  );
}

export function ConsentPreferencesActions({
  className,
  onComplete,
}: {
  className?: string;
  onComplete?: () => void;
}) {
  const draft = useConsentDraft();
  const { dialog, performAction } = useHeadlessConsentUI();
  const { actions } = useConsentLabels();

  async function handleAction(action: PresentationAction) {
    const result = await performAction(action);
    if (result?.ok) {
      onComplete?.();
    } else if (draft.isStale) {
      draft.reset();
    }
  }

  const stacked = dialog.direction === "column" || dialog.shouldFillActions;

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        !stacked && "sm:flex-row sm:flex-wrap sm:justify-between",
        className,
      )}
    >
      {dialog.actionGroups.map((group) => (
        <div
          key={group.join("-")}
          className={cn("flex flex-col gap-2", !stacked && "sm:flex-row")}
        >
          {group.map((action) => (
            <Button
              key={action}
              type="button"
              size="sm"
              variant={
                dialog.primaryActions.includes(action) ? "default" : "outline"
              }
              onClick={() => handleAction(action)}
            >
              {actions[action]}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
