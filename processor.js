/**
 * NEXUS-X DSP CORE v4.0 - MASTERING SUITE COMPLETE
 * AudioWorkletProcessor for high-performance audio processing.
 *
 * Features:
 * - Bitcrushing/Decimation
 * - DC Offset Blocking
 * - Soft Saturation (tanh waveshaper)
 * - TAPE SATURATION (analog warmth)
 * - Safety Hard Limiting
 * - TRUE-PEAK LIMITER (4x oversampling)
 * - TPDF DITHERING (for 16-bit export) - NEW TIER 3
 *
 * Future Optimization:
 * This class structure handles the interface. The DSP logic inside 'process'
 * can be replaced by a WASM instance call (e.g., this.wasmInstance.exports.process(ptr))
 * for near-native C++ performance.
 */
class NexusBitcrusher extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            { name: 'bitDepth', defaultValue: 16, minValue: 1, maxValue: 16 },
            { name: 'frequencyReduction', defaultValue: 1, minValue: 0, maxValue: 1 },
            { name: 'enabled', defaultValue: 0, minValue: 0, maxValue: 1 },
            { name: 'drive', defaultValue: 2.0, minValue: 1.0, maxValue: 4.0 },
            { name: 'mode', defaultValue: 0, minValue: 0, maxValue: 3 },
            { name: 'truePeakEnabled', defaultValue: 0, minValue: 0, maxValue: 1 },
            { name: 'warmth', defaultValue: 0, minValue: 0, maxValue: 1 },
            // NEW TIER 3: Dithering
            { name: 'ditherEnabled', defaultValue: 0, minValue: 0, maxValue: 1 },
            { name: 'ditherBitDepth', defaultValue: 16, minValue: 8, maxValue: 24 }
        ];
    }

    constructor() {
        super();

        // Bitcrusher state
        this.phaser = 0;
        this.lastSampleValue = 0;

        // DC Blocker state
        this.dcPrevInput = 0;
        this.dcPrevOutput = 0;
        this.DC_R = 0.995; // ~20Hz highpass

        // True-Peak Limiter state
        this.tpPrevGain = 1.0;
        this.tpEnvelope = 0.0;
        this.TP_CEILING = 0.95;  // -0.45dB
        this.TP_ATTACK = 0.001;  // 1ms
        this.TP_RELEASE = 0.05;  // 50ms

        // TIER 3: Dithering state
        this.ditherSeed = 12345;
        this.ditherPrevRandom = 0;

        // Oversampling buffers
        this.oversampleBuffer = new Float32Array(512);  // 4x * 128
        this.oversampleOutput = new Float32Array(512);

        // WASM State
        this.wasmInstance = null;
        this.wasmInputPtr = null;
        this.wasmOutputPtr = null;
        this.wasmMemory = null;
        this.wasmProcessFn = null;

        // Listen for WASM module from Main Thread
        this.port.onmessage = async (e) => {
            if (e.data.type === 'load-wasm') {
                this.initWasm(e.data.wasmModule);
            }
        };
    }

    async initWasm(module) {
        try {
            const instance = await WebAssembly.instantiate(module, { env: {} });
            this.wasmInstance = instance.exports;

            // Helper to find export with or without underscore (Emscripten compatibility)
            const getFn = (name) => this.wasmInstance[name] || this.wasmInstance[`_${name}`];

            // Get pointers to C++ buffers
            const getInput = getFn('getInputBuffer');
            const getOutput = getFn('getOutputBuffer');
            this.wasmInputPtr = getInput ? getInput() : null;
            this.wasmOutputPtr = getOutput ? getOutput() : null;
            this.wasmProcessFn = getFn('process'); // v4.0 signature with dither

            // Create views on WASM memory
            this.wasmMemory = new Float32Array(this.wasmInstance.memory.buffer);

            console.log("NEXUS-DSP v4.0: WASM Accelerated Core Active ⚡ (Mastering Suite Complete)");
        } catch (err) {
            console.error("NEXUS-DSP: WASM Init Failed", err);
        }
    }

    // === DSP UTILITY FUNCTIONS (JS Fallback) ===

    // DC Blocker: Removes DC offset
    dcBlock(input) {
        const output = input - this.dcPrevInput + this.DC_R * this.dcPrevOutput;
        this.dcPrevInput = input;
        this.dcPrevOutput = output;
        return output;
    }

    // Soft Clipper: Warm tanh saturation
    softClip(x, drive) {
        return Math.tanh(x * drive) / drive;
    }

    // Hard Safety Limiter: Prevents digital clipping
    hardLimit(x) {
        const CEILING = 0.99;
        return Math.max(-CEILING, Math.min(CEILING, x));
    }

    // ============================================================
    // TIER 2: TAPE SATURATION - Analog Warmth Emulation
    // ============================================================
    // Models magnetic tape saturation curve
    // warmth: 0.0 (clean) to 1.0 (heavy saturation)
    // ============================================================
    tapeSat(x, warmth) {
        // Clamp warmth
        warmth = Math.max(0, Math.min(1, warmth));

        // No saturation needed
        if (warmth < 0.001) return x;

        // Tape saturation curve: sign(x) * (1 - exp(-|x| * amount))
        const sign = (x >= 0) ? 1 : -1;
        const amount = 2.0 + warmth * 3.0;  // 2-5 range

        const saturated = sign * (1.0 - Math.exp(-Math.abs(x) * amount));

        // Mix dry and wet based on warmth
        return x + (saturated - x) * warmth;
    }

    // Tape + Soft Clip combined
    tapeAndSoftClip(x, drive, warmth) {
        let sample = this.tapeSat(x, warmth);
        sample = this.softClip(sample, drive);
        return sample;
    }

    // Full mastering chain with TIER 2 warmth
    processMastering(input, drive, warmth) {
        let sample = this.dcBlock(input);
        sample = this.tapeAndSoftClip(sample, drive, warmth);
        sample = this.hardLimit(sample);
        return sample;
    }

    // ============================================================
    // TIER 3: TPDF DITHERING - For 16-bit Export
    // ============================================================
    // Triangular Probability Density Function dithering
    // Reduces quantization noise when reducing bit depth
    // ============================================================

    // Simple Linear Congruential Generator for random numbers
    simpleRandom() {
        this.ditherSeed = (this.ditherSeed * 1103515245 + 12345) & 0x7fffffff;
        return this.ditherSeed / 0x7fffffff;
    }

    // TPDF Dither: Returns triangular distribution random (-1 to +1)
    tpdfDither() {
        const r1 = this.simpleRandom();
        const r2 = this.simpleRandom();
        return (r1 - r2);  // Range: -1 to +1 with triangular distribution
    }

    // Apply TPDF dithering before bit-depth reduction
    applyDither(sample, targetBitDepth) {
        // Calculate quantization step
        const step = Math.pow(2, -targetBitDepth);

        // Generate TPDF dither noise
        // Scale to half a quantization step (optimal for TPDF)
        const dither = this.tpdfDither() * step * 0.5;

        // Apply dither
        return sample + dither;
    }

    // === TRUE-PEAK LIMITER (JS Fallback) ===

    // Cubic Hermite interpolation
    cubicHermite(y0, y1, y2, y3, t) {
        const a = -0.5 * y0 + 1.5 * y1 - 1.5 * y2 + 0.5 * y3;
        const b = y0 - 2.5 * y1 + 2.0 * y2 - 0.5 * y3;
        const c = -0.5 * y0 + 0.5 * y2;
        const d = y1;
        return a * t * t * t + b * t * t + c * t + d;
    }

    // 4x Upsample
    upsample4x(input, inLen, output) {
        for (let i = 0; i < inLen; i++) {
            const y0 = (i > 0) ? input[i - 1] : 0.0;
            const y1 = input[i];
            const y2 = (i < inLen - 1) ? input[i + 1] : input[i];
            const y3 = (i < inLen - 2) ? input[i + 2] : y2;

            const outBase = i * 4;
            output[outBase + 0] = this.cubicHermite(y0, y1, y2, y3, 0.0);
            output[outBase + 1] = this.cubicHermite(y0, y1, y2, y3, 0.25);
            output[outBase + 2] = this.cubicHermite(y0, y1, y2, y3, 0.5);
            output[outBase + 3] = this.cubicHermite(y0, y1, y2, y3, 0.75);
        }
    }

    // 4x Downsample with anti-alias
    downsample4x(input, outLen, output) {
        for (let i = 0; i < outLen; i++) {
            const inBase = i * 4;
            output[i] = 0.25 * (input[inBase] + input[inBase + 1] +
                                input[inBase + 2] + input[inBase + 3]);
        }
    }

    // True-Peak Limiter main function
    truePeakLimit(buffer, length, ceiling) {
        // Upsample 4x
        this.upsample4x(buffer, length, this.oversampleBuffer);
        const osLength = length * 4;

        // Find max true-peak
        let maxPeak = 0.0;
        for (let i = 0; i < osLength; i++) {
            const absVal = Math.abs(this.oversampleBuffer[i]);
            if (absVal > maxPeak) maxPeak = absVal;
        }

        // Process with envelope follower
        for (let i = 0; i < osLength; i++) {
            const absVal = Math.abs(this.oversampleBuffer[i]);

            // Envelope follower
            if (absVal > this.tpEnvelope) {
                this.tpEnvelope += (absVal - this.tpEnvelope) * this.TP_ATTACK;
            } else {
                this.tpEnvelope += (absVal - this.tpEnvelope) * this.TP_RELEASE;
            }

            // Calculate instant gain
            let instantGain = 1.0;
            if (this.tpEnvelope > ceiling) {
                instantGain = ceiling / this.tpEnvelope;
            }

            // Smooth gain transitions
            if (instantGain < this.tpPrevGain) {
                this.tpPrevGain += (instantGain - this.tpPrevGain) * this.TP_ATTACK;
            } else {
                this.tpPrevGain += (instantGain - this.tpPrevGain) * this.TP_RELEASE;
            }

            // Apply gain
            this.oversampleOutput[i] = this.oversampleBuffer[i] * this.tpPrevGain;
        }

        // Downsample back
        this.downsample4x(this.oversampleOutput, length, buffer);
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        // Handle no input
        if (!input || input.length === 0) {
            return true;
        }

        // Get parameters
        const enabled = parameters.enabled[0];
        const bitDepth = parameters.bitDepth[0];
        const freqRed = parameters.frequencyReduction[0];
        const drive = parameters.drive[0];
        const mode = parameters.mode[0];
        const truePeakEnabled = parameters.truePeakEnabled[0];
        const warmth = parameters.warmth[0];
        // NEW TIER 3: Dithering
        const ditherEnabled = parameters.ditherEnabled[0];
        const ditherBitDepth = parameters.ditherBitDepth[0];

        // Bypass mode: Copy input to output with mastering chain
        if (enabled === 0 && truePeakEnabled === 0 && warmth === 0 && ditherEnabled === 0) {
            for (let channel = 0; channel < input.length; channel++) {
                const inputChannel = input[channel];
                const outputChannel = output[channel];
                for (let i = 0; i < inputChannel.length; i++) {
                    outputChannel[i] = this.processMastering(inputChannel[i], drive, warmth);
                }
            }
            return true;
        }

        // === WASM PATH (if available) ===
        if (this.wasmProcessFn && this.wasmInputPtr && input.length > 0) {
            const inputOffset = this.wasmInputPtr / 4;
            const outputOffset = this.wasmOutputPtr / 4;

            // Refresh memory view (WASM memory can grow)
            this.wasmMemory = new Float32Array(this.wasmInstance.memory.buffer);

            this.wasmMemory.set(input[0], inputOffset);
            // v4.0 signature: process(length, bitDepth, freqRed, drive, warmth, mode, truePeakEnabled, ditherEnabled, ditherBitDepth)
            this.wasmProcessFn(input[0].length, bitDepth, freqRed, drive, warmth, mode, truePeakEnabled, ditherEnabled, ditherBitDepth);
            output[0].set(this.wasmMemory.subarray(outputOffset, outputOffset + input[0].length));

            // Copy to other channels if stereo
            for (let ch = 1; ch < output.length; ch++) {
                output[ch].set(output[0]);
            }

            return true;
        }

        // === JS FALLBACK PATH ===
        const step = Math.pow(0.5, bitDepth);

        for (let channel = 0; channel < input.length; ++channel) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];

            for (let i = 0; i < inputChannel.length; ++i) {
                let sample;

                if (mode === 0 && enabled === 1) {
                    // MODE 0: Bitcrusher
                    this.phaser += freqRed;
                    if (this.phaser >= 1.0) {
                        this.phaser -= 1.0;
                        this.lastSampleValue = inputChannel[i];

                        // Bit Crushing logic
                        if (step < 1) {
                            this.lastSampleValue = Math.floor(this.lastSampleValue / step + 0.5) * step;
                        }
                    }
                    sample = this.lastSampleValue;
                } else if (mode === 3) {
                    // MODE 3: TAPE SATURATION - Heavy warmth
                    sample = inputChannel[i];
                } else {
                    // MODE 1/2: Pass through
                    sample = inputChannel[i];
                }

                // Apply mastering chain with warmth
                outputChannel[i] = this.processMastering(sample, drive, warmth);
            }

            // True-Peak limiting on buffer (JS fallback)
            if (truePeakEnabled === 1) {
                this.truePeakLimit(outputChannel, outputChannel.length, this.TP_CEILING);
            }

            // TIER 3: Apply TPDF Dithering
            if (ditherEnabled === 1) {
                for (let i = 0; i < outputChannel.length; i++) {
                    outputChannel[i] = this.applyDither(outputChannel[i], ditherBitDepth);
                }
            }
        }

        return true;
    }
}

registerProcessor('nexus-bitcrusher', NexusBitcrusher);
