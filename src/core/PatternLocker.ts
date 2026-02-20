/**
 * NEXUS-X Pattern Locker
 * Lock patterns to prevent accidental changes
 */

export class PatternLocker {
    private lockedTracks: Set<number> = new Set();
    private lockedPatterns: Map<number, number[]> = new Map();
    private isGlobalLock: boolean = false;

    lockTrack(trackId: number, pattern: number[]): void {
        this.lockedTracks.add(trackId);
        this.lockedPatterns.set(trackId, [...pattern]);
    }

    unlockTrack(trackId: number): void {
        this.lockedTracks.delete(trackId);
        this.lockedPatterns.delete(trackId);
    }

    isLocked(trackId: number): boolean {
        return this.lockedTracks.has(trackId) || this.isGlobalLock;
    }

    toggleLock(trackId: number, pattern: number[]): void {
        if (this.isLocked(trackId)) {
            this.unlockTrack(trackId);
        } else {
            this.lockTrack(trackId, pattern);
        }
    }

    setGlobalLock(locked: boolean): void {
        this.isGlobalLock = locked;
    }

    getLockedPattern(trackId: number): number[] | undefined {
        return this.lockedPatterns.get(trackId);
    }

    restoreLockedPattern(trackId: number): number[] | undefined {
        return this.lockedPatterns.get(trackId);
    }

    clearAllLocks(): void {
        this.lockedTracks.clear();
        this.lockedPatterns.clear();
        this.isGlobalLock = false;
    }

    getLockedTracks(): number[] {
        return Array.from(this.lockedTracks);
    }

    protectPattern(trackId: number, newPattern: number[]): number[] {
        if (this.isLocked(trackId)) {
            return this.lockedPatterns.get(trackId) || newPattern;
        }
        return newPattern;
    }
}

// Global
let patternLockerInstance: PatternLocker | null = null;

export function createPatternLocker(): PatternLocker {
    if (!patternLockerInstance) {
        patternLockerInstance = new PatternLocker();
    }
    return patternLockerInstance;
}
