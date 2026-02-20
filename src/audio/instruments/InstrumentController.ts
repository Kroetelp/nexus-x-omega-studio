/**
 * NEXUS-X Instrument Controller v5.0
 * Base class for all instruments in the modular system
 */

import {
    InstrumentConfig,
    ParamDefinition,
    MessageType,
    WorkletMessage,
} from '../core/types';

// ============================================================
// SIMPLE EVENT EMITTER (Browser-compatible replacement)
// ============================================================

type EventCallback = (data?: any) => void;

class SimpleEventEmitter {
    private listeners: Map<string, Set<EventCallback>> = new Map();

    on(event: string, callback: EventCallback): this {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
        return this;
    }

    off(event: string, callback: EventCallback): this {
        this.listeners.get(event)?.delete(callback);
        return this;
    }

    emit(event: string, data?: any): boolean {
        const callbacks = this.listeners.get(event);
        if (!callbacks || callbacks.size === 0) return false;
        callbacks.forEach(cb => cb(data));
        return true;
    }

    removeAllListeners(event?: string): this {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
        return this;
    }
}

// ============================================================
// INSTRUMENT CONTROLLER
// ============================================================

export abstract class InstrumentController extends SimpleEventEmitter {
    protected config: InstrumentConfig;
    protected params: Map<number, number> = new Map();
    protected messagePort: MessagePort | null = null;
    protected enabled: boolean = true;

    constructor(config: InstrumentConfig) {
        super();
        this.config = config;
        this.initDefaultParams();
    }

    // ============================================================
    // IDENTITY
    // ============================================================

    get id(): number {
        return this.config.id;
    }

    get type(): string {
        return this.config.type;
    }

    get name(): string {
        return this.config.name;
    }

    get polyphony(): number {
        return this.config.polyphony ?? 1;
    }

    // ============================================================
    // ABSTRACT METHODS (Must be implemented by subclass)
    // ============================================================

    /**
     * Get parameter definitions for this instrument
     */
    abstract getParamDefinitions(): ParamDefinition[];

    // ============================================================
    // PARAMETER CONTROL
    // ============================================================

    /**
     * Initialize parameters to default values
     */
    protected initDefaultParams(): void {
        const defs = this.getParamDefinitions();
        for (const def of defs) {
            this.params.set(def.id, def.default);
        }
    }

    /**
     * Set a parameter value
     * @param paramId - Parameter ID
     * @param value - New value (will be clamped)
     */
    setParam(paramId: number, value: number): void {
        const def = this.getParamDefinitions().find(p => p.id === paramId);
        if (!def) {
            console.warn(`[Instrument ${this.id}] Unknown param: ${paramId}`);
            return;
        }

        // Clamp value to valid range
        const clamped = Math.max(def.min, Math.min(def.max, value));

        // Validate for finite values
        if (!isFinite(clamped)) {
            console.warn(`[Instrument ${this.id}] Non-finite value for param ${paramId}`);
            return;
        }

        this.params.set(paramId, clamped);

        // Send to AudioWorklet
        this.sendMessage({
            type: MessageType.PARAM_CHANGE,
            instrumentId: this.id,
            data1: paramId,
            data2: clamped,
        });

        this.emit('paramChange', { paramId, value: clamped });
    }

    /**
     * Get current parameter value
     */
    getParam(paramId: number): number {
        return this.params.get(paramId) ?? 0;
    }

    /**
     * Get parameter definition by ID
     */
    getParamDef(paramId: number): ParamDefinition | undefined {
        return this.getParamDefinitions().find(p => p.id === paramId);
    }

    /**
     * Set multiple parameters at once
     */
    setParams(params: Record<number, number>): void {
        for (const [id, value] of Object.entries(params)) {
            this.setParam(Number(id), value);
        }
    }

    // ============================================================
    // NOTE CONTROL (For melodic instruments)
    // ============================================================

    /**
     * Trigger a note on
     * @param note - MIDI note number (0-127)
     * @param velocity - Velocity (0-1)
     */
    noteOn(note: number, velocity: number = 0.8): void {
        const safeNote = Math.max(0, Math.min(127, Math.floor(note)));
        const safeVelocity = Math.max(0, Math.min(1, velocity));

        this.sendMessage({
            type: MessageType.NOTE_ON,
            instrumentId: this.id,
            data1: safeNote,
            data2: safeVelocity,
        });

        this.emit('noteOn', { note: safeNote, velocity: safeVelocity });
    }

    /**
     * Trigger a note off
     * @param note - MIDI note number (0-127)
     */
    noteOff(note: number): void {
        const safeNote = Math.max(0, Math.min(127, Math.floor(note)));

        this.sendMessage({
            type: MessageType.NOTE_OFF,
            instrumentId: this.id,
            data1: safeNote,
            data2: 0,
        });

        this.emit('noteOff', { note: safeNote });
    }

    /**
     * Trigger a note with automatic note-off
     * @param note - MIDI note number
     * @param velocity - Velocity (0-1)
     * @param duration - Duration in seconds
     */
    noteOnOff(note: number, velocity: number, duration: number): void {
        this.noteOn(note, velocity);
        setTimeout(() => this.noteOff(note), duration * 1000);
    }

    // ============================================================
    // LIFECYCLE
    // ============================================================

    /**
     * Reset instrument to initial state
     */
    reset(): void {
        this.sendMessage({
            type: MessageType.RESET,
            instrumentId: this.id,
            data1: 0,
            data2: 0,
        });

        // Reset params to defaults
        this.params.clear();
        this.initDefaultParams();

        this.emit('reset');
    }

    /**
     * Enable/disable instrument
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        this.emit('enabledChange', enabled);
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    // ============================================================
    // MESSAGE PORT
    // ============================================================

    /**
     * Set the message port for AudioWorklet communication
     * (Called by InstrumentRegistry during registration)
     */
    setMessagePort(port: MessagePort): void {
        this.messagePort = port;
    }

    /**
     * Send a message to the AudioWorklet
     */
    protected sendMessage(msg: WorkletMessage): void {
        if (this.messagePort && this.enabled) {
            this.messagePort.postMessage(msg);
        }
    }

    // ============================================================
    // UTILITY
    // ============================================================

    /**
     * Get all current parameter values
     */
    getAllParams(): Record<number, number> {
        const result: Record<number, number> = {};
        this.params.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    /**
     * Get instrument info for debugging
     */
    getInfo(): { id: number; name: string; type: string; polyphony: number; paramCount: number } {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            polyphony: this.polyphony,
            paramCount: this.params.size,
        };
    }
}
