export type BuilderPoint = [number, number];

export type BuilderChoreography = {
  bodyX: number;
  right: BuilderPoint;
  left: BuilderPoint;
  headTilt: number;
  /** Translation offsets from the three blocks' final positions. */
  blocks: BuilderPoint[];
  wires: [number, number];
  checks: number;
  typing: boolean;
  launch: number;
};

type PointFrame = readonly [number, number, number];
type NumberFrame = readonly [number, number];

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const interval = (p: number, start: number, end: number) =>
  clamp((p - start) / (end - start));

function pointAt(p: number, frames: readonly PointFrame[]): BuilderPoint {
  for (let i = 1; i < frames.length; i += 1) {
    const previous = frames[i - 1];
    const next = frames[i];
    if (p <= next[0]) {
      const t = ease(interval(p, previous[0], next[0]));
      return [
        previous[1] + (next[1] - previous[1]) * t,
        previous[2] + (next[2] - previous[2]) * t,
      ];
    }
  }
  const last = frames[frames.length - 1];
  return [last[1], last[2]];
}

function numberAt(p: number, frames: readonly NumberFrame[]) {
  for (let i = 1; i < frames.length; i += 1) {
    const previous = frames[i - 1];
    const next = frames[i];
    if (p <= next[0]) {
      const t = ease(interval(p, previous[0], next[0]));
      return previous[1] + (next[1] - previous[1]) * t;
    }
  }
  return frames[frames.length - 1][1];
}

/** A deterministic chapter timeline shared by the builder and the objects.
 * Hands use global SVG coordinates; only the blocks use relative offsets.
 * Every chapter starts and finishes in the same resting pose.
 */
