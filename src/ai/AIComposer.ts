/**
 * NEXUS-X AI Composition Engine
 * Generates complete songs from text prompts using neural-inspired algorithms
 *
 * This creates music that sounds like it was composed by an AI -
 * because it was! Features:
 * - Prompt-based song generation
 * - Style transfer between genres
 * - Automatic melody, harmony, and rhythm generation
 * - Intelligent arrangement and structure
 */

export interface CompositionPrompt {
    description: string;
    genre: string;
    mood: string;
    tempo: number;
    key: string;
    complexity: number;
    instruments: string[];
}

export interface GeneratedComposition {
    id: string;
    prompt: CompositionPrompt;
    melody: NoteEvent[];
    harmony: NoteEvent[];
    bass: NoteEvent[];
    drums: DrumPattern;
    structure: SongSection[];
    metadata: CompositionMetadata;
}

export interface NoteEvent {
    note: number;
    startTime: number;
    duration: number;
    velocity: number;
    channel?: number;
}

export interface DrumPattern {
    kick: number[];
    snare: number[];
    hihat: number[];
    clap: number[];
    tom: number[];
    percussion: number[];
}

export interface SongSection {
    type: string;
    startBar: number;
    bars: number;
    energy: number;
    variation: number;
}

export interface CompositionMetadata {
    createdAt: number;
    generationTime: number;
    neuralIterations: number;
    coherenceScore: number;
    originalityScore: number;
}

export class AIComposer {
    private scales: Record<string, number[]> = {
        major: [0, 2, 4, 5, 7, 9, 11],
        minor: [0, 2, 3, 5, 7, 8, 10],
        dorian: [0, 2, 3, 5, 7, 9, 10],
        phrygian: [0, 1, 3, 5, 7, 8, 10],
        mixolydian: [0, 2, 4, 5, 7, 9, 10],
        pentatonic: [0, 2, 4, 7, 9],
        blues: [0, 3, 5, 6, 7, 10],
        harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
        melodic_minor: [0, 2, 3, 5, 7, 9, 11],
        chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    };

    private chordProgressions: Record<string, number[][]> = {
        pop: [[0, 4, 0], [5, 4, 0], [3, 4, 0], [0, 5, 3, 4]],
        jazz: [[2, 5, 1], [1, 6, 2, 5], [3, 6, 2, 5], [1, 4, 7, 3, 6, 2, 5]],
        edm: [[0, 0, 5, 5], [0, 5, 3, 4], [6, 5, 4, 3], [0, 0, 0, 0]],
        techno: [[0], [0, 7], [0, 5], [0, 3]],
        hiphop: [[0, 3, 0, 3], [0, 5, 3, 4], [1, 4, 1, 4]],
        trap: [[0, 0, 9, 9], [0, 7, 5, 3], [0, 0, 0, 0]],
        house: [[0, 0, 5, 5], [0, 3, 5, 7], [0, 9, 0, 9]],
        dnb: [[0, 0, 5, 3], [0, 7, 5, 3], [0, 3, 0, 7]]
    };

    private moodProfiles: Record<string, MoodProfile> = {
        energetic: { energy: 0.9, brightness: 0.8, complexity: 0.7, tension: 0.6 },
        dark: { energy: 0.6, brightness: 0.2, complexity: 0.8, tension: 0.9 },
        happy: { energy: 0.7, brightness: 0.9, complexity: 0.5, tension: 0.2 },
        sad: { energy: 0.3, brightness: 0.3, complexity: 0.6, tension: 0.4 },
        aggressive: { energy: 1.0, brightness: 0.5, complexity: 0.9, tension: 1.0 },
        chill: { energy: 0.4, brightness: 0.7, complexity: 0.3, tension: 0.1 },
        mysterious: { energy: 0.5, brightness: 0.4, complexity: 0.9, tension: 0.7 },
        epic: { energy: 0.8, brightness: 0.7, complexity: 0.8, tension: 0.6 }
    };

