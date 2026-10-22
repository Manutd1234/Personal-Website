"use client";
import { useMotionPreference } from "./useMotionPreference";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, ChevronDown, Trophy } from "lucide-react";
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
type TabId = "work" | "education" | "community" | "volunteering";

const files: Readonly<Record<string, CertificateFile>> = certificateFiles;
const educationRecords = [...education, ...earlierEducation];
const tabs: readonly { id: TabId; label: string; count: number }[] = [
  { id: "work", label: "Experience", count: experience.length },
  { id: "education", label: "Education", count: educationRecords.length },
  { id: "community", label: "Leadership & CCAs", count: leadership.length },
  { id: "volunteering", label: "Volunteering", count: volunteering.length },
];

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
    <div className="career-certificate-links">
      {links.map((file) => (
        <a
          key={file.src}
          href={asset(file.src)}
          target="_blank"
          rel="noreferrer"
          aria-label={`${file.title} — view certificate, opens in a new tab`}
        >
          {links.length > 1
            ? (file.title.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? "Certificate")
            : "View certificate"}
          <ArrowUpRight aria-hidden="true" size={15} />
        </a>
      ))}
    </div>
  );
}

function Contributions({
  bullets,
  title,
}: {
  bullets?: readonly string[];
  title: string;
}) {
  if (!bullets?.length) return null;
  return (
    <details className="career-contributions">
      <summary aria-label={`Contributions at ${title}`}>
        Contributions <span>{bullets.length}</span>
        <ChevronDown aria-hidden="true" size={15} />
      </summary>
      <ul className="career-bullets">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </details>
  );
}

