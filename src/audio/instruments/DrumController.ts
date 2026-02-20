/**
 * NEXUS-X Drum Controller v5.0
 * Percussion instrument with drum-specific parameters
 */

import { InstrumentController } from './InstrumentController';
import { InstrumentConfig, ParamDefinition } from '../core/types';

// ============================================================
// DRUM PARAMETER IDs (Must match C++ enum!)
// ============================================================
export enum DrumParam {
    // Kick
    KICK_PITCH = 0,        // 30-100 Hz base pitch
    KICK_DECAY = 1,        // 0.1-1.0 s
    KICK_PUNCH = 2,        // 0-1 (initial transient)
    KICK_DRIVE = 3,        // 0-1 (saturation)

    // Snare
    SNARE_TONE = 10,       // 100-500 Hz
    SNARE_SNAPPY = 11,     // 0-1 (noise amount)
    SNARE_DECAY = 12,      // 0.1-0.5 s

    // HiHat
    HAT_TONE = 20,         // 5000-15000 Hz
    HAT_DECAY = 21,        // 0.01-0.5 s
    HAT_TIGHT = 22,        // 0-1 (closed vs open)

    // Clap
    CLAP_TONE = 30,        // 500-2000 Hz
    CLAP_DECAY = 31,       // 0.05-0.3 s
    CLAP_SPREAD = 32,      // 0-1 (stereo width)

    // Master
    MASTER_VOL = 60,       // 0-1
}

// ============================================================
// DRUM TYPES
// ============================================================
export enum DrumType {
    KICK = 0,
    SNARE = 1,
    CLAP = 2,
    HIHAT_CLOSED = 3,
    HIHAT_OPEN = 4,
    TOM = 5,
    RIM = 6,
    CYMBAL = 7,
}

// ============================================================
// DRUM CONTROLLER
// ============================================================
export class DrumController extends InstrumentController {
    // Parameter definitions
    private static readonly PARAM_DEFS: ParamDefinition[] = [
        // Kick
        { id: DrumParam.KICK_PITCH, name: 'Kick Pitch', min: 30, max: 100, default: 50, unit: 'Hz' },
        { id: DrumParam.KICK_DECAY, name: 'Kick Decay', min: 0.1, max: 1.0, default: 0.4, unit: 's' },
        { id: DrumParam.KICK_PUNCH, name: 'Kick Punch', min: 0, max: 1, default: 0.5 },
        { id: DrumParam.KICK_DRIVE, name: 'Kick Drive', min: 0, max: 1, default: 0.2 },

        // Snare
        { id: DrumParam.SNARE_TONE, name: 'Snare Tone', min: 100, max: 500, default: 200, unit: 'Hz' },
        { id: DrumParam.SNARE_SNAPPY, name: 'Snare Snappy', min: 0, max: 1, default: 0.5 },
        { id: DrumParam.SNARE_DECAY, name: 'Snare Decay', min: 0.1, max: 0.5, default: 0.2, unit: 's' },

        // HiHat
        { id: DrumParam.HAT_TONE, name: 'Hat Tone', min: 5000, max: 15000, default: 10000, unit: 'Hz' },
        { id: DrumParam.HAT_DECAY, name: 'Hat Decay', min: 0.01, max: 0.5, default: 0.1, unit: 's' },
        { id: DrumParam.HAT_TIGHT, name: 'Hat Tight', min: 0, max: 1, default: 0.8 },

        // Clap
        { id: DrumParam.CLAP_TONE, name: 'Clap Tone', min: 500, max: 2000, default: 1000, unit: 'Hz' },
        { id: DrumParam.CLAP_DECAY, name: 'Clap Decay', min: 0.05, max: 0.3, default: 0.15, unit: 's' },
        { id: DrumParam.CLAP_SPREAD, name: 'Clap Spread', min: 0, max: 1, default: 0.5 },

        // Master
        { id: DrumParam.MASTER_VOL, name: 'Volume', min: 0, max: 1, default: 0.8 },
    ];

    private drumType: DrumType;

