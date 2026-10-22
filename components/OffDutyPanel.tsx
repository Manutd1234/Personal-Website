"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Dumbbell,
  Plane,
  Shuffle,
  Sparkles,
  Users,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { lifePhotos, type LifePhoto } from "@/content/life-photos";
import { asset } from "@/content/paths";

type Hobby = LifePhoto["category"];
const hobbyIcons: Record<Hobby, LucideIcon> = {
  Travel: Plane,
  People: Users,
  Food: UtensilsCrossed,
  Learning: BookOpen,
  Gym: Dumbbell,
};
const hobbies = (Object.keys(hobbyIcons) as Hobby[])
  .map((hobby) => ({
    hobby,
    count: lifePhotos.filter((photo) => photo.category === hobby).length,
  }))
  .filter(({ count }) => count > 0);
const credits = lifePhotos.flatMap(({ id, category, credit }) =>
  credit ? [{ id, category, ...credit }] : [],
);
const mod = (value: number, length: number) =>
  ((value % length) + length) % length;

// The first deal is fixed so the static export and first client render agree;
// shuffles after that are random.
type Deal = { order: number[]; tilts: number[]; round: number };
const restingTilts = [-4, 3, -2.5, 4.5, -3.5, 2, -5, 3.5, -1.5, 4];
const firstDeal: Deal = {
  order: lifePhotos.map((_, index) => index),
  tilts: lifePhotos.map((_, index) => restingTilts[index % restingTilts.length]),
  round: 0,
};

function reshuffle(current: Deal): Deal {
  const order = [...current.order];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    order,
    tilts: order.map(() => Math.round((Math.random() * 11 - 5.5) * 10) / 10),
    round: current.round + 1,
  };
}

