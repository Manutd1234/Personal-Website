"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { decks, type Deck, type DeckId } from "@/content/card-decks";
import TradingCard from "./TradingCard";
import { useMotionPreference } from "./useMotionPreference";

type Collection = Readonly<Record<DeckId, readonly number[]>>;
type TrackView = {
  nearest: number;
  visible: readonly number[];
  atStart: boolean;
  atEnd: boolean;
};

const emptyCollection: Collection = {
  work: [],
  education: [],
  community: [],
  volunteering: [],
};
const deckFromHash: Readonly<Record<string, DeckId>> = {
  "#work": "work",
  "#education": "education",
  "#community": "community",
  "#leadership": "community",
  "#volunteering": "volunteering",
};
const deckIndex = (id: DeckId) => decks.findIndex((deck) => deck.id === id);
const deckMotion = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 56 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -56 }),
};
const AUTO_SPEED = 24;
const MAX_FRAME_DELTA = 50;
const MANUAL_IDLE = 8500;

// The card whose snap position is closest to the current scroll. On a phone no
// card sits fully inside the track between snap points, so position must come
// from the snaps rather than from what is fully visible.
function nearestCard(
  track: HTMLElement,
  slots: readonly (HTMLLIElement | null)[],
) {
  const inset = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
  let nearest = 0;
  let distance = Infinity;
  slots.forEach((slot, index) => {
    if (!slot) return;
    const gap = Math.abs(slot.offsetLeft - inset - track.scrollLeft);
    if (gap < distance) {
      distance = gap;
      nearest = index;
    }
  });
  return nearest;
}

