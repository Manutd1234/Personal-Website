"use client";

import {
  ArrowUpRight,
  Blocks,
  Braces,
  Check,
  GitBranch,
  Lightbulb,
  Pause,
  Play,
  Rocket,
  RotateCcw,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useMotionPreference } from "./useMotionPreference";
import { useVisiblePlayback } from "./useVisiblePlayback";

const STEP_DURATION_MS = 6000;

const steps = [
  {
    title: "Frame the right problem.",
    short: "Frame",
    icon: Lightbulb,
    question: "What should become possible—and how will I know?",
    body: "I translate the user’s pain into a testable problem statement, then define the inputs, expected behaviour, non-goals and constraints before deciding what to build.",
    decisions: [
      "Acceptance criteria + failure cases",
      "Latency, cost and correctness constraints",
      "The smallest useful version",
    ],
    artifact: "A problem statement I can test.",
    scene: "Every build starts with a question.",
  },
  {
    title: "Choose tools with a reason.",
    short: "Stack",
    icon: Blocks,
    question: "What does this workload need from its tools?",
    body: "I compare the tradeoffs: typed interfaces, data integrity, model support and deployment effort. I prototype the uncertain part before committing to the stack.",
    decisions: [
      "TypeScript for the interface and contracts",
      "Python when the workload needs AI or data tools",
      "SQL when relationships and transactions matter",
    ],
    artifact: "A stack decision, with the tradeoffs written down.",
    scene: "Choose the right pieces for the job.",
  },
  {
    title: "Design the path through.",
    short: "Architect",
    icon: GitBranch,
    question: "Where does each responsibility—and failure—belong?",
    body: "I trace a request from the interface to storage and back, sketching service boundaries, API schemas and data ownership. Then I make the failure paths explicit.",
    decisions: [
      "Validate inputs and enforce permissions",
      "Define schemas, indexes and migrations",
      "Plan timeouts, retries and useful logs",
    ],
    artifact: "A system diagram and an API contract.",
    scene: "Connect the parts before adding the walls.",
  },
  {
    title: "Make one real path work.",
    short: "Code",
    icon: Braces,
    question: "Can a real action travel through the whole system?",
    body: "I implement a small vertical slice: interface, API, business logic and persistence. I keep changes reviewable, then expand the solution around a working end-to-end path.",
    decisions: [
      "Typed boundaries and focused modules",
      "Loading, empty and error states",
      "Small commits with a clear reason to exist",
    ],
    artifact: "Working software, one complete slice at a time.",
    scene: "A little code. A working connection.",
  },
  {
    title: "Prove it. Ship it. Observe it.",
    short: "Test & ship",
    icon: Rocket,
    question: "Does it survive real inputs and a real deployment?",
    body: "I test the logic, integration boundaries and user journey. CI gates the release; I smoke-test the deployment, then use errors and performance to guide the next change.",
    decisions: [
      "Unit → integration → browser tests",
      "Typecheck, test and production build in CI",
      "Deploy, verify, monitor; keep a rollback path",
    ],
    artifact: "A verified release—and the next useful question.",
    scene: "Test the build. Then let it take flight.",
  },
] as const;

