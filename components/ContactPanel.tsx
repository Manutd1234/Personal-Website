"use client";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/portfolio";

export default function ContactPanel() {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState("idle"), 2000);
  }
  return (
    <div className="pb-3">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <p className="max-w-sm text-sm leading-7 text-zinc-500 dark:text-zinc-400">
          For opportunities, projects, or a conversation.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="break-all text-base font-medium tracking-tight text-emerald-800 underline decoration-emerald-200 underline-offset-8 hover:decoration-emerald-600 dark:text-emerald-300"
          >
            {profile.email}
          </a>
          <button
            onClick={copy}
            className="inline-flex min-h-11 min-w-[128px] items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-xs hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900"
            aria-label="Copy email address"
          >
            {copyState === "copied" ? (
              <Check className="size-3.5 text-emerald-600" />
            ) : (
              <Copy className="size-3.5" />
            )}
            <span aria-live="polite">
              {copyState === "copied"
                ? "Copied!"
                : copyState === "error"
                  ? "Try email link"
                  : "Copy email"}
            </span>
          </button>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-7 font-mono text-xs">
        <a
          className="muted-link inline-flex min-h-11 items-center"
          href={profile.github}
          target="_blank"
          rel="noreferrer"
        >
          github ↗︎
        </a>
        <a
          className="muted-link inline-flex min-h-11 items-center"
          href={profile.linkedin}
          target="_blank"
          rel="noreferrer"
        >
          linkedin ↗︎
        </a>
        <a
          className="muted-link inline-flex min-h-11 items-center"
          href={profile.resumeUrl}
          target="_blank"
          rel="noreferrer"
        >
          resume ↗︎
        </a>
      </div>
    </div>
  );
}
