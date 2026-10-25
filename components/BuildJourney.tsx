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
    title: "Understand the need.",
    body: "I start with the user’s goal, work through a real example and scope a useful first version.",
    outcome: "A clear goal and a way to check it.",
    preview: "01 · Understand the need",
    rows: [
      { label: "Understand", detail: "Who is it for, and what do they need?" },
      { label: "Scope", detail: "Choose a useful first version" },
      { label: "Check", detail: "Define success and edge cases" },
    ],
  },
  {
    label: "Choose",
    icon: Blocks,
    title: "Try before committing.",
    body: "I compare a few approaches and prototype the uncertain part. The choice should fit the team and stay easy to maintain.",
    outcome: "A simple approach, with clear tradeoffs.",
    preview: "02 · Try the building blocks",
    rows: [
      { label: "Compare", detail: "Consider delivery, reliability and maintenance" },
      { label: "Prototype", detail: "Try the uncertain part early" },
      { label: "Choose", detail: "Keep the first version simple" },
    ],
  },
  {
    label: "Design",
    icon: GitBranch,
    title: "Connect the pieces.",
    body: "I sketch the user journey, give each part a clear job and plan helpful feedback when something goes wrong.",
    outcome: "A clear path from action to result.",
    preview: "03 · Connect the user journey",
    rows: [
      { label: "Sketch", detail: "Follow the user’s journey" },
      { label: "Connect", detail: "Give each part a clear responsibility" },
      { label: "Recover", detail: "Plan helpful feedback when things go wrong" },
    ],
  },
  {
    label: "Build",
    icon: Braces,
    title: "Build small. Test. Review.",
    body: "I build one complete feature, test the happy path and edge cases, then review the change before moving on.",
    outcome: "A tested feature, ready to ship.",
    preview: "04 · Turn the plan into a feature",
    rows: [
      { label: "Build", detail: "Deliver one complete feature" },
      { label: "Test", detail: "Check success and failure cases" },
      { label: "Review", detail: "Keep changes clear and manageable" },
    ],
  },
  {
    label: "Ship & learn",
    icon: Rocket,
    title: "Ship. Listen. Improve.",
    body: "I verify the live experience, watch for errors and listen to users. What I learn shapes the next improvement.",
    outcome: "A useful release and a next step.",
    preview: "05 · Put it in people’s hands",
    rows: [
      { label: "Release", detail: "Check the build and live user journey" },
      { label: "Observe", detail: "Watch for errors and collect feedback" },
      { label: "Improve", detail: "Use what I learn in the next version" },
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
          <p className="journey-mindset">I turn user needs into thoughtful designs, tested features and useful releases.</p>
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
