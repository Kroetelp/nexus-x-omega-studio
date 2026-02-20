/**
 * NEXUS-X Chord Generator
 * Generate chords from root notes and progressions
 */

export class ChordGenerator {
    private readonly CHORD_TYPES: Record<string, number[]> = {
        major: [0, 4, 7],
        minor: [0, 3, 7],
        dim: [0, 3, 6],
        aug: [0, 4, 8],
        maj7: [0, 4, 7, 11],
        min7: [0, 3, 7, 10],
        dom7: [0, 4, 7, 10],
        dim7: [0, 3, 6, 9],
        sus2: [0, 2, 7],
        sus4: [0, 5, 7],
        add9: [0, 4, 7, 14],
        min9: [0, 3, 7, 10, 14],
        maj9: [0, 4, 7, 11, 14],
        '7b5': [0, 4, 6, 10],
        '7#5': [0, 4, 8, 10],
        min11: [0, 3, 7, 10, 14, 17],
        power: [0, 7],
        '5': [0, 7]
    };

    private readonly PROGRESSIONS: Record<string, string[]> = {
        'pop': ['I', 'V', 'vi', 'IV'],
        'jazz': ['ii', 'V', 'I', 'vi'],
        'blues': ['I', 'IV', 'I', 'V'],
        'rock': ['I', 'bVII', 'IV', 'I'],
        'emotional': ['vi', 'IV', 'I', 'V'],
        'epic': ['i', 'bVI', 'bIII', 'bVII'],
        'trance': ['i', 'bVI', 'III', 'bVII'],
        'lofi': ['ii', 'v', 'i', 'VI'],
        'house': ['i', 'VII', 'bVI', 'V'],
        'neosoul': ['ii', 'V', 'I', 'iii']
    };

    private readonly ROMAN_NUMERALS: Record<string, number> = {
        'I': 0, 'II': 2, 'III': 4, 'IV': 5, 'V': 7, 'VI': 9, 'VII': 11,
        'i': 0, 'ii': 2, 'iii': 4, 'iv': 5, 'v': 7, 'vi': 9, 'vii': 11,
        'bII': 1, 'bIII': 3, 'bIV': 4, 'bV': 6, 'bVI': 8, 'bVII': 10
    };

    generateChord(root: number, type: string = 'major', inversion: number = 0): number[] {
        const intervals = this.CHORD_TYPES[type] || this.CHORD_TYPES.major;
        const notes = intervals.map(i => root + i);

        // Apply inversion
        for (let i = 0; i < inversion; i++) {
            const lowest = notes.shift()!;
            notes.push(lowest + 12);
        }

        return notes;
    }

    generateProgression(root: number, style: string, scale: string = 'major'): number[][] {
        const progression = this.PROGRESSIONS[style] || this.PROGRESSIONS.pop;
        const chords: number[][] = [];

        progression.forEach(roman => {
            const degree = this.ROMAN_NUMERALS[roman.replace(/[b#]/g, '')] ||
                          this.ROMAN_NUMERALS[roman];
            const chordRoot = root + degree;
            const isMinor = roman === roman.toLowerCase() || style.includes('jazz') || style.includes('lofi');
            const type = isMinor ? 'minor' : 'major';
            chords.push(this.generateChord(chordRoot, type));
        });

        return chords;
    }

    suggestChords(currentChord: number[], key: number, scale: string): number[][] {
        const suggestions: number[][] = [];
        const scaleIntervals = this.getScaleIntervals(scale);

        // Find chord's relationship to key
        const root = currentChord[0] % 12;
        const keyRoot = key % 12;

        // Suggest diatonic chords
        scaleIntervals.forEach(interval => {
            const chordRoot = key + interval;
            if ((chordRoot % 12) !== root) {
                const isMinor = [1, 2, 5].includes(scaleIntervals.indexOf(interval));
                suggestions.push(this.generateChord(chordRoot, isMinor ? 'minor' : 'major'));
            }
        });

        return suggestions.slice(0, 4);
    }

    voiceLeading(from: number[], to: number[]): number[][] {
        // Smooth voice leading between chords
        const voiced: number[] = [...to].sort((a, b) => a - b);
        const fromSorted = [...from].sort((a, b) => a - b);

        // Move each voice by shortest distance
        for (let i = 0; i < Math.min(voiced.length, fromSorted.length); i++) {
            const target = to[i % to.length] % 12;
            const current = fromSorted[i] % 12;

            // Find closest octave
            let bestNote = voiced[i];
            let bestDist = Infinity;

            for (let octave = -2; octave <= 2; octave++) {
                const candidate = current + (target - current) + octave * 12;
                const dist = Math.abs(candidate - fromSorted[i]);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestNote = candidate;
                }
            }

            voiced[i] = bestNote;
        }

        return [from, voiced.sort((a, b) => a - b)];
    }

    private getScaleIntervals(scale: string): number[] {
        const scales: Record<string, number[]> = {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            dorian: [0, 2, 3, 5, 7, 9, 10],
            mixolydian: [0, 2, 4, 5, 7, 9, 10],
            lydian: [0, 2, 4, 6, 7, 9, 11],
            phrygian: [0, 1, 3, 5, 7, 8, 10]
        };
        return scales[scale] || scales.major;
    }

    getChordTypes(): string[] {
        return Object.keys(this.CHORD_TYPES);
    }

    getProgressions(): string[] {
        return Object.keys(this.PROGRESSIONS);
    }

    chordToName(notes: number[]): string {
        if (notes.length === 0) return '';
        const root = notes[0];
        const rootName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][root % 12];
        return rootName;
    }
}

// Global
let chordGenInstance: ChordGenerator | null = null;

export function createChordGenerator(): ChordGenerator {
    if (!chordGenInstance) {
        chordGenInstance = new ChordGenerator();
    }
    return chordGenInstance;
}
