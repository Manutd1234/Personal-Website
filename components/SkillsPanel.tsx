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
  const searchId = useId();
  const resultsId = useId();
  const languagesId = useId();
  const credentialsId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const query = search.trim().toLocaleLowerCase();
  const count = skillGroups.reduce((total, group) => total + (
    !query || group.label.toLocaleLowerCase().includes(query)
      ? group.items.length
      : group.items.filter((item) => item.toLocaleLowerCase().includes(query)).length
  ), 0);
  const hasSearch = Boolean(query);

  function reset() {
    setSearch("");
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
              onChange={(event) => setSearch(event.target.value)}
            />
            {search ? (
              <button
                type="button"
                aria-label="Clear skill search"
                onClick={reset}
              >
                ×
              </button>
            ) : null}
          </div>
        </div>
        <SkillsSandbox
          id={resultsId}
          search={search}
          active={active}
          status={
            <div className="skills-classic-result-bar">
              <p role="status" aria-live="polite">
                {hasSearch ? (
                  count ? (
                    <>
                      <strong>{count}</strong> {count === 1 ? "skill" : "skills"}{" "}
                      highlighted
                    </>
                  ) : (
                    "No matching skills. Try another search."
                  )
                ) : (
                  "Drag the labels to move them and bump the pile."
                )}
              </p>
              {hasSearch ? (
                <button type="button" onClick={reset}>
                  Clear search
                </button>
              ) : null}
            </div>
          }
        />

        <section
          className="skills-classic-credentials"
          aria-labelledby={credentialsId}
        >
          <header>
            <div>
              <h2 id={credentialsId}>Credentials</h2>
            </div>
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
      </div>
    </div>
  );
}