export function sampleBuilderChoreography(
  stage: number,
  progress: number,
): BuilderChoreography {
  const p = Number.isFinite(progress) ? clamp(progress) : 0;
  const pose: BuilderChoreography = {
    bodyX: 42,
    right: [215, 270],
    left: [114, 289],
    headTilt: 0,
    blocks: [[0, 0], [0, 0], [0, 0]],
    wires: [1, 1],
    checks: 3,
    typing: false,
    launch: 1,
  };

  if (stage === 0) {
    pose.bodyX = numberAt(p, [[0, 42], [0.13, 47], [0.74, 47], [1, 42]]);
    pose.right = pointAt(p, [
      [0, 215, 270],
      [0.12, 232, 206],
      [0.18, 239, 174],
      [0.25, 239, 174],
      [0.41, 239, 219],
      [0.49, 239, 219],
      [0.64, 239, 263],
      [0.72, 239, 263],
      [0.86, 230, 237],
      [1, 215, 270],
    ]);
    // Small pencil strokes happen at the checklist, not during the reach.
    for (const [start, end] of [[0.18, 0.25], [0.41, 0.49], [0.64, 0.72]]) {
      if (p >= start && p <= end) {
        const stroke = interval(p, start, end);
        pose.right[0] += Math.sin(stroke * Math.PI * 4) * 3;
        pose.right[1] += Math.sin(stroke * Math.PI * 2) * 1.5;
      }
    }
    pose.left = [pose.bodyX + 72, 289];
    pose.headTilt = numberAt(p, [[0, 0], [0.18, 5], [0.72, 5], [1, 0]]);
    pose.checks = [0.2, 0.45, 0.68].filter((time) => p >= time).length;
  } else if (stage === 1) {
    const carries = [
      { start: 0.12, end: 0.3, offset: [-60, 18], grip: [240, 287] },
      { start: 0.34, end: 0.54, offset: [-60, 62], grip: [257, 230] },
      { start: 0.58, end: 0.8, offset: [-60, 99], grip: [240, 173] },
    ] as const;
    pose.bodyX = numberAt(p, [[0, 42], [0.12, 46], [0.48, 50], [0.76, 46], [1, 42]]);
    pose.right = pointAt(p, [
      [0, 215, 270],
      [0.12, 180, 305],
      [0.3, 240, 287],
      [0.34, 197, 292],
      [0.54, 257, 230],
      [0.58, 180, 272],
      [0.8, 240, 173],
      [0.88, 229, 216],
      [1, 215, 270],
    ]);
    pose.blocks = carries.map(({ start, end, offset, grip }) => {
      const t = interval(p, start, end);
      const carried: BuilderPoint = [
        offset[0] * (1 - ease(t)),
        offset[1] * (1 - ease(t)) - (t > 0 && t < 1 ? Math.sin(t * Math.PI) * 12 : 0),
      ];
      // Derive the hand from the carried object to prevent contact drift.
      if (p >= start && p <= end) {
        pose.right = [grip[0] + carried[0], grip[1] + carried[1]];
      }
      return carried;
    });
    pose.left = [pose.bodyX + 72, 289];
    pose.headTilt = numberAt(p, [[0, 0], [0.12, -3], [0.3, 3], [0.58, -3], [0.8, 5], [1, 0]]);
  } else if (stage === 2) {
    pose.bodyX = numberAt(p, [[0, 42], [0.32, 42], [0.46, 90], [0.76, 90], [1, 42]]);
    pose.right = pointAt(p, [
      [0, 215, 270],
      [0.1, 240, 245],
      [0.25, 215, 169],
      [0.4, 215, 169],
      [0.46, 260, 245],
      [0.6, 305, 278],
      [0.75, 305, 278],
      [0.84, 260, 260],
      [1, 215, 270],
    ]);
    pose.left = [pose.bodyX + 72, 289];
    pose.headTilt = numberAt(p, [[0, 0], [0.25, 5], [0.42, 0], [0.6, 4], [0.75, 4], [1, 0]]);
    pose.wires = [ease(interval(p, 0.25, 0.4)), ease(interval(p, 0.6, 0.75))];
  } else if (stage === 3) {
    pose.bodyX = numberAt(p, [[0, 42], [0.12, 52], [0.85, 52], [1, 42]]);
    pose.right = pointAt(p, [[0, 215, 270], [0.13, 239, 294], [0.85, 239, 294], [1, 215, 270]]);
    pose.left = pointAt(p, [[0, 114, 289], [0.13, 207, 294], [0.85, 207, 294], [1, 114, 289]]);
    pose.typing = p >= 0.13 && p < 0.7;
    if (pose.typing) {
      const tap = Math.sin(interval(p, 0.13, 0.7) * Math.PI * 24);
      pose.right[1] -= Math.max(0, tap) * 6;
      pose.left[1] -= Math.max(0, -tap) * 6;
    }
    pose.headTilt = numberAt(p, [[0, 0], [0.13, 4], [0.7, 4], [1, 0]]);
  } else if (stage === 4) {
    pose.bodyX = numberAt(p, [[0, 42], [0.16, 47], [0.66, 47], [0.78, 42], [1, 42]]);
    pose.right = pointAt(p, [
      [0, 215, 270],
      [0.1, 235, 240],
      [0.2, 218, 216],
      [0.26, 218, 216],
      [0.38, 218, 250],
      [0.44, 218, 250],
      [0.54, 218, 284],
      [0.59, 218, 284],
      [0.66, 218, 318],
      [0.7, 218, 312],
      [0.78, 226, 190],
      [0.84, 238, 181],
      [0.9, 222, 188],
      [1, 215, 270],
    ]);
    pose.left = pointAt(p, [[0, 114, 289], [0.68, 119, 289], [0.79, 103, 218], [0.85, 83, 193], [0.91, 103, 214], [1, 114, 289]]);
    pose.headTilt = numberAt(p, [[0, 0], [0.2, 4], [0.66, 4], [0.8, -5], [1, 0]]);
    pose.checks = [0.2, 0.38, 0.54].filter((time) => p >= time).length;
    pose.launch = ease(interval(p, 0.68, 0.92));
  }

  return pose;
}
