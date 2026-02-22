/**
 * NEXUS-X Store-to-AudioEngine Bridge
 *
 * Connects the central Store to the AudioEngine.
 * This is the ONLY place where Store changes affect Audio.
 *
 * ARCHITECTURE:
 * [UI] -> dispatch(action) -> [Store] -> [Bridge] -> [Tone.js / Rust]
 *
 * The AudioEngine NEVER reads from the Store directly.
 * The UI NEVER calls AudioEngine methods directly.
 */

import { appStore, ActionType, Action, AppState } from './AppStore';
import { audioEngine } from '../audio/core/AudioEngine';
import { loggers } from '../utils/logger';
import * as Tone from 'tone';

const log = loggers.audio;

// Type for AudioEngine with optional methods
interface AudioEngineWithMethods {
    setScale?: (scale: string) => void;
    setReverb?: (value: number) => void;
    setDelay?: (value: number) => void;
    setDistortion?: (value: number) => void;
    setFilter?: (value: number) => void;
    setBitcrush?: (value: number) => void;
    setMasterVolume?: (value: number) => void;
    setTrackVolume?: (index: number, value: number) => void;
    setTrackPan?: (index: number, value: number) => void;
    setTrackMute?: (index: number, value: boolean) => void;
    setTrackSolo?: (index: number, value: boolean) => void;
}

// Cast audioEngine to interface
const engine = audioEngine as unknown as AudioEngineWithMethods;

// Audio Backend Type
type AudioBackend = 'tonejs' | 'rust';

class StoreBridge {
    private unsubscribe: (() => void) | null = null;
    private isInitialized = false;
    private backend: AudioBackend = 'tonejs'; // Default to Tone.js

    /**
     * Set the audio backend
     */
    setBackend(backend: AudioBackend): void {
        this.backend = backend;
        log.info(`[BRIDGE] Audio backend set to: ${backend}`);
    }

    /**
     * Get current backend
     */
    getBackend(): AudioBackend {
        return this.backend;
    }

    /**
     * Initialize the bridge - subscribe to store changes
     */
    initialize(): void {
        if (this.isInitialized) return;

        this.unsubscribe = appStore.subscribe((state, action) => {
            this.handleStateChange(state, action);
        });

        this.isInitialized = true;
        log.info('[BRIDGE] Store-to-AudioEngine bridge initialized');
    }

    /**
     * Handle state changes and sync to AudioEngine
     */
    private handleStateChange(state: AppState, action: Action): void {
        // Route based on action type
        switch (action.type) {
            // Transport
            case 'TRANSPORT_PLAY':
                this.syncTransportPlay(state);
                break;

            case 'TRANSPORT_STOP':
                this.syncTransportStop(state);
                break;

            case 'TRANSPORT_SET_BPM':
                this.syncBPM(state);
                break;

            case 'TRANSPORT_SET_SWING':
                this.syncSwing(state);
                break;

            // Mixer
            case 'MIXER_SET_VOLUME':
                this.syncTrackVolume(state, action);
                break;

            case 'MIXER_SET_PAN':
                this.syncTrackPan(state, action);
                break;

            case 'MIXER_MUTE':
                this.syncTrackMute(state, action);
                break;

            case 'MIXER_SOLO':
                this.syncTrackSolo(state, action);
                break;

            case 'MIXER_MASTER_VOLUME':
                this.syncMasterVolume(state);
                break;

            // Effects
            case 'EFFECT_SET_REVERB':
            case 'EFFECT_SET_DELAY':
            case 'EFFECT_SET_DISTORTION':
            case 'EFFECT_SET_FILTER':
            case 'EFFECT_SET_BITCRUSH':
                this.syncEffects(state);
                break;

            // Music
            case 'MUSIC_SET_SCALE':
                this.syncScale(state);
                break;

            // Sequencer pattern changes are handled by the Sequencer component
            // not directly by the AudioEngine
        }
    }

    // ============================================================
    // TRANSPORT SYNC
    // ============================================================

    private syncTransportPlay(state: AppState): void {
        if (state.transport.isPlaying) {
            Tone.Transport.start();
            log.debug('[BRIDGE] Transport started');
        }
    }

