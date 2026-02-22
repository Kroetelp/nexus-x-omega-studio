/**
 * NEXUS-X Scale Definitions
 * Centralized scale intervals and music theory constants
 *
 * All intervals are relative to the root note (0 = root)
 * These can be used by ChordGenerator, ScaleLocker, AIComposer, etc.
 */

export type ScaleName = keyof typeof SCALES;

export interface ScaleInfo {
    intervals: number[];
    name: string;
    category: 'major' | 'minor' | 'modal' | 'pentatonic' | 'blues' | 'exotic';
    mood: string[];
}

/**
 * Complete scale definitions with intervals from root
 */
export const SCALES = {
    // Diatonic scales
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    natural_minor: [0, 2, 3, 5, 7, 8, 10],

    // Modes
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10],

    // Harmonic & Melodic minor
    harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
    melodic_minor: [0, 2, 3, 5, 7, 9, 11],

    // Pentatonic scales
    pentatonic_major: [0, 2, 4, 7, 9],
    pentatonic_minor: [0, 3, 5, 7, 10],
    pentatonic: [0, 2, 4, 7, 9], // Alias for major pentatonic

    // Blues scales
    blues: [0, 3, 5, 6, 7, 10],
    blues_major: [0, 2, 3, 4, 7, 9],

    // Exotic scales
    whole_tone: [0, 2, 4, 6, 8, 10],
    diminished: [0, 2, 3, 5, 6, 8, 9, 11],
    augmented: [0, 3, 4, 7, 8, 11],
    hungarian_minor: [0, 2, 3, 6, 7, 8, 11],
    spanish_gypsy: [0, 1, 4, 5, 7, 8, 10],
    japanese: [0, 1, 5, 7, 8],

    // Chromatic
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
} as const;

/**
 * Scale metadata for UI and AI
 */
export const SCALE_INFO: Record<ScaleName, ScaleInfo> = {
    major: { intervals: [0, 2, 4, 5, 7, 9, 11], name: 'Major', category: 'major', mood: ['happy', 'bright', 'uplifting'] },
    minor: { intervals: [0, 2, 3, 5, 7, 8, 10], name: 'Minor', category: 'minor', mood: ['sad', 'melancholic', 'serious'] },
    natural_minor: { intervals: [0, 2, 3, 5, 7, 8, 10], name: 'Natural Minor', category: 'minor', mood: ['sad', 'contemplative'] },
    dorian: { intervals: [0, 2, 3, 5, 7, 9, 10], name: 'Dorian', category: 'modal', mood: ['mysterious', 'jazz', 'soulful'] },
    phrygian: { intervals: [0, 1, 3, 5, 7, 8, 10], name: 'Phrygian', category: 'modal', mood: ['spanish', 'exotic', 'dark'] },
    lydian: { intervals: [0, 2, 4, 6, 7, 9, 11], name: 'Lydian', category: 'modal', mood: ['dreamy', 'floating', 'ethereal'] },
    mixolydian: { intervals: [0, 2, 4, 5, 7, 9, 10], name: 'Mixolydian', category: 'modal', mood: ['bluesy', 'rock', 'dominant'] },
    locrian: { intervals: [0, 1, 3, 5, 6, 8, 10], name: 'Locrian', category: 'modal', mood: ['dissonant', 'dark', 'unstable'] },
    harmonic_minor: { intervals: [0, 2, 3, 5, 7, 8, 11], name: 'Harmonic Minor', category: 'minor', mood: ['classical', 'dramatic', 'eastern'] },
    melodic_minor: { intervals: [0, 2, 3, 5, 7, 9, 11], name: 'Melodic Minor', category: 'minor', mood: ['jazz', 'sophisticated', 'complex'] },
    pentatonic_major: { intervals: [0, 2, 4, 7, 9], name: 'Major Pentatonic', category: 'pentatonic', mood: ['folk', 'country', 'bright'] },
    pentatonic_minor: { intervals: [0, 3, 5, 7, 10], name: 'Minor Pentatonic', category: 'pentatonic', mood: ['rock', 'blues', 'soulful'] },
    pentatonic: { intervals: [0, 2, 4, 7, 9], name: 'Pentatonic', category: 'pentatonic', mood: ['universal', 'easy'] },
    blues: { intervals: [0, 3, 5, 6, 7, 10], name: 'Blues', category: 'blues', mood: ['bluesy', 'soulful', 'expressive'] },
    blues_major: { intervals: [0, 2, 3, 4, 7, 9], name: 'Major Blues', category: 'blues', mood: ['country', 'upbeat'] },
    whole_tone: { intervals: [0, 2, 4, 6, 8, 10], name: 'Whole Tone', category: 'exotic', mood: ['dreamy', 'surreal', 'floating'] },
    diminished: { intervals: [0, 2, 3, 5, 6, 8, 9, 11], name: 'Diminished', category: 'exotic', mood: ['tense', 'suspenseful'] },
    augmented: { intervals: [0, 3, 4, 7, 8, 11], name: 'Augmented', category: 'exotic', mood: ['mysterious', 'strange'] },
    hungarian_minor: { intervals: [0, 2, 3, 6, 7, 8, 11], name: 'Hungarian Minor', category: 'exotic', mood: ['eastern', 'gypsy', 'dramatic'] },
    spanish_gypsy: { intervals: [0, 1, 4, 5, 7, 8, 10], name: 'Spanish Gypsy', category: 'exotic', mood: ['flamenco', 'passionate'] },
    japanese: { intervals: [0, 1, 5, 7, 8], name: 'Japanese', category: 'exotic', mood: ['zen', 'peaceful', 'eastern'] },
    chromatic: { intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], name: 'Chromatic', category: 'exotic', mood: ['all', 'free'] }
};

