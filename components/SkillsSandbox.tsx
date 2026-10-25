"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import type { Body as PhysicsBody } from "matter-js";
import { RotateCcw } from "lucide-react";
import { skillGroups } from "@/content/portfolio";
import { useMotionPreference } from "./useMotionPreference";
import {
  containSkillBody,
  skillTilePaths,
  skillTileForm,
  skillBodyVisualCenter,
  skillBoardHeight,
  createSkillBody,
  createSkillEngine,
  createSkillWalls,
  isSkillPileStill,
  moveSkillBody,
  createSkillDrag,
  stepSkillPhysics,
  releaseSkillDrag,
  skillPointerPosition,
  type SkillDrag,
  type SkillShape,
  SKILL_COLLISION_PADDING,
  SKILL_DROP_BLOCKED_MS,
  SKILL_PHYSICS_STEP,
} from "./skill-physics";
import "@/app/skills-blocks.css";
import "@/app/skills-atelier.css";

type MatterLibrary = typeof import("matter-js");
const skills = skillGroups
  .flatMap((group, categoryIndex) =>
    group.items.map((label, itemIndex) => ({
      id: `skill-${categoryIndex}-${itemIndex}`,
      label,
      category: group.label,
      categoryIndex,
      itemIndex,
    })),
  )
  .sort(
    (a, b) => a.itemIndex - b.itemIndex || a.categoryIndex - b.categoryIndex,
  );
function tileForm(index: number) {
  return skillTileForm(index, skills[index].label);
}
// Fractions of the SVG occupied by a centred rectangle that stays inside its
// curves and notches. Fixed pixel padding cannot protect a long, stretched tile.
const textSafeArea: Record<SkillShape, { width: number; height: number }> = {
  ellipse: { width: 0.76, height: 0.56 },
  hexagon: { width: 0.76, height: 0.76 },
  ticket: { width: 0.84, height: 0.76 },
  pebble: { width: 0.72, height: 0.68 },
  cloud: { width: 0.66, height: 0.5 },
  pennant: { width: 0.72, height: 0.76 },
  seal: { width: 0.7, height: 0.48 },
};

function clearTileSize(element: HTMLButtonElement) {
  element.style.width = "";
  element.style.height = "";
  element.style.removeProperty("--skill-text-width");
  delete element.dataset.fitted;
}

function fitSkillTiles(elements: HTMLButtonElement[], worldWidth: number) {
  const maxWidth = Math.max(1, worldWidth - 24);
  const labels = elements.map((element) => element.querySelector("span")!);
  elements.forEach((element) => {
    clearTileSize(element);
    element.dataset.fitted = "true";
    element.style.setProperty("--skill-text-width", "max-content");
  });
  // Batch natural text reads, width writes, and wrapped-height reads. This runs
  // only when fonts or the board width change, never in the physics frame loop.
  const widths = labels.map((label, index) => Math.min(maxWidth,
    Math.ceil((label.getBoundingClientRect().width + 3) / textSafeArea[tileForm(index)].width),
  ));
  elements.forEach((element, index) => {
    element.style.width = `${widths[index]}px`;
    element.style.setProperty("--skill-text-width", `${Math.max(1,
      widths[index] * textSafeArea[tileForm(index)].width - 3,
    )}px`);
  });
  const heights = labels.map((label, index) => Math.ceil(
    (label.getBoundingClientRect().height + 3) / textSafeArea[tileForm(index)].height,
  ));
  elements.forEach((element, index) => {
    element.style.height = `${heights[index]}px`;
  });
  return elements.map((element) => ({
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
  }));
}
const STEP = 1000 / 60;
const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));
type PillPointer = PointerEvent<HTMLButtonElement>;
type Controller = {
  availability: (available: boolean) => void;
  replay: () => void;
  reveal: (index: number) => void;
  nudge: (index: number, key: string, large: boolean) => void;
  grab: (index: number, event: PillPointer) => void;
  move: (event: PillPointer) => void;
  release: (event?: PillPointer, cancelled?: boolean) => boolean;
};

