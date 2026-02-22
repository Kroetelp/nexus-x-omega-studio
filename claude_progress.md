# NEXUS-X Omega Studio - Projekt Fortsetzung

**Stand:** 22.02.2026
**Session:** Tauri/Rust Migration

---

## AKTUELLER STAND

### Web-Applikation (Vite/TypeScript) - FUNKTIONSFÄHIG

**Dateistruktur:**
```
src/
├── main.ts                    # NexusSystem Hauptklasse
├── audio/
│   └── core/
│       └── AudioEngineNew.ts  # Audio-Engine mit Tone.js + AudioWorklet
├── ui/
│   ├── NexusUISetup.ts        # UI-Komponenten + Track-Channel-System
│   └── WindowAPI.ts           # Window-Bridge für HTML-Events
├── ai-engine/                 # AI-Module (AIComposer, NeuralDream, etc.)
├── music-theory/              # Skalen, Akkorde
└── sequencer/                 # Arpeggiator, Quantizer, AutoArranger
```

**Implementierte Features:**
- ✅ Sequencer (7 Tracks x 32 Steps)
- ✅ Song-Struktur mit Sections (INTRO, VERSE, CHORUS, etc.)
- ✅ Pattern-Generierung pro Section mit Variation
- ✅ Track-Channel-System mit Volume, Pan, Mute, Solo
- ✅ Kit-System (NEON, PHONK, ACID, etc.) mit Synth-Parametern
- ✅ Dynamische Noten basierend auf Skala
- ✅ Grid-UI synchronisiert mit Sequencer
- ✅ Master-Volume, EQ, Reverb, Delay
- ✅ AI-Song-Generierung mit Genre-Support
- ✅ Minimap mit Section-Highlighting

### Tauri/Rust Backend - GERÜST ERSTELLT

**Dateistruktur:**
```
src-tauri/
├── Cargo.toml          # Dependencies: tauri, cpal, crossbeam-channel, parking_lot, ringbuf
├── tauri.conf.json     # Config: Vite Dev-Server, Build-Dir
├── build.rs            # Tauri-Build-Script
├── capabilities/
│   └── default.json    # Tauri v2 Permissions
├── src/
│   └── main.rs         # Audio-Engine mit cpal + Lock-free IPC
└── icons/              # (leer - Icons müssen hinzugefügt werden)
```

**Tauri Commands (bereitgestellt):**
- `start_audio()` / `stop_audio()`
- `set_volume(value)` - Master-Volume
- `set_track_volume(track, value)` - Pro-Track
- `set_track_pan(track, value)` - Pro-Track
- `toggle_mute(track)` / `toggle_solo(track)`
- `set_bpm(bpm)`
- `get_audio_state()` - Returns: is_playing, current_step, bpm, cpu_usage

**Audio-Architektur (Rust):**
- Real-Time Audio Thread mit `cpal`
- Lock-free IPC via `crossbeam_channel` (bounded 1024)
- Shared Atomics: `AtomicBool`, `AtomicU64` für State
- 7 Track-States: volume, pan, muted, soloed

---

## ZIEL

**Migration der Web-Audio-App zu nativer Desktop-Applikation:**

1. **Ultra-Low Latency DSP** - cpal statt Web Audio API
2. **Native Performance** - Rust statt Browser WASM
3. **Real-Time Audio Thread** - Strikt getrennt vom UI-Thread
4. **Lock-free Communication** - Keine Blockierungen im Audio-Pfad

**Endzielle Architektur:**
```
┌─────────────────────────────────────────────────────────┐
│                    VITE/TS FRONTEND                      │
│  (React/Vue-kompatibel, existierende UI beibehalten)    │
└─────────────────────┬───────────────────────────────────┘
                      │ Tauri invoke()
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    TAURI UI THREAD                       │
│  - Commands empfangen                                   │
│  - State verwalten                                      │
│  - An Audio-Thread senden (lock-free channel)           │
└─────────────────────┬───────────────────────────────────┘
                      │ crossbeam_channel (bounded)
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 REAL-TIME AUDIO THREAD                   │
│  - cpal Audio Output (48kHz, 256 samples)              │
│  - Synth DSP (Oszillatoren, Filter, Hüllkurven)        │
│  - Mixer (Volume, Pan, Mute, Solo)                     │
│  - Sequencer Timing                                     │
└─────────────────────────────────────────────────────────┘
```

---

## NÄCHSTE SCHRITTE

### SCHRITT 1: Rust installieren (USER MUSS MACHEN)
```bash
# Windows: https://rustup.rs
# Oder via winget:
winget install Rustlang.Rustup

# Nach Installation Terminal neu starten, dann:
rustc --version
cargo --version
```

### SCHRITT 2: Tauri Build testen
```bash
cd /c/Users/KroeteDE/Desktop/v7
npm run tauri:dev
```

**Erwartete Probleme:**
- Icons fehlen (src-tauri/icons/) - Tauri wird Warnung zeigen
- ggf. Visual Studio Build Tools fehlen

### SCHRITT 3: Icons erstellen
```bash
# Tauri kann Icons generieren aus einem PNG:
npx tauri icon /path/to/icon.png
```

### SCHRITT 4: Rust Audio Engine erweitern

**In `src-tauri/src/main.rs`:**
- Synth-Implementierung (Oszillatoren, Filter)
- Sequencer-Logik (Step-Timing, Pattern-Speicherung)
- Sample-Support (wav-Dateien laden)
- WASM DSP einbinden (nexus-dsp.wasm → native Rust Implementation)

### SCHRITT 5: Frontend an Tauri anbinden

**In TypeScript:**
```typescript
import { invoke } from '@tauri-apps/api/core';

// Statt Tone.js direkt:
await invoke('start_audio');
await invoke('set_track_volume', { track: 0, value: 0.8 });
await invoke('toggle_mute', { track: 1 });
```

### SCHRITT 6: Hybrid-Modus (optional)
- Web-Version bleibt funktionsfähig (Tone.js)
- Tauri-Version nutzt native Rust-Audio
- Feature-Flag zur Laufzeitauswahl

---

## DATEIEN MIT WICHTIGEM CODE

| Datei | Beschreibung |
|-------|--------------|
| `src/ui/NexusUISetup.ts` | TrackChannel-System, alle UI-Controls |
| `src/main.ts` | NexusSystem, Song-Generierung, Grid-Builder |
| `src/audio/core/AudioEngineNew.ts` | Tone.js Engine, Kit-System |
| `src-tauri/src/main.rs` | Rust Audio Engine (cpal + IPC) |
| `src-tauri/tauri.conf.json` | Tauri Config |

---

## BEFEHLE

```bash
# Web-Version starten
npm run dev

# Web-Version bauen
npm run build

# Tauri Dev-Modus
npm run tauri:dev

# Tauri Production Build
npm run tauri:build
```

---

## KNOWN ISSUES / TODO

1. **Icons** - src-tauri/icons/ ist leer
2. **Rust nicht installiert** - User muss installieren
3. **Synth DSP in Rust** - Aktuell nur Test-Tone
4. **Sequencer in Rust** - Pattern-Daten müssen übertragen werden
5. **AI-Module** - Können im Frontend bleiben oder nach Rust

---

## WICHTIG: FORTSETZUNG

Nach Rust-Installation und Terminal-Neustart:

```
Claude, lies die Datei claude_progress.md und setze das Projekt fort.
Aktueller Schritt: Schritt 2 (Tauri Build testen)
```
