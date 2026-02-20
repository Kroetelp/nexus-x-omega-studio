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
            this.context = Tone.context.rawContext || Tone.context.rawContext;

            // Initialize Tone.js effects chain
            this.initializeToneEffects();

            // Setup AudioWorklet
            await this.setupWorklet();

            this.isInitialized = true;
            console.log('[AudioEngine] Initialized successfully');

        } catch (error) {
            console.error('[AudioEngine] Initialization failed:', error);
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
            // Load processor
            await Tone.context.addAudioWorkletModule('/processor.js');
            console.log('[AudioEngine] AudioWorklet module loaded');

            // Create worklet node
            const nativeCtx = Tone.context.rawContext || Tone.context;
            this.worklet = new AudioWorkletNode(nativeCtx, 'nexus-bitcrusher');

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

            console.log('[AudioEngine] AudioWorklet connected');

        } catch (error) {
            console.warn('[AudioEngine] AudioWorklet setup failed, using fallback:', error);
            // Fallback connection
            this.compressor.connect(this.limiter);
        }
    }

    /**
     * Load WASM module
     */
    private async loadWasm(): Promise<void> {
        try {
            const response = await fetch('/nexus-dsp.wasm');
            if (!response.ok) {
                console.log('[AudioEngine] WASM not available, using JS fallback');
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

            console.log('[AudioEngine] WASM loaded');

        } catch (error) {
            console.warn('[AudioEngine] WASM load failed:', error);
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
                console.log('[AudioEngine] WASM engine ready');
                this.emit('wasmReady', true);
                break;

            case MessageType.INSTRUMENT_READY:
                console.log(`[AudioEngine] Instrument ${msg.instrumentId} ready`);
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
     * Load a kit (legacy Tone.js method)
     * @deprecated Use registry.createDefaultSetup() instead
     */
    async loadKit(kitName: KitType, isInit = false): Promise<void> {
        // Legacy implementation - kept for backwards compatibility
        this.currentKit = kitName;
        console.log(`[AudioEngine] Loaded kit: ${kitName} (legacy mode)`);
    }

    /**
     * Get channels (legacy)
     * @deprecated Use registry.getInstrumentsByType() instead
     */
    getChannels(): Channel[] {
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
            reverb: this.reverb,
            delay: this.delay,
            compressor: this.compressor,
            limiter: this.limiter,
            filter: this.filter,
            presenceEQ: this.presenceEQ,
            reverbPreDelay: this.reverbPreDelay,
            stereoWidener: this.stereoWidener,
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
                console.error('[AudioEngine] Dispose error:', error);
            }
        });

        // Disconnect worklet
        if (this.worklet) {
            this.worklet.disconnect();
            this.worklet = null;
        }

        this.isInitialized = false;
        console.log('[AudioEngine] Disposed');
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
