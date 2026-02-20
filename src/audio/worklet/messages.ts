/**
 * NEXUS-X Worklet Messages v5.0
 * Shared message types for Main Thread <-> AudioWorklet communication
 *
 * This file can be imported by both TypeScript and used as reference
 * for the processor.js implementation
 */

// ============================================================
// MESSAGE TYPE CONSTANTS
// ============================================================

export const MessageTypes = {
    // Main Thread → Worklet
    PARAM_CHANGE: 0,
    NOTE_ON: 1,
    NOTE_OFF: 2,
    RESET: 3,
    REGISTER_INSTRUMENT: 4,
    LOAD_WASM: 5,

    // Worklet → Main Thread
    METER_UPDATE: 100,
    PEAK_DETECTED: 101,
    INSTRUMENT_READY: 102,
    WASM_READY: 103,
} as const;

// ============================================================
// INSTRUMENT TYPE CONSTANTS
// ============================================================

export const InstrumentTypes = {
    SYNTH: 0,
    DRUM: 1,
    FX: 2,
    SAMPLER: 3,
} as const;

// ============================================================
// SYNTH PARAMETER CONSTANTS
// (Must match C++ SynthParam enum)
// ============================================================

export const SynthParams = {
    // Oscillator
    OSC_TYPE: 0,
    OSC_OCTAVE: 1,
    OSC_DETUNE: 2,

    // Filter
    FILTER_TYPE: 10,
    FILTER_CUTOFF: 11,
    FILTER_RESO: 12,
    FILTER_ENV_AMT: 13,

    // Amp ADSR
    AMP_ATTACK: 20,
    AMP_DECAY: 21,
    AMP_SUSTAIN: 22,
    AMP_RELEASE: 23,

    // Filter ADSR
    FLT_ATTACK: 30,
    FLT_DECAY: 31,
    FLT_SUSTAIN: 32,
    FLT_RELEASE: 33,

    // LFO
    LFO_TYPE: 40,
    LFO_RATE: 41,
    LFO_DEPTH: 42,

    // Glide
    GLIDE_TIME: 50,
    GLIDE_MODE: 51,

    // Master
    MASTER_VOL: 60,
    MASTER_PAN: 61,
} as const;

// ============================================================
// DRUM PARAMETER CONSTANTS
// (Must match C++ DrumParam enum)
// ============================================================

export const DrumParams = {
    // Kick
    KICK_PITCH: 0,
    KICK_DECAY: 1,
    KICK_PUNCH: 2,
    KICK_DRIVE: 3,

    // Snare
    SNARE_TONE: 10,
    SNARE_SNAPPY: 11,
    SNARE_DECAY: 12,

    // HiHat
    HAT_TONE: 20,
    HAT_DECAY: 21,
    HAT_TIGHT: 22,

    // Clap
    CLAP_TONE: 30,
    CLAP_DECAY: 31,
    CLAP_SPREAD: 32,

    // Master
    MASTER_VOL: 60,
} as const;

// ============================================================
// FX PARAMETER CONSTANTS
// (Must match C++ FxParam enum)
// ============================================================

export const FxParams = {
    // Reverb
    REVERB_SIZE: 0,
    REVERB_DECAY: 1,
    REVERB_WET: 2,
    REVERB_PRE_DELAY: 3,

    // Delay
    DELAY_TIME: 10,
    DELAY_FEEDBACK: 11,
    DELAY_WET: 12,
    DELAY_PINGPONG: 13,

    // Compressor
    COMP_THRESHOLD: 20,
    COMP_RATIO: 21,
    COMP_ATTACK: 22,
    COMP_RELEASE: 23,
    COMP_MAKEUP: 24,

    // Limiter
    LIMIT_CEILING: 30,
    LIMIT_RELEASE: 31,

    // Tape
    TAPE_WARMTH: 40,
    TAPE_DRIVE: 41,

    // Stereo
    STEREO_WIDTH: 50,

    // Presence
    PRESENCE_GAIN: 60,

    // Master
    MASTER_VOL: 70,
} as const;

// ============================================================
// OSCILLATOR TYPES
// ============================================================

export const OscTypes = {
    SINE: 0,
    SAW: 1,
    SQUARE: 2,
    TRIANGLE: 3,
} as const;

// ============================================================
// FILTER TYPES
// ============================================================

export const FilterTypes = {
    LOWPASS: 0,
    HIGHPASS: 1,
    BANDPASS: 2,
} as const;
