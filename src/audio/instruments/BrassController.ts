/**
 * NEXUS-X Brass/Wind Synth Controller v5.0
 * Physical modeling-inspired brass and wind instruments
 *
 * Features:
 * - Breath pressure modeling (embouchure simulation)
 * - Lip reed synthesis for brass
 * - Formant filtering for realistic timbre
 * - Muted/unmuted modes
 * - Growl and flutter tongue effects
 */

import { InstrumentController } from './InstrumentController';
import { InstrumentConfig, ParamDefinition } from '../core/types';

// ============================================================
// BRASS PARAMETER IDs (Must match C++/JS implementation!)
// ============================================================
export enum BrassParam {
    // === EMBOUCHURE ===
    BREATH_PRESSURE = 0,    // 0-1 breath/air pressure
    LIP_TENSION = 1,        // 0-1 lip tension for pitch stability
    VIBRATO_RATE = 2,       // 0-15 Hz
    VIBRATO_DEPTH = 3,      // 0-1 (semitones)
    GROWL = 4,              // 0-1 growl intensity

    // === FORMANT FILTER ===
    FORMANT_1_FREQ = 10,    // 100-2000 Hz (mouth cavity)
    FORMANT_1_GAIN = 11,    // 0-1
    FORMANT_2_FREQ = 12,    // 500-3000 Hz (throat)
    FORMANT_2_GAIN = 13,    // 0-1
    FORMANT_3_FREQ = 14,    // 1500-5000 Hz (bell)
    FORMANT_3_GAIN = 15,    // 0-1

    // === ENVELOPE ===
    ATTACK = 20,            // 0.001-0.5s (breath attack)
    DECAY = 21,             // 0-2s
    SUSTAIN = 22,           // 0-1
    RELEASE = 23,           // 0.05-2s (breath release)

    // === TONGUING ===
    TONGUE_ATTACK = 30,     // 0-1 sharpness of attack
    FLUTTER = 31,           // 0-1 flutter tongue intensity

    // === MUTE ===
    MUTE_TYPE = 40,         // 0=none, 1=cup, 2=harmon, 3=plunger
    MUTE_AMOUNT = 41,       // 0-1

    // === PITCH ===
    GLIDE = 50,             // 0-1s portamento time
    PITCH_BEND = 51,        // -12 to +12 semitones

    // === MASTER ===
    MASTER_VOL = 60,
    MASTER_PAN = 61,
}

// ============================================================
// INSTRUMENT TYPES
// ============================================================
export enum BrassType {
    TRUMPET = 0,
    TROMBONE = 1,
    FRENCH_HORN = 2,
    TUBA = 3,
    SAXOPHONE = 4,
    CLARINET = 5,
    FLUTE = 6,
    OBOE = 7,
    BASSOON = 8,
    DIDGERIDOO = 9,
}

// ============================================================
// MUTE TYPES
// ============================================================
export enum MuteType {
    NONE = 0,
    CUP = 1,
    HARMON = 2,
    PLUNGER = 3,
    BUCKET = 4,
    PRACTICE = 5,
}

