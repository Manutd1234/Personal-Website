import type { Body, Engine, Pair, Vector, Vertex } from "matter-js";

type MatterLibrary = typeof import("matter-js");
export type SkillSize = { width: number; height: number };
export const SKILL_WORLD_INSET = 1;
// The only expansion is the visible 1px SVG border. There is no invisible gap.
export const SKILL_COLLISION_PADDING = 0.5;
export const SKILL_PACKING_DENSITY = 0.82;
export const SKILL_DROP_BLOCKED_MS = 1600;
export const SKILL_PHYSICS_STEP = 1000 / 120;
export const SKILL_MAX_VELOCITY = 6;
export const SKILL_DRAG_MAX_VELOCITY = 96;

export const skillTilePaths = {
  ellipse: "M98 50A48 47 0 1 1 2 50A48 47 0 1 1 98 50Z",
  hexagon: "M12 3H88L99 50L88 97H12L1 50Z",
  ticket: "M6 3H94Q99 3 99 11V35Q90 50 99 65V89Q99 97 94 97H6Q1 97 1 89V65Q10 50 1 35V11Q1 3 6 3Z",
  pebble: "M25 5C40 0 55 9 72 5C93 1 99 23 98 49C99 78 85 97 64 95C47 93 33 100 17 91C0 82 0 62 3 41C5 18 10 9 25 5Z",
  cloud: "M15 27C16 6 34 1 43 17C52 0 73 5 76 24C96 17 104 46 94 63C103 85 85 100 69 90C59 103 43 96 37 87C20 103 2 86 7 68C-2 54 1 32 15 27Z",
  pennant: "M2 3H85L99 50L85 97H2L10 50Z",
  seal: "M50 2L60 12L74 8L79 23L94 27L90 43L99 54L88 65L90 81L74 85L66 98L51 91L37 98L28 85L12 81L14 65L2 54L11 42L7 27L23 22L28 8L42 12Z",
} as const;
export type SkillShape = keyof typeof skillTilePaths;
const tileForms = ["ellipse", "hexagon", "ticket", "pebble", "cloud", "pennant"] as const;
export function skillTileForm(index: number, label: string): SkillShape {
  if (label.length <= 8 && index % 4 === 0) return "seal";
  return tileForms[(index * 5 + Math.floor(index / 7)) % tileForms.length];
}

// Sample the same path that paints the label, so curved silhouettes do not sit
// inside invisible rectangular colliders. Small concave notches use their outer
// convex hull: neighbouring labels can touch the silhouette without interlocking.
export function skillShapeOutline(shape: SkillShape, size: SkillSize): Vector[] {
  const points: Vector[] = [];
  if (shape === "ellipse") {
    for (let index = 0; index < 16; index += 1) {
      const angle = index * Math.PI / 8;
      points.push({ x: 50 + 48 * Math.cos(angle), y: 50 + 47 * Math.sin(angle) });
    }
  } else {
    const tokens = skillTilePaths[shape].match(/[A-Z]|-?\d+(?:\.\d+)?/g)!;
    let index = 0, point = { x: 0, y: 0 };
    const number = () => Number(tokens[index++]);
    while (index < tokens.length) {
      const command = tokens[index++];
      if (command === "Z") break;
      if (command === "M" || command === "L") point = { x: number(), y: number() };
      else if (command === "H") point = { x: number(), y: point.y };
      else if (command === "V") point = { x: point.x, y: number() };
      else if (command === "Q" || command === "C") {
        const from = point, control = { x: number(), y: number() };
        const second = { x: number(), y: number() };
        const end = command === "C" ? { x: number(), y: number() } : second;
        for (let sample = 1; sample <= 10; sample += 1) {
          const t = sample / 10, u = 1 - t;
          points.push(command === "C" ? {
            x: u ** 3 * from.x + 3 * u ** 2 * t * control.x + 3 * u * t ** 2 * second.x + t ** 3 * end.x,
            y: u ** 3 * from.y + 3 * u ** 2 * t * control.y + 3 * u * t ** 2 * second.y + t ** 3 * end.y,
          } : {
            x: u ** 2 * from.x + 2 * u * t * control.x + t ** 2 * end.x,
            y: u ** 2 * from.y + 2 * u * t * control.y + t ** 2 * end.y,
          });
        }
        point = end;
        continue;
      }
      points.push(point);
    }
  }
  return points.map(({ x, y }) => ({ x: (x / 100 - 0.5) * size.width, y: (y / 100 - 0.5) * size.height }));
}

