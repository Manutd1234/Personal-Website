"use client";

import { useEffect, useState } from "react";

// Keep the first client render identical to the static export. Motion starts
// only after the browser preference is known, and updates if it changes.
export function useMotionPreference() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}
