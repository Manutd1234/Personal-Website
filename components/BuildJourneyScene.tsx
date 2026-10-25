import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

const actions = ["Try a missing task name", "Compare the choices", "Follow the user journey", "Run checks & review", "Release & collect feedback"];
const replays = ["Try a useful task name", "Replay comparison", "Follow it again", "Run checks again", "Replay the release"];
const titles = ["Understand the need", "Choose the tools", "Design the flow", "Build, test and review", "Release and learn"];
const results = [
  "The task board asks for a task name before saving. Clear feedback helps the user fix the problem.",
  "The example combines a React interface, TypeScript application logic and a SQL database. The choices favor fast iteration, clear responsibilities and reliable storage.",
  "The user adds a task, the application checks and saves it, and the board shows the new task with a confirmation.",
  "The example feature passes checks for normal use and missing input, then is reviewed as a small change.",
  "The example passes build and test checks and is published. User feedback becomes the next improvement: adding a due date.",
];

const screenStages = [
  { label: "A useful first version", state: "Idea", note: "A clear goal, a small scope and helpful feedback.", cards: [["USER NEED", "Add a task", "Keep track of work"], ["FEEDBACK", "Give it a name", "Make mistakes easy to fix"], ["FIRST VERSION", "Mark it done", "Finish one useful journey"]] },
  { label: "Choose the building blocks", state: "Planned", note: "Try the uncertain part before committing to the tools.", cards: [["INTERFACE", "React", "Fast iteration"], ["APP LOGIC", "TypeScript", "Clear changes"], ["STORAGE", "SQL", "Reliable saves"]] },
  { label: "Connect the user journey", state: "Connected", note: "Every action has a result the user can understand.", cards: [["USER ACTION", "Add task", "Prepare the demo"], ["APP LOGIC", "Check & save", "Keep the task safe"], ["FEEDBACK", "Show result", "The new task appears"]] },
  { label: "Make a small, complete change", state: "Verified", note: "Build, test and review before adding the next feature.", cards: [["BUILD", "One feature", "Works from end to end"], ["TEST", "Check behavior", "Normal use and mistakes"], ["REVIEW", "Clear changes", "Ready to merge"]] },
  { label: "Put it in people’s hands", state: "Live", note: "User feedback: “Could I add a due date?” → the next iteration.", cards: [["BUILD", "Package it", "A repeatable release"], ["CHECK", "Try it live", "Verify the user journey"], ["PUBLISH", "Listen & learn", "Improve with feedback"]] },
] as const;
const actionBeats = [650, 1600, 2750, 3900, 5050];