/** Original vector artwork: a little builder assembling a software system. */
function BuilderScene({ stage }: { stage: number }) {
  return (
    <div className="journey-cartoon" data-scene={stage} aria-hidden="true">
      <div className="journey-scene-label">
        <span>THE BUILD, IN MOTION</span>
        <span>0{stage + 1} / 05</span>
      </div>
      <svg viewBox="0 0 560 380" fill="none" className="journey-scene-svg">
        <path
          d="M31 329H529"
          stroke="#a8b797"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse cx="113" cy="329" rx="64" ry="8" fill="#d5dfc8" />
        <ellipse cx="365" cy="329" rx="145" ry="9" fill="#d5dfc8" />
        <path
          d="M47 83h12m-6-6v12M496 120h10m-5-5v10M461 48h12m-6-6v12"
          stroke="#a4b98e"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="199" cy="69" r="3" fill="#d4bb77" />
        <circle cx="511" cy="241" r="3" fill="#a4b98e" />
        <g className="journey-scene-action" key={stage}>
          {stage === 0 ? (
            <>
              <path
                d="M259 294l-15 36m200-36 15 36"
                stroke="#516a53"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <rect
                x="219"
                y="86"
                width="266"
                height="212"
                rx="14"
                fill="#fffdf4"
                stroke="#688062"
                strokeWidth="2"
              />
              <rect
                x="235"
                y="103"
                width="235"
                height="34"
                rx="6"
                fill="#e6eddb"
              />
              <text x="250" y="125" className="scene-mono">
                problem-statement.md
              </text>
              <g className="scene-arrive scene-delay-one">
                <circle cx="247" cy="164" r="5" fill="#dfb857" />
                <text x="263" y="169" className="scene-label">
                  Who needs this?
                </text>
                <path
                  d="M263 181h159"
                  stroke="#d1d9c5"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
              <g className="scene-arrive scene-delay-two">
                <circle cx="247" cy="209" r="5" fill="#dfb857" />
                <text x="263" y="214" className="scene-label">
                  What must hold?
                </text>
                <path
                  d="M263 226h129"
                  stroke="#d1d9c5"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
              <g className="scene-arrive scene-delay-three">
                <path
                  d="m241 253 5 5 10-12"
                  stroke="#008363"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text x="263" y="257" className="scene-label">
                  Success = testable
                </text>
              </g>
              <g className="scene-thought">
                <path
                  d="M94 160c-17-1-29-12-29-27s13-29 32-28c8-19 39-18 49 0 20-2 34 9 34 26s-14 28-34 29H94Z"
                  fill="#fffdf4"
                  stroke="#a4b98e"
                  strokeWidth="2"
                />
                <text x="112" y="144" className="scene-question">
                  ?
                </text>
                <circle cx="108" cy="175" r="4" fill="#d1d9c5" />
              </g>
            </>
          ) : null}
          {stage === 1 ? (
            <>
              <path
                d="M225 305h268"
                stroke="#698261"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <g className="scene-arrive">
                <rect
                  x="240"
                  y="240"
                  width="237"
                  height="57"
                  rx="8"
                  fill="#dfc88b"
                  stroke="#71815c"
                  strokeWidth="2"
                />
                <text x="259" y="265" className="scene-label">
                  PostgreSQL
                </text>
                <text x="259" y="284" className="scene-mono">
                  relationships · transactions
                </text>
              </g>
              <g className="scene-stack scene-delay-one">
                <rect
                  x="257"
                  y="170"
                  width="220"
                  height="57"
                  rx="8"
                  fill="#bddcc7"
                  stroke="#71815c"
                  strokeWidth="2"
                />
                <text x="276" y="195" className="scene-label">
                  Python
                </text>
                <text x="276" y="214" className="scene-mono">
                  models · data · APIs
                </text>
              </g>
              <g className="scene-stack scene-delay-two">
                <rect
                  x="240"
                  y="100"
                  width="237"
                  height="57"
                  rx="8"
                  fill="#c9dce3"
                  stroke="#71815c"
                  strokeWidth="2"
                />
                <text x="259" y="125" className="scene-label">
                  TypeScript
                </text>
                <text x="259" y="144" className="scene-mono">
                  interface · typed contracts
                </text>
              </g>
              <g className="scene-arrive scene-delay-three">
                <path
                  d="M464 66c9-20 24-27 39-20-2 23-16 38-36 40"
                  fill="#d9e9bf"
                  stroke="#698261"
                  strokeWidth="2"
                />
                <path
                  d="m469 68 6 6 15-18"
                  stroke="#008363"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <path
                d="M160 173c22-28 43-31 68-29"
                stroke="#9cad8b"
                strokeWidth="2"
                strokeDasharray="4 6"
              />
              <path
                d="m218 136 10 8-11 5"
                stroke="#9cad8b"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          ) : null}
          {stage === 2 ? (
            <>
              <path
                className="scene-wire"
                d="M254 133h105v82h90M254 133v139h105"
                stroke="#88a67a"
                strokeWidth="3"
                strokeDasharray="6 6"
              />
              <g className="scene-arrive">
                <rect
                  x="195"
                  y="90"
                  width="124"
                  height="79"
                  rx="10"
                  fill="#fffdf4"
                  stroke="#688062"
                  strokeWidth="2"
                />
                <rect
                  x="205"
                  y="100"
                  width="104"
                  height="14"
                  rx="4"
                  fill="#dce9cd"
                />
                <text x="225" y="139" className="scene-label">
                  Client
                </text>
                <text x="218" y="157" className="scene-mono">
                  typed request
                </text>
              </g>
              <g className="scene-arrive scene-delay-one">
                <rect
                  x="387"
                  y="173"
                  width="120"
                  height="81"
                  rx="10"
                  fill="#e7d9b3"
                  stroke="#688062"
                  strokeWidth="2"
                />
                <text x="425" y="206" className="scene-label">
                  API
                </text>
                <text x="400" y="227" className="scene-mono">
                  validate · auth
                </text>
              </g>
              <g className="scene-arrive scene-delay-two">
                <path
                  d="M305 258v42c0 19 105 19 105 0v-42"
                  fill="#c8dfcb"
                  stroke="#688062"
                  strokeWidth="2"
                />
                <ellipse
                  cx="357.5"
                  cy="258"
                  rx="52.5"
                  ry="14"
                  fill="#e7efda"
                  stroke="#688062"
                  strokeWidth="2"
                />
                <text x="328" y="293" className="scene-label">
                  Store
                </text>
              </g>
              <g className="scene-arrive scene-delay-three">
                <rect
                  x="375"
                  y="69"
                  width="126"
                  height="42"
                  rx="10"
                  fill="#fffdf4"
                  stroke="#b1c09c"
                  strokeWidth="2"
                />
                <text x="390" y="95" className="scene-mono">
                  explicit errors
                </text>
              </g>
              <circle
                className="scene-packet"
                cx="359"
                cy="133"
                r="6"
                fill="#008363"
              />
            </>
          ) : null}
          {stage === 3 ? (
            <>
              <path
                d="M245 312h234"
                stroke="#698261"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <rect
                x="206"
                y="85"
                width="295"
                height="211"
                rx="12"
                fill="#224b3d"
                stroke="#688062"
                strokeWidth="2"
              />
              <path d="M207 119h293" stroke="#61816a" strokeWidth="1.5" />
              <circle cx="224" cy="102" r="4" fill="#dfb857" />
              <circle cx="237" cy="102" r="4" fill="#9dc898" />
              <circle cx="250" cy="102" r="4" fill="#bfdbb6" />
              <text x="307" y="106" className="scene-mono scene-code-muted">
                one-complete-path.ts
              </text>
              <g className="scene-code-line">
                <text x="226" y="151" className="scene-code">
                  const input = validate(req);
                </text>
              </g>
              <g className="scene-code-line scene-delay-one">
                <text x="226" y="181" className="scene-code">
                  await checkAccess(user);
                </text>
              </g>
              <g className="scene-code-line scene-delay-two">
                <text x="226" y="211" className="scene-code">
                  const row = await save(input);
                </text>
              </g>
              <g className="scene-code-line scene-delay-three">
                <text x="226" y="241" className="scene-code">
                  return respond(row);
                </text>
                <rect
                  className="scene-cursor"
                  x="432"
                  y="229"
                  width="7"
                  height="15"
                  fill="#d9e9bf"
                />
              </g>
              <g className="scene-arrive scene-delay-three">
                <rect
                  x="273"
                  y="268"
                  width="166"
                  height="39"
                  rx="8"
                  fill="#e7efda"
                  stroke="#688062"
                  strokeWidth="2"
                />
                <path
                  d="m287 286 5 5 10-12"
                  stroke="#008363"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text x="312" y="292" className="scene-mono">
                  UI → API → data
                </text>
              </g>
            </>
          ) : null}
          {stage === 4 ? (
            <>
              <rect
                x="196"
                y="163"
                width="202"
                height="147"
                rx="12"
                fill="#fffdf4"
                stroke="#688062"
                strokeWidth="2"
              />
              <path d="M196 195h202" stroke="#ced8bd" strokeWidth="2" />
              <text x="213" y="184" className="scene-mono">
                release-checks.yml
              </text>
              {["unit + integration", "browser flow", "production build"].map(
                (label, index) => (
                  <g
                    key={label}
                    className={`scene-arrive scene-delay-${["one", "two", "three"][index]}`}
                  >
                    <circle
                      cx="218"
                      cy={216 + index * 34}
                      r="9"
                      fill="#dce9cd"
                    />
                    <path
                      d={`m213 ${216 + index * 34} 4 4 7-8`}
                      stroke="#008363"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text x="238" y={221 + index * 34} className="scene-mono">
                      {label}
                    </text>
                  </g>
                ),
              )}
              <g className="scene-rocket">
                <path
                  d="M424 192c-23-35-16-88 18-119 34 31 41 84 18 119Z"
                  fill="#fffdf4"
                  stroke="#557455"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M423 163c-20 6-26 22-24 43l25-14m36-29c20 6 26 22 24 43l-25-14"
                  fill="#b9d8bf"
                  stroke="#557455"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path d="M424 101q18-21 36 0l-18-28Z" fill="#008363" />
                <circle
                  cx="442"
                  cy="137"
                  r="13"
                  fill="#d7e5ef"
                  stroke="#557455"
                  strokeWidth="2"
                />
                <path
                  className="scene-flame"
                  d="M430 193q-5 24 12 41 17-17 12-41"
                  fill="#dfb857"
                />
                <path d="M431 187h22v10h-22z" fill="#557455" />
              </g>
              <g className="scene-arrive scene-delay-three">
                <rect
                  x="409"
                  y="272"
                  width="87"
                  height="32"
                  rx="16"
                  fill="#dce9cd"
                />
                <circle cx="426" cy="288" r="4" fill="#008363" />
                <text x="438" y="293" className="scene-mono">
                  deployed
                </text>
              </g>
            </>
          ) : null}
        </g>
        <g className="scene-builder">
          <path
            d="M84 300v24H70m65-24v24h14"
            stroke="#46664e"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="71"
            y="242"
            width="80"
            height="65"
            rx="19"
            fill="#008363"
            stroke="#355c43"
            strokeWidth="2"
          />
          <path d="M91 243v43h40v-43" stroke="#d7e6b8" strokeWidth="3" />
          <rect x="99" y="264" width="25" height="16" rx="4" fill="#c9dcad" />
          <path
            d="m106 270-4 3 4 3m11-6 4 3-4 3"
            stroke="#355c43"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m73 254-15 27 14 8"
            stroke="#8da77e"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g className="scene-builder-arm">
            <path
              d="m148 254 23-15 8-21"
              stroke="#8da77e"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m174 219 8-18"
              stroke="#dfb857"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="m180 203 4-8"
              stroke="#46664e"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
          <rect
            x="77"
            y="193"
            width="69"
            height="53"
            rx="17"
            fill="#e4eccc"
            stroke="#557455"
            strokeWidth="2"
          />
          <g className="scene-builder-eyes">
            <circle cx="98" cy="218" r="4" fill="#355c43" />
            <circle cx="127" cy="218" r="4" fill="#355c43" />
          </g>
          <path
            d="M105 231q8 6 15-1"
            stroke="#557455"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M74 198c0-21 13-34 37-34s37 13 37 34"
            fill="#dfb857"
            stroke="#89793f"
            strokeWidth="2"
          />
          <path
            d="M105 167v22m12-22v22"
            stroke="#b99b49"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M68 199h87"
            stroke="#89793f"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
        <path
          d="M36 326v-28m0 16c-17-4-17-17-17-17 16 0 17 17 17 17m0-7c15-5 15-18 15-18-15 3-15 18-15 18"
          stroke="#8da77e"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <p className="journey-scene-caption">{steps[stage].scene}</p>
    </div>
  );
}

