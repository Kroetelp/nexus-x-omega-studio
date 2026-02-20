/**
 * NEXUS-X TR-808 Drum Machine Controller v5.0
 * Authentic Roland TR-808 style drum synthesis
 *
 * The 808 is legendary for:
 * - Deep, resonant kick with pitch envelope
 * - Snappy snare with noise and tone
 * - Metallic cowbell
 * - Tight/crispy hi-hats
 * - Long-decay toms
 */

import { InstrumentController } from './InstrumentController';
import { InstrumentConfig, ParamDefinition } from '../core/types';

// ============================================================
// 808 DRUM PARAMETER IDs
// ============================================================
export enum Drum808Param {
    // === KICK ===
    KICK_TUNE = 0,          // 0-10 (pitch base)
    KICK_DECAY = 1,         // 0-2s (famous long decay!)
    KICK_ATTACK = 2,        // 0-50ms (click/punch)
    KICK_COMP = 3,          // 0-1 (compression/self-distortion)
    KICK_LEVEL = 4,         // 0-1

    // === SNARE ===
    SNARE_TUNE = 10,        // 0-10 (tone pitch)
    SNARE_TONE = 11,        // 0-1 (tone vs noise mix)
    SNARE_SNAPPY = 12,      // 0-1 (noise amount)
    SNARE_DECAY = 13,       // 0-1s
    SNARE_LEVEL = 14,       // 0-1

    // === CLAP ===
    CLAP_DECAY = 20,        // 0-1s
    CLAP_FILTER = 21,       // 0-1 (bandpass width)
    CLAP_REVERB = 22,       // 0-1 (internal reverb)
    CLAP_LEVEL = 23,        // 0-1

    // === HI-HATS ===
    HH_TUNE = 30,           // 0-10 (pitch)
    HH_DECAY = 31,          // 0-500ms
    HH_FILTER = 32,         // 0-1 (highpass)
    HH_CLOSED_LEVEL = 33,   // 0-1
    HH_OPEN_LEVEL = 34,     // 0-1
    HH_OPEN_DECAY = 35,     // 0-1s

    // === TOMS ===
    TOM_TUNE = 40,          // 0-10 (base pitch)
    TOM_DECAY = 41,         // 0-2s (long 808 toms!)
    TOM_LEVEL = 42,         // 0-1
    TOM_LOW_LEVEL = 43,     // 0-1 (low tom)
    TOM_MID_LEVEL = 44,     // 0-1 (mid tom)
    TOM_HI_LEVEL = 45,      // 0-1 (high tom)

    // === COWBELL ===
    COW_TUNE = 50,          // 0-10
    COW_DECAY = 51,         // 0-500ms
    COW_LEVEL = 52,         // 0-1

    // === RIMSHOT ===
    RIM_TUNE = 60,          // 0-10
    RIM_DECAY = 61,         // 0-200ms
    RIM_LEVEL = 62,         // 0-1

    // === CLAVE ===
    CLAVE_TUNE = 70,        // 0-10
    CLAVE_DECAY = 71,       // 0-200ms
    CLAVE_LEVEL = 72,       // 0-1

    // === MARACAS ===
    MARACAS_DECAY = 80,     // 0-200ms
    MARACAS_LEVEL = 81,     // 0-1

    // === GLOBAL ===
    ACCENT = 90,            // 0-1 (global accent boost)
    MASTER_VOL = 91,        // 0-1
    MASTER_PAN = 92,        // -1 to 1
}

// ============================================================
// 808 DRUM SOUNDS (MIDI note mapping - GM standard-ish)
// ============================================================
export enum Drum808Sound {
    KICK = 36,          // C1
    SNARE = 38,         // D1
    CLAP = 39,          // D#1
    HH_CLOSED = 42,     // F#1
    HH_OPEN = 46,       // A#1
    TOM_LOW = 41,       // F1
    TOM_MID = 45,       // A1
    TOM_HI = 48,        // C2
    COWBELL = 56,       // G#2
    RIMSHOT = 37,       // C#1
    CLAVE = 75,         // D#3
    MARACAS = 70,       // A#2
}

