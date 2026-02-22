/**
 * NEXUS-X Pattern Utilities
 * Shared functions for pattern creation and manipulation
 */

/**
 * Create an empty pattern grid
 * @param tracks Number of tracks (default: 7)
 * @param steps Number of steps per track (default: 32)
 */
export function createEmptyPattern(tracks: number = 7, steps: number = 32): number[][] {
    return Array.from({ length: tracks }, () => new Array(steps).fill(0));
}

/**
 * Create a pattern from a beat pattern (for drums)
 * @param positions Array of step positions to activate (0-indexed)
 * @param totalSteps Total number of steps (default: 32)
 * @param velocity Velocity value for active steps (default: 1)
 */
export function createBeatPattern(positions: number[], totalSteps: number = 32, velocity: number = 1): number[] {
    const pattern = new Array(totalSteps).fill(0);
    positions.forEach(pos => {
        if (pos >= 0 && pos < totalSteps) {
            pattern[pos] = velocity;
        }
    });
    return pattern;
}

/**
 * Clone a pattern deeply
 */
export function clonePattern(pattern: number[][]): number[][] {
    return pattern.map(track => [...track]);
}

/**
 * Merge two patterns together
 * @param base Base pattern
 * @param overlay Pattern to overlay
 * @param mode 'add' adds velocities, 'replace' replaces non-zero values
 */
export function mergePatterns(
    base: number[][],
    overlay: number[][],
    mode: 'add' | 'replace' = 'replace'
): number[][] {
    return base.map((track, trackIndex) =>
        track.map((step, stepIndex) => {
            const overlayValue = overlay[trackIndex]?.[stepIndex] ?? 0;
            if (mode === 'add') {
                return Math.min(1, step + overlayValue);
            }
            return overlayValue > 0 ? overlayValue : step;
        })
    );
}

/**
 * Rotate a pattern by N steps
 * @param pattern Single track pattern
 * @param steps Number of steps to rotate (positive = right, negative = left)
 */
export function rotatePattern(pattern: number[], steps: number): number[] {
    const len = pattern.length;
    const normalizedSteps = ((steps % len) + len) % len;
    return [
        ...pattern.slice(-normalizedSteps),
        ...pattern.slice(0, -normalizedSteps)
    ];
}

/**
 * Humanize a pattern by slightly randomizing velocities
 * @param pattern Single track pattern
 * @param amount Humanization amount 0-1 (default: 0.1)
 */
export function humanizePattern(pattern: number[], amount: number = 0.1): number[] {
    return pattern.map(velocity => {
        if (velocity === 0) return 0;
        const variation = (Math.random() - 0.5) * 2 * amount;
        return Math.max(0.1, Math.min(1, velocity + variation));
    });
}

/**
 * Apply swing to a pattern
 * @param pattern Pattern to swing
 * @param swingAmount Swing amount 0-1 (default: 0.5)
 */
export function applySwing(pattern: number[], swingAmount: number = 0.5): { originalIndex: number; velocity: number }[] {
    const result: { originalIndex: number; velocity: number }[] = [];

    pattern.forEach((velocity, index) => {
        if (velocity > 0) {
            // Off-beat notes (odd indices in 16th notes) are delayed
            const isOffBeat = index % 2 === 1;
            const swingOffset = isOffBeat ? swingAmount * 0.5 : 0;
            result.push({
                originalIndex: index + swingOffset,
                velocity
            });
        }
    });

    return result;
}

/**
 * Generate a random pattern with given density
 * @param totalSteps Number of steps
 * @param density Probability of each step being active (0-1)
 * @param velocity Velocity for active steps
 */
export function generateRandomPattern(
    totalSteps: number = 32,
    density: number = 0.25,
    velocity: number = 1
): number[] {
    return Array.from({ length: totalSteps }, () =>
        Math.random() < density ? velocity : 0
    );
}

/**
 * Pattern density calculator
 */
export function calculateDensity(pattern: number[]): number {
    const activeSteps = pattern.filter(v => v > 0).length;
    return activeSteps / pattern.length;
}

/**
 * Clear all steps in a pattern
 */
export function clearPattern(pattern: number[][]): void {
    pattern.forEach(track => track.fill(0));
}

/**
 * Track indices for the standard 7-track setup
 */
export const TRACKS = {
    KICK: 0,
    SNARE: 1,
    CLAP: 2,
    HIHAT: 3,
    BASS: 4,
    LEAD: 5,
    PAD: 6
} as const;

export type TrackName = keyof typeof TRACKS;

// ============================================================
// PRESET DRUM PATTERNS
// ============================================================

/**
 * Common kick drum patterns (16 steps)
 */
