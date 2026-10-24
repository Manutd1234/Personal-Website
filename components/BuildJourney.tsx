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
import { BUILDER_FOREARM, BUILDER_UPPER_ARM, type BuilderArm, blendBuilderPosture, sampleBuilderChoreography } from "./builder-choreography";

const STEP_DURATION_MS = 7500;
const MONITOR_TRANSFORM = "translate(10 0) translate(519 243) scale(1.24) translate(-519 -243)";

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
  const upper = [(e[0] - s[0]) / BUILDER_UPPER_ARM, (e[1] - s[1]) / BUILDER_UPPER_ARM];
  const fore = [(h[0] - e[0]) / BUILDER_FOREARM, (h[1] - e[1]) / BUILDER_FOREARM];
  const n = [-upper[1], upper[0]], m = [-fore[1], fore[0]];
  const at = (point: number[], direction: number[], amount: number) => `${point[0] + direction[0] * amount} ${point[1] + direction[1] * amount}`;
  const cuff = [s[0] + upper[0] * 50, s[1] + upper[1] * 50];
  const arm = `M${at(s, n, 9)} L${at(e, n, 7)} Q${e[0] + (n[0] + m[0]) * 7} ${e[1] + (n[1] + m[1]) * 7} ${at(e, m, 7)} L${at(h, m, 3.8)} Q${at(h, fore, 4)} ${at(h, m, -3.8)} L${at(e, m, -7)} Q${e[0] - (n[0] + m[0]) * 5.5} ${e[1] - (n[1] + m[1]) * 5.5} ${at(e, n, -7)} L${at(s, n, -9)} Q${at(s, upper, -7)} ${at(s, n, 9)}Z`;
  const sleeve = `M${at(s, n, 11)} Q${s[0] + upper[0] * 24 + n[0] * 11} ${s[1] + upper[1] * 24 + n[1] * 11} ${at(cuff, n, 8.5)} Q${at(cuff, upper, 2)} ${at(cuff, n, -8.5)} Q${s[0] + upper[0] * 24 - n[0] * 11} ${s[1] + upper[1] * 24 - n[1] * 11} ${at(s, n, -11)} Q${at(s, upper, -9)} ${at(s, n, 11)}Z`;
  return { arm, sleeve, cuff: `M${at(cuff, n, 7)} Q${at(cuff, upper, 2)} ${at(cuff, n, -7)}` };
}

function BuilderArmArtwork({ side }: { side: "left" | "right" }) {
  const art = armArtwork(sampleBuilderChoreography(0, 0)[side]);
  return <g className={`scene-arm scene-arm-${side}`} strokeLinejoin="round">
    <path data-rig-arm={side} d={art.arm} fill={side === "right" ? "#e5c7a1" : "#cba984"} stroke={side === "right" ? "#bea17d" : "#b29473"} strokeWidth=".6" />
    <path data-rig-sleeve={side} d={art.sleeve} fill={side === "right" ? "#337e65" : "#2b6856"} />
    <path data-rig-cuff={side} d={art.cuff} stroke={side === "right" ? "#236b53" : "#215642"} strokeWidth="1.4" strokeLinecap="round" />
  </g>;
}

function BuilderHandArtwork({ side }: { side: "left" | "right" }) {
  const hand = sampleBuilderChoreography(0, 0)[side].hand;
  return <g data-rig-hand={side} transform={`translate(${hand[0]} ${hand[1]})`} fill={side === "right" ? "#e5c7a1" : "#cba984"} stroke={side === "right" ? "#bea17d" : "#b29473"} strokeWidth=".55" strokeLinejoin="round">
    <path d="M-5-3Q0-5 5-2L6 1Q5 3 1 3L-3 2Z" />
    <path data-rig-finger d="M1-2Q5-4 8-1L9 1Q8 3 6 1L3 1" />
    <path d="M-2 1Q2 1 3 3Q2 5 0 4L-3 3" />
    <path d="M3-1L5 0" fill="none" strokeWidth=".45" />
  </g>;
}

const codeLines = ["validate(input);", "authorize(user);", "await persist(result);", "respond(result);"];

