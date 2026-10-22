"use client";
import { useMotionPreference } from "./useMotionPreference";

import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import BookCarousel from "./BookCarousel";
import { buildNotes } from "@/content/build-notes";
import { projects, projectArchive } from "@/content/portfolio";
import { projectMedia, teamMoments } from "@/content/media";
import { asset } from "@/content/paths";

type Source = {
  url: string;
  label?: string;
  visibility?: string;
};

type Project = {
  title: string;
  category: string;
  description: string;
  outcome?: string;
  tags: readonly string[];
  repository?: string;
  repositoryLabel?: string;
  repositoryVisibility?: string;
  repositories?: readonly Source[];
  live?: string;
};

type ProjectMedia = {
  src: string;
  alt: string;
  kind: string;
  caption: string;
};

const filters = [
  { id: "all", label: "All" },
  { id: "systems", label: "Systems & Quant" },
  { id: "ai", label: "AI / ML" },
  { id: "full-stack", label: "Full-Stack" },
] as const;

type Filter = (typeof filters)[number]["id"];

const projectGroups: Readonly<
  Record<string, Exclude<Filter, "all"> | undefined>
> = {
  AlphaEngine: "systems",
  "Delta1 Research": "systems",
  "NUSSIF Portfolio & Risk Tools": "systems",
  "BrainHack TIL-AI": "ai",
  "CS2 Decision Coach": "ai",
  "Agentic Fraud Investigation Crew": "ai",
  SignMeUp: "ai",
  "Nexus Academic Coach": "ai",
  DealMachine: "ai",
  Obital: "full-stack",
  PneuRelief: "full-stack",
};

