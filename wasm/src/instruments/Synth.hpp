/**
 * NEXUS-X Synth v5.0
 * Polyphonic synthesizer instrument
 */

#pragma once

#include "../core/Instrument.hpp"
#include "../core/Voice.hpp"

namespace nexus {

// ============================================================
// SYNTH PARAMETER IDs (must match TypeScript SynthParam)
// ============================================================
enum class SynthParam : uint32_t {
    // Oscillator
    OSC_TYPE = 0,
    OSC_OCTAVE = 1,
    OSC_DETUNE = 2,

    // Filter
    FILTER_TYPE = 10,
    FILTER_CUTOFF = 11,
    FILTER_RESO = 12,
    FILTER_ENV_AMT = 13,

    // Amp ADSR
    AMP_ATTACK = 20,
    AMP_DECAY = 21,
    AMP_SUSTAIN = 22,
    AMP_RELEASE = 23,

    // Filter ADSR
    FLT_ATTACK = 30,
    FLT_DECAY = 31,
    FLT_SUSTAIN = 32,
    FLT_RELEASE = 33,

    // LFO
    LFO_TYPE = 40,
    LFO_RATE = 41,
    LFO_DEPTH = 42,

    // Glide
    GLIDE_TIME = 50,
    GLIDE_MODE = 51,

    // Master
    MASTER_VOL = 60,
    MASTER_PAN = 61,
};

// ============================================================
// SYNTH IMPLEMENTATION
// ============================================================

class Synth : public Instrument {
public:
    Synth(InstrumentId id, size_t polyphony = MAX_VOICES)
        : m_id(id)
        , m_polyphony(polyphony)
        , m_masterVol(0.8f)
        , m_masterPan(0.0f)
        , m_oscType(OscType::SAW)
        , m_filterCutoff(2000.0f)
        , m_filterReso(0.3f)
        , m_attack(0.01f)
        , m_decay(0.1f)
        , m_sustain(0.7f)
        , m_release(0.3f)
    {
        // Initialize voices
        for (size_t i = 0; i < MAX_VOICES; i++) {
            m_voices[i] = new Voice();
        }
    }

    ~Synth() override {
        for (size_t i = 0; i < MAX_VOICES; i++) {
            delete m_voices[i];
        }
    }

    // --- Identity ---
    InstrumentId getId() const override { return m_id; }
    const char* getName() const override { return "Synth"; }
    InstrumentType getType() const override { return InstrumentType::SYNTH; }

    // --- Lifecycle ---
    void initialize(float sampleRate) override {
        m_sampleRate = sampleRate;
        for (size_t i = 0; i < m_polyphony; i++) {
            // Voices will be initialized when used
        }
    }

    void reset() override {
        for (size_t i = 0; i < MAX_VOICES; i++) {
            if (m_voices[i]) {
                m_voices[i]->reset();
            }
        }
    }

    // --- Audio Processing ---
    void process(float* outputBuffer, size_t numSamples) override {
        if (!m_enabled) return;

        // Clear buffer
        for (size_t i = 0; i < numSamples * 2; i++) {
            outputBuffer[i] = 0.0f;
        }

        // Process each active voice
        for (size_t v = 0; v < m_polyphony; v++) {
            if (m_voices[v] && m_voices[v]->isActive()) {
                for (size_t i = 0; i < numSamples; i++) {
                    float sample = m_voices[v]->process();

                    // Apply master volume and pan
                    float left = sample * m_masterVol * (1.0f - std::max(0.0f, m_masterPan));
                    float right = sample * m_masterVol * (1.0f + std::min(0.0f, m_masterPan));

                    // Mix into output (stereo interleaved)
                    outputBuffer[i * 2] += left;
                    outputBuffer[i * 2 + 1] += right;
                }
            }
        }
    }