/**
 * Chord type definitions with intervals
 */
export type ChordTypeName = keyof typeof CHORD_TYPES;

export const CHORD_TYPES = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    dom7: [0, 4, 7, 10],
    dim7: [0, 3, 6, 9],
    min7b5: [0, 3, 6, 10], // Half-diminished (ø7)
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
} as const;

/**
 * Note names for display
 */
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

/**
 * Roman numeral to scale degree mapping
 */
export const ROMAN_NUMERALS: Record<string, number> = {
    'I': 0, 'II': 2, 'III': 4, 'IV': 5, 'V': 7, 'VI': 9, 'VII': 11,
    'i': 0, 'ii': 2, 'iii': 4, 'iv': 5, 'v': 7, 'vi': 9, 'vii': 11,
    'bII': 1, 'bIII': 3, 'bIV': 4, 'bV': 6, 'bVI': 8, 'bVII': 10,
    '#I': 1, '#II': 3, '#III': 5, '#IV': 6, '#V': 8, '#VI': 10, '#VII': 0
};

/**
 * Common chord progressions by style
 */
export const CHORD_PROGRESSIONS: Record<string, string[]> = {
    pop: ['I', 'V', 'vi', 'IV'],
    jazz: ['ii', 'V', 'I', 'vi'],
    blues: ['I', 'IV', 'I', 'V'],
    rock: ['I', 'bVII', 'IV', 'I'],
    emotional: ['vi', 'IV', 'I', 'V'],
    epic: ['i', 'bVI', 'bIII', 'bVII'],
    trance: ['i', 'bVI', 'III', 'bVII'],
    lofi: ['ii', 'v', 'i', 'VI'],
    house: ['i', 'VII', 'bVI', 'V'],
    neosoul: ['ii', 'V', 'I', 'iii'],
    techno: ['i'],
    hiphop: ['i', 'bVII', 'bVI', 'bVII'],
    trap: ['i', 'i', 'bVI', 'bVII']
};

/**
 * Get scale intervals by name (case-insensitive, with aliases)
 */
export function getScaleIntervals(scaleName: string): number[] {
    const normalized = scaleName.toLowerCase().replace(/[-\s]/g, '_');

    // Handle common aliases
    const aliases: Record<string, string> = {
        'minor': 'natural_minor',
        'aeolian': 'natural_minor',
        'ionian': 'major',
        'penta': 'pentatonic',
        'pentatonic': 'pentatonic_major'
    };

    const key = aliases[normalized] || normalized;
    return SCALES[key as ScaleName] ? [...SCALES[key as ScaleName]] : [...SCALES.major];
}

/**
 * Get chord intervals by type name
 */
export function getChordIntervals(type: string): number[] {
    return CHORD_TYPES[type as ChordTypeName] ? [...CHORD_TYPES[type as ChordTypeName]] : [...CHORD_TYPES.major];
}

/**
 * Convert MIDI note number to note name
 */
export function midiToNoteName(midi: number, useFlats: boolean = false): string {
    const octave = Math.floor(midi / 12) - 1;
    const noteInOctave = midi % 12;
    const names = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES;
    return `${names[noteInOctave]}${octave}`;
}

/**
 * Convert note name to MIDI number
 */
export function noteNameToMidi(noteName: string): number {
    const match = noteName.match(/^([A-Ga-g][#b]?)(-?\d+)$/);
    if (!match) return 60; // Default to C4

    const note = match[1];
    const octave = parseInt(match[2]);

    const noteMap: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };

    const noteNum = noteMap[note] ?? 0;
    return (octave + 1) * 12 + noteNum;
}

/**
 * Get all available scale names
 */
export function getScaleNames(): string[] {
    return Object.keys(SCALES);
}

/**
 * Get all available chord type names
 */
export function getChordTypeNames(): string[] {
    return Object.keys(CHORD_TYPES);
}