// ============================================================
// 808 DRUM CONTROLLER
// ============================================================
export class Drum808Controller extends InstrumentController {
    private static readonly PARAM_DEFS: ParamDefinition[] = [
        // Kick
        { id: Drum808Param.KICK_TUNE, name: 'Kick Tune', min: 0, max: 10, default: 5 },
        { id: Drum808Param.KICK_DECAY, name: 'Kick Decay', min: 0.1, max: 2, default: 0.8, unit: 's' },
        { id: Drum808Param.KICK_ATTACK, name: 'Kick Attack', min: 0, max: 0.05, default: 0.002, unit: 's' },
        { id: Drum808Param.KICK_COMP, name: 'Kick Comp', min: 0, max: 1, default: 0.3 },
        { id: Drum808Param.KICK_LEVEL, name: 'Kick Level', min: 0, max: 1, default: 0.9 },

        // Snare
        { id: Drum808Param.SNARE_TUNE, name: 'Snare Tune', min: 0, max: 10, default: 5 },
        { id: Drum808Param.SNARE_TONE, name: 'Snare Tone', min: 0, max: 1, default: 0.5 },
        { id: Drum808Param.SNARE_SNAPPY, name: 'Snare Snappy', min: 0, max: 1, default: 0.7 },
        { id: Drum808Param.SNARE_DECAY, name: 'Snare Decay', min: 0.05, max: 1, default: 0.2, unit: 's' },
        { id: Drum808Param.SNARE_LEVEL, name: 'Snare Level', min: 0, max: 1, default: 0.8 },

        // Clap
        { id: Drum808Param.CLAP_DECAY, name: 'Clap Decay', min: 0.05, max: 1, default: 0.3, unit: 's' },
        { id: Drum808Param.CLAP_FILTER, name: 'Clap Filter', min: 0, max: 1, default: 0.5 },
        { id: Drum808Param.CLAP_REVERB, name: 'Clap Reverb', min: 0, max: 1, default: 0.3 },
        { id: Drum808Param.CLAP_LEVEL, name: 'Clap Level', min: 0, max: 1, default: 0.7 },

        // Hi-Hats
        { id: Drum808Param.HH_TUNE, name: 'HH Tune', min: 0, max: 10, default: 6 },
        { id: Drum808Param.HH_DECAY, name: 'HH Closed Decay', min: 0.01, max: 0.5, default: 0.05, unit: 's' },
        { id: Drum808Param.HH_FILTER, name: 'HH Filter', min: 0, max: 1, default: 0.5 },
        { id: Drum808Param.HH_CLOSED_LEVEL, name: 'HH Closed Level', min: 0, max: 1, default: 0.6 },
        { id: Drum808Param.HH_OPEN_LEVEL, name: 'HH Open Level', min: 0, max: 1, default: 0.5 },
        { id: Drum808Param.HH_OPEN_DECAY, name: 'HH Open Decay', min: 0.1, max: 1, default: 0.4, unit: 's' },

        // Toms
        { id: Drum808Param.TOM_TUNE, name: 'Tom Tune', min: 0, max: 10, default: 5 },
        { id: Drum808Param.TOM_DECAY, name: 'Tom Decay', min: 0.1, max: 2, default: 0.6, unit: 's' },
        { id: Drum808Param.TOM_LEVEL, name: 'Tom Level', min: 0, max: 1, default: 0.7 },
        { id: Drum808Param.TOM_LOW_LEVEL, name: 'Tom Low Level', min: 0, max: 1, default: 0.8 },
        { id: Drum808Param.TOM_MID_LEVEL, name: 'Tom Mid Level', min: 0, max: 1, default: 0.8 },
        { id: Drum808Param.TOM_HI_LEVEL, name: 'Tom Hi Level', min: 0, max: 1, default: 0.8 },

        // Cowbell
        { id: Drum808Param.COW_TUNE, name: 'Cowbell Tune', min: 0, max: 10, default: 5 },
        { id: Drum808Param.COW_DECAY, name: 'Cowbell Decay', min: 0.05, max: 0.5, default: 0.15, unit: 's' },
        { id: Drum808Param.COW_LEVEL, name: 'Cowbell Level', min: 0, max: 1, default: 0.6 },

        // Rimshot
        { id: Drum808Param.RIM_TUNE, name: 'Rim Tune', min: 0, max: 10, default: 5 },
        { id: Drum808Param.RIM_DECAY, name: 'Rim Decay', min: 0.01, max: 0.2, default: 0.03, unit: 's' },
        { id: Drum808Param.RIM_LEVEL, name: 'Rim Level', min: 0, max: 1, default: 0.6 },

        // Clave
        { id: Drum808Param.CLAVE_TUNE, name: 'Clave Tune', min: 0, max: 10, default: 6 },
        { id: Drum808Param.CLAVE_DECAY, name: 'Clave Decay', min: 0.01, max: 0.2, default: 0.05, unit: 's' },
        { id: Drum808Param.CLAVE_LEVEL, name: 'Clave Level', min: 0, max: 1, default: 0.5 },

        // Maracas
        { id: Drum808Param.MARACAS_DECAY, name: 'Maracas Decay', min: 0.01, max: 0.2, default: 0.03, unit: 's' },
        { id: Drum808Param.MARACAS_LEVEL, name: 'Maracas Level', min: 0, max: 1, default: 0.4 },

        // Global
        { id: Drum808Param.ACCENT, name: 'Accent', min: 0, max: 1, default: 0.5 },
        { id: Drum808Param.MASTER_VOL, name: 'Master', min: 0, max: 1, default: 0.8 },
        { id: Drum808Param.MASTER_PAN, name: 'Pan', min: -1, max: 1, default: 0 },
    ];

