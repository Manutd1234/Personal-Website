import type { Body, Vector } from "matter-js";

type MatterLibrary = typeof import("matter-js");
export type SkillSize = { width: number; height: number };
export const SKILL_WORLD_INSET = 8;
// Include the full SVG envelope and its stroke, not just a chamfered interior.
export const SKILL_COLLISION_PADDING = 4;
export const SKILL_PACKING_DENSITY = 0.82;
export const SKILL_DROP_BLOCKED_MS = 1600;
export const SKILL_PHYSICS_STEP = 1000 / 120;
export const SKILL_MAX_VELOCITY = 8;

// Pack the measured rectangles into short rows instead of giving every row
// the height of its tallest decorative seal. DOM/keyboard order stays intact.
export function layoutSkillRows(sizes: readonly SkillSize[], width: number) {
  const inset = 12;
  const gap = SKILL_COLLISION_PADDING * 2 + 1;
  const usable = Math.max(1, width - inset * 2);
  const rows: { indices: number[]; width: number; height: number }[] = [];
  const ordered = sizes.map((size, index) => ({ ...size, index }))
    .sort((a, b) => b.height - a.height || b.width - a.width || a.index - b.index);
  for (const size of ordered) {
    const row = rows.find((item) => item.width + gap + size.width <= usable);
    if (row) {
      row.indices.push(size.index);
      row.width += gap + size.width;
    } else rows.push({ indices: [size.index], width: size.width, height: size.height });
  }
  const positions: Vector[] = sizes.map(() => ({ x: 0, y: 0 }));
  let y = inset;
  for (const row of rows) {
    let x = (width - row.width) / 2;
    for (const index of row.indices) {
      const size = sizes[index];
      positions[index] = { x: x + size.width / 2, y: y + row.height / 2 };
      x += size.width + gap;
    }
    y += row.height + gap;
  }
  return { positions, height: y - (rows.length ? gap : 0) + inset };
}

export function createSkillWalls(
  matter: MatterLibrary,
  width: number,
  height: number,
) {
  const thickness = 80;
  const inset = SKILL_WORLD_INSET;
  return [
    matter.Bodies.rectangle(
      width / 2,
      height + thickness / 2 - inset,
      width + thickness * 2,
      thickness,
      { isStatic: true },
    ),
    matter.Bodies.rectangle(
      width / 2,
      -thickness / 2 + inset,
      width + thickness * 2,
      thickness,
      { isStatic: true },
    ),
    matter.Bodies.rectangle(
      -thickness / 2 + inset,
      height / 2,
      thickness,
      height + thickness * 2,
      { isStatic: true },
    ),
    matter.Bodies.rectangle(
      width + thickness / 2 - inset,
      height / 2,
      thickness,
      height + thickness * 2,
      { isStatic: true },
    ),
  ];
}

export function createSkillBody(
  matter: MatterLibrary,
  size: SkillSize,
  position: Vector,
  index = 0,
) {
  return matter.Bodies.rectangle(
    position.x,
    position.y,
    size.width + SKILL_COLLISION_PADDING * 2,
    size.height + SKILL_COLLISION_PADDING * 2,
    {
      // The decorative silhouette stays inside this complete rectangle. Rounded
      // corners allowed neighbouring SVGs to enter each other's writing area.
      inertia: Infinity,
      density: 0.0011 + (index % 5) * 0.00008,
      restitution: 0.04,
      friction: 0.55,
      frictionStatic: 0.85,
      frictionAir: 0.035,
      slop: 0.01,
      sleepThreshold: 70,
    },
  );
}

export function limitSkillVelocity(matter: MatterLibrary, body: Body) {
  const speed = Math.hypot(body.velocity.x, body.velocity.y);
  if (speed > SKILL_MAX_VELOCITY)
    matter.Body.setVelocity(body, {
      x: body.velocity.x * SKILL_MAX_VELOCITY / speed,
      y: body.velocity.y * SKILL_MAX_VELOCITY / speed,
    });
}

// Sweep toward the pointer through free space. Repeatedly forcing velocity or
// a mouse constraint into an immovable pile compresses neighbouring cards.
export function steerSkillBody(
  matter: MatterLibrary,
  body: Body,
  target: Vector,
  obstacles: readonly Body[],
  width: number,
  height: number,
) {
  const dx = target.x - body.position.x;
  const dy = target.y - body.position.y;
  const scale = Math.min(1, 4 / Math.max(1, Math.hypot(dx, dy)));
  moveSkillBody(matter, body, { x: dx * scale, y: dy * scale }, obstacles, width, height);
}

// Keyboard movement is swept in small increments, stopping at another card
// instead of teleporting into it. Tiny resting contact is safe inside padding.
export function moveSkillBody(
  matter: MatterLibrary,
  body: Body,
  delta: Vector,
  obstacles: readonly Body[],
  width: number,
  height: number,
) {
  const steps = Math.max(1, Math.ceil(Math.hypot(delta.x, delta.y) / 2));
  const increment = { x: delta.x / steps, y: delta.y / steps };
  const others = obstacles.filter((other) => other !== body);
  matter.Sleeping.set(body, false);
  for (let step = 0; step < steps; step += 1) {
    const before = { ...body.position };
    const beforeDepth = Math.max(0, ...matter.Query.collides(body, others).map((hit) => hit.depth));
    matter.Body.translate(body, increment);
    const outside = body.bounds.min.x < SKILL_WORLD_INSET ||
      body.bounds.max.x > width - SKILL_WORLD_INSET ||
      body.bounds.min.y < SKILL_WORLD_INSET || body.bounds.max.y > height - SKILL_WORLD_INSET;
    const depth = Math.max(0, ...matter.Query.collides(body, others).map((hit) => hit.depth));
    if (outside || depth > Math.max(0.1, beforeDepth + 0.001)) {
      matter.Body.setPosition(body, before);
      break;
    }
  }
  matter.Body.setVelocity(body, { x: 0, y: 0 });
}

// Matter's bounds include velocity prediction. Clamping those bounds after
// collision solving used to shove bottom cards into their neighbours each frame.
// The walls own normal containment; only recover an actual escaped vertex.
export function containSkillBody(
  matter: MatterLibrary,
  body: Body,
  width: number,
  height: number,
) {
  const minX = Math.min(...body.vertices.map((vertex) => vertex.x));
  const maxX = Math.max(...body.vertices.map((vertex) => vertex.x));
  const minY = Math.min(...body.vertices.map((vertex) => vertex.y));
  const maxY = Math.max(...body.vertices.map((vertex) => vertex.y));
  const inset = SKILL_WORLD_INSET;
  const dx = minX < 0 ? inset - minX : maxX > width ? width - inset - maxX : 0;
  const dy = minY < 0 ? inset - minY : maxY > height ? height - inset - maxY : 0;
  if (dx || dy) {
    matter.Body.translate(body, { x: dx, y: dy });
    matter.Body.setVelocity(body, {
      x: dx ? 0 : body.velocity.x,
      y: dy ? 0 : body.velocity.y,
    });
  }
}
