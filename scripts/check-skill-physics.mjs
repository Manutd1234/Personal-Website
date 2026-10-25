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
const originalDesktopSizes = [
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
// Retain the former 0.88 desktop envelopes as a conservative stress fixture
// after compacting the board; mobile still uses these larger dimensions.
const desktopSizes = originalDesktopSizes.map(({ width, height }) => ({
  width: Math.ceil(width * 0.88),
  height: Math.ceil(height * 0.88),
}));
const portfolio = ts.createSourceFile("portfolio.ts", readFileSync(new URL("content/portfolio.ts", root), "utf8"), ts.ScriptTarget.Latest, true);
let catalogCount = 0;
const catalogGroups = [];
function countSkills(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(portfolio) === "skillGroups") {
    function visitItems(child) {
      if (ts.isPropertyAssignment(child) && child.name.getText(portfolio) === "items" && ts.isArrayLiteralExpression(child.initializer)) {
        catalogCount += child.initializer.elements.length;
        catalogGroups.push(child.initializer.elements.map((element) => element.text));
      }
      ts.forEachChild(child, visitItems);
    }
    visitItems(node);
  } else ts.forEachChild(node, countSkills);
}
countSkills(portfolio);
const catalogLabels = catalogGroups.flatMap((group, categoryIndex) => group.map((label, itemIndex) => ({ label, categoryIndex, itemIndex })))
  .sort((a, b) => a.itemIndex - b.itemIndex || a.categoryIndex - b.categoryIndex).map(({ label }) => label);
assert.equal(desktopSizes.length, catalogCount, "Update the collision fixture when the skill catalog changes");

