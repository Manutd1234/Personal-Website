"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
} from "react";

import { asset } from "@/content/paths";
import "@/app/book-carousel.css";

export type ProjectSource = {
  url: string;
  label?: string;
  visibility?: string;
};

export type Project = {
  title: string;
  category: string;
  description: string;
  outcome?: string;
  tags: readonly string[];
  number?: string;
  repository?: string;
  repositoryLabel?: string;
  repositoryVisibility?: string;
  repositories?: readonly ProjectSource[];
  live?: string;
  accent?: string;
  featured?: boolean;
};

export type ProjectMedia = {
  src: string;
  alt: string;
  kind: string;
  caption: string;
};

type BookCarouselProps = {
  projects: readonly Project[];
  media: Readonly<Record<string, ProjectMedia | undefined>>;
  renderDetails: (
    project: Project,
    media: ProjectMedia | undefined,
    index: number,
  ) => ReactNode;
  active?: boolean;
};

const COVER_DESIGNS = [
  {
    title: "AlphaEngine",
    subtitle: "Markets, data & execution",
    color: "#007c59",
    ink: "#fff8dc",
  },
  {
    title: "BrainHack",
    subtitle: "TIL-AI · Novice Champions",
    color: "#f4d875",
    ink: "#183e31",
  },
  {
    title: "Delta1",
    subtitle: "Notes on systematic trading",
    color: "#4b9c80",
    ink: "#fffbed",
  },
  {
    title: "RE:DECIDE",
    subtitle: "A closer look at the game",
    color: "#b6e6b9",
    ink: "#173e2f",
  },
  {
    title: "FraudCrew",
    subtitle: "AI with a human in the loop",
    color: "#225b43",
    ink: "#f7edbc",
  },
] as const;
const DESIGN_INDEX: Readonly<Record<string, number | undefined>> = {
  AlphaEngine: 0,
  "BrainHack TIL-AI": 1,
  "Delta1 Research": 2,
  "CS2 Decision Coach": 3,
  "Agentic Fraud Investigation Crew": 4,
};
const mod = (value: number, length: number) =>
  ((value % length) + length) % length;
const coverFor = (project: Project, index: number) =>
  COVER_DESIGNS[DESIGN_INDEX[project.title] ?? index % COVER_DESIGNS.length];

type Gesture = {
  pointer: number;
  x: number;
  y: number;
  lastX: number;
  time: number;
  velocity: number;
  startAngle: number;
  moved: boolean;
  book?: number;
  element: HTMLDivElement;
};

function Book({
  project,
  media,
  index,
}: {
  project: Project;
  media?: ProjectMedia;
  index: number;
}) {
  const design = coverFor(project, index);
  return (
    <span
      aria-hidden="true"
      className="book-object"
      style={
        { "--cover": design.color, "--cover-ink": design.ink } as CSSProperties
      }
    >
      <span className="book-back">
        <span>IAN WANGSA</span>
        <span>{design.title}</span>
        <small>PROJECT NOTES / {String(index + 1).padStart(2, "0")}</small>
      </span>
      <span className="book-spine">
        <b>{design.title}</b>
        <small>IW</small>
      </span>
      <span className="book-pages book-pages-side" />
      <span className="book-pages book-pages-top" />
      <span className="book-pages book-pages-bottom" />
      <span className="book-front">
        <span className="book-cover-edition">
          IAN WANGSA <span>VOL. {String(index + 1).padStart(2, "0")}</span>
        </span>
        <span className="book-cover-title">{design.title}</span>
        <span className="book-cover-subtitle">{design.subtitle}</span>
        {media?.src ? (
          <span className="book-cover-image">
            <img
              alt=""
              decoding="async"
              draggable={false}
              height={400}
              loading="lazy"
              src={asset(media.src)}
              width={640}
            />
          </span>
        ) : null}
        <span className="book-cover-footer">
          {project.category}
          <span>→</span>
        </span>
      </span>
    </span>
  );
}

