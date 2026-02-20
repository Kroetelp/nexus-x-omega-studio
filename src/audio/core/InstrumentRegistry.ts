/**
 * NEXUS-X Instrument Registry v5.0
 * Central manager for all instruments in the system
 */

import { InstrumentController } from '../instruments/InstrumentController';
import { SynthController } from '../instruments/SynthController';
import { DrumController, DrumType } from '../instruments/DrumController';
import { FxController } from '../instruments/FxController';
import { FmSynthController } from '../instruments/FmSynthController';
import {
    InstrumentConfig,
    InstrumentType,
    MessageType,
    WorkletMessage,
} from './types';

// ============================================================
// INSTRUMENT REGISTRY
// ============================================================
export class InstrumentRegistry {
    private instruments: Map<number, InstrumentController> = new Map();
    private messagePort: MessagePort | null = null;
    private nextId: number = 1;

    // ============================================================
    // INITIALIZATION
    // ============================================================

    /**
     * Set the message port for AudioWorklet communication
     * Must be called before creating instruments
     */
    setMessagePort(port: MessagePort): void {
        this.messagePort = port;

        // Update all existing instruments
        this.instruments.forEach(inst => {
            inst.setMessagePort(port);
        });

        console.log('[InstrumentRegistry] Message port connected');
    }

    /**
     * Get the current message port
     */
    getMessagePort(): MessagePort | null {
        return this.messagePort;
    }

    // ============================================================
    // INSTRUMENT FACTORY
    // ============================================================

    /**
     * Create a new instrument
     * @param type - Instrument type
     * @param name - Display name
     * @param options - Additional options (polyphony, drumType, etc.)
     * @returns The created instrument controller
     */
    createInstrument(
        type: InstrumentType,
        name: string,
        options?: {
            polyphony?: number;
            drumType?: DrumType;
            id?: number;
        }
    ): InstrumentController {
        // Generate or use provided ID
        const id = options?.id ?? this.nextId++;

        // Check for duplicate ID
        if (this.instruments.has(id)) {
            throw new Error(`[InstrumentRegistry] Instrument with id ${id} already exists`);
        }

        // Build config
        const config: InstrumentConfig = {
            id,
            type,
            name,
            polyphony: options?.polyphony ?? (type === 'synth' ? 8 : 1),
        };

        // Create appropriate controller
        let controller: InstrumentController;

        switch (type) {
            case 'synth':
                controller = new SynthController(config);
                break;

            case 'drum':
                controller = new DrumController(config, options?.drumType ?? DrumType.KICK);
                break;

            case 'fx':
                controller = new FxController(config);
                break;

            case 'fm':
                controller = new FmSynthController(config);
                break;

            default:
                throw new Error(`[InstrumentRegistry] Unknown instrument type: ${type}`);
        }

        // Connect message port
        if (this.messagePort) {
            controller.setMessagePort(this.messagePort);
        }

        // Register
        this.instruments.set(id, controller);

        // Send registration to AudioWorklet
        this.sendRegistration(config);

        console.log(`[InstrumentRegistry] Created ${type} "${name}" (ID: ${id})`);

        return controller;
    }

    /**
     * Create multiple instruments at once (batch creation)
     */
    createInstruments(configs: Array<{
        type: InstrumentType;
        name: string;
        options?: any;
    }>): InstrumentController[] {
        return configs.map(cfg => this.createInstrument(cfg.type, cfg.name, cfg.options));
    }

    // ============================================================
    // ACCESS
    // ============================================================

    /**
     * Get an instrument by ID
     */
    getInstrument<T extends InstrumentController>(id: number): T | undefined {
        return this.instruments.get(id) as T | undefined;
    }

    /**
     * Get a synth by ID (typed)
     */
    getSynth(id: number): SynthController | undefined {
        return this.getInstrument<SynthController>(id);
    }

    /**
     * Get a drum by ID (typed)
     */
    getDrum(id: number): DrumController | undefined {
        return this.getInstrument<DrumController>(id);
    }

    /**
     * Get the FX controller (typed)
     */
    getFx(id: number): FxController | undefined {
        return this.getInstrument<FxController>(id);
    }

    /**
     * Get an FM synth by ID (typed)
     */
    getFmSynth(id: number): FmSynthController | undefined {
        return this.getInstrument<FmSynthController>(id);
    }

    /**
     * Get all instruments
     */
    getAllInstruments(): InstrumentController[] {
        return Array.from(this.instruments.values());
    }

    /**
     * Get instruments by type
     */
    getInstrumentsByType(type: InstrumentType): InstrumentController[] {
        return this.getAllInstruments().filter(inst => inst.type === type);
    }

    /**
     * Get all synth IDs
     */
    getSynthIds(): number[] {
        return this.getAllInstruments()
            .filter(inst => inst.type === 'synth')
            .map(inst => inst.id);
    }

