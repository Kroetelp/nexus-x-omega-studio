/**
 * NEXUS-X Bassline Generator
 * Generate intelligent basslines from chords
 */

export class BasslineGenerator {
    private readonly STYLES = {
        root: {
            name: 'Root Notes',
            pattern: [0],
            rhythm: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
            octaveJump: false
        },
        octave: {
            name: 'Octave Pattern',
            pattern: [0, 12],
            rhythm: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
            octaveJump: true
        },
        walking: {
            name: 'Walking Bass',
            pattern: [0, 2, 4, 5],
            rhythm: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            octaveJump: false
        },
        synth: {
            name: 'Synth Bass',
            pattern: [0, 0, 7, 0],
            rhythm: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            octaveJump: false
        },
        acid: {
            name: 'Acid 303',
            pattern: [0, 3, 5, 7],
            rhythm: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0],
            octaveJump: true,
            slide: true
        },
        dubstep: {
            name: 'Dubstep Wobble',
            pattern: [0, 0, 0, 0],
            rhythm: [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
            octaveJump: false,
            wobble: true
        },
        house: {
            name: 'House Bass',
            pattern: [0, 0, 7, 5],
            rhythm: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            octaveJump: false
        },
        trap: {
            name: '808 Trap',
            pattern: [0, -5, -7],
            rhythm: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            octaveJump: true,
            slide: true,
            longDecay: true
        },
        techno: {
            name: 'Techno Pulse',
            pattern: [0],
            rhythm: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
            octaveJump: false
        },
        dnB: {
            name: 'DnB Reese',
            pattern: [0, 7, 0, 5],
            rhythm: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
            octaveJump: false,
            reese: true
        }
    };

    generate(
        chords: number[][],
        style: string,
        bars: number = 4,
        complexity: number = 0.5
    ): BassNote[] {
        const styleConfig = this.STYLES[style] || this.STYLES.root;
        const notes: BassNote[] = [];
        const stepsPerBar = 16;
        const totalSteps = bars * stepsPerBar;

        let step = 0;
        let chordIndex = 0;

        for (let bar = 0; bar < bars; bar++) {
            const chord = chords[chordIndex % chords.length];
            const root = chord[0];

            for (let s = 0; s < stepsPerBar; s++) {
                const globalStep = bar * stepsPerBar + s;
                const rhythmIndex = globalStep % styleConfig.rhythm.length;

                if (styleConfig.rhythm[rhythmIndex] === 1) {
                    const patternIndex = step % styleConfig.pattern.length;
                    const interval = styleConfig.pattern[patternIndex];

                    let notePitch = root + interval - 12; // Down one octave for bass

                    // Add variation based on complexity
                    if (Math.random() < complexity * 0.3) {
                        notePitch += [0, 5, 7, 12][Math.floor(Math.random() * 4)];
                    }

                    // Random velocity
                    const velocity = 0.7 + Math.random() * 0.3;

                    // Duration
                    let duration = 0.25;
                    if (styleConfig.longDecay) duration = 0.5;
                    if (styleConfig.slide) duration = 0.3;

                    notes.push({
                        pitch: notePitch,
                        startTime: globalStep * 0.25,
                        duration: duration,
                        velocity: velocity,
                        slide: styleConfig.slide && Math.random() > 0.5,
                        accent: globalStep % 4 === 0
                    });

                    step++;
                }
            }

            // Change chord every 1-2 bars
            if (bar % Math.ceil(2 - complexity) === 0) {
                chordIndex++;
            }
        }

        return notes;
    }

    getStyles(): { id: string; name: string }[] {
        return Object.entries(this.STYLES).map(([id, config]) => ({
            id,
            name: config.name
        }));
    }

    generateFromMelody(melodyNotes: number[], style: string): BassNote[] {
        // Extract chord tones from melody
        const chordTones = melodyNotes.map(n => n % 12);
        const chords: number[][] = [];

        // Group melody notes into implied chords
        for (let i = 0; i < chordTones.length; i += 4) {
            const group = chordTones.slice(i, i + 4);
            const root = this.findRoot(group);
            chords.push([root, root + 4, root + 7]);
        }

        return this.generate(chords, style, Math.ceil(melodyNotes.length / 4));
    }

    private findRoot(notes: number[]): number {
        // Find most common note as root
        const counts = new Map<number, number>();
        notes.forEach(n => {
            counts.set(n, (counts.get(n) || 0) + 1);
        });

        let maxCount = 0;
        let root = 0;
        counts.forEach((count, note) => {
            if (count > maxCount) {
                maxCount = count;
                root = note;
            }
        });

        return root + 36; // C2 as base
    }
}

interface BassNote {
    pitch: number;
    startTime: number;
    duration: number;
    velocity: number;
    slide?: boolean;
    accent?: boolean;
}

// Global
let bassGenInstance: BasslineGenerator | null = null;

export function createBasslineGenerator(): BasslineGenerator {
    if (!bassGenInstance) {
        bassGenInstance = new BasslineGenerator();
    }
    return bassGenInstance;
}
