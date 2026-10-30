"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type EngagementState = {
  present: boolean;
  commentCount: number | null;
};

export function useEngagementAnchor() {
  const pathname = usePathname();
  const [state, setState] = useState<EngagementState>({
    present: false,
    commentCount: null,
  });

  useEffect(() => {
    const read = () => {
      const el = document.getElementById("engagement");
      if (!el) {
        setState({ present: false, commentCount: null });
        return;
      }
      const raw = el.dataset.commentCount;
      const parsed = raw == null ? null : Number.parseInt(raw, 10);
      setState({
        present: true,
        commentCount:
          parsed == null || Number.isNaN(parsed) ? null : parsed,
      });
    };

    const frame = requestAnimationFrame(read);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  const scrollToEngagement = useCallback(() => {
    document
      .getElementById("engagement")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return { ...state, scrollToEngagement };
}