/** The workspace and task stay in place while the same feature takes shape. */
export default function BuildJourneyScene({ stage, description, onFocusChange, animate, reducedMotion }: {
  stage: number;
  description: string;
  onFocusChange: (focused: boolean) => void;
  animate: boolean;
  reducedMotion: boolean;
}) {
  const id = useId();
  const [action, setAction] = useState({ stage: -1, count: 0, invalid: false, immediate: false });
  const acted = action.stage === stage;
  const invalid = acted && action.invalid;
  const replay = () => setAction(previous => ({ stage, count: previous.count + 1, invalid: stage === 0 && !(previous.stage === 0 && previous.invalid), immediate: !animate }));
  const [beat, setBeat] = useState(0);
  const clock = useRef({ stage, run: action.count, elapsed: 0 });
  const screen = screenStages[stage];
  const visibleBeat = reducedMotion ? 5 : beat;

  // One purposeful sequence per stage, then a quiet hold. Pausing preserves its place.
  useEffect(() => {
    if (clock.current.stage !== stage || clock.current.run !== action.count) {
      const completeImmediately = action.stage === stage && action.immediate;
      clock.current = { stage, run: action.count, elapsed: completeImmediately ? actionBeats[actionBeats.length - 1] : 0 };
      setBeat(completeImmediately ? actionBeats.length : 0);
    }
    if (!animate) return;
    let frame = 0;
    let previous = performance.now();
    let previousBeat = actionBeats.filter(at => clock.current.elapsed >= at).length;
    const tick = (now: number) => {
      clock.current.elapsed += Math.min(now - previous, 100);
      previous = now;
      const nextBeat = actionBeats.filter(at => clock.current.elapsed >= at).length;
      if (nextBeat !== previousBeat) {
        previousBeat = nextBeat;
        setBeat(nextBeat);
      }
      if (nextBeat < actionBeats.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, stage, action.count, action.stage, action.immediate]);

  return <div className="journey-scene journey-montage" data-stage={stage} data-acted={acted} data-beat={visibleBeat}>
    <svg className="journey-scene-svg" viewBox="0 0 640 544" role="img" aria-labelledby={`${id}-title ${id}-description`}>
      <title id={`${id}-title`}>{`Building a task board: ${titles[stage]}`}</title>
      <desc id={`${id}-description`}>{`${description} A cartoon engineer types on a keyboard, selects components, follows the user journey, tests a feature and releases it from a control screen. The large monitor shows each part of the process.`}</desc>
      <defs>
        <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#bed0c7" strokeWidth=".7" opacity=".45" /></pattern>
      </defs>
      <rect width="640" height="544" fill="#f2f6eb" />
      <path d="M0 0H640V544H0Z" fill={`url(#${id}-grid)`} />
      <path d="M0 169L320 58L640 169" fill="none" stroke="#c9ddd8" strokeWidth="2" />
      <path d="M320 58V156" stroke="#c9ddd8" strokeWidth="2" />
      <ellipse cx="320" cy="527" rx="269" ry="15" fill="#ccdbca" />

      <g className="montage-workspace-links" aria-hidden="true" fill="none" stroke="#7daa97" strokeWidth="2" strokeLinecap="round">
        <path className="montage-workspace-link" data-complete={stage >= 1} d="M155 115Q320 183 485 118" />
        <path className="montage-workspace-link" data-complete={stage >= 2} d="M197 102Q313 151 447 78" />
        <path className="montage-workspace-link" data-complete={stage >= 4} d="M121 48Q270 3 442 48" />
      </g>
      {/* Artifacts remain in the workspace as the feature acquires a stack, tests and a release. */}
      <g className="montage-artifact montage-spec" data-complete={stage >= 0}>
        <path d="M35 101L112 80L155 104L78 128Z" fill="#d7e9fb" stroke="#335746" strokeWidth="2" strokeLinejoin="round" />
        <path d="M35 101V119L78 145V128M78 145L155 121V104" fill="#98c4eb" stroke="#335746" strokeWidth="2" strokeLinejoin="round" />
        <path d="M56 99L111 85L137 100L82 117Z" fill="#fffefa" stroke="#335746" strokeWidth="1.5" />
        <path className="montage-ink-line" d="M72 100L106 91M81 106L123 95" stroke="#5489b0" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="montage-artifact montage-stack" data-complete={stage >= 1}>
        <path d="M485 95L536 80L578 103L527 119Z" fill="#c6e6ba" stroke="#335746" strokeWidth="2" strokeLinejoin="round" />
        <path d="M485 95V124L527 148V119L578 103V133L527 148" fill="#7ebf89" stroke="#335746" strokeWidth="2" strokeLinejoin="round" />
        <path d="M497 114L516 125M538 124L562 116" stroke="#335746" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="montage-artifact montage-contract" data-complete={stage >= 2}>
        <path d="M158 83L184 69L209 83L183 98Z" fill="#f5ca8b" stroke="#335746" strokeWidth="2" />
        <path d="M158 83V105L183 120V98L209 83V105L183 120" fill="#e8b263" stroke="#335746" strokeWidth="2" />
        <path d="M173 84L179 81M186 86L192 83" stroke="#335746" strokeWidth="2" />
      </g>
      <g className="montage-artifact montage-tests" data-complete={stage >= 3}>
        <path d="M431 48L468 36L493 51L456 64Z" fill="#f7c0af" stroke="#335746" strokeWidth="2" />
        <path d="M431 48V72L456 88V64L493 51V75L456 88" fill="#e99781" stroke="#335746" strokeWidth="2" />
        <path d="M443 52L450 57L464 47" fill="none" stroke="#335746" strokeWidth="2" />
      </g>
      <g className="montage-artifact montage-release" data-complete={stage >= 4}>
        <path d="M80 49Q75 32 92 29Q94 12 112 21Q127 13 135 29Q154 30 150 46Z" fill="#b5d5f4" stroke="#335746" strokeWidth="2" />
        <path d="M116 52V70M109 63L116 70L123 63" fill="none" stroke="#4e8eba" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Hands and controls stay above the foreground monitor, so each action is visible. */}
      <g className="montage-engineer">
        <path d="M262 157V117Q262 103 276 103H358Q373 103 374 119V169" fill="#81a89a" stroke="#335746" strokeWidth="2.5" />
        <path d="M276 167L281 118Q286 108 301 108H336Q353 108 361 123L368 171" fill="#69a585" stroke="#335746" strokeWidth="2.5" />
        <path d="M303 99V112L319 124L334 111V96" fill="#e8b48f" stroke="#6f5141" strokeWidth="2" />
        <path d="M301 108L319 123L334 108L344 116L329 134L319 127L310 135L291 117Z" fill="#fffaf0" stroke="#335746" strokeWidth="2" />
        <path d="M319 130V174" stroke="#335746" strokeWidth="1.8" />
        <g className="montage-person-head">
          <path d="M290 57Q291 31 317 31Q344 32 346 57L343 84Q341 101 323 106Q306 105 296 93L291 77" fill="#efc39d" stroke="#6f5141" strokeWidth="2" />
          <path d="M292 76Q283 63 288 47Q293 27 317 26Q342 27 349 46L345 60L337 54L331 43Q315 54 299 49L299 74Z" fill="#284b3e" stroke="#284b3e" strokeWidth="2" />
          <path d="M296 43Q309 33 324 36M330 34Q340 37 343 44" fill="none" stroke="#658a6e" strokeWidth="2" strokeLinecap="round" />
          <path d="M298 71Q286 64 289 78Q292 86 298 84" fill="#efc39d" stroke="#6f5141" strokeWidth="1.5" />
          <path d="M307 64L314 63M329 64L336 67" stroke="#335746" strokeWidth="2.3" strokeLinecap="round" />
          <g className="montage-person-eyes" fill="#335746"><ellipse cx="312" cy="72" rx="2" ry="2.7" /><ellipse cx="333" cy="73" rx="2" ry="2.7" /></g>
          <path d="M328 74L334 83L328 84M313 93Q321 98 328 92" fill="none" stroke="#9c7156" strokeWidth="1.8" strokeLinecap="round" />
        </g>
        <g className="montage-control-surface">
          <path d="M279 139H354L361 170H273Z" fill="#315746" stroke="#244336" strokeWidth="2" strokeLinejoin="round" />
          <path d="M285 144H349L353 164H280Z" fill="#d9ead4" />
          <path className="montage-control-code" d="M291 150H319M291 155H335M291 160H312" fill="none" stroke="#65967d" strokeWidth="2" strokeLinecap="round" />
          <path d="M273 170H361L390 190H249Z" fill="#dce8d3" stroke="#335746" strokeWidth="2" strokeLinejoin="round" />
          <path className="montage-control-keys" d="M270 175H362M263 180H370M283 171L275 184M300 171L296 184M320 171V184M340 171L344 184M357 171L364 184" stroke="#8ba98d" strokeWidth="1.6" />
          <path d="M307 184H337L341 188H303Z" fill="#a9c5ac" />
          <circle className="montage-control-touch" cx="341" cy="174" r="9" fill="none" stroke="#e79271" strokeWidth="2.5" />
        </g>
        <g className="montage-arm-left">
          <path d="M284 123L270 151" stroke="#335746" strokeWidth="25" strokeLinecap="round" />
          <path d="M284 123L270 151" stroke="#69a585" strokeWidth="20" strokeLinecap="round" />
          <path d="M270 155Q271 162 283 166L292 170" fill="none" stroke="#6f5141" strokeWidth="14" strokeLinecap="round" />
          <path d="M270 155Q271 162 283 166L292 170" fill="none" stroke="#efc39d" strokeWidth="11" strokeLinecap="round" />
          <g className="montage-hand-left"><path d="M289 165Q295 163 303 170L308 174Q310 178 306 178L297 173L302 178Q302 181 298 179L290 175Z" fill="#efc39d" stroke="#9c7156" strokeWidth="1.4" strokeLinejoin="round" /></g>
        </g>
        <g className="montage-arm-right">
          <path d="M354 124L369 151" stroke="#335746" strokeWidth="25" strokeLinecap="round" />
          <path d="M354 124L369 151" stroke="#69a585" strokeWidth="20" strokeLinecap="round" />
          <g className="montage-working-forearm">
            <path d="M369 155Q366 162 355 166L346 170" fill="none" stroke="#6f5141" strokeWidth="14" strokeLinecap="round" />
            <path d="M369 155Q366 162 355 166L346 170" fill="none" stroke="#efc39d" strokeWidth="11" strokeLinecap="round" />
            <g className="montage-hand-right"><path d="M349 165Q342 163 335 170L330 174Q328 178 332 178L341 173L336 178Q336 181 340 179L348 175Z" fill="#efc39d" stroke="#9c7156" strokeWidth="1.4" strokeLinejoin="round" /></g>
          </g>
        </g>
      </g>
      <g transform="translate(0 40)">
      {/* A shallow isometric desk grounds the upright, readable monitor. */}
      <path d="M37 425H601L626 449H13Z" fill="#e9d6ad" stroke="#335746" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M13 449H626V466H13Z" fill="#c1ad87" stroke="#335746" strokeWidth="2.2" />
      <path d="M42 467L38 491M595 467L602 491" stroke="#335746" strokeWidth="8" strokeLinecap="round" />
      <path d="M290 403L282 431H358L349 403" fill="#8bab99" stroke="#335746" strokeWidth="2" />
      <path d="M272 432H367" stroke="#335746" strokeWidth="5" strokeLinecap="round" />
      <rect x="19" y="148" width="602" height="263" rx="13" fill="#365c4c" stroke="#244336" strokeWidth="2.5" />
      <rect x="30" y="160" width="580" height="236" rx="7" fill="#fffef9" />
      <circle cx="320" cy="403" r="2" fill="#bdd3bd" />
      <g className="montage-cup"><path d="M541 417H563L559 440H545Z" fill="#fff9dc" stroke="#42634b" strokeWidth="1.7" /><path d="M563 422Q578 421 573 430Q570 435 561 433" fill="none" stroke="#42634b" strokeWidth="2" /><path className="montage-steam" d="M551 410Q546 405 551 399" fill="none" stroke="#8faa8e" strokeWidth="1.6" /></g>
      <g className="montage-plant"><path d="M80 429V405M80 416Q63 416 61 402Q78 403 80 416M80 408Q81 393 94 388Q97 402 80 408" fill="#89ba78" stroke="#42634b" strokeWidth="1.8" /><path d="M68 425H93L88 443H73Z" fill="#edc571" stroke="#42634b" strokeWidth="1.8" /></g>
      </g>
    </svg>

    <div className="montage-monitor" aria-label={`Task board example: ${titles[stage]}`}>
      <header className="montage-window-heading"><span className="montage-window-dots" aria-hidden="true"><i /><i /><i /></span><strong>Task board</strong><span>{["The brief", "Tool choices", "User journey", "Feature review", "Release notes"][stage]}</span></header>
      <div className="montage-continuity-screen">
        <div className={`montage-feature-card ${invalid ? "is-invalid" : ""}`}>
          <span className="montage-feature-icon" aria-hidden="true">{invalid ? "!" : "✓"}</span>
          <div><span>The feature</span><strong>{invalid ? "Add a task name…" : "Prepare the demo"}</strong></div>
          <span className="montage-feature-state" data-ready={visibleBeat >= 4}>
            <AnimatePresence initial={false} mode="wait"><motion.span key={invalid ? "invalid" : stage} initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: animate ? .2 : 0 }}>{invalid ? "Needs a name" : screen.state}</motion.span></AnimatePresence>
          </span>
        </div>
        <div className="montage-screen-caption">{screen.label}</div>
        <div className="montage-step-cards">
          {screen.cards.map(([kind, label, detail], index) => <div className="montage-step-card" data-complete={visibleBeat > index + 1} data-current={visibleBeat === index + 1} key={index}>
            <AnimatePresence initial={false} mode="wait"><motion.div key={`${stage}-${index}`} initial={animate ? { opacity: 0, y: 3 } : false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: animate ? .23 : 0, delay: animate ? index * .045 : 0 }}>
              <span>{kind}</span><b>{label}</b><small>{detail}</small>
            </motion.div></AnimatePresence>
            <i className="montage-step-check" aria-hidden="true">✓</i>
          </div>)}
        </div>
        <div className={`montage-continuity-note ${invalid ? "is-invalid" : ""}`}>
          <span aria-hidden="true">{invalid ? "!" : stage === 4 ? "↗" : "↳"}</span>
          <span>{invalid ? "A helpful message makes the missing name easy to fix." : acted && stage === 1 ? "The prototype makes the tradeoffs tangible." : screen.note}</span>
        </div>
      </div>
      <svg className="montage-screen-pointer" viewBox="0 0 24 28" aria-hidden="true"><path d="M3 2L20 15L12 16L8 24Z" fill="#315c49" stroke="#fffdf3" strokeWidth="2" strokeLinejoin="round" /></svg>
    </div>
    <button className="journey-monitor-action" type="button" aria-controls={`${id}-result`} onFocus={() => onFocusChange(true)} onBlur={() => onFocusChange(false)} onClick={replay}>
      <span>{stage === 0 ? (invalid ? replays[0] : actions[0]) : (acted ? replays[stage] : actions[stage])}</span><span aria-hidden="true">{acted ? "↻" : "→"}</span>
    </button>
    <span className="journey-action-status" id={`${id}-result`} role="status" aria-live="polite" aria-atomic="true">{acted ? `${stage === 0 && !invalid ? "The task “Prepare the demo” is accepted and appears on the board." : results[stage]} Run ${action.count} complete.` : ""}</span>
  </div>;
}
