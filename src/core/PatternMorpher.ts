/**
 * NEXUS-X Pattern Morpher
 * Morph between different patterns
 */

export class PatternMorpher {
    private patterns: Map<string, number[][]> = new Map();
    private currentMorph: number = 0;
    private morphDuration: number = 4; // beats

    savePattern(name: string, pattern: number[][]): void {
        this.patterns.set(name, pattern);
    }

    getPattern(name: string): number[][] | undefined {
        return this.patterns.get(name);
    }

    morph(from: string, to: string, steps: number = 16): number[][] {
        const fromPattern = this.patterns.get(from);
        const toPattern = this.patterns.get(to);

        if (!fromPattern || !toPattern) {
            throw new Error('Pattern not found');
        }

        const morphed: number[][] = [];

        // Interpolate each track
        for (let track = 0; track < Math.min(fromPattern.length, toPattern.length); track++) {
            const morphedTrack: number[] = [];

            for (let step = 0; step < steps; step++) {
                const fromVal = fromPattern[track][step] || 0;
                const toVal = toPattern[track][step] || 0;

                // Morph based on step position
                const t = step / steps;
                const morphVal = fromVal * (1 - t) + toVal * t;

                // Threshold
                morphedTrack.push(morphVal > 0.3 ? 1 : 0);
            }

            morphed.push(morphedTrack);
        }

        return morphed;
    }

    crossfade(from: string, to: string, mix: number): number[][] {
        const fromPattern = this.patterns.get(from);
        const toPattern = this.patterns.get(to);

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

                // Crossfade
                resultTrack.push(fromVal * (1 - t) + toVal * t > 0.5 ? 1 : 0);
            }

            result.push(resultTrack);
        }

        return result;
    }

    blend(patterns: string[], weights: number[]): number[][] {
        if (patterns.length !== weights.length) {
            throw new Error('Patterns and weights must match');
        }

        const totalWeight = weights.reduce((a, b) => a + b, 0);
        const result: number[][] = [];

        // Initialize with first pattern structure
        const firstPattern = this.patterns.get(patterns[0]);
        if (!firstPattern) throw new Error('Pattern not found');

        for (let track = 0; track < firstPattern.length; track++) {
            result.push(new Array(32).fill(0));
        }

        // Blend all patterns
        patterns.forEach((name, idx) => {
            const pattern = this.patterns.get(name);
            if (!pattern) return;

            const weight = weights[idx] / totalWeight;

            for (let track = 0; track < pattern.length; track++) {
                for (let step = 0; step < 32; step++) {
                    result[track][step] += (pattern[track][step] || 0) * weight;
                }
            }
        });

        // Threshold
        return result.map(track => track.map(val => val > 0.4 ? 1 : 0));
    }

    generateTransition(
        from: string,
        to: string,
        type: 'fill' | 'buildup' | 'breakdown' | 'drop'
    ): number[][] {
        const fromPattern = this.patterns.get(from);
        const toPattern = this.patterns.get(to);

        if (!fromPattern || !toPattern) {
            throw new Error('Pattern not found');
        }

        const transition: number[][] = [];

        switch (type) {
            case 'fill':
                // End of phrase fill
                for (let track = 0; track < fromPattern.length; track++) {
                    const trackData = [...fromPattern[track]];
                    // Add density at end
                    for (let step = 24; step < 32; step++) {
                        if (Math.random() > 0.5) trackData[step] = 1;
                    }
                    transition.push(trackData);
                }
                break;

            case 'buildup':
                // Increasing energy
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
                // Decreasing energy
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
                // Sudden change with impact
                for (let track = 0; track < toPattern.length; track++) {
                    const trackData = new Array(4).fill(1); // Impact hits
                    trackData.push(...toPattern[track].slice(4));
                    transition.push(trackData);
                }
                break;
        }

        return transition;
    }

    getPatternNames(): string[] {
        return Array.from(this.patterns.keys());
    }

    clearPatterns(): void {
        this.patterns.clear();
    }
}

// Global
let patternMorpherInstance: PatternMorpher | null = null;

export function createPatternMorpher(): PatternMorpher {
    if (!patternMorpherInstance) {
        patternMorpherInstance = new PatternMorpher();
    }
    return patternMorpherInstance;
}
