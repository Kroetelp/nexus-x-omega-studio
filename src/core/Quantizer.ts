/**
 * NEXUS-X Quantizer
 * Quantize recorded/played notes to grid
 */

export class Quantizer {
    private strength: number = 1.0;
    private grid: QuantizeGrid = '1/16';

    private readonly GRID_VALUES: Record<QuantizeGrid, number> = {
        '1/4': 4,
        '1/8': 8,
        '1/8T': 12,
        '1/16': 16,
        '1/16T': 24,
        '1/32': 32
    };

    setGrid(grid: QuantizeGrid): void {
        this.grid = grid;
    }

    setStrength(strength: number): void {
        this.strength = Math.max(0, Math.min(1, strength));
    }

    quantizeNote(
        noteTime: number,
        bpm: number,
        grid?: QuantizeGrid
    ): number {
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

    quantizePattern(
        pattern: number[],
        bpm: number,
        grid?: QuantizeGrid
    ): number[] {
        const useGrid = grid || this.grid;
        const gridDivisions = this.GRID_VALUES[useGrid];
        const stepsPerBeat = gridDivisions / 4;

        // For step sequencer pattern
        const quantized = [...pattern];

        // Move notes to nearest step
        // This is for timing quantization, not step patterns
        return quantized;
    }

    quantizeNotes(
        notes: QuantizableNote[],
        bpm: number
    ): QuantizableNote[] {
        return notes.map(note => ({
            ...note,
            originalTime: note.startTime,
            startTime: this.quantizeNote(note.startTime, bpm)
        }));
    }

    humanizeNote(
        noteTime: number,
        amount: number,
        bpm: number
    ): number {
        const beatsPerSecond = bpm / 60;
        const maxOffset = (1 / 16) / beatsPerSecond * amount;

        const offset = (Math.random() - 0.5) * 2 * maxOffset;
        return noteTime + offset;
    }

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
                ? note.velocity * (0.9 + Math.random() * 0.2)
                : note.velocity
        }));
    }

    swingNote(
        noteTime: number,
        bpm: number,
        swingAmount: number = 0.5
    ): number {
        const beatsPerSecond = bpm / 60;
        const eighthNote = (1 / 8) / beatsPerSecond;

        // Find position within beat
        const position = (noteTime % eighthNote) / eighthNote;

        // Apply swing to off-beats
        if (position > 0.25 && position < 0.75) {
            const swingOffset = eighthNote * swingAmount * 0.5;
            return noteTime + swingOffset;
        }

        return noteTime;
    }

    applySwing(
        notes: QuantizableNote[],
        bpm: number,
        swingAmount: number = 0.5
    ): QuantizableNote[] {
        return notes.map(note => ({
            ...note,
            startTime: this.swingNote(note.startTime, bpm, swingAmount)
        }));
    }

    getGridOptions(): QuantizeGrid[] {
        return Object.keys(this.GRID_VALUES) as QuantizeGrid[];
    }
}

type QuantizeGrid = '1/4' | '1/8' | '1/8T' | '1/16' | '1/16T' | '1/32';

interface QuantizableNote {
    pitch: number;
    startTime: number;
    duration: number;
    velocity: number;
    originalTime?: number;
}

// Global
let quantizerInstance: Quantizer | null = null;

export function createQuantizer(): Quantizer {
    if (!quantizerInstance) {
        quantizerInstance = new Quantizer();
    }
    return quantizerInstance;
}
