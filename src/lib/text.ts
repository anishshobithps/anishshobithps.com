/** Collapse whitespace and trim — shared by guestbook messages and comments. */
export function sanitizeText(input: string): string {
    return input.trim().replace(/\s+/g, " ");
}

/** Throw a user-facing error if `text` falls outside the allowed length range. */
export function validateLength(
    text: string,
    { min, max, label }: { min: number; max: number; label: string },
): void {
    if (text.length < min) {
        throw new Error(`${label} must be at least ${min} characters.`);
    }
    if (text.length > max) {
        throw new Error(`${label} must be ${max} characters or fewer.`);
    }
}
