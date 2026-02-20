/**
 * Type definitions for NEXUS-X Omega Studio
 */

// Core configuration types
export interface Config {
  tracks: string[];
  colors: string[];
  steps: number;
}

export interface GenreConfig {
  bpmRange: [number, number];
  scale: ScaleType;
  kit: KitType;
  arpLead: boolean;
  progressions: number[][];
}

// 🦍 GIGACHAD SCALE SYSTEM - 67+ SCALES 🦍
export type ScaleType =
  // === DIATONIC CHADS (The Seven Modes) ===
  | 'ionian' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'aeolian' | 'locrian'
  // === CLASSIC CORE (Originals) ===
  | 'minor' | 'pentatonic'
  // === PENTATONIC LEGENDS ===
  | 'majorPenta' | 'minorPenta' | 'blues' | 'egyptian' | 'chinese' | 'insen' | 'hirajoshi'
  // === HARMONIC & MELODIC ===
  | 'harmonicMinor' | 'melodicMinor' | 'harmonicMajor' | 'doubleHarmonic'
  // === EXOTIC ALPHA ===
  | 'phrygianDominant' | 'lydianAugmented' | 'lydianDominant' | 'hungarianMinor' | 'romanianMinor'
  | 'neapolitanMinor' | 'neapolitanMajor' | 'spanishGypsy' | 'byzantine' | 'persian' | 'altered'
  // === MODE VARIANTS (Deep Cuts) ===
  | 'superLocrian' | 'dorianFlat2' | 'lydianSharp2' | 'lydianFlat7' | 'mixolydianFlat6'
  | 'aeolianFlat5' | 'phrygianNatural3' | 'dorianSharp4' | 'ionianFlat2'
  // === JAZZ FUSION GIGACHADS ===
  | 'bebopDominant' | 'bebopMajor' | 'bebopMinor' | 'bebopDorian'
  | 'diminishedHw' | 'diminishedWh' | 'wholeTone' | 'augmented' | 'tritone'
  // === VIDEO GAME / CHIPTUNE ===
  | 'nesMajor' | 'zelda' | 'megaMan' | 'castlevania' | 'sonicMode' | 'finalFantasy' | 'tibia'
  // === CINEMATIC / SOUNDTRACK ===
  | 'duneScale' | 'interstellar' | 'batmanTheme' | 'jokerStairs' | 'braveheart' | 'gladiator'
  // === METAL / ROCK CHAOS ===
  | 'phrygianMetal' | 'harmonicMetal' | 'locrianNatural2' | 'ukrainianDorian' | 'enigmatic'
  // === WORLD MUSIC LEGENDS ===
  | 'hijaz' | 'bayati' | 'rast' | 'sikah' | 'saba' | 'huzam' | 'ragaBhimpalasi' | 'ragaYaman'
  | 'pelog' | 'slendro' | 'kumoi' | 'iwato' | 'prometheus'
  // === EXPERIMENTAL WTF ===
  | 'octatonic' | 'chromatic' | 'tritoneParadise' | 'fourthsStack' | 'fifthsStack'
  // === SECRET UNLOCKABLES ===
  | 'simpleAs' | 'piratesCredo' | 'theL';
export type KitType = 'NEON' | 'GLITCH' | 'ACID' | 'VINYL' | 'CLUB' | 'CHIPTUNE' | 'CINEMATIC' | 'INDUSTRIAL' | 'ETHEREAL' | 'DUNGEON';

// Audio engine types
export interface Channel {
  name: string;
  synth: Tone.PolySynth | Tone.Synth | Tone.MonoSynth | Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth | Tone.FMSynth;
  panner: Tone.Panner;
  vol: Tone.Volume;
  type: SynthType;
  muted: boolean;
  soloed: boolean;
  arpActive: boolean;
}

export type SynthType = 'kick' | 'noise' | 'metal' | 'bass' | 'lead' | 'pad';

// Sequencer types
export interface SequencerData {
  data: number[][];
  snapshots: (number[][] | null)[];
}

export interface StepValue {
  value: number;
  timestamp?: number;
}

// UI types
export interface UIComponent {
  colorize: (element: string, color: string) => void;
}

export interface NexusSequencer extends UIComponent {
  matrix: {
    populate: {
      row: (row: number, data: boolean[]) => void;
    };
  };
  on: (event: string, callback: Function) => void;
  next: () => void;
}

// Snapshot/State types
export interface Snapshot {
  id: string;
  name: string;
  timestamp: number;
  data: {
    sequencer: number[][];
    parameters: Record<string, number>;
    effects: Record<string, any>;
  };
}

export interface MorphTarget {
  from: Snapshot;
  to: Snapshot;
  progress: number;
  easing: EasingFunction;
}

export type EasingFunction = 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo';

// Performance recorder types
export interface PerformanceEvent {
  type: 'trigger' | 'parameter' | 'transport' | 'snapshot' | 'mutation';
  timestamp: number;
  data: any;
}

export interface PerformanceRecording {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  events: PerformanceEvent[];
  finalState: any;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
}

// Validation types
export interface StoredState {
  data: number[][];
  genre: string;
  version: string;
  timestamp: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Undo/Redo types
export interface Command {
  execute: () => void;
  undo: () => void;
  description: string;
  timestamp: number;
}

export interface UndoStack {
  past: Command[];
  future: Command[];
  maxSize: number;
}

// AI/Magenta types
export interface DrumNote {
  pitch: number;
  startTime: number;
  quantizedStartStep: number;
  isDrum: boolean;
  instrument: number;
}

export interface MagentaSample {
  notes: DrumNote[];
  temperature: number;
}

// Visualizer types
export interface FFTData {
  values: number[];
  timestamp: number;
}

export interface SpectralZone {
  frequencyMin: number;
  frequencyMax: number;
  amplitude: number;
  parameter: string;
}
