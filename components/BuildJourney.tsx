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
    body: "I start with the user, the friction and the outcome. I make success measurable, name the constraints and keep the first version small enough to prove the idea.",
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
    body: "I work backwards from the workload: data shape, latency, correctness and deployment. I compare the tradeoffs, then prototype the riskiest dependency before committing.",
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
    body: "I follow a request from the interface to storage and back. I sketch the boundaries, define the contracts and ask what happens when each dependency fails.",
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
    body: "I connect the interface, API, logic and storage in one working slice. Small, reviewable changes give me something real to exercise before I expand the solution.",
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
    body: "I test the logic, the boundaries and the complete user journey. CI checks the release; a smoke test checks deployment. Errors, latency and feedback shape the next iteration.",
    decisions: [
      "Unit → integration → browser tests",
      "Typecheck, test and production build in CI",
      "Deploy, verify, monitor; keep a rollback path",
    ],
    artifact: "A verified release—and the next useful question.",
    scene: "Test the build. Then let it take flight.",
  },
] as const;

/** Original vector studio scene; all motion is CSS and stops with playback. */
function BuilderScene({ stage }: { stage: number }) {
  const artId = useId();
  return (
    <div className="journey-cartoon" data-scene={stage} aria-hidden="true">
      <div className="journey-scene-label">
        <span>At the workbench</span>
        <span>{steps[stage].short}</span>
      </div>
      <svg viewBox="0 0 560 410" fill="none" className="journey-scene-svg">
        <defs>
          <linearGradient id={`${artId}-wall`} x1="64" y1="34" x2="476" y2="349" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fbfaf1" /><stop offset="1" stopColor="#e1e8d8" />
          </linearGradient>
          <linearGradient id={`${artId}-skin`} x1="190" y1="113" x2="246" y2="167" gradientUnits="userSpaceOnUse">
            <stop stopColor="#edc3a1" /><stop offset="1" stopColor="#c58f70" />
          </linearGradient>
          <linearGradient id={`${artId}-shirt`} x1="181" y1="187" x2="249" y2="271" gradientUnits="userSpaceOnUse">
            <stop stopColor="#829b89" /><stop offset="1" stopColor="#416756" />
          </linearGradient>
          <linearGradient id={`${artId}-metal`} x1="348" y1="273" x2="352" y2="297" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d6ded6" /><stop offset="1" stopColor="#8c9f94" />
          </linearGradient>
          <clipPath id={`${artId}-screen`}><rect x="307" y="135" width="201" height="130" rx="4" /></clipPath>
        </defs>
        {/* A quiet room gives the work a real setting and a consistent light source. */}
        <path d="M34 33h491v319H34z" fill={`url(#${artId}-wall)`} />
        <path d="M34 352h491" stroke="#bbc9b2" strokeWidth="2" />
        <path d="M53 352 230 139h88L157 352Z" fill="#fffdf3" opacity=".42" />
        <rect x="54" y="56" width="107" height="150" rx="5" fill="#d2ded3" stroke="#b7c9b6" strokeWidth="2" />
        <rect x="61" y="63" width="93" height="136" rx="2" fill="#e9f1e9" />
        <path d="M62 165c26-31 48-19 92-51v85H62Z" fill="#d0dfcb" />
        <path d="M107 63v136M61 126h93" stroke="#fafaf1" strokeWidth="5" />
        <path d="M50 206h115" stroke="#a8bca6" strokeWidth="6" strokeLinecap="round" />
        <path d="M352 72h151" stroke="#95aa91" strokeWidth="5" strokeLinecap="round" />
        <path d="M363 72V45h11v27m5 0V39h11v33m6 0V48h8v24" fill="#b0c1a6" stroke="#8a9e7f" />
        <rect x="412" y="39" width="30" height="28" rx="2" fill="#f6f5e9" stroke="#b5c1a8" />
        <path d="m418 58 6-8 6 5 6-10" stroke="#87a284" strokeWidth="2" strokeLinecap="round" />
        <path d="M476 48v-9m0 5c-12 0-17-9-17-9 12-4 17 9 17 9m0-2c11-3 15-16 15-16-14 0-15 16-15 16" stroke="#6e8e6d" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M464 48h24l-4 24h-16Z" fill="#bdad8c" />
        <ellipse cx="280" cy="382" rx="211" ry="10" fill="#bccbb3" opacity=".36" />
        {/* Chair, bent legs and weighted feet establish a believable seated posture. */}
        <g className="studio-chair">
          <path d="M157 187c-13 1-20 13-17 29l10 65h45l-11-76c-2-14-11-20-27-18Z" fill="#304c43" />
          <path d="M148 201c-6 13 3 61 7 69" stroke="#547565" strokeWidth="3" strokeLinecap="round" />
          <path d="M151 282h90" stroke="#314d42" strokeWidth="13" strokeLinecap="round" />
          <path d="M187 289v65m-37 16 37-16 39 16" stroke="#6d8273" strokeWidth="7" strokeLinecap="round" />
          <path d="M187 354v19" stroke="#6d8273" strokeWidth="6" />
          <circle cx="149" cy="374" r="6" fill="#344e43" /><circle cx="188" cy="376" r="6" fill="#344e43" /><circle cx="228" cy="374" r="6" fill="#344e43" />
        </g>
        <path d="M191 260c13 1 26 5 40 18l13 28-25 56-20-5 17-50-31-17Z" fill="#455d63" />
        <path d="M216 264c20 0 43 7 64 22 7 5 9 13 4 23l-26 56-22-7 21-55-38-11c-17-5-25-13-27-24Z" fill="#587077" />
        <path d="m223 281 41 16-21 52m-25-43 12 6" stroke="#789093" strokeWidth="2" strokeLinecap="round" />
        <path d="m201 353 19 6-3 15h-28c-5-1-6-5-2-8Z" fill="#e6e8dc" stroke="#7f9185" strokeWidth="1.5" />
        <path d="m238 355 21 6 21 8c6 2 7 8 2 10h-46c-5-1-5-5-3-9Z" fill="#e6e8dc" stroke="#7f9185" strokeWidth="1.5" />
        <path d="M188 374h29m18 3h49m-31-13-5 4m11-2-5 4" stroke="#7f9185" strokeWidth="1.5" strokeLinecap="round" />
        {/* Desk, notebook and mug sit on a single plane beneath the laptop. */}
        <path d="M134 294h387l-7 13H140Z" fill="#b7aa8b" />
        <path d="M146 307h11l-9 73h-9Zm346 0h11l13 73h-9Z" fill="#72836f" />
        <path d="M151 307h345" stroke="#a09479" strokeWidth="3" />
        <path d="m429 281 63 2-12 10-65-2Z" fill="#f9f5e9" stroke="#b9c0a9" />
        <path d="m439 285 39 1m-43 3 30 1" stroke="#acb8a2" strokeWidth="1.2" />
        <path d="m470 278 28 3" stroke="#45745f" strokeWidth="3" strokeLinecap="round" />
        <path d="M483 257h22v26c-4 6-18 6-22 0Z" fill="#e6dfc6" stroke="#a5aa8e" strokeWidth="1.5" />
        <path d="M505 262c15-2 14 17 0 16" stroke="#a5aa8e" strokeWidth="3" />
        <g className="studio-steam" stroke="#9bac91" strokeWidth="1.4" strokeLinecap="round"><path d="M490 250c-7-9 6-10 1-20" /><path d="M498 248c-5-7 6-10 1-17" /></g>
        {/* The body has a slight breathing cycle; the head glances between screen and keys. */}
        <g className="studio-person">
          <path d="m211 159-3 22 20 11 12-13-12-24Z" fill="#cf9b7b" />
          <path d="m208 177 14 7 15-8 10 25-24 57-27-53Z" fill="#ece9da" />
          <path d="M207 177c-18-1-29 10-32 34l-5 54c16 15 47 13 69 6l9-62c1-17-7-29-19-33l-7 34Z" fill={`url(#${artId}-shirt)`} />
          <path d="m206 179-11 19 13 9 14-23m7-7 13 21-11 9-9-23m-3 29-4 49m-32-15-5 16m53-42-4 26" stroke="#395e4b" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M186 211h15v18h-15z" stroke="#b4c2a6" strokeWidth="1.3" />
          <circle cx="218" cy="224" r="1.5" fill="#c1ceb4" /><circle cx="216" cy="243" r="1.5" fill="#c1ceb4" />
          <g className="studio-head">
            <path d="M191 126c-6-31 39-43 52-17l-2 24 7 13-9 4c1 12-4 21-15 22-14-1-27-11-29-25Z" fill={`url(#${artId}-skin)`} />
            <path d="M238 151c-4 0-7-1-10-2m8 9-8 1" stroke="#9c6d55" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M190 141c-12-8-14-26-7-40 4-10 15-17 30-15 14-3 27 5 31 16 2 8 0 15-3 19l-6-15c-10 4-21 2-28-1-1 12-8 19-17 24Z" fill="#293b35" />
            <path d="M188 104c10-13 23-15 38-9m-31 14c9-7 18-9 28-7" stroke="#53614e" strokeWidth="2" strokeLinecap="round" />
            <path d="M198 132c-2-9-13-10-14-1-1 8 5 15 12 12" fill="#dba987" />
            <path d="M191 129c-4 1-3 7 1 8" stroke="#aa775c" strokeWidth="1.4" strokeLinecap="round" />
            <path d="m227 121 10 1" stroke="#3d4134" strokeWidth="2.2" strokeLinecap="round" />
            <g className="studio-eyes"><path d="m230 128 6 1" stroke="#373d33" strokeWidth="2.5" strokeLinecap="round" /></g>
            <path d="m237 131 1 9-4 1" stroke="#b17f62" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M200 157c4 5 9 8 15 10" stroke="#ba8b6f" strokeWidth="1.3" strokeLinecap="round" />
          </g>
          {/* Far forearm rests lower; nearer sleeve and wrist reach the keyboard. */}
          <path d="M200 204c-4 15 5 37 20 47l54 25 7-12-45-28-16-37" fill="#6c8876" />
          <path d="m269 261 17 8 11-1 8 4-3 8-18 1-15-7Z" fill="#ce9c7e" />
          <path d="M238 193c-13-1-17 12-12 25l19 32 24 7 6-17-16-9-7-25c-3-9-7-13-14-13Z" fill="#87a08b" />
          <path d="m245 243 24 9m-36-45 6 25" stroke="#4e715b" strokeWidth="1.6" strokeLinecap="round" />
          <path d="m270 246 25 15 16 7-5 12-20-7-23-13Z" fill="#e1b28e" />
          <path d="m267 248 6 3-6 12-6-3Z" fill="#35564c" /><path d="m267 252 3 2-3 6-3-2Z" fill="#d1dcce" />
        </g>
        {/* The laptop scales around the resting wrists, with a readable screen
            and enough desk space for the notebook and mug. */}
        <g transform="translate(300 285) scale(.82) translate(-300 -285)">
        <rect x="299" y="125" width="217" height="149" rx="8" fill="#53695f" />
        <rect x="302" y="128" width="211" height="141" rx="6" fill="#253e35" />
        <circle cx="407" cy="131" r="1.5" fill="#7c9486" />
        <g clipPath={`url(#${artId}-screen)`}>
          <rect x="307" y="135" width="201" height="130" fill="#183d31" />
          <path d="M307 153h201" stroke="#3a5f4c" />
          <circle cx="317" cy="144" r="2" fill="#d4b771" /><circle cx="325" cy="144" r="2" fill="#7cae8a" /><circle cx="333" cy="144" r="2" fill="#afcba0" />
          {steps.map((step, sceneIndex) => (
            <g className="journey-scene-action" key={step.short} data-active={stage === sceneIndex}>
              <text x="344" y="147" className="studio-screen-file">{["brief.md", "stack.config", "request-flow", "feature.ts", "release.yml"][sceneIndex]}</text>
              {sceneIndex === 0 ? <>
                <text x="319" y="173" className="studio-screen-heading">Start with the user.</text>
                {["Understand the friction", "Define the smallest version", "Agree how to measure success"].map((label, i) => <g key={label} className={`scene-arrive scene-delay-${["one", "two", "three"][i]}`}>
                  <rect x="319" y={185 + i * 23} width="7" height="7" rx="1.5" stroke="#a8c6a2" /><path d={`m320 ${188 + i * 23} 2 2 4-5`} stroke="#b9dca5" strokeWidth="1.1" />
                  <text x="333" y={192 + i * 23} className="studio-screen-label">{label}</text>
                </g>)}
              </> : null}
              {sceneIndex === 1 ? <>
                <text x="319" y="172" className="studio-screen-heading">Tools for the workload</text>
                {[["TS", "Interface + contracts"], ["Py", "Models + data"], ["SQL", "Storage + transactions"]].map(([tool, label], i) => <g key={tool} className={`scene-arrive scene-delay-${["one", "two", "three"][i]}`}>
                  <rect x="318" y={181 + i * 25} width="27" height="19" rx="4" fill={["#b7d1d4", "#c2d5a7", "#deca94"][i]} /><text x="331.5" y={194 + i * 25} textAnchor="middle" className="studio-tool-label">{tool}</text>
                  <text x="353" y={194 + i * 25} className="studio-screen-label">{label}</text>
                </g>)}
              </> : null}
              {sceneIndex === 2 ? <>
                <text x="319" y="172" className="studio-screen-heading">One request, end to end</text>
                <path className="scene-wire" d="M358 202h20m45 0h20M466 217v22H337v-22" stroke="#8cae8e" strokeWidth="1.6" strokeDasharray="3 3" />
                {[["UI", 317], ["API", 382], ["Data", 447]].map(([label, x], i) => <g key={label} className={`scene-arrive scene-delay-${["one", "two", "three"][i]}`}>
                  <rect x={x} y="187" width="39" height="30" rx="5" fill="#d2dfc3" /><text x={Number(x) + 19.5} y="206" className="studio-tool-label" textAnchor="middle">{label}</text>
                </g>)}
                <circle className="studio-packet" cx="358" cy="202" r="3" fill="#e7c778" />
                <text x="354" y="254" className="studio-screen-note">validate · authorize · observe</text>
              </> : null}
              {sceneIndex === 3 ? <>
                {["const input = validate(req);", "await authorize(user);", "const row = await save(input);", "return respond(row);"].map((line, i) => <g key={line} className={`scene-code-line scene-delay-${["zero", "one", "two", "three"][i]}`}>
                  <text x="314" y={176 + i * 20} className="studio-line-number">{i + 1}</text><text x="326" y={176 + i * 20} className="studio-screen-code">{line}</text>
                </g>)}
                <rect className="scene-cursor" x="438" y="229" width="4" height="9" fill="#d2e2b5" />
                <text x="319" y="254" className="studio-screen-note">UI → API → data</text>
              </> : null}
              {sceneIndex === 4 ? <>
                {["Unit + integration", "Browser journey", "Production build"].map((label, i) => <g key={label} className={`scene-arrive scene-delay-${["one", "two", "three"][i]}`}>
                  <path d={`m319 ${169 + i * 23} 3 3 6-7`} stroke="#badb98" strokeWidth="1.5" strokeLinecap="round" /><text x="336" y={172 + i * 23} className="studio-screen-label">{label}</text><text x="475" y={172 + i * 23} className="studio-screen-note">PASS</text>
                </g>)}
                <g className="scene-arrive scene-delay-three"><rect x="319" y="236" width="177" height="18" rx="4" fill="#b9d4a5" /><circle className="studio-live-dot" cx="331" cy="245" r="3" fill="#327351" /><text x="341" y="248" className="studio-tool-label">Deployed · monitoring</text></g>
              </> : null}
            </g>
          ))}
          <path d="m487 135-56 130h26l51-119v-11Z" fill="#eff9e9" opacity=".025" />
        </g>
        <path d="M299 274h217l13 16c0 4-3 6-8 6H275c-5 0-8-2-8-5Z" fill={`url(#${artId}-metal)`} stroke="#84998b" strokeWidth="1" />
        <path d="m305 277 199 1 8 8H294Z" fill="#50685e" />
        {[0, 1, 2].map((row) => <path key={row} d={`M${303 - row * 3} ${279 + row * 2.2}h${200 + row * 4}`} stroke="#b4c2b5" strokeWidth=".6" />)}
        {Array.from({ length: 18 }, (_, i) => <path key={i} d={`m${307 + i * 10.7} 278-3 8`} stroke="#b4c2b5" strokeWidth=".6" />)}
        <path d="M374 288h48l5 4h-57Z" stroke="#859c8e" strokeWidth=".8" />
        <path d="M270 292h255" stroke="#e8eee3" strokeWidth="1.2" />
        </g>
        {/* Each wrist and finger moves independently, with alternating key presses. */}
        <g className="studio-hand studio-hand-far">
          <path d="m281 267 12-1 12 4 6 6-4 2-9-5-9 4-11-5Z" fill="#d3a181" stroke="#ad7d63" strokeWidth=".8" />
          <path className="studio-finger" d="m296 270 8 2 5 5" stroke="#d3a181" strokeWidth="3" strokeLinecap="round" />
          <path className="studio-finger studio-finger-two" d="m291 272 8 3 3 4" stroke="#d3a181" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g className="studio-hand studio-hand-near">
          <path d="m303 267 14 1 8 6-2 5-12-2-9 3-5-8Z" fill="#e3b491" stroke="#b58568" strokeWidth=".8" />
          <path className="studio-finger" d="m316 271 11 3 5 6" stroke="#e3b491" strokeWidth="3.4" strokeLinecap="round" />
          <path className="studio-finger studio-finger-two" d="m312 275 11 3 3 4" stroke="#e3b491" strokeWidth="3.3" strokeLinecap="round" />
          <path className="studio-finger studio-finger-three" d="m307 277 9 3 3 3" stroke="#dba988" strokeWidth="3" strokeLinecap="round" />
          <path d="m302 272 8 2" stroke="#edc2a1" strokeWidth="1.2" strokeLinecap="round" />
        </g>
        <path d="M282 297h43" stroke="#ab9d7f" strokeWidth="1.2" opacity=".6" />
        <path d="M438 307v48c0 12 12 13 12 27" stroke="#81937d" strokeWidth="1.5" />
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
      <span className="journey-step-number">Chapter 0{index + 1}</span>
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
        <span>What I leave with</span>
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
  const [settledChapter, setSettledChapter] = useState<number | null>(null);
  const { ref, visible } = useVisiblePlayback<HTMLElement>();
  const reduced = useMotionPreference();
  const prefix = useId();
  const running = playing && visible && !reduced;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setSettledChapter(null);
      setActive((value) => (value + 1) % steps.length);
    }, STEP_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [running, active]);

  return (
    <section
      className="builder-workbench build-journey"
      ref={ref}
      aria-labelledby={`${prefix}-title`}
      data-running={running}
      data-reduced={reduced}
      data-entrance={settledChapter !== active}
    >
      <header className="builder-workbench-heading">
        <div>
          <p className="classic-kicker">How I build</p>
          <h2 id={`${prefix}-title`}>
            From a question to a <em>working system.</em>
          </h2>
        </div>
        {!reduced ? (
          <button
            className="journey-play"
            type="button"
            aria-label={
              playing ? "Pause build animation" : "Play build animation"
            }
            aria-pressed={playing}
            onClick={() => {
              if (playing) setSettledChapter(active);
              setPlaying((value) => !value);
            }}
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
          <div className="journey-copy-stack">
            {steps.map((step, index) => (
              <div
                className="journey-copy"
                key={step.short}
                data-active={index === active}
              >
                <StageCopy step={step} index={index} />
              </div>
            ))}
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
          <button type="button" onClick={() => openProjects()}>
            Explore the projects <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </footer>
      </div>
    </section>
  );
}
