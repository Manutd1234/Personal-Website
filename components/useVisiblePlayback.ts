"use client";

import { useEffect, useRef, useState } from "react";

/** Pause decorative playback when the section, portfolio tab, or page is hidden. */
export function useVisiblePlayback<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let intersects = false;
    const sync = () =>
      setVisible(
        intersects &&
          document.visibilityState === "visible" &&
          !node.closest('[hidden], [inert], [aria-hidden="true"]'),
      );
    const intersection = new IntersectionObserver(
      ([entry]) => {
        intersects = entry.isIntersecting;
        sync();
      },
      { threshold: 0.2 },
    );
    intersection.observe(node);
    const panel = node.closest('[role="tabpanel"]');
    const changes = new MutationObserver(sync);
    if (panel)
      changes.observe(panel, {
        attributes: true,
        attributeFilter: ["hidden", "inert", "aria-hidden"],
      });
    document.addEventListener("visibilitychange", sync);
    return () => {
      intersection.disconnect();
      changes.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return { ref, visible };
}
