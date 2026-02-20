/**
 * NEXUS-X Spectral Freeze
 * Freeze audio spectrum in real-time
 */

export class SpectralFreeze {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private frozenSpectrum: Float32Array | null = null;
    private isFrozen: boolean = false;
    private oscillators: OscillatorNode[] = [];
    private gains: GainNode[] = [];

    async initialize(audioContext?: AudioContext): Promise<void> {
        this.audioContext = audioContext || new AudioContext();

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
    }

    connectSource(source: AudioNode): void {
        if (this.analyser && source) {
            source.connect(this.analyser);
        }
    }

    freeze(): void {
        if (!this.analyser || !this.audioContext) return;

        const dataArray = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatFrequencyData(dataArray);
        this.frozenSpectrum = dataArray;
        this.isFrozen = true;

        // Create oscillators for each frequency bin (simplified)
        this.synthesizeFreeze();
    }

    unfreeze(): void {
        this.isFrozen = false;
        this.stopOscillators();
        this.frozenSpectrum = null;
    }

    toggle(): void {
        if (this.isFrozen) {
            this.unfreeze();
        } else {
            this.freeze();
        }
    }

    private synthesizeFreeze(): void {
        if (!this.audioContext || !this.frozenSpectrum) return;

        this.stopOscillators();

        const numBins = 32; // Reduced for performance
        const binSize = Math.floor(this.frozenSpectrum.length / numBins);
        const sampleRate = this.audioContext.sampleRate;

        for (let i = 0; i < numBins; i++) {
            const startBin = i * binSize;
            let sum = 0;

            for (let j = 0; j < binSize; j++) {
                const db = this.frozenSpectrum[startBin + j];
                sum += Math.pow(10, db / 20);
            }

            const amplitude = sum / binSize;

            if (amplitude > 0.01) {
                const frequency = (startBin * sampleRate) / (this.analyser!.fftSize);

                const osc = this.audioContext.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = frequency;

                const gain = this.audioContext.createGain();
                gain.gain.value = amplitude * 0.1;

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.start();

                this.oscillators.push(osc);
                this.gains.push(gain);
            }
        }
    }

    private stopOscillators(): void {
        this.oscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {}
        });

        this.oscillators = [];
        this.gains = [];
    }

    getFrozenStatus(): boolean {
        return this.isFrozen;
    }

    getSpectrumData(): Float32Array | null {
        if (!this.analyser) return null;

        const data = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatFrequencyData(data);
        return data;
    }
}

// Global
let spectralFreezeInstance: SpectralFreeze | null = null;

export function createSpectralFreeze(): SpectralFreeze {
    if (!spectralFreezeInstance) {
        spectralFreezeInstance = new SpectralFreeze();
    }
    return spectralFreezeInstance;
}
