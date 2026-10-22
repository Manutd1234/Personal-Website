"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { skillGroups, spokenLanguages } from "@/content/portfolio";
import SkillsSandbox from "./SkillsSandbox";

const TOTAL_SKILLS = skillGroups.reduce(
  (total, group) => total + group.items.length,
  0,
);

export default function SkillsPanel() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const searchId = useId();
  const categoryId = useId();
  const resultsId = useId();
  const reducedMotion = useReducedMotion();
  const query = search.trim().toLocaleLowerCase();
  const matches = skillGroups.map((group) => ({
    label: group.label,
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

  function reset() {
    setSearch("");
    setCategory("all");
  }

  return (
    <div className="space-y-4">
      <SkillsSandbox />

      <details className="group rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-900 outline-offset-4 focus-visible:outline-2 focus-visible:outline-emerald-600 dark:text-zinc-100 [&::-webkit-details-marker]:hidden">
          <span>
            Explore the full toolkit{" "}
            <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
              {TOTAL_SKILLS} skills · {skillGroups.length} areas
            </span>
          </span>
          <span
            aria-hidden="true"
            className="text-lg font-normal text-emerald-600 transition-transform group-open:rotate-45 motion-reduce:transition-none"
          >
            +
          </span>
        </summary>
        <div className="border-t border-zinc-100 px-4 pb-5 pt-4 sm:px-5 dark:border-zinc-800">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_230px]">
            <div className="min-w-0">
              <label
                className="mb-1.5 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
                htmlFor={searchId}
              >
                Find a skill
              </label>
              <input
                aria-controls={resultsId}
                autoComplete="off"
                className="h-11 w-full min-w-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-emerald-950"
                id={searchId}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCategory("all");
                }}
                placeholder="Python, React, AWS…"
                type="search"
                value={search}
              />
            </div>
            <div className="min-w-0">
              <label
                className="mb-1.5 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
                htmlFor={categoryId}
              >
                Category
              </label>
              <select
                aria-controls={resultsId}
                className="h-11 w-full min-w-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:ring-emerald-950"
                id={categoryId}
                onChange={(event) => setCategory(event.target.value)}
                value={category}
              >
                <option value="all">
                  All categories (
                  {matches.reduce(
                    (total, group) => total + group.items.length,
                    0,
                  )}
                  )
                </option>
                {matches.map((group) => (
                  <option key={group.label} value={group.label}>
                    {group.label} ({group.items.length})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex min-h-12 items-center justify-between gap-3">
            <p
              aria-live="polite"
              className="text-[11px] text-zinc-500 dark:text-zinc-400"
              role="status"
            >
              {count} {count === 1 ? "skill" : "skills"} in {groups.length}{" "}
              {groups.length === 1 ? "category" : "categories"}
            </p>
            <button
              className="min-h-11 shrink-0 px-1 text-[11px] font-medium text-emerald-700 outline-offset-4 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-40 dark:text-emerald-300 dark:hover:text-emerald-100"
              disabled={!search && category === "all"}
              onClick={reset}
              type="button"
            >
              Reset filters
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2" id={resultsId}>
            {groups.map((group) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="min-w-0 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/70"
                initial={reducedMotion ? false : { opacity: 0, y: 5 }}
                key={group.label}
                transition={{ duration: reducedMotion ? 0 : 0.18 }}
              >
                <h3 className="text-xs font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
                  {group.label}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <li
                      className="max-w-full break-words rounded-md border border-emerald-100 bg-white px-2 py-1.5 text-[11px] leading-relaxed text-emerald-800 dark:border-emerald-900 dark:bg-zinc-950 dark:text-emerald-300"
                      key={item}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
            {groups.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center sm:col-span-2 dark:border-zinc-700">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  No matching skills.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Try another term or select All categories.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </details>

      <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          Spoken languages
        </h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {spokenLanguages.map((language) => (
            <div className="min-w-0" key={language.title}>
              <dt className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                {language.title}
              </dt>
              <dd className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                {language.level}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <a
        className="inline-flex min-h-10 items-center gap-2 px-1 text-xs font-medium text-emerald-700 outline-offset-4 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-100"
        href="#achievements"
      >
        Awards & credentials <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
