/**
 * NEXUS-X Drum Machine v5.0
 * Percussion synthesizer
 */

#pragma once

#include "../core/Instrument.hpp"
#include "../core/Voice.hpp"
#include <cstdlib>
#include <ctime>

namespace nexus {

// ============================================================
// DRUM PARAMETER IDs (must match TypeScript DrumParam)
// ============================================================
enum class DrumParam : uint32_t {
    // Kick
    KICK_PITCH = 0,
    KICK_DECAY = 1,
    KICK_PUNCH = 2,
    KICK_DRIVE = 3,

    // Snare
    SNARE_TONE = 10,
    SNARE_SNAPPY = 11,
    SNARE_DECAY = 12,

    // HiHat
    HAT_TONE = 20,
    HAT_DECAY = 21,
    HAT_TIGHT = 22,

    // Clap
    CLAP_TONE = 30,
    CLAP_DECAY = 31,
    CLAP_SPREAD = 32,

    // Master
    MASTER_VOL = 60,
};

// ============================================================
// DRUM TYPES
// ============================================================
enum class DrumType : uint32_t {
    KICK = 0,
    SNARE = 1,
    CLAP = 2,
    HIHAT_CLOSED = 3,
    HIHAT_OPEN = 4,
    TOM = 5,
    RIM = 6,
    CYMBAL = 7,
};

// ============================================================
// KICK DRUM SYNTHESIZER
// ============================================================

class KickSynth {
public:
    KickSynth()
        : m_pitch(50.0f)
        , m_decay(0.4f)
        , m_punch(0.5f)
        , m_drive(0.2f)
        , m_phase(0.0f)
        , m_level(0.0f)
        , m_active(false)
    {}

    void trigger(float velocity) {
        m_level = velocity;
        m_phase = 0.0f;
        m_active = true;
        m_pitchMod = m_pitch * 2.0f;  // Start higher for punch
    }

    float process(float sampleRate) {
        if (!m_active) return 0.0f;

        // Exponential decay
        const float decayCoeff = 1.0f / (m_decay * sampleRate);
        m_level -= decayCoeff;
        if (m_level <= 0.0f) {
            m_level = 0.0f;
            m_active = false;
            return 0.0f;
        }

        // Pitch drop (from high to low)
        m_pitchMod = m_pitch + (m_pitchMod - m_pitch) * 0.995f;

        // Sine wave
        const float freq = m_pitchMod;
        m_phase += freq / sampleRate;
        if (m_phase >= 1.0f) m_phase -= 1.0f;

        float sample = std::sin(TWO_PI * m_phase);

        // Add punch (initial transient)
        if (m_level > 0.8f) {
            sample += m_punch * (m_level - 0.8f) * 2.5f * (std::rand() % 100 / 100.0f - 0.5f);
        }

        // Apply drive (soft clipping)
        if (m_drive > 0.0f) {
            sample = std::tanh(sample * (1.0f + m_drive * 2.0f));
        }

        return sample * m_level;
    }

    void setPitch(float hz) { m_pitch = NEXUS_CLAMP(hz, 30.0f, 100.0f); }
    void setDecay(float s) { m_decay = NEXUS_CLAMP(s, 0.1f, 1.0f); }
    void setPunch(float p) { m_punch = NEXUS_CLAMP(p, 0.0f, 1.0f); }
    void setDrive(float d) { m_drive = NEXUS_CLAMP(d, 0.0f, 1.0f); }
    bool isActive() const { return m_active; }

private:
    float m_pitch;
    float m_decay;
    float m_punch;
    float m_drive;
    float m_phase;
    float m_level;
    float m_pitchMod;
    bool m_active;
};

// ============================================================
// NOISE SYNTHESIZER (Snare, HiHat, Clap)
// ============================================================

class NoiseSynth {
public:
    NoiseSynth()
        : m_tone(1000.0f)
        , m_decay(0.2f)
        , m_tight(0.8f)
        , m_level(0.0f)
        , m_active(false)
        , m_prevSample(0.0f)
    {}

    void trigger(float velocity) {
        m_level = velocity;
        m_active = true;
    }

    float process(float sampleRate) {
        if (!m_active) return 0.0f;

        // Decay
        const float decayCoeff = 1.0f / (m_decay * sampleRate);
        m_level -= decayCoeff;
        if (m_level <= 0.0f) {
            m_level = 0.0f;
            m_active = false;
            return 0.0f;
        }

        // White noise
        float noise = (std::rand() % 65536 - 32768) / 32768.0f;

        // Highpass filter based on tone
        const float dt = 1.0f / sampleRate;
        const float rc = 1.0f / (TWO_PI * m_tone);
        const float alpha = rc / (rc + dt);

        float filtered = alpha * (m_prevSample + noise);
        m_prevSample = filtered;

        return filtered * m_level * m_tight;
    }

