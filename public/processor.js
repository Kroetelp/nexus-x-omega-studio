/**
 * NEXUS-X DSP ENGINE v5.0 - Modular AudioWorklet
 *
 * Supports both WASM and JS Fallback modes.
 * WASM is preferred for performance, JS fallback for development.
 *
 * Message Flow:
 * TypeScript -> InstrumentRegistry -> WorkletMessage -> processor.js -> WASM/JS
 */

// ============================================================
// MESSAGE CONSTANTS
// ============================================================
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

const INSTRUMENT_TYPE = {
    SYNTH: 0,
    DRUM: 1,
    FX: 2,
    SAMPLER: 3,
};

// ============================================================
// JS FALLBACK IMPLEMENTATION (Embedded for development)
// ============================================================

class Voice {
    constructor() {
        this.phase = 0;
        this.frequency = 440;
        this.velocity = 0;
        this.active = false;
        this.note = 0;
        this.attack = 0.01;
        this.decay = 0.1;
        this.sustain = 0.7;
        this.release = 0.3;
        this.envLevel = 0;
        this.envState = 'idle';
        this.filterCutoff = 2000;
        this.filterPrev = 0;
        this.oscType = 1;
    }

    noteOn(note, velocity) {
        this.note = note;
        this.velocity = velocity;
        this.frequency = 440 * Math.pow(2, (note - 69) / 12);
        this.phase = 0;
        this.envState = 'attack';
        this.active = true;
    }

    noteOff() { this.envState = 'release'; }

    process(sr) {
        if (!this.active) return 0;
        const dt = 1 / sr;
        switch (this.envState) {
            case 'attack':
                this.envLevel += dt / this.attack;
                if (this.envLevel >= 1) { this.envLevel = 1; this.envState = 'decay'; }
                break;
            case 'decay':
                this.envLevel -= (1 - this.sustain) * (dt / this.decay);
                if (this.envLevel <= this.sustain) { this.envLevel = this.sustain; this.envState = 'sustain'; }
                break;
            case 'sustain':
                break;
            case 'release':
                this.envLevel -= this.sustain * (dt / this.release);
                if (this.envLevel <= 0) { this.envLevel = 0; this.envState = 'idle'; this.active = false; }
                break;
            default:
                this.active = false;
                return 0;
        }

        let sample = 0;
        const phaseInc = this.frequency / sr;
        switch (this.oscType) {
            case 0: sample = Math.sin(2 * Math.PI * this.phase); break;
            case 1: sample = 2 * this.phase - 1; break;
            case 2: sample = this.phase < 0.5 ? 1 : -1; break;
            case 3: sample = 4 * Math.abs(this.phase - 0.5) - 1; break;
        }
        this.phase += phaseInc;
        if (this.phase >= 1) this.phase -= 1;

        const rc = 1 / (2 * Math.PI * this.filterCutoff);
        const alpha = dt / (rc + dt);
        sample = this.filterPrev + alpha * (sample - this.filterPrev);
        this.filterPrev = sample;

        return sample * this.envLevel * this.velocity;
    }
}

class JsSynth {
    constructor(id, polyphony = 8) {
        this.id = id;
        this.voices = [];
        this.masterVol = 0.8;
        this.oscType = 1;
        this.filterCutoff = 2000;
        this.attack = 0.01;
        this.decay = 0.1;
        this.sustain = 0.7;
        this.release = 0.3;
        for (let i = 0; i < polyphony; i++) this.voices.push(new Voice());
    }

    setParameter(p, v) {
        switch (p) {
            case 0: this.oscType = Math.floor(v); break;
            case 11: this.filterCutoff = v; break;
            case 20: this.attack = v; break;
            case 21: this.decay = v; break;
            case 22: this.sustain = v; break;
            case 23: this.release = v; break;
            case 60: this.masterVol = v; break;
        }
    }

    noteOn(note, vel) {
        for (const v of this.voices) {
            if (!v.active) {
                v.oscType = this.oscType;
                v.filterCutoff = this.filterCutoff;
                v.attack = this.attack;
                v.decay = this.decay;
                v.sustain = this.sustain;
                v.release = this.release;
                v.noteOn(note, vel);
                return;
            }
        }
    }

    noteOff(note) { for (const v of this.voices) if (v.active && v.note === note) v.noteOff(); }

