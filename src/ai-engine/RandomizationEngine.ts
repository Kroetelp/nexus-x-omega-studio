/**
 * NEXUS-X Randomization Engine
 * Intelligent pattern randomization with multiple algorithms
 *
 * Pure logic class - generates pattern data
 * Uses seeded random for reproducibility
 */

import { getScaleIntervals, ScaleName } from '../music-theory/ScaleDefinitions';
import { loggers } from '../utils/logger';

const log = loggers.ai;

export type RandomizationMode = 'euclidean' | 'markov' | 'cellular' | 'lsystem' | 'genetic' | 'chaos';
export type MelodyStyle = 'random' | 'scalar' | 'arpeggiated' | 'contour';

export interface RandomizationModeConfig {
    id: RandomizationMode;
    name: string;
    description: string;
}

export interface EuclideanConfig {
    pulses: number;
    steps: number;
    rotation: number;
}

export interface MarkovConfig {
    length: number;
    transitionMatrix?: number[][];
    initialState?: number;
}

export interface CellularConfig {
    length: number;
    rule: number;
    generations: number;
}

export interface LSystemConfig {
    axiom: string;
    rules: Record<string, string>;
    iterations: number;
    mapping?: Record<string, number>;
}

export interface GeneticConfig {
    targetPattern: number[];
    populationSize: number;
    generations: number;
    mutationRate: number;
}

type PatternListener = (pattern: number[]) => void;

export class RandomizationEngine {
    private seed: number = Date.now();
    private listeners: Set<PatternListener> = new Set();

    private readonly MODES: Record<RandomizationMode, { name: string; description: string }> = {
        euclidean: {
            name: 'Euclidean',
            description: 'Evenly distributed rhythm patterns'
        },
        markov: {
            name: 'Markov Chain',
            description: 'Probabilistic pattern generation'
        },
        cellular: {
            name: 'Cellular Automata',
            description: 'Evolving patterns based on rules'
        },
        lsystem: {
            name: 'L-System',
            description: 'Fractal-like pattern growth'
        },
        genetic: {
            name: 'Genetic Algorithm',
            description: 'Evolution-based pattern optimization'
        },
        chaos: {
            name: 'Pure Chaos',
            description: 'Completely random'
        }
    };

    /**
     * Set the random seed for reproducibility
     */
    setSeed(seed: number): void {
        this.seed = seed;
    }

    /**
     * Get current seed
     */
    getSeed(): number {
        return this.seed;
    }

    /**
     * Seeded random number generator
     */
    private seededRandom(): number {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    }

    /**
     * Reset random seed to current time
     */
    randomizeSeed(): void {
        this.seed = Date.now();
    }

    // ============== EUCLIDEAN RHYTHM ==============

    /**
     * Generate Euclidean rhythm pattern
     * Distributes pulses as evenly as possible across steps
     */
    euclideanRhythm(pulses: number, steps: number, rotation: number = 0): number[] {
        const pattern: number[] = Array(steps).fill(0);

        // Euclidean algorithm (Bjorklund's algorithm simplified)
        let bucket = 0;
        for (let i = 0; i < steps; i++) {
            bucket += pulses;
            if (bucket >= steps) {
                bucket -= steps;
                pattern[i] = 1;
            }
        }

        // Apply rotation
        if (rotation > 0) {
            const r = rotation % steps;
            return [...pattern.slice(r), ...pattern.slice(0, r)];
        }

        return pattern;
    }

    /**
     * Generate Euclidean rhythm with config object
     */
    euclidean(config: EuclideanConfig): number[] {
        return this.euclideanRhythm(config.pulses, config.steps, config.rotation);
    }

    // ============== MARKOV CHAIN ==============

    /**
     * Generate rhythm using Markov chain
     */
    markovRhythm(length: number, transitionMatrix?: number[][], initialState: number = 0): number[] {
        // Default transition matrix (favors continuity)
        const transitions = transitionMatrix || [
            [0.7, 0.3], // From 0: stay 0 (70%), go to 1 (30%)
            [0.5, 0.5]  // From 1: go to 0 (50%), stay 1 (50%)
        ];

        const pattern: number[] = [];
        let state = initialState;

        for (let i = 0; i < length; i++) {
            pattern.push(state);
            const r = this.seededRandom();
            state = r < transitions[state][0] ? 0 : 1;
        }

        return pattern;
    }

