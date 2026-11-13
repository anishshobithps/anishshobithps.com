"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import {
  isToasterHostRequested,
  notifyToasterReady,
  subscribeToasterHost,
} from "@/lib/toast";

const Toaster = dynamic(
  () => import("@repo/ui/components/sonner").then((m) => m.Toaster),
  { ssr: false },
);

function ReadyToaster() {
  useEffect(() => {
    notifyToasterReady();
  }, []);

  return <Toaster />;
}

export function ToasterHost() {
  const requested = useSyncExternalStore(
    subscribeToasterHost,
    isToasterHostRequested,
    () => false,
  );

  return requested ? <ReadyToaster /> : null;
}