    constructor(config: InstrumentConfig) {
        super(config);
    }

    getParamDefinitions(): ParamDefinition[] {
        return Drum808Controller.PARAM_DEFS;
    }

    // ============================================================
    // CONVENIENCE METHODS
    // ============================================================

    /**
     * Set kick parameters - the famous 808 boom!
     */
    setKick(tune: number, decay: number, level: number = 0.9): void {
        this.setParam(Drum808Param.KICK_TUNE, tune);
        this.setParam(Drum808Param.KICK_DECAY, decay);
        this.setParam(Drum808Param.KICK_LEVEL, level);
    }

    /**
     * Set snare parameters
     */
    setSnare(tune: number, tone: number, snappy: number, level: number = 0.8): void {
        this.setParam(Drum808Param.SNARE_TUNE, tune);
        this.setParam(Drum808Param.SNARE_TONE, tone);
        this.setParam(Drum808Param.SNARE_SNAPPY, snappy);
        this.setParam(Drum808Param.SNARE_LEVEL, level);
    }

    /**
     * Set hi-hats
     */
    setHiHats(tune: number, closedDecay: number, openDecay: number): void {
        this.setParam(Drum808Param.HH_TUNE, tune);
        this.setParam(Drum808Param.HH_DECAY, closedDecay);
        this.setParam(Drum808Param.HH_OPEN_DECAY, openDecay);
    }

    /**
     * Set toms
     */
    setToms(tune: number, decay: number): void {
        this.setParam(Drum808Param.TOM_TUNE, tune);
        this.setParam(Drum808Param.TOM_DECAY, decay);
    }

    /**
     * Trigger kick with accent
     */
    kick(velocity: number = 1, accent: boolean = false): void {
        const v = accent ? velocity * (1 + this.getParam(Drum808Param.ACCENT) * 0.5) : velocity;
        this.noteOn(Drum808Sound.KICK, Math.min(1, v));
    }

    /**
     * Trigger snare with accent
     */
    snare(velocity: number = 1, accent: boolean = false): void {
        const v = accent ? velocity * (1 + this.getParam(Drum808Param.ACCENT) * 0.5) : velocity;
        this.noteOn(Drum808Sound.SNARE, Math.min(1, v));
    }

