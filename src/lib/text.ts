export function sanitizeText(input: string): string {
    return input.trim().replace(/\s+/g, " ");
}


export function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export function validateLength(
    text: string,
    { min, max, label }: { min: number; max: number; label: string },
): void {
    if (text.length < min) {
        throw new ValidationError(`${label} must be at least ${min} characters.`);
    }
    if (text.length > max) {
        throw new ValidationError(`${label} must be ${max} characters or fewer.`);
    }
}