export default function BookCarousel({
  projects,
  media,
  renderDetails,
  active = true,
}: BookCarouselProps) {
  const count = projects.length;
  const step = count ? 360 / count : 360;
  const [rotation, setRotation] = useState(0);
  const [opened, setOpened] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [returning, setReturning] = useState(false);
  const [radius, setRadius] = useState(340);
  const [reducedMotion, setReducedMotion] = useState(true);
  const activeRef = useRef(active);
  const angleRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const stageRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const bookRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const returnFocusRef = useRef(false);
  const lastOpenedRef = useRef(0);
  const uniqueId = useId();
  const current = count ? mod(Math.round(-rotation / step), count) : 0;
  const isOpen = opened !== null && opened < count;
  const openedProject = isOpen ? projects[opened] : undefined;
  activeRef.current = active;

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null)
      cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
  }, []);

  const cancelGesture = useCallback(() => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    setDragging(false);
    if (gesture?.element.hasPointerCapture(gesture.pointer))
      gesture.element.releasePointerCapture(gesture.pointer);
  }, []);

  const canInteract = useCallback(() => {
    const stage = stageRef.current;
    return (
      activeRef.current &&
      !document.hidden &&
      Boolean(stage?.getClientRects().length) &&
      !stage?.closest('[hidden], [aria-hidden="true"], [inert]')
    );
  }, []);

  function updateAngle(angle: number) {
    angleRef.current = angle;
    setRotation(angle);
  }

  function rotateTo(target: number, focusBook = false) {
    if (!count || !canInteract()) return;
    stopAnimation();
    setReturning(false);
    const from = angleRef.current;
    const focus = () =>
      bookRefs.current[mod(Math.round(-target / step), count)]?.focus({
        preventScroll: true,
      });
    if (reducedMotion || Math.abs(target - from) < 0.01) {
      updateAngle(target);
      if (focusBook) focus();
      return;
    }
    const start = performance.now();
    const duration = Math.min(900, 480 + Math.abs(target - from) * 1.2);
    function frame(now: number) {
      animationRef.current = null;
      if (!canInteract()) return;
      const progress = Math.min(1, (now - start) / duration);
      updateAngle(from + (target - from) * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) animationRef.current = requestAnimationFrame(frame);
      else if (focusBook) focus();
    }
    animationRef.current = requestAnimationFrame(frame);
  }

  function browse(direction: number, focusBook = false) {
    rotateTo(
      Math.round(angleRef.current / step) * step - direction * step,
      focusBook,
    );
  }

  function choose(index: number, focusBook = false) {
    if (!count) return;
    const present = mod(Math.round(-angleRef.current / step), count);
    let distance = index - present;
    if (distance > count / 2) distance -= count;
    if (distance < -count / 2) distance += count;
    rotateTo(
      Math.round(angleRef.current / step) * step - distance * step,
      focusBook,
    );
  }

  function openBook(index: number) {
    if (!canInteract() || index < 0 || index >= count) return;
    stopAnimation();
    cancelGesture();
    lastOpenedRef.current = index;
    setReturning(false);
    setOpened(index);
  }

  function closeBook() {
    if (!canInteract()) return;
    returnFocusRef.current = true;
    setReturning(!reducedMotion);
    setOpened(null);
  }

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      stopAnimation();
      cancelGesture();
      setReturning(false);
      setReducedMotion(query.matches);
    };
    const pause = () => {
      if (document.hidden) {
        stopAnimation();
        cancelGesture();
      }
    };
    sync();
    query.addEventListener("change", sync);
    document.addEventListener("visibilitychange", pause);
    return () => {
      stopAnimation();
      cancelGesture();
      query.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", pause);
    };
  }, [cancelGesture, stopAnimation]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const resize = new ResizeObserver(([entry]) => {
      if (entry?.contentRect.width > 0)
        setRadius(Math.max(172, Math.min(360, entry.contentRect.width * 0.34)));
    });
    const visibility = new MutationObserver(() => {
      if (!canInteract()) {
        stopAnimation();
        cancelGesture();
      }
    });
    for (
      let ancestor: HTMLElement | null = stage;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      visibility.observe(ancestor, {
        attributes: true,
        attributeFilter: ["hidden", "aria-hidden", "inert", "class", "style"],
      });
    }
    resize.observe(stage);
    return () => {
      resize.disconnect();
      visibility.disconnect();
    };
  }, [cancelGesture, canInteract, stopAnimation]);

  useEffect(() => {
    if (!canInteract()) return;
    if (opened !== null) detailRef.current?.focus({ preventScroll: true });
    else if (returnFocusRef.current) {
      returnFocusRef.current = false;
      bookRefs.current[lastOpenedRef.current]?.focus({ preventScroll: true });
    }
  }, [opened, canInteract]);

  useEffect(() => {
    if (!active) {
      stopAnimation();
      cancelGesture();
    }
  }, [active, cancelGesture, stopAnimation]);

  useEffect(() => {
    stopAnimation();
    cancelGesture();
    setOpened(null);
    setReturning(false);
    angleRef.current = 0;
    setRotation(0);
  }, [count, cancelGesture, stopAnimation]);

  useEffect(() => {
    if (!returning) return undefined;
    const timeout = window.setTimeout(() => setReturning(false), 700);
    return () => window.clearTimeout(timeout);
  }, [returning]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!canInteract() || isOpen || !event.isPrimary || event.button !== 0)
      return;
    stopAnimation();
    cancelGesture();
    setReturning(false);
    // Some browsers hit the scene plane before a painted cover behind it in 3D.
    const direct =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-book-index]")
        : null;
    const hitBook =
      direct ??
      document
        .elementsFromPoint(event.clientX, event.clientY)
        .filter((element) => sceneRef.current?.contains(element))
        .map((element) => element.closest<HTMLElement>("[data-book-index]"))
        .find((element) => element !== null);
    const bookIndex = hitBook?.dataset.bookIndex;
    gestureRef.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      time: performance.now(),
      velocity: 0,
      startAngle: angleRef.current,
      moved: false,
      book: bookIndex === undefined ? undefined : Number(bookIndex),
      element: event.currentTarget,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointer !== event.pointerId || isOpen) return;
    if (!canInteract()) {
      cancelGesture();
      return;
    }
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
      cancelGesture();
      return;
    }
    if (!gesture.moved && Math.abs(dx) < 7) return;
    gesture.moved = true;
    setDragging(true);
    const now = performance.now();
    const multiplier = radius < 230 ? 0.38 : 0.25;
    gesture.velocity =
      ((event.clientX - gesture.lastX) / Math.max(8, now - gesture.time)) *
      multiplier;
    gesture.lastX = event.clientX;
    gesture.time = now;
    updateAngle(gesture.startAngle + dx * multiplier);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointer !== event.pointerId) return;
    cancelGesture();
    if (!canInteract()) return;
    if (!gesture.moved) {
      if (gesture.book !== undefined) openBook(gesture.book);
      return;
    }
    const velocity =
      performance.now() - gesture.time < 100
        ? Math.max(-0.8, Math.min(0.8, gesture.velocity))
        : 0;
    rotateTo(
      Math.round(
        (angleRef.current + (reducedMotion ? 0 : velocity * 170)) / step,
      ) * step,
    );
  }

  function onPointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (gestureRef.current?.pointer !== event.pointerId) return;
    cancelGesture();
    if (canInteract()) rotateTo(Math.round(angleRef.current / step) * step);
  }

  function onKeys(event: KeyboardEvent<HTMLElement>) {
    if (
      !canInteract() ||
      !(event.target instanceof Element) ||
      event.target.closest('dialog, [role="dialog"]')
    )
      return;
    if (isOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeBook();
      }
      return;
    }
    if (
      event.target.closest(
        'a, select, input, textarea, summary, [contenteditable="true"]',
      ) ||
      !sceneRef.current?.contains(event.target)
    )
      return;
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "ArrowLeft" || event.key === "ArrowRight")
        browse(
          event.key === "ArrowRight" ? 1 : -1,
          event.target !== sceneRef.current,
        );
      else
        choose(
          event.key === "Home" ? 0 : count - 1,
          event.target !== sceneRef.current,
        );
    } else if (
      (event.key === "Enter" || event.key === " ") &&
      event.target === sceneRef.current
    ) {
      event.preventDefault();
      openBook(current);
    }
  }

  if (!count) return null;

  return (
    <div
      aria-hidden={!active ? true : undefined}
      className="book-carousel"
      data-reduced-motion={reducedMotion}
      inert={!active}
    >
      <section
        aria-label="Featured project library"
        className="book-stage"
        data-dragging={dragging}
        data-open={isOpen}
        data-returning={returning}
        onKeyDown={onKeys}
        ref={stageRef}
      >
        <div className="book-stage-header">
          <span className="book-library-label">
            THE PROJECT LIBRARY{" "}
            <span>{String(count).padStart(2, "0")} VOLUMES</span>
          </span>
          {isOpen ? (
            <button className="book-close" onClick={closeBook} type="button">
              ← Back to the books <span aria-hidden="true">Esc</span>
            </button>
          ) : (
            <span className="book-drag-hint">
              Drag to rotate · Click to open
              <span>← → / Home / End · Enter opens</span>
            </span>
          )}
        </div>
        <div className="book-theatre">
          <div
            aria-label="Project books. Drag to rotate, or use arrow keys, Home and End. Press Enter to open the front book."
            aria-roledescription="carousel"
            className="book-scene"
            onLostPointerCapture={onPointerCancel}
            onPointerCancel={onPointerCancel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            ref={sceneRef}
            role="region"
            tabIndex={isOpen ? -1 : 0}
          >
            {projects.map((project, index) => {
              const theta = ((index * step + rotation) * Math.PI) / 180;
              const x = Math.sin(theta) * radius;
              const z = Math.cos(theta) * radius - radius;
              const y = (Math.cos(theta) - 1) * 26;
              const selected = opened === index;
              return (
                <div
                  className="book-orbit-item"
                  data-return-book={index === lastOpenedRef.current}
                  data-selected={selected}
                  key={project.title}
                  style={
                    {
                      "--orbit-x": `${x.toFixed(3)}px`,
                      "--orbit-y": `${y.toFixed(3)}px`,
                      "--orbit-z": `${z.toFixed(3)}px`,
                      "--book-order": index,
                    } as CSSProperties
                  }
                >
                  <button
                    aria-controls={`${uniqueId}-details`}
                    aria-expanded={selected}
                    aria-hidden={isOpen ? true : undefined}
                    aria-label={`Open ${project.title} project details`}
                    className="book-click"
                    data-book-index={index}
                    disabled={isOpen || !active}
                    onClick={(event) => {
                      if (event.detail === 0 && !isOpen) openBook(index);
                    }}
                    ref={(element) => {
                      bookRefs.current[index] = element;
                    }}
                    tabIndex={!isOpen && current === index ? 0 : -1}
                    type="button"
                  >
                    <Book
                      index={index}
                      media={media[project.title]}
                      project={project}
                    />
                  </button>
                </div>
              );
            })}
          </div>
          <div
            aria-label={
              openedProject
                ? `${openedProject.title} project details`
                : "Project details"
            }
            className="book-details"
            hidden={!isOpen}
            id={`${uniqueId}-details`}
            ref={detailRef}
            role="region"
            tabIndex={-1}
          >
            {openedProject && opened !== null
              ? renderDetails(openedProject, media[openedProject.title], opened)
              : null}
          </div>
        </div>
        {!isOpen ? (
          <div className="book-browse-controls">
            <button
              aria-label="Rotate to previous book"
              className="book-arrow"
              disabled={count < 2}
              onClick={() => browse(-1)}
              type="button"
            >
              ←
            </button>
            <div className="book-current">
              <span>
                {String(current + 1).padStart(2, "0")} /{" "}
                {String(count).padStart(2, "0")}
              </span>
              <button
                onClick={() => openBook(current)}
                type="button"
                aria-label={`Open project: ${projects[current].title}`}
              >
                <span className="book-current-action">Open project</span>
                <span className="book-current-name">
                  {projects[current].title} <span aria-hidden="true">↗</span>
                </span>
              </button>
            </div>
            <button
              aria-label="Rotate to next book"
              className="book-arrow"
              disabled={count < 2}
              onClick={() => browse(1)}
              type="button"
            >
              →
            </button>
          </div>
        ) : null}
        {!isOpen ? (
          <div aria-label="Choose a project book" className="book-index">
            {projects.map((project, index) => (
              <button
                aria-current={current === index ? "true" : undefined}
                aria-label={`Bring ${project.title} to the front`}
                key={project.title}
                onClick={() => choose(index)}
                type="button"
              >
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="book-index-title">
                  {coverFor(project, index).title}
                </span>
              </button>
            ))}
          </div>
        ) : null}
        <span className="book-screenreader-status" role="status">
          {!isOpen && !dragging
            ? `Front book: ${projects[current].title}. ${current + 1} of ${count}.`
            : ""}
        </span>
      </section>
    </div>
  );
}
