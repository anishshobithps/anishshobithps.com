import { ViewTransition } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="auto" exit="auto" default="none">
      {children}
    </ViewTransition>
  );
}
