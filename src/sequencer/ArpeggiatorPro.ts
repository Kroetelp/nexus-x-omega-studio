/**
 * NEXUS-X Arpeggiator Pro
 * Advanced arpeggiator with multiple patterns and modes
 *
 * Pure logic class - generates MIDI note events
 * No direct audio or Tone.js dependencies
 * BPM is passed as parameter for flexibility
 */

import { loggers } from '../utils/logger';

const log = loggers.sequencer;

export type ArpMode = 'up' | 'down' | 'updown' | 'random' | 'converge' | 'chord' | 'step';
export type ArpSpeed = '32n' | '16n' | '8n' | '4n' | '8t' | '16t' | '32t';
export type ArpPattern = 'straight' | 'dotted' | 'triplet' | 'pulse' | 'echo' | 'random';

export interface ArpConfig {
    mode: ArpMode;
    pattern: ArpPattern;
    octaveRange: number;     // 1-4 octaves
    speed: ArpSpeed;
    gate: number;            // 0.1 - 1.0 (note length ratio)
    swing: number;           // 0 - 1.0
    humanize: number;        // 0 - 1.0 (random timing/velocity)
    retrigger: boolean;      // Restart on new note
    hold: boolean;           // Continue when no notes held
}

export interface ArpNoteEvent {
    note: number;
    velocity: number;
    duration: number;        // In milliseconds
    timestamp: number;       // When to play (ms from now)
}

export interface ArpOutputEvent {
    type: 'note_on' | 'note_off';
    note: number;
    velocity: number;
    timestamp: number;
}

type ArpEventListener = (event: ArpOutputEvent) => void;

/**
 * Convert speed notation to milliseconds based on BPM
 */
function speedToMs(speed: ArpSpeed, bpm: number): number {
    const beatMs = 60000 / bpm; // One beat in milliseconds
    const speeds: Record<ArpSpeed, number> = {
        '32n': beatMs / 8,
        '16n': beatMs / 4,
        '8n': beatMs / 2,
        '4n': beatMs,
        '8t': beatMs / 3,
        '16t': beatMs / 6,
        '32t': beatMs / 12
    };
    return speeds[speed] || speeds['16n'];
}

export class ArpeggiatorPro {
    private heldNotes: Set<number> = new Set();
    private currentStep: number = 0;
    private isRunning: boolean = false;
    private schedulerId: number | null = null;
    private lastNote: number = 0;
    private bpm: number = 128;

    private listeners: Set<ArpEventListener> = new Set();

    private config: ArpConfig = {
        mode: 'up',
        pattern: 'straight',
        octaveRange: 2,
        speed: '16n',
        gate: 0.8,
        swing: 0,
        humanize: 0,
        retrigger: true,
        hold: false
    };

    private readonly PATTERNS: Record<ArpPattern, number[]> = {
        straight: [1, 1, 1, 1, 1, 1, 1, 1],
        dotted: [1.5, 0.5, 1.5, 0.5, 1.5, 0.5, 1.5, 0.5],
        triplet: [0.67, 0.67, 0.67, 0.67, 0.67, 0.67, 0.67, 0.67, 0.67, 0.67, 0.67, 0.67],
        pulse: [1, 0, 1, 0, 1, 0, 1, 0],
        echo: [1, 0.5, 0.25, 0, 1, 0.5, 0.25, 0],
        random: []
    };

    /**
     * Set the tempo in BPM
     */
    setBpm(bpm: number): void {
        this.bpm = Math.max(20, Math.min(300, bpm));
    }

    /**
     * Get current BPM
     */
    getBpm(): number {
        return this.bpm;
    }

    /**
     * Add a held note (MIDI note number)
     */
    noteOn(note: number): void {
        this.heldNotes.add(note);
        if (!this.isRunning && this.heldNotes.size > 0) {
            if (this.config.retrigger) {
                this.currentStep = 0;
            }
            this.start();
        }
    }

    /**
     * Remove a held note
     */
    noteOff(note: number): void {
        this.heldNotes.delete(note);
        if (this.heldNotes.size === 0 && !this.config.hold) {
            this.stop();
        }
    }

    /**
     * Set all held notes at once
     */
    setHeldNotes(notes: number[]): void {
        this.heldNotes.clear();
        notes.forEach(n => this.heldNotes.add(n));

        if (this.heldNotes.size > 0 && !this.isRunning) {
            if (this.config.retrigger) {
                this.currentStep = 0;
            }
            this.start();
        } else if (this.heldNotes.size === 0 && !this.config.hold) {
            this.stop();
        }
    }

    /**
     * Clear all held notes
     */
    clearNotes(): void {
        this.heldNotes.clear();
        if (!this.config.hold) {
            this.stop();
        }
    }

    /**
     * Update arpeggiator configuration
     */
    setConfig(config: Partial<ArpConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get current configuration
     */
    getConfig(): ArpConfig {
        return { ...this.config };
    }

    /**
     * Check if arpeggiator is running
     */
    isActive(): boolean {
        return this.isRunning;
    }

    /**
     * Start the arpeggiator
     */
    start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.currentStep = 0;
        this.scheduleNextTick();
    }

