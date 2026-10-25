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
import { ActivePlaybackClock, BUILD_STAGE_DURATION_MS, journeyPlayback } from "./build-journey-timeline";
import { useMotionPreference } from "./useMotionPreference";
import { useVisiblePlayback } from "./useVisiblePlayback";

const steps = [
  {
    label: "Define",
    icon: Lightbulb,
    title: "Make requirements testable.",
    body: "I start with the user’s goal and make success testable. In this example, a request must be saved, missing fields explained, and success confirmed.",
    outcome: "Acceptance criteria to guide the prototype.",
    preview: "01 · Define the requirements",
    rows: [
      { label: "Requirements", detail: "Identify inputs and expected behavior" },
      { label: "Scope", detail: "Set the boundaries of the first version" },
      { label: "Acceptance", detail: "Agree on measurable success criteria" },
    ],
  },
  {
    label: "Choose",
    icon: Blocks,
    title: "Test the approach early.",
    body: "I prototype the form against those criteria and compare ways to save requests. I choose an approach that balances reliability, complexity and maintenance.",
    outcome: "A form, an API and persistent storage to design.",
    preview: "02 · Prototype and compare",
    rows: [
      { label: "Prototype", detail: "Test the riskiest assumption early" },
      { label: "Compare", detail: "Weigh performance, complexity and maintenance" },
      { label: "Decide", detail: "Choose an approach that meets the requirements" },
    ],
  },
  {
    label: "Design",
    icon: GitBranch,
    title: "Design clear boundaries.",
    body: "I give the chosen components clear jobs: the form sends input, the API validates it, and storage keeps the request. Invalid input returns to the form with a useful explanation.",
    outcome: "A success path and a failure path to implement.",
    preview: "03 · Map interfaces and data flow",
    rows: [
      { label: "Interfaces", detail: "Define responsibilities and boundaries" },
      { label: "Data flow", detail: "Trace inputs through to their results" },
      { label: "Recovery", detail: "Handle invalid input and partial failures" },
    ],
  },
  {
    label: "Build",
    icon: Braces,
    title: "Build a verified slice.",
    body: "I implement that complete path, then test both a saved request and invalid input. A review checks the change against the original acceptance criteria.",
    outcome: "A verified request flow, ready for deployment.",
    preview: "04 · Implement, test and review",
    rows: [
      { label: "Implement", detail: "Build one complete vertical slice" },
      { label: "Test", detail: "Verify success, edge cases and failure paths" },
      { label: "Review", detail: "Keep changes readable and maintainable" },
    ],
  },
  {
    label: "Ship & learn",
    icon: Rocket,
    title: "Deploy. Observe. Iterate.",
    body: "I deploy the reviewed build and check the live request flow, errors and performance. Feedback becomes the next requirement, taking the process back to the start.",
    outcome: "A live feature and evidence for the next requirement.",
    preview: "05 · Deploy and observe",
    rows: [
      { label: "Deploy", detail: "Verify the build and deployed behavior" },
      { label: "Observe", detail: "Monitor errors, performance and user feedback" },
      { label: "Iterate", detail: "Use evidence to prioritise the next improvement" },
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
  const [replay, setReplay] = useState(0);
  const stageClock = useRef(new ActivePlaybackClock());
  const timerStage = useRef(active);
  const timerReplay = useRef(replay);
  const { ref, visible } = useVisiblePlayback<HTMLElement>();
  const reduced = useMotionPreference();
  const prefix = useId();
  const { animate: running, advance: advancing } = journeyPlayback(playing, visible, reduced, sceneFocused);
  const step = steps[active];

  useEffect(() => {
    const clock = stageClock.current;
    if (timerStage.current !== active || timerReplay.current !== replay) {
      timerStage.current = active;
      timerReplay.current = replay;
      clock.reset();
    }
    clock.setRunning(advancing, performance.now());
    if (!advancing) return;
    const timer = window.setTimeout(() => {
      setActive(value => (value + 1) % steps.length);
    }, clock.remainingUntil(BUILD_STAGE_DURATION_MS, performance.now()));
    return () => {
      window.clearTimeout(timer);
      clock.setRunning(false, performance.now());
    };
  }, [advancing, active, replay]);

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
          <p className="journey-mindset">I turn requirements into clear interfaces, tested features and reliable releases.</p>
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
              onReplay={() => setReplay(value => value + 1)}
              animate={running}
              reducedMotion={reduced}
              description={`An illustrative project evolves from a user need into a tested release. ${step.rows.map(row => `${row.label}: ${row.detail}.`).join(" ")}`}
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
