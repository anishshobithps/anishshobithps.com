import { toast } from "sonner";

export type ToastType = "error" | "warning" | "info" | "success";

const persistentTypes: ReadonlySet<ToastType> = new Set(["error", "warning"]);

export function typedToast(type: ToastType, message: string): void {
    toast[type](
        message,
        persistentTypes.has(type)
            ? { duration: Infinity, closeButton: true }
            : undefined,
    );
}

export function classifyError(error: string): ToastType {
    const msg = error.toLowerCase();
    if (
        msg.includes("permission") ||
        msg.includes("not allowed") ||
        msg.includes("unauthorized")
    ) {
        return "warning";
    }
    if (msg.includes("sign in") || msg.includes("logged in") || msg.includes("auth")) {
        return "info";
    }
    return "error";
}

export function toastError(error: string): void {
    typedToast(classifyError(error), error);
}
