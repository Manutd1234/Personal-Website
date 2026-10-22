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

const pad = (value: number) => String(value).padStart(2, "0");
const emptyCollection: Collection = {
  work: [],
  education: [],
  community: [],
  volunteering: [],
};
const deckMotion = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 56 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -56 }),
};

function DeckTrack({
  deck,
  dealt,
  reduced,
  collected,
  onCollect,
}: {
  deck: Deck;
  dealt: boolean;
  reduced: boolean;
  collected: readonly number[];
  onCollect: (deck: DeckId, index: number) => void;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const slotRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [view, setView] = useState({
    first: 0,
    count: 1,
    atStart: true,
    atEnd: false,
  });
  const [focusIndex, setFocusIndex] = useState(0);
  const cards = deck.cards;
  const trackId = useId();

  // A card is collected once it has stayed mostly on screen for a moment, so
  // swiping quickly past a card does not count. Only visible cards run their
  // art animations; that attribute is written directly to skip renders.
  useEffect(() => {
    const timers = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slot = entry.target as HTMLElement;
          slot.toggleAttribute("data-live", entry.isIntersecting);
          window.clearTimeout(timers.get(slot));
          if (entry.intersectionRatio >= 0.6)
            timers.set(
              slot,
              window.setTimeout(
                () => onCollect(deck.id, Number(slot.dataset.index)),
                350,
              ),
            );
        }
      },
      { threshold: [0, 0.6] },
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
        first: visible[0] ?? 0,
        count: Math.max(1, visible.length),
        atStart: track.scrollLeft <= 2,
        atEnd: track.scrollLeft + track.clientWidth >= track.scrollWidth - 2,
      };
      setView((previous) =>
        previous.first === next.first &&
        previous.count === next.count &&
        previous.atStart === next.atStart &&
        previous.atEnd === next.atEnd
          ? previous
          : next,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    // The section mounts hidden behind another tab, so re-measure when the
    // track gains a size, not only on scroll.
    const resize = new ResizeObserver(schedule);
    resize.observe(track);
    track.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      track.removeEventListener("scroll", schedule);
    };
  }, []);

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
  function focusCard(index: number) {
    setFocusIndex(index);
    const controls = slotRefs.current[index]?.querySelectorAll<HTMLElement>(
      "[data-card-control]",
    );
    const control = Array.from(controls ?? []).find(
      (element) => !element.closest("[inert]"),
    );
    control?.focus({ preventScroll: true });
    if (index < view.first || index >= view.first + view.count)
      scrollToCard(index);
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
    <>
      <ul
        ref={trackRef}
        id={trackId}
        className="deck-track"
        data-deck-track
        data-at-start={view.atStart}
        data-at-end={view.atEnd}
        aria-label={`${deck.label} cards`}
        onKeyDown={deckKeys}
      >
        {cards.map((card, index) => (
          <motion.li
            key={card.id}
            ref={(slot) => {
              slotRefs.current[index] = slot;
            }}
            className="deck-slot h-[600px] w-[min(340px,calc(100vw_-_58px))] flex-shrink-0 sm:w-[420px]"
            data-deck-card
            data-index={index}
            initial={{ opacity: 0, y: 30, rotate: index % 2 ? 2.5 : -2.5 }}
            animate={dealt ? { opacity: 1, y: 0, rotate: 0 } : undefined}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 26,
              delay: Math.min(index, 5) * 0.06,
            }}
            onFocusCapture={() => setFocusIndex(index)}
          >
            <TradingCard
              card={card}
              total={cards.length}
              reduced={reduced}
              tabbable={index === focusIndex}
            />
          </motion.li>
        ))}
      </ul>
      <div className="deck-controls">
        <div className="deck-nav">
          <button
            type="button"
            className="deck-arrow"
            aria-label="Previous card"
            aria-controls={trackId}
            disabled={view.atStart}
            onClick={() => scrollToCard(Math.max(0, view.first - 1))}
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
                data-visible={
                  index >= view.first && index < view.first + view.count
                }
                onClick={() => scrollToCard(index)}
              />
            ))}
          </div>
          <button
            type="button"
            className="deck-arrow"
            aria-label="Next card"
            aria-controls={trackId}
            disabled={view.atEnd}
            onClick={() =>
              scrollToCard(Math.min(cards.length - 1, view.first + 1))
            }
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="deck-hint">
          <span className="deck-hint-pointer">
            Hover to tilt · click a card to flip · ← → to browse
          </span>
          <span className="deck-hint-touch">
            Swipe to browse · tap a card to flip
          </span>
        </p>
      </div>
    </>
  );
}

export default function CardShowcase() {
  const [active, setActive] = useState<DeckId>("work");
  const [direction, setDirection] = useState(1);
  const [collected, setCollected] = useState<Collection>(emptyCollection);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const dealt = useInView(stageRef, { once: true, amount: 0.15 });
  const reduced = useMotionPreference();
  const prefix = useId();

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#education") setActive("education");
      else if (hash === "#volunteering") setActive("volunteering");
      else if (hash === "#community" || hash === "#leadership")
        setActive("community");
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const collect = useCallback((deck: DeckId, index: number) => {
    setCollected((previous) =>
      previous[deck].includes(index)
        ? previous
        : { ...previous, [deck]: [...previous[deck], index] },
    );
  }, []);

  function select(id: DeckId) {
    const from = decks.findIndex((deck) => deck.id === active);
    const to = decks.findIndex((deck) => deck.id === id);
    setDirection(to >= from ? 1 : -1);
    setActive(id);
  }
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
    <div
      className="deck-showcase career-archive-shell"
      data-reduced-motion={reduced}
    >
      <div className="deck-toolbar">
        <div
          className="deck-tabs"
          role="tablist"
          aria-label="Career card decks"
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
        <p className="deck-collector" data-complete={complete}>
          <span aria-hidden="true">
            <span className="deck-collector-label">
              {complete ? "★ Set complete" : "Collected:"}
            </span>
            <span className="deck-collector-count">
              [{" "}
              <motion.span
                key={`${active}-${count}`}
                initial={{ opacity: 0, y: -7 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {pad(count)}
              </motion.span>{" "}
              / {pad(total)} ]
            </span>
          </span>
          <span className="sr-only">
            {count} of {total} {deck.label} cards collected.
          </span>
        </p>
        <p className="sr-only" role="status">
          {complete ? `${deck.label} set complete.` : ""}
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
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 320, damping: 32 },
              opacity: { duration: 0.18 },
            }}
          >
            <h2 className="sr-only">{deck.label} cards</h2>
            <DeckTrack
              deck={deck}
              dealt={dealt}
              reduced={reduced}
              collected={collected[active]}
              onCollect={collect}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
