/**
 * NEXUS-X Groove Pool
 * Apply swing and groove templates
 */

export class GroovePool {
    private grooves: Map<string, GrooveTemplate> = new Map();
    private currentGroove: string = 'straight';
    private amount: number = 0;

    constructor() {
        this.loadDefaultGrooves();
    }

    private loadDefaultGrooves(): void {
        // Straight (no groove)
        this.grooves.set('straight', {
            name: 'Straight',
            description: 'No swing',
            timingOffsets: Array(16).fill(0),
            velocityMultipliers: Array(16).fill(1)
        });

        // 16th note swing
        this.grooves.set('swing16', {
            name: 'Swing 16th',
            description: 'Classic 16th note swing',
            timingOffsets: [0, 30, 0, 30, 0, 30, 0, 30, 0, 30, 0, 30, 0, 30, 0, 30],
            velocityMultipliers: [1, 0.9, 1, 0.9, 1, 0.9, 1, 0.9, 1, 0.9, 1, 0.9, 1, 0.9, 1, 0.9]
        });

        // 8th note swing
        this.grooves.set('swing8', {
            name: 'Swing 8th',
            description: 'Jazz swing feel',
            timingOffsets: [0, 50, 0, 50, 0, 50, 0, 50, 0, 50, 0, 50, 0, 50, 0, 50],
            velocityMultipliers: [1.1, 0.85, 1.1, 0.85, 1.1, 0.85, 1.1, 0.85, 1.1, 0.85, 1.1, 0.85, 1.1, 0.85, 1.1, 0.85]
        });

        // Hip-hop groove
        this.grooves.set('hiphop', {
            name: 'Hip-Hop',
            description: 'Laid back feel',
            timingOffsets: [0, -10, 20, 10, 0, -10, 20, 10, 0, -10, 20, 10, 0, -10, 20, 10],
            velocityMultipliers: [1.2, 0.7, 0.8, 0.9, 1.1, 0.7, 0.8, 0.9, 1.2, 0.7, 0.8, 0.9, 1.1, 0.7, 0.8, 0.9]
        });

        // Funk groove
        this.grooves.set('funk', {
            name: 'Funk',
            description: 'Tight funk feel',
            timingOffsets: [0, 15, -5, 20, 0, 15, -5, 20, 0, 15, -5, 20, 0, 15, -5, 20],
            velocityMultipliers: [1.15, 0.75, 0.9, 0.8, 1.1, 0.75, 0.9, 0.8, 1.15, 0.75, 0.9, 0.8, 1.1, 0.75, 0.9, 0.8]
        });

        // DnB groove
        this.grooves.set('dnb', {
            name: 'Drum & Bass',
            description: 'DnB shuffle',
            timingOffsets: [0, 10, 0, 25, 0, 10, 0, 25, 0, 10, 0, 25, 0, 10, 0, 25],
            velocityMultipliers: [1.2, 0.6, 0.7, 0.85, 1.15, 0.6, 0.7, 0.85, 1.2, 0.6, 0.7, 0.85, 1.15, 0.6, 0.7, 0.85]
        });

        // House groove
        this.grooves.set('house', {
            name: 'House',
            description: '4-on-floor feel',
            timingOffsets: [0, 5, 5, 5, 0, 5, 5, 5, 0, 5, 5, 5, 0, 5, 5, 5],
            velocityMultipliers: [1.1, 0.85, 0.9, 0.85, 1.1, 0.85, 0.9, 0.85, 1.1, 0.85, 0.9, 0.85, 1.1, 0.85, 0.9, 0.85]
        });

        // Reggae groove
        this.grooves.set('reggae', {
            name: 'Reggae',
            description: 'One drop feel',
            timingOffsets: [0, 20, 10, 15, 0, 20, 10, 15, 0, 20, 10, 15, 0, 20, 10, 15],
            velocityMultipliers: [1.3, 0.5, 0.6, 0.7, 1.2, 0.5, 0.6, 0.7, 1.3, 0.5, 0.6, 0.7, 1.2, 0.5, 0.6, 0.7]
        });

        // Trap groove
        this.grooves.set('trap', {
            name: 'Trap',
            description: 'Hi-hat shuffle',
            timingOffsets: [0, 5, 10, 5, 0, 5, 10, 5, 0, 5, 10, 5, 0, 5, 10, 5],
            velocityMultipliers: [1.0, 0.6, 0.7, 0.6, 1.0, 0.6, 0.7, 0.6, 1.0, 0.6, 0.7, 0.6, 1.0, 0.6, 0.7, 0.6]
        });

        // Latin groove
        this.grooves.set('latin', {
            name: 'Latin',
            description: 'Salsa feel',
            timingOffsets: [0, 15, 0, 20, 5, 15, 0, 20, 0, 15, 0, 20, 5, 15, 0, 20],
            velocityMultipliers: [1.1, 0.9, 0.8, 0.95, 0.85, 0.9, 0.8, 0.95, 1.1, 0.9, 0.8, 0.95, 0.85, 0.9, 0.8, 0.95]
        });
    }

