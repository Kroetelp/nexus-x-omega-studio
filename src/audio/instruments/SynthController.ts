/**
 * NEXUS-X Synth Controller v5.0
 * Melodic synthesizer with full parameter control
 */

import { InstrumentController } from './InstrumentController';
import { InstrumentConfig, ParamDefinition } from '../core/types';

// ============================================================
// SYNTH PARAMETER IDs (Must match C++ enum!)
// ============================================================
export enum SynthParam {
    // Oscillator
    OSC_TYPE = 0,          // 0=sine, 1=saw, 2=square, 3=triangle
    OSC_OCTAVE = 1,        // -2 to +2
    OSC_DETUNE = 2,        // -100 to +100 cents

    // Filter
    FILTER_TYPE = 10,      // 0=lowpass, 1=highpass, 2=bandpass
    FILTER_CUTOFF = 11,    // 20-20000 Hz
    FILTER_RESO = 12,      // 0-1
    FILTER_ENV_AMT = 13,   // -1 to +1

    // Amp Envelope (ADSR)
    AMP_ATTACK = 20,       // 0.001-5 s
    AMP_DECAY = 21,        // 0.001-5 s
    AMP_SUSTAIN = 22,      // 0-1
    AMP_RELEASE = 23,      // 0.001-10 s

    // Filter Envelope
    FLT_ATTACK = 30,
    FLT_DECAY = 31,
    FLT_SUSTAIN = 32,
    FLT_RELEASE = 33,

    // LFO
    LFO_TYPE = 40,         // 0=sine, 1=triangle, 2=square
    LFO_RATE = 41,         // 0.1-20 Hz
    LFO_DEPTH = 42,        // 0-1

    // Glide/Portamento
    GLIDE_TIME = 50,       // 0-2 s
    GLIDE_MODE = 51,       // 0=off, 1=always, 2=legato

    // Master
    MASTER_VOL = 60,       // 0-1
    MASTER_PAN = 61,       // -1 to +1
}

// ============================================================
// OSCILLATOR TYPES
// ============================================================
export enum OscType {
    SINE = 0,
    SAW = 1,
    SQUARE = 2,
    TRIANGLE = 3,
}

export type OscTypeName = 'sine' | 'saw' | 'square' | 'triangle';

// ============================================================
// SYNTH CONTROLLER
// ============================================================
export class SynthController extends InstrumentController {
    // Parameter definitions
    private static readonly PARAM_DEFS: ParamDefinition[] = [
        // Oscillator
        { id: SynthParam.OSC_TYPE, name: 'Oscillator Type', min: 0, max: 3, default: 1 },
        { id: SynthParam.OSC_OCTAVE, name: 'Octave', min: -2, max: 2, default: 0 },
        { id: SynthParam.OSC_DETUNE, name: 'Detune', min: -100, max: 100, default: 0, unit: 'cents' },

        // Filter
        { id: SynthParam.FILTER_TYPE, name: 'Filter Type', min: 0, max: 2, default: 0 },
        { id: SynthParam.FILTER_CUTOFF, name: 'Filter Cutoff', min: 20, max: 20000, default: 2000, unit: 'Hz' },
        { id: SynthParam.FILTER_RESO, name: 'Resonance', min: 0, max: 1, default: 0.3 },
        { id: SynthParam.FILTER_ENV_AMT, name: 'Filter Env Amount', min: -1, max: 1, default: 0 },

        // Amp ADSR
        { id: SynthParam.AMP_ATTACK, name: 'Attack', min: 0.001, max: 5, default: 0.01, unit: 's' },
        { id: SynthParam.AMP_DECAY, name: 'Decay', min: 0.001, max: 5, default: 0.1, unit: 's' },
        { id: SynthParam.AMP_SUSTAIN, name: 'Sustain', min: 0, max: 1, default: 0.7 },
        { id: SynthParam.AMP_RELEASE, name: 'Release', min: 0.001, max: 10, default: 0.3, unit: 's' },

        // Filter ADSR
        { id: SynthParam.FLT_ATTACK, name: 'Filter Attack', min: 0.001, max: 5, default: 0.01, unit: 's' },
        { id: SynthParam.FLT_DECAY, name: 'Filter Decay', min: 0.001, max: 5, default: 0.1, unit: 's' },
        { id: SynthParam.FLT_SUSTAIN, name: 'Filter Sustain', min: 0, max: 1, default: 1 },
        { id: SynthParam.FLT_RELEASE, name: 'Filter Release', min: 0.001, max: 10, default: 0.2, unit: 's' },

        // LFO
        { id: SynthParam.LFO_TYPE, name: 'LFO Type', min: 0, max: 2, default: 0 },
        { id: SynthParam.LFO_RATE, name: 'LFO Rate', min: 0.1, max: 20, default: 2, unit: 'Hz' },
        { id: SynthParam.LFO_DEPTH, name: 'LFO Depth', min: 0, max: 1, default: 0 },

        // Glide
        { id: SynthParam.GLIDE_TIME, name: 'Glide Time', min: 0, max: 2, default: 0, unit: 's' },
        { id: SynthParam.GLIDE_MODE, name: 'Glide Mode', min: 0, max: 2, default: 0 },

        // Master
        { id: SynthParam.MASTER_VOL, name: 'Volume', min: 0, max: 1, default: 0.8 },
        { id: SynthParam.MASTER_PAN, name: 'Pan', min: -1, max: 1, default: 0 },
    ];

    constructor(config: InstrumentConfig) {
        super(config);
    }

    getParamDefinitions(): ParamDefinition[] {
        return SynthController.PARAM_DEFS;
    }