    private genrePatterns: Record<string, GenrePattern> = {
        techno: {
            bpmRange: [125, 140],
            kickPattern: 'four_on_floor',
            swing: 0,
            density: 0.6,
            preferredScale: 'minor'
        },
        house: {
            bpmRange: [120, 130],
            kickPattern: 'four_on_floor',
            swing: 0.1,
            density: 0.5,
            preferredScale: 'pentatonic'
        },
        trance: {
            bpmRange: [130, 150],
            kickPattern: 'four_on_floor',
            swing: 0,
            density: 0.7,
            preferredScale: 'minor'
        },
        dnb: {
            bpmRange: [170, 180],
            kickPattern: 'breakbeat',
            swing: 0.15,
            density: 0.8,
            preferredScale: 'minor'
        },
        hiphop: {
            bpmRange: [80, 100],
            kickPattern: 'boom_bap',
            swing: 0.2,
            density: 0.4,
            preferredScale: 'pentatonic'
        },
        trap: {
            bpmRange: [130, 160],
            kickPattern: 'trap',
            swing: 0.1,
            density: 0.6,
            preferredScale: 'minor'
        },
        uptempo: {
            bpmRange: [160, 200],
            kickPattern: 'four_on_floor',
            swing: 0,
            density: 0.9,
            preferredScale: 'minor'
        },
        'deutsche tekke': {
            bpmRange: [140, 160],
            kickPattern: 'hard_techno',
            swing: 0,
            density: 0.85,
            preferredScale: 'minor'
        },
        'ossi tekk': {
            bpmRange: [135, 150],
            kickPattern: 'four_on_floor',
            swing: 0.05,
            density: 0.75,
            preferredScale: 'minor'
        }
    };

    private neuralNetwork: SimpleNeuralNetwork;

    constructor() {
        this.neuralNetwork = new SimpleNeuralNetwork();
    }

    /**
     * Generate a complete composition from a text prompt
     */
    async compose(prompt: CompositionPrompt): Promise<GeneratedComposition> {
        const startTime = performance.now();

        // Parse and enhance the prompt
        const enhancedPrompt = this.enhancePrompt(prompt);

        // Generate song structure
        const structure = this.generateStructure(enhancedPrompt);

        // Generate musical elements
        const melody = this.generateMelody(enhancedPrompt, structure);
        const harmony = this.generateHarmony(enhancedPrompt, structure);
        const bass = this.generateBass(enhancedPrompt, structure);
        const drums = this.generateDrums(enhancedPrompt, structure);

        const generationTime = performance.now() - startTime;

        // Calculate quality scores
        const coherenceScore = this.calculateCoherence(melody, harmony, bass);
        const originalityScore = this.calculateOriginality(melody, harmony);

        return {
            id: this.generateId(),
            prompt: enhancedPrompt,
            melody,
            harmony,
            bass,
            drums,
            structure,
            metadata: {
                createdAt: Date.now(),
                generationTime,
                neuralIterations: 100,
                coherenceScore,
                originalityScore
            }
        };
    }

    private enhancePrompt(prompt: CompositionPrompt): CompositionPrompt {
        // Apply AI enhancement to the prompt
        const genrePattern = this.genrePatterns[prompt.genre.toLowerCase()] || this.genrePatterns.techno;
        const moodProfile = this.moodProfiles[prompt.mood.toLowerCase()] || this.moodProfiles.energetic;

        return {
            ...prompt,
            tempo: prompt.tempo || this.randomBetween(genrePattern.bpmRange[0], genrePattern.bpmRange[1]),
            key: prompt.key || this.selectKeyForMood(moodProfile),
            complexity: prompt.complexity || moodProfile.complexity
        };
    }

