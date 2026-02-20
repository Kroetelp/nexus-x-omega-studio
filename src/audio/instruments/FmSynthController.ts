/**
 * NEXUS-X FM Synth Controller v5.0
 * 4-Operator FM Synthesizer for metallic, bell-like sounds
 *
 * FM Synthesis: Operators modulate each other's frequency
 * Classic DX7-style algorithms with modern controls
 */

import { InstrumentController } from './InstrumentController';
import { InstrumentConfig, ParamDefinition } from '../core/types';

// ============================================================
// FM SYNTH PARAMETER IDs (Must match C++/JS implementation!)
// ============================================================
export enum FmSynthParam {
    // === OPERATOR 1 (Carrier 1) ===
    OP1_RATIO = 0,         // Frequency ratio (0.5, 1, 2, 3, etc.)
    OP1_LEVEL = 1,         // Output level (0-1)
    OP1_FEEDBACK = 2,      // Self-feedback (0-1)
    OP1_ATTACK = 3,
    OP1_DECAY = 4,
    OP1_SUSTAIN = 5,
    OP1_RELEASE = 6,

    // === OPERATOR 2 (Modulator 1) ===
    OP2_RATIO = 10,
    OP2_LEVEL = 11,
    OP2_FEEDBACK = 12,
    OP2_ATTACK = 13,
    OP2_DECAY = 14,
    OP2_SUSTAIN = 15,
    OP2_RELEASE = 16,

    // === OPERATOR 3 (Carrier 2) ===
    OP3_RATIO = 20,
    OP3_LEVEL = 21,
    OP3_FEEDBACK = 22,
    OP3_ATTACK = 23,
    OP3_DECAY = 24,
    OP3_SUSTAIN = 25,
    OP3_RELEASE = 26,

    // === OPERATOR 4 (Modulator 2) ===
    OP4_RATIO = 30,
    OP4_LEVEL = 31,
    OP4_FEEDBACK = 32,
    OP4_ATTACK = 33,
    OP4_DECAY = 34,
    OP4_SUSTAIN = 35,
    OP4_RELEASE = 36,

    // === GLOBAL ===
    ALGORITHM = 40,        // Algorithm selection (0-7)
    FEEDBACK_GLOBAL = 41,  // Global feedback (0-1)
    LFO_RATE = 42,         // Vibrato rate (Hz)
    LFO_DEPTH = 43,        // Vibrato depth (cents)
    GLIDE = 44,            // Portamento time (s)

    // === MASTER ===
    MASTER_VOL = 60,
    MASTER_PAN = 61,
}

// ============================================================
// FM ALGORITHMS (DX7-style routing)
// ============================================================
export enum FmAlgorithm {
    // Alg 0: Op1 <- Op2 (simple FM)
    //    [2] → [1] → Out
    CARRIER_MOD = 0,

    // Alg 1: Op1 <- Op2 <- Op3 (cascaded)
    //    [3] → [2] → [1] → Out
    CASCADE = 1,

    // Alg 2: Op1 <- (Op2 + Op3) (parallel modulators)
    //    [2] ↘
    //         [1] → Out
    //    [3] ↗
    PARALLEL_MOD = 2,

    // Alg 3: (Op1 + Op4) <- (Op2 + Op3) (dual carriers)
    //    [2] ↘   ↙ [4]
    //         [1] + [4] → Out  (Note: fixed typo from original)
    //    [3] ↗   ↖ [Op3]
    DUAL_CARRIER = 3,

    // Alg 4: Op1 <- Op2, Op3 <- Op4 (independent)
    //    [2] → [1] → Out
    //    [4] → [3] → Out
    INDEPENDENT = 4,

    // Alg 5: Op1 <- Op2, Op1 + Op3 (mixed)
    //    [2] → [1] → Out
    //    [3] → Out
    MIXED = 5,

    // Alg 6: Op1 <- Op2, Op3 feedback
    //    [2] → [1] → Out
    //    [3] ⟲ → Out
    FEEDBACK_ADD = 6,

    // Alg 7: All operators to output (additive)
    //    [1] → Out
    //    [2] → Out
    //    [3] → Out
    //    [4] → Out
    ADDITIVE = 7,
}

