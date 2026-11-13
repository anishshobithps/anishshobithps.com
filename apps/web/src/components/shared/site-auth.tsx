"use client";

import dynamic from "next/dynamic";
import { hasSessionHint } from "@/lib/session-hint";
import { usePathname } from "next/navigation";
import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  fullName: string | null;
  username: string | null;
  imageUrl: string;
  email: string | null;
}

export interface SignInOptions {
  forceRedirectUrl?: string;
  signUpForceRedirectUrl?: string;
}

export interface BridgeState {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: AuthUser | null;
  signOut: (options?: { redirectUrl?: string }) => Promise<void>;
  openSignIn: (options?: SignInOptions) => void;
}

interface SiteAuth {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: AuthUser | null;
  signOut: (options?: { redirectUrl?: string }) => Promise<void>;
  openSignIn: (options?: SignInOptions) => void;
  preload: () => void;
}

const ClerkBridge = dynamic(() => import("@/components/shared/clerk-bridge"), {
  ssr: false,
});

function readSessionHint(): boolean {
  return hasSessionHint(document.cookie);
}

function subscribeNever(): () => void {
  return () => {};
}

function readNoSession(): boolean {
  return false;
}

function needsAuthUi(pathname: string): boolean {
  return pathname.startsWith("/guestbook") || pathname.startsWith("/blog/");
}

async function signOutUnavailable(): Promise<void> {
  window.location.reload();
}

const AuthContext = createContext<SiteAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const sessionHint = useSyncExternalStore(
    subscribeNever,
    readSessionHint,
    readNoSession,
  );
  const [requested, setRequested] = useState(false);
  const [bridge, setBridge] = useState<BridgeState | null>(null);
  const bridgeRef = useRef<BridgeState | null>(null);
  const pendingSignIn = useRef<SignInOptions | null>(null);

  const active = requested || (sessionHint && needsAuthUi(pathname));
  const live = active && bridge?.isLoaded ? bridge : null;

  const preload = useCallback(() => setRequested(true), []);

  const publish = useCallback((next: BridgeState) => {
    bridgeRef.current = next;
    setBridge(next);
    if (next.isLoaded && pendingSignIn.current) {
      const options = pendingSignIn.current;
      pendingSignIn.current = null;
      next.openSignIn(options);
    }
  }, []);

  const openSignIn = useCallback((options?: SignInOptions) => {
    const current = bridgeRef.current;
    if (current?.isLoaded) {
      current.openSignIn(options);
      return;
    }
    pendingSignIn.current = options ?? {};
    setRequested(true);
  }, []);

  const value = useMemo<SiteAuth>(
    () => ({
      isLoaded: live ? true : !sessionHint,
      isSignedIn: live ? live.isSignedIn : false,
      user: live ? live.user : null,
      signOut: live ? live.signOut : signOutUnavailable,
      openSignIn,
      preload,
    }),
    [live, sessionHint, openSignIn, preload],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {active && <ClerkBridge publish={publish} />}
    </AuthContext.Provider>
  );
}

export function useSiteAuth(): SiteAuth {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useSiteAuth must be used within <AuthProvider>");
  return value;
}

interface SignInTriggerProps extends SignInOptions {
  children: ReactElement<{
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    onPointerEnter?: () => void;
    onFocus?: () => void;
    onTouchStart?: () => void;
  }>;
}

export function SignInTrigger({
  children,
  forceRedirectUrl,
  signUpForceRedirectUrl,
}: SignInTriggerProps) {
  const { openSignIn, preload } = useSiteAuth();

  return cloneElement(children, {
    onClick: (event: MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);
      openSignIn({ forceRedirectUrl, signUpForceRedirectUrl });
    },
    onPointerEnter: () => {
      children.props.onPointerEnter?.();
      preload();
    },
    onFocus: () => {
      children.props.onFocus?.();
      preload();
    },
    onTouchStart: () => {
      children.props.onTouchStart?.();
      preload();
    },
  });
}
