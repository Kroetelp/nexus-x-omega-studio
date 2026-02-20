#include <math.h>
#include <stdlib.h>

// ============================================================
// NEXUS-X DSP CORE v4.0 - MASTERING SUITE COMPLETE
// ============================================================
// Features:
//   - Bitcrusher/Decimation
//   - DC Blocker
//   - Soft Clipper (tanh waveshaper)
//   - TAPE SATURATION (analog warmth emulation)
//   - TRUE-PEAK LIMITER (4x oversampling)
//   - TPDF DITHERING (for 16-bit export) - NEW TIER 3
//   - Safety Hard Limiter (backup)
//
// GOLDEN RULE: Add-only, Enhance-only - Never break existing logic!
// ============================================================

// --- Internal State for Bitcrusher ---
float phaser = 0.0f;
float lastSampleValue = 0.0f;

// --- Internal State for DC Blocker ---
float dcPrevInput = 0.0f;
float dcPrevOutput = 0.0f;
const float DC_R = 0.995f; // ~20Hz highpass at 44.1kHz

// --- Internal State for True-Peak Limiter ---
float tpPrevSample = 0.0f;      // Previous sample for interpolation
float tpPrevGain = 1.0f;        // Previous gain for smooth release
float tpEnvelope = 0.0f;        // Envelope follower
const float TP_CEILING = 0.95f; // -0.45dB true-peak ceiling
const float TP_ATTACK = 0.001f; // 1ms attack (very fast)
const float TP_RELEASE = 0.05f; // 50ms release (smooth)

// --- Internal State for Dithering ---
float ditherPrevRandom = 0.0f;  // Previous random value for TPDF
int ditherSeed = 12345;         // Simple PRNG seed

// --- Oversampling buffer (4x = 512 from 128) ---
float oversampleBuffer[512];
float oversampleOutput[512];

// --- Buffers (Standard WebAudio Render Quantum is 128 frames) ---
float inputBuffer[128];
float outputBuffer[128];

// ============================================================
// DSP UTILITY FUNCTIONS - Studio Grade Processing
// ============================================================

// DC Blocker: Removes DC offset to maximize headroom
// High-pass filter at ~20Hz
inline float dcBlock(float input) {
    float output = input - dcPrevInput + DC_R * dcPrevOutput;
    dcPrevInput = input;
    dcPrevOutput = output;
    return output;
}

// Soft Clipper: Warm saturation using tanh waveshaper
// Adds harmonic warmth before hard limiting
// Drive range: 1.0 (subtle) to 4.0 (aggressive)
inline float softClip(float x, float drive) {
    return tanhf(x * drive) / drive;
}

// ============================================================
// TIER 2: TAPE SATURATION - Analog Warmth Emulation
// ============================================================
// Models the magnetic saturation curve of analog tape machines
// Adds even-order harmonics for warm, "glued" sound
// Based on simplified tape transfer curve: sign * (1 - e^(-|x|))
// ============================================================

// Tape Saturation: Analog tape warmth emulation
// warmth: 0.0 (clean) to 1.0 (heavy saturation)
inline float tapeSat(float x, float warmth) {
    // Clamp warmth
    if (warmth < 0.0f) warmth = 0.0f;
    if (warmth > 1.0f) warmth = 1.0f;

    // No saturation needed
    if (warmth < 0.001f) return x;

    // Tape saturation curve: sign(x) * (1 - exp(-|x| * amount))
    float sign = (x >= 0.0f) ? 1.0f : -1.0f;
    float amount = 2.0f + warmth * 3.0f;  // 2-5 range for saturation intensity

    float saturated = sign * (1.0f - expf(-fabsf(x) * amount));

    // Mix dry and wet based on warmth
    return x + (saturated - x) * warmth;
}

// Tape + Soft Clip combined for maximum warmth
// Applies tape saturation first, then soft clipping
inline float tapeAndSoftClip(float x, float drive, float warmth) {
    float sample = tapeSat(x, warmth);
    sample = softClip(sample, drive);
    return sample;
}

