/**
 * NEXUS-X DSP ENGINE v5.0 - Modular AudioWorklet
 *
 * This processor bridges the TypeScript InstrumentRegistry
 * with the C++ WASM DspEngine.
 *
 * Message Flow:
 * TypeScript -> InstrumentRegistry -> WorkletMessage -> processor.js -> WASM
 */

// ============================================================
// MESSAGE CONSTANTS (sync mit TypeScript types.ts)
// ============================================================
const MSG = {
    // Main Thread -> Worklet
    PARAM_CHANGE: 0,
    NOTE_ON: 1,
    NOTE_OFF: 2,
    RESET: 3,
    REGISTER_INSTRUMENT: 4,
    LOAD_WASM: 5,

    // Worklet -> Main Thread
    METER_UPDATE: 100,
    PEAK_DETECTED: 101,
    INSTRUMENT_READY: 102,
    WASM_READY: 103,
};

const INSTRUMENT_TYPE = {
    SYNTH: 0,
    DRUM: 1,
    FX: 2,
    SAMPLER: 3,
};

// ============================================================
// DSP ENGINE WORKLET
// ============================================================
class NexusDspEngine extends AudioWorkletProcessor {
    constructor() {
        super();

        // === WASM State ===
        this.wasmInstance = null;
        this.wasmExports = null;
        this.wasmMemory = null;

        // === Function pointers (cached for performance) ===
        this.fnInitialize = null;
        this.fnGetInputBuffer = null;
        this.fnGetOutputBuffer = null;
        this.fnProcess = null;
        this.fnHandleMessage = null;
        this.fnRegisterInstrument = null;
        this.fnSetParameter = null;
        this.fnNoteOn = null;
        this.fnNoteOff = null;
        this.fnSetMasterVolume = null;

        // === Instrument Registry (local tracking) ===
        this.registeredInstruments = new Map();

        // === Metering State ===
        this.meterPeakL = 0;
        this.meterPeakR = 0;
        this.meterFrameCount = 0;
        this.METER_INTERVAL = 4096; // ~93ms at 44.1kHz

        // === Buffer offsets ===
        this.inputBufferOffset = 0;
        this.outputBufferOffset = 0;

        // === Message Handler ===
        this.port.onmessage = (e) => this.handleMessage(e.data);

        console.log('[Worklet] NexusDspEngine v5.0 initialized');
    }

    // ============================================================
    // MESSAGE HANDLING
    // ============================================================
    handleMessage(msg) {
        // Validate message structure
        if (typeof msg.type !== 'number') {
            console.warn('[Worklet] Invalid message:', msg);
            return;
        }

        switch (msg.type) {
            case MSG.LOAD_WASM:
                this.loadWasm(msg.wasmModule);
                break;

            case MSG.REGISTER_INSTRUMENT:
                this.registerInstrument(msg.instrumentId, msg.data1, msg.data2);
                break;

            case MSG.PARAM_CHANGE:
                this.routeParamChange(msg.instrumentId, msg.data1, msg.data2);
                break;

            case MSG.NOTE_ON:
                this.routeNoteOn(msg.instrumentId, msg.data1, msg.data2);
                break;

            case MSG.NOTE_OFF:
                this.routeNoteOff(msg.instrumentId, msg.data1);
                break;

            case MSG.RESET:
                this.resetInstrument(msg.instrumentId);
                break;

            default:
                console.warn('[Worklet] Unknown message type:', msg.type);
        }
    }

    // ============================================================
    // WASM LOADING
    // ============================================================
    async loadWasm(wasmModule) {
        try {
            const instance = await WebAssembly.instantiate(wasmModule, {
                env: {
                    // Import functions if needed by WASM
                    memory: new WebAssembly.Memory({ initial: 256, maximum: 256 }),
                }
            });

            this.wasmInstance = instance.exports;
            this.wasmExports = instance.exports;
            this.wasmMemory = new Float32Array(this.wasmExports.memory.buffer);

            // Cache function pointers
            // Note: Emscripten exports functions with underscore prefix
            this.fnInitialize = this.wasmExports.initialize || this.wasmExports._initialize;
            this.fnGetInputBuffer = this.wasmExports.getInputBuffer || this.wasmExports._getInputBuffer;
            this.fnGetOutputBuffer = this.wasmExports.getOutputBuffer || this.wasmExports._getOutputBuffer;
            this.fnProcess = this.wasmExports.process || this.wasmExports._process || this.wasmExports._processV2;
            this.fnHandleMessage = this.wasmExports.handleMessage || this.wasmExports._handleMessage;
            this.fnRegisterInstrument = this.wasmExports.registerInstrument || this.wasmExports._registerInstrument;
            this.fnSetParameter = this.wasmExports.setParameter || this.wasmExports._setParameter;
            this.fnNoteOn = this.wasmExports.noteOn || this.wasmExports._noteOn;
            this.fnNoteOff = this.wasmExports.noteOff || this.wasmExports._noteOff;
            this.fnSetMasterVolume = this.wasmExports.setMasterVolume || this.wasmExports._setMasterVolume;
            this.fnResetState = this.wasmExports.resetState || this.wasmExports._resetState;

            // Initialize WASM engine
            if (this.fnInitialize) {
                this.fnInitialize(sampleRate);
            }

            // Get buffer offsets
            if (this.fnGetInputBuffer) {
                this.inputBufferOffset = this.fnGetInputBuffer() / 4; // Convert to float offset
            }
            if (this.fnGetOutputBuffer) {
                this.outputBufferOffset = this.fnGetOutputBuffer() / 4;
            }

            console.log('[Worklet] WASM Engine v5.0 loaded successfully');
            console.log(`[Worklet] Sample rate: ${sampleRate}Hz`);
            console.log(`[Worklet] Buffer offsets: in=${this.inputBufferOffset}, out=${this.outputBufferOffset}`);
            console.log(`[Worklet] Available exports:`, Object.keys(this.wasmExports).filter(k => !k.startsWith('__')).join(', '));

            // Signal ready to main thread
            this.port.postMessage({ type: MSG.WASM_READY });

        } catch (err) {
            console.error('[Worklet] WASM load failed:', err);
            this.wasmInstance = null;
        }
    }

