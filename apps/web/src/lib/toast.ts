import type { ToastOptions as SdkToastOptions } from "@ui-sdk/react/toast";
import type { ReactNode } from "react";
import type { CueName } from "@repo/sounds/sound-cues";
import { playCue } from "@repo/sounds/sound-player";

type ToastOptions = SdkToastOptions<ReactNode>;

export type ToastType = "error" | "warning" | "info" | "success";

const persistentTypes: ReadonlySet<ToastType> = new Set(["error", "warning"]);

const toastCues: Record<ToastType, CueName> = {
    success: "success",
    error: "error",
    warning: "error",
    info: "info",
};

const hostListeners = new Set<() => void>();
let hostRequested = false;
let ready: PromiseWithResolvers<void> | null = null;

function toasterReady(): PromiseWithResolvers<void> {
    ready ??= Promise.withResolvers<void>();
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

function requestToasterHost(): void {
    if (hostRequested) return;
    hostRequested = true;
    for (const listener of hostListeners) listener();
}

export function notifyToasterReady(): void {
    toasterReady().resolve();
}

async function show(
    run: (sdk: typeof import("@ui-sdk/react/toast")) => unknown,
): Promise<void> {
    requestToasterHost();
    const [sdk] = await Promise.all([
        import("@ui-sdk/react/toast"),
        toasterReady().promise,
    ]);
    run(sdk);
}

function plain(message: string, options?: ToastOptions): void {
    void show(({ toast: base }) => base(message, options));
}

function typed(type: ToastType) {
    return (message: string, options?: ToastOptions): void => {
        void show(({ toast: base }) => base[type](message, options));
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
        persistentTypes.has(type) ? { duration: Infinity } : undefined,
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
