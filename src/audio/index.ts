/**
 * NEXUS-X Audio Module v5.0
 * Public API exports
 */

// ============================================================
// CORE
// ============================================================
export { AudioEngine, audioEngine } from './core/AudioEngine';
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
export { FmSynthController, FmSynthParam, FmAlgorithm, FmOperator, FmSynthPreset, FM_SYNTH_PRESETS } from './instruments/FmSynthController';
export { BrassController, BrassParam, BrassType, MuteType, BrassPreset, BRASS_PRESETS } from './instruments/BrassController';
export { Drum808Controller, Drum808Param, Drum808Sound, Drum808Preset, DRUM_808_PRESETS } from './instruments/Drum808Controller';

// ============================================================
// WORKLET
// ============================================================
export * from './worklet/messages';

// ============================================================
// EFFECTS
// ============================================================
export { EffectRack, createEffectRack } from './effects/EffectRack';
export { LoopStation, createLoopStation } from './effects/LoopStation';
export { SidechainCompressor, createSidechain } from './effects/SidechainCompressor';
export { SpectralFreeze, createSpectralFreeze } from './effects/SpectralFreeze';

// ============================================================
// SAMPLES
// ============================================================
export { SamplePad, createSamplePad } from './SamplePad';