// ============================================================
// OPERATOR INTERFACE
// ============================================================
export interface FmOperator {
    ratio: number;      // Frequency multiplier
    level: number;      // Output level (0-1)
    feedback: number;   // Self-feedback (0-1)
    attack: number;     // ADSR
    decay: number;
    sustain: number;
    release: number;
}

// ============================================================
// FM SYNTH CONTROLLER
// ============================================================
export class FmSynthController extends InstrumentController {
    // Parameter definitions
    private static readonly PARAM_DEFS: ParamDefinition[] = [
        // Operator 1
        { id: FmSynthParam.OP1_RATIO, name: 'Op1 Ratio', min: 0.25, max: 16, default: 1 },
        { id: FmSynthParam.OP1_LEVEL, name: 'Op1 Level', min: 0, max: 1, default: 0.8 },
        { id: FmSynthParam.OP1_FEEDBACK, name: 'Op1 Feedback', min: 0, max: 1, default: 0 },
        { id: FmSynthParam.OP1_ATTACK, name: 'Op1 Attack', min: 0.001, max: 2, default: 0.001, unit: 's' },
        { id: FmSynthParam.OP1_DECAY, name: 'Op1 Decay', min: 0.001, max: 2, default: 0.1, unit: 's' },
        { id: FmSynthParam.OP1_SUSTAIN, name: 'Op1 Sustain', min: 0, max: 1, default: 0.5 },
        { id: FmSynthParam.OP1_RELEASE, name: 'Op1 Release', min: 0.001, max: 5, default: 0.3, unit: 's' },

        // Operator 2
        { id: FmSynthParam.OP2_RATIO, name: 'Op2 Ratio', min: 0.25, max: 16, default: 1 },
        { id: FmSynthParam.OP2_LEVEL, name: 'Op2 Level', min: 0, max: 1, default: 0.5 },
        { id: FmSynthParam.OP2_FEEDBACK, name: 'Op2 Feedback', min: 0, max: 1, default: 0 },
        { id: FmSynthParam.OP2_ATTACK, name: 'Op2 Attack', min: 0.001, max: 2, default: 0.001, unit: 's' },
        { id: FmSynthParam.OP2_DECAY, name: 'Op2 Decay', min: 0.001, max: 2, default: 0.05, unit: 's' },
        { id: FmSynthParam.OP2_SUSTAIN, name: 'Op2 Sustain', min: 0, max: 1, default: 0.3 },
        { id: FmSynthParam.OP2_RELEASE, name: 'Op2 Release', min: 0.001, max: 5, default: 0.2, unit: 's' },

        // Operator 3
        { id: FmSynthParam.OP3_RATIO, name: 'Op3 Ratio', min: 0.25, max: 16, default: 1 },
        { id: FmSynthParam.OP3_LEVEL, name: 'Op3 Level', min: 0, max: 1, default: 0 },
        { id: FmSynthParam.OP3_FEEDBACK, name: 'Op3 Feedback', min: 0, max: 1, default: 0 },
        { id: FmSynthParam.OP3_ATTACK, name: 'Op3 Attack', min: 0.001, max: 2, default: 0.001, unit: 's' },
        { id: FmSynthParam.OP3_DECAY, name: 'Op3 Decay', min: 0.001, max: 2, default: 0.1, unit: 's' },
        { id: FmSynthParam.OP3_SUSTAIN, name: 'Op3 Sustain', min: 0, max: 1, default: 0.5 },
        { id: FmSynthParam.OP3_RELEASE, name: 'Op3 Release', min: 0.001, max: 5, default: 0.3, unit: 's' },

        // Operator 4
        { id: FmSynthParam.OP4_RATIO, name: 'Op4 Ratio', min: 0.25, max: 16, default: 1 },
        { id: FmSynthParam.OP4_LEVEL, name: 'Op4 Level', min: 0, max: 1, default: 0 },
        { id: FmSynthParam.OP4_FEEDBACK, name: 'Op4 Feedback', min: 0, max: 1, default: 0 },
        { id: FmSynthParam.OP4_ATTACK, name: 'Op4 Attack', min: 0.001, max: 2, default: 0.001, unit: 's' },
        { id: FmSynthParam.OP4_DECAY, name: 'Op4 Decay', min: 0.001, max: 2, default: 0.1, unit: 's' },
        { id: FmSynthParam.OP4_SUSTAIN, name: 'Op4 Sustain', min: 0, max: 1, default: 0.5 },
        { id: FmSynthParam.OP4_RELEASE, name: 'Op4 Release', min: 0.001, max: 5, default: 0.3, unit: 's' },

        // Global
        { id: FmSynthParam.ALGORITHM, name: 'Algorithm', min: 0, max: 7, default: 0 },
        { id: FmSynthParam.FEEDBACK_GLOBAL, name: 'Global Feedback', min: 0, max: 1, default: 0 },
        { id: FmSynthParam.LFO_RATE, name: 'LFO Rate', min: 0.1, max: 20, default: 5, unit: 'Hz' },
        { id: FmSynthParam.LFO_DEPTH, name: 'LFO Depth', min: 0, max: 100, default: 0, unit: 'cents' },
        { id: FmSynthParam.GLIDE, name: 'Glide', min: 0, max: 1, default: 0, unit: 's' },

        // Master
        { id: FmSynthParam.MASTER_VOL, name: 'Volume', min: 0, max: 1, default: 0.7 },
        { id: FmSynthParam.MASTER_PAN, name: 'Pan', min: -1, max: 1, default: 0 },
    ];

