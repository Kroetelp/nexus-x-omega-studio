/**
 * NEXUS-X Dithering v5.0
 * TPDF (Triangular Probability Density Function) Dithering
 *
 * Reduces quantization noise when reducing bit depth.
 * TPDF is superior to simple random dithering - adds less noise
 * while still eliminating quantization distortion.
 *
 * REALTIME-SAFE: No allocations, no locks, no exceptions
 */

#pragma once

#include "../core/Types.hpp"
#include <cmath>
#include <cstdint>

namespace nexus {

// ============================================================
// SIMPLE LINEAR CONGRUENTIAL GENERATOR (PRNG)
// ============================================================
// Fast, deterministic random number generator
// Suitable for audio dithering (not cryptographic!)

class SimplePrng {
public:
    SimplePrng(uint32_t seed = 12345)
        : m_state(seed)
    {}

    // Returns value in range [0, 1)
    inline float next() {
        // LCG formula: state = (state * multiplier + increment) mod 2^31
        m_state = (m_state * 1103515245 + 12345) & 0x7FFFFFFF;
        return static_cast<float>(m_state) / static_cast<float>(0x7FFFFFFF);
    }

    // Returns value in range [-1, +1)
    inline float nextSigned() {
        return next() * 2.0f - 1.0f;
    }

    void setSeed(uint32_t seed) {
        m_state = seed;
    }

    void reset() {
        m_state = 12345;
    }

private:
    uint32_t m_state;
};

// ============================================================
// TPDF DITHER
// ============================================================

class TpdfDither {
public:
    TpdfDither()
        : m_enabled(false)
        , m_targetBitDepth(16)
        , m_prng(12345)
    {}

    // ============================================================
    // CONFIGURATION
    // ============================================================

    void setEnabled(bool enabled) {
        m_enabled = enabled;
    }

    void setTargetBitDepth(int bits) {
        // Common values: 16, 24
        m_targetBitDepth = NEXUS_CLAMP(bits, 8, 24);
    }

    bool isEnabled() const { return m_enabled; }
    int getTargetBitDepth() const { return m_targetBitDepth; }

    // ============================================================
    // DITHER GENERATION
    // ============================================================

    // Generate TPDF random value in range [-1, +1]
    // TPDF = difference of two uniform random numbers (triangular distribution)
    inline float generate() {
        const float r1 = m_prng.next();
        const float r2 = m_prng.next();
        return r1 - r2;  // Range: -1 to +1 with triangular distribution
    }

    // ============================================================
    // SAMPLE PROCESSING
    // ============================================================

    // Apply dither to a single sample
    inline float processSample(float sample) {
        if (!m_enabled) return sample;

        // Calculate quantization step for target bit depth
        const float step = std::pow(2.0f, -static_cast<float>(m_targetBitDepth));

        // Generate TPDF dither noise
        // Scale to half a quantization step (optimal for TPDF)
        const float dither = generate() * step * 0.5f;

        // Apply dither
        return sample + dither;
    }

    // Apply dither and quantize
    inline float processAndQuantize(float sample) {
        if (!m_enabled) return sample;

        // Apply dither
        sample = processSample(sample);

        // Quantize to target bit depth
        const float step = std::pow(2.0f, -static_cast<float>(m_targetBitDepth));
        return std::floor(sample / step + 0.5f) * step;
    }

    // ============================================================
    // BUFFER PROCESSING
    // ============================================================

    void process(float* buffer, size_t numSamples) {
        if (!m_enabled) return;

        for (size_t i = 0; i < numSamples; i++) {
            buffer[i] = processSample(buffer[i]);
        }
    }

    void processAndQuantize(float* buffer, size_t numSamples) {
        if (!m_enabled) return;

        for (size_t i = 0; i < numSamples; i++) {
            buffer[i] = processAndQuantize(buffer[i]);
        }
    }

    // Process stereo buffer (interleaved L/R)
    void processStereo(float* buffer, size_t numFrames) {
        if (!m_enabled) return;

        for (size_t i = 0; i < numFrames; i++) {
            const size_t idx = i * 2;
            buffer[idx] = processSample(buffer[idx]);
            buffer[idx + 1] = processSample(buffer[idx + 1]);
        }
    }