    /**
     * Trigger clap
     */
    clap(velocity: number = 1, accent: boolean = false): void {
        const v = accent ? velocity * (1 + this.getParam(Drum808Param.ACCENT) * 0.5) : velocity;
        this.noteOn(Drum808Sound.CLAP, Math.min(1, v));
    }

    /**
     * Trigger closed hi-hat
     */
    hhClosed(velocity: number = 1): void {
        this.noteOn(Drum808Sound.HH_CLOSED, velocity);
    }

    /**
     * Trigger open hi-hat
     */
    hhOpen(velocity: number = 1): void {
        this.noteOn(Drum808Sound.HH_OPEN, velocity);
    }

    /**
     * Trigger cowbell 🐮
     */
    cowbell(velocity: number = 1): void {
        this.noteOn(Drum808Sound.COWBELL, velocity);
    }

    /**
     * Set master volume
     */
    setMaster(volume: number, pan: number = 0): void {
        this.setParam(Drum808Param.MASTER_VOL, volume);
        this.setParam(Drum808Param.MASTER_PAN, pan);
    }
}

// ============================================================
// 808 PRESETS
// ============================================================
export interface Drum808Preset {
    name: string;
    description?: string;
    kick?: { tune?: number; decay?: number; attack?: number; comp?: number; level?: number };
    snare?: { tune?: number; tone?: number; snappy?: number; decay?: number; level?: number };
    clap?: { decay?: number; filter?: number; reverb?: number; level?: number };
    hh?: { tune?: number; closedDecay?: number; openDecay?: number; closedLevel?: number; openLevel?: number };
    toms?: { tune?: number; decay?: number; level?: number };
    cowbell?: { tune?: number; decay?: number; level?: number };
    accent?: number;
    master?: number;
}

