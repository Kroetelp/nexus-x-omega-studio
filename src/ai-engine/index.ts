/**
 * NEXUS-X AI Engine Module
 * All AI-powered features: composition, mastering, randomization, neural transformation
 */

// AI Composer
export {
    AIComposer,
    createAIComposer,
    getAIComposer
} from './AIComposer';
export type {
    CompositionPrompt,
    GeneratedComposition,
    NoteEvent,
    DrumPattern,
    SongSection,
    CompositionMetadata
} from './AIComposer';

// Neural Dream (Magenta-based transformation)
export {
    NeuralDream,
    neuralDream
} from './NeuralDream';

// AI Mastering Engine
export {
    AIMasteringEngine,
    createAIMasteringEngine,
    getAIMasteringEngine,
    resetAIMasteringEngine
} from './AIMasteringEngine';
export type {
    MasteringPreset,
    MasteringSettings,
    AnalysisResult,
    FrequencyBalance,
    CompressionSettings,
    EQSettings
} from './AIMasteringEngine';

// Randomization Engine
export {
    RandomizationEngine,
    createRandomizationEngine,
    getRandomizationEngine,
    resetRandomizationEngine
} from './RandomizationEngine';
export type {
    RandomizationMode,
    MelodyStyle,
    RandomizationModeConfig,
    EuclideanConfig,
    MarkovConfig,
    CellularConfig,
    LSystemConfig,
    GeneticConfig
} from './RandomizationEngine';
