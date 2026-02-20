/**
 * NEXUS-X Bitcrusher v5.0
 * Sample Rate and Bit Depth Reduction Effect
 *
 * Creates lo-fi digital degradation by:
 * 1. Sample rate reduction (decimation/downsampling)
 * 2. Bit depth reduction (quantization)
 *
 * REALTIME-SAFE: No allocations, no locks, no exceptions
 */

#pragma once

#include "../core/Types.hpp"
#include <cmath>

namespace nexus {

// ============================================================
// BITCRUSHER
// ============================================================

class Bitcrusher {
public:
    Bitcrusher()
        : m_bitDepth(16.0f)      // Default: no reduction
        , m_freqReduction(0.0f)  // Default: no reduction (0 = bypass)
        , m_phaser(0.0f)
        , m_lastSample(0.0f)
        , m_lastSampleR(0.0f)
        , m_enabled(false)
    {}

    // ============================================================
    // CONFIGURATION
    // ============================================================

    void setBitDepth(float bits) {
        // bits: 1 = extreme crushing, 16 = no effect
        m_bitDepth = NEXUS_CLAMP(bits, 1.0f, 16.0f);
    }

    void setFrequencyReduction(float reduction) {
        // reduction: 0 = no reduction, 1 = maximum reduction
        m_freqReduction = NEXUS_CLAMP(reduction, 0.0f, 1.0f);
        updateEnabled();
    }

    void setBitDepth(int bits) {
        setBitDepth(static_cast<float>(bits));
    }

    float getBitDepth() const { return m_bitDepth; }
    float getFrequencyReduction() const { return m_freqReduction; }
    bool isEnabled() const { return m_enabled; }

    // ============================================================
    // SAMPLE PROCESSING
    // ============================================================

    // Process a single sample
    inline float processSample(float input) {
        if (!m_enabled) return input;

        // Sample rate reduction (decimation)
        if (m_freqReduction > 0.0f) {
            m_phaser += m_freqReduction;

            if (m_phaser >= 1.0f) {
                m_phaser -= 1.0f;
                m_lastSample = input;

                // Bit depth reduction (quantization)
                m_lastSample = quantize(m_lastSample);
            }
            return m_lastSample;
        }

        // Only bit depth reduction
        return quantize(input);
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

    // Process stereo buffer (interleaved L/R)
    void processStereo(float* buffer, size_t numFrames) {
        if (!m_enabled) return;

        for (size_t i = 0; i < numFrames; i++) {
            const size_t idx = i * 2;

            // Left channel
            if (m_freqReduction > 0.0f) {
                m_phaser += m_freqReduction;

                if (m_phaser >= 1.0f) {
                    m_phaser -= 1.0f;
                    m_lastSample = buffer[idx];
                    m_lastSampleR = buffer[idx + 1];

                    m_lastSample = quantize(m_lastSample);
                    m_lastSampleR = quantize(m_lastSampleR);
                }

                buffer[idx] = m_lastSample;
                buffer[idx + 1] = m_lastSampleR;
            } else {
                buffer[idx] = quantize(buffer[idx]);
                buffer[idx + 1] = quantize(buffer[idx + 1]);
            }
        }
    }

    // ============================================================
    // RESET
    // ============================================================

    void reset() {
        m_phaser = 0.0f;
        m_lastSample = 0.0f;
        m_lastSampleR = 0.0f;
    }

private:
    // Calculate quantization step from bit depth
    inline float getQuantizationStep() const {
        return std::pow(2.0f, -m_bitDepth);
    }

    // Quantize sample to current bit depth
    inline float quantize(float sample) const {
        const float step = getQuantizationStep();
        if (step >= 1.0f) return sample;  // No quantization needed

        // Round to nearest quantization step
        return std::floor(sample / step + 0.5f) * step;
    }

    // Update enabled state
    inline void updateEnabled() {
        m_enabled = (m_bitDepth < 16.0f) || (m_freqReduction > 0.0f);
    }

    // Parameters
    float m_bitDepth;
    float m_freqReduction;

    // State
    float m_phaser;
    float m_lastSample;
    float m_lastSampleR;
    bool m_enabled;
};

// ============================================================
// DECIMATOR (Alternative implementation with different character)
// ============================================================

class Decimator {
public:
    Decimator()
        : m_rate(1)           // Sample every Nth sample
        , m_counter(0)
        , m_lastSample(0.0f)
        , m_lastSampleR(0.0f)
    {}

    void setRate(int samples) {
        // samples: 1 = no reduction, 2 = half rate, 4 = quarter rate, etc.
        m_rate = NEXUS_CLAMP(samples, 1, 64);
    }

    int getRate() const { return m_rate; }

    inline float processSample(float input) {
        if (m_rate <= 1) return input;

        m_counter++;
        if (m_counter >= m_rate) {
            m_counter = 0;
            m_lastSample = input;
        }
        return m_lastSample;
    }

    void processStereo(float* buffer, size_t numFrames) {
        if (m_rate <= 1) return;

        for (size_t i = 0; i < numFrames; i++) {
            const size_t idx = i * 2;

            m_counter++;
            if (m_counter >= m_rate) {
                m_counter = 0;
                m_lastSample = buffer[idx];
                m_lastSampleR = buffer[idx + 1];
            }

            buffer[idx] = m_lastSample;
            buffer[idx + 1] = m_lastSampleR;
        }
    }

    void reset() {
        m_counter = 0;
        m_lastSample = 0.0f;
        m_lastSampleR = 0.0f;
    }

private:
    int m_rate;
    int m_counter;
    float m_lastSample;
    float m_lastSampleR;
};

} // namespace nexus
