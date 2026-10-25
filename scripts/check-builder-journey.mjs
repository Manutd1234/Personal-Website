import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Load the real components, without introducing a test framework or browser dependency.
function sourceLoader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const js = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    const localRequire = name => {
      if (name in overrides) return overrides[name];
      if (!name.startsWith(".")) return require(name);
      const stem = resolve(dirname(file), name);
      const target = [stem, `${stem}.ts`, `${stem}.tsx`].find(candidate => existsSync(candidate));
      assert.ok(target, `Missing local import ${name}`);
      return load(target);
    };
    new Function("require", "module", "exports", js)(localRequire, module, module.exports);
    return module.exports;
  }
  return load;
}

const load = sourceLoader();
const { ActivePlaybackClock, BUILD_STAGE_DURATION_MS, BUILD_ACTION_BEATS_MS, sceneActionStart, sceneBeatAt } = load(resolve(root, "components/build-journey-timeline.ts"));
let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`✓ ${name}`);
}

test("hidden time and repeated pause/resume calls cannot skip a stage", () => {
  const clock = new ActivePlaybackClock();
  clock.setRunning(true, 100);
  clock.setRunning(true, 500); // A repeated visibility notification must not restart it.
  clock.setRunning(false, 1100);
  clock.setRunning(false, 50000);
  assert.equal(clock.elapsedAt(60000), 1000);
  clock.setRunning(true, 60000);
  assert.equal(clock.remainingUntil(BUILD_STAGE_DURATION_MS, 60500), 4600);
  clock.setRunning(false, 60500);
  assert.equal(clock.elapsedAt(70000), 1500);
});

test("replay starts the chosen action without erasing completed earlier work", () => {
  assert.equal(sceneBeatAt(sceneActionStart(0)), 0);
  assert.equal(sceneBeatAt(sceneActionStart(1)), 2);
  assert.equal(sceneBeatAt(sceneActionStart(2)), 4);
  const clock = new ActivePlaybackClock();
  clock.setRunning(true, 0);
  clock.reset(sceneActionStart(2), 9000);
  assert.equal(sceneBeatAt(clock.elapsedAt(9000)), 4);
  assert.equal(sceneBeatAt(clock.elapsedAt(9660)), 5);
  assert.equal(sceneBeatAt(clock.elapsedAt(10300)), 6);
});

test("every gesture has time to land before the five-stage advance", () => {
  assert.ok(BUILD_STAGE_DURATION_MS - BUILD_ACTION_BEATS_MS.at(-1) >= 1000);
  for (let index = 0; index < BUILD_ACTION_BEATS_MS.length; index++) {
    const deadline = BUILD_ACTION_BEATS_MS[index];
    assert.equal(sceneBeatAt(deadline - .01), index);
    assert.equal(sceneBeatAt(deadline), index + 1);
  }
});

// A small hook/event harness exercises actual component handlers and timer effects.
// Visual rendering, layout and pointer hit targets remain browser QA responsibilities.
function hookHarness() {
  const slots = [];
  let cursor = 0;
  let version = 0;
  let effects = [];
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], next => {
        const value = typeof next === "function" ? next(slots[index]) : next;
        if (!Object.is(value, slots[index])) { slots[index] = value; version++; }
      }];
    },
    useRef(value) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: value };
      return slots[index];
    },
    useId() { cursor++; return "builder-regression"; },
    useEffect(effect, dependencies) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || dependencies.some((item, i) => !Object.is(item, previous.dependencies[i]))) {
        effects.push(() => {
          previous?.cleanup?.();
          slots[index] = { dependencies, cleanup: effect() };
        });
      }
    },
  };
  return {
    hooks,
    render(Component, props) {
      for (let attempts = 0; attempts < 20; attempts++) {
        cursor = 0;
        effects = [];
        const before = version;
        const tree = Component(props);
        effects.forEach(effect => effect());
        if (before === version) return tree;
      }
      throw new Error("Component effects did not settle");
    },
    dispose() { slots.forEach(slot => slot?.cleanup?.()); },
  };
}
function elements(tree) {
  if (!tree || typeof tree !== "object") return [];
  return [tree, ...React.Children.toArray(tree.props?.children).flatMap(elements)];
}
function find(tree, predicate) {
  const match = elements(tree).find(predicate);
  assert.ok(match, "Expected control was not rendered");
  return match;
}

