"use client";

import {
  ArrowUpRight,
  Award,
  BatteryFull,
  BookOpen,
  BrainCircuit,
  ChartColumnIncreasing,
  Cloud,
  CodeXml,
  Container,
  Crosshair,
  Database,
  Dumbbell,
  Flag,
  Footprints,
  GitBranch,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Medal,
  MessageSquare,
  Network,
  Piano,
  Presentation,
  Search,
  ShieldCheck,
  Sigma,
  Sun,
  TrendingUp,
  Trophy,
  Waves,
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
import { certificateFiles, projectMedia, teamMoments } from "@/content/media";
import { awardAppIcons, awardIconPreviews } from "@/content/award-icon-previews";
import { awardAppLabel } from "@/content/award-app-labels";
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
  alt?: string;
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
// Photos are tied to the named event; the original award documents stay in the
// detail view. A project photo is labelled as context, never as an award ceremony.
const achievementPhotos: Readonly<Record<string, CertificateFile | undefined>> = {
  "BrainHack TIL-AI 2026": {
    src: teamMoments[0].src,
    title: teamMoments[0].title,
    kind: "Winning team photo",
    caption: teamMoments[0].caption,
  },
  "Hack the Future AI Hackathon 2026": {
    src: teamMoments[2].src,
    title: teamMoments[2].title,
    kind: "Event photo",
    caption: teamMoments[2].caption,
  },
  "BügleRock Rockathon 2026": {
    src: projectMedia.DealMachine.src,
    title: "The Deal Machine, built at Rockathon",
    kind: "Project screenshot",
    representative: true,
    caption: "The team's Rockathon prototype. The certificate below records the finalist result.",
  },
  "SignMeUp · The Merge Hackathon 2026": {
    src: projectMedia.SignMeUp.src,
    title: "SignMeUp, built at The Merge",
    kind: "Project screenshot",
    representative: true,
    caption: "The team's assistive-interpreter demo. The certificate below records the recognition.",
  },
  "SunnyHacks 2026": {
    src: "images/logos/sunnyhacks-original.webp",
    title: "SunnyHacks organizer emblem",
    kind: "Representative emblem",
    representative: true,
    caption: "Official organizer emblem from the February 2026 event page.",
    source: { label: "SunnyHacks — February 2026", url: "https://sunnyhacks-feb-2026.devpost.com/" },
  },
  "Certificate of Appreciation · Project BHID": {
    src: "images/life-passport-oct24/bhid-team-afternoon.webp",
    title: "An afternoon with the Project BHID team",
    kind: "Project team photo",
    representative: true,
    caption: "A photo from Project BHID. The certificate below records the recognition.",
  },
  "National Service · Outstanding Performance & Conduct": {
    src: "images/life-originals-oct24/army-graduation-group.webp",
    title: "From my National Service years",
    kind: "Service photo",
    representative: true,
    caption: "A group photo from National Service. The transcript excerpt below records the assessment.",
  },
  "SSSC Colours Award · Softball": {
    ...certificateFiles.ejcSoftballTeam,
    representative: true,
    caption: "The softball team; the individual Colours Award is recorded in the certificate below.",
  },
};
const projectRecords = new Map(
  trophies.map((record) => [record.title, record]),
);
const recordsFor = (title: string): readonly AwardRecord[] =>
  achievementGroups.find((group) => group.title === title)?.items ?? [];
// Keep the historical milestones in the source records, while the app
// collection follows Ian's selection of awards to feature here.
const hiddenSchoolApps = new Set(["Piano Grade 3 · Merit", "SwimSafer Gold"]);
const hiddenCredentialProviders = new Set(["Anthropic", "Databricks Academy", "Cisco"]);
const schoolRecords = recordsFor("Academic & sporting awards").filter(
  (record) => !hiddenSchoolApps.has(record.title),
);
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
    records: certifications.filter((record) => !hiddenCredentialProviders.has(record.issuer)),
  },
];
const slug = (text: string) =>
  text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const issuerLogoRules: readonly (readonly [RegExp, string])[] = [
  [/Ministry of Education/i, "moe"],
  [/CCC.CDC/i, "cdc"],
  [/NUS High School/i, "nus-high"],
  [/Eunoia Junior College/i, "ejc"],
  [/School of Science and Technology|SST Changemakers/i, "sst"],
  [/Bukit Timah Primary School/i, "btps"],
  [/Singapore Armed Forces|160 SQN/i, "rsaf"],
];
function representativePreview(record: AwardRecord): CertificateFile {
  const issuer = record.issuer;
  const provider = credentialProviders[issuer];
  const issuerLogo = /swimsafer/i.test(record.title)
    ? "swimsafer"
    : isSoftballAward(record)
      ? "ejc-softball"
      : issuerLogoRules.find(([pattern]) => pattern.test(issuer))?.[1];
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
        ? "Representative issuer emblem. Available award records are shown separately."
        : "Illustrative emblem; a personal award photo or certificate scan is not available.",
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
const hashFilters: Readonly<Record<string, CollectionFilter>> = {
  "#competitions": "competitions",
  "#government": "government",
  "#academic": "academic",
  "#sport": "sport",
  "#service": "service",
  "#certificates": "certificates",
};

// Subject marks are a fallback when no personal award photo or evidence is available.
const achievementIconRules: readonly (readonly [RegExp, LucideIcon])[] = [
  [/marksmanship/i, Crosshair],
  [/IPPT/i, Dumbbell],
  [/swim/i, Waves],
  [/piano/i, Piano],
  [/athletics|sports day/i, Footprints],
  [/softball|colours award/i, Medal],
  [/mathematical|maths/i, Sigma],
  [/business pitch|rockathon/i, Presentation],
  [/sunnyhacks/i, Sun],
  [/brainhack|AI fluency|machine learning/i, BrainCircuit],
  [/claude/i, MessageSquare],
  [/hack the future|performance.*conduct/i, ShieldCheck],
  [/national education/i, Flag],
  [/good progress/i, TrendingUp],
  [/signmeup|active elderly|project BHID/i, HeartHandshake],
  [/scholarship|dean|GCE|academic achievement/i, GraduationCap],
  [/AI\/BI/i, ChartColumnIncreasing],
  [/docker/i, Container],
  [/AWS|cloud/i, Cloud],
  [/GitHub/i, GitBranch],
  [/SQL/i, Database],
  [/Java/i, CodeXml],
  [/Cisco|network/i, Network],
];
function iconForAchievement(record: Achievement): LucideIcon {
  return (
    achievementIconRules.find(([pattern]) => pattern.test(record.title))?.[1] ??
    categories.find((category) => category.id === record.category)?.icon ??
    Award
  );
}

function previewForAchievement(record: Achievement): CertificateFile {
  return (
    achievementPhotos[record.title] ??
    record.certificates.find(
      (file) => !file.representative && /photo/i.test(file.kind ?? ""),
    ) ??
    record.certificates.find((file) => /patch/i.test(file.kind ?? "")) ??
    (["government", "academic", "sport", "certificates"].includes(record.category)
      ? representativePreview(record)
      : undefined) ??
    record.certificates.find((file) => !file.representative) ??
    record.preview
  );
}

type MediaLayout = "document" | "photo" | "project" | "emblem";
function mediaLayout(file: CertificateFile): MediaLayout {
  if (/emblem|patch/i.test(file.kind ?? "")) return "emblem";
  if (/screenshot|dashboard|demo|diagram/i.test(file.kind ?? "")) return "project";
  if (/photo/i.test(file.kind ?? "")) return "photo";
  return "document";
}

function AchievementMedia({
  file,
  layout = mediaLayout(file),
  additionalCaption,
}: {
  file: CertificateFile;
  layout?: MediaLayout;
  additionalCaption?: string;
}) {
  const description = file.caption?.replace(
    /(the) (certificate|transcript excerpt) below/gi,
    (_, article: string, record: string) => `${article} ${record} in the award record`,
  );
  return (
    <figure className="achievement-media" data-layout={layout}>
      <a
        className="achievement-media-frame"
        href={asset(file.src)}
        target="_blank"
        rel="noreferrer"
        aria-label={`${file.title} — open full image in a new tab`}
      >
        <img src={asset(file.src)} alt={file.alt ?? file.title} loading="lazy" decoding="async" />
      </a>
      <figcaption>
        <span className="achievement-media-kind">{previewKind(file)}</span>
        <strong>{file.title}</strong>
        {description ? <p>{description}</p> : null}
        {additionalCaption && additionalCaption !== file.caption ? <p>{additionalCaption}</p> : null}
        <div className="achievement-media-actions">
          <a href={asset(file.src)} target="_blank" rel="noreferrer">
            View full size <ArrowUpRight size={14} aria-hidden="true" />
            <span className="sr-only">, opens in a new tab</span>
          </a>
          {file.originalSrc ? (
            <a href={asset(file.originalSrc)} target="_blank" rel="noreferrer">
              Original photo <ArrowUpRight size={14} aria-hidden="true" />
              <span className="sr-only">, opens in a new tab</span>
            </a>
          ) : null}
          {file.source ? (
            <a href={file.source.url} target="_blank" rel="noreferrer">
              {file.source.label} <ArrowUpRight size={14} aria-hidden="true" />
              <span className="sr-only">, opens in a new tab</span>
            </a>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}

function AchievementSections({ record }: { record: Achievement }) {
  const projectTitle = relatedProjectTitles[record.title];
  const projectPreview = projectPreviews[projectTitle];
  const contextPhoto = achievementPhotos[record.title];
  // Keep one rendering of each asset: Rockathon and The Merge use their
  // project screenshot as contextual artwork as well as project evidence.
  const media = [...new Map([
    ...(contextPhoto ? [contextPhoto] : []),
    ...(record.certificates.length ? record.certificates : [record.preview]),
  ].map((file) => [file.src, file])).values()]
    .filter((file) => file.src !== projectPreview?.src);
  const documents = media.filter((file) => mediaLayout(file) === "document");
  const photos = media.filter((file) => ["photo", "project"].includes(mediaLayout(file)));
  const emblems = media.filter((file) => mediaLayout(file) === "emblem");
  const projectNotes = record.project?.strategy ?? [];
  const recognitionNotes = !record.project?.built ? record.project?.notes ?? [] : [];

  return (
    <div className="achievement-detail-body">
      <section className="achievement-overview" aria-label="Achievement summary">
        <dl className="achievement-facts">
          {record.detail ? (
            <div className="achievement-fact-wide achievement-result">
              <dt>{record.category === "certificates" ? "Credential status" : "Recognition"}</dt>
              <dd>{record.detail}</dd>
            </div>
          ) : null}
          <div><dt>Issued by</dt><dd>{record.issuer}</dd></div>
          {record.year ? <div><dt>Date</dt><dd>{record.year}</dd></div> : null}
        </dl>
        {recognitionNotes.length ? (
          <div className="achievement-context">
            {recognitionNotes.map((point) => <p key={point}>{point}</p>)}
          </div>
        ) : null}
        {record.verificationUrl ? (
          <a className="achievement-verification" href={record.verificationUrl} target="_blank" rel="noreferrer">
            <ShieldCheck size={17} aria-hidden="true" />
            Verify completion on {record.issuer}
            <ArrowUpRight size={15} aria-hidden="true" />
            <span className="sr-only">, opens in a new tab</span>
          </a>
        ) : null}
      </section>

      {record.project?.built || projectPreview ? (
        <section className="achievement-section achievement-project-notes" aria-label="Project behind the award">
          <div className="achievement-section-heading">
            <p className="trophy-eyebrow">Project behind the award</p>
            <h3>{record.project?.built ?? projectTitle}</h3>
          </div>
          {projectNotes.length ? (
            <ul className="achievement-project-points">
              {projectNotes.map((point) => <li key={point}>{point}</li>)}
            </ul>
          ) : null}
          {record.project?.stack.length ? (
            <ul className="achievement-stack" aria-label="Project tools">
              {record.project.stack.map((tool) => <li key={tool}>{tool}</li>)}
            </ul>
          ) : null}
          {record.project?.source ? (
            <a className="achievement-source" href={record.project.source.url} target="_blank" rel="noreferrer">
              {record.project.source.label ?? "Project repository"}
              <ArrowUpRight size={15} aria-hidden="true" />
              <span className="sr-only">, opens in a new tab</span>
            </a>
          ) : null}
          {projectPreview ? (
            <AchievementMedia
              file={contextPhoto?.src === projectPreview.src ? contextPhoto : {
                src: projectPreview.src,
                title: projectTitle,
                alt: projectPreview.alt,
                kind: projectPreview.kind,
                caption: projectPreview.caption,
              }}
              layout="project"
              additionalCaption={contextPhoto?.src === projectPreview.src ? projectPreview.caption : undefined}
            />
          ) : null}
        </section>
      ) : null}

      {documents.length ? (
        <section className="achievement-section achievement-certificates" aria-label="Certificates and official records">
          <div className="achievement-section-heading">
            <h3>{record.category === "certificates" ? "Completion record" : "Award record"}</h3>
            <p>{documents.length > 1 ? "Certificates and records, organised in one place." : "Certificate or official record of the recognition."} Select an image to read it at full size.</p>
          </div>
          <div className="achievement-media-grid" data-count={documents.length}>
            {documents.map((file) => <AchievementMedia key={file.src} file={file} />)}
          </div>
        </section>
      ) : null}

      {photos.length ? (
        <section className="achievement-section" aria-label="Photos and moments">
          <div className="achievement-section-heading">
            <h3>Photos & moments</h3>
            <p>From the event, team, or award collection.</p>
          </div>
          <div className="achievement-media-grid" data-count={photos.length}>
            {photos.map((file) => <AchievementMedia key={file.src} file={file} />)}
          </div>
        </section>
      ) : null}

      {emblems.length ? (
        <section className="achievement-section" aria-label="Representative artwork and image credits">
          <div className="achievement-section-heading"><h3>About the image</h3></div>
          <div className="achievement-emblems">
            {emblems.map((file) => <AchievementMedia key={file.src} file={file} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function AchievementApp({
  record,
  onOpen,
}: {
  record: Achievement;
  onOpen: (record: Achievement, opener: HTMLButtonElement) => void;
}) {
  const Icon = iconForAchievement(record);
  const CategoryIcon = categories.find((category) => category.id === record.category)?.icon ?? Award;
  const preview = previewForAchievement(record);
  const appIcon = awardAppIcons[record.title];
  const label = awardAppLabel(record);
  const appTitle = `${label.organisation} — ${label.recognition}`;
  const photographic = /photo|patch|screenshot/i.test(preview.kind ?? "");
  const emblem = appIcon?.artwork === "emblem" || (!appIcon && /emblem/i.test(preview.kind ?? ""));
  const imageSource = appIcon?.src ?? awardIconPreviews[preview.src] ?? preview.src;
  return (
    <li className="award-app" data-category={record.category}>
      <button
        type="button"
        className="award-app-button"
        aria-label={`View achievement: ${appTitle}${record.year ? `, ${record.year}` : ""}`}
        title={appTitle}
        aria-haspopup="dialog"
        onClick={(event) => onOpen(record, event.currentTarget)}
      >
        <span
          className="award-app-icon"
          data-provider={emblem ? record.issuer : undefined}
          data-evidence={!appIcon && !emblem ? "true" : undefined}
          data-brand={appIcon ? "true" : undefined}
          data-artwork={appIcon?.artwork ?? (photographic ? "photo" : emblem ? "emblem" : "document")}
          aria-hidden="true"
        >
          {imageSource ? (
            <span className="award-app-preview">
              <img
                src={asset(imageSource)}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </span>
          ) : (
            <Icon className="award-app-glyph" size={38} strokeWidth={1.65} />
          )}
          <span className="award-app-topic-mark">
            <CategoryIcon size={16} strokeWidth={1.8} />
          </span>
        </span>
        <span className="award-app-label">
          <span className="award-app-organisation">{label.organisation}</span>
          <span className="award-app-recognition">{label.recognition}</span>
        </span>
        <span className="award-app-date">
          {record.year}
        </span>
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
        `${record.title} ${record.issuer} ${record.detail ?? ""} ${record.year ?? ""} ${record.categoryLabel} ${awardAppLabel(record).organisation} ${awardAppLabel(record).recognition}`
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
      <h2 id={`${prefix}-title`} className="sr-only">
        Awards and certificates
      </h2>
      <div className="award-tablet">
        <span className="award-tablet-camera" aria-hidden="true" />
        <div className="award-tablet-screen">
          <div className="award-tablet-status" aria-hidden="true">
            <span>Ian’s collection</span>
            <span>
              <Wifi size={13} />
              <BatteryFull size={17} />
            </span>
          </div>
          <div className="award-tablet-home-heading">
            <div>
              <h3>
                {filter === "all"
                  ? "All achievements"
                  : categories.find((category) => category.id === filter)
                      ?.label}
              </h3>
            </div>
            <label className="trophy-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Search all awards and credentials</span>
              <input
                type="search"
                value={query}
                placeholder="Search awards & certificates…"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setFilter("all");
                  appsRef.current?.scrollTo({ top: 0, behavior: "instant" });
                }}
              />
            </label>
          </div>
          <p className="trophy-results" role="status">
            {visible.length}{" "}
            {search
              ? visible.length === 1
                ? "match"
                : "matches"
              : visible.length === 1
                ? "achievement"
                : "achievements"}
            {search ? ` for “${query.trim()}”` : ""}
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
            <AchievementSections record={selected} />
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
