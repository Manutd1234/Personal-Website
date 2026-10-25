import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOOK_MOTION, getBookLiftGeometry, getBookSceneIndexes, queueBookTransition, runBookTransition } from '../components/book-transition.ts';

test('the cover starts unfolding only after lifting has finished, and closes before lowering on reverse', () => {
  assert.ok(BOOK_MOTION.liftEnd > 0);
  assert.ok(BOOK_MOTION.unfoldStart > BOOK_MOTION.liftEnd);
  assert.ok(BOOK_MOTION.openEnd > BOOK_MOTION.unfoldStart);
  assert.ok(BOOK_MOTION.openEnd < 1);
});

test('the raised paper fits below the library header across phone, tablet and desktop sizes', () => {
  for (const [sceneHeight, bookHeight, scale] of [[450, 241.4, .8], [450, 338, 1], [570, 338, 1]]) {
    const {lift, compensation, rise, raisedY} = getBookLiftGeometry(sceneHeight, bookHeight, scale, 1400);
    const projectedCenter = sceneHeight * .38 + (sceneHeight * .12 + raisedY) / compensation;
    assert.ok(projectedCenter - bookHeight * scale / 2 >= 12 - .001);
    assert.ok(rise > 0 && rise <= 72);
    assert.ok(lift < 1400);
  }
});

test('the mounted shelf stays stable through reading and restores wraparound neighbors', () => {
  assert.deepEqual(getBookSceneIndexes(22, 0), [0, 1, 2, 3, 19, 20, 21]);
  assert.deepEqual(getBookSceneIndexes(22, 21), [0, 1, 2, 18, 19, 20, 21]);
  for (let current = 0; current < 22; current++) {
    const shelf = getBookSceneIndexes(22, current);
    assert.equal(shelf.length, 7);
    assert.ok(shelf.includes(current));
  }
  assert.deepEqual(getBookSceneIndexes(0, 0), []);
  assert.deepEqual(getBookSceneIndexes(2, 0), [0, 1]);
});

function pendingFixture() {
  let frame;
  let visible = true;
  const result = {started: 0, skipped: 0, cancelled: 0};
  const launch = queueBookTransition({
    canStart: () => visible,
    onStart: () => result.started++,
    onSkip: () => result.skipped++,
    requestFrame: callback => {
      frame = callback;
      return () => result.cancelled++;
    },
  });
  return {launch, result, frame: () => frame(), hide: () => {visible = false;}};
}

test('a pending opening settles when its tab hides before the layout frame', () => {
  const f = pendingFixture();
  f.hide(); f.launch.finish(); f.frame(); f.launch.finish();
  assert.deepEqual(f.result, {started: 0, skipped: 1, cancelled: 1});
});

test('the queued frame checks visibility again before measuring or animating', () => {
  const f = pendingFixture();
  f.hide(); f.frame(); f.launch.finish();
  assert.deepEqual(f.result, {started: 0, skipped: 1, cancelled: 0});
});

test('unmount or Escape before the first frame cancels without changing reader state', () => {
  const f = pendingFixture();
  f.launch.cancel(); f.frame(); f.launch.finish();
  assert.deepEqual(f.result, {started: 0, skipped: 0, cancelled: 1});
});

test('a visible opening launches once and is then owned by the animation controller', () => {
  const f = pendingFixture();
  f.frame(); f.frame(); f.launch.finish();
  assert.deepEqual(f.result, {started: 1, skipped: 0, cancelled: 0});
});

function fixture(direction = 1) {
  const jobs = new Set();
  const completed = [];
  const animations = Array.from({length: 3}, () => ({
    currentTime: null, startTime: null, playbackRate: 1, onfinish: null,
    cancellations: 0, pause() {}, play() {}, cancel() { this.cancellations++; },
  }));
  const controller = runBookTransition({animations, duration: 820, direction,
    onComplete: d => completed.push(d), timelineTime: () => 1000,
    schedule: (callback, delay) => {
      const job = {callback, delay}; jobs.add(job); return () => jobs.delete(job);
    },
  });
  return {jobs, completed, animations, controller};
}

test('normal completion releases all effects exactly once', () => {
  const f = fixture();
  const callback = f.animations.at(-1).onfinish;
  callback(); callback(); f.controller.finish();
  assert.deepEqual(f.completed, [1]);
  assert.equal(f.controller.isActive(), false);
  assert.equal(f.jobs.size, 0);
  assert.ok(f.animations.every(a => a.cancellations === 1 && a.onfinish === null));
});

test('Escape during opening reverses at the current position and rejects stale completion', () => {
  const f = fixture();
  const staleFinish = f.animations.at(-1).onfinish;
  f.animations.forEach(a => {a.currentTime = 315;});
  f.controller.close(); f.controller.close();
  staleFinish();
  assert.deepEqual(f.completed, []);
  assert.ok(f.animations.every(a => a.currentTime === 315 && a.playbackRate === -1));
  assert.equal(f.jobs.size, 1);
  assert.equal([...f.jobs][0].delay, 415);
  f.animations.at(-1).onfinish();
  assert.deepEqual(f.completed, [-1]);
});

test('cancellation prevents queued events from completing a replacement transition', () => {
  const f = fixture();
  const oldFinish = f.animations.at(-1).onfinish;
  const oldDeadline = [...f.jobs][0].callback;
  f.controller.cancel(); oldFinish(); oldDeadline();
  assert.deepEqual(f.completed, []);
  assert.equal(f.jobs.size, 0);
  assert.ok(f.animations.every(a => a.cancellations === 1));
});

test('a throttled or missing finish event cannot leave the reader locked', () => {
  const f = fixture(-1);
  assert.ok(f.animations.every(a => a.currentTime === 820 && a.playbackRate === -1));
  [...f.jobs][0].callback();
  assert.deepEqual(f.completed, [-1]);
  assert.equal(f.jobs.size, 0);
  assert.equal(f.controller.isActive(), false);
});

test('repeated open/close cycles do not accumulate timers or effects', () => {
  for (let cycle = 0; cycle < 100; cycle++) {
    const f = fixture(cycle % 2 ? -1 : 1);
    f.controller.finish();
    assert.equal(f.jobs.size, 0);
    assert.ok(f.animations.every(a => a.cancellations === 1));
  }
});


test('enabling reduced motion settles an opening immediately and clears all pending work', () => {
  const f = fixture();
  f.animations.forEach(a => {a.currentTime = 210;});
  const queued = [...f.jobs][0].callback;
  f.controller.finish(); queued();
  assert.deepEqual(f.completed, [1]);
  assert.equal(f.jobs.size, 0);
  assert.ok(f.animations.every(a => a.cancellations === 1));
});

test('unmount while reversing cancels the deadline and ignores the queued finish', () => {
  const f = fixture();
  f.animations.forEach(a => {a.currentTime = 600;});
  f.controller.close();
  const queuedFinish = f.animations.at(-1).onfinish;
  const queuedDeadline = [...f.jobs][0].callback;
  f.controller.cancel(); queuedFinish(); queuedDeadline();
  assert.deepEqual(f.completed, []);
  assert.equal(f.jobs.size, 0);
  assert.equal(f.controller.isActive(), false);
});
