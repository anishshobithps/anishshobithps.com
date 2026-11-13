"use client";

import { Signature } from "@repo/ui/components/signature";
import { signatureEntries } from "@/lib/signature-path";
import { signatureFontSize, signatureWidth } from "@/lib/signature-size";

export default function SignatureIsland() {
  return (
    <Signature
      entries={signatureEntries}
      width={signatureWidth}
      fontSize={signatureFontSize}
    />
  );
}