    constructor(config: InstrumentConfig, drumType: DrumType = DrumType.KICK) {
        super(config);
        this.drumType = drumType;
    }

    getParamDefinitions(): ParamDefinition[] {
        return DrumController.PARAM_DEFS;
    }

    /**
     * Get the drum type
     */
    getDrumType(): DrumType {
        return this.drumType;
    }

    /**
     * Set the drum type
     */
    setDrumType(type: DrumType): void {
        this.drumType = type;
        this.emit('drumTypeChange', type);
    }

    // ============================================================
    // CONVENIENCE METHODS
    // ============================================================

    /**
     * Trigger a hit with velocity
     * Drums use noteOn but ignore the note value, only velocity matters
     */
    hit(velocity: number = 0.8): void {
        // For drums, we use note 36 (C1) as standard, velocity controls the hit
        this.noteOn(36, velocity);
    }

    /**
     * Configure kick drum
     */
    setKick(pitch: number, decay: number, punch: number, drive: number): void {
        this.setParam(DrumParam.KICK_PITCH, pitch);
        this.setParam(DrumParam.KICK_DECAY, decay);
        this.setParam(DrumParam.KICK_PUNCH, punch);
        this.setParam(DrumParam.KICK_DRIVE, drive);
    }

    /**
     * Configure snare
     */
    setSnare(tone: number, snappy: number, decay: number): void {
        this.setParam(DrumParam.SNARE_TONE, tone);
        this.setParam(DrumParam.SNARE_SNAPPY, snappy);
        this.setParam(DrumParam.SNARE_DECAY, decay);
    }

    /**
     * Configure hi-hat
     */
    setHiHat(tone: number, decay: number, tight: number): void {
        this.setParam(DrumParam.HAT_TONE, tone);
        this.setParam(DrumParam.HAT_DECAY, decay);
        this.setParam(DrumParam.HAT_TIGHT, tight);
    }

    /**
     * Configure clap
     */
    setClap(tone: number, decay: number, spread: number): void {
        this.setParam(DrumParam.CLAP_TONE, tone);
        this.setParam(DrumParam.CLAP_DECAY, decay);
        this.setParam(DrumParam.CLAP_SPREAD, spread);
    }
}

// ============================================================
// DRUM PRESET INTERFACE
// ============================================================
export interface DrumPreset {
    type: DrumType;
    params: Partial<Record<DrumParam, number>>;
}

// ============================================================
// BUILT-IN DRUM PRESETS
// ============================================================
export const DRUM_PRESETS: Record<string, DrumPreset> = {
    '808-kick': {
        type: DrumType.KICK,
        params: {
            [DrumParam.KICK_PITCH]: 40,
            [DrumParam.KICK_DECAY]: 0.8,
            [DrumParam.KICK_PUNCH]: 0.7,
            [DrumParam.KICK_DRIVE]: 0.3,
        }
    },
    'acoustic-kick': {
        type: DrumType.KICK,
        params: {
            [DrumParam.KICK_PITCH]: 60,
            [DrumParam.KICK_DECAY]: 0.3,
            [DrumParam.KICK_PUNCH]: 0.9,
            [DrumParam.KICK_DRIVE]: 0.1,
        }
    },
    '808-snare': {
        type: DrumType.SNARE,
        params: {
            [DrumParam.SNARE_TONE]: 180,
            [DrumParam.SNARE_SNAPPY]: 0.6,
            [DrumParam.SNARE_DECAY]: 0.25,
        }
    },
    'tight-hat': {
        type: DrumType.HIHAT_CLOSED,
        params: {
            [DrumParam.HAT_TONE]: 12000,
            [DrumParam.HAT_DECAY]: 0.05,
            [DrumParam.HAT_TIGHT]: 1.0,
        }
    },
    'open-hat': {
        type: DrumType.HIHAT_OPEN,
        params: {
            [DrumParam.HAT_TONE]: 8000,
            [DrumParam.HAT_DECAY]: 0.3,
            [DrumParam.HAT_TIGHT]: 0.2,
        }
    },
};