function ExperienceBrowser({ prefix }: { prefix: string }) {
  const [selected, setSelected] = useState(0);
  const roleRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const storyId = `${prefix}-role-story`;
  function roleKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? workRecords.length - 1
          : ["ArrowDown", "ArrowRight"].includes(event.key)
            ? (index + 1) % workRecords.length
            : ["ArrowUp", "ArrowLeft"].includes(event.key)
              ? (index + workRecords.length - 1) % workRecords.length
              : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    roleRefs.current[next]?.focus({ preventScroll: true });
  }
  return (
    <div className="career-role-browser">
      <div className="career-role-rail">
        <div className="career-role-rail-heading">
          <span>Different teams, different lessons.</span>
          <p>Explore a role</p>
        </div>
        <div
          className="career-role-list"
          role="tablist"
          aria-label="Work experience roles"
          aria-orientation="vertical"
        >
          {workRecords.map((record, index) => (
            <button
              type="button"
              role="tab"
              key={`${record.company}-${record.dates}`}
              id={`${prefix}-role-${index}-tab`}
              aria-controls={`${storyId}-${index}`}
              aria-selected={selected === index}
              tabIndex={selected === index ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => roleKeys(event, index)}
              ref={(element) => {
                roleRefs.current[index] = element;
              }}
            >
              <span className="career-role-company">{record.company}</span>
              <span className="career-role-title">{record.role}</span>
              <time>{record.dates}</time>
              <span className="career-role-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          ))}
        </div>
        <div className="career-role-picker">
          <label htmlFor={`${prefix}-role-select`}>Choose a role</label>
          <select
            id={`${prefix}-role-select`}
            aria-controls={`${storyId}-${selected}`}
            value={selected}
            onChange={(event) => setSelected(Number(event.target.value))}
          >
            {workRecords.map((record, index) => (
              <option key={record.company} value={index}>
                {record.company} · {record.dates}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="career-role-stage">
        {workRecords.map((record, index) => (
          <div
            role="tabpanel"
            tabIndex={0}
            hidden={selected !== index}
            id={`${storyId}-${index}`}
            aria-labelledby={`${prefix}-role-${index}-tab`}
            className="career-role-story"
            key={record.company}
          >
            <article className="career-role-story-copy">
              <div className="career-story-meta">
                <span>{record.location}</span>
                <time>{record.dates}</time>
              </div>
              <p className="career-story-role">{record.role}</p>
              <h3>{record.company}</h3>
              <p className="career-story-summary">{record.summary}</p>
              <section
                className="career-story-contributions"
                aria-labelledby={`${prefix}-role-${index}-contributions`}
              >
                <h4 id={`${prefix}-role-${index}-contributions`}>
                  What I worked on
                </h4>
                <ul className="career-bullets">
                  {record.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </section>
              {record.technologies.length ? (
                <ul
                  className="career-technology-tags"
                  aria-label={`${record.company} tools and practices`}
                >
                  {record.technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
              ) : null}
              {engineeringNotes[record.company] ? (
                <aside className="career-engineering-note">
                  <span>Engineering note</span>
                  <p>{engineeringNotes[record.company]}</p>
                </aside>
              ) : null}
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationCards() {
  return (
    <div className="career-education-grid">
      {educationRecords.map((record) => (
        <article className="career-record-card" key={record.school}>
          <h3>{record.school}</h3>
          <p className="career-record-role">{record.credential}</p>
          <time>{record.dates}</time>
          <ul className="career-bullets">
            {record.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

const leadershipRecords: readonly ArchiveRecord[] = leadership.map(
  (record, index) => ({
    id: `leadership-${index}`,
    title: record.title,
    subtitle: record.role,
    date: record.dates,
    summary: record.description,
    bullets: "highlights" in record ? record.highlights : undefined,
  }),
);
const volunteeringRecords: readonly ArchiveRecord[] = volunteering.map(
  (record, index) => ({
    id: `volunteering-${index}`,
    title: record.title,
    subtitle: record.role,
    date: record.dates,
    summary: record.description,
    bullets: "highlights" in record ? record.highlights : undefined,
  }),
);

function CommunityCards({ records }: { records: readonly ArchiveRecord[] }) {
  return (
    <div className="career-community-grid">
      {records.map((record) => (
        <article className="career-record-card" key={record.id}>
          <h3>{record.title}</h3>
          <p className="career-record-role">{record.subtitle}</p>
          <time>{record.date}</time>
          <p className="career-record-summary">{record.summary}</p>
          <Contributions bullets={record.bullets} title={record.title} />
        </article>
      ))}
    </div>
  );
}

const technicalAwards = achievementGroups.find(
  (group) => group.title === "Technical competitions",
)!;
const governmentAwards = achievementGroups.find(
  (group) => group.title === "Government awards & scholarships",
)!;
const schoolAwards = achievementGroups.find(
  (group) => group.title === "Academic & sporting awards",
)!;
const serviceAwards = achievementGroups.find(
  (group) => group.title === "Service & leadership",
)!;
const isSport = (record: CertificateRecord) =>
  /Softball|Colours Award|Sports Day|School athletics|SwimSafer/i.test(
    record.title,
  );
const awardSections = [
  {
    id: "competitions",
    label: "Competitions",
    title: technicalAwards.title,
    description: technicalAwards.description,
    records: technicalAwards.items as readonly CertificateRecord[],
  },
  {
    id: "academic",
    label: "Academic",
    title: "Academic & creative awards",
    description: schoolAwards.description,
    records: schoolAwards.items.filter(
      (record) => !isSport(record),
    ) as readonly CertificateRecord[],
  },
  {
    id: "government",
    label: "Government",
    title: governmentAwards.title,
    description: governmentAwards.description,
    records: governmentAwards.items as readonly CertificateRecord[],
  },
  {
    id: "sport",
    label: "Sport",
    title: "Sporting awards",
    description: "Team results, athletics, and swimming milestones.",
    records: schoolAwards.items.filter(isSport) as readonly CertificateRecord[],
  },
  {
    id: "service",
    label: "Service",
    title: serviceAwards.title,
    description: serviceAwards.description,
    records: serviceAwards.items as readonly CertificateRecord[],
  },
  {
    id: "certificates",
    label: "Certificates",
    title: "Credentials & certificates",
    description:
      "Courses and credentials, with their original issuers and dates.",
    records: certifications as readonly CertificateRecord[],
  },
];

function AwardRecord({ record }: { record: CertificateRecord }) {
  return (
    <article className="career-award-record">
      <div className="career-award-heading">
        <h4>{record.title}</h4>
        {record.year ? <time>{record.year}</time> : null}
      </div>
      <p className="career-award-issuer">{record.issuer}</p>
      {record.detail ? (
        <p className="career-award-detail">{record.detail}</p>
      ) : null}
      <CertificateLinks record={record} />
    </article>
  );
}

function AwardsArchive() {
  const [filter, setFilter] = useState("competitions");
  const technical = awardSections[0];
  return (
    <div className="career-awards">
      <div
        role="group"
        aria-label="Filter awards and credentials"
        className="career-award-filters"
      >
        {awardSections.map((section) => (
          <button
            type="button"
            key={section.id}
            aria-pressed={filter === section.id}
            onClick={() => setFilter(section.id)}
          >
            {section.label} <span>{section.records.length}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        Showing{" "}
        {awardSections.find((section) => section.id === filter)?.records
          .length ?? 0}{" "}
        records.
      </p>
      <section
        className="career-competition-section"
        hidden={filter !== technical.id}
        aria-labelledby="career-competition-title"
      >
        <header className="career-award-section-heading">
          <h3 id="career-competition-title">{technical.title}</h3>
          <p>{technical.description}</p>
        </header>
        <div className="career-competition-grid">
          {technical.records.map((record, index) => (
            <article
              className="career-competition-card"
              data-tone={index % 3}
              key={record.title}
            >
              <div className="career-competition-meta">
                <span className="career-trophy">
                  <Trophy size={21} aria-hidden="true" />
                </span>
                <time>{record.year}</time>
              </div>
              <p className="career-competition-result">{record.detail}</p>
              <h4>{record.title}</h4>
              <p className="career-award-issuer">{record.issuer}</p>
              <CertificateLinks record={record} />
            </article>
          ))}
        </div>
      </section>
      <div className="career-award-groups">
        {awardSections.slice(1).map((section) => (
          <details
            className="career-award-group"
            key={`${filter}-${section.id}`}
            hidden={filter !== section.id}
            open={filter === section.id}
          >
            <summary>
              <span>{section.title}</span>
              <span className="career-group-count">
                {section.records.length} records
              </span>
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <p className="career-group-description">{section.description}</p>
            <div
              className={`career-award-records${section.id === "certificates" ? " career-credential-records" : ""}`}
            >
              {section.records.map((record) => (
                <AwardRecord
                  key={`${record.title}-${record.year ?? record.issuer}`}
                  record={record}
                />
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default function WorkPanel({
  awardsOnly = false,
}: {
  awardsOnly?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("work");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prefix = useId();
  const reducedMotion = useMotionPreference();
  useEffect(() => {
    if (awardsOnly) return;
    const syncHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#education") setActiveTab("education");
      else if (hash === "#volunteering") setActiveTab("volunteering");
      else if (hash === "#community" || hash === "#leadership")
        setActiveTab("community");
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [awardsOnly]);
  function tabKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : event.key === "ArrowRight"
            ? (index + 1) % tabs.length
            : event.key === "ArrowLeft"
              ? (index + tabs.length - 1) % tabs.length
              : null;
    if (next === null) return;
    event.preventDefault();
    setActiveTab(tabs[next].id);
    tabRefs.current[next]?.focus({ preventScroll: true });
  }
  return (
    <div className="career-classic" data-reduced-motion={reducedMotion}>
      {awardsOnly ? (
        <AwardsArchive />
      ) : (
        <div className="career-archive-shell">
          <div
            className="career-main-tabs"
            role="tablist"
            aria-label="Career archive"
          >
            {tabs.map((tab, index) => (
              <button
                type="button"
                key={tab.id}
                id={`${prefix}-${tab.id}-tab`}
                role="tab"
                aria-controls={`${prefix}-${tab.id}-panel`}
                aria-selected={activeTab === tab.id}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => tabKeys(event, index)}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
              >
                {tab.label}
                <span>{tab.count}</span>
              </button>
            ))}
          </div>
          {tabs.map((tab) => (
            <div
              className={`career-archive-panel${tab.id === "work" ? " career-work-panel" : ""}`}
              key={tab.id}
              id={`${prefix}-${tab.id}-panel`}
              role="tabpanel"
              aria-labelledby={`${prefix}-${tab.id}-tab`}
              hidden={activeTab !== tab.id}
              tabIndex={0}
            >
              {tab.id === "work" ? (
                <ExperienceBrowser prefix={prefix} />
              ) : tab.id === "education" ? (
                <EducationCards />
              ) : (
                <CommunityCards
                  records={
                    tab.id === "community"
                      ? leadershipRecords
                      : volunteeringRecords
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
