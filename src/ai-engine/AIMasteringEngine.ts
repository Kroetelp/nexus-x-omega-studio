/**
 * NEXUS-X AI Mastering Engine
 * Professional automatic mastering analysis and settings
 *
 * Pure logic class - analyzes audio and generates mastering settings
 * Does NOT directly apply to audio (that's the audio engine's job)
 */

import { loggers } from '../utils/logger';

const log = loggers.ai;

export type MasteringPreset = 'streaming' | 'club' | 'vinyl' | 'youtube' | 'demo';

export interface FrequencyBalance {
    low: number;   // 0.0 - 1.0
    mid: number;   // 0.0 - 1.0
    high: number;  // 0.0 - 1.0
}

export interface AnalysisResult {
    duration: number;
    estimatedLUFS: number;
    peakDb: number;
    rmsDb: number;
    dynamicRange: number;
    frequencyBalance: FrequencyBalance;
    issues: string[];
    recommendations: string[];
}

export interface CompressionSettings {
    threshold: number;  // dB
    ratio: number;      // ratio:1
    attack: number;     // ms
    release: number;    // ms
}

export interface EQSettings {
    low: number;    // gain multiplier
    mid: number;    // gain multiplier
    high: number;   // gain multiplier
}

export interface MasteringSettings {
    preset: string;
    targetLUFS: number;
    truePeak: number;
    eqBoost: EQSettings;
    compression: CompressionSettings;
    stereoWidth: number;
    loudness: number;
}

export interface MasteringPresetConfig {
    name: string;
    targetLUFS: number;
    truePeak: number;
    eqBoost: EQSettings;
    compression: CompressionSettings;
    stereoWidth: number;
    loudness: number;
}

type AnalysisListener = (result: AnalysisResult) => void;

export class AIMasteringEngine {
    private listeners: Set<AnalysisListener> = new Set();

    private readonly PRESETS: Record<MasteringPreset, MasteringPresetConfig> = {
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

    /**
     * Analyze an audio buffer and return detailed metrics
     */
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

        // Estimate LUFS (simplified - real LUFS requires K-weighting)
        const estimatedLUFS = this.calculateLUFS(channelData, sampleRate);

        // Peak detection
        let peak = 0;
        for (let i = 0; i < channelData.length; i++) {
            peak = Math.max(peak, Math.abs(channelData[i]));
        }
        const peakDb = 20 * Math.log10(peak);

        // Dynamic range
        const dynamicRange = peakDb - rmsDb;

        // Frequency analysis
        const frequencyBalance = this.analyzeFrequencyBalance(channelData, sampleRate);

        // Detect issues
        const issues = this.detectIssues(estimatedLUFS, peakDb, dynamicRange, frequencyBalance);

        // Generate recommendations
        const recommendations = this.generateRecommendations(estimatedLUFS, peakDb, dynamicRange, frequencyBalance);

        const result: AnalysisResult = {
            duration: audioBuffer.duration,
            estimatedLUFS,
            peakDb,
            rmsDb,
            dynamicRange,
            frequencyBalance,
            issues,
            recommendations
        };

        this.emit(result);
        return result;
    }

    /**
     * Get mastering settings for a preset
     */
    getMasteringSettings(preset: MasteringPreset): MasteringSettings {
        const config = this.PRESETS[preset];
        return {
            preset: config.name,
            targetLUFS: config.targetLUFS,
            truePeak: config.truePeak,
            eqBoost: { ...config.eqBoost },
            compression: { ...config.compression },
            stereoWidth: config.stereoWidth,
            loudness: config.loudness
        };
    }

    /**
     * Auto-select best preset based on analysis
     */
    autoSelectPreset(analysis: AnalysisResult): MasteringPreset {
        // If already in good range for streaming
        if (analysis.estimatedLUFS >= -16 && analysis.estimatedLUFS <= -12) {
            return 'streaming';
        }
        // High dynamic range - good for vinyl
        if (analysis.dynamicRange > 12) {
            return 'vinyl';
        }
        // Heavy low end - club
        if (analysis.frequencyBalance.low > 0.4) {
            return 'club';
        }
        // Default to streaming
        return 'streaming';
    }

