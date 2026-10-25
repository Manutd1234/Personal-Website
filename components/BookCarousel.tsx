"use client";

import { memo, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
} from "react";

import { asset } from "@/content/paths";
import { BOOK_MOTION, getBookHandoffTransform, getBookLiftGeometry, getBookSceneIndexes, queueBookTransition, runBookTransition, type BookTransition, type BookTransitionLaunch } from "./book-transition";
import { startBookClose, type BookCloseTransition } from "./book-close";
import { BookClosingContext, OpeningContext, OpeningNotes, openingPageTitles } from "./ProjectBookOpening";
import "@/app/book-carousel.css";
import "@/app/project-book-reader.css";
import "@/app/book-motion.css";
import "@/app/book-close.css";

const BOOK_TRANSITION_MS = BOOK_MOTION.duration;
type BookMotionTrack = { element: HTMLElement; frames: Keyframe[] };

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
  gallery?: readonly {
    title: string;
    src: string;
    alt: string;
    caption: string;
  }[];
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
type BookCover = { [Key in keyof (typeof COVER_DESIGNS)[number]]: string };
const EXPANDED_COVERS: Readonly<Record<string, BookCover | undefined>> = {
  "ML Trainee: Credit Risk": {
    ...COVER_DESIGNS[6], title: "Credit\nRisk", subtitle: "ML Trainee · From data to evidence",
    color: "#d6b783", ink: "#433222", mark: "fit / validate / test",
  },
  "CrossFlow AI": {
    ...COVER_DESIGNS[0], title: "CrossFlow\nAI", subtitle: "Roads, ferries & the route between",
    color: "#28698a", ink: "#f6f1d5", mark: "A → B",
  },
  "IBKR Scenario Stress Test": {
    ...COVER_DESIGNS[6], title: "IBKR\nStress Test", subtitle: "A portfolio under pressure",
    color: "#bdc8a1", ink: "#294338", mark: "Δ / Γ / VaR",
  },
  "EC2 Recovery & Trade Automation": {
    ...COVER_DESIGNS[0], title: "EC2 +\nTrades", subtitle: "Recovery, risk & order control",
    color: "#334d63", ink: "#f1dfad", mark: "lease → act",
  },
  "Portfolio Manager Competition": {
    ...COVER_DESIGNS[6], title: "PM\nCompetition", subtitle: "Holdings, performance & risk",
    color: "#a55943", ink: "#fff1d1", mark: "NAV / ES",
  },
  "Internal Trading Competition": {
    ...COVER_DESIGNS[6], title: "Internal\nTrading", subtitle: "The competition behind the returns",
    color: "#716085", ink: "#f7e7c4", mark: "return / risk",
  },
  FormForward: {
    ...COVER_DESIGNS[7], title: "Form\nForward", subtitle: "Running form, explained",
    color: "#b4cca8", ink: "#254d39", layout: "terminal", mark: "stride → insight",
  },
  "RiskSignal · SAP Group 4": {
    ...COVER_DESIGNS[0], title: "RiskSignal", subtitle: "SAP Group 4 · Explainable triage",
    color: "#4c638c", ink: "#fff0d0", mark: "risk ≠ urgency",
  },
  "Panic at the Classroom": {
    ...COVER_DESIGNS[3], title: "PANIC AT\nCLASSROOM", subtitle: "A playful desktop vision experiment",
    color: "#e3a56b", ink: "#4c3229", layout: "poster", mark: "⌘ ⇧ P",
  },
  Help4Good: {
    ...COVER_DESIGNS[7], title: "Help4Good", subtitle: "A conversation about care",
    color: "#8daf9f", ink: "#203f34", layout: "terminal", mark: "listen / reflect",
  },
};
const BOOK_DEPTHS = [30, 26, 34, 28, 32, 24, 34, 26, 28, 26, 32, 30];
function coverFor(project: Project, index: number): BookCover {
  const known = DESIGN_INDEX[project.title];
  if (known !== undefined) return COVER_DESIGNS[known];
  const custom = EXPANDED_COVERS[project.title];
  if (custom) return custom;
  // Reuse the palette, never another project's printed identity.
  return {
    ...COVER_DESIGNS[index % COVER_DESIGNS.length],
    title: project.title, subtitle: project.category, layout: "terminal", mark: "IW",
  };
}

