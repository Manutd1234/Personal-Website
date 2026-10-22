"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Medal,
  Search,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { achievementGroups, certifications } from "@/content/portfolio";
import { certificateFiles, projectMedia } from "@/content/media";
import { asset } from "@/content/paths";
import { trophies, type Trophy as TrophyRecord } from "@/content/trophies";
import { useMotionPreference } from "./useMotionPreference";
import "../app/trophy-room.css";

type AwardRecord = {
  title: string;
  issuer: string;
  detail?: string;
  year?: string;
  certificateKey?: string;
  certificateKeys?: readonly string[];
};
type CertificateFile = {
  src: string;
  originalSrc?: string;
  title: string;
  kind?: string;
  representative?: boolean;
  caption?: string;
  source?: { label: string; url: string };
};
const previewKind = (file: CertificateFile) => file.kind ?? "Certificate";
const isSoftballAward = (record: AwardRecord) =>
  /softball/i.test(`${record.title} ${record.detail ?? ""}`);
type CategoryId =
  | "competitions"
  | "government"
  | "academic"
  | "sport"
  | "service"
  | "certificates";
type CollectionFilter = "all" | CategoryId;
type Achievement = AwardRecord & {
  id: string;
  category: CategoryId;
  categoryLabel: string;
  certificates: readonly CertificateFile[];
  preview: CertificateFile;
  project?: TrophyRecord;
};

const files: Readonly<Record<string, CertificateFile>> = certificateFiles;
const projectRecords = new Map(
  trophies.map((record) => [record.title, record]),
);
const recordsFor = (title: string): readonly AwardRecord[] =>
  achievementGroups.find((group) => group.title === title)?.items ?? [];
const schoolRecords = recordsFor("Academic & sporting awards");
const isSport = (record: AwardRecord) =>
  /Softball|Colours Award|Sports Day|School athletics|SwimSafer/i.test(
    record.title,
  );
const categories: readonly {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  records: readonly AwardRecord[];
}[] = [
  {
    id: "competitions",
    label: "Competitions",
    icon: Trophy,
    records: recordsFor("Technical competitions"),
  },
  {
    id: "government",
    label: "Government",
    icon: Landmark,
    records: recordsFor("Government awards & scholarships"),
  },
  {
    id: "academic",
    label: "Academic & creative",
    icon: GraduationCap,
    records: schoolRecords.filter((record) => !isSport(record)),
  },
  {
    id: "sport",
    label: "Sport",
    icon: Medal,
    records: schoolRecords.filter(isSport),
  },
  {
    id: "service",
    label: "Service",
    icon: HeartHandshake,
    records: recordsFor("Service & leadership"),
  },
  {
    id: "certificates",
    label: "Credentials",
    icon: BookOpen,
    records: certifications,
  },
];
const slug = (text: string) =>
  text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
function representativePreview(record: AwardRecord): CertificateFile {
  const issuer = record.issuer;
  const issuerLogo = isSoftballAward(record)
    ? "ejc-softball"
    : /Eunoia Junior College/i.test(issuer)
      ? "ejc"
      : /School of Science and Technology|SST Changemakers/i.test(issuer)
        ? "sst"
        : /Bukit Timah Primary School/i.test(issuer)
          ? "btps"
          : /Singapore Armed Forces|160 SQN/i.test(issuer)
            ? "rsaf"
            : undefined;
  const subject = /swim/i.test(record.title)
    ? "swimming"
    : /piano/i.test(record.title)
      ? "music"
      : /Cisco/i.test(issuer)
        ? "network"
        : "course";
  return {
    src: issuerLogo
      ? `images/logos/${issuerLogo}.webp`
      : `images/awards/representative-${subject}-emblem.svg`,
    title: issuerLogo
      ? `${issuer} — representative issuer emblem`
      : `Representative ${subject} emblem`,
    kind: "Representative emblem",
    representative: true,
    caption: issuerLogo
      ? "Representative issuer emblem. A personal award photograph or certificate preview is not available for this record."
      : "Representative subject emblem. A personal award photograph or certificate preview is not available for this record.",
  };
}
const relatedProjectTitles: Readonly<Record<string, string>> = {
  "BrainHack TIL-AI 2026": "BrainHack TIL-AI",
  "Hack the Future AI Hackathon 2026": "Agentic Fraud Investigation Crew",
  "BügleRock Rockathon 2026": "DealMachine",
  "SignMeUp · The Merge Hackathon 2026": "SignMeUp",
};
const projectPreviews: Readonly<
  Record<
    string,
    { src: string; alt: string; caption: string; kind: string } | undefined
  >