    // ============================================================
    // INSTRUMENT MANAGEMENT
    // ============================================================
    registerInstrument(id, type, polyphony) {
        // Local tracking
        this.registeredInstruments.set(id, {
            type: type,
            polyphony: polyphony,
            enabled: true,
        });

        // Forward to WASM
        if (this.wasmInstance && this.fnRegisterInstrument) {
            this.fnRegisterInstrument(id, type, polyphony);
        }

        console.log(`[Worklet] Registered instrument ${id} (type=${type}, poly=${polyphony})`);

        // Confirm to main thread
        this.port.postMessage({
            type: MSG.INSTRUMENT_READY,
            instrumentId: id,
        });
    }

    // ============================================================
    // PARAMETER ROUTING
    // ============================================================
    routeParamChange(instrumentId, paramId, value) {
        // Validate
        if (!isFinite(value)) {
            console.warn(`[Worklet] Non-finite value for param ${paramId}`);
            return;
        }

        // Safety clamp
        const safeValue = Math.max(-1000000, Math.min(1000000, value));

        // Forward to WASM
        if (this.wasmInstance && this.fnSetParameter) {
            this.fnSetParameter(instrumentId, paramId, safeValue);
        }
    }

    // ============================================================
    // NOTE ROUTING
    // ============================================================
    routeNoteOn(instrumentId, note, velocity) {
        // Validate
        const safeNote = Math.max(0, Math.min(127, Math.floor(note)));
        const safeVelocity = Math.max(0, Math.min(1, velocity));

        // Forward to WASM
        if (this.wasmInstance && this.fnNoteOn) {
            this.fnNoteOn(instrumentId, safeNote, safeVelocity);
        }
    }

    routeNoteOff(instrumentId, note) {
        const safeNote = Math.max(0, Math.min(127, Math.floor(note)));

        if (this.wasmInstance && this.fnNoteOff) {
            this.fnNoteOff(instrumentId, safeNote);
        }
    }

    // ============================================================
    // RESET
    // ============================================================
    resetInstrument(instrumentId) {
        if (this.wasmInstance && this.wasmExports.resetInstrument) {
            this.wasmExports.resetInstrument(instrumentId);
        }
    }

    // ============================================================
    // AUDIO PROCESSING
    // ============================================================
    process(inputs, outputs, parameters) {
        const output = outputs[0];
        const input = inputs[0];

        // Stereo output
        const outputL = output[0];
        const outputR = output[1] || output[0];

        // === WASM PATH ===
        if (this.wasmInstance && this.fnProcess) {
            // Refresh memory view (WASM memory can grow)
            this.wasmMemory = new Float32Array(this.wasmExports.memory.buffer);

            // Copy input to WASM buffer (if available)
            if (input && input.length > 0) {
                const inputL = input[0];
                const inputR = input[1] || input[0];

                for (let i = 0; i < 128; i++) {
                    // Stereo interleaved: L, R, L, R, ...
                    this.wasmMemory[this.inputBufferOffset + i * 2] = inputL[i];
                    this.wasmMemory[this.inputBufferOffset + i * 2 + 1] = inputR[i];
                }
            }

            // Process in WASM
            this.fnProcess(128);

            // Copy output from WASM buffer
            for (let i = 0; i < 128; i++) {
                outputL[i] = this.wasmMemory[this.outputBufferOffset + i * 2];
                outputR[i] = this.wasmMemory[this.outputBufferOffset + i * 2 + 1];
            }

        } else {
            // === JS FALLBACK (Silence) ===
            for (let i = 0; i < 128; i++) {
                outputL[i] = 0;
                outputR[i] = 0;
            }
        }

        // === METERING ===
        this.updateMeters(outputL, outputR);

        return true;
    }

    // ============================================================
    // METERING
    // ============================================================
    updateMeters(l, r) {
        // Find peaks
        for (let i = 0; i < l.length; i++) {
            this.meterPeakL = Math.max(this.meterPeakL, Math.abs(l[i]));
            this.meterPeakR = Math.max(this.meterPeakR, Math.abs(r[i]));
        }

        this.meterFrameCount += l.length;

        // Send to main thread periodically
        if (this.meterFrameCount >= this.METER_INTERVAL) {
            this.port.postMessage({
                type: MSG.METER_UPDATE,
                peakL: this.meterPeakL,
                peakR: this.meterPeakR,
            });

            // Reset for next interval
            this.meterPeakL = 0;
            this.meterPeakR = 0;
            this.meterFrameCount = 0;
        }
    }
}

// Register the processor
registerProcessor('nexus-dsp-engine', NexusDspEngine);
