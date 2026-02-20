# NEXUS-X DSP WASM Build Configuration
# Compiles the modular DSP engine to WebAssembly

# ============================================================
# CONFIGURATION
# ============================================================

CC = emcc
CXX = em++
CFLAGS = -O3 -s WASM=1 -s STANDALONE_WASM=0
CXXFLAGS = $(CFLAGS) -std=c++17 -fno-exceptions -fno-rtti

# Source files
SRCDIR = src
CORE_SRCS = $(wildcard $(SRCDIR)/core/*.cpp)
INST_SRCS = $(wildcard $(SRCDIR)/instruments/*.cpp)
ENGINE_SRCS = $(wildcard $(SRCDIR)/engine/*.cpp)
MAIN_SRC = $(SRCDIR)/main.cpp

# All sources (currently all headers, just main.cpp)
SOURCES = $(MAIN_SRC)

# Output
OUTPUT = nexus-dsp.js
WASM_OUTPUT = nexus-dsp.wasm

# ============================================================
# FLAGS
# ============================================================

# Emscripten flags for AudioWorklet compatibility
EMFLAGS = \
	-s EXPORTED_FUNCTIONS='[ \
		"_initialize", \
		"_getInputBuffer", \
		"_getOutputBuffer", \
		"_process", \
		"_handleMessage", \
		"_registerInstrument", \
		"_setParameter", \
		"_noteOn", \
		"_noteOff", \
		"_resetInstrument", \
		"_setMasterVolume", \
		"_getStatus", \
		"_destroy" \
	]' \
	-s EXPORTED_RUNTIME_METHODS='[ \
		"cwrap", \
		"ccall", \
		"getValue", \
		"setValue", \
		"HEAPF32" \
	]' \
	-s ENVIRONMENT='web' \
	-s MODULARIZE=1 \
	-s EXPORT_NAME='createNexusDsp' \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s INITIAL_MEMORY=16777216 \
	-s STACK_SIZE=1048576 \
	--bind

# ============================================================
# TARGETS
# ============================================================

all: $(WASM_OUTPUT)

# Compile to WASM (no JS glue - we use our own processor.js)
$(WASM_OUTPUT): $(SOURCES)
	$(CXX) $(CXXFLAGS) $(EMFLAGS) \
		-o $(OUTPUT) \
		$(SOURCES) \
		-I$(SRCDIR)

# Development build with debug symbols
debug: CXXFLAGS = -O0 -g -s WASM=1 -s STANDALONE_WASM=0 -std=c++17 -fno-exceptions -fno-rtti
debug: $(WASM_OUTPUT)

# Clean build artifacts
clean:
	rm -f $(OUTPUT) $(WASM_OUTPUT) *.wasm *.js

# Show help
help:
	@echo "NEXUS-X DSP WASM Build"
	@echo ""
	@echo "Targets:"
	@echo "  all     - Build optimized WASM"
	@echo "  debug   - Build with debug symbols"
	@echo "  clean   - Remove build artifacts"
	@echo "  help    - Show this help"

.PHONY: all debug clean help
