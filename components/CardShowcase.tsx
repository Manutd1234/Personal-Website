"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
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
  exposed: readonly number[];
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
const MANUAL_IDLE = 1200;

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

// Move focus to the equivalent control before its old physical instance is
// hidden. This also preserves a scrolled story while crossing the loop seam.
function transferCardFocus(from: HTMLElement, to: HTMLElement) {
  const controls = "a, button, [tabindex]";
  const index = Array.from(from.querySelectorAll<HTMLElement>(controls))
    .indexOf(document.activeElement as HTMLElement);
  to.inert = false;
  to.removeAttribute("aria-hidden");
  const oldBody = from.querySelector<HTMLElement>(".tcg-back-body");
  const newBody = to.querySelector<HTMLElement>(".tcg-back-body");
  if (oldBody && newBody) newBody.scrollTop = oldBody.scrollTop;
  to.querySelectorAll<HTMLElement>(controls)[index]?.focus({ preventScroll: true });
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
  const cards = deck.cards;
  const autoSpeed = deck.id === "education" ? 28 : AUTO_SPEED;
  const count = cards.length;
  const groupRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const slotRefs = useRef<(HTMLLIElement | null)[]>([]);
  const initialized = useRef(false);
  const autoMoving = useRef(false);
  const idleUntil = useRef(0);
  const lastIdleSignal = useRef(-Infinity);
  const inputMode = useRef<"keyboard" | "pointer">("keyboard");
  const activeTouches = useRef(0);
  const pending = useRef<number | null>(null);
  const pendingTimer = useRef(0);
  const [view, setView] = useState<TrackView>({
    nearest: 0,
    visible: [],
    exposed: cards.map((_, index) => count + index),
  });
  const [focusIndex, setFocusIndex] = useState(count);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  // All three physical instances share one record's state. Recentring the rail
  // must never turn a story back over or replace it with an inert imitation.
  const [reading, setReading] = useState<ReadonlySet<string>>(() => new Set());
  const [visible, setVisible] = useState(false);
  const [interaction, setInteraction] = useState(0);
  const onScreen = useInView(groupRef, { amount: 0.2 });
  const trackId = useId();
  const canAutoplay =
    active && dealt && onScreen && visible && !reduced &&
    !hovered && !focused && !pressed;

  const idle = useCallback(() => {
    const now = performance.now();
    idleUntil.current = now + MANUAL_IDLE;
    if (now - lastIdleSignal.current > 250) {
      lastIdleSignal.current = now;
      setInteraction((value) => value + 1);
    }
  }, []);

  const releasePointer = useCallback(() => {
    // Native touch scrolling cancels pointer events before the finger lifts.
    // Keep the rail still until the matching touchend/touchcancel arrives.
    if (activeTouches.current > 0) return;
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

  const geometry = useCallback(() => {
    const track = trackRef.current;
    const first = slotRefs.current[0];
    const middle = slotRefs.current[count];
    if (!track || !first || !middle || !track.clientWidth) return null;
    const width = middle.offsetLeft - first.offsetLeft;
    if (width <= 0) return null;
    const inset = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    return { track, width, start: middle.offsetLeft - inset };
  }, [count]);

  // Keep one accessible instance of every logical record. A visible instance
  // wins over its offscreen twin, and keyboard focus is never hidden from AT.
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track || !initialized.current) return;
    const bounds = track.getBoundingClientRect();
    const activeElement = document.activeElement as HTMLElement | null;
    const activeSlot = activeElement?.closest<HTMLElement>("[data-rail-index]");
    const activeIndex = activeSlot && track.contains(activeSlot)
      ? Number(activeSlot.dataset.railIndex) : null;
    const exposed = cards.map((_, index) => {
      let best = count + index;
      let bestVisible = 0;
      let focusedVisible = 0;
      for (let cycle = 0; cycle < 3; cycle += 1) {
        const physical = cycle * count + index;
        const slot = slotRefs.current[physical];
        if (!slot) continue;
        const box = slot.getBoundingClientRect();
        const overlap = Math.max(0, Math.min(box.right, bounds.right) - Math.max(box.left, bounds.left));
        if (physical === activeIndex) focusedVisible = overlap;
        if (overlap > bestVisible) {
          best = physical;
          bestVisible = overlap;
        }
      }
      // During keyboard scrolling keep its destination focused. Otherwise an
      // offscreen focused twin must not make a visible card unclickable.
      if (activeIndex !== null && activeIndex % count === index &&
          (focusedVisible > 0 || pending.current === activeIndex || bestVisible === 0))
        return activeIndex;
      return best;
    });
    if (activeSlot && activeIndex !== null) {
      const destinationIndex = exposed[activeIndex % count];
      const destination = slotRefs.current[destinationIndex];
      if (destination && destinationIndex !== activeIndex) {
        transferCardFocus(activeSlot, destination);
        setFocusIndex(destinationIndex);
      }
    }
    // Update inert before the next pointer event, rather than waiting for a
    // React render after a scroll. State below keeps the declarative DOM in sync.
    slotRefs.current.forEach((slot, physical) => {
      if (!slot) return;
      const duplicate = exposed[physical % count] !== physical;
      if (slot.inert !== duplicate) slot.inert = duplicate;
      if (duplicate && !slot.hasAttribute("aria-hidden")) slot.setAttribute("aria-hidden", "true");
      else if (!duplicate && slot.hasAttribute("aria-hidden")) slot.removeAttribute("aria-hidden");
    });
    const fullyVisible = exposed.flatMap((physical, logical) => {
      const box = slotRefs.current[physical]?.getBoundingClientRect();
      return box && box.left >= bounds.left - 2 && box.right <= bounds.right + 2 ? [logical] : [];
    });
    const physical = nearestCard(track, slotRefs.current);
    if (!track.contains(document.activeElement)) setFocusIndex(physical);
    const next = { nearest: physical % count, visible: fullyVisible, exposed };
    setView((previous) =>
      previous.nearest === next.nearest &&
      previous.visible.join() === next.visible.join() &&
      previous.exposed.join() === next.exposed.join()
        ? previous : next,
    );
  }, [cards, count]);

  // The centre cycle leaves a complete buffer on either side. Moving by an
  // exact cycle is visually identical, in both directions and after any lap.
  const recenter = useCallback(() => {
    const layout = geometry();
    if (!layout || !initialized.current) return 0;
    const { track, width, start } = layout;
    const cycle = Math.floor((track.scrollLeft - start + 0.5) / width);
    if (cycle === 0) return 0;
    const shift = cycle * count;
    const activeElement = document.activeElement as HTMLElement | null;
    const activeSlot = activeElement?.closest<HTMLElement>("[data-rail-index]");
    const activeIndex = activeSlot && track.contains(activeSlot)
      ? Number(activeSlot.dataset.railIndex) : null;
    track.scrollLeft -= cycle * width;
    if (pending.current !== null) pending.current -= shift;
    if (activeIndex !== null) {
      const destination = slotRefs.current[activeIndex - shift];
      if (destination && activeSlot) {
        transferCardFocus(activeSlot, destination);
        setFocusIndex(activeIndex - shift);
      }
    }
    measure();
    return shift;
  }, [count, geometry, measure]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    let settle = 0;
    const resizeTrack = () => {
      const layout = geometry();
      if (!layout) return;
      if (!initialized.current) {
        track.scrollLeft = layout.start;
        initialized.current = true;
      }
      recenter();
      measure();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; measure(); });
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        pending.current = null;
        if (!autoMoving.current) recenter();
      }, 150);
    };
    const resize = new ResizeObserver(resizeTrack);
    resize.observe(track);
    resizeTrack();
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.clearTimeout(pendingTimer.current);
      resize.disconnect();
      track.removeEventListener("scroll", onScroll);
    };
  }, [geometry, measure, recenter]);

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    // A click and the subsequent front/back focus transfer are pointer focus,
    // not a request to stop autoplay forever. Keyboard users still keep their
    // focused controls stationary, including when they tab in from elsewhere.
    const keyboard = (event: globalThis.KeyboardEvent) => {
      if (["Shift", "Control", "Alt", "Meta"].includes(event.key)) return;
      inputMode.current = "keyboard";
      if (groupRef.current?.contains(document.activeElement)) setFocused(true);
    };
    const pointer = () => {
      inputMode.current = "pointer";
      setFocused(false);
    };
    document.addEventListener("keydown", keyboard, true);
    document.addEventListener("pointerdown", pointer, true);
    return () => {
      document.removeEventListener("keydown", keyboard, true);
      document.removeEventListener("pointerdown", pointer, true);
    };
  }, []);

  useEffect(() => {
    if (!pressed) return;
    const releaseTouch = (event: TouchEvent) => {
      activeTouches.current = event.touches.length;
      releasePointer();
    };
    const releaseOutsideWindow = () => {
      activeTouches.current = 0;
      releasePointer();
    };
    window.addEventListener("pointerup", releasePointer);
    window.addEventListener("pointercancel", releasePointer);
    window.addEventListener("touchend", releaseTouch);
    window.addEventListener("touchcancel", releaseTouch);
    window.addEventListener("blur", releaseOutsideWindow);
    return () => {
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
      window.removeEventListener("touchend", releaseTouch);
      window.removeEventListener("touchcancel", releaseTouch);
      window.removeEventListener("blur", releaseOutsideWindow);
    };
  }, [pressed, releasePointer]);

  useEffect(() => {
    if (!canAutoplay || count < 2) return;
    let timer = 0;
    let frame = 0;
    let disposed = false;
    const begin = () => {
      if (disposed) return;
      if (performance.now() < idleUntil.current) {
        timer = window.setTimeout(begin, idleUntil.current - performance.now());
        return;
      }
      let previous = performance.now();
      let remainder = 0;
      autoMoving.current = true;
      trackRef.current?.setAttribute("data-auto-moving", "true");
      const drift = (now: number) => {
        if (disposed) return;
        if (now < idleUntil.current) {
          autoMoving.current = false;
          trackRef.current?.removeAttribute("data-auto-moving");
          timer = window.setTimeout(begin, idleUntil.current - now);
          return;
        }
        const layout = geometry();
        if (layout && initialized.current) {
          const delta = Math.min(MAX_FRAME_DELTA, Math.max(0, now - previous));
          const requested = layout.track.scrollLeft + (autoSpeed * delta) / 1000 + remainder;
          layout.track.scrollLeft = requested;
          // Preserve fractional pixels on browsers with integral scrollLeft.
          remainder = requested - layout.track.scrollLeft;
          recenter();
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
      trackRef.current?.removeAttribute("data-auto-moving");
    };
  }, [autoSpeed, canAutoplay, count, geometry, interaction, recenter]);

  useEffect(() => {
    const timers = new Map<Element, number>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const slot = entry.target as HTMLElement;
        slot.toggleAttribute("data-live", entry.isIntersecting);
        window.clearTimeout(timers.get(slot));
        const box = entry.boundingClientRect;
        const seen = entry.intersectionRect;
        const fits = Math.min(box.height, entry.rootBounds?.height ?? box.height);
        if (seen.width >= box.width * 0.6 && seen.height >= fits * 0.6)
          timers.set(slot, window.setTimeout(() => onCollect(deck.id, Number(slot.dataset.index)), 350));
      }
    }, { threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] });
    slotRefs.current.forEach((slot) => slot && observer.observe(slot));
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [deck.id, onCollect]);

  function scrollToCard(physical: number) {
    const track = trackRef.current;
    const slot = slotRefs.current[physical];
    if (!track || !slot) return;
    const inset = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    pending.current = physical;
    window.clearTimeout(pendingTimer.current);
    pendingTimer.current = window.setTimeout(() => { pending.current = null; }, 900);
    track.scrollTo({ left: slot.offsetLeft - inset, behavior: reduced ? "auto" : "smooth" });
  }
  function goTo(logical: number) {
    const track = trackRef.current;
    if (!track) return;
    recenter();
    const from = pending.current ?? nearestCard(track, slotRefs.current);
    const candidates = [logical, count + logical, count * 2 + logical];
    const target = candidates.reduce((best, current) => Math.abs(current - from) < Math.abs(best - from) ? current : best);
    scrollToCard(target);
  }
  function step(delta: number) {
    const track = trackRef.current;
    if (!track) return;
    recenter();
    const from = pending.current ?? nearestCard(track, slotRefs.current);
    scrollToCard(Math.max(0, Math.min(count * 3 - 1, from + delta)));
  }
  const inView = (index: number) => view.visible.length ? view.visible.includes(index) : index === view.nearest;

  function focusCard(physical: number) {
    const slot = slotRefs.current[physical];
    if (!slot) return;
    slot.inert = false;
    slot.removeAttribute("aria-hidden");
    const control = Array.from(slot.querySelectorAll<HTMLElement>("[data-card-control]"))
      .find((element) => !element.closest("[inert]"));
    scrollToCard(physical);
    control?.focus({ preventScroll: true });
    setFocusIndex(physical);
    measure();
  }
  function deckKeys(event: KeyboardEvent<HTMLUListElement>) {
    if (!(event.target as HTMLElement).matches("[data-card-control]")) return;
    const key = event.key;
    if (!["Home", "End", "ArrowRight", "ArrowLeft"].includes(key)) return;
    event.preventDefault();
    const shift = recenter();
    const current = focusIndex - shift;
    const next = key === "Home" ? count : key === "End" ? count * 2 - 1 : current + (key === "ArrowRight" ? 1 : -1);
    focusCard(Math.max(0, Math.min(count * 3 - 1, next)));
  }

  return (
    <div
      ref={groupRef}
      className="deck-track-group"
      data-autoplay={canAutoplay ? "running" : "paused"}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") { setHovered(false); idle(); } }}
      onPointerDownCapture={() => { setPressed(true); idle(); }}
      onPointerUpCapture={releasePointer}
      onPointerCancelCapture={releasePointer}
      onTouchStartCapture={(event) => {
        activeTouches.current = event.touches.length;
        setPressed(true);
        idle();
      }}
      onTouchEndCapture={(event) => {
        activeTouches.current = event.touches.length;
        releasePointer();
      }}
      onTouchCancelCapture={(event) => {
        activeTouches.current = event.touches.length;
        releasePointer();
      }}
      onFocusCapture={() => setFocused(inputMode.current === "keyboard")}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setFocused(false); idle(); } }}
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
        data-at-start={false}
        data-at-end={false}
        aria-label={`${deck.label} records`}
        onKeyDown={deckKeys}
      >
        {[0, 1, 2].flatMap((cycle) => cards.map((card, index) => {
          const physical = cycle * count + index;
          const exposed = view.exposed[index] === physical;
          return (
            <motion.li
              key={`${card.id}-${cycle}`}
              ref={(slot) => { slotRefs.current[physical] = slot; }}
              className="deck-slot min-h-[600px] w-[min(340px,calc(100vw_-_58px))] flex-shrink-0 sm:w-[420px]"
              data-deck-card
              data-index={index}
              data-rail-index={physical}
              aria-posinset={index + 1}
              aria-setsize={count}
              aria-hidden={exposed ? undefined : true}
              inert={!exposed}
              initial={reduced ? false : { opacity: 0, y: 24, rotate: index % 2 ? 1.5 : -1.5 }}
              animate={dealt ? { opacity: 1, y: 0, rotate: 0 } : undefined}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 250, damping: 26, delay: Math.min(index, 5) * 0.06 }}
              onFocusCapture={() => setFocusIndex(physical)}
            >
              <TradingCard
                card={card}
                reduced={reduced}
                tabbable={exposed && physical === focusIndex}
                flipped={reading.has(card.id)}
                onFlipChange={recordFlip}
              />
            </motion.li>
          );
        }))}
      </ul>
      <div className="deck-controls">
        <div className="deck-nav">
          <button type="button" className="deck-arrow" aria-label="Previous record" aria-controls={trackId} onClick={() => step(-1)}>
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <div className="deck-dots" aria-hidden="true">
            {cards.map((card, index) => (
              <button type="button" tabIndex={-1} key={card.id} data-collected={collected.includes(index)} data-visible={inView(index)} onClick={() => goTo(index)} />
            ))}
          </div>
          <button type="button" className="deck-arrow" aria-label="Next record" aria-controls={trackId} onClick={() => step(1)}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="deck-position"><span>{view.nearest + 1} / {count}</span>{cards[view.nearest]?.org}</p>
        <p className="deck-hint">
          <span className="deck-hint-pointer">
            Click to turn a card{reduced ? "" : " · hover to pause"}
            <span className="sr-only"> · Use the left and right arrow keys to browse.</span>
          </span>
          <span className="deck-hint-touch">Swipe to browse · tap to turn a card</span>
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
