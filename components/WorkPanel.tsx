"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import {
  achievementGroups,
  certifications,
  earlierEducation,
  education,
  experience,
  leadership,
  volunteering,
} from "@/content/portfolio";
import { certificateFiles } from "@/content/media";
import { asset } from "@/content/paths";

type WorkRecord = (typeof experience)[number];
type CertificateRecord = {
  title: string;
  issuer: string;
  detail?: string;
  year?: string;
  certificateKey?: string;
  certificateKeys?: readonly string[];
};
type CertificateFile = { src: string; title: string };
type ArchiveRecord = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  summary?: string;
  bullets?: readonly string[];
  certificate?: CertificateRecord;
};
type TabId = "work" | "education" | "community";
type CommunitySection = "leadership" | "volunteering";

const files: Readonly<Record<string, CertificateFile>> = certificateFiles;
const educationRecords = [...education, ...earlierEducation];
const awardCount = achievementGroups.reduce(
  (count, group) => count + group.items.length,
  0,
);
const tabs: readonly { id: TabId; label: string; count: number }[] = [
  { id: "work", label: "Work", count: experience.length },
  { id: "education", label: "Education", count: educationRecords.length },
  {
    id: "community",
    label: "Community",
    count: leadership.length + volunteering.length,
  },
];
const spring = {
  type: "spring",
  stiffness: 340,
  damping: 34,
  mass: 0.85,
} as const;
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-4 dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-zinc-950";

const engineeringNotes: Readonly<Record<string, string>> = {
  "Caerus Global Management":
    "Research started with sequence-checked, recoverable market data.",
  "Stealth Startup":
    "Browser-driven QA connected user journeys with SQL checks.",
  "CTES Consulting":
    "Recruitment tooling spanned interfaces, APIs, and candidate-document processing.",
  Accenture:
    "Retrieval and agent-assisted testing supported enterprise application work.",
  "D+A Strategies":
    "Backtests included drawdowns, benchmarks, and ATR-based stops.",
  "Republic of Singapore Air Force":
    "Communications work included equipment readiness and joint SAF–RAAF operations.",
  "Singapore Army":
    "Leadership training was paired with tactical networking and signals work.",
};

