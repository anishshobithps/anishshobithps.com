"use client";

import { createContext, useContext } from "react";

export type Notify = {
  success(message: string): void;
  error(message: string): void;
};

export const silent: Notify = {
  success: () => {},
  error: () => {},
};

export const NotifyContext = createContext<Notify>(silent);

export function useNotify() {
  return useContext(NotifyContext);
}
