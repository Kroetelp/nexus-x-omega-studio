/**
 * Easing functions for smooth parameter interpolation
 */

export type EasingFunction = keyof typeof easingFunctions;

export const easingFunctions = {
  linear: (t: number): number => t,
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInExpo: (t: number): number => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t: number): number => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number): number => t * t * t * t,
  easeOutQuart: (t: number): number => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number): number => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
};

/**
 * Interpolate between two values using an easing function
 */
export function interpolate(
  from: number,
  to: number,
  progress: number,
  easing: EasingFunction = 'linear'
): number {
  const easedProgress = easingFunctions[easing](Math.max(0, Math.min(1, progress)));
  return from + (to - from) * easedProgress;
}

/**
 * Interpolate an object of values
 */
export function interpolateObject<T extends Record<string, number>>(
  from: T,
  to: T,
  progress: number,
  easing: EasingFunction = 'linear'
): T {
  const result = {} as T;
  for (const key in from) {
    if (key in to) {
      (result as Record<string, number>)[key] = interpolate(from[key], to[key], progress, easing);
    }
  }
  return result;
}

/**
 * Create an interpolation function for repeated calls
 */
export function createInterpolator(
  from: number,
  to: number,
  duration: number,
  easing: EasingFunction = 'linear'
) {
  const startTime = Date.now();
  return (): number => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    return interpolate(from, to, progress, easing);
  };
}
