import { useId } from "react";
import { projects, projectArchive } from "@/content/portfolio";
import { projectMedia } from "@/content/media";
import { asset } from "@/content/paths";

type Preview = { src: string; alt: string; kind: string; caption: string };
const media: Readonly<Record<string, Preview | undefined>> = projectMedia;
const builds = new Map(
  [...projects, ...projectArchive].map((project) => [project.title, project]),
);

export default function ProjectEvidence({
  titles,
  title,
  note,
  onOpen,
}: {
  titles: readonly string[];
  title: string;
  note: string;
  onOpen: (title: string) => void;
}) {
  const id = useId();
  return (
    <section
      className="mt-12 border-t border-emerald-900/15 pt-8 dark:border-emerald-100/15"
      aria-labelledby={id}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2
          id={id}
          className="text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100"
        >
          {title}
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          {note}
        </p>
      </div>
      <div
        className={[
          "grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2",
          titles.length > 2 ? "lg:grid-cols-3" : "",
        ].join(" ")}
      >
        {titles.map((name) => {
          const project = builds.get(name);
          const preview = media[name];
          if (!project || !preview) return null;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onOpen(name)}
              aria-label={`Explore ${name} in the project library`}
              className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-emerald-900/15 bg-white text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 dark:border-emerald-100/15 dark:bg-emerald-950/30 dark:focus-visible:outline-emerald-300"
            >
              <span className="relative block aspect-[16/10] w-full overflow-hidden border-b border-emerald-900/10 bg-stone-100 p-3 dark:border-emerald-100/10 dark:bg-stone-900">
                <img
                  src={asset(preview.src)}
                  alt={preview.alt}
                  width={1600}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
                />
              </span>
              <span className="flex flex-1 flex-col gap-2 p-5">
                <span className="font-mono text-[10px] tracking-wider text-emerald-700 uppercase dark:text-emerald-300">
                  {preview.kind}
                </span>
                <span className="flex items-start justify-between gap-3 text-lg font-bold leading-snug text-emerald-950 dark:text-emerald-50">
                  {name}
                  <span aria-hidden="true">↗</span>
                </span>
                <span className="line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {preview.caption}
                </span>
                <span className="mt-auto pt-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Open the project book
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
