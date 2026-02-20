/**
 * NEXUS-X Instrument v5.0
 * Abstract base class for all instruments
 */

#pragma once

#include "Types.hpp"
#include <cstdint>

namespace nexus {

// ============================================================
// ABSTRACT INSTRUMENT BASE CLASS
// ============================================================

class Instrument {
public:
    virtual ~Instrument() = default;

    // --- Identity ---
    virtual InstrumentId getId() const = 0;
    virtual const char* getName() const = 0;
    virtual InstrumentType getType() const = 0;

    // --- Lifecycle ---
    virtual void initialize(float sampleRate) = 0;
    virtual void reset() = 0;

    // --- Audio Processing ---
    // Process samples and write to output buffer (stereo interleaved)
    // outputBuffer: interleaved stereo samples [L, R, L, R, ...]
    // numSamples: number of sample frames (each frame = 2 floats for stereo)
    virtual void process(float* outputBuffer, size_t numSamples) = 0;

    // --- Parameter Handling ---
    virtual void setParameter(ParamId paramId, float value) = 0;
    virtual float getParameter(ParamId paramId) const = 0;

    // --- Note Handling (for melodic instruments) ---
    virtual void noteOn(uint8_t note, float velocity) {}
    virtual void noteOff(uint8_t note) {}
    virtual bool supportsNotes() const { return false; }

    // --- Status ---
    virtual bool isActive() const { return true; }
    virtual size_t getActiveVoiceCount() const { return 0; }

    // --- Enable/Disable ---
    void setEnabled(bool enabled) { m_enabled = enabled; }
    bool isEnabled() const { return m_enabled; }

protected:
    bool m_enabled = true;
    float m_sampleRate = SAMPLE_RATE;
};

// ============================================================
// PARAMETER HELPER MACROS
// ============================================================

// Clamp a value to a range
#define NEXUS_CLAMP(val, min, max) \
    ((val) < (min) ? (min) : ((val) > (max) ? (max) : (val)))

// Linear interpolation
#define NEXUS_LERP(a, b, t) \
    ((a) + (t) * ((b) - (a)))

// Convert dB to linear
#define NEXUS_DB_TO_LINEAR(db) \
    powf(10.0f, (db) / 20.0f)

// Convert linear to dB
#define NEXUS_LINEAR_TO_DB(linear) \
    (20.0f * log10f(std::max(1e-10f, (linear))))

} // namespace nexus
