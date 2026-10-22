"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { lifePhotos, type LifePhoto } from "@/content/life-photos";
import { asset } from "@/content/paths";
import { useMotionPreference } from "./useMotionPreference";

type GalleryFilter = "All" | LifePhoto["category"];
const categoryOrder: readonly LifePhoto["category"][] = [
  "Travel",
  "People",
  "Food",
  "Learning",
  "Gym",
];
const filters: readonly GalleryFilter[] = [
  "All",
  ...categoryOrder.filter((category) =>
    lifePhotos.some((photo) => photo.category === category),
  ),
];
const mod = (value: number, length: number) =>
  ((value % length) + length) % length;

export default function OffDutyPanel() {
  const [filter, setFilter] = useState<GalleryFilter>("All");
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [inView, setInView] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(false);
  const [parentVisible, setParentVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const mountedRef = useRef(false);
  const restoreAfterCloseRef = useRef(true);
  const swipeRef = useRef<{ pointer: number; x: number; y: number } | null>(
    null,
  );
  const suppressClickUntilRef = useRef(0);
  const reducedMotion = useMotionPreference();
  const prefix = useId();
  const photos = useMemo(
    () =>
      filter === "All"
        ? lifePhotos
        : lifePhotos.filter((photo) => photo.category === filter),
    [filter],
  );
  const currentIndex = photos.length ? mod(index, photos.length) : 0;
  const photo = photos[currentIndex];
  const canAutoPlay = !reducedMotion && photos.length > 1;
  const playing =
    autoPlay &&
    canAutoPlay &&
    inView &&
    documentVisible &&
    parentVisible &&
    !hovered &&
    !keyboardFocused &&
    !lightboxOpen;

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return undefined;
    mountedRef.current = true;
    const disclosures: HTMLDetailsElement[] = [];
    for (
      let ancestor = gallery.parentElement;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      if (ancestor instanceof HTMLDetailsElement) disclosures.push(ancestor);
    }
    const closeForNavigation = () => {
      restoreAfterCloseRef.current = false;
      setLightboxOpen(false);
      setKeyboardFocused(false);
      setHovered(false);
      swipeRef.current = null;
    };
    const syncVisibility = () => {
      setDocumentVisible(document.visibilityState === "visible");
      const visible =
        gallery.getClientRects().length > 0 &&
        !gallery.closest('[hidden], [inert], [aria-hidden="true"]') &&
        disclosures.every((disclosure) => disclosure.open);
      setParentVisible(visible);
      if (!visible) closeForNavigation();
    };
    const intersection =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) =>
              setInView(entry.isIntersecting && entry.intersectionRatio > 0),
            { threshold: [0, 0.05] },
          );
    if (intersection) intersection.observe(stageRef.current ?? gallery);
    else setInView(true);
    const visibility = new MutationObserver(syncVisibility);
    for (
      let ancestor: HTMLElement | null = gallery;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      visibility.observe(ancestor, {
        attributes: true,
        attributeFilter: ["hidden", "aria-hidden", "inert", "open", "class"],
      });
    }
    syncVisibility();
    disclosures.forEach((disclosure) =>
      disclosure.addEventListener("toggle", syncVisibility),
    );
    document.addEventListener("visibilitychange", syncVisibility);
    window.addEventListener("hashchange", closeForNavigation);
    return () => {
      mountedRef.current = false;
      swipeRef.current = null;
      intersection?.disconnect();
      visibility.disconnect();
      disclosures.forEach((disclosure) =>
        disclosure.removeEventListener("toggle", syncVisibility),
      );
      document.removeEventListener("visibilitychange", syncVisibility);
      window.removeEventListener("hashchange", closeForNavigation);
    };
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setTimeout(
      () => setIndex((current) => mod(current + 1, photos.length)),
      4500,
    );
    return () => window.clearTimeout(timer);
  }, [playing, currentIndex, photos.length, filter]);

  useEffect(() => {
    const strip = stripRef.current;
    const selected = thumbRefs.current[currentIndex];
    if (!strip || !selected || !parentVisible) return;
    strip.scrollTo({
      left: Math.max(
        0,
        selected.offsetLeft - (strip.clientWidth - selected.offsetWidth) / 2,
      ),
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }, [currentIndex, filter, parentVisible, reducedMotion]);

  useEffect(() => {
    if (!parentVisible || photos.length < 2) return;
    const next = new window.Image();
    next.decoding = "async";
    next.src = asset(photos[mod(currentIndex + 1, photos.length)].src);
  }, [currentIndex, parentVisible, photos]);

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
    const stableGutter = window
      .getComputedStyle(html)
      .getPropertyValue("scrollbar-gutter")
      .includes("stable");
    if (scrollbar > 0 && !stableGutter)
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
      if (!mountedRef.current || !restoreAfterCloseRef.current) return;
      const opener = openerRef.current;
      if (
        opener?.isConnected &&
        opener.getClientRects().length > 0 &&
        !opener.closest(
          '[hidden], [inert], [aria-hidden="true"], details:not([open])',
        )
      ) {
        window.scrollTo({
          left: previous.x,
          top: previous.y,
          behavior: "instant",
        });
        opener.focus({ preventScroll: true });
        setKeyboardFocused(opener.matches(":focus-visible"));
      }
    };
  }, [lightboxOpen]);

  function move(offset: number) {
    if (photos.length > 1)
      setIndex((current) => mod(current + offset, photos.length));
  }

  function choose(next: number, focusThumbnail = false) {
    if (!photos.length) return;
    const selected = mod(next, photos.length);
    setIndex(selected);
    if (focusThumbnail)
      thumbRefs.current[selected]?.focus({ preventScroll: true });
  }

  function openPhoto(opener: HTMLElement) {
    if (!parentVisible || !photo) return;
    restoreAfterCloseRef.current = true;
    openerRef.current = opener;
    setLightboxOpen(true);
  }

  function galleryKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (
      lightboxOpen ||
      !(event.target instanceof Element) ||
      !event.target.closest(".life-photo-card, .life-slideshow-controls")
    )
      return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      choose(event.key === "Home" ? 0 : photos.length - 1);
    }
  }

  function thumbnailKeys(
    event: KeyboardEvent<HTMLButtonElement>,
    position: number,
  ) {
    const next =
      event.key === "ArrowRight"
        ? position + 1
        : event.key === "ArrowLeft"
          ? position - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? photos.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    choose(next, true);
  }

  function startSwipe(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" || !event.isPrimary) {
      swipeRef.current = null;
      return;
    }
    swipeRef.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  }

  function finishSwipe(event: PointerEvent<HTMLButtonElement>) {
    const swipe = swipeRef.current;
    swipeRef.current = null;
    if (!swipe || swipe.pointer !== event.pointerId) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      suppressClickUntilRef.current = performance.now() + 250;
      move(dx < 0 ? 1 : -1);
    }
  }

  function lightboxKeys(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setLightboxOpen(false);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      choose(event.key === "Home" ? 0 : photos.length - 1);
    } else if (event.key === "Tab") {
      const targets = [
        ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
          "button:not(:disabled)",
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

  if (!photo)
    return (
      <div ref={galleryRef} className="life-gallery-empty">
        Photos will appear here once they’re added.
      </div>
    );

  return (
    <div
      className="life-gallery"
      ref={galleryRef}
      onKeyDown={galleryKeys}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHovered(false);
      }}
      onFocusCapture={(event) =>
        setKeyboardFocused(
          event.target instanceof HTMLElement &&
            event.target.matches(":focus-visible"),
        )
      }
      onBlurCapture={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          setKeyboardFocused(false);
      }}
    >
      <div className="life-gallery-heading">
        <div>
          <p className="life-gallery-eyebrow">From my camera roll</p>
          <h3>Life in pictures.</h3>
        </div>
        <button
          type="button"
          className="life-autoplay-toggle"
          role="switch"
          aria-checked={autoPlay && canAutoPlay}
          aria-describedby={`${prefix}-motion-note`}
          disabled={!canAutoPlay}
          onClick={() => setAutoPlay((value) => !value)}
        >
          Auto-play{" "}
          <span aria-hidden="true" className="life-autoplay-switch">
            <span />
          </span>
          <span className="life-autoplay-state">
            {autoPlay && canAutoPlay ? "On" : "Off"}
          </span>
        </button>
      </div>
      <div
        className="life-gallery-filters"
        role="group"
        aria-label="Filter personal photos"
      >
        {filters.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={filter === category}
            onClick={() => {
              setFilter(category);
              setIndex(0);
            }}
          >
            {category}
          </button>
        ))}
      </div>
      <p className="life-gallery-help" id={`${prefix}-motion-note`}>
        {reducedMotion
          ? "Choose a photo below. Automatic switching is off for reduced motion."
          : "A new memory every few seconds. Tap the photo to look closer, or swipe to browse."}
      </p>
      <div className="life-polaroid-stage" ref={stageRef}>
        <div className="life-polaroid-stack">
          <span aria-hidden="true" className="life-polaroid-back is-first" />
          <span aria-hidden="true" className="life-polaroid-back is-second" />
          <span aria-hidden="true" className="life-photo-tape" />
          <button
            type="button"
            className="life-photo-card"
            aria-label={`Open photo: ${photo.alt}`}
            aria-describedby={`${prefix}-slide-caption ${prefix}-slide-count`}
            onPointerDown={startSwipe}
            onPointerUp={finishSwipe}
            onPointerCancel={() => {
              swipeRef.current = null;
            }}
            onClick={(event) => {
              if (
                event.detail !== 0 &&
                performance.now() < suppressClickUntilRef.current
              )
                return;
              openPhoto(event.currentTarget);
            }}
          >
            <span className="life-photo-image" aria-hidden="true">
              <AnimatePresence initial={false}>
                <motion.span
                  className="life-photo-slide"
                  key={photo.id}
                  initial={
                    reducedMotion
                      ? false
                      : { opacity: 0, rotate: 0.8, scale: 1.01 }
                  }
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: reducedMotion ? 0 : -0.6 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.5,
                    ease: [0.2, 0.7, 0.2, 1],
                  }}
                >
                  <img
                    src={asset(photo.src)}
                    alt=""
                    width={photo.width}
                    height={photo.height}
                    decoding="async"
                    draggable={false}
                  />
                </motion.span>
              </AnimatePresence>
              <span className="life-photo-open">↗</span>
            </span>
            <span className="life-photo-caption" id={`${prefix}-slide-caption`}>
              {photo.caption || photo.alt}
            </span>
            <span className="life-photo-meta">
              <span>{photo.category}</span>
              <span id={`${prefix}-slide-count`}>
                {String(currentIndex + 1).padStart(2, "0")} /{" "}
                {String(photos.length).padStart(2, "0")}
              </span>
            </span>
          </button>
        </div>
      </div>
      <div
        className="life-slideshow-controls"
        aria-label="Browse personal photos"
      >
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={photos.length < 2}
          aria-label="Previous photo"
        >
          <ArrowLeft size={19} aria-hidden="true" />
        </button>
        <p>
          Little moments, kept close.<span>← → to browse · Enter to open</span>
        </p>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={photos.length < 2}
          aria-label="Next photo"
        >
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      </div>
      <div
        className="life-thumbnail-strip"
        ref={stripRef}
        role="group"
        aria-label="Choose a personal photo"
      >
        {photos.map((item, position) => (
          <button
            key={item.id}
            type="button"
            className="life-thumbnail"
            aria-label={`Show photo ${position + 1}: ${item.caption || item.alt}`}
            aria-current={currentIndex === position ? "true" : undefined}
            tabIndex={currentIndex === position ? 0 : -1}
            ref={(element) => {
              thumbRefs.current[position] = element;
            }}
            onClick={() => choose(position)}
            onKeyDown={(event) => thumbnailKeys(event, position)}
          >
            <img
              src={asset(item.thumb ?? item.src)}
              alt=""
              width={item.width}
              height={item.height}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </button>
        ))}
      </div>
      <span
        className="sr-only"
        role="status"
        aria-live={playing ? "off" : "polite"}
      >
        {!lightboxOpen
          ? `${photo.caption || photo.alt} Photo ${currentIndex + 1} of ${photos.length}.`
          : ""}
      </span>
      <dialog
        className="life-lightbox"
        ref={dialogRef}
        aria-labelledby={`${prefix}-lightbox-caption`}
        aria-describedby={`${prefix}-photo-meta`}
        onKeyDown={lightboxKeys}
        onCancel={(event) => {
          event.preventDefault();
          setLightboxOpen(false);
        }}
        onClose={() => {
          if (!dialogRef.current?.open) setLightboxOpen(false);
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
            setLightboxOpen(false);
        }}
      >
        {lightboxOpen ? (
          <>
            <header className="life-lightbox-heading">
              <p id={`${prefix}-photo-meta`}>
                {photo.category}
                <span aria-hidden="true"> · </span>
                <span aria-live="polite">
                  {currentIndex + 1} / {photos.length}
                </span>
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close photo"
              >
                <X size={21} aria-hidden="true" />
              </button>
            </header>
            <div className="life-lightbox-image">
              <img
                src={asset(photo.src)}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                decoding="async"
              />
            </div>
            <footer className="life-lightbox-footer">
              <h3 id={`${prefix}-lightbox-caption`} aria-live="polite">
                {photo.caption || photo.alt}
              </h3>
              <div className="life-lightbox-navigation">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  disabled={photos.length < 2}
                  aria-label="Previous photo"
                >
                  <ArrowLeft size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  disabled={photos.length < 2}
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
