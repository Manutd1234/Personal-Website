"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import type {
  Body as PhysicsBody,
  Constraint as PhysicsConstraint,
} from "matter-js";
import { ArrowDown, List, RotateCcw } from "lucide-react";
import { skillGroups } from "@/content/portfolio";
import { useMotionPreference } from "./useMotionPreference";
import { containSkillBody, createSkillWalls } from "./skill-physics";
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
const tileForms = ["capsule", "card", "tag", "lozenge"] as const;
const tileForm = (index: number) => tileForms[(index * 7 + Math.floor(index / 5)) % tileForms.length];
const STEP = 1000 / 60;
const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));
type PillPointer = PointerEvent<HTMLButtonElement>;
type Controller = {
  availability: (available: boolean) => void;
  replay: () => void;
  arrange: () => void;
  reveal: (index: number) => void;
  nudge: (index: number, key: string, large: boolean) => void;
  grab: (index: number, event: PillPointer) => void;
  move: (event: PillPointer) => void;
  release: (event?: PillPointer, cancelled?: boolean) => boolean;
};

export default function SkillsSandbox({
  category = "all",
  search = "",
  id,
  active = true,
}: {
  category?: string;
  search?: string;
  id?: string;
  active?: boolean;
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
  const pendingTouchRef = useRef<{
    pointer: number;
    index: number;
    x: number;
    y: number;
  } | null>(null);
  const suppressClickRef = useRef(0);
  const focusFrameRef = useRef<number | null>(null);
  const prefix = useId();
  const reducedMotion = useMotionPreference();
  availableRef.current = active && available && !reducedMotion;
  const query = search.trim().toLocaleLowerCase();
  const filtering = category !== "all" || Boolean(query);
  const matching = skills
    .map((skill, index) => ({ skill, index }))
    .filter(
      ({ skill }) =>
        (category === "all" || category === skill.category) &&
        (!query ||
          skill.label.toLocaleLowerCase().includes(query) ||
          skill.category.toLocaleLowerCase().includes(query)),
    );
  const matchingIndices = new Set(matching.map(({ index }) => index));
  const still = reducedMotion || loadFailed;

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
      pendingTouchRef.current = null;
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
    const { Bodies, Body, Composite, Constraint, Engine, Sleeping } = matter;
    const engine = Engine.create({
      enableSleeping: true,
      positionIterations: 8,
      velocityIterations: 6,
      constraintIterations: 3,
    });
    engine.gravity.y = 0.46;
    let bodies: PhysicsBody[] = [];
    let sizes: { width: number; height: number }[] = [];
    let homes: { x: number; y: number }[] = [];
    let spawned: boolean[] = [];
    let dropOrder: number[] = [];
    let nextDrop = 0;
    let nextDropAt = 0;
    let handfulRemaining = 0;
    let releaseX = 0;
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
      index: number;
      body: PhysicsBody;
      constraint: PhysicsConstraint;
      element: HTMLButtonElement;
      startX: number;
      startY: number;
      x: number;
      y: number;
      time: number;
      velocityX: number;
      velocityY: number;
      moved: boolean;
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
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    }
    function contain(body: PhysicsBody) {
      containSkillBody(matter!, body, width, height);
    }
    function draw() {
      bodies.forEach((body, index) => {
        if (!spawned[index]) return;
        elements[index].style.transform =
          `translate3d(${body.position.x - sizes[index].width / 2}px, ${body.position.y - sizes[index].height / 2}px, 0) rotate(${body.angle}rad)`;
      });
    }
    function spawn(index: number, atHome = false) {
      if (spawned[index] || !bodies[index]) return true;
      const body = bodies[index];
      if (atHome) {
        Body.setPosition(body, homes[index]);
        Body.setAngle(body, 0);
      } else {
        const size = sizes[index];
        // A little tilt keeps the pile playful without turning labels sideways.
        const angle = (Math.random() - 0.5) * 0.32;
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
        x: atHome ? 0 : (Math.random() - 0.5) * 0.9,
        y: 0,
      });
      Composite.add(engine.world, body);
      spawned[index] = true;
      elements[index].style.opacity = "1";
      contain(body);
      return true;
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
        nextDropAt = elapsed + 40;
        return;
      }
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
      while (accumulator >= STEP) {
        Engine.update(engine, STEP);
        bodies.forEach((body, index) => {
          if (spawned[index]) contain(body);
        });
        accumulator -= STEP;
      }
      draw();
      if (
        drag ||
        spawned.some((value) => !value) ||
        bodies.some((body, index) => spawned[index] && !body.isSleeping)
      ) {
        frame = requestAnimationFrame(tick);
      } else stop();
    }
    function start() {
      if (!enabled || frame || !bodies.length || cancelled) return;
      world!.dataset.running = "true";
      frame = requestAnimationFrame(tick);
    }
    function release(event?: PillPointer, cancel = false) {
      if (!drag || (event && drag.pointer !== event.pointerId)) return false;
      const current = drag;
      drag = null;
      delete current.element.dataset.held;
      Composite.remove(engine.world, current.constraint);
      if (!cancel && current.moved && performance.now() - current.time < 100) {
        Body.setVelocity(current.body, {
          x: clamp(current.velocityX, -12, 12),
          y: clamp(current.velocityY, -12, 12),
        });
      }
      if (current.element.hasPointerCapture(current.pointer))
        current.element.releasePointerCapture(current.pointer);
      start();
      return current.moved;
    }
    function clearElementStyles() {
      elements.forEach((element) => {
        element.style.width = "";
        element.style.height = "";
        element.style.transform = "";
        element.style.opacity = "";
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
      clearElementStyles();
      width = nextWidth;
      // Natural flex widths are fractional. Rounding offsetWidth down and then
      // freezing height can wrap the text onto an extra line in the live world.
      // Fix widths first, then measure their final wrapped heights.
      const maxTileWidth = Math.max(1, width - 24);
      const tileWidths = elements.map((element) =>
        Math.min(maxTileWidth, Math.ceil(element.getBoundingClientRect().width) + 2),
      );
      elements.forEach((element, index) => {
        element.style.width = `${tileWidths[index]}px`;
      });
      sizes = elements.map((element, index) => ({
        width: tileWidths[index],
        height: Math.ceil(element.getBoundingClientRect().height),
      }));
      elements.forEach((element, index) => {
        element.style.height = `${sizes[index].height}px`;
      });
      const area = sizes.reduce(
        (total, size) => total + size.width * size.height,
        0,
      );
      // The visible frame stays compact. Only its inner world grows when
      // all measured labels need more space, so every label stays reachable.
      height = Math.ceil(
        Math.max(
          viewportRef.current?.clientHeight ?? 500,
          world!.scrollHeight,
          area / Math.max(1, (width - 24) * 0.72) + 28,
        ),
      );
      world!.style.height = `${height}px`;
      homes = elements.map((element, index) => ({
        x: element.offsetLeft + sizes[index].width / 2,
        y: element.offsetTop + sizes[index].height / 2,
      }));
      Composite.add(engine.world, createSkillWalls(matter!, width, height));
      bodies = sizes.map((size, index) => {
        const curve = Math.max(4, size.height / 2 - 1);
        const form = tileForm(index);
        const cornerRadius = form === "capsule"
          ? curve
          : form === "tag"
            ? [curve, 5, 5, curve]
            : form === "lozenge"
              ? [5, 12, 5, 12]
              : 6;
        return Bodies.rectangle(
          homes[index].x,
          homes[index].y,
          size.width,
          size.height,
          {
            chamfer: { radius: cornerRadius },
            // Free translation and gentle collisions; stable text orientation.
            inertia: Infinity,
            density: 0.0011 + (index % 5) * 0.00008,
            restitution: 0.06,
            friction: 0.52 + (index % 4) * 0.035,
            frictionStatic: 0.82,
            frictionAir: 0.018 + (index % 5) * 0.002,
            sleepThreshold: 70,
          },
        );
      });
      spawned = bodies.map(() => false);
      dropOrder = bodies.map((_, index) => index);
      for (let index = dropOrder.length - 1; index > 1; index -= 1) {
        const other = 1 + Math.floor(Math.random() * index);
        [dropOrder[index], dropOrder[other]] = [
          dropOrder[other],
          dropOrder[index],
        ];
      }
      nextDrop = 0;
      nextDropAt = 120;
      handfulRemaining = 3 + Math.floor(Math.random() * 3);
      releaseX = width * (0.25 + Math.random() * 0.5);
      elapsed = 0;
      replayPendingRef.current = false;
      elements.forEach((element, index) => {
        element.style.width = `${sizes[index].width}px`;
        element.style.height = `${sizes[index].height}px`;
        element.style.opacity = "0";
      });
      world!.classList.add("is-live");
      world!.dataset.bodies = String(bodies.length);
      setReady(true);
      start();
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
      arrange() {
        release(undefined, true);
        stop();
        bodies.forEach((body, index) => {
          spawn(index, true);
          Body.setPosition(body, homes[index]);
          Body.setAngle(body, 0);
          Body.setVelocity(body, { x: 0, y: 0 });
          Body.setAngularVelocity(body, 0);
          Sleeping.set(body, true);
        });
        nextDrop = dropOrder.length;
        nextDropAt = Infinity;
        draw();
      },
      reveal(index) {
        spawn(index, true);
        draw();
        start();
      },
      nudge(index, key, large) {
        const body = bodies[index];
        if (!body || !enabled) return;
        spawn(index, true);
        Sleeping.set(body, false);
        const distance = large ? 30 : 12;
        Body.translate(body, {
          x:
            key === "ArrowLeft"
              ? -distance
              : key === "ArrowRight"
                ? distance
                : 0,
          y: key === "ArrowUp" ? -distance : key === "ArrowDown" ? distance : 0,
        });
        Body.setVelocity(body, { x: 0, y: 0 });
        contain(body);
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
        spawn(index, true);
        Sleeping.set(body, false);
        const point = local(event),
          dx = point.x - body.position.x,
          dy = point.y - body.position.y;
        const cosine = Math.cos(-body.angle),
          sine = Math.sin(-body.angle);
        const constraint = Constraint.create({
          pointA: point,
          bodyB: body,
          pointB: { x: dx * cosine - dy * sine, y: dx * sine + dy * cosine },
          stiffness: 0.28,
          damping: 0.22,
          length: 0,
        });
        Composite.add(engine.world, constraint);
        drag = {
          pointer: event.pointerId,
          index,
          body,
          constraint,
          element: event.currentTarget,
          startX: point.x,
          startY: point.y,
          x: point.x,
          y: point.y,
          time: performance.now(),
          velocityX: 0,
          velocityY: 0,
          moved: false,
        };
        event.currentTarget.dataset.held = "true";
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
        if (event.pointerType === "mouse")
          event.currentTarget.focus({ preventScroll: true });
        start();
      },
      move(event) {
        if (!drag || drag.pointer !== event.pointerId) return;
        const point = local(event),
          now = performance.now(),
          delta = Math.max(8, now - drag.time);
        drag.velocityX =
          drag.velocityX * 0.4 + ((point.x - drag.x) / delta) * STEP * 0.6;
        drag.velocityY =
          drag.velocityY * 0.4 + ((point.y - drag.y) / delta) * STEP * 0.6;
        drag.moved ||=
          Math.hypot(point.x - drag.startX, point.y - drag.startY) > 5;
        drag.x = point.x;
        drag.y = point.y;
        drag.time = now;
        drag.constraint.pointA = {
          x: clamp(point.x, 8, width - 8),
          y: clamp(point.y, 8, height - 8),
        };
        event.preventDefault();
        start();
      },
      release,
    };
    controllerRef.current = controller;
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
      cancelAnimationFrame(measureFrame);
      document.fonts.removeEventListener("loadingdone", measureLoadedFonts);
      if (controllerRef.current === controller) controllerRef.current = null;
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      world.classList.remove("is-live");
      world.style.height = "";
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
      pendingTouchRef.current = null;
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
    if (event.pointerType === "mouse" || grabbed === index) {
      setSelected(index);
      controllerRef.current?.grab(index, event);
    } else
      pendingTouchRef.current = {
        pointer: event.pointerId,
        index,
        x: event.clientX,
        y: event.clientY,
      };
  }
  function pointerMove(event: PillPointer) {
    const pending = pendingTouchRef.current;
    if (pending?.pointer === event.pointerId) {
      const dx = Math.abs(event.clientX - pending.x),
        dy = Math.abs(event.clientY - pending.y);
      if (dy > 8 && dy > dx) pendingTouchRef.current = null;
      else if (dx > 8 && dx > dy * 1.2) {
        pendingTouchRef.current = null;
        setSelected(pending.index);
        setGrabbed(pending.index);
        controllerRef.current?.grab(pending.index, event);
      }
    }
    controllerRef.current?.move(event);
  }
  function pointerUp(event: PillPointer, cancelled = false) {
    pendingTouchRef.current = null;
    if (controllerRef.current?.release(event, cancelled)) {
      suppressClickRef.current = performance.now() + 250;
      setGrabbed(null);
    }
    if (cancelled) setGrabbed(null);
  }
  const matchAfter =
    matching.find(({ index }) => index > selected) ?? matching[0];

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
          : "Drag and release a label, or tap to pick it up before dragging on touch. Scroll inside the board to reach every label. The filters above highlight matching skills."}
      </p>
      <div className="skill-physics-toolbar">
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
        <button
          type="button"
          disabled={!ready || still}
          onClick={() => {
            setGrabbed(null);
            controllerRef.current?.arrange();
            setAnnouncement("All skills arranged in rows.");
          }}
        >
          <List size={15} aria-hidden="true" />
          Lay them out
        </button>
        {filtering ? (
          <button
            type="button"
            disabled={!matchAfter}
            onClick={() => {
              if (matchAfter) focusPill(matchAfter.index);
            }}
          >
            Next match <ArrowDown size={14} aria-hidden="true" />
          </button>
        ) : null}
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
              <span>{skill.label}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="sr-only" id={`${prefix}-keyboard`}>
        {still
          ? "Arrow keys browse skills. Page Up / Page Down choose the previous or next label."
          : "Tab into the board. Arrow keys move a skill; Shift moves it further. Page Up / Page Down switch skills. Esc releases. Use Lay them out for a neatly arranged view."}
      </p>
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </section>
  );
}
