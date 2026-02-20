/**
 * NEXUS-X Pattern Variations
 * Generate variations of patterns
 */

export class PatternVariations {
    generateVariation(
        pattern: number[],
        type: VariationType,
        amount: number = 0.3
    ): number[] {
        switch (type) {
            case 'fill':
                return this.generateFill(pattern, amount);
            case 'ghost':
                return this.addGhostNotes(pattern, amount);
            case 'sparse':
                return this.makeSparse(pattern, amount);
            case 'dense':
                return this.makeDense(pattern, amount);
            case 'reverse':
                return this.reversePattern(pattern);
            case 'invert':
                return this.invertPattern(pattern);
            case 'rotate':
                return this.rotatePattern(pattern, Math.floor(amount * pattern.length));
            case 'mirror':
                return this.mirrorPattern(pattern);
            case 'randomize':
                return this.randomizePattern(pattern, amount);
            case 'evolve':
                return this.evolvePattern(pattern, amount);
            default:
                return [...pattern];
        }
    }

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
                return 0.5; // Ghost note (lower velocity)
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
        for (let i = 0; i < steps; i++) {
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
        // Gradual evolution - small changes
        const result = [...pattern];

        // Randomly flip a few steps
        const numChanges = Math.ceil(pattern.length * amount * 0.2);
        for (let i = 0; i < numChanges; i++) {
            const idx = Math.floor(Math.random() * pattern.length);
            result[idx] = result[idx] > 0 ? 0 : 1;
        }

        return result;
    }

    generateSequence(
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

    getVariationTypes(): { id: VariationType; name: string }[] {
        return [
            { id: 'fill', name: 'Fill' },
            { id: 'ghost', name: 'Ghost Notes' },
            { id: 'sparse', name: 'Sparse' },
            { id: 'dense', name: 'Dense' },
            { id: 'reverse', name: 'Reverse' },
            { id: 'invert', name: 'Invert' },
            { id: 'rotate', name: 'Rotate' },
            { id: 'mirror', name: 'Mirror' },
            { id: 'randomize', name: 'Randomize' },
            { id: 'evolve', name: 'Evolve' }
        ];
    }
}

type VariationType = 'fill' | 'ghost' | 'sparse' | 'dense' | 'reverse' | 'invert' | 'rotate' | 'mirror' | 'randomize' | 'evolve';

// Global
let patternVariationsInstance: PatternVariations | null = null;

export function createPatternVariations(): PatternVariations {
    if (!patternVariationsInstance) {
        patternVariationsInstance = new PatternVariations();
    }
    return patternVariationsInstance;
}
