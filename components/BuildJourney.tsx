"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Code2,
  FlaskConical,
  Lightbulb,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Send,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { useMotionPreference } from "./useMotionPreference";
import { useVisiblePlayback } from "./useVisiblePlayback";

const STEP_DURATION_MS = 4000;

const steps = [
  {
    title: "Define what must hold",
    short: "Define",
    icon: Lightbulb,
    note: "The useful behaviour. The hard constraints.",
    body: "I start with inputs, failure modes, and invariants—the things the system must always preserve. A feed gap, for example, needs an explicit recovery path.",
    margin: "AlphaEngine: sequence checks and feed recovery.",
  },
  {
    title: "Draw the boundaries",
    short: "Model",
    icon: Pencil,
    note: "Types, contracts, and a place for the data.",
    body: "Sketch the request path before wiring it up. Define the API contract, validation, permissions, and data model so each part has a clear job.",
    margin: "GDG: typed REST clients, Pydantic, and PostgreSQL.",
  },
  {
    title: "Build one complete path",
    short: "Build",
    icon: Code2,
    note: "A small vertical slice, end to end.",
    body: "Get a real action from the interface through the API to storage. Keep the change small enough to review; handle loading and failure alongside success.",
    margin: "CTES: React portals, Express APIs, database migrations.",
  },
  {
    title: "Test the awkward cases",
    short: "Verify",
    icon: FlaskConical,
    note: "The browser passing is only half the story.",
    body: "Check access boundaries and invalid inputs, then verify the resulting data. Turn failures into regression tests so the same bug has a harder time returning.",
    margin: "Stealth startup: Playwright flows and SQL assertions.",
  },
  {
    title: "Measure, then refine",
    short: "Refine",
    icon: Send,
    note: "A baseline, a change, a reproducible result.",
    body: "Inspect the bottleneck and compare against a baseline. Keep the runs reproducible, automate checks in CI, and use the evidence to decide what to change next.",
    margin: "Delta1: walk-forward validation with execution costs.",
  },
] as const;

function ProcessSketch({ stage }: { stage: number }) {
  return (
    <div className="journey-sketch" data-stage={stage} aria-hidden="true">
      <div className="journey-sheet-label">
        <span>ENGINEERING SKETCHES</span>
        <span>0{stage + 1} / 05</span>
      </div>
      {stage === 0 ? (
        <div className="sketch-question">
          <span className="sketch-pencil">start with an invariant</span>
          <strong>No silent gaps.</strong>
          <span className="sketch-underline" />
          <dl className="sketch-contract">
            <div>
              <dt>input</dt>
              <dd>ordered market updates</dd>
            </div>
            <div>
              <dt>check</dt>
              <dd>sequence continuity</dd>
            </div>
            <div>
              <dt>on gap</dt>
              <dd>recover from a snapshot</dd>
            </div>
          </dl>
        </div>
      ) : null}
      {stage === 1 ? (
        <div className="sketch-map">
          <span className="sketch-pencil">trace the request</span>
          <div>
            <span>
              Client<small>TypeScript</small>
            </span>
            <b>→</b>
            <span>
              API<small>Pydantic</small>
            </span>
            <b>→</b>
            <span>
              Store<small>PostgreSQL</small>
            </span>
          </div>
          <svg viewBox="0 0 360 60">
            <path d="M292 5 Q320 46 170 44 Q45 45 52 6" />
            <path d="M44 17 L52 6 L63 17" />
          </svg>
          <small>typed response · explicit errors · auth boundaries</small>
        </div>
      ) : null}
      {stage === 2 ? (
        <div className="sketch-code">
          <div>
            <i />
            <i />
            <i />
            <span>vertical-slice.ts</span>
          </div>
          <pre>
            <span>// implementation sketch</span>
            {"\n"}
            <b>const</b> data = parse(input);{"\n"}
            <b>const</b> row = <b>await</b> save(data);{"\n\n"}
            <b>return</b> toResponse(row);<em>▍</em>
          </pre>
          <span className="sketch-check">
            <Check size={16} /> UI → API → database
          </span>
        </div>
      ) : null}
      {stage === 3 ? (
        <div className="sketch-tests">
          <span className="sketch-pencil">a regression checklist</span>
          {[
            ["auth & permissions", "browser"],
            ["invalid request", "schema"],
            ["persisted state", "SQL"],
          ].map(([label, method], i) => (
            <div key={label} style={{ animationDelay: `${i * 180}ms` }}>
              <Check size={18} />
              <span>{label}</span>
              <small>{method}</small>
            </div>
          ))}
          <span className="sketch-test-note">unit → integration → end to end</span>
        </div>
      ) : null}
      {stage === 4 ? (
        <div className="sketch-finish">
          <div className="sketch-browser">
            <div>
              <i />
              <i />
              <i />
              <span>review-notes.md</span>
            </div>
            <span className="sketch-browser-title">Baseline ↔ change</span>
            <div className="sketch-review-row">
              <span>same inputs</span>
              <span>same assumptions</span>
            </div>
            <div className="sketch-ci">
              <span>lint</span><b>→</b><span>test</span><b>→</b><span>build</span>
            </div>
            <span className="sketch-review-note">
              keep the run · inspect the diff
            </span>
          </div>
          <span className="sketch-pencil">measure · refine · repeat ↺</span>
        </div>
      ) : null}
      <span className="journey-sheet-corner" />
    </div>
  );
}

