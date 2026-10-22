"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type {
  Body as PhysicsBody,
  Constraint as PhysicsConstraint,
} from "matter-js";

const SKILLS = [
  "C++",
  "Python",
  "Next.js",
  "FastAPI",
  "Docker",
  "PyTorch",
  "PostgreSQL",
  "Unity",
  "Spring Boot",
] as const;
const TAG_COLORS = [
  "border-emerald-600 bg-emerald-600 text-white",
  "border-zinc-200 bg-white text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100",
  "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
] as const;
const STEP = 1000 / 60;
const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

type TagPointer = ReactPointerEvent<HTMLButtonElement>;
type SandboxController = {
  reset: () => void;
  grab: (index: number, event: TagPointer) => void;
  move: (event: TagPointer) => void;
  release: (event: TagPointer, cancelled?: boolean) => void;
  nudge: (index: number, key: string) => void;
};

export default function SkillsSandbox() {
  const stageRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<Array<HTMLElement | null>>([]);
  const controllerRef = useRef<SandboxController | null>(null);
  const instructionsId = useId();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const staticMode = reducedMotion !== false || loadFailed;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion !== false || loadFailed) return undefined;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    setReady(false);

    async function initialize() {
      // Matter never runs on the server or for the reduced-motion fallback.
      const imported = await import("matter-js");
      await document.fonts.ready;
      if (cancelled) return;
      const Matter = imported.default ?? imported;
      const { Bodies, Body, Composite, Constraint, Engine, Sleeping } = Matter;
      const stage = stageRef.current;
      if (!stage) return;
      const elements = tagsRef.current.filter(
        (element): element is HTMLButtonElement =>
          element instanceof HTMLButtonElement,
      );
      if (elements.length !== SKILLS.length) return;

      const engine = Engine.create({
        enableSleeping: true,
        positionIterations: 8,
        constraintIterations: 3,
      });
      engine.gravity.y = 0.65;
      let bodies: PhysicsBody[] = [];
      let dimensions: Array<{ width: number; height: number }> = [];
      let width = 0;
      let height = 0;
      let frame = 0;
      let lastFrame = 0;
      let accumulator = 0;
      let onScreen = false;
      let available = false;
      let drag: {
        pointerId: number;
        element: HTMLButtonElement;
        body: PhysicsBody;
        constraint: PhysicsConstraint;
        x: number;
        y: number;
        time: number;
        velocity: { x: number; y: number };
      } | null = null;

      function draw() {
        for (let index = 0; index < bodies.length; index += 1) {
          const body = bodies[index];
          const size = dimensions[index];
          elements[index].style.transform =
            `translate3d(${body.position.x - size.width / 2}px, ${body.position.y - size.height / 2}px, 0) rotate(${body.angle}rad)`;
        }
      }

      function containBodies() {
        for (const body of bodies) {
          const shiftX =
            body.bounds.min.x < 10
              ? 10 - body.bounds.min.x
              : body.bounds.max.x > width - 10
                ? width - 10 - body.bounds.max.x
                : 0;
          const shiftY =
            body.bounds.min.y < 76
              ? 76 - body.bounds.min.y
              : body.bounds.max.y > height - 10
                ? height - 10 - body.bounds.max.y
                : 0;
          if (shiftX || shiftY) {
            Body.translate(body, { x: shiftX, y: shiftY });
            Body.setVelocity(body, {
              x: shiftX ? body.velocity.x * -0.25 : body.velocity.x,
              y: shiftY ? body.velocity.y * -0.25 : body.velocity.y,
            });
          }
        }
      }

      function stop() {
        cancelAnimationFrame(frame);
        frame = 0;
        lastFrame = 0;
        accumulator = 0;
      }

      function tick(time: number) {
        frame = 0;
        if (!available) return;
        accumulator += lastFrame ? Math.min(time - lastFrame, STEP * 3) : STEP;
        lastFrame = time;
        while (accumulator >= STEP) {
          Engine.update(engine, STEP);
          containBodies();
          accumulator -= STEP;
        }
        draw();
        if (drag || bodies.some((body) => !body.isSleeping))
          frame = requestAnimationFrame(tick);
        else lastFrame = 0;
      }

      function start() {
        if (available && !frame) frame = requestAnimationFrame(tick);
      }

      function endDrag(cancelDrag: boolean, time = 0) {
        if (!drag) return;
        const current = drag;
        drag = null;
        Composite.remove(engine.world, current.constraint);
        current.element.style.cursor = "";
        if (current.element.hasPointerCapture(current.pointerId))
          current.element.releasePointerCapture(current.pointerId);
        if (!cancelDrag) {
          const recent = time - current.time < 100;
          Body.setVelocity(
            current.body,
            recent ? current.velocity : { x: 0, y: 0 },
          );
        }
        start();
      }

      function updateAvailability() {
        available =
          onScreen &&
          document.visibilityState === "visible" &&
          !stage!.closest('[hidden], [aria-hidden="true"], [inert]');
        if (available) start();
        else {
          endDrag(true);
          stop();
        }
      }

      function rebuild() {
        const nextWidth = stage!.clientWidth;
        const nextHeight = stage!.clientHeight;
        if (!nextWidth || !nextHeight) return;
        endDrag(true);
        stop();
        width = nextWidth;
        height = nextHeight;
        Composite.clear(engine.world, false);
        Engine.clear(engine);
        // Measure the same bottom-aligned layout used by the static fallback.
        for (const element of elements) {
          element.style.position = "";
          element.style.left = "";
          element.style.top = "";
          element.style.width = "";
          element.style.height = "";
          element.style.transform = "";
        }
        const placements = elements.map((element) => ({
          x: element.offsetLeft,
          y: element.offsetTop,
          width: element.offsetWidth,
          height: element.offsetHeight,
        }));
        dimensions = placements.map(
          ({ width: tagWidth, height: tagHeight }) => ({
            width: tagWidth,
            height: tagHeight,
          }),
        );
        const thickness = 80;
        const walls = [
          Bodies.rectangle(
            width / 2,
            height + thickness / 2 - 10,
            width + thickness * 2,
            thickness,
            { isStatic: true },
          ),
          Bodies.rectangle(
            width / 2,
            76 - thickness / 2,
            width + thickness * 2,
            thickness,
            { isStatic: true },
          ),
          Bodies.rectangle(
            10 - thickness / 2,
            height / 2,
            thickness,
            height * 2,
            { isStatic: true },
          ),
          Bodies.rectangle(
            width + thickness / 2 - 10,
            height / 2,
            thickness,
            height * 2,
            { isStatic: true },
          ),
        ];
        bodies = placements.map((placement, index) => {
          const body = Bodies.rectangle(
            placement.x + placement.width / 2,
            placement.y + placement.height / 2,
            placement.width,
            placement.height,
            {
              label: SKILLS[index],
              restitution: 0.2,
              friction: 0.55,
              frictionAir: 0.025,
              sleepThreshold: 35,
              chamfer: { radius: 12 },
            },
          );
          Sleeping.set(body, true);
          const element = elements[index];
          element.style.position = "absolute";
          element.style.left = "0";
          element.style.top = "0";
          element.style.width = `${placement.width}px`;
          element.style.height = `${placement.height}px`;
          return body;
        });
        Composite.add(engine.world, [...walls, ...bodies]);
        draw();
        setReady(true);
        updateAvailability();
      }

      function pointFor(event: TagPointer) {
        const bounds = stage!.getBoundingClientRect();
        return {
          x: clamp(event.clientX - bounds.left, 10, width - 10),
          y: clamp(event.clientY - bounds.top, 76, height - 10),
        };
      }

      function wakeAll() {
        for (const body of bodies) Sleeping.set(body, false);
      }

      controllerRef.current = {
        reset: rebuild,
        grab(index, event) {
          if (drag || !available || event.button !== 0 || !event.isPrimary)
            return;
          event.preventDefault();
          const body = bodies[index];
          if (!body) return;
          const point = pointFor(event);
          wakeAll();
          const constraint = Constraint.create({
            pointA: point,
            bodyB: body,
            pointB: {
              x: point.x - body.position.x,
              y: point.y - body.position.y,
            },
            length: 0,
            stiffness: 0.22,
            damping: 0.16,
          });
          Composite.add(engine.world, constraint);
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.style.cursor = "grabbing";
          drag = {
            pointerId: event.pointerId,
            element: event.currentTarget,
            body,
            constraint,
            x: point.x,
            y: point.y,
            time: event.timeStamp,
            velocity: { x: 0, y: 0 },
          };
          start();
        },
        move(event) {
          if (!drag || event.pointerId !== drag.pointerId) return;
          const point = pointFor(event);
          const elapsed = Math.max(8, event.timeStamp - drag.time);
          drag.velocity.x = clamp(
            ((point.x - drag.x) / elapsed) * STEP,
            -14,
            14,
          );
          drag.velocity.y = clamp(
            ((point.y - drag.y) / elapsed) * STEP,
            -14,
            14,
          );
          drag.x = point.x;
          drag.y = point.y;
          drag.time = event.timeStamp;
          drag.constraint.pointA = point;
          start();
        },
        release(event, cancelDrag = false) {
          if (event.pointerId === drag?.pointerId)
            endDrag(cancelDrag, event.timeStamp);
        },
        nudge(index, key) {
          if (key === "r" || key === "R" || key === "Home") {
            rebuild();
            return;
          }
          const body = bodies[index];
          if (!body) return;
          wakeAll();
          Body.setVelocity(body, {
            x:
              key === "ArrowLeft"
                ? -5
                : key === "ArrowRight"
                  ? 5
                  : body.velocity.x,
            y:
              key === "ArrowUp"
                ? -7
                : key === "ArrowDown"
                  ? 5
                  : body.velocity.y,
          });
          start();
        },
      };

      const resize = new ResizeObserver(() => {
        if (stage.clientWidth !== width || stage.clientHeight !== height)
          rebuild();
      });
      const intersection = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        updateAvailability();
      });
      const mutations = new MutationObserver(updateAvailability);
      for (
        let ancestor: HTMLElement | null = stage;
        ancestor;
        ancestor = ancestor.parentElement
      ) {
        mutations.observe(ancestor, {
          attributes: true,
          attributeFilter: ["hidden", "aria-hidden", "inert"],
        });
      }
      resize.observe(stage);
      intersection.observe(stage);
      document.addEventListener("visibilitychange", updateAvailability);
      rebuild();

      dispose = () => {
        available = false;
        endDrag(true);
        stop();
        resize.disconnect();
        intersection.disconnect();
        mutations.disconnect();
        document.removeEventListener("visibilitychange", updateAvailability);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
        controllerRef.current = null;
        for (const element of elements) element.removeAttribute("style");
      };
    }

    initialize().catch(() => {
      if (!cancelled) setLoadFailed(true);
    });
    return () => {
      cancelled = true;
      dispose?.();
      controllerRef.current = null;
    };
  }, [reducedMotion, loadFailed]);

  return (
    <div
      aria-label="Interactive skills playground"
      className="relative h-[280px] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
      role="group"
    >
      <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            drag these around ✋
          </p>
          <p
            className="mt-1 max-w-[210px] text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400"
            id={instructionsId}
          >
            {reducedMotion === true || loadFailed
              ? "A still view of a few tools I use."
              : "Drag or flick a tag. Arrow keys nudge; R resets."}
          </p>
        </div>
        <button
          className="pointer-events-auto inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 outline-offset-4 hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-default disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
          disabled={staticMode || !ready}
          onClick={() => controllerRef.current?.reset()}
          type="button"
        >
          <span aria-hidden="true">↻</span> Reset
        </button>
      </div>
      <div
        className="absolute inset-0 flex flex-wrap content-end items-end justify-center gap-2 p-4 pt-20"
        ref={stageRef}
      >
        {SKILLS.map((skill, index) => {
          const className = `inline-flex h-9 shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full border px-3 text-xs font-medium shadow-sm ${TAG_COLORS[index % TAG_COLORS.length]}`;
          return staticMode ? (
            <span
              className={className}
              key={skill}
              ref={(element) => {
                tagsRef.current[index] = element;
              }}
            >
              {skill}
            </span>
          ) : (
            <button
              aria-describedby={instructionsId}
              aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight R"
              aria-label={`${skill} skill tag`}
              className={`${className} cursor-grab outline-offset-2 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-default`}
              disabled={!ready}
              key={skill}
              onKeyDown={(event) => {
                if (
                  [
                    "ArrowLeft",
                    "ArrowRight",
                    "ArrowUp",
                    "ArrowDown",
                    "Home",
                    "r",
                    "R",
                  ].includes(event.key)
                ) {
                  event.preventDefault();
                  controllerRef.current?.nudge(index, event.key);
                }
              }}
              onLostPointerCapture={(event) =>
                controllerRef.current?.release(event, true)
              }
              onPointerCancel={(event) =>
                controllerRef.current?.release(event, true)
              }
              onPointerDown={(event) =>
                controllerRef.current?.grab(index, event)
              }
              onPointerMove={(event) => controllerRef.current?.move(event)}
              onPointerUp={(event) => controllerRef.current?.release(event)}
              ref={(element) => {
                tagsRef.current[index] = element;
              }}
              style={{ touchAction: "none" }}
              type="button"
            >
              {skill}
            </button>
          );
        })}
      </div>
    </div>
  );
}
