/**
 * NEXUS-X Mastering Limiter v5.0
 * True-Peak Limiter with 4x Oversampling
 *
 * Uses cubic Hermite interpolation to detect inter-sample peaks
 * that standard limiters miss. These "true peaks" can cause
 * distortion when audio is converted to analog or compressed.
 *
 * REALTIME-SAFE: No allocations, no locks, no exceptions
 */

#pragma once

#include "../core/Types.hpp"
#include <cmath>

namespace nexus {

// ============================================================
// TRUE-PEAK LIMITER WITH 4X OVERSAMPLING
// ============================================================

class MasteringLimiter {
public:
    MasteringLimiter()
        : m_ceiling(0.95f)       // -0.45dB default
        , m_attack(0.001f)       // 1ms attack
        , m_release(0.05f)       // 50ms release
        , m_prevGain(1.0f)
        , m_envelope(0.0f)
        , m_sampleRate(SAMPLE_RATE)
    {
        // Pre-allocate oversampling buffers
        for (size_t i = 0; i < OVERSAMPLE_FACTOR; i++) {
            m_oversampleBuffer[i] = 0.0f;
            m_oversampleOutput[i] = 0.0f;
        }
    }

    // ============================================================
    // CONFIGURATION
    // ============================================================

    void setCeiling(float linear) {
        m_ceiling = NEXUS_CLAMP(linear, 0.5f, 1.0f);
    }

    void setCeilingDb(float db) {
        m_ceiling = NEXUS_DB_TO_LINEAR(db);
        m_ceiling = NEXUS_CLAMP(m_ceiling, 0.5f, 1.0f);
    }

    void setAttack(float seconds) {
        m_attack = NEXUS_CLAMP(seconds, 0.0001f, 0.1f);
    }

    void setRelease(float seconds) {
        m_release = NEXUS_CLAMP(seconds, 0.01f, 1.0f);
    }

    void setSampleRate(float sr) {
        m_sampleRate = sr;
    }

    float getCeiling() const { return m_ceiling; }

    // ============================================================
    // CUBIC HERMITE INTERPOLATION
    // ============================================================
    // Returns interpolated value at position t (0-1) between y1 and y2
    // Uses y0 and y3 as neighbors for smooth curve

    static inline float cubicHermite(float y0, float y1, float y2, float y3, float t) {
        const float a = -0.5f * y0 + 1.5f * y1 - 1.5f * y2 + 0.5f * y3;
        const float b = y0 - 2.5f * y1 + 2.0f * y2 - 0.5f * y3;
        const float c = -0.5f * y0 + 0.5f * y2;
        const float d = y1;
        return a * t * t * t + b * t * t + c * t + d;
    }

    // ============================================================
    // OVERSAMPLING
    // ============================================================

    // 4x Upsample using cubic Hermite interpolation
    // Processes one input sample, produces 4 output samples
    inline void upsample4x(float y0, float y1, float y2, float y3) {
        m_oversampleBuffer[0] = cubicHermite(y0, y1, y2, y3, 0.0f);
        m_oversampleBuffer[1] = cubicHermite(y0, y1, y2, y3, 0.25f);
        m_oversampleBuffer[2] = cubicHermite(y0, y1, y2, y3, 0.5f);
        m_oversampleBuffer[3] = cubicHermite(y0, y1, y2, y3, 0.75f);
    }

    // 4x Downsample with anti-alias filtering (averaging)
    // Returns one sample from 4 input samples
    inline float downsample4x() const {
        return 0.25f * (m_oversampleOutput[0] + m_oversampleOutput[1] +
                        m_oversampleOutput[2] + m_oversampleOutput[3]);
    }

    // ============================================================
    // SAMPLE PROCESSING (Single sample - for per-sample use)
    // ============================================================

    float processSample(float input) {
        // Store for oversampling history
        m_history[m_historyPos] = input;
        m_historyPos = (m_historyPos + 1) & 3;  // Circular buffer

        // Get 4 samples for interpolation
        const float y0 = m_history[(m_historyPos + 0) & 3];
        const float y1 = m_history[(m_historyPos + 1) & 3];
        const float y2 = m_history[(m_historyPos + 2) & 3];
        const float y3 = m_history[(m_historyPos + 3) & 3];

        // Upsample 4x
        upsample4x(y0, y1, y2, y3);

        // Process each oversampled sample
        const float attackCoeff = m_attack;
        const float releaseCoeff = m_release;

        for (int i = 0; i < OVERSAMPLE_FACTOR; i++) {
            const float sample = m_oversampleBuffer[i];
            const float absVal = std::fabs(sample);

            // Envelope follower
            if (absVal > m_envelope) {
                m_envelope += (absVal - m_envelope) * attackCoeff;
            } else {
                m_envelope += (absVal - m_envelope) * releaseCoeff;
            }

            // Calculate instant gain
            float instantGain = 1.0f;
            if (m_envelope > m_ceiling) {
                instantGain = m_ceiling / m_envelope;
            }

            // Smooth gain transitions
            if (instantGain < m_prevGain) {
                // Attack (gain reduction)
                m_prevGain += (instantGain - m_prevGain) * attackCoeff;
            } else {
                // Release (gain recovery)
                m_prevGain += (instantGain - m_prevGain) * releaseCoeff;
            }

            // Apply gain
            m_oversampleOutput[i] = sample * m_prevGain;
        }

        // Downsample back to original rate
        return downsample4x();
    }

