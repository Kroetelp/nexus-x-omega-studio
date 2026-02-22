/**
 * NEXUS-X Pattern Processor
 * Consolidated pattern manipulation: variations, morphing, transformations
 *
 * Pure logic class - generates pattern data
 * Combines functionality from PatternMorpher and PatternVariations
 */

import { loggers } from '../utils/logger';

const log = loggers.sequencer;

export type VariationType = 'fill' | 'ghost' | 'sparse' | 'dense' | 'reverse' |
    'invert' | 'rotate' | 'mirror' | 'randomize' | 'evolve';

export type TransitionType = 'fill' | 'buildup' | 'breakdown' | 'drop';

export interface VariationConfig {
    type: VariationType;
    amount: number;
}

export interface PatternBank {
    [name: string]: number[][];
}

type PatternListener = (pattern: number[] | number[][]) => void;

export class PatternProcessor {
    private patternBank: PatternBank = {};
    private listeners: Set<PatternListener> = new Set();

    // ============== PATTERN STORAGE ==============

    /**
     * Save a pattern to the bank
     */
    savePattern(name: string, pattern: number[][]): void {
        this.patternBank[name] = pattern;
    }

    /**
     * Get a pattern from the bank
     */
    getPattern(name: string): number[][] | undefined {
        return this.patternBank[name];
    }

    /**
     * Get all pattern names
     */
    getPatternNames(): string[] {
        return Object.keys(this.patternBank);
    }

    /**
     * Remove a pattern from the bank
     */
    deletePattern(name: string): boolean {
        return delete this.patternBank[name];
    }

    /**
     * Clear all patterns
     */
    clearPatterns(): void {
        this.patternBank = {};
    }

    // ============== VARIATIONS (from PatternVariations) ==============

    /**
     * Generate a variation of a pattern
     */
    generateVariation(pattern: number[], type: VariationType, amount: number = 0.3): number[] {
        switch (type) {
            case 'fill': return this.generateFill(pattern, amount);
            case 'ghost': return this.addGhostNotes(pattern, amount);
            case 'sparse': return this.makeSparse(pattern, amount);
            case 'dense': return this.makeDense(pattern, amount);
            case 'reverse': return this.reversePattern(pattern);
            case 'invert': return this.invertPattern(pattern);
            case 'rotate': return this.rotatePattern(pattern, Math.floor(amount * pattern.length));
            case 'mirror': return this.mirrorPattern(pattern);
            case 'randomize': return this.randomizePattern(pattern, amount);
            case 'evolve': return this.evolvePattern(pattern, amount);
            default: return [...pattern];
        }
    }

    /**
     * Generate a sequence of variations
     */
    generateVariationSequence(
        basePattern: number[],
        variationTypes: VariationType[],
        numVariations: number
    ): number[][] {
        const sequences: number[][] = [basePattern];
        let currentPattern = basePattern;

        for (let i = 0; i < numVariations; i++) {
            const type = variationTypes[i % variationTypes.length];
            currentPattern = this.generateVariation(currentPattern, type, 0.3);
            sequences.push(currentPattern);
        }

        return sequences;
    }

    /**
     * Get available variation types
     */
    getVariationTypes(): { id: VariationType; name: string; description: string }[] {
        return [
            { id: 'fill', name: 'Fill', description: 'Add density at end of pattern' },
            { id: 'ghost', name: 'Ghost Notes', description: 'Add subtle ghost notes' },
            { id: 'sparse', name: 'Sparse', description: 'Remove some notes' },
            { id: 'dense', name: 'Dense', description: 'Add more notes' },
            { id: 'reverse', name: 'Reverse', description: 'Reverse pattern order' },
            { id: 'invert', name: 'Invert', description: 'Flip on/off states' },
            { id: 'rotate', name: 'Rotate', description: 'Shift pattern left/right' },
            { id: 'mirror', name: 'Mirror', description: 'Mirror pattern around center' },
            { id: 'randomize', name: 'Randomize', description: 'Random changes' },
            { id: 'evolve', name: 'Evolve', description: 'Gradual evolution' }
        ];
    }

    // ============== MORPHING (from PatternMorpher) ==============