function sizePreviewPages(stage: HTMLElement, book: HTMLElement, pageWidth: number, pageHeight: number, single: boolean) {
  stage.style.setProperty("--preview-page-width", `${pageWidth}px`);
  stage.style.setProperty("--preview-page-height", `${pageHeight}px`);
  stage.style.setProperty("--preview-cover-scale-x", `${book.offsetWidth / pageWidth}`);
  stage.style.setProperty("--preview-cover-scale-y", `${book.offsetHeight / pageHeight}`);
  stage.style.setProperty("--preview-leaf-scale-x", `${(book.offsetWidth - 8) / pageWidth}`);
  stage.style.setProperty("--preview-leaf-scale-y", `${(book.offsetHeight - 8) / pageHeight}`);
  stage.dataset.previewSingle = String(single);
}

type CoverPoint = { x: number; y: number };

function pointInsideCover(points: readonly CoverPoint[], x: number, y: number) {
  if (points.length !== 4) return false;
  let direction = 0;
  for (let index = 0; index < points.length; index++) {
    const from = points[index];
    const to = points[(index + 1) % points.length];
    const cross =
      (to.x - from.x) * (y - from.y) - (to.y - from.y) * (x - from.x);
    if (Math.abs(cross) < 0.01) continue;
    if (direction && Math.sign(cross) !== direction) return false;
    direction = Math.sign(cross);
  }
  return direction !== 0;
}

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

function BookOpeningPage({ project, page }: { project: Project; page: 0 | 1 }) {
  return <span className="reader-page book-preview-page" data-kind={page === 0 ? "title" : undefined}>
    <span className="reader-page-header"><span>{project.title}</span><span>0{page + 1}</span></span>
    <span className="reader-page-body">
      {page === 0 ? <OpeningNotes project={project} preview /> : <>
        <span className="reader-chapter-title">{openingPageTitles[1]}</span>
        <OpeningContext project={project} preview />
      </>}
    </span>
    <span className="reader-page-footer"><span>{openingPageTitles[page]}</span><span>{page + 1}</span></span>
  </span>;
}

