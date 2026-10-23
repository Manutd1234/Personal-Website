"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import type {
  Project,
  ProjectMedia,
  ProjectSource as Source,
} from "./BookCarousel";
import { buildNotes } from "@/content/build-notes";
import { teamMoments } from "@/content/media";
import { asset } from "@/content/paths";
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

function chaptersFor(project: Project, media?: ProjectMedia): Chapter[] {
  const note = buildNotes[project.title];
  const moments =
    project.title === "BrainHack TIL-AI"
      ? teamMoments.filter((moment) => moment.src.includes("brainhack"))
      : project.title === "Agentic Fraud Investigation Crew"
        ? teamMoments.filter((moment) => moment.src.includes("hack-the-future"))
        : [];
  const pages: Chapter[] = [
    {
      title: "Opening notes",
      kind: "title",
      content: (
        <>
          <p className="reader-category">{project.category}</p>
          <h3>{project.title}</h3>
          <p className="reader-intro">{project.description}</p>
          {project.outcome ? (
            <p className="reader-outcome">{project.outcome}</p>
          ) : null}
          <p className="reader-signature">Ian Wangsa</p>
        </>
      ),
    },
  ];
  const highlights = project.highlights ?? [];
  for (let offset = 0; offset < highlights.length; offset += 2) {
    pages.push({
      title: offset === 0 ? "What went into it" : "Under the surface",
      content: (
        <ul className="reader-highlights">
          {highlights.slice(offset, offset + 2).map((point, index) => (
            <li key={point}>
              <span aria-hidden="true">
                {String(offset + index + 1).padStart(2, "0")}
              </span>
              <p>{point}</p>
            </li>
          ))}
        </ul>
      ),
    });
  }
  if (note)
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

export default function ProjectBookReader({
  project,
  media,
}: {
  project: Project;
  media?: ProjectMedia;
}) {
  const pages = chaptersFor(project, media);
  const [page, setPage] = useState(0);
  const [single, setSingle] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [turn, setTurn] = useState<{
    from: number;
    to: number;
    direction: "next" | "previous";
    height: number;
  } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const id = useId();
  const perSpread = single ? 1 : 2;
  const last = single ? pages.length - 1 : pages.length - 2;
  const destinationTitle = turn ? pages[turn.to].title : "";

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let previousNarrow: boolean | undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry || entry.contentRect.width === 0) return;
      const narrow = entry.contentRect.width < 680;
      if (narrow === previousNarrow) return;
      previousNarrow = narrow;
      setSingle(narrow);
      setPage((current) => (narrow ? current : Math.floor(current / 2) * 2));
      setTurn(null);
      pending.current = false;
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!turn) return;
    const finish = () => {
      setPage(turn.to);
      setTurn(null);
      pending.current = false;
      setAnnouncement(
        `${destinationTitle}. Page ${turn.to + 1}${single ? "" : ` to ${turn.to + 2}`} of ${pages.length}.`,
      );
    };
    const timer = window.setTimeout(finish, reduced ? 0 : 720);
    return () => window.clearTimeout(timer);
  }, [turn, reduced, single, pages.length, destinationTitle]);

  function goTo(next: number) {
    if (pending.current) return;
    const target = Math.max(0, Math.min(last, next));
    if (target === page) return;
    pending.current = true;
    setTurn({
      from: page,
      to: target,
      direction: target > page ? "next" : "previous",
      height:
        root.current?.querySelector(".reader-spread")?.getBoundingClientRect()
          .height ?? 0,
    });
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
      if (event.key === "Home") goTo(0);
      else if (event.key === "End") goTo(last);
      else goTo(page + (event.key === "ArrowRight" ? perSpread : -perSpread));
    }
  }

  function leaf(index: number, extraClass = "") {
    const chapter = pages[index];
    if (!chapter) return null;
    return (
      <article className={`reader-page ${extraClass}`} data-kind={chapter.kind}>
        <header>
          <span>{project.title}</span>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        </header>
        <div className="reader-page-body">
          {chapter.kind !== "title" ? <h4>{chapter.title}</h4> : null}
          {chapter.content}
        </div>
        <footer>
          <span>{chapter.title}</span>
          <span>{index + 1}</span>
        </footer>
      </article>
    );
  }

  const baseLeft = turn && turn.direction === "previous" ? turn.to : page;
  const baseRight = turn && turn.direction === "next" ? turn.to + 1 : page + 1;
  const front = turn
    ? single
      ? turn.from
      : turn.direction === "next"
        ? turn.from + 1
        : turn.from
    : 0;
  const back = turn
    ? single
      ? turn.to
      : turn.direction === "next"
        ? turn.to
        : turn.to + 1
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
        aria-label={`${project.title}, pages ${page + 1}${single ? "" : `–${page + 2}`}`}
        className="reader-spread"
        id={`${id}-pages`}
        role="group"
        style={turn ? { minHeight: turn.height } : undefined}
      >
        <div className="reader-static-page reader-static-left">
          {leaf(single && turn ? turn.to : baseLeft)}
        </div>
        {!single ? (
          <div className="reader-static-page reader-static-right">
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
          >
            <div className="reader-turn-front">{leaf(front)}</div>
            <div className="reader-turn-back">{leaf(back)}</div>
          </div>
        ) : null}
      </div>
      <nav
        aria-label={`${project.title} page navigation`}
        className="reader-navigation"
      >
        <button
          aria-controls={`${id}-pages`}
          aria-disabled={page === 0 || Boolean(turn)}
          onClick={() => goTo(page - perSpread)}
          type="button"
        >
          <span aria-hidden="true">←</span> Previous
        </button>
        <span className="reader-page-count">
          {page + 1}
          {single ? "" : `–${page + 2}`} <span>/ {pages.length}</span>
        </span>
        <button
          aria-controls={`${id}-pages`}
          aria-disabled={page >= last || Boolean(turn)}
          onClick={() => goTo(page + perSpread)}
          type="button"
        >
          Next <span aria-hidden="true">→</span>
        </button>
      </nav>
      <p className="reader-key-hint">Turn a page with ← →</p>
      <span className="book-screenreader-status" role="status">
        {announcement}
      </span>
    </div>
  );
}
