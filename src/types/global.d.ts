/**
 * Global Type Definitions for NEXUS-X Omega Studio
 *
 * This file extends global types for:
 * - Window extensions (app globals)
 * - Tone.js global
 * - Magenta.js types
 * - DOM Dialog element extensions
 */

// ============================================================
// WINDOW EXTENSIONS
// ============================================================
declare global {
    interface Window {
        // App globals (legacy pattern, used by some modules)
        seq?: NexusSequencerGlobal;
        ui?: NexusUIGlobal;
        engine?: NexusEngineGlobal;
        sys?: NexusSystemGlobal;

        // Magenta.js
        mm?: MagentaGlobal;
    }

    // Nexus Sequencer Global
    interface NexusSequencerGlobal {
        data: number[][];
        step: number;
        playing: boolean;
        bpm: number;
        // Add methods as needed
    }

    // Nexus UI Global
    interface NexusUIGlobal {
        colorize?: (element: string, color: string) => void;
        notify?: (message: string, type?: string) => void;
        refreshGrid?: () => void;
        [key: string]: unknown;
    }

    // Nexus Engine Global
    interface NexusEngineGlobal {
        context?: AudioContext;
        masterGain?: GainNode;
        trigger?: (trackIndex: number, time: number, value: number, stepIndex: number) => void;
        getEffects?: () => Record<string, unknown>;
        getChannels?: () => Array<{ vol?: { volume?: { value?: number } } }>;
        noteOn?: (note: number, velocity: number) => void;
        noteOff?: (note: number) => void;
        [key: string]: unknown;
    }

    // Nexus System Global
    interface NexusSystemGlobal {
        version?: string;
        play?: () => void;
        stop?: () => void;
        autoSave?: () => void;
        [key: string]: unknown;
    }

    // Magenta.js Global
    interface MagentaGlobal {
        sequences: {
            quantize: (seq: INoteSequence, stepsPerQuarter: number) => IQuantizedSequence;
            clone: (seq: INoteSequence) => INoteSequence;
        };
        MusicVAE: new (checkpoint: string) => MusicVAEInstance;
        MusicRNN: new (checkpoint: string) => MusicRNNInstance;
    }

    // Magenta Note Sequence (simplified)
    interface INoteSequence {
        notes: NoteSequenceNote[];
        totalTime?: number;
        tempos?: { time: number; qpm: number }[];
        timeSignatures?: { time: number; numerator: number; denominator: number }[];
    }

    interface IQuantizedSequence extends INoteSequence {
        quantizationInfo: { stepsPerQuarter: number };
    }

    interface NoteSequenceNote {
        pitch: number;
        startTime: number;
        endTime: number;
        velocity: number;
        isDrum?: boolean;
        instrument?: number;
        // Optional quantized fields
        quantizedStartStep?: number;
        quantizedEndStep?: number;
        pitchName?: string;
        numerator?: number;
    }

    interface MusicVAEInstance {
        initialize(): Promise<void>;
        sample(n: number, temperature?: number): Promise<INoteSequence[]>;
    }

    interface MusicRNNInstance {
        initialize(): Promise<void>;
        continueSequence(sequence: INoteSequence, steps: number, temperature?: number): Promise<INoteSequence>;
    }
}

// ============================================================
// DOM EXTENSIONS - HTMLDialogElement
// ============================================================
interface HTMLDialogElement extends HTMLElement {
    showModal(): void;
    close(returnValue?: string): void;
    open: boolean;
    returnValue: string;
}

// ============================================================
// TONE.JS GLOBAL (for modules that use global Tone)
// ============================================================
declare const Tone: typeof import('tone');

export {};