    /**
     * Generate Markov pattern with config object
     */
    markov(config: MarkovConfig): number[] {
        return this.markovRhythm(config.length, config.transitionMatrix, config.initialState);
    }

    // ============== CELLULAR AUTOMATA ==============

    /**
     * Generate pattern using elementary cellular automaton
     * Rule 90 creates Sierpinski triangle, Rule 30 creates chaos
     */
    cellularAutomata(length: number, rule: number = 90, generations: number = 4): number[] {
        let state = Array(length).fill(0);
        state[Math.floor(length / 2)] = 1; // Initial seed in center

        for (let gen = 0; gen < generations; gen++) {
            const newState = Array(length).fill(0);

            for (let i = 0; i < length; i++) {
                const left = state[(i - 1 + length) % length];
                const center = state[i];
                const right = state[(i + 1) % length];

                const index = left * 4 + center * 2 + right;
                newState[i] = (rule >> index) & 1;
            }

            state = newState;
        }

        return state;
    }

    /**
     * Generate cellular automata pattern with config object
     */
    cellular(config: CellularConfig): number[] {
        return this.cellularAutomata(config.length, config.rule, config.generations);
    }

    // ============== L-SYSTEM ==============

    /**
     * Generate L-System string
     */
    lSystem(axiom: string, rules: Record<string, string>, iterations: number): string {
        let result = axiom;

        for (let i = 0; i < iterations; i++) {
            let newResult = '';
            for (const char of result) {
                newResult += rules[char] || char;
            }
            result = newResult;
        }

        return result;
    }

    /**
     * Convert L-System string to numeric pattern
     */
    lSystemToPattern(lString: string, mapping?: Record<string, number>): number[] {
        const defaultMapping: Record<string, number> = mapping || {
            'A': 1, 'B': 0, 'C': 1, 'D': 0,
            'X': 1, 'Y': 0, 'Z': 1
        };

        return lString.split('').map(c => defaultMapping[c] ?? 0);
    }

    /**
     * Generate L-System pattern with config object
     */
    lsystem(config: LSystemConfig): number[] {
        const lString = this.lSystem(config.axiom, config.rules, config.iterations);
        return this.lSystemToPattern(lString, config.mapping);
    }

    // ============== GENETIC ALGORITHM ==============

    /**
     * Evolve a pattern toward a target using genetic algorithm
     */
    geneticEvolution(
        targetPattern: number[],
        populationSize: number = 20,
        generations: number = 50,
        mutationRate: number = 0.1
    ): number[] {
        const length = targetPattern.length;

        // Initialize random population
        let population: number[][] = [];
        for (let i = 0; i < populationSize; i++) {
            population.push(Array(length).fill(0).map(() =>
                Math.round(this.seededRandom())
            ));
        }

        // Evolve
        for (let gen = 0; gen < generations; gen++) {
            // Evaluate fitness
            const fitness = population.map(ind =>
                this.calculateFitness(ind, targetPattern)
            );

            // Select and sort by fitness
            const sorted = population
                .map((ind, i) => ({ ind, fit: fitness[i] }))
                .sort((a, b) => b.fit - a.fit);

            // Keep top 50%
            const survivors = sorted.slice(0, Math.floor(populationSize / 2)).map(s => s.ind);

            // Crossover and mutate to replenish
            population = [...survivors];
            while (population.length < populationSize) {
                const parent1 = survivors[Math.floor(this.seededRandom() * survivors.length)];
                const parent2 = survivors[Math.floor(this.seededRandom() * survivors.length)];
                const child = this.crossover(parent1, parent2);
                population.push(this.mutate(child, mutationRate));
            }
        }

        // Return best individual
        const fitness = population.map(ind => this.calculateFitness(ind, targetPattern));
        const bestIndex = fitness.indexOf(Math.max(...fitness));
        return population[bestIndex];
    }

    /**
     * Generate genetic algorithm pattern with config object
     */
    genetic(config: GeneticConfig): number[] {
        return this.geneticEvolution(
            config.targetPattern,
            config.populationSize,
            config.generations,
            config.mutationRate
        );
    }

    // ============== PURE CHAOS ==============

    /**
     * Generate completely random pattern
     */
    chaosRhythm(length: number, density: number = 0.3): number[] {
        return Array(length).fill(0).map(() =>
            this.seededRandom() < density ? 1 : 0
        );
    }

