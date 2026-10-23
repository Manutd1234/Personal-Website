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
  highlights?: readonly string[];
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
  requestedProject?: string;
  requestKey?: number;
};

const COVER_DESIGNS = [
  {
    title: "AlphaEngine",
    subtitle: "Markets, data & execution",
    color: "#007c59",
    ink: "#fff8dc",
    font: '"SFMono-Regular", Consolas, monospace',
    layout: "terminal",
    mark: "α",
  },
  {
    title: "BrainHack",
    subtitle: "TIL-AI · Novice Champions",
    color: "#f4d875",
    ink: "#183e31",
    font: '"Arial Black", "Helvetica Neue", sans-serif',
    layout: "poster",
    mark: "AI",
  },
  {
    title: "Delta1",
    subtitle: "Notes on systematic trading",
    color: "#24484b",
    ink: "#fffbed",
    font: "Baskerville, Georgia, serif",
    layout: "journal",
    mark: "Δ",
  },
  {
    title: "RE:\nDECIDE",
    subtitle: "A closer look at the game",
    color: "#a1b9dc",
    ink: "#1e314e",
    font: 'Impact, "Arial Narrow", sans-serif',
    layout: "field",
    mark: ".dem",
  },
  {
    title: "Fraud\nCrew",
    subtitle: "AI with a human in the loop",
    color: "#b76e53",
    ink: "#f7edbc",
    font: 'Georgia, "Times New Roman", serif',
    layout: "dossier",
    mark: "human / AI",
  },
  {
    title: "Obital",
    subtitle: "An offline-first study space",
    color: "#c6b8e3",
    ink: "#3d2c5c",
    font: "Baskerville, Georgia, serif",
    layout: "orbit",
    mark: "○",
  },
  {
    title: "Portfolio\n& Risk",
    subtitle: "NUSSIF · Investment infrastructure",
    color: "#415a82",
    ink: "#eef2d7",
    font: '"Palatino Linotype", Palatino, Georgia, serif',
    layout: "ledger",
    mark: "VaR / ES",
  },
  {
    title: "PneuRelief",
    subtitle: "Cast-pressure monitoring",
    color: "#e8b4bb",
    ink: "#632c43",
    font: '"Avenir Next", "Trebuchet MS", sans-serif',
    layout: "clinical",
    mark: "BLE",
  },
  {
    title: "Sign\nMe Up",
    subtitle: "Tools for independent living",
    color: "#dca24b",
    ink: "#46321c",
    font: 'Georgia, "Times New Roman", serif',
    layout: "gesture",
    mark: "hello.",
  },
  {
    title: "Nexus",
    subtitle: "An academic coach & focus space",
    color: "#95c6c3",
    ink: "#174d51",
    font: '"Trebuchet MS", "Avenir Next", sans-serif',
    layout: "notebook",
    mark: "learn / focus",
  },
  {
    title: "Deal\nMachine",
    subtitle: "Research. Documents. Deals.",
    color: "#684568",
    ink: "#f6e1a5",
    font: "Baskerville, Georgia, serif",
    layout: "deal",
    mark: "↗",
  },
  {
    title: "Coca-Cola",
    subtitle: "Indonesia growth strategy",
    color: "#b84b49",
    ink: "#fff4db",
    font: '"Helvetica Neue", Arial, sans-serif',
    layout: "strategy",
    mark: "Jakarta",
  },
] as const;
const DESIGN_INDEX: Readonly<Record<string, number | undefined>> = {
  AlphaEngine: 0,
  "BrainHack TIL-AI": 1,
  "Delta1 Research": 2,
  "CS2 Decision Coach": 3,
  "Agentic Fraud Investigation Crew": 4,
  Obital: 5,
  "NUSSIF Portfolio & Risk Tools": 6,
  PneuRelief: 7,
  SignMeUp: 8,
  "Nexus Academic Coach": 9,
  DealMachine: 10,
  "Coca-Cola Indonesia growth strategy": 11,
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
  const thickness = [30, 26, 34, 28, 32, 24, 34, 26, 28, 26, 32, 30][
    DESIGN_INDEX[project.title] ?? index % COVER_DESIGNS.length
  ];
  return (
    <span
      aria-hidden="true"
      className="book-object"
      data-cover-layout={design.layout}
      style={
        {
          "--cover": design.color,
          "--cover-ink": design.ink,
          "--cover-font": design.font,
          "--book-depth": `${thickness}px`,
        } as CSSProperties
      }
    >
      <span className="book-back">
        <span>IAN WANGSA</span>
        <span>{design.title}</span>
        <small>{project.category}</small>
      </span>
      <span className="book-spine">
        <b>{design.title}</b>
        <small>IW</small>
      </span>
      <span className="book-page-block">
        <span className="book-pages book-pages-front" />
        <span className="book-pages book-pages-back" />
        <span className="book-pages book-pages-side" />
        <span className="book-pages book-pages-binding" />
        <span className="book-pages book-pages-top" />
        <span className="book-pages book-pages-bottom" />
      </span>
      <span className="book-under-leaf book-under-leaf-first" />
      <span className="book-under-leaf book-under-leaf-second" />
      <span className="book-page-leaf">
        <span className="book-leaf-front">
          <span className="book-leaf-eyebrow">PROJECT NOTES</span>
          <span className="book-leaf-title">{project.title}</span>
          <span className="book-leaf-category">{project.category}</span>
          <span className="book-leaf-rule" />
          <span className="book-leaf-tools">
            {project.tags.slice(0, 3).join(" / ")}
          </span>
          <span className="book-leaf-signature">Ian Wangsa</span>
        </span>
        <span className="book-leaf-back" />
      </span>
      <span className="book-cover-hinge">
        <span className="book-front">
          <span className="book-cover-author">IAN WANGSA</span>
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
          ) : (
            <span className="book-cover-mark">{design.mark}</span>
          )}
          <span className="book-cover-footer">
            {project.category}
            <span>→</span>
          </span>
        </span>
        <span className="book-inside-cover">
          <span>IAN WANGSA</span>
          <span className="book-inside-title">{design.title}</span>
          <span>{project.category}</span>
        </span>
        <span className="book-cover-edge" />
      </span>
    </span>
  );
}

