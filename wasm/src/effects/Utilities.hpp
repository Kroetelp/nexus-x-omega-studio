/**
 * NEXUS-X DSP Utilities v5.0
 * Common DSP utility functions and processors
 *
 * Contains:
 * - DC Blocker (high-pass filter at ~20Hz)
 * - Soft Clipper
 * - Hard Limiter
 * - Utility macros and functions
 *
 * REALTIME-SAFE: No allocations, no locks, no exceptions
 */

#pragma once

#include "../core/Types.hpp"
#include <cmath>

namespace nexus {

// ============================================================
// DSP UTILITY MACROS (Already defined in Types.hpp, but here for reference)
// ============================================================

#ifndef NEXUS_CLAMP
#define NEXUS_CLAMP(x, lo, hi) ((x) < (lo) ? (lo) : ((x) > (hi) ? (hi) : (x)))
#endif

#ifndef NEXUS_LINEAR_TO_DB
#define NEXUS_LINEAR_TO_DB(x) (20.0f * std::log10f(std::fabs(x) + 1e-10f))
#endif

#ifndef NEXUS_DB_TO_LINEAR
#define NEXUS_DB_TO_LINEAR(x) (std::powf(10.0f, (x) / 20.0f))
#endif

// ============================================================
// DC BLOCKER
// ============================================================
// Removes DC offset to maximize headroom
// First-order high-pass filter at ~20Hz (at 44.1kHz)

class DcBlocker {
public:
    DcBlocker()
        : m_prevInput(0.0f)
        , m_prevOutput(0.0f)
        , m_prevInputR(0.0f)
        , m_prevOutputR(0.0f)
    {
        // Coefficient for ~20Hz cutoff at 44.1kHz
        // R = 1 - (2 * PI * fc / fs)
        setCoefficient(0.995f);  // Default: ~20Hz at 44.1kHz
    }

    // Set coefficient directly
    // Higher = lower cutoff frequency
    void setCoefficient(float r) {
        m_coeff = NEXUS_CLAMP(r, 0.9f, 0.9999f);
    }

    // Set cutoff frequency
    void setCutoff(float freq, float sampleRate) {
        // R = 1 - (2 * PI * fc / fs)
        m_coeff = 1.0f - (TWO_PI * freq / sampleRate);
        m_coeff = NEXUS_CLAMP(m_coeff, 0.9f, 0.9999f);
    }

    // Process single sample
    inline float process(float input) {
        // HPF: y[n] = x[n] - x[n-1] + R * y[n-1]
        const float output = input - m_prevInput + m_coeff * m_prevOutput;
        m_prevInput = input;
        m_prevOutput = output;
        return output;
    }

    // Process stereo buffer (interleaved L/R)
    void processStereo(float* buffer, size_t numFrames) {
        for (size_t i = 0; i < numFrames; i++) {
            const size_t idx = i * 2;

            // Left
            const float inL = buffer[idx];
            buffer[idx] = inL - m_prevInput + m_coeff * m_prevOutput;
            m_prevInput = inL;
            m_prevOutput = buffer[idx];

            // Right
            const float inR = buffer[idx + 1];
            buffer[idx + 1] = inR - m_prevInputR + m_coeff * m_prevOutputR;
            m_prevInputR = inR;
            m_prevOutputR = buffer[idx + 1];
        }
    }

    // Process mono buffer
    void process(float* buffer, size_t numSamples) {
        for (size_t i = 0; i < numSamples; i++) {
            buffer[i] = process(buffer[i]);
        }
    }

    void reset() {
        m_prevInput = 0.0f;
        m_prevOutput = 0.0f;
        m_prevInputR = 0.0f;
        m_prevOutputR = 0.0f;
    }

private:
    float m_coeff;
    float m_prevInput;
    float m_prevOutput;
    float m_prevInputR;     // Right channel
    float m_prevOutputR;
};

// ============================================================
// SOFT CLIPPER
// ============================================================
// Warm saturation using tanh waveshaper
// Adds harmonic warmth before hard limiting

class SoftClipper {
public:
    SoftClipper()
        : m_drive(1.0f)
        , m_enabled(true)
    {}

    // Set drive: 1.0 = subtle, 4.0 = aggressive
    void setDrive(float drive) {
        m_drive = NEXUS_CLAMP(drive, 1.0f, 8.0f);
    }

    float getDrive() const { return m_drive; }

    void setEnabled(bool enabled) { m_enabled = enabled; }
    bool isEnabled() const { return m_enabled; }

    // Process single sample
    inline float process(float x) const {
        if (!m_enabled || m_drive <= 1.001f) return x;
        return std::tanh(x * m_drive) / m_drive;
    }

    // Process buffer
    void process(float* buffer, size_t numSamples) const {
        if (!m_enabled) return;
        for (size_t i = 0; i < numSamples; i++) {
            buffer[i] = process(buffer[i]);
        }
    }

    // Process stereo buffer
    void processStereo(float* buffer, size_t numFrames) const {
        if (!m_enabled) return;
        for (size_t i = 0; i < numFrames; i++) {
            const size_t idx = i * 2;
            buffer[idx] = process(buffer[idx]);
            buffer[idx + 1] = process(buffer[idx + 1]);
        }
    }

private:
    float m_drive;
    bool m_enabled;
};

// ============================================================
// HARD LIMITER (Safety)
// ============================================================
// Absolute ceiling to prevent digital clipping
// Should be used as a safety net, not as primary limiting

class HardLimiter {
public:
    HardLimiter()
        : m_ceiling(0.99f)  // -0.17dB
    {}

