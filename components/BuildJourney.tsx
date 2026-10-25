"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Braces,
  ClipboardCheck,
  GitBranch,
  Lightbulb,
  Pause,
  Play,
  Rocket,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import BuildJourneyScene from "./BuildJourneyScene";
import { useMotionPreference } from "./useMotionPreference";
import { useVisiblePlayback } from "./useVisiblePlayback";

const STEP_DURATION_MS = 6500;
const steps = [
  {
    label: "Define",
    icon: Lightbulb,
    title: "Turn the problem into a contract.",
    body: "I define inputs, expected behavior and invariants—what must always hold. Acceptance criteria and failure cases give me something concrete to build and test.",
    outcome: "A clear contract and testable acceptance criteria.",
    preview: "01 · Define the task API",
    rows: [
      { label: "User goal", detail: "Inputs and expected behavior" },
      { label: "Success criteria", detail: "Acceptance criteria and invariants" },
      { label: "Edge cases", detail: "Invalid inputs and failure behavior" },
    ],
  },
  {
    label: "Choose",
    icon: Blocks,
    title: "Choose the simplest stack that fits.",
    body: "I weigh latency, data access and delivery speed against operational complexity. A small prototype tests the riskiest dependency before I commit to the stack.",
    outcome: "A stack chosen for the workload and its tradeoffs.",
    preview: "02 · Give the feature a stack",
    rows: [
      { label: "Interface", detail: "Delivery speed and user needs" },
      { label: "Backend", detail: "Latency and dependency tradeoffs" },
      { label: "Data", detail: "Access patterns and operational complexity" },
    ],
  },
  {
    label: "Design",
    icon: GitBranch,
    title: "Make boundaries and ownership explicit.",
    body: "I define API contracts, data ownership and failure paths. Each module has a clear job, so I can trace a request and reason about changes.",
    outcome: "Interfaces, state and failure paths I can trace.",
    preview: "03 · Trace the same request",
    rows: [
      { label: "Interface", detail: "Validate the request contract" },
      { label: "Service", detail: "Own domain rules and failure behavior" },
      { label: "Database", detail: "Make data ownership explicit" },
    ],
  },
  {
    label: "Build",
    icon: Braces,
    title: "Build a verified vertical slice.",
    body: "I connect input, domain logic and persistence in one complete feature. I test success and failure paths, debug at the boundaries and keep changes reviewable.",
    outcome: "An end-to-end feature with focused tests.",
    preview: "04 · Make the contract executable",
    rows: [
      { label: "Implement", detail: "Input, domain logic and persistence" },
      { label: "Test", detail: "Test the behavior at each boundary" },
      { label: "Review", detail: "Keep the change small and explainable" },
    ],
  },
  {
    label: "Ship & learn",
    icon: Rocket,
    title: "Verify production. Learn from evidence.",
    body: "I check the build, deployment and critical user journey. Logs, errors, latency and user feedback guide the next change, with a rollback path in mind.",
    outcome: "A verified release and an observable feedback loop.",
    preview: "05 · Take it into production",
    rows: [
      { label: "Check", detail: "Run tests and a production build" },
      { label: "Release", detail: "Smoke-test the critical user journey" },
      { label: "Learn", detail: "Observe errors, latency and user feedback" },
    ],
  },
] as const;