export const KICK_PATTERNS = {
    // Four-on-the-floor (house, techno)
    fourOnTheFloor: [0, 4, 8, 12],
    // Basic rock beat
    basic: [0, 8],
    // Syncopated
    syncopated: [0, 6, 8, 14],
    // Trap style
    trap: [0, 10],
    // DnB
    dnb: [0, 6, 8, 14],
    // Half-time
    halfTime: [0, 8],
    // Double-time
    doubleTime: [0, 2, 4, 6, 8, 10, 12, 14]
} as const;

/**
 * Common snare patterns (16 steps)
 */
export const SNARE_PATTERNS = {
    // Backbeat (classic)
    backbeat: [4, 12],
    // DnB breakbeat
    dnb: [4, 8, 12],
    // Trap style
    trap: [4, 12, 14],
    // Every beat
    everyBeat: [0, 4, 8, 12],
    // Offbeats
    offbeats: [2, 6, 10, 14]
} as const;

/**
 * Common hi-hat patterns (16 steps)
 */
export const HIHAT_PATTERNS = {
    // 8th notes
    eighth: [0, 2, 4, 6, 8, 10, 12, 14],
    // 16th notes
    sixteenth: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    // Offbeats
    offbeats: [2, 6, 10, 14],
    // Trap rolls
    trapRolls: [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15]
} as const;

/**
 * Create a full drum pattern from preset patterns
 */
export function createDrumPattern(
    kickPattern: readonly number[],
    snarePattern: readonly number[],
    hihatPattern: readonly number[],
    totalSteps: number = 32
): number[][] {
    const pattern = createEmptyPattern(4, totalSteps); // Kick, Snare, Clap, HiHat

    // Expand 16-step patterns to 32 steps
    const expandPattern = (positions: readonly number[]): number[] => {
        const result = new Array(totalSteps).fill(0);
        positions.forEach(pos => {
            // Repeat pattern twice for 32 steps
            result[pos] = 1;
            if (pos + 16 < totalSteps) {
                result[pos + 16] = 1;
            }
        });
        return result;
    };

    pattern[TRACKS.KICK] = expandPattern(kickPattern);
    pattern[TRACKS.SNARE] = expandPattern(snarePattern);
    pattern[TRACKS.HIHAT] = expandPattern(hihatPattern);

    return pattern;
}

/**
 * Invert a pattern (active steps become inactive and vice versa)
 */
export function invertPattern(pattern: number[]): number[] {
    return pattern.map(v => v > 0 ? 0 : 1);
}

/**
 * Thin a pattern (remove every Nth active step)
 */
export function thinPattern(pattern: number[], keepEvery: number = 2): number[] {
    let activeCount = 0;
    return pattern.map(v => {
        if (v > 0) {
            activeCount++;
            return activeCount % keepEvery === 0 ? 0 : v;
        }
        return 0;
    });
}

/**
 * Thicken a pattern (add steps between active steps)
 */
export function thickenPattern(pattern: number[], velocity: number = 0.5): number[] {
    const result = [...pattern];
    for (let i = 0; i < pattern.length - 1; i++) {
        if (pattern[i] > 0 && pattern[i + 1] === 0 && i + 1 < pattern.length) {
            result[i + 1] = velocity;
        }
    }
    return result;
}

/**
 * Create Euclidean rhythm pattern
 * @param steps Total number of steps
 * @param hits Number of hits to distribute
 */
export function euclideanPattern(steps: number, hits: number): number[] {
    if (hits <= 0 || hits > steps) return new Array(steps).fill(0);
    if (hits === steps) return new Array(steps).fill(1);

    const pattern: number[] = [];
    let bucket = 0;

    for (let i = 0; i < steps; i++) {
        bucket += hits;
        if (bucket >= steps) {
            pattern.push(1);
            bucket -= steps;
        } else {
            pattern.push(0);
        }
    }

    return pattern;
}

/**
 * Reverse a pattern
 */
export function reversePattern(pattern: number[]): number[] {
    return [...pattern].reverse();
}

/**
 * Shift pattern by N steps
 */
export function shiftPattern(pattern: number[], shift: number): number[] {
    const len = pattern.length;
    const normalizedShift = ((shift % len) + len) % len;
    return [...pattern.slice(normalizedShift), ...pattern.slice(0, normalizedShift)];
}

/**
 * Count active steps in a pattern
 */
export function countActiveSteps(pattern: number[]): number {
    return pattern.filter(v => v > 0).length;
}

/**
 * Check if two patterns are identical
 */
export function patternsEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
}

/**
 * Get active step positions
 */
export function getActivePositions(pattern: number[]): number[] {
    return pattern.map((v, i) => v > 0 ? i : -1).filter(i => i >= 0);
}
