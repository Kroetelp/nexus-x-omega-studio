/**
 * NEXUS-X FX Processor v5.0
 * Master effects (Compressor, Limiter, Saturation, Stereo Width)
 */

#pragma once

#include "../core/Instrument.hpp"
#include <cmath>

namespace nexus {

// ============================================================
// FX PARAMETER IDs (must match TypeScript FxParam)
// ============================================================
enum class FxParam : uint32_t {
    // Reverb
    REVERB_SIZE = 0,
    REVERB_DECAY = 1,
    REVERB_WET = 2,
    REVERB_PRE_DELAY = 3,

    // Delay
    DELAY_TIME = 10,
    DELAY_FEEDBACK = 11,
    DELAY_WET = 12,
    DELAY_PINGPONG = 13,

    // Compressor
    COMP_THRESHOLD = 20,
    COMP_RATIO = 21,
    COMP_ATTACK = 22,
    COMP_RELEASE = 23,
    COMP_MAKEUP = 24,

    // Limiter
    LIMIT_CEILING = 30,
    LIMIT_RELEASE = 31,

    // Tape Saturation
    TAPE_WARMTH = 40,
    TAPE_DRIVE = 41,

    // Stereo
    STEREO_WIDTH = 50,

    // Presence
    PRESENCE_GAIN = 60,

    // Master
    MASTER_VOL = 70,
};

// ============================================================
// SIMPLE COMPRESSOR
// ============================================================

class SimpleCompressor {
public:
    SimpleCompressor()
        : m_threshold(-18.0f)
        , m_ratio(4.0f)
        , m_attack(0.01f)
        , m_release(0.1f)
        , m_makeup(3.0f)
        , m_envelope(0.0f)
    {}

    float process(float sample, float sampleRate) {
        const float absSample = std::abs(sample);

        // Envelope follower
        if (absSample > m_envelope) {
            m_envelope += (absSample - m_envelope) * m_attack;
        } else {
            m_envelope += (absSample - m_envelope) * m_release;
        }

        // Convert to dB
        const float envDb = NEXUS_LINEAR_TO_DB(m_envelope);

        // Calculate gain reduction
        float gainReduction = 0.0f;
        if (envDb > m_threshold) {
            gainReduction = (envDb - m_threshold) * (1.0f - 1.0f / m_ratio);
        }

        // Apply gain reduction
        const float gain = NEXUS_DB_TO_LINEAR(-gainReduction + m_makeup);
        return sample * gain;
    }

    void setThreshold(float db) { m_threshold = NEXUS_CLAMP(db, -60.0f, 0.0f); }
    void setRatio(float r) { m_ratio = NEXUS_CLAMP(r, 1.0f, 20.0f); }
    void setAttack(float s) { m_attack = 1.0f / (s * SAMPLE_RATE + 1); }
    void setRelease(float s) { m_release = 1.0f / (s * SAMPLE_RATE + 1); }
    void setMakeup(float db) { m_makeup = NEXUS_CLAMP(db, 0.0f, 24.0f); }

private:
    float m_threshold;
    float m_ratio;
    float m_attack;
    float m_release;
    float m_makeup;
    float m_envelope;
};

// ============================================================
// SIMPLE LIMITER
// ============================================================

class SimpleLimiter {
public:
    SimpleLimiter()
        : m_ceiling(0.95f)
        , m_release(0.05f)
        , m_gain(1.0f)
        , m_envelope(0.0f)
    {}

    float process(float sample, float sampleRate) {
        const float absSample = std::abs(sample);

        // Envelope follower
        if (absSample > m_envelope) {
            m_envelope = absSample;  // Instant attack
        } else {
            m_envelope += (absSample - m_envelope) * m_release;
        }

        // Calculate gain
        if (m_envelope > m_ceiling) {
            m_gain = m_ceiling / m_envelope;
        } else {
            m_gain = 1.0f;
        }

        return sample * m_gain;
    }

    void setCeiling(float linear) { m_ceiling = NEXUS_CLAMP(linear, 0.5f, 1.0f); }
    void setRelease(float s) { m_release = 1.0f / (s * SAMPLE_RATE + 1); }

private:
    float m_ceiling;
    float m_release;
    float m_gain;
    float m_envelope;
};

// ============================================================
// TAPE SATURATION
// ============================================================

class TapeSaturation {
public:
    TapeSaturation()
        : m_warmth(0.0f)
        , m_drive(0.0f)
    {}

    float process(float sample) {
        if (m_warmth < 0.001f && m_drive < 0.001f) {
            return sample;
        }

        // Tape saturation curve
        const float sign = sample >= 0.0f ? 1.0f : -1.0f;
        const float amount = 2.0f + m_warmth * 3.0f;

        float saturated = sign * (1.0f - std::exp(-std::abs(sample) * amount));

        // Mix dry and wet based on warmth
        sample = sample + (saturated - sample) * m_warmth;

        // Apply drive (soft clipping)
        if (m_drive > 0.0f) {
            sample = std::tanh(sample * (1.0f + m_drive));
        }

        return sample;
    }