export default function BuildJourney({
  openProjects,
}: {
  openProjects: (title?: string) => void;
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [sceneFocused, setSceneFocused] = useState(false);
  const remainingMs = useRef(STEP_DURATION_MS);
  const timerStage = useRef(active);
  const { ref, visible } = useVisiblePlayback<HTMLElement>();
  const reduced = useMotionPreference();
  const prefix = useId();
  const running = playing && visible && !reduced;
  const advancing = running && !sceneFocused;
  const step = steps[active];

  useEffect(() => {
    if (timerStage.current !== active) {
      timerStage.current = active;
      remainingMs.current = STEP_DURATION_MS;
    }
    if (!advancing) return;
    const startedAt = performance.now();
    let completed = false;
    const timer = window.setTimeout(() => {
      completed = true;
      remainingMs.current = STEP_DURATION_MS;
      setActive(value => (value + 1) % steps.length);
    }, remainingMs.current);
    return () => {
      window.clearTimeout(timer);
      if (!completed) remainingMs.current = Math.max(100, remainingMs.current - (performance.now() - startedAt));
    };
  }, [advancing, active]);

  useEffect(() => {
    const panel = ref.current?.closest('[role="tabpanel"]');
    if (!panel) return;
    let wasHidden = panel.hasAttribute("hidden");
    const observer = new MutationObserver(() => {
      const hidden = panel.hasAttribute("hidden");
      if (wasHidden && !hidden) setPlaying(true);
      wasHidden = hidden;
    });
    observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
    return () => observer.disconnect();
  }, [ref]);

  return (
    <section
      className="builder-workbench build-journey"
      ref={ref}
      aria-labelledby={`${prefix}-title`}
      data-running={running}
      data-reduced={reduced}
    >
      <header className="builder-workbench-heading">
        <div>
          <p className="classic-kicker">How I build</p>
          <h2 id={`${prefix}-title`}>From a question to a <em>working system.</em></h2>
          <p className="journey-mindset">I turn assumptions into explicit contracts, testable behavior and observable software.</p>
        </div>
        {!reduced && <button
          className="journey-play"
          type="button"
          aria-label={playing ? "Pause build animation" : "Play build animation"}
          aria-pressed={playing}
          onClick={() => setPlaying(value => !value)}
        >
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          <span>{playing ? "Pause" : "Play"}</span>
        </button>}
      </header>
      <div className="journey-notebook">
        <ol className="journey-chapters" aria-label="The five stages of my build process">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return <li key={item.label} data-active={active === index}>
              <button
                type="button"
                aria-label={`Stage ${index + 1}: ${item.label}`}
                aria-current={active === index ? "step" : undefined}
                aria-controls={`${prefix}-panel`}
                onClick={() => setActive(index)}
              >
                <span className="journey-step-icon"><Icon size={21} aria-hidden="true" /></span>
                <span><small>0{index + 1}</small>{item.label}</span>
              </button>
            </li>;
          })}
        </ol>
        <div className="journey-panel" id={`${prefix}-panel`} role="region" aria-labelledby={`${prefix}-stage-title`}>
          <div className="journey-summary" key={active}>
            <span className="journey-step-number">My approach · 0{active + 1}</span>
            <h3 id={`${prefix}-stage-title`}>{step.title}</h3>
            <p className="journey-body">{step.body}</p>
            <div className="journey-outcome">
              <ClipboardCheck size={21} aria-hidden="true" />
              <p><span>The outcome</span>{step.outcome}</p>
            </div>
          </div>
          <div className="journey-preview">
            <div className="journey-preview-heading"><span className="journey-preview-dot" aria-hidden="true" /><h4>{step.preview}</h4></div>
            <BuildJourneyScene
              stage={active}
              onFocusChange={setSceneFocused}
              description={`An illustrative task-creation API evolves through five engineering stages. ${step.rows.map(row => `${row.label}: ${row.detail}.`).join(" ")}`}
            />
          </div>
        </div>
        <footer className="journey-footer">
          <span>{String(active + 1).padStart(2, "0")} <span aria-hidden="true">/</span> 05</span>
          <button type="button" onClick={() => openProjects()}>See it in my projects <ArrowUpRight size={17} aria-hidden="true" /></button>
          <button className="journey-next" type="button" aria-label="Next build stage" onClick={() => setActive(value => (value + 1) % steps.length)}><ArrowRight size={18} aria-hidden="true" /></button>
        </footer>
      </div>
    </section>
  );
}
