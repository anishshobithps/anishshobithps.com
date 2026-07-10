import { toast } from "sonner";

export type ToastType = "error" | "warning" | "info" | "success";

export function typedToast(type: ToastType, message: string): void {
    toast[type](message);
}

/** Pick a toast severity from a server-action error message. */
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

/** Show an error toast with a severity inferred from its message. */
export function toastError(error: string): void {
    typedToast(classifyError(error), error);
}