> = projectMedia;
const collection: readonly Achievement[] = categories.flatMap((category) =>
  category.records.map((record) => {
    const certificates = (
      record.certificateKeys ??
      (record.certificateKey ? [record.certificateKey] : [])
    ).flatMap((key) => (files[key] ? [files[key]] : []));
    return {
      ...record,
      id: `${category.id}-${slug(record.title)}`,
      category: category.id,
      categoryLabel: category.label,
      certificates,
      preview: certificates[0] ?? representativePreview(record),
      project: projectRecords.get(record.title),
    };
  }),
);
const previewCount = new Set(
  collection.flatMap((record) =>
    record.certificates
      .filter((file) => !file.representative)
      .map((file) => file.src),
  ),
).size;
const hashFilters: Readonly<Record<string, CollectionFilter>> = {
  "#competitions": "competitions",
  "#government": "government",
  "#academic": "academic",
  "#sport": "sport",
  "#service": "service",
  "#certificates": "certificates",
};

function AchievementCard({
  record,
  reduced,
  onOpen,
  buttonRef,
}: {
  record: Achievement;
  reduced: boolean;
  onOpen: (record: Achievement, opener: HTMLButtonElement) => void;
  buttonRef: (element: HTMLButtonElement | null) => void;
}) {
  const Icon =
    categories.find((category) => category.id === record.category)?.icon ??
    Award;
  const first = record.preview;
  function lean(event: PointerEvent<HTMLElement>) {
    if (reduced || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    event.currentTarget.style.setProperty(
      "--card-lean-x",
      `${(0.5 - y) * 4}deg`,
    );
    event.currentTarget.style.setProperty(
      "--card-lean-y",
      `${(x - 0.5) * 5}deg`,
    );
    event.currentTarget.style.setProperty("--card-light-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--card-light-y", `${y * 100}%`);
  }
  function settle(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--card-lean-x", "0deg");
    event.currentTarget.style.setProperty("--card-lean-y", "0deg");
  }
  return (
    <motion.article
      className="achievement-card"
      data-category={record.category}
      onPointerMove={lean}
      onPointerLeave={settle}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
    >
      <div className="achievement-card-inner">
        <div className="achievement-card-type">
          <span>
            {isSoftballAward(record) ? (
              <img
                src={asset("images/logos/ejc-softball.webp")}
                alt="Eunoia softball logo"
                width={24}
                height={24}
                style={{
                  width: 24,
                  height: 24,
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
            ) : (
              <Icon size={14} aria-hidden="true" />
            )}
            {record.categoryLabel}
          </span>
          {record.year ? <span>{record.year}</span> : null}
        </div>
        <div
          className={`achievement-art has-certificate${first.kind === "Representative emblem" ? " is-emblem" : ""}`}
        >
          {
            <img
              src={asset(first.src)}
              alt={first.title}
              loading="lazy"
              decoding="async"
            />
          }
          {first.representative ? (
            <span className="achievement-preview-label">
              Representative image
            </span>
          ) : null}
          {record.certificates.length > 1 ? (
            <span className="achievement-scan-count">
              {record.certificates.length} previews
            </span>
          ) : null}
        </div>
        <h3>{record.title}</h3>
        <p className="achievement-issuer">{record.issuer}</p>
        {record.detail ? (
          <p
            className={`achievement-result${/Expired/i.test(record.detail) ? " is-expired" : ""}`}
          >
            {record.detail}
          </p>
        ) : null}
        {record.certificates.length > 1 ? (
          <div className="achievement-mini-scans" aria-label="Award previews">
            {record.certificates.slice(1).map((file) => (
              <img
                key={file.src}
                src={asset(file.src)}
                alt={file.title}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        ) : null}
        <div className="achievement-card-footer">
          <span>
            {first.representative
              ? previewKind(first)
              : `${previewKind(first)} on file`}
          </span>
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="dialog"
            onClick={(event) => onOpen(record, event.currentTarget)}
            aria-label={`Open achievement card: ${record.title}`}
          >
            Open card <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function TrophyRoom() {
  const [filter, setFilter] = useState<CollectionFilter>("competitions");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Achievement | null>(null);
  const reduced = useMotionPreference();
  const prefix = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const buttonsRef = useRef(new Map<string, HTMLButtonElement>());
  const mountedRef = useRef(false);
  const restoreRef = useRef(true);
  const search = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      collection.filter((record) =>
        `${record.title} ${record.issuer} ${record.detail ?? ""} ${record.year ?? ""} ${record.categoryLabel}`
          .toLowerCase()
          .includes(search),
      ),
    [search],
  );
  const visible = matches.filter(
    (record) => filter === "all" || record.category === filter,
  );

  useEffect(() => {
    mountedRef.current = true;
    const syncHash = () => {
      restoreRef.current = false;
      setSelected(null);
      const next = hashFilters[window.location.hash.toLowerCase()];
      if (next) {
        setFilter(next);
        setQuery("");
      }
    };
    const section = sectionRef.current;
    const syncVisibility = () => {
      if (section?.closest('[hidden], [inert], [aria-hidden="true"]')) {
        restoreRef.current = false;
        setSelected(null);
      }
    };
    const observer = new MutationObserver(syncVisibility);
    for (
      let parent = section?.parentElement;
      parent;
      parent = parent.parentElement
    )
      observer.observe(parent, {
        attributes: true,
        attributeFilter: ["hidden", "inert", "aria-hidden"],
      });
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => {
      mountedRef.current = false;
      observer.disconnect();
      window.removeEventListener("hashchange", syncHash);
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const { body, documentElement: html } = document;
    const old = {
      body: body.style.overflow,
      html: html.style.overflow,
      padding: body.style.paddingRight,
      x: window.scrollX,
      y: window.scrollY,
    };
    const scrollbar = Math.max(0, window.innerWidth - html.clientWidth);
    if (
      scrollbar &&
      !getComputedStyle(html)
        .getPropertyValue("scrollbar-gutter")
        .includes("stable")
    )
      body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      body.style.overflow = old.body;
      html.style.overflow = old.html;
      body.style.paddingRight = old.padding;
      const opener = openerRef.current;
      if (
        mountedRef.current &&
        restoreRef.current &&
        opener?.isConnected &&
        opener.getClientRects().length &&
        !opener.closest('[hidden], [inert], [aria-hidden="true"]')
      ) {
        window.scrollTo({ left: old.x, top: old.y, behavior: "instant" });
        opener.focus({ preventScroll: true });
      }
    };
  }, [selected]);

  function open(record: Achievement, opener: HTMLButtonElement) {
    openerRef.current = opener;
    restoreRef.current = true;
    setSelected(record);
  }
  function dialogKeys(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setSelected(null);
    }
    if (event.key !== "Tab") return;
    const targets = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        "button:not(:disabled), a[href]",
      ),
    ];
    const first = targets[0];
    const last = targets[targets.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <section
      className="trophy-collection"
      ref={sectionRef}
      aria-labelledby={`${prefix}-title`}
    >
      <header className="trophy-collection-heading">
        <div>
          <p className="trophy-eyebrow">Earned, along the way</p>
          <h2 id={`${prefix}-title`}>The achievement collection.</h2>
          <p>
            A little card collection of competitions, milestones, and things
            I’ve learned.
          </p>
        </div>
        <span className="trophy-collection-count">
          <Award size={17} aria-hidden="true" />
          {collection.length} records
          <span>{previewCount} award previews</span>
        </span>
      </header>
      <div className="trophy-browser">
        <div
          className="trophy-filters"
          role="group"
          aria-label="Choose an achievement category"
        >
          {([{ id: "all", label: "All" }, ...categories] as const).map(
            (category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={filter === category.id}
                aria-controls={`${prefix}-cards`}
                onClick={() => setFilter(category.id)}
              >
                {category.label}
                <span>
                  {category.id === "all"
                    ? matches.length
                    : matches.filter(
                        (record) => record.category === category.id,
                      ).length}
                </span>
              </button>
            ),
          )}
        </div>
        <label className="trophy-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search all awards and credentials</span>
          <input
            type="search"
            value={query}
            placeholder="Find an award, issuer, or year…"
            onChange={(event) => {
              setQuery(event.target.value);
              setFilter("all");
            }}
          />
        </label>
      </div>
      <p className="trophy-results" role="status">
        {visible.length} {visible.length === 1 ? "record" : "records"}
        {filter === "all"
          ? " in the collection"
          : ` · ${categories.find((category) => category.id === filter)?.label}`}
        {search ? ` matching “${query.trim()}”` : ""}.
      </p>
      {visible.length ? (
        <div className="trophy-card-grid" id={`${prefix}-cards`}>
          {visible.map((record) => (
            <AchievementCard
              key={record.id}
              record={record}
              reduced={reduced}
              onOpen={open}
              buttonRef={(button) => {
                if (button) buttonsRef.current.set(record.id, button);
                else buttonsRef.current.delete(record.id);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="trophy-empty" id={`${prefix}-cards`}>
          <Search size={27} aria-hidden="true" />
          <h3>No matching cards yet.</h3>
          <p>Try another title, issuer, or year.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Reset collection
          </button>
        </div>
      )}
      <dialog
        ref={dialogRef}
        className="achievement-dialog"
        aria-labelledby={`${prefix}-dialog-title`}
        onKeyDown={dialogKeys}
        onCancel={(event) => {
          event.preventDefault();
          setSelected(null);
        }}
        onClose={() => {
          if (!dialogRef.current?.open) setSelected(null);
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const box = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            setSelected(null);
        }}
      >
        {selected ? (
          <div className="achievement-detail" data-category={selected.category}>
            <header className="achievement-detail-heading">
              <div>
                <p className="trophy-eyebrow">{selected.categoryLabel}</p>
                <h2 id={`${prefix}-dialog-title`}>{selected.title}</h2>
              </div>
              <button
                type="button"
                ref={closeRef}
                onClick={() => setSelected(null)}
                aria-label="Close achievement card"
              >
                <X size={21} aria-hidden="true" />
              </button>
            </header>
            <dl className="achievement-facts">
              <div>
                <dt>Issuer</dt>
                <dd>{selected.issuer}</dd>
              </div>
              {selected.year ? (
                <div>
                  <dt>Date</dt>
                  <dd>{selected.year}</dd>
                </div>
              ) : null}
              {selected.detail ? (
                <div className="achievement-fact-wide">
                  <dt>
                    {selected.category === "certificates"
                      ? "Status / record"
                      : "Result / recognition"}
                  </dt>
                  <dd>{selected.detail}</dd>
                </div>
              ) : null}
            </dl>
            {
              <section
                className="achievement-certificates"
                aria-label="Award evidence and labelled representative images"
              >
                {(selected.certificates.length
                  ? selected.certificates
                  : [selected.preview]
                ).map((file) => (
                  <figure key={file.src}>
                    <a
                      href={asset(file.src)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${file.title} — open full ${previewKind(file).toLowerCase()} in a new tab`}
                    >
                      <img
                        src={asset(file.src)}
                        alt={file.title}
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                    <figcaption>
                      <span>{file.title}</span>
                      <a
                        href={asset(file.src)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Full {previewKind(file).toLowerCase()}{" "}
                        <ArrowUpRight size={15} aria-hidden="true" />
                        <span className="sr-only">, opens in a new tab</span>
                      </a>
                    </figcaption>
                    {file.caption ? (
                      <p className="achievement-preview-note">{file.caption}</p>
                    ) : null}
                    {file.originalSrc ? (
                      <a
                        className="achievement-preview-source"
                        href={asset(file.originalSrc)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View original photo{" "}
                        <ArrowUpRight size={14} aria-hidden="true" />
                        <span className="sr-only">, opens in a new tab</span>
                      </a>
                    ) : null}
                    {file.source ? (
                      <a
                        className="achievement-preview-source"
                        href={file.source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {file.source.label}
                        <ArrowUpRight size={14} aria-hidden="true" />
                        <span className="sr-only">, opens in a new tab</span>
                      </a>
                    ) : null}
                  </figure>
                ))}
              </section>
            }
            {projectPreviews[relatedProjectTitles[selected.title]]
              ? (() => {
                  const preview =
                    projectPreviews[relatedProjectTitles[selected.title]]!;
                  return (
                    <figure className="achievement-related-project">
                      <p className="trophy-eyebrow">
                        The project behind the award
                      </p>
                      <a
                        href={asset(preview.src)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${relatedProjectTitles[selected.title]} — open project image in a new tab`}
                      >
                        <img
                          src={asset(preview.src)}
                          alt={preview.alt}
                          loading="lazy"
                          decoding="async"
                        />
                      </a>
                      <figcaption>
                        <strong>{relatedProjectTitles[selected.title]}</strong>
                        <span>{preview.caption}</span>
                      </figcaption>
                    </figure>
                  );
                })()
              : null}
            {selected.project ? (
              <section
                className="achievement-project-notes"
                aria-label="Project and achievement notes"
              >
                {selected.project.built ? (
                  <h3>{selected.project.built}</h3>
                ) : (
                  <h3>About this recognition</h3>
                )}
                {(
                  selected.project.strategy ??
                  selected.project.notes ??
                  []
                ).map((point) => (
                  <p key={point}>{point}</p>
                ))}
                {selected.project.stack.length ? (
                  <ul className="achievement-stack" aria-label="Project tools">
                    {selected.project.stack.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                ) : null}
                {selected.project.source ? (
                  <a
                    className="achievement-source"
                    href={selected.project.source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {selected.project.source.label ?? "Project repository"}
                    <ArrowUpRight size={15} aria-hidden="true" />
                    <span className="sr-only">, opens in a new tab</span>
                  </a>
                ) : null}
              </section>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
