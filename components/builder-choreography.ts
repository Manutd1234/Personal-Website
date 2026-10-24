export type BuilderPoint = [number, number];
export type BuilderArm = {
  shoulder: BuilderPoint;
  elbow: BuilderPoint;
  hand: BuilderPoint;
};
export type BuilderChoreography = {
  right: BuilderArm;
  left: BuilderArm;
  headTilt: number;
  gaze: BuilderPoint;
  blocks: BuilderPoint[];
  wires: [number, number];
  checks: number;
  typing: boolean;
  carrying: boolean;
  launch: number;
};

type PointFrame = readonly [number, number, number];
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const interval = (p: number, start: number, end: number) => clamp((p - start) / (end - start));
const ease = (value: number) => {
  const t = clamp(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
function pointAt(p: number, frames: readonly PointFrame[]): BuilderPoint {
  for (let i = 1; i < frames.length; i += 1) {
    const a = frames[i - 1], b = frames[i];
    if (p <= b[0]) {
      const t = ease(interval(p, a[0], b[0]));
      return [a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }
  }
  const last = frames[frames.length - 1];
  return [last[1], last[2]];
}

const rightRest: BuilderPoint = [253, 251];
const leftRest: BuilderPoint = [227, 247];
const rightFrame = (time: number): PointFrame => [time, ...rightRest];
const leftFrame = (time: number): PointFrame => [time, ...leftRest];

/** All authored targets stay forward of the shoulders and below the chest.
 * A single downward elbow branch keeps 44/46-unit limbs constant without
 * branch changes, flaring or independent elbow/hand interpolation. */
export function resolveDeskArm(side: "right" | "left", hand: BuilderPoint): BuilderArm {
  const shoulder: BuilderPoint = side === "right" ? [197, 214] : [177, 210];
  const dx = hand[0] - shoulder[0], dy = hand[1] - shoulder[1];
  const distance = Math.hypot(dx, dy);
  const along = (44 ** 2 - 46 ** 2 + distance ** 2) / (2 * distance);
  const down = Math.sqrt(Math.max(0, 44 ** 2 - along ** 2));
  return {
    shoulder,
    elbow: [shoulder[0] + dx * along / distance - dy * down / distance, shoulder[1] + dy * along / distance + dx * down / distance],
    hand,
  };
}

/** Shared hand/prop choreography. Each chapter starts and ends at rest, with
 * comfortable reaches, small wrist movements and time to read the result. */
export function sampleBuilderChoreography(stage: number, progress: number): BuilderChoreography {
  const p = Number.isFinite(progress) ? clamp(progress) : 0;
  let right: BuilderPoint = [...rightRest], left: BuilderPoint = [...leftRest];
  const pose: BuilderChoreography = {
    right: resolveDeskArm("right", right), left: resolveDeskArm("left", left),
    headTilt: 0, gaze: [0, 0], blocks: [[0, 0], [0, 0], [0, 0]],
    wires: [1, 1], checks: 3, typing: false, carrying: false, launch: 1,
  };
  if (stage === 0) {
    right = pointAt(p, [rightFrame(0), rightFrame(.08), [.2, 249, 251], [.72, 249, 251], rightFrame(.94), rightFrame(1)]);
    left = pointAt(p, [leftFrame(0), leftFrame(.08), [.2, 217, 252], [.72, 217, 252], leftFrame(.94), leftFrame(1)]);
    for (const start of [.22, .4, .58]) {
      if (p >= start && p <= start + .1) {
        const t = interval(p, start, start + .1);
        const stroke = Math.sin(t * Math.PI * 2) * Math.sin(t * Math.PI) ** 2;
        right[0] += stroke * 1.7;
        right[1] -= stroke * .6;
      }
    }
    pose.checks = [.3, .48, .66].filter(time => p >= time).length;
    pose.headTilt = pointAt(p, [[0, 0, 0], [.2, 2, 0], [.72, 2, 0], [.94, 0, 0], [1, 0, 0]])[0];
    pose.gaze = pointAt(p, [[0, 0, 0], [.2, 0, 1], [.72, 0, 1], [.94, 0, 0], [1, 0, 0]]);
  } else if (stage === 1) {
    right = pointAt(p, [rightFrame(0), rightFrame(.06), [.14, 233, 238], [.32, 273, 258], [.4, 233, 248], [.58, 273, 248], [.66, 233, 258], [.84, 273, 238], rightFrame(.96), rightFrame(1)]);
    left = pointAt(p, [leftFrame(0), leftFrame(.06), [.14, 207, 238], [.32, 247, 258], [.4, 207, 248], [.58, 247, 248], [.66, 207, 258], [.84, 247, 238], leftFrame(.96), leftFrame(1)]);
    const carries = [{start: .14, end: .32, y: 258, offsetY: -20}, {start: .4, end: .58, y: 248, offsetY: 0}, {start: .66, end: .84, y: 238, offsetY: 20}];
    pose.blocks = carries.map(({start, end, y, offsetY}) => {
      const t = interval(p, start + .018, end - .025);
      const clearance = Math.min(offsetY, 0) - 5;
      const offset = pointAt(t, [[0, -40, offsetY], [.25, -40, clearance], [.72, 0, clearance], [1, 0, 0]]);
      if (p >= start && p <= end) {
        // Palms support the underside; fingers curl up the two lower corners.
        right = [273 + offset[0], y + offset[1]];
        left = [247 + offset[0], y + offset[1]];
        pose.carrying = true;
      }
      return offset;
    });
    pose.headTilt = pointAt(p, [[0, 0, 0], [.14, 1.5, 0], [.84, 1.5, 0], [.96, 0, 0], [1, 0, 0]])[0];
    pose.gaze = pointAt(p, [[0, 0, 0], [.14, 0, 1], [.84, 1, 1], [.96, 0, 0], [1, 0, 0]]);
  } else if (stage === 2) {
    right = pointAt(p, [rightFrame(0), rightFrame(.14), [.22, 238, 228], [.26, 238, 238], [.36, 238, 238], [.44, 266, 242], [.5, 266, 242], [.57, 262, 228], [.62, 262, 238], [.74, 262, 238], rightFrame(.94), rightFrame(1)]);
    left = pointAt(p, [leftFrame(0), leftFrame(.1), [.2, 221, 252], [.76, 221, 252], leftFrame(.94), leftFrame(1)]);
    pose.wires = [ease(interval(p, .26, .4)), ease(interval(p, .62, .76))];
    pose.headTilt = pointAt(p, [[0, 0, 0], [.22, 1.5, 0], [.66, 1.5, 0], [.84, -1, 0], [.94, 0, 0], [1, 0, 0]])[0];
  } else if (stage === 3) {
    right = pointAt(p, [rightFrame(0), rightFrame(.06), [.16, 263, 253], [.8, 263, 253], rightFrame(.94), rightFrame(1)]);
    left = pointAt(p, [leftFrame(0), leftFrame(.06), [.16, 233, 244], [.8, 233, 244], leftFrame(.94), leftFrame(1)]);
    const lineStart = [.18, .32, .46, .6].find(start => p >= start && p < start + .11);
    pose.typing = lineStart !== undefined;
    if (lineStart !== undefined) {
      const t = interval(p, lineStart, lineStart + .11);
      const tap = Math.sin(t * Math.PI * 4) * Math.sin(t * Math.PI) ** 2;
      right[1] -= Math.max(0, tap) * .8;
      left[1] -= Math.max(0, -tap) * .8;
    }
    pose.headTilt = pointAt(p, [[0, 0, 0], [.16, 1.5, 0], [.46, 1.5, 0], [.62, -1, 0], [.8, -1, 0], [.94, 0, 0], [1, 0, 0]])[0];
    pose.gaze = pointAt(p, [[0, 0, 0], [.16, 0, 1], [.46, 0, 1], [.62, 1.5, -1], [.8, 1.5, -1], [.94, 0, 0], [1, 0, 0]]);
  } else if (stage === 4) {
    right = pointAt(p, [rightFrame(0), rightFrame(.08), [.18, 239, 248], [.23, 239, 250], [.3, 250, 246], [.54, 250, 246], [.64, 264, 249], [.69, 264, 251], rightFrame(.82), rightFrame(1)]);
    pose.checks = [.26, .4, .54].filter(time => p >= time).length;
    pose.launch = ease(interval(p, .69, .9));
    pose.headTilt = pointAt(p, [[0, 0, 0], [.18, 1.5, 0], [.32, -1, 0], [.54, -1, 0], [.64, 1, 0], [.78, -1, 0], [.96, 0, 0], [1, 0, 0]])[0];
    pose.gaze = pointAt(p, [[0, 0, 0], [.3, 1.5, -1], [.54, 1.5, -1], [.64, 0, 1], [.78, 1.5, -1], [.96, 0, 0], [1, 0, 0]]);
  }
  pose.right = resolveDeskArm("right", right);
  pose.left = resolveDeskArm("left", left);
  return pose;
}