    // ============================================================
    // CONVENIENCE METHODS (Higher-level API)
    // ============================================================

    /**
     * Set oscillator type by name
     */
    setOscType(type: OscTypeName): void {
        const types: Record<OscTypeName, number> = {
            sine: OscType.SINE,
            saw: OscType.SAW,
            square: OscType.SQUARE,
            triangle: OscType.TRIANGLE,
        };
        this.setParam(SynthParam.OSC_TYPE, types[type]);
    }

    /**
     * Set oscillator octave
     */
    setOctave(octave: number): void {
        this.setParam(SynthParam.OSC_OCTAVE, Math.max(-2, Math.min(2, octave)));
    }

    /**
     * Set filter cutoff and resonance
     */
    setFilter(cutoff: number, resonance: number): void {
        this.setParam(SynthParam.FILTER_CUTOFF, cutoff);
        this.setParam(SynthParam.FILTER_RESO, resonance);
    }

    /**
     * Set ADSR envelope
     */
    setADSR(attack: number, decay: number, sustain: number, release: number): void {
        this.setParam(SynthParam.AMP_ATTACK, attack);
        this.setParam(SynthParam.AMP_DECAY, decay);
        this.setParam(SynthParam.AMP_SUSTAIN, sustain);
        this.setParam(SynthParam.AMP_RELEASE, release);
    }

    /**
     * Set filter ADSR envelope
     */
    setFilterADSR(attack: number, decay: number, sustain: number, release: number): void {
        this.setParam(SynthParam.FLT_ATTACK, attack);
        this.setParam(SynthParam.FLT_DECAY, decay);
        this.setParam(SynthParam.FLT_SUSTAIN, sustain);
        this.setParam(SynthParam.FLT_RELEASE, release);
    }

    /**
     * Set filter envelope amount
     */
    setFilterEnvAmount(amount: number): void {
        this.setParam(SynthParam.FILTER_ENV_AMT, amount);
    }

    /**
     * Set LFO parameters
     */
    setLFO(rate: number, depth: number, type: OscTypeName = 'sine'): void {
        const types: Record<OscTypeName, number> = {
            sine: 0,
            triangle: 1,
            square: 2,
            saw: 3,
        };
        this.setParam(SynthParam.LFO_TYPE, types[type]);
        this.setParam(SynthParam.LFO_RATE, rate);
        this.setParam(SynthParam.LFO_DEPTH, depth);
    }

    /**
     * Set glide (portamento)
     */
    setGlide(time: number, mode: 'off' | 'always' | 'legato' = 'always'): void {
        const modes = { off: 0, always: 1, legato: 2 };
        this.setParam(SynthParam.GLIDE_TIME, time);
        this.setParam(SynthParam.GLIDE_MODE, modes[mode]);
    }

    /**
     * Set master volume and pan
     */
    setMaster(volume: number, pan: number = 0): void {
        this.setParam(SynthParam.MASTER_VOL, volume);
        this.setParam(SynthParam.MASTER_PAN, pan);
    }

    // ============================================================
    // PRESETS
    // ============================================================

    /**
     * Apply a preset configuration
     */
    applyPreset(preset: SynthPreset): void {
        if (preset.oscType) this.setOscType(preset.oscType);
        if (preset.filter) this.setFilter(preset.filter.cutoff, preset.filter.resonance);
        if (preset.adsr) this.setADSR(preset.adsr.attack, preset.adsr.decay, preset.adsr.sustain, preset.adsr.release);
        if (preset.glide) this.setGlide(preset.glide.time, preset.glide.mode);
        if (preset.volume !== undefined) this.setParam(SynthParam.MASTER_VOL, preset.volume);
        if (preset.pan !== undefined) this.setParam(SynthParam.MASTER_PAN, preset.pan);
    }
}

// ============================================================
// PRESET INTERFACE
// ============================================================
export interface SynthPreset {
    oscType?: OscTypeName;
    filter?: {
        cutoff: number;
        resonance: number;
    };
    adsr?: {
        attack: number;
        decay: number;
        sustain: number;
        release: number;
    };
    glide?: {
        time: number;
        mode: 'off' | 'always' | 'legato';
    };
    volume?: number;
    pan?: number;
}

// ============================================================
// BUILT-IN PRESETS
// ============================================================
export const SYNTH_PRESETS: Record<string, SynthPreset> = {
    lead: {
        oscType: 'saw',
        filter: { cutoff: 3000, resonance: 0.3 },
        adsr: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.2 },
        glide: { time: 0.05, mode: 'legato' },
        volume: 0.8,
    },
    pad: {
        oscType: 'sine',
        filter: { cutoff: 2000, resonance: 0.2 },
        adsr: { attack: 0.5, decay: 0.3, sustain: 0.8, release: 1.0 },
        glide: { time: 0, mode: 'off' },
        volume: 0.5,
    },
    bass: {
        oscType: 'square',
        filter: { cutoff: 800, resonance: 0.4 },
        adsr: { attack: 0.001, decay: 0.2, sustain: 0.5, release: 0.1 },
        glide: { time: 0.02, mode: 'always' },
        volume: 0.9,
        pan: 0,
    },
    pluck: {
        oscType: 'triangle',
        filter: { cutoff: 5000, resonance: 0.5 },
        adsr: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.2 },
        glide: { time: 0, mode: 'off' },
        volume: 0.7,
    },
    ambient: {
        oscType: 'sine',
        filter: { cutoff: 1500, resonance: 0.1 },
        adsr: { attack: 1.0, decay: 0.5, sustain: 0.9, release: 2.0 },
        glide: { time: 0.3, mode: 'always' },
        volume: 0.4,
    },
};