    void setCeiling(float linear) {
        m_ceiling = NEXUS_CLAMP(linear, 0.5f, 1.0f);
    }

    void setCeilingDb(float db) {
        m_ceiling = NEXUS_DB_TO_LINEAR(db);
        m_ceiling = NEXUS_CLAMP(m_ceiling, 0.5f, 1.0f);
    }

    float getCeiling() const { return m_ceiling; }

    // Process single sample
    inline float process(float x) const {
        if (x > m_ceiling) return m_ceiling;
        if (x < -m_ceiling) return -m_ceiling;
        return x;
    }

    // Process buffer
    void process(float* buffer, size_t numSamples) const {
        for (size_t i = 0; i < numSamples; i++) {
            buffer[i] = process(buffer[i]);
        }
    }

    // Process stereo buffer
    void processStereo(float* buffer, size_t numFrames) const {
        for (size_t i = 0; i < numFrames; i++) {
            const size_t idx = i * 2;
            buffer[idx] = process(buffer[idx]);
            buffer[idx + 1] = process(buffer[idx + 1]);
        }
    }

private:
    float m_ceiling;
};

// ============================================================
// WAVE SHAPER
// ============================================================
// Various waveshaping curves for saturation/distortion

class WaveShaper {
public:
    enum class Curve {
        TANH,       // Smooth, warm
        ATAN,       // Similar to tanh, slightly different character
        CUBIC,      // More aggressive
        CLIP,       // Hard clipping
        FOLD,       // Wave folding (harmonic madness)
        SIN,        // Sine folding
    };

    WaveShaper(Curve curve = Curve::TANH)
        : m_curve(curve)
        , m_amount(1.0f)
    {}

    void setCurve(Curve curve) { m_curve = curve; }
    void setAmount(float amount) { m_amount = NEXUS_CLAMP(amount, 0.1f, 10.0f); }

    inline float process(float x) const {
        x *= m_amount;

        switch (m_curve) {
            case Curve::TANH:
                return std::tanh(x) / m_amount;

            case Curve::ATAN:
                return (2.0f / PI) * std::atan(x * PI / 2.0f) / m_amount;

            case Curve::CUBIC:
                // x - x^3/3 approximation of tanh
                return (x - x * x * x / 3.0f) / m_amount;

            case Curve::CLIP:
                return NEXUS_CLAMP(x, -1.0f, 1.0f) / m_amount;

            case Curve::FOLD: {
                // Wave folding
                float y = x;
                while (y > 1.0f || y < -1.0f) {
                    if (y > 1.0f) y = 2.0f - y;
                    else if (y < -1.0f) y = -2.0f - y;
                }
                return y / m_amount;
            }

            case Curve::SIN:
                return std::sin(x * PI / 2.0f) / m_amount;

            default:
                return x / m_amount;
        }
    }

    void process(float* buffer, size_t numSamples) const {
        for (size_t i = 0; i < numSamples; i++) {
            buffer[i] = process(buffer[i]);
        }
    }

private:
    Curve m_curve;
    float m_amount;
};

// ============================================================
// MUTE / RAMP
// ============================================================
// Click-free mute/unmute with ramping

class ClicklessMute {
public:
    ClicklessMute()
        : m_target(1.0f)
        , m_current(1.0f)
        , m_rampRate(0.001f)  // Samples to ramp
    {}

    void mute() { m_target = 0.0f; }
    void unmute() { m_target = 1.0f; }
    bool isMuted() const { return m_target < 0.5f; }

    // Set ramp time in samples
    void setRampTime(size_t samples) {
        m_rampRate = 1.0f / static_cast<float>(NEXUS_CLAMP(samples, 1, 10000));
    }

    inline float process(float x) {
        // Ramp towards target
        if (m_current < m_target) {
            m_current += m_rampRate;
            if (m_current > m_target) m_current = m_target;
        } else if (m_current > m_target) {
            m_current -= m_rampRate;
            if (m_current < m_target) m_current = m_target;
        }

        return x * m_current;
    }

    void process(float* buffer, size_t numSamples) {
        for (size_t i = 0; i < numSamples; i++) {
            buffer[i] = process(buffer[i]);
        }
    }

    void reset() {
        m_target = 1.0f;
        m_current = 1.0f;
    }

private:
    float m_target;
    float m_current;
    float m_rampRate;
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

// Fast approximation of tanh (for performance-critical code)
inline float fastTanh(float x) {
    // Pade approximation
    const float x2 = x * x;
    return x * (27.0f + x2) / (27.0f + 9.0f * x2);
}

// Linear interpolation
inline float lerp(float a, float b, float t) {
    return a + (b - a) * t;
}

// Convert MIDI note to frequency
inline float midiToFreq(uint8_t note, float a4 = 440.0f) {
    return a4 * std::pow(2.0f, (note - 69) / 12.0f);
}

// Convert frequency to MIDI note
inline float freqToMidi(float freq, float a4 = 440.0f) {
    return 69.0f + 12.0f * std::log2(freq / a4);
}

// Soft saturation curve (sign(x) * (1 - exp(-|x|)))
inline float saturationCurve(float x, float amount) {
    const float sign = (x >= 0.0f) ? 1.0f : -1.0f;
    return sign * (1.0f - std::exp(-std::fabs(x) * amount));
}

// Mix dry and wet signals
inline float mixDryWet(float dry, float wet, float mix) {
    return dry + (wet - dry) * mix;
}

} // namespace nexus
