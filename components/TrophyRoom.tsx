"use client";

import {
  AnimatePresence,
  motion,
  useIsPresent,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  GraduationCap,
  Landmark,
  Medal,
  ScrollText,
  Sparkles,
  Trophy as TrophyGlyph,
  Volume2,
  VolumeX,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
} from "react";
import { certificateFiles } from "@/content/media";
import { asset } from "@/content/paths";
import {
  trophies,
  trophyStats,
  type Trophy,
  type TrophyTier,
} from "@/content/trophies";
import { useMotionPreference } from "./useMotionPreference";

type FilterId = "all" | "first" | "podium" | "national";
type CertificateFile = { src: string; title: string };

const files: Readonly<Record<string, CertificateFile>> = certificateFiles;
const soundKey = "ian-trophy-sfx";

const filters: readonly {
  id: FilterId;
  label: string;
  matches: (trophy: Trophy) => boolean;
}[] = [
  { id: "all", label: "All Trophies", matches: () => true },
  {
    id: "first",
    label: "1st Place / Platinum",
    matches: (trophy) => trophy.place === 1,
  },
  {
    id: "podium",
    label: "Podiums",
    matches: (trophy) => trophy.place !== undefined,
  },
  {
    id: "national",
    label: "National Honors",
    matches: (trophy) => trophy.kind === "national",
  },
];

const glyphs: Readonly<Record<Trophy["icon"], LucideIcon>> = {
  trophy: TrophyGlyph,
  medal: Medal,
  award: Award,
  sparkles: Sparkles,
  scholar: GraduationCap,
  landmark: Landmark,
  scroll: ScrollText,
  badge: BadgeCheck,
};

// Metallic foils for first and second place; neon glows for finalists and honours.
const tiers: Readonly<
  Record<
    TrophyTier,
    {
      ring: string;
      core: string;
      glyph: string;
      glow: string;
      spot: string;
      pill: string;
      dot: string;
      spark: string;
    }
  >
> = {
  gold: {
    ring: "from-amber-300 via-yellow-500 to-amber-600",
    core: "from-amber-500 via-yellow-300 to-amber-100",
    glyph: "text-amber-900",
    glow: "bg-amber-400/45",
    spot: "from-amber-200/70 dark:from-amber-400/20",
    pill: "border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200",
    dot: "bg-amber-500",
    spark: "bg-amber-400",
  },
  silver: {
    ring: "from-zinc-200 via-slate-300 to-zinc-400",
    core: "from-slate-400 via-zinc-200 to-white",
    glyph: "text-slate-700",
    glow: "bg-slate-400/40",
    spot: "from-slate-200/90 dark:from-slate-300/15",
    pill: "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-400/35 dark:bg-slate-300/10 dark:text-slate-200",
    dot: "bg-slate-400",
    spark: "bg-slate-300",
  },
  finalist: {
    ring: "from-cyan-200 via-cyan-400 to-sky-600",
    core: "from-cyan-600 via-cyan-300 to-cyan-50",
    glyph: "text-cyan-950",
    glow: "bg-cyan-400/55",
    spot: "from-cyan-200/70 dark:from-cyan-400/20",
    pill: "border-cyan-300/80 bg-cyan-50 text-cyan-800 dark:border-cyan-400/35 dark:bg-cyan-400/10 dark:text-cyan-200",
    dot: "bg-cyan-400 shadow-[0_0_8px_#22d3ee]",
    spark: "bg-cyan-300",
  },
  honor: {
    ring: "from-emerald-200 via-emerald-400 to-teal-600",
    core: "from-emerald-600 via-emerald-300 to-emerald-50",
    glyph: "text-emerald-950",
    glow: "bg-emerald-400/55",
    spot: "from-emerald-200/70 dark:from-emerald-400/20",
    pill: "border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-400/35 dark:bg-emerald-400/10 dark:text-emerald-200",
    dot: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
    spark: "bg-emerald-300",
  },
};

