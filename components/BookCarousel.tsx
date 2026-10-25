"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
} from "react";

import { asset } from "@/content/paths";
import { BookClosingContext, OpeningContext, OpeningNotes, openingPageTitles } from "./ProjectBookOpening";
import "@/app/book-carousel.css";
import "@/app/project-book-reader.css";

const BOOK_TRANSITION_MS = 820;

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
          <span className="book-original-preview"><BookOpeningPage project={project} page={1} /></span>
          <span className="book-return-preview" data-preview-side="right" />
        </span>
        <span className="book-leaf-back" />
      </span>
      <span className="book-cover-hinge">
        <span className="book-front">
          <span className="book-cover-author">IAN WANGSA</span>
          <span className="book-cover-title">{design.title}</span>
          <span className="book-cover-subtitle">{design.subtitle}</span>
          <span className="book-cover-image">
            {media?.src ? (
              <img
                alt=""
                decoding="async"
                draggable={false}
                height={400}
                loading="lazy"
                src={asset(media.src)}
                width={640}
              />
            ) : (
              <span className="book-cover-mark">{design.mark}</span>
            )}
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
          <span className="book-original-preview"><BookOpeningPage project={project} page={0} /></span>
          <span className="book-return-preview" data-preview-side="left" />
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
  const resizeTheatreRef = useRef<() => void>(() => {});
  const refreshBookGeometryRef = useRef<() => void>(() => {});
  const syncBookPlaybackRef = useRef<() => void>(() => {});
  const bookAnimationsRef = useRef<Animation[]>([]);
  const closingRef = useRef(false);
  const openingPoseRef = useRef<{
    transforms: Map<HTMLElement, string>;
    height: number;
    controlsHeight: number;
  } | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const orbitRefs = useRef<Array<HTMLDivElement | null>>([]);
  const bookRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const returnFocusRef = useRef(false);
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
    bookAnimationsRef.current.forEach((animation) => {
      animation.onfinish = null;
      animation.cancel();
    });
    bookAnimationsRef.current = [];
    refreshBookGeometryRef.current = () => {};
    closingRef.current = false;
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
    const focus = () =>
      bookRefs.current[mod(Math.round(-target / step), count)]?.focus({
        preventScroll: true,
      });
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
    book?.querySelectorAll(".book-return-preview").forEach((preview) => preview.replaceChildren());
    const transforms = new Map<HTMLElement, string>();
    if (book) {
      [book, ...book.querySelectorAll<HTMLElement>(".book-click, .book-object, .book-cover-hinge, .book-page-leaf, .book-under-leaf")]
        .forEach((element) => transforms.set(element, getComputedStyle(element).transform));
    }
    openingPoseRef.current = {
      transforms,
      height: theatreRef.current?.offsetHeight ?? 430,
      controlsHeight: controlsRef.current?.offsetHeight ?? 0,
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
    setReaderReady(false);
    closeRef.current?.focus({ preventScroll: true });
    const animations = bookAnimationsRef.current;
    if (!reducedMotion && animations.length) {
      closingRef.current = true;
      setReturning(true);
      // The same animations run backwards, including an interrupted opening.
      // Nothing is remounted or replaced with a separate closing pose.
      const time = Math.max(1, Number(animations[0].currentTime ?? 0));
      const progress = Math.min(1, time / BOOK_TRANSITION_MS);
      animations.forEach((animation) => {
        const effect = animation.effect as KeyframeEffect;
        const element = effect.target;
        let closed: string | null = null;
        if (element instanceof HTMLElement) {
          if (element.matches(".book-cover-hinge"))
            closed = "translateZ(calc(var(--book-half-depth) - 1px)) rotateY(0deg)";
          else if (element.matches(".book-page-leaf"))
            closed = "translateZ(calc(var(--page-half-depth) + 0.6px)) rotateY(0deg)";
          else if (element.matches(".book-under-leaf"))
            closed = `translateZ(calc(var(--page-half-depth) + ${element.matches(".book-under-leaf-second") ? "0.4" : "0.2"}px)) rotateY(0deg)`;
          if (closed) {
            const frames = effect.getKeyframes().map((frame) => ({
              offset: frame.computedOffset, easing: frame.easing, transform: frame.transform,
            }));
            // Opening may begin from an already-hovered cover. Return to the
            // closed shelf pose, not that captured hover followed by a snap.
            // If interrupted, anchor the current transform before retargeting.
            effect.setKeyframes(progress < 0.54 ? [
              { transform: closed, offset: 0, easing: "cubic-bezier(.4,0,.2,1)" },
              { transform: getComputedStyle(element).transform, offset: progress },
              ...frames.filter((frame) => frame.offset > progress),
            ] : frames.map((frame) => ({
              ...frame, transform: frame.offset <= 0.12 ? closed : frame.transform,
            })));
          }
        }
        animation.currentTime = time;
        animation.reverse();
      });
      syncBookPlaybackRef.current();
    } else {
      stopBookTransition();
      setReturning(false);
    }
    setOpened(null);
  }

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      stopAnimation();
      cancelGesture();
      setReturning(false);
      setReducedMotion(query.matches);
      updateAngle(Math.round(angleRef.current / step) * step);
    };
    const pause = () => {
      stageRef.current?.toggleAttribute("data-suspended", document.hidden);
      if (document.hidden) {
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
  }, [cancelGesture, stopAnimation, step, updateAngle]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const resize = new ResizeObserver(([entry]) => {
      if (entry?.contentRect.width > 0) {
        const book = orbitRefs.current[0];
        const bookWidth =
          parseFloat(getComputedStyle(book ?? stage).width) ||
          170;
        // Before the reader exists, use its responsive page dimensions. The
        // opening measurement below replaces these with the exact live size.
        const detailPadding = detailRef.current ? getComputedStyle(detailRef.current) : null;
        const readerWidth = Math.min(1080, entry.contentRect.width -
          (parseFloat(detailPadding?.paddingLeft ?? "0") || 0) -
          (parseFloat(detailPadding?.paddingRight ?? "0") || 0));
        const single = readerWidth < 680;
        const pageHeight = single
          ? Math.min(620, Math.max(480, window.innerHeight * 0.64))
          : Math.min(640, Math.max(520, window.innerHeight * 0.62));
        if (book && !bookAnimationsRef.current.length)
          sizePreviewPages(stage, book, readerWidth / (single ? 1 : 2), pageHeight, single);
        // Reserve room for both leaves while the cover opens into the reader.
        const openScale = Math.min(
          1.18,
          Math.max(1, entry.contentRect.width - 24) / (bookWidth * 2.12),
        );
        stage.style.setProperty("--open-book-scale", openScale.toFixed(4));
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
    const resize = () => {
      // The shared timeline owns height while moving. Resize only the settled
      // endpoint, so an observer cannot restart an animation mid-handoff.
      if (bookAnimationsRef.current.some((animation) => animation.playState === "running")) return;
      const reading = stageRef.current?.dataset.open === "true";
      if (reading && bookAnimationsRef.current.length) {
        refreshBookGeometryRef.current();
        return;
      }
      theatre.style.height = `${reading ? flow.offsetHeight : parseFloat(getComputedStyle(flow).minHeight)}px`;
    };
    const observer = new ResizeObserver(resize);
    resizeTheatreRef.current = resize;
    observer.observe(flow);
    resize();
    return () => {
      observer.disconnect();
      theatre.style.height = "";
      resizeTheatreRef.current = () => {};
    };
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const theatre = theatreRef.current;
    const flow = flowRef.current;
    const scene = sceneRef.current;
    const details = detailRef.current;
    const controls = controlsRef.current;
    const book = orbitRefs.current[lastOpenedRef.current];
    const reader = details?.querySelector<HTMLElement>(".project-book-reader");
    const paper = reader?.querySelector<HTMLElement>(".reader-spread");
    const pose = openingPoseRef.current;
    if (!opening || !stage || !theatre || !flow || !scene || !details || !controls || !book || !reader || !paper || !pose) return;
    if (reducedMotion) {
      setReaderReady(true);
      resizeTheatreRef.current();
      return;
    }

    const liftEnd = 0.22;
    const unfoldStart = 0.12;
    const openEnd = 0.54;
    const handoff = openEnd;
    const measureTransition = () => {
      const scale = parseFloat(getComputedStyle(stage).getPropertyValue("--open-book-scale")) || 1;
      const singlePage = reader.clientWidth < 680;
      sizePreviewPages(stage, book, paper.offsetWidth / (singlePage ? 1 : 2), paper.offsetHeight, singlePage);
      let paperTop = 0;
      let parent: HTMLElement | null = paper;
      while (parent && parent !== details) {
        paperTop += parent.offsetTop;
        parent = parent.offsetParent as HTMLElement | null;
      }
      const paperCenter = paperTop + paper.offsetHeight / 2;
      const bookOffset = book.offsetHeight * 0.12;
      const bookCenter = scene.offsetHeight / 2 + bookOffset;
      const perspective = parseFloat(getComputedStyle(scene).perspective) || 1400;
      const lift = Math.min(160, perspective * 0.2);
      const compensation = 1 - lift / perspective;
      const originOffset = scene.offsetHeight * 0.12;
      const rise = Math.min(104, Math.max(80, scene.clientWidth * 0.095));
      // Lift the still-closed cover above the shelf before opening it. Keep
      // perspective compensation, with a small visible move toward the reader.
      const raised = `translate3d(0, ${(originOffset - rise) * compensation - originOffset}px, ${lift}px) scale(${compensation * 1.04})`;
      const positioned = `translate3d(${book.offsetWidth * scale / 2 * compensation}px, ${(originOffset + bookOffset) * compensation - originOffset}px, ${lift}px) scale(${compensation})`;
      // Page one is on the inside cover. A narrow reader grows from that same
      // left page; desktop keeps both opening pages through the handoff.
      const arrival = `translate(${singlePage ? -book.offsetWidth * scale / 2 : 0}px, ${bookCenter - details.offsetTop - paperCenter}px) scale(${book.offsetWidth * scale * (singlePage ? 1 : 2) / paper.offsetWidth}, ${book.offsetHeight * scale / paper.offsetHeight})`;
      details.style.transformOrigin = `50% ${paperCenter}px`;
      return { scale, raised, positioned, arrival, finalHeight: flow.offsetHeight };
    };
    let geometry = measureTransition();
    theatre.style.height = `${geometry.finalHeight}px`;
    const animations: Animation[] = [];
    const animate = (element: HTMLElement, frames: Keyframe[]) => {
      const animation = element.animate(frames, {
        duration: BOOK_TRANSITION_MS,
        fill: "both",
        easing: "linear",
      });
      animations.push(animation);
      return animation;
    };
    const ease = "cubic-bezier(.4,0,.2,1)";
    const move = (element: HTMLElement, to: string, start = unfoldStart, end = openEnd) => {
      const from = pose.transforms.get(element) ?? getComputedStyle(element).transform;
      return animate(element, [
        { transform: from, offset: 0 },
        { transform: from, offset: start, easing: ease },
        { transform: to, offset: end },
        { transform: to, offset: 1 },
      ]);
    };
    // Transform only preserve-3d containers. Opacity/filter on any ancestor
    // flattens the covers behind the cream page blocks in WebKit/Chromium.
    const bookFrames = (): Keyframe[] => [
      { transform: pose.transforms.get(book), offset: 0, easing: ease },
      { transform: geometry.raised, offset: liftEnd, easing: "cubic-bezier(.3,0,.7,.75)" },
      { transform: geometry.positioned, offset: openEnd },
      { transform: geometry.positioned, offset: 1 },
    ];
    const bookAnimation = animate(book, bookFrames());
    const button = book.querySelector<HTMLElement>(".book-click");
    const object = book.querySelector<HTMLElement>(".book-object");
    const cover = book.querySelector<HTMLElement>(".book-cover-hinge");
    const leaf = book.querySelector<HTMLElement>(".book-page-leaf");
    if (button) move(button, "rotateY(0deg)");
    const objectAnimation = object ? move(object, `rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(${geometry.scale})`) : null;
    if (cover) move(cover, "translateZ(calc(var(--book-half-depth) - 1px)) rotateY(-180deg)");
    if (leaf) move(leaf, "translateZ(calc(var(--page-half-depth) + 0.6px)) rotateY(0deg)");
    book.querySelectorAll<HTMLElement>(".book-under-leaf").forEach((under) =>
      move(under, "translateZ(calc(var(--page-half-depth) + 0.2px)) rotateY(0deg)"),
    );
    // The surrounding books recede as the selected spread expands. Animate
    // their transforms, never opacity on the preserve-3d shelf hierarchy.
    orbitRefs.current.forEach((neighbor) => {
      if (!neighbor || neighbor === book) return;
      // Keep CSS orbit variables live: a resize updates the resting position
      // without needing to rebuild every background animation.
      const rest = "translate3d(var(--orbit-x), var(--orbit-y), var(--orbit-z))";
      animate(neighbor, [
        { transform: rest, offset: 0, easing: ease },
        { transform: `${rest} translate3d(0, 32px, -80px)`, offset: openEnd },
        { transform: `${rest} translate3d(0, 32px, -80px)`, offset: 1 },
      ]);
    });
    animate(scene, [
      { visibility: "visible", offset: 0 },
      { visibility: "visible", offset: 0.9999 },
      { visibility: "hidden", offset: 1 },
    ]);
    const controlsAnimation = animate(controls, [
      { height: `${pose.controlsHeight}px`, opacity: 1, offset: 0, easing: ease },
      { height: "0px", opacity: 0, offset: openEnd },
      { height: "0px", opacity: 0, offset: 1 },
    ]);
    const theatreFrames = (): Keyframe[] => [
      { height: `${pose.height}px`, offset: 0, easing: ease },
      { height: `${geometry.finalHeight}px`, offset: 1 },
    ];
    const paperFrames = (): Keyframe[] => [
      { opacity: 1, visibility: "hidden", transform: geometry.arrival, offset: 0 },
      { opacity: 1, visibility: "hidden", transform: geometry.arrival, offset: handoff },
      { opacity: 1, visibility: "visible", transform: geometry.arrival, offset: handoff + 0.0001, easing: "cubic-bezier(.25,.35,.25,1)" },
      { opacity: 1, visibility: "visible", transform: "translate(0, 0) scale(1)", offset: 1 },
    ];
    reader.querySelectorAll<HTMLElement>(".reader-running-title, .reader-navigation, .reader-key-hint").forEach((chrome) => {
      animate(chrome, [
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: handoff, easing: ease },
        { opacity: 1, offset: 0.88 },
        { opacity: 1, offset: 1 },
      ]);
    });
    const theatreAnimation = animate(theatre, theatreFrames());
    const paperAnimation = animate(details, paperFrames());
    const updateFrames = (animation: Animation, frames: Keyframe[]) => {
      (animation.effect as KeyframeEffect).setKeyframes(frames);
    };
    // Finished fill:both animations still own their styles. Update the actual
    // keyframes on a settled resize, including the reverse endpoint, rather
    // than writing a height that a finished animation would keep overriding.
    refreshBookGeometryRef.current = () => {
      geometry = measureTransition();
      pose.height = parseFloat(getComputedStyle(flow).minHeight);
      const controlsBody = controls.querySelector<HTMLElement>(".book-browse-controls");
      if (controlsBody) {
        // The collapsed flex row centres children outside its zero-height box;
        // scrollHeight only sees the lower half. Measure the actual controls.
        pose.controlsHeight = Math.max(...Array.from(controlsBody.children, (child) => (child as HTMLElement).offsetHeight));
      }
      theatre.style.height = `${geometry.finalHeight}px`;
      updateFrames(theatreAnimation, theatreFrames());
      updateFrames(paperAnimation, paperFrames());
      updateFrames(bookAnimation, bookFrames());
      const retarget = (animation: Animation, to: string) => {
        const frames = (animation.effect as KeyframeEffect).getKeyframes();
        updateFrames(animation, frames.map((frame) => ({
          offset: frame.offset,
          easing: frame.easing,
          transform: frame.computedOffset >= openEnd ? to : frame.transform,
        })));
      };
      if (objectAnimation) retarget(objectAnimation, `rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(${geometry.scale})`);
      updateFrames(controlsAnimation, [
        { height: `${pose.controlsHeight}px`, opacity: 1, offset: 0, easing: ease },
        { height: "0px", opacity: 0, offset: openEnd },
        { height: "0px", opacity: 0, offset: 1 },
      ]);
    };
    const startTime = document.timeline.currentTime;
    if (typeof startTime === "number") animations.forEach((animation) => { animation.startTime = startTime; });
    bookAnimationsRef.current = animations;
    // The child reader commits its one/two-page breakpoint in a layout effect.
    // Read that final paper height before the first painted animation frame.
    const geometryFrame = requestAnimationFrame(() => refreshBookGeometryRef.current());
    paperAnimation.onfinish = () => {
      if (closingRef.current) {
        stopBookTransition();
        setReturning(false);
        // Clear the open-height endpoint before the closed flow re-renders.
        theatre.style.height = `${pose.height}px`;
      } else {
        setReaderReady(true);
        resizeTheatreRef.current();
      }
    };
    return () => {
      cancelAnimationFrame(geometryFrame);
      stopBookTransition();
    };
    // Opening is a discrete event. Closing reverses these same Animation
    // objects directly, rather than rebuilding them when opened becomes null.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opening, reducedMotion, stopBookTransition]);

  useEffect(() => {
    if (!returning) return;
    // The closing context settles a turn in the child's layout effect first.
    // Copy only the visible paper, preserving its scroll position, so a reader
    // closing page 8 does not suddenly see page 1 halfway through the fold.
    const frame = requestAnimationFrame(() => {
      if (!closingRef.current) return;
      const book = orbitRefs.current[lastOpenedRef.current];
      const reader = detailRef.current?.querySelector<HTMLElement>(".project-book-reader");
      if (!book || !reader) return;
      const single = reader.dataset.single === "true";
      for (const side of ["left", "right"] as const) {
        const source = reader.querySelector<HTMLElement>(`.reader-static-${single ? "left" : side} .reader-page`);
        const destination = book.querySelector<HTMLElement>(`[data-preview-side="${side}"]`);
        if (!source || !destination) continue;
        const copy = source.cloneNode(true) as HTMLElement;
        copy.classList.add("book-preview-page");
        copy.inert = true;
        copy.setAttribute("aria-hidden", "true");
        copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
        destination.replaceChildren(copy);
        const body = copy.querySelector<HTMLElement>(".reader-page-body");
        const originalBody = source.querySelector<HTMLElement>(".reader-page-body");
        if (body && originalBody) body.scrollTop = originalBody.scrollTop;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [returning]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let onscreen = true;
    const suspended = new Set<Animation>();
    const syncPlayback = () => {
      const paused = document.hidden || !onscreen;
      stage.toggleAttribute("data-suspended", paused);
      bookAnimationsRef.current.forEach(animation => {
        if (paused && animation.playState === "running") {
          suspended.add(animation);
          animation.pause();
        } else if (!paused && suspended.delete(animation) && animation.playState === "paused") {
          animation.play();
        }
      });
    };
    syncBookPlaybackRef.current = syncPlayback;
    const observer = new IntersectionObserver(([entry]) => {
      onscreen = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(stage);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      syncBookPlaybackRef.current = () => {};
    };
  }, [opening]);

  useEffect(() => {
    resizeTheatreRef.current();
    if (!isOpen || !canInteract()) return;
    const stage = stageRef.current;
    if (!stage) return;
    const headerBottom =
      document.querySelector(".classic-header")?.getBoundingClientRect()
        .bottom ?? 0;
    const stageTop = stage.getBoundingClientRect().top;
    if (stageTop < headerBottom + 16) {
      window.scrollTo({
        top: Math.max(0, window.scrollY + stageTop - headerBottom - 16),
        behavior: reducedMotion ? "instant" : "smooth",
      });
    }
  }, [isOpen, canInteract, reducedMotion]);


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
      bookRefs.current[lastOpenedRef.current]?.focus({ preventScroll: true });
    }
  }, [opened, opening, readerReady, returning, canInteract]);

  useEffect(() => {
    if (!active) {
      setHovered(null);
      stopAnimation();
      cancelGesture();
      bookAnimationsRef.current.forEach((animation) => animation.finish());
      updateAngle(Math.round(angleRef.current / step) * step);
    }
  }, [active, cancelGesture, stopAnimation, step, updateAngle]);

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
          <span className="book-library-label">THE PROJECT LIBRARY</span>
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
