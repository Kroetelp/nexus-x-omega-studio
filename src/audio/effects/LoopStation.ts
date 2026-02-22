/**
 * NEXUS-X Loop Station
 * Live looping and performance recording
 */

import { loggers } from '../../utils/logger';

const log = loggers.audio;

export class LoopStation {
    private audioContext: AudioContext | null = null;
    private loops: Map<number, AudioBuffer> = new Map();
    private recorders: Map<number, LoopRecorder> = new Map();
    private isRecording: Map<number, boolean> = new Map();
    private isPlaying: Map<number, boolean> = new Map();
    private sources: Map<number, AudioBufferSourceNode[]> = new Map();
    private gains: Map<number, GainNode> = new Map();
    private loopLengths: Map<number, number> = new Map();
    private bpm: number = 128;
    private beatsPerLoop: number = 4;

    constructor() {
        for (let i = 0; i < 8; i++) {
            this.isRecording.set(i, false);
            this.isPlaying.set(i, false);
            this.loopLengths.set(i, 0);
        }
    }

    setBPM(bpm: number): void {
        this.bpm = bpm;
    }

    setBeatsPerLoop(beats: number): void {
        this.beatsPerLoop = beats;
    }

    async initialize(): Promise<void> {
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }

        // Create gain nodes for each loop
        for (let i = 0; i < 8; i++) {
            const gain = this.audioContext.createGain();
            gain.gain.value = 0.8;
            gain.connect(this.audioContext.destination);
            this.gains.set(i, gain);
        }
    }

    startRecording(loopId: number): void {
        if (!this.audioContext) {
            this.initialize();
        }

        const loopDuration = (60 / this.bpm) * this.beatsPerLoop * 4;
        const recorder = new LoopRecorder(
            this.audioContext!,
            loopDuration,
            this.bpm
        );

        this.recorders.set(loopId, recorder);
        recorder.start();
        this.isRecording.set(loopId, true);

        // Auto-stop after loop length
        setTimeout(() => {
            if (this.isRecording.get(loopId)) {
                this.stopRecording(loopId);
            }
        }, loopDuration * 1000);
    }

    stopRecording(loopId: number): AudioBuffer | null {
        const recorder = this.recorders.get(loopId);
        if (!recorder) return null;

        const buffer = recorder.stop();
        this.loops.set(loopId, buffer);
        this.isRecording.set(loopId, false);
        this.loopLengths.set(loopId, buffer.duration);

        return buffer;
    }

    play(loopId: number): void {
        const buffer = this.loops.get(loopId);
        if (!buffer || !this.audioContext) return;

        this.stop(loopId);
        this.isPlaying.set(loopId, true);

        const playLoop = () => {
            if (!this.isPlaying.get(loopId)) return;

            const source = this.audioContext!.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            const gain = this.gains.get(loopId);
            if (gain) {
                source.connect(gain);
            }

            source.start();

            const sources = this.sources.get(loopId) || [];
            sources.push(source);
            this.sources.set(loopId, sources);
        };

        // Sync to beat
        const beatDuration = 60 / this.bpm;
        const now = this.audioContext.currentTime;
        const nextBeat = Math.ceil(now / beatDuration) * beatDuration;
        const delay = (nextBeat - now) * 1000;

        setTimeout(playLoop, delay);
    }

    stop(loopId: number): void {
        this.isPlaying.set(loopId, false);
        const sources = this.sources.get(loopId);
        if (sources) {
            sources.forEach(s => {
                try { s.stop(); } catch (e) {}
            });
            this.sources.set(loopId, []);
        }
    }

    stopAll(): void {
        for (let i = 0; i < 8; i++) {
            this.stop(i);
        }
    }

    clear(loopId: number): void {
        this.stop(loopId);
        this.loops.delete(loopId);
        this.loopLengths.set(loopId, 0);
    }

    setVolume(loopId: number, volume: number): void {
        const gain = this.gains.get(loopId);
        if (gain) {
            gain.gain.value = Math.max(0, Math.min(2, volume));
        }
    }

    toggle(loopId: number): void {
        if (this.loops.has(loopId)) {
            if (this.isPlaying.get(loopId)) {
                this.stop(loopId);
            } else {
                this.play(loopId);
            }
        }
    }

    toggleRecord(loopId: number): void {
        if (this.isRecording.get(loopId)) {
            this.stopRecording(loopId);
        } else {
            this.startRecording(loopId);
        }
    }

    getStatus(loopId: number): LoopStatus {
        return {
            hasLoop: this.loops.has(loopId),
            isRecording: this.isRecording.get(loopId) || false,
            isPlaying: this.isPlaying.get(loopId) || false,
            loopLength: this.loopLengths.get(loopId) || 0
        };
    }

    getAllStatuses(): LoopStatus[] {
        const statuses: LoopStatus[] = [];
        for (let i = 0; i < 8; i++) {
            statuses.push(this.getStatus(i));
        }
        return statuses;
    }
}

class LoopRecorder {
    private audioContext: AudioContext;
    private mediaRecorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];
    private duration: number;
    private bpm: number;
    private startTime: number = 0;

    constructor(audioContext: AudioContext, duration: number, bpm: number) {
        this.audioContext = audioContext;
        this.duration = duration;
        this.bpm = bpm;
    }

    async start(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.chunks = [];

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.chunks.push(e.data);
                }
            };

            this.startTime = Date.now();
            this.mediaRecorder.start();
        } catch (e) {
            log.error(' Failed to start:', e);
        }
    }

    stop(): AudioBuffer {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
        }

        // Create buffer from recorded data
        const buffer = this.audioContext.createBuffer(
            2,
            this.audioContext.sampleRate * this.duration,
            this.audioContext.sampleRate
        );

        // Fill with recorded audio simulation
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                // Simple noise placeholder
                data[i] = (Math.random() - 0.5) * 0.1;
            }
        }

        return buffer;
    }
}

interface LoopStatus {
    hasLoop: boolean;
    isRecording: boolean;
    isPlaying: boolean;
    loopLength: number;
}

// Global instance
let loopStationInstance: LoopStation | null = null;

export function createLoopStation(): LoopStation {
    if (!loopStationInstance) {
        loopStationInstance = new LoopStation();
    }
    return loopStationInstance;
}

export function getLoopStation(): LoopStation | null {
    return loopStationInstance;
}