const technologyMatchers: readonly { label: string; pattern: RegExp }[] = [
  { label: "Python", pattern: /\bpython\b/i },
  { label: "TypeScript", pattern: /\btypescript\b/i },
  { label: "React Native", pattern: /react native/i },
  { label: "React", pattern: /react\//i },
  { label: "Playwright", pattern: /playwright/i },
  { label: "SQL", pattern: /\bsql\b/i },
  { label: "PostgreSQL", pattern: /postgresql/i },
  { label: "Express", pattern: /express/i },
  { label: "AWS", pattern: /\baws\b/i },
  { label: "Cognito", pattern: /cognito/i },
  { label: "Grafana", pattern: /grafana/i },
  { label: "Azure DevOps", pattern: /azure devops/i },
  { label: "BM25", pattern: /bm25/i },
  { label: "Backtrader", pattern: /backtrader/i },
  { label: "pandas / NumPy", pattern: /pandas\/numpy/i },
  { label: "Market data", pattern: /market-data|l2 books/i },
  { label: "Backtesting", pattern: /backtest/i },
  { label: "Feed recovery", pattern: /feed recovery/i },
  { label: "Communications", pattern: /communications/i },
  { label: "Tactical networking", pattern: /tactical networking/i },
];
function technologiesFor(record: WorkRecord): string[] {
  const text = `${record.summary} ${record.highlights.join(" ")}`;
  return technologyMatchers
    .filter(({ pattern }) => pattern.test(text))
    .map(({ label }) => label)
    .slice(0, 6);
}
const workRecords = experience.map((record) => ({
  ...record,
  technologies: technologiesFor(record),
}));

function CertificateLinks({ record }: { record: CertificateRecord }) {
  const keys =
    record.certificateKeys ??
    (record.certificateKey ? [record.certificateKey] : []);
  const links = keys.flatMap((key) => (files[key] ? [files[key]] : []));
  if (!links.length) return null;
  return (
    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
      {links.map((file) => (
        <a
          key={file.src}
          href={asset(file.src)}
          target="_blank"
          rel="noreferrer"
          aria-label={`${file.title} — view certificate, opens in a new tab`}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-sm text-xs font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:decoration-current dark:text-emerald-300 ${focusRing}`}
        >
          {links.length > 1
            ? (file.title.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? "Certificate")
            : "View certificate"}
          <ArrowUpRight aria-hidden="true" size={13} />
        </a>
      ))}
    </div>
  );
}

function AnimatedBody({
  open,
  id,
  labelledBy,
  children,
}: {
  open: boolean;
  id: string;
  labelledBy: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      aria-hidden={open ? undefined : true}
      inert={!open}
    >
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : spring}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function WorkRow({
  record,
  index,
  open,
  onToggle,
  prefix,
}: {
  record: (typeof workRecords)[number];
  index: number;
  open: boolean;
  onToggle: () => void;
  prefix: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spotlightOpacity = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${x}px ${y}px, rgba(16,185,129,0.09), transparent 76%)`;
  const reduceMotion = useReducedMotion();
  const id = `${prefix}-role-${index}`;
  function moveSpotlight(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - bounds.left);
    y.set(event.clientY - bounds.top);
    spotlightOpacity.set(1);
  }
  return (
    <div
      className="relative isolate"
      onPointerMove={moveSpotlight}
      onPointerLeave={() => spotlightOpacity.set(0)}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-lg"
        style={{ background: spotlight, opacity: spotlightOpacity }}
      />
      <button
        type="button"
        id={`${id}-button`}
        aria-expanded={open}
        aria-controls={`${id}-body`}
        onClick={onToggle}
        className={`grid min-h-16 w-full grid-cols-[100px_1fr_auto_24px] items-center gap-x-2 rounded-sm border-b border-zinc-100 py-4 text-left sm:grid-cols-[130px_1fr_auto_32px] sm:gap-x-5 dark:border-zinc-900 ${focusRing}`}
      >
        <span className="self-start pt-0.5 font-mono text-[10px] leading-5 text-zinc-500 sm:self-center sm:text-xs dark:text-zinc-400">
          {record.dates}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium leading-6 tracking-tight text-zinc-950 sm:text-base dark:text-zinc-50">
            {record.company}
          </span>
          <span className="mt-1 block text-[11px] leading-5 text-zinc-500 sm:hidden dark:text-zinc-400">
            {record.role}
          </span>
        </span>
        <span className="hidden max-w-60 text-right text-xs leading-5 text-zinc-500 sm:block dark:text-zinc-400">
          {record.role}
        </span>
        <motion.span
          aria-hidden="true"
          className="col-start-4 flex justify-end text-emerald-700 dark:text-emerald-400"
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduceMotion ? { duration: 0 } : spring}
        >
          <ChevronDown size={17} />
        </motion.span>
      </button>
      <AnimatedBody open={open} id={`${id}-body`} labelledBy={`${id}-button`}>
        <div className="pb-7 pl-0 pt-5 sm:pl-[150px]">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
            {record.location}
          </p>
          <p className="max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            {record.summary}
          </p>
          <ul className="mt-4 max-w-2xl space-y-2.5 pl-4 text-sm leading-7 text-zinc-600 marker:text-emerald-600 dark:text-zinc-300">
            {record.highlights.map((highlight) => (
              <li key={highlight} className="list-disc pl-1">
                {highlight}
              </li>
            ))}
          </ul>
          <div
            className="mt-5 flex flex-wrap gap-2"
            aria-label="Tools and technical practices"
          >
            {record.technologies.map((technology) => (
              <span
                key={technology}
                className="rounded-md bg-emerald-50 px-2 py-1 font-mono text-[10px] text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                {technology}
              </span>
            ))}
          </div>
          {engineeringNotes[record.company] ? (
            <aside className="mt-6 max-w-2xl border-l-2 border-amber-300 pl-4 dark:border-amber-700">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                Engineering note
              </p>
              <p className="mt-1.5 text-xs italic leading-6 text-zinc-600 dark:text-zinc-400">
                {engineeringNotes[record.company]}
              </p>
            </aside>
          ) : null}
        </div>
      </AnimatedBody>
    </div>
  );
}

function RecordRow({
  record,
  open,
  onToggle,
  prefix,
}: {
  record: ArchiveRecord;
  open: boolean;
  onToggle: () => void;
  prefix: string;
}) {
  const id = `${prefix}-${record.id}`;
  const reduceMotion = useReducedMotion();
  return (
    <div>
      <button
        type="button"
        id={`${id}-button`}
        aria-expanded={open}
        aria-controls={`${id}-body`}
        onClick={onToggle}
        className={`grid min-h-16 w-full grid-cols-[86px_1fr_24px] items-center gap-x-3 rounded-sm border-b border-zinc-100 py-4 text-left sm:grid-cols-[130px_1fr_32px] sm:gap-x-5 dark:border-zinc-900 ${focusRing}`}
      >
        <span className="self-start pt-0.5 font-mono text-[10px] leading-5 text-zinc-500 sm:self-center sm:text-xs dark:text-zinc-400">
          {record.date || "—"}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium leading-6 tracking-tight text-zinc-950 sm:text-base dark:text-zinc-50">
            {record.title}
          </span>
          <span className="mt-1 block text-[11px] leading-5 text-zinc-500 sm:text-xs dark:text-zinc-400">
            {record.subtitle}
          </span>
        </span>
        <motion.span
          aria-hidden="true"
          className="flex justify-end text-emerald-700 dark:text-emerald-400"
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduceMotion ? { duration: 0 } : spring}
        >
          <ChevronDown size={17} />
        </motion.span>
      </button>
      <AnimatedBody open={open} id={`${id}-body`} labelledBy={`${id}-button`}>
        <div className="pb-6 pl-0 pt-4 sm:pl-[150px]">
          {record.summary ? (
            <p className="max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              {record.summary}
            </p>
          ) : null}
          {record.bullets?.length ? (
            <ul className="max-w-2xl space-y-2.5 pl-4 text-sm leading-7 text-zinc-600 marker:text-emerald-600 dark:text-zinc-300">
              {record.bullets.map((bullet) => (
                <li key={bullet} className="list-disc pl-1">
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
          {record.certificate ? (
            <CertificateLinks record={record.certificate} />
          ) : null}
        </div>
      </AnimatedBody>
    </div>
  );
}

function RecordList({
  records,
  prefix,
  firstOpen = false,
}: {
  records: readonly ArchiveRecord[];
  prefix: string;
  firstOpen?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(
    firstOpen ? (records[0]?.id ?? null) : null,
  );
  return (
    <div>
      {records.map((record) => (
        <RecordRow
          key={record.id}
          record={record}
          prefix={prefix}
          open={openId === record.id}
          onToggle={() =>
            setOpenId((current) => (current === record.id ? null : record.id))
          }
        />
      ))}
    </div>
  );
}

const schoolRecords: readonly ArchiveRecord[] = educationRecords.map(
  (record, index) => ({
    id: String(index),
    title: record.school,
    subtitle: record.credential,
    date: record.dates,
    bullets: record.bullets,
  }),
);
const leadershipRecords: readonly ArchiveRecord[] = leadership.map(
  (record, index) => ({
    id: String(index),
    title: record.title,
    subtitle: record.role,
    date: record.dates,
    summary: record.description,
    bullets: "highlights" in record ? record.highlights : undefined,
  }),
);
const volunteeringRecords: readonly ArchiveRecord[] = volunteering.map(
  (record, index) => ({
    id: String(index),
    title: record.title,
    subtitle: record.role,
    date: record.dates,
    summary: record.description,
    bullets: "highlights" in record ? record.highlights : undefined,
  }),
);
const awardSections = [
  ...achievementGroups.map((group, index) => ({
    id: `awards-${index}`,
    title: group.title,
    records: group.items as readonly CertificateRecord[],
  })),
  {
    id: "credentials",
    title: "Credentials",
    records: certifications as readonly CertificateRecord[],
  },
];
const awardFilterLabels = [
  "Competitions",
  "Government",
  "Academic & sport",
  "Service",
  "Credentials",
];

function CommunityArchive({
  prefix,
  section,
  onSectionChange,
}: {
  prefix: string;
  section: CommunitySection;
  onSectionChange: (section: CommunitySection) => void;
}) {
  return (
    <div>
      <div
        role="group"
        aria-label="Community records"
        className="mb-3 flex flex-wrap gap-2"
      >
        {(["leadership", "volunteering"] as const).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={section === id}
            onClick={() => onSectionChange(id)}
            className={`min-h-11 rounded-full border px-3.5 py-2 text-xs transition-colors motion-reduce:transition-none ${section === id ? "border-emerald-700 bg-emerald-700 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-zinc-950" : "border-zinc-200 text-zinc-600 hover:border-emerald-500 dark:border-zinc-800 dark:text-zinc-300"} ${focusRing}`}
          >
            {id === "leadership"
              ? `Leadership & CCAs · ${leadership.length}`
              : `Volunteering · ${volunteering.length}`}
          </button>
        ))}
      </div>
      <div hidden={section !== "leadership"}>
        <RecordList
          records={leadershipRecords}
          prefix={`${prefix}-leadership`}
        />
      </div>
      <div hidden={section !== "volunteering"}>
        <RecordList
          records={volunteeringRecords}
          prefix={`${prefix}-volunteering`}
        />
      </div>
    </div>
  );
}

function AwardsArchive({ prefix }: { prefix: string }) {
  const [filter, setFilter] = useState(awardSections[0].id);
  const selectedSections =
    filter === "all"
      ? awardSections
      : awardSections.filter((section) => section.id === filter);
  const records: ArchiveRecord[] = selectedSections.flatMap((section) =>
    section.records.map((record, index) => ({
      id: `${section.id}-${index}`,
      title: record.title,
      subtitle: record.issuer,
      date: record.year ?? "",
      summary: record.detail,
      certificate: record,
    })),
  );
  return (
    <div>
      <p className="mb-4 text-xs leading-6 text-zinc-500 dark:text-zinc-400">
        {awardCount} award records · {certifications.length} credentials and
        course certificates.
      </p>
      <div
        role="group"
        aria-label="Filter awards and credentials"
        className="mb-3 flex flex-wrap gap-2"
      >
        <button
          type="button"
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
          className={`min-h-11 rounded-full border px-3 py-2 text-xs ${filter === "all" ? "border-emerald-700 bg-emerald-700 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-zinc-950" : "border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300"} ${focusRing}`}
        >
          All
        </button>
        {awardSections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            aria-pressed={filter === section.id}
            onClick={() => setFilter(section.id)}
            className={`min-h-11 rounded-full border px-3 py-2 text-xs ${filter === section.id ? "border-emerald-700 bg-emerald-700 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-zinc-950" : "border-zinc-200 text-zinc-600 hover:border-emerald-500 dark:border-zinc-800 dark:text-zinc-300"} ${focusRing}`}
          >
            {awardFilterLabels[index]}{" "}
            <span className="ml-1 opacity-70">{section.records.length}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        Showing {records.length}{" "}
        {filter === "credentials" ? "credential" : "award and credential"}{" "}
        records.
      </p>
      <RecordList key={filter} records={records} prefix={`${prefix}-awards`} />
    </div>
  );
}

export default function WorkPanel({
  awardsOnly = false,
}: {
  awardsOnly?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("work");
  const [communitySection, setCommunitySection] =
    useState<CommunitySection>("leadership");
  const [openWork, setOpenWork] = useState<number | null>(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prefix = useId();
  useEffect(() => {
    if (awardsOnly) return;
    function syncHash() {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#education") setActiveTab("education");
      else if (
        hash === "#community" ||
        hash === "#leadership" ||
        hash === "#volunteering"
      ) {
        setActiveTab("community");
        setCommunitySection(
          hash === "#volunteering" ? "volunteering" : "leadership",
        );
      }
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [awardsOnly]);
  function handleTabKeys(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
            tabs.length;
    setActiveTab(tabs[next].id);
    tabRefs.current[next]?.focus({ preventScroll: true });
  }
  if (awardsOnly) return <AwardsArchive prefix={prefix} />;
  return (
    <div className="min-w-0">
      <div
        role="tablist"
        aria-label="Career archive"
        className="mb-6 grid grid-cols-2 gap-2 sm:inline-flex sm:flex-wrap sm:gap-1.5"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            id={`${prefix}-${tab.id}-tab`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${prefix}-${tab.id}-panel`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => handleTabKeys(event, index)}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors motion-reduce:transition-none sm:px-4 ${activeTab === tab.id ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"} ${focusRing}`}
          >
            {tab.label}
            <span className="font-mono text-[9px] opacity-60">{tab.count}</span>
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${prefix}-${tab.id}-panel`}
          role="tabpanel"
          aria-labelledby={`${prefix}-${tab.id}-tab`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
          className={`min-w-0 rounded-sm ${focusRing}`}
        >
          {tab.id === "work" ? (
            <div>
              {workRecords.map((record, index) => (
                <WorkRow
                  key={`${record.company}-${record.dates}`}
                  record={record}
                  index={index}
                  prefix={prefix}
                  open={openWork === index}
                  onToggle={() =>
                    setOpenWork((current) => (current === index ? null : index))
                  }
                />
              ))}
            </div>
          ) : null}
          {tab.id === "education" ? (
            <RecordList
              records={schoolRecords}
              prefix={`${prefix}-education`}
              firstOpen
            />
          ) : null}
          {tab.id === "community" ? (
            <CommunityArchive
              prefix={prefix}
              section={communitySection}
              onSectionChange={setCommunitySection}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