    void processStereoAndQuantize(float* buffer, size_t numFrames) {
        if (!m_enabled) return;

        for (size_t i = 0; i < numFrames; i++) {
            const size_t idx = i * 2;
            buffer[idx] = processAndQuantize(buffer[idx]);
            buffer[idx + 1] = processAndQuantize(buffer[idx + 1]);
        }
    }

    // ============================================================
    // RESET
    // ============================================================

    void reset() {
        m_prng.reset();
    }

private:
    bool m_enabled;
    int m_targetBitDepth;
    SimplePrng m_prng;
};

// ============================================================
// RECTANGULAR DITHER (Simpler, less optimal)
// ============================================================

class RectangularDither {
public:
    RectangularDither()
        : m_enabled(false)
        , m_targetBitDepth(16)
        , m_prng(54321)
    {}

    void setEnabled(bool enabled) { m_enabled = enabled; }
    void setTargetBitDepth(int bits) { m_targetBitDepth = NEXUS_CLAMP(bits, 8, 24); }
    bool isEnabled() const { return m_enabled; }

    inline float processSample(float sample) {
        if (!m_enabled) return sample;

        const float step = std::pow(2.0f, -static_cast<float>(m_targetBitDepth));
        const float dither = m_prng.next() * step;  // Uniform [0, step)

        return sample + dither - step * 0.5f;  // Center around 0
    }

    void process(float* buffer, size_t numSamples) {
        if (!m_enabled) return;
        for (size_t i = 0; i < numSamples; i++) {
            buffer[i] = processSample(buffer[i]);
        }
    }

    void reset() { m_prng.reset(); }

private:
    bool m_enabled;
    int m_targetBitDepth;
    SimplePrng m_prng;
};

// ============================================================
// NOISE SHAPING DITHER (High-quality for final export)
// ============================================================

class NoiseShapingDither {
public:
    NoiseShapingDither()
        : m_enabled(false)
        , m_targetBitDepth(16)
        , m_prng(98765)
        , m_prevError(0.0f)
        , m_prevErrorR(0.0f)
    {}

    void setEnabled(bool enabled) { m_enabled = enabled; }
    void setTargetBitDepth(int bits) { m_targetBitDepth = NEXUS_CLAMP(bits, 8, 24); }
    bool isEnabled() const { return m_enabled; }

    inline float processSample(float sample) {
        if (!m_enabled) return sample;

        // Add previous quantization error (noise shaping feedback)
        sample += m_prevError * 0.5f;

        const float step = std::pow(2.0f, -static_cast<float>(m_targetBitDepth));

        // TPDF dither
        const float r1 = m_prng.next();
        const float r2 = m_prng.next();
        const float dither = (r1 - r2) * step * 0.5f;

        const float dithered = sample + dither;
        const float quantized = std::floor(dithered / step + 0.5f) * step;

        // Store error for next sample
        m_prevError = dithered - quantized;

        return quantized;
    }

    void processStereo(float* buffer, size_t numFrames) {
        if (!m_enabled) return;

        for (size_t i = 0; i < numFrames; i++) {
            const size_t idx = i * 2;

            // Left channel
            float sampleL = buffer[idx] + m_prevError * 0.5f;
            const float step = std::pow(2.0f, -static_cast<float>(m_targetBitDepth));
            const float r1 = m_prng.next();
            const float r2 = m_prng.next();
            const float ditherL = (r1 - r2) * step * 0.5f;
            const float ditheredL = sampleL + ditherL;
            const float quantizedL = std::floor(ditheredL / step + 0.5f) * step;
            m_prevError = ditheredL - quantizedL;
            buffer[idx] = quantizedL;

            // Right channel
            float sampleR = buffer[idx + 1] + m_prevErrorR * 0.5f;
            const float r3 = m_prng.next();
            const float r4 = m_prng.next();
            const float ditherR = (r3 - r4) * step * 0.5f;
            const float ditheredR = sampleR + ditherR;
            const float quantizedR = std::floor(ditheredR / step + 0.5f) * step;
            m_prevErrorR = ditheredR - quantizedR;
            buffer[idx + 1] = quantizedR;
        }
    }

    void reset() {
        m_prng.reset();
        m_prevError = 0.0f;
        m_prevErrorR = 0.0f;
    }

private:
    bool m_enabled;
    int m_targetBitDepth;
    SimplePrng m_prng;
    float m_prevError;
    float m_prevErrorR;
};

} // namespace nexus
