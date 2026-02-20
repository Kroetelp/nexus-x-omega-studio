/**
 * NEXUS-X Scale Lock
 * Force all notes to stay in scale
 */

export class ScaleLock {
    private enabled: boolean = false;
    private rootNote: number = 0; // C
    private scale: number[] = [0, 2, 4, 5, 7, 9, 11]; // Major

    private readonly SCALES: Record<string, number[]> = {
        major: [0, 2, 4, 5, 7, 9, 11],
        minor: [0, 2, 3, 5, 7, 8, 10],
        pentatonic: [0, 2, 4, 7, 9],
        blues: [0, 3, 5, 6, 7, 10],
        dorian: [0, 2, 3, 5, 7, 9, 10],
        phrygian: [0, 1, 3, 5, 7, 8, 10],
        lydian: [0, 2, 4, 6, 7, 9, 11],
        mixolydian: [0, 2, 4, 5, 7, 9, 10],
        harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
        melodic_minor: [0, 2, 3, 5, 7, 9, 11],
        whole_tone: [0, 2, 4, 6, 8, 10],
        chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    };

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    setRoot(note: number): void {
        this.rootNote = note % 12;
    }

    setScale(scaleName: string): void {
        if (this.SCALES[scaleName]) {
            this.scale = [...this.SCALES[scaleName]];
        }
    }

    quantize(note: number): number {
        if (!this.enabled) return note;

        const octave = Math.floor(note / 12);
        const noteInOctave = note % 12;

        // Find nearest scale note
        const relativeNote = (noteInOctave - this.rootNote + 12) % 12;
        let nearestScaleNote = this.scale[0];
        let minDistance = 12;

        for (const scaleNote of this.scale) {
            const distance = Math.abs(scaleNote - relativeNote);
            const wrappedDistance = Math.min(distance, 12 - distance);

            if (wrappedDistance < minDistance) {
                minDistance = wrappedDistance;
                nearestScaleNote = scaleNote;
            }
        }

        return octave * 12 + (this.rootNote + nearestScaleNote) % 12;
    }

    quantizeUp(note: number): number {
        if (!this.enabled) return note;

        const octave = Math.floor(note / 12);
        const noteInOctave = note % 12;
        const relativeNote = (noteInOctave - this.rootNote + 12) % 12;

        // Find next scale note up
        let nextNote = this.scale[0];
        for (const scaleNote of this.scale) {
            if (scaleNote >= relativeNote) {
                nextNote = scaleNote;
                break;
            }
        }

        return octave * 12 + (this.rootNote + nextNote) % 12;
    }

    quantizeDown(note: number): number {
        if (!this.enabled) return note;

        const octave = Math.floor(note / 12);
        const noteInOctave = note % 12;
        const relativeNote = (noteInOctave - this.rootNote + 12) % 12;

        // Find next scale note down
        let prevNote = this.scale[this.scale.length - 1];
        for (let i = this.scale.length - 1; i >= 0; i--) {
            if (this.scale[i] <= relativeNote) {
                prevNote = this.scale[i];
                break;
            }
        }

        return octave * 12 + (this.rootNote + prevNote) % 12;
    }

    isInScale(note: number): boolean {
        const noteInOctave = note % 12;
        const relativeNote = (noteInOctave - this.rootNote + 12) % 12;
        return this.scale.includes(relativeNote);
    }

    getScaleNotes(octave: number = 4): number[] {
        return this.scale.map(interval => octave * 12 + this.rootNote + interval);
    }

    getAvailableScales(): string[] {
        return Object.keys(this.SCALES);
    }

    getChordNotes(degree: number, octave: number = 4): number[] {
        const root = octave * 12 + this.rootNote + this.scale[degree % this.scale.length];
        const third = this.scale[(degree + 2) % this.scale.length];
        const fifth = this.scale[(degree + 4) % this.scale.length];

        return [
            root,
            octave * 12 + this.rootNote + third + (degree + 2 >= this.scale.length ? 12 : 0),
            octave * 12 + this.rootNote + fifth + (degree + 4 >= this.scale.length ? 12 : 0)
        ];
    }
}

// Global
let scaleLockInstance: ScaleLock | null = null;

export function createScaleLock(): ScaleLock {
    if (!scaleLockInstance) {
        scaleLockInstance = new ScaleLock();
    }
    return scaleLockInstance;
}
