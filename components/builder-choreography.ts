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
  /** Offsets from the three tiles' final positions on the workbench. */
  blocks: BuilderPoint[];
  wires: [number, number];
  checks: number;
  typing: boolean;
  launch: number;
};

type PointFrame = readonly [number, number, number];
type ArmFrame = readonly [number, number, number, number, number];
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const interval = (p: number, start: number, end: number) => clamp((p - start) / (end - start));
// Zero velocity and acceleration at each authored hold keep starts and stops soft.
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
function armAt(side: "right" | "left", p: number, frames: readonly ArmFrame[]): BuilderArm {
  return {
    shoulder: side === "right" ? [190, 214] : [166, 211],
    elbow: pointAt(p, frames.map(([time, x, y]) => [time, x, y])),
    hand: pointAt(p, frames.map(([time, , , x, y]) => [time, x, y])),
  };
}
const rightRest = [212, 244, 244, 246] as const;
const leftRest = [184, 244, 218, 246] as const;
const rightFrame = (time: number): ArmFrame => [time, ...rightRest];
const leftFrame = (time: number): ArmFrame => [time, ...leftRest];

/** Authored seated poses, not an IK solver. The shoulders stay at the desk,
 * elbows remain below them, and the props are close enough for short reaches.
 * Every chapter starts and ends with both hands resting in the same place. */