    /**
     * Morph between two patterns over steps
     */
    morphPatterns(from: number[], to: number[], steps: number): number[][] {
        const morphs: number[][] = [];

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const morphed = from.map((step, idx) => {
                const target = to[idx] || 0;
                const value = step * (1 - t) + target * t;
                return value > 0.5 ? 1 : 0;
            });
            morphs.push(morphed);
        }

        return morphs;
    }

    /**
     * Morph between two multi-track patterns
     */
    morphMultiTrack(fromName: string, toName: string, steps: number = 16): number[][] {
        const fromPattern = this.patternBank[fromName];
        const toPattern = this.patternBank[toName];

        if (!fromPattern || !toPattern) {
            throw new Error('Pattern not found');
        }

        const morphed: number[][] = [];

        for (let track = 0; track < Math.min(fromPattern.length, toPattern.length); track++) {
            const morphedTrack: number[] = [];

            for (let step = 0; step < steps; step++) {
                const fromVal = fromPattern[track][step] || 0;
                const toVal = toPattern[track][step] || 0;

                const t = step / steps;
                const morphVal = fromVal * (1 - t) + toVal * t;

                morphedTrack.push(morphVal > 0.3 ? 1 : 0);
            }

            morphed.push(morphedTrack);
        }

        return morphed;
    }

    /**
     * Crossfade between two patterns
     */
    crossfade(fromName: string, toName: string, mix: number): number[][] {
        const fromPattern = this.patternBank[fromName];
        const toPattern = this.patternBank[toName];

        if (!fromPattern || !toPattern) {
            throw new Error('Pattern not found');
        }

        const result: number[][] = [];
        const t = Math.max(0, Math.min(1, mix));

        for (let track = 0; track < Math.max(fromPattern.length, toPattern.length); track++) {
            const resultTrack: number[] = [];
            const fromTrack = fromPattern[track] || [];
            const toTrack = toPattern[track] || [];

            for (let step = 0; step < 32; step++) {
                const fromVal = fromTrack[step] || 0;
                const toVal = toTrack[step] || 0;

                resultTrack.push(fromVal * (1 - t) + toVal * t > 0.5 ? 1 : 0);
            }

            result.push(resultTrack);
        }

        return result;
    }

    /**
     * Blend multiple patterns with weights
     */
    blend(patternNames: string[], weights: number[]): number[][] {
        if (patternNames.length !== weights.length) {
            throw new Error('Patterns and weights must match');
        }

        const totalWeight = weights.reduce((a, b) => a + b, 0);
        const result: number[][] = [];

        const firstPattern = this.patternBank[patternNames[0]];
        if (!firstPattern) throw new Error('Pattern not found');

        for (let track = 0; track < firstPattern.length; track++) {
            result.push(new Array(32).fill(0));
        }

        patternNames.forEach((name, idx) => {
            const pattern = this.patternBank[name];
            if (!pattern) return;

            const weight = weights[idx] / totalWeight;

            for (let track = 0; track < pattern.length; track++) {
                for (let step = 0; step < 32; step++) {
                    result[track][step] += (pattern[track][step] || 0) * weight;
                }
            }
        });

        return result.map(track => track.map(val => val > 0.4 ? 1 : 0));
    }

    // ============== TRANSITIONS ==============

    /**
     * Generate transition between patterns
     */
    generateTransition(
        fromName: string,
        toName: string,
        type: TransitionType
    ): number[][] {
        const fromPattern = this.patternBank[fromName];
        const toPattern = this.patternBank[toName];

        if (!fromPattern || !toPattern) {
            throw new Error('Pattern not found');
        }

        const transition: number[][] = [];

        switch (type) {
            case 'fill':
                for (let track = 0; track < fromPattern.length; track++) {
                    const trackData = [...fromPattern[track]];
                    for (let step = 24; step < 32; step++) {
                        if (Math.random() > 0.5) trackData[step] = 1;
                    }
                    transition.push(trackData);
                }
                break;

            case 'buildup':
                for (let track = 0; track < toPattern.length; track++) {
                    const trackData: number[] = [];
                    for (let step = 0; step < 32; step++) {
                        const energy = step / 32;
                        if (Math.random() < energy) {
                            trackData.push(toPattern[track][step] || 0);
                        } else {
                            trackData.push(0);
                        }
                    }
                    transition.push(trackData);
                }
                break;

            case 'breakdown':
                for (let track = 0; track < fromPattern.length; track++) {
                    const trackData: number[] = [];
                    for (let step = 0; step < 32; step++) {
                        const energy = 1 - step / 32;
                        if (Math.random() < energy) {
                            trackData.push(fromPattern[track][step] || 0);
                        } else {
                            trackData.push(0);
                        }
                    }
                    transition.push(trackData);
                }
                break;

            case 'drop':
                for (let track = 0; track < toPattern.length; track++) {
                    const trackData = new Array(4).fill(1);
                    trackData.push(...toPattern[track].slice(4));
                    transition.push(trackData);
                }
                break;
        }

        this.emit(transition);
        return transition;
    }

    // ============== PRIVATE VARIATION METHODS ==============

    private generateFill(pattern: number[], amount: number): number[] {
        const result = [...pattern];
        const fillStart = Math.floor(pattern.length * (1 - amount));

        for (let i = fillStart; i < pattern.length; i++) {
            if (Math.random() > 0.3) {
                result[i] = 1;
            }
        }

        return result;
    }

    private addGhostNotes(pattern: number[], amount: number): number[] {
        return pattern.map(step => {
            if (step === 0 && Math.random() < amount * 0.3) {
                return 0.5;
            }
            return step;
        });
    }

    private makeSparse(pattern: number[], amount: number): number[] {
        return pattern.map(step => {
            if (step > 0 && Math.random() < amount) {
                return 0;
            }
            return step;
        });
    }

    private makeDense(pattern: number[], amount: number): number[] {
        return pattern.map(step => {
            if (step === 0 && Math.random() < amount * 0.5) {
                return 1;
            }
            return step;
        });
    }

    private reversePattern(pattern: number[]): number[] {
        return [...pattern].reverse();
    }

    private invertPattern(pattern: number[]): number[] {
        return pattern.map(step => step > 0 ? 0 : 1);
    }

    private rotatePattern(pattern: number[], steps: number): number[] {
        const result = [...pattern];
        const safeSteps = steps % pattern.length;
        for (let i = 0; i < safeSteps; i++) {
            const last = result.pop()!;
            result.unshift(last);
        }
        return result;
    }

    private mirrorPattern(pattern: number[]): number[] {
        const half = Math.floor(pattern.length / 2);
        const result = [...pattern];

        for (let i = 0; i < half; i++) {
            result[pattern.length - 1 - i] = result[i];
        }

        return result;
    }

    private randomizePattern(pattern: number[], amount: number): number[] {
        return pattern.map(step => {
            if (Math.random() < amount) {
                return Math.random() > 0.5 ? 1 : 0;
            }
            return step;
        });
    }

    private evolvePattern(pattern: number[], amount: number): number[] {
        const result = [...pattern];
        const numChanges = Math.ceil(pattern.length * amount * 0.2);

        for (let i = 0; i < numChanges; i++) {
            const idx = Math.floor(Math.random() * pattern.length);
            result[idx] = result[idx] > 0 ? 0 : 1;
        }

        return result;
    }

    // ============== EVENTS ==============

    /**
     * Subscribe to pattern events
     */
    subscribe(listener: PatternListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private emit(pattern: number[] | number[][]): void {
        this.listeners.forEach(listener => {
            try {
                listener(pattern);
            } catch (e) {
                log.error('PatternProcessor listener error:', e);
            }
        });
    }
}

// ============== GLOBAL INSTANCE ==============

let patternProcessorInstance: PatternProcessor | null = null;

export function createPatternProcessor(): PatternProcessor {
    if (!patternProcessorInstance) {
        patternProcessorInstance = new PatternProcessor();
    }
    return patternProcessorInstance;
}

export function getPatternProcessor(): PatternProcessor | null {
    return patternProcessorInstance;
}

export function resetPatternProcessor(): void {
    patternProcessorInstance = null;
}

// ============== BACKWARD COMPATIBILITY ==============
// These are kept for backward compatibility with existing code

export const PatternMorpher = PatternProcessor;
export const PatternVariations = PatternProcessor;

export function createPatternMorpher(): PatternProcessor {
    return createPatternProcessor();
}

export function createPatternVariations(): PatternProcessor {
    return createPatternProcessor();
}