// Hard Safety Limiter: Absolute ceiling to prevent digital clipping
// Should never be hit if true-peak limiter is working, but safety first!
inline float hardLimit(float x) {
    const float CEILING = 0.99f; // -0.17dB ceiling
    if (x > CEILING) return CEILING;
    if (x < -CEILING) return -CEILING;
    return x;
}

// ============================================================
// TIER 3: TPDF DITHERING - For 16-bit Export
// ============================================================
// Triangular Probability Density Function dithering
// Reduces quantization noise when reducing bit depth
// Better than simple random dithering - adds less noise
// ============================================================

// Simple Linear Congruential Generator for random numbers
// Returns value in range [0, 1)
inline float simpleRandom() {
    ditherSeed = (ditherSeed * 1103515245 + 12345) & 0x7fffffff;
    return (float)ditherSeed / (float)0x7fffffff;
}

// TPDF Dither: Returns triangular distribution random (-1 to +1)
// TPDF = difference of two uniform random numbers
inline float tpdfDither() {
    float r1 = simpleRandom();
    float r2 = simpleRandom();
    return (r1 - r2);  // Range: -1 to +1 with triangular distribution
}

// Apply TPDF dithering before bit-depth reduction
// targetBitDepth: 16, 24, etc.
// Returns dithered sample
inline float applyDither(float sample, int targetBitDepth) {
    // Calculate quantization step
    float step = powf(2.0f, -(float)targetBitDepth);

    // Generate TPDF dither noise
    // Scale to half a quantization step (optimal for TPDF)
    float dither = tpdfDither() * step * 0.5f;

    // Apply dither
    return sample + dither;
}

// Quantize to target bit depth
inline float quantize(float sample, int bitDepth) {
    float step = powf(2.0f, -(float)bitDepth);
    return floorf(sample / step + 0.5f) * step;
}

// ============================================================
// TRUE-PEAK LIMITER - 4x Oversampling
// ============================================================
// Uses cubic Hermite interpolation to detect inter-sample peaks
// that standard limiters miss. These "true peaks" can cause
// distortion when audio is converted to analog or compressed.
// ============================================================

// Cubic Hermite interpolation coefficient calculation
// Returns interpolated value at position t (0-1) between y1 and y2
// Uses y0 and y3 as neighbors for smooth curve
inline float cubicHermite(float y0, float y1, float y2, float y3, float t) {
    float a = -0.5f * y0 + 1.5f * y1 - 1.5f * y2 + 0.5f * y3;
    float b = y0 - 2.5f * y1 + 2.0f * y2 - 0.5f * y3;
    float c = -0.5f * y0 + 0.5f * y2;
    float d = y1;
    return a * t * t * t + b * t * t + c * t + d;
}

// 4x Upsample using cubic Hermite interpolation
// Input: 128 samples, Output: 512 samples
void upsample4x(float* input, int inLen, float* output) {
    for (int i = 0; i < inLen; i++) {
        // Get 4 neighboring samples for interpolation
        float y0 = (i > 0) ? input[i - 1] : 0.0f;
        float y1 = input[i];
        float y2 = (i < inLen - 1) ? input[i + 1] : input[i];
        float y3 = (i < inLen - 2) ? input[i + 2] : y2;

        // Generate 4 interpolated samples
        int outBase = i * 4;
        output[outBase + 0] = cubicHermite(y0, y1, y2, y3, 0.0f);
        output[outBase + 1] = cubicHermite(y0, y1, y2, y3, 0.25f);
        output[outBase + 2] = cubicHermite(y0, y1, y2, y3, 0.5f);
        output[outBase + 3] = cubicHermite(y0, y1, y2, y3, 0.75f);
    }
}