    process(buf, n, sr) {
        for (let i = 0; i < n; i++) {
            let s = 0;
            for (const v of this.voices) if (v.active) s += v.process(sr);
            s *= this.masterVol;
            buf[i * 2] += s;
            buf[i * 2 + 1] += s;
        }
    }

    reset() { for (const v of this.voices) v.active = false; }
}

class JsDrum {
    constructor(id) {
        this.id = id;
        this.masterVol = 0.8;
        this.active = false;
        this.level = 0;
        this.decay = 0.2;
        this.phase = 0;
        this.pitch = 50;
    }

    setParameter(p, v) {
        if (p === 0) this.pitch = v;
        if (p === 1) this.decay = v;
        if (p === 60) this.masterVol = v;
    }

    noteOn(n, vel) { this.level = vel; this.active = true; this.phase = 0; }
    noteOff() {}

    process(buf, n, sr) {
        if (!this.active) return;
        const dt = 1 / sr;
        for (let i = 0; i < n; i++) {
            this.level -= dt / this.decay;
            if (this.level <= 0) { this.level = 0; this.active = false; return; }
            const freq = this.pitch * (1 + (1 - this.level) * 2);
            this.phase += freq / sr;
            if (this.phase >= 1) this.phase -= 1;
            const s = Math.sin(2 * Math.PI * this.phase) * this.level * this.masterVol;
            buf[i * 2] += s;
            buf[i * 2 + 1] += s;
        }
    }

    reset() { this.active = false; this.level = 0; }
}

class JsFx {
    constructor(id) { this.id = id; this.masterVol = 0.8; }
    setParameter(p, v) { if (p === 70) this.masterVol = v; }
    process(buf, n, sr) {
        for (let i = 0; i < n; i++) {
            buf[i * 2] *= this.masterVol;
            buf[i * 2 + 1] *= this.masterVol;
            buf[i * 2] = Math.max(-0.99, Math.min(0.99, buf[i * 2]));
            buf[i * 2 + 1] = Math.max(-0.99, Math.min(0.99, buf[i * 2 + 1]));
        }
    }
    reset() {}
}

// ============================================================
// FM SYNTH - 4 Operator Frequency Modulation
// ============================================================

class FmOperator {
    constructor() {
        this.phase = 0;
        this.ratio = 1;
        this.level = 0.5;
        this.feedback = 0;
        this.attack = 0.001;
        this.decay = 0.1;
        this.sustain = 0.5;
        this.release = 0.3;
        this.envLevel = 0;
        this.envState = 'idle';
        this.lastOut = 0;
    }

    noteOn() {
        this.phase = 0;
        this.envState = 'attack';
        this.envLevel = 0;
    }

    noteOff() {
        this.envState = 'release';
    }

    process(dt, baseFreq, modulation) {
        // ADSR
        switch (this.envState) {
            case 'attack':
                this.envLevel += dt / this.attack;
                if (this.envLevel >= 1) { this.envLevel = 1; this.envState = 'decay'; }
                break;
            case 'decay':
                this.envLevel -= (1 - this.sustain) * (dt / this.decay);
                if (this.envLevel <= this.sustain) { this.envLevel = this.sustain; this.envState = 'sustain'; }
                break;
            case 'sustain':
                break;
            case 'release':
                this.envLevel -= this.sustain * (dt / this.release);
                if (this.envLevel <= 0) { this.envLevel = 0; this.envState = 'idle'; }
                break;
            case 'idle':
                return 0;
        }

        // FM synthesis: freq = baseFreq * ratio + modulation
        const freq = baseFreq * this.ratio;
        const phaseInc = freq / 44100;

        // Phase with feedback and modulation
        this.phase += phaseInc + (this.lastOut * this.feedback * 0.3) + (modulation * 0.5);
        if (this.phase >= 1) this.phase -= 1;
        if (this.phase < 0) this.phase += 1;

        // Sine output
        const out = Math.sin(2 * Math.PI * this.phase) * this.envLevel * this.level;
        this.lastOut = out;
        return out;
    }

    isActive() { return this.envState !== 'idle'; }
    reset() { this.phase = 0; this.envLevel = 0; this.envState = 'idle'; this.lastOut = 0; }
}

