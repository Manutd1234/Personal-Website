"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "./useMotionPreference";

const roles = [
  "a software builder",
  "an AI enthusiast",
  "a quant researcher",
  "a Computer Science student",
  "a Manchester United fan",
  "a former signals commander",
  "an Eunoia softball alumnus",
  "a regular at the gym",
  "always planning another trip",
  "a curious learner",
] as const;

const TYPE_MS = 75;
const DELETE_MS = 40;
const HOLD_MS = 1900;
const GAP_MS = 320;

type Frame = { role: number; letters: number; deleting: boolean };

const resting: Frame = { role: 0, letters: roles[0].length, deleting: false };

// One keystroke forward: type to the end, hold, backspace to empty, then
// start typing the next phrase.
function advance(current: Frame): Frame {
  if (!current.deleting)
    return current.letters < roles[current.role].length
      ? { ...current, letters: current.letters + 1 }
      : { ...current, deleting: true };
  return current.letters > 0
    ? { ...current, letters: current.letters - 1 }
    : { role: (current.role + 1) % roles.length, letters: 0, deleting: false };
}

function delayFor({ role, letters, deleting }: Frame) {
  if (deleting) return letters > 0 ? DELETE_MS : GAP_MS;
  return letters < roles[role].length ? TYPE_MS : HOLD_MS;
}

export default function RoleIntro() {
  const [frame, setFrame] = useState<Frame>(resting);
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
    if (reducedMotion) setFrame(resting);
  }, [reducedMotion]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setFrame(advance), delayFor(frame));
    return () => window.clearTimeout(timer);
  }, [running, frame]);

  // The caret holds steady while keys are moving and blinks only at rest.
  const holding = !frame.deleting && frame.letters === roles[frame.role].length;

  return (
    <div
      className="role-intro"
      ref={rootRef}
      data-running={running}
      data-holding={holding}
    >
      <span className="role-intro-label" aria-hidden="true">
        I’m
      </span>
      <span className="role-intro-stage" aria-hidden="true">
        {roles.map((text) => (
          <span className="role-intro-measure" key={text}>
            {text}
          </span>
        ))}
        <span className="role-intro-word">
          {roles[frame.role].slice(0, frame.letters)}
          <span className="role-intro-caret" />
        </span>
      </span>
      <span className="sr-only">
        I’m a software builder and Computer Science student at NUS, a former
        signals commander, an Eunoia softball alumnus, and a Manchester United
        fan. Outside work, I enjoy the gym, travel, and food.
      </span>
    </div>
  );
}
