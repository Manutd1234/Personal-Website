"use client";

import { useId, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Search } from "lucide-react";
import {
  certifications,
  skillGroups,
  spokenLanguages,
} from "@/content/portfolio";
import { certificateFiles } from "@/content/media";
import { credentialProviders } from "@/content/credential-providers";
import { asset } from "@/content/paths";
import SkillsSandbox from "./SkillsSandbox";

const credentialGroups = [
  ...new Set(certifications.map((record) => record.issuer)),
].map((issuer) => ({
  issuer,
  records: certifications.filter((record) => record.issuer === issuer),
}));
const files: Readonly<
  Record<string, { src: string; title: string; kind?: string }>
> = certificateFiles;

export default function SkillsPanel({ active = true }: { active?: boolean }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const searchId = useId();
  const categoryId = useId();
  const resultsId = useId();
  const languagesId = useId();
  const credentialsId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const query = search.trim().toLocaleLowerCase();
  const matches = skillGroups.map((group, index) => ({
    ...group,
    index,
    items:
      !query || group.label.toLocaleLowerCase().includes(query)
        ? group.items
        : group.items.filter((item) =>
            item.toLocaleLowerCase().includes(query),
          ),
  }));
  const groups = matches.filter(
    (group) =>
      (category === "all" || category === group.label) &&
      group.items.length > 0,
  );
  const count = groups.reduce((total, group) => total + group.items.length, 0);
  const filtering = Boolean(query) || category !== "all";
  const filters = [
    {
      value: "all",
      label: "All",
      count: matches.reduce((total, group) => total + group.items.length, 0),
    },
    ...matches.map((group) => ({
      value: group.label,
      label: group.label,
      count: group.items.length,
    })),
  ];

  function reset() {
    setSearch("");
    setCategory("all");
    searchRef.current?.focus();
  }

  return (
    <div className="skills-classic">
      <div className="skills-classic-workspace">
        <div className="skills-classic-search">
          <label htmlFor={searchId}>Find a skill</label>
          <div className="skills-classic-search-field">
            <Search size={18} aria-hidden="true" />
            <input
              ref={searchRef}
              id={searchId}
              type="search"
              value={search}
              autoComplete="off"
              placeholder="Python, React, AWS…"
              aria-controls={resultsId}
              onChange={(event) => {
                setSearch(event.target.value);
                setCategory("all");
              }}
            />
            {search ? (
              <button
                type="button"
                aria-label="Clear skill search"
                onClick={() => {
                  setSearch("");
                  searchRef.current?.focus();
                }}
              >
                ×
              </button>
            ) : null}
          </div>
        </div>
        <div
          className="skills-classic-filters"
          role="group"
          aria-label="Highlight skills by category"
        >
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={category === filter.value}
              aria-controls={resultsId}
              onClick={() => setCategory(filter.value)}
            >
              {filter.label}
              <span>{filter.count}</span>
            </button>
          ))}
        </div>
        <div className="skills-classic-mobile-filter">
          <label htmlFor={categoryId}>Category</label>
          <select
            id={categoryId}
            aria-controls={resultsId}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {filters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label} ({filter.count})
              </option>
            ))}
          </select>
        </div>
        <div className="skills-classic-result-bar">
          <p role="status" aria-live="polite">
            {filtering ? (
              count ? (
                <>
                  <strong>{count}</strong> {count === 1 ? "skill" : "skills"}{" "}
                  highlighted
                </>
              ) : (
                "No matching skills. Try another search."
              )
            ) : (
              "Drag the labels around. Choose a category to bring it into focus."
            )}
          </p>
          {filtering ? (
            <button type="button" onClick={reset}>
              Clear filters
            </button>
          ) : null}
        </div>
        <SkillsSandbox
          id={resultsId}
          category={category}
          search={search}
          active={active}
        />

        <section
          className="skills-classic-languages"
          aria-labelledby={languagesId}
        >
          <div>
            <h2 id={languagesId}>Spoken languages</h2>
          </div>
          <dl>
            {spokenLanguages.map((language) => (
              <div key={language.title}>
                <dt>{language.title}</dt>
                <dd>{language.level}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          className="skills-classic-credentials"
          aria-labelledby={credentialsId}
        >
          <header>
            <div>
              <h2 id={credentialsId}>Credentials</h2>
            </div>
            <a href="#certificates">
              Awards & certificates{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </header>
          <div className="skills-classic-credential-grid">
            {credentialGroups.map((group) => (
              <details key={group.issuer} className="skills-classic-issuer">
                <summary>
                  {credentialProviders[group.issuer] ? (
                    <span className="credential-provider-mark">
                      <img
                        src={asset(credentialProviders[group.issuer]!.src)}
                        alt=""
                        width={92}
                        height={36}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                  ) : null}
                  <h3>{group.issuer}</h3>
                  <span className="skills-classic-issuer-count">
                    {group.records.length}
                    <ChevronDown size={16} aria-hidden="true" />
                  </span>
                </summary>
                <ul>
                  {group.records.map((record) => {
                    const certificate =
                      "certificateKey" in record && record.certificateKey
                        ? files[record.certificateKey]
                        : undefined;
                    const verificationUrl =
                      "verificationUrl" in record &&
                      typeof record.verificationUrl === "string"
                        ? record.verificationUrl
                        : undefined;
                    return (
                      <li key={record.title}>
                        <div>
                          <h4>{record.title}</h4>
                          <p>{record.year}</p>
                        </div>
                        {"detail" in record && record.detail ? (
                          <p className="skills-classic-credential-detail">
                            {record.detail}
                          </p>
                        ) : null}
                        {certificate ? (
                          <a
                            className="skills-credential-preview"
                            data-format={
                              certificate.kind === "Completion record"
                                ? "record"
                                : "document"
                            }
                            href={asset(certificate.src)}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open ${certificate.kind?.toLowerCase() ?? "certificate"}: ${record.title}, opens in a new tab`}
                          >
                            <img
                              src={asset(certificate.src)}
                              alt={certificate.title}
                              width={1200}
                              height={
                                certificate.kind === "Completion record"
                                  ? 362
                                  : 800
                              }
                              loading="lazy"
                              decoding="async"
                            />
                          </a>
                        ) : null}
                        <div className="skills-credential-actions">
                          {certificate ? (
                            <a
                              href={asset(certificate.src)}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${certificate.title} — view ${certificate.kind?.toLowerCase() ?? "certificate"}, opens in a new tab`}
                            >
                              View{" "}
                              {certificate.kind?.toLowerCase() ?? "certificate"}{" "}
                              <ArrowUpRight size={13} aria-hidden="true" />
                            </a>
                          ) : null}
                          {verificationUrl ? (
                            <a
                              href={verificationUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Verify ${record.title} on ${record.issuer}, opens in a new tab`}
                            >
                              Verify on {record.issuer}{" "}
                              <ArrowUpRight size={13} aria-hidden="true" />
                            </a>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
