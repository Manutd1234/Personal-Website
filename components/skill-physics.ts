import type { Body, Vector } from "matter-js";

type MatterLibrary = typeof import("matter-js");
export type SkillSize = { width: number; height: number };
export const SKILL_WORLD_INSET = 8;

// Pack the measured rectangles into short rows instead of giving every row
// the height of its tallest decorative seal. DOM/keyboard order stays intact.
export function layoutSkillRows(sizes: readonly SkillSize[], width: number) {
  const inset = 12;
  const gap = 4;
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
) {
  return matter.Bodies.rectangle(
    position.x,
    position.y,
    size.width,
    size.height,
    {
      chamfer: { radius: Math.min(14, size.height / 2) },
      restitution: 0.25,
      friction: 0.65,
      frictionStatic: 0.9,
      frictionAir: 0.018,
      sleepThreshold: 55,
    },
  );
}

// Keep high-velocity flings inside the visible board between collision steps.
export function containSkillBody(
  matter: MatterLibrary,
  body: Body,
  width: number,
  height: number,
) {
  const inset = SKILL_WORLD_INSET;
  const dx =
    body.bounds.min.x < inset
      ? inset - body.bounds.min.x
      : body.bounds.max.x > width - inset
        ? width - inset - body.bounds.max.x
        : 0;
  const dy =
    body.bounds.min.y < inset
      ? inset - body.bounds.min.y
      : body.bounds.max.y > height - inset
        ? height - inset - body.bounds.max.y
        : 0;
  if (dx || dy) {
    matter.Body.translate(body, { x: dx, y: dy });
    matter.Body.setVelocity(body, {
      x: dx ? -body.velocity.x * 0.25 : body.velocity.x,
      y: dy ? -body.velocity.y * 0.25 : body.velocity.y,
    });
  }
}
