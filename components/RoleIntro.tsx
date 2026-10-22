"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "./useMotionPreference";

const roles = [
  "a software builder",
  "an AI enthusiast",
  "a quant researcher",
  "a curious learner",
] as const;

export default function RoleIntro() {
  const [frame, setFrame] = useState({ role: 0, letters: roles[0].length });
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMotionPreference();
  const running = !reducedMotion && inView && visible && panelVisible;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const panel = root.closest('[role="tabpanel"]');
    const syncDocument = () =>
      setVisible(document.visibilityState === "visible");
    const syncPanel = () =>
      setPanelVisible(!root.closest('[hidden], [aria-hidden="true"], [inert]'));
    const intersection =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0.25 },
          );
    const changes = new MutationObserver(syncPanel);
    if (intersection) intersection.observe(root);
    else setInView(true);
    if (panel)
      changes.observe(panel, {
        attributes: true,
        attributeFilter: ["hidden", "aria-hidden", "inert"],
      });
    syncDocument();
    syncPanel();
    document.addEventListener("visibilitychange", syncDocument);
    return () => {
      intersection?.disconnect();
      changes.disconnect();
      document.removeEventListener("visibilitychange", syncDocument);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion)
      setFrame((current) =>
        current.role === 0 && current.letters === roles[0].length
          ? current
          : { role: 0, letters: roles[0].length },
      );
  }, [reducedMotion]);

  useEffect(() => {
    if (!running) return;
    const typing = frame.letters < roles[frame.role].length;
    const timer = window.setTimeout(
      () => {
        setFrame((current) =>
          typing
            ? { ...current, letters: current.letters + 1 }
            : { role: (current.role + 1) % roles.length, letters: 1 },
        );
      },
      typing ? 75 : 1900,
    );
    return () => window.clearTimeout(timer);
  }, [running, frame.role, frame.letters]);

  return (
    <div className="role-intro" ref={rootRef} data-running={running}>
      <span className="role-intro-label" aria-hidden="true">
        I’m
      </span>
      <span className="role-intro-stage" aria-hidden="true">
        {roles.map((text) => (
          <span className="role-intro-measure" key={text}>
            {text}
          </span>
        ))}
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            className="role-intro-word"
            key={frame.role}
            initial={reducedMotion ? false : { y: "105%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reducedMotion ? 0 : "-105%", opacity: 0 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 280, damping: 28 }
            }
          >
            {roles[frame.role].slice(0, frame.letters)}
            <span className="role-intro-caret" />
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="sr-only">
        I’m a software builder, an AI enthusiast, a quant researcher, and a
        curious learner.
      </span>
    </div>
  );
}
