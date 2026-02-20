/**
 * NEXUS-X Audio Module v5.0
 * Public API exports
 */

// ============================================================
// CORE
// ============================================================
export { AudioEngine, audioEngine } from './core/AudioEngineNew';
export { InstrumentRegistry, instrumentRegistry } from './core/InstrumentRegistry';
export { ScaleManager, scaleManager } from './core/ScaleManager';

// ============================================================
// TYPES
// ============================================================
export * from './core/types';

// ============================================================
// INSTRUMENTS
// ============================================================
export { InstrumentController } from './instruments/InstrumentController';
export { SynthController, SynthParam, OscType, SYNTH_PRESETS } from './instruments/SynthController';
export { DrumController, DrumParam, DrumType, DRUM_PRESETS } from './instruments/DrumController';
export { FxController, FxParam, FX_PRESETS } from './instruments/FxController';

// ============================================================
// WORKLET
// ============================================================
export * from './worklet/messages';