const Book = memo(function Book({
  project,
  index,
  media,
  showPages,
}: {
  project: Project;
  index: number;
  media?: ProjectMedia;
  showPages: boolean;
}) {
  const design = coverFor(project, index);
  const thickness = BOOK_DEPTHS[(DESIGN_INDEX[project.title] ?? index) % BOOK_DEPTHS.length];
  return (
    <span
      aria-hidden="true"
      className="book-object"
      data-cover-art="screenshot"
      data-cover-layout={design.layout}
      data-cover-material={
        ["terminal", "journal", "ledger", "deal"].includes(design.layout)
          ? "cloth"
          : "paper"
      }
      style={
        {
          "--cover": design.color,
          "--cover-ink": design.ink,
          "--cover-font": design.font,
          "--book-depth": `${thickness}px`,
        } as CSSProperties
      }
    >
      <span className="book-hover-surface">
        <span className="book-hit-corner" data-book-hover-corner="nw" />
        <span className="book-hit-corner" data-book-hover-corner="ne" />
        <span className="book-hit-corner" data-book-hover-corner="se" />
        <span className="book-hit-corner" data-book-hover-corner="sw" />
      </span>
      <span className="book-back">
        <span>IAN WANGSA</span>
        <span>{design.title}</span>
        <small>{project.category}</small>
      </span>
      <span className="book-back-lining" />
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
          <span className="book-original-preview">{showPages ? <BookOpeningPage project={project} page={1} /> : null}</span>
        </span>
        <span className="book-leaf-back" />
      </span>
      <span className="book-cover-hinge">
        <span className="book-front">
          <span className="book-cover-author">IAN WANGSA <span>VOL. {String(index + 1).padStart(2, "0")}</span></span>
          <span className="book-cover-title">{design.title}</span>
          <span className="book-cover-subtitle">{design.subtitle}</span>
          <span className="book-cover-image">
            {media ? <img
              alt=""
              src={asset(media.src)}
              width={1280}
              height={800}
              decoding="async"
              draggable={false}
            /> : <span className="book-cover-mark">{design.mark}</span>}
          </span>
          <span className="book-cover-footer">
            {project.category}
            <span>→</span>
          </span>
          {/* Points retain the cover's real projected shape for pointer picking. */}
          <span className="book-hit-corner" data-book-hit-corner="nw" />
          <span className="book-hit-corner" data-book-hit-corner="ne" />
          <span className="book-hit-corner" data-book-hit-corner="se" />
          <span className="book-hit-corner" data-book-hit-corner="sw" />
        </span>
        <span className="book-inside-cover">
          <span className="book-original-preview">{showPages ? <BookOpeningPage project={project} page={0} /> : null}</span>
        </span>
        <span className="book-cover-edge" />
      </span>
    </span>
  );
});

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
  const [destination, setDestination] = useState<number | null>(null);
  const [opened, setOpened] = useState<number | null>(null);
  const [opening, setOpening] = useState(0);
  const [readerReady, setReaderReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
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
  const pendingRevealRef = useRef(false);
  const gestureRef = useRef<Gesture | null>(null);
  const stageRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const theatreRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<BookTransition | null>(null);
  const closeTransitionRef = useRef<BookCloseTransition | null>(null);
  const launchFrameRef = useRef<BookTransitionLaunch | null>(null);
  const closingRef = useRef(false);
  const openingPoseRef = useRef<{
    transforms: Map<HTMLElement, string>;
  } | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const orbitRefs = useRef<Array<HTMLDivElement | null>>([]);
  const bookRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const returnFocusRef = useRef(false);
  const pendingShelfFocusRef = useRef<number | null>(null);
  const lastOpenedRef = useRef(0);
  const lastRequestRef = useRef<string | null>(null);
  const uniqueId = useId();
  const current = count ? mod(currentState, count) : 0;
  const displayedBook = current;
  const browsing = destination !== null || dragging;
  const isOpen = opened !== null && opened < count;
  const detailIndex = opened ?? (returning ? lastOpenedRef.current : null);
  const openedProject =
    detailIndex !== null ? projects[detailIndex] : undefined;
  activeRef.current = active;

  const stopBookTransition = useCallback(() => {
    launchFrameRef.current?.cancel();
    launchFrameRef.current = null;
    transitionRef.current?.cancel();
    transitionRef.current = null;
    closeTransitionRef.current?.cancel();
    closeTransitionRef.current = null;
    closingRef.current = false;
    stageRef.current?.setAttribute("data-motion-phase", "shelf");
  }, []);

  const finishBookTransition = useCallback(() => {
    // An opening may still be waiting for the reader's layout frame. Settle
    // that pending launch as well as any animation already in progress.
    launchFrameRef.current?.finish();
    launchFrameRef.current = null;
    transitionRef.current?.finish();
    closeTransitionRef.current?.finish();
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null)
      cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    setDestination(null);
    pendingRevealRef.current = false;
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
        node.style.setProperty("--orbit-turn", `${(Math.sin(theta) * 12).toFixed(3)}deg`);
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
    // Browsing or a project link can interrupt closing. Do not restore focus
    // to the old book while its replacement moves into view.
    returnFocusRef.current = false;
    let velocity = velocityRef.current;
    setHovered(null);
    stopAnimation();
    stopBookTransition();
    pendingRevealRef.current = Boolean(onSettled);
    setReturning(false);
    targetAngleRef.current = target;
    let position = angleRef.current;
    const focus = () => {
      const index = mod(Math.round(-target / step), count);
      const element = bookRefs.current[index];
      if (element) element.focus({ preventScroll: true });
      else pendingShelfFocusRef.current = index;
    };
    const finish = () => {
      pendingRevealRef.current = false;
      setDestination(null);
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
    setDestination(mod(Math.round(-target / step), count));
    let previous = performance.now();
    stageRef.current?.setAttribute("data-rotating", "true");
    const start = previous;
    function frame(now: number) {
      animationRef.current = null;
      if (!canInteract()) {
        stopAnimation();
        return;
      }
      const dt = Math.min(0.04, Math.max(0.001, (now - previous) / 1000));
      previous = now;
      // Exact critically damped spring: preserve velocity when a new command
      // arrives, without restarting an ease-out curve at zero speed.
      // A selected cover should arrive promptly; browsing keeps its softer
      // momentum while a click-to-read uses a slightly firmer spring.
      const omega = onSettled ? 17 : 14;
      const distance = position - target;
      const coupling = velocity + omega * distance;
      const decay = Math.exp(-omega * dt);
      position = target + (distance + coupling * dt) * decay;
      velocity = (velocity - omega * coupling * dt) * decay;
      velocityRef.current = velocity;
      updateAngle(position);
      if (
        (Math.abs(position - target) < 0.045 && Math.abs(velocity) < 0.5) ||
        now - start > 1600
      )
        finish();
      else animationRef.current = requestAnimationFrame(frame);
    }
    animationRef.current = requestAnimationFrame(frame);
  }

  function browse(direction: number, focusBook = false) {
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

  function isCenteredBook(index: number) {
    const distance = mod(index * step + angleRef.current + 180, 360) - 180;
    return (
      index === currentRef.current &&
      animationRef.current === null &&
      Math.abs(distance) < 0.15
    );
  }

  function revealBook(index: number) {
    if (!canInteract() || index < 0 || index >= count || !isCenteredBook(index))
      return;
    stopBookTransition();
    const book = orbitRefs.current[index];
    const transforms = new Map<HTMLElement, string>();
    if (book) {
      [book, ...book.querySelectorAll<HTMLElement>(".book-click, .book-object, .book-cover-hinge, .book-page-leaf, .book-under-leaf")]
        .forEach((element) => transforms.set(element, getComputedStyle(element).transform));
    }
    openingPoseRef.current = {
      transforms,
    };
    setHovered(null);
    cancelGesture();
    returnFocusRef.current = false;
    lastOpenedRef.current = index;
    setReturning(false);
    setReaderReady(false);
    setOpened(index);
    setOpening((previous) => previous + 1);
  }

  function openBook(index: number) {
    // Manual activation never selects a side book or queues a future book.
    if (isOpen || returning || gestureRef.current?.moved) return;
    revealBook(index);
  }

  function closeBook() {
    if (!canInteract() || !isOpen) return;
    setHovered(null);
    stopAnimation();
    cancelGesture();
    returnFocusRef.current = true;
    closeRef.current?.focus({ preventScroll: true });
    if (!reducedMotion) {
      closingRef.current = true;
      setReturning(true);
      // Let an in-flight opening/page turn reach its visible endpoint. The
      // dedicated closing model then owns the entire fold and shelf return.
    } else {
      stopBookTransition();
      stageRef.current?.setAttribute("data-motion-phase", "shelf");
      setReturning(false);
      setReaderReady(false);
    }
    setOpened(null);
  }

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      stopAnimation();
      cancelGesture();
      finishBookTransition();
      setReducedMotion(query.matches);
      updateAngle(Math.round(angleRef.current / step) * step);
    };
    const pause = () => {
      stageRef.current?.toggleAttribute("data-suspended", document.hidden);
      if (document.hidden) {
        finishBookTransition();
        stopAnimation();
        cancelGesture();
        updateAngle(Math.round(angleRef.current / step) * step);
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
  }, [cancelGesture, finishBookTransition, stopAnimation, step, updateAngle]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let width = 0;
    const resize = new ResizeObserver(([entry]) => {
      const nextWidth = entry?.contentRect.width ?? 0;
      if (nextWidth <= 0 || Math.abs(nextWidth - width) < 1) return;
      width = nextWidth;
      // Resize is a discrete boundary. Settle active motion before re-laying
      // out the shelf; do not rebuild keyframes from a ResizeObserver callback.
      finishBookTransition();
      const book = orbitRefs.current[currentRef.current];
      const bookWidth = book?.offsetWidth || 170;
      const spacingRadius = count > 2 ? bookWidth / (2 * Math.sin(Math.PI / count)) * 1.02 : 0;
      radiusRef.current = Math.max(spacingRadius, 172, Math.min(360, width * 0.34));
      updateAngle(angleRef.current);
    });
    resize.observe(stage);
    return () => resize.disconnect();
  }, [count, finishBookTransition, updateAngle]);

  // Keep the mounted neighborhood positioned before the browser paints.
  useLayoutEffect(() => {
    updateAngle(angleRef.current);
    const pending = pendingShelfFocusRef.current;
    if (pending !== null && bookRefs.current[pending]) {
      bookRefs.current[pending]?.focus({ preventScroll: true });
      pendingShelfFocusRef.current = null;
    }
  }, [current, detailIndex, updateAngle]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const theatre = theatreRef.current;
    const scene = sceneRef.current;
    const details = detailRef.current;
    const controls = controlsRef.current;
    const book = orbitRefs.current[lastOpenedRef.current];
    const reader = details?.querySelector<HTMLElement>(".project-book-reader");
    const paper = reader?.querySelector<HTMLElement>(".reader-spread");
    const pose = openingPoseRef.current;
    if (!opening || !stage || !theatre || !scene || !details || !controls || !book || !reader || !paper || !pose) return;
    const complete = () => {
      launchFrameRef.current = null;
      transitionRef.current = null;
      stage.dataset.motionPhase = "reading";
      setReaderReady(true);
    };
    if (reducedMotion) { complete(); return; }
    stage.dataset.motionPhase = readerReady ? "reading" : "opening";
    const start = () => {
      launchFrameRef.current?.cancel();
      launchFrameRef.current = null;
      transitionRef.current?.cancel();
      if (!canInteract()) { complete(); return; }
      // Restore the original twelve-project choreography: lift the closed
      // book, unfold at its natural proportions, then grow the paper to read.
      const scale = Math.min(1, Math.max(1, stage.clientWidth -
        parseFloat(getComputedStyle(stage).paddingLeft) -
        parseFloat(getComputedStyle(stage).paddingRight) - 24) / (book.offsetWidth * 2.12));
      const singlePage = reader.clientWidth < 680;
      sizePreviewPages(stage, book, paper.offsetWidth / (singlePage ? 1 : 2), paper.offsetHeight, singlePage);
      const tracks: BookMotionTrack[] = [];
      {
        let paperTop = 0;
        let parent: HTMLElement | null = paper;
        while (parent && parent !== details) {
          paperTop += parent.offsetTop;
          parent = parent.offsetParent as HTMLElement | null;
        }
        const paperCenter = paperTop + paper.offsetHeight / 2;
        const perspective = parseFloat(getComputedStyle(scene).perspective) || 1400;
        const {lift, compensation, raisedY} = getBookLiftGeometry(scene.offsetHeight, book.offsetHeight, scale, perspective);
        const bookOffset = book.offsetHeight * .12;
        const raised = `translate3d(0, ${raisedY}px, ${lift}px) scale(${compensation})`;
        const originOffset = scene.offsetHeight * .12;
        const positioned = `translate3d(${book.offsetWidth * scale / 2 * compensation}px, ${(originOffset + bookOffset) * compensation - originOffset}px, ${lift}px) scale(${compensation})`;
        details.style.transformOrigin = `50% ${paperCenter}px`;
        const {liftEnd, unfoldStart, openEnd, handoffEnd} = BOOK_MOTION;
        const ease = "cubic-bezier(.4,0,.2,1)";
        const animate = (element: HTMLElement, frames: Keyframe[]) => {
          tracks.push({element, frames});
        };
        const move = (element: HTMLElement, to: string) => {
          const from = pose.transforms.get(element) ?? getComputedStyle(element).transform;
          const frames = [
            {transform: from, offset: 0}, {transform: from, offset: unfoldStart, easing: ease},
            {transform: to, offset: openEnd}, {transform: to, offset: 1},
          ];
          animate(element, frames);
        };
        animate(book, [
          {transform: pose.transforms.get(book), offset: 0, easing: ease},
          {transform: raised, offset: liftEnd, easing: "cubic-bezier(.3,0,.7,.75)"},
          {transform: positioned, offset: openEnd},
          {transform: positioned, offset: 1},
        ]);
        const button = book.querySelector<HTMLElement>(".book-click");
        const object = book.querySelector<HTMLElement>(".book-object");
        const cover = book.querySelector<HTMLElement>(".book-cover-hinge");
        const leaf = book.querySelector<HTMLElement>(".book-page-leaf");
        if (button) move(button, "rotateY(0deg)");
        if (object) move(object, `rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(${scale})`);
        if (cover) move(cover, "translateZ(calc(var(--book-half-depth) - 1px)) rotateY(-180deg)");
        if (leaf) {
          // At the handoff both sheets meet at the spine, with the same size
          // and depth. The inset page block returns as the cover folds shut.
          const width = parseFloat(getComputedStyle(book).width);
          const height = parseFloat(getComputedStyle(book).height);
          move(leaf, `translateX(-4px) translateZ(calc(var(--book-half-depth) - .08px)) rotateY(0deg) scale(${width / (width - 8)}, ${height / (height - 8)})`);
        }
        book.querySelectorAll<HTMLElement>(".book-under-leaf").forEach(under =>
          move(under, "translateZ(calc(var(--page-half-depth) + 0.2px)) rotateY(0deg)"));
        // Sample the final physical pose before paint, then release it. This
        // measures the real projection instead of guessing from layout boxes.
        const readerBounds = paper.getBoundingClientRect();
        const samples = tracks.map(({element, frames}) => {
          const sample = element.animate(frames, {duration: BOOK_TRANSITION_MS, fill: "both"});
          sample.pause();
          sample.currentTime = BOOK_TRANSITION_MS * openEnd;
          return sample;
        });
        const leftPaper = book.querySelector<HTMLElement>(".book-inside-cover")!.getBoundingClientRect();
        const rightPaper = book.querySelector<HTMLElement>(".book-leaf-front")!.getBoundingClientRect();
        const arrival = getBookHandoffTransform(readerBounds, {
          x: leftPaper.x, y: leftPaper.y,
          width: singlePage ? leftPaper.width : rightPaper.right - leftPaper.left,
          height: leftPaper.height,
        });
        samples.forEach(sample => sample.cancel());
        orbitRefs.current.forEach(neighbor => {
          if (!neighbor || neighbor === book) return;
          const rest = "translate3d(var(--orbit-x), var(--orbit-y), var(--orbit-z))";
          animate(neighbor, [
            {transform: rest, offset: 0, easing: ease},
            {transform: `${rest} translate3d(0, 32px, -80px)`, offset: openEnd},
            {transform: `${rest} translate3d(0, 32px, -80px)`, offset: 1},
          ]);
        });
        // Fade flat surfaces, never preserve-3d ancestors: flattening a book
        // would make its cover artwork disappear while it is rotating.
        scene.querySelectorAll<HTMLElement>(".book-front, .book-back, .book-back-lining, .book-spine, .book-pages, .book-under-leaf, .book-leaf-front, .book-leaf-back, .book-inside-cover, .book-cover-edge, .book-ground-shadow").forEach(surface => {
          animate(surface, [
            {opacity: 1, offset: 0},
            {opacity: 1, offset: surface.closest(".book-orbit-item") === book ? openEnd : liftEnd, easing: ease},
            {opacity: 0, offset: handoffEnd}, {opacity: 0, offset: 1},
          ]);
        });
        animate(scene, [
          {visibility: "visible", offset: 0}, {visibility: "visible", offset: handoffEnd - .0001},
          {visibility: "hidden", offset: handoffEnd},
          {visibility: "hidden", offset: 1},
        ]);
        animate(controls, [
          {opacity: 1, offset: 0, easing: ease}, {opacity: 0, offset: openEnd}, {opacity: 0, offset: 1},
        ]);
        reader.querySelectorAll<HTMLElement>(".reader-running-title, .reader-navigation, .reader-key-hint").forEach(chrome => {
          animate(chrome, [
            {opacity: 0, offset: 0}, {opacity: 0, offset: openEnd, easing: ease},
            {opacity: 1, offset: .88}, {opacity: 1, offset: 1},
          ]);
        });
        animate(details, [
          {opacity: 0, visibility: "hidden", transform: arrival, offset: 0},
          {opacity: 0, visibility: "visible", transform: arrival, offset: openEnd, easing: ease},
          {opacity: 1, visibility: "visible", transform: arrival, offset: handoffEnd, easing: "cubic-bezier(.4,0,.2,1)"},
          {opacity: 1, visibility: "visible", transform: "translate(0, 0) scale(1)", offset: 1},
        ]);
      }
      const animations = tracks.map(({element, frames}) => {
        const animation = element.animate(frames,
          {duration: BOOK_TRANSITION_MS, fill: "both", easing: "linear"});
        animation.pause();
        return animation;
      });
      stage.dataset.motionPhase = "opening";
      transitionRef.current = runBookTransition({
        animations, duration: BOOK_TRANSITION_MS, direction: 1,
        timelineTime: () => typeof document.timeline.currentTime === "number" ? document.timeline.currentTime : null,
        onComplete: complete,
      });
    };
    if (!readerReady) launchFrameRef.current = queueBookTransition({
      canStart: canInteract,
      onStart: start,
      onSkip: complete,
    });
    return stopBookTransition;
    // The original visual keyframes use the bounded controller so finishing,
    // Escape, tab switches and resize cannot retain or restart filled effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opening, reducedMotion, stopBookTransition]);

  useLayoutEffect(() => {
    if (!returning || !closingRef.current || !readerReady) return;
    const stage = stageRef.current;
    const scene = sceneRef.current;
    const details = detailRef.current;
    const controls = controlsRef.current;
    const book = orbitRefs.current[lastOpenedRef.current];
    const paper = details?.querySelector<HTMLElement>(".reader-spread");
    const complete = () => {
      closeTransitionRef.current = null;
      closingRef.current = false;
      returnFocusRef.current = returnFocusRef.current && Boolean(stage?.contains(document.activeElement));
      stage?.setAttribute("data-motion-phase", "shelf");
      setReturning(false);
      setReaderReady(false);
    };
    if (!stage || !scene || !details || !controls || !book || !paper) {
      complete();
      return;
    }
    let pending = true;
    let frame = 0;
    const observer = new MutationObserver(() => ready());
    const release = () => {
      pending = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      launchFrameRef.current = null;
    };
    const ready = () => {
      if (!pending || paper.getAttribute("aria-busy") === "true") return;
      release();
      if (!canInteract()) { complete(); return; }
      closeTransitionRef.current = startBookClose({
        stage, scene, details, book, controls, onComplete: complete,
      });
    };
    observer.observe(paper, { attributes: true, attributeFilter: ["aria-busy"] });
    frame = requestAnimationFrame(ready);
    const launch: BookTransitionLaunch = {
      cancel: release,
      finish: () => { if (pending) { release(); complete(); } },
    };
    launchFrameRef.current = launch;
    return () => { if (pending) release(); };
  }, [returning, readerReady, canInteract]);

  useEffect(() => {
    if (!canInteract()) return;
    if (opened !== null) {
      // Do not take focus back if the visitor has already left the library.
      if (readerReady && !stageRef.current?.contains(document.activeElement)) return;
      const target = readerReady
        ? (detailRef.current?.querySelector<HTMLElement>(
            ".project-book-reader",
          ) ?? detailRef.current)
        : closeRef.current;
      target?.focus({ preventScroll: true });
    } else if (returnFocusRef.current && !returning) {
      returnFocusRef.current = false;
      const target = bookRefs.current[lastOpenedRef.current];
      if (target) {
        // Keep the keyboard focus ring without treating restored focus as a
        // new request to reopen the cover/page preview.
        target.dataset.restoredFocus = "true";
        target.focus({ preventScroll: true });
      }
    }
  }, [opened, opening, readerReady, returning, canInteract]);

  useEffect(() => {
    if (!active) {
      setHovered(null);
      stopAnimation();
      cancelGesture();
      finishBookTransition();
      updateAngle(Math.round(angleRef.current / step) * step);
    }
  }, [active, cancelGesture, finishBookTransition, stopAnimation, step, updateAngle]);

  useEffect(() => {
    stopAnimation();
    cancelGesture();
    setOpened(null);
    setReturning(false);
    targetAngleRef.current = 0;
    updateAngle(0);
  }, [count, cancelGesture, stopAnimation, updateAngle]);


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
    choose(index, false, () => revealBook(index));
    // A request is an event; later renders must not restart its spring.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, requestedProject, requestKey]);

  function bookAtPoint(x: number, y: number) {
    // Only the settled front cover can preview or open. The surrounding books
    // remain a drag surface, without relying on the browser's 3D hit order.
    const index = currentRef.current;
    const button = bookRefs.current[index];
    if (!button || button.disabled || !isCenteredBook(index)) return undefined;
    const hit = ["[data-book-hover-corner]", "[data-book-hit-corner]"].some(
      (selector) => {
        const points = [...button.querySelectorAll<HTMLElement>(selector)].map(
          (corner) => {
            const rect = corner.getBoundingClientRect();
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          },
        );
        return pointInsideCover(points, x, y);
      },
    );
    return hit ? index : undefined;
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (
      !canInteract() ||
      isOpen ||
      returning ||
      !event.isPrimary ||
      event.button !== 0
    )
      return;
    const bookIndex = bookAtPoint(event.clientX, event.clientY);
    stopAnimation();
    cancelGesture();
    setReturning(false);
    setHovered(null);
    gestureRef.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      time: performance.now(),
      velocity: 0,
      startAngle: angleRef.current,
      moved: false,
      book: bookIndex,
      element: event.currentTarget,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture) {
      if (
        event.pointerType === "mouse" &&
        event.buttons === 0 &&
        !isOpen &&
        !returning &&
        animationRef.current === null &&
        canInteract()
      )
        setHovered(bookAtPoint(event.clientX, event.clientY) ?? null);
      return;
    }
    if (gesture.pointer !== event.pointerId) return;
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
    // Keep drag distance per book consistent as the library grows.
    const multiplier = (radiusRef.current < 230 ? 0.38 : 0.25) * Math.min(1, 12 / count);
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
      if (
        gesture.book !== undefined &&
        bookAtPoint(event.clientX, event.clientY) === gesture.book
      )
        openBook(gesture.book);
      else if (!isCenteredBook(currentRef.current))
        rotateTo(Math.round(angleRef.current / step) * step);
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
    if (canInteract())
      rotateTo(Math.round(angleRef.current / step) * step);
  }

  function onKeys(event: KeyboardEvent<HTMLElement>) {
    if (
      !canInteract() ||
      returning ||
      !(event.target instanceof Element) ||
      event.target.closest('dialog, [role="dialog"]')
    )
      return;
    if (event.key === "Escape" && pendingRevealRef.current) {
      event.preventDefault();
      stopAnimation();
      cancelGesture();
      // Cancel the queued reveal, then leave the nearest book neatly in place.
      rotateTo(Math.round(angleRef.current / step) * step, true);
      return;
    }
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
      openBook(currentRef.current);
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
        aria-label="Project library"
        className="book-stage"
        data-dragging={dragging}
        data-open={isOpen}
        data-reader-ready={readerReady}
        data-returning={returning}
        onKeyDown={onKeys}
        ref={stageRef}
      >
        <div className="book-stage-header">
          <span className="book-library-label">Project library <span>{count} projects</span></span>
          {isOpen || returning ? (
            <button
              aria-disabled={returning || undefined}
              className="book-close"
              onClick={closeBook}
              ref={closeRef}
              type="button"
            >
              ← Back to the books <span aria-hidden="true">Esc</span>
            </button>
          ) : (
            <label className="book-project-picker">
              <span className="book-screenreader-status">Choose a project</span>
              <select
                aria-label="Choose a project"
                disabled={returning}
                value={destination ?? current}
                onChange={(event) => {
                  const index = Number(event.target.value);
                  choose(index, false, () => revealBook(index));
                }}
              >
                {projects.map((project, index) => <option key={project.title} value={index}>{String(index + 1).padStart(2, "0")} · {project.title}</option>)}
              </select>
              <span aria-hidden="true">⌄</span>
            </label>
          )}
        </div>
        <div className="book-theatre" ref={theatreRef}>
          <div
            aria-label="Project books. Drag to browse, or use arrow keys, Home and End. Press Enter to read the front book."
            aria-roledescription="carousel"
            aria-hidden={isOpen ? true : undefined}
            inert={isOpen || returning}
            className="book-scene"
            onLostPointerCapture={onPointerCancel}
            onPointerCancel={onPointerCancel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setHovered(null)}
            onPointerUp={onPointerUp}
            ref={sceneRef}
            role="region"
            tabIndex={isOpen || returning ? -1 : 0}
          >
            {getBookSceneIndexes(count, current).map((index) => {
              const project = projects[index];
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
                  data-current={current === index}
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
                      "--orbit-turn": `${(Math.sin(theta) * 12).toFixed(3)}deg`,
                      "--book-order": index,
                    } as CSSProperties
                  }
                >
                  <span className="book-ground-shadow" aria-hidden="true" />
                  <button
                    aria-controls={`${uniqueId}-details`}
                    aria-expanded={selected}
                    aria-hidden={isOpen ? true : undefined}
                    aria-label={`Open ${project.title} project details`}
                    className="book-click"
                    data-book-index={index}
                    data-hovered={current === index && hovered === index}
                    aria-disabled={
                      current !== index || browsing ? true : undefined
                    }
                    disabled={isOpen || returning || !active}
                    onBlur={(event) => { delete event.currentTarget.dataset.restoredFocus; }}
                    onClick={(event) => {
                      if (event.detail === 0 && !isOpen)
                        openBook(index);
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
                      project={project}
                      media={media[project.title]}
                      showPages={index === current || index === detailIndex}
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
              aria-hidden={!isOpen || !readerReady ? true : undefined}
              inert={!isOpen || !readerReady}
              id={`${uniqueId}-details`}
              ref={detailRef}
              role="region"
              tabIndex={-1}
            >
              <div key={`${detailIndex}-${opening}`}>
                <BookClosingContext.Provider value={returning}>
                  {openedProject && detailIndex !== null
                    ? renderDetails(openedProject, media[openedProject.title], detailIndex)
                    : null}
                </BookClosingContext.Provider>
              </div>
            </div>
          </div>
        </div>
        <div
          className="book-browse-controls-shell"
          ref={controlsRef}
          aria-hidden={isOpen || returning ? true : undefined}
          inert={isOpen || returning}
        >
          <div className="book-browse-controls">
            <button
              aria-label="Rotate to previous book"
              className="book-arrow"
              disabled={count < 2 || isOpen || returning}
              onClick={() => browse(-1)}
              type="button"
            >
              ←
            </button>
            <div className="book-current">
              <button
                disabled={returning || isOpen || browsing}
                onClick={() => openBook(currentRef.current)}
                type="button"
                aria-label={`Open project: ${projects[displayedBook].title}`}
              >
                <span className="book-current-action">
                  {browsing ? "Centering book" : `Open project · ${displayedBook + 1} / ${count}`}
                </span>
                <span className="book-current-name">
                  {projects[displayedBook].title}{" "}
                  <span aria-hidden="true">↗</span>
                </span>
              </button>
            </div>
            <button
              aria-label="Rotate to next book"
              className="book-arrow"
              disabled={count < 2 || isOpen || returning}
              onClick={() => browse(1)}
              type="button"
            >
              →
            </button>
          </div>
        </div>
        <span className="book-screenreader-status" role="status">
          {!isOpen && !dragging
            ? `Selected project: ${projects[displayedBook].title}. ${displayedBook + 1} of ${count}.`
            : ""}
        </span>
      </section>
    </div>
  );
}
