"use client";

import {
  ArrowUpRight,
  Award,
  BatteryFull,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Medal,
  Search,
  Trophy,
  Wifi,
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
} from "react";
import { achievementGroups, certifications } from "@/content/portfolio";
import { certificateFiles, projectMedia } from "@/content/media";
import { credentialProviders } from "@/content/credential-providers";
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
  verificationUrl?: string;
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
  const provider = credentialProviders[issuer];
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
    src:
      provider?.src ??
      (issuerLogo
        ? `images/logos/${issuerLogo}.webp`
        : `images/awards/representative-${subject}-emblem.svg`),
    title:
      issuerLogo || provider
        ? `${issuer} — representative issuer emblem`
        : `Representative ${subject} emblem`,
    kind: "Representative emblem",
    representative: true,
    caption:
      issuerLogo || provider
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

function AchievementApp({
  record,
  onOpen,
}: {
  record: Achievement;
  onOpen: (record: Achievement, opener: HTMLButtonElement) => void;
}) {
  const Icon =
    categories.find((category) => category.id === record.category)?.icon ??
    Award;
  const first = record.preview;
  const provider = credentialProviders[record.issuer];
  return (
    <li className="award-app" data-category={record.category}>
      <button
        type="button"
        className="award-app-button"
        aria-label={`View achievement: ${record.title}`}
        aria-haspopup="dialog"
        onClick={(event) => onOpen(record, event.currentTarget)}
      >
        <span
          className="award-app-icon"
          data-emblem={Boolean(provider || first.representative)}
        >
          <img
            src={asset(provider?.src ?? first.src)}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span className="award-app-category-mark" aria-hidden="true">
            <Icon size={13} />
          </span>
        </span>
        <span className="award-app-label">{record.title}</span>
        <span className="award-app-date">
          {record.year ?? record.categoryLabel}
        </span>
        {/Expired/i.test(record.detail ?? "") ? (
          <span className="award-app-expired">Expired</span>
        ) : null}
      </button>
    </li>
  );
}

export default function TrophyRoom() {
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Achievement | null>(null);
  const [available, setAvailable] = useState(false);
  const reduced = useMotionPreference();
  const prefix = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
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
        appsRef.current?.scrollTo({ top: 0, behavior: "instant" });
      }
    };
    const section = sectionRef.current;
    const syncVisibility = () => {
      const hidden = Boolean(
        section?.closest('[hidden], [inert], [aria-hidden="true"]'),
      );
      setAvailable(!hidden && !document.hidden);
      if (hidden) {
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
    syncVisibility();
    window.addEventListener("hashchange", syncHash);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      mountedRef.current = false;
      observer.disconnect();
      window.removeEventListener("hashchange", syncHash);
      document.removeEventListener("visibilitychange", syncVisibility);
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
      data-suspended={!available || reduced}
    >
      <header className="trophy-collection-heading">
        <h2 id={`${prefix}-title`} className="sr-only">
          Awards and certificates
        </h2>
        <p>Open an award to see the certificate and story.</p>
        <span className="trophy-collection-count">
          {collection.length} records · {previewCount} previews
        </span>
      </header>
      <div className="award-tablet">
        <span className="award-tablet-camera" aria-hidden="true" />
        <div className="award-tablet-screen">
          <div className="award-tablet-status" aria-hidden="true">
            <span>Ian’s collection</span>
            <span>
              {collection.length} records <Wifi size={13} />
              <BatteryFull size={17} />
            </span>
          </div>
          <div className="award-tablet-home-heading">
            <div>
              <p>Personal archive</p>
              <h3>Awards & certificates.</h3>
            </div>
            <label className="trophy-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Search all awards and credentials</span>
              <input
                type="search"
                value={query}
                placeholder="Search this collection…"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setFilter("all");
                  appsRef.current?.scrollTo({ top: 0, behavior: "instant" });
                }}
              />
            </label>
          </div>
          <p className="trophy-results" role="status">
            {visible.length} {visible.length === 1 ? "app" : "apps"}
            {filter === "all"
              ? " · all awards & credentials"
              : ` · ${categories.find((category) => category.id === filter)?.label}`}
            {search ? ` matching “${query.trim()}”` : ""}
          </p>
          <div
            className="award-app-scroll"
            ref={appsRef}
            role="region"
            tabIndex={0}
            aria-label="Award apps. Scroll to see every record."
          >
            {visible.length ? (
              <ul
                className="award-app-grid"
                id={`${prefix}-cards`}
                aria-label="Awards and credentials"
              >
                {visible.map((record) => (
                  <AchievementApp
                    key={record.id}
                    record={record}
                    onOpen={open}
                  />
                ))}
              </ul>
            ) : (
              <div className="trophy-empty" id={`${prefix}-cards`}>
                <Search size={27} aria-hidden="true" />
                <h3>No matching achievements.</h3>
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
          </div>
          <nav className="award-tablet-dock" aria-label="Filter the award apps">
            {(
              [{ id: "all", label: "All", icon: Award }, ...categories] as const
            ).map((category) => {
              const Icon = category.icon;
              const count =
                category.id === "all"
                  ? matches.length
                  : matches.filter((record) => record.category === category.id)
                      .length;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={filter === category.id}
                  aria-controls={`${prefix}-cards`}
                  aria-label={`${category.label}, ${count} records`}
                  onClick={() => {
                    setFilter(category.id);
                    appsRef.current?.scrollTo({ top: 0, behavior: "instant" });
                  }}
                >
                  <span>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span>
                    {category.label === "Academic & creative"
                      ? "Academic"
                      : category.label}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="award-tablet-home-indicator" aria-hidden="true" />
        </div>
      </div>
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
                aria-label="Close achievement"
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
            {selected.verificationUrl ? (
              <a
                className="achievement-verification"
                href={selected.verificationUrl}
                target="_blank"
                rel="noreferrer"
              >
                {credentialProviders[selected.issuer] ? (
                  <span className="achievement-provider-mark">
                    <img
                      src={asset(credentialProviders[selected.issuer]!.src)}
                      alt=""
                      width={100}
                      height={38}
                      decoding="async"
                    />
                  </span>
                ) : null}
                Verify on {selected.issuer}
                <ArrowUpRight size={16} aria-hidden="true" />
                <span className="sr-only">, opens in a new tab</span>
              </a>
            ) : null}
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
