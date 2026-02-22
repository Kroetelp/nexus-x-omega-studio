/**
 * NEXUS-X Stem Exporter
 * Export individual tracks as separate files
 */

export class StemExporter {
    private audioContext: AudioContext | null = null;

    async exportStems(
        tracks: Map<string, AudioBuffer>,
        format: 'wav' | 'mp3' = 'wav'
    ): Promise<Blob[]> {
        const stems: Blob[] = [];

        for (const [name, buffer] of tracks) {
            const blob = await this.bufferToBlob(buffer, format, name);
            stems.push(blob);
        }

        return stems;
    }

    async exportAllInOne(
        tracks: Map<string, AudioBuffer>,
        format: 'wav' = 'wav'
    ): Promise<Blob> {
        if (tracks.size === 0) throw new Error('No tracks to export');

        // Get max length
        let maxLength = 0;
        tracks.forEach(buffer => {
            maxLength = Math.max(maxLength, buffer.length);
        });

        // Create stereo output buffer
        const sampleRate = 44100;
        const output = this.audioContext?.createBuffer(2, maxLength, sampleRate) ||
                       new OfflineAudioContext(2, maxLength, sampleRate).createBuffer(2, maxLength, sampleRate);

        // Mix all tracks
        tracks.forEach(buffer => {
            for (let channel = 0; channel < Math.min(buffer.numberOfChannels, 2); channel++) {
                const outputData = output.getChannelData(channel);
                const inputData = buffer.getChannelData(channel);

                for (let i = 0; i < inputData.length; i++) {
                    outputData[i] += inputData[i];
                }
            }
        });

        // Normalize
        this.normalizeBuffer(output);

        return this.bufferToWav(output);
    }

    private async bufferToBlob(buffer: AudioBuffer, format: string, name: string): Promise<Blob> {
        if (format === 'wav') {
            return this.bufferToWav(buffer);
        }
        // MP3 would require external library
        return this.bufferToWav(buffer);
    }

    private bufferToWav(buffer: AudioBuffer): Blob {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;

        const dataLength = buffer.length * blockAlign;
        const bufferLength = 44 + dataLength;

        const arrayBuffer = new ArrayBuffer(bufferLength);
        const view = new DataView(arrayBuffer);

        // WAV header
        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, bufferLength - 8, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(36, 'data');
        view.setUint32(40, dataLength, true);

        // Write audio data
        const offset = 44;
        const channelData: Float32Array[] = [];
        for (let ch = 0; ch < numChannels; ch++) {
            channelData.push(buffer.getChannelData(ch));
        }

        for (let i = 0; i < buffer.length; i++) {
            for (let ch = 0; ch < numChannels; ch++) {
                const sample = Math.max(-1, Math.min(1, channelData[ch][i]));
                const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(offset + (i * numChannels + ch) * 2, intSample, true);
            }
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    private normalizeBuffer(buffer: AudioBuffer): void {
        let maxSample = 0;

        for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < data.length; i++) {
                maxSample = Math.max(maxSample, Math.abs(data[i]));
            }
        }

        if (maxSample > 1) {
            const gain = 0.99 / maxSample;
            for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
                const data = buffer.getChannelData(ch);
                for (let i = 0; i < data.length; i++) {
                    data[i] *= gain;
                }
            }
        }
    }

    downloadBlob(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async recordTrack(engine: any, trackId: number, duration: number): Promise<AudioBuffer> {
        // This would record a single track output
        // Simplified implementation
        const sampleRate = 44100;
        const length = sampleRate * duration;
        const buffer = new OfflineAudioContext(2, length, sampleRate).createBuffer(2, length, sampleRate);
        return buffer;
    }
}

// Global
let stemExporterInstance: StemExporter | null = null;

export function createStemExporter(): StemExporter {
    if (!stemExporterInstance) {
        stemExporterInstance = new StemExporter();
    }
    return stemExporterInstance;
}