// ============================================================
// BRASS SYNTH CONTROLLER
// ============================================================
export class BrassController extends InstrumentController {
    private brassType: BrassType;
    private static readonly PARAM_DEFS: ParamDefinition[] = [
        // Embouchure
        { id: BrassParam.BREATH_PRESSURE, name: 'Breath', min: 0, max: 1, default: 0.7 },
        { id: BrassParam.LIP_TENSION, name: 'Lip Tension', min: 0, max: 1, default: 0.5 },
        { id: BrassParam.VIBRATO_RATE, name: 'Vibrato Rate', min: 0, max: 15, default: 5, unit: 'Hz' },
        { id: BrassParam.VIBRATO_DEPTH, name: 'Vibrato Depth', min: 0, max: 1, default: 0.3 },
        { id: BrassParam.GROWL, name: 'Growl', min: 0, max: 1, default: 0 },

        // Formants
        { id: BrassParam.FORMANT_1_FREQ, name: 'Formant 1', min: 100, max: 2000, default: 500, unit: 'Hz' },
        { id: BrassParam.FORMANT_1_GAIN, name: 'F1 Gain', min: 0, max: 1, default: 0.8 },
        { id: BrassParam.FORMANT_2_FREQ, name: 'Formant 2', min: 500, max: 3000, default: 1500, unit: 'Hz' },
        { id: BrassParam.FORMANT_2_GAIN, name: 'F2 Gain', min: 0, max: 1, default: 0.6 },
        { id: BrassParam.FORMANT_3_FREQ, name: 'Formant 3', min: 1500, max: 5000, default: 2500, unit: 'Hz' },
        { id: BrassParam.FORMANT_3_GAIN, name: 'F3 Gain', min: 0, max: 1, default: 0.4 },

        // Envelope
        { id: BrassParam.ATTACK, name: 'Attack', min: 0.001, max: 0.5, default: 0.03, unit: 's' },
        { id: BrassParam.DECAY, name: 'Decay', min: 0, max: 2, default: 0.1, unit: 's' },
        { id: BrassParam.SUSTAIN, name: 'Sustain', min: 0, max: 1, default: 0.8 },
        { id: BrassParam.RELEASE, name: 'Release', min: 0.05, max: 2, default: 0.2, unit: 's' },

        // Tonguing
        { id: BrassParam.TONGUE_ATTACK, name: 'Tongue Attack', min: 0, max: 1, default: 0.5 },
        { id: BrassParam.FLUTTER, name: 'Flutter', min: 0, max: 1, default: 0 },

        // Mute
        { id: BrassParam.MUTE_TYPE, name: 'Mute Type', min: 0, max: 5, default: 0 },
        { id: BrassParam.MUTE_AMOUNT, name: 'Mute Amount', min: 0, max: 1, default: 0 },

        // Pitch
        { id: BrassParam.GLIDE, name: 'Glide', min: 0, max: 1, default: 0.02, unit: 's' },
        { id: BrassParam.PITCH_BEND, name: 'Pitch Bend', min: -12, max: 12, default: 0 },

        // Master
        { id: BrassParam.MASTER_VOL, name: 'Volume', min: 0, max: 1, default: 0.7 },
        { id: BrassParam.MASTER_PAN, name: 'Pan', min: -1, max: 1, default: 0 },
    ];

    constructor(config: InstrumentConfig, brassType: BrassType = BrassType.TRUMPET) {
        super(config);
        this.brassType = brassType;
        this.applyTypeDefaults(brassType);
    }

    getParamDefinitions(): ParamDefinition[] {
        return BrassController.PARAM_DEFS;
    }

    getType(): BrassType {
        return this.brassType;
    }

    setType(type: BrassType): void {
        this.brassType = type;
        this.applyTypeDefaults(type);
    }

    // ============================================================
    // INSTRUMENT TYPE DEFAULTS
    // ============================================================

