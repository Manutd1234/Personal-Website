"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Compass,
  EyeOff,
  HeartHandshake,
  MapPin,
  Medal,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import {
  useLayoutEffect,
  useId,
  useRef,
  type MouseEvent,
  type PointerEvent,
} from "react";
import {
  cardTypes,
  type CardType,
  type TradingCardData,
} from "@/content/card-decks";
import { certificateFiles } from "@/content/media";
import { asset } from "@/content/paths";

const MAX_TILT = 8;
const CARD_CONTROLS =
  'a, button, input, textarea, select, option, label, summary, [role="button"], [role="link"], [contenteditable]:not([contenteditable="false"]), [data-card-control]';
const typeIcons: Readonly<Record<CardType, LucideIcon>> = {
  systems: BriefcaseBusiness,
  education: BookOpen,
  leadership: Compass,
  community: HeartHandshake,
  sport: Medal,
};
const files: Readonly<Record<string, { src: string; title: string }>> =
  certificateFiles;

// Real results in highlight text are marked **like this** and drawn in the type colour.
function Emphasis({ text }: { text: string }) {
  return text
    .split("**")
    .map((part, index) =>
      index % 2 ? <strong key={index}>{part}</strong> : part,
    );
}

function CardSkills({ card }: { card: TradingCardData }) {
  const groups = card.skillFocus
    ? [
        {
          label: card.skillFocus.label,
          skills: card.skills.slice(0, card.skillFocus.count),
        },
        ...(card.skillFocus.count < card.skills.length
          ? [{ label: "Soft skills", skills: card.skills.slice(card.skillFocus.count) }]
          : []),
      ]
    : [{ label: undefined, skills: card.skills }];

  return (
    <section className="tcg-skills" aria-label={`${card.org}: skills learned`}>
      <h4>Skills learned</h4>
      {groups.map((group) => (
        <div className="tcg-skill-group" key={group.label ?? "skills"}>
          {group.label ? <h5>{group.label}</h5> : null}
          <ul
            className="tcg-skill-list"
            aria-label={group.label ? `${card.org}: ${group.label}` : undefined}
          >
            {group.skills.map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
        </div>
      ))}
    </section>
  );
}

export default function TradingCard({
  card,
  reduced,
  loadLogo,
  tabbable,
  flipped,
  onFlipChange,
}: {
  card: TradingCardData;
  reduced: boolean;
  loadLogo: boolean;
  tabbable: boolean;
  flipped: boolean;
  onFlipChange: (id: string, flipped: boolean) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const flipButton = useRef<HTMLButtonElement>(null);
  const flippedRef = useRef(flipped);
  const blockedClickUntil = useRef(0);
  const gesture = useRef<{
    pointer: number;
    x: number;
    y: number;
    moved: boolean;
    track: HTMLElement | null;
    trackLeft: number;
    body: HTMLElement | null;
    bodyTop: number;
  } | null>(null);
  const nameId = useId();
  const type = cardTypes[card.type];
  const TypeIcon = typeIcons[card.type];

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const hover = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 220, damping: 22 });
  const rotateY = useSpring(tiltY, { stiffness: 220, damping: 22 });
  const glow = useSpring(hover, { stiffness: 170, damping: 24 });
  const scale = useTransform(glow, [0, 1], [1, 1.015]);
  const washOpacity = useTransform(glow, (v) => v * 0.18);
  const sheenX = useTransform(pointerX, (v) => 100 - v);
  const sheenY = useTransform(pointerY, (v) => 100 - v);
  const sheenPosition = useMotionTemplate`${sheenX}% ${sheenY}%`;
  const washPosition = useMotionTemplate`${pointerX}% ${pointerY}%`;
  const washMask = useMotionTemplate`radial-gradient(farthest-corner circle at ${pointerX}% ${pointerY}%, #000 0%, rgba(0,0,0,0.35) 32%, transparent 64%)`;
  const glare = useMotionTemplate`radial-gradient(circle at ${pointerX}% ${pointerY}%, rgba(255,255,255,0.55), rgba(255,255,255,0.08) 34%, transparent 62%)`;

  useLayoutEffect(() => {
    flippedRef.current = flipped;
  }, [flipped]);

  function beginGesture(event: PointerEvent<HTMLDivElement>) {
    blockedClickUntil.current = 0;
    gesture.current = null;
    if (!event.isPrimary || event.button !== 0) return;
    const target = event.target as Element;
    if (target.closest(CARD_CONTROLS)) return;
    const track = event.currentTarget.closest<HTMLElement>("[data-deck-track]");
    const body = target.closest<HTMLElement>(".tcg-back-body");
    gesture.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      track,
      trackLeft: track?.scrollLeft ?? 0,
      body,
      bodyTop: body?.scrollTop ?? 0,
    };
  }
  function endGesture(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const current = gesture.current;
    if (!current || current.pointer !== event.pointerId) return;
    if (
      cancelled ||
      current.moved ||
      Math.hypot(event.clientX - current.x, event.clientY - current.y) > 7 ||
      Math.abs((current.track?.scrollLeft ?? 0) - current.trackLeft) > 2 ||
      Math.abs((current.body?.scrollTop ?? 0) - current.bodyTop) > 2
    )
      blockedClickUntil.current = performance.now() + 500;
    gesture.current = null;
  }
  function track(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (current?.pointer === event.pointerId)
      current.moved ||=
        Math.hypot(event.clientX - current.x, event.clientY - current.y) > 7;
    if (reduced || flipped || event.pointerType !== "mouse") return;
    // Measure the untransformed wrapper so the tilt never feeds back into itself.
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - box.top) / box.height, 0), 1);
    pointerX.set(x * 100);
    pointerY.set(y * 100);
    tiltX.set(-(y - 0.5) * 2 * MAX_TILT);
    tiltY.set((x - 0.5) * 2 * MAX_TILT);
    hover.set(1);
  }
  function settle() {
    tiltX.set(0);
    tiltY.set(0);
    hover.set(0);
  }
  function showFace(next: boolean) {
    // Read and return are explicit, idempotent actions. A second click before
    // React commits must not reverse an action using a stale prop value.
    if (flippedRef.current === next) return;
    flippedRef.current = next;
    const hadFocus = rootRef.current?.contains(document.activeElement);
    onFlipChange(card.id, next);
    settle();
    // This control stays outside both inert faces and never rotates away.
    if (hadFocus) flipButton.current?.focus({ preventScroll: true });
  }
  function flipFromFace(event: MouseEvent<HTMLElement>, next: boolean) {
    if (
      (event.target as Element).closest(CARD_CONTROLS) ||
      performance.now() < blockedClickUntil.current ||
      gesture.current?.moved
    )
      return;
    const selection = window.getSelection();
    if (
      selection?.toString() &&
      (rootRef.current?.contains(selection.anchorNode) ||
        rootRef.current?.contains(selection.focusNode))
    )
      return;
    showFace(next);
  }

  const certificates = card.certificates.flatMap((key) =>
    files[key] ? [files[key]] : [],
  );
  return (
    <div
      ref={rootRef}
      className="tcg-card"
      data-type={card.type}
      data-flipped={flipped}
      onPointerDownCapture={beginGesture}
      onPointerMove={track}
      onPointerUpCapture={(event) => endGesture(event)}
      onPointerCancelCapture={(event) => endGesture(event, true)}
      onPointerLeave={() => {
        settle();
        if (gesture.current) gesture.current.moved = true;
      }}
    >
      <motion.div className="tcg-tilt" style={{ rotateX, rotateY, scale }}>
        <motion.div
          className="tcg-flipper"
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: "spring", stiffness: 190, damping: 23 }
          }
        >
          <article
            className="tcg-face tcg-front"
            aria-labelledby={nameId}
            inert={flipped}
            onClick={(event) => flipFromFace(event, true)}
          >
            <div className="tcg-inner">
              {/* The paper reflection stays beneath the readable content. */}
              <motion.span
                className="tcg-paper-wash"
                aria-hidden="true"
                style={{
                  opacity: washOpacity,
                  backgroundPosition: washPosition,
                  WebkitMaskImage: washMask,
                  maskImage: washMask,
                }}
              />
              <motion.span
                className="tcg-sheen"
                aria-hidden="true"
                style={{ opacity: glow, backgroundPosition: sheenPosition }}
              />
              <motion.span
                className="tcg-glare"
                aria-hidden="true"
                style={{ opacity: glow, backgroundImage: glare }}
              />
              <header className="tcg-band tcg-header">
                <span className="tcg-symbol" aria-hidden="true">
                  <TypeIcon size={14} strokeWidth={2.5} aria-hidden="true" />
                </span>
                <div className="tcg-heading">
                  <p className="tcg-kicker">{type.label}</p>
                  <p className="tcg-title">{card.title}</p>
                </div>
              </header>
              <p className="tcg-date-stamp">
                <CalendarDays size={13} aria-hidden="true" />
                <span className="sr-only">Dates: </span>
                {card.dates}
              </p>

              <div
                className="tcg-picture"
                data-logo-layout={card.logo?.layout}
                data-logo={card.logo?.file.endsWith("/pneurelief.webp") ? "medtech" : undefined}
                data-tone={
                  (card.logo ? card.logo.dark : card.stealth) ? "dark" : "light"
                }
              >
                {card.logo ? (
                  <img
                    src={asset(card.logo.file)}
                    alt={card.logo.alt ?? `${card.org} logo`}
                    loading={loadLogo ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                  />
                ) : card.stealth ? (
                  <span
                    className="tcg-stealth-wordmark"
                    role="img"
                    aria-label="Stealth Startup — generic typographic mark; company name withheld"
                  >
                    <EyeOff size={32} strokeWidth={1.5} aria-hidden="true" />
                    <span aria-hidden="true">
                      stealth<span>startup</span>
                    </span>
                  </span>
                ) : (
                  <span className="tcg-placeholder">
                    <TypeIcon size={34} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                )}
              </div>

              <div className="tcg-identity">
                <h3 id={nameId}>{card.org}</h3>
                <p>
                  <MapPin size={12} aria-hidden="true" /> {card.location}
                </p>
              </div>

              <ul className="tcg-moves" aria-label="Highlights">
                {card.moves.map((move) => (
                  <li key={move.name} className="tcg-move">
                    <p className="tcg-move-name">{move.name}</p>
                    <ul className="tcg-move-points">
                      <li className="tcg-move-text">
                        <Emphasis text={move.text} />
                      </li>
                    </ul>
                  </li>
                ))}
              </ul>

              <footer className="tcg-band tcg-footer" aria-hidden="true" />
            </div>
          </article>

          <section
            className="tcg-face tcg-back"
            id={`${nameId}-story`}
            aria-label={`${card.org}: story and full record`}
            inert={!flipped}
            onClick={(event) => flipFromFace(event, false)}
          >
            <div className="tcg-inner">
              <header className="tcg-band tcg-header">
                <span className="tcg-symbol" aria-hidden="true">
                  <TypeIcon size={14} strokeWidth={2.5} />
                </span>
                <div className="tcg-heading">
                  <p className="tcg-kicker">{type.label}</p>
                  <p className="tcg-title">The full story</p>
                </div>
              </header>
              <div className="tcg-back-identity">
                <p className="tcg-back-org">{card.org}</p>
                <p className="tcg-back-role">{card.role}</p>
                <p className="tcg-back-meta">
                  {card.location} · {card.dates}
                </p>
              </div>
              <div
                className="tcg-back-body"
                tabIndex={tabbable ? 0 : -1}
                aria-label={`${card.org} details`}
              >
                <CardSkills card={card} />
                {card.summary || card.bullets.length ? (
                  <ul className="tcg-back-list" aria-label="What I did">
                    {card.summary ? <li>{card.summary}</li> : null}
                    {card.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                {card.note ? (
                  <p className="tcg-back-note">{card.note}</p>
                ) : null}
                {certificates.length ? (
                  <div className="tcg-back-links">
                    {certificates.map((file) => {
                      const short = file.title.split(" — ")[1];
                      return (
                        <a
                          key={file.src}
                          href={asset(file.src)}
                          target="_blank"
                          rel="noreferrer"
                          tabIndex={tabbable ? undefined : -1}
                          aria-label={`${file.title} — view certificate, opens in a new tab`}
                        >
                          {short && short.length > 11 ? short : file.title}
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <footer className="tcg-band tcg-footer" aria-hidden="true" />
            </div>
          </section>
        </motion.div>
      </motion.div>
      <button
        className="tcg-turn-button"
        type="button"
        ref={flipButton}
        data-card-control
        tabIndex={tabbable ? 0 : -1}
        aria-controls={`${nameId}-story`}
        aria-expanded={flipped}
        aria-label={flipped ? `Return to ${card.org} highlights` : `Read the full story: ${card.org}`}
        onClick={() => showFace(flipped ? false : true)}
      >
        {flipped ? (
          <><ArrowLeft size={13} strokeWidth={2.3} aria-hidden="true" />Back to highlights</>
        ) : (
          <>Read story<RotateCcw size={13} strokeWidth={2.3} aria-hidden="true" /></>
        )}
      </button>
    </div>
  );
}
