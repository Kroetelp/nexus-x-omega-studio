/**
 * NEXUS-X Auto Arranger
 * Automatically arrange patterns into songs
 *
 * Pure logic class - generates arrangement data
 * No UI or audio dependencies
 */

import { loggers } from '../utils/logger';

const log = loggers.sequencer;

export type SectionType = 'intro' | 'verse' | 'chorus' | 'bridge' | 'drop' | 'buildup' |
    'breakdown' | 'outro' | 'development' | 'peak' | 'hook' | 'drift' | 'swell' | 'release' | 'build';

export interface TemplateSection {
    type: SectionType | string;
    bars: number;
    energy: number;  // 0.0 - 1.0
}

export interface ArrangedSection {
    type: string;
    startBar: number;
    bars: number;
    energy: number;
    patterns: { track: number; pattern: number[] }[];
    variation: number;
}

export interface ArrangementTemplate {
    id: string;
    name: string;
    sections: TemplateSection[];
}

export interface PatternSet {
    [trackName: string]: number[][];
}

type ArrangementListener = (arrangement: ArrangedSection[]) => void;

export class AutoArranger {
    private templates: Map<string, ArrangementTemplate> = new Map();
    private listeners: Set<ArrangementListener> = new Set();

    constructor() {
        this.initializeDefaultTemplates();
    }

    private initializeDefaultTemplates(): void {
        const defaults: ArrangementTemplate[] = [
            {
                id: 'standard',
                name: 'Standard Song',
                sections: [
                    { type: 'intro', bars: 8, energy: 0.3 },
                    { type: 'verse', bars: 16, energy: 0.5 },
                    { type: 'chorus', bars: 16, energy: 0.9 },
                    { type: 'verse', bars: 16, energy: 0.5 },
                    { type: 'chorus', bars: 16, energy: 0.9 },
                    { type: 'bridge', bars: 8, energy: 0.6 },
                    { type: 'chorus', bars: 16, energy: 1.0 },
                    { type: 'outro', bars: 8, energy: 0.2 }
                ]
            },
            {
                id: 'edm',
                name: 'EDM Structure',
                sections: [
                    { type: 'intro', bars: 16, energy: 0.3 },
                    { type: 'buildup', bars: 16, energy: 0.7 },
                    { type: 'drop', bars: 16, energy: 1.0 },
                    { type: 'breakdown', bars: 16, energy: 0.4 },
                    { type: 'buildup', bars: 16, energy: 0.8 },
                    { type: 'drop', bars: 16, energy: 1.0 },
                    { type: 'outro', bars: 16, energy: 0.2 }
                ]
            },
            {
                id: 'techno',
                name: 'Techno Journey',
                sections: [
                    { type: 'intro', bars: 32, energy: 0.3 },
                    { type: 'development', bars: 32, energy: 0.5 },
                    { type: 'peak', bars: 32, energy: 0.9 },
                    { type: 'breakdown', bars: 16, energy: 0.3 },
                    { type: 'peak', bars: 32, energy: 1.0 },
                    { type: 'outro', bars: 32, energy: 0.2 }
                ]
            },
            {
                id: 'hiphop',
                name: 'Hip-Hop',
                sections: [
                    { type: 'intro', bars: 4, energy: 0.4 },
                    { type: 'verse', bars: 16, energy: 0.6 },
                    { type: 'hook', bars: 8, energy: 0.9 },
                    { type: 'verse', bars: 16, energy: 0.6 },
                    { type: 'hook', bars: 8, energy: 0.9 },
                    { type: 'bridge', bars: 8, energy: 0.5 },
                    { type: 'hook', bars: 8, energy: 1.0 },
                    { type: 'outro', bars: 4, energy: 0.3 }
                ]
            },
            {
                id: 'ambient',
                name: 'Ambient Flow',
                sections: [
                    { type: 'intro', bars: 32, energy: 0.2 },
                    { type: 'drift', bars: 64, energy: 0.4 },
                    { type: 'swell', bars: 32, energy: 0.7 },
                    { type: 'release', bars: 64, energy: 0.3 },
                    { type: 'outro', bars: 32, energy: 0.1 }
                ]
            },
            {
                id: 'dnb',
                name: 'DnB Roller',
                sections: [
                    { type: 'intro', bars: 32, energy: 0.4 },
                    { type: 'buildup', bars: 16, energy: 0.7 },
                    { type: 'drop', bars: 32, energy: 1.0 },
                    { type: 'breakdown', bars: 16, energy: 0.3 },
                    { type: 'buildup', bars: 16, energy: 0.8 },
                    { type: 'drop', bars: 32, energy: 1.0 },
                    { type: 'outro', bars: 16, energy: 0.2 }
                ]
            }
        ];

        defaults.forEach(t => this.templates.set(t.id, t));
    }

