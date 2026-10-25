import { useId, useState } from "react";

const actions = ["Try an empty title", "Show the tradeoff", "Trace one request", "Run the three tests", "Deploy the example"];
const replays = ["Try valid input", "Replay comparison", "Trace again", "Run tests again", "Replay deployment"];
const titles = ["Write the contract", "Choose the components", "Follow the request", "Implement & test", "Release & observe"];
const results = [
  "The example rejects an empty title with 422. The API accepts a title between 1 and 120 characters.",
  "The example uses React, a TypeScript API and PostgreSQL. One service keeps deployment simple; SQL provides transactional writes. A cache can wait until measurements justify it.",
  "Request req_01 passes validation and domain rules, writes one task, then returns 201 Created with task_01.",
  "Three example tests pass: valid input returns 201, an empty title returns 422, and a store failure returns 503.",
  "The example passes build and test checks, releases version 1, then reports illustrative latency and error metrics. The previous version remains available for rollback.",
];

/** A single feature, built across five shots in the same illustrated workspace. */
export default function BuildJourneyScene({ stage, description, onFocusChange }: {
  stage: number;
  description: string;
  onFocusChange: (focused: boolean) => void;
}) {
  const id = useId();
  const [action, setAction] = useState({ stage: -1, count: 0, invalid: false });
  const acted = action.stage === stage;
  const invalid = acted && action.invalid;
  const replay = () => setAction(previous => ({ stage, count: previous.count + 1, invalid: stage === 0 && !(previous.stage === 0 && previous.invalid) }));

  return <div className="journey-scene journey-montage" data-stage={stage} data-acted={acted}>
    <svg className="journey-scene-svg" viewBox="0 0 640 520" role="img" aria-labelledby={`${id}-title ${id}-description`}>
      <title id={`${id}-title`}>{`Building a Task API: ${titles[stage]}`}</title>
      <desc id={`${id}-description`}>{`${description} A cartoon engineer sits behind a computer as the same task API develops from a brief into an observable release.`}</desc>
      <defs>
        <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#bed0c7" strokeWidth=".7" opacity=".45" /></pattern>
      </defs>
      <rect width="640" height="520" fill="#f2f6eb" />
      <path d="M0 0H640V520H0Z" fill={`url(#${id}-grid)`} />
      <path d="M0 169L320 58L640 169" fill="none" stroke="#c9ddd8" strokeWidth="2" />
      <path d="M320 58V156" stroke="#c9ddd8" strokeWidth="2" />
      <ellipse cx="320" cy="487" rx="269" ry="15" fill="#ccdbca" />

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

      {/* An outlined, proportionate seated character. Foreground hardware occludes the torso. */}
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
        <path d="M284 123L270 161M354 124L369 161" stroke="#335746" strokeWidth="25" strokeLinecap="round" />
        <path d="M284 123L270 161M354 124L369 161" stroke="#69a585" strokeWidth="20" strokeLinecap="round" />
        <path d="M267 158L259 182M371 159L381 182" stroke="#e8b48f" strokeWidth="13" strokeLinecap="round" />
      </g>

      {/* A shallow isometric desk grounds the upright, readable monitor. */}
      <path d="M37 425H601L626 449H13Z" fill="#e9d6ad" stroke="#335746" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M13 449H626V466H13Z" fill="#c1ad87" stroke="#335746" strokeWidth="2.2" />
      <path d="M42 467L38 491M595 467L602 491" stroke="#335746" strokeWidth="8" strokeLinecap="round" />
      <path d="M290 403L282 431H358L349 403" fill="#8bab99" stroke="#335746" strokeWidth="2" />
      <path d="M272 432H367" stroke="#335746" strokeWidth="5" strokeLinecap="round" />
      <rect x="19" y="148" width="602" height="263" rx="13" fill="#365c4c" stroke="#244336" strokeWidth="2.5" />
      <rect x="30" y="160" width="580" height="236" rx="7" fill="#fffef9" />
      <circle cx="320" cy="403" r="2" fill="#bdd3bd" />
      <path d="M212 431H415L428 443H198Z" fill="#f5f2dc" stroke="#6b8b71" strokeWidth="1.6" />
      <path className="montage-keyboard" d="M218 435H406M222 439H411M235 432L240 442M260 432L265 442M285 432L290 442M310 432L315 442M335 432L340 442M360 432L365 442M385 432L390 442" stroke="#a0b095" strokeWidth="1.2" />
      <g className="montage-cup"><path d="M541 417H563L559 440H545Z" fill="#fff9dc" stroke="#42634b" strokeWidth="1.7" /><path d="M563 422Q578 421 573 430Q570 435 561 433" fill="none" stroke="#42634b" strokeWidth="2" /><path className="montage-steam" d="M551 410Q546 405 551 399" fill="none" stroke="#8faa8e" strokeWidth="1.6" /></g>
      <g className="montage-plant"><path d="M80 429V405M80 416Q63 416 61 402Q78 403 80 416M80 408Q81 393 94 388Q97 402 80 408" fill="#89ba78" stroke="#42634b" strokeWidth="1.8" /><path d="M68 425H93L88 443H73Z" fill="#edc571" stroke="#42634b" strokeWidth="1.8" /></g>
      <g aria-hidden="true" fontSize="15" fontWeight="600" fill="#456653"><text x="25" y="505">ONE FEATURE</text><text x="615" y="505" textAnchor="end">{["contract", "contract + stack", "contract + stack + flow", "working slice + tests", "release + feedback"][stage]}</text></g>
    </svg>

    <div className="montage-monitor" aria-label={`Task API example: ${titles[stage]}`}>
      <header className="montage-window-heading"><span className="montage-window-dots" aria-hidden="true"><i /><i /><i /></span><strong>task-api</strong><span>{["brief.md", "stack.md", "request.trace", "tasks.test.ts", "release v1"][stage]}</span></header>
      <div className="montage-shot" key={`${stage}-${action.count}`} data-shot={stage} data-acted={acted}>
        {stage === 0 && <div className="montage-contract-screen">
          <div className="montage-endpoint"><b>POST</b> /tasks <span>Create one task</span></div>
          <div className={`montage-input ${invalid ? "is-invalid" : ""}`}><span>title</span><code>{invalid ? '""' : '"Ship demo"'}</code><span className="montage-input-caret" aria-hidden="true" /></div>
          <div className="montage-rules"><span><i>✓</i> Required</span><span><i>✓</i> 1–120 characters</span></div>
          <div className={`montage-response ${invalid ? "is-invalid" : ""}`}><b>{invalid ? "422" : "201"}</b><span>{invalid ? "Reject empty input before saving" : "Create once. Return the task ID."}</span></div>
        </div>}
        {stage === 1 && <div className="montage-stack-screen">
          <p className="montage-screen-label">One service. One source of truth.</p>
          <div className="montage-components">{[["UI", "React", "Fast iteration"], ["API", "TypeScript", "Shared contracts"], ["DATA", "PostgreSQL", "Atomic writes"]].map(([kind, name, reason], index) => <div className={`montage-component montage-component-${index}`} key={kind}><span>{kind}</span><b>{name}</b><small>{reason}</small></div>)}</div>
          <div className="montage-decision"><span aria-hidden="true">↳</span>{acted ? "Atomic writes first. Cache only if measured." : "Prototype the riskiest dependency."}</div>
        </div>}
        {stage === 2 && <div className="montage-flow-screen">
          <div className="montage-endpoint"><b>POST</b> /tasks <span>req_01</span></div>
          <div className="montage-request-flow"><div className="montage-request-wire" aria-hidden="true"><span /></div>{[["Validate", "title: string"], ["Own rules", "Task service"], ["Persist", "INSERT task"]].map(([label, detail], index) => <div className={`montage-flow-node montage-flow-node-${index}`} key={label}><b>{label}</b><small>{detail}</small></div>)}</div>
          <div className="montage-response"><b>{acted ? "201" : "↩"}</b><span>{acted ? "Created · { id: task_01 }" : "Validate → write → respond"}</span></div>
        </div>}
        {stage === 3 && <div className="montage-build-screen">
          <div className="montage-code"><span><em>01</em> <b>parse</b>(body)</span><span><em>02</em> <b>await</b> tasks.create()</span><span><em>03</em> <b>return</b> reply(201)</span></div>
          <div className="montage-tests-list"><span className="montage-screen-label">{acted ? "3 / 3 passed" : "Behavior checks"}</span>{[["201", "valid title"], ["422", "empty title"], ["503", "store offline"]].map(([code, label], index) => <div className={`montage-test montage-test-${index}`} key={code}><i aria-hidden="true">✓</i><b>{code}</b><span>{label}</span></div>)}</div>
          <p className="montage-build-note">A complete path. Success and failure covered.</p>
        </div>}
        {stage === 4 && <div className="montage-release-screen">
          <div className="montage-pipeline">{["Build", "Test", "Release"].map((label, index) => <span className={`montage-gate montage-gate-${index}`} key={label}><i aria-hidden="true">✓</i>{label}</span>)}</div>
          <div className="montage-telemetry"><div><span className="montage-live"><i />{acted ? "v1 live" : "Smoke test"}</span><b>82<small> ms p95</small></b><span>0 errors · example data</span></div><svg viewBox="0 0 220 68" aria-label="Illustrative response latency stabilizes after deployment" role="img"><path d="M0 58H220M0 32H220M0 6H220" stroke="#d5e3dc" strokeWidth="1" /><path className="montage-chart-fill" d="M0 42L18 37L36 45L54 18L72 26L90 35L108 28L126 31L144 30L162 33L180 29L200 30L220 28V68H0Z" fill="#deedd6" /><path className="montage-chart-line" pathLength="1" d="M0 42L18 37L36 45L54 18L72 26L90 35L108 28L126 31L144 30L162 33L180 29L200 30L220 28" fill="none" stroke="#418663" strokeWidth="3" /></svg></div>
          <div className="montage-release-note">Observe → improve <span>Rollback: v0 ready</span></div>
        </div>}
      </div>
    </div>
    <button className="journey-monitor-action" type="button" aria-controls={`${id}-result`} onFocus={() => onFocusChange(true)} onBlur={() => onFocusChange(false)} onClick={replay}>
      <span>{stage === 0 ? (invalid ? replays[0] : actions[0]) : (acted ? replays[stage] : actions[stage])}</span><span aria-hidden="true">{acted ? "↻" : "→"}</span>
    </button>
    <span className="journey-action-status" id={`${id}-result`} role="status" aria-live="polite" aria-atomic="true">{acted ? `${stage === 0 && !invalid ? "Valid title accepted: 201 Created with task_01." : results[stage]} Run ${action.count} complete.` : ""}</span>
  </div>;
}