// 4x Downsample with basic anti-alias filtering (averaging)
// Input: 512 samples, Output: 128 samples
void downsample4x(float* input, int outLen, float* output) {
    for (int i = 0; i < outLen; i++) {
        int inBase = i * 4;
        // Average 4 samples for anti-aliasing (simple but effective)
        output[i] = 0.25f * (input[inBase] + input[inBase + 1] +
                             input[inBase + 2] + input[inBase + 3]);
    }
}

// True-Peak Limiter: Detects and limits inter-sample peaks
// Uses 4x oversampling to catch peaks between samples
// Applies smooth gain reduction with attack/release
void truePeakLimit(float* buffer, int length, float ceiling) {
    // Upsample 4x for true-peak detection
    upsample4x(buffer, length, oversampleBuffer);
    int osLength = length * 4;

    // Find maximum true-peak in oversampled buffer
    float maxPeak = 0.0f;
    for (int i = 0; i < osLength; i++) {
        float absVal = fabsf(oversampleBuffer[i]);
        if (absVal > maxPeak) {
            maxPeak = absVal;
        }
    }

    // Calculate required gain reduction
    float targetGain = 1.0f;
    if (maxPeak > ceiling) {
        targetGain = ceiling / maxPeak;
    }

    // Smooth attack/release envelope
    float attackCoeff = TP_ATTACK;
    float releaseCoeff = TP_RELEASE;

    for (int i = 0; i < osLength; i++) {
        // Envelope follower
        float absVal = fabsf(oversampleBuffer[i]);
        if (absVal > tpEnvelope) {
            // Attack
            tpEnvelope += (absVal - tpEnvelope) * attackCoeff;
        } else {
            // Release
            tpEnvelope += (absVal - tpEnvelope) * releaseCoeff;
        }

        // Calculate instant gain
        float instantGain = 1.0f;
        if (tpEnvelope > ceiling) {
            instantGain = ceiling / tpEnvelope;
        }

        // Smooth gain transitions
        if (instantGain < tpPrevGain) {
            // Attack (gain reduction)
            tpPrevGain += (instantGain - tpPrevGain) * attackCoeff;
        } else {
            // Release (gain recovery)
            tpPrevGain += (instantGain - tpPrevGain) * releaseCoeff;
        }

        // Apply gain
        oversampleOutput[i] = oversampleBuffer[i] * tpPrevGain;
    }

    // Downsample back to original sample rate
    downsample4x(oversampleOutput, length, buffer);
}

// Full mastering chain: DC Block -> (Tape + Soft Clip) -> Hard Limit
// True-Peak limiting is applied at buffer level
// warmth: 0.0-1.0 tape saturation amount
inline float processMastering(float input, float drive, float warmth) {
    // 1. Remove DC offset
    float sample = dcBlock(input);

    // 2. Tape saturation + Soft clip for warmth
    sample = tapeAndSoftClip(sample, drive, warmth);

    // 3. Final safety hard limit (should never be hit)
    sample = hardLimit(sample);

    return sample;
}

// Legacy mastering without warmth parameter
inline float processMasteringLegacy(float input, float drive) {
    return processMastering(input, drive, 0.0f);
}

// ============================================================
// EXTERNAL API - Called from JavaScript
// ============================================================

