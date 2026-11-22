"use client";

import { useEffect } from "react";

const OFFSCREEN = "data-offscreen";

interface Group {
  targets: Set<Element>;
  hidden: boolean;
}

function loops(animation: Animation) {
  return animation.effect?.getComputedTiming().iterations === Infinity;
}

function anchorFor(target: Element) {
  let node: Element = target;
  while (node instanceof SVGElement && node.ownerSVGElement) node = node.ownerSVGElement;
  return node === target ? (target.parentElement ?? target) : node;
}

export function OffscreenAnimations() {
  useEffect(() => {
    const groups = new Map<Element, Group>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const group = groups.get(entry.target);
          if (!group) continue;
          group.hidden = !entry.isIntersecting;
          for (const target of group.targets) target.toggleAttribute(OFFSCREEN, group.hidden);
        }
      },
      { rootMargin: "200px 0px" },
    );

    const prune = () => {
      for (const [anchor, group] of groups) {
        if (!anchor.isConnected) {
          observer.unobserve(anchor);
          groups.delete(anchor);
          continue;
        }
        for (const target of group.targets) {
          if (!target.isConnected) group.targets.delete(target);
        }
      }
    };

    const track = (target: Element) => {
      const anchor = anchorFor(target);
      let group = groups.get(anchor);
      if (!group) {
        group = { targets: new Set(), hidden: false };
        groups.set(anchor, group);
        observer.observe(anchor);
      }
      group.targets.add(target);
      if (group.hidden) target.setAttribute(OFFSCREEN, "");
    };

    for (const animation of document.getAnimations()) {
      const target = animation.effect instanceof KeyframeEffect ? animation.effect.target : null;
      if (target && loops(animation)) track(target);
    }

    const onStart = (event: AnimationEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.getAnimations().some(loops)) return;
      prune();
      track(target);
    };

    document.addEventListener("animationstart", onStart, true);
    return () => {
      document.removeEventListener("animationstart", onStart, true);
      observer.disconnect();
      for (const group of groups.values()) {
        for (const target of group.targets) target.removeAttribute(OFFSCREEN);
      }
    };
  }, []);

  return null;
}
