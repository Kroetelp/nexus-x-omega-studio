/**
 * NEXUS-X Sidechain Compressor
 * Ducking effect triggered by kick
 */

export class SidechainCompressor {
    private audioContext: AudioContext | null = null;
    private compressor: DynamicsCompressorNode | null = null;
    private gainNode: GainNode | null = null;
    private isEngaged: boolean = false;

    private settings: SidechainSettings = {
        threshold: -30,
        ratio: 10,
        attack: 0.005,
        hold: 0.05,
        release: 0.15,
        depth: 0.8,
        sync: true,
        rate: '1/4'
    };

    private readonly RATE_VALUES: Record<string, number> = {
        '1/1': 4,
        '1/2': 2,
        '1/4': 1,
        '1/8': 0.5,
        '1/16': 0.25
    };

    async initialize(audioContext?: AudioContext): Promise<void> {
        this.audioContext = audioContext || new AudioContext();

        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 1;

        this.compressor = this.audioContext.createDynamicsCompressor();
        this.updateSettings();
    }

    private updateSettings(): void {
        if (!this.compressor) return;

        this.compressor.threshold.value = this.settings.threshold;
        this.compressor.ratio.value = this.settings.ratio;
        this.compressor.attack.value = this.settings.attack;
        this.compressor.release.value = this.settings.release;
        this.compressor.knee.value = 0;
    }

    setSettings(settings: Partial<SidechainSettings>): void {
        this.settings = { ...this.settings, ...settings };
        this.updateSettings();
    }

    trigger(): void {
        if (!this.gainNode || !this.audioContext || !this.isEngaged) return;

        const now = this.audioContext.currentTime;
        const depth = this.settings.depth;
        const attack = this.settings.attack;
        const hold = this.settings.hold;
        const release = this.settings.release;

        // Duck the gain
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(1 - depth, now + attack);
        this.gainNode.gain.setValueAtTime(1 - depth, now + attack + hold);
        this.gainNode.gain.linearRampToValueAtTime(1, now + attack + hold + release);
    }

    triggerFromBeat(bpm: number): void {
        if (!this.isEngaged || !this.settings.sync) return;

        const beatDuration = 60 / bpm;
        const rateMultiplier = this.RATE_VALUES[this.settings.rate] || 1;

        this.trigger();
    }

    setEngaged(engaged: boolean): void {
        this.isEngaged = engaged;
        if (this.gainNode) {
            this.gainNode.gain.value = engaged ? 1 : 1;
        }
    }

    getInputNode(): AudioNode | null {
        return this.gainNode;
    }

    getOutputNode(): AudioNode | null {
        return this.compressor || this.gainNode;
    }

    getSettings(): SidechainSettings {
        return { ...this.settings };
    }

    getRateOptions(): string[] {
        return Object.keys(this.RATE_VALUES);
    }

    // Preset sidechain curves
    applyPreset(preset: 'pump' | 'subtle' | 'aggressive' | 'glue'): void {
        switch (preset) {
            case 'pump':
                this.setSettings({
                    threshold: -20,
                    ratio: 8,
                    attack: 0.01,
                    hold: 0.1,
                    release: 0.2,
                    depth: 0.7
                });
                break;
            case 'subtle':
                this.setSettings({
                    threshold: -30,
                    ratio: 4,
                    attack: 0.02,
                    hold: 0.05,
                    release: 0.3,
                    depth: 0.4
                });
                break;
            case 'aggressive':
                this.setSettings({
                    threshold: -10,
                    ratio: 20,
                    attack: 0.001,
                    hold: 0.05,
                    release: 0.1,
                    depth: 0.9
                });
                break;
            case 'glue':
                this.setSettings({
                    threshold: -25,
                    ratio: 6,
                    attack: 0.03,
                    hold: 0.08,
                    release: 0.25,
                    depth: 0.5
                });
                break;
        }
    }
}

interface SidechainSettings {
    threshold: number;
    ratio: number;
    attack: number;
    hold: number;
    release: number;
    depth: number;
    sync: boolean;
    rate: string;
}

// Global
let sidechainInstance: SidechainCompressor | null = null;

export function createSidechain(): SidechainCompressor {
    if (!sidechainInstance) {
        sidechainInstance = new SidechainCompressor();
    }
    return sidechainInstance;
}
