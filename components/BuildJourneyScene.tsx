import { useId, useState } from "react";

const screenTitles = ["The brief", "The right tools", "A clear system", "Build & verify", "Ready for release"];
const actions = ["Check brief", "Compare choices", "Trace request", "Run tests", "Replay release"];
const replayActions = ["Replay check", "Replay comparison", "Trace again", "Run again", "Replay release"];
const results = [
  "Example brief checked: inputs are defined, invariants are explicit, and failure cases are covered.",
  "Example comparison: balance delivery speed, dependency complexity and the data model before choosing a stack.",
  "Example request traced: validate the input, apply the domain rules, then commit the data.",
  "Example tests complete: accept valid input, reject invalid input, and verify the saved result.",
  "Example release verified: run the checks, smoke-test the live path, then observe errors and latency.",
];

/** One continuous workspace: only the screen and small task gestures change. */
export default function BuildJourneyScene({
  stage,
  description,
  onFocusChange,
}: {
  stage: number;
  description: string;
  onFocusChange: (focused: boolean) => void;
}) {
  const id = useId();
  const [action, setAction] = useState({ stage: -1, count: 0 });
  const acted = action.stage === stage;
  const replay = () => setAction(previous => ({ stage, count: previous.count + 1 }));
  return <div className="journey-scene" data-stage={stage} data-acted={acted}>
    <svg
    className="journey-scene-svg"
    viewBox="0 0 620 470"
    role="img"
    aria-labelledby={`${id}-title ${id}-description`}
    data-stage={stage}
  >
    <title id={`${id}-title`}>{`An engineer at work: ${screenTitles[stage]}`}</title>
    <desc id={`${id}-description`}>{description}</desc>
    <defs>
      <pattern id={`${id}-paper`} width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="5" r=".65" fill="#7b9470" opacity=".12" />
      </pattern>
      <linearGradient id={`${id}-screen`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#fffef9" />
        <stop offset="1" stopColor="#f0f4e8" />
      </linearGradient>
    </defs>

    {/* Quiet architectural lines keep the drawing grounded in one room. */}
    <rect width="620" height="470" fill="#f1f4e8" />
    <rect width="620" height="470" fill={`url(#${id}-paper)`} />
    <path d="M47 314V91Q47 44 94 44H174V314" fill="#e6eddc" stroke="#d8e1ce" strokeWidth="2" />
    <path d="M49 123H173M111 46V123" fill="none" stroke="#f8faf0" strokeWidth="5" />
    <path d="M29 449H592" stroke="#c7d3bc" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="314" cy="453" rx="260" ry="10" fill="#c8d5bc" opacity=".35" />

    <g transform="translate(194 -86)"><g className="journey-seated-person">
    {/* The chair and seated torso sit behind the work surface. */}
    <path d="M81 238Q80 220 98 220H161Q175 220 177 236L186 341H88Z" fill="#cad6c2" stroke="#89a18a" strokeWidth="2" />
    <path d="M94 239L102 332" stroke="#e8eedf" strokeWidth="4" strokeLinecap="round" />
    <path d="M137 190L134 214Q147 225 163 212L161 187" fill="#d9ad88" stroke="#846952" strokeWidth="1.5" />
    <path d="M112 209Q124 203 135 207L148 218L162 206Q178 205 190 218L205 337H91L99 232Q102 217 112 209Z" fill="#789982" stroke="#456d59" strokeWidth="2" />
    <path d="M135 209L148 221L162 208L169 220L153 235L136 221L127 225Z" fill="#e6ead8" stroke="#557563" strokeWidth="1.5" />
    <path d="M151 233L155 331M112 262L125 262" fill="none" stroke="#557763" strokeWidth="1.5" />
    <circle cx="153" cy="253" r="1.7" fill="#d3dfcb" />
    <circle cx="154" cy="282" r="1.7" fill="#d3dfcb" />

    {/* Fixed, proportionate limbs. Fingers move; elbows never flip or stretch. */}
    <g className="journey-person-far-arm" strokeLinecap="round" strokeLinejoin="round">
      <path d="M181 226L190 272" fill="none" stroke="#456d59" strokeWidth="26" />
      <path d="M181 226L190 272" fill="none" stroke="#88a58e" strokeWidth="22" />
      <path d="M190 275L196 295Q197 299 204 302L243 321" fill="none" stroke="#aa8568" strokeWidth="15" />
      <path d="M190 275L196 295Q197 299 204 302L243 321" fill="none" stroke="#e2b894" strokeWidth="12" />
      <path d="M181 270L199 267" stroke="#c4d2bc" strokeWidth="8" />
    </g>
    <g className="journey-person-near-arm" strokeLinecap="round" strokeLinejoin="round">
      <path d="M109 229L120 270" fill="none" stroke="#456d59" strokeWidth="28" />
      <path d="M109 229L120 270" fill="none" stroke="#819f87" strokeWidth="24" />
      <path d="M122 276L128 294Q130 300 139 303L194 321" fill="none" stroke="#aa8568" strokeWidth="16" />
      <path d="M122 276L128 294Q130 300 139 303L194 321" fill="none" stroke="#ebc3a0" strokeWidth="13" />
      <path d="M110 270L130 266" stroke="#cdd9c1" strokeWidth="8" />
    </g>

    <g className="journey-person-head">
      <path d="M119 143Q119 117 145 117Q173 117 175 142L173 172Q172 190 154 196Q136 198 124 183L118 163Z" fill="#ebc3a0" stroke="#846952" strokeWidth="1.7" />
      <path d="M121 161Q112 148 115 135Q118 113 143 111Q168 109 178 130L174 146L166 139L162 128Q145 139 128 136L127 159Z" fill="#304b3e" stroke="#304b3e" strokeWidth="2" />
      <path d="M124 128Q136 118 151 120M157 118Q169 121 173 131" fill="none" stroke="#52725e" strokeWidth="2" strokeLinecap="round" />
      <path d="M125 158Q115 153 116 164Q117 175 126 174" fill="#e3b691" stroke="#a47e60" strokeWidth="1.5" />
      <path d="M121 162Q119 164 122 168" fill="none" stroke="#b58d6e" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M139 149L146 148M160 149L168 151" stroke="#42614d" strokeWidth="2.3" strokeLinecap="round" />
      <g className="journey-person-eyes" fill="#334d3e"><g className="journey-person-gaze">
        <ellipse cx="144" cy="156" rx="2.1" ry="2.9" />
        <ellipse cx="165" cy="158" rx="2.1" ry="2.9" />
      </g></g>
      <path d="M162 160L169 169L162 171" fill="none" stroke="#ad8465" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M146 181Q154 185 161 180" fill="none" stroke="#916a54" strokeWidth="1.8" strokeLinecap="round" />
    </g>

    <g className="journey-hand-near" fill="#ebc3a0" stroke="#aa8568" strokeWidth="1.2" strokeLinecap="round">
      <path d="M190 316Q198 313 205 317L213 321Q216 324 211 325L201 322L207 327Q207 330 203 328L196 325L191 325Z" />
      <path d="M199 320L207 324" fill="none" />
      {stage === 0 && <g className="journey-pencil">
        <path d="M208 297L201 326" stroke="#baa24d" strokeWidth="4.5" />
        <path d="M201 326L199 332L204 327" fill="#496146" stroke="none" />
        <path d="M207 297L208 293" stroke="#818969" strokeWidth="4.5" />
        <path d="M200 316L204 317" stroke="#ebc3a0" strokeWidth="4" />
      </g>}
    </g>
    <g className="journey-hand-far" fill="#e2b894" stroke="#aa8568" strokeWidth="1.2" strokeLinecap="round">
      <path d="M239 316Q246 314 253 318L262 322Q265 325 260 326L252 323L257 328Q257 331 253 329L246 326L239 325Z" />
      <path d="M248 320L256 324" fill="none" />
    </g>

    </g></g>

    <g transform="translate(0 65)">
      <path d="M31 328H590L608 347H16Z" fill="#e7d7b6" stroke="#b9a886" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 347H608V365Q607 370 601 370H23Q16 370 16 363Z" fill="#c9b996" stroke="#a79a7b" strokeWidth="2" />
      <path d="M41 371L37 389M577 371L582 389" stroke="#839981" strokeWidth="9" strokeLinecap="round" />
      <path d="M30 353H593" stroke="#dfd0b2" strokeWidth="2" strokeLinecap="round" />
    </g>
    {/* A foreground computer occludes the seated torso and hands naturally. */}
    <rect x="111" y="167" width="478" height="231" rx="14" fill="#456c57" stroke="#31543f" strokeWidth="2" />
    <rect x="123" y="179" width="454" height="202" rx="7" fill={`url(#${id}-screen)`} />
    <path d="M124 214H576" stroke="#d4dfc9" strokeWidth="1.5" />
    <circle cx="141" cy="197" r="3" fill="#d9b868" />
    <circle cx="153" cy="197" r="3" fill="#b8cf9f" />
    <text x="174" y="204" fontSize="21" fontWeight="600" fill="#3b604c">{screenTitles[stage]}</text>
    <g className="journey-working-dots" aria-hidden="true" fill="#7c9c6f">
      {[0, 1, 2].map(index => <circle key={index} cx={533 + index * 10} cy="197" r="2.5" />)}
    </g>
    <g key={`${stage}-${action.count}`} className="journey-screen-content" fill="#284f3c" fontSize="22" fontWeight="500">
      {stage === 0 && <>
        {["User goal", "Success criteria", "Edge cases"].map((label, index) => <g key={label} transform={`translate(149 ${225 + index * 36})`}>
          <rect width="402" height="31" rx="7" fill={index === 2 ? "#f0e9d4" : "#e4edda"} />
          <path className={`journey-screen-mark journey-mark-${index}`} pathLength="1" d="M15 15L20 20L29 9" fill="none" stroke="#388265" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="43" y="23">{acted ? ["Inputs defined", "Invariants explicit", "Failures covered"][index] : label}</text>
        </g>)}
        <path className="journey-screen-underline" d="M193 287H380" fill="none" stroke="#a0b985" strokeWidth="2" strokeLinecap="round" />
      </>}
      {stage === 1 && <>
        {["Interface", "Services", "Data"].map((label, index) => <g key={label} className="journey-tool-choice" transform={`translate(149 ${225 + index * 36})`}>
          <rect width="402" height="31" rx="7" fill={["#dfebd6", "#dfeae6", "#eee6cf"][index]} stroke={["#a0ba8e", "#a0bbae", "#c7b88c"][index]} />
          <text x="15" y="23">{acted ? ["Speed vs. flexibility", "Fewer dependencies", "A clear data model"][index] : label}</text>
        </g>)}
        <g className="journey-screen-pointer" transform="translate(526 236)" fill="#456e51" stroke="#fffef9" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M0 0L0 20L6 15L11 24L15 22L10 13L19 12Z" />
        </g>
      </>}
      {stage === 2 && <>
        <path className="journey-request-path" d="M350 247V307" stroke="#9bb594" strokeWidth="2.5" fill="none" />
        <path d="M345 257L350 262L355 257M345 294L350 299L355 294" stroke="#678969" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {["Interface", "Service", "Database"].map((label, index) => <g key={label} className={`journey-trace-node journey-trace-${index}`}>
          <rect x="195" y={222 + index * 38} width="310" height="30" rx="7" fill={["#dfebd6", "#dfeae6", "#eee6cf"][index]} stroke={["#a0ba8e", "#a0bbae", "#c7b88c"][index]} />
          <text x="350" y={244 + index * 38} textAnchor="middle">{acted ? ["Validate input", "Apply rules", "Commit data"][index] : label}</text>
        </g>)}
        <circle className="journey-flow-dot" cx="350" cy="256" r="3.5" fill="#13795a" />
        <circle className="journey-flow-dot journey-flow-dot-later" cx="350" cy="294" r="3.5" fill="#13795a" />
      </>}
      {stage === 3 && <>
        <rect className="journey-code-highlight" x="144" y="224" width="412" height="29" rx="6" fill="#e2ebd6" />
        <text x="149" y="246" fontFamily="monospace" fontSize="23">validate(input)</text>
        <rect className="journey-code-highlight journey-code-highlight-later" x="144" y="261" width="412" height="29" rx="6" fill="#e2ebd6" />
        <text x="149" y="283" fontFamily="monospace" fontSize="23">save(result)</text>
        <path className="journey-code-caret" d="M319 266V286" stroke="#4c8666" strokeWidth="2.5" />
        <rect x="149" y="302" width="402" height="29" rx="7" fill="#dfebd6" />
        <path className="journey-screen-mark" pathLength="1" d="M166 315L171 321L181 308" fill="none" stroke="#388265" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="195" y="324">{acted ? "3 checks passed" : "Test the full path"}</text>
      </>}
      {stage === 4 && <>
        <circle className="journey-release-halo" cx="350" cy="249" r="24" fill="#dcebd1" stroke="#9ebd8e" strokeWidth="1.5" />
        <path className="journey-release-check" d="M338 248L346 256L362 240" stroke="#3b8260" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="350" y="295" textAnchor="middle" fontSize="24">{acted ? "Release verified" : "Ship with confidence"}</text>
        <g className="journey-monitor-metrics" stroke="#85a36c" strokeWidth="5" strokeLinecap="round">
          <path d="M216 326V317M229 326V312M242 326V306" />
        </g>
        <text x="259" y="324" fontSize="21">{acted ? "Observe & improve" : "Learn & improve"}</text>
      </>}
    </g>
    <circle cx="350" cy="389" r="2" fill="#adc7a7" />
    <path d="M111 398H589L603 408Q604 412 596 414H104Q96 412 97 408Z" fill="#a9bba2" stroke="#607e65" strokeWidth="2" strokeLinejoin="round" />
    <path d="M295 399H405L411 405H289Z" fill="#cbd6c3" stroke="#81977b" strokeWidth="1.2" />
    <path d="M112 409H588" stroke="#dbe3d3" strokeWidth="2" strokeLinecap="round" />

    {/* A few warm details, kept outside the screen's reading area. */}
    <g transform="translate(26 80)">
    <path d="M531 312H552L548 336H535Z" fill="#f9f4df" stroke="#9caa88" strokeWidth="1.8" />
    <path d="M552 317Q566 316 562 325Q560 330 551 329" fill="none" stroke="#9caa88" strokeWidth="2.5" />
    <path d="M543 307Q538 302 543 297" className="journey-mug-steam" fill="none" stroke="#c2ccb5" strokeWidth="1.5" strokeLinecap="round" />
    </g>
    <g transform="translate(0 65)">
    <path className="journey-plant-leaves" d="M66 328V295M66 311Q51 309 48 297Q63 296 66 311M66 303Q68 288 81 284Q82 298 66 303" fill="#b5c9a2" stroke="#7c9b73" strokeWidth="2" strokeLinejoin="round" />
    <path d="M54 322H77L74 339H57Z" fill="#d6c398" stroke="#a89975" strokeWidth="1.6" />
    </g>
  </svg>
    <button
      className="journey-monitor-action"
      type="button"
      aria-label={`${acted ? replayActions[stage] : actions[stage]} in the illustrated example`}
      aria-controls={`${id}-result`}
      onFocus={() => onFocusChange(true)}
      onBlur={() => onFocusChange(false)}
      onClick={replay}
    >
      <span>{acted ? replayActions[stage] : actions[stage]}</span>
      <span aria-hidden="true">{acted ? "↻" : "→"}</span>
    </button>
    <span className="journey-action-status" id={`${id}-result`} role="status" aria-live="polite" aria-atomic="true">{acted ? `${results[stage]} Run ${action.count} complete.` : ""}</span>
  </div>;
}