const rarity = { 5: "Ultra rare", 4: "Super rare", 3: "Rare" } as const;

const sheen: Variants = {
  rest: { x: "-130%", transition: { duration: 0 } },
  hover: { x: "330%", transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};
const sparks = Array.from(
  { length: 10 },
  (_, index) => (index / 10) * 2 * Math.PI,
);

// Bell-like arpeggios pitched by tier, with gold ringing highest.
const chimes: Readonly<Record<TrophyTier, readonly number[]>> = {
  gold: [1318.51, 1661.22, 1975.53, 2637.02],
  silver: [1174.66, 1479.98, 1760, 2349.32],
  finalist: [1046.5, 1318.51, 1567.98],
  honor: [987.77, 1318.51, 1661.22],
};
let audio: AudioContext | undefined;

function playChime(tier: TrophyTier) {
  const Context =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Context) return;
  try {
    audio ??= new Context();
    const context = audio;
    void context.resume();
    const output = context.createGain();
    output.gain.value = 0.05;
    output.connect(context.destination);
    const start = context.currentTime + 0.01;
    chimes[tier].forEach((frequency, index) => {
      const at = start + index * 0.07;
      // A quiet inharmonic partial (2.76×) gives each note its bell shimmer.
      for (const [ratio, level] of [
        [1, 1],
        [2.76, 0.18],
      ] as const) {
        const tone = context.createOscillator();
        const envelope = context.createGain();
        tone.type = "sine";
        tone.frequency.value = frequency * ratio;
        envelope.gain.setValueAtTime(0.0001, at);
        envelope.gain.exponentialRampToValueAtTime(level, at + 0.012);
        envelope.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
        tone.connect(envelope).connect(output);
        tone.start(at);
        tone.stop(at + 0.55);
      }
    });
    window.setTimeout(() => output.disconnect(), 1500);
  } catch {
    // Sound is decoration; a blocked or unsupported context stays silent.
  }
}

function Rarity({ stars }: { stars: Trophy["stars"] }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true">
        {"★".repeat(stars)}
        <span className="opacity-55">{"☆".repeat(5 - stars)}</span>
      </span>
      {rarity[stars]}
      <span className="sr-only">({stars} of 5 stars)</span>
    </span>
  );
}