class JsFmSynth {
    constructor(id, polyphony = 4) {
        this.id = id;
        this.polyphony = polyphony;
        this.voices = [];
        this.masterVol = 0.7;
        this.pan = 0;
        this.algorithm = 0;
        this.glide = 0;

        // 4 operators per voice
        for (let i = 0; i < polyphony; i++) {
            this.voices.push({
                note: 0,
                freq: 440,
                active: false,
                ops: [new FmOperator(), new FmOperator(), new FmOperator(), new FmOperator()],
                glideFreq: 440,
                glideTarget: 440,
            });
        }
    }

    setParameter(p, v) {
        // Operator params: base + opIndex * 10
        for (let op = 0; op < 4; op++) {
            const base = op * 10;
            if (p === base + 0) { for (const v of this.voices) v.ops[op].ratio = v; }
            if (p === base + 1) { for (const v of this.voices) v.ops[op].level = v; }
            if (p === base + 2) { for (const v of this.voices) v.ops[op].feedback = v; }
            if (p === base + 3) { for (const v of this.voices) v.ops[op].attack = v; }
            if (p === base + 4) { for (const v of this.voices) v.ops[op].decay = v; }
            if (p === base + 5) { for (const v of this.voices) v.ops[op].sustain = v; }
            if (p === base + 6) { for (const v of this.voices) v.ops[op].release = v; }
        }
        if (p === 40) this.algorithm = Math.floor(v);
        if (p === 44) this.glide = v;
        if (p === 60) this.masterVol = v;
        if (p === 61) this.pan = v;
    }

    noteOn(note, vel) {
        const freq = 440 * Math.pow(2, (note - 69) / 12);

        for (const voice of this.voices) {
            if (!voice.active) {
                voice.note = note;
                voice.freq = freq;
                voice.glideFreq = freq;
                voice.glideTarget = freq;
                voice.active = true;
                voice.velocity = vel;
                for (const op of voice.ops) op.noteOn();
                return;
            }
        }
    }

    noteOff(note) {
        for (const voice of this.voices) {
            if (voice.active && voice.note === note) {
                for (const op of voice.ops) op.noteOff();
            }
        }
    }

    processAlgorithm(ops, freq, dt) {
        const [op1, op2, op3, op4] = ops;
        let out = 0;

        switch (this.algorithm) {
            case 0: // Op1 <- Op2 (simple FM)
                out = op1.process(dt, freq, op2.process(dt, freq, 0));
                break;
            case 1: // Cascade: Op1 <- Op2 <- Op3
                out = op1.process(dt, freq, op2.process(dt, freq, op3.process(dt, freq, 0)));
                break;
            case 2: // Parallel modulators: Op1 <- (Op2 + Op3)
                const mod2 = op2.process(dt, freq, 0);
                const mod3 = op3.process(dt, freq, 0);
                out = op1.process(dt, freq, mod2 + mod3);
                break;
            case 3: // Dual carriers
                out = op1.process(dt, freq, op2.process(dt, freq, 0)) +
                      op3.process(dt, freq, op4.process(dt, freq, 0));
                break;
            case 4: // Independent pairs
                out = (op1.process(dt, freq, op2.process(dt, freq, 0)) +
                       op3.process(dt, freq, op4.process(dt, freq, 0))) * 0.5;
                break;
            case 5: // Mixed
                out = op1.process(dt, freq, op2.process(dt, freq, 0)) + op3.process(dt, freq, 0) * 0.5;
                break;
            case 6: // Feedback add
                out = op1.process(dt, freq, op2.process(dt, freq, 0)) + op3.process(dt, freq, op3.lastOut * 0.5);
                break;
            case 7: // Additive
                out = (op1.process(dt, freq, 0) + op2.process(dt, freq, 0) +
                       op3.process(dt, freq, 0) + op4.process(dt, freq, 0)) * 0.5;
                break;
        }

        return out;
    }

