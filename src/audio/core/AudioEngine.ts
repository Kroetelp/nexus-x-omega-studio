/**
 * NEXUS-X Audio Engine v5.0 - Slim Edition
 * Modular architecture with Instrument Registry
 *
 * This engine ONLY handles:
 * - AudioContext creation and management
 * - AudioWorklet initialization
 * - Master routing (gain, destination)
 * - WASM loading
 *
 * All instrument logic is delegated to InstrumentRegistry
 */

import * as Tone from 'tone';
import { InstrumentRegistry, instrumentRegistry } from './InstrumentRegistry';
import { ScaleManager, scaleManager } from './ScaleManager';
import { MessageType, WorkletMessage, MeterData, KitType, Channel, SynthType } from './types';
import { loggers } from '../../utils/logger';

const log = loggers.audio;

export class AudioEngine {
    // ============================================================
    // SINGLETON
    // ============================================================
    private static instance: AudioEngine;

    static getInstance(): AudioEngine {
        if (!AudioEngine.instance) {
            AudioEngine.instance = new AudioEngine();
        }
        return AudioEngine.instance;
    }

    // ============================================================
    // CORE AUDIO
    // ============================================================
    private context: AudioContext | null = null;
    private worklet: AudioWorkletNode | null = null;
    private masterGain: GainNode | null = null;
    private isInitialized: boolean = false;

    // ============================================================
    // REGISTRIES
    // ============================================================
    public readonly registry: InstrumentRegistry;
    public readonly scales: ScaleManager;

    // ============================================================
    // LEGACY SUPPORT (Tone.js - will be phased out)
    // ============================================================
    private toneInitialized: boolean = false;
    private channels: Channel[] = [];
    private currentKit: KitType = 'NEON';

    // Tone.js nodes (for backwards compatibility)
    private drumBus!: Tone.Volume;
    private synthBus!: Tone.Volume;
    private masterVolume!: Tone.Volume;
    private limiter!: Tone.Limiter;
    private compressor!: Tone.Compressor;
    private reverb!: Tone.Reverb;
    private delay!: Tone.PingPongDelay;
    private filter!: Tone.Filter;
    private analyser!: Tone.Analyser;
    private waveform!: Tone.Waveform;
    private streamDest!: MediaStreamAudioDestinationNode;

    // TIER 2/3 Effects
    private presenceEQ!: Tone.Filter;
    private reverbPreDelay!: Tone.Delay;
    private stereoWidener!: Tone.StereoWidener;