    void setWarmth(float w) { m_warmth = NEXUS_CLAMP(w, 0.0f, 1.0f); }
    void setDrive(float d) { m_drive = NEXUS_CLAMP(d, 0.0f, 1.0f); }

private:
    float m_warmth;
    float m_drive;
};

// ============================================================
// STEREO WIDTH
// ============================================================

class StereoWidth {
public:
    StereoWidth()
        : m_width(1.0f)  // 1.0 = normal, 2.0 = super wide
    {}

    void process(float& left, float& right) {
        // Mid/side processing
        const float mid = (left + right) * 0.5f;
        const float side = (left - right) * 0.5f * m_width;

        left = mid + side;
        right = mid - side;
    }

    void setWidth(float w) { m_width = NEXUS_CLAMP(w, 0.0f, 2.0f); }

private:
    float m_width;
};

// ============================================================
// FX PROCESSOR INSTRUMENT
// ============================================================

class FxProcessor : public Instrument {
public:
    FxProcessor(InstrumentId id)
        : m_id(id)
        , m_masterVol(0.8f)
    {}

    // --- Identity ---
    InstrumentId getId() const override { return m_id; }
    const char* getName() const override { return "FxProcessor"; }
    InstrumentType getType() const override { return InstrumentType::FX; }

    // --- Lifecycle ---
    void initialize(float sampleRate) override {
        m_sampleRate = sampleRate;
    }

    void reset() override {
        m_compressor = SimpleCompressor();
        m_limiter = SimpleLimiter();
        m_tapeSat = TapeSaturation();
        m_stereoWidth = StereoWidth();
    }

    // --- Audio Processing ---
    void process(float* outputBuffer, size_t numSamples) override {
        if (!m_enabled) return;

        for (size_t i = 0; i < numSamples; i++) {
            float left = outputBuffer[i * 2];
            float right = outputBuffer[i * 2 + 1];

            // 1. Tape Saturation
            left = m_tapeSat.process(left);
            right = m_tapeSat.process(right);

            // 2. Compressor
            left = m_compressor.process(left, m_sampleRate);
            right = m_compressor.process(right, m_sampleRate);

            // 3. Stereo Width
            m_stereoWidth.process(left, right);

            // 4. Limiter
            left = m_limiter.process(left, m_sampleRate);
            right = m_limiter.process(right, m_sampleRate);

            // 5. Master Volume
            left *= m_masterVol;
            right *= m_masterVol;

            // Write back
            outputBuffer[i * 2] = left;
            outputBuffer[i * 2 + 1] = right;
        }
    }

    // --- Parameter Handling ---
    void setParameter(ParamId paramId, float value) override {
        switch (static_cast<FxParam>(paramId)) {
            case FxParam::COMP_THRESHOLD:
                m_compressor.setThreshold(value);
                break;
            case FxParam::COMP_RATIO:
                m_compressor.setRatio(value);
                break;
            case FxParam::COMP_ATTACK:
                m_compressor.setAttack(value / 1000.0f);  // ms to s
                break;
            case FxParam::COMP_RELEASE:
                m_compressor.setRelease(value / 1000.0f);  // ms to s
                break;
            case FxParam::COMP_MAKEUP:
                m_compressor.setMakeup(value);
                break;

            case FxParam::LIMIT_CEILING:
                m_limiter.setCeiling(NEXUS_DB_TO_LINEAR(value));
                break;
            case FxParam::LIMIT_RELEASE:
                m_limiter.setRelease(value / 1000.0f);
                break;

            case FxParam::TAPE_WARMTH:
                m_tapeSat.setWarmth(value);
                break;
            case FxParam::TAPE_DRIVE:
                m_tapeSat.setDrive(value);
                break;

            case FxParam::STEREO_WIDTH:
                m_stereoWidth.setWidth(value / 100.0f);  // % to ratio
                break;

            case FxParam::MASTER_VOL:
                m_masterVol = NEXUS_CLAMP(value, 0.0f, 1.0f);
                break;

            default:
                break;
        }
    }

    float getParameter(ParamId paramId) const override {
        switch (static_cast<FxParam>(paramId)) {
            case FxParam::MASTER_VOL: return m_masterVol;
            default: return 0.0f;
        }
    }

private:
    InstrumentId m_id;
    float m_masterVol;

    // Effect processors
    SimpleCompressor m_compressor;
    SimpleLimiter m_limiter;
    TapeSaturation m_tapeSat;
    StereoWidth m_stereoWidth;
};

} // namespace nexus
