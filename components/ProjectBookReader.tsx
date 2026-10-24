"use client";

import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import type {
  Project,
  ProjectMedia,
  ProjectSource as Source,
} from "./BookCarousel";
import { buildNotes } from "@/content/build-notes";
import { projectStories } from "@/content/project-stories";
import type { ProjectPoint } from "@/content/project-stories";
import { teamMoments } from "@/content/media";
import { asset } from "@/content/paths";
import { OpeningContext, OpeningNotes, openingPageTitles } from "./ProjectBookOpening";
import "@/app/project-book-reader.css";

const isReport = (url: string) => /\.pdf(?:$|[?#])/i.test(url);

function SourceIcon({ report = false }: { report?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      {report ? (
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9m-6-6 6 6m-6-6v6h6M8 13h8m-8 4h5" />
      ) : (
        <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 20" />
      )}
    </svg>
  );
}

function SourceLink({ source, title }: { source: Source; title: string }) {
  const report = isReport(source.url);
  const label = report ? "Case study" : "Source code";
  const visibleLabel = source.label?.replace(/\s*\(private\)/i, "") || label;
  const privateSource = source.visibility === "private";
  return (
    <div className="min-w-0">
      <a
        aria-label={`${label}: ${title}${source.label ? ` — ${source.label}` : ""}${privateSource ? " (private, access required)" : ""}`}
        className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-sm text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-700 dark:text-emerald-300"
        href={source.url}
        rel="noreferrer"
        target="_blank"
      >
        <SourceIcon report={report} />
        {visibleLabel}
        <span aria-hidden="true">↗</span>
      </a>
      {privateSource ? (
        <p className="mt-1.5 text-xs font-medium text-amber-800 dark:text-amber-300">
          Private · access required
        </p>
      ) : null}
    </div>
  );
}

function ProjectSources({ project }: { project: Project }) {
  const sources: Source[] = [];
  const seen = new Set<string>();
  for (const source of [
    ...(project.repository
      ? [
          {
            url: project.repository,
            label: project.repositoryLabel,
            visibility: project.repositoryVisibility,
          },
        ]
      : []),
    ...(project.repositories ?? []),
  ]) {
    if (!seen.has(source.url)) {
      sources.push(source);
      seen.add(source.url);
    }
  }
  const [primary, ...additional] = sources;
  const additionalNoun = additional.some((source) => isReport(source.url))
    ? additional.length === 1
      ? "source"
      : "sources"
    : additional.length === 1
      ? "repository"
      : "repositories";
  return (
    <div className="space-y-3 border-t border-emerald-950/10 pt-3 dark:border-white/10">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
        {primary ? <SourceLink source={primary} title={project.title} /> : null}
        {project.live ? (
          <a
            aria-label={`Live demo: ${project.title}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-700 dark:text-emerald-300"
            href={project.live}
            rel="noreferrer"
            target="_blank"
          >
            Live demo <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
      {additional.length ? (
        <details className="group/sources">
          <summary className="flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-sm py-1 text-xs font-medium text-stone-600 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300">
            <span>
              {additional.length} more {additionalNoun}
            </span>
            <span
              aria-hidden="true"
              className="inline-block text-base group-open/sources:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="mt-3 space-y-4 border-l-2 border-emerald-100 pl-3 dark:border-emerald-900">
            {additional.map((source) => (
              <SourceLink
                key={source.url}
                source={source}
                title={project.title}
              />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

type Chapter = {
  title: string;
  content: ReactNode;
  kind?: "title" | "image" | "sources";
};

function pointPages(points: readonly ProjectPoint[]): ProjectPoint[][] {
  const pages: ProjectPoint[][] = [];
  const wordCount = (items: readonly ProjectPoint[]) => items
    .map(({ label, detail }) => `${label} ${detail}`)
    .join(" ").split(/\s+/).length;
  for (const point of points) {
    const current = pages.at(-1);
    const words = wordCount([...(current ?? []), point]);
    if (!current || current.length === 3 || words > 155) pages.push([point]);
    else current.push(point);
  }
  // Keep a four-point section balanced across its two pages.
  const last = pages.at(-1);
  const previous = pages.at(-2);
  if (last?.length === 1 && previous?.length === 3 &&
      wordCount([previous[2], ...last]) <= 155) {
    last.unshift(previous.pop()!);
  }
  return pages;
}

function PointList({ points }: { points: readonly ProjectPoint[] }) {
  return (
    <ul className="reader-highlights">
      {points.map((point) => (
        <li key={point.label}>
          <p><strong>{point.label}.</strong> {point.detail}</p>
        </li>
      ))}
    </ul>
  );
}

function chaptersFor(project: Project, media?: ProjectMedia): Chapter[] {
  const note = buildNotes[project.title];
  const story = projectStories[project.title];
  const moments =
    project.title === "BrainHack TIL-AI"
      ? teamMoments.filter((moment) => moment.src.includes("brainhack"))
      : project.title === "Agentic Fraud Investigation Crew"
        ? teamMoments.filter((moment) => moment.src.includes("hack-the-future"))
        : [];
  const pages: Chapter[] = [
    {
      title: openingPageTitles[0],
      kind: "title",
      content: <OpeningNotes project={project} />,
    },
  ];
  if (story) {
    pages.push({
      title: openingPageTitles[1],
      content: <OpeningContext project={project} />,
    });
    story.sections.forEach((section) => {
      const chunks = pointPages(section.points);
      chunks.forEach((points, index) => pages.push({
        title: `${section.title}${chunks.length > 1 ? ` · ${index + 1}/${chunks.length}` : ""}`,
        content: <PointList points={points} />,
      }));
    });
  } else {
    const points = (project.highlights ?? []).map((point) => {
      const labelEnd = point.indexOf(":");
      return labelEnd > 0 && labelEnd < 48
        ? { label: point.slice(0, labelEnd), detail: point.slice(labelEnd + 1).trim() }
        : { label: "Project detail", detail: point };
    });
    pointPages(points).forEach((points, index) => pages.push({
      title: index === 0 ? "What I built" : `Implementation notes · ${index}`,
      content: <PointList points={points} />,
    }));
  }
  if (note && !story)
    pages.push({
      title: "Decisions along the way",
      content: (
        <>
          <blockquote>{note.question}</blockquote>
          <p>{note.decision}</p>
        </>
      ),
    });
  if (media)
    pages.push({
      title: "A closer look",
      kind: "image",
      content: (
        <figure className="reader-evidence">
          <a
            href={asset(media.src)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${project.title} ${media.kind.toLowerCase()} at full size, in a new tab`}
          >
            <Image
              src={asset(media.src)}
              alt={media.alt}
              width={1280}
              height={800}
              unoptimized
            />
            <span>View full size ↗</span>
          </a>
          <figcaption>{media.caption}</figcaption>
          {note && note.proof !== media.caption ? (
            <p className="reader-proof">{note.proof}</p>
          ) : null}
        </figure>
      ),
    });
  moments.forEach((moment) =>
    pages.push({
      title: "Behind the build",
      kind: "image",
      content: (
        <figure className="reader-evidence reader-team-photo">
          <a
            href={asset(moment.src)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open photo: ${moment.title}, in a new tab`}
          >
            <Image
              src={asset(moment.src)}
              alt={moment.alt}
              width={960}
              height={640}
              unoptimized
            />
            <span>View photograph ↗</span>
          </a>
          <figcaption>{moment.caption}</figcaption>
        </figure>
      ),
    }),
  );
  pages.push({
    title: "Tools & source material",
    kind: "sources",
    content: (
      <>
        <ul
          className="reader-tools"
          aria-label={`${project.title} technologies`}
        >
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <ProjectSources project={project} />
      </>
    ),
  });
  // A final colophon keeps two-page spreads complete without repeating claims.
  if (pages.length % 2)
    pages.push({
      title: "End notes",
      kind: "title",
      content: (
        <div className="reader-colophon">
          <span aria-hidden="true">—</span>
          <p>{project.title}</p>
          <small>From the project library of</small>
          <p className="reader-signature">Ian Wangsa</p>
        </div>
      ),
    });
  return pages;
}

type PageTurn = {
  from: number;
  to: number;
  direction: "next" | "previous";
};

type ReaderState = {
  page: number;
  target: number;
  single: boolean;
  turn: PageTurn | null;
};

type ReaderAction =
  | { type: "navigate"; direction: number; pageCount: number }
  | { type: "jump"; page: number; pageCount: number }
  | { type: "resize"; single: boolean; pageCount: number }
  | { type: "start" }
  | { type: "finish"; from: number; to: number }
  | { type: "settle" };

function readerReducer(state: ReaderState, action: ReaderAction): ReaderState {
  if (action.type === "navigate" || action.type === "jump") {
    const last = action.pageCount - (state.single ? 1 : 2);
    const requested = action.type === "jump"
      ? action.page
      : state.target + action.direction * (state.single ? 1 : 2);
    const target = Math.max(0, Math.min(last,
      state.single ? requested : Math.floor(requested / 2) * 2,
    ));
    return target === state.target ? state : { ...state, target };
  }
  if (action.type === "resize") {
    if (state.single === action.single && !state.turn) return state;
    // Preserve the requested destination when crossing the one-/two-page
    // breakpoint, including a resize in the middle of a page turn.
    const page = Math.min(
      action.pageCount - (action.single ? 1 : 2),
      action.single ? state.target : Math.floor(state.target / 2) * 2,
    );
    return { single: action.single, page, target: page, turn: null };
  }
  if (action.type === "start") {
    if (state.turn || state.target === state.page) return state;
    return {
      ...state,
      turn: {
        from: state.page,
        to: state.target,
        direction: state.target > state.page ? "next" : "previous",
      },
    };
  }
  if (action.type === "finish") {
    if (state.turn?.from !== action.from || state.turn.to !== action.to)
      return state;
    return { ...state, page: action.to, turn: null };
  }
  return { ...state, page: state.target, turn: null };
}

export default function ProjectBookReader({
  project,
  media,
}: {
  project: Project;
  media?: ProjectMedia;
}) {
  const pages = useMemo(() => chaptersFor(project, media), [project, media]);
  const [{ page, target, single, turn }, dispatch] = useReducer(readerReducer, {
    page: 0,
    target: 0,
    single: false,
    turn: null,
  });
  const [reduced, setReduced] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const pageScroll = useRef(new Map<number, number>());
  const swipe = useRef<{ pointer: number; x: number; y: number } | null>(null);
  const id = useId();
  const last = pages.length - (single ? 1 : 2);
  const turning = Boolean(turn) || target !== page;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    // Resolve one-/two-page layout before the opening transition measures it.
    // clientWidth is unaffected by the reader's temporary opening scale.
    let previousWidth = element.clientWidth;
    if (previousWidth > 0)
      dispatch({ type: "resize", single: previousWidth < 680, pageCount: pages.length });
    const observer = new ResizeObserver(([entry]) => {
      if (!entry || entry.contentRect.width === 0 || Math.abs(entry.contentRect.width - previousWidth) < 1) return;
      previousWidth = entry.contentRect.width;
      dispatch({ type: "resize", single: previousWidth < 680, pageCount: pages.length });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [pages.length]);

  useEffect(() => {
    if (target === page || turn) return;
    if (reduced) {
      dispatch({ type: "settle" });
      return;
    }
    dispatch({ type: "start" });
  }, [target, page, turn, reduced]);

  useEffect(() => {
    if (!turn) return;
    // animationend normally commits the turn. The fallback also handles a
    // backgrounded tab, changed motion preference, or interrupted animation.
    const timer = window.setTimeout(
      () => dispatch({ type: "finish", from: turn.from, to: turn.to }),
      reduced ? 0 : 640,
    );
    return () => window.clearTimeout(timer);
  }, [turn, reduced]);

  function preservePageFocus() {
    const focused = document.activeElement;
    // A scrolling body is replaced (and made inert) during a turn. Keep
    // keyboard focus on the persistent reader so consecutive arrows work.
    if (focused instanceof HTMLElement && root.current?.contains(focused) &&
      focused.closest(".reader-page-body"))
      root.current.focus({ preventScroll: true });
  }

  function navigate(direction: number) {
    preservePageFocus();
    dispatch({ type: "navigate", direction, pageCount: pages.length });
  }

  function jump(next: number) {
    preservePageFocus();
    dispatch({ type: "jump", page: next, pageCount: pages.length });
  }

  function onKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (
      !(event.target instanceof Element) ||
      event.target.closest("a, input, select, textarea, summary")
    )
      return;
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Home") jump(0);
      else if (event.key === "End") jump(last);
      else navigate(event.key === "ArrowRight" ? 1 : -1);
    }
  }

  function startSwipe(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== "touch" || !event.isPrimary ||
      !(event.target instanceof Element) ||
      event.target.closest("a, button, input, select, textarea, summary")
    ) return;
    swipe.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function endSwipe(event: PointerEvent<HTMLDivElement>) {
    const gesture = swipe.current;
    if (!gesture || gesture.pointer !== event.pointerId) return;
    swipe.current = null;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.5)
      navigate(dx < 0 ? 1 : -1);
  }

  function leaf(index: number, turningCopy = false) {
    const chapter = pages[index];
    if (!chapter) return null;
    return (
      <article className="reader-page" data-kind={chapter.kind}>
        <header className="reader-page-header">
          <span>{project.title}</span>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        </header>
        <div
          aria-label={`${chapter.title}, page ${index + 1} content`}
          className="reader-page-body"
          key={index}
          onScroll={turningCopy ? undefined : (event) => {
            pageScroll.current.set(index, event.currentTarget.scrollTop);
          }}
          ref={(element) => {
            if (element) element.scrollTop = pageScroll.current.get(index) ?? 0;
          }}
          role="region"
          tabIndex={turningCopy ? -1 : 0}
        >
          {chapter.kind !== "title" ? <h4>{chapter.title}</h4> : null}
          {chapter.content}
        </div>
        <footer className="reader-page-footer">
          <span>{chapter.title}</span>
          <span>{index + 1}</span>
        </footer>
      </article>
    );
  }

  const baseLeft = turn && turn.direction === "previous" ? turn.to : page;
  const baseRight = turn && turn.direction === "next" ? turn.to + 1 : page + 1;
  const front = turn
    ? single ? turn.from : turn.direction === "next" ? turn.from + 1 : turn.from
    : 0;
  const back = turn
    ? single ? turn.to : turn.direction === "next" ? turn.to : turn.to + 1
    : 0;

  return (
    <div
      className="project-book-reader"
      aria-label={`Read ${project.title}. Arrow keys turn pages; Home and End go to the first and last pages.`}
      data-single={single}
      data-reduced-motion={reduced}
      onKeyDown={onKeys}
      ref={root}
      role="region"
      tabIndex={0}
    >
      <div className="reader-running-title">
        <span>Project notes</span>
        <span>{project.category}</span>
      </div>
      <div
        aria-busy={turning}
        aria-label={`${project.title}, page${single ? "" : "s"} ${page + 1}${single ? "" : `–${page + 2}`}`}
        className="reader-spread"
        id={`${id}-pages`}
        onPointerDown={startSwipe}
        onPointerUp={endSwipe}
        onPointerCancel={() => { swipe.current = null; }}
        role="group"
      >
        <div className="reader-static-page reader-static-left" inert={Boolean(turn)}>
          {leaf(single && turn ? turn.to : baseLeft)}
        </div>
        {!single ? (
          <div className="reader-static-page reader-static-right" inert={Boolean(turn)}>
            {leaf(baseRight)}
          </div>
        ) : null}
        {turn ? (
          <div
            aria-hidden="true"
            className="reader-turning-leaf"
            data-direction={turn.direction}
            inert
            key={`${turn.from}-${turn.to}`}
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget)
                dispatch({ type: "finish", from: turn.from, to: turn.to });
            }}
          >
            <div className="reader-turn-front">{leaf(front, true)}</div>
            <div className="reader-turn-back">{leaf(back, true)}</div>
          </div>
        ) : null}
      </div>
      <nav aria-label={`${project.title} page navigation`} className="reader-navigation">
        <button
          aria-controls={`${id}-pages`}
          aria-disabled={target === 0}
          onClick={() => navigate(-1)}
          type="button"
        >
          <span aria-hidden="true">←</span> Previous
        </button>
        <span className="reader-page-count">
          {page + 1}{single ? "" : `–${page + 2}`} <span>/ {pages.length}</span>
        </span>
        <button
          aria-controls={`${id}-pages`}
          aria-disabled={target >= last}
          onClick={() => navigate(1)}
          type="button"
        >
          Next <span aria-hidden="true">→</span>
        </button>
      </nav>
      <p className="reader-key-hint">{single ? "Scroll to read · Swipe or use ← → to turn a page" : "Scroll within a page · Use ← → to turn pages"}</p>
      <span className="book-screenreader-status" role="status">
        {!turning ? `${pages[page].title}. Page ${page + 1}${single ? "" : ` to ${page + 2}`} of ${pages.length}.` : ""}
      </span>
    </div>
  );
}