    // ============================================================
    // CONSTRUCTOR
    // ============================================================
    private constructor() {
        this.registry = instrumentRegistry;
        this.scales = scaleManager;
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    /**
     * Initialize the audio engine
     * Must be called after user interaction (browser autoplay policy)
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Initialize Tone.js (for legacy support)
            await Tone.start();
            this.toneInitialized = true;

            // Get native AudioContext
            const rawCtx = Tone.context.rawContext || Tone.context;
            // Cast to AudioContext (we know it's not OfflineAudioContext at runtime)
            this.context = rawCtx as AudioContext;

            // Initialize Tone.js effects chain
            this.initializeToneEffects();

            // Setup AudioWorklet
            await this.setupWorklet();

            this.isInitialized = true;
            log.debug(' Initialized successfully');

        } catch (error) {
            log.error(' Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Initialize Tone.js effects chain (legacy support)
     */
    private initializeToneEffects(): void {
        // Buses
        this.drumBus = new Tone.Volume(0);
        this.synthBus = new Tone.Volume(0);
        this.masterVolume = new Tone.Volume(0).connect(Tone.Destination);

        // Master effects
        this.compressor = new Tone.Compressor({
            threshold: -18,
            ratio: 3,
            attack: 0.003,
            release: 0.15,
            knee: 6
        });

        this.limiter = new Tone.Limiter(-1.0);
        this.streamDest = Tone.context.createMediaStreamDestination();

        // Spatial
        this.reverb = new Tone.Reverb({ decay: 5, wet: 0.3 });
        this.delay = new Tone.PingPongDelay("8n", 0.4);
        this.delay.wet.value = 0;
        this.filter = new Tone.Filter(20000, "lowpass", -24);

        // TIER 2 Polish
        this.presenceEQ = new Tone.Filter({
            frequency: 10000,
            type: "highshelf",
            Q: 1,
            gain: 1.5
        });
        this.reverbPreDelay = new Tone.Delay(0.02);
        this.stereoWidener = new Tone.StereoWidener(0);

        // Analysis
        this.analyser = new Tone.Analyser("fft", 64);
        this.waveform = new Tone.Waveform(512);

        // Connect chain
        this.drumBus.connect(this.filter);
        this.synthBus.connect(this.filter);
        this.reverbPreDelay.connect(this.reverb);
        this.reverb.connect(this.filter);

        this.filter.chain(
            this.presenceEQ,
            this.stereoWidener,
            this.compressor,
            this.limiter
        );

        this.limiter.connect(this.masterVolume);
        this.limiter.connect(this.streamDest);
        this.limiter.connect(this.analyser);
        this.limiter.connect(this.waveform);
    }

    /**
     * Setup AudioWorklet for WASM DSP
     */
    private async setupWorklet(): Promise<void> {
        try {
            // Detect if running in Tauri (standalone) or browser
            const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
            const basePath = isTauri ? '.' : '';

            // Load processor with correct path
            const processorPath = `${basePath}/processor.js`;
            log.debug(' Loading worklet from:', processorPath);

            await Tone.context.addAudioWorkletModule(processorPath);
            log.debug(' AudioWorklet module loaded');

            // Get the underlying AudioContext from Tone.js
            // In Tone.js v14, we need to access the native context
            const toneContext = Tone.context as any;
            let audioContext: AudioContext;

            // Try different ways to get the native AudioContext
            if (toneContext._context) {
                audioContext = toneContext._context;
            } else if (toneContext.rawContext && toneContext.rawContext instanceof AudioContext) {
                audioContext = toneContext.rawContext;
            } else if (toneContext.context instanceof AudioContext) {
                audioContext = toneContext.context;
            } else {
                // Last resort: create our own context
                log.warn(' Could not get Tone.js context, creating new one');
                audioContext = new AudioContext();
            }

            // Create worklet node
            this.worklet = new AudioWorkletNode(audioContext, 'nexus-dsp-engine');

            // Connect registry to worklet
            this.registry.setMessagePort(this.worklet.port);

            // Handle messages from worklet
            this.worklet.port.onmessage = (e) => this.handleWorkletMessage(e.data);

            // Try to load WASM
            await this.loadWasm();

            // Insert into chain (after compressor, before limiter)
            this.compressor.disconnect();
            this.compressor.connect(this.worklet);
            Tone.connect(this.worklet, this.limiter);

            log.debug(' AudioWorklet connected');

        } catch (error) {
            log.warn(' AudioWorklet setup failed, using fallback:', error);
            // Fallback connection
            this.compressor.connect(this.limiter);
        }
    }

    /**
     * Load WASM module
     */
    private async loadWasm(): Promise<void> {
        try {
            // Detect if running in Tauri (standalone) or browser
            const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
            const basePath = isTauri ? '.' : '';
            const wasmPath = `${basePath}/nexus-dsp.wasm`;

            log.debug(' Loading WASM from:', wasmPath);
            const response = await fetch(wasmPath);
            if (!response.ok) {
                log.debug(' WASM not available, using JS fallback');
                return;
            }

            const wasmBytes = await response.arrayBuffer();
            const wasmModule = await WebAssembly.compile(wasmBytes);

            // Send to worklet
            if (this.worklet) {
                this.worklet.port.postMessage({
                    type: MessageType.LOAD_WASM,
                    wasmModule,
                });
            }

            log.debug(' WASM loaded');

        } catch (error) {
            log.warn(' WASM load failed:', error);
        }
    }

    /**
     * Handle messages from AudioWorklet
     */
    private handleWorkletMessage(msg: WorkletMessage): void {
        switch (msg.type) {
            case MessageType.METER_UPDATE:
                // Emit meter data for UI
                this.emit('meter', { peakL: msg.data1, peakR: msg.data2 });
                break;

            case MessageType.WASM_READY:
                log.debug(' WASM engine ready');
                this.emit('wasmReady', true);
                break;

            case MessageType.INSTRUMENT_READY:
                log.debug(' Instrument', msg.instrumentId, 'ready');
                break;
        }
    }

    // Simple event emitter
    private listeners: Map<string, Function[]> = new Map();

    on(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    private emit(event: string, data?: any): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(cb => cb(data));
        }
    }