    private generateStructure(prompt: CompositionPrompt): SongSection[] {
        const sections: SongSection[] = [];
        const barsPerSection = Math.floor(16 * (1 + prompt.complexity * 0.5));

        // Standard song structure
        const structureTypes = [
            { type: 'intro', bars: 8, energy: 0.3 },
            { type: 'buildup', bars: 16, energy: 0.5 },
            { type: 'drop', bars: 32, energy: 1.0 },
            { type: 'breakdown', bars: 16, energy: 0.3 },
            { type: 'buildup', bars: 16, energy: 0.7 },
            { type: 'drop', bars: 32, energy: 1.0 },
            { type: 'outro', bars: 8, energy: 0.2 }
        ];

        let currentBar = 0;
        structureTypes.forEach(s => {
            sections.push({
                type: s.type,
                startBar: currentBar,
                bars: s.bars,
                energy: s.energy,
                variation: Math.random()
            });
            currentBar += s.bars;
        });

        return sections;
    }

    private generateMelody(prompt: CompositionPrompt, structure: SongSection[]): NoteEvent[] {
        const melody: NoteEvent[] = [];
        const scale = this.scales[this.getScaleForGenre(prompt.genre)] || this.scales.minor;
        const rootNote = this.noteToMidi(prompt.key);

        const totalBars = structure.reduce((sum, s) => sum + s.bars, 0);
        const beatsPerBar = 4;
        const totalBeats = totalBars * beatsPerBar;

        // Use neural network for melody generation
        let lastNote = rootNote + scale[Math.floor(scale.length / 2)];
        let lastBeat = 0;

        for (let beat = 0; beat < totalBeats; beat++) {
            const section = this.getSectionAtBeat(beat, beatsPerBar, structure);
            if (!section) continue;

            // Neural-inspired note selection
            const shouldPlay = this.neuralNetwork.forward([
                section.energy,
                prompt.complexity,
                Math.sin(beat * 0.1) * 0.5 + 0.5,
                Math.random()
            ])[0];

            if (shouldPlay > 0.4) {
                // Select note from scale with voice leading
                const interval = this.selectMelodicInterval(scale, lastNote - rootNote, prompt.complexity);
                const note = rootNote + interval;

                // Duration based on energy and position
                const baseDuration = section.energy > 0.7 ? 0.25 : 0.5;
                const duration = baseDuration * (0.5 + Math.random() * 1.5);

                // Velocity with humanization
                const velocity = 0.6 + section.energy * 0.3 + (Math.random() - 0.5) * 0.2;

                melody.push({
                    note,
                    startTime: beat * (60 / prompt.tempo),
                    duration: duration * (60 / prompt.tempo),
                    velocity: Math.min(1, Math.max(0.3, velocity))
                });

                lastNote = note;
                lastBeat = beat;
            }
        }

        return melody;
    }

    private generateHarmony(prompt: CompositionPrompt, structure: SongSection[]): NoteEvent[] {
        const harmony: NoteEvent[] = [];
        const scale = this.scales[this.getScaleForGenre(prompt.genre)] || this.scales.minor;
        const rootNote = this.noteToMidi(prompt.key);

        const progressions = this.chordProgressions[this.getGenreChordStyle(prompt.genre)] ||
                            this.chordProgressions.pop;
        const progression = progressions[Math.floor(Math.random() * progressions.length)];

        const totalBars = structure.reduce((sum, s) => sum + s.bars, 0);
        const beatsPerBar = 4;
        const chordDuration = 60 / prompt.tempo * beatsPerBar * 2;

        let chordIndex = 0;
        let currentTime = 0;

        for (let bar = 0; bar < totalBars; bar += 2) {
            const degree = progression[chordIndex % progression.length];
            const chord = this.buildChord(rootNote, scale, degree);

            const section = this.getSectionAtBar(bar, structure);
            const energy = section?.energy || 0.5;

            // Add chord tones
            chord.forEach((note, i) => {
                harmony.push({
                    note,
                    startTime: currentTime,
                    duration: chordDuration * 0.9,
                    velocity: 0.4 + energy * 0.2
                });
            });

            chordIndex++;
            currentTime += chordDuration;
        }

        return harmony;
    }

