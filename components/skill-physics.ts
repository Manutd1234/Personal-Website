import type { Body, Vector } from "matter-js";

type MatterLibrary = typeof import("matter-js");
export type SkillSize = { width: number; height: number };
export const SKILL_WORLD_INSET = 8;
// Include the full SVG envelope and its stroke, not just a chamfered interior.
export const SKILL_COLLISION_PADDING = 3;
export const SKILL_PACKING_DENSITY = 0.82;
export const SKILL_DROP_BLOCKED_MS = 1600;
export const SKILL_PHYSICS_STEP = 1000 / 120;
export const SKILL_MAX_VELOCITY = 6;

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

// Keep every body responsive to gravity. Per-body sleeping can strand a label
// in midair when a neighbour is dragged out from under it.
export function createSkillEngine(matter: MatterLibrary) {
  const engine = matter.Engine.create({
    enableSleeping: false,
    positionIterations: 14,
    velocityIterations: 8,
    constraintIterations: 3,
  });
  engine.gravity.y = 0.46;
  return engine;
}

export function isSkillPileStill(bodies: readonly Body[]) {
  return bodies.every((body) =>
    Math.hypot(body.velocity.x, body.velocity.y) < 0.04 &&
    Math.abs(body.angularVelocity) < 0.002,
  );
}

export function createSkillWalls(
  matter: MatterLibrary,
  width: number,
  height: number,
) {
  const thickness = 80;
  const inset = SKILL_WORLD_INSET;
  // Smooth walls cannot hold a bridge in midair when the floor moves down.
  // Label-to-label friction still lets the pile settle against itself.
  return [
    matter.Bodies.rectangle(
      width / 2,
      height + thickness / 2 - inset,
      width + thickness * 2,
      thickness,
      { isStatic: true, friction: 0, frictionStatic: 0 },
    ),
    matter.Bodies.rectangle(
      width / 2,
      -thickness / 2 + inset,
      width + thickness * 2,
      thickness,
      { isStatic: true, friction: 0, frictionStatic: 0 },
    ),
    matter.Bodies.rectangle(
      -thickness / 2 + inset,
      height / 2,
      thickness,
      height + thickness * 2,
      { isStatic: true, friction: 0, frictionStatic: 0 },
    ),
    matter.Bodies.rectangle(
      width + thickness / 2 - inset,
      height / 2,
      thickness,
      height + thickness * 2,
      { isStatic: true, friction: 0, frictionStatic: 0 },
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
      density: 0.0011 + (index % 5) * 0.00008,
      restitution: 0.04,
      friction: 0.16,
      frictionStatic: 0.24,
      frictionAir: 0.035,
      slop: 0.01,
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

// A picked-up paper label lives above the pile until release. Its body is
// temporarily removed from the engine by the controller, so a buried label can
// follow the pointer without having to push every supporting label out first.
export function positionHeldSkillBody(
  matter: MatterLibrary,
  body: Body,
  target: Vector,
  width: number,
  height: number,
) {
  const halfWidth = (Math.max(...body.vertices.map((point) => point.x)) -
    Math.min(...body.vertices.map((point) => point.x))) / 2;
  const halfHeight = (Math.max(...body.vertices.map((point) => point.y)) -
    Math.min(...body.vertices.map((point) => point.y))) / 2;
  const inset = SKILL_WORLD_INSET + 1;
  matter.Body.setVelocity(body, { x: 0, y: 0 });
  matter.Body.setAngularVelocity(body, 0);
  matter.Body.setPosition(body, {
    x: Math.max(inset + halfWidth, Math.min(width - inset - halfWidth, target.x)),
    y: Math.max(inset + halfHeight, Math.min(height - inset - halfHeight, target.y)),
  });
}

// Rejoin the physical pile only in empty space. Releasing over other labels
// first tries the pointer's column, above the nearby contacts, then the free
// space along the top. No existing label is moved or rearranged by this search.
// A full board returns false so its floor can be extended before reinsertion.
export function placeReleasedSkillBody(
  matter: MatterLibrary,
  body: Body,
  obstacles: readonly Body[],
  width: number,
  height: number,
) {
  const others = obstacles.filter((other) => other !== body);
  positionHeldSkillBody(matter, body, body.position, width, height);
  const target = { ...body.position };
  const halfWidth = (body.bounds.max.x - body.bounds.min.x) / 2;
  const halfHeight = (body.bounds.max.y - body.bounds.min.y) / 2;
  const top = SKILL_WORLD_INSET + halfHeight + 1;
  const left = SKILL_WORLD_INSET + halfWidth + 1;
  const right = width - left;
  const clear = (x: number, y: number) => {
    matter.Body.setPosition(body, { x, y });
    return matter.Query.collides(body, others).every((hit) => hit.depth <= 0.1);
  };
  const heights = [target.y, top, ...others.map((other) => other.bounds.min.y - halfHeight - 1)]
    .filter((y) => y >= top && y <= target.y)
    .sort((a, b) => b - a);
  for (const y of heights) if (clear(target.x, y)) return true;
  const columns = [left, right, ...others.flatMap((other) => [
    other.bounds.min.x - halfWidth - 1, other.bounds.max.x + halfWidth + 1,
  ])].filter((x) => x >= left && x <= right)
    .sort((a, b) => Math.abs(a - target.x) - Math.abs(b - target.x));
  for (const x of columns) if (clear(x, top)) return true;
  matter.Body.setPosition(body, target);
  return false;
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
