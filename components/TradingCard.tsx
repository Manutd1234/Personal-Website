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
  Brain,
  EyeOff,
  Flame,
  Leaf,
  RotateCcw,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  useId,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import {
  cardTypes,
  type CardType,
  type Rarity,
  type TradingCardData,
} from "@/content/card-decks";
import { certificateFiles } from "@/content/media";
import { asset } from "@/content/paths";

const MAX_TILT = 12;
const typeIcons: Readonly<Record<CardType, LucideIcon>> = {
  systems: Zap,
  education: Brain,
  leadership: Flame,
  community: Leaf,
};
const holoStrength: Readonly<Record<Rarity, number>> = {
  "Rare Holo": 0.55,
  Rare: 0.35,
  Uncommon: 0.2,
};
const files: Readonly<Record<string, { src: string; title: string }>> =
  certificateFiles;
const serial = (value: number) => String(value).padStart(3, "0");

// Real results in highlight text are marked **like this** and drawn in the type colour.
function Emphasis({ text }: { text: string }) {
  return text
    .split("**")
    .map((part, index) =>
      index % 2 ? <strong key={index}>{part}</strong> : part,
    );
}

export default function TradingCard({
  card,
  total,
  reduced,
  tabbable,
}: {
  card: TradingCardData;
  total: number;
  reduced: boolean;
  tabbable: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const nameId = useId();
  const type = cardTypes[card.type];
  const TypeIcon = typeIcons[card.type];
  const level = String(card.year % 100).padStart(2, "0");

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const hover = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 220, damping: 22 });
  const rotateY = useSpring(tiltY, { stiffness: 220, damping: 22 });
  const glow = useSpring(hover, { stiffness: 170, damping: 24 });
  const scale = useTransform(glow, [0, 1], [1, 1.025]);
  const holoOpacity = useTransform(glow, (v) => v * holoStrength[card.rarity]);
  const sheenX = useTransform(pointerX, (v) => 100 - v);
  const sheenY = useTransform(pointerY, (v) => 100 - v);
  const sheenPosition = useMotionTemplate`${sheenX}% ${sheenY}%`;
  const holoPosition = useMotionTemplate`${pointerX}% ${pointerY}%`;
  // The rainbow only shows in a soft spotlight around the pointer.
  const holoMask = useMotionTemplate`radial-gradient(farthest-corner circle at ${pointerX}% ${pointerY}%, #000 0%, rgba(0,0,0,0.35) 32%, transparent 64%)`;
  const glare = useMotionTemplate`radial-gradient(circle at ${pointerX}% ${pointerY}%, rgba(255,255,255,0.55), rgba(255,255,255,0.08) 34%, transparent 62%)`;

  function track(event: PointerEvent<HTMLDivElement>) {
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
  function flip() {
    const next = !flipped;
    const hadFocus = rootRef.current?.contains(document.activeElement);
    setFlipped(next);
    settle();
    // The face that held focus becomes inert, so hand focus to the other side.
    if (hadFocus)
      requestAnimationFrame(() =>
        (next ? backButton : frontButton).current?.focus({
          preventScroll: true,
        }),
      );
  }
  function flipFromFace(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest("a, button, .tcg-back-body")) return;
    if (window.getSelection()?.toString()) return;
    flip();
  }

  const certificates = card.certificates.flatMap((key) =>
    files[key] ? [files[key]] : [],
  );
  const rarityMark = card.rarity === "Uncommon" ? "◆" : "★";
  const levelTitle = `LVL is the year this card entered the collection: ${card.year}`;

  return (
    <div
      ref={rootRef}
      className="tcg-card"
      data-type={card.type}
      data-rarity={card.rarity.toLowerCase().replace(" ", "-")}
      data-flipped={flipped}
      onPointerMove={track}
      onPointerLeave={settle}
    >
      <motion.div className="tcg-tilt" style={{ rotateX, rotateY, scale }}>
        <motion.div
          className="tcg-flipper"
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 190, damping: 23 }}
        >
          <article
            className="tcg-face tcg-front"
            aria-labelledby={nameId}
            inert={flipped}
            onClick={flipFromFace}
          >
            <div className="tcg-inner">
              <header className="tcg-band tcg-header">
                <span className="tcg-energy" title={`${type.label} card`}>
                  <TypeIcon size={14} strokeWidth={2.5} aria-hidden="true" />
                  <span className="sr-only">{type.label} card.</span>
                </span>
                <p className="tcg-title">{card.title}</p>
                <p className="tcg-level" title={levelTitle}>
                  <span>LVL</span>
                  {level}
                </p>
              </header>

              <div
                className="tcg-picture"
                data-tone={card.logo?.dark ? "dark" : "light"}
              >
                {card.logo ? (
                  <img
                    src={asset(card.logo.file)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                ) : card.stealth ? (
                  <span className="tcg-placeholder">
                    <EyeOff size={30} strokeWidth={1.8} aria-hidden="true" />
                    In stealth mode
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
                  {card.location} · {card.dates}
                </p>
              </div>

              <ul className="tcg-moves" aria-label="Highlights">
                {card.moves.map((move) => (
                  <li key={move.name} className="tcg-move">
                    <p className="tcg-move-name">{move.name}</p>
                    <p className="tcg-move-text">
                      <Emphasis text={move.text} />
                    </p>
                  </li>
                ))}
              </ul>

              <footer className="tcg-band tcg-footer">
                <p>
                  {rarityMark} {card.rarity}
                  <span aria-hidden="true"> · </span>
                  <span className="sr-only">, card </span>
                  No. {serial(card.number)}/{serial(total)}
                </p>
                <button
                  type="button"
                  ref={frontButton}
                  data-card-control
                  tabIndex={tabbable ? 0 : -1}
                  onClick={flip}
                  aria-label={`Flip the ${card.org} card for the full record`}
                >
                  Full record
                  <RotateCcw size={13} strokeWidth={2.3} aria-hidden="true" />
                </button>
              </footer>
            </div>
            <motion.span
              className="tcg-holo"
              aria-hidden="true"
              style={{
                opacity: holoOpacity,
                backgroundPosition: holoPosition,
                WebkitMaskImage: holoMask,
                maskImage: holoMask,
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
          </article>

          <section
            className="tcg-face tcg-back"
            aria-label={`${card.org}: full record`}
            inert={!flipped}
            onClick={flipFromFace}
          >
            <div className="tcg-inner">
              <header className="tcg-band tcg-header">
                <span className="tcg-energy" aria-hidden="true">
                  <TypeIcon size={14} strokeWidth={2.5} />
                </span>
                <p className="tcg-title">Full record</p>
                <p className="tcg-level" title={levelTitle}>
                  <span>LVL</span>
                  {level}
                </p>
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
                tabIndex={0}
                aria-label={`${card.org} details`}
              >
                {card.summary ? (
                  <p className="tcg-back-summary">{card.summary}</p>
                ) : null}
                {card.bullets.length ? (
                  <ul className="tcg-back-list">
                    {card.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                {card.tags.length ? (
                  <ul
                    className="tcg-back-tags"
                    aria-label={`${card.org} tools and practices`}
                  >
                    {card.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                ) : null}
                {card.note ? (
                  <p className="tcg-back-note">
                    <span>Engineering note</span>
                    {card.note}
                  </p>
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
              <footer className="tcg-band tcg-footer">
                <button
                  type="button"
                  ref={backButton}
                  data-card-control
                  tabIndex={tabbable ? 0 : -1}
                  onClick={flip}
                  aria-label={`Flip the ${card.org} card back to its front`}
                >
                  <ArrowLeft size={13} strokeWidth={2.3} aria-hidden="true" />
                  Card front
                </button>
                <p>
                  No. {serial(card.number)}/{serial(total)}
                </p>
              </footer>
            </div>
          </section>
        </motion.div>
      </motion.div>
    </div>
  );
}
