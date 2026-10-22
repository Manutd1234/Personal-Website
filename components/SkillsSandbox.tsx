"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import type {
  Body as PhysicsBody,
  Constraint as PhysicsConstraint,
} from "matter-js";
import { ArrowDown, ChevronDown, Hand, List, RotateCcw } from "lucide-react";
import { skillGroups } from "@/content/portfolio";
import { useMotionPreference } from "./useMotionPreference";
import {
  containSkillBody,
  createSkillBody,
  createSkillWalls,
} from "./skill-physics";
import "@/app/skills-blocks.css";

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
const STEP = 1000 / 60;
const DROP_INTERVAL = 70;
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
    const { Body, Composite, Constraint, Engine, Sleeping } = matter;
    const engine = Engine.create({
      enableSleeping: true,
      positionIterations: 8,
      velocityIterations: 6,
      constraintIterations: 3,
    });
    engine.gravity.y = 0.48;
    let bodies: PhysicsBody[] = [];
    let sizes: { width: number; height: number }[] = [];
    let homes: { x: number; y: number }[] = [];
    let spawned: boolean[] = [];
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
      if (spawned[index] || !bodies[index]) return;
      const body = bodies[index];
      const x =
        sizes[index].width / 2 +
        10 +
        ((index * 0.61803398875) % 1) *
          Math.max(0, width - sizes[index].width - 20);
      Body.setPosition(
        body,
        atHome ? homes[index] : { x, y: sizes[index].height / 2 + 11 },
      );
      Body.setAngle(body, atHome ? 0 : ((index % 7) - 3) * 0.055);
      Body.setAngularVelocity(body, atHome ? 0 : ((index % 5) - 2) * 0.008);
      Body.setVelocity(body, { x: atHome ? 0 : ((index % 3) - 1) * 0.7, y: 0 });
      Composite.add(engine.world, body);
      spawned[index] = true;
      elements[index].style.opacity = "1";
      contain(body);
    }
    function tick(time: number) {
      frame = 0;
      if (!enabled || cancelled) return;
      const delta = previous ? Math.min(50, time - previous) : STEP;
      previous = time;
      elapsed += delta;
      accumulator += delta;
      bodies.forEach((_, index) => {
        if (!spawned[index] && elapsed >= index * DROP_INTERVAL) spawn(index);
      });
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
      Composite.remove(engine.world, current.constraint);
      if (!cancel && current.moved && performance.now() - current.time < 100) {
        Body.setVelocity(current.body, {
          x: clamp(current.velocityX, -18, 18),
          y: clamp(current.velocityY, -18, 18),
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
      sizes = elements.map((element) => ({
        width: element.offsetWidth,
        height: element.offsetHeight,
      }));
      const area = sizes.reduce(
        (total, size) => total + size.width * size.height,
        0,
      );
      height = Math.ceil(
        Math.max(
          world!.clientHeight + 45,
          area / Math.max(1, (width - 28) * 0.62) + 90,
        ),
      );
      world!.style.height = `${height}px`;
      homes = elements.map((element, index) => ({
        x: element.offsetLeft + sizes[index].width / 2,
        y: element.offsetTop + sizes[index].height / 2,
      }));
      Composite.add(engine.world, createSkillWalls(matter!, width, height));
      bodies = sizes.map((size, index) =>
        createSkillBody(matter!, size, homes[index]),
      );
      spawned = bodies.map(() => false);
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
        elapsed = bodies.length * DROP_INTERVAL;
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
          stiffness: 0.45,
          damping: 0.18,
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
        drag.velocityX = ((point.x - drag.x) / delta) * STEP;
        drag.velocityY = ((point.y - drag.y) / delta) * STEP;
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
    const resize = new ResizeObserver(() => {
      if (world.clientWidth > 0 && world.clientWidth !== width) rebuild();
    });
    resize.observe(world);
    document.fonts.ready.then(() => {
      if (!cancelled) rebuild();
    });
    return () => {
      cancelled = true;
      enabled = false;
      release(undefined, true);
      stop();
      resize.disconnect();
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
  const selectedSkill = skills[selected];
  const matchAfter =
    matching.find(({ index }) => index > selected) ?? matching[0];

  return (
    <section
      className="skill-physics"
      id={id}
      ref={rootRef}
      data-ready={ready && !still}
      aria-labelledby={`${prefix}-title`}
    >
      <header className="skill-physics-heading">
        <div>
          <p>A few tools, plenty of ways to build</p>
          <h3 id={`${prefix}-title`}>The skill sandbox.</h3>
        </div>
        <span>
          {skills.length} skills · {skillGroups.length} categories
        </span>
      </header>
      <p className="skill-physics-help" id={`${prefix}-instructions`}>
        {still
          ? "A settled view of every skill. Use the picker or arrow keys to browse, or open the full list below."
          : "Let them fall. Drag and fling a pill, or tap to grab it before dragging on touch. The filters above light up matches."}
      </p>
      <div className="skill-physics-toolbar">
        <button
          type="button"
          disabled={!ready || still}
          onClick={() => {
            setGrabbed(null);
            controllerRef.current?.replay();
            setAnnouncement("All skills dropped again.");
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
            setAnnouncement("All skills arranged neatly.");
          }}
        >
          <List size={15} aria-hidden="true" />
          Arrange neatly
        </button>
        {filtering ? (
          <button
            type="button"
            disabled={!matchAfter}
            onClick={() => {
              if (matchAfter) focusPill(matchAfter.index);
            }}
          >
            Find a highlighted skill <ArrowDown size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div className="skill-physics-picker">
        <label htmlFor={`${prefix}-picker`}>Choose a pill</label>
        <select
          id={`${prefix}-picker`}
          value={selected}
          onChange={(event) => {
            const next = Number(event.target.value);
            setSelected(next);
            setGrabbed(null);
            controllerRef.current?.reveal(next);
          }}
        >
          {skillGroups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {skills.flatMap((skill, index) =>
                skill.category === group.label
                  ? [
                      <option key={skill.id} value={index}>
                        {skill.label}
                      </option>,
                    ]
                  : [],
              )}
            </optgroup>
          ))}
        </select>
        <button type="button" onClick={() => focusPill(selected)}>
          <Hand size={14} aria-hidden="true" />
          Focus pill
        </button>
      </div>
      <div
        className="skill-physics-world"
        ref={worldRef}
        role="group"
        aria-label={`All ${skills.length} skill pills`}
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
            {skill.label}
          </button>
        ))}
      </div>
      <p className="skill-physics-keyboard" id={`${prefix}-keyboard`}>
        {still
          ? "Arrow keys browse skills. Page Up / Page Down choose the previous or next pill."
          : "Keyboard: choose a pill, then use arrow keys to move it; Shift moves further. Page Up / Page Down switch pills. Esc releases."}
      </p>
      <p className="skill-physics-selection">
        <strong>{selectedSkill.label}</strong>
        <span>{selectedSkill.category}</span>
      </p>
      <details className="skill-physics-list">
        <summary>
          Read all {skills.length} skills{" "}
          <ChevronDown size={17} aria-hidden="true" />
        </summary>
        <div>
          {skillGroups.map((group, groupIndex) => (
            <section key={group.label} data-tone={groupIndex}>
              <h4>{group.label}</h4>
              <ul>
                {group.items.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </details>
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </section>
  );
}
