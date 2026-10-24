// Run with: node scripts/check-skill-physics.mjs
// Exercise the real physics helpers without a browser or new test dependency.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import Matter from "matter-js";

const root = new URL("../", import.meta.url);
const helperPath = new URL("components/skill-physics.ts", root);
const compiled = ts.transpileModule(readFileSync(helperPath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const scope = { exports: {}, require: createRequire(helperPath) };
runInNewContext(compiled, scope, { filename: fileURLToPath(helperPath) });
const physics = scope.exports;

// Representative desktop envelopes from the current 123 labels and their font
// metrics, including all seven decorative forms. These are collision fixtures,
// not a substitute for the browser's measured text-fit check. Narrow fixtures
// are deliberately larger to cover the mobile minimum font size.
const desktopSizes = [
  [86, 41], [71, 29], [148, 35], [86, 31], [86, 41], [110, 29], [60, 31], [99, 31],
  [171, 29], [78, 35], [76, 31], [81, 29], [109, 29], [78, 31], [94, 31], [93, 29],
  [82, 41], [105, 31], [50, 25], [103, 27], [60, 37], [83, 27], [62, 27], [65, 31],
  [82, 37], [63, 27], [98, 25], [43, 29], [60, 37], [88, 25], [88, 33], [90, 27],
  [63, 37], [74, 27], [40, 27], [123, 27], [85, 25], [96, 31], [60, 29], [71, 25],
  [85, 25], [71, 29], [92, 27], [64, 25], [67, 39], [81, 27], [75, 27], [54, 25],
  [93, 27], [96, 29], [58, 25], [78, 31], [80, 29], [51, 27], [110, 25], [90, 27],
  [69, 39], [71, 25], [86, 31], [121, 29], [75, 37], [45, 25], [52, 27], [47, 29],
  [64, 37], [105, 31], [111, 27], [50, 25], [59, 37], [50, 29], [70, 27], [82, 25],
  [169, 33], [63, 27], [49, 27], [95, 27], [90, 27], [129, 29], [68, 25], [130, 33],
  [145, 27], [86, 27], [89, 25], [62, 27], [76, 27], [205, 25], [74, 31], [86, 27],
  [158, 27], [56, 25], [96, 27], [141, 29], [98, 25], [119, 33], [90, 27], [93, 25],
  [101, 25], [81, 27], [153, 29], [55, 25], [200, 33], [141, 27], [87, 27], [152, 25],
  [94, 27], [68, 27], [119, 25], [131, 33], [112, 27], [138, 27], [69, 25], [65, 29],
  [147, 27], [55, 25], [120, 31], [205, 27], [68, 37], [125, 27], [126, 29], [68, 27],
  [99, 25], [84, 31], [83, 29],
].map(([width, height]) => ({ width, height }));
const portfolio = ts.createSourceFile("portfolio.ts", readFileSync(new URL("content/portfolio.ts", root), "utf8"), ts.ScriptTarget.Latest, true);
let catalogCount = 0;
function countSkills(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(portfolio) === "skillGroups") {
    function visitItems(child) {
      if (ts.isPropertyAssignment(child) && child.name.getText(portfolio) === "items" && ts.isArrayLiteralExpression(child.initializer)) {
        catalogCount += child.initializer.elements.length;
      }
      ts.forEachChild(child, visitItems);
    }
    visitItems(node);
  } else ts.forEachChild(node, countSkills);
}
countSkills(portfolio);
assert.equal(desktopSizes.length, catalogCount, "Update the collision fixture when the skill catalog changes");

// SAT uses the visible, rotated rectangle, excluding the extra collision padding.
// Any overlap here can cover another skill's silhouette or writing area.
function visibleOverlap(a, aSize, b, bSize) {
  const ca = Math.cos(a.angle), sa = Math.sin(a.angle);
  const cb = Math.cos(b.angle), sb = Math.sin(b.angle);
  const dx = b.position.x - a.position.x, dy = b.position.y - a.position.y;
  let depth = Infinity;
  for (const [x, y] of [[ca, sa], [-sa, ca], [cb, sb], [-sb, cb]]) {
    const aRadius = Math.abs(x * ca + y * sa) * aSize.width / 2 + Math.abs(-x * sa + y * ca) * aSize.height / 2;
    const bRadius = Math.abs(x * cb + y * sb) * bSize.width / 2 + Math.abs(-x * sb + y * cb) * bSize.height / 2;
    const overlap = aRadius + bRadius - Math.abs(dx * x + dy * y);
    if (overlap <= 0) return 0;
    depth = Math.min(depth, overlap);
  }
  return depth;
}
function checkBodies(bodies, sizes, width, height, context) {
  let worst = 0;
  for (let i = 0; i < bodies.length; i += 1) {
    const body = bodies[i];
    for (const vertex of body.vertices) {
      assert.ok(vertex.x >= -0.1 && vertex.x <= width + 0.1 && vertex.y >= -0.1 && vertex.y <= height + 0.1, `${context}: body ${body.plugin.index} escaped`);
    }
    for (let j = i + 1; j < bodies.length; j += 1) {
      const other = bodies[j];
      if (!Matter.Bounds.overlaps(body.bounds, other.bounds)) continue;
      const depth = visibleOverlap(body, sizes[body.plugin.index], other, sizes[other.plugin.index]);
      worst = Math.max(worst, depth);
      assert.ok(depth < 0.5, `${context}: labels ${body.plugin.index} / ${other.plugin.index} overlap ${depth.toFixed(2)}px`);
    }
  }
  return worst;
}
function createWorld(width, height) {
  const engine = Matter.Engine.create({ enableSleeping: true, positionIterations: 14, velocityIterations: 8, constraintIterations: 3 });
  engine.gravity.y = 0.46;
  Matter.Composite.add(engine.world, physics.createSkillWalls(Matter, width, height));
  return engine;
}
function update(engine, bodies, width, height) {
  for (const body of bodies) physics.limitSkillVelocity(Matter, body);
  Matter.Engine.update(engine, physics.SKILL_PHYSICS_STEP);
  for (const body of bodies) physics.containSkillBody(Matter, body, width, height);
}
function makeBody(size, position, index) {
  const body = physics.createSkillBody(Matter, size, position, index);
  body.plugin.index = index;
  return body;
}
function randomGenerator(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// Regression: predictive bounds cross the floor while actual vertices stay in
// the world. Post-solver clamping must not shove this card into its neighbour.
const contained = makeBody({ width: 80, height: 30 }, { x: 100, y: 575 }, 0);
Matter.Body.setVelocity(contained, { x: 0, y: 8 });
Matter.Bounds.update(contained.bounds, contained.vertices, contained.velocity);
const positionBefore = { ...contained.position };
physics.containSkillBody(Matter, contained, 980, 603);
assert.deepEqual(contained.position, positionBefore, "Containment must ignore predictive bounds");

// A free label follows the pointer, then stops at a real neighbour instead of
// being pinned in place or passing through it when the pointer jumps far away.
const draggable = makeBody({ width: 80, height: 30 }, { x: 100, y: 100 }, 0);
for (let step = 0; step < 30; step += 1) physics.steerSkillBody(Matter, draggable, { x: 200, y: 100 }, [draggable], 980, 603);
assert.ok(Math.abs(draggable.position.x - 200) < 0.1, "A free label must follow the pointer");
const blocker = makeBody({ width: 80, height: 30 }, { x: 300, y: 100 }, 1);
for (let step = 0; step < 100; step += 1) physics.steerSkillBody(Matter, draggable, { x: 800, y: 100 }, [draggable, blocker], 980, 603);
assert.ok(draggable.position.x > 200 && draggable.position.x <= 212.1, "Dragging must approach and stop at its neighbour");

for (const [name, width, frameHeight, scale] of [["desktop", 980, 603, 1], ["narrow", 340, 506, 1.1]]) {
  const sizes = desktopSizes.map((size) => ({ width: Math.ceil(size.width * scale), height: Math.ceil(size.height * scale) }));
  const layout = physics.layoutSkillRows(sizes, width);
  const area = sizes.reduce((sum, size) => sum + (size.width + physics.SKILL_COLLISION_PADDING * 2) * (size.height + physics.SKILL_COLLISION_PADDING * 2), 0);
  const height = Math.ceil(Math.max(frameHeight, layout.height, area / ((width - 24) * physics.SKILL_PACKING_DENSITY) + 28));
  const homes = layout.positions.map((position) => ({ x: position.x, y: position.y + (height - layout.height) / 2 }));
  const engine = createWorld(width, height);
  const bodies = sizes.map((size, index) => makeBody(size, homes[index], index));
  Matter.Composite.add(engine.world, bodies);
  let worst = checkBodies(bodies, sizes, width, height, `${name}: lay them out`);

  // Settling, prolonged dragging against a crowded floor, then an extreme fling.
  for (let step = 0; step < 1800; step += 1) {
    if (step >= 600 && step < 1200) {
      physics.steerSkillBody(Matter, bodies[4], {
        x: width * (0.1 + 0.8 * Math.sin(step / 80) ** 2), y: height - 18,
      }, bodies, width, height);
    }
    if (step === 1200) Matter.Body.setVelocity(bodies[4], { x: 30, y: -30 });
    update(engine, bodies, width, height);
    if (step % 2 === 0) worst = Math.max(worst, checkBodies(bodies, sizes, width, height, `${name}: drag/fling ${step}`));
  }
  // Every card receives four large keyboard nudges into neighbouring cards.
  for (const body of bodies) {
    for (const delta of [{ x: 30, y: 0 }, { x: 0, y: 30 }, { x: -30, y: 0 }, { x: 0, y: -30 }]) {
      physics.moveSkillBody(Matter, body, delta, bodies, width, height);
      worst = Math.max(worst, checkBodies(bodies, sizes, width, height, `${name}: keyboard ${body.plugin.index}`));
    }
  }
  Matter.Engine.clear(engine);

  // Reproduce sequential random drops and an entry bridge. The component uses
  // this same measured safe layout after 1.6s blocked, only when no drag is held.
  // Assert the fallback exposes all 123 within a finite run without overlap.
  const dropEngine = createWorld(width, height), dropped = [], random = randomGenerator(42);
  let next = 0, lastDrop = 0, fallbackCount = 0;
  for (let step = 0; step < 4200; step += 1) {
    if (next < sizes.length && step % 8 === 0) {
      const body = makeBody(sizes[next], { x: width / 2, y: 40 }, next);
      Matter.Body.setAngle(body, (random() - 0.5) * 0.2);
      let clear = false;
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const halfWidth = (body.bounds.max.x - body.bounds.min.x) / 2;
        const halfHeight = (body.bounds.max.y - body.bounds.min.y) / 2;
        Matter.Body.setPosition(body, { x: halfWidth + 12 + random() * (width - 24 - 2 * halfWidth), y: halfHeight + 12 });
        if (!Matter.Query.collides(body, dropped).length) { clear = true; break; }
      }
      if (clear) {
        Matter.Composite.add(dropEngine.world, body);
        dropped.push(body);
        next += 1;
        lastDrop = step;
      }
    }
    if (next < sizes.length && step - lastDrop > physics.SKILL_DROP_BLOCKED_MS / physics.SKILL_PHYSICS_STEP) {
      const byIndex = new Map(dropped.map((body) => [body.plugin.index, body]));
      for (let index = 0; index < sizes.length; index += 1) {
        let body = byIndex.get(index);
        if (!body) {
          body = makeBody(sizes[index], homes[index], index);
          dropped.push(body);
          Matter.Composite.add(dropEngine.world, body);
        }
        Matter.Body.setPosition(body, homes[index]);
        Matter.Body.setAngle(body, 0);
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Sleeping.set(body, false);
      }
      next = sizes.length;
      fallbackCount += 1;
    }
    update(dropEngine, dropped, width, height);
    if (step % 4 === 0) worst = Math.max(worst, checkBodies(dropped, sizes, width, height, `${name}: drop ${step}`));
  }
  assert.equal(dropped.length, catalogCount, `${name}: every skill must appear`);
  assert.ok(fallbackCount <= 1, `${name}: never continuously rearrange a completed drop`);
  Matter.Engine.clear(dropEngine);
  console.log(`${name}: ${width}×${height}, ${dropped.length} skills, ${fallbackCount} safe repack, maximum visible overlap ${worst.toFixed(2)}px — PASS`);
}
console.log("Skill physics checks passed.");