    // ============================================================
    // CONTEXT ACCESS
    // ============================================================

    getContext(): AudioContext {
        if (!this.context) {
            throw new Error('[AudioEngine] Not initialized');
        }
        return this.context;
    }

    isReady(): boolean {
        return this.isInitialized;
    }

    // ============================================================
    // MASTER CONTROLS
    // ============================================================

    setMasterVolume(value: number): void {
        const clamped = Math.max(0, Math.min(1, value));
        if (this.masterGain) {
            this.masterGain.gain.value = clamped;
        }
        if (this.masterVolume) {
            this.masterVolume.volume.value = Tone.gainToDb(clamped);
        }
    }

    // ============================================================
    // ANALYSIS
    // ============================================================

    getAnalyserData(): Float32Array {
        return this.analyser?.getValue() as Float32Array || new Float32Array(64);
    }

    getWaveformData(): Float32Array {
        return this.waveform?.getValue() as Float32Array || new Float32Array(512);
    }

    // ============================================================
    // LEGACY SUPPORT (will be deprecated)
    // ============================================================

    /**
     * Load a kit - changes synth parameters based on kit type
     */
    async loadKit(kitName: KitType, isInit = false): Promise<void> {
        this.currentKit = kitName;
        log.debug(` Loading kit: ${kitName}`);

        // Kit-specific sound design parameters
        const kitConfigs: Record<KitType, {
            filterFreq: number;
            filterType: BiquadFilterType;
            reverbWet: number;
            delayWet: number;
            compressorThreshold: number;
            presence: number;
        }> = {
            'NEON': {
                filterFreq: 18000,
                filterType: 'lowpass',
                reverbWet: 0.25,
                delayWet: 0.1,
                compressorThreshold: -16,
                presence: 2
            },
            'GLITCH': {
                filterFreq: 12000,
                filterType: 'bandpass',
                reverbWet: 0.15,
                delayWet: 0.3,
                compressorThreshold: -12,
                presence: 1
            },
            'ACID': {
                filterFreq: 3000,
                filterType: 'lowpass',
                reverbWet: 0.2,
                delayWet: 0.25,
                compressorThreshold: -14,
                presence: 3
            },
            'VINYL': {
                filterFreq: 8000,
                filterType: 'lowpass',
                reverbWet: 0.35,
                delayWet: 0.15,
                compressorThreshold: -18,
                presence: -1
            },
            'CLUB': {
                filterFreq: 20000,
                filterType: 'lowpass',
                reverbWet: 0.2,
                delayWet: 0.1,
                compressorThreshold: -14,
                presence: 2
            },
            'CHIPTUNE': {
                filterFreq: 6000,
                filterType: 'lowpass',
                reverbWet: 0.1,
                delayWet: 0.05,
                compressorThreshold: -10,
                presence: 4
            },
            'CINEMATIC': {
                filterFreq: 16000,
                filterType: 'lowpass',
                reverbWet: 0.45,
                delayWet: 0.2,
                compressorThreshold: -20,
                presence: 1
            },
            'INDUSTRIAL': {
                filterFreq: 5000,
                filterType: 'lowpass',
                reverbWet: 0.3,
                delayWet: 0.15,
                compressorThreshold: -8,
                presence: 5
            },
            'ETHEREAL': {
                filterFreq: 14000,
                filterType: 'lowpass',
                reverbWet: 0.6,
                delayWet: 0.35,
                compressorThreshold: -22,
                presence: 0
            },
            'DUNGEON': {
                filterFreq: 4000,
                filterType: 'lowpass',
                reverbWet: 0.5,
                delayWet: 0.25,
                compressorThreshold: -16,
                presence: -2
            },
            'PHONK': {
                filterFreq: 6000,
                filterType: 'lowpass',
                reverbWet: 0.35,
                delayWet: 0.2,
                compressorThreshold: -10,
                presence: 4
            }
        };

        const config = kitConfigs[kitName] || kitConfigs['NEON'];

        // Apply to effects chain
        if (this.filter) {
            this.filter.frequency.value = config.filterFreq;
            this.filter.type = config.filterType;
        }
        if (this.reverb) {
            this.reverb.wet.value = config.reverbWet;
        }
        if (this.delay) {
            this.delay.wet.value = config.delayWet;
        }
        if (this.compressor) {
            this.compressor.threshold.value = config.compressorThreshold;
        }
        if (this.presenceEQ) {
            this.presenceEQ.gain.value = config.presence;
        }

        log.debug(` Kit ${kitName} applied: filter=${config.filterFreq}Hz, reverb=${config.reverbWet}`);

        // Emit event for UI
        this.emit('kitLoaded', kitName);
    }