    // ============================================================
    // BUFFER PROCESSING (Optimized for render quantum)
    // ============================================================

    void process(float* buffer, size_t numSamples) {
        // Attack/release coefficients
        const float attackCoeff = m_attack;
        const float releaseCoeff = m_release;

        for (size_t i = 0; i < numSamples; i++) {
            // Update history for oversampling
            m_history[m_historyPos] = buffer[i];
            m_historyPos = (m_historyPos + 1) & 3;

            // Get 4 samples for interpolation (with proper ordering)
            const float y0 = m_history[(m_historyPos + 0) & 3];
            const float y1 = m_history[(m_historyPos + 1) & 3];
            const float y2 = m_history[(m_historyPos + 2) & 3];
            const float y3 = m_history[(m_historyPos + 3) & 3];

            // Upsample 4x
            upsample4x(y0, y1, y2, y3);

            // Process each oversampled sample
            for (int j = 0; j < OVERSAMPLE_FACTOR; j++) {
                const float sample = m_oversampleBuffer[j];
                const float absVal = std::fabs(sample);

                // Envelope follower
                if (absVal > m_envelope) {
                    m_envelope += (absVal - m_envelope) * attackCoeff;
                } else {
                    m_envelope += (absVal - m_envelope) * releaseCoeff;
                }

                // Calculate instant gain
                float instantGain = 1.0f;
                if (m_envelope > m_ceiling) {
                    instantGain = m_ceiling / m_envelope;
                }

                // Smooth gain transitions
                if (instantGain < m_prevGain) {
                    m_prevGain += (instantGain - m_prevGain) * attackCoeff;
                } else {
                    m_prevGain += (instantGain - m_prevGain) * releaseCoeff;
                }

                m_oversampleOutput[j] = sample * m_prevGain;
            }

            // Downsample and write back
            buffer[i] = downsample4x();
        }
    }

    // Process stereo buffer (interleaved L/R)
    void processStereo(float* buffer, size_t numFrames) {
        // Attack/release coefficients
        const float attackCoeff = m_attack;
        const float releaseCoeff = m_release;

        // We need separate history for L and R
        for (size_t i = 0; i < numFrames; i++) {
            const size_t idx = i * 2;

            // Process Left channel
            buffer[idx] = processSampleInternal(buffer[idx], attackCoeff, releaseCoeff, 0);

            // Process Right channel
            buffer[idx + 1] = processSampleInternal(buffer[idx + 1], attackCoeff, releaseCoeff, 1);
        }
    }

    // ============================================================
    // RESET
    // ============================================================

    void reset() {
        m_prevGain = 1.0f;
        m_envelope = 0.0f;
        m_historyPos = 0;

        for (int i = 0; i < 4; i++) {
            m_history[i] = 0.0f;
            m_historyR[i] = 0.0f;
        }

        for (int i = 0; i < OVERSAMPLE_FACTOR; i++) {
            m_oversampleBuffer[i] = 0.0f;
            m_oversampleOutput[i] = 0.0f;
        }
    }

private:
    // Internal sample processing with parameter passing for efficiency
    inline float processSampleInternal(float input, float attackCoeff, float releaseCoeff, int channel) {
        float* history = (channel == 0) ? m_history : m_historyR;

        history[m_historyPos] = input;

        const float y0 = history[(m_historyPos + 0) & 3];
        const float y1 = history[(m_historyPos + 1) & 3];
        const float y2 = history[(m_historyPos + 2) & 3];
        const float y3 = history[(m_historyPos + 3) & 3];

        upsample4x(y0, y1, y2, y3);

        for (int i = 0; i < OVERSAMPLE_FACTOR; i++) {
            const float sample = m_oversampleBuffer[i];
            const float absVal = std::fabs(sample);

            float envelope = m_envelope;
            if (absVal > envelope) {
                envelope += (absVal - envelope) * attackCoeff;
            } else {
                envelope += (absVal - envelope) * releaseCoeff;
            }

            float instantGain = 1.0f;
            if (envelope > m_ceiling) {
                instantGain = m_ceiling / envelope;
            }

            float prevGain = m_prevGain;
            if (instantGain < prevGain) {
                prevGain += (instantGain - prevGain) * attackCoeff;
            } else {
                prevGain += (instantGain - prevGain) * releaseCoeff;
            }

            m_prevGain = prevGain;
            m_envelope = envelope;
            m_oversampleOutput[i] = sample * prevGain;
        }

        return downsample4x();
    }

    // Constants
    static constexpr int OVERSAMPLE_FACTOR = 4;

    // Configuration
    float m_ceiling;
    float m_attack;
    float m_release;
    float m_sampleRate;

    // State
    float m_prevGain;
    float m_envelope;

    // History for oversampling (circular buffer)
    float m_history[4] = {0.0f, 0.0f, 0.0f, 0.0f};
    float m_historyR[4] = {0.0f, 0.0f, 0.0f, 0.0f};  // Right channel
    int m_historyPos = 0;

    // Oversampling buffers
    float m_oversampleBuffer[4];
    float m_oversampleOutput[4];
};

} // namespace nexus
