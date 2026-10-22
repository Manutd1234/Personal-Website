"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useMotionPreference } from "./useMotionPreference";

const roles = [
  "a software builder",
  "an AI enthusiast",
  "a quant researcher",
  "a curious learner",
] as const;

export default function RoleIntro() {
  const [role, setRole] = useState(0);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const descriptionId = useId();
  const reducedMotion = useMotionPreference();
  const running =
    !reducedMotion && inView && visible && panelVisible && !hovered && !focused;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const panel = root.closest('[role="tabpanel"]');
    const syncDocument = () =>
      setVisible(document.visibilityState === "visible");
    const syncPanel = () =>
      setPanelVisible(!root.closest('[hidden], [aria-hidden="true"], [inert]'));
    const intersection = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    const changes = new MutationObserver(syncPanel);
    intersection.observe(root);
    if (panel)
      changes.observe(panel, {
        attributes: true,
        attributeFilter: ["hidden", "aria-hidden", "inert"],
      });
    syncDocument();
    syncPanel();
    document.addEventListener("visibilitychange", syncDocument);
    return () => {
      intersection.disconnect();
      changes.disconnect();
      document.removeEventListener("visibilitychange", syncDocument);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) setRole(0);
  }, [reducedMotion]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setRole((current) => (current + 1) % roles.length),
      3100,
    );
    return () => window.clearTimeout(timer);
  }, [running, role]);

  return (
    <div
      className="role-intro"
      ref={rootRef}
      data-running={running}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHovered(false);
      }}
      onFocusCapture={(event) =>
        setFocused(
          event.target instanceof Element &&
            event.target.matches(":focus-visible"),
        )
      }
      onBlurCapture={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          setFocused(false);
      }}
    >
      <span className="role-intro-label" aria-hidden="true">
        I’m
      </span>
      <button
        className="role-intro-trigger"
        type="button"
        onClick={() => setRole((current) => (current + 1) % roles.length)}
        aria-label={`Show next introduction; currently I’m ${roles[role]}`}
        aria-describedby={descriptionId}
      >
        <span className="role-intro-stage" aria-hidden="true">
          {roles.map((text) => (
            <span className="role-intro-measure" key={text}>
              {text}
            </span>
          ))}
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              className="role-intro-word"
              key={role}
              initial={reducedMotion ? false : { y: "105%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: reducedMotion ? 0 : "-105%", opacity: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 280, damping: 28 }
              }
            >
              {roles[role]}
              <span className="role-intro-caret" />
            </motion.span>
          </AnimatePresence>
        </span>
        <RotateCw className="role-intro-next" size={13} aria-hidden="true" />
      </button>
      <span id={descriptionId} className="sr-only">
        I’m a software builder, an AI enthusiast, a quant researcher, and a
        curious learner.
      </span>
    </div>
  );
}
