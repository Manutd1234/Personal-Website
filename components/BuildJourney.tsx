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
import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import { useMotionPreference } from "./useMotionPreference";
import { useVisiblePlayback } from "./useVisiblePlayback";
import { type BuilderArm, sampleBuilderChoreography } from "./builder-choreography";

const STEP_DURATION_MS = 7500;

const steps = [
  {
    title: "Define correctness before code.",
    short: "Specify",
    icon: Lightbulb,
    question: "What must stay true for this system to be useful and correct?",
    body: "I start with the user action and the guarantees the system needs to make. I turn examples into acceptance criteria, name the invariants—rules that must stay true—and define what should happen with bad input, missing data or a failed dependency.",
    decisions: [
      "Acceptance criteria, edge cases and failure cases",
      "Data integrity, latency, cost and access constraints",
      "A first version scoped around the main risks",
    ],
    artifact: "A problem statement with behavior I can test.",
    scene: "Clear requirements. Testable behavior.",
  },
  {
    title: "Choose the stack around the workload.",
    short: "Stack",
    icon: Blocks,
    question: "Which choices reduce risk without adding needless complexity?",
    body: "I compare the data shape, compute needs, latency and deployment constraints before choosing tools. I weigh development speed against operating cost and maintenance, then prototype the riskiest integration. A simple baseline helps show whether extra complexity earns its place.",
    decisions: [
      "Workload → language, storage and deployment",
      "Speed, resource use and maintenance tradeoffs",
      "A prototype to test the riskiest dependency",
    ],
    artifact: "An explained stack choice, with its tradeoffs.",
    scene: "Choose the tools. Explain the tradeoffs.",
  },
  {
    title: "Make boundaries and ownership explicit.",
    short: "Architect",
    icon: GitBranch,
    question: "Who owns each decision, each record and each failure?",
    body: "I trace a request from the UI through the API and domain logic to stored data. I define request and response contracts, who owns each piece of state and where permissions are enforced. Invalid input, missing records and failed dependencies need deliberate responses.",
    decisions: [
      "Typed contracts and focused domain responsibilities",
      "Schemas, data ownership and authorization",
      "Explicit error responses and recovery paths",
    ],
    artifact: "An architecture with clear contracts and failure behavior.",
    scene: "Connect the parts. Define the contracts.",
  },
  {
    title: "Build one verified vertical slice.",
    short: "Implement",
    icon: Braces,
    question: "Can a real action travel from input to a reliable result?",
    body: "I implement one complete path before expanding: validate the input, apply the rules and persist the result. I model loading, empty and error states explicitly. When something fails, I reproduce it, trace the data across layers and make a small, reviewable fix.",
    decisions: [
      "Input validation → domain logic → persistence",
      "Explicit async state and reproducible debugging",
      "Small commits with a clear reason to exist",
    ],
    artifact: "An end-to-end feature with behavior I can explain.",
    scene: "One complete path, checked at the boundaries.",
  },
  {
    title: "Test, release and close the loop.",
    short: "Ship & learn",
    icon: Rocket,
    question: "What evidence says this release works, and what happens next?",
    body: "I test the domain logic, the boundaries and the complete user journey. CI checks catch regressions and build failures before deployment. After release, I verify the critical path and inspect errors, logs and performance. Feedback becomes the next test or improvement.",
    decisions: [
      "Unit, integration and browser regression tests",
      "CI checks, deployment and a smoke test",
      "Logs, performance signals and user feedback",
    ],
    artifact: "A checked release and evidence for the next iteration.",
    scene: "Test. Deploy. Observe. Improve.",
  },
] as const;

