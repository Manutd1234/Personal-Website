"use client";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
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
  Maximize2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { lifePhotos, type LifePhoto } from "@/content/life-photos";
import { asset } from "@/content/paths";
import { useMotionPreference } from "./useMotionPreference";
import { useVisiblePlayback } from "./useVisiblePlayback";
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
const mod = (value: number, length: number) =>
  ((value % length) + length) % length;
const firstOrder = lifePhotos.map((_, index) => index);
function LightboxPhoto({ photo }: { photo: LifePhoto }) {
  const [ready, setReady] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const present = useIsPresent();
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setReady(true);
  }, []);
  return (
    <span
      className="life-lightbox-progressive"
      data-ready={ready}
      aria-hidden={!present ? true : undefined}
    >
      <img
        className="life-lightbox-preview"
        src={asset(photo.thumb ?? photo.src)}
        alt=""
        aria-hidden="true"
        width={photo.width}
        height={photo.height}
        decoding="async"
      />
      <img
        className="life-lightbox-full"
        ref={imageRef}
        src={asset(photo.src)}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        decoding="async"
        onLoad={() => setReady(true)}
        onError={() => setReady(false)}
      />
    </span>
  );
}

export default function OffDutyPanel() {
  const [order, setOrder] = useState(firstOrder);
  const [spotlight, setSpotlight] = useState<Hobby | null>(null);
  const [cursor, setCursor] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [autoPlay, setAutoPlay] = useState(true);
  const [interacting, setInteracting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { ref: rootRef, visible } = useVisiblePlayback<HTMLDivElement>();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const reducedMotion = useMotionPreference();
  const prefix = useId();
  const pool = order
    .map((index) => lifePhotos[index])
    .filter((photo) => !spotlight || photo.category === spotlight);
  const current = pool[mod(cursor, pool.length)];
  const openIndex = pool.findIndex((photo) => photo.id === openId);
  const shown = openIndex >= 0 ? pool[openIndex] : null;
  const lightboxOpen = openId !== null;
  const autoPlayAvailable = !reducedMotion && pool.length > 1;
  const running =
    autoPlay &&
    autoPlayAvailable &&
    visible &&
    !interacting &&
    !hovered &&
    !lightboxOpen;
  const Icon = current ? hobbyIcons[current.category] : Sparkles;
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setCursor((value) => (value + 1) % pool.length),
      6500,
    );
    return () => window.clearTimeout(timer);
  }, [running, cursor, pool.length, spotlight, order]);
  const preloadSrc =
    pool[mod((lightboxOpen ? openIndex : cursor) + 1, pool.length)]?.src;
  useEffect(() => {
    if (!visible || !preloadSrc) return;
    const image = new Image();
    image.src = asset(preloadSrc);
  }, [visible, preloadSrc]);
  useEffect(() => {
    const close = () => setOpenId(null);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);
  useEffect(() => {
    if (!lightboxOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const body = document.body,
      html = document.documentElement;
    const previous = {
      body: body.style.overflow,
      html: html.style.overflow,
      padding: body.style.paddingRight,
      x: window.scrollX,
      y: window.scrollY,
    };
    const scrollbar = Math.max(0, window.innerWidth - html.clientWidth);
    if (scrollbar > 0)
      body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      body.style.overflow = previous.body;
      html.style.overflow = previous.html;
      body.style.paddingRight = previous.padding;
      if (
        openerRef.current?.isConnected &&
        !openerRef.current.closest('[hidden], [inert], [aria-hidden="true"]')
      ) {
        window.scrollTo({
          left: previous.x,
          top: previous.y,
          behavior: "instant",
        });
        openerRef.current.focus({ preventScroll: true });
      }
    };
  }, [lightboxOpen]);
  function choose(hobby: Hobby | null) {
    setSpotlight(hobby);
    setCursor(0);
    setStatus(hobby ? `${hobby} photos.` : "All photos.");
  }
  function browse(offset: number) {
    setCursor((value) => mod(value + offset, pool.length));
    setAutoPlay(false);
  }
  function move(offset: number) {
    if (openIndex < 0) return;
    const next = mod(openIndex + offset, pool.length);
    setOpenId(pool[next].id);
    setCursor(next);
  }
  function shuffle() {
    const next = [...order];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
    setCursor(0);
    setStatus("Photos shuffled.");
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
      const first = targets[0],
        last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  }
  if (!current) return null;
  return (
    <div
      className="offduty offduty-portrait-gallery"
      ref={rootRef}
      data-running={running}
      onFocusCapture={(event) =>
        setInteracting(event.target.matches(":focus-visible"))
      }
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setInteracting(false);
      }}
    >
      <div className="offduty-toolbar">
        <div
          className="offduty-hobbies"
          role="group"
          aria-label="Filter photos by hobby"
        >
          <button
            type="button"
            className="offduty-hobby is-all"
            aria-pressed={spotlight === null}
            aria-controls={`${prefix}-photos`}
            onClick={() => choose(null)}
          >
            <span className="offduty-hobby-icon">
              <Sparkles size={14} />
            </span>
            Everything
          </button>
          {hobbies.map(({ hobby }) => {
            const HobbyIcon = hobbyIcons[hobby];
            return (
              <button
                key={hobby}
                type="button"
                className={`offduty-hobby is-${hobby.toLowerCase()}`}
                aria-pressed={spotlight === hobby}
                aria-controls={`${prefix}-photos`}
                onClick={() => choose(hobby)}
              >
                <span className="offduty-hobby-icon">
                  <HobbyIcon size={14} />
                </span>
                {hobby}
              </button>
            );
          })}
        </div>
        <div className="offduty-actions">
          <button
            type="button"
            className="offduty-autoplay"
            role="switch"
            aria-checked={autoPlay && autoPlayAvailable}
            aria-label="Auto-play photos"
            disabled={!autoPlayAvailable}
            onClick={() => setAutoPlay((value) => !value)}
          >
            <span className="offduty-switch" aria-hidden="true" />
            Auto-play
            <span className="offduty-autoplay-state">
              {autoPlay && autoPlayAvailable ? "On" : "Off"}
            </span>
          </button>
          <button type="button" className="offduty-shuffle" onClick={shuffle}>
            <Shuffle size={15} />
            Shuffle
          </button>
        </div>
      </div>
      <div
        id={`${prefix}-photos`}
        className={`life-portrait-stage is-${current.category.toLowerCase()}`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Photos from life outside the code"
      >
        <div className="life-portrait-margin" aria-hidden="true">
          <span>
            A FEW THINGS
            <br />I COME BACK TO.
          </span>
          <span className="life-portrait-handnote">Life, in between.</span>
        </div>
        <div
          className="life-portrait-frame"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setHovered(true);
          }}
          onPointerLeave={() => setHovered(false)}
        >
          <span className="offduty-tape" aria-hidden="true" />
          <button
            type="button"
            className="life-portrait-open"
            aria-label={`${current.category}: ${current.caption} Open photo.`}
            onPointerDown={(event) => {
              touchStart.current = { x: event.clientX, y: event.clientY };
              suppressClick.current = false;
            }}
            onPointerUp={(event) => {
              const start = touchStart.current;
              touchStart.current = null;
              if (
                start &&
                Math.abs(event.clientX - start.x) > 55 &&
                Math.abs(event.clientX - start.x) >
                  Math.abs(event.clientY - start.y) * 1.3
              ) {
                suppressClick.current = true;
                browse(event.clientX < start.x ? 1 : -1);
              }
            }}
            onPointerCancel={() => {
              touchStart.current = null;
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                browse(event.key === "ArrowRight" ? 1 : -1);
              }
            }}
            onClick={(event) => {
              if (suppressClick.current) {
                suppressClick.current = false;
                return;
              }
              openerRef.current = event.currentTarget;
              setOpenId(current.id);
            }}
          >
            <span className="life-portrait-image">
              <AnimatePresence initial={false}>
                <motion.span
                  key={current.id}
                  className="life-portrait-slide"
                  initial={{ opacity: reducedMotion ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.6 }}
                  aria-hidden="true"
                >
                  <img
                    src={asset(current.src)}
                    alt=""
                    width={current.width}
                    height={current.height}
                    draggable={false}
                    decoding="async"
                  />
                </motion.span>
              </AnimatePresence>
              <span className="life-portrait-expand">
                <Maximize2 size={15} />
              </span>
            </span>
            <span
              className="life-portrait-caption"
              aria-live={autoPlay ? "off" : "polite"}
            >
              {current.caption}
            </span>
          </button>
          <motion.span
            key={current.category}
            className={`life-portrait-sticker is-${current.category.toLowerCase()}`}
            aria-hidden="true"
            initial={reducedMotion ? false : { rotate: -15, scale: 0.85 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
          >
            <Icon size={28} />
          </motion.span>
        </div>
        <div className="life-portrait-side">
          <span
            className={`life-portrait-category is-${current.category.toLowerCase()}`}
          >
            <Icon size={17} />
            {current.category}
          </span>
          <span className="life-portrait-count">
            {String(mod(cursor, pool.length) + 1).padStart(2, "0")} <i>/</i>{" "}
            {String(pool.length).padStart(2, "0")}
          </span>
          <div className="life-portrait-nav">
            <button
              type="button"
              onClick={() => browse(-1)}
              aria-label="Previous portrait"
              disabled={pool.length < 2}
            >
              <ArrowLeft size={19} />
            </button>
            <button
              type="button"
              onClick={() => browse(1)}
              aria-label="Next portrait"
              disabled={pool.length < 2}
            >
              <ArrowRight size={19} />
            </button>
          </div>
          <span className="life-portrait-progress" aria-hidden="true">
            <i key={`${current.id}-${running}`} />
          </span>
          <small>
            {reducedMotion
              ? "Take your time. Browse at your own pace."
              : "A little window into life outside work."}
          </small>
        </div>
      </div>
      <span className="sr-only" role="status">
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
              <AnimatePresence initial={false}>
                <motion.div
                  className="life-lightbox-slide"
                  key={shown.id}
                  initial={{ opacity: reducedMotion ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.18 }}
                >
                  <LightboxPhoto photo={shown} />
                </motion.div>
              </AnimatePresence>
            </div>
            <footer className="life-lightbox-footer">
              <div>
                <motion.h3
                  key={shown.id}
                  id={`${prefix}-lightbox-caption`}
                  aria-live="polite"
                  initial={reducedMotion ? false : { opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.16 }}
                >
                  {shown.caption || shown.alt}
                </motion.h3>
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
