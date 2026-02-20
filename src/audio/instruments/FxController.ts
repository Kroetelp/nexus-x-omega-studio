/**
 * NEXUS-X FX Controller v5.0
 * Master effects processor (Reverb, Delay, Compression, etc.)
 */

import { InstrumentController } from './InstrumentController';
import { InstrumentConfig, ParamDefinition } from '../core/types';

// ============================================================
// FX PARAMETER IDs (Must match C++ enum!)
// ============================================================
export enum FxParam {
    // Reverb
    REVERB_SIZE = 0,       // 0-1 (room size)
    REVERB_DECAY = 1,      // 0.1-10 s
    REVERB_WET = 2,        // 0-1
    REVERB_PRE_DELAY = 3,  // 0-100 ms

    // Delay
    DELAY_TIME = 10,       // 0-2 s
    DELAY_FEEDBACK = 11,   // 0-0.9
    DELAY_WET = 12,        // 0-1
    DELAY_PINGPONG = 13,   // 0/1

    // Compressor
    COMP_THRESHOLD = 20,   // -60 to 0 dB
    COMP_RATIO = 21,       // 1-20
    COMP_ATTACK = 22,      // 0-100 ms
    COMP_RELEASE = 23,     // 10-1000 ms
    COMP_MAKEUP = 24,      // 0-24 dB

    // Limiter
    LIMIT_CEILING = 30,    // -3 to 0 dB
    LIMIT_RELEASE = 31,    // 10-500 ms

    // Tape Saturation
    TAPE_WARMTH = 40,      // 0-1
    TAPE_DRIVE = 41,       // 0-1

    // Stereo
    STEREO_WIDTH = 50,     // 0-200 %

    // Presence EQ
    PRESENCE_GAIN = 60,    // 0-6 dB

    // Master
    MASTER_VOL = 70,       // 0-1
}

// ============================================================
// FX CONTROLLER
// ============================================================
export class FxController extends InstrumentController {
    // Parameter definitions
    private static readonly PARAM_DEFS: ParamDefinition[] = [
        // Reverb
        { id: FxParam.REVERB_SIZE, name: 'Reverb Size', min: 0, max: 1, default: 0.5 },
        { id: FxParam.REVERB_DECAY, name: 'Reverb Decay', min: 0.1, max: 10, default: 2.5, unit: 's' },
        { id: FxParam.REVERB_WET, name: 'Reverb Wet', min: 0, max: 1, default: 0.3 },
        { id: FxParam.REVERB_PRE_DELAY, name: 'Reverb Pre-Delay', min: 0, max: 100, default: 20, unit: 'ms' },

        // Delay
        { id: FxParam.DELAY_TIME, name: 'Delay Time', min: 0, max: 2, default: 0.375, unit: 's' },  // 3/8 note
        { id: FxParam.DELAY_FEEDBACK, name: 'Delay Feedback', min: 0, max: 0.9, default: 0.4 },
        { id: FxParam.DELAY_WET, name: 'Delay Wet', min: 0, max: 1, default: 0 },
        { id: FxParam.DELAY_PINGPONG, name: 'Ping Pong', min: 0, max: 1, default: 1 },

        // Compressor
        { id: FxParam.COMP_THRESHOLD, name: 'Comp Threshold', min: -60, max: 0, default: -18, unit: 'dB' },
        { id: FxParam.COMP_RATIO, name: 'Comp Ratio', min: 1, max: 20, default: 4 },
        { id: FxParam.COMP_ATTACK, name: 'Comp Attack', min: 0, max: 100, default: 10, unit: 'ms' },
        { id: FxParam.COMP_RELEASE, name: 'Comp Release', min: 10, max: 1000, default: 100, unit: 'ms' },
        { id: FxParam.COMP_MAKEUP, name: 'Comp Makeup', min: 0, max: 24, default: 3, unit: 'dB' },

        // Limiter
        { id: FxParam.LIMIT_CEILING, name: 'Limit Ceiling', min: -3, max: 0, default: -1, unit: 'dB' },
        { id: FxParam.LIMIT_RELEASE, name: 'Limit Release', min: 10, max: 500, default: 50, unit: 'ms' },

        // Tape Saturation
        { id: FxParam.TAPE_WARMTH, name: 'Tape Warmth', min: 0, max: 1, default: 0 },
        { id: FxParam.TAPE_DRIVE, name: 'Tape Drive', min: 0, max: 1, default: 0 },

        // Stereo
        { id: FxParam.STEREO_WIDTH, name: 'Stereo Width', min: 0, max: 200, default: 100, unit: '%' },

        // Presence EQ
        { id: FxParam.PRESENCE_GAIN, name: 'Presence', min: 0, max: 6, default: 1.5, unit: 'dB' },

        // Master
        { id: FxParam.MASTER_VOL, name: 'Master Volume', min: 0, max: 1, default: 0.8 },
    ];

    constructor(config: InstrumentConfig) {
        super(config);
    }

