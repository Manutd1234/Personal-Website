/** A bounded WAAPI transition. Completed reading never retains animation effects. */
type TransitionAnimation = Pick<Animation,
  "currentTime" | "startTime" | "playbackRate" | "onfinish" | "pause" | "play" | "cancel">;
export type BookTransition = {
  close: () => void;
  finish: () => void;
  cancel: () => void;
  isActive: () => boolean;
};
export type BookTransitionLaunch = {
  cancel: () => void;
  finish: () => void;
};

/** Opening paper must never share its 3D scene with neighboring covers.
 * A z-index cannot prevent intersections inside a preserve-3d context. Keep
 * only the active book mounted until its closing pose has fully settled. */
export function getBookSceneIndexes(count: number, current: number, activeBook: number | null): number[] {
  if (activeBook !== null) return activeBook >= 0 && activeBook < count ? [activeBook] : [];
  return Array.from({length: count}, (_, index) => index).filter((index) => {
    const distance = Math.abs(index - current);
    return Math.min(distance, count - distance) <= 3;
  });
}

/** The frame that waits for reader layout belongs to the same lifecycle as motion. */
export function queueBookTransition({
  canStart, onStart, onSkip,
  requestFrame = (callback: () => void) => {
    const frame = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(frame);
  },
}: {
  canStart: () => boolean;
  onStart: () => void;
  onSkip: () => void;
  requestFrame?: (callback: () => void) => () => void;
}): BookTransitionLaunch {
  let pending = true;
  const cancelFrame = requestFrame(() => {
    if (!pending) return;
    pending = false;
    if (canStart()) onStart();
    else onSkip();
  });
  return {
    cancel() {
      pending = false;
      cancelFrame();
    },
    finish() {
      if (!pending) return;
      pending = false;
      cancelFrame();
      onSkip();
    },
  };
}
type TransitionOptions = {
  animations: TransitionAnimation[];
  duration: number;
  direction: 1 | -1;
  onComplete: (direction: 1 | -1) => void;
  timelineTime?: () => number | null;
  schedule?: (callback: () => void, delay: number) => () => void;
};

export function runBookTransition({
  animations, duration, direction: initialDirection, onComplete,
  timelineTime = () => null,
  schedule = (callback, delay) => {
    const timer = setTimeout(callback, delay);
    return () => clearTimeout(timer);
  },
}: TransitionOptions): BookTransition {
  let active = true;
  let direction = initialDirection;
  let version = 0;
  let cancelDeadline = () => {};
  const release = () => {
    cancelDeadline();
    animations.forEach((animation) => {
      animation.onfinish = null;
      animation.cancel();
    });
  };
  const complete = (expectedVersion = version) => {
    if (!active || expectedVersion !== version) return;
    active = false;
    // Commit static visibility first, then release every filled effect. This
    // cannot recursively re-arm a finished animation through setKeyframes.
    try { onComplete(direction); } finally { release(); }
  };
  const play = (time: number) => {
    const expectedVersion = ++version;
    cancelDeadline();
    const now = timelineTime();
    animations.forEach((animation) => {
      animation.pause();
      animation.onfinish = null;
      animation.playbackRate = direction;
      animation.currentTime = time;
      animation.play();
      if (now !== null) animation.startTime = now - time / direction;
    });
    const anchor = animations[animations.length - 1];
    if (!anchor) { complete(expectedVersion); return; }
    anchor.onfinish = () => complete(expectedVersion);
    // Visibility changes and throttled browser timelines must not leave the
    // shelf inert forever. Completion is idempotent even if both paths fire.
    cancelDeadline = schedule(() => complete(expectedVersion),
      (direction === 1 ? duration - time : time) + 100);
  };
  const controller: BookTransition = {
    close() {
      if (!active || direction === -1) return;
      direction = -1;
      const time = Number(animations[0]?.currentTime ?? 0);
      play(Math.max(0, Math.min(duration, Number.isFinite(time) ? time : 0)));
    },
    finish: () => complete(),
    cancel() {
      if (!active) return;
      active = false;
      version++;
      release();
    },
    isActive: () => active,
  };
  play(direction === 1 ? 0 : duration);
  return controller;
}
