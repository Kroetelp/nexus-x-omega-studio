/**
 * NEXUS-X DSP JS Fallback v5.0
 * JavaScript implementation of the WASM API
 * Used when WASM is not available (development/testing)
 */

// Message Types
const MSG = {
    PARAM_CHANGE: 0,
    NOTE_ON: 1,
    NOTE_OFF: 2,
    RESET: 3,
    REGISTER_INSTRUMENT: 4,
    LOAD_WASM: 5,
    METER_UPDATE: 100,
    INSTRUMENT_READY: 102,
    WASM_READY: 103,
};

// Instrument Types
const INSTRUMENT_TYPE = {
    SYNTH: 0,
    DRUM: 1,
    FX: 2,
    SAMPLER: 3,
};

// ============================================================
// SIMPLE SYNTH VOICE (JS Implementation)
// ============================================================
class Voice {
    constructor() {
        this.phase = 0;
        this.frequency = 440;
        this.velocity = 0;
        this.active = false;
        this.note = 0;

        // ADSR
        this.attack = 0.01;
        this.decay = 0.1;
        this.sustain = 0.7;
        this.release = 0.3;
        this.envLevel = 0;
        this.envState = 'idle';

        // Filter
        this.filterCutoff = 2000;
        this.filterPrev = 0;

        // Osc type
        this.oscType = 1; // saw
    }

    noteOn(note, velocity) {
        this.note = note;
        this.velocity = velocity;
        this.frequency = 440 * Math.pow(2, (note - 69) / 12);
        this.phase = 0;
        this.envState = 'attack';
        this.active = true;
    }

    noteOff() {
        this.envState = 'release';
    }

    process(sr) {
        if (!this.active) return 0;

        // ADSR
        const dt = 1 / sr;
        switch (this.envState) {
            case 'attack':
                this.envLevel += dt / this.attack;
                if (this.envLevel >= 1) {
                    this.envLevel = 1;
                    this.envState = 'decay';
                }
                break;
            case 'decay':
                this.envLevel -= (1 - this.sustain) * (dt / this.decay);
                if (this.envLevel <= this.sustain) {
                    this.envLevel = this.sustain;
                    this.envState = 'sustain';
                }
                break;
            case 'sustain':
                break;
            case 'release':
                this.envLevel -= this.sustain * (dt / this.release);
                if (this.envLevel <= 0) {
                    this.envLevel = 0;
                    this.envState = 'idle';
                    this.active = false;
                }
                break;
            case 'idle':
            default:
                this.active = false;
                return 0;
        }

        // Oscillator
        let sample = 0;
        const phaseInc = this.frequency / sr;
        switch (this.oscType) {
            case 0: // sine
                sample = Math.sin(2 * Math.PI * this.phase);
                break;
            case 1: // saw
                sample = 2 * this.phase - 1;
                break;
            case 2: // square
                sample = this.phase < 0.5 ? 1 : -1;
                break;
            case 3: // triangle
                sample = 4 * Math.abs(this.phase - 0.5) - 1;
                break;
        }
        this.phase += phaseInc;
        if (this.phase >= 1) this.phase -= 1;

        // Simple lowpass
        const rc = 1 / (2 * Math.PI * this.filterCutoff);
        const alpha = dt / (rc + dt);
        sample = this.filterPrev + alpha * (sample - this.filterPrev);
        this.filterPrev = sample;

        return sample * this.envLevel * this.velocity;
    }
}

// ============================================================
// SYNTH INSTRUMENT
// ============================================================
class SynthInstrument {
    constructor(id, polyphony = 8) {
        this.id = id;
        this.polyphony = polyphony;
        this.voices = [];
        this.masterVol = 0.8;
        this.oscType = 1;
        this.filterCutoff = 2000;
        this.attack = 0.01;
        this.decay = 0.1;
        this.sustain = 0.7;
        this.release = 0.3;

        for (let i = 0; i < polyphony; i++) {
            this.voices.push(new Voice());
        }
    }

    setParameter(paramId, value) {
        switch (paramId) {
            case 0: this.oscType = Math.floor(value); break;
            case 11: this.filterCutoff = value; break;
            case 20: this.attack = value; break;
            case 21: this.decay = value; break;
            case 22: this.sustain = value; break;
            case 23: this.release = value; break;
            case 60: this.masterVol = value; break;
        }
    }

    noteOn(note, velocity) {
        // Find free voice
        for (const voice of this.voices) {
            if (!voice.active) {
                voice.oscType = this.oscType;
                voice.filterCutoff = this.filterCutoff;
                voice.attack = this.attack;
                voice.decay = this.decay;
                voice.sustain = this.sustain;
                voice.release = this.release;
                voice.noteOn(note, velocity);
                return;
            }
        }
    }

    noteOff(note) {
        for (const voice of this.voices) {
            if (voice.active && voice.note === note) {
                voice.noteOff();
            }
        }
    }

    process(buffer, numSamples, sr) {
        for (let i = 0; i < numSamples; i++) {
            let sample = 0;
            for (const voice of this.voices) {
                if (voice.active) {
                    sample += voice.process(sr);
                }
            }
            sample *= this.masterVol;
            buffer[i * 2] += sample;
            buffer[i * 2 + 1] += sample;
        }
    }

    reset() {
        for (const voice of this.voices) {
            voice.active = false;
        }
    }
}

// ============================================================
// DRUM INSTRUMENT
// ============================================================
class DrumInstrument {
    constructor(id, drumType = 0) {
        this.id = id;
        this.drumType = drumType;
        this.masterVol = 0.8;
        this.active = false;
        this.level = 0;
        this.decay = 0.2;
        this.phase = 0;
        this.pitch = 50;
    }

