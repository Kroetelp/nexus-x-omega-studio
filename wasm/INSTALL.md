# NEXUS-X WASM Build Guide

## Option 1: Install Emscripten (Recommended)

### Step 1: Install EMSDK
Open PowerShell or Git Bash and run:

```bash
# Clone EMSDK
git clone https://github.com/emscripten-core/emsdk.git ~/emsdk

# Enter directory
cd ~/emsdk

# Install latest version
./emsdk install latest

# Activate
./emsdk activate latest

# Set environment variables (do this each session)
source ./emsdk_env.sh
```

### Step 2: Build WASM
```bash
cd /c/Users/KroeteDE/Desktop/v7/wasm
./build.sh
```

---

## Option 2: Use Pre-built WASM (Quick Start)

If you don't want to install Emscripten, I can create a minimal JS fallback that simulates the WASM interface.

---

## Option 3: Docker (If you have Docker)

```bash
docker run --rm -v $(pwd):/src -w /src emscripten/emsdk emcc src/main.cpp -o public/nexus-dsp.wasm -O3 -s WASM=1 -s STANDALONE_WASM=1
```

---

## After Building

The WASM file will be at:
- `public/nexus-dsp.wasm`

Then test with:
```bash
npm run dev
```

And open http://localhost:5173

---

## Troubleshooting

### "emcc: command not found"
Run: `source ~/emsdk/emsdk_env.sh`

### Build errors
Make sure you have:
- Python 3.6+
- Git
- CMake (optional)

### File not found in browser
Check that `public/nexus-dsp.wasm` exists and is being served.