const originalPerformance = globalThis.performance;
const originalWindow = globalThis.window;
let now = 0;
let sequence = 0;
const timers = new Map();
globalThis.performance = { now: () => now };
globalThis.window = {
  setTimeout(callback, delay) { const id = ++sequence; timers.set(id, { due: now + delay, callback }); return id; },
  clearTimeout(id) { timers.delete(id); },
};
const advance = ms => {
  now += ms;
  const due = [...timers].filter(([, timer]) => timer.due <= now);
  due.forEach(([id, timer]) => { timers.delete(id); timer.callback(); });
};
try {
  test("Pause survives hiding and reopening Profile; Play resumes the remaining stage", () => {
    timers.clear(); now = 0;
    const harness = hookHarness();
    let visible = true;
    const componentLoad = sourceLoader({ react: harness.hooks, "./useVisiblePlayback": { useVisiblePlayback: () => ({ ref: { current: null }, visible }) }, "./useMotionPreference": { useMotionPreference: () => false } });
    const Component = componentLoad(resolve(root, "components/BuildJourney.tsx")).default;
    const render = () => harness.render(Component, { openProjects() {} });
    let tree = render();
    advance(1800);
    find(tree, node => node.props?.["aria-label"] === "Pause build animation").props.onClick();
    tree = render();
    assert.equal(tree.props["data-running"], false);
    assert.equal(timers.size, 0);
    visible = false; render(); advance(30000); visible = true; tree = render();
    assert.equal(tree.props["data-running"], false);
    find(tree, node => node.props?.["aria-label"] === "Play build animation").props.onClick();
    tree = render();
    assert.equal([...timers.values()][0].due - now, 4300);
    harness.dispose();
  });

  test("keyboard focus holds the current stage without stopping its action or resetting time", () => {
    timers.clear(); now = 0;
    const harness = hookHarness();
    const componentLoad = sourceLoader({ react: harness.hooks, "./useVisiblePlayback": { useVisiblePlayback: () => ({ ref: { current: null }, visible: true }) }, "./useMotionPreference": { useMotionPreference: () => false } });
    const Component = componentLoad(resolve(root, "components/BuildJourney.tsx")).default;
    const render = () => harness.render(Component, { openProjects() {} });
    let tree = render();
    advance(1900);
    const scene = find(tree, node => typeof node.props?.onFocusChange === "function");
    scene.props.onFocusChange(true); tree = render();
    assert.equal(timers.size, 0);
    assert.equal(find(tree, node => typeof node.props?.onFocusChange === "function").props.animate, true);
    advance(10000);
    scene.props.onFocusChange(false); render();
    assert.equal([...timers.values()][0].due - now, 4200);
    harness.dispose();
  });

  test("an explicit replay resets the stage deadline, but focus alone does not", () => {
    timers.clear(); now = 0;
    const harness = hookHarness();
    const componentLoad = sourceLoader({ react: harness.hooks, "./useVisiblePlayback": { useVisiblePlayback: () => ({ ref: { current: null }, visible: true }) }, "./useMotionPreference": { useMotionPreference: () => false } });
    const Component = componentLoad(resolve(root, "components/BuildJourney.tsx")).default;
    const render = () => harness.render(Component, { openProjects() {} });
    let tree = render();
    advance(4000);
    const scene = find(tree, node => typeof node.props?.onReplay === "function");
    scene.props.onFocusChange(true); tree = render();
    scene.props.onReplay(); render();
    advance(7000);
    scene.props.onFocusChange(false); render();
    assert.equal([...timers.values()][0].due - now, BUILD_STAGE_DURATION_MS);
    harness.dispose();
  });

  test("default playback visits all five stages in order and returns to the first", () => {
    timers.clear(); now = 0;
    const harness = hookHarness();
    const componentLoad = sourceLoader({ react: harness.hooks, "./useVisiblePlayback": { useVisiblePlayback: () => ({ ref: { current: null }, visible: true }) }, "./useMotionPreference": { useMotionPreference: () => false } });
    const Component = componentLoad(resolve(root, "components/BuildJourney.tsx")).default;
    const render = () => harness.render(Component, { openProjects() {} });
    for (let stage = 0; stage <= 5; stage++) {
      const tree = render();
      const selected = find(tree, node => node.props?.["aria-current"] === "step");
      assert.ok(selected.props["aria-label"].startsWith(`Stage ${stage % 5 + 1}:`));
      assert.equal(timers.size, 1);
      advance(BUILD_STAGE_DURATION_MS);
    }
    harness.dispose();
  });

  test("monitor buttons replay the selected gesture and a paused scene schedules no work", () => {
    timers.clear(); now = 0;
    const harness = hookHarness();
    const componentLoad = sourceLoader({ react: harness.hooks });
    const Component = componentLoad(resolve(root, "components/BuildJourneyScene.tsx")).default;
    let replays = 0;
    const props = { stage: 3, description: "Example", onFocusChange() {}, onReplay() { replays++; }, animate: true, reducedMotion: false };
    let tree = harness.render(Component, props);
    const controls = elements(tree).filter(node => node.props?.className === "montage-step-card");
    assert.equal(controls.length, 3);
    controls.forEach(control => { assert.equal(control.type, "button"); assert.equal(control.props.type, "button"); });
    controls[2].props.onClick(); tree = harness.render(Component, props);
    assert.equal(replays, 1);
    assert.equal(tree.props["data-completed"], 2);
    advance(660); tree = harness.render(Component, props);
    assert.equal(tree.props["data-inspecting"], true);
    props.animate = false; tree = harness.render(Component, props);
    assert.equal(timers.size, 0);
    const heldBeat = tree.props["data-beat"];
    advance(10000); tree = harness.render(Component, props);
    assert.equal(tree.props["data-beat"], heldBeat);
    props.animate = true; harness.render(Component, props);
    assert.ok([...timers.values()][0].due - now > 0);
    harness.dispose();
  });

  for (const animate of [true, false]) {
    test(`returning after an ${animate ? "animated" : "immediate paused"} replay starts a fresh stage without a stale announcement`, () => {
      timers.clear(); now = 0;
      const harness = hookHarness();
      const componentLoad = sourceLoader({ react: harness.hooks });
      const Component = componentLoad(resolve(root, "components/BuildJourneyScene.tsx")).default;
      const props = { stage: 3, description: "Example", onFocusChange() {}, onReplay() {}, animate, reducedMotion: false };
      let tree = harness.render(Component, props);
      elements(tree).filter(node => node.props?.className === "montage-step-card")[2].props.onClick();
      tree = harness.render(Component, props);
      assert.equal(tree.props["data-completed"], animate ? 2 : 3);
      props.stage = 4; harness.render(Component, props);
      props.stage = 3; tree = harness.render(Component, props);
      assert.equal(tree.props["data-completed"], 0);
      assert.equal(tree.props["data-acted"], false);
      assert.equal(find(tree, node => node.props?.role === "status").props.children, "");
      props.animate = true; harness.render(Component, props);
      advance(BUILD_ACTION_BEATS_MS[0]); tree = harness.render(Component, props);
      assert.equal(tree.props["data-beat"], 1);
      assert.equal(tree.props["data-typing"], true);
      advance(BUILD_ACTION_BEATS_MS.at(-1)); tree = harness.render(Component, props);
      assert.equal(find(tree, node => node.props?.role === "status").props.children, "");
      harness.dispose();
    });
  }
} finally {
  globalThis.performance = originalPerformance;
  globalThis.window = originalWindow;
}

test("all five reduced-motion scenes render completed readable states and native keyboard controls", () => {
  const Scene = load(resolve(root, "components/BuildJourneyScene.tsx")).default;
  for (let stage = 0; stage < 5; stage++) {
    const html = renderToStaticMarkup(React.createElement(Scene, { stage, description: "Example", animate: false, reducedMotion: true, onFocusChange() {}, onReplay() {} }));
    assert.match(html, /data-completed="3"/);
    assert.match(html, /data-typing="false"/);
    assert.match(html, /data-sketching="false"/);
    assert.equal((html.match(/aria-label="Watch the engineer:/g) || []).length, 3);
    assert.match(html, /role="status" aria-live="polite"/);
    assert.doesNotMatch(html, />React<|>TypeScript<|>SQL</);
  }
});
console.log(`Builder journey: ${passed} regression checks passed.`);