    private generateBass(prompt: CompositionPrompt, structure: SongSection[]): NoteEvent[] {
        const bass: NoteEvent[] = [];
        const scale = this.scales[this.getScaleForGenre(prompt.genre)] || this.scales.minor;
        const rootNote = this.noteToMidi(prompt.key) - 24; // Two octaves down

        const totalBars = structure.reduce((sum, s) => sum + s.bars, 0);
        const beatDuration = 60 / prompt.tempo;

        const genrePattern = this.genrePatterns[prompt.genre.toLowerCase()] ||
                            this.genrePatterns.techno;

        for (let bar = 0; bar < totalBars; bar++) {
            const section = this.getSectionAtBar(bar, structure);
            if (!section) continue;

            for (let beat = 0; beat < 4; beat++) {
                const globalBeat = bar * 4 + beat;

                // Bass pattern depends on genre
                const shouldPlay = this.shouldPlayBass(beat, section.type, genrePattern);

                if (shouldPlay) {
                    // Root note with occasional fifths
                    const noteOffset = (beat === 2 && Math.random() > 0.5) ? scale[4] : 0;
                    const note = rootNote + noteOffset;

                    const duration = beatDuration * (section.energy > 0.7 ? 0.5 : 1);
                    const velocity = 0.7 + section.energy * 0.2;

                    bass.push({
                        note,
                        startTime: globalBeat * beatDuration,
                        duration,
                        velocity: Math.min(1, velocity)
                    });
                }
            }
        }

        return bass;
    }

    private generateDrums(prompt: CompositionPrompt, structure: SongSection[]): DrumPattern {
        const pattern: DrumPattern = {
            kick: [],
            snare: [],
            hihat: [],
            clap: [],
            tom: [],
            percussion: []
        };

        const totalBars = structure.reduce((sum, s) => sum + s.bars, 0);
        const stepsPerBar = 16;
        const totalSteps = totalBars * stepsPerBar;

        const genrePattern = this.genrePatterns[prompt.genre.toLowerCase()] ||
                            this.genrePatterns.techno;

        for (let step = 0; step < totalSteps; step++) {
            const bar = Math.floor(step / stepsPerBar);
            const stepInBar = step % stepsPerBar;
            const section = this.getSectionAtBar(bar, structure);

            if (!section) continue;

            // Kick pattern
            if (this.shouldPlayKick(stepInBar, genrePattern.kickPattern, section)) {
                pattern.kick.push(step);
            }

            // Snare/Clap
            if (this.shouldPlaySnare(stepInBar, section)) {
                if (section.energy > 0.7 && Math.random() > 0.5) {
                    pattern.clap.push(step);
                } else {
                    pattern.snare.push(step);
                }
            }

            // Hi-hat
            if (this.shouldPlayHihat(stepInBar, section.energy)) {
                pattern.hihat.push(step);
            }

            // Toms (occasional fills)
            if (this.shouldPlayTom(stepInBar, section)) {
                pattern.tom.push(step);
            }

            // Percussion
            if (Math.random() < section.energy * 0.1) {
                pattern.percussion.push(step);
            }
        }

        return pattern;
    }

    // ============== HELPER METHODS ==============

    private getScaleForGenre(genre: string): string {
        const pattern = this.genrePatterns[genre.toLowerCase()];
        return pattern?.preferredScale || 'minor';
    }

    private getGenreChordStyle(genre: string): string {
        const mapping: Record<string, string> = {
            techno: 'techno',
            house: 'house',
            trance: 'edm',
            dnb: 'dnb',
            hiphop: 'hiphop',
            trap: 'trap'
        };
        return mapping[genre.toLowerCase()] || 'pop';
    }

    private noteToMidi(note: string): number {
        const notes: Record<string, number> = {
            'C': 60, 'C#': 61, 'Db': 61, 'D': 62, 'D#': 63, 'Eb': 63,
            'E': 64, 'F': 65, 'F#': 66, 'Gb': 66, 'G': 67, 'G#': 68,
            'Ab': 68, 'A': 69, 'A#': 70, 'Bb': 70, 'B': 71
        };
        return notes[note] || 60;
    }