const archiveProjects: readonly Project[] = projectArchive;
const mediaByTitle: Readonly<Record<string, ProjectMedia | undefined>> =
  projectMedia;
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
  const repository = source.url
    .match(/^https?:\/\/github\.com\/([^/]+\/[^/#?]+)/i)?.[1]
    ?.replace(/\.git$/, "");
  const label = report ? "Case study" : "Source code";
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
        {label}
        <span aria-hidden="true">↗</span>
      </a>
      {source.label ? (
        <p className="mt-0.5 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
          {source.label.replace(/\s*\(private\)/i, "")}
        </p>
      ) : null}
      {repository ? (
        <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
          {repository}
        </p>
      ) : null}
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

function ProjectPreview({ project }: { project: Project }) {
  const media = mediaByTitle[project.title];
  const [failed, setFailed] = useState(false);
  const report = Boolean(project.repository && isReport(project.repository));
  const showImage = media && !failed;
  return (
    <figure className="m-3 mb-0">
      {showImage ? (
        <a
          aria-label={`Open full project image: ${project.title}`}
          className="relative block aspect-[16/10] overflow-hidden rounded-lg border border-emerald-950/10 bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-700 dark:border-white/10 dark:bg-stone-950"
          href={asset(media.src)}
          rel="noreferrer"
          target="_blank"
        >
          <Image
            alt={media.alt}
            className="object-contain transition-transform duration-300 motion-safe:group-hover:scale-105 motion-reduce:transition-none"
            fill
            onError={() => setFailed(true)}
            sizes="(min-width: 1152px) 540px, (min-width: 640px) 50vw, 100vw"
            src={asset(media.src)}
            unoptimized
          />
        </a>
      ) : (
        <div
          aria-label="Text project overview; no screenshot available"
          className="flex aspect-[16/10] flex-col justify-between overflow-hidden rounded-lg border border-emerald-950/10 bg-emerald-50/70 p-4 sm:p-5 dark:border-white/10 dark:bg-emerald-950/30"
        >
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            <SourceIcon report={report} />
            {report ? "Case study" : "Source code"}
          </div>
          <div className="min-w-0 space-y-2">
            <p className="text-base font-semibold leading-snug text-emerald-950 sm:text-lg dark:text-emerald-100">
              {project.title}
            </p>
            <p className="text-xs leading-relaxed text-emerald-900/70 dark:text-emerald-300/80">
              {project.category}
            </p>
          </div>
          <p className="font-mono text-[10px] text-emerald-800/70 dark:text-emerald-400/80">
            Project overview
          </p>
        </div>
      )}
      <figcaption className="min-h-10 pt-2 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
        {showImage
          ? media.caption
          : "Text overview · no project screenshot available."}
      </figcaption>
    </figure>
  );
}

function MoreProjects() {
  const [filter, setFilter] = useState<Filter>("all");
  const reducedMotion = useMotionPreference();
  const groupId = useId();
  const gridId = `${groupId}-projects`;
  const filteredProjects = archiveProjects.filter(
    (project) => filter === "all" || projectGroups[project.title] === filter,
  );
  return (
    <div className="project-archive">
      <header className="project-archive-heading">
        <h2>More from the workbench.</h2>
        <p>Apps, research tools and team builds—with the code to explore.</p>
      </header>
      <LayoutGroup id={groupId}>
        <div
          aria-label="Filter the seven additional builds"
          className="mb-6 flex flex-wrap gap-1.5 rounded-xl border border-emerald-950/10 bg-stone-50 p-1.5 dark:border-white/10 dark:bg-stone-900"
          role="group"
        >
          {filters.map((item) => (
            <button
              aria-controls={gridId}
              aria-pressed={filter === item.id}
              className={`relative isolate min-h-11 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:text-sm ${filter === item.id ? "text-white" : "text-stone-600 hover:text-emerald-900 dark:text-stone-400 dark:hover:text-emerald-200"}`}
              key={item.id}
              onClick={() => setFilter(item.id)}
              type="button"
            >
              {filter === item.id ? (
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-lg bg-emerald-800"
                  layoutId="filter-pill"
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                />
              ) : null}
              {item.label}
              <span className="project-filter-count" aria-hidden="true">
                {item.id === "all"
                  ? archiveProjects.length
                  : archiveProjects.filter(
                      (project) => projectGroups[project.title] === item.id,
                    ).length}
              </span>
            </button>
          ))}
        </div>
      </LayoutGroup>
      <p aria-live="polite" className="project-result-count" role="status">
        Showing <strong>{filteredProjects.length}</strong> of{" "}
        {archiveProjects.length} additional builds
      </p>
      <div
        className="relative grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2"
        id={gridId}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="group flex h-full min-w-0 flex-col rounded-xl border border-emerald-950/10 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md hover:border-emerald-700/35 dark:border-white/10 dark:bg-stone-900"
              exit={{ opacity: 0 }}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              key={project.title}
              layout={reducedMotion ? false : "position"}
              transition={{ duration: reducedMotion ? 0 : 0.22 }}
            >
              <ProjectPreview project={project} />
              <div className="flex flex-1 flex-col p-4 pt-2 sm:p-5 sm:pt-3">
                <p className="mb-2 text-[11px] font-medium leading-relaxed text-emerald-800 dark:text-emerald-300">
                  {project.category}
                </p>
                <h3 className="mb-3 text-lg font-semibold leading-snug tracking-tight text-stone-900 dark:text-stone-100">
                  <a
                    className="inline-flex min-h-11 items-start gap-2 hover:text-emerald-700 dark:hover:text-emerald-300"
                    href={project.live ?? project.repository}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {project.title}
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-normal text-emerald-600"
                    >
                      ↗︎
                    </span>
                  </a>
                </h3>
                <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {project.description}
                </p>
                {project.outcome ? (
                  <p className="mt-3 border-l-2 border-emerald-200 pl-3 text-xs leading-relaxed text-stone-600 dark:border-emerald-900 dark:text-stone-400">
                    {project.outcome}
                  </p>
                ) : null}
                <div className="mt-auto space-y-4 pt-5">
                  <ul
                    aria-label={`${project.title} technologies`}
                    className="flex flex-wrap gap-1.5"
                  >
                    {project.tags.map((tag) => (
                      <li
                        className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-900 dark:bg-emerald-900/35 dark:text-emerald-200"
                        key={tag}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <ProjectSources project={project} />
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TeamPhotos() {
  return (
    <details className="group/photos mt-8 rounded-xl border border-emerald-950/10 bg-stone-50/70 p-4 sm:p-5 dark:border-white/10 dark:bg-stone-900">
      <summary className="flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-sm text-sm font-semibold text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-700 dark:text-emerald-200">
        Hackathon photos{" "}
        <span
          aria-hidden="true"
          className="inline-block text-base group-open/photos:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {teamMoments.map((moment) => (
          <figure key={moment.src}>
            <a
              aria-label={`Open photo: ${moment.title}`}
              className="group/photo relative block aspect-[16/10] overflow-hidden rounded-lg border border-emerald-950/10 bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-700 dark:border-white/10 dark:bg-stone-950"
              href={asset(moment.src)}
              rel="noreferrer"
              target="_blank"
            >
              <Image
                alt={moment.alt}
                className="object-contain transition-transform duration-300 motion-safe:group-hover/photo:scale-105 motion-reduce:transition-none"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                src={asset(moment.src)}
                unoptimized
              />
            </a>
            <figcaption className="pt-2 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              {moment.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </details>
  );
}

function FeaturedBookDetails({
  project,
  media,
}: {
  project: Project;
  media?: ProjectMedia;
}) {
  const note = buildNotes[project.title];
  return (
    <div className="book-case-study">
      <p className="book-detail-category">{project.category}</p>
      <h3>{project.title}</h3>
      <p className="book-detail-description">{project.description}</p>
      {note ? (
        <dl className="book-build-notes">
          <div>
            <dt>The challenge</dt>
            <dd>{note.question}</dd>
          </div>
          <div>
            <dt>Inside the build</dt>
            <dd>{note.decision}</dd>
          </div>
          <div className="book-proof">
            <dt>Proof of work</dt>
            <dd>{note.proof}</dd>
          </div>
        </dl>
      ) : project.outcome ? (
        <p className="book-detail-outcome">{project.outcome}</p>
      ) : null}
      <ul
        className="book-detail-tags"
        aria-label={`${project.title} technologies`}
      >
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <ProjectSources project={project} />
      {media ? (
        <div className="book-original">
          <a href={asset(media.src)} target="_blank" rel="noreferrer">
            View {media.kind.toLowerCase()} <span aria-hidden="true">↗︎</span>
          </a>
          <p>{media.caption}</p>
        </div>
      ) : null}
    </div>
  );
}

const collections = [
  { id: "books", label: "The bookshelf", count: projects.length },
  { id: "more", label: "More builds", count: projectArchive.length },
] as const;
type Collection = (typeof collections)[number]["id"];
export default function ProjectsPanel({
  active = true,
  requestedProject,
}: {
  active?: boolean;
  requestedProject?: { title: string; id: number };
}) {
  const [collection, setCollection] = useState<Collection>("books");
  const handledRequestRef = useRef<number | null>(null);
  const collectionId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    if (
      !active ||
      !requestedProject ||
      handledRequestRef.current === requestedProject.id
    )
      return;
    handledRequestRef.current = requestedProject.id;
    setCollection("books");
  }, [active, requestedProject]);
  function navigateCollection(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - index;
    setCollection(collections[next].id);
    tabRefs.current[next]?.focus({ preventScroll: true });
  }
  return (
    <div className="project-library">
      <div className="project-shelf-toolbar">
        <div
          role="tablist"
          aria-label="Project collections"
          className="project-shelf-tabs"
        >
          {collections.map((item, index) => (
            <button
              type="button"
              key={item.id}
              role="tab"
              id={`${collectionId}-${item.id}-tab`}
              aria-selected={collection === item.id}
              aria-controls={`${collectionId}-${item.id}-panel`}
              tabIndex={collection === item.id ? 0 : -1}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              onKeyDown={(event) => navigateCollection(event, index)}
              onClick={() => setCollection(item.id)}
            >
              {item.label}
              <span>{item.count}</span>
            </button>
          ))}
        </div>
        <a
          className="project-all-source"
          href="https://github.com/Manutd1234"
          target="_blank"
          rel="noreferrer"
        >
          All repositories ↗︎
        </a>
      </div>
      <div
        role="tabpanel"
        id={`${collectionId}-books-panel`}
        aria-labelledby={`${collectionId}-books-tab`}
        hidden={collection !== "books"}
        tabIndex={0}
      >
        <BookCarousel
          projects={projects}
          media={mediaByTitle}
          active={active && collection === "books"}
          requestedProject={requestedProject?.title}
          requestKey={requestedProject?.id}
          renderDetails={(project, media) => (
            <FeaturedBookDetails project={project} media={media} />
          )}
        />
      </div>
      <div
        role="tabpanel"
        id={`${collectionId}-more-panel`}
        aria-labelledby={`${collectionId}-more-tab`}
        hidden={collection !== "more"}
        tabIndex={0}
      >
        <MoreProjects />
      </div>
      <TeamPhotos />
    </div>
  );
}