// SAT follows the painted fill outline, allowing the two half-pixel strokes
// to meet. Empty rectangular corners around curved shapes may interleave.
function visibleOverlap(a, _aSize, b, _bSize) {
  let depth = Infinity;
  for (const axis of [...a.axes, ...b.axes]) {
    const pa = a.vertices.map((point) => point.x * axis.x + point.y * axis.y);
    const pb = b.vertices.map((point) => point.x * axis.x + point.y * axis.y);
    const overlap = Math.min(Math.max(...pa), Math.max(...pb)) - Math.max(Math.min(...pa), Math.min(...pb));
    if (overlap <= 0) return 0;
    depth = Math.min(depth, overlap);
  }
  return Math.max(0, depth - physics.SKILL_COLLISION_PADDING * 2);
}
// Contact resolution can leave subpixel edge penetration; keep settled labels
// within one rendered pixel, well inside their text padding.
function checkBodies(bodies, sizes, width, height, context, tolerance = 1) {
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
      assert.ok(depth < tolerance, `${context}: labels ${body.plugin.index} / ${other.plugin.index} overlap ${depth.toFixed(2)}px`);
    }
  }
  return worst;
}
function createWorld(width, height) {
  const engine = physics.createSkillEngine(Matter);
  assert.equal(engine.enableSleeping, false, "Skill labels must remain responsive to lost support");
  const walls = physics.createSkillWalls(Matter, width, height);
  Matter.Composite.add(engine.world, walls);
  return { engine, walls };
}
function update(engine, bodies, width, height, grip = null) {
  physics.stepSkillPhysics(Matter, engine, bodies, width, height, grip);
}
function makeBody(size, position, index) {
  const body = physics.createSkillBody(Matter, size, position, index, physics.skillTileForm(index, catalogLabels[index] ?? "skill"));
  body.plugin.index = index;
  return body;
}
function randomGenerator(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// Colliders follow painted silhouettes rather than inflated bounding boxes.
// In particular, ellipse corners remain empty and its border reaches the floor.
for (const shape of Object.keys(physics.skillTilePaths)) {
  const width = 400, height = 220;
  const { engine } = createWorld(width, height);
  const size = { width: 120, height: 34 };
  const body = physics.createSkillBody(Matter, size, { x: 200, y: 70 }, 0, shape);
  assert.ok(body.vertices.length <= 16, `${shape}: bound collision-axis cost`);
  assert.ok(body.plugin.skillRadius < 65, `${shape}: radius must use local dimensions, not world position`);
  if (shape === "ellipse") {
    assert.equal(Matter.Query.point([body], { x: 255, y: 83 }).length, 0, "Ellipse corners must not contain invisible collision rectangles");
    assert.ok(body.area < size.width * size.height * 0.85, "Ellipse collision area must follow its curved outline");
  }
  Matter.Composite.add(engine.world, body);
  for (let step = 0; step < 720; step += 1) update(engine, [body], width, height);
  const floorGap = height - physics.SKILL_WORLD_INSET - Math.max(...body.vertices.map((vertex) => vertex.y));
  assert.ok(Math.abs(floorGap) < 0.5, `${shape}: painted border must touch the inner floor (${floorGap.toFixed(2)}px gap)`);
  Matter.Engine.clear(engine);
}
console.log("All seven silhouettes use bounded outline hulls and touch the floor — PASS");

// A compressed contact elsewhere must not stop a label moving in free space.
// Seed one unresolved remote contact, as can happen during vigorous stirring.
{
  const { engine } = createWorld(900, 400);
  const held = makeBody({ width: 70, height: 30 }, { x: 110, y: 90 }, 0);
  const remoteA = makeBody({ width: 80, height: 30 }, { x: 680, y: 300 }, 1);
  const remoteB = makeBody({ width: 80, height: 30 }, { x: 700, y: 300 }, 2);
  Matter.Composite.add(engine.world, [held, remoteA, remoteB]);
  const iterations = engine.positionIterations;
  engine.positionIterations = 0;
  Matter.Engine.update(engine, physics.SKILL_PHYSICS_STEP);
  engine.positionIterations = iterations;
  assert.ok(engine.pairs.list.some((pair) => pair.isActive && pair.collision.depth > 0.8));
  const start = held.position.x;
  const grip = physics.createSkillDrag(Matter, held, held.position);
  grip.target.x += physics.SKILL_DRAG_MAX_VELOCITY / 2;
  update(engine, [held, remoteA, remoteB], 900, 400, grip);
  assert.ok(held.position.x - start > physics.SKILL_DRAG_MAX_VELOCITY / 2 - 0.1,
    "An unrelated compressed pair must not consume the free label's drag movement");
  physics.releaseSkillDrag(Matter, grip);
  Matter.Engine.clear(engine);
}

// Regression: predictive bounds cross the floor while actual vertices stay in
// the world. Post-solver clamping must not shove this card into its neighbour.
const contained = makeBody({ width: 80, height: 30 }, { x: 100, y: 575 }, 0);
Matter.Body.setVelocity(contained, { x: 0, y: 8 });
Matter.Bounds.update(contained.bounds, contained.vertices, contained.velocity);
const positionBefore = { ...contained.position };
physics.containSkillBody(Matter, contained, 980, 603);
assert.deepEqual(contained.position, positionBefore, "Containment must ignore predictive bounds");

// A dragged label must remain in the physical world and push its neighbour.
// This fails the old implementation, which removed it for the entire gesture.
{
  const width = 500, height = 260;
  const { engine } = createWorld(width, height);
  const sizes = [{ width: 80, height: 30 }, { width: 80, height: 30 }];
  const draggable = makeBody(sizes[0], { x: 110, y: 230 }, 0);
  const blocker = makeBody(sizes[1], { x: 220, y: 230 }, 1);
  Matter.Composite.add(engine.world, [draggable, blocker]);
  for (let step = 0; step < 240; step += 1) update(engine, [draggable, blocker], width, height);
  const neighbourX = blocker.position.x;
  const grip = physics.createSkillDrag(Matter, draggable, draggable.position);
  grip.target = { x: 320, y: draggable.position.y };
  for (let step = 0; step < 180; step += 1) {
    update(engine, [draggable, blocker], width, height, grip);
    checkBodies([draggable, blocker], sizes, width, height, "colliding pointer drag");
  }
  assert.ok(Matter.Composite.allBodies(engine.world).includes(draggable), "The held label must stay in the collision world");
  assert.ok(draggable.position.x > 250, "A dragged label must follow the grip");
  assert.ok(blocker.position.x > neighbourX + 80, "Dragging a label must visibly bump its neighbour");
  const releasePosition = { ...draggable.position };
  const gripFriction = grip.frictionStatic;
  physics.releaseSkillDrag(Matter, grip);
  assert.equal(draggable.frictionStatic, gripFriction, "Release must restore the label's original static friction");
  assert.deepEqual(draggable.position, releasePosition, "Releasing a label must not snap it to a new gap");
  for (let step = 0; step < 300; step += 1) update(engine, [draggable, blocker], width, height);
  checkBodies([draggable, blocker], sizes, width, height, "drag release");
  const blockerBefore = blocker.position.x;
  for (let step = 0; step < 100; step += 1) physics.moveSkillBody(Matter, draggable, { x: 12, y: 0 }, [draggable, blocker], width, height);
  assert.equal(blocker.position.x, blockerBefore, "Keyboard nudges must not teleport neighbours");
  checkBodies([draggable, blocker], sizes, width, height, "keyboard after drag");
  Matter.Engine.clear(engine);
  console.log("Pointer drag stays physical, bumps neighbours, and releases without snapping — PASS");
}
// A scaled or scrolled board must map the visible pointer to the same body.
for (const scale of [0.75, 1, 1.5]) {
  const mapped = physics.skillPointerPosition({ x: 120 + 150 * scale, y: -300 + 220 * scale },
    { left: 120, top: -300, width: 980 * scale, height: 538 * scale }, 980, 538);
  assert.ok(Math.abs(mapped.x - 150) < 0.001 && Math.abs(mapped.y - 220) < 0.001, "Pointer conversion must account for scroll and visual scaling");
}

// A lone label must reach the floor, and a previously resting label must fall
// when its support is removed. These fail when Matter leaves it asleep in air.
{
  const width = 500, height = 603;
  const { engine } = createWorld(width, height);
  const body = makeBody({ width: 80, height: 30 }, { x: 250, y: 80 }, 0);
  assert.ok(Number.isFinite(body.inertia), "Labels must rotate to settle into gaps");
  Matter.Composite.add(engine.world, body);
  for (let step = 0; step < 1200; step += 1) update(engine, [body], width, height);
  assert.ok(Math.max(...body.vertices.map((vertex) => vertex.y)) > height - physics.SKILL_WORLD_INSET - 1, "An isolated label must fall to the floor");
  Matter.Composite.remove(engine.world, body);
  const support = Matter.Bodies.rectangle(250, 350, 200, 30, { isStatic: true });
  Matter.Body.setPosition(body, { x: 250, y: 250 });
  Matter.Body.setVelocity(body, { x: 0, y: 0 });
  Matter.Composite.add(engine.world, [support, body]);
  for (let step = 0; step < 600; step += 1) update(engine, [body], width, height);
  const restingY = body.position.y;
  assert.ok(restingY < 340, "The test label must first rest on its support");
  Matter.Composite.remove(engine.world, support);
  for (let step = 0; step < 600; step += 1) update(engine, [body], width, height);
  assert.ok(body.position.y > restingY + 150, "Removing support must let the label fall without waking it manually");
  assert.equal(body.isSleeping, false);
  Matter.Engine.clear(engine);
}

// Actual padded polygons may rest with a subpixel contact gap. Test connections
// with a 0.5px tolerance, using SAT over their current vertices, not visual AABBs.
function touches(a, b) {
  for (const axis of [...a.axes, ...b.axes]) {
    const aProjection = a.vertices.map((point) => point.x * axis.x + point.y * axis.y);
    const bProjection = b.vertices.map((point) => point.x * axis.x + point.y * axis.y);
    if (Math.max(...aProjection) + 0.5 < Math.min(...bProjection) ||
      Math.max(...bProjection) + 0.5 < Math.min(...aProjection)) return false;
  }
  return true;
}
function assertGrounded(bodies, floor, context) {
  const connected = new Set([floor]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const body of bodies) {
      if (connected.has(body)) continue;
      if ([...connected].some((other) => touches(body, other))) {
        connected.add(body);
        changed = true;
      }
    }
  }
  const floating = bodies.filter((body) => !connected.has(body)).map((body) => body.plugin.index);
  assert.deepEqual(floating, [], `${context}: labels must connect through contacts to the floor, not float: ${floating.join(", ")}`);
}