    private applyTypeDefaults(type: BrassType): void {
        switch (type) {
            case BrassType.TRUMPET:
                this.setParam(BrassParam.BREATH_PRESSURE, 0.7);
                this.setParam(BrassParam.LIP_TENSION, 0.6);
                this.setParam(BrassParam.VIBRATO_RATE, 5.5);
                this.setParam(BrassParam.VIBRATO_DEPTH, 0.25);
                this.setParam(BrassParam.FORMANT_1_FREQ, 600);
                this.setParam(BrassParam.FORMANT_2_FREQ, 1800);
                this.setParam(BrassParam.FORMANT_3_FREQ, 2800);
                this.setParam(BrassParam.ATTACK, 0.02);
                this.setParam(BrassParam.RELEASE, 0.15);
                break;

            case BrassType.TROMBONE:
                this.setParam(BrassParam.BREATH_PRESSURE, 0.6);
                this.setParam(BrassParam.LIP_TENSION, 0.5);
                this.setParam(BrassParam.VIBRATO_RATE, 4.5);
                this.setParam(BrassParam.VIBRATO_DEPTH, 0.2);
                this.setParam(BrassParam.FORMANT_1_FREQ, 400);
                this.setParam(BrassParam.FORMANT_2_FREQ, 1200);
                this.setParam(BrassParam.FORMANT_3_FREQ, 2200);
                this.setParam(BrassParam.ATTACK, 0.03);
                this.setParam(BrassParam.RELEASE, 0.2);
                this.setParam(BrassParam.GLIDE, 0.05);
                break;

            case BrassType.FRENCH_HORN:
                this.setParam(BrassParam.BREATH_PRESSURE, 0.55);
                this.setParam(BrassParam.LIP_TENSION, 0.45);
                this.setParam(BrassParam.VIBRATO_RATE, 3.5);
                this.setParam(BrassParam.VIBRATO_DEPTH, 0.15);
                this.setParam(BrassParam.FORMANT_1_FREQ, 350);
                this.setParam(BrassParam.FORMANT_2_FREQ, 900);
                this.setParam(BrassParam.FORMANT_3_FREQ, 1800);
                this.setParam(BrassParam.ATTACK, 0.05);
                this.setParam(BrassParam.RELEASE, 0.25);
                break;

            case BrassType.TUBA:
                this.setParam(BrassParam.BREATH_PRESSURE, 0.5);
                this.setParam(BrassParam.LIP_TENSION, 0.4);
                this.setParam(BrassParam.VIBRATO_RATE, 2.5);
                this.setParam(BrassParam.VIBRATO_DEPTH, 0.1);
                this.setParam(BrassParam.FORMANT_1_FREQ, 200);
                this.setParam(BrassParam.FORMANT_2_FREQ, 600);
                this.setParam(BrassParam.FORMANT_3_FREQ, 1200);
                this.setParam(BrassParam.ATTACK, 0.06);
                this.setParam(BrassParam.RELEASE, 0.3);
                break;

            case BrassType.SAXOPHONE:
                this.setParam(BrassParam.BREATH_PRESSURE, 0.65);
                this.setParam(BrassParam.LIP_TENSION, 0.55);
                this.setParam(BrassParam.VIBRATO_RATE, 5);
                this.setParam(BrassParam.VIBRATO_DEPTH, 0.3);
                this.setParam(BrassParam.GROWL, 0.1);
                this.setParam(BrassParam.FORMANT_1_FREQ, 450);
                this.setParam(BrassParam.FORMANT_2_FREQ, 1400);
                this.setParam(BrassParam.FORMANT_3_FREQ, 2600);
                this.setParam(BrassParam.ATTACK, 0.025);
                this.setParam(BrassParam.RELEASE, 0.18);
                break;

            case BrassType.CLARINET:
                this.setParam(BrassParam.BREATH_PRESSURE, 0.6);
                this.setParam(BrassParam.LIP_TENSION, 0.7);
                this.setParam(BrassParam.VIBRATO_RATE, 4.5);
                this.setParam(BrassParam.VIBRATO_DEPTH, 0.2);
                this.setParam(BrassParam.FORMANT_1_FREQ, 1500);
                this.setParam(BrassParam.FORMANT_2_FREQ, 3000);
                this.setParam(BrassParam.FORMANT_3_GAIN, 0.2);
                this.setParam(BrassParam.ATTACK, 0.015);
                this.setParam(BrassParam.RELEASE, 0.12);
                break;

            case BrassType.FLUTE:
                this.setParam(BrassParam.BREATH_PRESSURE, 0.5);
                this.setParam(BrassParam.LIP_TENSION, 0.3);
                this.setParam(BrassParam.VIBRATO_RATE, 5);
                this.setParam(BrassParam.VIBRATO_DEPTH, 0.15);
                this.setParam(BrassParam.FLUTTER, 0);
                this.setParam(BrassParam.FORMANT_1_FREQ, 800);
                this.setParam(BrassParam.FORMANT_2_FREQ, 2000);
                this.setParam(BrassParam.FORMANT_3_GAIN, 0.3);
                this.setParam(BrassParam.ATTACK, 0.04);
                this.setParam(BrassParam.RELEASE, 0.15);
                break;

            case BrassType.OBOE:
                this.setParam(BrassParam.BREATH_PRESSURE, 0.7);
                this.setParam(BrassParam.LIP_TENSION, 0.8);
                this.setParam(BrassParam.VIBRATO_RATE, 5.5);
                this.setParam(BrassParam.VIBRATO_DEPTH, 0.25);
                this.setParam(BrassParam.FORMANT_1_FREQ, 1200);
                this.setParam(BrassParam.FORMANT_2_FREQ, 2800);
                this.setParam(BrassParam.FORMANT_3_FREQ, 4000);
                this.setParam(BrassParam.ATTACK, 0.02);
                this.setParam(BrassParam.RELEASE, 0.1);
                break;

            case BrassType.DIDGERIDOO:
                this.setParam(BrassParam.BREATH_PRESSURE, 0.6);
                this.setParam(BrassParam.LIP_TENSION, 0.3);
                this.setParam(BrassParam.VIBRATO_RATE, 0);
                this.setParam(BrassParam.VIBRATO_DEPTH, 0);
                this.setParam(BrassParam.GROWL, 0.4);
                this.setParam(BrassParam.FORMANT_1_FREQ, 300);
                this.setParam(BrassParam.FORMANT_2_FREQ, 800);
                this.setParam(BrassParam.FORMANT_3_FREQ, 1500);
                this.setParam(BrassParam.ATTACK, 0.1);
                this.setParam(BrassParam.RELEASE, 0.4);
                break;
        }
    }