    constructor(config: InstrumentConfig) {
        super(config);
    }

    getParamDefinitions(): ParamDefinition[] {
        return FmSynthController.PARAM_DEFS;
    }

    // ============================================================
    // OPERATOR CONVENIENCE METHODS
    // ============================================================

    /**
     * Set all parameters for an operator at once
     */
    setOperator(opIndex: number, op: Partial<FmOperator>): void {
        const base = opIndex * 10; // 0, 10, 20, 30

        if (op.ratio !== undefined) this.setParam(base + 0, op.ratio);
        if (op.level !== undefined) this.setParam(base + 1, op.level);
        if (op.feedback !== undefined) this.setParam(base + 2, op.feedback);
        if (op.attack !== undefined) this.setParam(base + 3, op.attack);
        if (op.decay !== undefined) this.setParam(base + 4, op.decay);
        if (op.sustain !== undefined) this.setParam(base + 5, op.sustain);
        if (op.release !== undefined) this.setParam(base + 6, op.release);
    }

    /**
     * Get operator settings
     */
    getOperator(opIndex: number): FmOperator {
        const base = opIndex * 10;
        return {
            ratio: this.getParam(base + 0),
            level: this.getParam(base + 1),
            feedback: this.getParam(base + 2),
            attack: this.getParam(base + 3),
            decay: this.getParam(base + 4),
            sustain: this.getParam(base + 5),
            release: this.getParam(base + 6),
        };
    }

    // ============================================================
    // ALGORITHM CONVENIENCE
    // ============================================================

    /**
     * Set the FM algorithm
     */
    setAlgorithm(algo: FmAlgorithm): void {
        this.setParam(FmSynthParam.ALGORITHM, algo);
    }

    /**
     * Get current algorithm
     */
    getAlgorithm(): FmAlgorithm {
        return Math.floor(this.getParam(FmSynthParam.ALGORITHM)) as FmAlgorithm;
    }

    // ============================================================
    // LFO / VIBRATO
    // ============================================================

    /**
     * Set vibrato (LFO to pitch)
     */
    setVibrato(rate: number, depth: number): void {
        this.setParam(FmSynthParam.LFO_RATE, rate);
        this.setParam(FmSynthParam.LFO_DEPTH, depth);
    }

    // ============================================================
    // MASTER
    // ============================================================

    /**
     * Set master volume and pan
     */
    setMaster(volume: number, pan: number = 0): void {
        this.setParam(FmSynthParam.MASTER_VOL, volume);
        this.setParam(FmSynthParam.MASTER_PAN, pan);
    }

    // ============================================================
    // PRESETS
    // ============================================================

    /**
     * Apply a preset
     */
    applyPreset(preset: FmSynthPreset): void {
        if (preset.op1) this.setOperator(0, preset.op1);
        if (preset.op2) this.setOperator(1, preset.op2);
        if (preset.op3) this.setOperator(2, preset.op3);
        if (preset.op4) this.setOperator(3, preset.op4);
        if (preset.algorithm !== undefined) this.setAlgorithm(preset.algorithm);
        if (preset.volume !== undefined) this.setParam(FmSynthParam.MASTER_VOL, preset.volume);
        if (preset.pan !== undefined) this.setParam(FmSynthParam.MASTER_PAN, preset.pan);
        if (preset.glide !== undefined) this.setParam(FmSynthParam.GLIDE, preset.glide);
    }
}