export default function BuildJourney({
  openProjects,
}: {
  openProjects: (title?: string) => void;
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [interacting, setInteracting] = useState(false);
  const { ref, visible } = useVisiblePlayback<HTMLElement>();
  const reduced = useMotionPreference();
  const prefix = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const running = playing && visible && !reduced && !interacting;
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setActive((value) => (value + 1) % steps.length),
      STEP_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [running, active]);
  const select = (index: number) => {
    setActive(index);
    setPlaying(false);
  };
  function keys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % steps.length
        : event.key === "ArrowLeft"
          ? (index + steps.length - 1) % steps.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? steps.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  }
  const stage = steps[active];
  return (
    <section
      className="builder-workbench build-journey"
      ref={ref}
      aria-labelledby={`${prefix}-title`}
      data-running={running}
      style={
        { "--journey-step-duration": `${STEP_DURATION_MS}ms` } as CSSProperties
      }
    >
      <header className="builder-workbench-heading">
        <div>
          <p className="classic-kicker">At the workbench</p>
          <h2 id={`${prefix}-title`}>How I build software.</h2>
        </div>
        <button
          className="journey-play"
          type="button"
          aria-label={
            playing && !reduced ? "Pause build process" : "Play build process"
          }
          aria-pressed={playing && !reduced}
          disabled={reduced}
          onClick={() => setPlaying((value) => !value)}
        >
          {playing && !reduced ? <Pause size={15} /> : <Play size={15} />}
          <span>
            {reduced ? "Explore each step" : playing ? "Pause" : "Play"}
          </span>
        </button>
      </header>
      <div
        className="journey-notebook"
        onFocusCapture={(event) =>
          setInteracting(event.target.matches(":focus-visible"))
        }
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setInteracting(false);
        }}
      >
        <div
          className="journey-timeline"
          role="tablist"
          aria-label="My build process"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <button
                key={step.short}
                type="button"
                role="tab"
                id={`${prefix}-step-${index}`}
                aria-controls={`${prefix}-panel`}
                aria-selected={active === index}
                tabIndex={active === index ? 0 : -1}
                ref={(el) => {
                  tabs.current[index] = el;
                }}
                onClick={() => select(index)}
                onKeyDown={(event) => keys(event, index)}
                data-past={index < active}
              >
                <span className="journey-step-icon">
                  <Icon size={21} />
                </span>
                <span>
                  <small>0{index + 1}</small>
                  {step.short}
                </span>
                <span className="journey-step-track">
                  <i key={`${active}-${playing}-${running}`} />
                </span>
              </button>
            );
          })}
        </div>
        <div
          className="journey-stage"
          id={`${prefix}-panel`}
          role="tabpanel"
          aria-labelledby={`${prefix}-step-${active}`}
          tabIndex={0}
        >
          <div className="journey-art">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduced ? false : { opacity: 0, y: 8, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -5 }}
                transition={{ duration: reduced ? 0 : 0.28 }}
              >
                <ProcessSketch stage={active} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="journey-copy" key={active}>
            <span className="journey-step-number">0{active + 1} / 05</span>
            <h3>{stage.title}</h3>
            <p className="journey-note">{stage.note}</p>
            <p>{stage.body}</p>
            <span className="journey-margin">{stage.margin}</span>
          </div>
        </div>
        <footer className="journey-footer">
          <span>
            <RotateCcw size={15} /> Small changes. Evidence at each step.
          </span>
          <button type="button" onClick={() => openProjects()}>
            Explore the projects <ArrowUpRight size={16} />
          </button>
        </footer>
      </div>
    </section>
  );
}
