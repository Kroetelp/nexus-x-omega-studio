/**
 * NEXUS-X Chord Generator
 * Generate chords from root notes and progressions
 *
 * Pure logic class - no UI or audio dependencies
 * Uses centralized ScaleDefinitions for consistency
 */

import {
    SCALES,
    CHORD_TYPES,
    CHORD_PROGRESSIONS,
    ROMAN_NUMERALS,
    ScaleName,
    ChordTypeName,
    getScaleIntervals,
    getChordIntervals,
    midiToNoteName,
    getChordTypeNames
} from './ScaleDefinitions';

export interface ChordEvent {
    notes: number[];
    root: number;
    type: ChordTypeName;
    name: string;
}

export interface ProgressionEvent {
    chords: number[][];
    style: string;
    root: number;
}

type ChordListener = (event: ChordEvent) => void;
type ProgressionListener = (event: ProgressionEvent) => void;

export class ChordGenerator {
    private chordListeners: Set<ChordListener> = new Set();
    private progressionListeners: Set<ProgressionListener> = new Set();

    /**
     * Generate a chord from root note and type
     * @param root - MIDI note number for root
     * @param type - Chord type name
     * @param inversion - Number of inversions (0-3)
     */
    generateChord(root: number, type: ChordTypeName = 'major', inversion: number = 0): number[] {
        const intervals = getChordIntervals(type);
        const notes = intervals.map(i => root + i);

        // Apply inversion (rotate notes up an octave)
        const safeInversion = inversion % notes.length;
        for (let i = 0; i < safeInversion; i++) {
            const lowest = notes.shift()!;
            notes.push(lowest + 12);
        }

        return notes;
    }

    /**
     * Generate a chord progression in a given style
     * @param root - MIDI root note
     * @param style - Progression style name
     * @param scale - Scale to use for chord qualities
     */
    generateProgression(root: number, style: string, scale: ScaleName = 'major'): number[][] {
        const progression = CHORD_PROGRESSIONS[style] || CHORD_PROGRESSIONS.pop;
        const chords: number[][] = [];
        const scaleIntervals = getScaleIntervals(scale);

        progression.forEach(roman => {
            const degree = this.parseRomanNumeral(roman);
            const chordRoot = root + degree;

            // Determine chord quality based on scale degree and case
            const isMinor = roman === roman.toLowerCase() || this.isMinorDegree(degree, scaleIntervals);
            const type: ChordTypeName = isMinor ? 'minor' : 'major';

            chords.push(this.generateChord(chordRoot, type));
        });

        return chords;
    }

    /**
     * Generate diatonic chords for a scale
     * @param root - MIDI root note
     * @param scale - Scale name
     * @param extensions - Include 7ths if true
     */
    generateDiatonicChords(root: number, scale: ScaleName = 'major', extensions: boolean = false): number[][] {
        const scaleIntervals = getScaleIntervals(scale);
        const chords: number[][] = [];

        scaleIntervals.forEach((interval, degree) => {
            const chordRoot = root + interval;
            const type = this.getDiatonicChordType(degree, scale, extensions);
            chords.push(this.generateChord(chordRoot, type));
        });

        return chords;
    }

    /**
     * Suggest next chords based on music theory
     * @param currentChord - Current chord notes
     * @param key - Key root note
     * @param scale - Scale name
     */
    suggestChords(currentChord: number[], key: number, scale: ScaleName = 'major'): number[][] {
        const suggestions: number[][] = [];
        const scaleIntervals = getScaleIntervals(scale);
        const currentRoot = currentChord[0] % 12;
        const keyRoot = key % 12;

        // Suggest diatonic chords (excluding current)
        scaleIntervals.forEach((interval, degree) => {
            const chordRoot = key + interval;
            if ((chordRoot % 12) !== currentRoot) {
                const type = this.getDiatonicChordType(degree, scale, false);
                suggestions.push(this.generateChord(chordRoot, type));
            }
        });

        // Add some common secondary dominants
        const vOfV = key + scaleIntervals[4] + 7; // V/V
        if (suggestions.length < 6) {
            suggestions.push(this.generateChord(vOfV, 'dom7'));
        }

        return suggestions.slice(0, 6);
    }

    /**
     * Apply smooth voice leading between two chords
     * @param from - Source chord
     * @param to - Target chord
     */
    voiceLeading(from: number[], to: number[]): number[] {
        const result: number[] = [...to].sort((a, b) => a - b);
        const fromSorted = [...from].sort((a, b) => a - b);

        // Move each voice by shortest distance
        for (let i = 0; i < Math.min(result.length, fromSorted.length); i++) {
            const target = to[i % to.length] % 12;
            const current = fromSorted[i] % 12;

            // Find closest octave
            let bestNote = result[i];
            let bestDist = Infinity;

            for (let octave = -2; octave <= 2; octave++) {
                const candidate = current + (target - current) + octave * 12;
                const dist = Math.abs(candidate - fromSorted[i]);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestNote = candidate;
                }
            }

            result[i] = bestNote;
        }