// ============================================================
// PRESET INTERFACE
// ============================================================
export interface FmSynthPreset {
    name: string;
    op1?: Partial<FmOperator>;
    op2?: Partial<FmOperator>;
    op3?: Partial<FmOperator>;
    op4?: Partial<FmOperator>;
    algorithm?: FmAlgorithm;
    volume?: number;
    pan?: number;
    glide?: number;
}

// ============================================================
// BUILT-IN FM PRESETS
// ============================================================
export const FM_SYNTH_PRESETS: Record<string, FmSynthPreset> = {
    // Classic DX7-style electric piano
    'epiano': {
        name: 'E-Piano',
        op1: { ratio: 1, level: 0.8, attack: 0.001, decay: 0.8, sustain: 0.3, release: 0.3 },
        op2: { ratio: 1, level: 0.4, attack: 0.001, decay: 0.05, sustain: 0.2, release: 0.1 },
        op3: { ratio: 2, level: 0.2, attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.2 },
        op4: { ratio: 0.5, level: 0.1, attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 },
        algorithm: FmAlgorithm.PARALLEL_MOD,
        volume: 0.7,
    },

    // Bright bell sound
    'bell': {
        name: 'Bell',
        op1: { ratio: 1, level: 0.6, attack: 0.001, decay: 2.0, sustain: 0, release: 1.0 },
        op2: { ratio: 2.4, level: 0.8, attack: 0.001, decay: 1.5, sustain: 0, release: 0.8 },
        op3: { ratio: 5.6, level: 0.4, attack: 0.001, decay: 0.8, sustain: 0, release: 0.5 },
        op4: { ratio: 1, level: 0, attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
        algorithm: FmAlgorithm.CASCADE,
        volume: 0.6,
    },

    // Deep bass
    'bass': {
        name: 'FM Bass',
        op1: { ratio: 0.5, level: 0.9, attack: 0.001, decay: 0.2, sustain: 0.8, release: 0.1 },
        op2: { ratio: 1, level: 0.5, attack: 0.001, decay: 0.1, sustain: 0.3, release: 0.05 },
        op3: { ratio: 1, level: 0, attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
        op4: { ratio: 1, level: 0, attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
        algorithm: FmAlgorithm.CARRIER_MOD,
        volume: 0.9,
        pan: 0,
    },

    // Metallic lead
    'metallic': {
        name: 'Metallic',
        op1: { ratio: 1, level: 0.7, attack: 0.001, decay: 0.3, sustain: 0.6, release: 0.2 },
        op2: { ratio: 1.4, level: 0.6, attack: 0.001, decay: 0.2, sustain: 0.4, release: 0.1 },
        op3: { ratio: 2, level: 0.4, feedback: 0.3, attack: 0.001, decay: 0.15, sustain: 0.3, release: 0.1 },
        op4: { ratio: 1, level: 0, attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
        algorithm: FmAlgorithm.CASCADE,
        volume: 0.7,
    },

    // Glassy pad
    'glass': {
        name: 'Glass Pad',
        op1: { ratio: 1, level: 0.5, attack: 0.3, decay: 0.5, sustain: 0.7, release: 0.8 },
        op2: { ratio: 2, level: 0.3, attack: 0.2, decay: 0.4, sustain: 0.5, release: 0.6 },
        op3: { ratio: 3, level: 0.2, attack: 0.25, decay: 0.3, sustain: 0.4, release: 0.5 },
        op4: { ratio: 4, level: 0.1, attack: 0.3, decay: 0.35, sustain: 0.3, release: 0.4 },
        algorithm: FmAlgorithm.ADDITIVE,
        volume: 0.5,
        glide: 0.05,
    },

    // Brass-like
    'brass': {
        name: 'FM Brass',
        op1: { ratio: 1, level: 0.8, attack: 0.02, decay: 0.2, sustain: 0.7, release: 0.2 },
        op2: { ratio: 1, level: 0.6, attack: 0.01, decay: 0.15, sustain: 0.5, release: 0.15 },
        op3: { ratio: 2, level: 0.3, attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.1 },
        op4: { ratio: 1, level: 0, attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
        algorithm: FmAlgorithm.CARRIER_MOD,
        volume: 0.75,
    },
};
