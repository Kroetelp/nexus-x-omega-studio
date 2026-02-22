/**
 * NEXUS-X Scale Locker
 * Forces all notes to stay within a defined musical scale
 *
 * Pure logic class - no UI or audio dependencies
 * Emits events for integration with other components
 */

import {
    SCALES,
    ScaleName,
    getScaleIntervals,
    getScaleNames,
    midiToNoteName
} from './ScaleDefinitions';

export interface ScaleLockConfig {
    enabled: boolean;
    rootNote: number;      // 0-11 (C=0, C#=1, etc.)
    scaleName: ScaleName;
}

export interface ScaleLockEvent {
    type: 'note_quantized' | 'config_changed';
    originalNote?: number;
    quantizedNote?: number;
    config?: ScaleLockConfig;
}

type EventListener = (event: ScaleLockEvent) => void;

export class ScaleLocker {
    private config: ScaleLockConfig = {
        enabled: false,
        rootNote: 0,
        scaleName: 'major'
    };

    private listeners: Set<EventListener> = new Set();

    /**
     * Enable or disable scale locking
     */
    setEnabled(enabled: boolean): void {
        const changed = this.config.enabled !== enabled;
        this.config.enabled = enabled;
        if (changed) {
            this.emit({ type: 'config_changed', config: { ...this.config } });
        }
    }

    /**
     * Get enabled state
     */
    isEnabled(): boolean {
        return this.config.enabled;
    }

    /**
     * Set the root note (0-11)
     */
    setRoot(note: number): void {
        this.config.rootNote = note % 12;
        this.emit({ type: 'config_changed', config: { ...this.config } });
    }

    /**
     * Get the root note
     */
    getRoot(): number {
        return this.config.rootNote;
    }

    /**
     * Set the scale by name
     */
    setScale(scaleName: ScaleName): void {
        if (SCALES[scaleName]) {
            this.config.scaleName = scaleName;
            this.emit({ type: 'config_changed', config: { ...this.config } });
        }
    }

    /**
     * Get current scale name
     */
    getScaleName(): ScaleName {
        return this.config.scaleName;
    }

    /**
     * Get current scale intervals
     */
    getScaleIntervals(): number[] {
        return [...SCALES[this.config.scaleName]];
    }

    /**
     * Quantize a MIDI note to the nearest scale tone
     */
    quantize(note: number): number {
        if (!this.config.enabled) return note;

        const octave = Math.floor(note / 12);
        const noteInOctave = note % 12;
        const scale = SCALES[this.config.scaleName];

        // Find nearest scale note
        const relativeNote = (noteInOctave - this.config.rootNote + 12) % 12;
        let nearestScaleNote: number = scale[0];
        let minDistance = 12;

        for (const scaleNote of scale) {
            const distance = Math.abs(scaleNote - relativeNote);
            const wrappedDistance = Math.min(distance, 12 - distance);

            if (wrappedDistance < minDistance) {
                minDistance = wrappedDistance;
                nearestScaleNote = scaleNote;
            }
        }

        const quantized = octave * 12 + (this.config.rootNote + nearestScaleNote) % 12;

        if (quantized !== note) {
            this.emit({
                type: 'note_quantized',
                originalNote: note,
                quantizedNote: quantized
            });
        }

        return quantized;
    }

    /**
     * Quantize a note up to the next scale tone
     */
    quantizeUp(note: number): number {
        if (!this.config.enabled) return note;

        const octave = Math.floor(note / 12);
        const noteInOctave = note % 12;
        const scale = SCALES[this.config.scaleName];
        const relativeNote = (noteInOctave - this.config.rootNote + 12) % 12;

        // Find next scale note up
        let nextNote: number = scale[0];
        for (const scaleNote of scale) {
            if (scaleNote >= relativeNote) {
                nextNote = scaleNote;
                break;
            }
        }

        return octave * 12 + (this.config.rootNote + nextNote) % 12;
    }

    /**
     * Quantize a note down to the previous scale tone
     */
    quantizeDown(note: number): number {
        if (!this.config.enabled) return note;

        const octave = Math.floor(note / 12);
        const noteInOctave = note % 12;
        const scale = SCALES[this.config.scaleName];
        const relativeNote = (noteInOctave - this.config.rootNote + 12) % 12;

        // Find next scale note down
        let prevNote: number = scale[scale.length - 1];
        for (let i = scale.length - 1; i >= 0; i--) {
            if (scale[i] <= relativeNote) {
                prevNote = scale[i];
                break;
            }
        }

        return octave * 12 + (this.config.rootNote + prevNote) % 12;
    }

    /**
     * Check if a note is in the current scale
     */
    isInScale(note: number): boolean {
        const noteInOctave = note % 12;
        const scale = SCALES[this.config.scaleName];
        const relativeNote = (noteInOctave - this.config.rootNote + 12) % 12;
        return (scale as readonly number[]).includes(relativeNote as number);
    }

    /**
     * Get all notes in the scale for a given octave
     */
    getScaleNotes(octave: number = 4): number[] {
        const scale = SCALES[this.config.scaleName];
        return scale.map(interval => octave * 12 + this.config.rootNote + interval);
    }

    /**
     * Get chord tones for a scale degree
     */
    getChordNotes(degree: number, octave: number = 4): number[] {
        const scale = SCALES[this.config.scaleName];
        const root = octave * 12 + this.config.rootNote + scale[degree % scale.length];
        const third = scale[(degree + 2) % scale.length];
        const fifth = scale[(degree + 4) % scale.length];

        return [
            root,
            octave * 12 + this.config.rootNote + third + (degree + 2 >= scale.length ? 12 : 0),
            octave * 12 + this.config.rootNote + fifth + (degree + 4 >= scale.length ? 12 : 0)
        ];
    }

    /**
     * Get all available scale names
     */
    getAvailableScales(): string[] {
        return getScaleNames();
    }

    /**
     * Get the current configuration
     */
    getConfig(): ScaleLockConfig {
        return { ...this.config };
    }

    /**
     * Set the full configuration
     */
    setConfig(config: Partial<ScaleLockConfig>): void {
        this.config = { ...this.config, ...config };
        this.emit({ type: 'config_changed', config: { ...this.config } });
    }

    /**
     * Get root note name
     */
    getRootNoteName(): string {
        return midiToNoteName(this.config.rootNote, false).replace(/\d+$/, '');
    }

    /**
     * Subscribe to scale lock events
     */
    subscribe(listener: EventListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Emit an event to all listeners
     */
    private emit(event: ScaleLockEvent): void {
        this.listeners.forEach(listener => listener(event));
    }
}

// ============== GLOBAL INSTANCE ==============

let scaleLockerInstance: ScaleLocker | null = null;

export function createScaleLocker(): ScaleLocker {
    if (!scaleLockerInstance) {
        scaleLockerInstance = new ScaleLocker();
    }
    return scaleLockerInstance;
}

export function getScaleLocker(): ScaleLocker | null {
    return scaleLockerInstance;
}

export function resetScaleLocker(): void {
    scaleLockerInstance = null;
}