    process(buf, n, sr) {
        const dt = 1 / sr;

        for (const voice of this.voices) {
            if (!voice.active) continue;

            // Check if all operators are idle
            let anyActive = false;
            for (const op of voice.ops) if (op.isActive()) anyActive = true;
            if (!anyActive) { voice.active = false; continue; }

            // Glide
            if (this.glide > 0 && voice.glideFreq !== voice.glideTarget) {
                const glideSpeed = dt / this.glide;
                if (Math.abs(voice.glideTarget - voice.glideFreq) < 1) {
                    voice.glideFreq = voice.glideTarget;
                } else {
                    voice.glideFreq += (voice.glideTarget - voice.glideFreq) * glideSpeed * 10;
                }
            }

            for (let i = 0; i < n; i++) {
                const sample = this.processAlgorithm(voice.ops, voice.glideFreq, dt) * voice.velocity;
                buf[i * 2] += sample * this.masterVol * (1 - Math.max(0, this.pan));
                buf[i * 2 + 1] += sample * this.masterVol * (1 + Math.min(0, this.pan));
            }
        }
    }

    reset() {
        for (const voice of this.voices) {
            voice.active = false;
            for (const op of voice.ops) op.reset();
        }
    }
}

// ============================================================
// BRASS / WIND SYNTH (Physical modeling-inspired)
// ============================================================
class JsBrassSynth {
    constructor(id, polyphony = 4) {
        this.id = id;
        this.polyphony = polyphony;

        // Parameters (BrassParam enum)
        this.breathPressure = 0.7;
        this.lipTension = 0.5;
        this.vibratoRate = 5;
        this.vibratoDepth = 0.2;
        this.growl = 0;

        // Formants
        this.formant1 = { freq: 500, gain: 0.8 };
        this.formant2 = { freq: 1500, gain: 0.6 };
        this.formant3 = { freq: 2500, gain: 0.4 };

        // Envelope
        this.attack = 0.03;
        this.decay = 0.1;
        this.sustain = 0.8;
        this.release = 0.2;

        // Special
        this.tongueAttack = 0.5;
        this.flutter = 0;
        this.muteType = 0;
        this.muteAmount = 0;

        // Pitch
        this.glide = 0.02;

        // Master
        this.masterVol = 0.7;
        this.pan = 0;

        // Voice state
        this.voices = [];
        for (let i = 0; i < polyphony; i++) {
            this.voices.push({
                active: false,
                note: 60,
                velocity: 0,
                env: 0,
                envState: 'off',
                phase: 0,
                breathPhase: 0,
                vibratoPhase: 0,
                glideFreq: 440,
                glideTarget: 440,
                lipState: 0,
            });
        }
    }

    setParameter(p, v) {
        switch (p) {
            case 0: this.breathPressure = v; break;
            case 1: this.lipTension = v; break;
            case 2: this.vibratoRate = v; break;
            case 3: this.vibratoDepth = v; break;
            case 4: this.growl = v; break;

            case 10: this.formant1.freq = v; break;
            case 11: this.formant1.gain = v; break;
            case 12: this.formant2.freq = v; break;
            case 13: this.formant2.gain = v; break;
            case 14: this.formant3.freq = v; break;
            case 15: this.formant3.gain = v; break;

            case 20: this.attack = v; break;
            case 21: this.decay = v; break;
            case 22: this.sustain = v; break;
            case 23: this.release = v; break;

            case 30: this.tongueAttack = v; break;
            case 31: this.flutter = v; break;

            case 40: this.muteType = v; break;
            case 41: this.muteAmount = v; break;

            case 50: this.glide = v; break;

            case 60: this.masterVol = v; break;
            case 61: this.pan = v; break;
        }
    }

    noteOn(note, vel) {
        // Find free voice
        let voice = this.voices.find(v => !v.active);
        if (!voice) voice = this.voices[0]; // Steal

        const freq = 440 * Math.pow(2, (note - 69) / 12);
        voice.active = true;
        voice.note = note;
        voice.velocity = vel;
        voice.env = 0;
        voice.envState = 'attack';
        voice.phase = 0;
        voice.breathPhase = Math.random() * Math.PI * 2;
        voice.vibratoPhase = 0;
        voice.glideFreq = this.glide > 0 ? voice.glideFreq : freq;
        voice.glideTarget = freq;
        voice.lipState = 0;
    }

    noteOff(note) {
        for (const voice of this.voices) {
            if (voice.active && voice.note === note) {
                voice.envState = 'release';
            }
        }
    }

