/**
 * NEXUS-X Audio Types v5.0
 * Shared interfaces for the modular audio system
 */

// ============================================================
// INSTRUMENT TYPES
// ============================================================

export type InstrumentType = 'synth' | 'drum' | 'fx' | 'sampler' | 'pad' | 'fm' | 'brass' | '808';

export interface InstrumentConfig {
    id: number;
    type: InstrumentType;
    name: string;
    polyphony?: number;      // Max voices for synths
    channel?: number;        // MIDI channel (0-15)
}

// ============================================================
// PARAMETER SYSTEM
// ============================================================

export interface ParamDefinition {
    id: number;
    name: string;
    min: number;
    max: number;
    default: number;
    unit?: string;           // 'Hz', 'ms', '%', 'dB', 's'
}

export interface ParameterChange {
    instrumentId: number;
    paramId: number;
    value: number;
}

// ============================================================
// MESSAGE TYPES (Main Thread <-> AudioWorklet)
// ============================================================

export enum MessageType {
    // Main Thread -> Worklet
    PARAM_CHANGE = 0,
    NOTE_ON = 1,
    NOTE_OFF = 2,
    RESET = 3,
    REGISTER_INSTRUMENT = 4,
    LOAD_WASM = 5,

    // Worklet -> Main Thread
    METER_UPDATE = 100,
    PEAK_DETECTED = 101,
    INSTRUMENT_READY = 102,
    WASM_READY = 103,
}

export interface WorkletMessage {
    type: MessageType;
    instrumentId: number;
    data1: number;    // paramId / note / type
    data2: number;    // value / velocity / polyphony
}

// ============================================================
// NOTE EVENTS
// ============================================================

export interface NoteEvent {
    instrumentId: number;
    note: number;         // 0-127 MIDI note
    velocity: number;     // 0-1
    duration?: number;    // Optional: Auto note-off in seconds
}

// ============================================================
// CHANNEL (from original AudioEngine)
// ============================================================

export type SynthType = 'kick' | 'noise' | 'metal' | 'bass' | 'lead' | 'pad';

export interface Channel {
    name: string;
    synth: any;  // Tone.js synth
    panner: any;
    vol: any;
    type: SynthType;
    muted: boolean;
    soloed: boolean;
    arpActive: boolean;
}

// ============================================================
// SCALE SYSTEM (67+ Scales)
// ============================================================

export type ScaleType = string;  // Any scale name

export interface ScaleDefinition {
    name: string;
    notes: string[];  // Note names without octave
}

// ============================================================
// KIT TYPES
// ============================================================

export type KitType =
    | 'NEON'
    | 'CINEMATIC'
    | 'DUNGEON'
    | 'GLITCH'
    | 'ACID'
    | 'VINYL'
    | 'CLUB'
    | 'CHIPTUNE'
    | 'INDUSTRIAL'
    | 'ETHEREAL'
    | 'PHONK';

// ============================================================
// METERING
// ============================================================

export interface MeterData {
    peakL: number;
    peakR: number;
    rms: number;
    lufs: number;
}

export type LoudnessStatus = 'too_low' | 'good' | 'too_loud';

export interface LoudnessInfo {
    lufs: number;
    status: LoudnessStatus;
}

// ============================================================
// EFFECTS CONFIG
// ============================================================

export interface EffectsConfig {
    // Basic
    filterFreq: number;
    reverbWet: number;
    delayWet: number;

    // TIER 2 Polish
    presenceGain: number;      // 0-4 dB
    reverbPreDelay: number;    // 0-50 ms
    stereoWidth: number;       // 0-200 %
    warmth: number;            // 0-1

    // TIER 3 Advanced
    multibandLow: number;
    multibandMid: number;
    multibandHigh: number;
    ditherEnabled: boolean;
}