    // --- Parameter Handling ---
    void setParameter(ParamId paramId, float value) override {
        switch (static_cast<SynthParam>(paramId)) {
            case SynthParam::OSC_TYPE:
                m_oscType = static_cast<OscType>(NEXUS_CLAMP(value, 0, 3));
                updateVoicesOscType();
                break;

            case SynthParam::OSC_OCTAVE:
                // TODO: Implement octave shift
                break;

            case SynthParam::OSC_DETUNE:
                for (size_t i = 0; i < m_polyphony; i++) {
                    if (m_voices[i]) {
                        m_voices[i]->setDetune(value);
                    }
                }
                break;

            case SynthParam::FILTER_CUTOFF:
                m_filterCutoff = NEXUS_CLAMP(value, 20.0f, 20000.0f);
                updateVoicesFilter();
                break;

            case SynthParam::FILTER_RESO:
                m_filterReso = NEXUS_CLAMP(value, 0.0f, 1.0f);
                updateVoicesFilter();
                break;

            case SynthParam::AMP_ATTACK:
                m_attack = NEXUS_CLAMP(value, 0.001f, 5.0f);
                updateVoicesADSR();
                break;

            case SynthParam::AMP_DECAY:
                m_decay = NEXUS_CLAMP(value, 0.001f, 5.0f);
                updateVoicesADSR();
                break;

            case SynthParam::AMP_SUSTAIN:
                m_sustain = NEXUS_CLAMP(value, 0.0f, 1.0f);
                updateVoicesADSR();
                break;

            case SynthParam::AMP_RELEASE:
                m_release = NEXUS_CLAMP(value, 0.001f, 10.0f);
                updateVoicesADSR();
                break;

            case SynthParam::MASTER_VOL:
                m_masterVol = NEXUS_CLAMP(value, 0.0f, 1.0f);
                break;

            case SynthParam::MASTER_PAN:
                m_masterPan = NEXUS_CLAMP(value, -1.0f, 1.0f);
                break;

            default:
                // Unknown parameter - ignore
                break;
        }
    }

    float getParameter(ParamId paramId) const override {
        switch (static_cast<SynthParam>(paramId)) {
            case SynthParam::OSC_TYPE: return static_cast<float>(m_oscType);
            case SynthParam::FILTER_CUTOFF: return m_filterCutoff;
            case SynthParam::FILTER_RESO: return m_filterReso;
            case SynthParam::AMP_ATTACK: return m_attack;
            case SynthParam::AMP_DECAY: return m_decay;
            case SynthParam::AMP_SUSTAIN: return m_sustain;
            case SynthParam::AMP_RELEASE: return m_release;
            case SynthParam::MASTER_VOL: return m_masterVol;
            case SynthParam::MASTER_PAN: return m_masterPan;
            default: return 0.0f;
        }
    }

    // --- Note Handling ---
    void noteOn(uint8_t note, float velocity) override {
        // Find free voice
        Voice* voice = findFreeVoice();
        if (voice) {
            voice->setOscType(m_oscType);
            voice->setFilter(m_filterCutoff, m_filterReso);
            voice->setADSR(m_attack, m_decay, m_sustain, m_release);
            voice->noteOn(note, velocity);
        }
    }

    void noteOff(uint8_t note) override {
        // Find voice playing this note
        for (size_t i = 0; i < m_polyphony; i++) {
            if (m_voices[i] && m_voices[i]->isActive() && m_voices[i]->getNote() == note) {
                m_voices[i]->noteOff();
            }
        }
    }

    bool supportsNotes() const override { return true; }

    size_t getActiveVoiceCount() const override {
        size_t count = 0;
        for (size_t i = 0; i < m_polyphony; i++) {
            if (m_voices[i] && m_voices[i]->isActive()) {
                count++;
            }
        }
        return count;
    }

private:
    Voice* findFreeVoice() {
        // First, try to find a completely free voice
        for (size_t i = 0; i < m_polyphony; i++) {
            if (m_voices[i] && !m_voices[i]->isActive()) {
                return m_voices[i];
            }
        }

        // If all voices are in use, steal the oldest one
        // (Simple voice stealing - in production, use voice priority)
        for (size_t i = 0; i < m_polyphony; i++) {
            if (m_voices[i]) {
                return m_voices[i];
            }
        }

        return nullptr;
    }

    void updateVoicesOscType() {
        for (size_t i = 0; i < m_polyphony; i++) {
            if (m_voices[i]) {
                m_voices[i]->setOscType(m_oscType);
            }
        }
    }

    void updateVoicesFilter() {
        for (size_t i = 0; i < m_polyphony; i++) {
            if (m_voices[i]) {
                m_voices[i]->setFilter(m_filterCutoff, m_filterReso);
            }
        }
    }

    void updateVoicesADSR() {
        for (size_t i = 0; i < m_polyphony; i++) {
            if (m_voices[i]) {
                m_voices[i]->setADSR(m_attack, m_decay, m_sustain, m_release);
            }
        }
    }

    // Identity
    InstrumentId m_id;
    size_t m_polyphony;

    // Voices
    Voice* m_voices[MAX_VOICES];

    // Master parameters
    float m_masterVol;
    float m_masterPan;

    // Synth parameters
    OscType m_oscType;
    float m_filterCutoff;
    float m_filterReso;
    float m_attack;
    float m_decay;
    float m_sustain;
    float m_release;
};

} // namespace nexus
