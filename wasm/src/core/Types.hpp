/**
 * NEXUS-X DSP Core Types v5.0
 * Shared type definitions for the modular DSP system
 */

#pragma once

#include <cstdint>
#include <cstddef>

namespace nexus {

// ============================================================
// BASIC TYPES
// ============================================================

using InstrumentId = uint32_t;
using ParamId = uint32_t;
using VoiceId = uint32_t;
using Sample = float;

// ============================================================
// MESSAGE STRUCTURE
// ============================================================

// Message types (must match TypeScript MessageType)
enum class MessageType : uint32_t {
    PARAM_CHANGE = 0,
    NOTE_ON = 1,
    NOTE_OFF = 2,
    RESET = 3,
    REGISTER_INSTRUMENT = 4,
    LOAD_WASM = 5,

    // From Worklet to Main Thread
    METER_UPDATE = 100,
    PEAK_DETECTED = 101,
    INSTRUMENT_READY = 102,
    WASM_READY = 103,
};

// Instrument types (must match TypeScript InstrumentTypes)
enum class InstrumentType : uint32_t {
    SYNTH = 0,
    DRUM = 1,
    FX = 2,
    SAMPLER = 3,
};

// Message structure for JS <-> WASM communication
struct Message {
    MessageType type;
    InstrumentId instrumentId;
    uint32_t data1;     // paramId / note / type
    float data2;        // value / velocity / polyphony
};

// ============================================================
// PARAMETER STRUCTURE
// ============================================================

struct Parameter {
    ParamId id;
    float value;
    float min;
    float max;
    float defaultValue;
};

// ============================================================
// AUDIO BUFFER STRUCTURE
// ============================================================

struct AudioBuffer {
    Sample* left;
    Sample* right;
    size_t numSamples;
    size_t sampleRate;
};

// ============================================================
// ENVELOPE STATE
// ============================================================

enum class EnvState {
    IDLE,
    ATTACK,
    DECAY,
    SUSTAIN,
    RELEASE,
};

// ============================================================
// FILTER TYPES
// ============================================================

enum class FilterType : uint32_t {
    LOWPASS = 0,
    HIGHPASS = 1,
    BANDPASS = 2,
};

// ============================================================
// OSCILLATOR TYPES
// ============================================================

enum class OscType : uint32_t {
    SINE = 0,
    SAW = 1,
    SQUARE = 2,
    TRIANGLE = 3,
};

// ============================================================
// CONSTANTS
// ============================================================

constexpr size_t MAX_INSTRUMENTS = 16;
constexpr size_t MAX_VOICES = 8;
constexpr size_t RENDER_QUANTUM = 128;  // WebAudio render quantum
constexpr float PI = 3.14159265358979323846f;
constexpr float TWO_PI = 2.0f * PI;
constexpr float SAMPLE_RATE = 44100.0f;

} // namespace nexus