    // Simple formant filter approximation
    applyFormants(sample, freq, dt) {
        // Approximate formants using resonant filtering
        let out = sample * 0.3;

        // Formant 1 (mouth cavity)
        const f1Coef = Math.exp(-Math.PI * dt * this.formant1.freq * 0.5);
        out += sample * this.formant1.gain * 0.3 * Math.sin(freq * dt * 2 * Math.PI * (this.formant1.freq / freq));

        // Formant 2 (throat)
        const f2Coef = Math.exp(-Math.PI * dt * this.formant2.freq * 0.3);
        out += sample * this.formant2.gain * 0.2 * Math.sin(freq * dt * 4 * Math.PI * (this.formant2.freq / freq));

        // Formant 3 (bell)
        out += sample * this.formant3.gain * 0.1 * Math.sin(freq * dt * 6 * Math.PI * (this.formant3.freq / freq));

        return out;
    }

    process(buf, n, sr) {
        const dt = 1 / sr;

        for (const voice of this.voices) {
            if (!voice.active && voice.envState === 'off') continue;

            // Envelope
            if (voice.envState === 'attack') {
                const attackRate = this.attack > 0 ? dt / this.attack : 1;
                // Tongue attack adds initial transient
                const tongueBoost = this.tongueAttack * 0.3 * Math.exp(-voice.env * 20);
                voice.env += attackRate * (1 + tongueBoost);
                if (voice.env >= 1) {
                    voice.env = 1;
                    voice.envState = 'decay';
                }
            } else if (voice.envState === 'decay') {
                const decayRate = this.decay > 0 ? dt / this.decay : 0;
                voice.env -= decayRate * (1 - this.sustain);
                if (voice.env <= this.sustain) {
                    voice.env = this.sustain;
                    voice.envState = 'sustain';
                }
            } else if (voice.envState === 'release') {
                const releaseRate = this.release > 0 ? dt / this.release : 1;
                voice.env -= releaseRate;
                if (voice.env <= 0) {
                    voice.env = 0;
                    voice.envState = 'off';
                    voice.active = false;
                    continue;
                }
            }

            // Glide
            if (this.glide > 0 && voice.glideFreq !== voice.glideTarget) {
                const glideSpeed = dt / this.glide;
                voice.glideFreq += (voice.glideTarget - voice.glideFreq) * glideSpeed * 5;
            }

            // Vibrato LFO
            voice.vibratoPhase += dt * this.vibratoRate * Math.PI * 2;
            const vibrato = Math.sin(voice.vibratoPhase) * this.vibratoDepth * 0.1;

            // Growl modulation
            voice.breathPhase += dt * 30 * Math.PI * 2;
            const growlMod = this.growl * Math.sin(voice.breathPhase) * 0.3;

            // Flutter tongue effect
            const flutterMod = this.flutter * Math.sin(voice.breathPhase * 8) * 0.2;

            // Calculate frequency with modulations
            const freq = voice.glideFreq * (1 + vibrato + growlMod + flutterMod);

            // Lip reed simulation (simplified physical model)
            // The lip oscillates based on pressure difference
            const lipFreq = freq * (0.5 + this.lipTension * 0.5);
            const pressure = this.breathPressure * voice.env;
            voice.lipState += dt * lipFreq * Math.PI * 2;
            const lipOsc = Math.sin(voice.lipState);

            // Non-linear reed behavior
            let reedOut = lipOsc * pressure;
            if (reedOut > 0) reedOut *= (1 - this.lipTension * 0.3);
            if (reedOut < 0) reedOut *= 0.5; // Asymmetric

            // Add breath noise
            const breathNoise = (Math.random() * 2 - 1) * 0.1 * pressure * (1 - this.lipTension);

            // Combine
            let sample = (reedOut + breathNoise) * voice.velocity * pressure;

            // Apply formants
            sample = this.applyFormants(sample, freq, dt);

            // Mute effect (low-pass + notch)
            if (this.muteType > 0 && this.muteAmount > 0) {
                const muteFactor = 1 - this.muteAmount * 0.5;
                sample *= muteFactor;
                // Add metallic resonance for harmon mute
                if (this.muteType === 2) {
                    sample += sample * 0.3 * Math.sin(voice.phase * 3);
                }
            }

            // Soft clipping for warmth
            sample = Math.tanh(sample);

            // Output
            for (let i = 0; i < n; i++) {
                buf[i * 2] += sample * this.masterVol * (1 - Math.max(0, this.pan));
                buf[i * 2 + 1] += sample * this.masterVol * (1 + Math.min(0, this.pan));
            }
        }
    }

