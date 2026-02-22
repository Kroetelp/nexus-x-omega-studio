/**
 * NEXUS-X Central State Store
 * Redux-like architecture for predictable state management
 *
 * RULE: UI NEVER manipulates audio nodes directly.
 * UI -> dispatch(action) -> Store -> notify Subscribers -> AudioEngine
 */

import { loggers } from '../utils/logger';

const log = loggers.system;

// ============================================================
// STATE TYPES
// ============================================================

export interface AppState {
    // Transport
    transport: {
        isPlaying: boolean;
        bpm: number;
        swing: number;
        currentStep: number;
        currentBar: number;
    };

    // Sequencer
    sequencer: {
        pattern: number[][];
        activeSteps: boolean[];
    };

    // Mixer
    mixer: {
        tracks: TrackState[];
        masterVolume: number;
    };

    // Effects
    effects: {
        reverb: number;
        delay: number;
        distortion: number;
        filter: number;
        bitcrush: number;
    };

    // Genre/Scale
    music: {
        genre: string;
        scale: string;
        rootNote: string;
    };

    // UI State
    ui: {
        activePanel: string | null;
        theme: 'dark' | 'light';
    };
}

export interface TrackState {
    index: number;
    name: string;
    volume: number;
    pan: number;
    muted: boolean;
    soloed: boolean;
}

// ============================================================
// ACTION TYPES
// ============================================================

export type ActionType =
    // Transport
    | 'TRANSPORT_PLAY'
    | 'TRANSPORT_STOP'
    | 'TRANSPORT_SET_BPM'
    | 'TRANSPORT_SET_SWING'
    | 'TRANSPORT_STEP'
    | 'TRANSPORT_BAR'

    // Sequencer
    | 'SEQUENCER_TOGGLE_STEP'
    | 'SEQUENCER_SET_PATTERN'
    | 'SEQUENCER_CLEAR'

    // Mixer
    | 'MIXER_SET_VOLUME'
    | 'MIXER_SET_PAN'
    | 'MIXER_MUTE'
    | 'MIXER_SOLO'
    | 'MIXER_MASTER_VOLUME'

    // Effects
    | 'EFFECT_SET_REVERB'
    | 'EFFECT_SET_DELAY'
    | 'EFFECT_SET_DISTORTION'
    | 'EFFECT_SET_FILTER'
    | 'EFFECT_SET_BITCRUSH'

    // Music
    | 'MUSIC_SET_GENRE'
    | 'MUSIC_SET_SCALE'
    | 'MUSIC_SET_ROOT'

    // UI
    | 'UI_OPEN_PANEL'
    | 'UI_CLOSE_PANEL'
    | 'UI_SET_THEME';

export interface Action {
    type: ActionType;
    payload?: unknown;
}

// ============================================================
// SUBSCRIBER TYPE
// ============================================================

export type Subscriber = (state: AppState, action: Action) => void;

// ============================================================
// INITIAL STATE
// ============================================================

const initialState: AppState = {
    transport: {
        isPlaying: false,
        bpm: 128,
        swing: 0,
        currentStep: 0,
        currentBar: 0
    },
    sequencer: {
        pattern: [],
        activeSteps: []
    },
    mixer: {
        tracks: [
            { index: 0, name: 'Kick', volume: 0.8, pan: 0, muted: false, soloed: false },
            { index: 1, name: 'Snare', volume: 0.7, pan: 0, muted: false, soloed: false },
            { index: 2, name: 'Clap', volume: 0.6, pan: 0.15, muted: false, soloed: false },
            { index: 3, name: 'HiHat', volume: 0.5, pan: -0.15, muted: false, soloed: false },
            { index: 4, name: 'Bass', volume: 0.7, pan: 0, muted: false, soloed: false },
            { index: 5, name: 'Lead', volume: 0.5, pan: 0.2, muted: false, soloed: false },
            { index: 6, name: 'Pad', volume: 0.4, pan: 0, muted: false, soloed: false }
        ],
        masterVolume: 0.8
    },
    effects: {
        reverb: 0.15,
        delay: 0.1,
        distortion: 0,
        filter: 12000,
        bitcrush: 0
    },
    music: {
        genre: 'TECHNO',
        scale: 'minor',
        rootNote: 'C'
    },
    ui: {
        activePanel: null,
        theme: 'dark'
    }
};

