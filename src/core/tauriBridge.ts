/**
 * NEXUS-X Tauri Bridge
 *
 * Connects the TypeScript Store to Rust Audio Engine via Tauri IPC.
 *
 * ARCHITECTURE:
 * [TypeScript Store] -> [TauriBridge] -> [Tauri invoke()] -> [Rust Audio]
 *
 * This module is only active when running in Tauri (desktop app).
 * In web mode, falls back to Tone.js engine.
 */

import { appStore } from './AppStore';
import { loggers } from '../utils/logger';

const log = loggers.system;

// Check if running in Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// Tauri invoke function (lazy loaded)
let invoke: ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null = null;

async function getInvoke() {
    if (!isTauri) return null;
    if (invoke) return invoke;

    try {
        // @ts-ignore - Tauri types may not be available in all environments
        const tauri = await import('@tauri-apps/api/core');
        invoke = tauri.invoke;
        return invoke;
    } catch {
        log.warn('[TAURI] Tauri API not available');
        return null;
    }
}

// ============================================================
// TAURI COMMAND INTERFACE
// ============================================================

interface TauriAudioState {
    is_playing: boolean;
    current_step: number;
    bpm: number;
    cpu_usage: number;
}

// ============================================================
// TAURI BRIDGE CLASS
// ============================================================

class TauriBridge {
    private isInitialized = false;
    private unsubscribe: (() => void) | null = null;

    /**
     * Initialize the Tauri Bridge
     * Only activates if running in Tauri environment
     */
    async initialize(): Promise<boolean> {
        if (this.isInitialized) return true;

        const invokeFn = await getInvoke();
        if (!invokeFn) {
            log.info('[TAURI] Not running in Tauri, using Tone.js fallback');
            return false;
        }

        log.info('[TAURI] Running in Tauri desktop mode');

        // Subscribe to store changes
        this.unsubscribe = appStore.subscribe((state, action) => {
            this.handleStateChange(state, action);
        });

        this.isInitialized = true;
        return true;
    }

    /**
     * Handle store changes and sync to Rust
     */
    private async handleStateChange(state: ReturnType<typeof appStore.getState>, action: { type: string; payload?: unknown }): Promise<void> {
        const invokeFn = await getInvoke();
        if (!invokeFn) return;

        try {
            switch (action.type) {
                // Transport
                case 'TRANSPORT_PLAY':
                    await invokeFn('start_audio');
                    log.debug('[TAURI] Audio started');
                    break;

                case 'TRANSPORT_STOP':
                    await invokeFn('stop_audio');
                    log.debug('[TAURI] Audio stopped');
                    break;

                case 'TRANSPORT_SET_BPM':
                    await invokeFn('set_bpm', { bpm: state.transport.bpm });
                    log.debug(`[TAURI] BPM: ${state.transport.bpm}`);
                    break;

                // Mixer
                case 'MIXER_SET_VOLUME': {
                    const payload = action.payload as { trackIndex: number; volume: number };
                    await invokeFn('set_track_volume', { track: payload.trackIndex, value: payload.volume });
                    break;
                }

                case 'MIXER_SET_PAN': {
                    const payload = action.payload as { trackIndex: number; pan: number };
                    await invokeFn('set_track_pan', { track: payload.trackIndex, value: payload.pan });
                    break;
                }

                case 'MIXER_MUTE': {
                    const payload = action.payload as { trackIndex: number; muted: boolean };
                    await invokeFn('toggle_mute', { track: payload.trackIndex });
                    break;
                }

                case 'MIXER_SOLO': {
                    const payload = action.payload as { trackIndex: number; soloed: boolean };
                    await invokeFn('toggle_solo', { track: payload.trackIndex });
                    break;
                }

                case 'MIXER_MASTER_VOLUME':
                    await invokeFn('set_volume', { value: state.mixer.masterVolume });
                    break;

                // Effects - EQ
                case 'EFFECT_SET_REVERB':
                    // Map reverb to EQ Low (creative mapping for demo)
                    await invokeFn('set_eq_low', { value: (state.effects.reverb - 0.5) * 12 });
                    break;

                case 'EFFECT_SET_DELAY':
                    // Map delay to EQ Mid
                    await invokeFn('set_eq_mid', { value: (state.effects.delay - 0.5) * 12 });
                    break;

                case 'EFFECT_SET_FILTER':
                    // Map filter to EQ High
                    await invokeFn('set_eq_high', { value: ((state.effects.filter / 12000) - 0.5) * 12 });
                    break;

                case 'EFFECT_SET_DISTORTION':
                    // Map distortion to limiter threshold
                    await invokeFn('set_limiter', { value: 1.0 - state.effects.distortion * 0.3 });
                    break;
            }
        } catch (error) {
            log.error('[TAURI] IPC error:', error);
        }
    }

    /**
     * Get current audio state from Rust
     */
    async getAudioState(): Promise<TauriAudioState | null> {
        const invokeFn = await getInvoke();
        if (!invokeFn) return null;

        try {
            const state = await invokeFn('get_audio_state') as TauriAudioState;
            return state;
        } catch (error) {
            log.error('[TAURI] Failed to get audio state:', error);
            return null;
        }
    }

    /**
     * Check if Tauri is available
     */
    isTauriAvailable(): boolean {
        return isTauri;
    }

    /**
     * Cleanup
     */
    dispose(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.isInitialized = false;
        log.info('[TAURI] Bridge disposed');
    }
}

// ============================================================
// SINGLETON EXPORT
// ============================================================

export const tauriBridge = new TauriBridge();

// Auto-initialize on import
if (isTauri) {
    tauriBridge.initialize().then(available => {
        if (available) {
            log.info('[TAURI] Bridge initialized - using Rust audio engine');
        }
    });
}

// Global access
(window as any).tauriBridge = tauriBridge;
