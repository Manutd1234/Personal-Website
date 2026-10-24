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
import { sampleBuilderChoreography } from "./builder-choreography";

const STEP_DURATION_MS = 5500;

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

/** Original vector artwork: a little builder assembling a software system. */
function BuilderScene({
  stage,
  outgoing,
  running,
  settled,
}: {
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
    const actor = svg.querySelector<SVGGElement>(".scene-builder-position");
    const head = svg.querySelector<SVGGElement>(".scene-builder-head");
    const arms = ["right", "left"].map((side) => ({
      arm: svg.querySelector<SVGPathElement>(`[data-rig-arm="${side}"]`),
      hand: svg.querySelector<SVGCircleElement>(`[data-rig-hand="${side}"]`),
    }));
    const pencil = svg.querySelector<SVGGElement>(".scene-builder-pencil");
    const plug = svg.querySelector<SVGGElement>(".scene-builder-plug");
    const action = svg.querySelector<SVGGElement>(`[data-rig-stage="${stage}"]`);
    const blocks = action?.querySelectorAll<SVGGElement>("[data-rig-block]");
    const wires = action?.querySelectorAll<SVGPathElement>("[data-rig-wire]");
    const looseWires = action?.querySelectorAll<SVGPathElement>("[data-rig-loose-wire]");
    const sockets = action?.querySelectorAll<SVGGElement>("[data-rig-socket]");
    const checks = action?.querySelectorAll<SVGPathElement>("[data-rig-check]");
    const requirements = action?.querySelectorAll<SVGGElement>("[data-rig-requirement]");
    const code = action?.querySelectorAll<SVGGElement>(".scene-code-line");
    const keys = action?.querySelectorAll<SVGRectElement>(".scene-key-flash");
    const packet = action?.querySelector<SVGCircleElement>(".scene-packet");
    const wireLength = wires?.[0]?.getTotalLength() ?? 0;
    const rocket = action?.querySelector<SVGGElement>(".scene-rocket");
    const flame = action?.querySelector<SVGPathElement>(".scene-flame");
    const deployed = action?.querySelector<SVGGElement>(".scene-share-finish");
    const result = action?.querySelector<SVGGElement>(".scene-build-finish");
    const launchButton = action?.querySelector<SVGRectElement>(".scene-launch-button");
    const stackComplete = action?.querySelector<SVGGElement>(".scene-stack-complete");

    // One clock drives hands and their objects. Updating the few SVG attributes
    // keeps the illustration smooth without rendering the whole chapter per frame.
    const paint = (progress: number) => {
      const pose = sampleBuilderChoreography(stage, progress);
      actor?.setAttribute("transform", `translate(${pose.bodyX} 0)`);
      head?.setAttribute("transform", `rotate(${pose.headTilt} 111 218)`);
      [pose.right, pose.left].forEach(([worldX, y], index) => {
        const x = worldX - pose.bodyX;
        const shoulderX = index === 0 ? 148 : 73;
        const dx = x - shoulderX;
        const dy = y - 254;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const bend = Math.min(28, Math.sqrt(Math.max(0, 62 ** 2 - (distance / 2) ** 2)));
        const elbowX = (shoulderX + x) / 2 - (dy / distance) * bend;
        const elbowY = (254 + y) / 2 + (dx / distance) * bend;
        arms[index].arm?.setAttribute("d", `M${shoulderX} 254L${elbowX} ${elbowY}L${x} ${y}`);
        arms[index].hand?.setAttribute("cx", String(x));
        arms[index].hand?.setAttribute("cy", String(y));
      });
      const handTransform = `translate(${pose.right[0] - pose.bodyX} ${pose.right[1]})`;
      pencil?.setAttribute("transform", handTransform);
      pencil?.setAttribute("visibility", stage === 0 ? "visible" : "hidden");
      plug?.setAttribute("transform", `${handTransform} rotate(${progress >= 0.44 ? 90 : 0})`);
      const carryingPlug = progress < 0.25 || (progress >= 0.44 && progress < 0.6);
      plug?.setAttribute("visibility", stage === 2 && carryingPlug ? "visible" : "hidden");
      blocks?.forEach((block, index) => {
        const [x, y] = pose.blocks[index];
        block.setAttribute("transform", `translate(${x} ${y})`);
        block.style.opacity = progress >= [0.08, 0.32, 0.56][index] ? "1" : "0";
      });
      wires?.forEach((wire, index) => {
        wire.style.strokeDashoffset = String(1 - pose.wires[index]);
      });
      sockets?.forEach((socket, index) => {
        socket.style.opacity = progress >= [0.25, 0.6][index] ? "1" : "0";
      });
      looseWires?.forEach((wire, index) => {
        const visible = index === 0 ? progress < 0.25 : progress >= 0.44 && progress < 0.6;
        wire.style.opacity = visible ? "1" : "0";
        const [x, y] = pose.right;
        wire.setAttribute("d", index === 0
          ? `M387 215C330 240 ${x + 34} ${y + 40} ${x} ${y}`
          : `M447 254C470 340 ${x + 55} 345 ${x} ${y}`);
      });
      checks?.forEach((check, index) => { check.style.opacity = pose.checks > index ? "1" : "0"; });
      requirements?.forEach((item, index) => {
        item.style.opacity = progress >= [0.2, 0.45, 0.68][index] ? "1" : "0";
      });
      code?.forEach((line, index) => {
        const amount = Math.min(1, Math.max(0, (progress - (0.13 + index * 0.12)) / 0.11));
        line.style.clipPath = `inset(0 ${(1 - amount) * 100}% 0 0)`;
      });
      keys?.forEach((key, index) => {
        const hand = index === 0 ? pose.left : pose.right;
        key.style.opacity = pose.typing && hand[1] >= 293 ? "1" : "0";
      });
      if (packet && wires?.[0]) {
        const point = wires[0].getPointAtLength(((Math.max(0, progress - 0.4) / 0.24) % 1) * wireLength);
        packet.setAttribute("cx", String(point.x));
        packet.setAttribute("cy", String(point.y));
        packet.style.opacity = progress >= 0.4 ? "1" : "0";
      }
      rocket?.setAttribute("transform", `translate(0 ${34 - pose.launch * 85})`);
      if (flame) flame.style.opacity = pose.launch > 0.02 ? "1" : "0";
      if (deployed) deployed.style.opacity = pose.launch > 0.65 ? "1" : "0";
      if (result) result.style.opacity = progress >= 0.72 ? "1" : "0";
      if (stackComplete) stackComplete.style.opacity = progress >= 0.82 ? "1" : "0";
      launchButton?.setAttribute("fill", progress >= 0.66 ? "#008363" : "#dfb857");
    };
    if (settled) {
      paint(1);
      return;
    }
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
    return () => { cancelAnimationFrame(frame); };
  }, [stage, running, settled]);

  return (
    <div className="journey-cartoon" data-scene={stage} aria-hidden="true">
      <div className="journey-scene-label">
        <span>A little idea, taking shape</span>
        <span>{steps[stage].short}</span>
      </div>
      <svg ref={sceneRef} viewBox="0 0 560 380" fill="none" className="journey-scene-svg">
        <path
          d="M31 329H529"
          stroke="#a8b797"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse cx="155" cy="329" rx="64" ry="8" fill="#d5dfc8" />
        <ellipse cx="365" cy="329" rx="145" ry="9" fill="#d5dfc8" />
        <path
          d="M47 83h12m-6-6v12M496 120h10m-5-5v10M461 48h12m-6-6v12"
          stroke="#a4b98e"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="199" cy="69" r="3" fill="#d4bb77" />
        <circle cx="511" cy="241" r="3" fill="#a4b98e" />
        {steps.map((step, sceneIndex) => (
          <g
            className="journey-scene-action"
            key={step.short}
            data-active={stage === sceneIndex}
            data-outgoing={outgoing === sceneIndex}
            data-rig-stage={sceneIndex}
          >
            {sceneIndex === 0 ? (
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
                  requirements.md
                </text>
                <g data-rig-requirement="0">
                  <circle cx="247" cy="164" r="5" fill="#dfb857" />
                  <text x="263" y="169" className="scene-label">
                    User & goal
                  </text>
                  <path
                    d="M263 181h159"
                    stroke="#d1d9c5"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </g>
                <g data-rig-requirement="1">
                  <circle cx="247" cy="209" r="5" fill="#dfb857" />
                  <text x="263" y="214" className="scene-label">
                    Rules & limits
                  </text>
                  <path
                    d="M263 226h129"
                    stroke="#d1d9c5"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </g>
                <g data-rig-requirement="2">
                  <path
                    d="m241 253 5 5 10-12"
                    stroke="#008363"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <text x="263" y="257" className="scene-label">
                    Acceptance tests
                  </text>
                </g>
                <g transform="translate(42 0)">
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
                </g>
              </>
            ) : null}
            {sceneIndex === 1 ? (
              <>
                <path
                  d="M225 300h268"
                  stroke="#698261"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <g data-rig-block="0">
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
                    Data & storage
                  </text>
                  <text x="259" y="284" className="scene-note">
                    schema · consistency
                  </text>
                </g>
                <g data-rig-block="1">
                  <rect
                    x="257"
                    y="183"
                    width="220"
                    height="57"
                    rx="8"
                    fill="#bddcc7"
                    stroke="#71815c"
                    strokeWidth="2"
                  />
                  <text x="276" y="208" className="scene-label">
                    Runtime & APIs
                  </text>
                  <text x="276" y="227" className="scene-note">
                    compute · dependencies
                  </text>
                </g>
                <g data-rig-block="2">
                  <rect
                    x="240"
                    y="126"
                    width="237"
                    height="57"
                    rx="8"
                    fill="#c9dce3"
                    stroke="#71815c"
                    strokeWidth="2"
                  />
                  <text x="259" y="151" className="scene-label">
                    UI & delivery
                  </text>
                  <text x="259" y="170" className="scene-note">
                    latency · deployment
                  </text>
                </g>
                <g className="scene-stack-complete">
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
              </>
            ) : null}
            {sceneIndex === 2 ? (
              <>
                <g stroke="#88a67a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path data-rig-wire="0" pathLength="1" strokeDasharray="1" d="M215 169V215H387" />
                  <path data-rig-wire="1" pathLength="1" strokeDasharray="1" d="M447 254V326H285V278H305" />
                  <path data-rig-loose-wire="0" d="M387 215Q300 280 240 245" />
                  <path data-rig-loose-wire="1" d="M447 254Q400 340 260 245" />
                </g>
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
                  <text x="246" y="139" className="scene-label">
                    UI
                  </text>
                  <text x="218" y="157" className="scene-note">
                    user action
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
                  <text x="400" y="227" className="scene-note">
                    auth · domain
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
                  <text x="338" y="293" className="scene-label">
                    Data
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
                  <text x="390" y="95" className="scene-note">
                    error → response
                  </text>
                </g>
                <circle cx="215" cy="169" r="5" fill="#dce9cd" stroke="#688062" strokeWidth="2" />
                <circle cx="305" cy="278" r="5" fill="#dce9cd" stroke="#688062" strokeWidth="2" />
                <g data-rig-socket="0" transform="translate(215 169)">
                  <rect x="-5" y="2" width="10" height="14" rx="3" fill="#dfb857" stroke="#89793f" strokeWidth="1.5" />
                  <path d="M-2 2V0m4 2V0" stroke="#46664e" strokeWidth="2" />
                </g>
                <g data-rig-socket="1" transform="translate(305 278) rotate(90)">
                  <rect x="-5" y="2" width="10" height="14" rx="3" fill="#dfb857" stroke="#89793f" strokeWidth="1.5" />
                  <path d="M-2 2V0m4 2V0" stroke="#46664e" strokeWidth="2" />
                </g>
                <g className="scene-connect-spark" stroke="#dfb857" strokeWidth="3" strokeLinecap="round">
                  <path d="M205 175l-5 5m25-5 5 5m-15-25v-6" />
                </g>
                <circle
                  className="scene-packet"
                  cx="215"
                  cy="169"
                  r="6"
                  fill="#008363"
                />
              </>
            ) : null}
            {sceneIndex === 3 ? (
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
                  one-working-path.ts
                </text>
                <g className="scene-code-line">
                  <text x="226" y="151" className="scene-code">
                    const input = validate(req);
                  </text>
                </g>
                <g className="scene-code-line scene-delay-one">
                  <text x="226" y="181" className="scene-code">
                    await authorize(user);
                  </text>
                </g>
                <g className="scene-code-line scene-delay-two">
                  <text x="226" y="211" className="scene-code">
                    const result = await run(input);
                  </text>
                </g>
                <g className="scene-code-line scene-delay-three">
                  <text x="226" y="241" className="scene-code">
                    return respond(result);
                  </text>
                  <rect
                    className="scene-cursor"
                    x="388"
                    y="229"
                    width="7"
                    height="15"
                    fill="#d9e9bf"
                  />
                </g>
                <g className="scene-keyboard">
                  <path
                    d="M198 285h57l10 19h-78Z"
                    fill="#dce9cd"
                    stroke="#688062"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M203 291h47m-51 6h57m-45-9v12m10-12v12m10-12v12m10-12v12"
                    stroke="#8da77e"
                    strokeWidth="1.5"
                  />
                  <rect
                    className="scene-key-flash"
                    x="203"
                    y="292"
                    width="9"
                    height="5"
                    rx="1"
                    fill="#dfb857"
                  />
                  <rect className="scene-key-flash" x="235" y="294" width="9" height="5" rx="1" fill="#dfb857" />
                </g>
                <g className="scene-build-finish">
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
                  <text x="312" y="292" className="scene-note">
                    UI → API → data
                  </text>
                </g>
              </>
            ) : null}
            {sceneIndex === 4 ? (
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
                {["unit + integration", "browser journey", "build + deploy"].map(
                  (label, index) => (
                    <g
                      key={label}
                    >
                      <circle
                        cx="218"
                        cy={216 + index * 34}
                        r="9"
                        fill="#dce9cd"
                      />
                      <path
                        data-rig-check={index}
                        d={`m213 ${216 + index * 34} 4 4 7-8`}
                        stroke="#008363"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <text x="238" y={221 + index * 34} className="scene-note">
                        {label}
                      </text>
                    </g>
                  ),
                )}
                <rect className="scene-launch-button" x="204" y="310" width="28" height="16" rx="6" fill="#dfb857" stroke="#688062" strokeWidth="2" />
                <path d="m214 318 4-4 4 4m-4-4v8" stroke="#fffdf4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                <g className="scene-share-finish">
                  <rect
                    x="409"
                    y="272"
                    width="87"
                    height="32"
                    rx="16"
                    fill="#dce9cd"
                  />
                  <circle cx="426" cy="288" r="4" fill="#008363" />
                  <text x="438" y="293" className="scene-note">
                    deployed
                  </text>
                </g>
              </>
            ) : null}
          </g>
        ))}
        <g className="scene-builder-position" transform="translate(42 0)">
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
            <g stroke="#8da77e" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
              <path data-rig-arm="left" d="M73 254L58 281L72 289" />
              <path data-rig-arm="right" d="M148 254L166 270L173 270" />
            </g>
            <circle data-rig-hand="left" cx="72" cy="289" r="6" fill="#e4eccc" />
            <circle data-rig-hand="right" cx="173" cy="270" r="6" fill="#e4eccc" />
            <g className="scene-builder-pencil" visibility="hidden">
              <path d="M0 0L6-7" stroke="#dfb857" strokeWidth="7" strokeLinecap="round" />
              <path d="M6-7L8-10" stroke="#46664e" strokeWidth="3" strokeLinecap="round" />
            </g>
            <g className="scene-builder-plug" visibility="hidden">
              <rect x="-5" y="2" width="10" height="14" rx="3" fill="#dfb857" stroke="#89793f" strokeWidth="1.5" />
              <path d="M-2 2V0m4 2V0" stroke="#46664e" strokeWidth="2" strokeLinecap="round" />
            </g>
            <g className="scene-builder-head">
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
          </g>
        </g>
        <path
          d="M36 326v-28m0 16c-17-4-17-17-17-17 16 0 17 17 17 17m0-7c15-5 15-18 15-18-15 3-15 18-15 18"
          stroke="#8da77e"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <div className="journey-scene-captions">
        {steps.map((step, index) => (
          <p
            key={step.short}
            className="journey-scene-caption"
            data-active={stage === index}
          >
            {step.scene}
          </p>
        ))}
      </div>
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
  const [settledChapter, setSettledChapter] = useState<number | null>(null);
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
      setSettledChapter(null);
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
    // Retain the outgoing pose until the 440 ms fade-out/fade-in sequence ends.
    const timer = window.setTimeout(() => setOutgoing(null), 500);
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
      data-entrance={settledChapter !== active}
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
          <BuilderScene
            stage={active}
            outgoing={outgoing}
            running={running}
            settled={settledChapter === active || !playing || reduced}
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