const layoutOnly = process.argv.includes("--layout");
const dragOnly = process.argv.includes("--drag");
const selectedCase = process.argv.find((argument) => argument.startsWith("--case="))?.slice(7);
const selectedSeed = process.argv.find((argument) => argument.startsWith("--seed="))?.slice(7);
assert.ok(selectedSeed === undefined || Number.isInteger(Number(selectedSeed)), "--seed must be an integer");
const compactDesktop = layoutOnly || dragOnly;
const scenarios = compactDesktop
  ? [["1055px viewport", 924, 428, 1], ["1835px viewport", 1054, 428, 1]]
  : [["desktop", 980, 538, 1], ["narrow", 340, 478, 1.1]];
assert.ok(!selectedCase || scenarios.some(([name]) => name === selectedCase), "--case must name a scenario");
for (const [name, width, frameHeight, scale] of scenarios.filter(([name]) => !selectedCase || name === selectedCase)) {
  const sizes = desktopSizes.map((size) => ({ width: Math.ceil(size.width * scale), height: Math.ceil(size.height * scale) }));
  const area = sizes.reduce((sum, size) => sum + (size.width + physics.SKILL_COLLISION_PADDING * 2) * (size.height + physics.SKILL_COLLISION_PADDING * 2), 0);
  for (const seed of selectedSeed !== undefined ? [Number(selectedSeed)] : compactDesktop ? [42] : [7, 42, 2026]) {
    let height = compactDesktop
      ? physics.skillBoardHeight(sizes, width, frameHeight)
      : Math.ceil(Math.max(frameHeight, area / ((width - 24) * physics.SKILL_PACKING_DENSITY) + 28));
    let { engine, walls } = createWorld(width, height);
    const dropped = [], random = randomGenerator(seed);
    const waiting = sizes.map((size, index) => makeBody(size, { x: width / 2, y: 40 }, index));
    // Match the real board's shuffled release order and six-label lookahead.
    for (let index = waiting.length - 1; index > 1; index -= 1) {
      const other = 1 + Math.floor(random() * index);
      [waiting[index], waiting[other]] = [waiting[other], waiting[index]];
    }
    let lastDrop = 0, blockedAt = null, growths = 0, worst = 0, steps = 0;
    let stillDuration = 0, firstRestAt = null;
    const context = `${name}/seed ${seed}`;
    for (; steps < 14400; steps += 1) {
      if (waiting.length && steps % 8 === 0) {
        let released = false;
        for (let candidate = 0; candidate < Math.min(6, waiting.length); candidate += 1) {
          const body = waiting[candidate];
          Matter.Body.setAngle(body, (random() - 0.5) * 0.2);
          let clear = false;
          for (let attempt = 0; attempt < 12; attempt += 1) {
            const halfWidth = (body.bounds.max.x - body.bounds.min.x) / 2;
            const halfHeight = (body.bounds.max.y - body.bounds.min.y) / 2;
            Matter.Body.setPosition(body, {
              x: halfWidth + 11 + random() * (width - 22 - 2 * halfWidth),
              y: halfHeight + 10 + random() * 22,
            });
            if (!Matter.Query.collides(body, dropped).length) { clear = true; break; }
          }
          if (!clear) continue;
          Matter.Body.setVelocity(body, { x: (random() - 0.5) * 0.9, y: 0 });
          Matter.Composite.add(engine.world, body);
          dropped.push(body);
          waiting.splice(candidate, 1);
          lastDrop = steps;
          blockedAt = null;
          released = true;
          break;
        }
        if (!released) blockedAt ??= steps;
      }
      if (waiting.length && blockedAt !== null && (steps - blockedAt) * physics.SKILL_PHYSICS_STEP > physics.SKILL_DROP_BLOCKED_MS) {
        // More vertical room lets the existing pile fall naturally. No label is
        // repositioned, frozen, pre-packed or forced through another label.
        const before = dropped.map((body) => ({ x: body.position.x, y: body.position.y, angle: body.angle }));
        Matter.Composite.remove(engine.world, walls);
        height += 64;
        walls = physics.createSkillWalls(Matter, width, height);
        Matter.Composite.add(engine.world, walls);
        assert.deepEqual(dropped.map((body) => ({ x: body.position.x, y: body.position.y, angle: body.angle })), before, "Growing the world must never rearrange labels");
        blockedAt = null;
        growths += 1;
      }
      update(engine, dropped, width, height);
      if (steps % 4 === 0) worst = Math.max(worst, checkBodies(dropped, sizes, width, height, `${context}: drop ${steps}`));
      if (!waiting.length) {
        stillDuration = physics.isSkillPileStill(dropped) ? stillDuration + physics.SKILL_PHYSICS_STEP : 0;
        if (firstRestAt === null && stillDuration >= 1200) {
          firstRestAt = ((steps - lastDrop) * physics.SKILL_PHYSICS_STEP / 1000).toFixed(2);
          assertGrounded(dropped, walls[0], `${context}: animation idle threshold`);
        }
      }
      if (!waiting.length && steps - lastDrop >= 2400) break;
    }
    assert.equal(dropped.length, catalogCount, `${context}: all ${catalogCount} labels must eventually drop`);
    assert.ok(steps < 14400, `${context}: drop must finish within a finite run`);
    assert.ok(dropped.every((body) => !body.isSleeping), `${context}: no label may sleep in air`);
    assertGrounded(dropped, walls[0], context);
    const pileHeight = height - physics.SKILL_WORLD_INSET - Math.min(...dropped.flatMap((body) => body.vertices.map((vertex) => vertex.y)));
    const naturalUpsideDown = dropped.filter((body) => Math.cos(body.angle) < 0).length;
    if (layoutOnly) {
      assert.equal(growths, 0, `${context}: all labels must fit without expanding the desktop board`);
      assert.ok(height >= 330 && height <= 428, `${context}: desktop board must remain compact`);
      assert.ok(height - pileHeight >= 40 && height - pileHeight <= 130, `${context}: leave modest room above the settled pile`);
      console.log(`${context}: all ${catalogCount} labels fit ${width}×${height}, settled pile ${pileHeight.toFixed(1)}px, headroom ${(height - pileHeight).toFixed(1)}px — PASS`);
      Matter.Engine.clear(engine);
      continue;
    }

    // A 100ms mouse sweep (300ms on the dense touch board) must lift a bottom label
    // hundreds of pixels while bumping the actual pile. Slow ploughing was broken drag.
    // Allow up to 6px of transient edge compression while pushing; the writing
    // stays inside wider shape padding. Resting labels stay within one rendered pixel.
    {
      const picked = dropped.find((body) => body.plugin.index === 0);
      const from = { ...picked.position };
      const to = { x: width * (from.x > width / 2 ? 0.25 : 0.75), y: Math.max(70, from.y - 300) };
      const fastGrip = physics.createSkillDrag(Matter, picked, from);
      let physicsMs = 0;
      let collisionSteps = 0;
      const engineUpdate = Matter.Engine.update;
      Matter.Engine.update = (...args) => { collisionSteps += 1; return engineUpdate(...args); };
      const gestureFrames = width >= 700 ? 12 : 36;
      for (let frame = 1; frame <= gestureFrames; frame += 1) {
        fastGrip.target = { x: from.x + (to.x - from.x) * frame / gestureFrames, y: from.y + (to.y - from.y) * frame / gestureFrames };
        const started = performance.now();
        update(engine, dropped, width, height, fastGrip);
        physicsMs += performance.now() - started;
        checkBodies(dropped, sizes, width, height, `${context}: fast diagonal grip ${frame}`, 6);
      }
      Matter.Engine.update = engineUpdate;
      // Release may arrive between frames; complete its last pointer movement
      // for at most the same 200ms grace used by the UI controller.
      for (let frame = 0; frame < 24 && Math.hypot(picked.position.x - to.x, picked.position.y - to.y) >= 2; frame += 1)
        update(engine, dropped, width, height, fastGrip);
      const lag = Math.hypot(picked.position.x - to.x, picked.position.y - to.y);
      assert.ok(lag < 45, `${context}: a fast pickup must track the pointer (lag ${lag.toFixed(1)}px)`);
      physics.releaseSkillDrag(Matter, fastGrip);
      for (let frame = 0; frame < 480; frame += 1) update(engine, dropped, width, height);
      console.log(`${context}: fast diagonal pickup lag ${lag.toFixed(1)}px, physics ${(physicsMs / (gestureFrames / 2)).toFixed(1)}ms / ${(collisionSteps / (gestureFrames / 2)).toFixed(1)} solves per display frame — PASS`);
    }
    if (dragOnly) {
      checkBodies(dropped, sizes, width, height, `${context}: released fast drag`);
      assertGrounded(dropped, walls[0], `${context}: released fast drag`);
      Matter.Engine.clear(engine);
      continue;
    }

    // Pull a genuinely buried label through its settled neighbours, then sweep
    // it across the pile. Contacts must remain active throughout the gesture.
    const held = dropped.reduce((lowest, body) => body.position.y > lowest.position.y ? body : lowest);
    const buriedY = held.position.y;
    const from = { ...held.position };
    const lifted = { x: from.x, y: Math.max(100, buriedY - 300) };
    const grip = physics.createSkillDrag(Matter, held, held.position);
    for (let step = 0; step < 1500; step += 1) {
      // Feed actual pointer travel, rather than teleporting the target hundreds
      // of pixels in zero elapsed time. Fast 100ms pickup is covered above.
      if (step < 360) {
        const t = Math.min(1, (step + 1) / 36);
        grip.target = { x: from.x, y: from.y + (lifted.y - from.y) * t };
      }
      if (step === 360) assert.ok(held.position.y < buriedY - 150, `${context}: a buried label must lift through its neighbours (moved ${(buriedY - held.position.y).toFixed(1)}px)`);
      if (step >= 360 && step < 900) {
        const t = Math.min(1, (step - 359) / 36);
        grip.target = {
          x: lifted.x + (width * (0.1 + 0.8 * Math.sin(step / 80) ** 2) - lifted.x) * t,
          y: lifted.y + (height - 60 - lifted.y) * t,
        };
      }
      if (step === 900) {
        const before = { ...held.position };
        physics.releaseSkillDrag(Matter, grip);
        assert.deepEqual(held.position, before, "Releasing must preserve the real physical position");
        assert.ok(Matter.Composite.allBodies(engine.world).includes(held), "A dragged label must never leave the world");
      }
      update(engine, dropped, width, height, step < 900 ? grip : null);
      // Sustained pressure against a dense wall can briefly compress contacts
      // in a discrete solver. Record that depth while the hand is forcing it;
      // require clean, bounded contact again within 500ms of release.
      if (step % 2 === 0) worst = Math.max(worst, checkBodies(
        dropped, sizes, width, height, `${context}: colliding drag/release ${step}`, step < 960 ? Infinity : 1,
      ));
    }
    // Every label receives four large keyboard moves into its neighbours.
    for (const body of dropped) {
      for (const delta of [{ x: 30, y: 0 }, { x: 0, y: 30 }, { x: -30, y: 0 }, { x: 0, y: -30 }]) {
        physics.moveSkillBody(Matter, body, delta, dropped, width, height);
        worst = Math.max(worst, checkBodies(dropped, sizes, width, height, `${context}: keyboard ${body.plugin.index}`));
      }
    }
    // Removing support through dragging must also settle back into one pile.
    for (let step = 0; step < 2400; step += 1) {
      update(engine, dropped, width, height);
      if (step % 4 === 0) worst = Math.max(worst, checkBodies(dropped, sizes, width, height, `${context}: settle ${step}`));
    }
    assertGrounded(dropped, walls[0], `${context}: after interaction`);
    if (name === "desktop" && seed === 42) {
      // Regression for a wall-supported arch: move the floor underneath a fully
      // settled pile with angled labels touching both sidewalls. The pile must
      // drop into the extra space, not hang against the walls in midair.
      const angledWallLabels = dropped.filter((body) => Math.abs(Math.sin(body.angle)) > 0.01 &&
        (Math.min(...body.vertices.map((vertex) => vertex.x)) < physics.SKILL_WORLD_INSET + 0.5 ||
          Math.max(...body.vertices.map((vertex) => vertex.x)) > width - physics.SKILL_WORLD_INSET - 0.5));
      assert.ok(angledWallLabels.length > 0, "The hanging-arch regression needs angled sidewall contacts");
      const averageY = () => dropped.reduce((sum, body) => sum + body.position.y, 0) / dropped.length;
      const restingY = averageY();
      const movedFloorHeight = height + 64;
      Matter.Composite.remove(engine.world, walls);
      walls = physics.createSkillWalls(Matter, width, movedFloorHeight);
      Matter.Composite.add(engine.world, walls);
      assert.equal(averageY(), restingY, "Extending the floor must not translate labels");
      for (let step = 0; step < 1200; step += 1) {
        update(engine, dropped, width, movedFloorHeight);
        if (step % 4 === 0) worst = Math.max(worst, checkBodies(dropped, sizes, width, movedFloorHeight, `${context}: wall arch ${step}`));
      }
      assert.ok(averageY() > restingY + 32, "Angled labels must fall when their floor support moves, not hang from sidewalls");
      assertGrounded(dropped, walls[0], `${context}: after floor moves`);
      console.log(`wall-hanging regression: ${angledWallLabels.length} angled sidewall labels, pile fell ${(averageY() - restingY).toFixed(1)}px without rearrangement — PASS`);
    }
    Matter.Engine.clear(engine);
    console.log(`${context}: ${width}×${height}, ${dropped.length} naturally dropped, ${growths} floor extensions, pile height ${pileHeight.toFixed(1)}px, maximum visible overlap ${worst.toFixed(2)}px, idle after ${firstRestAt ?? "over20"}s, upside-down ${naturalUpsideDown}/${dropped.filter((body) => Math.cos(body.angle) < 0).length} — PASS`);
  }
}
console.log("Skill physics checks passed.");
