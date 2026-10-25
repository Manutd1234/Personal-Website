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

export const BOOK_MOTION = {
  duration: 820,
  liftEnd: .22,
  unfoldStart: .12,
  openEnd: .54,
  handoffEnd: .64,
} as const;

type PaperBounds = { x: number; y: number; width: number; height: number };

/** Align the reader to the projected paper, including perspective and cover depth. */
export function getBookHandoffTransform(reader: PaperBounds, paper: PaperBounds) {
  const x = paper.x + paper.width / 2 - reader.x - reader.width / 2;
  const y = paper.y + paper.height / 2 - reader.y - reader.height / 2;
  return `translate(${x}px, ${y}px) scale(${paper.width / reader.width}, ${paper.height / reader.height})`;
}

/** Reverse from the exact visible pose, landing at the closed shelf endpoint.
 * A hover fan must not survive the reverse and fold again after landing. */
export function getBookReverseFrames(restingFrames: Keyframe[], progress: number, transform: string): Keyframe[] {
  const offset = Math.max(0, Math.min(1, progress));
  return [
    ...restingFrames.filter(frame => typeof frame.offset === "number" && frame.offset < offset),
    {transform, offset},
  ];
}

/** Keep the raised book below the library header at every responsive size. */
export function getBookLiftGeometry(sceneHeight: number, bookHeight: number, scale: number, perspective: number) {
  const lift = Math.min(160, perspective * .2);
  const compensation = 1 - lift / perspective;
  const headroom = Math.max(0, sceneHeight / 2 - bookHeight * scale / 2 - 12);
  const rise = Math.min(104, headroom);
  const originOffset = sceneHeight * .12;
  return {
    lift, compensation, rise,
    raisedY: (originOffset - rise) * compensation - originOffset,
  };
}

/** A fixed nearby shelf stays mounted through opening and closing, so covers
 * can recede in place without popping neighbors or re-decoding their images. */
export function getBookSceneIndexes(count: number, current: number): number[] {
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
  onReverse?: (time: number) => void;
  timelineTime?: () => number | null;
  schedule?: (callback: () => void, delay: number) => () => void;
};

export function runBookTransition({
  animations, duration, direction: initialDirection, onComplete, onReverse,
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
      const boundedTime = Math.max(0, Math.min(duration, Number.isFinite(time) ? time : 0));
      animations.forEach(animation => animation.pause());
      onReverse?.(boundedTime);
      play(boundedTime);
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