    // ============================================================
    // CONVENIENCE METHODS
    // ============================================================

    /**
     * Set breath pressure (0-1)
     */
    setBreath(pressure: number): void {
        this.setParam(BrassParam.BREATH_PRESSURE, pressure);
    }

    /**
     * Set vibrato
     */
    setVibrato(rate: number, depth: number): void {
        this.setParam(BrassParam.VIBRATO_RATE, rate);
        this.setParam(BrassParam.VIBRATO_DEPTH, depth);
    }

    /**
     * Set mute
     */
    setMute(type: MuteType, amount: number = 0.7): void {
        this.setParam(BrassParam.MUTE_TYPE, type);
        this.setParam(BrassParam.MUTE_AMOUNT, amount);
    }

    /**
     * Remove mute
     */
    removeMute(): void {
        this.setParam(BrassParam.MUTE_TYPE, MuteType.NONE);
        this.setParam(BrassParam.MUTE_AMOUNT, 0);
    }

    /**
     * Set ADSR envelope
     */
    setEnvelope(attack: number, decay: number, sustain: number, release: number): void {
        this.setParam(BrassParam.ATTACK, attack);
        this.setParam(BrassParam.DECAY, decay);
        this.setParam(BrassParam.SUSTAIN, sustain);
        this.setParam(BrassParam.RELEASE, release);
    }

    /**
     * Set master volume and pan
     */
    setMaster(volume: number, pan: number = 0): void {
        this.setParam(BrassParam.MASTER_VOL, volume);
        this.setParam(BrassParam.MASTER_PAN, pan);
    }

    // ============================================================
    // BREATH CONTROL (CC2-like)
    // ============================================================

    /**
     * Control note dynamics via breath pressure
     * Call this during sustained notes for expression
     */
    setBreathPressure(pressure: number): void {
        this.setParam(BrassParam.BREATH_PRESSURE, Math.max(0, Math.min(1, pressure)));
    }
}

// ============================================================
// BRASS PRESETS
// ============================================================
export interface BrassPreset {
    name: string;
    type: BrassType;
    breath?: number;
    lipTension?: number;
    vibratoRate?: number;
    vibratoDepth?: number;
    growl?: number;
    formant1?: number;
    formant2?: number;
    formant3?: number;
    attack?: number;
    release?: number;
    muteType?: MuteType;
    volume?: number;
}