function DeckTrack({
  deck,
  dealt,
  reduced,
  collected,
  onCollect,
  active,
}: {
  deck: Deck;
  dealt: boolean;
  reduced: boolean;
  collected: readonly number[];
  onCollect: (deck: DeckId, index: number) => void;
  active: boolean;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const slotRefs = useRef<(HTMLLIElement | null)[]>([]);
  const loopRefs = useRef<(HTMLLIElement | null)[]>([]);
  const autoMoving = useRef(false);
  const idleUntil = useRef(0);
  const lastIdleSignal = useRef(-Infinity);
  const pending = useRef<number | null>(null);
  const pendingTimer = useRef(0);
  const [view, setView] = useState<TrackView>({
    nearest: 0,
    visible: [],
    atStart: true,
    atEnd: false,
  });
  const [focusIndex, setFocusIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [reading, setReading] = useState<ReadonlySet<string>>(() => new Set());
  const [visible, setVisible] = useState(false);
  const [interaction, setInteraction] = useState(0);
  const onScreen = useInView(groupRef, { amount: 0.2 });
  const cards = deck.cards;
  const trackId = useId();
  const canAutoplay =
    active &&
    dealt &&
    onScreen &&
    visible &&
    !reduced &&
    !hovered &&
    !focused &&
    !pressed &&
    reading.size === 0;

  const idle = useCallback(() => {
    const now = performance.now();
    idleUntil.current = now + MANUAL_IDLE;
    // Wheel streams update the deadline without rendering every browser frame.
    if (now - lastIdleSignal.current > 250) {
      lastIdleSignal.current = now;
      setInteraction((value) => value + 1);
    }
  }, []);

  const releasePointer = useCallback(() => {
    setPressed(false);
    idle();
  }, [idle]);

  const recordFlip = useCallback((id: string, flipped: boolean) => {
    setReading((previous) => {
      const next = new Set(previous);
      if (flipped) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    if (!pressed) return;
    window.addEventListener("pointerup", releasePointer);
    window.addEventListener("pointercancel", releasePointer);
    return () => {
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
    };
  }, [pressed, releasePointer]);

  // Keep a slow, constant reading-room drift. The inert copies at the end
  // match the beginning, so subtracting one exact cycle never changes the
  // visible cards. Only scrollLeft changes per frame; React owns no clock.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !canAutoplay || cards.length < 2) return;
    let timer = 0;
    let frame = 0;
    let disposed = false;
    const begin = () => {
      if (disposed) return;
      if (performance.now() < idleUntil.current) {
        timer = window.setTimeout(begin, idleUntil.current - performance.now());
        return;
      }
      let position = track.scrollLeft;
      let previous = performance.now();
      let cycleWidth = 0;
      let loopStart = 0;
      autoMoving.current = true;
      track.setAttribute("data-auto-moving", "true");
      const drift = (now: number) => {
        if (disposed) return;
        // A wheel/touch stream can extend the deadline between React renders.
        if (now < idleUntil.current) {
          autoMoving.current = false;
          track.removeAttribute("data-auto-moving");
          timer = window.setTimeout(begin, idleUntil.current - now);
          return;
        }
        const first = slotRefs.current[0];
        const loop = loopRefs.current[0];
        if (first && loop) {
          const nextCycle = loop.offsetLeft - first.offsetLeft;
          // Continue from the browser's actual position after a responsive
          // width change instead of replaying the old width's coordinates.
          if (nextCycle !== cycleWidth) {
            cycleWidth = nextCycle;
            position = track.scrollLeft;
            const inset =
              parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
            loopStart = loop.offsetLeft - inset;
          }
          if (cycleWidth > 0) {
            const delta = Math.min(
              MAX_FRAME_DELTA,
              Math.max(0, now - previous),
            );
            position += (AUTO_SPEED * delta) / 1000;
            if (position >= loopStart) position -= cycleWidth;
            track.scrollLeft = position;
          }
        }
        previous = now;
        frame = requestAnimationFrame(drift);
      };
      frame = requestAnimationFrame(drift);
    };
    begin();
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      autoMoving.current = false;
      track.removeAttribute("data-auto-moving");
    };
  }, [canAutoplay, cards.length, interaction]);

  // A card is collected once it has stayed mostly on screen for a moment, so
  // swiping quickly past a card does not count. "Mostly" is measured against
  // what can fit, so short landscape screens can still collect tall cards.
  // Only visible cards animate; that attribute is written directly.
  useEffect(() => {
    const timers = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slot = entry.target as HTMLElement;
          slot.toggleAttribute("data-live", entry.isIntersecting);
          window.clearTimeout(timers.get(slot));
          const box = entry.boundingClientRect;
          const seen = entry.intersectionRect;
          const fits = Math.min(
            box.height,
            entry.rootBounds?.height ?? box.height,
          );
          if (seen.width >= box.width * 0.6 && seen.height >= fits * 0.6)
            timers.set(
              slot,
              window.setTimeout(
                () => onCollect(deck.id, Number(slot.dataset.index)),
                350,
              ),
            );
        }
      },
      { threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] },
    );
    slotRefs.current.forEach((slot) => slot && observer.observe(slot));
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [deck.id, onCollect]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    let settle = 0;
    const measure = () => {
      frame = 0;
      const bounds = track.getBoundingClientRect();
      const visible = slotRefs.current.flatMap((slot, index) => {
        const box = slot?.getBoundingClientRect();
        return box &&
          box.left >= bounds.left - 2 &&
          box.right <= bounds.right + 2
          ? [index]
          : [];
      });
      const next = {
        nearest: nearestCard(track, slotRefs.current),
        visible,
        atStart: track.scrollLeft <= 2,
        atEnd:
          track.scrollLeft >=
          (slotRefs.current[cards.length - 1]?.offsetLeft ?? 0) -
            (parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0) -
            2,
      };
      // Enter the card currently in view after pointer browsing; keep an
      // existing keyboard focus stable while the track settles around it.
      if (!track.contains(document.activeElement)) setFocusIndex(next.nearest);
      setView((previous) =>
        previous.nearest === next.nearest &&
        previous.visible.join() === next.visible.join() &&
        previous.atStart === next.atStart &&
        previous.atEnd === next.atEnd
          ? previous
          : next,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    // A queued arrow target only lives while the track is moving.
    const onScroll = () => {
      schedule();
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        pending.current = null;
        const first = slotRefs.current[0];
        const loop = loopRefs.current[0];
        const inset =
          parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
        if (
          !autoMoving.current &&
          first &&
          loop &&
          track.scrollLeft >= loop.offsetLeft - inset - 2
        ) {
          track.scrollLeft -= loop.offsetLeft - first.offsetLeft;
          schedule();
        }
      }, 150);
    };
    // The section mounts hidden behind another tab, so re-measure when the
    // track gains a size, not only on scroll.
    const resize = new ResizeObserver(schedule);
    resize.observe(track);
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.clearTimeout(pendingTimer.current);
      resize.disconnect();
      track.removeEventListener("scroll", onScroll);
    };
  }, [cards.length]);

  function scrollToCard(index: number) {
    const track = trackRef.current;
    const slot = slotRefs.current[index];
    if (!track || !slot) return;
    const inset = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    track.scrollTo({
      left: slot.offsetLeft - inset,
      behavior: reduced ? "auto" : "smooth",
    });
  }
  function goTo(index: number) {
    pending.current = index;
    window.clearTimeout(pendingTimer.current);
    pendingTimer.current = window.setTimeout(() => {
      pending.current = null;
    }, 900);
    scrollToCard(index);
  }
  // Rapid presses continue from the card already being scrolled to.
  function step(delta: number) {
    const track = trackRef.current;
    if (!track) return;
    const from = pending.current ?? nearestCard(track, slotRefs.current);
    goTo(Math.min(cards.length - 1, Math.max(0, from + delta)));
  }
  const inView = (index: number) =>
    view.visible.length ? view.visible.includes(index) : index === view.nearest;
  function focusCard(index: number) {
    setFocusIndex(index);
    const controls = slotRefs.current[index]?.querySelectorAll<HTMLElement>(
      "[data-card-control]",
    );
    const control = Array.from(controls ?? []).find(
      (element) => !element.closest("[inert]"),
    );
    control?.focus({ preventScroll: true });
    if (!inView(index)) goTo(index);
  }
  function deckKeys(event: KeyboardEvent<HTMLUListElement>) {
    if (!(event.target as HTMLElement).matches("[data-card-control]")) return;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? cards.length - 1
          : event.key === "ArrowRight"
            ? focusIndex + 1
            : event.key === "ArrowLeft"
              ? focusIndex - 1
              : null;
    if (next === null || next < 0 || next >= cards.length) return;
    event.preventDefault();
    focusCard(next);
  }

  return (
    <div
      ref={groupRef}
      className="deck-track-group"
      data-autoplay={canAutoplay ? "running" : "paused"}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") {
          setHovered(false);
          idle();
        }
      }}
      onPointerDownCapture={() => {
        setPressed(true);
        idle();
      }}
      onPointerUpCapture={releasePointer}
      onPointerCancelCapture={releasePointer}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
          idle();
        }
      }}
      onKeyDownCapture={idle}
      onWheelCapture={idle}
    >
      <ul
        ref={trackRef}
        id={trackId}
        className="deck-track"
        tabIndex={-1}
        data-deck-track
        data-continuous={!reduced}
        data-at-start={view.atStart}
        data-at-end={view.atEnd}
        aria-label={`${deck.label} records`}
        onKeyDown={deckKeys}
      >
        {cards.map((card, index) => (
          <motion.li
            key={card.id}
            ref={(slot) => {
              slotRefs.current[index] = slot;
            }}
            className="deck-slot min-h-[600px] w-[min(340px,calc(100vw_-_58px))] flex-shrink-0 sm:w-[420px]"
            data-deck-card
            data-index={index}
            initial={
              reduced
                ? false
                : { opacity: 0, y: 24, rotate: index % 2 ? 1.5 : -1.5 }
            }
            animate={dealt ? { opacity: 1, y: 0, rotate: 0 } : undefined}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 250,
                    damping: 26,
                    delay: Math.min(index, 5) * 0.06,
                  }
            }
            onFocusCapture={() => setFocusIndex(index)}
          >
            <TradingCard
              card={card}
              reduced={reduced}
              tabbable={index === focusIndex}
              onFlipChange={recordFlip}
            />
          </motion.li>
        ))}
        {cards.slice(0, 3).map((card, index) => (
          <li
            key={`${card.id}-loop`}
            ref={(slot) => {
              loopRefs.current[index] = slot;
            }}
            className="deck-slot deck-loop-slot min-h-[600px] w-[min(340px,calc(100vw_-_58px))] flex-shrink-0 sm:w-[420px]"
            aria-hidden="true"
            inert
          >
            <TradingCard card={card} reduced tabbable={false} />
          </li>
        ))}
      </ul>
      <div className="deck-controls">
        <div className="deck-nav">
          {/* aria-disabled keeps a focused arrow focusable at either end. */}
          <button
            type="button"
            className="deck-arrow"
            aria-label="Previous record"
            aria-controls={trackId}
            aria-disabled={view.atStart}
            onClick={() => {
              if (!view.atStart) step(-1);
            }}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <div className="deck-dots" aria-hidden="true">
            {cards.map((card, index) => (
              <button
                type="button"
                tabIndex={-1}
                key={card.id}
                data-collected={collected.includes(index)}
                data-visible={inView(index)}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
          <button
            type="button"
            className="deck-arrow"
            aria-label="Next record"
            aria-controls={trackId}
            aria-disabled={view.atEnd}
            onClick={() => {
              if (!view.atEnd) step(1);
            }}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="deck-position">
          <span>
            {view.nearest + 1} / {cards.length}
          </span>
          {cards[view.nearest]?.org}
        </p>
        <p className="deck-hint">
          <span className="deck-hint-pointer">
            {reduced ? "" : "Always rolling · hover to pause · "}
            click a card to turn it · ← → to browse
          </span>
          <span className="deck-hint-touch">
            {reduced ? "" : "Always rolling · "}swipe to browse · tap a card to
            turn it
          </span>
        </p>
      </div>
    </div>
  );
}

export default function CardShowcase({
  active: sectionActive = true,
}: {
  active?: boolean;
}) {
  const [{ active, direction }, setDeckState] = useState<{
    active: DeckId;
    direction: number;
  }>({ active: "work", direction: 1 });
  const [collected, setCollected] = useState<Collection>(emptyCollection);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const dealt = useInView(stageRef, { once: true, amount: 0.15 });
  const reduced = useMotionPreference();
  const prefix = useId();

  const select = useCallback((id: DeckId) => {
    setDeckState((previous) =>
      previous.active === id
        ? previous
        : {
            active: id,
            direction: deckIndex(id) >= deckIndex(previous.active) ? 1 : -1,
          },
    );
  }, []);

  useEffect(() => {
    const syncHash = () => {
      const id = deckFromHash[window.location.hash.toLowerCase()];
      if (id) select(id);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [select]);

  const collect = useCallback((deck: DeckId, index: number) => {
    setCollected((previous) =>
      previous[deck].includes(index)
        ? previous
        : { ...previous, [deck]: [...previous[deck], index] },
    );
  }, []);

  function tabKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? decks.length - 1
          : event.key === "ArrowRight"
            ? (index + 1) % decks.length
            : event.key === "ArrowLeft"
              ? (index + decks.length - 1) % decks.length
              : null;
    if (next === null) return;
    event.preventDefault();
    select(decks[next].id);
    tabRefs.current[next]?.focus({ preventScroll: true });
  }

  const deck = decks.find((item) => item.id === active)!;
  const count = collected[active].length;
  const total = deck.cards.length;
  const complete = count === total;

  return (
    <div className="deck-showcase career-archive-shell">
      <div className="deck-toolbar">
        <div
          className="deck-tabs"
          role="tablist"
          aria-label="Experience categories"
        >
          {decks.map((item, index) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              id={`${prefix}-${item.id}-tab`}
              aria-controls={`${prefix}-panel`}
              aria-selected={active === item.id}
              tabIndex={active === item.id ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(event) => tabKeys(event, index)}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
            >
              {active === item.id ? (
                <motion.span
                  className="deck-tab-pill"
                  layoutId="deck-tab-pill"
                />
              ) : null}
              <span className="deck-tab-label">{item.label}</span>
              <span className="deck-tab-count">{item.cards.length}</span>
            </button>
          ))}
        </div>
        <p className="deck-progress" data-complete={complete}>
          <span aria-hidden="true">
            <span className="deck-progress-label">
              {complete ? "All explored" : "Explored"}
            </span>
            <span className="deck-progress-count">
              <motion.span
                key={`${active}-${count}`}
                initial={reduced ? false : { opacity: 0, y: -7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduced ? { duration: 0 } : undefined}
              >
                {count}
              </motion.span>{" "}
              / {total}
            </span>
          </span>
          <span className="sr-only">
            {count} of {total} {deck.label} records explored.
          </span>
        </p>
        <p className="sr-only" role="status">
          {complete ? `All ${total} ${deck.label} records explored.` : ""}
        </p>
      </div>
      <div
        ref={stageRef}
        className="deck-stage"
        id={`${prefix}-panel`}
        role="tabpanel"
        aria-labelledby={`${prefix}-${active}-tab`}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={active}
            className="deck-view"
            custom={direction}
            variants={deckMotion}
            initial={reduced ? false : "enter"}
            animate="center"
            exit={reduced ? "center" : "exit"}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    x: { type: "spring", stiffness: 320, damping: 32 },
                    opacity: { duration: 0.18 },
                  }
            }
          >
            <h2 className="sr-only">{deck.label} records</h2>
            <DeckTrack
              deck={deck}
              dealt={dealt}
              reduced={reduced}
              collected={collected[active]}
              onCollect={collect}
              active={sectionActive}
            />
          </motion.div>
        </AnimatePresence>
        {/* The other decks stay in the static HTML, as the old panels did. */}
        <div hidden>
          {decks
            .filter((item) => item.id !== active)
            .map((item) => (
              <section key={item.id} aria-label={`${item.label} records`}>
                <ul>
                  {item.cards.map((card) => (
                    <li key={card.id}>
                      {card.org}: {card.role}, {card.location}, {card.dates}.{" "}
                      {card.summary} {card.bullets.join(" ")}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      </div>
    </div>
  );
}