/** Rounded, tapered silhouettes keep the elbow and sleeve joined at every pose. */
function armArtwork({ shoulder: s, elbow: e, hand: h }: BuilderArm) {
  const upper = [(e[0] - s[0]) / 44, (e[1] - s[1]) / 44];
  const fore = [(h[0] - e[0]) / 46, (h[1] - e[1]) / 46];
  const n = [-upper[1], upper[0]], m = [-fore[1], fore[0]];
  const at = (point: number[], direction: number[], amount: number) => `${point[0] + direction[0] * amount} ${point[1] + direction[1] * amount}`;
  const cuff = [s[0] + upper[0] * 29, s[1] + upper[1] * 29];
  const arm = `M${at(s, n, 7)} L${at(e, n, 6)} Q${e[0] + (n[0] + m[0]) * 6} ${e[1] + (n[1] + m[1]) * 6} ${at(e, m, 5.5)} L${at(h, m, 3.5)} Q${at(h, fore, 4)} ${at(h, m, -3.5)} L${at(e, m, -5.5)} Q${e[0] - (n[0] + m[0]) * 6} ${e[1] - (n[1] + m[1]) * 6} ${at(e, n, -6)} L${at(s, n, -7)} Q${at(s, upper, -7)} ${at(s, n, 7)}Z`;
  const sleeve = `M${at(s, n, 10)} Q${s[0] + upper[0] * 17 + n[0] * 10} ${s[1] + upper[1] * 17 + n[1] * 10} ${at(cuff, n, 8.5)} Q${at(cuff, upper, 3)} ${at(cuff, n, -8.5)} Q${s[0] + upper[0] * 17 - n[0] * 10} ${s[1] + upper[1] * 17 - n[1] * 10} ${at(s, n, -10)} Q${at(s, upper, -8)} ${at(s, n, 10)}Z`;
  return { arm, sleeve, cuff: `M${at(cuff, n, 7)} Q${at(cuff, upper, 2)} ${at(cuff, n, -7)}` };
}

function BuilderArmArtwork({ side }: { side: "left" | "right" }) {
  const art = armArtwork(sampleBuilderChoreography(0, 0)[side]);
  return <g className={`scene-arm scene-arm-${side}`} strokeLinejoin="round">
    <path data-rig-arm={side} d={art.arm} fill={side === "right" ? "#e5c7a1" : "#cba984"} stroke={side === "right" ? "#bea17d" : "#b29473"} strokeWidth=".6" />
    <path data-rig-sleeve={side} d={art.sleeve} fill={side === "right" ? "#23866a" : "#286f58"} stroke={side === "right" ? "#2f755c" : "#32654e"} strokeWidth=".7" />
    <path data-rig-cuff={side} d={art.cuff} stroke={side === "right" ? "#66a98d" : "#4b8b70"} strokeWidth="1.4" strokeLinecap="round" />
  </g>;
}

function BuilderHandArtwork({ side }: { side: "left" | "right" }) {
  const hand = sampleBuilderChoreography(0, 0)[side].hand;
  return <g data-rig-hand={side} transform={`translate(${hand[0]} ${hand[1]})`} fill={side === "right" ? "#e5c7a1" : "#cba984"} stroke={side === "right" ? "#bea17d" : "#b29473"} strokeWidth=".5" strokeLinejoin="round">
    <path data-hand-open d="M-4-3Q0-4 4-2L7 0Q8 2 5 3L1 3Q-1 6-3 3L-5 1Z" />
    <g data-hand-carry opacity="0" transform={side === "left" ? "scale(-1 1)" : undefined}>
      <path d="M-5-1Q-5 3 0 3H2Q6 3 6-1L5-5Q3-7 2-4L1-1Z" />
      <path d="M-2 1Q1 2 4 0" fill="none" strokeWidth=".6" />
    </g>
  </g>;
}

