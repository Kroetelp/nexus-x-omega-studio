/**
 * NEXUS-X Arpeggiator Pro
 * Advanced arpeggiator with multiple patterns and modes
 */

export class ArpeggiatorPro {
    private heldNotes: Set<number> = new Set();
    private currentStep: number = 0;
    private isRunning: boolean = false;
    private interval: number | null = null;
    private onNoteOn: ((note: number, velocity: number) => void) | null = null;
    private onNoteOff: ((note: number) => void) | null = null;
    private lastNote: number = 0;

    private config: ArpConfig = {
        mode: 'up',
        pattern: 'straight',
        octaveRange: 2,
        speed: '16n',
        gate: 0.8,
        swing: 0,
        humanize: 0
    };

    private readonly PATTERNS: Record<string, number[]> = {
        straight: [1, 1, 1, 1, 1, 1, 1, 1],
        dotted: [1.5, 0.5, 1.5, 0.5, 1.5, 0.5, 1.5, 0.5],
        triplet: [0.67, 0.67, 0.67, 0.67, 0.67, 0.67, 0.67, 0.67, 0.67, 0.67, 0.67, 0.67],
        pulse: [1, 0, 1, 0, 1, 0, 1, 0],
        echo: [1, 0.5, 0.25, 0, 1, 0.5, 0.25, 0],
        random: []
    };

    noteOn(note: number): void {
        this.heldNotes.add(note);
        if (!this.isRunning && this.heldNotes.size > 0) {
            this.start();
        }
    }

    noteOff(note: number): void {
        this.heldNotes.delete(note);
        if (this.heldNotes.size === 0) {
            this.stop();
        }
    }

    setConfig(config: Partial<ArpConfig>): void {
        this.config = { ...this.config, ...config };
    }

    setCallbacks(onNoteOn: (note: number, velocity: number) => void, onNoteOff: (note: number) => void): void {
        this.onNoteOn = onNoteOn;
        this.onNoteOff = onNoteOff;
    }

    private start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.currentStep = 0;
        this.tick();
    }

    private stop(): void {
        this.isRunning = false;
        if (this.interval) {
            clearTimeout(this.interval);
            this.interval = null;
        }
        if (this.lastNote && this.onNoteOff) {
            this.onNoteOff(this.lastNote);
        }
    }

    private tick(): void {
        if (!this.isRunning || this.heldNotes.size === 0) return;

        const notes = this.getOrderedNotes();
        if (notes.length === 0) return;

        // Get current note based on mode
        const note = this.getCurrentNote(notes);
        const velocity = 0.8 + (Math.random() - 0.5) * this.config.humanize * 0.4;

        // Note off previous
        if (this.lastNote && this.onNoteOff) {
            this.onNoteOff(this.lastNote);
        }

        // Note on
        if (this.onNoteOn) {
            this.onNoteOn(note, velocity);
        }
        this.lastNote = note;

        // Schedule next tick
        const speedMs = this.getSpeedMs();
        const swing = this.currentStep % 2 === 1 ? this.config.swing * speedMs * 0.5 : 0;
        const gateMs = speedMs * this.config.gate;

        // Note off after gate time
        setTimeout(() => {
            if (this.lastNote === note && this.onNoteOff) {
                this.onNoteOff(note);
            }
        }, gateMs);

        this.currentStep++;
        this.interval = setTimeout(() => this.tick(), speedMs + swing);
    }

    private getOrderedNotes(): number[] {
        const baseNotes = Array.from(this.heldNotes).sort((a, b) => a - b);
        const notes: number[] = [];

        // Expand by octave range
        for (let octave = 0; octave < this.config.octaveRange; octave++) {
            baseNotes.forEach(n => notes.push(n + octave * 12));
        }

        return notes;
    }

    private getCurrentNote(notes: number[]): number {
        switch (this.config.mode) {
            case 'up':
                return notes[this.currentStep % notes.length];
            case 'down':
                return notes[notes.length - 1 - (this.currentStep % notes.length)];
            case 'updown':
                const cycle = [...notes, ...notes.slice().reverse()];
                return cycle[this.currentStep % cycle.length];
            case 'random':
                return notes[Math.floor(Math.random() * notes.length)];
            case 'converge':
                const mid = Math.floor(notes.length / 2);
                return this.currentStep % 2 === 0
                    ? notes[Math.min(this.currentStep % notes.length, mid)]
                    : notes[notes.length - 1 - (this.currentStep % notes.length)];
            default:
                return notes[this.currentStep % notes.length];
        }
    }

    private getSpeedMs(): number {
        const bpm = Tone.Transport.bpm.value || 128;
        const speeds: Record<string, number> = {
            '32n': (60 / bpm) / 8,
            '16n': (60 / bpm) / 4,
            '8n': (60 / bpm) / 2,
            '4n': 60 / bpm,
            '8t': (60 / bpm) / 3,
            '16t': (60 / bpm) / 6
        };
        return (speeds[this.config.speed] || speeds['16n']) * 1000;
    }
}

interface ArpConfig {
    mode: 'up' | 'down' | 'updown' | 'random' | 'converge';
    pattern: string;
    octaveRange: number;
    speed: string;
    gate: number;
    swing: number;
    humanize: number;
}

// Global
let arpProInstance: ArpeggiatorPro | null = null;

export function createArpeggiatorPro(): ArpeggiatorPro {
    if (!arpProInstance) {
        arpProInstance = new ArpeggiatorPro();
    }
    return arpProInstance;
}
