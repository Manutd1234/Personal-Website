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
// The CSS scales the complete tile envelope (font and shape padding) by 7%.
// Keep the original measured metrics as a conservative basis for the fixture.
const desktopSizes = originalDesktopSizes.map(({ width, height }) => ({
  width: Math.ceil(width * 0.93),
  height: Math.ceil(height * 0.93),
}));
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
  const engine = physics.createSkillEngine(Matter);
  assert.equal(engine.enableSleeping, false, "Skill labels must remain responsive to lost support");
  const walls = physics.createSkillWalls(Matter, width, height);
  Matter.Composite.add(engine.world, walls);
  return { engine, walls };
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

// Pointer pickup must pass freely over another label, then re-enter only in
// clear space. The old drag sweep stopped at its neighbour, trapping buried
// labels in a pile. Keyboard nudges deliberately retain that conservative rule.
const draggable = makeBody({ width: 80, height: 30 }, { x: 100, y: 100 }, 0);
const blocker = makeBody({ width: 80, height: 30 }, { x: 300, y: 100 }, 1);
physics.positionHeldSkillBody(Matter, draggable, { x: 300, y: 100 }, 980, 603);
assert.ok(Math.abs(draggable.position.x - 300) < 0.1, "A lifted label must reach the pointer even above an occupied label");
assert.ok(physics.placeReleasedSkillBody(Matter, draggable, [draggable, blocker], 980, 603), "A lifted label must find free space on release");
assert.ok(draggable.position.y < blocker.bounds.min.y, "Releasing above another label must place it on top of the pile");
checkBodies([draggable, blocker], [{ width: 80, height: 30 }, { width: 80, height: 30 }], 980, 603, "pointer release");
Matter.Body.setPosition(draggable, { x: 200, y: 100 });
for (let step = 0; step < 100; step += 1) physics.moveSkillBody(Matter, draggable, { x: 12, y: 0 }, [draggable, blocker], 980, 603);
assert.ok(draggable.position.x > 200 && draggable.position.x <= 300 - 80 - physics.SKILL_COLLISION_PADDING * 2 + 0.1, "Keyboard nudging must stop at its neighbour");

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

for (const [name, width, frameHeight, scale] of [["desktop", 980, 603, 1], ["narrow", 340, 506, 1.1]]) {
  const sizes = desktopSizes.map((size) => ({ width: Math.ceil(size.width * scale), height: Math.ceil(size.height * scale) }));
  const area = sizes.reduce((sum, size) => sum + (size.width + physics.SKILL_COLLISION_PADDING * 2) * (size.height + physics.SKILL_COLLISION_PADDING * 2), 0);
  for (const seed of [7, 42, 2026]) {
    let height = Math.ceil(Math.max(frameHeight, area / ((width - 24) * physics.SKILL_PACKING_DENSITY) + 28));
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

    // Extract a genuinely buried label from a complete natural pile. Its held
    // visual is intentionally above the other labels, outside the collision
    // plane; every unheld label must remain non-overlapping throughout.
    const held = dropped.reduce((lowest, body) => body.position.y > lowest.position.y ? body : lowest);
    const buriedY = held.position.y;
    Matter.Composite.remove(engine.world, held);
    physics.positionHeldSkillBody(Matter, held, { x: width / 2, y: Math.max(100, buriedY - 300) }, width, height);
    assert.ok(held.position.y < buriedY - 250, `${context}: a buried label must lift immediately, not wait for neighbours to move`);
    assert.equal(Matter.Composite.allBodies(engine.world).includes(held), false, "The held label must be outside the collision plane");
    for (let step = 0; step < 1200; step += 1) {
      if (step < 600) physics.positionHeldSkillBody(Matter, held, {
        x: width * (0.1 + 0.8 * Math.sin(step / 80) ** 2), y: height - 18,
      }, width, height);
      if (step === 600) {
        if (!physics.placeReleasedSkillBody(Matter, held, dropped, width, height)) {
          const bodyHeight = held.bounds.max.y - held.bounds.min.y;
          Matter.Composite.remove(engine.world, walls);
          height += Math.max(64, Math.ceil(bodyHeight) + 24);
          walls = physics.createSkillWalls(Matter, width, height);
          Matter.Composite.add(engine.world, walls);
          physics.positionHeldSkillBody(Matter, held, {
            x: held.position.x, y: height - bodyHeight / 2 - 12,
          }, width, height);
        }
        checkBodies(dropped, sizes, width, height, `${context}: before reinsertion`);
        Matter.Composite.add(engine.world, held);
        Matter.Body.setVelocity(held, { x: 30, y: -30 });
      }
      update(engine, dropped, width, height);
      if (step % 2 === 0) worst = Math.max(worst, checkBodies(
        step < 600 ? dropped.filter((body) => body !== held) : dropped,
        sizes, width, height, `${context}: pickup/release/fling ${step}`,
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