export const BRASS_PRESETS: Record<string, BrassPreset> = {
    // === BRASS ===
    'trumpet': {
        name: 'Trumpet',
        type: BrassType.TRUMPET,
        breath: 0.7,
        lipTension: 0.6,
        vibratoRate: 5.5,
        vibratoDepth: 0.25,
        formant1: 600,
        formant2: 1800,
        formant3: 2800,
        attack: 0.02,
        release: 0.15,
        volume: 0.75,
    },

    'muted-trumpet': {
        name: 'Muted Trumpet',
        type: BrassType.TRUMPET,
        breath: 0.65,
        lipTension: 0.7,
        vibratoRate: 5,
        vibratoDepth: 0.3,
        muteType: MuteType.CUP,
        attack: 0.02,
        release: 0.12,
        volume: 0.6,
    },

    'trombone': {
        name: 'Trombone',
        type: BrassType.TROMBONE,
        breath: 0.6,
        lipTension: 0.5,
        vibratoRate: 4.5,
        vibratoDepth: 0.2,
        formant1: 400,
        formant2: 1200,
        formant3: 2200,
        attack: 0.03,
        release: 0.2,
        volume: 0.8,
    },

    'french-horn': {
        name: 'French Horn',
        type: BrassType.FRENCH_HORN,
        breath: 0.55,
        lipTension: 0.45,
        vibratoRate: 3.5,
        vibratoDepth: 0.15,
        formant1: 350,
        formant2: 900,
        formant3: 1800,
        attack: 0.05,
        release: 0.25,
        volume: 0.7,
    },

    'tuba': {
        name: 'Tuba',
        type: BrassType.TUBA,
        breath: 0.5,
        lipTension: 0.4,
        vibratoRate: 2.5,
        vibratoDepth: 0.1,
        formant1: 200,
        formant2: 600,
        formant3: 1200,
        attack: 0.06,
        release: 0.3,
        volume: 0.85,
    },

    // === WOODWINDS ===
    'saxophone': {
        name: 'Saxophone',
        type: BrassType.SAXOPHONE,
        breath: 0.65,
        lipTension: 0.55,
        vibratoRate: 5,
        vibratoDepth: 0.3,
        growl: 0.1,
        formant1: 450,
        formant2: 1400,
        formant3: 2600,
        attack: 0.025,
        release: 0.18,
        volume: 0.75,
    },

    'tenor-sax': {
        name: 'Tenor Sax',
        type: BrassType.SAXOPHONE,
        breath: 0.6,
        lipTension: 0.5,
        vibratoRate: 4.5,
        vibratoDepth: 0.35,
        growl: 0.2,
        formant1: 350,
        formant2: 1100,
        formant3: 2200,
        attack: 0.03,
        release: 0.2,
        volume: 0.8,
    },

    'clarinet': {
        name: 'Clarinet',
        type: BrassType.CLARINET,
        breath: 0.6,
        lipTension: 0.7,
        vibratoRate: 4.5,
        vibratoDepth: 0.2,
        formant1: 1500,
        formant2: 3000,
        formant3: 4500,
        attack: 0.015,
        release: 0.12,
        volume: 0.7,
    },

    'flute': {
        name: 'Flute',
        type: BrassType.FLUTE,
        breath: 0.5,
        lipTension: 0.3,
        vibratoRate: 5,
        vibratoDepth: 0.15,
        formant1: 800,
        formant2: 2000,
        formant3: 3500,
        attack: 0.04,
        release: 0.15,
        volume: 0.6,
    },

    'oboe': {
        name: 'Oboe',
        type: BrassType.OBOE,
        breath: 0.7,
        lipTension: 0.8,
        vibratoRate: 5.5,
        vibratoDepth: 0.25,
        formant1: 1200,
        formant2: 2800,
        formant3: 4000,
        attack: 0.02,
        release: 0.1,
        volume: 0.65,
    },

    'bassoon': {
        name: 'Bassoon',
        type: BrassType.BASSOON,
        breath: 0.55,
        lipTension: 0.65,
        vibratoRate: 3.5,
        vibratoDepth: 0.15,
        formant1: 400,
        formant2: 1100,
        formant3: 2000,
        attack: 0.03,
        release: 0.2,
        volume: 0.75,
    },

    // === SPECIAL ===
    'didgeridoo': {
        name: 'Didgeridoo',
        type: BrassType.DIDGERIDOO,
        breath: 0.6,
        lipTension: 0.3,
        growl: 0.4,
        formant1: 300,
        formant2: 800,
        formant3: 1500,
        attack: 0.1,
        release: 0.4,
        volume: 0.8,
    },

    'brass-section': {
        name: 'Brass Section',
        type: BrassType.TRUMPET,
        breath: 0.65,
        lipTension: 0.55,
        vibratoRate: 4,
        vibratoDepth: 0.2,
        formant1: 500,
        formant2: 1500,
        formant3: 2500,
        attack: 0.025,
        release: 0.18,
        volume: 0.85,
    },
};