extern "C" {

    // Getters for JS to find memory addresses
    float* getInputBuffer() { return inputBuffer; }
    float* getOutputBuffer() { return outputBuffer; }

    // Reset all state (call when switching modes or artifacts occur)
    void resetState() {
        dcPrevInput = 0.0f;
        dcPrevOutput = 0.0f;
        phaser = 0.0f;
        lastSampleValue = 0.0f;
        tpPrevSample = 0.0f;
        tpPrevGain = 1.0f;
        tpEnvelope = 0.0f;
        ditherPrevRandom = 0.0f;
        ditherSeed = 12345;
    }

    // ============================================================
    // MAIN PROCESSING FUNCTION v4.0 (TIER 3)
    // ============================================================
    // Parameters:
    //   length:      Buffer size (typically 128)
    //   bitDepth:    Bit depth for crushing (1-16)
    //   freqRed:     Frequency reduction (0-1)
    //   drive:       Soft clip drive (1.0-4.0, default 2.0)
    //   warmth:      Tape saturation warmth (0.0-1.0)
    //   mode:        Processing mode:
    //                0 = bitcrush + safety
    //                1 = saturation only + safety
    //                2 = true-peak mastering (no bitcrush)
    //                3 = tape saturation
    //   truePeakEnabled: 0 = off, 1 = on
    //   ditherEnabled:   0 = off, 1 = on (TPDF dithering) - NEW TIER 3
    //   ditherBitDepth:  Target bit depth for dithering (16, 24) - NEW TIER 3
    // ============================================================
    void process(int length, float bitDepth, float freqRed, float drive, float warmth, int mode, int truePeakEnabled, int ditherEnabled, int ditherBitDepth) {
        float step = powf(0.5f, bitDepth);

        // Clamp drive to safe range
        if (drive < 1.0f) drive = 1.0f;
        if (drive > 4.0f) drive = 4.0f;

        // Clamp warmth to 0-1
        if (warmth < 0.0f) warmth = 0.0f;
        if (warmth > 1.0f) warmth = 1.0f;

        // Clamp dither bit depth
        if (ditherBitDepth < 8) ditherBitDepth = 8;
        if (ditherBitDepth > 24) ditherBitDepth = 24;

        // First pass: Process each sample
        for (int i = 0; i < length; ++i) {
            float input = inputBuffer[i];
            float output;

            if (mode == 0) {
                // === MODE 0: BITCRUSHER ===
                phaser += freqRed;

                if (phaser >= 1.0f) {
                    phaser -= 1.0f;
                    lastSampleValue = input;

                    // Bit Crushing Logic
                    if (step < 1.0f) {
                        lastSampleValue = floorf(lastSampleValue / step + 0.5f) * step;
                    }
                }
                output = lastSampleValue;

            } else if (mode == 1) {
                // === MODE 1: SATURATION ONLY ===
                output = input;

            } else if (mode == 2) {
                // === MODE 2: TRUE-PEAK MASTERING ===
                output = input;

            } else if (mode == 3) {
                // === MODE 3: TAPE SATURATION ===
                output = input;

            } else {
                // Default: pass through
                output = input;
            }

            // Apply full mastering chain (DC block + tape + soft clip + hard limit)
            outputBuffer[i] = processMastering(output, drive, warmth);
        }

        // Second pass: True-Peak Limiting (on entire buffer)
        if (truePeakEnabled == 1) {
            truePeakLimit(outputBuffer, length, TP_CEILING);
        }

        // Third pass: Apply TPDF Dithering (TIER 3)
        if (ditherEnabled == 1) {
            for (int i = 0; i < length; ++i) {
                outputBuffer[i] = applyDither(outputBuffer[i], ditherBitDepth);
            }
        }
    }

    // ============================================================
    // LEGACY COMPATIBILITY - Various old signatures
    // ============================================================

    // v3.1 signature (without dither)
    void processV31(int length, float bitDepth, float freqRed, float drive, float warmth, int mode, int truePeakEnabled) {
        process(length, bitDepth, freqRed, drive, warmth, mode, truePeakEnabled, 0, 16);
    }

    // v3.0 signature (without warmth and dither)
    void processV30(int length, float bitDepth, float freqRed, float drive, int mode, int truePeakEnabled) {
        process(length, bitDepth, freqRed, drive, 0.0f, mode, truePeakEnabled, 0, 16);
    }

    // v2.0 signature (without truePeak, warmth and dither)
    void processV2(int length, float bitDepth, float freqRed, float drive, int mode) {
        process(length, bitDepth, freqRed, drive, 0.0f, mode, 0, 0, 16);
    }

    // Original legacy signature
    void processLegacy(int length, float bitDepth, float freqRed) {
        process(length, bitDepth, freqRed, 2.0f, 0.0f, 0, 0, 0, 16);
    }

} // extern "C"