export default function SkillsSandbox({
  search = "",
  id,
  active = true,
  status,
}: {
  search?: string;
  id?: string;
  active?: boolean;
  status?: ReactNode;
}) {
  const [selected, setSelected] = useState(0);
  const [grabbed, setGrabbed] = useState<number | null>(null);
  const [available, setAvailable] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [matter, setMatter] = useState<MatterLibrary | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const rootRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const controllerRef = useRef<Controller | null>(null);
  const availableRef = useRef(false);
  const replayPendingRef = useRef(false);
  const suppressClickRef = useRef(0);
  const focusFrameRef = useRef<number | null>(null);
  const prefix = useId();
  const reducedMotion = useMotionPreference();
  availableRef.current = active && available && !reducedMotion;
  const query = search.trim().toLocaleLowerCase();
  const filtering = Boolean(query);
  const matching = skills
    .map((skill, index) => ({ skill, index }))
    .filter(
      ({ skill }) =>
        (!query ||
          skill.label.toLocaleLowerCase().includes(query) ||
          skill.category.toLocaleLowerCase().includes(query)),
    );
  const matchingIndices = new Set(matching.map(({ index }) => index));
  const still = reducedMotion || loadFailed;

  // The same fit also protects the static/reduced-motion view before Matter
  // loads, or when animation cannot load at all.
  useEffect(() => {
    if (matter && !reducedMotion) return;
    const world = worldRef.current;
    const elements = pillRefs.current.filter(
      (element): element is HTMLButtonElement => Boolean(element),
    );
    if (!world || elements.length !== skills.length) return;
    let cancelled = false;
    let frame = 0;
    let measuredWidth = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (cancelled || !world.clientWidth) return;
        measuredWidth = world.clientWidth;
        fitSkillTiles(elements, measuredWidth);
      });
    };
    const fontsLoaded = () => { void document.fonts.ready.then(() => { if (!cancelled) measure(); }); };
    const resize = new ResizeObserver(() => {
      if (world.clientWidth !== measuredWidth) measure();
    });
    resize.observe(world);
    document.fonts.addEventListener("loadingdone", fontsLoaded);
    fontsLoaded();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      document.fonts.removeEventListener("loadingdone", fontsLoaded);
      elements.forEach(clearTileSize);
    };
  }, [matter, reducedMotion]);

  useEffect(() => {
    const root = rootRef.current;
    const world = worldRef.current;
    if (!root || !world) return;
    let onScreen = false;
    const sync = () =>
      setAvailable(
        onScreen &&
          !document.hidden &&
          !root.closest('[hidden], [inert], [aria-hidden="true"]'),
      );
    const intersection =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            sync();
          });
    if (intersection) intersection.observe(world);
    else {
      onScreen = true;
      sync();
    }
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
      intersection?.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
      if (focusFrameRef.current !== null)
        cancelAnimationFrame(focusFrameRef.current);
    };
  }, []);

  // Matter is fetched only after the visible sandbox is allowed to move.
  useEffect(() => {
    if (!active || !available || reducedMotion || matter || loadFailed) return;
    let cancelled = false;
    import("matter-js")
      .then((module) => {
        if (!cancelled) setMatter(module.default ?? module);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [active, available, reducedMotion, matter, loadFailed]);

  useEffect(() => {
    const canMove = active && available && !reducedMotion;
    controllerRef.current?.availability(canMove);
    if (!active) replayPendingRef.current = true;
    if (canMove && ready && replayPendingRef.current) {
      controllerRef.current?.replay();
      replayPendingRef.current = false;
    }
    if (!canMove) {
      setGrabbed(null);
    }
  }, [active, available, ready, reducedMotion]);

  useEffect(() => {
    if (!matter || reducedMotion) {
      setReady(false);
      return;
    }
    const world = worldRef.current;
    const elements = pillRefs.current.filter(
      (element): element is HTMLButtonElement => Boolean(element),
    );
    if (!world || elements.length !== skills.length) return;
    const { Body, Composite, Engine } = matter;
    const engine = createSkillEngine(matter);
    let bodies: PhysicsBody[] = [];
    let liveBodies: PhysicsBody[] = [];
    let paintedTransforms: string[] = [];
    let sizes: { width: number; height: number }[] = [];
    let walls: PhysicsBody[] = [];
    let stillSince: number | null = null;
    let pendingReveal: number | null = null;
    let spawned: boolean[] = [];
    let dropOrder: number[] = [];
    let nextDrop = 0;
    let nextDropAt = 0;
    let handfulRemaining = 0;
    let releaseX = 0;
    let blockedSince: number | null = null;
    let width = 0,
      height = 0,
      frame = 0,
      previous = 0,
      elapsed = 0,
      accumulator = 0;
    let enabled = availableRef.current;
    let cancelled = false;
    let drag: {
      pointer: number;
      body: PhysicsBody;
      grip: SkillDrag;
      element: HTMLButtonElement;
      startX: number;
      startY: number;
      moved: boolean;
      releasedAt: number | null;
    } | null = null;

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      accumulator = 0;
      world!.dataset.running = "false";
    }
    function local(event: PillPointer) {
      const box = world!.getBoundingClientRect();
      return skillPointerPosition({ x: event.clientX, y: event.clientY }, box, width, height);
    }
    function contain(body: PhysicsBody) {
      containSkillBody(matter!, body, width, height);
    }
    function draw() {
      bodies.forEach((body, index) => {
        if (!spawned[index]) return;
        const center = skillBodyVisualCenter(body);
        const transform =
          `translate3d(${(center.x - sizes[index].width / 2).toFixed(2)}px, ${(center.y - sizes[index].height / 2).toFixed(2)}px, 0) rotate(${body.angle.toFixed(4)}rad)`;
        if (paintedTransforms[index] !== transform) {
          elements[index].style.transform = transform;
          paintedTransforms[index] = transform;
        }
      });
    }
    function spawn(index: number) {
      if (spawned[index] || !bodies[index]) return true;
      const body = bodies[index];
      {
        const size = {
          width: sizes[index].width + SKILL_COLLISION_PADDING * 2,
          height: sizes[index].height + SKILL_COLLISION_PADDING * 2,
        };
        // A little tilt keeps the pile playful without turning labels sideways.
        const angle = (Math.random() - 0.5) * 0.2;
        const halfWidth =
          (Math.abs(Math.cos(angle)) * size.width +
            Math.abs(Math.sin(angle)) * size.height) /
          2;
        const halfHeight =
          (Math.abs(Math.cos(angle)) * size.height +
            Math.abs(Math.sin(angle)) * size.width) /
          2;
        const left = halfWidth + 11;
        const right = Math.max(left, width - halfWidth - 11);
        const y = halfHeight + 10 + Math.random() * 22;
        const entering = bodies.filter(
          (other, otherIndex) =>
            spawned[otherIndex] && other.bounds.min.y < y + halfHeight + 8,
        );
        let clear = false;
        Body.setAngle(body, angle);
        // Wait for a real gap instead of inserting overlapping bodies and
        // letting the collision solver push the pile apart.
        for (let attempt = 0; attempt < 12; attempt += 1) {
          // A handful enters from one loose area. If it is occupied, use a
          // real gap elsewhere rather than forcing the pile out of the way.
          const x =
            attempt < 5
              ? clamp(
                  releaseX +
                    (Math.random() + Math.random() - 1) *
                      Math.min(230, width * 0.36),
                  left,
                  right,
                )
              : left + Math.random() * (right - left);
          Body.setPosition(body, { x, y });
          if (!matter!.Query.collides(body, entering).length) {
            clear = true;
            break;
          }
        }
        if (!clear) return false;
      }
      Body.setAngularVelocity(body, 0);
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 0.9,
        y: 0,
      });
      Composite.add(engine.world, body);
      liveBodies.push(body);
      spawned[index] = true;
      elements[index].style.opacity = "1";
      elements[index].style.pointerEvents = "";
      contain(body);
      return true;
    }
    function growWorld(extraHeight: number) {
      height += extraHeight;
      world!.style.height = `${height}px`;
      if (width >= 700 && viewportRef.current)
        viewportRef.current.style.height = `${height + 2}px`;
      walls.forEach((wall) => Composite.remove(engine.world, wall));
      walls = createSkillWalls(matter!, width, height);
      Composite.add(engine.world, walls);
    }
    function releaseNextPill() {
      while (nextDrop < dropOrder.length && spawned[dropOrder[nextDrop]])
        nextDrop += 1;
      if (nextDrop >= dropOrder.length || elapsed < nextDropAt) return;
      let released = -1;
      // A shorter chip can slip through a side gap while a wider one waits.
      // Keep the lookahead small so every waiting chip still gets its turn.
      for (
        let candidate = nextDrop;
        candidate < Math.min(nextDrop + 6, dropOrder.length);
        candidate += 1
      ) {
        if (!spawned[dropOrder[candidate]] && spawn(dropOrder[candidate])) {
          released = candidate;
          break;
        }
      }
      if (released === -1) {
        blockedSince ??= elapsed;
        // Make room below a crowded pile without moving or arranging labels.
        // Gravity carries the existing pile down to the new floor naturally.
        if (!drag && elapsed - blockedSince > SKILL_DROP_BLOCKED_MS) {
          growWorld(64);
          blockedSince = null;
        }
        nextDropAt = elapsed + 40;
        return;
      }
      blockedSince = null;
      [dropOrder[nextDrop], dropOrder[released]] = [
        dropOrder[released],
        dropOrder[nextDrop],
      ];
      nextDrop += 1;
      handfulRemaining -= 1;
      const pace = clamp(21000 / width, 42, 90);
      if (handfulRemaining <= 0) {
        handfulRemaining = 3 + Math.floor(Math.random() * 3);
        releaseX = width * (0.18 + Math.random() * 0.64);
        nextDropAt = elapsed + 180 + Math.random() * 200;
      } else {
        nextDropAt = elapsed + pace + Math.random() * 80;
      }
    }
    function tick(time: number) {
      frame = 0;
      if (!enabled || cancelled) return;
      const delta = previous ? Math.min(50, time - previous) : STEP;
      previous = time;
      elapsed += delta;
      accumulator += delta;
      releaseNextPill();
      while (accumulator >= SKILL_PHYSICS_STEP) {
        stepSkillPhysics(matter!, engine,
          liveBodies, width, height, drag?.grip);
        accumulator -= SKILL_PHYSICS_STEP;
      }
      draw();
      if (drag && drag.releasedAt !== null) {
        const c = Math.cos(drag.body.angle), s = Math.sin(drag.body.angle);
        const distance = Math.hypot(
          drag.grip.target.x - drag.body.position.x - drag.grip.offset.x * c + drag.grip.offset.y * s,
          drag.grip.target.y - drag.body.position.y - drag.grip.offset.x * s - drag.grip.offset.y * c,
        );
        if (distance < 2 || time - drag.releasedAt >= 200) release();
      }
      if (pendingReveal !== null && spawned[pendingReveal]) {
        if (document.activeElement === elements[pendingReveal])
          elements[pendingReveal].scrollIntoView({ block: "nearest", inline: "nearest" });
        pendingReveal = null;
      }
      // Pause only the complete simulation after the whole pile is still.
      // No individual body is frozen, so lifting a support restarts gravity
      // for every label above it as soon as the interaction resumes the loop.
      if (drag || nextDrop < dropOrder.length || !isSkillPileStill(bodies))
        stillSince = null;
      else stillSince ??= elapsed;
      if (stillSince === null || elapsed - stillSince < 1200) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else stop();
    }
    function start() {
      stillSince = null;
      if (!enabled || frame || !bodies.length || cancelled) return;
      world!.dataset.running = "true";
      frame = requestAnimationFrame(tick);
    }
    function release(event?: PillPointer, cancel = false) {
      if (!drag || (event && drag.pointer !== event.pointerId)) return false;
      const current = drag;
      // A fast release can arrive between animation frames. Finish that final
      // pointer movement through collisions instead of dropping at an old frame.
      if (event && current.releasedAt !== null) return false;
      if (event && !cancel && current.moved) {
        current.grip.target = local(event);
        current.releasedAt = performance.now();
        delete current.element.dataset.held;
        if (current.element.hasPointerCapture(current.pointer))
          current.element.releasePointerCapture(current.pointer);
        start();
        return true;
      }
      drag = null;
      delete current.element.dataset.held;
      releaseSkillDrag(matter!, current.grip);
      if (cancel) Body.setVelocity(current.body, { x: 0, y: 0 });
      // Preserve the body's real momentum. Releasing never teleports it into a
      // gap or reinserts it into the world; it has been colliding all along.
      draw();
      if (current.element.hasPointerCapture(current.pointer))
        current.element.releasePointerCapture(current.pointer);
      start();
      return current.moved;
    }
    function clearElementStyles() {
      elements.forEach((element) => {
        clearTileSize(element);
        element.style.transform = "";
        element.style.opacity = "";
        element.style.pointerEvents = "";
        delete element.dataset.held;
      });
    }
    function rebuild() {
      const nextWidth = world!.clientWidth;
      if (!nextWidth || cancelled) return;
      release(undefined, true);
      stop();
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      world!.classList.remove("is-live");
      world!.style.height = "";
      if (viewportRef.current) viewportRef.current.style.height = "";
      clearElementStyles();
      width = nextWidth;
      sizes = fitSkillTiles(elements, width);
      // Estimate space from measured envelopes; this layout is only a sizing
      // calculation. Labels enter from the top and never snap to its positions.
      height = skillBoardHeight(sizes, width, viewportRef.current?.clientHeight ?? 428);
      world!.style.height = `${height}px`;
      if (width >= 700 && viewportRef.current)
        viewportRef.current.style.height = `${height + 2}px`;
      walls = createSkillWalls(matter!, width, height);
      Composite.add(engine.world, walls);
      bodies = sizes.map((size, index) => createSkillBody(matter!, size, { x: width / 2, y: 0 }, index, tileForm(index)));
      spawned = bodies.map(() => false);
      liveBodies = [];
      paintedTransforms = [];
      dropOrder = bodies.map((_, index) => index);
      for (let index = dropOrder.length - 1; index > 1; index -= 1) {
        const other = 1 + Math.floor(Math.random() * index);
        [dropOrder[index], dropOrder[other]] = [
          dropOrder[other],
          dropOrder[index],
        ];
      }
      nextDrop = 0;
      pendingReveal = null;
      stillSince = null;
      blockedSince = null;
      nextDropAt = 120;
      handfulRemaining = 3 + Math.floor(Math.random() * 3);
      releaseX = width * (0.25 + Math.random() * 0.5);
      elapsed = 0;
      replayPendingRef.current = false;
      elements.forEach((element, index) => {
        element.style.width = `${sizes[index].width}px`;
        element.style.height = `${sizes[index].height}px`;
        element.style.opacity = "0";
        element.style.pointerEvents = "none";
      });
      world!.classList.add("is-live");
      world!.dataset.bodies = String(bodies.length);
      setReady(true);
      start();
    }
    function ensureVisible(index: number) {
      if (spawned[index]) {
        pendingReveal = null;
        return true;
      }
      // Keyboard/search navigation brings only this label to the front of the
      // drop queue. It must not rearrange or freeze the rest of the pile.
      const queued = dropOrder.indexOf(index, nextDrop);
      if (queued >= 0)
        [dropOrder[nextDrop], dropOrder[queued]] = [dropOrder[queued], dropOrder[nextDrop]];
      nextDropAt = elapsed;
      pendingReveal = index;
      start();
      return false;
    }
    const controller: Controller = {
      availability(next) {
        enabled = next;
        if (next) start();
        else {
          release(undefined, true);
          stop();
        }
      },
      replay() {
        rebuild();
      },
      reveal(index) {
        ensureVisible(index);
        draw();
        start();
      },
      nudge(index, key, large) {
        release(undefined, true);
        const body = bodies[index];
        if (!body || !enabled) return;
        if (!ensureVisible(index)) return;
        const distance = large ? 30 : 12;
        moveSkillBody(matter!, body, {
          x:
            key === "ArrowLeft"
              ? -distance
              : key === "ArrowRight"
                ? distance
                : 0,
          y: key === "ArrowUp" ? -distance : key === "ArrowDown" ? distance : 0,
        }, liveBodies, width, height);
        draw();
        elements[index].scrollIntoView({ block: "nearest", inline: "nearest" });
        start();
      },
      grab(index, event) {
        const body = bodies[index];
        if (
          !body ||
          !enabled ||
          (event.button !== 0 && !(event.buttons & 1)) ||
          !event.isPrimary
        )
          return;
        release(undefined, true);
        if (!ensureVisible(index)) return;
        const point = local(event);
        const grip = createSkillDrag(matter!, body, point);
        drag = {
          pointer: event.pointerId,
          body,
          grip,
          element: event.currentTarget,
          startX: point.x,
          startY: point.y,
          moved: false,
          releasedAt: null,
        };
        event.currentTarget.dataset.held = "true";
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
        if (event.pointerType === "mouse")
          event.currentTarget.focus({ preventScroll: true });
        start();
      },
      move(event) {
        if (!drag || drag.releasedAt !== null || drag.pointer !== event.pointerId) return;
        const point = local(event);
        drag.moved ||=
          Math.hypot(point.x - drag.startX, point.y - drag.startY) > 5;
        drag.grip.target = point;
        event.preventDefault();
        start();
      },
      release,
    };
    controllerRef.current = controller;
    const cancelGrip = () => release(undefined, true);
    window.addEventListener("blur", cancelGrip);
    let fontsReady = false;
    let measureFrame = 0;
    const scheduleRebuild = () => {
      cancelAnimationFrame(measureFrame);
      measureFrame = requestAnimationFrame(() => {
        measureFrame = 0;
        if (!cancelled) rebuild();
      });
    };
    const measureLoadedFonts = () => {
      document.fonts.ready.then(() => {
        if (cancelled) return;
        fontsReady = true;
        scheduleRebuild();
      });
    };
    const resize = new ResizeObserver(() => {
      if (fontsReady && world.clientWidth > 0 && world.clientWidth !== width)
        scheduleRebuild();
    });
    resize.observe(world);
    document.fonts.addEventListener("loadingdone", measureLoadedFonts);
    measureLoadedFonts();
    return () => {
      cancelled = true;
      enabled = false;
      release(undefined, true);
      stop();
      resize.disconnect();
      window.removeEventListener("blur", cancelGrip);
      cancelAnimationFrame(measureFrame);
      document.fonts.removeEventListener("loadingdone", measureLoadedFonts);
      if (controllerRef.current === controller) controllerRef.current = null;
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      world.classList.remove("is-live");
      world.style.height = "";
      if (viewportRef.current) viewportRef.current.style.height = "";
      delete world.dataset.bodies;
      delete world.dataset.running;
      clearElementStyles();
    };
  }, [matter, reducedMotion]);

  function focusPill(index: number) {
    setSelected(index);
    controllerRef.current?.reveal(index);
    if (focusFrameRef.current !== null)
      cancelAnimationFrame(focusFrameRef.current);
    focusFrameRef.current = requestAnimationFrame(() => {
      focusFrameRef.current = null;
      const pill = pillRefs.current[index];
      if (pill && !pill.closest('[hidden], [inert], [aria-hidden="true"]'))
        pill.focus({ preventScroll: false });
    });
  }
  function pillKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Escape") {
      setGrabbed(null);
      controllerRef.current?.release(undefined, true);
      return;
    }
    if (event.key === "PageDown" || event.key === "PageUp") {
      event.preventDefault();
      focusPill(
        (index + (event.key === "PageDown" ? 1 : skills.length - 1)) %
          skills.length,
      );
      return;
    }
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    event.preventDefault();
    if (ready && !still)
      controllerRef.current?.nudge(index, event.key, event.shiftKey);
    else
      focusPill(
        (index +
          (["ArrowLeft", "ArrowUp"].includes(event.key)
            ? skills.length - 1
            : 1)) %
          skills.length,
      );
  }
  function pointerDown(event: PillPointer, index: number) {
    if (!ready || still) return;
    setSelected(index);
    controllerRef.current?.grab(index, event);
  }
  function pointerMove(event: PillPointer) {
    controllerRef.current?.move(event);
  }
  function pointerUp(event: PillPointer, cancelled = false) {
    if (controllerRef.current?.release(event, cancelled)) {
      suppressClickRef.current = performance.now() + 250;
      setGrabbed(null);
    }
    if (cancelled) setGrabbed(null);
  }
  return (
    <section
      className="skill-physics skill-atelier"
      id={id}
      ref={rootRef}
      data-ready={ready && !still}
      aria-labelledby={`${prefix}-title`}
      aria-describedby={`${prefix}-instructions`}
    >
      <h3 className="sr-only" id={`${prefix}-title`}>
        Skills board
      </h3>
      <p className="sr-only" id={`${prefix}-instructions`}>
        {skills.length} skills across {skillGroups.length} categories.{" "}
        {still
          ? "A settled view of every skill. Use arrow keys to browse."
          : "Drag a label to move it and bump the pile. Scroll empty space in the board to reach every label. Search above to highlight matching skills."}
      </p>
      <div className="skill-physics-toolbar">
        {status}
        <div className="skill-physics-actions">
          <button
            type="button"
            disabled={!ready || still}
            onClick={() => {
              setGrabbed(null);
              controllerRef.current?.replay();
              setAnnouncement("Dropping the skills again.");
            }}
          >
            <RotateCcw size={14} aria-hidden="true" />
            Drop again
          </button>
        </div>
      </div>
      <div
        className="skill-physics-viewport"
        ref={viewportRef}
        tabIndex={0}
        role="region"
        aria-label="Scroll through the skills board"
      >
        <div
          className="skill-physics-world"
          ref={worldRef}
          role="group"
          aria-label={`All ${skills.length} skill labels`}
          aria-describedby={`${prefix}-keyboard`}
        >
          {skills.map((skill, index) => (
            <button
              className="skill-pill"
              type="button"
              key={skill.id}
              ref={(element) => {
                pillRefs.current[index] = element;
              }}
              data-tone={skill.categoryIndex}
              data-shape={tileForm(index)}
              data-size={
                skill.itemIndex < 2
                  ? "large"
                  : (skill.itemIndex + skill.categoryIndex) % 3 === 0
                    ? "medium"
                    : "small"
              }
              data-long={skill.label.length > 18}
              data-lit={matchingIndices.has(index)}
              data-filtering={filtering}
              data-selected={selected === index}
              data-grabbed={grabbed === index}
              aria-label={`${skill.label} · ${skill.category}${filtering ? (matchingIndices.has(index) ? " · highlighted" : " · outside current highlight") : ""}`}
              aria-pressed={grabbed === index}
              aria-describedby={`${prefix}-keyboard`}
              tabIndex={selected === index ? 0 : -1}
              onFocus={() => {
                setSelected(index);
                controllerRef.current?.reveal(index);
              }}
              onClick={() => {
                if (performance.now() < suppressClickRef.current) return;
                setSelected(index);
                if (still) {
                  setGrabbed(null);
                  setAnnouncement(`${skill.label}, ${skill.category}.`);
                  return;
                }
                setGrabbed((current) => (current === index ? null : index));
                setAnnouncement(
                  `${skill.label}${grabbed === index ? " released." : " selected. Drag to move, or use arrow keys."}`,
                );
              }}
              onKeyDown={(event) => pillKeys(event, index)}
              onPointerDown={(event) => pointerDown(event, index)}
              onPointerMove={pointerMove}
              onPointerUp={(event) => pointerUp(event)}
              onPointerCancel={(event) => pointerUp(event, true)}
              onLostPointerCapture={(event) => pointerUp(event, true)}
            >
              <svg className="skill-silhouette" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path d={skillTilePaths[tileForm(index)]} vectorEffect="non-scaling-stroke" />
              </svg>
              <span>{skill.label}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="sr-only" id={`${prefix}-keyboard`}>
        {still
          ? "Arrow keys browse skills. Page Up / Page Down choose the previous or next label."
          : "Tab into the board. Arrow keys move a skill; Shift moves it further. Page Up / Page Down switch skills. Esc releases."}
      </p>
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </section>
  );
}