    void setTone(float hz) { m_tone = NEXUS_CLAMP(hz, 100.0f, 15000.0f); }
    void setDecay(float s) { m_decay = NEXUS_CLAMP(s, 0.01f, 0.5f); }
    void setTight(float t) { m_tight = NEXUS_CLAMP(t, 0.0f, 1.0f); }
    bool isActive() const { return m_active; }

private:
    float m_tone;
    float m_decay;
    float m_tight;
    float m_level;
    float m_prevSample;
    bool m_active;
};

// ============================================================
// DRUM MACHINE INSTRUMENT
// ============================================================

class DrumMachine : public Instrument {
public:
    DrumMachine(InstrumentId id, DrumType drumType = DrumType::KICK)
        : m_id(id)
        , m_drumType(drumType)
        , m_masterVol(0.8f)
    {
        // Seed random number generator
        std::srand(static_cast<unsigned>(std::time(nullptr)));
    }

    // --- Identity ---
    InstrumentId getId() const override { return m_id; }
    const char* getName() const override { return "DrumMachine"; }
    InstrumentType getType() const override { return InstrumentType::DRUM; }

    // --- Lifecycle ---
    void initialize(float sampleRate) override {
        m_sampleRate = sampleRate;
    }

    void reset() override {
        m_kickSynth = KickSynth();
        m_noiseSynth = NoiseSynth();
    }

    // --- Audio Processing ---
    void process(float* outputBuffer, size_t numSamples) override {
        if (!m_enabled) return;

        for (size_t i = 0; i < numSamples; i++) {
            float sample = 0.0f;

            // Process based on drum type
            switch (m_drumType) {
                case DrumType::KICK:
                    sample = m_kickSynth.process(m_sampleRate);
                    break;

                case DrumType::SNARE:
                    sample = m_noiseSynth.process(m_sampleRate) * 0.7f;
                    sample += m_kickSynth.process(m_sampleRate) * 0.3f;
                    break;

                case DrumType::CLAP:
                    sample = m_noiseSynth.process(m_sampleRate);
                    break;

                case DrumType::HIHAT_CLOSED:
                case DrumType::HIHAT_OPEN:
                    sample = m_noiseSynth.process(m_sampleRate);
                    break;

                default:
                    sample = m_noiseSynth.process(m_sampleRate);
                    break;
            }

            // Apply master volume
            sample *= m_masterVol;

            // Write to output (stereo)
            outputBuffer[i * 2] = sample;
            outputBuffer[i * 2 + 1] = sample;
        }
    }

    // --- Parameter Handling ---
    void setParameter(ParamId paramId, float value) override {
        switch (static_cast<DrumParam>(paramId)) {
            case DrumParam::KICK_PITCH:
                m_kickSynth.setPitch(value);
                break;
            case DrumParam::KICK_DECAY:
                m_kickSynth.setDecay(value);
                break;
            case DrumParam::KICK_PUNCH:
                m_kickSynth.setPunch(value);
                break;
            case DrumParam::KICK_DRIVE:
                m_kickSynth.setDrive(value);
                break;

            case DrumParam::SNARE_TONE:
            case DrumParam::HAT_TONE:
            case DrumParam::CLAP_TONE:
                m_noiseSynth.setTone(value);
                break;
            case DrumParam::SNARE_DECAY:
            case DrumParam::HAT_DECAY:
            case DrumParam::CLAP_DECAY:
                m_noiseSynth.setDecay(value);
                break;
            case DrumParam::HAT_TIGHT:
                m_noiseSynth.setTight(value);
                break;

            case DrumParam::MASTER_VOL:
                m_masterVol = NEXUS_CLAMP(value, 0.0f, 1.0f);
                break;

            default:
                break;
        }
    }

    float getParameter(ParamId paramId) const override {
        switch (static_cast<DrumParam>(paramId)) {
            case DrumParam::MASTER_VOL: return m_masterVol;
            default: return 0.0f;
        }
    }

    // --- Note Handling ---
    void noteOn(uint8_t note, float velocity) override {
        // For drums, note number is ignored, velocity matters
        switch (m_drumType) {
            case DrumType::KICK:
                m_kickSynth.trigger(velocity);
                break;
            case DrumType::SNARE:
                m_kickSynth.trigger(velocity * 0.5f);
                m_noiseSynth.trigger(velocity);
                break;
            case DrumType::CLAP:
            case DrumType::HIHAT_CLOSED:
            case DrumType::HIHAT_OPEN:
                m_noiseSynth.trigger(velocity);
                break;
            default:
                m_noiseSynth.trigger(velocity);
                break;
        }
    }

    void noteOff(uint8_t note) override {
        // Drums don't have note-off, but hi-hat can choke
        if (m_drumType == DrumType::HIHAT_CLOSED) {
            m_noiseSynth = NoiseSynth();
        }
    }

private:
    InstrumentId m_id;
    DrumType m_drumType;
    float m_masterVol;

    // Drum synthesizers
    KickSynth m_kickSynth;
    NoiseSynth m_noiseSynth;
};

} // namespace nexus