    reset() {
        for (const voice of this.voices) {
            voice.active = false;
            voice.envState = 'off';
        }
    }
}

class JsEngine {
    constructor() {
        this.sampleRate = 44100;
        this.instruments = new Map();
        this.masterVol = 0.8;
    }

    initialize(sr) { this.sampleRate = sr; }
    register(id, type, poly) {
        let inst;
        switch (type) {
            case 0: inst = new JsSynth(id, poly); break;      // Standard synth
            case 1: inst = new JsDrum(id); break;              // Drum
            case 2: inst = new JsFx(id); break;                // FX processor
            case 3: inst = new JsFmSynth(id, poly || 4); break; // FM Synth
            case 5: inst = new JsBrassSynth(id, poly || 4); break; // Brass/Wind
            default: return false;
        }
        this.instruments.set(id, inst);
        console.log(`[JS Engine] Created instrument type ${type}, id ${id}`);
        return true;
    }
    setParameter(id, p, v) { this.instruments.get(id)?.setParameter(p, v); }
    noteOn(id, n, v) { this.instruments.get(id)?.noteOn(n, v); }
    noteOff(id, n) { this.instruments.get(id)?.noteOff(n); }
    reset(id) { this.instruments.get(id)?.reset(); }
    process(buf, n) { for (const i of this.instruments.values()) i.process(buf, n, this.sampleRate); }
}

// ============================================================
// AUDIO WORKLET PROCESSOR
// ============================================================

class NexusDspEngine extends AudioWorkletProcessor {
    constructor() {
        super();

        // === Mode: 'wasm' or 'js' ===
        this.mode = 'js';

        // === JS Fallback Engine ===
        this.jsEngine = new JsEngine();
        this.jsEngine.initialize(sampleRate);

        // === WASM State ===
        this.wasmInstance = null;
        this.wasmExports = null;
        this.wasmMemory = null;
        this.fnProcess = null;
        this.fnSetParameter = null;
        this.fnNoteOn = null;
        this.fnNoteOff = null;
        this.fnRegisterInstrument = null;
        this.inputBufferOffset = 0;
        this.outputBufferOffset = 0;

        // === Instrument Registry ===
        this.registeredInstruments = new Map();

        // === Metering ===
        this.meterPeakL = 0;
        this.meterPeakR = 0;
        this.meterFrameCount = 0;
        this.METER_INTERVAL = 4096;

        // === Message Handler ===
        this.port.onmessage = (e) => this.handleMessage(e.data);

        console.log('[Worklet] NexusDspEngine v5.0 initialized (JS Fallback mode)');

        // Signal ready
        this.port.postMessage({ type: MSG.WASM_READY, mode: 'js' });
    }