    setParameter(paramId, value) {
        switch (paramId) {
            case 0: this.pitch = value; break;
            case 1: this.decay = value; break;
            case 60: this.masterVol = value; break;
        }
    }

    noteOn(note, velocity) {
        this.level = velocity;
        this.active = true;
        this.phase = 0;
    }

    noteOff(note) {
        // Drums don't note off
    }

    process(buffer, numSamples, sr) {
        if (!this.active) return;

        const dt = 1 / sr;
        for (let i = 0; i < numSamples; i++) {
            this.level -= dt / this.decay;
            if (this.level <= 0) {
                this.level = 0;
                this.active = false;
                return;
            }

            // Simple kick sound
            const freq = this.pitch * (1 + (1 - this.level) * 2);
            this.phase += freq / sr;
            if (this.phase >= 1) this.phase -= 1;

            let sample = Math.sin(2 * Math.PI * this.phase) * this.level * this.masterVol;
            buffer[i * 2] += sample;
            buffer[i * 2 + 1] += sample;
        }
    }

    reset() {
        this.active = false;
        this.level = 0;
    }
}

// ============================================================
// FX PROCESSOR
// ============================================================
class FxProcessor {
    constructor(id) {
        this.id = id;
        this.masterVol = 0.8;
    }

    setParameter(paramId, value) {
        if (paramId === 70) this.masterVol = value;
    }

    process(buffer, numSamples, sr) {
        for (let i = 0; i < numSamples; i++) {
            buffer[i * 2] *= this.masterVol;
            buffer[i * 2 + 1] *= this.masterVol;

            // Hard limit
            buffer[i * 2] = Math.max(-0.99, Math.min(0.99, buffer[i * 2]));
            buffer[i * 2 + 1] = Math.max(-0.99, Math.min(0.99, buffer[i * 2 + 1]));
        }
    }

    reset() {}
}

// ============================================================
// DSP ENGINE
// ============================================================
class DspEngine {
    constructor() {
        this.sampleRate = 44100;
        this.instruments = new Map();
        this.masterVol = 0.8;
    }

    initialize(sampleRate) {
        this.sampleRate = sampleRate;
        console.log('[JS Fallback] Initialized at', sampleRate, 'Hz');
    }

    registerInstrument(id, type, polyphony) {
        let inst;
        switch (type) {
            case INSTRUMENT_TYPE.SYNTH:
                inst = new SynthInstrument(id, polyphony);
                break;
            case INSTRUMENT_TYPE.DRUM:
                inst = new DrumInstrument(id, id % 8);
                break;
            case INSTRUMENT_TYPE.FX:
                inst = new FxProcessor(id);
                break;
            default:
                return false;
        }
        this.instruments.set(id, inst);
        console.log('[JS Fallback] Registered instrument', id, 'type', type);
        return true;
    }

    setParameter(instrumentId, paramId, value) {
        const inst = this.instruments.get(instrumentId);
        if (inst) {
            inst.setParameter(paramId, value);
        }
    }

    noteOn(instrumentId, note, velocity) {
        const inst = this.instruments.get(instrumentId);
        if (inst) {
            inst.noteOn(note, velocity);
        }
    }

    noteOff(instrumentId, note) {
        const inst = this.instruments.get(instrumentId);
        if (inst) {
            inst.noteOff(note);
        }
    }

    resetInstrument(instrumentId) {
        const inst = this.instruments.get(instrumentId);
        if (inst) {
            inst.reset();
        }
    }

    process(buffer, numSamples) {
        // Process each instrument
        for (const inst of this.instruments.values()) {
            inst.process(buffer, numSamples, this.sampleRate);
        }
    }
}

// ============================================================
// WASM MODULE INTERFACE
// ============================================================
const engine = new DspEngine();
const inputBuffer = new Float32Array(256);
const outputBuffer = new Float32Array(256);

module.exports = {
    // Buffer accessors
    getInputBuffer: () => inputBuffer,
    getOutputBuffer: () => outputBuffer,

    // Lifecycle
    initialize: (sampleRate) => {
        engine.initialize(sampleRate);
    },

    // Processing
    process: (numSamples) => {
        // Copy input to output
        for (let i = 0; i < numSamples * 2; i++) {
            outputBuffer[i] = inputBuffer[i];
        }
        // Process through engine
        engine.process(outputBuffer, numSamples);
    },

    // Instrument management
    registerInstrument: (id, type, polyphony) => {
        engine.registerInstrument(id, type, polyphony);
    },

    // Parameters
    setParameter: (instrumentId, paramId, value) => {
        engine.setParameter(instrumentId, paramId, value);
    },

    // Notes
    noteOn: (instrumentId, note, velocity) => {
        engine.noteOn(instrumentId, note, velocity);
    },
    noteOff: (instrumentId, note) => {
        engine.noteOff(instrumentId, note);
    },

    // Reset
    resetInstrument: (instrumentId) => {
        engine.resetInstrument(instrumentId);
    },

    // Master
    setMasterVolume: (volume) => {
        engine.masterVol = volume;
    },

    // Message handler (alternative interface)
    handleMessage: (type, instrumentId, data1, data2) => {
        switch (type) {
            case MSG.REGISTER_INSTRUMENT:
                engine.registerInstrument(instrumentId, data1, data2);
                break;
            case MSG.PARAM_CHANGE:
                engine.setParameter(instrumentId, data1, data2);
                break;
            case MSG.NOTE_ON:
                engine.noteOn(instrumentId, data1, data2);
                break;
            case MSG.NOTE_OFF:
                engine.noteOff(instrumentId, data1);
                break;
            case MSG.RESET:
                engine.resetInstrument(instrumentId);
                break;
        }
    },

    getStatus: () => engine.instruments.size,
    destroy: () => { engine.instruments.clear(); }
};