/** The room and work surface stay mounted for the entire five-scene session. */
function BuilderScene({ stage, outgoing, running, settled }: {
  stage: number;
  outgoing: number | null;
  running: boolean;
  settled: boolean;
}) {
  const sceneRef = useRef<SVGSVGElement>(null);
  const torsoClipId = `${useId()}-desk-occlusion`;
  const clock = useRef({ stage, elapsed: 0 });
  const lastPose = useRef(sampleBuilderChoreography(stage, 0));
  const handoff = useRef({ from: lastPose.current, elapsed: 450 });

  useEffect(() => {
    const svg = sceneRef.current;
    if (!svg) return;
    if (clock.current.stage !== stage) {
      clock.current = { stage, elapsed: 0 };
      handoff.current = { from: lastPose.current, elapsed: 0 };
    }
    const torso = svg.querySelector<SVGGElement>(".scene-builder-torso");
    const head = svg.querySelector<SVGGElement>(".scene-builder-head");
    const pupils = svg.querySelector<SVGGElement>(".scene-builder-gaze");
    const arms = ["right", "left"].map(side => ({
      arm: svg.querySelector<SVGPathElement>(`[data-rig-arm="${side}"]`),
      sleeve: svg.querySelector<SVGPathElement>(`[data-rig-sleeve="${side}"]`),
      cuff: svg.querySelector<SVGPathElement>(`[data-rig-cuff="${side}"]`),
      hand: svg.querySelector<SVGGElement>(`[data-rig-hand="${side}"]`),
      finger: svg.querySelector<SVGPathElement>(`[data-rig-hand="${side}"] [data-rig-finger]`),
    }));
    const action = svg.querySelector<SVGGElement>(`[data-rig-stage="${stage}"]`);
    const choices = action?.querySelectorAll<SVGGElement>("[data-rig-choice]");
    const choiceMarks = action?.querySelectorAll<SVGPathElement>("[data-rig-choice-mark]");
    const wires = action?.querySelectorAll<SVGPathElement>("[data-rig-wire]");
    const node = action?.querySelector<SVGGElement>("[data-rig-node]");
    const checks = action?.querySelectorAll<SVGGElement>("[data-rig-check]");
    const code = action?.querySelectorAll<SVGTextElement>("[data-rig-code]");
    const caret = action?.querySelector<SVGRectElement>(".scene-code-caret");
    const keys = svg.querySelectorAll<SVGRectElement>(".scene-key-flash");
    const pencil = svg.querySelector<SVGGElement>(".scene-builder-pencil");
    const ink = svg.querySelectorAll<SVGPathElement>("[data-rig-ink]");
    const mouse = svg.querySelector<SVGGElement>(".scene-work-mouse");
    const cursor = svg.querySelector<SVGGElement>(".scene-work-cursor");
    const cursorPress = svg.querySelector<SVGCircleElement>(".scene-cursor-press");
    const result = action?.querySelector<SVGGElement>(".scene-work-result");
    const releaseBar = action?.querySelector<SVGRectElement>(".scene-release-progress");
    const deployButton = action?.querySelector<SVGRectElement>(".scene-deploy-button");
    const deployText = action?.querySelector<SVGTextElement>(".scene-deploy-text");

    const paint = (progress: number) => {
      const target = sampleBuilderChoreography(stage, progress);
      const pose = handoff.current.elapsed < 450 && !settled
        ? blendBuilderPosture(handoff.current.from, target, handoff.current.elapsed / 450)
        : target;
      lastPose.current = pose;
      torso?.setAttribute("transform", `rotate(${pose.bodyLean} 160 274)`);
      head?.setAttribute("transform", `rotate(${pose.bodyLean} 160 274) rotate(${pose.headTilt} 166 174)`);
      pupils?.setAttribute("transform", `translate(${pose.gaze[0]} ${pose.gaze[1]})`);
      [pose.right, pose.left].forEach((arm, index) => {
        const art = armArtwork(arm);
        arms[index].arm?.setAttribute("d", art.arm);
        arms[index].sleeve?.setAttribute("d", art.sleeve);
        arms[index].cuff?.setAttribute("d", art.cuff);
        arms[index].hand?.setAttribute("transform", `translate(${arm.hand[0]} ${arm.hand[1]})`);
        const press = pose.fingers[index];
        arms[index].finger?.setAttribute("d", `M1-2Q5 ${-4 + press * 2} 8 ${-1 + press * 1.4}L9 ${1 + press}Q8 ${3 + press} 6 ${1 + press}L3 1`);
      });
      pencil?.setAttribute("transform", `translate(${pose.pen[0]} ${pose.pen[1]})`);
      ink.forEach((line, index) => line.setAttribute("stroke-dashoffset", String(1 - pose.ink[index])));
      mouse?.setAttribute("transform", `translate(${pose.mouse[0] - 280} ${pose.mouse[1] - 240})`);
      cursor?.setAttribute("transform", `translate(${pose.cursor[0]} ${pose.cursor[1]})`);
      cursor?.setAttribute("opacity", String(pose.cursorOpacity));
      cursorPress?.setAttribute("opacity", String(pose.pointerDown * .65));
      cursorPress?.setAttribute("r", String(3.5 + pose.pointerDown * 2));
      choices?.forEach((choice, index) => { choice.style.opacity = pose.selections > index ? "1" : ".46"; });
      choiceMarks?.forEach((mark, index) => { mark.style.opacity = pose.selections > index ? "1" : "0"; });
      node?.setAttribute("transform", `translate(0 ${pose.nodeOffset})`);
      wires?.forEach((wire, index) => wire.setAttribute("stroke-dashoffset", String(1 - pose.wires[index])));
      checks?.forEach((check, index) => { check.style.opacity = pose.checks > index ? "1" : ".2"; });
      code?.forEach((line, index) => { line.textContent = codeLines[index].slice(0, Math.round(pose.code[index] * codeLines[index].length)); });
      if (caret) {
        const row = Math.min(3, pose.code.findIndex(amount => amount < 1) < 0 ? 3 : pose.code.findIndex(amount => amount < 1));
        caret.setAttribute("x", String(331 + Math.round(pose.code[row] * codeLines[row].length) * 5.4));
        caret.setAttribute("y", String(126 + row * 23));
      }
      keys.forEach((key, index) => { key.style.opacity = String(pose.fingers[index]); });
      releaseBar?.setAttribute("width", String(pose.launch * 183));
      if (result) result.style.opacity = stage === 4 ? pose.launch >= .99 ? "1" : "0" : pose.code[3] >= 1 ? "1" : "0";
      deployButton?.setAttribute("fill", pose.launch > 0 ? "#168567" : pose.checks === 3 ? "#d3e4c5" : "#e6eadc");
      deployText?.setAttribute("fill", pose.launch > 0 ? "#f7f8ed" : "#4c6c50");
      if (deployText) deployText.textContent = pose.launch >= .99 ? "Live" : pose.launch > 0 ? "Deploying" : "Deploy";
    };
    if (settled) { paint(1); return; }
    paint(clock.current.elapsed / STEP_DURATION_MS);
    if (!running) return;
    let previous = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = Math.max(0, now - previous);
      previous = now;
      clock.current.elapsed = Math.min(STEP_DURATION_MS, clock.current.elapsed + elapsed);
      handoff.current.elapsed = Math.min(450, handoff.current.elapsed + elapsed);
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
        <defs><clipPath id={torsoClipId}><rect width="560" height="232" /></clipPath></defs>
        <path d="M42 347H526" stroke="#bac5af" strokeWidth="1.5" />
        <ellipse cx="299" cy="349" rx="209" ry="8" fill="#dce4d1" />
        <rect x="45" y="86" width="73" height="108" rx="5" fill="#dde7d6" stroke="#b5c7ab" strokeWidth="2" />
        <path d="M51 92H112V188H51Z" fill="#eef2e6" />
        <path d="M81 92V188M51 137H112" stroke="#fafbf3" strokeWidth="4" />
        <path d="M51 178C70 143 88 176 112 148V188H51Z" fill="#cfddc6" />
        <path d="M65 196H118" stroke="#a7b99d" strokeWidth="5" strokeLinecap="round" />


        {/* Adult seated proportions: a supported pelvis, full thighs, bent knees
            and shins that reach the floor, rather than short tube-like legs. */}
        <path d="M117 187C105 186 101 196 105 212L114 259Q116 272 128 273L140 270L130 205Q129 190 117 187Z" fill="#718879" stroke="#597464" strokeWidth="1.2" />
        <path d="M119 273H176Q184 274 180 282H122Q114 280 119 273Z" fill="#5d7968" />
        <path d="M147 282V331M112 343L147 332L187 343" stroke="#6b8073" strokeWidth="5" strokeLinecap="round" />
        <circle cx="111" cy="344" r="4" fill="#496458" /><circle cx="188" cy="344" r="4" fill="#496458" />
        <path d="M145 263Q160 260 175 269L212 280Q222 283 219 294L205 333L191 331L200 294L154 287Q139 280 145 263Z" fill="#526e60" stroke="#456253" strokeWidth=".9" />
        <path d="M162 263Q177 259 192 267L236 281Q245 285 242 297L231 335L215 333L224 298L176 290Q158 286 153 276Z" fill="#6b8374" stroke="#4f6c5b" strokeWidth="1" />
        <path d="M177 279L230 289Q234 290 232 297L222 329M159 281L206 289" stroke="#879c8d" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M191 330L204 331L212 338Q216 342 211 344H185Q179 343 183 337Z" fill="#354e42" />
        <path d="M215 332L230 333L246 340Q251 343 247 346H212Q207 344 211 338Z" fill="#38584a" />
        <path d="M185 342H211M212 344H247" stroke="#aab7a4" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M120 274L113 345M494 274L506 345" stroke="#8da080" strokeWidth="9" strokeLinecap="round" />
        <path d="M109 232H502L529 269H93Z" fill="#e1d4af" stroke="#a3ab8f" strokeWidth="1.5" />
        <path d="M93 269H527V278H93Z" fill="#cbbb96" />
        <path d="M110 265H516" stroke="#eadebc" strokeWidth="1.3" />


        {/* Permanent monitor and inputs: no props pop in or disappear on a cut. */}
        <ellipse cx="394" cy="261" rx="40" ry="4" fill="#9eab8b" opacity=".25" />
        <g transform={MONITOR_TRANSFORM}>
        <rect x="295" y="82" width="224" height="161" rx="11" fill="#63796b" stroke="#486451" strokeWidth="2" />
        <rect x="302" y="89" width="210" height="145" rx="6" fill="#f7f8ed" />
        <path d="M302 111H512" stroke="#d7dfcd" />
        <circle cx="314" cy="100" r="2.5" fill="#c9b76f" /><circle cx="323" cy="100" r="2.5" fill="#a0bd8b" /><circle cx="332" cy="100" r="2.5" fill="#8eac9d" />
        <circle cx="507" cy="238" r="1.5" fill="#c2d6ab" />
        </g>
        <path d="M394 243V258M365 260H423" stroke="#7b9080" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="247" cy="248" rx="39" ry="4" fill="#7c916e" opacity=".2" />
        <path d="M214 232H258L267 248H206Z" fill="#dce4d1" stroke="#8ca17e" strokeWidth="1.3" />
        <path d="M215 236H260M212 240H262M210 244H265M222 234L219 245M230 234L229 245M239 234V245M248 234L250 245M256 234L260 245M225 245H249" stroke="#a6b69a" strokeWidth=".8" />
        <rect className="scene-key-flash" x="251" y="240" width="8" height="4" rx="1" fill="#c4ad61" opacity="0" />
        <rect className="scene-key-flash" x="224" y="237" width="7" height="3" rx="1" fill="#c4ad61" opacity="0" />
        <g className="scene-work-mouse" transform="translate(-11 4)">
          <ellipse cx="285" cy="249" rx="9" ry="2" fill="#7c916e" opacity=".2" />
          <path d="M277 240C277 231 289 232 291 240L293 247Q286 252 278 247Z" fill="#eceddd" stroke="#92a584" strokeWidth="1.1" />
          <path d="M284 235L285 240M278 241Q285 243 291 241" stroke="#adbaa0" strokeWidth=".8" />
        </g>
        <path d="M205 251Q220 248 233 251Q246 248 261 252L266 267Q249 264 234 268Q218 264 201 267Z" fill="#fffdf2" stroke="#a0af91" strokeWidth="1" />
        <path d="M233 251L234 268M209 255H227M208 259H226M207 263H229" stroke="#d4ddc8" strokeWidth=".8" />
        {[14, 15, 13].map((length, row) => <path key={row} data-rig-ink={row} d={`M241 ${255 + row * 4}h${length}`} pathLength="1" strokeDasharray="1" strokeDashoffset="1" stroke="#71927a" strokeWidth=".85" strokeLinecap="round" />)}
        <g className="scene-builder-pencil" transform="translate(263 251)"><path d="M-4-9L6 6" stroke="#c6a04f" strokeWidth="3" strokeLinecap="round" /><path d="M6 6L8 8" stroke="#4f6451" strokeWidth="1.5" strokeLinecap="round" /></g>

        <g className="scene-monitor-content" transform={MONITOR_TRANSFORM}>
        {steps.map((step, index) => (
          <g className="journey-scene-action" key={step.short} data-active={stage === index} data-outgoing={outgoing === index} data-rig-stage={index}>
            {index === 0 && <>
              <text x="348" y="103" className="scene-work-mono">requirements.md</text>
              <text x="316" y="129" className="scene-work-title">Define the behavior</text>
              {[["User & goal", "Who needs this?"], ["Rules & limits", "What must stay true?"], ["Acceptance tests", "How do I prove it?"]].map(([title, detail], row) => <g data-rig-check={row} key={title}>
                <path d={`M316 ${148 + row * 29}l3 3 6-7`} stroke="#168567" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <text x="332" y={150 + row * 29} className="scene-work-label">{title}</text><text x="332" y={161 + row * 29} className="scene-work-small">{detail}</text>
              </g>)}
            </>}
            {index === 1 && <>
              <text x="348" y="103" className="scene-work-mono">stack decisions</text>
              <text x="316" y="129" className="scene-work-title">Compare the tradeoffs</text>
              {[["Data & storage", "schema · consistency", "#e5d6a4"], ["Runtime & APIs", "compute · dependencies", "#c7dfcd"], ["UI & delivery", "latency · deployment", "#cbdfe4"]].map(([title, detail, color], row) => <g key={title} data-rig-choice={row}>
                <rect x="315" y={139 + row * 29} width="184" height="25" rx="4" fill={color} />
                <text x="324" y={150 + row * 29} className="scene-work-label">{title}</text><text x="324" y={159 + row * 29} className="scene-work-small">{detail}</text>
                <rect x="478" y={146 + row * 29} width="11" height="11" rx="3" fill="#f7f8ed" stroke="#8eaa81" strokeWidth=".8" />
                <path data-rig-choice-mark={row} d={`M480 ${151 + row * 29}l3 3 5-6`} stroke="#168567" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </g>)}
            </>}
            {index === 2 && <>
              <text x="348" y="103" className="scene-work-mono">system boundaries</text>
              <path d="M312 173H503M377 121V220" stroke="#e4e9da" strokeDasharray="2 4" />
              <path data-rig-wire="0" d="M361 146H389" pathLength="1" strokeDasharray="1" stroke="#168567" strokeWidth="2" />
              <path data-rig-wire="1" d="M443 162V188" pathLength="1" strokeDasharray="1" stroke="#168567" strokeWidth="2" />
              <rect x="315" y="130" width="46" height="32" rx="5" fill="#e4ecd7" stroke="#a6ba98" /><text x="338" y="149" textAnchor="middle" className="scene-work-label">UI</text>
              <g data-rig-node transform="translate(0 19)"><rect x="389" y="130" width="108" height="32" rx="5" fill="#e5d6a4" stroke="#b8aa78" /><text x="443" y="143" textAnchor="middle" className="scene-work-label">API · domain</text><text x="443" y="154" textAnchor="middle" className="scene-work-small">validate · authorize</text><circle cx="389" cy="146" r="2.5" fill="#f7f8ed" stroke="#8ca282" /><circle cx="443" cy="162" r="2.5" fill="#f7f8ed" stroke="#8ca282" /></g>
              <rect x="389" y="188" width="108" height="30" rx="5" fill="#c7dfcd" stroke="#93b499" /><text x="443" y="200" textAnchor="middle" className="scene-work-label">Data</text><text x="443" y="211" textAnchor="middle" className="scene-work-small">schema · ownership</text>
              <circle cx="361" cy="146" r="2.5" fill="#f7f8ed" stroke="#8ca282" /><circle cx="443" cy="188" r="2.5" fill="#f7f8ed" stroke="#8ca282" />
              <text x="315" y="194" className="scene-work-small">Clear contracts.</text><text x="315" y="206" className="scene-work-small">Explicit failures.</text>
            </>}
            {index === 3 && <>
              <path d="M302 112H512V228Q512 234 506 234H308Q302 234 302 228Z" fill="#234b3e" />
              <text x="348" y="103" className="scene-work-mono">one-working-path.ts</text>
              {codeLines.map((line, row) => <g key={line}><text x="316" y={134 + row * 23} className="scene-work-code" fill="#80a596">{row + 1}</text><text data-rig-code={row} x="331" y={134 + row * 23} className="scene-work-code">{line}</text></g>)}
              <rect className="scene-code-caret" x="331" y="126" width="1.3" height="10" fill="#d8dfb0" />
              <g className="scene-work-result"><circle cx="320" cy="222" r="3" fill="#add399" /><text x="330" y="225" className="scene-work-small scene-work-success">One complete path</text></g>
            </>}
            {index === 4 && <>
              <text x="348" y="103" className="scene-work-mono">release checks</text>
              <text x="316" y="129" className="scene-work-title">Prove it. Then ship.</text>
              {["Unit & integration", "Browser journey", "Production build"].map((title, row) => <g key={title} data-rig-check={row}><path d={`M317 ${144 + row * 22}l3 3 6-7`} stroke="#168567" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><text x="333" y={147 + row * 22} className="scene-work-label">{title}</text></g>)}
              <rect className="scene-deploy-button" x="440" y="198" width="59" height="17" rx="4" fill="#e6eadc" /><text className="scene-deploy-text" x="469" y="209" textAnchor="middle" fontSize="8" fill="#4c6c50">Deploy</text>
              <g className="scene-work-result"><circle cx="320" cy="207" r="2.5" fill="#168567" /><text x="328" y="210" className="scene-work-small">Live · observe</text></g>
              <rect x="316" y="221" width="183" height="4" rx="2" fill="#d7e1cc" /><rect className="scene-release-progress" x="316" y="221" width="0" height="4" rx="2" fill="#168567" />
            </>}
          </g>
        ))}
        <g className="scene-work-cursor" opacity="0" transform="translate(483 216)"><circle className="scene-cursor-press" r="4" fill="#a2c48b" opacity="0" /><path d="M0 0L1 10L3.5 7L6 11L8 10L5.5 6.5L9 6Z" fill="#365c47" stroke="#fffef3" strokeWidth=".8" strokeLinejoin="round" /></g>

        </g>

        {/* The far forearm passes over the notes; the torso occludes its upper
            part. This keeps the hand connected instead of hiding the wrist
            underneath the paper. */}
        <BuilderArmArtwork side="left" />
        {/* The desk occludes the waist and lap, while both arms remain above
            its surface. Clip outside the moving torso to keep the table edge fixed. */}
        <g clipPath={`url(#${torsoClipId})`}>
        <g className="scene-builder-torso">
          <path d="M157 162L175 163L177 179L167 186L154 177Z" fill="#d8b58c" />
          <path d="M154 176L172 176C186 177 197 182 201 194L199 218L191 249L193 270C177 279 151 279 136 270L132 232C128 210 130 192 141 183Z" fill="#337e65" stroke="#335f4b" strokeWidth="1.3" />
          <path d="M141 184C134 198 136 217 140 235L145 272L136 270L132 232C128 210 130 192 141 184Z" fill="#2b6e58" />
          <path d="M154 175L166 183L176 176L182 180L172 192L165 185L155 188L149 181Z" fill="#b7ceaf" />
          <path d="M165 186L162 222" stroke="#81ac8e" strokeWidth="1.2" />
          <circle cx="164.4" cy="196" r="1" fill="#bed2ae" /><circle cx="163.5" cy="209" r="1" fill="#bed2ae" />
          <path d="M175 208H190V221Q183 227 175 221Z" fill="#2c735a" stroke="#60967c" strokeWidth=".8" />
          <path d="M176 211H189M143 257Q154 261 165 259M177 264L188 261" stroke="#61987b" strokeWidth=".9" strokeLinecap="round" />
          <path d="M141 268Q164 273 188 267" stroke="#286b52" strokeWidth="1.2" />
        </g>
        </g>

        <BuilderArmArtwork side="right" />
        <BuilderHandArtwork side="left" />
        <BuilderHandArtwork side="right" />
        <g className="scene-builder-head">
          <path d="M153 136C152 128 158 123 168 124C181 124 187 132 185 143L184 148L189 154Q191 157 184 158L182 165Q176 173 164 168L157 161L153 151Z" fill="#e5c7a1" stroke="#a58b68" strokeWidth=".9" />
          <path d="M155 151C148 148 147 138 150 131C153 122 162 119 172 122C184 123 190 131 186 139L181 135L179 130C172 134 162 130 159 139L158 151Z" fill="#38574a" />
          <path d="M155 129Q165 123 177 128" stroke="#5b7362" strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx="157" cy="150" rx="4.2" ry="5.6" fill="#dfbc94" /><path d="M158 147Q154 147 157 152" stroke="#b39772" strokeWidth=".8" strokeLinecap="round" />
          <path d="M175 140Q178 139 182 141" stroke="#4f5f48" strokeWidth="1.3" strokeLinecap="round" />
          <g className="scene-builder-eyes"><g className="scene-builder-gaze"><ellipse cx="179" cy="146" rx="1.45" ry="1.75" fill="#385346" /></g></g>
          <path d="M178 162Q181 163 183 161" stroke="#9d7c5b" strokeWidth="1" strokeLinecap="round" />
          <path d="M163 165Q169 170 176 168" stroke="#c8a884" strokeWidth=".7" strokeLinecap="round" />
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
  const [preview, setPreview] = useState(false);
  const remainingMs = useRef(STEP_DURATION_MS);
  const timerStage = useRef(active);
  const { ref, visible } = useVisiblePlayback<HTMLElement>();
  const reduced = useMotionPreference();
  const prefix = useId();
  const running = playing && visible && !reduced;

  useEffect(() => {
    if (timerStage.current !== active) {
      timerStage.current = active;
      remainingMs.current = STEP_DURATION_MS;
    }
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
    // Retain the previous monitor view through the brief dissolve. The person
    // stays mounted; manual selections ease from the current posture.
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
      if (wasHidden && !hidden) { setPreview(false); setPlaying(true); }
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
              setPreview(false);
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
                data-active={active === index}
              >
                <button
                  type="button"
                  aria-label={`Stage ${index + 1}: ${step.short}`}
                  aria-current={active === index ? "step" : undefined}
                  aria-controls={`${prefix}-chapter-${index}`}
                  onClick={() => {
                    if (reduced) document.getElementById(`${prefix}-chapter-${index}`)?.scrollIntoView({ block: "nearest", behavior: "instant" });
                    if (active === index) return;
                    setOutgoing(active);
                    setActive(index);
                    setPreview(!playing);
                  }}
                >
                  <span className="journey-step-icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span><small>0{index + 1}</small>{step.short}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="journey-stage" aria-hidden="true">
          <BuilderScene
            stage={active}
            outgoing={outgoing}
            running={running}
            settled={reduced || preview}
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
            <li key={step.short} id={`${prefix}-chapter-${index}`}>
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
