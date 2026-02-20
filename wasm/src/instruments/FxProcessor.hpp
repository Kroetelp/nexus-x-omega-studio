/**
 * NEXUS-X FX Processor v5.0
 * Master effects (Compressor, Limiter, Saturation, Stereo Width)
 * Plus: True-Peak Limiter, Bitcrusher, Dithering, DC Blocker
 */

#pragma once

#include "../core/Instrument.hpp"
#include "../effects/MasteringLimiter.hpp"
#include "../effects/Bitcrusher.hpp"
#include "../effects/Dither.hpp"
#include "../effects/Utilities.hpp"
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

    // Limiter (Simple)
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

    // --- NEW: True-Peak Mastering Limiter ---
    TRUEPEAK_ENABLE = 80,
    TRUEPEAK_CEILING = 81,
    TRUEPEAK_RELEASE = 82,

    // --- NEW: Bitcrusher ---
    BITCRUSH_ENABLE = 90,
    BITCRUSH_DEPTH = 91,       // 1-16 bits
    BITCRUSH_RATE = 92,        // 0-1 sample rate reduction

    // --- NEW: Dithering ---
    DITHER_ENABLE = 100,
    DITHER_BITDEPTH = 101,     // Target bit depth (16, 24)
    DITHER_TYPE = 102,         // 0=TPDF, 1=Rectangular, 2=NoiseShaped

    // --- NEW: DC Blocker ---
    DCBLOCK_ENABLE = 110,
    DCBLOCK_CUTOFF = 111,      // Cutoff frequency (Hz)

    // --- NEW: Soft Clipper ---
    SOFTCLIP_ENABLE = 120,
    SOFTCLIP_DRIVE = 121,      // 1-8
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
        , m_truePeakEnabled(false)
        , m_bitcrushEnabled(false)
        , m_ditherEnabled(false)
        , m_dcBlockEnabled(true)   // DC blocker on by default
        , m_softClipEnabled(false)
    {}

    // --- Identity ---
    InstrumentId getId() const override { return m_id; }
    const char* getName() const override { return "FxProcessor"; }
    InstrumentType getType() const override { return InstrumentType::FX; }

    // --- Lifecycle ---
    void initialize(float sampleRate) override {
        m_sampleRate = sampleRate;
        m_truePeakLimiter.setSampleRate(sampleRate);
        m_dcBlocker.setCutoff(20.0f, sampleRate);
    }

    void reset() override {
        m_compressor = SimpleCompressor();
        m_limiter = SimpleLimiter();
        m_tapeSat = TapeSaturation();
        m_stereoWidth = StereoWidth();
        m_truePeakLimiter.reset();
        m_bitcrusher.reset();
        m_dither.reset();
        m_dcBlocker.reset();
        m_softClipper.reset();
        m_hardLimiter.reset();
    }

    // --- Audio Processing ---
    // Full mastering chain with all effects
    void process(float* outputBuffer, size_t numSamples) override {
        if (!m_enabled) return;

        const size_t numFrames = numSamples;  // Assuming interleaved stereo

        // 1. DC Blocker (first - clean up signal, buffer-level for stereo)
        if (m_dcBlockEnabled) {
            m_dcBlocker.processStereo(outputBuffer, numFrames);
        }

        // 2. Bitcrusher (lo-fi effect, buffer-level for efficiency)
        if (m_bitcrushEnabled) {
            m_bitcrusher.processStereo(outputBuffer, numFrames);
        }

        // Sample-by-sample processing
        for (size_t i = 0; i < numFrames; i++) {
            float left = outputBuffer[i * 2];
            float right = outputBuffer[i * 2 + 1];

            // === MASTERING CHAIN ===

            // 3. Soft Clipper (warm saturation)
            if (m_softClipEnabled) {
                left = m_softClipper.process(left);
                right = m_softClipper.process(right);
            }

            // 4. Tape Saturation (analog warmth)
            left = m_tapeSat.process(left);
            right = m_tapeSat.process(right);

            // 5. Compressor (dynamic control)
            left = m_compressor.process(left, m_sampleRate);
            right = m_compressor.process(right, m_sampleRate);

            // 6. Stereo Width (widening)
            m_stereoWidth.process(left, right);

            // 7. Master Volume
            left *= m_masterVol;
            right *= m_masterVol;

            // 8. Simple Limiter (fast safety)
            left = m_limiter.process(left, m_sampleRate);
            right = m_limiter.process(right, m_sampleRate);

            // Write back
            outputBuffer[i * 2] = left;
            outputBuffer[i * 2 + 1] = right;
        }

        // 9. True-Peak Limiter (buffer-level processing for oversampling)
        if (m_truePeakEnabled) {
            m_truePeakLimiter.processStereo(outputBuffer, numFrames);
        }

        // 10. Dithering (last step before output)
        if (m_ditherEnabled) {
            m_dither.processStereo(outputBuffer, numFrames);
        }

        // 11. Hard Safety Limiter (should never be hit)
        m_hardLimiter.processStereo(outputBuffer, numFrames);
    }

    // --- Parameter Handling ---
    void setParameter(ParamId paramId, float value) override {
        switch (static_cast<FxParam>(paramId)) {
            // Compressor
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

            // Simple Limiter
            case FxParam::LIMIT_CEILING:
                m_limiter.setCeiling(NEXUS_DB_TO_LINEAR(value));
                break;
            case FxParam::LIMIT_RELEASE:
                m_limiter.setRelease(value / 1000.0f);
                break;

            // Tape Saturation
            case FxParam::TAPE_WARMTH:
                m_tapeSat.setWarmth(value);
                break;
            case FxParam::TAPE_DRIVE:
                m_tapeSat.setDrive(value);
                break;

            // Stereo Width
            case FxParam::STEREO_WIDTH:
                m_stereoWidth.setWidth(value / 100.0f);  // % to ratio
                break;

            // Master Volume
            case FxParam::MASTER_VOL:
                m_masterVol = NEXUS_CLAMP(value, 0.0f, 1.0f);
                break;

            // === NEW: True-Peak Limiter ===
            case FxParam::TRUEPEAK_ENABLE:
                m_truePeakEnabled = (value > 0.5f);
                break;
            case FxParam::TRUEPEAK_CEILING:
                m_truePeakLimiter.setCeilingDb(value);
                break;
            case FxParam::TRUEPEAK_RELEASE:
                m_truePeakLimiter.setRelease(value / 1000.0f);
                break;

            // === NEW: Bitcrusher ===
            case FxParam::BITCRUSH_ENABLE:
                m_bitcrushEnabled = (value > 0.5f);
                m_bitcrusher.setBitDepth(16.0f);  // Reset when enabled
                break;
            case FxParam::BITCRUSH_DEPTH:
                m_bitcrusher.setBitDepth(value);
                break;
            case FxParam::BITCRUSH_RATE:
                m_bitcrusher.setFrequencyReduction(value);
                break;

            // === NEW: Dithering ===
            case FxParam::DITHER_ENABLE:
                m_ditherEnabled = (value > 0.5f);
                m_dither.setEnabled(m_ditherEnabled);
                break;
            case FxParam::DITHER_BITDEPTH:
                m_dither.setTargetBitDepth(static_cast<int>(value));
                break;
            case FxParam::DITHER_TYPE:
                // 0 = TPDF (default), 1 = Rectangular, 2 = Noise Shaped
                // For now, all use TPDF dithering
                m_dither.setTargetBitDepth(m_dither.getTargetBitDepth());
                break;

            // === NEW: DC Blocker ===
            case FxParam::DCBLOCK_ENABLE:
                m_dcBlockEnabled = (value > 0.5f);
                break;
            case FxParam::DCBLOCK_CUTOFF:
                m_dcBlocker.setCutoff(value, m_sampleRate);
                break;

            // === NEW: Soft Clipper ===
            case FxParam::SOFTCLIP_ENABLE:
                m_softClipEnabled = (value > 0.5f);
                m_softClipper.setEnabled(m_softClipEnabled);
                break;
            case FxParam::SOFTCLIP_DRIVE:
                m_softClipper.setDrive(value);
                break;

            default:
                break;
        }
    }

    float getParameter(ParamId paramId) const override {
        switch (static_cast<FxParam>(paramId)) {
            case FxParam::MASTER_VOL: return m_masterVol;
            case FxParam::TRUEPEAK_ENABLE: return m_truePeakEnabled ? 1.0f : 0.0f;
            case FxParam::TRUEPEAK_CEILING: return NEXUS_LINEAR_TO_DB(m_truePeakLimiter.getCeiling());
            case FxParam::BITCRUSH_ENABLE: return m_bitcrushEnabled ? 1.0f : 0.0f;
            case FxParam::BITCRUSH_DEPTH: return m_bitcrusher.getBitDepth();
            case FxParam::BITCRUSH_RATE: return m_bitcrusher.getFrequencyReduction();
            case FxParam::DITHER_ENABLE: return m_ditherEnabled ? 1.0f : 0.0f;
            case FxParam::DITHER_BITDEPTH: return static_cast<float>(m_dither.getTargetBitDepth());
            case FxParam::DCBLOCK_ENABLE: return m_dcBlockEnabled ? 1.0f : 0.0f;
            case FxParam::SOFTCLIP_ENABLE: return m_softClipEnabled ? 1.0f : 0.0f;
            case FxParam::SOFTCLIP_DRIVE: return m_softClipper.getDrive();
            default: return 0.0f;
        }
    }

private:
    InstrumentId m_id;
    float m_masterVol;
    float m_sampleRate = SAMPLE_RATE;

    // Flags for new effects
    bool m_truePeakEnabled;
    bool m_bitcrushEnabled;
    bool m_ditherEnabled;
    bool m_dcBlockEnabled;
    bool m_softClipEnabled;

    // Original effect processors
    SimpleCompressor m_compressor;
    SimpleLimiter m_limiter;
    TapeSaturation m_tapeSat;
    StereoWidth m_stereoWidth;

    // === NEW: Additional processors ===
    MasteringLimiter m_truePeakLimiter;
    Bitcrusher m_bitcrusher;
    TpdfDither m_dither;
    DcBlocker m_dcBlocker;
    SoftClipper m_softClipper;
    HardLimiter m_hardLimiter;
};

} // namespace nexus
