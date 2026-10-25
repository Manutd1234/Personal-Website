import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { ActivePlaybackClock, BUILD_ACTION_BEATS_MS, sceneActionStart, sceneBeatAt } from "./build-journey-timeline";

const actions = ["Define the requirements", "Test the approach", "Trace the data flow", "Build, test & review", "Deploy & observe"];
const titles = ["Define requirements", "Prototype and compare", "Design interfaces and data flow", "Implement, test and review", "Deploy and observe"];
const results = [
  "The example request tracker needs to accept a request, explain missing fields and confirm that it was saved.",
  "The engineer prototypes that request form and chooses an API and persistent storage to save requests reliably.",
  "The form sends a request to the API, which validates it before storage. Invalid input returns to the form with a useful explanation.",
  "The engineer implements the same form, API and storage path, tests valid and invalid requests, and reviews the change.",
  "The reviewed request tracker is deployed. The engineer checks its health and uses feedback as the next requirement.",
];

const screenStages = [
  { state: "Defined", working: "Defining", cards: [["NEED", "Submit a request"], ["RULE", "Explain errors"], ["CHECK", "Confirm it saved"]], notes: ["One feature, from a need to a release.", "Let a user submit a request.", "Missing fields need a useful explanation.", "Success means a saved request and a receipt."] },
  { state: "Chosen", working: "Comparing", cards: [["TRY", "Draft the form"], ["COMPARE", "Compare saves"], ["CHOOSE", "API + storage"]], notes: ["Prototype the requirements from stage 1.", "Try the form before building the system.", "Compare a temporary save with persistent storage.", "Choose the API and storage for the design."] },
  { state: "Mapped", working: "Designing", cards: [["BROWSER", "Form"], ["SERVER", "API"], ["DATA", "Storage"]], notes: ["Map the approach chosen in stage 2.", "Form → API: send the request.", "Valid input: API → storage.", "Invalid? API → form. Nothing saved."] },
  { state: "Verified", working: "Building", cards: [["BUILD", "Wire the flow"], ["TEST", "Valid + invalid"], ["REVIEW", "Check the change"]], notes: ["Implement the form → API → storage design.", "Connect one complete request journey.", "Test saved requests and helpful error messages.", "The reviewed build is ready to release."] },
  { state: "Live", working: "Deploying", cards: [["BUILD", "Release v1"], ["SERVICE", "Verify live"], ["FEEDBACK", "Next need"]], notes: ["Deploy the verified build from stage 4.", "Send the reviewed release to the live service.", "Check errors, latency and saved requests.", "Feedback becomes the next requirement."] },
] as const;
// Each gesture leads the matching screen response by a perceptible half-second.
const actionBeats = BUILD_ACTION_BEATS_MS;

/** The monitor keeps all system diagrams in one plane, away from the character. */
function JourneyNodeIcon({ stage, index }: { stage: number; index: number }) {
  const architecture = [
    <g key="form"><rect x="7" y="3" width="26" height="26" rx="3" /><path d="M7 10H33M12 16H27M12 22H22" /></g>,
    <g key="api"><rect x="5" y="4" width="30" height="24" rx="4" /><path d="M15 11L10 16L15 21M25 11L30 16L25 21M22 10L18 22" /></g>,
    <g key="store"><ellipse cx="20" cy="7" rx="13" ry="5" /><path d="M7 7V24C7 31 33 31 33 24V7M7 15C7 22 33 22 33 15" /></g>,
  ];
  const release = [
    <path key="package" d="M7 9L20 3L33 9L20 15ZM7 9V24L20 30L33 24V9M20 15V30M14 6L27 12V19" />,
    <g key="cloud"><path d="M9 25H31C40 24 39 12 30 12C28 1 11 1 10 13C0 12 0 25 9 25Z" /><path className="montage-cloud-check" d="M14 17L19 22L27 13" /></g>,
    <path key="feedback" d="M6 4H34V23H18L11 29V23H6ZM12 10H27M12 16H23" />,
  ];
  return <svg className="montage-node-icon" viewBox="0 0 40 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{(stage === 2 ? architecture : release)[index]}</svg>;
}

