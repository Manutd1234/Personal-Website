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
    title: "Start with the person using it.",
    body: "I clarify the user’s goal, work through a real example and agree on what success looks like. Then I scope a useful first version, including the cases that could go wrong.",
    outcome: "A focused problem and clear acceptance criteria.",
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
    title: "Choose tools with a reason.",
    body: "I compare the options against the project’s needs, the team’s experience and the cost of maintaining it. A small prototype helps me test uncertain choices before building more.",
    outcome: "A practical stack with understood tradeoffs.",
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
    title: "Make the pieces work together.",
    body: "I sketch the user journey and give each part of the system a clear responsibility. I consider how data moves, how errors are handled and how the design can change as I learn.",
    outcome: "A clear flow from user action to useful result.",
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
    body: "I build one complete feature at a time, test normal and unexpected behavior, and review the change. Small commits and clear feedback make it easier to find problems and keep improving.",
    outcome: "Working software that is tested and easy to review.",
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
    title: "Release, listen and improve.",
    body: "I check the release and try the real user journey. Then I watch for errors, listen to feedback and turn what I learn into the next improvement, with a way back if something goes wrong.",
    outcome: "A reliable release and a clear next improvement.",
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
              animate={running}
              description={`An illustrative task board evolves from a user need into a tested release. ${step.rows.map(row => `${row.label}: ${row.detail}.`).join(" ")}`}
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