    /**
     * Generate an arrangement from a template and base patterns
     */
    generateArrangement(templateId: string, basePatterns: PatternSet): ArrangedSection[] {
        const template = this.templates.get(templateId) || this.templates.get('standard')!;
        const arrangement: ArrangedSection[] = [];
        let currentBar = 0;

        template.sections.forEach((section, idx) => {
            const patterns = this.selectPatterns(section, basePatterns);

            arrangement.push({
                type: section.type,
                startBar: currentBar,
                bars: section.bars,
                energy: section.energy,
                patterns,
                variation: this.calculateVariation(idx, template.sections.length)
            });

            currentBar += section.bars;
        });

        this.emit(arrangement);
        return arrangement;
    }

    /**
     * Get available templates
     */
    getTemplates(): { id: string; name: string; totalBars: number }[] {
        return Array.from(this.templates.entries()).map(([id, tmpl]) => ({
            id,
            name: tmpl.name,
            totalBars: tmpl.sections.reduce((sum, s) => sum + s.bars, 0)
        }));
    }

    /**
     * Add or update a custom template
     */
    registerTemplate(template: ArrangementTemplate): void {
        this.templates.set(template.id, template);
    }

    /**
     * Remove a template
     */
    removeTemplate(id: string): boolean {
        return this.templates.delete(id);
    }

    /**
     * Get a specific template
     */
    getTemplate(id: string): ArrangementTemplate | undefined {
        return this.templates.get(id);
    }

    /**
     * Generate arrangement for specific number of bars
     * (Useful for loop-based compositions)
     */
    generateLoopArrangement(bars: number, basePatterns: PatternSet): ArrangedSection[] {
        const arrangement: ArrangedSection[] = [];

        // Single section spanning the entire loop
        arrangement.push({
            type: 'loop',
            startBar: 0,
            bars,
            energy: 1.0,
            patterns: Object.entries(basePatterns).map(([trackName, patterns]) => ({
                track: parseInt(trackName) || 0,
                pattern: patterns[0] || []
            })),
            variation: 0
        });

        return arrangement;
    }

    /**
     * Subscribe to arrangement events
     */
    subscribe(listener: ArrangementListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    // ============== PRIVATE METHODS ==============

    private selectPatterns(section: TemplateSection, basePatterns: PatternSet): { track: number; pattern: number[] }[] {
        const patterns: { track: number; pattern: number[] }[] = [];

        Object.entries(basePatterns).forEach(([trackName, trackPatterns]) => {
            const trackNum = parseInt(trackName) || 0;
            const basePattern = trackPatterns[0] || [];

            let pattern: number[];

            switch (section.type) {
                case 'intro':
                case 'outro':
                    pattern = this.sparsePattern(basePattern);
                    break;

                case 'breakdown':
                    pattern = this.reducePattern(basePattern, 0.5);
                    break;

                case 'drop':
                case 'chorus':
                case 'peak':
                    pattern = basePattern;
                    break;

                case 'buildup':
                case 'build':
                    pattern = this.buildupPattern(basePattern);
                    break;

                default:
                    pattern = basePattern;
            }

            patterns.push({ track: trackNum, pattern });
        });

        return patterns;
    }

    private sparsePattern(pattern: number[]): number[] {
        return pattern.map(v => v > 0 && Math.random() > 0.5 ? v : 0);
    }

    private reducePattern(pattern: number[], factor: number): number[] {
        return pattern.map(v => Math.random() < factor ? v : 0);
    }

    private buildupPattern(pattern: number[]): number[] {
        return pattern.map((v, i) => {
            const threshold = i / pattern.length;
            return Math.random() > threshold * 0.5 ? v : 0;
        });
    }

    private calculateVariation(sectionIndex: number, totalSections: number): number {
        // More variation in middle sections
        const midPoint = totalSections / 2;
        const distanceFromMid = Math.abs(sectionIndex - midPoint) / midPoint;
        return 0.3 + (1 - distanceFromMid) * 0.4;
    }

    private emit(arrangement: ArrangedSection[]): void {
        this.listeners.forEach(listener => {
            try {
                listener(arrangement);
            } catch (e) {
                log.error('AutoArranger listener error:', e);
            }
        });
    }
}

// ============== GLOBAL INSTANCE ==============

let autoArrangerInstance: AutoArranger | null = null;

export function createAutoArranger(): AutoArranger {
    if (!autoArrangerInstance) {
        autoArrangerInstance = new AutoArranger();
    }
    return autoArrangerInstance;
}

export function getAutoArranger(): AutoArranger | null {
    return autoArrangerInstance;
}

export function resetAutoArranger(): void {
    autoArrangerInstance = null;
}