    handleMessage(msg) {
        if (typeof msg.type !== 'number') return;

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
        }
    }

    async loadWasm(wasmModule) {
        try {
            const instance = await WebAssembly.instantiate(wasmModule, { env: {} });
            this.wasmInstance = instance.exports;
            this.wasmExports = instance.exports;
            this.wasmMemory = new Float32Array(this.wasmExports.memory.buffer);

            this.fnProcess = this.wasmExports.process;
            this.fnSetParameter = this.wasmExports.setParameter;
            this.fnNoteOn = this.wasmExports.noteOn;
            this.fnNoteOff = this.wasmExports.noteOff;
            this.fnRegisterInstrument = this.wasmExports.registerInstrument;

            if (this.wasmExports.initialize) this.wasmExports.initialize(sampleRate);

            this.inputBufferOffset = (this.wasmExports.getInputBuffer?.() || 0) / 4;
            this.outputBufferOffset = (this.wasmExports.getOutputBuffer?.() || 0) / 4;

            this.mode = 'wasm';
            console.log('[Worklet] WASM loaded, switching to WASM mode');

            // Re-register instruments to WASM
            for (const [id, inst] of this.registeredInstruments) {
                if (this.fnRegisterInstrument) {
                    this.fnRegisterInstrument(id, inst.type, inst.polyphony);
                }
            }

            this.port.postMessage({ type: MSG.WASM_READY, mode: 'wasm' });
        } catch (err) {
            console.error('[Worklet] WASM load failed, staying in JS mode:', err);
        }
    }

    registerInstrument(id, type, polyphony) {
        this.registeredInstruments.set(id, { type, polyphony, enabled: true });

        // Always register in JS engine
        this.jsEngine.register(id, type, polyphony);

        // Also register in WASM if available
        if (this.mode === 'wasm' && this.fnRegisterInstrument) {
            this.fnRegisterInstrument(id, type, polyphony);
        }

        console.log(`[Worklet] Registered instrument ${id} (type=${type})`);
        this.port.postMessage({ type: MSG.INSTRUMENT_READY, instrumentId: id });
    }

    routeParamChange(instId, paramId, value) {
        if (!isFinite(value)) return;
        const safeVal = Math.max(-1e6, Math.min(1e6, value));

        this.jsEngine.setParameter(instId, paramId, safeVal);

        if (this.mode === 'wasm' && this.fnSetParameter) {
            this.fnSetParameter(instId, paramId, safeVal);
        }
    }

    routeNoteOn(instId, note, velocity) {
        const safeNote = Math.max(0, Math.min(127, Math.floor(note)));
        const safeVel = Math.max(0, Math.min(1, velocity));

        this.jsEngine.noteOn(instId, safeNote, safeVel);

        if (this.mode === 'wasm' && this.fnNoteOn) {
            this.fnNoteOn(instId, safeNote, safeVel);
        }
    }

    routeNoteOff(instId, note) {
        const safeNote = Math.max(0, Math.min(127, Math.floor(note)));

        this.jsEngine.noteOff(instId, safeNote);

        if (this.mode === 'wasm' && this.fnNoteOff) {
            this.fnNoteOff(instId, safeNote);
        }
    }

    resetInstrument(instId) {
        this.jsEngine.reset(instId);
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];
        const input = inputs[0];
        const outputL = output[0];
        const outputR = output[1] || output[0];

        // Clear output
        for (let i = 0; i < 128; i++) {
            outputL[i] = 0;
            outputR[i] = 0;
        }

        // JS Fallback always runs (for reliability)
        const jsBuffer = new Float32Array(256);
        if (input && input.length > 0) {
            const inputL = input[0];
            const inputR = input[1] || input[0];
            for (let i = 0; i < 128; i++) {
                jsBuffer[i * 2] = inputL[i];
                jsBuffer[i * 2 + 1] = inputR[i];
            }
        }
        this.jsEngine.process(jsBuffer, 128);

        // Mix JS output
        for (let i = 0; i < 128; i++) {
            outputL[i] += jsBuffer[i * 2];
            outputR[i] += jsBuffer[i * 2 + 1];
        }

        // WASM path (if available and preferred)
        if (this.mode === 'wasm' && this.fnProcess) {
            this.wasmMemory = new Float32Array(this.wasmExports.memory.buffer);

            // Copy to WASM
            for (let i = 0; i < 128; i++) {
                this.wasmMemory[this.inputBufferOffset + i * 2] = outputL[i];
                this.wasmMemory[this.inputBufferOffset + i * 2 + 1] = outputR[i];
            }

            this.fnProcess(128);

            // Copy from WASM
            for (let i = 0; i < 128; i++) {
                outputL[i] = this.wasmMemory[this.outputBufferOffset + i * 2];
                outputR[i] = this.wasmMemory[this.outputBufferOffset + i * 2 + 1];
            }
        }

        // Metering
        this.updateMeters(outputL, outputR);

        return true;
    }

    updateMeters(l, r) {
        for (let i = 0; i < l.length; i++) {
            this.meterPeakL = Math.max(this.meterPeakL, Math.abs(l[i]));
            this.meterPeakR = Math.max(this.meterPeakR, Math.abs(r[i]));
        }
        this.meterFrameCount += l.length;
        if (this.meterFrameCount >= this.METER_INTERVAL) {
            this.port.postMessage({ type: MSG.METER_UPDATE, peakL: this.meterPeakL, peakR: this.meterPeakR });
            this.meterPeakL = 0;
            this.meterPeakR = 0;
            this.meterFrameCount = 0;
        }
    }
}

registerProcessor('nexus-dsp-engine', NexusDspEngine);
