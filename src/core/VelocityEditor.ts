/**
 * NEXUS-X Velocity Editor
 * Edit velocity curves and patterns
 */

export class VelocityEditor {
    private curve: VelocityCurvePoint[] = [];
    private curveLength: number = 16;

    constructor() {
        this.resetCurve();
    }

    private resetCurve(): void {
        this.curve = [];
        for (let i = 0; i < this.curveLength; i++) {
            this.curve.push({ position: i / (this.curveLength - 1), velocity: 0.8 });
        }
    }

    setCurveLength(length: number): void {
        this.curveLength = length;
        this.resetCurve();
    }

    setVelocityAt(position: number, velocity: number): void {
        const index = Math.round(position * (this.curveLength - 1));
        if (index >= 0 && index < this.curve.length) {
            this.curve[index].velocity = Math.max(0, Math.min(1, velocity));
        }
    }

    getVelocityAt(position: number): number {
        const normalizedPos = position % 1;
        const index = Math.round(normalizedPos * (this.curveLength - 1));
        return this.curve[index]?.velocity || 0.8;
    }

    getCurve(): VelocityCurvePoint[] {
        return [...this.curve];
    }

    applyCurve(notes: { position: number; velocity: number }[]): { position: number; velocity: number }[] {
        return notes.map(note => ({
            ...note,
            velocity: note.velocity * this.getVelocityAt(note.position)
        }));
    }

    // Preset curves
    applyPreset(preset: VelocityPreset): void {
        switch (preset) {
            case 'flat':
                this.setFlatCurve(0.8);
                break;
            case 'crescendo':
                this.setCrescendoCurve();
                break;
            case 'decrescendo':
                this.setDecrescendoCurve();
                break;
            case 'wave':
                this.setWaveCurve();
                break;
            case 'pulse':
                this.setPulseCurve();
                break;
            case 'random':
                this.setRandomCurve();
                break;
            case 'accent_downbeat':
                this.setAccentDownbeatCurve();
                break;
            case 'accent_upbeat':
                this.setAccentUpbeatCurve();
                break;
        }
    }

    private setFlatCurve(level: number): void {
        this.curve = this.curve.map(p => ({ ...p, velocity: level }));
    }

    private setCrescendoCurve(): void {
        this.curve = this.curve.map((p, i) => ({
            ...p,
            velocity: 0.3 + (i / (this.curveLength - 1)) * 0.7
        }));
    }

    private setDecrescendoCurve(): void {
        this.curve = this.curve.map((p, i) => ({
            ...p,
            velocity: 1 - (i / (this.curveLength - 1)) * 0.7
        }));
    }

    private setWaveCurve(): void {
        this.curve = this.curve.map((p, i) => ({
            ...p,
            velocity: 0.5 + Math.sin((i / this.curveLength) * Math.PI * 2) * 0.4
        }));
    }

    private setPulseCurve(): void {
        this.curve = this.curve.map((p, i) => ({
            ...p,
            velocity: i % 4 === 0 ? 1 : i % 2 === 0 ? 0.6 : 0.3
        }));
    }

    private setRandomCurve(): void {
        this.curve = this.curve.map(p => ({
            ...p,
            velocity: 0.3 + Math.random() * 0.7
        }));
    }

    private setAccentDownbeatCurve(): void {
        this.curve = this.curve.map((p, i) => ({
            ...p,
            velocity: i % 4 === 0 ? 1 : 0.6
        }));
    }

    private setAccentUpbeatCurve(): void {
        this.curve = this.curve.map((p, i) => ({
            ...p,
            velocity: i % 4 === 2 ? 1 : 0.6
        }));
    }

    // Humanize velocities
    humanize(amount: number): void {
        this.curve = this.curve.map(p => ({
            ...p,
            velocity: Math.max(0.1, Math.min(1, p.velocity + (Math.random() - 0.5) * amount * 2))
        }));
    }

    // Scale velocities
    scale(factor: number): void {
        this.curve = this.curve.map(p => ({
            ...p,
            velocity: Math.max(0, Math.min(1, p.velocity * factor))
        }));
    }

    // Offset velocities
    offset(amount: number): void {
        this.curve = this.curve.map(p => ({
            ...p,
            velocity: Math.max(0, Math.min(1, p.velocity + amount))
        }));
    }

    // Invert velocities
    invert(): void {
        this.curve = this.curve.map(p => ({
            ...p,
            velocity: 1 - p.velocity
        }));
    }

    getPresets(): { id: VelocityPreset; name: string }[] {
        return [
            { id: 'flat', name: 'Flat' },
            { id: 'crescendo', name: 'Crescendo' },
            { id: 'decrescendo', name: 'Decrescendo' },
            { id: 'wave', name: 'Wave' },
            { id: 'pulse', name: 'Pulse' },
            { id: 'random', name: 'Random' },
            { id: 'accent_downbeat', name: 'Accent Downbeat' },
            { id: 'accent_upbeat', name: 'Accent Upbeat' }
        ];
    }
}

interface VelocityCurvePoint {
    position: number;
    velocity: number;
}

type VelocityPreset = 'flat' | 'crescendo' | 'decrescendo' | 'wave' | 'pulse' | 'random' | 'accent_downbeat' | 'accent_upbeat';

// Global
let velocityEditorInstance: VelocityEditor | null = null;

export function createVelocityEditor(): VelocityEditor {
    if (!velocityEditorInstance) {
        velocityEditorInstance = new VelocityEditor();
    }
    return velocityEditorInstance;
}
