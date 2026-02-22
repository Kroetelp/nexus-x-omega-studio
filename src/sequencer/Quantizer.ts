/**
 * NEXUS-X Quantizer
 * Quantize recorded/played notes to grid
 *
 * Pure logic class - no UI or audio dependencies
 * BPM is passed as parameter for flexibility
 */

import { loggers } from '../utils/logger';

const log = loggers.sequencer;

export type QuantizeGrid = '1/4' | '1/8' | '1/8T' | '1/16' | '1/16T' | '1/32';

export interface QuantizableNote {
    pitch: number;
    startTime: number;  // In seconds
    duration: number;   // In seconds
    velocity: number;   // 0.0 - 1.0
    originalTime?: number;
}

export interface QuantizeResult {
    notes: QuantizableNote[];
    adjustments: number[];
    averageOffset: number;
}

type QuantizeListener = (result: QuantizeResult) => void;

export class Quantizer {
    private strength: number = 1.0;
    private grid: QuantizeGrid = '1/16';
    private listeners: Set<QuantizeListener> = new Set();

    private readonly GRID_VALUES: Record<QuantizeGrid, number> = {
        '1/4': 4,
        '1/8': 8,
        '1/8T': 12,
        '1/16': 16,
        '1/16T': 24,
        '1/32': 32
    };

    /**
     * Set the quantization grid
     */
    setGrid(grid: QuantizeGrid): void {
        this.grid = grid;
    }

    /**
     * Get the current quantization grid
     */
    getGrid(): QuantizeGrid {
        return this.grid;
    }

    /**
     * Set quantization strength (0 = no effect, 1 = full quantize)
     */
    setStrength(strength: number): void {
        this.strength = Math.max(0, Math.min(1, strength));
    }

    /**
     * Get current strength
     */
    getStrength(): number {
        return this.strength;
    }

    /**
     * Quantize a single note time
     * @param noteTime - Time in seconds
     * @param bpm - Tempo in BPM
     * @param grid - Optional grid override
     */
    quantizeNote(noteTime: number, bpm: number, grid?: QuantizeGrid): number {
        const useGrid = grid || this.grid;
        const beatsPerSecond = bpm / 60;
        const gridDivisions = this.GRID_VALUES[useGrid];
        const gridSize = 1 / (gridDivisions / 4) / beatsPerSecond;

        // Find nearest grid point
        const nearestGrid = Math.round(noteTime / gridSize) * gridSize;

        // Apply strength
        const diff = nearestGrid - noteTime;
        return noteTime + diff * this.strength;
    }

    /**
     * Quantize multiple notes
     */
    quantizeNotes(notes: QuantizableNote[], bpm: number, grid?: QuantizeGrid): QuantizeResult {
        const useGrid = grid || this.grid;
        const gridDivisions = this.GRID_VALUES[useGrid];
        const beatsPerSecond = bpm / 60;
        const gridSize = 1 / (gridDivisions / 4) / beatsPerSecond;

        let totalOffset = 0;
        const adjustments: number[] = [];

        const quantizedNotes = notes.map(note => {
            const nearestGrid = Math.round(note.startTime / gridSize) * gridSize;
            const diff = nearestGrid - note.startTime;
            const adjustedDiff = diff * this.strength;

            totalOffset += Math.abs(adjustedDiff);
            adjustments.push(adjustedDiff);

            return {
                ...note,
                originalTime: note.startTime,
                startTime: note.startTime + adjustedDiff
            };
        });

        const result: QuantizeResult = {
            notes: quantizedNotes,
            adjustments,
            averageOffset: notes.length > 0 ? totalOffset / notes.length : 0
        };

        this.emit(result);
        return result;
    }

    /**
     * Humanize note timing by adding random offset
     */
    humanizeNote(noteTime: number, amount: number, bpm: number): number {
        const beatsPerSecond = bpm / 60;
        const maxOffset = (1 / 16) / beatsPerSecond * amount;

        const offset = (Math.random() - 0.5) * 2 * maxOffset;
        return noteTime + offset;
    }

    /**
     * Humanize multiple notes (timing and optionally velocity)
     */
    humanizeNotes(
        notes: QuantizableNote[],
        amount: number,
        bpm: number,
        includeVelocity: boolean = true
    ): QuantizableNote[] {
        return notes.map(note => ({
            ...note,
            startTime: this.humanizeNote(note.startTime, amount, bpm),
            velocity: includeVelocity
                ? Math.max(0.1, Math.min(1, note.velocity * (0.9 + Math.random() * 0.2)))
                : note.velocity
        }));
    }

    /**
     * Apply swing to a note time
     * @param noteTime - Time in seconds
     * @param bpm - Tempo in BPM
     * @param swingAmount - 0 = no swing, 1 = full swing
     */
    swingNote(noteTime: number, bpm: number, swingAmount: number = 0.5): number {
        const beatsPerSecond = bpm / 60;
        const eighthNote = (1 / 8) / beatsPerSecond;

        // Find position within beat
        const position = (noteTime % eighthNote) / eighthNote;

        // Apply swing to off-beats (between 25% and 75% of beat)
        if (position > 0.25 && position < 0.75) {
            const swingOffset = eighthNote * swingAmount * 0.5;
            return noteTime + swingOffset;
        }

        return noteTime;
    }

    /**
     * Apply swing to multiple notes
     */
    applySwing(notes: QuantizableNote[], bpm: number, swingAmount: number = 0.5): QuantizableNote[] {
        return notes.map(note => ({
            ...note,
            startTime: this.swingNote(note.startTime, bpm, swingAmount)
        }));
    }

    /**
     * Get grid size in seconds for a given BPM
     */
    getGridSize(bpm: number, grid?: QuantizeGrid): number {
        const useGrid = grid || this.grid;
        const gridDivisions = this.GRID_VALUES[useGrid];
        const beatsPerSecond = bpm / 60;
        return 1 / (gridDivisions / 4) / beatsPerSecond;
    }

    /**
     * Get available grid options
     */
    getGridOptions(): QuantizeGrid[] {
        return Object.keys(this.GRID_VALUES) as QuantizeGrid[];
    }

    /**
     * Snap a step sequencer pattern to a new resolution
     * @param pattern - Array of note values (0 = off, 1 = on, 2 = accent, 3 = ghost)
     * @param fromSteps - Current pattern length
     * @param toSteps - Target pattern length
     */
    resamplePattern(pattern: number[], fromSteps: number, toSteps: number): number[] {
        const result: number[] = new Array(toSteps).fill(0);

        for (let i = 0; i < toSteps; i++) {
            const sourceIndex = Math.floor((i / toSteps) * fromSteps);
            result[i] = pattern[sourceIndex] || 0;
        }

        return result;
    }

    /**
     * Subscribe to quantization events
     */
    subscribe(listener: QuantizeListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private emit(result: QuantizeResult): void {
        this.listeners.forEach(listener => {
            try {
                listener(result);
            } catch (e) {
                log.error('Quantizer listener error:', e);
            }
        });
    }
}

// ============== GLOBAL INSTANCE ==============

let quantizerInstance: Quantizer | null = null;

export function createQuantizer(): Quantizer {
    if (!quantizerInstance) {
        quantizerInstance = new Quantizer();
    }
    return quantizerInstance;
}

export function getQuantizer(): Quantizer | null {
    return quantizerInstance;
}

export function resetQuantizer(): void {
    quantizerInstance = null;
}