// ============================================================
// STORE CLASS
// ============================================================

class AppStore {
    private state: AppState;
    private subscribers: Set<Subscriber> = new Set();
    private middleware: Array<(action: Action, next: () => void) => void> = [];

    constructor() {
        this.state = { ...initialState };
    }

    /**
     * Get current state (read-only clone)
     */
    getState(): Readonly<AppState> {
        return Object.freeze({ ...this.state });
    }

    /**
     * Get specific slice of state
     */
    getSlice<K extends keyof AppState>(key: K): Readonly<AppState[K]> {
        return Object.freeze({ ...this.state[key] } as AppState[K]);
    }

    /**
     * Dispatch an action
     */
    dispatch(action: Action): void {
        log.debug(`[STORE] Action: ${action.type}`, action.payload);

        // Run middleware
        if (this.middleware.length > 0) {
            let index = 0;
            const next = () => {
                if (index < this.middleware.length) {
                    const mw = this.middleware[index++];
                    mw(action, next);
                } else {
                    this.processAction(action);
                }
            };
            next();
        } else {
            this.processAction(action);
        }
    }

    /**
     * Process action and update state
     */
    private processAction(action: Action): void {
        const oldState = { ...this.state };

        // Update state based on action
        switch (action.type) {
            // Transport
            case 'TRANSPORT_PLAY':
                this.state = {
                    ...this.state,
                    transport: { ...this.state.transport, isPlaying: true }
                };
                break;

            case 'TRANSPORT_STOP':
                this.state = {
                    ...this.state,
                    transport: {
                        ...this.state.transport,
                        isPlaying: false,
                        currentStep: 0,
                        currentBar: 0
                    }
                };
                break;

            case 'TRANSPORT_SET_BPM':
                this.state = {
                    ...this.state,
                    transport: { ...this.state.transport, bpm: action.payload as number }
                };
                break;

            case 'TRANSPORT_SET_SWING':
                this.state = {
                    ...this.state,
                    transport: { ...this.state.transport, swing: action.payload as number }
                };
                break;

            case 'TRANSPORT_STEP':
                this.state = {
                    ...this.state,
                    transport: { ...this.state.transport, currentStep: action.payload as number }
                };
                break;

            case 'TRANSPORT_BAR':
                this.state = {
                    ...this.state,
                    transport: { ...this.state.transport, currentBar: action.payload as number }
                };
                break;

            // Sequencer
            case 'SEQUENCER_TOGGLE_STEP': {
                const { trackIndex, stepIndex } = action.payload as { trackIndex: number; stepIndex: number };
                const pattern = this.state.sequencer.pattern.map((track, i) => {
                    if (i === trackIndex) {
                        const newTrack = [...track];
                        newTrack[stepIndex] = newTrack[stepIndex] ? 0 : 1;
                        return newTrack;
                    }
                    return track;
                });
                this.state = {
                    ...this.state,
                    sequencer: { ...this.state.sequencer, pattern }
                };
                break;
            }

            case 'SEQUENCER_SET_PATTERN':
                this.state = {
                    ...this.state,
                    sequencer: { ...this.state.sequencer, pattern: action.payload as number[][] }
                };
                break;

            case 'SEQUENCER_CLEAR':
                this.state = {
                    ...this.state,
                    sequencer: { ...this.state.sequencer, pattern: [] }
                };
                break;

            // Mixer
            case 'MIXER_SET_VOLUME': {
                const { trackIndex, volume } = action.payload as { trackIndex: number; volume: number };
                const tracks = this.state.mixer.tracks.map((t, i) =>
                    i === trackIndex ? { ...t, volume } : t
                );
                this.state = { ...this.state, mixer: { ...this.state.mixer, tracks } };
                break;
            }

            case 'MIXER_SET_PAN': {
                const { trackIndex, pan } = action.payload as { trackIndex: number; pan: number };
                const tracks = this.state.mixer.tracks.map((t, i) =>
                    i === trackIndex ? { ...t, pan } : t
                );
                this.state = { ...this.state, mixer: { ...this.state.mixer, tracks } };
                break;
            }

            case 'MIXER_MUTE': {
                const { trackIndex, muted } = action.payload as { trackIndex: number; muted: boolean };
                const tracks = this.state.mixer.tracks.map((t, i) =>
                    i === trackIndex ? { ...t, muted } : t
                );
                this.state = { ...this.state, mixer: { ...this.state.mixer, tracks } };
                break;
            }

            case 'MIXER_SOLO': {
                const { trackIndex, soloed } = action.payload as { trackIndex: number; soloed: boolean };
                const tracks = this.state.mixer.tracks.map((t, i) =>
                    i === trackIndex ? { ...t, soloed } : t
                );
                this.state = { ...this.state, mixer: { ...this.state.mixer, tracks } };
                break;
            }

            case 'MIXER_MASTER_VOLUME':
                this.state = {
                    ...this.state,
                    mixer: { ...this.state.mixer, masterVolume: action.payload as number }
                };
                break;

            // Effects
            case 'EFFECT_SET_REVERB':
                this.state = {
                    ...this.state,
                    effects: { ...this.state.effects, reverb: action.payload as number }
                };
                break;

            case 'EFFECT_SET_DELAY':
                this.state = {
                    ...this.state,
                    effects: { ...this.state.effects, delay: action.payload as number }
                };
                break;

            case 'EFFECT_SET_DISTORTION':
                this.state = {
                    ...this.state,
                    effects: { ...this.state.effects, distortion: action.payload as number }
                };
                break;

            case 'EFFECT_SET_FILTER':
                this.state = {
                    ...this.state,
                    effects: { ...this.state.effects, filter: action.payload as number }
                };
                break;

            case 'EFFECT_SET_BITCRUSH':
                this.state = {
                    ...this.state,
                    effects: { ...this.state.effects, bitcrush: action.payload as number }
                };
                break;

            // Music
            case 'MUSIC_SET_GENRE':
                this.state = {
                    ...this.state,
                    music: { ...this.state.music, genre: action.payload as string }
                };
                break;

            case 'MUSIC_SET_SCALE':
                this.state = {
                    ...this.state,
                    music: { ...this.state.music, scale: action.payload as string }
                };
                break;

            case 'MUSIC_SET_ROOT':
                this.state = {
                    ...this.state,
                    music: { ...this.state.music, rootNote: action.payload as string }
                };
                break;

            // UI
            case 'UI_OPEN_PANEL':
                this.state = {
                    ...this.state,
                    ui: { ...this.state.ui, activePanel: action.payload as string }
                };
                break;

            case 'UI_CLOSE_PANEL':
                this.state = {
                    ...this.state,
                    ui: { ...this.state.ui, activePanel: null }
                };
                break;

            case 'UI_SET_THEME':
                this.state = {
                    ...this.state,
                    ui: { ...this.state.ui, theme: action.payload as 'dark' | 'light' }
                };
                break;

            default:
                log.warn(`[STORE] Unknown action type: ${(action as Action).type}`);
        }

        // Notify subscribers if state changed
        if (JSON.stringify(oldState) !== JSON.stringify(this.state)) {
            this.notifySubscribers(action);
        }
    }