    getParamDefinitions(): ParamDefinition[] {
        return FxController.PARAM_DEFS;
    }

    // ============================================================
    // CONVENIENCE METHODS
    // ============================================================

    /**
     * Configure reverb
     */
    setReverb(size: number, decay: number, wet: number, preDelay: number = 20): void {
        this.setParam(FxParam.REVERB_SIZE, size);
        this.setParam(FxParam.REVERB_DECAY, decay);
        this.setParam(FxParam.REVERB_WET, wet);
        this.setParam(FxParam.REVERB_PRE_DELAY, preDelay);
    }

    /**
     * Configure delay
     */
    setDelay(time: number, feedback: number, wet: number, pingPong: boolean = true): void {
        this.setParam(FxParam.DELAY_TIME, time);
        this.setParam(FxParam.DELAY_FEEDBACK, feedback);
        this.setParam(FxParam.DELAY_WET, wet);
        this.setParam(FxParam.DELAY_PINGPONG, pingPong ? 1 : 0);
    }

    /**
     * Configure compressor
     */
    setCompressor(threshold: number, ratio: number, attack: number, release: number, makeup: number = 3): void {
        this.setParam(FxParam.COMP_THRESHOLD, threshold);
        this.setParam(FxParam.COMP_RATIO, ratio);
        this.setParam(FxParam.COMP_ATTACK, attack);
        this.setParam(FxParam.COMP_RELEASE, release);
        this.setParam(FxParam.COMP_MAKEUP, makeup);
    }

    /**
     * Configure limiter
     */
    setLimiter(ceiling: number, release: number): void {
        this.setParam(FxParam.LIMIT_CEILING, ceiling);
        this.setParam(FxParam.LIMIT_RELEASE, release);
    }

    /**
     * Configure tape saturation
     */
    setTapeSaturation(warmth: number, drive: number): void {
        this.setParam(FxParam.TAPE_WARMTH, warmth);
        this.setParam(FxParam.TAPE_DRIVE, drive);
    }

    /**
     * Set stereo width (100% = normal)
     */
    setStereoWidth(width: number): void {
        this.setParam(FxParam.STEREO_WIDTH, width);
    }

    /**
     * Set presence EQ gain
     */
    setPresence(gainDb: number): void {
        this.setParam(FxParam.PRESENCE_GAIN, gainDb);
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume: number): void {
        this.setParam(FxParam.MASTER_VOL, volume);
    }
}

// ============================================================
// FX PRESETS
// ============================================================
export interface FxPreset {
    name: string;
    params: Partial<Record<FxParam, number>>;
}

export const FX_PRESETS: Record<string, FxPreset> = {
    'clean': {
        name: 'Clean',
        params: {
            [FxParam.REVERB_WET]: 0.1,
            [FxParam.DELAY_WET]: 0,
            [FxParam.TAPE_WARMTH]: 0,
            [FxParam.COMP_THRESHOLD]: -24,
            [FxParam.COMP_RATIO]: 2,
        }
    },
    'warm': {
        name: 'Warm',
        params: {
            [FxParam.REVERB_WET]: 0.25,
            [FxParam.DELAY_WET]: 0.1,
            [FxParam.TAPE_WARMTH]: 0.3,
            [FxParam.TAPE_DRIVE]: 0.2,
            [FxParam.PRESENCE_GAIN]: 1,
            [FxParam.STEREO_WIDTH]: 120,
        }
    },
    'punchy': {
        name: 'Punchy',
        params: {
            [FxParam.REVERB_WET]: 0.15,
            [FxParam.DELAY_WET]: 0,
            [FxParam.COMP_THRESHOLD]: -12,
            [FxParam.COMP_RATIO]: 6,
            [FxParam.COMP_ATTACK]: 5,
            [FxParam.COMP_RELEASE]: 50,
            [FxParam.COMP_MAKEUP]: 6,
            [FxParam.PRESENCE_GAIN]: 2,
        }
    },
    'ambient': {
        name: 'Ambient',
        params: {
            [FxParam.REVERB_WET]: 0.5,
            [FxParam.REVERB_DECAY]: 5,
            [FxParam.REVERB_PRE_DELAY]: 40,
            [FxParam.DELAY_WET]: 0.2,
            [FxParam.DELAY_TIME]: 0.5,
            [FxParam.DELAY_FEEDBACK]: 0.6,
            [FxParam.STEREO_WIDTH]: 150,
        }
    },
    'club': {
        name: 'Club',
        params: {
            [FxParam.REVERB_WET]: 0.2,
            [FxParam.DELAY_WET]: 0.15,
            [FxParam.COMP_THRESHOLD]: -15,
            [FxParam.COMP_RATIO]: 4,
            [FxParam.COMP_MAKEUP]: 4,
            [FxParam.LIMIT_CEILING]: -0.5,
            [FxParam.PRESENCE_GAIN]: 2.5,
        }
    },
};