export const DRUM_808_PRESETS: Record<string, Drum808Preset> = {
    // === CLASSIC 808 ===
    'classic': {
        name: 'Classic 808',
        description: 'Original Roland TR-808 sound',
        kick: { tune: 5, decay: 0.8, attack: 0.002, comp: 0.3, level: 0.9 },
        snare: { tune: 5, tone: 0.5, snappy: 0.7, decay: 0.2, level: 0.8 },
        clap: { decay: 0.3, filter: 0.5, reverb: 0.3, level: 0.7 },
        hh: { tune: 6, closedDecay: 0.05, openDecay: 0.4, closedLevel: 0.6, openLevel: 0.5 },
        toms: { tune: 5, decay: 0.6, level: 0.7 },
        cowbell: { tune: 5, decay: 0.15, level: 0.6 },
        accent: 0.5,
        master: 0.8,
    },

    // === HIP-HOP ===
    'hiphop': {
        name: 'Hip-Hop',
        description: 'Deep 808s for trap and hip-hop',
        kick: { tune: 3, decay: 1.5, attack: 0.005, comp: 0.5, level: 1.0 },
        snare: { tune: 4, tone: 0.4, snappy: 0.8, decay: 0.25, level: 0.85 },
        clap: { decay: 0.35, filter: 0.4, reverb: 0.4, level: 0.75 },
        hh: { tune: 7, closedDecay: 0.04, openDecay: 0.5, closedLevel: 0.55, openLevel: 0.45 },
        accent: 0.6,
        master: 0.85,
    },

    // === TRAP ===
    'trap': {
        name: 'Trap',
        description: 'Modern trap 808 with extra sub',
        kick: { tune: 2, decay: 1.8, attack: 0.003, comp: 0.6, level: 1.0 },
        snare: { tune: 5, tone: 0.3, snappy: 0.9, decay: 0.3, level: 0.9 },
        clap: { decay: 0.4, filter: 0.3, reverb: 0.5, level: 0.8 },
        hh: { tune: 8, closedDecay: 0.03, openDecay: 0.6, closedLevel: 0.5, openLevel: 0.4 },
        toms: { tune: 4, decay: 0.8, level: 0.75 },
        accent: 0.7,
        master: 0.9,
    },

    // === DEEP HOUSE ===
    'deep-house': {
        name: 'Deep House',
        description: 'Punchy but controlled 808',
        kick: { tune: 6, decay: 0.5, attack: 0.002, comp: 0.2, level: 0.85 },
        snare: { tune: 6, tone: 0.6, snappy: 0.6, decay: 0.15, level: 0.7 },
        clap: { decay: 0.25, filter: 0.6, reverb: 0.2, level: 0.65 },
        hh: { tune: 5, closedDecay: 0.06, openDecay: 0.35, closedLevel: 0.65, openLevel: 0.55 },
        accent: 0.4,
        master: 0.75,
    },

    // === TECHNO ===
    'techno-808': {
        name: 'Techno 808',
        description: 'Tight 808 for electronic music',
        kick: { tune: 7, decay: 0.4, attack: 0.001, comp: 0.3, level: 0.9 },
        snare: { tune: 7, tone: 0.5, snappy: 0.7, decay: 0.12, level: 0.75 },
        clap: { decay: 0.2, filter: 0.7, reverb: 0.1, level: 0.6 },
        hh: { tune: 7, closedDecay: 0.04, openDecay: 0.25, closedLevel: 0.7, openLevel: 0.6 },
        cowbell: { tune: 7, decay: 0.1, level: 0.5 },
        accent: 0.5,
        master: 0.8,
    },

    // === BOOM BAP ===
    'boom-bap': {
        name: 'Boom Bap',
        description: 'Classic hip-hop drums',
        kick: { tune: 4, decay: 0.6, attack: 0.003, comp: 0.4, level: 0.95 },
        snare: { tune: 5, tone: 0.5, snappy: 0.75, decay: 0.2, level: 0.85 },
        clap: { decay: 0.3, filter: 0.5, reverb: 0.35, level: 0.7 },
        hh: { tune: 6, closedDecay: 0.05, openDecay: 0.35, closedLevel: 0.6, openLevel: 0.5 },
        accent: 0.55,
        master: 0.85,
    },

    // === ACID ===
    'acid-808': {
        name: 'Acid 808',
        description: 'Squigy 808 for acid tracks',
        kick: { tune: 6, decay: 0.7, attack: 0.002, comp: 0.35, level: 0.9 },
        snare: { tune: 6, tone: 0.4, snappy: 0.8, decay: 0.18, level: 0.8 },
        clap: { decay: 0.25, filter: 0.5, reverb: 0.3, level: 0.65 },
        hh: { tune: 8, closedDecay: 0.03, openDecay: 0.4, closedLevel: 0.55, openLevel: 0.45 },
        cowbell: { tune: 6, decay: 0.12, level: 0.7 },
        accent: 0.6,
        master: 0.8,
    },

    // === MIAMI BASS ===
    'miami-bass': {
        name: 'Miami Bass',
        description: 'Super deep 808 kick',
        kick: { tune: 1.5, decay: 2.0, attack: 0.008, comp: 0.7, level: 1.0 },
        snare: { tune: 5, tone: 0.3, snappy: 0.85, decay: 0.22, level: 0.8 },
        clap: { decay: 0.35, filter: 0.4, reverb: 0.4, level: 0.7 },
        hh: { tune: 7, closedDecay: 0.04, openDecay: 0.45, closedLevel: 0.5, openLevel: 0.4 },
        toms: { tune: 3, decay: 1.0, level: 0.8 },
        accent: 0.65,
        master: 0.9,
    },

    // === DUB ===
    'dub-808': {
        name: 'Dub 808',
        description: 'Deep and spacey',
        kick: { tune: 3, decay: 1.2, attack: 0.004, comp: 0.4, level: 0.95 },
        snare: { tune: 4, tone: 0.6, snappy: 0.6, decay: 0.35, level: 0.75 },
        clap: { decay: 0.5, filter: 0.3, reverb: 0.7, level: 0.65 },
        hh: { tune: 5, closedDecay: 0.06, openDecay: 0.6, closedLevel: 0.5, openLevel: 0.4 },
        accent: 0.5,
        master: 0.8,
    },
};