function borderedHull(matter: MatterLibrary, points: Vector[]) {
  // hull only reads coordinates, despite Matter's narrower declaration.
  const hull = matter.Vertices.hull(points as Vertex[]);
  // Flat curve segments do not need their own SAT axis. Bound contact cost
  // for all 123 labels while keeping each painted silhouette's outer shape.
  while (hull.length > 16) {
    let remove = 0, smallest = Infinity;
    hull.forEach((point, index) => {
      const before = hull[(index + hull.length - 1) % hull.length], after = hull[(index + 1) % hull.length];
      const deviation = Math.abs((after.x - before.x) * (point.y - before.y) - (after.y - before.y) * (point.x - before.x)) /
        Math.max(0.001, Math.hypot(after.x - before.x, after.y - before.y));
      if (deviation < smallest) { smallest = deviation; remove = index; }
    });
    hull.splice(remove, 1);
  }
  // Matter's hull is clockwise in screen coordinates (positive signed area).
  return hull.map((point, index) => {
    const before = hull[(index + hull.length - 1) % hull.length], after = hull[(index + 1) % hull.length];
    const firstLength = Math.hypot(point.x - before.x, point.y - before.y);
    const secondLength = Math.hypot(after.x - point.x, after.y - point.y);
    const first = { x: (point.y - before.y) / firstLength, y: (before.x - point.x) / firstLength };
    const second = { x: (after.y - point.y) / secondLength, y: (point.x - after.x) / secondLength };
    const x = first.x + second.x, y = first.y + second.y;
    const offset = SKILL_COLLISION_PADDING / (x * first.x + y * first.y);
    return { x: point.x + x * offset, y: point.y + y * offset };
  });
}

export function skillBodyVisualCenter(body: Body): Vector {
  const offset: Vector = body.plugin.skillVisualOffset ?? { x: 0, y: 0 };
  const c = Math.cos(body.angle), s = Math.sin(body.angle);
  return { x: body.position.x + offset.x * c - offset.y * s, y: body.position.y + offset.x * s + offset.y * c };
}

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

// Size the worktable from the measured labels. Wide boards need less vertical
// space; narrow screens keep a bounded viewport over a taller physics world.
export function skillBoardHeight(sizes: readonly SkillSize[], width: number, viewportHeight: number) {
  const area = sizes.reduce((total, size) => total +
    (size.width + SKILL_COLLISION_PADDING * 2) * (size.height + SKILL_COLLISION_PADDING * 2), 0);
  const restingRoom = width >= 700
    ? Math.max(330, Math.min(428, area / Math.max(1, width * 0.92) + 72))
    : viewportHeight;
  return Math.ceil(Math.max(
    restingRoom,
    layoutSkillRows(sizes, width).height,
    area / Math.max(1, (width - 24) * SKILL_PACKING_DENSITY) + 28,
  ));
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
  shape: SkillShape = "hexagon",
) {
  const vertices = borderedHull(matter, skillShapeOutline(shape, size));
  const center = matter.Vertices.centre(vertices);
  const body = matter.Body.create({
      position,
      vertices,
      density: 0.0011 + (index % 5) * 0.00008,
      restitution: 0.04,
      friction: 0.16,
      frictionStatic: 0.24,
      frictionAir: 0.035,
      slop: 0.01,
    });
  // SVG boxes rotate about their own centre; Matter rotates about the polygon's
  // centroid. Account for that small difference instead of shifting the art.
  body.plugin.skillVisualOffset = { x: -center.x, y: -center.y };
  body.plugin.skillShape = shape;
  body.plugin.skillRadius = Math.max(...body.vertices.map((vertex) => Math.hypot(vertex.x - body.position.x, vertex.y - body.position.y)));
  return body;
}

