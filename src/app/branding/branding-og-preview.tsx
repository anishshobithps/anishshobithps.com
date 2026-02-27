"use client";

import { useState } from "react";
import { ScaledOG } from "@/app/branding/scaled-og";
import { OGImage } from "@/components/shared/OG";
import { TypographyMuted } from "@/components/ui/typography";
import { Switch } from "@/components/ui/switch";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { siteConfig } from "@/lib/config";
import {
  IconUser,
  IconLetterT,
  IconBriefcase,
  IconWorld,
  IconTags,
  IconAlignLeft,
} from "@tabler/icons-react";

export function BrandingOGPreview() {
  const defaultTitle = siteConfig.name;
  const defaultDescription = siteConfig.description;
  const defaultName = siteConfig.name;
  const defaultRole = siteConfig.role;
  const defaultDomain = siteConfig.domain;
  const [titleInput, setTitleInput] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [roleInput, setRoleInput] = useState<string>("");
  const [domainInput, setDomainInput] = useState<string>("");
  const defaultTags = ["tag1", "tag2"];
  const [tagsInput, setTagsInput] = useState<string>("");
  const [availableForHire, setAvailableForHire] = useState<boolean>(
    siteConfig.availableForHire,
  );

  const title = titleInput.trim() ? titleInput : defaultTitle;
  const description = descriptionInput.trim()
    ? descriptionInput
    : defaultDescription;
  const name = nameInput.trim() ? nameInput : defaultName;
  const role = roleInput.trim() ? roleInput : defaultRole;
  const domain = domainInput.trim() ? domainInput : defaultDomain;
  const tags = tagsInput.trim()
    ? tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : defaultTags;

  const ogProps = {
    title,
    description,
    name,
    role,
    domain,
    path: "home / branding",
    tags,
    availableForHire,
  };

  return (
    <div className="border rounded-xl overflow-hidden">
      <div
        className="flex flex-col gap-4 px-4 py-3 border-b bg-muted/20"
        role="toolbar"
        aria-label="OG image preview controls"
      >
        <div className="flex items-center gap-2">
          <div aria-hidden="true" className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
          </div>
          <div
            className="flex-1 mx-2 h-5 rounded bg-muted/60 px-2 flex items-center overflow-hidden"
            aria-label={`Preview URL: ${domain}/home / branding`}
          >
            <TypographyMuted
              className="font-mono text-[10px] truncate leading-none"
              aria-hidden="true"
            >
              {domain}/home / branding
            </TypographyMuted>
          </div>
          <div className="flex items-center gap-2">
            <TypographyMuted className="text-xs" id="hire-label">
              Available for hire
            </TypographyMuted>
            <Switch
              checked={availableForHire}
              onCheckedChange={(checked: boolean) =>
                setAvailableForHire(checked)
              }
              aria-labelledby="hire-label"
              className="cursor-pointer"
              size="default"
            />
          </div>
        </div>

        <fieldset className="border-0 p-0 m-0" aria-label="OG image fields">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputGroup>
              <InputGroupInput
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Title"
                aria-label={`Title (default: ${defaultTitle})`}
              />
              <InputGroupAddon aria-hidden="true">
                <IconLetterT size={16} />
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupInput
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="Description"
                aria-label={`Description (default: ${defaultDescription})`}
              />
              <InputGroupAddon aria-hidden="true">
                <IconAlignLeft size={16} />
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupInput
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Name"
                aria-label={`Name (default: ${defaultName})`}
              />
              <InputGroupAddon aria-hidden="true">
                <IconUser size={16} />
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupInput
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                placeholder="Role"
                aria-label={`Role (default: ${defaultRole})`}
              />
              <InputGroupAddon aria-hidden="true">
                <IconBriefcase size={16} />
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupInput
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="Domain"
                aria-label={`Domain (default: ${defaultDomain})`}
              />
              <InputGroupAddon aria-hidden="true">
                <IconWorld size={16} />
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupInput
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="tag1, tag2, ..."
                aria-label="Tags, comma separated"
              />
              <InputGroupAddon aria-hidden="true">
                <IconTags size={16} />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </fieldset>
      </div>

      <ScaledOG>
        <OGImage {...ogProps} />
      </ScaledOG>
    </div>
  );
}
