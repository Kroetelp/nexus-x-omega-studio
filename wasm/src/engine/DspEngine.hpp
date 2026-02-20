/**
 * NEXUS-X DSP Engine v5.0
 * Central manager for all instruments
 *
 * This is the main entry point for WASM audio processing.
 * It manages instrument registration, message routing, and audio rendering.
 */

#pragma once

#include "../core/Types.hpp"
#include "../core/Instrument.hpp"
#include "../instruments/Synth.hpp"
#include "../instruments/DrumMachine.hpp"
#include "../instruments/FxProcessor.hpp"

#include <array>
#include <cstdint>
#include <cstring>

namespace nexus {

// ============================================================
// DSP ENGINE
// ============================================================

class DspEngine {
public:
    DspEngine()
        : m_sampleRate(SAMPLE_RATE)
        , m_instrumentCount(0)
        , m_masterVol(0.8f)
    {
        // Clear instrument array
        m_instruments.fill(nullptr);
    }

    ~DspEngine() {
        // Delete all instruments
        for (size_t i = 0; i < MAX_INSTRUMENTS; i++) {
            if (m_instruments[i]) {
                delete m_instruments[i];
                m_instruments[i] = nullptr;
            }
        }
    }

    // ============================================================
    // LIFECYCLE
    // ============================================================

    void initialize(float sampleRate) {
        m_sampleRate = sampleRate;

        // Initialize all registered instruments
        for (size_t i = 0; i < MAX_INSTRUMENTS; i++) {
            if (m_instruments[i]) {
                m_instruments[i]->initialize(sampleRate);
            }
        }

        // Allocate mix buffer
        m_mixBuffer = new float[RENDER_QUANTUM * 2];  // Stereo
    }

    // ============================================================
    // INSTRUMENT MANAGEMENT
    // ============================================================

    bool registerInstrument(InstrumentId id, InstrumentType type, size_t polyphony = 1) {
        // Check if slot is available
        if (id >= MAX_INSTRUMENTS) {
            return false;
        }

        // Remove existing instrument at this slot
        if (m_instruments[id]) {
            delete m_instruments[id];
            m_instruments[id] = nullptr;
        }

        // Create new instrument based on type
        Instrument* inst = nullptr;

        switch (type) {
            case InstrumentType::SYNTH:
                inst = new Synth(id, polyphony);
                break;

            case InstrumentType::DRUM:
                inst = new DrumMachine(id, static_cast<DrumType>(id % 8));
                break;

            case InstrumentType::FX:
                inst = new FxProcessor(id);
                break;

            case InstrumentType::SAMPLER:
                // TODO: Implement sampler
                return false;

            default:
                return false;
        }

        if (inst) {
            inst->initialize(m_sampleRate);
            m_instruments[id] = inst;
            m_instrumentCount++;
            return true;
        }

        return false;
    }

    Instrument* getInstrument(InstrumentId id) {
        if (id < MAX_INSTRUMENTS) {
            return m_instruments[id];
        }
        return nullptr;
    }

    void removeInstrument(InstrumentId id) {
        if (id < MAX_INSTRUMENTS && m_instruments[id]) {
            delete m_instruments[id];
            m_instruments[id] = nullptr;
            m_instrumentCount--;
        }
    }

    // ============================================================
    // MESSAGE HANDLING
    // ============================================================

    void handleMessage(const Message& msg) {
        Instrument* inst = getInstrument(msg.instrumentId);

        switch (msg.type) {
            case MessageType::PARAM_CHANGE:
                if (inst) {
                    inst->setParameter(msg.data1, msg.data2);
                }
                break;

            case MessageType::NOTE_ON:
                if (inst && inst->supportsNotes()) {
                    inst->noteOn(static_cast<uint8_t>(msg.data1), msg.data2);
                }
                break;

            case MessageType::NOTE_OFF:
                if (inst && inst->supportsNotes()) {
                    inst->noteOff(static_cast<uint8_t>(msg.data1));
                }
                break;

            case MessageType::RESET:
                if (inst) {
                    inst->reset();
                }
                break;

            case MessageType::REGISTER_INSTRUMENT:
                registerInstrument(
                    msg.instrumentId,
                    static_cast<InstrumentType>(msg.data1),
                    static_cast<size_t>(msg.data2)
                );
                break;

            default:
                break;
        }
    }

    // ============================================================
    // AUDIO PROCESSING
    // ============================================================

    void process(float* outputBuffer, size_t numSamples) {
        // Clear mix buffer
        std::memset(m_mixBuffer, 0, numSamples * 2 * sizeof(float));

        // Process each instrument and mix
        for (size_t i = 0; i < MAX_INSTRUMENTS; i++) {
            Instrument* inst = m_instruments[i];
            if (inst && inst->isEnabled()) {
                // Process instrument into output buffer
                // Instruments write directly to output for efficiency
                inst->process(outputBuffer, numSamples);
            }
        }

        // Apply master volume
        for (size_t i = 0; i < numSamples * 2; i++) {
            outputBuffer[i] *= m_masterVol;

            // Safety hard limit
            outputBuffer[i] = NEXUS_CLAMP(outputBuffer[i], -0.99f, 0.99f);
        }
    }

    // ============================================================
    // MASTER CONTROLS
    // ============================================================

    void setMasterVolume(float vol) {
        m_masterVol = NEXUS_CLAMP(vol, 0.0f, 2.0f);
    }

    float getMasterVolume() const {
        return m_masterVol;
    }

    size_t getInstrumentCount() const {
        return m_instrumentCount;
    }

private:
    float m_sampleRate;
    float m_masterVol;
    size_t m_instrumentCount;

    // Instrument storage
    std::array<Instrument*, MAX_INSTRUMENTS> m_instruments;

    // Mix buffer
    float* m_mixBuffer;
};

} // namespace nexus
