/**
 * NEXUS-X Auto Arranger
 * Automatically arrange patterns into songs
 */

export class AutoArranger {
    private readonly ARRANGEMENT_TEMPLATES: Record<string, ArrangementTemplate> = {
        'standard': {
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
        'edm': {
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
        'techno': {
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
        'hiphop': {
            name: 'Hip-Hop',
            sections: [
                { type: 'intro', bars: 4, energy: 0.4 },
                { type: 'verse1', bars: 16, energy: 0.6 },
                { type: 'hook', bars: 8, energy: 0.9 },
                { type: 'verse2', bars: 16, energy: 0.6 },
                { type: 'hook', bars: 8, energy: 0.9 },
                { type: 'bridge', bars: 8, energy: 0.5 },
                { type: 'hook', bars: 8, energy: 1.0 },
                { type: 'outro', bars: 4, energy: 0.3 }
            ]
        },
        'ambient': {
            name: 'Ambient Flow',
            sections: [
                { type: 'intro', bars: 32, energy: 0.2 },
                { type: 'drift', bars: 64, energy: 0.4 },
                { type: 'swell', bars: 32, energy: 0.7 },
                { type: 'release', bars: 64, energy: 0.3 },
                { type: 'outro', bars: 32, energy: 0.1 }
            ]
        },
        'dnb': {
            name: 'DnB Roller',
            sections: [
                { type: 'intro', bars: 32, energy: 0.4 },
                { type: 'build', bars: 16, energy: 0.7 },
                { type: 'drop1', bars: 32, energy: 1.0 },
                { type: 'breakdown', bars: 16, energy: 0.3 },
                { type: 'build', bars: 16, energy: 0.8 },
                { type: 'drop2', bars: 32, energy: 1.0 },
                { type: 'outro', bars: 16, energy: 0.2 }
            ]
        }
    };

    generateArrangement(
        template: string,
        basePatterns: Map<string, number[][]>
    ): ArrangedSection[] {
        const tmpl = this.ARRANGEMENT_TEMPLATES[template] || this.ARRANGEMENT_TEMPLATES['standard'];
        const arrangement: ArrangedSection[] = [];

        let currentBar = 0;

        tmpl.sections.forEach((section, idx) => {
            // Select appropriate patterns based on section type and energy
            const patterns = this.selectPatterns(section, basePatterns);

            arrangement.push({
                type: section.type,
                startBar: currentBar,
                bars: section.bars,
                energy: section.energy,
                patterns,
                variation: this.calculateVariation(idx)
            });

            currentBar += section.bars;
        });

        return arrangement;
    }

    private selectPatterns(
        section: TemplateSection,
        basePatterns: Map<string, number[][]>
    ): { track: number; pattern: number[] }[] {
        const patterns: { track: number; pattern: number[] }[] = [];

        basePatterns.forEach((trackPatterns, trackName) => {
            const trackNum = parseInt(trackName) || 0;
            let pattern: number[];

            // Select pattern based on section type
            switch (section.type) {
                case 'intro':
                case 'outro':
                    // Sparse patterns
                    pattern = this.sparsePattern(trackPatterns[0] || []);
                    break;

                case 'breakdown':
                    // Reduced energy
                    pattern = this.reducePattern(trackPatterns[0] || [], 0.5);
                    break;

                case 'drop':
                case 'chorus':
                case 'peak':
                    // Full energy
                    pattern = trackPatterns[0] || [];
                    break;

                case 'buildup':
                case 'build':
                    // Increasing energy
                    pattern = this.buildupPattern(trackPatterns[0] || []);
                    break;

                default:
                    pattern = trackPatterns[Math.floor(section.energy * trackPatterns.length) % trackPatterns.length] || [];
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

    private calculateVariation(sectionIndex: number): number {
        // More variation in middle sections
        return 0.3 + Math.sin(sectionIndex * 0.5) * 0.2;
    }

    getTemplates(): { id: string; name: string; totalBars: number }[] {
        return Object.entries(this.ARRANGEMENT_TEMPLATES).map(([id, tmpl]) => ({
            id,
            name: tmpl.name,
            totalBars: tmpl.sections.reduce((sum, s) => sum + s.bars, 0)
        }));
    }

    createCustomTemplate(
        name: string,
        sections: { type: string; bars: number; energy: number }[]
    ): void {
        this.ARRANGEMENT_TEMPLATES[name.toLowerCase().replace(/\s+/g, '_')] = {
            name,
            sections
        };
    }
}

interface ArrangementTemplate {
    name: string;
    sections: TemplateSection[];
}

interface TemplateSection {
    type: string;
    bars: number;
    energy: number;
}

interface ArrangedSection {
    type: string;
    startBar: number;
    bars: number;
    energy: number;
    patterns: { track: number; pattern: number[] }[];
    variation: number;
}

// Global
let autoArrangerInstance: AutoArranger | null = null;

export function createAutoArranger(): AutoArranger {
    if (!autoArrangerInstance) {
        autoArrangerInstance = new AutoArranger();
    }
    return autoArrangerInstance;
}
