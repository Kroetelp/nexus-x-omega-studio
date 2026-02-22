/**
 * NEXUS-X Note Repeat
 * Repeat notes at specified rate
 */

export class NoteRepeat {
    private isActive: boolean = false;
    private rate: NoteRepeatRate = '1/16';
    private currentNote: number | null = null;
    private currentVelocity: number = 0;
    private interval: number | null = null;
    private onNoteOn: ((note: number, velocity: number) => void) | null = null;
    private onNoteOff: ((note: number) => void) | null = null;
    private bpm: number = 128;
    private latch: boolean = false;
    private latchedNotes: Set<number> = new Set();

    private readonly RATE_VALUES: Record<NoteRepeatRate, number> = {
        '1/4': 4,
        '1/4T': 3,
        '1/8': 2,
        '1/8T': 1.5,
        '1/16': 1,
        '1/16T': 0.75,
        '1/32': 0.5,
        '1/32T': 0.375
    };

    setRate(rate: NoteRepeatRate): void {
        this.rate = rate;
        if (this.isActive && this.currentNote !== null) {
            this.restartRepeat();
        }
    }

    setBPM(bpm: number): void {
        this.bpm = bpm;
        if (this.isActive && this.currentNote !== null) {
            this.restartRepeat();
        }
    }

    setCallbacks(
        onNoteOn: (note: number, velocity: number) => void,
        onNoteOff: (note: number) => void
    ): void {
        this.onNoteOn = onNoteOn;
        this.onNoteOff = onNoteOff;
    }

    noteOn(note: number, velocity: number): void {
        if (this.latch) {
            this.latchedNotes.add(note);
        }

        this.currentNote = note;
        this.currentVelocity = velocity;

        if (this.isActive) {
            this.startRepeat();
        } else {
            if (this.onNoteOn) {
                this.onNoteOn(note, velocity);
            }
        }
    }

    noteOff(note: number): void {
        if (this.latch) {
            this.latchedNotes.delete(note);
            if (this.latchedNotes.size === 0) {
                this.stopRepeat();
            }
            return;
        }

        if (note === this.currentNote) {
            this.stopRepeat();
            this.currentNote = null;
        }
    }

    setActive(active: boolean): void {
        this.isActive = active;
        if (!active) {
            this.stopRepeat();
        }
    }

    setLatch(enabled: boolean): void {
        this.latch = enabled;
        if (!enabled) {
            this.latchedNotes.clear();
        }
    }

    private startRepeat(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }

        const beatDuration = 60 / this.bpm;
        const rateValue = this.RATE_VALUES[this.rate];
        const repeatInterval = (beatDuration / rateValue) * 1000;

        // Trigger immediately
        if (this.currentNote !== null && this.onNoteOn) {
            this.onNoteOn(this.currentNote, this.currentVelocity);
        }

        // Set up repeat interval
        this.interval = window.setInterval(() => {
            if (this.currentNote !== null && this.onNoteOn && this.onNoteOff) {
                // Quick note off then on
                this.onNoteOff(this.currentNote);
                setTimeout(() => {
                    if (this.currentNote !== null && this.onNoteOn) {
                        this.onNoteOn(this.currentNote, this.currentVelocity * 0.95);
                    }
                }, 10);
            }
        }, repeatInterval);
    }

    private stopRepeat(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.currentNote !== null && this.onNoteOff) {
            this.onNoteOff(this.currentNote);
        }
    }

    private restartRepeat(): void {
        this.stopRepeat();
        if (this.currentNote !== null) {
            this.startRepeat();
        }
    }

    getAvailableRates(): NoteRepeatRate[] {
        return Object.keys(this.RATE_VALUES) as NoteRepeatRate[];
    }

    isRepeating(): boolean {
        return this.interval !== null;
    }

    // Arpeggiate held notes
    startArpeggiator(notes: number[], mode: 'up' | 'down' | 'random' = 'up'): void {
        if (notes.length === 0) return;

        let noteIndex = 0;
        const sortedNotes = [...notes].sort((a, b) => a - b);

        const beatDuration = 60 / this.bpm;
        const rateValue = this.RATE_VALUES[this.rate];
        const repeatInterval = (beatDuration / rateValue) * 1000;

        this.stopRepeat();

        this.interval = window.setInterval(() => {
            let note: number;

            switch (mode) {
                case 'up':
                    note = sortedNotes[noteIndex % sortedNotes.length];
                    break;
                case 'down':
                    note = sortedNotes[sortedNotes.length - 1 - (noteIndex % sortedNotes.length)];
                    break;
                case 'random':
                    note = sortedNotes[Math.floor(Math.random() * sortedNotes.length)];
                    break;
            }

            if (this.onNoteOn && this.onNoteOff) {
                this.onNoteOn(note, this.currentVelocity);
                setTimeout(() => this.onNoteOff?.(note), repeatInterval * 0.8);
            }

            noteIndex++;
        }, repeatInterval);
    }
}

type NoteRepeatRate = '1/4' | '1/4T' | '1/8' | '1/8T' | '1/16' | '1/16T' | '1/32' | '1/32T';

// Global
let noteRepeatInstance: NoteRepeat | null = null;

export function createNoteRepeat(): NoteRepeat {
    if (!noteRepeatInstance) {
        noteRepeatInstance = new NoteRepeat();
    }
    return noteRepeatInstance;
}
