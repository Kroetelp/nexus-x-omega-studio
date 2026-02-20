/**
 * NEXUS-X AI Mastering Engine
 * Professional automatic mastering with one click
 */

export class AIMastering {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;

    // Mastering presets
    private readonly PRESETS = {
        streaming: {
            name: 'Streaming (Spotify/Apple)',
            targetLUFS: -14,
            truePeak: -1,
            eqBoost: { low: 1, mid: 1, high: 1.1 },
            compression: { threshold: -18, ratio: 2.5, attack: 10, release: 100 },
            stereoWidth: 1.1,
            loudness: 1.0
        },
        club: {
            name: 'Club/Festival',
            targetLUFS: -8,
            truePeak: -0.5,
            eqBoost: { low: 1.3, mid: 1, high: 1.1 },
            compression: { threshold: -12, ratio: 4, attack: 5, release: 50 },
            stereoWidth: 1.2,
            loudness: 1.3
        },
        vinyl: {
            name: 'Vinyl Ready',
            targetLUFS: -16,
            truePeak: -2,
            eqBoost: { low: 0.9, mid: 1.1, high: 0.95 },
            compression: { threshold: -20, ratio: 2, attack: 20, release: 150 },
            stereoWidth: 0.9,
            loudness: 0.85
        },
        youtube: {
            name: 'YouTube',
            targetLUFS: -13,
            truePeak: -1,
            eqBoost: { low: 1.1, mid: 1, high: 1.15 },
            compression: { threshold: -15, ratio: 3, attack: 8, release: 80 },
            stereoWidth: 1.15,
            loudness: 1.1
        },
        demo: {
            name: 'Demo/Reference',
            targetLUFS: -18,
            truePeak: -3,
            eqBoost: { low: 1, mid: 1, high: 1 },
            compression: { threshold: -24, ratio: 1.5, attack: 30, release: 200 },
            stereoWidth: 1,
            loudness: 0.8
        }
    };

    async analyzeTrack(audioBuffer: AudioBuffer): Promise<AnalysisResult> {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;

        // Calculate RMS
        let sumSquares = 0;
        for (let i = 0; i < channelData.length; i++) {
            sumSquares += channelData[i] * channelData[i];
        }
        const rms = Math.sqrt(sumSquares / channelData.length);
        const rmsDb = 20 * Math.log10(rms);

        // Estimate LUFS (simplified)
        const estimatedLUFS = rmsDb - 10;

        // Peak detection
        let peak = 0;
        for (let i = 0; i < channelData.length; i++) {
            peak = Math.max(peak, Math.abs(channelData[i]));
        }
        const peakDb = 20 * Math.log10(peak);

        // Dynamic range
        const dynamicRange = peakDb - rmsDb;

        // Frequency analysis (simplified FFT simulation)
        const frequencyBalance = this.analyzeFrequencyBalance(channelData, sampleRate);

        return {
            duration: audioBuffer.duration,
            estimatedLUFS,
            peakDb,
            rmsDb,
            dynamicRange,
            frequencyBalance,
            issues: this.detectIssues(estimatedLUFS, peakDb, dynamicRange, frequencyBalance)
        };
    }

    private analyzeFrequencyBalance(samples: Float32Array, sampleRate: number): FrequencyBalance {
        // Simplified frequency analysis
        const blockSize = 2048;
        const numBlocks = Math.floor(samples.length / blockSize);

        let low = 0, mid = 0, high = 0;

        for (let b = 0; b < numBlocks; b++) {
            const start = b * blockSize;
            for (let i = 0; i < blockSize; i++) {
                const sample = samples[start + i];
                // Rough frequency estimation based on zero crossings
                const zc = this.countZeroCrossings(samples, start + i, Math.min(64, blockSize - i));
                if (zc < 10) low += Math.abs(sample);
                else if (zc < 30) mid += Math.abs(sample);
                else high += Math.abs(sample);
            }
        }

        const total = low + mid + high || 1;
        return {
            low: low / total,
            mid: mid / total,
            high: high / total
        };
    }

    private countZeroCrossings(samples: Float32Array, start: number, length: number): number {
        let crossings = 0;
        for (let i = 1; i < length && start + i < samples.length; i++) {
            if ((samples[start + i] >= 0) !== (samples[start + i - 1] >= 0)) {
                crossings++;
            }
        }
        return crossings;
    }

    private detectIssues(lufs: number, peak: number, dr: number, freq: FrequencyBalance): string[] {
        const issues: string[] = [];

        if (lufs > -10) issues.push('⚠️ Too loud - may cause clipping on streaming platforms');
        if (lufs < -20) issues.push('⚠️ Too quiet - consider boosting');
        if (peak > -0.5) issues.push('⚠️ Near 0dB peak - risk of digital clipping');
        if (dr < 4) issues.push('⚠️ Low dynamic range - sounds squashed');
        if (dr > 20) issues.push('⚠️ High dynamic range - may need compression');
        if (freq.low > 0.5) issues.push('⚠️ Heavy low frequencies - may cause issues on small speakers');
        if (freq.high > 0.5) issues.push('⚠️ Heavy high frequencies - may sound harsh');

        return issues;
    }

    applyMastering(preset: keyof typeof this.PRESETS, engine: any): MasteringSettings {
        const p = this.PRESETS[preset];

        console.log(`[AIMastering] Applying preset: ${p.name}`);

        // Apply to Tone.js engine
        if (engine) {
            // EQ
            if (engine.eq3) {
                engine.eq3.low.value = p.eqBoost.low;
                engine.eq3.mid.value = p.eqBoost.mid;
                engine.eq3.high.value = p.eqBoost.high;
            }

            // Compression
            if (engine.compressor) {
                engine.compressor.threshold.value = p.compression.threshold;
                engine.compressor.ratio.value = p.compression.ratio;
                engine.compressor.attack.value = p.compression.attack / 1000;
                engine.compressor.release.value = p.compression.release / 1000;
            }

            // Limiter
            if (engine.limiter) {
                engine.limiter.threshold.value = p.truePeak;
            }

            // Stereo width
            if (engine.stereoWidener) {
                engine.stereoWidener.width.value = p.stereoWidth;
            }

            // Master volume adjustment
            if (engine.masterGain) {
                engine.masterGain.gain.value = p.loudness;
            }
        }

        return {
            preset: p.name,
            settings: p,
            appliedAt: Date.now()
        };
    }

    getPresets() {
        return Object.entries(this.PRESETS).map(([key, value]) => ({
            id: key,
            name: value.name,
            targetLUFS: value.targetLUFS
        }));
    }
}

interface AnalysisResult {
    duration: number;
    estimatedLUFS: number;
    peakDb: number;
    rmsDb: number;
    dynamicRange: number;
    frequencyBalance: FrequencyBalance;
    issues: string[];
}

interface FrequencyBalance {
    low: number;
    mid: number;
    high: number;
}

interface MasteringSettings {
    preset: string;
    settings: typeof AIMastering.prototype.PRESETS.streaming;
    appliedAt: number;
}

// Global instance
let aiMasteringInstance: AIMastering | null = null;

export function createAIMastering(): AIMastering {
    if (!aiMasteringInstance) {
        aiMasteringInstance = new AIMastering();
    }
    return aiMasteringInstance;
}
