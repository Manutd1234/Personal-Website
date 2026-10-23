"use client";

import Image from "next/image";
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
  highlights?: readonly string[];
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

const allProjects: readonly Project[] = [...projects, ...projectArchive];
const mediaByTitle: Readonly<Record<string, ProjectMedia | undefined>> =
  projectMedia;
const photosByProject: Readonly<
  Record<string, readonly (typeof teamMoments)[number][] | undefined>
> = {
  "BrainHack TIL-AI": teamMoments.filter((moment) =>
    moment.src.includes("brainhack"),
  ),
  "Agentic Fraud Investigation Crew": teamMoments.filter((moment) =>
    moment.src.includes("hack-the-future"),
  ),
};

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

function ProjectBookDetails({
  project,
  media,
}: {
  project: Project;
  media?: ProjectMedia;
}) {
  const note = buildNotes[project.title];
  const moments = photosByProject[project.title] ?? [];
  return (
    <div className="book-case-study">
      <p className="book-detail-category">{project.category}</p>
      <h3>{project.title}</h3>
      <p className="book-detail-description">{project.description}</p>
      {project.highlights?.length ? (
        <div className="book-highlights">
          <h4>Highlights</h4>
          <ul>
            {project.highlights.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {note ? (
        <details className="book-build-disclosure">
          <summary>
            Design notes <span aria-hidden="true">+</span>
          </summary>
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
        </details>
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
        <figure className="book-project-photo">
          <a
            href={asset(media.src)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${project.title} ${media.kind.toLowerCase()} in a new tab`}
          >
            <Image
              src={asset(media.src)}
              alt={media.alt}
              width={1280}
              height={800}
              unoptimized
            />
            <span>View {media.kind.toLowerCase()} ↗</span>
          </a>
          <figcaption>{media.caption}</figcaption>
        </figure>
      ) : null}
      {moments.length ? (
        <section
          className="book-team-photos"
          aria-label={`${project.title} team and event photos`}
        >
          <h4>Behind the build</h4>
          <div>
            {moments.map((moment) => (
              <figure key={moment.src}>
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
                </a>
                <figcaption>{moment.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function ProjectsPanel({
  active = true,
  requestedProject,
}: {
  active?: boolean;
  requestedProject?: { title: string; id: number };
}) {
  return (
    <div className="project-library">
      <BookCarousel
        projects={allProjects}
        media={mediaByTitle}
        active={active}
        requestedProject={requestedProject?.title}
        requestKey={requestedProject?.id}
        renderDetails={(project, media) => (
          <ProjectBookDetails project={project} media={media} />
        )}
      />
      <a
        className="book-library-source"
        href="https://github.com/Manutd1234"
        target="_blank"
        rel="noreferrer"
      >
        Explore all repositories <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