        return result.sort((a, b) => a - b);
    }

    /**
     * Generate a chord from a symbol (e.g., "Cmaj7", "Am7", "F#dim")
     * @param symbol - Chord symbol
     */
    fromSymbol(symbol: string): number[] | null {
        const match = symbol.match(/^([A-Ga-g][#b]?)(.+)?$/);
        if (!match) return null;

        const noteMap: Record<string, number> = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
            'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };

        const root = noteMap[match[1]] ?? 0;
        const typePart = (match[2] || 'major').toLowerCase();

        // Map common symbol suffixes to type names
        const typeMap: Record<string, ChordTypeName> = {
            '': 'major',
            'm': 'minor',
            'min': 'minor',
            '-': 'minor',
            'maj7': 'maj7',
            'M7': 'maj7',
            'm7': 'min7',
            'min7': 'min7',
            '-7': 'min7',
            '7': 'dom7',
            'dom7': 'dom7',
            'dim': 'dim',
            'o': 'dim',
            'dim7': 'dim7',
            'aug': 'aug',
            '+': 'aug',
            'sus2': 'sus2',
            'sus4': 'sus4',
            'sus': 'sus4',
            '5': 'power',
            'power': 'power',
            'add9': 'add9',
            '9': 'dom7' // Simplified
        };

        const type = typeMap[typePart] || 'major';
        return this.generateChord(60 + root, type); // C4 + root
    }

    /**
     * Get chord name from notes
     */
    chordToName(notes: number[]): string {
        if (notes.length === 0) return '';

        const root = notes[0] % 12;
        const rootName = midiToNoteName(60 + root, false).replace(/\d+$/, '');

        // Detect chord type
        const intervals = notes.map(n => (n - notes[0]) % 12).sort((a, b) => a - b);
        const intervalStr = intervals.join(',');

        const typeMap: Record<string, string> = {
            '0,4,7': '',
            '0,3,7': 'm',
            '0,3,6': 'dim',
            '0,4,8': 'aug',
            '0,4,7,10': '7',
            '0,4,7,11': 'maj7',
            '0,3,7,10': 'm7',
            '0,2,7': 'sus2',
            '0,5,7': 'sus4',
            '0,7': '5'
        };

        const suffix = typeMap[intervalStr] || '';
        return rootName + suffix;
    }

    /**
     * Get all available chord types
     */
    getChordTypes(): string[] {
        return getChordTypeNames();
    }

    /**
     * Get all available progression styles
     */
    getProgressions(): string[] {
        return Object.keys(CHORD_PROGRESSIONS);
    }

    // ============== EVENT SYSTEM ==============

    onChord(listener: ChordListener): () => void {
        this.chordListeners.add(listener);
        return () => this.chordListeners.delete(listener);
    }

    onProgression(listener: ProgressionListener): () => void {
        this.progressionListeners.add(listener);
        return () => this.progressionListeners.delete(listener);
    }

    private emitChord(event: ChordEvent): void {
        this.chordListeners.forEach(l => l(event));
    }

    private emitProgression(event: ProgressionEvent): void {
        this.progressionListeners.forEach(l => l(event));
    }

    // ============== PRIVATE HELPERS ==============

    private parseRomanNumeral(roman: string): number {
        // Remove accidentals first
        const clean = roman.replace(/[b#]/g, '');
        const accidental = roman.includes('b') ? -1 : (roman.includes('#') ? 1 : 0);

        return (ROMAN_NUMERALS[clean] || 0) + accidental;
    }

    private isMinorDegree(degree: number, scale: number[]): boolean {
        // In major scale: ii, iii, vi are minor
        const minorDegrees = [1, 2, 5]; // Scale degrees 2, 3, 6 (0-indexed)
        return minorDegrees.includes(scale.indexOf(degree));
    }

    private getDiatonicChordType(degree: number, scale: ScaleName, extensions: boolean): ChordTypeName {
        const scaleName = scale.toLowerCase();

        // Major scale harmony
        if (scaleName === 'major' || scaleName === 'ionian') {
            const types: ChordTypeName[] = extensions
                ? ['maj7', 'min7', 'min7', 'maj7', 'dom7', 'min7', 'min7b5']
                : ['major', 'minor', 'minor', 'major', 'major', 'minor', 'dim'];
            return types[degree % 7];
        }

        // Minor scale harmony
        if (scaleName === 'minor' || scaleName === 'natural_minor' || scaleName === 'aeolian') {
            const types: ChordTypeName[] = extensions
                ? ['min7', 'min7b5', 'maj7', 'min7', 'min7', 'maj7', 'dom7']
                : ['minor', 'dim', 'major', 'minor', 'minor', 'major', 'major'];
            return types[degree % 7];
        }

        // Default to major/minor based on degree
        return [1, 2, 5].includes(degree) ? 'minor' : 'major';
    }
}

// ============== GLOBAL INSTANCE ==============

let chordGeneratorInstance: ChordGenerator | null = null;

export function createChordGenerator(): ChordGenerator {
    if (!chordGeneratorInstance) {
        chordGeneratorInstance = new ChordGenerator();
    }
    return chordGeneratorInstance;
}

export function getChordGenerator(): ChordGenerator | null {
    return chordGeneratorInstance;
}

export function resetChordGenerator(): void {
    chordGeneratorInstance = null;
}
