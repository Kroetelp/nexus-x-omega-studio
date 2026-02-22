/**
 * NEXUS-X Effect Rack
 * Chainable audio effects
 */

export class EffectRack {
    private audioContext: AudioContext | null = null;
    private inputNode: GainNode | null = null;
    private outputNode: GainNode | null = null;
    private effects: Map<string, AudioNode> = new Map();
    private effectOrder: string[] = [];

    async initialize(audioContext?: AudioContext): Promise<void> {
        this.audioContext = audioContext || new AudioContext();

        this.inputNode = this.audioContext.createGain();
        this.outputNode = this.audioContext.createGain();

        this.inputNode.gain.value = 1;
        this.outputNode.gain.value = 1;

        // Connect input to output initially
        this.inputNode.connect(this.outputNode);
    }

    addEffect(name: string, type: EffectType, config?: EffectConfig): void {
        if (!this.audioContext || !this.inputNode) return;

        let effect: AudioNode;

        switch (type) {
            case 'reverb':
                effect = this.createReverb(config?.decay || 2, config?.mix || 0.3);
                break;
            case 'delay':
                effect = this.createDelay(config?.time || 0.3, config?.feedback || 0.4);
                break;
            case 'distortion':
                effect = this.createDistortion(config?.amount || 0.5);
                break;
            case 'filter':
                effect = this.createFilter(config?.frequency || 1000, config?.Q || 1);
                break;
            case 'chorus':
                effect = this.createChorus(config?.rate || 1.5, config?.depth || 0.005);
                break;
            case 'phaser':
                effect = this.createPhaser(config?.rate || 0.5);
                break;
            case 'compressor':
                effect = this.createCompressor(config?.threshold || -20, config?.ratio || 4);
                break;
            case 'bitcrusher':
                effect = this.createBitcrusher(config?.bits || 8);
                break;
            case 'flanger':
                effect = this.createFlanger(config?.rate || 0.5, config?.depth || 0.002);
                break;
            case 'tremolo':
                effect = this.createTremolo(config?.rate || 5, config?.depth || 0.5);
                break;
            default:
                return;
        }

        this.effects.set(name, effect);
        this.effectOrder.push(name);
        this.reconnectChain();
    }

    private reconnectChain(): void {
        if (!this.inputNode || !this.outputNode) return;

        // Disconnect all
        this.inputNode.disconnect();

        // Connect in order
        let currentNode: AudioNode = this.inputNode;

        for (const name of this.effectOrder) {
            const effect = this.effects.get(name);
            if (effect) {
                currentNode.connect(effect);
                currentNode = effect;
            }
        }

        currentNode.connect(this.outputNode);
    }

    private createReverb(decay: number, mix: number): ConvolverNode {
        const convolver = this.audioContext!.createConvolver();
        const sampleRate = this.audioContext!.sampleRate;
        const length = sampleRate * decay;
        const impulse = this.audioContext!.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }

        convolver.buffer = impulse;
        return convolver;
    }

    private createDelay(time: number, feedback: number): DelayNode {
        const delay = this.audioContext!.createDelay(5);
        delay.delayTime.value = time;

        const feedbackNode = this.audioContext!.createGain();
        feedbackNode.gain.value = feedback;

        delay.connect(feedbackNode);
        feedbackNode.connect(delay);

        return delay;
    }

    private createDistortion(amount: number): AudioNode {
        const distortion = this.audioContext!.createWaveShaper();
        const curve = new Float32Array(256);

        for (let i = 0; i < 256; i++) {
            const x = (i - 128) / 128;
            curve[i] = Math.tanh(x * amount * 5);
        }

        distortion.curve = curve;
        return distortion;
    }

    private createFilter(frequency: number, Q: number): BiquadFilterNode {
        const filter = this.audioContext!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency;
        filter.Q.value = Q;
        return filter;
    }

    private createChorus(rate: number, depth: number): AudioNode {
        const chorus = this.audioContext!.createDelay(0.1);
        chorus.delayTime.value = 0.02;

        const lfo = this.audioContext!.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = rate;

        const lfoGain = this.audioContext!.createGain();
        lfoGain.gain.value = depth;

        lfo.connect(lfoGain);
        lfoGain.connect(chorus.delayTime);
        lfo.start();

        return chorus;
    }

    private createPhaser(rate: number): AudioNode {
        const filter = this.audioContext!.createBiquadFilter();
        filter.type = 'allpass';
        filter.frequency.value = 1000;

        const lfo = this.audioContext!.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = rate;

        const lfoGain = this.audioContext!.createGain();
        lfoGain.gain.value = 500;

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        return filter;
    }

    private createCompressor(threshold: number, ratio: number): DynamicsCompressorNode {
        const comp = this.audioContext!.createDynamicsCompressor();
        comp.threshold.value = threshold;
        comp.ratio.value = ratio;
        comp.attack.value = 0.003;
        comp.release.value = 0.25;
        return comp;
    }

    private createBitcrusher(bits: number): AudioNode {
        // Simplified - would need script processor for real bitcrushing
        const filter = this.audioContext!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = (2 ** bits) * 20;
        return filter;
    }

    private createFlanger(rate: number, depth: number): AudioNode {
        return this.createChorus(rate, depth); // Similar implementation
    }

    private createTremolo(rate: number, depth: number): AudioNode {
        const gain = this.audioContext!.createGain();

        const lfo = this.audioContext!.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = rate;

        const lfoGain = this.audioContext!.createGain();
        lfoGain.gain.value = depth;

        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();

        gain.gain.value = 1 - depth / 2;

        return gain;
    }

    removeEffect(name: string): void {
        this.effects.delete(name);
        this.effectOrder = this.effectOrder.filter(n => n !== name);
        this.reconnectChain();
    }

    reorderEffects(newOrder: string[]): void {
        this.effectOrder = newOrder.filter(n => this.effects.has(n));
        this.reconnectChain();
    }

    setInput(destination: AudioNode): void {
        if (this.outputNode) {
            this.outputNode.connect(destination);
        }
    }

    getOutput(): AudioNode | null {
        return this.outputNode;
    }

    getInput(): AudioNode | null {
        return this.inputNode;
    }
}

type EffectType = 'reverb' | 'delay' | 'distortion' | 'filter' | 'chorus' |
                  'phaser' | 'compressor' | 'bitcrusher' | 'flanger' | 'tremolo';

interface EffectConfig {
    decay?: number;
    time?: number;
    feedback?: number;
    amount?: number;
    frequency?: number;
    Q?: number;
    rate?: number;
    depth?: number;
    threshold?: number;
    ratio?: number;
    bits?: number;
    mix?: number;
}

// Global
let effectRackInstance: EffectRack | null = null;

export function createEffectRack(): EffectRack {
    if (!effectRackInstance) {
        effectRackInstance = new EffectRack();
    }
    return effectRackInstance;
}
