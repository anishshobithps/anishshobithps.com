import type { ExternalToast } from "sonner";

import type { CueName } from "@repo/sounds/sound-cues";
import { playCue } from "@repo/sounds/sound-player";

export type ToastType = "error" | "warning" | "info" | "success";

type ToastMessage = Parameters<typeof import("sonner").toast>[0];

const persistentTypes: ReadonlySet<ToastType> = new Set(["error", "warning"]);

const toastCues: Record<ToastType, CueName> = {
    success: "success",
    error: "error",
    warning: "error",
    info: "info",
};

const hostListeners = new Set<() => void>();
let hostRequested = false;
let markReady: () => void = () => {};
let ready: Promise<void> | null = null;

function toasterReady(): Promise<void> {
    ready ??= new Promise<void>((resolve) => {
        markReady = resolve;
    });
    return ready;
}

export function subscribeToasterHost(listener: () => void): () => void {
    hostListeners.add(listener);
    return () => {
        hostListeners.delete(listener);
    };
}

export function isToasterHostRequested(): boolean {
    return hostRequested;
}

export function requestToasterHost(): void {
    if (hostRequested) return;
    hostRequested = true;
    for (const listener of hostListeners) listener();
}

export function notifyToasterReady(): void {
    void toasterReady();
    markReady();
}

async function show(
    run: (sonner: typeof import("sonner")) => unknown,
): Promise<void> {
    requestToasterHost();
    const [sonner] = await Promise.all([import("sonner"), toasterReady()]);
    run(sonner);
}

function plain(message: ToastMessage, data?: ExternalToast): void {
    void show(({ toast: base }) => base(message, data));
}

function typed(type: ToastType) {
    return (message: ToastMessage, data?: ExternalToast): void => {
        void show(({ toast: base }) => base[type](message, data));
    };
}

export const toast = Object.assign(plain, {
    success: typed("success"),
    error: typed("error"),
    warning: typed("warning"),
    info: typed("info"),
});

export function typedToast(type: ToastType, message: string): void {
    playCue(toastCues[type]);
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