    /**
     * Get current kit
     */
    getCurrentKit(): KitType {
        return this.currentKit;
    }

    /**
     * Get channels - returns track channels from NexusUISetup if available
     */
    getChannels(): any[] {
        // Try to get track channels from NexusUISetup
        const win = (globalThis as any).window;
        if (win && typeof win.getTrackChannels === 'function') {
            return win.getTrackChannels();
        }
        // Fallback to empty legacy array
        return this.channels;
    }

    /**
     * Get current scale
     */
    getCurrentScale(): string[] {
        return this.scales.getCurrentScale();
    }

    /**
     * Set scale by name
     */
    setScale(name: string): void {
        this.scales.setScale(name);
    }

    /**
     * Get effects (for external access)
     */
    getEffects() {
        return {
            eq3: null, // Legacy
            drumBus: this.drumBus,
            synthBus: this.synthBus,
            reverb: this.reverb,
            delay: this.delay,
            compressor: this.compressor,
            limiter: this.limiter,
            filter: this.filter,
            presenceEQ: this.presenceEQ,
            reverbPreDelay: this.reverbPreDelay,
            stereoWidener: this.stereoWidener,
            masterVolume: this.masterVolume,
            analyser: this.analyser,
            waveform: this.waveform,
        };
    }

    /**
     * Get stream destination for recording
     */
    getStreamDestination(): MediaStreamAudioDestinationNode | null {
        return this.streamDest;
    }

    // ============================================================
    // DISPOSAL
    // ============================================================

    dispose(): void {
        // Clear registry
        this.registry.clearAll();

        // Dispose Tone.js nodes
        const nodes = [
            this.drumBus, this.synthBus, this.masterVolume,
            this.compressor, this.limiter, this.reverb, this.delay,
            this.filter, this.analyser, this.waveform,
            this.presenceEQ, this.reverbPreDelay, this.stereoWidener,
        ];

        nodes.forEach(node => {
            try {
                if (node && 'dispose' in node) {
                    node.disconnect();
                    (node as any).dispose();
                }
            } catch (error) {
                log.error(' Dispose error:', error);
            }
        });

        // Disconnect worklet
        if (this.worklet) {
            this.worklet.disconnect();
            this.worklet = null;
        }

        this.isInitialized = false;
        log.debug(' Disposed');
    }
}

// Global export
declare global {
    interface Window {
        audioEngine: AudioEngine;
    }
}

export const audioEngine = AudioEngine.getInstance();
window.audioEngine = audioEngine;
