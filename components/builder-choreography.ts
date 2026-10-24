export type BuilderPoint = [number, number];
export const BUILDER_UPPER_ARM = 58;
export const BUILDER_FOREARM = 46;
export type BuilderArm = { shoulder: BuilderPoint; elbow: BuilderPoint; hand: BuilderPoint };
export type BuilderChoreography = {
  right: BuilderArm;
  left: BuilderArm;
  bodyLean: number;
  headTilt: number;
  gaze: BuilderPoint;
  fingers: [number, number];
  pen: BuilderPoint;
  penHeld: boolean;
  ink: [number, number, number];
  mouse: BuilderPoint;
  cursor: BuilderPoint;
  cursorOpacity: number;
  pointerDown: number;
  selections: number;
  nodeOffset: number;
  wires: [number, number];
  checks: number;
  code: [number, number, number, number];
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
const penRest: BuilderPoint = [263, 251];
const mouseRest: BuilderPoint = [269, 244];
const rightFrame = (time: number): PointFrame => [time, ...rightRest];
const leftFrame = (time: number): PointFrame => [time, ...leftRest];
const pulse = (p: number, start: number, duration = .035) => p > start && p < start + duration ? Math.sin(interval(p, start, start + duration) * Math.PI) : 0;
const hold = (p: number, start: number, end: number) => ease(interval(p, start, start + .015)) * (1 - ease(interval(p, end - .015, end)));

/** The torso turns about the seated hip. Shoulders follow it, while hands stay
 * on the work surface; a single low elbow solution preserves limb lengths. */
export function resolveDeskArm(side: "right" | "left", hand: BuilderPoint, lean = 0): BuilderArm {
  const base: BuilderPoint = side === "right" ? [192, 190] : [155, 189];
  const angle = lean * Math.PI / 180;
  const shoulder: BuilderPoint = [160 + (base[0] - 160) * Math.cos(angle) - (base[1] - 274) * Math.sin(angle), 274 + (base[0] - 160) * Math.sin(angle) + (base[1] - 274) * Math.cos(angle)];
  const dx = hand[0] - shoulder[0], dy = hand[1] - shoulder[1];
  const distance = Math.hypot(dx, dy);
  const along = (BUILDER_UPPER_ARM ** 2 - BUILDER_FOREARM ** 2 + distance ** 2) / (2 * distance);
  const down = Math.sqrt(Math.max(0, BUILDER_UPPER_ARM ** 2 - along ** 2));
  return { shoulder, elbow: [shoulder[0] + dx * along / distance - dy * down / distance, shoulder[1] + dy * along / distance + dx * down / distance], hand };
}

/** A continuous desk session: notice, reach, make contact, act, read the result.
 * Inputs and their visible results share one clock. Small finger presses do the
 * typing/clicking; the wrists and elbows do not bounce with every keystroke. */
export function sampleBuilderChoreography(stage: number, progress: number): BuilderChoreography {
  const p = Number.isFinite(progress) ? clamp(progress) : 0;
  let right: BuilderPoint = [...rightRest], left: BuilderPoint = [...leftRest];
  const pose: BuilderChoreography = {
    right: resolveDeskArm("right", right), left: resolveDeskArm("left", left),
    bodyLean: 0, headTilt: 0, gaze: [0, 0], fingers: [0, 0],
    pen: [...penRest], penHeld: false, ink: [1, 1, 1], mouse: [...mouseRest],
    cursor: [483, 216], cursorOpacity: 0, pointerDown: 0,
    selections: 3, nodeOffset: 0, wires: [1, 1], checks: 3, code: [1, 1, 1, 1], launch: 1,
  };

  if (stage === 0) {
    // Look down first, pick up the pencil, then write three short notes.
    right = pointAt(p, [rightFrame(0), rightFrame(.07), [.16, 263, 251], [.24, 233, 247], [.36, 247, 247], [.41, 233, 251], [.53, 248, 251], [.58, 233, 255], [.70, 246, 255], [.77, 250, 246], [.84, 263, 251], rightFrame(.95), rightFrame(1)]);
    left = pointAt(p, [leftFrame(0), leftFrame(.09), [.23, 215, 258], [.75, 215, 258], leftFrame(.95), leftFrame(1)]);
    pose.ink = [interval(p, .24, .36), interval(p, .41, .53), interval(p, .58, .70)].map(ease) as [number, number, number];
    for (const [start, end] of [[.24, .36], [.41, .53], [.58, .70]]) {
      if (p >= start && p <= end) {
        const t = interval(p, start, end);
        right[1] += Math.sin(t * Math.PI * 6) * Math.sin(t * Math.PI) ** 2 * .45;
      }
    }
    pose.penHeld = p >= .16 && p <= .84;
    if (pose.penHeld) pose.pen = [...right];
    pose.checks = [.36, .53, .70].filter(time => p >= time).length;
    pose.bodyLean = pointAt(p, [[0, 0, 0], [.2, 2.8, 0], [.7, 2.8, 0], [.88, .3, 0], [1, 0, 0]])[0];
    pose.headTilt = pointAt(p, [[0, 0, 0], [.1, 6, 0], [.7, 6, 0], [.88, -1, 0], [1, 0, 0]])[0];
    pose.gaze = pointAt(p, [[0, 0, 0], [.09, .3, 1.5], [.7, .3, 1.5], [.86, 1.4, -.8], [1, 0, 0]]);
  } else if (stage === 1 || stage === 2) {
    pose.cursor = stage === 1
      ? pointAt(p, [[0, 333, 148], [.18, 333, 148], [.24, 485, 151], [.32, 485, 151], [.44, 485, 180], [.52, 485, 180], [.64, 485, 209], [.84, 485, 209], [1, 485, 209]])
      : pointAt(p, [[0, 439, 162], [.22, 439, 162], [.34, 439, 143], [.4, 439, 143], [.46, 361, 146], [.55, 389, 146], [.60, 389, 146], [.66, 443, 162], [.75, 443, 188], [1, 443, 188]]);
    const mouseMotion = ease(interval(p, .18, .22)) * (1 - ease(interval(p, .8, .85)));
    const mouseTarget: BuilderPoint = [269 + (pose.cursor[0] - 430) * .012 * mouseMotion, 244 + (pose.cursor[1] - 165) * .012 * mouseMotion];
    const atMouse = ease(interval(p, .07, .18)) * (1 - ease(interval(p, .85, .96)));
    right = [rightRest[0] + (mouseTarget[0] - rightRest[0]) * atMouse, rightRest[1] + (mouseTarget[1] - rightRest[1]) * atMouse];
    pose.mouse = mouseTarget;
    left = pointAt(p, [leftFrame(0), leftFrame(.1), [.23, 222, 239], [.82, 222, 239], leftFrame(.96), leftFrame(1)]);
    pose.cursorOpacity = ease(interval(p, .15, .2)) * (1 - ease(interval(p, .84, .9)));
    pose.pointerDown = stage === 1 ? pulse(p, .265) + pulse(p, .465) + pulse(p, .665) : hold(p, .22, .34) + hold(p, .46, .55) + hold(p, .66, .75);
    pose.fingers = [pose.pointerDown, stage === 1 ? pulse(p, .36) + pulse(p, .56) : hold(p, .22, .34)];
    pose.selections = [.2825, .4825, .6825].filter(time => p >= time).length;
    pose.nodeOffset = 19 * (1 - ease(interval(p, .22, .34)));
    pose.wires = [ease(interval(p, .46, .55)), ease(interval(p, .66, .75))];
    pose.bodyLean = pointAt(p, [[0, 0, 0], [.17, 2.2, 0], [.38, 1.6, 0], [.63, 2.3, 0], [.83, 1, 0], [1, 0, 0]])[0];
    pose.headTilt = pointAt(p, [[0, 0, 0], [.1, -1.5, 0], [.42, -.4, 0], [.73, .5, 0], [1, 0, 0]])[0];
    pose.gaze = pointAt(p, [[0, 0, 0], [.1, 1.5, -.8], [.42, 1.5, -.1], [.73, 1.3, .5], [1, 0, 0]]);
  } else if (stage === 3) {
    right = pointAt(p, [rightFrame(0), rightFrame(.07), [.18, 247, 242], [.82, 247, 242], rightFrame(.96), rightFrame(1)]);
    left = pointAt(p, [leftFrame(0), leftFrame(.08), [.18, 222, 239], [.82, 222, 239], leftFrame(.96), leftFrame(1)]);
    const starts = [.21, .37, .53, .69];
    pose.code = starts.map(start => interval(p, start, start + .105)) as [number, number, number, number];
    for (const start of starts) {
      if (p >= start && p <= start + .105) {
        const t = interval(p, start, start + .105), envelope = Math.sin(t * Math.PI) ** 2;
        pose.fingers = [Math.max(0, Math.sin(t * Math.PI * 6)) * envelope, Math.max(0, -Math.sin(t * Math.PI * 6)) * envelope];
        right[1] -= pose.fingers[1] * .25;
        left[1] -= pose.fingers[0] * .25;
      }
    }
    pose.bodyLean = pointAt(p, [[0, 0, 0], [.18, 2, 0], [.45, 2.6, 0], [.65, 1.5, 0], [.86, .3, 0], [1, 0, 0]])[0];
    pose.headTilt = pointAt(p, [[0, 0, 0], [.15, 2.7, 0], [.31, -.7, 0], [.49, -.7, 0], [.56, 1.4, 0], [.68, -1, 0], [.88, -1, 0], [1, 0, 0]])[0];
    pose.gaze = pointAt(p, [[0, 0, 0], [.13, .2, 1.2], [.29, 1.5, -.6], [.49, 1.5, -.6], [.55, .3, .8], [.65, 1.5, -.4], [.88, 1.5, -.4], [1, 0, 0]]);
  } else if (stage === 4) {
    right = pointAt(p, [rightFrame(0), rightFrame(.07), [.18, 252, 242], [.29, 252, 242], [.40, 253, 248], [.52, 253, 248], [.62, 269, 244], [.80, 269, 244], rightFrame(.96), rightFrame(1)]);
    left = pointAt(p, [leftFrame(0), leftFrame(.09), [.18, 222, 239], [.31, 222, 239], leftFrame(.43), leftFrame(1)]);
    pose.fingers = [pulse(p, .215) + pulse(p, .655), 0];
    pose.checks = [.31, .42, .53].filter(time => p >= time).length;
    pose.launch = ease(interval(p, .69, .86));
    pose.cursor = pointAt(p, [[0, 393, 194], [.62, 393, 194], [.65, 470, 207], [1, 470, 207]]);
    pose.cursorOpacity = ease(interval(p, .59, .64)) * (1 - ease(interval(p, .84, .9)));
    pose.pointerDown = pulse(p, .655);
    const mouseMotion = 1 - ease(interval(p, .78, .8));
    const mouseShift: BuilderPoint = [(pose.cursor[0] - 393) * .012 * mouseMotion, (pose.cursor[1] - 194) * .012 * mouseMotion];
    pose.mouse = [269 + mouseShift[0], 244 + mouseShift[1]];
    right = [right[0] + mouseShift[0], right[1] + mouseShift[1]];
    pose.bodyLean = pointAt(p, [[0, 0, 0], [.18, 1.7, 0], [.42, -.7, 0], [.53, -.7, 0], [.62, 2.2, 0], [.8, 2.2, 0], [1, 0, 0]])[0];
    pose.headTilt = pointAt(p, [[0, 0, 0], [.15, 2, 0], [.28, -1.5, 0], [.8, -1.5, 0], [.88, 1.2, 0], [1, 0, 0]])[0];
    pose.gaze = pointAt(p, [[0, 0, 0], [.13, .3, 1], [.28, 1.5, -.8], [.62, 1.5, .3], [.88, 1.4, -.6], [1, 0, 0]]);
  }
  pose.right = resolveDeskArm("right", right, pose.bodyLean);
  pose.left = resolveDeskArm("left", left, pose.bodyLean);
  return pose;
}

/** A manual chapter selection eases from the current posture to the next one,
 * instead of teleporting the hands. Automatic boundaries already match. */
export function blendBuilderPosture(from: BuilderChoreography, to: BuilderChoreography, amount: number): BuilderChoreography {
  const t = ease(amount);
  const scalar = (a: number, b: number) => a + (b - a) * t;
  const point = (a: BuilderPoint, b: BuilderPoint): BuilderPoint => [scalar(a[0], b[0]), scalar(a[1], b[1])];
  const bodyLean = scalar(from.bodyLean, to.bodyLean);
  let rightHand = point(from.right.hand, to.right.hand);
  let pen = point(from.pen, to.pen);
  if (from.penHeld && !to.penHeld) {
    // Finish putting the pencil down before withdrawing the hand on a cut.
    const place = ease(amount / .75), release = ease((amount - .75) / .25);
    pen = [from.pen[0] + (to.pen[0] - from.pen[0]) * place, from.pen[1] + (to.pen[1] - from.pen[1]) * place];
    rightHand = [pen[0] + (to.right.hand[0] - pen[0]) * release, pen[1] + (to.right.hand[1] - pen[1]) * release];
  } else if (Math.hypot(from.right.hand[0] - from.mouse[0], from.right.hand[1] - from.mouse[1]) < .001) {
    const release = ease((amount - .2) / .8);
    const parked = point(from.mouse, to.mouse);
    rightHand = [parked[0] + (to.right.hand[0] - parked[0]) * release, parked[1] + (to.right.hand[1] - parked[1]) * release];
  }
  return {
    ...to, bodyLean, headTilt: scalar(from.headTilt, to.headTilt), gaze: point(from.gaze, to.gaze),
    right: resolveDeskArm("right", rightHand, bodyLean),
    left: resolveDeskArm("left", point(from.left.hand, to.left.hand), bodyLean),
    pen, mouse: point(from.mouse, to.mouse),
    fingers: [scalar(from.fingers[0], to.fingers[0]), scalar(from.fingers[1], to.fingers[1])],
  };
}
