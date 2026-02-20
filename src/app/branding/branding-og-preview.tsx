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
  UserIcon,
  TypeIcon,
  BriefcaseIcon,
  GlobeIcon,
  TagsIcon,
  TextIcon,
} from "lucide-react";

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

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
  };

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="flex flex-col gap-4 px-4 py-3 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
          <div className="flex-1 mx-2 h-5 rounded bg-muted/60 px-2 flex items-center overflow-hidden">
            <TypographyMuted className="font-mono text-[10px] truncate leading-none">
              {domain}/home / branding
            </TypographyMuted>
          </div>
          <div className="flex items-center gap-2">
            <TypographyMuted className="text-xs">
              Available for hire
            </TypographyMuted>
            <Switch
              checked={availableForHire}
              onCheckedChange={(checked: boolean) =>
                setAvailableForHire(checked)
              }
              className="cursor-pointer"
              size="default"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputGroup>
            <InputGroupInput
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Title"
            />
            <InputGroupAddon>
              <TypeIcon size={16} />
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupInput
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="Description"
            />
            <InputGroupAddon>
              <TextIcon size={16} />
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupInput
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Name"
            />
            <InputGroupAddon>
              <UserIcon size={16} />
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupInput
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              placeholder="Role"
            />
            <InputGroupAddon>
              <BriefcaseIcon size={16} />
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupInput
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="Domain"
            />
            <InputGroupAddon>
              <GlobeIcon size={16} />
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupInput
              value={tagsInput}
              onChange={handleTagsChange}
              placeholder="tag1, tag2, ..."
            />
            <InputGroupAddon>
              <TagsIcon size={16} />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
      <ScaledOG>
        <OGImage {...ogProps} />
      </ScaledOG>
    </div>
  );
}