export function limitSkillVelocity(matter: MatterLibrary, body: Body, maximum = SKILL_MAX_VELOCITY) {
  const speed = Math.hypot(body.velocity.x, body.velocity.y);
  if (speed > maximum)
    matter.Body.setVelocity(body, {
      x: body.velocity.x * maximum / speed,
      y: body.velocity.y * maximum / speed,
    });
  // Long, thin labels must not sweep their ends through a neighbour in one
  // update even when a fast hand movement gives them a strong turning impulse.
  if (Math.abs(body.angularVelocity) > 0.08)
    matter.Body.setAngularVelocity(body, Math.sign(body.angularVelocity) * 0.08);
}

export type SkillDrag = {
  body: Body;
  target: Vector;
  offset: Vector;
  velocity: Vector;
  frictionStatic: number;
};

// A hand guides a solid body in small collision-solving steps. The label stays
// in the same world and pushes its neighbours throughout the gesture.
export function createSkillDrag(
  matter: MatterLibrary,
  body: Body,
  point: Vector,
): SkillDrag {
  matter.Sleeping.set(body, false);
  const dx = point.x - body.position.x, dy = point.y - body.position.y;
  const c = Math.cos(body.angle), s = Math.sin(body.angle);
  const drag = {
    body,
    target: { ...point },
    offset: { x: dx * c + dy * s, y: -dx * s + dy * c },
    velocity: { x: 0, y: 0 },
    frictionStatic: body.frictionStatic,
  };
  // While held, the hand determines this body's movement; neighbours cannot
  // pin it beneath the pile. It remains a solid collider throughout the grip.
  matter.Body.setStatic(body, true);
  body.friction = 0.02;
  body.frictionStatic = 0.04;
  return drag;
}

export function updateSkillDrag(
  matter: MatterLibrary,
  drag: SkillDrag,
  width: number,
  height: number,
  step = SKILL_PHYSICS_STEP / 8,
) {
  const { body, offset } = drag;
  const c = Math.cos(body.angle), s = Math.sin(body.angle);
  const anchor = {
    x: body.position.x + offset.x * c - offset.y * s,
    y: body.position.y + offset.x * s + offset.y * c,
  };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const vertex of body.vertices) {
    minX = Math.min(minX, vertex.x); maxX = Math.max(maxX, vertex.x);
    minY = Math.min(minY, vertex.y); maxY = Math.max(maxY, vertex.y);
  }
  const dx = Math.max(SKILL_WORLD_INSET - minX,
    Math.min(width - SKILL_WORLD_INSET - maxX, drag.target.x - anchor.x));
  const dy = Math.max(SKILL_WORLD_INSET - minY,
    Math.min(height - SKILL_WORLD_INSET - maxY, drag.target.y - anchor.y));
  const timeScale = step / (1000 / 60);
  const ratio = Math.min(1, SKILL_DRAG_MAX_VELOCITY * timeScale / Math.max(0.001, Math.hypot(dx, dy)));
  const move = { x: dx * ratio, y: dy * ratio };
  drag.velocity = { x: move.x / timeScale, y: move.y / timeScale };
  matter.Body.setPosition(body, { x: body.position.x + move.x, y: body.position.y + move.y });
  // Static bodies skip Matter.Body.update, so keep their integration interval
  // current before assigning velocity for collision impulses.
  Object.assign(body, { deltaTime: step });
  matter.Body.setVelocity(body, drag.velocity);
}

export function releaseSkillDrag(matter: MatterLibrary, drag: SkillDrag) {
  matter.Body.setStatic(drag.body, false);
  drag.body.frictionStatic = drag.frictionStatic;
  matter.Body.setVelocity(drag.body, drag.velocity);
}