    setGroove(name: string): void {
        if (this.grooves.has(name)) {
            this.currentGroove = name;
        }
    }

    setAmount(amount: number): void {
        this.amount = Math.max(0, Math.min(1, amount));
    }

    applyGroove(step: number, bpm: number): { timingOffset: number; velocityMultiplier: number } {
        const groove = this.grooves.get(this.currentGroove);
        if (!groove) {
            return { timingOffset: 0, velocityMultiplier: 1 };
        }

        const stepIndex = step % 16;
        const beatDuration = 60 / bpm;
        const sixteenthDuration = beatDuration / 4;

        // Timing offset in milliseconds -> seconds
        const timingOffset = (groove.timingOffsets[stepIndex] / 1000) * this.amount * sixteenthDuration;

        // Velocity multiplier
        const velocityMultiplier = 1 + (groove.velocityMultipliers[stepIndex] - 1) * this.amount;

        return { timingOffset, velocityMultiplier };
    }

    quantizeToGroove(time: number, bpm: number): number {
        const beatDuration = 60 / bpm;
        const sixteenthDuration = beatDuration / 4;
        const step = Math.round(time / sixteenthDuration);
        const groove = this.applyGroove(step, bpm);

        return step * sixteenthDuration + groove.timingOffset;
    }

    getGrooveNames(): { id: string; name: string; description: string }[] {
        return Array.from(this.grooves.entries()).map(([id, groove]) => ({
            id,
            name: groove.name,
            description: groove.description
        }));
    }

    createCustomGroove(
        name: string,
        timingOffsets: number[],
        velocityMultipliers: number[]
    ): void {
        this.grooves.set(name, {
            name,
            description: 'Custom groove',
            timingOffsets,
            velocityMultipliers
        });
    }

    extractGrooveFromMidi(notes: { time: number; velocity: number }[], bpm: number): GrooveTemplate {
        const beatDuration = 60 / bpm;
        const sixteenthDuration = beatDuration / 4;
        const timingOffsets: number[] = Array(16).fill(0);
        const velocityMultipliers: number[] = Array(16).fill(1);
        const counts: number[] = Array(16).fill(0);

        notes.forEach(note => {
            const step = Math.round(note.time / sixteenthDuration) % 16;
            const expectedTime = step * sixteenthDuration;
            const offset = (note.time - expectedTime) / sixteenthDuration * 100;

            timingOffsets[step] += offset;
            velocityMultipliers[step] += note.velocity;
            counts[step]++;
        });

        // Average
        for (let i = 0; i < 16; i++) {
            if (counts[i] > 0) {
                timingOffsets[i] /= counts[i];
                velocityMultipliers[i] /= counts[i];
            }
        }

        return {
            name: 'Extracted',
            description: 'Groove from MIDI',
            timingOffsets,
            velocityMultipliers
        };
    }
}

interface GrooveTemplate {
    name: string;
    description: string;
    timingOffsets: number[]; // in ms relative to 16th
    velocityMultipliers: number[];
}

// Global
let groovePoolInstance: GroovePool | null = null;

export function createGroovePool(): GroovePool {
    if (!groovePoolInstance) {
        groovePoolInstance = new GroovePool();
    }
    return groovePoolInstance;
}
