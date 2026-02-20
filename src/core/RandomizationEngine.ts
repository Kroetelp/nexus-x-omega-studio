/**
 * NEXUS-X Randomization Engine
 * Intelligent pattern randomization
 */

export class RandomizationEngine {
    private seed: number = Date.now();

    private readonly RANDOMIZATION_MODES = {
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

    // Seeded random for reproducibility
    private seededRandom(): number {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    }

    setSeed(seed: number): void {
        this.seed = seed;
    }

    euclideanRhythm(pulses: number, steps: number, rotation: number = 0): number[] {
        const pattern: number[] = Array(steps).fill(0);

        // Euclidean algorithm
        let bucket = 0;
        for (let i = 0; i < steps; i++) {
            bucket += pulses;
            if (bucket >= steps) {
                bucket -= steps;
                pattern[i] = 1;
            }
        }

        // Rotate
        if (rotation > 0) {
            const rotated = [...pattern.slice(rotation), ...pattern.slice(0, rotation)];
            return rotated;
        }

        return pattern;
    }

    markovRhythm(
        length: number,
        transitionMatrix?: number[][],
        initialState: number = 0
    ): number[] {
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

    cellularAutomata(
        length: number,
        rule: number = 90,
        generations: number = 4
    ): number[] {
        // Elementary cellular automaton
        let state = Array(length).fill(0);
        state[Math.floor(length / 2)] = 1; // Initial seed

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

    lSystem(
        axiom: string,
        rules: Record<string, string>,
        iterations: number
    ): string {
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

    lSystemToPattern(lString: string, mapping?: Record<string, number>): number[] {
        const defaultMapping: Record<string, number> = mapping || {
            'A': 1, 'B': 0, 'C': 1, 'D': 0,
            'X': 1, 'Y': 0, 'Z': 1
        };

        return lString.split('').map(c => defaultMapping[c] ?? 0);
    }

    geneticEvolution(
        targetPattern: number[],
        populationSize: number = 20,
        generations: number = 50
    ): number[] {
        // Initialize population
        let population: number[][] = [];
        for (let i = 0; i < populationSize; i++) {
            population.push(Array(targetPattern.length).fill(0).map(() =>
                Math.round(this.seededRandom())
            ));
        }

        // Evolve
        for (let gen = 0; gen < generations; gen++) {
            // Evaluate fitness
            const fitness = population.map(ind =>
                this.calculateFitness(ind, targetPattern)
            );

            // Select best
            const sorted = population
                .map((ind, i) => ({ ind, fit: fitness[i] }))
                .sort((a, b) => b.fit - a.fit);

            // Keep top 50%
            const survivors = sorted.slice(0, populationSize / 2).map(s => s.ind);

            // Crossover and mutate
            population = [...survivors];
            while (population.length < populationSize) {
                const parent1 = survivors[Math.floor(this.seededRandom() * survivors.length)];
                const parent2 = survivors[Math.floor(this.seededRandom() * survivors.length)];
                const child = this.crossover(parent1, parent2);
                population.push(this.mutate(child, 0.1));
            }
        }

        // Return best
        const fitness = population.map(ind => this.calculateFitness(ind, targetPattern));
        const bestIndex = fitness.indexOf(Math.max(...fitness));
        return population[bestIndex];
    }

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

    chaosRhythm(length: number, density: number = 0.3): number[] {
        return Array(length).fill(0).map(() =>
            this.seededRandom() < density ? 1 : 0
        );
    }

    generateMelody(
        length: number,
        scale: number[],
        root: number,
        style: 'random' | 'scalar' | 'arpeggiated' | 'contour' = 'scalar'
    ): number[] {
        const notes: number[] = [];
        let lastNote = root + scale[Math.floor(scale.length / 2)];

        for (let i = 0; i < length; i++) {
            let note: number;

            switch (style) {
                case 'random':
                    note = root + scale[Math.floor(this.seededRandom() * scale.length)] +
                           Math.floor(this.seededRandom() * 2) * 12;
                    break;

                case 'scalar':
                    const direction = this.seededRandom() > 0.5 ? 1 : -1;
                    const step = scale[Math.floor(this.seededRandom() * 3)] * direction;
                    note = lastNote + step;
                    break;

                case 'arpeggiated':
                    const arpNote = scale[i % scale.length];
                    note = root + arpNote + Math.floor(i / scale.length) * 12;
                    break;

                case 'contour':
                    // Creates melodic contours
                    const phase = (i / length) * Math.PI;
                    const contourValue = Math.sin(phase);
                    const scaleIndex = Math.floor((contourValue + 1) / 2 * (scale.length - 1));
                    note = root + scale[scaleIndex];
                    break;

                default:
                    note = lastNote;
            }

            notes.push(note);
            lastNote = note;
        }

        return notes;
    }

    getRandomizationModes(): { id: string; name: string; description: string }[] {
        return Object.entries(this.RANDOMIZATION_MODES).map(([id, config]) => ({
            id,
            name: config.name,
            description: config.description
        }));
    }
}

// Global
let randomizationEngineInstance: RandomizationEngine | null = null;

export function createRandomizationEngine(): RandomizationEngine {
    if (!randomizationEngineInstance) {
        randomizationEngineInstance = new RandomizationEngine();
    }
    return randomizationEngineInstance;
}