    private syncTransportStop(state: AppState): void {
        if (!state.transport.isPlaying) {
            Tone.Transport.stop();
            log.debug('[BRIDGE] Transport stopped');
        }
    }

    private syncBPM(state: AppState): void {
        Tone.Transport.bpm.value = state.transport.bpm;
        log.debug(`[BRIDGE] BPM set to ${state.transport.bpm}`);
    }

    private syncSwing(state: AppState): void {
        // Tone.js swing is 0-1, where 1 is maximum swing
        const swingAmount = state.transport.swing / 100; // Convert from percentage
        Tone.Transport.swing = swingAmount;
        Tone.Transport.swingSubdivision = '16n';
        log.debug(`[BRIDGE] Swing set to ${swingAmount}`);
    }

    // ============================================================
    // MIXER SYNC
    // ============================================================

    private syncTrackVolume(state: AppState, action: Action): void {
        const payload = action.payload as { trackIndex: number; volume: number };
        const track = state.mixer.tracks[payload.trackIndex];
        if (track && engine.setTrackVolume) {
            engine.setTrackVolume(payload.trackIndex, track.volume);
            log.debug(`[BRIDGE] Track ${payload.trackIndex} volume: ${track.volume}`);
        }
    }

    private syncTrackPan(state: AppState, action: Action): void {
        const payload = action.payload as { trackIndex: number; pan: number };
        const track = state.mixer.tracks[payload.trackIndex];
        if (track && engine.setTrackPan) {
            engine.setTrackPan(payload.trackIndex, track.pan);
            log.debug(`[BRIDGE] Track ${payload.trackIndex} pan: ${track.pan}`);
        }
    }

    private syncTrackMute(state: AppState, action: Action): void {
        const payload = action.payload as { trackIndex: number; muted: boolean };
        if (engine.setTrackMute) {
            engine.setTrackMute(payload.trackIndex, payload.muted);
            log.debug(`[BRIDGE] Track ${payload.trackIndex} muted: ${payload.muted}`);
        }
    }

    private syncTrackSolo(state: AppState, action: Action): void {
        const payload = action.payload as { trackIndex: number; soloed: boolean };
        if (engine.setTrackSolo) {
            engine.setTrackSolo(payload.trackIndex, payload.soloed);
        }

        // Handle solo logic - mute all other tracks if any track is soloed
        const anySoloed = state.mixer.tracks.some(t => t.soloed);
        const muteFn = engine.setTrackMute;
        if (anySoloed && muteFn) {
            state.mixer.tracks.forEach((track, index) => {
                const shouldMute = !track.soloed;
                muteFn(index, shouldMute);
            });
        }
        log.debug(`[BRIDGE] Track ${payload.trackIndex} soloed: ${payload.soloed}`);
    }

    private syncMasterVolume(state: AppState): void {
        if (engine.setMasterVolume) {
            engine.setMasterVolume(state.mixer.masterVolume);
            log.debug(`[BRIDGE] Master volume: ${state.mixer.masterVolume}`);
        }
    }

    // ============================================================
    // EFFECTS SYNC
    // ============================================================

    private syncEffects(state: AppState): void {
        const { reverb, delay, distortion, filter, bitcrush } = state.effects;

        // Update effects through AudioEngine if methods exist
        if (engine.setReverb) engine.setReverb(reverb);
        if (engine.setDelay) engine.setDelay(delay);
        if (engine.setDistortion) engine.setDistortion(distortion);
        if (engine.setFilter) engine.setFilter(filter);
        if (engine.setBitcrush) engine.setBitcrush(bitcrush);

        log.debug('[BRIDGE] Effects synced', state.effects);
    }

    // ============================================================
    // MUSIC SYNC
    // ============================================================

    private syncScale(state: AppState): void {
        if (engine.setScale) {
            engine.setScale(state.music.scale);
            log.debug(`[BRIDGE] Scale set to ${state.music.scale}`);
        }
    }

    // ============================================================
    // CLEANUP
    // ============================================================

    dispose(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.isInitialized = false;
        log.info('[BRIDGE] Disposed');
    }
}

// ============================================================
// SINGLETON EXPORT
// ============================================================

export const storeBridge = new StoreBridge();

// Initialize on import
storeBridge.initialize();

log.info('[BRIDGE] Store-to-AudioEngine bridge module loaded');