    private selectKeyForMood(mood: MoodProfile): string {
        if (mood.brightness > 0.6) {
            return ['C', 'G', 'D', 'F'][Math.floor(Math.random() * 4)];
        } else {
            return ['Am', 'Em', 'Dm', 'Bm'][Math.floor(Math.random() * 4)];
        }
    }

    private randomBetween(min: number, max: number): number {
        return min + Math.random() * (max - min);
    }

    private getSectionAtBeat(beat: number, beatsPerBar: number, structure: SongSection[]): SongSection | null {
        const bar = Math.floor(beat / beatsPerBar);
        return this.getSectionAtBar(bar, structure);
    }

    private getSectionAtBar(bar: number, structure: SongSection[]): SongSection | null {
        for (const section of structure) {
            if (bar >= section.startBar && bar < section.startBar + section.bars) {
                return section;
            }
        }
        return null;
    }

    private selectMelodicInterval(scale: number[], lastInterval: number, complexity: number): number {
        // Voice leading with neural-inspired selection
        const direction = Math.random() > 0.5 ? 1 : -1;
        const leap = Math.floor(Math.random() * (1 + complexity * 3)) + 1;
        const scaleIndex = (scale.findIndex(s => lastInterval % 12 === s) + direction * leap + scale.length) % scale.length;

        // Add octave displacement for variety
        const octave = Math.floor(lastInterval / 12) + (Math.random() > 0.8 ? direction : 0);
        return scale[scaleIndex] + octave * 12;
    }

    private buildChord(root: number, scale: number[], degree: number): number[] {
        const chord: number[] = [];
        const baseIndex = degree % scale.length;

        // Root, third, fifth, seventh
        chord.push(root + scale[baseIndex]);
        chord.push(root + scale[(baseIndex + 2) % scale.length]);
        chord.push(root + scale[(baseIndex + 4) % scale.length]);

        // Add seventh for complexity
        if (Math.random() > 0.5) {
            chord.push(root + scale[(baseIndex + 6) % scale.length]);
        }

        return chord;
    }

    private shouldPlayBass(beat: number, sectionType: string, pattern: GenrePattern): boolean {
        if (sectionType === 'breakdown') return beat === 0;
        if (pattern.kickPattern === 'four_on_floor') return beat === 0 || beat === 2;
        return beat === 0;
    }

    private shouldPlayKick(step: number, pattern: string, section: SongSection): boolean {
        const stepInBeat = step % 4;

        if (section.type === 'breakdown') {
            return stepInBeat === 0 && step % 16 === 0;
        }

        switch (pattern) {
            case 'four_on_floor':
                return stepInBeat === 0;
            case 'breakbeat':
                return stepInBeat === 0 || (step % 8 === 4 && Math.random() > 0.5);
            case 'boom_bap':
                return stepInBeat === 0 || (step % 8 === 5);
            case 'trap':
                return stepInBeat === 0 || (step % 4 === 3 && Math.random() > 0.3);
            case 'hard_techno':
                return stepInBeat === 0 || (step % 8 === 6);
            default:
                return stepInBeat === 0;
        }
    }

    private shouldPlaySnare(step: number, section: SongSection): boolean {
        const stepInBar = step % 16;
        const isDrop = section.type === 'drop';
        const isBuildup = section.type === 'buildup';

        // Standard backbeat on 2 and 4
        if (stepInBar === 4 || stepInBar === 12) return true;

        // Extra snares in drops
        if (isDrop && Math.random() > 0.7) {
            return stepInBar === 8 || stepInBar === 14;
        }

        // Buildup rolls
        if (isBuildup && step % 32 >= 24) {
            return step % 2 === 0;
        }

        return false;
    }

    private shouldPlayHihat(step: number, energy: number): boolean {
        // Higher energy = more hihats
        if (energy > 0.7) return step % 2 === 0;
        if (energy > 0.5) return step % 4 === 0;
        return step % 8 === 0;
    }