    /**
     * Subscribe to state changes
     */
    subscribe(subscriber: Subscriber): () => void {
        this.subscribers.add(subscriber);
        return () => this.subscribers.delete(subscriber);
    }

    /**
     * Add middleware
     */
    addMiddleware(mw: (action: Action, next: () => void) => void): void {
        this.middleware.push(mw);
    }

    /**
     * Notify all subscribers
     */
    private notifySubscribers(action: Action): void {
        this.subscribers.forEach(subscriber => {
            try {
                subscriber(this.getState(), action);
            } catch (error) {
                log.error('[STORE] Subscriber error:', error);
            }
        });
    }

    /**
     * Reset to initial state
     */
    reset(): void {
        this.state = { ...initialState };
        this.notifySubscribers({ type: 'TRANSPORT_STOP' });
    }

    /**
     * Hydrate state from storage
     */
    hydrate(savedState: Partial<AppState>): void {
        this.state = { ...this.state, ...savedState };
        log.info('[STORE] State hydrated from storage');
    }

    /**
     * Serialize state for storage
     */
    serialize(): string {
        return JSON.stringify(this.state);
    }
}

// ============================================================
// SINGLETON EXPORT
// ============================================================

export const appStore = new AppStore();

// Global access for debugging
(window as any).appStore = appStore;

log.info('[STORE] Central AppStore initialized');
