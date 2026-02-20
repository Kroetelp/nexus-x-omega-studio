/**
 * NEXUS-X Voice v5.0
 * Polyphonic voice for synthesizers
 */

#pragma once

#include "Types.hpp"
#include <cmath>

namespace nexus {

// ============================================================
// ADSR ENVELOPE
// ============================================================

class ADSREnvelope {
public:
    ADSREnvelope()
        : m_state(EnvState::IDLE)
        , m_level(0.0f)
        , m_attack(0.01f)
        , m_decay(0.1f)
        , m_sustain(0.7f)
        , m_release(0.3f)
        , m_sampleRate(SAMPLE_RATE)
    {}

    void setSampleRate(float sr) {
        m_sampleRate = sr;
    }

    void setADSR(float attack, float decay, float sustain, float release) {
        m_attack = std::max(0.001f, attack);
        m_decay = std::max(0.001f, decay);
        m_sustain = std::max(0.0f, std::min(1.0f, sustain));
        m_release = std::max(0.001f, release);
    }

    void noteOn() {
        m_state = EnvState::ATTACK;
        m_level = 0.0f;
    }

    void noteOff() {
        if (m_state != EnvState::IDLE) {
            m_state = EnvState::RELEASE;
        }
    }

    float process() {
        const float coeff = 1.0f / m_sampleRate;

        switch (m_state) {
            case EnvState::ATTACK:
                m_level += coeff / m_attack;
                if (m_level >= 1.0f) {
                    m_level = 1.0f;
                    m_state = EnvState::DECAY;
                }
                break;

            case EnvState::DECAY:
                m_level -= (1.0f - m_sustain) * (coeff / m_decay);
                if (m_level <= m_sustain) {
                    m_level = m_sustain;
                    m_state = EnvState::SUSTAIN;
                }
                break;

            case EnvState::SUSTAIN:
                m_level = m_sustain;
                break;

            case EnvState::RELEASE:
                m_level -= m_sustain * (coeff / m_release);
                if (m_level <= 0.0f) {
                    m_level = 0.0f;
                    m_state = EnvState::IDLE;
                }
                break;

            case EnvState::IDLE:
            default:
                m_level = 0.0f;
                break;
        }

        return m_level;
    }

    bool isActive() const {
        return m_state != EnvState::IDLE;
    }

    EnvState getState() const {
        return m_state;
    }

    float getLevel() const {
        return m_level;
    }

private:
    EnvState m_state;
    float m_level;
    float m_attack, m_decay, m_sustain, m_release;
    float m_sampleRate;
};

// ============================================================
// SIMPLE LOWPASS FILTER
// ============================================================

class LowpassFilter {
public:
    LowpassFilter()
        : m_cutoff(2000.0f)
        , m_resonance(0.5f)
        , m_prevSample(0.0f)
        , m_sampleRate(SAMPLE_RATE)
    {}

    void setCutoff(float hz) {
        m_cutoff = std::max(20.0f, std::min(20000.0f, hz));
    }

    void setResonance(float r) {
        m_resonance = std::max(0.0f, std::min(1.0f, r));
    }

    float process(float input) {
        // Simple one-pole lowpass
        const float dt = 1.0f / m_sampleRate;
        const float rc = 1.0f / (TWO_PI * m_cutoff);
        const float alpha = dt / (rc + dt);

        float output = m_prevSample + alpha * (input - m_prevSample);
        m_prevSample = output;

        // Add resonance feedback
        if (m_resonance > 0.0f) {
            output += m_resonance * 0.3f * (input - output);
        }

        return output;
    }

    void reset() {
        m_prevSample = 0.0f;
    }

private:
    float m_cutoff;
    float m_resonance;
    float m_prevSample;
    float m_sampleRate;
};

// ============================================================
// OSCILLATOR
// ============================================================

class Oscillator {
public:
    Oscillator()
        : m_phase(0.0f)
        , m_phaseIncrement(0.0f)
        , m_type(OscType::SAW)
        , m_sampleRate(SAMPLE_RATE)
    {}

    void setSampleRate(float sr) {
        m_sampleRate = sr;
    }

    void setFrequency(float hz) {
        m_phaseIncrement = hz / m_sampleRate;
    }

    void setType(OscType type) {
        m_type = type;
    }

    float process() {
        float sample = 0.0f;

        switch (m_type) {
            case OscType::SINE:
                sample = std::sin(TWO_PI * m_phase);
                break;

            case OscType::SAW:
                sample = 2.0f * m_phase - 1.0f;
                break;

            case OscType::SQUARE:
                sample = m_phase < 0.5f ? 1.0f : -1.0f;
                break;

            case OscType::TRIANGLE:
                sample = 4.0f * std::abs(m_phase - 0.5f) - 1.0f;
                break;
        }

        // Advance phase
        m_phase += m_phaseIncrement;
        while (m_phase >= 1.0f) {
            m_phase -= 1.0f;
        }

        return sample;
    }

    void reset() {
        m_phase = 0.0f;
    }

private:
    float m_phase;
    float m_phaseIncrement;
    OscType m_type;
    float m_sampleRate;
};

// ============================================================
// VOICE (Oscillator + Envelope + Filter)
// ============================================================

class Voice {
public:
    Voice()
        : m_note(0)
        , m_velocity(0.0f)
        , m_active(false)
        , m_detune(0.0f)
    {}

    void noteOn(uint8_t note, float velocity) {
        m_note = note;
        m_velocity = velocity;
        m_active = true;

        // Calculate frequency from MIDI note
        float freq = midiToFreq(note);
        m_osc.setFrequency(freq * (1.0f + m_detune / 100.0f));

        m_envelope.noteOn();
    }

    void noteOff() {
        m_envelope.noteOff();
    }

    float process() {
        if (!m_active) return 0.0f;

        // Generate oscillator sample
        float sample = m_osc.process();

        // Apply filter
        sample = m_filter.process(sample);

        // Apply envelope
        float env = m_envelope.process();

        // If envelope finished, deactivate voice
        if (!m_envelope.isActive()) {
            m_active = false;
        }

        return sample * env * m_velocity;
    }

    bool isActive() const {
        return m_active && m_envelope.isActive();
    }

    uint8_t getNote() const {
        return m_note;
    }

    void setOscType(OscType type) {
        m_osc.setType(type);
    }

    void setFilter(float cutoff, float resonance) {
        m_filter.setCutoff(cutoff);
        m_filter.setResonance(resonance);
    }

    void setADSR(float a, float d, float s, float r) {
        m_envelope.setADSR(a, d, s, r);
    }

    void setDetune(float cents) {
        m_detune = cents;
    }

    void reset() {
        m_osc.reset();
        m_filter.reset();
        m_active = false;
        m_note = 0;
        m_velocity = 0.0f;
    }

private:
    float midiToFreq(uint8_t note) {
        // A4 = 440Hz = MIDI note 69
        return 440.0f * std::pow(2.0f, (note - 69) / 12.0f);
    }

    Oscillator m_osc;
    ADSREnvelope m_envelope;
    LowpassFilter m_filter;

    uint8_t m_note;
    float m_velocity;
    float m_detune;
    bool m_active;
};

} // namespace nexus