    /**
     * Generate custom mastering settings based on analysis
     */
    generateCustomSettings(analysis: AnalysisResult, targetLUFS: number = -14): MasteringSettings {
        const neededGain = targetLUFS - analysis.estimatedLUFS;

        // Adjust EQ based on frequency balance
        const eqBoost: EQSettings = {
            low: analysis.frequencyBalance.low < 0.25 ? 1.15 : 1.0,
            mid: 1.0,
            high: analysis.frequencyBalance.high < 0.25 ? 1.1 : 1.0
        };

        // Adjust compression based on dynamic range
        const compression: CompressionSettings = analysis.dynamicRange > 10
            ? { threshold: -20, ratio: 2.5, attack: 15, release: 100 }
            : { threshold: -15, ratio: 3, attack: 8, release: 80 };

        return {
            preset: 'Custom',
            targetLUFS,
            truePeak: -1,
            eqBoost,
            compression,
            stereoWidth: 1.1,
            loudness: Math.pow(10, neededGain / 20)
        };
    }

    /**
     * Get available presets
     */
    getPresets(): { id: MasteringPreset; name: string; targetLUFS: number }[] {
        return Object.entries(this.PRESETS).map(([key, config]) => ({
            id: key as MasteringPreset,
            name: config.name,
            targetLUFS: config.targetLUFS
        }));
    }

    /**
     * Subscribe to analysis events
     */
    subscribe(listener: AnalysisListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    // ============== PRIVATE METHODS ==============

    private calculateLUFS(samples: Float32Array, sampleRate: number): number {
        // Simplified LUFS estimation
        // Real LUFS requires K-weighting filter and gating
        let sumSquares = 0;
        const blockSize = Math.floor(sampleRate * 0.4); // 400ms blocks
        const numBlocks = Math.floor(samples.length / blockSize);

        for (let b = 0; b < numBlocks; b++) {
            const start = b * blockSize;
            let blockSum = 0;
            for (let i = 0; i < blockSize; i++) {
                blockSum += samples[start + i] * samples[start + i];
            }
            const blockRms = Math.sqrt(blockSum / blockSize);
            // Apply gating (ignore very quiet blocks)
            if (blockRms > 0.01) {
                sumSquares += blockRms * blockRms;
            }
        }

        const rms = Math.sqrt(sumSquares / numBlocks);
        return 20 * Math.log10(rms) - 10; // Approximate LUFS offset
    }

    private analyzeFrequencyBalance(samples: Float32Array, sampleRate: number): FrequencyBalance {
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

        if (lufs > -10) issues.push('Too loud - may cause clipping on streaming platforms');
        if (lufs < -20) issues.push('Too quiet - consider boosting');
        if (peak > -0.5) issues.push('Near 0dB peak - risk of digital clipping');
        if (dr < 4) issues.push('Low dynamic range - sounds squashed');
        if (dr > 20) issues.push('High dynamic range - may need compression');
        if (freq.low > 0.5) issues.push('Heavy low frequencies - may cause issues on small speakers');
        if (freq.high > 0.5) issues.push('Heavy high frequencies - may sound harsh');

        return issues;
    }

    private generateRecommendations(lufs: number, peak: number, dr: number, freq: FrequencyBalance): string[] {
        const recommendations: string[] = [];

        if (lufs < -14) recommendations.push('Increase master gain by ' + Math.abs(-14 - lufs).toFixed(1) + ' dB');
        if (lufs > -10) recommendations.push('Reduce loudness or use limiter');
        if (dr > 15) recommendations.push('Consider adding compression for more punch');
        if (freq.low > freq.mid) recommendations.push('Boost mid frequencies for better presence');
        if (freq.high < 0.2) recommendations.push('Add high-frequency brightness with EQ');

        return recommendations;
    }

    private emit(result: AnalysisResult): void {
        this.listeners.forEach(listener => {
            try {
                listener(result);
            } catch (e) {
                log.error('AIMastering listener error:', e);
            }
        });
    }
}

// ============== GLOBAL INSTANCE ==============

let aiMasteringInstance: AIMasteringEngine | null = null;

export function createAIMasteringEngine(): AIMasteringEngine {
    if (!aiMasteringInstance) {
        aiMasteringInstance = new AIMasteringEngine();
    }
    return aiMasteringInstance;
}

export function getAIMasteringEngine(): AIMasteringEngine | null {
    return aiMasteringInstance;
}

export function resetAIMasteringEngine(): void {
    aiMasteringInstance = null;
}