// Active mouse/finger gestures can travel much faster than the falling pile.
// Small substeps preserve contact accuracy at that speed; idle animation
// keeps the cheaper 120 Hz loop. All bodies may respond to the hand's impact.
export function stepSkillPhysics(
  matter: MatterLibrary,
  engine: Engine,
  bodies: readonly Body[],
  width: number,
  height: number,
  drag: SkillDrag | null = null,
) {
  let fastest = 0;
  for (const body of bodies) {
    const radius: number = body.plugin.skillRadius ?? 0;
    fastest = Math.max(fastest,
      Math.hypot(body.velocity.x, body.velocity.y) + Math.min(0.08, Math.abs(body.angularVelocity)) * radius);
  }
  let substeps = Math.min(4, Math.max(1, Math.ceil(fastest / 4)));
  if (drag) {
    const c = Math.cos(drag.body.angle), s = Math.sin(drag.body.angle);
    const distance = Math.hypot(
      drag.target.x - drag.body.position.x - drag.offset.x * c + drag.offset.y * s,
      drag.target.y - drag.body.position.y - drag.offset.x * s - drag.offset.y * c,
    );
    const travel = Math.max(Math.min(distance, SKILL_DRAG_MAX_VELOCITY / 2), fastest / 2);
    // Compact touch boards have denser contact chains and retain the finer
    // sweep; desktop travel can use 3px steps without redundant world solves.
    const sweep = width < 700 ? 1 : 3;
    substeps = Math.max(4, Math.min(width < 700 ? 48 : 16, Math.ceil(travel / sweep)));
  }
  const maximum = drag ? SKILL_DRAG_MAX_VELOCITY : SKILL_MAX_VELOCITY;
  const iterations = engine.positionIterations;
  if (drag) engine.positionIterations = 28;
  const neighbours = drag ? bodies.filter((body) => body !== drag.body) : [];
  for (let step = 0; step < substeps; step += 1) {
    const before = drag ? { ...drag.body.position } : null;
    if (drag) {
      // While pushing a connected pile, allow compressed contacts to clear.
      // Compression elsewhere must never stall a free-space grab.
      let touching = false, crowded = false;
      for (const pair of engine.pairs.list as Pair[]) {
        if (!pair.isActive) continue;
        touching ||= pair.bodyA === drag.body || pair.bodyB === drag.body;
        crowded ||= pair.collision.depth > 0.8;
        if (touching && crowded) break;
      }
      if (touching && crowded) {
        drag.velocity = { x: 0, y: 0 };
        matter.Body.setVelocity(drag.body, drag.velocity);
      } else updateSkillDrag(matter, drag, width, height, SKILL_PHYSICS_STEP / substeps);
    }
    for (const body of bodies) limitSkillVelocity(matter, body, body === drag?.body ? maximum : Math.min(maximum, 24));
    matter.Engine.update(engine, SKILL_PHYSICS_STEP / substeps);
    for (const body of bodies) containSkillBody(matter, body, width, height);
    if (drag && before && matter.Query.collides(drag.body, neighbours)
      .some((collision) => collision.depth > 1.8)) {
      // A hand cannot force a solid tile through a tightly packed neighbour.
      // Keep the last physical position while the pushed contacts settle.
      matter.Body.setPosition(drag.body, before);
      drag.velocity = { x: 0, y: 0 };
      matter.Body.setVelocity(drag.body, drag.velocity);
    }
  }
  engine.positionIterations = iterations;
}

// client coordinates and the physics layout can differ when the board or an
// ancestor is scaled. This also handles scrolling because the live rect moves.
export function skillPointerPosition(
  point: Vector,
  rect: { left: number; top: number; width: number; height: number },
  width: number,
  height: number,
): Vector {
  return {
    x: (point.x - rect.left) * width / Math.max(1, rect.width),
    y: (point.y - rect.top) * height / Math.max(1, rect.height),
  };
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
  // Predicted bounds enclose the real hull. Most bodies are already inside;
  // only scan vertices near an edge, never every hull after every substep.
  if (body.bounds.min.x >= 0 && body.bounds.max.x <= width &&
    body.bounds.min.y >= 0 && body.bounds.max.y <= height) return;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const vertex of body.vertices) {
    minX = Math.min(minX, vertex.x); maxX = Math.max(maxX, vertex.x);
    minY = Math.min(minY, vertex.y); maxY = Math.max(maxY, vertex.y);
  }
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