export function sampleBuilderChoreography(stage: number, progress: number): BuilderChoreography {
  const p = Number.isFinite(progress) ? clamp(progress) : 0;
  const pose: BuilderChoreography = {
    right: armAt("right", p, [rightFrame(0), rightFrame(1)]),
    left: armAt("left", p, [leftFrame(0), leftFrame(1)]),
    headTilt: 0,
    gaze: [0, 0],
    blocks: [[0, 0], [0, 0], [0, 0]],
    wires: [1, 1],
    checks: 3,
    typing: false,
    launch: 1,
  };

  if (stage === 0) {
    pose.right = armAt("right", p, [rightFrame(0), rightFrame(.08), [.18, 208, 246, 242, 249], [.72, 208, 246, 242, 249], rightFrame(.94), rightFrame(1)]);
    pose.left = armAt("left", p, [leftFrame(0), leftFrame(.08), [.18, 171, 247, 211, 251], [.72, 171, 247, 211, 251], leftFrame(.94), leftFrame(1)]);
    for (const start of [.2, .38, .56]) {
      if (p >= start && p <= start + .12) {
        const t = interval(p, start, start + .12);
        const stroke = Math.sin(t * Math.PI * 2) * Math.sin(t * Math.PI) ** 2;
        pose.right.hand[0] += stroke * 2;
        pose.right.hand[1] -= stroke * .8;
      }
    }
    pose.checks = [.28, .46, .64].filter(time => p >= time).length;
    pose.headTilt = pointAt(p, [[0, 0, 0], [.18, 3, 0], [.72, 3, 0], [.94, 0, 0], [1, 0, 0]])[0];
    pose.gaze = pointAt(p, [[0, 0, 0], [.18, 0, 1.5], [.72, 0, 1.5], [.94, 0, 0], [1, 0, 0]]);
  } else if (stage === 1) {
    pose.right = armAt("right", p, [
      rightFrame(0), rightFrame(.06), [.14, 203, 252, 222, 216], [.32, 232, 229, 270, 246],
      [.4, 196, 249, 222, 232], [.58, 232, 235, 270, 230],
      [.66, 181, 250, 222, 248], [.84, 230, 233, 270, 214], rightFrame(.96), rightFrame(1),
    ]);
    pose.left = armAt("left", p, [
      leftFrame(0), leftFrame(.06), [.14, 151, 245, 184, 216], [.32, 188, 245, 232, 246],
      [.4, 148, 246, 184, 232], [.58, 192, 247, 232, 230],
      [.66, 145, 245, 184, 248], [.84, 197, 241, 232, 214], leftFrame(.96), leftFrame(1),
    ]);
    const carries = [
      { start: .14, end: .32, y: 246, offsetY: -30, rightElbow: [[203, 252], [232, 229]], leftElbow: [[151, 245], [188, 245]] },
      { start: .4, end: .58, y: 230, offsetY: 2, rightElbow: [[196, 249], [232, 235]], leftElbow: [[148, 246], [192, 247]] },
      { start: .66, end: .84, y: 214, offsetY: 34, rightElbow: [[181, 250], [230, 233]], leftElbow: [[145, 245], [197, 241]] },
    ];
    pose.blocks = carries.map(({ start, end, y, offsetY, rightElbow, leftElbow }) => {
      const t = interval(p, start + .018, end - .025);
      const clearance = Math.min(offsetY, 0) - 6;
      const offset = pointAt(t, [[0, -48, offsetY], [.25, -48, clearance], [.72, 0, clearance], [1, 0, 0]]);
      if (p >= start && p <= end) {
        // Both palms travel with the same tile. A brief grip and placement hold
        // are shared by the arms and tile, so neither hand slides on its edge.
        pose.right.hand = [270 + offset[0], y + offset[1]];
        pose.left.hand = [232 + offset[0], y + offset[1]];
        pose.right.elbow = pointAt(t, [[0, rightElbow[0][0], rightElbow[0][1]], [.25, 201, 249], [.72, 230, 233], [1, rightElbow[1][0], rightElbow[1][1]]]);
        pose.left.elbow = pointAt(t, [[0, leftElbow[0][0], leftElbow[0][1]], [.25, 152, 242], [.72, 197, 241], [1, leftElbow[1][0], leftElbow[1][1]]]);
      }
      return offset;
    });
    pose.headTilt = pointAt(p, [[0, 0, 0], [.14, 2, 0], [.84, 2, 0], [.96, 0, 0], [1, 0, 0]])[0];
    pose.gaze = pointAt(p, [[0, 0, 0], [.14, 0, 1], [.84, 1, 1], [.96, 0, 0], [1, 0, 0]]);
  } else if (stage === 2) {
    pose.right = armAt("right", p, [
      rightFrame(0), rightFrame(.1), [.14, 207, 248, 244, 246], [.22, 202, 249, 238, 226], [.26, 198, 252, 238, 238], [.36, 198, 252, 238, 238],
      [.44, 219, 243, 266, 242], [.5, 219, 243, 266, 242], [.57, 223, 244, 262, 226], [.62, 221, 242, 262, 238], [.74, 221, 242, 262, 238], rightFrame(.94), rightFrame(1),
    ]);
    pose.left = armAt("left", p, [leftFrame(0), leftFrame(.1), [.2, 181, 246, 220, 250], [.76, 181, 246, 220, 250], leftFrame(.94), leftFrame(1)]);
    pose.wires = [ease(interval(p, .26, .4)), ease(interval(p, .62, .76))];
    pose.headTilt = pointAt(p, [[0, 0, 0], [.22, 2, 0], [.66, 2, 0], [.84, -1, 0], [.94, 0, 0], [1, 0, 0]])[0];
  } else if (stage === 3) {
    pose.right = armAt("right", p, [rightFrame(0), rightFrame(.06), [.16, 217, 244, 257, 251], [.8, 217, 244, 257, 251], rightFrame(.94), rightFrame(1)]);
    pose.left = armAt("left", p, [leftFrame(0), leftFrame(.06), [.16, 186, 245, 227, 251], [.8, 186, 245, 227, 251], leftFrame(.94), leftFrame(1)]);
    const lineStart = [.18, .32, .46, .6].find(start => p >= start && p < start + .11);
    pose.typing = lineStart !== undefined;
    if (lineStart !== undefined) {
      const t = interval(p, lineStart, lineStart + .11);
      const tap = Math.sin(t * Math.PI * 4) * Math.sin(t * Math.PI) ** 2;
      pose.right.hand[1] -= Math.max(0, tap) * 1.1;
      pose.left.hand[1] -= Math.max(0, -tap) * 1.1;
    }
    pose.headTilt = pointAt(p, [[0, 0, 0], [.16, 2, 0], [.46, 2, 0], [.62, -1, 0], [.8, -1, 0], [.94, 0, 0], [1, 0, 0]])[0];
    pose.gaze = pointAt(p, [[0, 0, 0], [.16, 0, 1], [.46, 0, 1], [.62, 1.5, -1], [.8, 1.5, -1], [.94, 0, 0], [1, 0, 0]]);
  } else if (stage === 4) {
    pose.right = armAt("right", p, [rightFrame(0), rightFrame(.08), [.18, 195, 249, 230, 248], [.23, 195, 249, 230, 250], [.3, 204, 246, 240, 243], [.54, 204, 246, 240, 243], [.64, 221, 244, 260, 249], [.69, 221, 244, 260, 251], [.78, 212, 244, 244, 246], rightFrame(1)]);
    pose.checks = [.26, .4, .54].filter(time => p >= time).length;
    pose.launch = ease(interval(p, .69, .9));
    pose.headTilt = pointAt(p, [[0, 0, 0], [.18, 2, 0], [.32, -1, 0], [.54, -1, 0], [.64, 1, 0], [.78, -1, 0], [.96, 0, 0], [1, 0, 0]])[0];
    pose.gaze = pointAt(p, [[0, 0, 0], [.3, 1.5, -1], [.54, 1.5, -1], [.64, 0, 1], [.78, 1.5, -1], [.96, 0, 0], [1, 0, 0]]);
  }
  return pose;
}
