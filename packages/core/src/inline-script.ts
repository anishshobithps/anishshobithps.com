const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);
const SEPARATORS = new RegExp(`[${LINE_SEPARATOR}${PARAGRAPH_SEPARATOR}]`, "g");

export function escapeInlineScript(json: string): string {
  return json
    .replace(/</g, "\\u003C")
    .replace(SEPARATORS, (char) =>
      char === LINE_SEPARATOR ? "\\u2028" : "\\u2029",
    );
}
