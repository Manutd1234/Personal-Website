"use client";

import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/portfolio";

export default function ContactPanel() {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const node = panel.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        node.dataset.visible = String(entry.isIntersecting);
      },
      { threshold: 0.15 },
    );
    const onVisibility = () => {
      node.dataset.documentVisible = String(!document.hidden);
    };
    onVisibility();
    observer.observe(node);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

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
    <div className="contact-paper" ref={panel}>
      <div className="contact-paper-body">
        <div className="contact-paper-intro">
          <h2 id="contact-title" className="contact-paper-title">
            Let’s talk.
            <br />
            <em>And build.</em>
          </h2>
          <p className="contact-paper-invitation">
            <span className="sr-only">
              Bring a new idea, a tricky problem, or a project in progress.
            </span>
            <span aria-hidden="true" className="contact-paper-rolling-line">
              Bring
              <span className="contact-paper-rolling-window">
                <span className="contact-paper-rolling-track">
                  <span>a new idea.</span>
                  <span>a tricky problem.</span>
                  <span>a project in progress.</span>
                  <span>a new idea.</span>
                </span>
              </span>
            </span>
          </p>
        </div>
        <div className="contact-paper-actions">
          <div className="contact-paper-note" aria-hidden="true">
            <span>Say hello.</span>
            <svg viewBox="0 0 105 55" fill="none">
              <path
                d="M4 6c29-7 77 5 78 36M71 33l12 12 14-13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <a className="contact-paper-email" href={`mailto:${profile.email}`}>
            <span>{profile.email}</span>
            <ArrowUpRight aria-hidden="true" size={23} strokeWidth={1.6} />
          </a>
          <div className="contact-paper-secondary">
            <button
              type="button"
              onClick={copy}
              className="contact-paper-copy"
              aria-label="Copy email address"
            >
              {copyState === "copied" ? (
                <Check aria-hidden="true" size={15} />
              ) : (
                <Copy aria-hidden="true" size={15} />
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
      </div>
      <div className="contact-paper-bottom">
        <nav aria-label="Contact and professional links">
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗︎</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn <span aria-hidden="true">↗︎</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
            Résumé <span aria-hidden="true">↗︎</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </nav>
      </div>
    </div>
  );
}