    /**
     * Get all drum IDs
     */
    getDrumIds(): number[] {
        return this.getAllInstruments()
            .filter(inst => inst.type === 'drum')
            .map(inst => inst.id);
    }

    /**
     * Check if an instrument exists
     */
    hasInstrument(id: number): boolean {
        return this.instruments.has(id);
    }

    /**
     * Get instrument count
     */
    getInstrumentCount(): number {
        return this.instruments.size;
    }

    // ============================================================
    // REMOVAL
    // ============================================================

    /**
     * Remove an instrument by ID
     */
    removeInstrument(id: number): boolean {
        const inst = this.instruments.get(id);
        if (!inst) return false;

        // Reset the instrument
        inst.reset();
        inst.setEnabled(false);

        // Remove from registry
        this.instruments.delete(id);

        console.log(`[InstrumentRegistry] Removed instrument ${id}`);

        return true;
    }

    /**
     * Remove all instruments
     */
    clearAll(): void {
        this.instruments.forEach(inst => {
            inst.reset();
            inst.setEnabled(false);
        });
        this.instruments.clear();
        this.nextId = 1;

        console.log('[InstrumentRegistry] All instruments cleared');
    }

    // ============================================================
    // BATCH OPERATIONS
    // ============================================================

    /**
     * Reset all instruments
     */
    resetAll(): void {
        this.instruments.forEach(inst => inst.reset());
    }

    /**
     * Enable/disable all instruments
     */
    setAllEnabled(enabled: boolean): void {
        this.instruments.forEach(inst => inst.setEnabled(enabled));
    }

    // ============================================================
    // DEFAULT SETUP
    // ============================================================

    /**
     * Get all FM synth IDs
     */
    getFmSynthIds(): number[] {
        return this.getAllInstruments()
            .filter(inst => inst.type === 'fm')
            .map(inst => inst.id);
    }

    /**
     * Create default instrument setup for NEXUS-X
     * Returns an object with references to all created instruments
     */
    createDefaultSetup(): {
        kick: DrumController;
        snare: DrumController;
        clap: DrumController;
        hihat: DrumController;
        bass: SynthController;
        lead: SynthController;
        pad: SynthController;
        fm: FmSynthController;
        fxBus: FxController;
    } {
        // Clear existing
        this.clearAll();

        // Create drums
        const kick = this.createInstrument('drum', 'Kick', { drumType: DrumType.KICK, id: 1 }) as DrumController;
        const snare = this.createInstrument('drum', 'Snare', { drumType: DrumType.SNARE, id: 2 }) as DrumController;
        const clap = this.createInstrument('drum', 'Clap', { drumType: DrumType.CLAP, id: 3 }) as DrumController;
        const hihat = this.createInstrument('drum', 'HiHat', { drumType: DrumType.HIHAT_CLOSED, id: 4 }) as DrumController;

        // Create synths
        const bass = this.createInstrument('synth', 'Bass', { polyphony: 4, id: 5 }) as SynthController;
        const lead = this.createInstrument('synth', 'Lead', { polyphony: 8, id: 6 }) as SynthController;
        const pad = this.createInstrument('synth', 'Pad', { polyphony: 4, id: 7 }) as SynthController;

        // Create FM synth
        const fm = this.createInstrument('fm', 'FM Bell', { polyphony: 4, id: 8 }) as FmSynthController;

        // Create FX bus
        const fxBus = this.createInstrument('fx', 'Master FX', { id: 99 }) as FxController;

        // Apply default presets
        // (These would apply parameters to the WASM)
        // bass.setParam(SynthParam.OSC_TYPE, 2); // Square for bass
        // etc.

        console.log('[InstrumentRegistry] Default setup created');

        return { kick, snare, clap, hihat, bass, lead, pad, fm, fxBus };
    }

    // ============================================================
    // PRIVATE
    // ============================================================

    /**
     * Send registration message to AudioWorklet
     */
    private sendRegistration(config: InstrumentConfig): void {
        if (!this.messagePort) return;

        const msg: WorkletMessage = {
            type: MessageType.REGISTER_INSTRUMENT,
            instrumentId: config.id,
            data1: this.typeToNumber(config.type),
            data2: config.polyphony ?? 1,
        };

        this.messagePort.postMessage(msg);
    }

    /**
     * Convert instrument type to number (for WASM)
     */
    private typeToNumber(type: InstrumentType): number {
        const types: Record<InstrumentType, number> = {
            synth: 0,
            drum: 1,
            fx: 2,
            fm: 3,
            sampler: 4,
            pad: 0,  // Pad is a type of synth
        };
        return types[type] ?? 0;
    }
}

// Singleton export
export const instrumentRegistry = new InstrumentRegistry();
