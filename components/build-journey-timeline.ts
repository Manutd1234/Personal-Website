/** Animation and advancement share active time, never time spent hidden or paused. */
export const BUILD_STAGE_DURATION_MS = 6100;
export const BUILD_ACTION_BEATS_MS = [240, 880, 1540, 2180, 2840, 3480, 4260, 5000] as const;

export class ActivePlaybackClock {
  private elapsed = 0;
  private startedAt: number | null = null;

  reset(elapsed = 0, now = 0) {
    this.elapsed = Math.max(0, elapsed);
    if (this.startedAt !== null) this.startedAt = now;
  }

  setRunning(running: boolean, now: number) {
    if (running && this.startedAt === null) this.startedAt = now;
    else if (!running && this.startedAt !== null) {
      this.elapsed += Math.max(0, now - this.startedAt);
      this.startedAt = null;
    }
  }

  elapsedAt(now: number) {
    return this.elapsed + (this.startedAt === null ? 0 : Math.max(0, now - this.startedAt));
  }

  remainingUntil(deadline: number, now: number) {
    return Math.max(0, deadline - this.elapsedAt(now));
  }
}

export function sceneBeatAt(elapsed: number) {
  return BUILD_ACTION_BEATS_MS.filter(deadline => elapsed >= deadline).length;
}

/** Selecting a monitor card keeps earlier work and replays the selected action. */
export function sceneActionStart(step: number) {
  const index = Math.min(2, Math.max(0, Math.trunc(step)));
  return index === 0 ? 0 : BUILD_ACTION_BEATS_MS[index * 2 - 1];
}

export function journeyPlayback(playing: boolean, visible: boolean, reduced: boolean, focused: boolean) {
  const animate = playing && visible && !reduced;
  return { animate, advance: animate && !focused };
}
