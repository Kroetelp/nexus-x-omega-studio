/**
 * NEXUS-X Music Theory Module
 * Centralized music theory logic: scales, chords, harmony
 */

// Scale definitions and utilities
export {
    SCALES,
    SCALE_INFO,
    CHORD_TYPES,
    NOTE_NAMES,
    NOTE_NAMES_FLAT,
    ROMAN_NUMERALS,
    CHORD_PROGRESSIONS,
    getScaleIntervals,
    getChordIntervals,
    midiToNoteName,
    noteNameToMidi,
    getScaleNames,
    getChordTypeNames
} from './ScaleDefinitions';
export type { ScaleName, ScaleInfo, ChordTypeName } from './ScaleDefinitions';

// Scale Locker
export {
    ScaleLocker,
    createScaleLocker,
    getScaleLocker,
    resetScaleLocker
} from './ScaleLocker';
export type { ScaleLockConfig, ScaleLockEvent } from './ScaleLocker';

// Chord Generator
export {
    ChordGenerator,
    createChordGenerator,
    getChordGenerator,
    resetChordGenerator
} from './ChordGenerator';
export type { ChordEvent, ProgressionEvent } from './ChordGenerator';
