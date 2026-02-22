/**
 * NEXUS-X Central Configuration
 * Shared constants used across the application
 */

// ============================================================
// TRACK CONFIGURATION
// ============================================================

/**
 * Standard 7-track setup
 * Index corresponds to track number in sequencer
 */
export const TRACK_NAMES = ['Kick', 'Snare', 'Clap', 'HiHat', 'Bass', 'Lead', 'Pad'] as const;
export type TrackNameType = typeof TRACK_NAMES[number];

/**
 * Track display names (with aliases)
 */
export const TRACK_DISPLAY_NAMES = [
    'Kick',
    'Snare',
    'Clap',
    'HiHat',
    'Bass',
    'Lead/Arp',
    'Pad/Chord'
] as const;

/**
 * Track colors for UI
 */
export const TRACK_COLORS = [
    '#00ff94',  // Kick - Green
    '#f59e0b',  // Snare - Orange
    '#f59e0b',  // Clap - Orange
    '#00ccff',  // HiHat - Cyan
    '#7c3aed',  // Bass - Purple
    '#ff0055',  // Lead - Pink
    '#00ccff'   // Pad - Cyan
] as const;

/**
 * Number of tracks
 */
export const NUM_TRACKS = 7;

/**
 * Number of steps per pattern
 */
export const STEPS_PER_PATTERN = 32;

/**
 * Steps per bar (16th notes)
 */
export const STEPS_PER_BAR = 16;

/**
 * Default BPM range
 */
export const DEFAULT_BPM_RANGE: [number, number] = [120, 140];

// ============================================================
// TRACK INDEX CONSTANTS
// ============================================================

export const TRACK = {
    KICK: 0,
    SNARE: 1,
    CLAP: 2,
    HIHAT: 3,
    BASS: 4,
    LEAD: 5,
    PAD: 6
} as const;

// ============================================================
// AUDIO CONFIGURATION
// ============================================================

/**
 * Master volume default (0-1)
 */
export const DEFAULT_MASTER_VOLUME = 0.8;

/**
 * Default reverb wetness
 */
export const DEFAULT_REVERB_WET = 0.3;

/**
 * Default delay wetness
 */
export const DEFAULT_DELAY_WET = 0;

// ============================================================
// VISUALIZATION
// ============================================================

/**
 * FFT size for analyzer
 */
export const FFT_SIZE = 256;

/**
 * Waveform points to draw
 */
export const WAVEFORM_POINTS = 128;
