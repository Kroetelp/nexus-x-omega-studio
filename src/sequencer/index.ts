/**
 * NEXUS-X Sequencer Module
 * Sequencer logic: arpeggiation, quantization, arrangement
 */

// Arpeggiator
export {
    ArpeggiatorPro,
    createArpeggiatorPro,
    getArpeggiatorPro,
    resetArpeggiatorPro
} from './ArpeggiatorPro';
export type {
    ArpConfig,
    ArpMode,
    ArpSpeed,
    ArpPattern,
    ArpNoteEvent,
    ArpOutputEvent
} from './ArpeggiatorPro';

// Quantizer
export {
    Quantizer,
    createQuantizer,
    getQuantizer,
    resetQuantizer
} from './Quantizer';
export type {
    QuantizeGrid,
    QuantizableNote,
    QuantizeResult
} from './Quantizer';

// Auto Arranger
export {
    AutoArranger,
    createAutoArranger,
    getAutoArranger,
    resetAutoArranger
} from './AutoArranger';
export type {
    ArrangementTemplate,
    TemplateSection,
    ArrangedSection,
    SectionType,
    PatternSet
} from './AutoArranger';

// Pattern Processor (consolidated from PatternMorpher + PatternVariations)
export {
    PatternProcessor,
    createPatternProcessor,
    getPatternProcessor,
    resetPatternProcessor,
    // Backward compatibility
    PatternMorpher,
    PatternVariations,
    createPatternMorpher,
    createPatternVariations
} from './PatternProcessor';
export type {
    VariationType,
    TransitionType,
    VariationConfig,
    PatternBank
} from './PatternProcessor';

// Bassline Generator
export { BasslineGenerator, createBasslineGenerator } from './BasslineGenerator';

// Groove Pool
export { GroovePool, createGroovePool } from './GroovePool';

// Note Repeat
export { NoteRepeat, createNoteRepeat } from './NoteRepeat';

// Pattern Locker
export { PatternLocker, createPatternLocker } from './PatternLocker';

// Velocity Editor
export { VelocityEditor, createVelocityEditor } from './VelocityEditor';

// Pattern Utilities
export * from './patternUtils';
