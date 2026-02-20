/**
 * NEXUS-X DSP WASM Module v5.0
 * WebAssembly exports for JavaScript
 *
 * This is the entry point for the WASM module.
 * It exports functions that can be called from JavaScript.
 */

#include "engine/DspEngine.hpp"
#include "core/Types.hpp"

#include <emscripten.h>
#include <cstdint>
#include <cstring>

// ============================================================
// GLOBAL ENGINE INSTANCE
// ============================================================

static nexus::DspEngine* g_engine = nullptr;

// Audio buffers (stereo, RENDER_QUANTUM samples)
static float g_inputBuffer[RENDER_QUANTUM * 2];
static float g_outputBuffer[RENDER_QUANTUM * 2];

// ============================================================
// WASM EXPORTS
// ============================================================

extern "C" {

/**
 * Initialize the DSP engine
 * Must be called before any other functions
 */
EMSCRIPTEN_KEEPALIVE
void initialize(float sampleRate) {
    if (g_engine) {
        delete g_engine;
    }
    g_engine = new nexus::DspEngine();
    g_engine->initialize(sampleRate);

    // Clear buffers
    std::memset(g_inputBuffer, 0, sizeof(g_inputBuffer));
    std::memset(g_outputBuffer, 0, sizeof(g_outputBuffer));
}

/**
 * Get pointer to input buffer
 * JavaScript copies audio data here before processing
 */
EMSCRIPTEN_KEEPALIVE
float* getInputBuffer() {
    return g_inputBuffer;
}

/**
 * Get pointer to output buffer
 * JavaScript reads audio data from here after processing
 */
EMSCRIPTEN_KEEPALIVE
float* getOutputBuffer() {
    return g_outputBuffer;
}

/**
 * Process one block of audio
 * Input is in g_inputBuffer, output goes to g_outputBuffer
 *
 * @param numSamples Number of sample frames (typically 128)
 */
EMSCRIPTEN_KEEPALIVE
void process(uint32_t numSamples) {
    if (!g_engine) return;

    // Copy input to output (for passthrough + processing)
    // In a full implementation, we'd mix input with generated audio
    std::memcpy(g_outputBuffer, g_inputBuffer, numSamples * 2 * sizeof(float));

    // Process through engine
    g_engine->process(g_outputBuffer, numSamples);
}

/**
 * Handle a message from JavaScript
 *
 * @param type Message type (see MessageType enum)
 * @param instrumentId Target instrument ID
 * @param data1 First data field (paramId / note / type)
 * @param data2 Second data field (value / velocity / polyphony)
 */
EMSCRIPTEN_KEEPALIVE
void handleMessage(uint32_t type, uint32_t instrumentId, uint32_t data1, float data2) {
    if (!g_engine) return;

    nexus::Message msg;
    msg.type = static_cast<nexus::MessageType>(type);
    msg.instrumentId = instrumentId;
    msg.data1 = data1;
    msg.data2 = data2;

    g_engine->handleMessage(msg);
}

// ============================================================
// CONVENIENCE FUNCTIONS (Wrappers for handleMessage)
// ============================================================

/**
 * Register a new instrument
 *
 * @param id Unique instrument ID
 * @param type Instrument type (0=synth, 1=drum, 2=fx, 3=sampler)
 * @param polyphony Number of voices (for synths)
 */
EMSCRIPTEN_KEEPALIVE
void registerInstrument(uint32_t id, uint32_t type, uint32_t polyphony) {
    handleMessage(
        static_cast<uint32_t>(nexus::MessageType::REGISTER_INSTRUMENT),
        id, type, static_cast<float>(polyphony)
    );
}

/**
 * Set a parameter on an instrument
 *
 * @param instrumentId Target instrument
 * @param paramId Parameter to set
 * @param value New value
 */
EMSCRIPTEN_KEEPALIVE
void setParameter(uint32_t instrumentId, uint32_t paramId, float value) {
    handleMessage(
        static_cast<uint32_t>(nexus::MessageType::PARAM_CHANGE),
        instrumentId, paramId, value
    );
}

/**
 * Trigger a note on
 *
 * @param instrumentId Target instrument
 * @param note MIDI note number (0-127)
 * @param velocity Velocity (0-1)
 */
EMSCRIPTEN_KEEPALIVE
void noteOn(uint32_t instrumentId, uint8_t note, float velocity) {
    handleMessage(
        static_cast<uint32_t>(nexus::MessageType::NOTE_ON),
        instrumentId, note, velocity
    );
}

/**
 * Trigger a note off
 *
 * @param instrumentId Target instrument
 * @param note MIDI note number (0-127)
 */
EMSCRIPTEN_KEEPALIVE
void noteOff(uint32_t instrumentId, uint8_t note) {
    handleMessage(
        static_cast<uint32_t>(nexus::MessageType::NOTE_OFF),
        instrumentId, note, 0.0f
    );
}

/**
 * Reset an instrument
 *
 * @param instrumentId Target instrument
 */
EMSCRIPTEN_KEEPALIVE
void resetInstrument(uint32_t instrumentId) {
    handleMessage(
        static_cast<uint32_t>(nexus::MessageType::RESET),
        instrumentId, 0, 0.0f
    );
}

/**
 * Set master volume
 *
 * @param volume Master volume (0-1)
 */
EMSCRIPTEN_KEEPALIVE
void setMasterVolume(float volume) {
    if (g_engine) {
        g_engine->setMasterVolume(volume);
    }
}

/**
 * Get engine status
 *
 * @return Number of registered instruments
 */
EMSCRIPTEN_KEEPALIVE
uint32_t getStatus() {
    if (g_engine) {
        return static_cast<uint32_t>(g_engine->getInstrumentCount());
    }
    return 0;
}

/**
 * Cleanup and destroy engine
 */
EMSCRIPTEN_KEEPALIVE
void destroy() {
    if (g_engine) {
        delete g_engine;
        g_engine = nullptr;
    }
}

} // extern "C"