    /**
     * Stop the arpeggiator
     */
    stop(): void {
        this.isRunning = false;
        if (this.schedulerId !== null) {
            clearTimeout(this.schedulerId);
            this.schedulerId = null;
        }
        // Send note off for last note
        if (this.lastNote > 0) {
            this.emit({
                type: 'note_off',
                note: this.lastNote,
                velocity: 0,
                timestamp: performance.now()
            });
        }
        this.lastNote = 0;
    }

    /**
     * Subscribe to arpeggiator events
     */
    subscribe(listener: ArpEventListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Generate a sequence of note events for a given duration
     * Useful for pre-computing patterns or testing
     */
    generateSequence(bars: number = 1): ArpNoteEvent[] {
        const events: ArpNoteEvent[] = [];
        const notes = this.getOrderedNotes();

        if (notes.length === 0) return events;

        const stepMs = speedToMs(this.config.speed, this.bpm);
        const stepsPerBar = Math.round((60000 / this.bpm * 4) / stepMs);
        const totalSteps = stepsPerBar * bars;

        let currentTime = 0;

        for (let step = 0; step < totalSteps; step++) {
            const note = this.getNoteAtIndex(notes, step);

            if (note !== null) {
                const humanizeAmount = this.config.humanize * stepMs * 0.3;
                const timingOffset = (Math.random() - 0.5) * humanizeAmount;
                const velocity = Math.max(0.3, Math.min(1, 0.8 + (Math.random() - 0.5) * this.config.humanize * 0.4));
                const duration = stepMs * this.config.gate;

                events.push({
                    note,
                    velocity,
                    duration,
                    timestamp: currentTime + timingOffset
                });
            }

            const swing = step % 2 === 1 ? this.config.swing * stepMs * 0.5 : 0;
            currentTime += stepMs + swing;
        }

        return events;
    }

    // ============== PRIVATE METHODS ==============

    private scheduleNextTick(): void {
        if (!this.isRunning) return;

        const stepMs = speedToMs(this.config.speed, this.bpm);
        const swing = this.currentStep % 2 === 1 ? this.config.swing * stepMs * 0.5 : 0;

        this.schedulerId = window.setTimeout(() => this.tick(), stepMs + swing);
    }

    private tick(): void {
        if (!this.isRunning || (this.heldNotes.size === 0 && !this.config.hold)) {
            this.stop();
            return;
        }

        const notes = this.getOrderedNotes();
        if (notes.length === 0) {
            this.scheduleNextTick();
            return;
        }

        const note = this.getNoteAtIndex(notes, this.currentStep);

        if (note !== null) {
            // Note off previous
            if (this.lastNote > 0) {
                this.emit({
                    type: 'note_off',
                    note: this.lastNote,
                    velocity: 0,
                    timestamp: performance.now()
                });
            }

            // Humanize velocity
            const velocity = Math.max(0.3, Math.min(1,
                0.8 + (Math.random() - 0.5) * this.config.humanize * 0.4
            ));

            // Note on
            this.emit({
                type: 'note_on',
                note,
                velocity,
                timestamp: performance.now()
            });

            this.lastNote = note;

            // Schedule note off
            const stepMs = speedToMs(this.config.speed, this.bpm);
            const gateMs = stepMs * this.config.gate;

            setTimeout(() => {
                if (this.lastNote === note) {
                    this.emit({
                        type: 'note_off',
                        note,
                        velocity: 0,
                        timestamp: performance.now()
                    });
                }
            }, gateMs);
        }

        this.currentStep++;
        this.scheduleNextTick();
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

    private getNoteAtIndex(notes: number[], step: number): number | null {
        if (notes.length === 0) return null;

        // Apply pattern
        const pattern = this.PATTERNS[this.config.pattern];
        if (pattern.length > 0) {
            const patternIndex = step % pattern.length;
            if (pattern[patternIndex] === 0) return null;
        }

        switch (this.config.mode) {
            case 'up':
                return notes[step % notes.length];

            case 'down':
                return notes[notes.length - 1 - (step % notes.length)];

            case 'updown': {
                const cycle = [...notes, ...notes.slice().reverse()];
                return cycle[step % cycle.length];
            }

            case 'random':
                return notes[Math.floor(Math.random() * notes.length)];

            case 'converge': {
                const mid = Math.floor(notes.length / 2);
                return step % 2 === 0
                    ? notes[Math.min(step % notes.length, mid)]
                    : notes[notes.length - 1 - (step % notes.length)];
            }

            case 'chord':
                // Return root note (all notes should play together)
                return notes[0];

            case 'step':
                // Sequential but only from held notes (no octave expansion)
                const held = Array.from(this.heldNotes);
                return held[step % held.length] || null;

            default:
                return notes[step % notes.length];
        }
    }

    private emit(event: ArpOutputEvent): void {
        this.listeners.forEach(listener => {
            try {
                listener(event);
            } catch (e) {
                log.error('Arpeggiator listener error:', e);
            }
        });
    }
}

// ============== GLOBAL INSTANCE ==============

let arpProInstance: ArpeggiatorPro | null = null;

export function createArpeggiatorPro(): ArpeggiatorPro {
    if (!arpProInstance) {
        arpProInstance = new ArpeggiatorPro();
    }
    return arpProInstance;
}

export function getArpeggiatorPro(): ArpeggiatorPro | null {
    return arpProInstance;
}

export function resetArpeggiatorPro(): void {
    if (arpProInstance) {
        arpProInstance.stop();
    }
    arpProInstance = null;
}