function StageCopy({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  return (
    <>
      <span className="journey-step-number">CHAPTER 0{index + 1}</span>
      <h3>{step.title}</h3>
      <p className="journey-question">{step.question}</p>
      <p className="journey-body">{step.body}</p>
      <ul className="journey-decisions">
        {step.decisions.map((decision) => (
          <li key={decision}>
            <Check size={14} aria-hidden="true" />
            <span>{decision}</span>
          </li>
        ))}
      </ul>
      <p className="journey-artifact">
        <span>TAKEAWAY</span>
        {step.artifact}
      </p>
    </>
  );
}

export default function BuildJourney({
  openProjects,
}: {
  openProjects: (title?: string) => void;
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const { ref, visible } = useVisiblePlayback<HTMLElement>();
  const reduced = useMotionPreference();
  const prefix = useId();
  const running = playing && visible && !reduced;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setActive((value) => (value + 1) % steps.length),
      STEP_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [running, active]);

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
          <h2 id={`${prefix}-title`}>From a question to a working system.</h2>
        </div>
        {!reduced ? (
          <button
            className="journey-play"
            type="button"
            aria-label={
              playing ? "Pause build animation" : "Play build animation"
            }
            aria-pressed={playing}
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
            <span>{playing ? "Pause" : "Play"}</span>
          </button>
        ) : null}
      </header>
      <div className="journey-notebook">
        <ol
          className="journey-chapters"
          aria-label="The five stages of my build process"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.short}
                aria-current={!reduced && active === index ? "step" : undefined}
                data-active={!reduced && active === index}
              >
                <span className="journey-step-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span>
                  <small>0{index + 1}</small>
                  {step.short}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="journey-stage" aria-hidden="true">
          <BuilderScene stage={active} />
          <div className="journey-copy" key={active}>
            <StageCopy step={steps[active]} index={active} />
          </div>
        </div>
        <ol
          className="journey-transcript"
          aria-label="How I take an idea into production"
        >
          {steps.map((step, index) => (
            <li key={step.short}>
              <StageCopy step={step} index={index} />
            </li>
          ))}
        </ol>
        <footer className="journey-footer">
          <span>
            <RotateCcw size={15} aria-hidden="true" />
            Build. Learn. Make the next version better.
          </span>
          <button type="button" onClick={() => openProjects()}>
            Explore the projects <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </footer>
      </div>
    </section>
  );
}
