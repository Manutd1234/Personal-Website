"use client";
import { useMotionPreference } from "./useMotionPreference";

import { ArrowLeft, ArrowRight, X } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { lifePhotos, type LifePhoto } from "@/content/life-photos";
import { asset } from "@/content/paths";

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
const rotations = [-2.1, 1.5, -0.8, 2.2, -1.4, 0.7] as const;

function PhotoTile({
  photo,
  index,
  duplicate,
  filler = false,
  onOpen,
}: {
  photo: LifePhoto;
  index: number;
  duplicate: boolean;
  filler?: boolean;
  onOpen: (photo: LifePhoto, opener: HTMLButtonElement) => void;
}) {
  const contents = (
    <>
      <span className="life-photo-image">
        <img
          src={asset(photo.thumb ?? photo.src)}
          alt={duplicate ? "" : photo.alt}
          width={photo.width}
          height={photo.height}
          loading="lazy"
          decoding="async"
          style={
            photo.position ? { objectPosition: photo.position } : undefined
          }
        />
        <span className="life-photo-open" aria-hidden="true">
          ↗
        </span>
      </span>
      <span className="life-photo-caption">{photo.caption || photo.alt}</span>
      <span className="life-photo-category">{photo.category}</span>
    </>
  );
  return (
    <div
      className={`life-photo-tile${filler ? " is-filler" : ""}`}
      data-photo-id={photo.id}
      aria-hidden={duplicate ? true : undefined}
      inert={duplicate}
      style={
        {
          "--photo-turn": `${rotations[index % rotations.length]}deg`,
        } as CSSProperties
      }
    >
      {duplicate ? (
        <div className="life-photo-card">{contents}</div>
      ) : (
        <button
          type="button"
          className="life-photo-card"
          aria-label={`Open photo: ${photo.caption || photo.alt}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen(photo, event.currentTarget);
          }}
        >
          {contents}
        </button>
      )}
    </div>
  );
}

export default function OffDutyPanel() {
  const [filter, setFilter] = useState<GalleryFilter>("All");
  const [autoRoll, setAutoRoll] = useState(true);
  const [inView, setInView] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(false);
  const [disclosureOpen, setDisclosureOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useMotionPreference();
  const prefix = useId();

  const photos = useMemo(
    () =>
      filter === "All"
        ? lifePhotos
        : lifePhotos.filter((photo) => photo.category === filter),
    [filter],
  );
  const rows = useMemo(() => {
    const split = Math.ceil(photos.length / 2);
    const groups =
      photos.length < 6
        ? [photos]
        : [photos.slice(0, split), photos.slice(split)];
    return groups
      .filter((row) => row.length > 0)
      .map((row, index) => ({
        photos: row,
        tiles: Array.from(
          { length: Math.max(6, row.length) },
          (_, tile) => row[tile % row.length],
        ),
        secondsPerPhoto: index === 0 ? 8 : 9,
      }));
  }, [photos]);
  const selectedIndex = photos.findIndex((photo) => photo.id === selectedId);
  const selectedPhoto = photos[selectedIndex];
  const lightboxOpen = selectedPhoto !== undefined;
  const canAutoRoll = !reducedMotion && photos.length > 1;
  const staticMode = !canAutoRoll || !autoRoll || focused;
  const rolling =
    !staticMode &&
    inView &&
    documentVisible &&
    disclosureOpen &&
    !hovered &&
    !lightboxOpen;

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const disclosure = gallery.closest("details");
    const panel = gallery.closest<HTMLElement>('[role="tabpanel"]');
    const closeForNavigation = () => setSelectedId(null);
    const panelObserver = new MutationObserver(() => {
      if (
        panel?.hidden ||
        panel?.getAttribute("aria-hidden") === "true" ||
        panel?.inert
      ) {
        setSelectedId(null);
        setFocused(false);
      }
    });
    if (panel)
      panelObserver.observe(panel, {
        attributes: true,
        attributeFilter: ["hidden", "aria-hidden", "inert"],
      });
    const syncVisibility = () =>
      setDocumentVisible(document.visibilityState === "visible");
    const syncDisclosure = () =>
      setDisclosureOpen(!disclosure || disclosure.open);
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              setInView(entry.isIntersecting && entry.intersectionRatio > 0);
            },
            { threshold: [0, 0.05] },
          );
    if (observer) observer.observe(gallery);
    else setInView(true);
    syncVisibility();
    syncDisclosure();
    document.addEventListener("visibilitychange", syncVisibility);
    disclosure?.addEventListener("toggle", syncDisclosure);
    window.addEventListener("hashchange", closeForNavigation);
    return () => {
      observer?.disconnect();
      panelObserver.disconnect();
      window.removeEventListener("hashchange", closeForNavigation);
      document.removeEventListener("visibilitychange", syncVisibility);
      disclosure?.removeEventListener("toggle", syncDisclosure);
    };
  }, []);

  useEffect(() => {
    if (!staticMode)
      galleryRef.current
        ?.querySelectorAll<HTMLElement>(".life-marquee-row")
        .forEach((row) => {
          row.scrollLeft = 0;
        });
  }, [staticMode]);

  useEffect(() => {
    if (!disclosureOpen) setSelectedId(null);
  }, [disclosureOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const body = document.body;
    const html = document.documentElement;
    const previous = {
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      paddingRight: body.style.paddingRight,
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
      if (
        openerRef.current?.isConnected &&
        openerRef.current.getClientRects().length > 0 &&
        !openerRef.current.closest('[hidden], [inert], [aria-hidden="true"]')
      ) {
        openerRef.current.focus({ preventScroll: true });
        setFocused(true);
        const opener = openerRef.current;
        requestAnimationFrame(() => {
          if (
            opener.isConnected &&
            opener.getClientRects().length > 0 &&
            opener.matches(".life-photo-card")
          )
            opener.scrollIntoView({
              block: "nearest",
              inline: "nearest",
              behavior: "instant",
            });
        });
      }
    };
  }, [lightboxOpen]);

  function openPhoto(photo: LifePhoto, opener: HTMLElement | null) {
    openerRef.current = opener ?? galleryRef.current;
    setSelectedId(photo.id);
  }

  // Cloned sequences stay inert for assistive technology. Pointer clicks are
  // resolved at their non-inert parent, using the visible frame's coordinates.
  function openVisibleFrame(event: MouseEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest("button"))
      return;
    const frame = [
      ...event.currentTarget.querySelectorAll<HTMLElement>("[data-photo-id]"),
    ].find((node) => {
      const box = node.getBoundingClientRect();
      return (
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom
      );
    });
    const photo = photos.find((item) => item.id === frame?.dataset.photoId);
    if (!photo) return;
    const original = [
      ...(galleryRef.current?.querySelectorAll<HTMLElement>(
        "[data-photo-id]",
      ) ?? []),
    ]
      .find(
        (node) =>
          node.dataset.photoId === photo.id && !node.hasAttribute("inert"),
      )
      ?.querySelector<HTMLButtonElement>("button");
    openPhoto(photo, original ?? null);
  }

  function movePhoto(offset: number) {
    if (photos.length < 2) return;
    setSelectedId((current) => {
      const index = photos.findIndex((photo) => photo.id === current);
      return photos[(index + offset + photos.length) % photos.length].id;
    });
  }

  function lightboxKeys(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      movePhoto(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === "Tab") {
      const targets = [
        ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
          "button:not(:disabled)",
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

  if (!lifePhotos.length)
    return (
      <div ref={galleryRef} className="life-gallery-empty">
        Photos will appear here once they’re added.
      </div>
    );

  return (
    <div
      ref={galleryRef}
      className="life-gallery"
      tabIndex={-1}
      data-static={staticMode}
      data-rolling={rolling}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHovered(false);
      }}
      onFocusCapture={(event) =>
        setFocused(
          event.target instanceof HTMLElement &&
            event.target.matches(":focus-visible"),
        )
      }
      onBlurCapture={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          setFocused(false);
      }}
    >
      <div className="life-gallery-heading">
        <div>
          <p className="life-gallery-eyebrow">From my camera roll</p>
          <h3>Life in pictures.</h3>
        </div>
        <button
          type="button"
          className="life-roll-toggle"
          role="switch"
          aria-checked={autoRoll && canAutoRoll}
          aria-describedby={!canAutoRoll ? `${prefix}-motion-note` : undefined}
          disabled={!canAutoRoll}
          onClick={() => setAutoRoll((value) => !value)}
        >
          Auto-roll{" "}
          <span aria-hidden="true" className="life-roll-switch">
            <span />
          </span>
          <span className="life-roll-state">
            {autoRoll && canAutoRoll ? "On" : "Off"}
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
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <p className="life-gallery-help" id={`${prefix}-motion-note`}>
        Open a photo to look closer. With Auto-roll off, scroll to browse at
        your own pace.
      </p>
      <div
        className="life-gallery-marquees"
        aria-label={`${filter === "All" ? "Personal" : filter} photos`}
      >
        {rows.map((row, rowIndex) => (
          <div key={`${filter}-${rowIndex}`} className="life-marquee-row">
            <div
              className={`life-marquee-track${rowIndex === 1 ? " is-reversed" : ""}`}
              style={{
                animationDuration: `${row.tiles.length * row.secondsPerPhoto}s`,
              }}
              onClick={openVisibleFrame}
            >
              <div className="life-marquee-sequence">
                {row.tiles.map((photo, index) => (
                  <PhotoTile
                    key={`${photo.id}-${index}`}
                    photo={photo}
                    index={index + rowIndex * 2}
                    duplicate={index >= row.photos.length}
                    filler={index >= row.photos.length}
                    onOpen={openPhoto}
                  />
                ))}
              </div>
              <div
                className="life-marquee-sequence life-gallery-copy"
                aria-hidden="true"
                inert
              >
                {row.tiles.map((photo, index) => (
                  <PhotoTile
                    key={`${photo.id}-${index}`}
                    photo={photo}
                    index={index + rowIndex * 2}
                    duplicate
                    onOpen={openPhoto}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only" role="status">
        Showing {photos.length}{" "}
        {filter === "All" ? "personal" : filter.toLowerCase()} photos.
      </span>

      <dialog
        ref={dialogRef}
        className="life-lightbox"
        aria-labelledby={`${prefix}-caption`}
        aria-describedby={`${prefix}-photo-meta`}
        onKeyDown={lightboxKeys}
        onCancel={(event) => {
          event.preventDefault();
          setSelectedId(null);
        }}
        onClose={() => setSelectedId(null)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const box = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            setSelectedId(null);
        }}
      >
        {selectedPhoto ? (
          <>
            <header className="life-lightbox-heading">
              <p id={`${prefix}-photo-meta`}>
                {selectedPhoto.category}
                <span aria-hidden="true"> · </span>
                <span aria-live="polite">
                  {selectedIndex + 1} / {photos.length}
                </span>
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close photo"
              >
                <X size={21} aria-hidden="true" />
              </button>
            </header>
            <div className="life-lightbox-image">
              <img
                src={asset(selectedPhoto.src)}
                alt={selectedPhoto.alt}
                width={selectedPhoto.width}
                height={selectedPhoto.height}
                decoding="async"
              />
            </div>
            <footer className="life-lightbox-footer">
              <h3 id={`${prefix}-caption`} aria-live="polite">
                {selectedPhoto.caption || selectedPhoto.alt}
              </h3>
              <div className="life-lightbox-navigation">
                <button
                  type="button"
                  onClick={() => movePhoto(-1)}
                  disabled={photos.length < 2}
                  aria-label="Previous photo"
                >
                  <ArrowLeft size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => movePhoto(1)}
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