    // ============== MELODY GENERATION ==============

    /**
     * Generate melody notes
     */
    generateMelody(
        length: number,
        scale: ScaleName | number[],
        root: number,
        style: MelodyStyle = 'scalar'
    ): number[] {
        const scaleIntervals = Array.isArray(scale) ? scale : getScaleIntervals(scale);
        const notes: number[] = [];
        let lastNote = root + scaleIntervals[Math.floor(scaleIntervals.length / 2)];

        for (let i = 0; i < length; i++) {
            let note: number;

            switch (style) {
                case 'random':
                    note = root + scaleIntervals[Math.floor(this.seededRandom() * scaleIntervals.length)] +
                        Math.floor(this.seededRandom() * 2) * 12;
                    break;

                case 'scalar':
                    const direction = this.seededRandom() > 0.5 ? 1 : -1;
                    const step = scaleIntervals[Math.floor(this.seededRandom() * 3)] * direction;
                    note = lastNote + step;
                    break;

                case 'arpeggiated':
                    const arpNote = scaleIntervals[i % scaleIntervals.length];
                    note = root + arpNote + Math.floor(i / scaleIntervals.length) * 12;
                    break;

                case 'contour':
                    // Creates melodic contours using sine wave
                    const phase = (i / length) * Math.PI;
                    const contourValue = Math.sin(phase);
                    const scaleIndex = Math.floor((contourValue + 1) / 2 * (scaleIntervals.length - 1));
                    note = root + scaleIntervals[scaleIndex];
                    break;

                default:
                    note = lastNote;
            }

            notes.push(note);
            lastNote = note;
        }

        this.emit(notes);
        return notes;
    }

    // ============== UTILITY METHODS ==============

    /**
     * Get available randomization modes
     */
    getModes(): RandomizationModeConfig[] {
        return Object.entries(this.MODES).map(([id, config]) => ({
            id: id as RandomizationMode,
            name: config.name,
            description: config.description
        }));
    }

    /**
     * Generate pattern using any mode by ID
     */
    generate(mode: RandomizationMode, length: number, options?: any): number[] {
        switch (mode) {
            case 'euclidean':
                return this.euclideanRhythm(options?.pulses || 5, length, options?.rotation || 0);
            case 'markov':
                return this.markovRhythm(length, options?.transitionMatrix, options?.initialState);
            case 'cellular':
                return this.cellularAutomata(length, options?.rule || 90, options?.generations || 4);
            case 'lsystem':
                return this.lsystem(options || { axiom: 'A', rules: { 'A': 'AB', 'B': 'A' }, iterations: 4 });
            case 'genetic':
                return this.geneticEvolution(options?.targetPattern || Array(length).fill(0).map(() => Math.round(Math.random())));
            case 'chaos':
                return this.chaosRhythm(length, options?.density || 0.3);
            default:
                return this.chaosRhythm(length);
        }
    }

    /**
     * Subscribe to pattern generation events
     */
    subscribe(listener: PatternListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    // ============== PRIVATE HELPERS ==============

    private calculateFitness(individual: number[], target: number[]): number {
        let matches = 0;
        for (let i = 0; i < individual.length; i++) {
            if (individual[i] === target[i]) matches++;
        }
        return matches / individual.length;
    }

    private crossover(parent1: number[], parent2: number[]): number[] {
        const crossPoint = Math.floor(this.seededRandom() * parent1.length);
        return [...parent1.slice(0, crossPoint), ...parent2.slice(crossPoint)];
    }

    private mutate(individual: number[], rate: number): number[] {
        return individual.map(gene =>
            this.seededRandom() < rate ? 1 - gene : gene
        );
    }

    private emit(pattern: number[]): void {
        this.listeners.forEach(listener => {
            try {
                listener(pattern);
            } catch (e) {
                log.error('RandomizationEngine listener error:', e);
            }
        });
    }
}

// ============== GLOBAL INSTANCE ==============

let randomizationEngineInstance: RandomizationEngine | null = null;

export function createRandomizationEngine(): RandomizationEngine {
    if (!randomizationEngineInstance) {
        randomizationEngineInstance = new RandomizationEngine();
    }
    return randomizationEngineInstance;
}

export function getRandomizationEngine(): RandomizationEngine | null {
    return randomizationEngineInstance;
}

export function resetRandomizationEngine(): void {
    randomizationEngineInstance = null;
}
