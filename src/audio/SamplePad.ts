/**
 * NEXUS-X Sample Pad
 * Trigger samples with pads
 */

import { loggers } from '../utils/logger';

const log = loggers.audio;

export class SamplePad {
    private audioContext: AudioContext | null = null;
    private samples: Map<number, AudioBuffer> = new Map();
    private gains: Map<number, GainNode> = new Map();
    private sources: Map<number, AudioBufferSourceNode> = new Map();
    private onTrigger: ((padId: number) => void) | null = null;

    private readonly PAD_CONFIG = [
        { key: '1', color: '#00ff94' },
        { key: '2', color: '#00ff94' },
        { key: '3', color: '#00ff94' },
        { key: '4', color: '#00ff94' },
        { key: 'Q', color: '#f59e0b' },
        { key: 'W', color: '#f59e0b' },
        { key: 'E', color: '#f59e0b' },
        { key: 'R', color: '#f59e0b' },
        { key: 'A', color: '#ff0055' },
        { key: 'S', color: '#ff0055' },
        { key: 'D', color: '#ff0055' },
        { key: 'F', color: '#ff0055' },
        { key: 'Z', color: '#7c3aed' },
        { key: 'X', color: '#7c3aed' },
        { key: 'C', color: '#7c3aed' },
        { key: 'V', color: '#7c3aed' }
    ];

    async initialize(): Promise<void> {
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }

        // Create gain nodes
        for (let i = 0; i < 16; i++) {
            const gain = this.audioContext.createGain();
            gain.gain.value = 0.8;
            gain.connect(this.audioContext.destination);
            this.gains.set(i, gain);
        }

        // Load default samples
        await this.loadDefaultSamples();

        // Setup keyboard
        this.setupKeyboard();
    }

    private async loadDefaultSamples(): Promise<void> {
        if (!this.audioContext) return;

        // Create synthetic samples for each pad
        for (let i = 0; i < 16; i++) {
            const buffer = this.createSynthSample(i);
            this.samples.set(i, buffer);
        }
    }

    private createSynthSample(padId: number): AudioBuffer {
        if (!this.audioContext) throw new Error('No context');

        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.5;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // Different sounds based on pad
        const baseFreq = 100 + padId * 50;

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 5);

            // Different waveforms based on row
            let sample = 0;
            if (padId < 4) {
                // Kick-like
                const pitch = baseFreq * Math.exp(-t * 10);
                sample = Math.sin(2 * Math.PI * pitch * t) * envelope;
            } else if (padId < 8) {
                // Snare-like (noise)
                sample = (Math.random() - 0.5) * envelope;
            } else if (padId < 12) {
                // Hi-hat-like
                sample = (Math.random() - 0.5) * Math.exp(-t * 30);
            } else {
                // Synth-like
                sample = Math.sin(2 * Math.PI * baseFreq * t) * envelope;
                sample += Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * envelope * 0.5;
            }

            data[i] = sample;
        }

        return buffer;
    }

    trigger(padId: number, velocity: number = 1): void {
        const buffer = this.samples.get(padId);
        if (!buffer || !this.audioContext) return;

        // Stop previous
        const prevSource = this.sources.get(padId);
        if (prevSource) {
            try { prevSource.stop(); } catch (e) {}
        }

        // Create new source
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        const gain = this.gains.get(padId);
        if (gain) {
            gain.gain.value = velocity;
            source.connect(gain);
        }

        source.start();
        this.sources.set(padId, source);

        if (this.onTrigger) {
            this.onTrigger(padId);
        }
    }

    loadSample(padId: number, audioBuffer: AudioBuffer): void {
        this.samples.set(padId, audioBuffer);
    }

    async loadSampleFromUrl(padId: number, url: string): Promise<void> {
        if (!this.audioContext) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.samples.set(padId, audioBuffer);
        } catch (e) {
            log.error(' Failed to load sample:', e);
        }
    }

    setVolume(padId: number, volume: number): void {
        const gain = this.gains.get(padId);
        if (gain) {
            gain.gain.value = Math.max(0, Math.min(2, volume));
        }
    }

    private setupKeyboard(): void {
        const keyMap: Record<string, number> = {
            '1': 0, '2': 1, '3': 2, '4': 3,
            'q': 4, 'w': 5, 'e': 6, 'r': 7,
            'a': 8, 's': 9, 'd': 10, 'f': 11,
            'z': 12, 'x': 13, 'c': 14, 'v': 15
        };

        document.addEventListener('keydown', (e) => {
            const padId = keyMap[e.key.toLowerCase()];
            if (padId !== undefined) {
                e.preventDefault();
                this.trigger(padId, 0.9);
            }
        });
    }

    setTriggerCallback(callback: (padId: number) => void): void {
        this.onTrigger = callback;
    }

    getPadConfig(): typeof SamplePad.prototype.PAD_CONFIG {
        return this.PAD_CONFIG;
    }
}

// Global
let samplePadInstance: SamplePad | null = null;

export function createSamplePad(): SamplePad {
    if (!samplePadInstance) {
        samplePadInstance = new SamplePad();
    }
    return samplePadInstance;
}
