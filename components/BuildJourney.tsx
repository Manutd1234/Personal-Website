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
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useMotionPreference } from "./useMotionPreference";
import { useVisiblePlayback } from "./useVisiblePlayback";

const steps = [
  {
    title: "Find the question",
    short: "Question",
    icon: Lightbulb,
    note: "What would actually help?",
    body: "Start with the person and the problem. Write down what matters, what is missing, and what a useful answer would look like.",
    margin: "A good question earns its space.",
  },
  {
    title: "Make it visible",
    short: "Sketch",
    icon: Pencil,
    note: "Before the code, a rough sketch.",
    body: "Map the moving parts. Trace the data, sketch the interface, and decide what the smallest useful version needs to do.",
    margin: "Boxes. Arrows. A few crossed-out ideas.",
  },
  {
    title: "Build a small version",
    short: "Build",
    icon: Code2,
    note: "One working path, end to end.",
    body: "Connect the pieces early. Get a real input through the system before adding the extras, then make the code easier to change.",
    margin: "Something real to try.",
  },
  {
    title: "Try to break it",
    short: "Test",
    icon: FlaskConical,
    note: "What happens at the edges?",
    body: "Check the assumptions against actual results. Test the awkward inputs, look at the failures, and measure what improved.",
    margin: "The interesting bits are often in the failures.",
  },
  {
    title: "Refine, then repeat",
    short: "Refine",
    icon: Send,
    note: "Make it useful. Make it clear.",
    body: "Trim what gets in the way, polish the details, and put it in someone’s hands. Their feedback becomes the next question.",
    margin: "There is always another draft.",
  },
] as const;

function ProcessSketch({ stage }: { stage: number }) {
  return (
    <div className="journey-sketch" data-stage={stage} aria-hidden="true">
      <div className="journey-sheet-label">
        <span>FIELD NOTES</span>
        <span>0{stage + 1} / 05</span>
      </div>
      {stage === 0 ? (
        <div className="sketch-question">
          <span className="sketch-pencil">who is this for?</span>
          <strong>
            What if
            <br />
            we could…
          </strong>
          <span className="sketch-underline" />
          <div className="sketch-check">
            <Check size={16} /> a useful starting point
          </div>
        </div>
      ) : null}
      {stage === 1 ? (
        <div className="sketch-map">
          <span className="sketch-pencil">follow the idea</span>
          <div>
            <span>input</span>
            <b>→</b>
            <span>
              make sense
              <br />
              of it
            </span>
            <b>→</b>
            <span>
              something
              <br />
              useful
            </span>
          </div>
          <svg viewBox="0 0 360 60">
            <path d="M292 5 Q320 46 170 44 Q45 45 52 6" />
            <path d="M44 17 L52 6 L63 17" />
          </svg>
          <small>leave room to change your mind</small>
        </div>
      ) : null}
      {stage === 2 ? (
        <div className="sketch-code">
          <div>
            <i />
            <i />
            <i />
            <span>first-draft.ts</span>
          </div>
          <pre>
            <span>// a small, working version</span>
            {"\n"}
            <b>const</b> input = read();{"\n"}
            <b>const</b> result = build(input);{"\n\n"}show(result);<em>▍</em>
          </pre>
          <span className="sketch-check">
            <Check size={16} /> one complete path
          </span>
        </div>
      ) : null}
      {stage === 3 ? (
        <div className="sketch-tests">
          <span className="sketch-pencil">does it hold up?</span>
          {["the ordinary case", "the missing input", "the unexpected bit"].map(
            (label, i) => (
              <div key={label} style={{ animationDelay: `${i * 180}ms` }}>
                <Check size={18} />
                <span>{label}</span>
                <small>checked</small>
              </div>
            ),
          )}
          <svg viewBox="0 0 320 60">
            <path d="M7 49 L55 39 L89 44 L138 25 L174 29 L222 17 L263 20 L312 5" />
          </svg>
        </div>
      ) : null}
      {stage === 4 ? (
        <div className="sketch-finish">
          <div className="sketch-browser">
            <div>
              <i />
              <i />
              <i />
              <span>the next draft</span>
            </div>
            <span className="sketch-browser-title">Made to be used.</span>
            <div className="sketch-browser-line" />
            <div className="sketch-browser-line short" />
            <span className="sketch-browser-button">Give it a try ↗</span>
          </div>
          <span className="sketch-pencil">listen · adjust · repeat ↺</span>
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
      6500,
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
    >
      <header className="builder-workbench-heading">
        <div>
          <p className="classic-kicker">How I think</p>
          <h2 id={`${prefix}-title`}>From a question to a working thing.</h2>
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
            <RotateCcw size={15} /> A process I keep coming back to.
          </span>
          <button type="button" onClick={() => openProjects()}>
            See what came out of it <ArrowUpRight size={16} />
          </button>
        </footer>
      </div>
    </section>
  );
}