/** One continuous workspace, with short, authored reaches over the desk. */
function BuilderScene({ stage, outgoing, running, settled }: {
  stage: number;
  outgoing: number | null;
  running: boolean;
  settled: boolean;
}) {
  const sceneRef = useRef<SVGSVGElement>(null);
  const clock = useRef({ stage, elapsed: 0 });

  useEffect(() => {
    const svg = sceneRef.current;
    if (!svg) return;
    if (clock.current.stage !== stage) clock.current = { stage, elapsed: 0 };
    const head = svg.querySelector<SVGGElement>(".scene-builder-head");
    const pupils = svg.querySelector<SVGGElement>(".scene-builder-gaze");
    const arms = ["right", "left"].map(side => ({
      arm: svg.querySelector<SVGPathElement>(`[data-rig-arm="${side}"]`),
      sleeve: svg.querySelector<SVGPathElement>(`[data-rig-sleeve="${side}"]`),
      cuff: svg.querySelector<SVGPathElement>(`[data-rig-cuff="${side}"]`),
      hand: svg.querySelector<SVGGElement>(`[data-rig-hand="${side}"]`),
      openHand: svg.querySelector<SVGPathElement>(`[data-rig-hand="${side}"] [data-hand-open]`),
      carryHand: svg.querySelector<SVGGElement>(`[data-rig-hand="${side}"] [data-hand-carry]`),
    }));
    const action = svg.querySelector<SVGGElement>(`[data-rig-stage="${stage}"]`);
    const blocks = action?.querySelectorAll<SVGGElement>("[data-rig-block]");
    const stackRows = action?.querySelectorAll<SVGGElement>("[data-rig-stack-row]");
    const wires = action?.querySelectorAll<SVGPathElement>("[data-rig-wire]");
    const cables = action?.querySelectorAll<SVGPathElement>("[data-rig-cable]");
    const plugs = action?.querySelectorAll<SVGGElement>("[data-rig-plug]");
    const checks = action?.querySelectorAll<SVGGElement>("[data-rig-check]");
    const code = action?.querySelectorAll<SVGGElement>(".scene-code-line");
    const keys = action?.querySelectorAll<SVGRectElement>(".scene-key-flash");
    const pencil = action?.querySelector<SVGGElement>(".scene-builder-pencil");
    const result = action?.querySelector<SVGGElement>(".scene-work-result");
    const releaseBar = action?.querySelector<SVGRectElement>(".scene-release-progress");
    const runButton = action?.querySelector<SVGRectElement>(".scene-run-button");
    const shipButton = action?.querySelector<SVGRectElement>(".scene-ship-button");

    const paint = (progress: number) => {
      const pose = sampleBuilderChoreography(stage, progress);
      head?.setAttribute("transform", `rotate(${pose.headTilt} 163 193)`);
      pupils?.setAttribute("transform", `translate(${pose.gaze[0]} ${pose.gaze[1]})`);
      [pose.right, pose.left].forEach((arm, index) => {
        const art = armArtwork(arm);
        arms[index].arm?.setAttribute("d", art.arm);
        arms[index].sleeve?.setAttribute("d", art.sleeve);
        arms[index].cuff?.setAttribute("d", art.cuff);
        arms[index].hand?.setAttribute("transform", `translate(${arm.hand[0]} ${arm.hand[1]})`);
        arms[index].openHand?.setAttribute("opacity", pose.carrying ? "0" : "1");
        arms[index].carryHand?.setAttribute("opacity", pose.carrying ? "1" : "0");
      });
      pencil?.setAttribute("transform", `translate(${pose.right.hand[0]} ${pose.right.hand[1]})`);
      blocks?.forEach((block, index) => block.setAttribute("transform", `translate(${pose.blocks[index][0]} ${pose.blocks[index][1]})`));
      stackRows?.forEach((row, index) => { row.style.opacity = progress >= [.295, .555, .815][index] ? "1" : ".28"; });
      wires?.forEach((wire, index) => { wire.style.strokeDashoffset = String(1 - pose.wires[index]); });
      cables?.forEach((cable, index) => {
        const hand = pose.right.hand;
        const point = index === 0
          ? progress < .14 ? [253, 251] : progress < .26 ? hand : [238, 238]
          : progress < .44 ? [266, 242] : progress < .62 ? hand : [262, 238];
        const [x, y] = point;
        cable.setAttribute("d", `M${405 + index * 16} 252C${350 + index * 15} 278 ${x + 30} 277 ${x} ${y + 9}`);
        plugs?.[index]?.setAttribute("transform", `translate(${x} ${y})`);
      });
      checks?.forEach((check, index) => { check.style.opacity = pose.checks > index ? "1" : ".16"; });
      code?.forEach((line, index) => {
        const amount = Math.min(1, Math.max(0, (progress - (.18 + index * .14)) / .11));
        line.style.clipPath = `inset(0 ${(1 - amount) * 100}% 0 0)`;
      });
      keys?.forEach((key, index) => {
        const hand = index === 0 ? pose.left.hand : pose.right.hand;
        key.style.opacity = pose.typing && hand[1] > (index === 0 ? 243.6 : 252.6) ? "1" : "0";
      });
      releaseBar?.setAttribute("width", String(pose.launch * 154));
      if (result) result.style.opacity = stage === 4 ? pose.launch >= .98 ? "1" : "0" : progress >= .76 ? "1" : "0";
      runButton?.setAttribute("fill", progress >= .23 ? "#008363" : "#d6dfc4");
      shipButton?.setAttribute("fill", progress >= .69 ? "#008363" : "#d6dfc4");
    };
    if (settled) { paint(1); return; }
    paint(clock.current.elapsed / STEP_DURATION_MS);
    if (!running) return;
    const startedAt = performance.now() - clock.current.elapsed;
    let frame = 0;
    const tick = (now: number) => {
      clock.current.elapsed = Math.min(STEP_DURATION_MS, now - startedAt);
      paint(clock.current.elapsed / STEP_DURATION_MS);
      if (clock.current.elapsed < STEP_DURATION_MS) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [stage, running, settled]);

  return (
    <div className="journey-cartoon" data-scene={stage} aria-hidden="true">
      <div className="journey-scene-label"><span>At the workbench</span><span>{steps[stage].short}</span></div>
      <svg ref={sceneRef} viewBox="0 0 560 380" fill="none" className="journey-scene-svg scene-workspace">
        {/* The room, person and desk persist; only the work on the desk changes. */}
        <path d="M42 347H526" stroke="#bac5af" strokeWidth="1.5" />
        <ellipse cx="299" cy="349" rx="209" ry="8" fill="#dce4d1" />
        <rect x="45" y="86" width="73" height="108" rx="5" fill="#dde7d6" stroke="#b5c7ab" strokeWidth="2" />
        <path d="M51 92H112V188H51Z" fill="#eef2e6" />
        <path d="M81 92V188M51 137H112" stroke="#fafbf3" strokeWidth="4" />
        <path d="M51 178C70 143 88 176 112 148V188H51Z" fill="#cfddc6" />
        <path d="M65 196H118" stroke="#a7b99d" strokeWidth="5" strokeLinecap="round" />
        <path d="M328 61H506" stroke="#a8b99a" strokeWidth="5" strokeLinecap="round" />
        <path d="M342 59V35H353V59M359 59V28H371V59M377 59V38H387V59" fill="#d1ddc5" stroke="#91a689" strokeWidth="1.5" />
        <path d="M468 59L465 40H485L482 59" fill="#c8bc94" />
        <path d="M475 42V28M475 34C462 32 459 22 459 22C470 20 475 34 475 34M475 29C477 16 489 15 489 15C487 27 475 29 475 29" stroke="#76996e" strokeWidth="2" strokeLinecap="round" />

        {/* Chair and legs, behind the workbench. */}
        <path d="M125 209C106 197 96 209 99 230L107 274" stroke="#748879" strokeWidth="18" strokeLinecap="round" />
        <path d="M112 279H173" stroke="#677f70" strokeWidth="16" strokeLinecap="round" />
        <path d="M143 282V331M112 343L143 332L181 343" stroke="#6b8073" strokeWidth="5" strokeLinecap="round" />
        <circle cx="111" cy="344" r="4" fill="#496458" /><circle cx="182" cy="344" r="4" fill="#496458" />
        <path d="M145 268L181 292L170 329" stroke="#597467" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M171 269L208 294L205 329" stroke="#70887a" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M160 330L184 335L184 341H158Z" fill="#36584a" /><path d="M195 330L220 335L224 341H194Z" fill="#36584a" />
        <path d="M120 274L113 345M494 274L506 345" stroke="#8da080" strokeWidth="9" strokeLinecap="round" />
        <path d="M93 259H519L529 269H92Z" fill="#e1d4af" stroke="#a3ab8f" strokeWidth="1.5" />
        <path d="M93 269H527V278H93Z" fill="#cbbb96" />

        {/* The far sleeve and forearm sit behind the shirt, giving the arms depth. */}
        <BuilderArmArtwork side="left" />
        {/* A seated, three-quarter developer, with a relaxed shoulder line. */}
        <path d="M147 196L174 197L177 213H143Z" fill="#d8b58c" />
        <path d="M143 204C126 207 120 223 126 244L132 272C152 279 176 276 193 269L195 227C195 214 182 205 173 204L161 215Z" fill="#23866a" stroke="#3b6751" strokeWidth="1.5" />
        <path d="M146 204L161 215L173 204L169 218L159 222Z" fill="#eef0d7" />
        <path d="M153 220L148 263" stroke="#60a187" strokeWidth="1.5" />
        <path d="M169 237H184V252H169Z" fill="#187658" stroke="#73ad91" strokeWidth="1" />
        <path d="M173 243L176 246L181 240" stroke="#d7e6c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* The monitor never disappears between chapters. */}
        <rect x="295" y="82" width="224" height="161" rx="11" fill="#63796b" stroke="#486451" strokeWidth="2" />
        <rect x="302" y="89" width="210" height="145" rx="6" fill="#f7f8ed" />
        <path d="M302 111H512" stroke="#d7dfcd" />
        <circle cx="314" cy="100" r="2.5" fill="#c9b76f" /><circle cx="323" cy="100" r="2.5" fill="#a0bd8b" /><circle cx="332" cy="100" r="2.5" fill="#8eac9d" />
        <path d="M400 243V258M374 260H437" stroke="#7b9080" strokeWidth="7" strokeLinecap="round" />

        {steps.map((step, index) => (
          <g className="journey-scene-action" key={step.short} data-active={stage === index} data-outgoing={outgoing === index} data-rig-stage={index}>
            {index === 0 && <>
              <text x="348" y="103" className="scene-work-mono">requirements.md</text>
              <text x="316" y="129" className="scene-work-title">Define the behavior</text>
              {[['User & goal', 'Who needs this?'], ['Rules & limits', 'What must stay true?'], ['Acceptance tests', 'How do I prove it?']].map(([title, detail], row) => (
                <g data-rig-check={row} key={title}>
                  <path d={`M316 ${148 + row * 29}l3 3 6-7`} stroke="#168567" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="332" y={150 + row * 29} className="scene-work-label">{title}</text>
                  <text x="332" y={161 + row * 29} className="scene-work-small">{detail}</text>
                </g>
              ))}
              <path d="M203 240Q222 235 242 241Q260 236 278 241L282 262Q260 257 243 263Q223 258 200 262Z" fill="#fffdf2" stroke="#a0af91" strokeWidth="1.5" />
              <path d="M242 241L243 263M208 246L232 246M207 251L234 251M252 246L272 246M253 251L274 251" stroke="#c7d2b9" strokeWidth="1" />
              <g className="scene-builder-pencil" transform="translate(253 251)"><path d="M-4-9L6 7" stroke="#d5af52" strokeWidth="4" strokeLinecap="round" /><path d="M6 7L8 10" stroke="#4f6451" strokeWidth="2" strokeLinecap="round" /></g>
            </>}
            {index === 1 && <>
              <text x="348" y="103" className="scene-work-mono">stack decisions</text>
              <text x="316" y="129" className="scene-work-title">Fit the workload</text>
              {[
                ['Data & storage', 'schema · consistency', '#e5d6a4'],
                ['Runtime & APIs', 'compute · dependencies', '#c7dfcd'],
                ['UI & delivery', 'latency · deployment', '#cbdfe4'],
              ].map(([title, detail, color], row) => <g key={title} data-rig-stack-row={row}>
                <rect x="315" y={139 + row * 29} width="184" height="25" rx="4" fill={color} />
                <text x="324" y={150 + row * 29} className="scene-work-label">{title}</text>
                <text x="324" y={159 + row * 29} className="scene-work-small">{detail}</text>
              </g>)}
              <path d="M200 259H281" stroke="#a8b69a" strokeWidth="4" strokeLinecap="round" />
              {['DATA', 'API', 'UI'].map((title, row) => <g key={title} data-rig-block={row} transform={`translate(-40 ${[-20, 0, 20][row]})`}>
                <rect x="244" y={247 - row * 10} width="32" height="10" rx="3" fill={['#e5d6a4', '#c7dfcd', '#cbdfe4'][row]} stroke="#7d9672" strokeWidth="1.4" />
                <path d={`M248 ${250 - row * 10}H272`} stroke="#fffef7" strokeWidth="1" opacity=".6" />
                <text x="260" y={255 - row * 10} textAnchor="middle" className="scene-tile-label">{title}</text>
              </g>)}
            </>}
            {index === 2 && <>
              <text x="348" y="103" className="scene-work-mono">system boundaries</text>
              <path data-rig-wire="0" d="M367 140H394" pathLength="1" strokeDasharray="1" stroke="#168567" strokeWidth="2.5" />
              <path data-rig-wire="1" d="M442 156V180" pathLength="1" strokeDasharray="1" stroke="#168567" strokeWidth="2.5" />
              <rect x="315" y="125" width="52" height="31" rx="5" fill="#e4ecd7" stroke="#a6ba98" /><text x="341" y="143" textAnchor="middle" className="scene-work-label">UI</text>
              <rect x="394" y="125" width="103" height="31" rx="5" fill="#e5d6a4" stroke="#b8aa78" /><text x="445" y="138" textAnchor="middle" className="scene-work-label">API · domain</text><text x="445" y="149" textAnchor="middle" className="scene-work-small">validate · authorize</text>
              <rect x="394" y="180" width="103" height="31" rx="5" fill="#c7dfcd" stroke="#93b499" /><text x="445" y="193" textAnchor="middle" className="scene-work-label">Data</text><text x="445" y="204" textAnchor="middle" className="scene-work-small">schema · ownership</text>
              <text x="315" y="194" className="scene-work-small">Clear contracts.</text><text x="315" y="206" className="scene-work-small">Explicit failures.</text>
              {[0, 1].map(wire => <path key={wire} data-rig-cable={wire} stroke={wire ? '#bba969' : '#7caa91'} strokeWidth="2.5" strokeLinecap="round" />)}
              <path d="M218 234H279L283 260H215Z" fill="#e5e9da" stroke="#99ac8b" strokeWidth="1.5" />
              <circle cx="238" cy="244" r="5" fill="#839d85" /><circle cx="262" cy="244" r="5" fill="#b3a16d" />
              <path d="M227 254H247M253 254H273" stroke="#b1bfa4" strokeWidth="1.5" />
              {[0, 1].map(wire => <g key={wire} data-rig-plug={wire} transform={wire === 0 ? "translate(253 251)" : "translate(266 242)"}><rect x="-4" y="0" width="8" height="10" rx="2" fill={wire ? '#cfb66a' : '#a5c4ad'} stroke="#6d8368" strokeWidth="1" /><path d="M-2 8V11M2 8V11" stroke="#65785d" strokeWidth="1.2" /></g>)}
            </>}
            {index === 3 && <>
              <path d="M302 112H512V228Q512 234 506 234H308Q302 234 302 228Z" fill="#234b3e" />
              <text x="348" y="103" className="scene-work-mono">one-working-path.ts</text>
              {['validate(input);', 'authorize(user);', 'await persist(result);', 'respond(result);'].map((line, row) => <g key={line} className="scene-code-line"><text x="316" y={134 + row * 23} className="scene-work-code"><tspan fill="#80a596">{row + 1} </tspan>{line}</text></g>)}
              <g className="scene-work-result"><circle cx="320" cy="222" r="3" fill="#add399" /><text x="330" y="225" className="scene-work-small scene-work-success">One complete path</text></g>
              <path d="M210 241H283L293 262H203Z" fill="#dde5d2" stroke="#8ca17e" strokeWidth="1.5" />
              <path d="M216 247H281M212 253H285M222 244L219 258M233 244L232 258M245 244V258M257 244L258 258M269 244L272 258" stroke="#b0bfa4" strokeWidth="1" />
              <rect className="scene-key-flash" x="229" y="246" width="8" height="4" rx="1" fill="#d5b85b" /><rect className="scene-key-flash" x="259" y="253" width="8" height="4" rx="1" fill="#d5b85b" />
            </>}
            {index === 4 && <>
              <text x="348" y="103" className="scene-work-mono">release checks</text>
              <text x="316" y="129" className="scene-work-title">Prove it. Then ship.</text>
              {['Unit & integration', 'Browser journey', 'Production build'].map((title, row) => <g key={title} data-rig-check={row}><path d={`M317 ${145 + row * 22}l3 3 6-7`} stroke="#168567" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><text x="333" y={148 + row * 22} className="scene-work-label">{title}</text></g>)}
              <rect x="316" y="204" width="154" height="5" rx="2.5" fill="#d7e1cc" /><rect className="scene-release-progress" x="316" y="204" width="0" height="5" rx="2.5" fill="#168567" />
              <g className="scene-work-result"><circle cx="320" cy="221" r="3" fill="#168567" /><text x="330" y="224" className="scene-work-small">Live · observe & improve</text></g>
              <path d="M218 241H271L277 263H213Z" fill="#e4e9d7" stroke="#8ca17e" strokeWidth="1.5" />
              <rect className="scene-run-button" x="231" y="247" width="17" height="9" rx="3" fill="#d6dfc4" /><rect className="scene-ship-button" x="255" y="247" width="17" height="9" rx="3" fill="#d6dfc4" />
              <path d="M237 249L241 252L237 254ZM262 254V249M260 251L262 249L264 251" stroke="#69855c" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </>}
          </g>
        ))}

        <BuilderArmArtwork side="right" />
        <BuilderHandArtwork side="left" />
        <BuilderHandArtwork side="right" />
        <g className="scene-builder-head">
          <path d="M140 149C140 134 149 126 164 127C184 128 190 140 188 158L196 170L188 175L186 187C182 198 164 202 151 191L144 174Z" fill="#e5c7a1" stroke="#a58b68" strokeWidth="1.2" />
          <path d="M141 170C133 164 133 149 137 138C142 123 158 119 176 125C189 129 195 139 190 151L184 145L180 137C167 143 154 140 149 153L146 174Z" fill="#38574a" />
          <path d="M144 134C154 127 167 127 178 133" stroke="#5b7362" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="147" cy="170" rx="6" ry="8" fill="#dfbc94" /><path d="M149 166Q143 166 147 174" stroke="#b39772" strokeWidth="1" strokeLinecap="round" />
          <path d="M173 154L181 155" stroke="#4f5f48" strokeWidth="2" strokeLinecap="round" />
          <g className="scene-builder-eyes"><g className="scene-builder-gaze"><ellipse cx="178" cy="163" rx="2.3" ry="2.5" fill="#385346" /></g></g>
          <path d="M179 184Q184 185 187 181" stroke="#9d7c5b" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <path d="M472 248V232H491V248Q482 254 472 248Z" fill="#ecdfbb" stroke="#a9ae8e" strokeWidth="1.3" /><path d="M491 235H495Q501 240 494 245H491" stroke="#a9ae8e" strokeWidth="1.6" />
      </svg>
      <div className="journey-scene-captions">{steps.map((step, index) => <p key={step.short} className="journey-scene-caption" data-active={stage === index}>{step.scene}</p>)}</div>
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
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const remainingMs = useRef(STEP_DURATION_MS);
  const { ref, visible } = useVisiblePlayback<HTMLElement>();
  const reduced = useMotionPreference();
  const prefix = useId();
  const running = playing && visible && !reduced;

  useEffect(() => {
    if (!running) return;
    const startedAt = performance.now();
    let completed = false;
    const timer = window.setTimeout(() => {
      completed = true;
      remainingMs.current = STEP_DURATION_MS;
      setOutgoing(active);
      setActive((value) => (value + 1) % steps.length);
    }, remainingMs.current);
    return () => {
      window.clearTimeout(timer);
      if (!completed) {
        remainingMs.current = Math.max(
          100,
          remainingMs.current - (performance.now() - startedAt),
        );
      }
    };
  }, [running, active]);

  useEffect(() => {
    if (outgoing === null) return;
    // The old workspace remains during the short crossfade. Hands are at rest
    // on both sides of the handoff.
    const timer = window.setTimeout(() => setOutgoing(null), 300);
    return () => window.clearTimeout(timer);
  }, [outgoing]);

  useEffect(() => {
    const panel = ref.current?.closest('[role="tabpanel"]');
    if (!panel) return;
    let wasHidden = panel.hasAttribute("hidden");
    const observer = new MutationObserver(() => {
      const hidden = panel.hasAttribute("hidden");
      // Each return to Profile starts playing automatically. A deliberate
      // pause remains in force while reading or scrolling this Profile visit.
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
      data-paused={!playing}
      data-reduced={reduced}
      style={{ "--journey-step-duration": `${STEP_DURATION_MS}ms` } as CSSProperties}
    >
      <header className="builder-workbench-heading">
        <div>
          <p className="classic-kicker">How I build</p>
          <h2 id={`${prefix}-title`}>
            From a question to a <em>working system.</em>
          </h2>
          <p className="journey-mindset">
            I make assumptions explicit, test the boundaries and connect each
            engineering decision to a working, observable system.
          </p>
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
          <BuilderScene
            stage={active}
            outgoing={outgoing}
            running={running}
            settled={reduced}
          />
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
          aria-label="How I turn an idea into something useful"
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