export default function BookCarousel({
  projects,
  media,
  renderDetails,
  active = true,
  requestedProject,
  requestKey,
}: BookCarouselProps) {
  const count = projects.length;
  const step = count ? 360 / count : 360;
  const [currentState, setCurrent] = useState(0);
  const [opened, setOpened] = useState<number | null>(null);
  const [opening, setOpening] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [returning, setReturning] = useState(false);
  const radius = 340;
  const [reducedMotion, setReducedMotion] = useState(true);
  const activeRef = useRef(active);
  const angleRef = useRef(0);
  const targetAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const currentRef = useRef(0);
  const radiusRef = useRef(radius);
  const animationRef = useRef<number | null>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const stageRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const theatreRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const resizeTheatreRef = useRef<() => void>(() => {});
  const detailRef = useRef<HTMLDivElement>(null);
  const orbitRefs = useRef<Array<HTMLDivElement | null>>([]);
  const bookRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const returnFocusRef = useRef(false);
  const lastOpenedRef = useRef(0);
  const lastRequestRef = useRef<string | null>(null);
  const uniqueId = useId();
  const current = count ? mod(currentState, count) : 0;
  const isOpen = opened !== null && opened < count;
  const detailIndex = opened ?? (returning ? lastOpenedRef.current : null);
  const openedProject =
    detailIndex !== null ? projects[detailIndex] : undefined;
  activeRef.current = active;

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null)
      cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    velocityRef.current = 0;
    stageRef.current?.removeAttribute("data-rotating");
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

  const updateAngle = useCallback(
    (angle: number) => {
      angleRef.current = angle;
      orbitRefs.current.forEach((node, index) => {
        if (!node) return;
        const theta = ((index * step + angle) * Math.PI) / 180;
        node.style.setProperty(
          "--orbit-x",
          `${Math.sin(theta) * radiusRef.current}px`,
        );
        node.style.setProperty("--orbit-turn", `${Math.sin(theta) * 12}deg`);
        node.style.setProperty("--orbit-y", `${(Math.cos(theta) - 1) * 26}px`);
        node.style.setProperty(
          "--orbit-z",
          `${Math.cos(theta) * radiusRef.current - radiusRef.current}px`,
        );
      });
      const front = count ? mod(Math.round(-angle / step), count) : 0;
      if (front !== currentRef.current) {
        currentRef.current = front;
        setCurrent(front);
      }
    },
    [count, step],
  );

  function rotateTo(target: number, focusBook = false, onSettled?: () => void) {
    if (!count || !canInteract()) return;
    let velocity = velocityRef.current;
    stopAnimation();
    setReturning(false);
    targetAngleRef.current = target;
    let position = angleRef.current;
    const focus = () =>
      bookRefs.current[mod(Math.round(-target / step), count)]?.focus({
        preventScroll: true,
      });
    const finish = () => {
      updateAngle(target);
      velocityRef.current = 0;
      stageRef.current?.removeAttribute("data-rotating");
      if (focusBook) focus();
      onSettled?.();
    };
    if (
      reducedMotion ||
      (Math.abs(target - position) < 0.01 && Math.abs(velocity) < 0.1)
    ) {
      finish();
      return;
    }
    let previous = performance.now();
    stageRef.current?.setAttribute("data-rotating", "true");
    const start = previous;
    function frame(now: number) {
      animationRef.current = null;
      if (!canInteract()) {
        velocityRef.current = 0;
        stageRef.current?.removeAttribute("data-rotating");
        return;
      }
      const dt = Math.min(0.04, Math.max(0.001, (now - previous) / 1000));
      previous = now;
      // Exact critically damped spring: preserve velocity when a new command
      // arrives, without restarting an ease-out curve at zero speed.
      const omega = 12;
      const distance = position - target;
      const coupling = velocity + omega * distance;
      const decay = Math.exp(-omega * dt);
      position = target + (distance + coupling * dt) * decay;
      velocity = (velocity - omega * coupling * dt) * decay;
      velocityRef.current = velocity;
      updateAngle(position);
      if (
        (Math.abs(position - target) < 0.015 && Math.abs(velocity) < 0.12) ||
        now - start > 2200
      )
        finish();
      else animationRef.current = requestAnimationFrame(frame);
    }
    animationRef.current = requestAnimationFrame(frame);
  }

  function browse(direction: number, focusBook = false) {
    if (returning) return;
    const destination =
      animationRef.current !== null
        ? targetAngleRef.current
        : Math.round(angleRef.current / step) * step;
    rotateTo(destination - direction * step, focusBook);
  }

  function choose(index: number, focusBook = false, onSettled?: () => void) {
    if (!count) return;
    const distance = mod(-index * step - angleRef.current + 180, 360) - 180;
    rotateTo(angleRef.current + distance, focusBook, onSettled);
  }

  function openBook(index: number) {
    if (!canInteract() || index < 0 || index >= count) return;
    stopAnimation();
    cancelGesture();
    lastOpenedRef.current = index;
    setReturning(false);
    setOpened(index);
    // An opening is an event even if this exact book was already open in a
    // hidden Projects tab. Keep focus in sync when React batches the same index.
    setOpening((previous) => previous + 1);
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
      stageRef.current?.toggleAttribute("data-suspended", document.hidden);
      if (document.hidden) {
        stopAnimation();
        cancelGesture();
      }
    };
    sync();
    pause();
    query.addEventListener("change", sync);
    document.addEventListener("visibilitychange", pause);
    return () => {
      stopAnimation();
      cancelGesture();
      stageRef.current?.removeAttribute("data-suspended");
      query.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", pause);
    };
  }, [cancelGesture, stopAnimation]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const resize = new ResizeObserver(([entry]) => {
      if (entry?.contentRect.width > 0) {
        const bookWidth =
          parseFloat(getComputedStyle(orbitRefs.current[0] ?? stage).width) ||
          170;
        const spacingRadius =
          count > 2 ? (bookWidth / (2 * Math.sin(Math.PI / count))) * 1.02 : 0;
        radiusRef.current = Math.max(
          spacingRadius,
          172,
          Math.min(360, entry.contentRect.width * 0.34),
        );
        updateAngle(angleRef.current);
      }
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
  }, [cancelGesture, canInteract, count, stopAnimation, updateAngle]);

  useEffect(() => {
    const theatre = theatreRef.current;
    const flow = flowRef.current;
    if (!theatre || !flow) return;
    let animation: Animation | null = null;
    let measured = false;
    const resize = () => {
      const next = Math.ceil(
        stageRef.current?.dataset.open === "true"
          ? flow.getBoundingClientRect().height
          : parseFloat(getComputedStyle(flow).minHeight),
      );
      if (!next) return;
      const from = theatre.getBoundingClientRect().height;
      animation?.cancel();
      theatre.style.height = `${next}px`;
      if (measured && !reducedMotion && Math.abs(next - from) > 1) {
        animation = theatre.animate(
          [{ height: `${from}px` }, { height: `${next}px` }],
          {
            duration: 560,
            easing: "cubic-bezier(.22,.7,.15,1)",
          },
        );
      }
      measured = true;
    };
    const observer = new ResizeObserver(resize);
    resizeTheatreRef.current = resize;
    observer.observe(flow);
    resize();
    return () => {
      observer.disconnect();
      animation?.cancel();
      theatre.style.height = "";
      resizeTheatreRef.current = () => {};
    };
  }, [reducedMotion]);

  useEffect(() => {
    resizeTheatreRef.current();
  }, [isOpen]);

  useEffect(() => {
    if (!canInteract()) return;
    if (opened !== null) detailRef.current?.focus({ preventScroll: true });
    else if (returnFocusRef.current && !returning) {
      returnFocusRef.current = false;
      bookRefs.current[lastOpenedRef.current]?.focus({ preventScroll: true });
    }
  }, [opened, opening, returning, canInteract]);

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
    targetAngleRef.current = 0;
    updateAngle(0);
  }, [count, cancelGesture, stopAnimation, updateAngle]);

  useEffect(() => {
    if (!returning) return undefined;
    const timeout = window.setTimeout(() => setReturning(false), 660);
    return () => window.clearTimeout(timeout);
  }, [returning]);

  useEffect(() => {
    if (!active || !requestedProject || !canInteract()) return;
    const request = `${requestedProject}:${requestKey ?? 0}`;
    if (lastRequestRef.current === request) return;
    const index = projects.findIndex(
      (project) => project.title === requestedProject,
    );
    if (index < 0) return;
    lastRequestRef.current = request;
    setOpened(null);
    setReturning(false);
    choose(index, false, () => openBook(index));
    // A request is an event; later renders must not restart its spring.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, requestedProject, requestKey]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (
      !canInteract() ||
      isOpen ||
      returning ||
      !event.isPrimary ||
      event.button !== 0
    )
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
    if (!gesture.moved) {
      gesture.moved = true;
      setDragging(true);
    }
    const now = performance.now();
    const multiplier = radiusRef.current < 230 ? 0.38 : 0.25;
    const sample =
      ((event.clientX - gesture.lastX) / Math.max(8, now - gesture.time)) *
      multiplier;
    const smoothing = 1 - Math.exp(-(now - gesture.time) / 40);
    gesture.velocity += (sample - gesture.velocity) * smoothing;
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
    velocityRef.current = velocity * 1000;
    const momentum = reducedMotion
      ? 0
      : Math.max(-step * 2.2, Math.min(step * 2.2, velocity * 180));
    rotateTo(Math.round((angleRef.current + momentum) / step) * step);
  }

  function onPointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (gestureRef.current?.pointer !== event.pointerId) return;
    cancelGesture();
    if (canInteract()) rotateTo(Math.round(angleRef.current / step) * step);
  }

  function onKeys(event: KeyboardEvent<HTMLElement>) {
    if (
      !canInteract() ||
      returning ||
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
          <span className="book-library-label">THE PROJECT LIBRARY</span>
          {isOpen ? (
            <button className="book-close" onClick={closeBook} type="button">
              ← Back to the books <span aria-hidden="true">Esc</span>
            </button>
          ) : (
            <span className="book-drag-hint">
              Drag to browse · Click to open
              <span className="book-keyboard-hint">
                ← → / Home / End · Enter opens
              </span>
            </span>
          )}
        </div>
        <div className="book-theatre" ref={theatreRef}>
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
              // Stable SSR seed; updateAngle owns these CSS variables after
              // mount, so a label update cannot rewind the animated pose.
              const theta = (index * step * Math.PI) / 180;
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
                  ref={(node) => {
                    orbitRefs.current[index] = node;
                  }}
                  style={
                    {
                      "--orbit-x": `${x.toFixed(3)}px`,
                      "--orbit-y": `${y.toFixed(3)}px`,
                      "--orbit-z": `${z.toFixed(3)}px`,
                      "--orbit-turn": `${Math.sin(theta) * 12}deg`,
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
                    disabled={isOpen || returning || !active}
                    onClick={(event) => {
                      if (event.detail === 0 && !isOpen) openBook(index);
                    }}
                    ref={(element) => {
                      bookRefs.current[index] = element;
                    }}
                    tabIndex={
                      !isOpen && !returning && current === index ? 0 : -1
                    }
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
          <div className="book-theatre-flow" ref={flowRef}>
            <div
              aria-label={
                openedProject
                  ? `${openedProject.title} project details`
                  : "Project details"
              }
              className="book-details"
              hidden={!isOpen && !returning}
              aria-hidden={!isOpen ? true : undefined}
              inert={!isOpen}
              id={`${uniqueId}-details`}
              ref={detailRef}
              role="region"
              tabIndex={-1}
            >
              {openedProject && detailIndex !== null
                ? renderDetails(
                    openedProject,
                    media[openedProject.title],
                    detailIndex,
                  )
                : null}
            </div>
          </div>
        </div>
        {!isOpen ? (
          <div className="book-browse-controls">
            <button
              aria-label="Rotate to previous book"
              className="book-arrow"
              disabled={count < 2 || returning}
              onClick={() => browse(-1)}
              type="button"
            >
              ←
            </button>
            <div className="book-current">
              <button
                disabled={returning}
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
              disabled={count < 2 || returning}
              onClick={() => browse(1)}
              type="button"
            >
              →
            </button>
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
