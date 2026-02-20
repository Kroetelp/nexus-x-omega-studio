# NEXUS-X OMEGA STUDIO v4.0

AI-Powered Music Sequencer with AudioWorklet DSP and WASM Acceleration

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build WASM (optional, requires Emscripten)
npm run build:wasm
```

## ✨ Features

### Core
- **AI-Powered Music Generation** using Magenta MusicVAE
- **Real-time Audio DSP** with AudioWorklet
- **WASM Acceleration** for native performance (3-5x faster)
- **7-Track Sequencer** with 32 steps per track
- **Multiple Genres** (18+ preset configurations)

### NEXT LEVEL Features (v4.0)
- **🧠 Neural Dream** - AI-assisted pattern transformation
- **👻 Quantum Snapshots** - Morphing state system (8 slots)
- **🎨 Spectral Workbench** - Visual frequency-based audio editor
- **🎬 Performance Recorder** - Full state capture with ghost mode
- **↩️ Undo/Redo System** - Complete command history
- **📱 Responsive Design** - Works on mobile, tablet, and desktop
- **💡 Visual Feedback** - LED indicators for automated parameters

### Audio Engine
- **Multi-synthesis** (Membrane, Noise, Metal, Poly, Mono, FM, etc.)
- **10 Sound Kits** (Neon, Glitch, Acid, Vinyl, Club, Chiptune, Cinematic, Industrial, Ethereal, Dungeon)
- **Master Effects** (EQ3, Reverb, Delay, Compressor, Limiter)
- **Macro FX** (Flux, Pump, Stutter, Wobble, Bitcrusher)
- **Sidechain Compression** with ducking
- **Stereo Widening** and pitch shift

## 📁 Project Structure

```
v7/
├── src/
│   ├── core/           # Advanced features (Neural Dream, etc.)
│   ├── audio/          # Audio engine with memory fixes
│   ├── ui/             # UI components and feedback
│   ├── css/            # Responsive styles
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Validators and utilities
│   └── main.ts        # Application entry point
├── public/             # Static assets (HTML, CSS, JS)
├── package.json        # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Build configuration
└── README.md         # This file
```

## 🎹 How to Use

### Basic Controls
- **Space** - Play/Stop
- **1-8** - Load snapshots
- **Shift + 1-8** - Save snapshots
- **Q/W/E/R** - Macro FX
- **Z/X/C** - EQ band kill
- **H** - Help dialog

### Quantum Snapshots
1. Right-click snapshot button (1-8) to **save**
2. Click to **load**
3. Use "→" buttons to **morph** between snapshots
4. Select easing function (Linear, Exponential, Quadratic, Cubic)

### Neural Dream
1. Click "🧠 NEURAL DREAM" for full transformation
2. Click "🧠" on individual tracks for track-specific dreaming
3. Preview shows changes (green = new, pink = old)
4. Accept/Reject transformation
5. Changes are undoable (Ctrl+Z)

### Spectral Workbench
1. Scroll to "SPECTRAL WORKBENCH" panel
2. Select parameter (Filter, Reverb, Delay, Distortion)
3. Click "PAINT" or "ERASE" mode
4. Draw on frequency spectrum to create energy zones
5. Zones apply to audio in real-time

### Performance Recorder
1. Click "⏺ RECORD" to start capturing
2. Make music - all events are recorded
3. Click "⏹ STOP" to save
4. "▶ PLAY" - Replay performance
5. "👻 GHOST" - Jam along with recording
6. Export as JSON for sharing

### Undo/Redo
- **Ctrl+Z** - Undo last action
- **Ctrl+Y** - Redo undone action
- Supports: Grid edits, parameter changes, snapshots, mutations

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Start Dev Server
```bash
npm run dev
```
Opens at `http://localhost:5173`

### Build for Production
```bash
npm run build
```
Output in `dist/` directory

### Type Checking
```bash
npm run type-check
```

### Build WASM (Optional)
Requires Emscripten installed:
```bash
npm run build:wasm
```

## 📊 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Dependencies

- **tone** (^14.8.49) - Audio synthesis
- **@magenta/music** (^1.23.1) - AI music generation
- **nexusui** (^2.1.1) - UI components
- **uuid** (^9.0.1) - Unique identifiers

## 📄 License

This project is for educational and creative purposes.

## 🤝 Contributing

This is a personal project. Feel free to fork and modify for your own use.

## 📞 Support

For issues or questions, please refer to the inline documentation in the source code.

---

**Version:** 4.0.0 (NEXT LEVEL EDITION)
**Status:** Production Ready ✅
**Date:** 2026-02-19