/** The workspace and task stay in place while the same feature takes shape. */
export default function BuildJourneyScene({ stage, description, onFocusChange, onReplay, animate, reducedMotion }: {
  stage: number;
  description: string;
  onFocusChange: (focused: boolean) => void;
  onReplay: () => void;
  animate: boolean;
  reducedMotion: boolean;
}) {
  const id = useId();
  const [action, setAction] = useState({ stage: -1, count: 0, immediate: false, start: 0 });
  const acted = action.stage === stage;
  const replay = (step = 0) => {
    onReplay();
    setAction(previous => ({ stage, count: previous.count + 1, immediate: !animate, start: sceneActionStart(step) }));
  };
  const [beat, setBeat] = useState({ stage, run: 0, value: 0 });
  const clock = useRef({ stage, run: action.count, playback: new ActivePlaybackClock() });
  const screen = screenStages[stage];
  const currentRun = beat.stage === stage && beat.run === action.count;
  const visibleBeat = reducedMotion ? actionBeats.length : currentRun ? beat.value : 0;
  const completed = Math.min(3, Math.floor(visibleBeat / 2));
  const working = visibleBeat > 0 && visibleBeat < 7;
  const selecting = working && (stage === 1 || stage === 2 || stage === 4);
  const gesture = working && visibleBeat % 2 === 1;
  const pressing = selecting && gesture;
  const sketching = working && stage === 0;
  const guiding = working && stage === 2;
  const inspecting = stage === 3 && visibleBeat >= 5 && visibleBeat < 8;
  const celebrating = stage === 4 && visibleBeat >= 7;
  const delivering = stage === 4 && visibleBeat >= 2 && visibleBeat < 4;
  const requestMotion = visibleBeat >= 6 && visibleBeat < 8 ? "invalid" : visibleBeat >= 4 && visibleBeat < 6 ? "save" : visibleBeat >= 2 && visibleBeat < 4 ? "send" : "idle";
  const typing = working && stage === 3 && !inspecting;
  const finished = visibleBeat >= 7;
  const pointerIndex = Math.min(2, Math.max(0, Math.floor((visibleBeat - 1) / 2)));
  // Reach, act, then let the screen respond on the following beat. The elbow
  // and wrist travel together, keeping the larger gestures attached to the body.
  const handX = selecting ? (pressing ? 20 : 10) : typing ? (gesture ? 7 : -3) : 0;
  const handY = selecting ? (pressing ? 6 : -3) : typing ? (gesture ? -5 : 1) : 0;
  const leftX = sketching ? -5 + pointerIndex * 3 : guiding ? -3 : inspecting ? 8 + (gesture ? -3 : 3) : typing ? (gesture ? -5 : 4) : 0;
  const leftY = sketching ? (gesture ? -5 : -9) + pointerIndex : guiding ? -3 : inspecting ? -29 + (gesture ? -2 : 1) : typing ? (gesture ? 1 : -6) : 0;
  const leftWrist = { x: 292 + leftX, y: 170 + leftY };
  const rightWrist = { x: 346 + handX, y: 170 + handY };
  // Keep upper arms beside the torso. The forearms carry the action, without
  // an unconstrained elbow solver swinging the sleeves out between poses.
  const leftElbow = {
    x: sketching ? 275 : inspecting ? 276 : typing && !gesture ? 278 : 277,
    y: sketching ? 153 : inspecting ? 150 : typing && !gesture ? 156 : 155,
  };
  const rightElbow = {
    x: selecting ? 365 : typing ? 362 : 363,
    y: selecting ? (pressing ? 153 : 151) : typing && !gesture ? 156 : 155,
  };
  // One smooth segment meets the hand exactly; there is no overshoot or
  // backward tail at the wrist as the magnifier and mouse poses change.
  const leftForearm = `M${leftElbow.x} ${leftElbow.y}Q${(leftElbow.x + leftWrist.x) / 2 - 2} ${(leftElbow.y + leftWrist.y) / 2 + 2} ${leftWrist.x} ${leftWrist.y}`;
  const rightForearm = `M${rightElbow.x} ${rightElbow.y}Q${(rightElbow.x + rightWrist.x) / 2 + 2} ${(rightElbow.y + rightWrist.y) / 2 + 2} ${rightWrist.x} ${rightWrist.y}`;
  const poseTransition = { duration: reducedMotion ? 0 : .5, ease: [0.22, 0.61, 0.36, 1] as const };

  // Schedule only the eight visible beats; pauses preserve exact active time.
  useEffect(() => {
    const playback = clock.current.playback;
    // Render readiness belongs to state, not the mutable playback clock. A new
    // paused replay must commit its identity even when it also ends on beat 8.
    const commitBeat = (value: number) => setBeat(previous =>
      previous.stage === stage && previous.run === action.count && previous.value === value
        ? previous
        : { stage, run: action.count, value });
    if (clock.current.stage !== stage || clock.current.run !== action.count) {
      const replayRequested = clock.current.run !== action.count && action.stage === stage;
      const completeImmediately = replayRequested && action.immediate;
      const elapsed = completeImmediately ? actionBeats[actionBeats.length - 1] : replayRequested ? action.start : 0;
      // A replay belongs to this visit only. Later autoplay cycles start fresh,
      // and must not re-announce an earlier interaction as a new completed run.
      if (clock.current.stage !== stage && !replayRequested && action.stage !== -1) {
        setAction(previous => ({ ...previous, stage: -1 }));
      }
      clock.current.stage = stage;
      clock.current.run = action.count;
      playback.reset(elapsed);
      commitBeat(sceneBeatAt(elapsed));
    }
    playback.setRunning(animate, performance.now());
    if (!animate) return;
    let timer = 0;
    const scheduleNext = () => {
      const elapsed = playback.elapsedAt(performance.now());
      const nextBeat = sceneBeatAt(elapsed);
      commitBeat(nextBeat);
      if (nextBeat < actionBeats.length) {
        timer = window.setTimeout(scheduleNext, playback.remainingUntil(actionBeats[nextBeat], performance.now()));
      }
    };
    scheduleNext();
    return () => {
      window.clearTimeout(timer);
      playback.setRunning(false, performance.now());
    };
  }, [animate, stage, action.count, action.stage, action.immediate, action.start]);

  return <div
    className="journey-scene journey-montage"
    data-stage={stage}
    data-acted={acted}
    data-beat={visibleBeat}
    data-typing={typing}
    data-sketching={sketching}
    data-guiding={guiding}
    data-inspecting={inspecting}
    data-celebrating={celebrating}
    data-connecting={stage === 2 && working}
    data-delivering={delivering}
    data-phase={pointerIndex}
    data-completed={completed}
    data-pressing={pressing}
    data-finished={finished}
    onFocusCapture={() => onFocusChange(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onFocusChange(false); }}
  >
    <svg className="journey-scene-svg" viewBox="0 0 640 584" role="img" aria-label={`From an idea to a useful release: ${titles[stage]}`} aria-describedby={`${id}-description`}>
      <desc id={`${id}-description`}>{`${description} The same illustrative request tracker moves through all five stages. The engineer writes, compares, designs and reviews it. The monitor shows the form, API and storage, including the return path for invalid input. A release package moves to the live service, then monitoring and feedback inform the next requirement. Select a monitor step to replay it.`}</desc>
      <defs>
        <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#bed0c7" strokeWidth=".7" opacity=".45" /></pattern>
      </defs>
      <rect width="640" height="584" fill="#f2f6eb" />
      <path d="M0 0H640V584H0Z" fill={`url(#${id}-grid)`} />
      <path d="M0 169L320 58L640 169" fill="none" stroke="#c9ddd8" strokeWidth="2" />
      <path d="M320 58V156" stroke="#c9ddd8" strokeWidth="2" />
      <ellipse cx="320" cy="567" rx="269" ry="15" fill="#ccdbca" />

      {/* Artifacts remain in the workspace as the feature acquires an approach, checks and a release. */}
      <g className="montage-artifact montage-spec" data-complete={stage > 0 || completed >= 1}>
        <path d="M35 101L112 80L155 104L78 128Z" fill="#d7e9fb" stroke="#335746" strokeWidth="2" strokeLinejoin="round" />
        <path d="M35 101V119L78 145V128M78 145L155 121V104" fill="#98c4eb" stroke="#335746" strokeWidth="2" strokeLinejoin="round" />
        <path d="M56 99L111 85L137 100L82 117Z" fill="#fffefa" stroke="#335746" strokeWidth="1.5" />
        <path className="montage-ink-line" d="M72 100L106 91M81 106L123 95" stroke="#5489b0" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="montage-artifact montage-stack" data-complete={stage > 1 || (stage === 1 && completed >= 2)}>
        <path d="M485 95L536 80L578 103L527 119Z" fill="#c6e6ba" stroke="#335746" strokeWidth="2" strokeLinejoin="round" />
        <path d="M485 95V124L527 148V119L578 103V133L527 148" fill="#7ebf89" stroke="#335746" strokeWidth="2" strokeLinejoin="round" />
        <path d="M497 114L516 125M538 124L562 116" stroke="#335746" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="montage-artifact montage-contract" data-complete={stage > 2 || (stage === 2 && completed >= 2)}>
        <path d="M158 83L184 69L209 83L183 98Z" fill="#f5ca8b" stroke="#335746" strokeWidth="2" />
        <path d="M158 83V105L183 120V98L209 83V105L183 120" fill="#e8b263" stroke="#335746" strokeWidth="2" />
        <path d="M173 84L179 81M186 86L192 83" stroke="#335746" strokeWidth="2" />
      </g>
      <g className="montage-artifact montage-tests" data-complete={stage > 3 || (stage === 3 && completed >= 2)}>
        <path d="M431 48L468 36L493 51L456 64Z" fill="#f7c0af" stroke="#335746" strokeWidth="2" />
        <path d="M431 48V72L456 88V64L493 51V75L456 88" fill="#e99781" stroke="#335746" strokeWidth="2" />
        <path d="M443 52L450 57L464 47" fill="none" stroke="#335746" strokeWidth="2" />
      </g>
      <g className="montage-artifact montage-release" data-complete={stage === 4 && completed >= 2}>
        <path d="M80 49Q75 32 92 29Q94 12 112 21Q127 13 135 29Q154 30 150 46Z" fill="#b5d5f4" stroke="#335746" strokeWidth="2" />
        <path d="M116 52V70M109 63L116 70L123 63" fill="none" stroke="#4e8eba" strokeWidth="2" strokeLinecap="round" />
      </g>


      <g className="montage-idea-bubble" aria-hidden="true">
        <path d="M210 22H249Q257 22 257 31V53Q257 61 249 61H238L226 70V61H210Q202 61 202 53V31Q202 22 210 22Z" fill="#fff8db" stroke="#c6b77d" strokeWidth="1.5" />
        <path d="M221 38Q221 29 230 29Q239 29 239 38Q239 43 234 47V51H226V47Q221 43 221 38M226 55H234" fill="none" stroke="#8e8645" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="montage-choice-pieces" aria-hidden="true">
        <g className="montage-choice-piece"><path d="M515 55L536 49L553 58L532 65Z" fill="#e6efb6" stroke="#68856c" strokeWidth="1.5" /><path d="M515 55V67L532 76V65L553 58V70L532 76" fill="#b6cd83" stroke="#68856c" strokeWidth="1.5" /></g>
        <g className="montage-choice-piece"><path d="M565 63L586 57L603 66L582 73Z" fill="#dceaf5" stroke="#688594" strokeWidth="1.5" /><path d="M565 63V75L582 84V73L603 66V78L582 84" fill="#a3c9e3" stroke="#688594" strokeWidth="1.5" /></g>
      </g>

      {/* Hands and controls stay above the foreground monitor, so each action is visible. */}
      <g className="montage-engineer">
        <path d="M262 157V117Q262 103 276 103H358Q373 103 374 119V169" fill="#81a89a" stroke="#335746" strokeWidth="2.5" />
        <path d="M276 167L281 118Q286 108 301 108H336Q353 108 361 123L368 171" fill="#69a585" stroke="#335746" strokeWidth="2.5" />
        <path d="M303 99V112L319 124L334 111V96" fill="#e8b48f" stroke="#6f5141" strokeWidth="2" />
        <path d="M301 108L319 123L334 108L344 116L329 134L319 127L310 135L291 117Z" fill="#fffaf0" stroke="#335746" strokeWidth="2" />
        <path d="M319 130V174" stroke="#335746" strokeWidth="1.8" />
        <motion.g className="montage-person-head" animate={{ rotate: celebrating ? -9 : inspecting ? 5 : sketching ? -10 : guiding ? -8 + pointerIndex * 4 : finished ? -3 : selecting ? pointerIndex * 3 - 3 : typing ? 5 : 0, y: typing || sketching ? 3 : celebrating ? -2 : 0 }} transition={poseTransition}>
          <path d="M290 57Q291 31 317 31Q344 32 346 57L343 84Q341 101 323 106Q306 105 296 93L291 77" fill="#efc39d" stroke="#6f5141" strokeWidth="2" />
          <path d="M292 76Q283 63 288 47Q293 27 317 26Q342 27 349 46L345 60L337 54L331 43Q315 54 299 49L299 74Z" fill="#284b3e" stroke="#284b3e" strokeWidth="2" />
          <path d="M296 43Q309 33 324 36M330 34Q340 37 343 44" fill="none" stroke="#658a6e" strokeWidth="2" strokeLinecap="round" />
          <path d="M298 71Q286 64 289 78Q292 86 298 84" fill="#efc39d" stroke="#6f5141" strokeWidth="1.5" />
          <path d="M307 64L314 63M329 64L336 67" stroke="#335746" strokeWidth="2.3" strokeLinecap="round" />
          <g className="montage-person-eyes" fill="#335746"><ellipse cx="312" cy="72" rx="2" ry="2.7" /><ellipse cx="333" cy="73" rx="2" ry="2.7" /></g>
          <path d="M328 74L334 83L328 84" fill="none" stroke="#9c7156" strokeWidth="1.8" strokeLinecap="round" />
          <motion.path d="M313 93Q321 98 328 92" animate={{ d: celebrating ? "M312 91Q322 105 332 91" : "M313 93Q321 98 328 92" }} transition={poseTransition} fill="none" stroke="#9c7156" strokeWidth="1.8" strokeLinecap="round" />
        </motion.g>
        <g className="montage-control-surface">
          <path d="M279 139H354L361 170H273Z" fill="#315746" stroke="#244336" strokeWidth="2" strokeLinejoin="round" />
          <path d="M285 144H349L353 164H280Z" fill="#d9ead4" />
          <path className="montage-control-code" d="M291 150H319M291 155H335M291 160H312" fill="none" stroke="#65967d" strokeWidth="2" strokeLinecap="round" />
          <path d="M273 170H361L390 190H249Z" fill="#dce8d3" stroke="#335746" strokeWidth="2" strokeLinejoin="round" />
          <path className="montage-control-keys" d="M270 175H339M263 180H344M283 171L275 184M300 171L296 184M320 171V184M337 171L341 184" stroke="#8ba98d" strokeWidth="1.6" />
          <path d="M307 184H337L341 188H303Z" fill="#a9c5ac" />
          <ellipse cx="364" cy="183" rx="13" ry="8" fill="#f4f3df" stroke="#53765c" strokeWidth="1.8" /><path d="M364 176V181" stroke="#53765c" strokeWidth="1.4" /><circle className="montage-control-touch" cx="364" cy="181" r="12" fill="none" stroke="#e79271" strokeWidth="2.5" />
        </g>
        {/* The paper shares the hand's coordinate system, so the pencil lands
            on it without a backward reach or a floating grip. */}
        <g className="montage-note-prop" aria-hidden="true">
          <path d="M270 157L312 153L327 183L280 187Z" fill="#fff7d7" stroke="#ae9d70" strokeWidth="1.6" />
          <path className="montage-note-ink" d="M284 164L305 162M287 170L312 167M289 176L311 173M292 181L316 177" stroke="#63877a" strokeWidth="1.7" strokeLinecap="round" fill="none" pathLength="100" />
        </g>
        <g className="montage-arm-left">
          <motion.path d="M284 123L277 151" animate={{ d: `M284 123L${leftElbow.x} ${leftElbow.y - 4}` }} transition={poseTransition} stroke="#335746" strokeWidth="25" strokeLinecap="round" />
          <motion.path d="M284 123L277 151" animate={{ d: `M284 123L${leftElbow.x} ${leftElbow.y - 4}` }} transition={poseTransition} stroke="#69a585" strokeWidth="20" strokeLinecap="round" />
          <motion.path d="M277 155Q282.5 164.5 292 170" animate={{ d: leftForearm }} transition={poseTransition} fill="none" stroke="#6f5141" strokeWidth="15" strokeLinecap="round" />
          <motion.path d="M277 155Q282.5 164.5 292 170" animate={{ d: leftForearm }} transition={poseTransition} fill="none" stroke="#efc39d" strokeWidth="12" strokeLinecap="round" />
          <motion.g animate={{ x: leftX, y: leftY }} transition={poseTransition}>
            <g className="montage-hand-left">
              <g className="montage-pencil" aria-hidden="true"><path d="M302 153L307 152L312 178L308 184L305 179Z" fill="#e9bb68" stroke="#8d774f" strokeWidth="1.2" /><path d="M308 184L312 178L305 179Z" fill="#f7e1b5" /><path d="M308 184L309 180" stroke="#465e4e" strokeWidth="1.5" /></g>
              <path d="M289 165Q295 163 303 170L308 174Q310 178 306 178L297 173L302 178Q302 181 298 179L290 175Z" fill="#efc39d" stroke="#9c7156" strokeWidth="1.4" strokeLinejoin="round" />
              <g className="montage-magnifier" aria-hidden="true"><path d="M303 170L313 152" stroke="#577e6a" strokeWidth="5" strokeLinecap="round" /><circle cx="318" cy="143" r="14" fill="#dceef4cc" stroke="#3f6b57" strokeWidth="3" /><path d="M312 136Q318 132 324 138" fill="none" stroke="#fffef6" strokeWidth="3" strokeLinecap="round" /></g>
            </g>
          </motion.g>
        </g>
        <g className="montage-arm-right">
          <motion.path d="M354 124L363 151" animate={{ d: `M354 124L${rightElbow.x} ${rightElbow.y - 4}` }} transition={poseTransition} stroke="#335746" strokeWidth="25" strokeLinecap="round" />
          <motion.path d="M354 124L363 151" animate={{ d: `M354 124L${rightElbow.x} ${rightElbow.y - 4}` }} transition={poseTransition} stroke="#69a585" strokeWidth="20" strokeLinecap="round" />
          <g className="montage-working-forearm">
            <motion.path d="M363 155Q356.5 164.5 346 170" animate={{ d: rightForearm }} transition={poseTransition} fill="none" stroke="#6f5141" strokeWidth="15" strokeLinecap="round" />
            <motion.path d="M363 155Q356.5 164.5 346 170" animate={{ d: rightForearm }} transition={poseTransition} fill="none" stroke="#efc39d" strokeWidth="12" strokeLinecap="round" />
            <motion.g animate={{ x: handX, y: handY }} transition={poseTransition}><g className="montage-hand-right">
              <path d="M349 165Q342 163 335 170L330 174Q328 178 332 178L341 173L336 178Q336 181 340 179L348 175Z" fill="#efc39d" stroke="#9c7156" strokeWidth="1.4" strokeLinejoin="round" />
            </g></motion.g>
          </g>
        </g>
      </g>
      <g className="montage-review-seal" aria-hidden="true"><circle cx="472" cy="57" r="18" fill="#eef5df" stroke="#7ba075" strokeWidth="1.6" /><path d="M462 57L469 64L482 49" fill="none" stroke="#438361" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></g>
      <g transform="translate(0 80)">
      {/* A shallow isometric desk grounds the upright, readable monitor. */}
      <path d="M37 425H601L626 449H13Z" fill="#e9d6ad" stroke="#335746" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M13 449H626V466H13Z" fill="#c1ad87" stroke="#335746" strokeWidth="2.2" />
      <path d="M42 467L38 491M595 467L602 491" stroke="#335746" strokeWidth="8" strokeLinecap="round" />
      <path d="M290 403L282 431H358L349 403" fill="#8bab99" stroke="#335746" strokeWidth="2" />
      <path d="M272 432H367" stroke="#335746" strokeWidth="5" strokeLinecap="round" />
      <rect x="19" y="108" width="602" height="303" rx="13" fill="#365c4c" stroke="#244336" strokeWidth="2.5" />
      <rect x="30" y="120" width="580" height="276" rx="7" fill="#fffef9" />
      <circle cx="320" cy="403" r="2" fill="#bdd3bd" />
      <g className="montage-cup"><path d="M541 417H563L559 440H545Z" fill="#fff9dc" stroke="#42634b" strokeWidth="1.7" /><path d="M563 422Q578 421 573 430Q570 435 561 433" fill="none" stroke="#42634b" strokeWidth="2" /><path className="montage-steam" d="M551 410Q546 405 551 399" fill="none" stroke="#8faa8e" strokeWidth="1.6" /></g>
      <g className="montage-plant"><path d="M80 429V405M80 416Q63 416 61 402Q78 403 80 416M80 408Q81 393 94 388Q97 402 80 408" fill="#89ba78" stroke="#42634b" strokeWidth="1.8" /><path d="M68 425H93L88 443H73Z" fill="#edc571" stroke="#42634b" strokeWidth="1.8" /></g>
      </g>
    </svg>

    <div className="montage-monitor" aria-label={`Project workspace: ${titles[stage]}`}>
      <header className="montage-window-heading">
        <span className="montage-window-dots" aria-hidden="true"><i /><i /><i /></span>
        <strong><span className="montage-example-label">Example:</span> request tracker</strong>
        <span className="montage-feature-state" data-ready={finished}>
          <AnimatePresence initial={false} mode="wait"><motion.span key={`${stage}-${finished}`} initial={animate ? { opacity: 0, y: 3 } : false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: reducedMotion ? 0 : .18 }}>{finished ? screen.state : stage === 4 && completed >= 2 ? "Observing" : screen.working}</motion.span></AnimatePresence>
        </span>
      </header>
      <div className="montage-continuity-screen" data-diagram={stage === 2 || stage === 4}>
        <div className="montage-step-cards" data-flow={stage === 2 || stage === 4}>
          {screen.cards.map(([tag, label], index) => <button type="button" className="montage-step-card" data-complete={completed > index} data-current={working && pointerIndex === index} key={index} onClick={() => replay(index)} aria-label={`Watch the engineer: ${label.toLowerCase()}`}>
            <span className="montage-step-index" aria-hidden="true">{tag}</span>
            <AnimatePresence initial={false} mode="wait"><motion.div key={`${stage}-${index}`} initial={animate ? { opacity: 0, y: 5 } : false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: reducedMotion ? 0 : .28, delay: reducedMotion ? 0 : index * .035 }}>
              {(stage === 2 || stage === 4) && <JourneyNodeIcon stage={stage} index={index} />}
              <b>{stage === 4 && index === 1 && completed >= 2 ? "Healthy" : label}</b>
            </motion.div></AnimatePresence>
            <i className="montage-step-check" aria-hidden="true">✓</i>
            {index < 2 && <i className="montage-flow-arrow" data-active={completed >= index + 1} aria-hidden="true">→</i>}
          </button>)}
          {stage === 2 && <svg className="montage-return-path" data-visible={completed >= 3} viewBox="0 0 540 22" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M270 1V15H90V1M85 7L90 1L95 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="100" /></svg>}
          {stage === 2 && <span className="montage-request-token" key={`request-${action.count}`} data-motion={requestMotion} aria-hidden="true" />}
          {stage === 4 && <span className="montage-release-package" key={`delivery-${action.count}`} data-travel={delivering} aria-hidden="true"><svg viewBox="0 0 24 24" fill="#f4ce87" stroke="#456d56" strokeWidth="1.5" strokeLinejoin="round"><path d="M3 6L12 2L21 6L12 10ZM3 6V17L12 22L21 17V6M12 10V22M8 4L17 8V13" /></svg></span>}
        </div>
        <p className="montage-process-note" data-return={stage === 2 && completed >= 3} data-feedback={stage === 4 && completed >= 3}><span aria-hidden="true">{stage === 2 && completed >= 3 || stage === 4 && completed >= 3 ? "↶" : "→"}</span>{screen.notes[completed]}</p>
      </div>
      <motion.div
        className="montage-screen-cursor"
        aria-hidden="true"
        animate={{ left: working ? `${19 + pointerIndex * 31}%` : "88%", top: working ? "62%" : "84%", opacity: selecting ? 1 : 0 }}
        transition={poseTransition}
      >
        <span className="montage-screen-click" data-click={pressing} />
        <svg viewBox="0 0 24 28"><path d="M3 2L20 15L12 16L8 24Z" fill="#315c49" stroke="#fffdf3" strokeWidth="2" strokeLinejoin="round" /></svg>
      </motion.div>
    </div>
    <button className="journey-monitor-action" type="button" aria-controls={`${id}-result`} onClick={() => replay()}>
      <span>{acted ? "Replay this moment" : actions[stage]}</span><span aria-hidden="true">{acted ? "↻" : "→"}</span>
    </button>
    <span className="journey-action-status" id={`${id}-result`} role="status" aria-live="polite" aria-atomic="true">{acted && finished ? `${results[stage]} Run ${action.count} complete.` : ""}</span>
  </div>;
}