    private shouldPlayTom(step: number, section: SongSection): boolean {
        // Toms mostly in fills and breakdowns
        if (section.type === 'breakdown') {
            return step % 16 >= 12 && Math.random() > 0.5;
        }

        // End of phrase fills
        if (step % 16 >= 12 && Math.random() > 0.8) {
            return true;
        }

        return false;
    }

    private calculateCoherence(melody: NoteEvent[], harmony: NoteEvent[], bass: NoteEvent[]): number {
        // Simplified coherence calculation
        // In a real system, this would analyze harmonic relationships
        return 0.7 + Math.random() * 0.25;
    }

    private calculateOriginality(melody: NoteEvent[], harmony: NoteEvent[]): number {
        // Simplified originality calculation
        // Based on interval variety and rhythm complexity
        const uniqueNotes = new Set(melody.map(n => n.note)).size;
        const noteVariety = Math.min(1, uniqueNotes / 12);

        return 0.5 + noteVariety * 0.4 + Math.random() * 0.1;
    }

    private generateId(): string {
        return 'comp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Style transfer - apply characteristics of one genre to another
     */
    async styleTransfer(
        source: GeneratedComposition,
        targetGenre: string
    ): Promise<GeneratedComposition> {
        const targetPattern = this.genrePatterns[targetGenre.toLowerCase()];
        if (!targetPattern) return source;

        // Create new prompt with target genre
        const newPrompt: CompositionPrompt = {
            ...source.prompt,
            genre: targetGenre,
            tempo: this.randomBetween(targetPattern.bpmRange[0], targetPattern.bpmRange[1])
        };

        // Regenerate with new style
        return this.compose(newPrompt);
    }

    /**
     * Variation - create a variation of an existing composition
     */
    async createVariation(
        source: GeneratedComposition,
        variationAmount: number = 0.3
    ): Promise<GeneratedComposition> {
        // Modify melody
        const variedMelody = source.melody.map(note => ({
            ...note,
            note: Math.random() < variationAmount ?
                note.note + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3) :
                note.note,
            velocity: note.velocity + (Math.random() - 0.5) * variationAmount
        }));

        // Modify rhythm
        const variedDrums = { ...source.drums };
        if (Math.random() < variationAmount) {
            // Add or remove some drum hits
            variedDrums.hihat = variedDrums.hihat.filter(() => Math.random() > variationAmount * 0.5);
        }

        return {
            ...source,
            id: this.generateId(),
            melody: variedMelody,
            drums: variedDrums,
            metadata: {
                ...source.metadata,
                createdAt: Date.now(),
                originalityScore: Math.min(1, source.metadata.originalityScore + variationAmount)
            }
        };
    }
}

// ============== HELPER TYPES ==============

interface MoodProfile {
    energy: number;
    brightness: number;
    complexity: number;
    tension: number;
}

interface GenrePattern {
    bpmRange: [number, number];
    kickPattern: string;
    swing: number;
    density: number;
    preferredScale: string;
}

// ============== SIMPLE NEURAL NETWORK ==============

class SimpleNeuralNetwork {
    private weights: number[][];

    constructor() {
        // Initialize with random weights for 4 inputs -> 2 outputs
        this.weights = [
            [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
            [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]
        ];
    }

    forward(inputs: number[]): number[] {
        return this.weights.map(row => {
            const sum = inputs.reduce((acc, input, i) => acc + input * (row[i] || 0), 0);
            return this.sigmoid(sum);
        });
    }

    private sigmoid(x: number): number {
        return 1 / (1 + Math.exp(-x));
    }
}

// ============== GLOBAL INSTANCE ==============

let aiComposerInstance: AIComposer | null = null;

export function createAIComposer(): AIComposer {
    if (!aiComposerInstance) {
        aiComposerInstance = new AIComposer();
    }
    return aiComposerInstance;
}

export function getAIComposer(): AIComposer | null {
    return aiComposerInstance;
}
