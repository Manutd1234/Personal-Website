"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { achievementGroups, certifications } from "@/content/portfolio";
import { certificateFiles } from "@/content/media";
import { asset } from "@/content/paths";
import TrophyRoom from "./TrophyRoom";
import CardShowcase from "./CardShowcase";

type CertificateRecord = {
  title: string;
  issuer: string;
  detail?: string;
  year?: string;
  certificateKey?: string;
  certificateKeys?: readonly string[];
};
type CertificateFile = { src: string; title: string };

const files: Readonly<Record<string, CertificateFile>> = certificateFiles;

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

// Competitions and government awards live in the Trophy Room above the
// archive, which keeps the remaining categories.
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
    id: "academic",
    label: "Academic",
    title: "Academic & creative awards",
    description: schoolAwards.description,
    records: schoolAwards.items.filter(
      (record) => !isSport(record),
    ) as readonly CertificateRecord[],
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
  const [filter, setFilter] = useState(awardSections[0].id);
  const prefix = useId();
  const archiveRef = useRef<HTMLElement>(null);
  useEffect(() => {
    let frame = 0;
    const syncHash = () => {
      const hash = window.location.hash.toLowerCase();
      const section = awardSections.find((item) => `#${item.id}` === hash);
      if (!section) return;
      setFilter(section.id);
      // The archive sits below the Trophy Room. Once the Awards tab shows,
      // wait one more frame for Portfolio's scroll-to-top, then reveal it.
      cancelAnimationFrame(frame);
      let attempts = 60;
      const reveal = () => {
        if (archiveRef.current?.getClientRects().length)
          frame = requestAnimationFrame(() =>
            archiveRef.current?.scrollIntoView({ block: "start" }),
          );
        else if (--attempts > 0) frame = requestAnimationFrame(reveal);
      };
      frame = requestAnimationFrame(reveal);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncHash);
    };
  }, []);
  return (
    <div className="career-awards">
      <TrophyRoom />
      <section
        ref={archiveRef}
        className="career-award-archive"
        aria-labelledby={`${prefix}-archive-title`}
      >
        <header className="career-award-section-heading">
          <h2 id={`${prefix}-archive-title`}>More awards &amp; credentials</h2>
          <p>School milestones, sport, service, and continued learning.</p>
        </header>
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
              aria-controls={`${prefix}-${section.id}-panel`}
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
        <div className="career-award-groups">
          {awardSections.map((section) => (
            <details
              className="career-award-group"
              key={`${filter}-${section.id}`}
              hidden={filter !== section.id}
              open={filter === section.id}
              id={`${prefix}-${section.id}-panel`}
              aria-labelledby={`${prefix}-${section.id}-title`}
            >
              <summary>
                <span id={`${prefix}-${section.id}-title`}>
                  {section.title}
                </span>
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
      </section>
    </div>
  );
}

export default function WorkPanel({
  awardsOnly = false,
}: {
  awardsOnly?: boolean;
}) {
  return (
    <div className="career-classic">
      {awardsOnly ? <AwardsArchive /> : <CardShowcase />}
    </div>
  );
}
