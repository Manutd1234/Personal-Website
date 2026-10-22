"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, DragEvent, KeyboardEvent } from "react";
import { ArrowDown, Grip, Layers, RotateCcw } from "lucide-react";
import { skillGroups } from "@/content/portfolio";
import { useMotionPreference } from "./useMotionPreference";
import "@/app/skills-blocks.css";

const familyLabels = [
  "Programming",
  "Web / mobile",
  "Backend / APIs",
  "AI / ML",
  "Data / quant",
  "Databases",
  "Cloud / delivery",
  "Engineering",
] as const;
const blocks = skillGroups.flatMap((group, categoryIndex) =>
  group.items.map((label, itemIndex) => ({
    id: `skill-${categoryIndex}-${itemIndex}`,
    label,
    category: group.label,
    categoryIndex,
    itemIndex,
    family: familyLabels[categoryIndex] ?? group.label,
  })),
);
const blockById = new Map(blocks.map((block) => [block.id, block]));
// Interleave the categories so visitors can make their own arrangement.
const initialOrder = [...blocks]
  .sort(
    (a, b) => a.itemIndex - b.itemIndex || a.categoryIndex - b.categoryIndex,
  )
  .map((block) => block.id);

export default function SkillsSandbox({
  category = "all",
  search = "",
  id,
}: {
  category?: string;
  search?: string;
  id?: string;
}) {
  const [order, setOrder] = useState(initialOrder);
  const [focused, setFocused] = useState(initialOrder[0]);
  const [picked, setPicked] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [cycle, setCycle] = useState(0);
  const [columns, setColumns] = useState(6);
  const [available, setAvailable] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [matchCursor, setMatchCursor] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLOListElement>(null);
  const tileRefs = useRef(new Map<string, HTMLButtonElement>());
  const startedRef = useRef(false);
  const suppressClickRef = useRef(0);
  const focusFrameRef = useRef<number | null>(null);
  const prefix = useId();
  const reducedMotion = useMotionPreference();
  const query = search.trim().toLocaleLowerCase();
  const matches = blocks.filter(
    (block) =>
      (category === "all" || category === block.category) &&
      (!query ||
        block.label.toLocaleLowerCase().includes(query) ||
        block.category.toLocaleLowerCase().includes(query)),
  );
  const matchingIds = new Set(matches.map((block) => block.id));
  const filtering = category !== "all" || Boolean(query);
  const orderedMatches = order.filter((blockId) => matchingIds.has(blockId));
  const selected = picked ? blockById.get(picked) : undefined;

  function reveal(blockId: string, takeFocus = false) {
    const viewport = viewportRef.current;
    const grid = gridRef.current;
    const tile = tileRefs.current.get(blockId);
    const cell = tile?.parentElement;
    if (!viewport || !grid || !tile || !cell) return;
    if (takeFocus) {
      setFocused(blockId);
      tile.focus({ preventScroll: true });
    }
    // Layout offsets stay steady while blocks are visually falling.
    const top = grid.offsetTop + cell.offsetTop;
    const height = tile.offsetHeight;
    if (
      top < viewport.scrollTop + 10 ||
      top + height > viewport.scrollTop + viewport.clientHeight - 10
    ) {
      viewport.scrollTo({
        top: top - (viewport.clientHeight - height) / 2,
        behavior: reducedMotion ? "instant" : "smooth",
      });
    }
  }

  useEffect(
    () => () => {
      if (focusFrameRef.current !== null)
        cancelAnimationFrame(focusFrameRef.current);
    },
    [],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let onScreen = false;
    const sync = () =>
      setAvailable(
        onScreen &&
          !document.hidden &&
          !root.closest('[hidden], [inert], [aria-hidden="true"]'),
      );
    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    intersection.observe(root);
    const visibility = new MutationObserver(sync);
    for (
      let ancestor: HTMLElement | null = root;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      visibility.observe(ancestor, {
        attributes: true,
        attributeFilter: ["hidden", "inert", "aria-hidden"],
      });
    }
    document.addEventListener("visibilitychange", sync);
    return () => {
      intersection.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    if (!available || reducedMotion || startedRef.current) return;
    startedRef.current = true;
    setCycle((current) => current + 1);
  }, [available, reducedMotion]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const measure = () => {
      const width = grid.getBoundingClientRect().width;
      if (width > 0)
        setColumns(
          getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    measure();
    return () => observer.disconnect();
  }, [cycle]);

  useEffect(() => {
    setMatchCursor(0);
    setPicked(null);
    setDragging(null);
    setDropTarget(null);
    if (!filtering || !available) return;
    const first = order.find((blockId) => {
      const block = blockById.get(blockId);
      return (
        block &&
        (category === "all" || category === block.category) &&
        (!query ||
          block.label.toLocaleLowerCase().includes(query) ||
          block.category.toLocaleLowerCase().includes(query))
      );
    });
    if (first) reveal(first);
    // The board's arrangement is independent of the highlight controls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query, available]);

  function swap(sourceId: string, targetId: string, keepPicked = false) {
    if (sourceId === targetId) return;
    const source = blockById.get(sourceId);
    const target = blockById.get(targetId);
    if (!source || !target) return;
    setOrder((current) => {
      const next = [...current];
      const from = next.indexOf(sourceId);
      const to = next.indexOf(targetId);
      if (from < 0 || to < 0) return current;
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setFocused(sourceId);
    if (!keepPicked) setPicked(null);
    setAnnouncement(
      `${source.label} swapped with ${target.label}.${keepPicked ? " Still picked up; use arrows to move, or Enter to set down." : ""}`,
    );
    if (focusFrameRef.current !== null)
      cancelAnimationFrame(focusFrameRef.current);
    focusFrameRef.current = requestAnimationFrame(() => {
      focusFrameRef.current = null;
      reveal(sourceId, true);
    });
  }

  function pick(blockId: string) {
    if (performance.now() < suppressClickRef.current) return;
    const block = blockById.get(blockId);
    if (!block) return;
    if (picked === blockId) {
      setPicked(null);
      setAnnouncement(`${block.label} set down.`);
    } else if (picked) swap(picked, blockId);
    else {
      setPicked(blockId);
      setAnnouncement(
        `${block.label} picked up. Choose another block to swap, or use arrow keys.`,
      );
    }
  }

  function tileKeys(event: KeyboardEvent<HTMLButtonElement>, blockId: string) {
    if (event.key === "Escape") {
      setPicked(null);
      setAnnouncement("Block set down. Layout kept.");
      return;
    }
    const position = order.indexOf(blockId);
    const next =
      event.key === "ArrowRight"
        ? position + 1
        : event.key === "ArrowLeft"
          ? position - 1
          : event.key === "ArrowDown"
            ? position + columns
            : event.key === "ArrowUp"
              ? position - columns
              : event.key === "Home"
                ? 0
                : event.key === "End"
                  ? order.length - 1
                  : null;
    if (next === null) return;
    event.preventDefault();
    const destination = order[Math.max(0, Math.min(order.length - 1, next))];
    if (picked === blockId && destination !== blockId)
      swap(blockId, destination, true);
    else reveal(destination, true);
  }

  function beginDrag(event: DragEvent<HTMLButtonElement>, blockId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", blockId);
    setDragging(blockId);
    setPicked(blockId);
  }

  function endDrag() {
    suppressClickRef.current = performance.now() + 250;
    setDragging(null);
    setPicked(null);
    setDropTarget(null);
  }

  function nextMatch() {
    if (!orderedMatches.length) return;
    const next = (matchCursor + 1) % orderedMatches.length;
    setMatchCursor(next);
    reveal(orderedMatches[next], true);
  }

  function resetLayout() {
    setOrder(initialOrder);
    setPicked(null);
    setFocused(initialOrder[0]);
    setCycle((current) => current + 1);
    viewportRef.current?.scrollTo({ top: 0, behavior: "instant" });
    setAnnouncement("Original mixed layout restored.");
  }

  return (
    <section
      className="skill-stack"
      id={id}
      ref={rootRef}
      data-reduced-motion={reducedMotion}
      data-available={available}
      aria-labelledby={`${prefix}-title`}
    >
      <header className="skill-stack-heading">
        <div>
          <p>Make yourself at home</p>
          <h3 id={`${prefix}-title`}>A stack of things I use.</h3>
        </div>
        <span className="skill-stack-total">
          {blocks.length} blocks · {skillGroups.length} categories
        </span>
      </header>
      <p className="skill-stack-instructions" id={`${prefix}-instructions`}>
        Let them land, then make your own arrangement. Drag a block, or tap two
        to swap. The filters above light up matches.
      </p>
      <div className="skill-stack-toolbar">
        <button
          type="button"
          onClick={() => {
            setPicked(null);
            setCycle((current) => current + 1);
            setAnnouncement("Blocks dropped again.");
          }}
        >
          <ArrowDown size={15} aria-hidden="true" />
          Drop again
        </button>
        <button
          type="button"
          onClick={() => {
            setOrder(blocks.map((block) => block.id));
            setPicked(null);
            setAnnouncement("Blocks grouped by category.");
          }}
        >
          <Layers size={15} aria-hidden="true" />
          Group by category
        </button>
        <button type="button" onClick={resetLayout}>
          <RotateCcw size={14} aria-hidden="true" />
          Reset layout
        </button>
        {filtering ? (
          <button
            type="button"
            className="skill-stack-next-match"
            disabled={!orderedMatches.length}
            onClick={nextMatch}
          >
            Next lit block <span aria-hidden="true">↓</span>
          </button>
        ) : null}
      </div>
      <div className="skill-stack-viewport" ref={viewportRef}>
        <ol
          className="skill-stack-grid"
          key={cycle}
          ref={gridRef}
          aria-label="All skills; arrange the blocks"
          aria-describedby={`${prefix}-keyboard`}
          data-dropping={cycle > 0}
        >
          {order.map((blockId, position) => {
            const block = blockById.get(blockId)!;
            const lit = matchingIds.has(blockId);
            return (
              <li
                className="skill-stack-cell"
                key={blockId}
                data-picked={picked === blockId}
                style={
                  {
                    "--fall-delay": `${position * 16}ms`,
                    "--fall-distance": `${Math.min(680, 80 + Math.floor(position / columns) * 52)}px`,
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className="skill-block"
                  data-tone={block.categoryIndex}
                  data-lit={lit}
                  data-filtering={filtering}
                  data-picked={picked === blockId}
                  data-dragging={dragging === blockId}
                  data-drop-target={dropTarget === blockId}
                  draggable
                  aria-pressed={picked === blockId}
                  aria-label={`${block.label} · ${block.category}${filtering ? (lit ? " · highlighted" : " · outside current highlight") : ""}`}
                  aria-describedby={`${prefix}-keyboard`}
                  tabIndex={focused === blockId ? 0 : -1}
                  ref={(node) => {
                    if (node) tileRefs.current.set(blockId, node);
                    else tileRefs.current.delete(blockId);
                  }}
                  onFocus={() => setFocused(blockId)}
                  onClick={() => pick(blockId)}
                  onKeyDown={(event) => tileKeys(event, blockId)}
                  onDragStart={(event) => beginDrag(event, blockId)}
                  onDragOver={(event) => {
                    if (dragging) {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDropTarget(blockId);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (dragging) swap(dragging, blockId);
                    endDrag();
                  }}
                  onDragEnd={endDrag}
                >
                  <Grip size={11} aria-hidden="true" />
                  <span className="skill-block-name">{block.label}</span>
                  <span className="skill-block-family">{block.family}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="skill-stack-footer">
        <p id={`${prefix}-keyboard`}>
          Keyboard: arrows to browse · Enter to pick up · arrows to move · Enter
          to set down · Esc to cancel.
        </p>
        <p className="skill-stack-selection">
          {selected ? (
            <>
              <strong>{selected.label}</strong> picked up
            </>
          ) : (
            "Arrange the stack any way you like."
          )}
        </p>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </section>
  );
}