// Dragging is for mouse and trackpad on wide screens; touch keeps native
// swiping through the strip.
function useCanDrag() {
  const [canDrag, setCanDrag] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(pointer: fine) and (min-width: 841px)");
    const sync = () => setCanDrag(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return canDrag;
}

export default function OffDutyPanel() {
  const [deal, setDeal] = useState(firstDeal);
  const [spotlight, setSpotlight] = useState<Hobby | null>(null);
  const [topId, setTopId] = useState<string | null>(null);
  const [focusSlot, setFocusSlot] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const wallRef = useRef<HTMLUListElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const suppressClickUntilRef = useRef(0);
  const canDrag = useCanDrag();
  const prefix = useId();

  const deck = deal.order.map((index) => lifePhotos[index]);
  const pool = spotlight
    ? deck.filter((photo) => photo.category === spotlight)
    : deck;
  const openIndex = pool.findIndex((photo) => photo.id === openId);
  const shown = openIndex >= 0 ? pool[openIndex] : null;
  const lightboxOpen = openId !== null;

  useEffect(() => {
    const close = () => setOpenId(null);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const body = document.body;
    const html = document.documentElement;
    const previous = {
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      paddingRight: body.style.paddingRight,
      x: window.scrollX,
      y: window.scrollY,
    };
    const scrollbar = Math.max(0, window.innerWidth - html.clientWidth);
    if (scrollbar > 0)
      body.style.paddingRight = `${parseFloat(window.getComputedStyle(body).paddingRight) + scrollbar}px`;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      body.style.overflow = previous.bodyOverflow;
      html.style.overflow = previous.htmlOverflow;
      body.style.paddingRight = previous.paddingRight;
      const opener = openerRef.current;
      if (opener?.isConnected) {
        window.scrollTo({
          left: previous.x,
          top: previous.y,
          behavior: "instant",
        });
        opener.focus({ preventScroll: true });
      }
    };
  }, [lightboxOpen]);

  function spotlightHobby(hobby: Hobby | null) {
    setSpotlight(hobby);
    const matches = hobby
      ? deck.filter((photo) => photo.category === hobby).length
      : deck.length;
    setStatus(
      hobby
        ? `Spotlighting ${matches} ${hobby.toLowerCase()} photo${matches === 1 ? "" : "s"}.`
        : `Showing all ${matches} photos.`,
    );
    // On the swipeable strip, bring the first match into view.
    const wall = wallRef.current;
    const slot = hobby ? deck.findIndex((photo) => photo.category === hobby) : 0;
    const card = cardRefs.current[slot]?.parentElement;
    if (!wall || !card || wall.scrollWidth <= wall.clientWidth) return;
    const wallBox = wall.getBoundingClientRect();
    const cardBox = card.getBoundingClientRect();
    wall.scrollBy({
      left: cardBox.left - wallBox.left - (wallBox.width - cardBox.width) / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  function shuffle() {
    setDeal(reshuffle);
    setTopId(null);
    setFocusSlot(0);
    setStatus("Photos shuffled.");
  }

  function openPhoto(photo: LifePhoto, opener: HTMLElement) {
    if (spotlight && photo.category !== spotlight) setSpotlight(null);
    openerRef.current = opener;
    setOpenId(photo.id);
  }

  function move(offset: number) {
    if (pool.length > 1 && openIndex >= 0)
      setOpenId(pool[mod(openIndex + offset, pool.length)].id);
  }

  function wallKeys(event: KeyboardEvent<HTMLUListElement>) {
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? focusSlot + 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? focusSlot - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? deck.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    const slot = mod(next, deck.length);
    setFocusSlot(slot);
    cardRefs.current[slot]?.focus();
  }

  function lightboxKeys(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpenId(null);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === "Tab") {
      const targets = [
        ...event.currentTarget.querySelectorAll<HTMLElement>(
          "button:not(:disabled), a[href]",
        ),
      ];
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  }

  if (!lifePhotos.length)
    return (
      <div className="life-gallery-empty">
        Photos will appear here once they’re added.
      </div>
    );

  return (
    <div className="offduty">
      <div className="offduty-toolbar">
        <div
          className="offduty-hobbies"
          role="group"
          aria-label="Spotlight a hobby"
        >
          <button
            type="button"
            className="offduty-hobby is-all"
            aria-pressed={spotlight === null}
            onClick={() => spotlightHobby(null)}
          >
            <span className="offduty-hobby-icon" aria-hidden="true">
              <Sparkles size={14} />
            </span>
            Everything
            <span className="offduty-hobby-count">{lifePhotos.length}</span>
          </button>
          {hobbies.map(({ hobby, count }) => {
            const Icon = hobbyIcons[hobby];
            const on = spotlight === hobby;
            return (
              <button
                key={hobby}
                type="button"
                className={`offduty-hobby is-${hobby.toLowerCase()}`}
                aria-pressed={on}
                onClick={() => spotlightHobby(on ? null : hobby)}
              >
                <span className="offduty-hobby-icon" aria-hidden="true">
                  <Icon size={14} />
                </span>
                {hobby}
                <span className="offduty-hobby-count">{count}</span>
              </button>
            );
          })}
        </div>
        <button type="button" className="offduty-shuffle" onClick={shuffle}>
          <Shuffle size={15} aria-hidden="true" /> Shuffle
        </button>
      </div>
      <p className="offduty-help" id={`${prefix}-help`}>
        <span className="offduty-help-fine">
          Pick a hobby, drag the photos around, or click one for a closer look.
        </span>
        <span className="offduty-help-touch">
          Pick a hobby, swipe through, or tap a photo for a closer look.
        </span>
      </p>
      <ul
        className="offduty-wall"
        ref={wallRef}
        data-drag={canDrag}
        aria-label="Photos from life outside the code"
        aria-describedby={`${prefix}-help`}
        onKeyDown={wallKeys}
      >
        {deck.map((photo, slot) => {
          const Icon = hobbyIcons[photo.category];
          const dim = spotlight !== null && photo.category !== spotlight;
          const lit = spotlight !== null && !dim;
          const tilt = deal.tilts[slot];
          return (
            <motion.li
              key={`${deal.round}-${photo.id}`}
              className="offduty-polaroid"
              data-top={topId === photo.id}
              drag={canDrag}
              dragConstraints={wallRef}
              dragElastic={0.18}
              dragTransition={{ power: 0.25, timeConstant: 220 }}
              onPointerDown={() => canDrag && setTopId(photo.id)}
              // framer-motion reports the drag end after the release click, so
              // block clicks from the moment a drag starts.
              onDragStart={() => {
                suppressClickUntilRef.current = Infinity;
              }}
              onDragEnd={() => {
                suppressClickUntilRef.current = performance.now() + 150;
              }}
            >
              <motion.button
                type="button"
                className="offduty-card"
                data-dim={dim}
                ref={(element) => {
                  cardRefs.current[slot] = element;
                }}
                tabIndex={slot === focusSlot ? 0 : -1}
                onFocus={() => setFocusSlot(slot)}
                onClick={(event) => {
                  if (
                    event.detail !== 0 &&
                    performance.now() < suppressClickUntilRef.current
                  )
                    return;
                  openPhoto(photo, event.currentTarget);
                }}
                aria-label={`${photo.category}: ${photo.caption} Open photo.`}
                initial={
                  deal.round === 0
                    ? false
                    : { opacity: 0, y: -70, rotate: tilt * 4, scale: 0.8 }
                }
                animate={{
                  opacity: dim ? 0.32 : 1,
                  y: lit ? -6 : 0,
                  rotate: lit ? tilt / 3 : tilt,
                  scale: dim ? 0.9 : lit ? 1.04 : 1,
                  transition: {
                    type: "spring",
                    stiffness: 240,
                    damping: 18,
                    delay: deal.round && !spotlight ? slot * 0.04 : 0,
                  },
                }}
                whileHover={
                  canDrag ? { rotate: 0, scale: 1.06, y: -8 } : undefined
                }
                whileTap={{ scale: 0.97 }}
              >
                {slot % 3 === 0 ? (
                  <span className="offduty-tape" aria-hidden="true" />
                ) : null}
                <span className="offduty-photo">
                  <img
                    src={asset(photo.thumb ?? photo.src)}
                    alt=""
                    width={photo.width}
                    height={photo.height}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    style={{ objectPosition: photo.position }}
                  />
                </span>
                <span className="offduty-caption">{photo.caption}</span>
                <span
                  className={`offduty-sticker is-${photo.category.toLowerCase()}`}
                  aria-hidden="true"
                >
                  <Icon size={14} />
                </span>
              </motion.button>
            </motion.li>
          );
        })}
      </ul>
      {credits.length ? (
        <p className="offduty-credits">
          {credits.map((credit) => (
            <span key={credit.id}>
              {credit.category} photo:{" "}
              <a href={credit.url} target="_blank" rel="noreferrer">
                {credit.label}
              </a>
              {" · "}
              <a href={credit.licenseUrl} target="_blank" rel="noreferrer">
                CC BY 2.0
              </a>
            </span>
          ))}
        </p>
      ) : null}
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
      <dialog
        className="life-lightbox"
        ref={dialogRef}
        aria-labelledby={`${prefix}-lightbox-caption`}
        aria-describedby={`${prefix}-photo-meta`}
        onKeyDown={lightboxKeys}
        onCancel={(event) => {
          event.preventDefault();
          setOpenId(null);
        }}
        onClose={() => {
          if (!dialogRef.current?.open) setOpenId(null);
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const box = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            setOpenId(null);
        }}
      >
        {shown ? (
          <>
            <header className="life-lightbox-heading">
              <p id={`${prefix}-photo-meta`}>
                {shown.category}
                <span aria-hidden="true"> · </span>
                <span aria-live="polite">
                  {openIndex + 1} / {pool.length}
                </span>
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpenId(null)}
                aria-label="Close photo"
              >
                <X size={21} aria-hidden="true" />
              </button>
            </header>
            <div className="life-lightbox-image">
              <img
                src={asset(shown.src)}
                alt={shown.alt}
                width={shown.width}
                height={shown.height}
                decoding="async"
              />
            </div>
            <footer className="life-lightbox-footer">
              <div>
                <h3 id={`${prefix}-lightbox-caption`} aria-live="polite">
                  {shown.caption || shown.alt}
                </h3>
                {shown.credit ? (
                  <p className="life-lightbox-credit">
                    <a href={shown.credit.url} target="_blank" rel="noreferrer">
                      {shown.credit.label} ↗
                    </a>
                    {" · "}
                    <a
                      href={shown.credit.licenseUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      CC BY 2.0
                    </a>
                  </p>
                ) : null}
              </div>
              <div className="life-lightbox-navigation">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  disabled={pool.length < 2}
                  aria-label="Previous photo"
                >
                  <ArrowLeft size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  disabled={pool.length < 2}
                  aria-label="Next photo"
                >
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              </div>
            </footer>
          </>
        ) : null}
      </dialog>
    </div>
  );
}
