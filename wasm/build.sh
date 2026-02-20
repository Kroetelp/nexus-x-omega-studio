#!/bin/bash
# NEXUS-X DSP WASM Build Script
# Usage: ./build.sh [debug|clean]

set -e

# Configuration
SRCDIR="src"
OUTDIR="../public"
OUTPUT="nexus-dsp.js"
WASM_OUTPUT="nexus-dsp.wasm"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  NEXUS-X DSP WASM Builder v5.0${NC}"
echo -e "${GREEN}=====================================${NC}"

# Check for Emscripten
if ! command -v emcc &> /dev/null; then
    echo -e "${RED}Error: Emscripten not found!${NC}"
    echo "Please install Emscripten and source emsdk_env.sh"
    echo "https://emscripten.org/docs/getting_started/downloads.html"
    exit 1
fi

# Parse arguments
BUILD_TYPE="release"
CLEAN=false

for arg in "$@"; do
    case $arg in
        debug)
            BUILD_TYPE="debug"
            ;;
        clean)
            CLEAN=true
            ;;
    esac
done

# Clean if requested
if [ "$CLEAN" = true ]; then
    echo -e "${YELLOW}Cleaning build artifacts...${NC}"
    rm -f $OUTPUT $WASM_OUTPUT *.wasm *.js
    rm -rf $OUTDIR/$WASM_OUTPUT
    echo -e "${GREEN}Clean complete!${NC}"
    exit 0
fi

# Set flags based on build type
if [ "$BUILD_TYPE" = "debug" ]; then
    echo -e "${YELLOW}Building DEBUG version...${NC}"
    CXXFLAGS="-O0 -g -s WASM=1 -std=c++17 -fno-exceptions -fno-rtti"
else
    echo -e "${YELLOW}Building RELEASE version (optimized)...${NC}"
    CXXFLAGS="-O3 -s WASM=1 -std=c++17 -fno-exceptions -fno-rtti"
fi

# Emscripten flags
EMFLAGS="-s EXPORTED_FUNCTIONS='[
    \"_initialize\",
    \"_getInputBuffer\",
    \"_getOutputBuffer\",
    \"_process\",
    \"_handleMessage\",
    \"_registerInstrument\",
    \"_setParameter\",
    \"_noteOn\",
    \"_noteOff\",
    \"_resetInstrument\",
    \"_setMasterVolume\",
    \"_getStatus\",
    \"_destroy\"
]' \
-s EXPORTED_RUNTIME_METHODS='[
    \"cwrap\",
    \"ccall\",
    \"getValue\",
    \"setValue\",
    \"HEAPF32\"
]' \
-s ENVIRONMENT='web' \
-s MODULARIZE=1 \
-s EXPORT_NAME='createNexusDsp' \
-s ALLOW_MEMORY_GROWTH=1 \
-s INITIAL_MEMORY=16777216 \
-s STACK_SIZE=1048576 \
--bind"

# Compile
echo -e "${YELLOW}Compiling...${NC}"
em++ $CXXFLAGS $EMFLAGS \
    -o $OUTPUT \
    $SRCDIR/main.cpp \
    -I$SRCDIR

# Copy to public folder
echo -e "${YELLOW}Copying to public folder...${NC}"
mkdir -p $OUTDIR
cp $WASM_OUTPUT $OUTDIR/

# Done
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  Build successful!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "Output files:"
echo "  - $OUTDIR/$WASM_OUTPUT"
echo ""
echo "File size: $(du -h $OUTDIR/$WASM_OUTPUT | cut -f1)"
