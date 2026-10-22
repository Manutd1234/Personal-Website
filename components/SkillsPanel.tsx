"use client";

import { useId, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Search } from "lucide-react";
import {
  certifications,
  skillGroups,
  spokenLanguages,
} from "@/content/portfolio";
import { certificateFiles } from "@/content/media";
import { asset } from "@/content/paths";
import SkillsSandbox from "./SkillsSandbox";

const TOTAL_SKILLS = skillGroups.reduce(
  (total, group) => total + group.items.length,
  0,
);
const credentialGroups = [
  ...new Set(certifications.map((record) => record.issuer)),
].map((issuer) => ({
  issuer,
  records: certifications.filter((record) => record.issuer === issuer),
}));
const files: Readonly<Record<string, { src: string; title: string }>> =
  certificateFiles;

export default function SkillsPanel() {
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
          <label htmlFor={categoryId}>Light up a category</label>
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
            <strong>{count}</strong> of {TOTAL_SKILLS} skills highlighted
            {category === "all" && count > 0
              ? ` across ${groups.length} ${groups.length === 1 ? "category" : "categories"}`
              : ""}
            {!count ? ". No matches; every skill stays in the sandbox." : "."}
          </p>
          <button
            type="button"
            disabled={!search && category === "all"}
            onClick={reset}
          >
            Reset filters <span aria-hidden="true">↗</span>
          </button>
        </div>
        <SkillsSandbox id={resultsId} category={category} search={search} />

        <section
          className="skills-classic-languages"
          aria-labelledby={languagesId}
        >
          <div>
            <p>Beyond programming</p>
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
              <p>Continued learning</p>
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
                            href={asset(certificate.src)}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${certificate.title} — view certificate, opens in a new tab`}
                          >
                            View certificate{" "}
                            <ArrowUpRight size={13} aria-hidden="true" />
                          </a>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </details>
            ))}
          </div>
        </section>
      </div>

      <p className="skills-classic-note">
        {TOTAL_SKILLS} tools and practices across projects, work, and
        coursework.
      </p>
    </div>
  );
}