function Placement({ trophy }: { trophy: Trophy }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-2 py-1 font-mono text-[11px] font-semibold tracking-[0.08em] text-zinc-800 uppercase dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100">
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${tiers[trophy.tier].dot}`}
      />
      {trophy.placement}
    </span>
  );
}

function Medallion({
  trophy,
  large = false,
}: {
  trophy: Trophy;
  large?: boolean;
}) {
  const tier = tiers[trophy.tier];
  const Glyph = glyphs[trophy.icon];
  return (
    <span
      aria-hidden="true"
      className={`relative grid place-items-center ${large ? "size-24" : "size-22"}`}
    >
      <span className={`absolute -inset-2 rounded-full blur-xl ${tier.glow}`} />
      <span
        className={`relative grid size-full place-items-center rounded-full bg-linear-to-br p-[7px] ${tier.ring} shadow-[inset_0_1px_1px_rgb(255_255_255/0.9),inset_0_-3px_5px_rgb(0_0_0/0.22),0_14px_22px_-12px_rgb(0_0_0/0.55)]`}
      >
        <span
          className={`relative grid size-full place-items-center overflow-hidden rounded-full bg-linear-to-br ${tier.core} shadow-[inset_0_3px_6px_rgb(0_0_0/0.28),inset_0_-2px_3px_rgb(255_255_255/0.65)]`}
        >
          <Glyph
            className={`${tier.glyph} drop-shadow-[0_1px_0_rgb(255_255_255/0.6)]`}
            size={large ? 40 : 34}
            strokeWidth={1.75}
          />
          <motion.span
            className="absolute -inset-y-1/4 left-0 w-2/5 -skew-x-12 bg-linear-to-r from-transparent via-white/75 to-transparent"
            variants={sheen}
          />
        </span>
      </span>
    </span>
  );
}

function TrophyCard({
  trophy,
  tilt,
  onInspect,
  buttonRef,
  ref,
}: {
  trophy: Trophy;
  tilt: boolean;
  onInspect: (trophy: Trophy) => void;
  buttonRef: Ref<HTMLButtonElement>;
  ref?: Ref<HTMLLIElement>;
}) {
  const present = useIsPresent();
  const leanX = useMotionValue(0);
  const leanY = useMotionValue(0);
  const rotateX = useSpring(leanX, { stiffness: 260, damping: 22 });
  const rotateY = useSpring(leanY, { stiffness: 260, damping: 22 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(30);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.5), transparent 55%)`;
  const tier = tiers[trophy.tier];

  // The list item tracks the pointer because it never moves; tracking the
  // tilting card would let its edge slip out from under the pointer.
  function lean(event: PointerEvent<HTMLElement>) {
    if (!tilt || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    leanX.set((0.5 - y) * 10);
    leanY.set((x - 0.5) * 12);
    glareX.set(x * 100);
    glareY.set(y * 100);
  }
  function settle() {
    leanX.set(0);
    leanY.set(0);
  }
  function inspect() {
    // Open from a flat card so the shared transition starts square.
    for (const value of [leanX, leanY, rotateX, rotateY]) value.jump(0);
    onInspect(trophy);
  }

  return (
    // Filtered-out cards linger, invisible, until their layout settles; inert
    // drops them from the tab order and lets clicks reach the cards beneath.
    <motion.li
      ref={ref}
      inert={!present}
      className="h-full"
      variants={{ rest: { opacity: 1 }, hover: { opacity: 1 } }}
      initial={{ opacity: 0 }}
      animate="rest"
      whileHover="hover"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onPointerMove={lean}
      onPointerLeave={settle}
    >
      <motion.article
        layoutId={`trophy-${trophy.id}`}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 900,
          borderRadius: 12,
        }}
        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white/70 p-5 shadow-[0_1px_2px_rgb(0_0_0/0.05)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_26px_50px_-30px_rgb(6_78_59/0.6)] dark:border-zinc-800 dark:bg-zinc-900/60"
      >
        {/* Below the text (-z-10 within the card) so the glare never washes it out. */}
        {tilt ? (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
            style={{ backgroundImage: glare }}
          />
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase">
          <span className={`rounded-full border px-2.5 py-1 ${tier.pill}`}>
            <Rarity stars={trophy.stars} />
          </span>
          <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-lime-200 dark:bg-lime-200 dark:text-zinc-900">
            +{trophy.xp} XP
          </span>
        </div>
        <div className="relative mt-4 grid h-36 place-items-center overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/50">
          <span aria-hidden="true" className="paper-grid absolute inset-0" />
          <span
            aria-hidden="true"
            className={`absolute inset-0 bg-radial ${tier.spot} to-transparent to-70%`}
          />
          <span
            aria-hidden="true"
            className="absolute bottom-5 h-2.5 w-20 rounded-[50%] bg-zinc-900/20 blur-[3px] dark:bg-black/60"
          />
          <motion.div layoutId={`trophy-medal-${trophy.id}`}>
            <motion.div
              variants={{
                rest: { y: 0, rotate: 0 },
                hover: { y: -6, rotate: -5 },
              }}
            >
              <Medallion trophy={trophy} />
            </motion.div>
          </motion.div>
        </div>
        <h3 className="mt-4 text-[17px] leading-snug font-semibold tracking-[-0.01em] text-zinc-900 dark:text-zinc-50">
          {trophy.name}
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {trophy.issuer}
          {trophy.year ? ` · ${trophy.year}` : null}
        </p>
        <p className="mt-3 flex">
          <Placement trophy={trophy} />
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
          <span className="font-mono text-[10px] font-semibold tracking-[0.12em] text-zinc-500 uppercase dark:text-zinc-400">
            {trophy.built ? "Built:" : "Record:"}
          </span>{" "}
          {trophy.built ?? trophy.record}
        </p>
        <div className="mt-auto pt-5">
          {/* The ::after layer stretches this button over the card, so a click
            anywhere on the trophy inspects it. */}
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="dialog"
            onClick={inspect}
            className="flex min-h-11 w-full items-center justify-center rounded-lg border border-zinc-300 bg-zinc-50/80 px-3 font-mono text-[11px] font-semibold tracking-[0.1em] text-zinc-700 uppercase transition-colors group-hover:border-emerald-800 group-hover:bg-emerald-800 group-hover:text-white after:absolute after:inset-0 after:content-[''] dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200 dark:group-hover:border-emerald-300 dark:group-hover:bg-emerald-300 dark:group-hover:text-emerald-950"
          >
            <span aria-hidden="true">[ Inspect Achievement ↳ ]</span>
            <span className="sr-only">Inspect achievement: {trophy.name}</span>
          </button>
        </div>
      </motion.article>
    </motion.li>
  );
}

function TrophyDialog({
  trophy,
  reduced,
  onClose,
  onLeave,
  onRemoved,
}: {
  trophy: Trophy;
  reduced: boolean;
  onClose: () => void;
  onLeave: () => void;
  onRemoved: (id: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pressedBackdrop = useRef(false);
  const prefix = useId();
  const tier = tiers[trophy.tier];
  const points = trophy.strategy ?? trophy.notes ?? [];
  const certificates = trophy.certificateKeys.flatMap((key) =>
    files[key] ? [files[key]] : [],
  );

  // Open as a modal during commit, before Framer measures the shared layout.
  const show = useCallback((dialog: HTMLDialogElement | null) => {
    dialogRef.current = dialog;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    // Lock <body> alone. Its overflow passes to the viewport, while locking
    // <html> too would make <body> a scroller and unpin the sticky site header.
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
      // Runs after the dialog leaves the page, once its opener is focusable.
      onRemoved(trophy.id);
    };
  }, [onRemoved, trophy.id]);

  useEffect(() => {
    // Back or Forward hides the Awards tab around the open modal, leaving the
    // page inert with nothing visible to dismiss. Leave at once: an exit
    // animation can't finish inside a hidden tab.
    const leave = () => {
      dialogRef.current?.close();
      onLeave();
    };
    window.addEventListener("hashchange", leave);
    window.addEventListener("popstate", leave);
    return () => {
      window.removeEventListener("hashchange", leave);
      window.removeEventListener("popstate", leave);
    };
  }, [onLeave]);

  function keys(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    onClose();
  }

  return (
    <dialog
      ref={show}
      tabIndex={-1}
      aria-labelledby={`${prefix}-title`}
      onKeyDown={keys}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      className="fixed inset-0 m-0 h-auto max-h-none w-auto max-w-none overflow-y-auto overscroll-contain border-0 bg-transparent p-0 text-inherit backdrop:bg-transparent"
    >
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 bg-zinc-950/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      {/* Closes only when the press starts on the backdrop too, so a text
          selection dragged past the panel's edge doesn't dismiss it. */}
      <div
        className="relative flex min-h-full items-end justify-center p-3 sm:items-center sm:p-8"
        onPointerDown={(event) => {
          pressedBackdrop.current = event.target === event.currentTarget;
        }}
        onClick={(event) => {
          if (pressedBackdrop.current && event.target === event.currentTarget)
            onClose();
        }}
      >
        <motion.article
          layoutId={`trophy-${trophy.id}`}
          initial="rest"
          animate="hover"
          style={{ borderRadius: 16 }}
          className="relative w-full max-w-2xl overflow-clip border border-zinc-200 bg-white text-zinc-900 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        >
          {/* Sticky (overflow-clip above isn't a scroller), so a long dialog
              on a phone keeps its close button in reach. */}
          <div className="pointer-events-none sticky top-0 z-20 flex h-0 justify-end">
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close achievement"
              className="pointer-events-auto mt-3 mr-3 grid size-11 shrink-0 place-items-center rounded-full bg-white/80 text-zinc-600 backdrop-blur transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>
          <motion.header
            layout
            className="relative flex flex-col gap-5 border-b border-zinc-200 bg-zinc-50/90 p-5 sm:flex-row sm:items-center sm:p-6 dark:border-zinc-800 dark:bg-zinc-950/50"
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 bg-radial-[at_14%_50%] ${tier.spot} to-transparent to-60%`}
            />
            <div className="relative grid size-28 shrink-0 place-items-center">
              {reduced
                ? null
                : sparks.map((angle) => (
                    <motion.span
                      key={angle}
                      aria-hidden="true"
                      className={`absolute top-1/2 left-1/2 -mt-[3px] -ml-[3px] size-1.5 rounded-full ${tier.spark}`}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
                      animate={{
                        x: Math.cos(angle) * 70,
                        y: Math.sin(angle) * 70,
                        opacity: [0, 1, 0],
                        scale: [0.6, 1.2, 0.4],
                      }}
                      transition={{
                        duration: 0.8,
                        delay: 0.2,
                        ease: "easeOut",
                      }}
                    />
                  ))}
              <motion.div layoutId={`trophy-medal-${trophy.id}`}>
                <Medallion trophy={trophy} large />
              </motion.div>
            </div>
            <div className="relative min-w-0 sm:pr-10">
              <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-emerald-800 uppercase dark:text-emerald-300">
                Achievement unlocked · +{trophy.xp} XP
              </p>
              <h2
                id={`${prefix}-title`}
                className="mt-1.5 text-xl leading-tight font-semibold tracking-tight sm:text-2xl"
              >
                {trophy.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {trophy.issuer}
                {trophy.year ? ` · ${trophy.year}` : null}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Placement trophy={trophy} />
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase ${tier.pill}`}
                >
                  <Rarity stars={trophy.stars} />
                </span>
              </div>
            </div>
          </motion.header>
          <motion.div
            layout
            className="space-y-6 p-5 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.12, duration: 0.25 },
            }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            {points.length ? (
              <section aria-labelledby={`${prefix}-points`}>
                <h3
                  id={`${prefix}-points`}
                  className="font-mono text-[11px] font-semibold tracking-[0.14em] text-zinc-500 uppercase dark:text-zinc-400"
                >
                  {trophy.strategy
                    ? trophy.place
                      ? "The Winning Strategy"
                      : "The Build"
                    : "The Record"}
                </h3>
                <ul className="mt-3 space-y-3">
                  {points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-200"
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-2.5 size-1.5 shrink-0 rotate-45 ${tier.dot}`}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {trophy.stack.length ? (
              <section aria-labelledby={`${prefix}-stack`}>
                <h3
                  id={`${prefix}-stack`}
                  className="font-mono text-[11px] font-semibold tracking-[0.14em] text-zinc-500 uppercase dark:text-zinc-400"
                >
                  Tech stack
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {trophy.stack.map((technology) => (
                    <li
                      key={technology}
                      className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
                    >
                      {technology}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {trophy.source || certificates.length ? (
              <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:flex-wrap sm:items-center dark:border-zinc-800">
                {trophy.source ? (
                  <a
                    href={trophy.source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-800 px-4 font-mono text-[12px] font-semibold tracking-[0.08em] text-white uppercase transition-colors hover:bg-emerald-900 dark:bg-emerald-300 dark:text-emerald-950 dark:hover:bg-emerald-200"
                  >
                    <span aria-hidden="true">[ ↗︎&nbsp;</span>
                    Explore Source Code
                    <span aria-hidden="true">&nbsp;]</span>
                    <span className="sr-only">
                      {trophy.source.label ? ` (${trophy.source.label})` : ""},
                      opens in a new tab
                    </span>
                  </a>
                ) : null}
                {certificates.map((file) => {
                  const label =
                    certificates.length > 1
                      ? `${file.title.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? "View"} certificate`
                      : "View certificate";
                  return (
                    <a
                      key={file.src}
                      href={asset(file.src)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${label}: ${file.title}, opens in a new tab`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 text-[13px] font-semibold text-zinc-700 transition-colors hover:border-emerald-700 hover:text-emerald-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-emerald-300 dark:hover:text-emerald-200"
                    >
                      {label}
                      <ArrowUpRight aria-hidden="true" size={15} />
                    </a>
                  );
                })}
                {trophy.source?.label ? (
                  <p
                    aria-hidden="true"
                    className="font-mono text-[10px] tracking-[0.12em] text-zinc-500 uppercase sm:ml-auto dark:text-zinc-400"
                  >
                    {trophy.source.label}
                  </p>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        </motion.article>
      </div>
    </dialog>
  );
}

function TrophyRoom() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [active, setActive] = useState<Trophy>();
  const [sound, setSound] = useState(true);
  const reduced = useMotionPreference();
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const sectionRef = useRef<HTMLElement>(null);
  const prefix = useId();
  const { unlocked, total, xp, rank } = trophyStats;
  const visible = trophies.filter(
    filters.find((item) => item.id === filter)!.matches,
  );
  const focusTrophy = useCallback(
    (id: string) => buttons.current.get(id)?.focus({ preventScroll: true }),
    [],
  );
  // A new key remounts the dialog's AnimatePresence, removing the dialog
  // without waiting for an exit animation.
  const [presence, setPresence] = useState(0);
  const leaveDialog = useCallback(() => {
    setActive(undefined);
    setPresence((count) => count + 1);
  }, []);

  useEffect(() => {
    try {
      setSound(localStorage.getItem(soundKey) !== "off");
    } catch {}
  }, []);

  // Links to the retired Competitions and Government sub-tabs pick the
  // matching filter. It waits until the Awards tab is showing: Framer measures
  // the cards on every filter change, and a hidden grid measures as zero-size.
  useEffect(() => {
    const hashFilters: Readonly<Record<string, FilterId>> = {
      "#competitions": "all",
      "#government": "national",
    };
    let frame = 0;
    const sync = () => {
      const next = hashFilters[window.location.hash.toLowerCase()];
      cancelAnimationFrame(frame);
      if (!next) return;
      let attempts = 60;
      const apply = () => {
        if (sectionRef.current?.getClientRects().length) setFilter(next);
        else if (--attempts > 0) frame = requestAnimationFrame(apply);
      };
      apply();
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  function inspect(trophy: Trophy) {
    if (sound) playChime(trophy.tier);
    setActive(trophy);
  }
  function toggleSound() {
    const next = !sound;
    setSound(next);
    try {
      localStorage.setItem(soundKey, next ? "on" : "off");
    } catch {}
  }

  return (
    <section ref={sectionRef} aria-labelledby={`${prefix}-title`}>
      <header className="relative overflow-hidden rounded-xl border border-emerald-950 bg-[#0c1f18] px-4 py-3.5 font-mono text-[11px] tracking-[0.12em] text-emerald-100/75 uppercase shadow-[0_18px_40px_-28px_rgb(6_78_59/0.8)] sm:px-5">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgb(255_255_255/0.04)_0_1px,transparent_1px_3px)]"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <h2 id={`${prefix}-title`} className="font-semibold text-lime-200">
            <span className="sr-only">Trophy Room: Hall of Fame</span>
            <span
              aria-hidden="true"
              className="flex flex-wrap items-center gap-x-2 gap-y-1"
            >
              <span className="flex items-center gap-2">
                [<TrophyGlyph size={14} />
                Trophy Room
              </span>
              <span className="text-lime-200/45">//</span>
              <span>Hall of Fame&nbsp;]</span>
            </span>
          </h2>
          <dl className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2.5">
            <div className="flex gap-1.5">
              <dt>Unlocked:</dt>
              <dd className="text-lime-200">
                {unlocked}/{total} ({Math.round((unlocked / total) * 100)}%)
              </dd>
            </div>
            <div className="flex gap-1.5 sm:before:text-emerald-100/35 sm:before:content-['·'_/_'']">
              <dt>Total XP:</dt>
              <dd className="text-lime-200">{xp.toLocaleString("en-US")}</dd>
            </div>
            <div className="flex gap-1.5 sm:before:text-emerald-100/35 sm:before:content-['·'_/_'']">
              <dt>Rank:</dt>
              <dd className="text-lime-200">{rank}</dd>
            </div>
          </dl>
        </div>
        <div
          aria-hidden="true"
          className="relative mt-3 h-1 overflow-hidden rounded-full bg-emerald-950/80"
        >
          <motion.span
            className="block h-full origin-left rounded-full bg-linear-to-r from-lime-300 via-emerald-300 to-cyan-300"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: unlocked / total }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </header>
      <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center">
        <div
          role="group"
          aria-label="Filter trophies"
          className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap"
        >
          {filters.map((item) => {
            const selected = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(item.id)}
                className={`relative flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 font-mono text-[11px] font-semibold tracking-[0.04em] uppercase transition-colors sm:tracking-[0.08em] ${
                  selected
                    ? "border-emerald-800 text-white forced-colors:border-[Highlight] dark:border-emerald-300 dark:text-emerald-950"
                    : "border-zinc-200 bg-white/70 text-zinc-600 hover:border-emerald-700/50 hover:text-emerald-800 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-emerald-300/50 dark:hover:text-emerald-200"
                }`}
              >
                {selected ? (
                  <motion.span
                    layoutId={`${prefix}-filter`}
                    className="absolute -inset-px bg-emerald-800 dark:bg-emerald-300"
                    style={{ borderRadius: 8 }}
                  />
                ) : null}
                <span className="relative">
                  <span aria-hidden="true">[&nbsp;</span>
                  {item.label}
                  <span aria-hidden="true">&nbsp;]</span>
                </span>
                <span
                  className={`relative rounded px-1.5 py-0.5 text-[10px] ${
                    selected
                      ? "bg-lime-200 text-emerald-950"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {trophies.filter(item.matches).length}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-pressed={sound}
          onClick={toggleSound}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 font-mono text-[11px] tracking-[0.08em] text-zinc-500 uppercase transition-colors hover:border-zinc-400 hover:text-zinc-800 sm:self-end lg:ml-auto lg:self-auto dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {sound ? (
            <Volume2 aria-hidden="true" size={15} />
          ) : (
            <VolumeX aria-hidden="true" size={15} />
          )}
          SFX<span className="sr-only"> sound effects</span>
          <span aria-hidden="true">{sound ? "On" : "Off"}</span>
        </button>
      </div>
      <p className="sr-only" role="status">
        Showing {visible.length} of {total} trophies.
      </p>
      <div className="relative isolate mt-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <span className="absolute top-[6%] left-[4%] size-56 rounded-full bg-amber-300/25 blur-3xl dark:bg-amber-400/10" />
          <span className="absolute top-[34%] right-[2%] size-64 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-400/10" />
          <span className="absolute bottom-[4%] left-[36%] size-64 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-400/10" />
        </div>
        <ul className="relative grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((trophy) => (
              <TrophyCard
                key={trophy.id}
                trophy={trophy}
                tilt={!reduced}
                onInspect={inspect}
                buttonRef={(element) => {
                  if (element) buttons.current.set(trophy.id, element);
                  else buttons.current.delete(trophy.id);
                }}
              />
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <AnimatePresence key={presence}>
        {active ? (
          <TrophyDialog
            key={active.id}
            trophy={active}
            reduced={reduced}
            onClose={() => setActive(undefined)}
            onLeave={leaveDialog}
            onRemoved={focusTrophy}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

// Memoised so tab switches elsewhere don't re-measure the hidden grid and
// replay its layout animations from a zero-size box.
export default memo(TrophyRoom);
