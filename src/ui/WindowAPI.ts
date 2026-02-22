/**
 * NEXUS-X Window API
 * Central export point for all window.XXX functions used by the UI
 * This bridges the modular architecture with the legacy HTML onclick handlers
 */

import * as Tone from 'tone';
import { AIComposer, createAIComposer } from '../ai-engine/AIComposer';
import { NeuralDream, neuralDream } from '../ai-engine/NeuralDream';
import { AIMasteringEngine, createAIMasteringEngine } from '../ai-engine/AIMasteringEngine';
import { RandomizationEngine, createRandomizationEngine } from '../ai-engine/RandomizationEngine';
import { ArpeggiatorPro, createArpeggiatorPro } from '../sequencer/ArpeggiatorPro';
import { Quantizer, createQuantizer } from '../sequencer/Quantizer';
import { AutoArranger, createAutoArranger } from '../sequencer/AutoArranger';
import { PatternProcessor, createPatternProcessor } from '../sequencer/PatternProcessor';
import { ScaleLocker, createScaleLocker } from '../music-theory/ScaleLocker';
import { ChordGenerator, createChordGenerator } from '../music-theory/ChordGenerator';
import { audioEngine } from '../audio/core/AudioEngineNew';
import { loggers } from '../utils/logger';

const log = loggers.system;

// ============================================================
// GLOBAL INSTANCES
// ============================================================

let aiComposer: AIComposer | null = null;
let aiMasteringEngine: AIMasteringEngine | null = null;
let randomizationEngine: RandomizationEngine | null = null;
let arpeggiator: ArpeggiatorPro | null = null;
let quantizer: Quantizer | null = null;
let autoArranger: AutoArranger | null = null;
let patternProcessor: PatternProcessor | null = null;
let scaleLocker: ScaleLocker | null = null;
let chordGenerator: ChordGenerator | null = null;

// Sequencer State (legacy compatibility)
interface SequencerData {
    data: number[][];
    bpm: number;
    currentStep: number;
    playing: boolean;
    clear: () => void;
    randomizeAll: () => void;
}

let sequencerData: SequencerData | null = null;

// ============================================================
// PANEL HELPERS
// ============================================================

function createPanelDialog(id: string, title: string, content: string, width = '600px'): HTMLDialogElement {
    let dialog = document.getElementById(id) as HTMLDialogElement;
    if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.id = id;
        dialog.style.cssText = `
            background: radial-gradient(circle at center, rgba(17,17,17,0.98) 0%, rgba(0,0,0,0.99) 100%);
            color: #fff; border: 2px solid var(--primary);
            padding: 20px; border-radius: 10px; max-width: ${width};
            max-height: 80vh; overflow-y: auto;
        `;
        dialog.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: var(--primary);">${title}</h3>
                <button onclick="this.closest('dialog').close()" style="background: transparent; border: 1px solid #444; color: #888; cursor: pointer; padding: 5px 10px; border-radius: 4px;">✕</button>
            </div>
            <div class="panel-content">${content}</div>
        `;
        document.body.appendChild(dialog);
    }
    return dialog;
}

function showPanel(id: string, title: string, content: string, width = '600px'): void {
    const dialog = createPanelDialog(id, title, content, width);
    dialog.showModal();
}

// ============================================================
// SEQUENCER (window.seq)
// ============================================================

function createSequencer(): SequencerData {
    const tracks = 7;
    const steps = 32;
    const data: number[][] = [];

    for (let i = 0; i < tracks; i++) {
        data.push(new Array(steps).fill(0));
    }

    return {
        data,
        bpm: 128,
        currentStep: 0,
        playing: false,

        clear() {
            for (let i = 0; i < tracks; i++) {
                for (let j = 0; j < steps; j++) {
                    data[i][j] = 0;
                }
            }
            (window as any).ui?.refreshGrid?.();
        },

        randomizeAll() {
            for (let i = 0; i < tracks; i++) {
                for (let j = 0; j < steps; j++) {
                    data[i][j] = Math.random() > 0.7 ? 1 : 0;
                }
            }
            (window as any).ui?.refreshGrid?.();
        }
    };
}

// ============================================================
// AUTO ARRANGER (window.arranger)
// ============================================================

function createArrangerAPI() {
    return {
        async generateFullSong(): Promise<void> {
            log.debug(' Generating full song...');
            // Use the actual NexusSystem's generateFullSong if available
            const nexusSystem = (window as any).nexusSystem;
            if (nexusSystem && typeof nexusSystem.generateFullSong === 'function') {
                await nexusSystem.generateFullSong();
            } else {
                // Fallback: simple pattern generation
                log.warn(' NexusSystem not available, using fallback');
                if (sequencerData) {
                    for (let i = 0; i < 7; i++) {
                        for (let j = 0; j < 32; j++) {
                            if (i === 0) { // Kick
                                sequencerData.data[i][j] = j % 4 === 0 ? 1 : 0;
                            } else if (i === 1) { // Snare
                                sequencerData.data[i][j] = j % 8 === 4 ? 1 : 0;
                            } else {
                                sequencerData.data[i][j] = Math.random() > 0.75 ? 1 : 0;
                            }
                        }
                    }
                }
                (window as any).ui?.refreshGrid?.();
            }
        },

        async generateEpicSong(): Promise<void> {
            log.debug(' Generating epic song...');
            await this.generateFullSong();
        },

        async generateNexusAISong(): Promise<void> {
            log.debug(' Generating NEXUS-AI song...');
            if (!aiComposer) {
                aiComposer = createAIComposer();
            }
            await this.generateFullSong();
        },

        async regenerateCurrentSong(): Promise<void> {
            log.debug(' Regenerating song...');
            await this.generateFullSong();
        },

        async generateDrumsOnly(): Promise<void> {
            log.debug(' Generating drums only...');
            // Use the actual NexusSystem's generateDrumsOnly if available
            const nexusSystem = (window as any).nexusSystem;
            if (nexusSystem && typeof nexusSystem.generateDrumsOnly === 'function') {
                await nexusSystem.generateDrumsOnly();
            } else {
                // Fallback: simple drum pattern
                if (sequencerData) {
                    for (let j = 0; j < 32; j++) {
                        sequencerData.data[0][j] = j % 4 === 0 ? 1 : 0; // Kick
                        sequencerData.data[1][j] = j % 8 === 4 ? 1 : 0; // Snare
                        sequencerData.data[2][j] = j % 2 === 0 ? 1 : 0; // HiHat
                    }
                }
                (window as any).ui?.refreshGrid?.();
            }
        }
    };
}

// ============================================================
// BACKGROUND EXPORTER (window.backgroundExporter)
// ============================================================

function createBackgroundExporterAPI() {
    return {
        async generateAndDownload(): Promise<void> {
            log.debug(' Generate and download...');
            alert('Background export feature - generating and downloading...');
        },

        async quickExport(): Promise<void> {
            log.debug(' Quick export...');
            alert('Quick export feature - rendering offline...');
        }
    };
}

// ============================================================
// WAV EXPORTER (window.wavExporter)
// ============================================================

function createWavExporterAPI() {
    return {
        async exportWAV(): Promise<void> {
            log.debug(' Exporting WAV...');
            alert('WAV Export - recording and saving...');
        }
    };
}

// ============================================================
// MIXER (window.mixer)
// ============================================================

function createMixerAPI() {
    return {
        remaster(): void {
            log.debug(' AI Remastering...');
            if (!aiMasteringEngine) {
                aiMasteringEngine = createAIMasteringEngine();
            }
            alert('AI Mastering applied!');
        }
    };
}

// ============================================================
// SYSTEM (window.sys)
// ============================================================

function createSystemAPI() {
    return {
        togglePlay(): void {
            log.debug(' togglePlay called');
            const nexusSystem = (window as any).nexusSystem;

            if (nexusSystem && typeof nexusSystem.togglePlay === 'function') {
                // Use NexusSystem's togglePlay (which calls NexusUISetup functions)
                nexusSystem.togglePlay();
            } else {
                // Fallback: Direct Tone.Transport control
                log.debug(' No NexusSystem, using fallback');
                const isPlaying = Tone.Transport.state === 'started';

                if (isPlaying) {
                    Tone.Transport.stop();
                    // Also stop any running sequencers
                    const win = window as any;
                    if (win.stopSequencer) {
                        win.stopSequencer();
                    }
                } else {
                    Tone.Transport.start();
                    // Also start sequencer
                    const win = window as any;
                    if (win.startSequencer) {
                        win.startSequencer();
                    }
                }

                // Update UI
                const btn = document.getElementById('playBtn');
                if (btn) {
                    btn.textContent = isPlaying ? '▶ PLAY' : '■ STOP';
                    btn.classList.toggle('rec', !isPlaying);
                }
            }
        },

        panic(): void {
            log.debug(' PANIC called');
            const nexusSystem = (window as any).nexusSystem;
            if (nexusSystem && typeof nexusSystem.panic === 'function') {
                nexusSystem.panic();
            } else {
                Tone.Transport.stop();
                Tone.Destination.mute = true;
                setTimeout(() => {
                    Tone.Destination.mute = false;
                }, 500);
            }
        },

        toggleRecord(): void {
            log.debug(' toggleRecord called');
            const nexusSystem = (window as any).nexusSystem;
            if (nexusSystem && typeof nexusSystem.toggleRecord === 'function') {
                nexusSystem.toggleRecord();
            }
        },

        setGenre(genre: string): void {
            log.debug(' setGenre called:', genre);
            const nexusSystem = (window as any).nexusSystem;
            if (nexusSystem && typeof nexusSystem.setGenre === 'function') {
                nexusSystem.setGenre(genre);
            }
        },

        toggleHumanize(btn: HTMLElement): void {
            log.debug(' toggleHumanize called');
            const nexusSystem = (window as any).nexusSystem;
            if (nexusSystem && typeof nexusSystem.toggleHumanize === 'function') {
                nexusSystem.toggleHumanize();
            }
            if (btn) btn.classList.toggle('active');
        },

        toggleThemeLock(btn: HTMLElement): void {
            log.debug(' toggleThemeLock called');
            const nexusSystem = (window as any).nexusSystem;
            if (nexusSystem && typeof nexusSystem.toggleThemeLock === 'function') {
                nexusSystem.toggleThemeLock();
            }
            if (btn) btn.classList.toggle('active');
        },

        async importMidiAndStructure(event: Event): Promise<void> {
            log.debug(' importMidiAndStructure called');
            // FIXME: Requires MIDI parsing library (e.g., @tonejs/midi)
            alert('MIDI import coming in a future update!');
        },

        exportMidi(): void {
            log.debug(' exportMidi called');
            alert('MIDI export feature coming soon!');
        },

        loadSnap(index: number): void {
            log.debug(' loadSnap called:', index);
            const nexusSystem = (window as any).nexusSystem;
            if (nexusSystem && typeof nexusSystem.loadSnap === 'function') {
                nexusSystem.loadSnap(index);
            }
        },

        autoSave(): void {
            log.debug(' autoSave called');
            const nexusSystem = (window as any).nexusSystem;
            if (nexusSystem && typeof nexusSystem.autoSave === 'function') {
                nexusSystem.autoSave();
            }
        }
    };
}

// ============================================================
// ENGINE (window.engine)
// ============================================================

function createEngineAPI() {
    return {
        async loadKit(kitName: string): Promise<void> {
            log.debug(' Loading kit:', kitName);
            await audioEngine.loadKit(kitName as any);

            // Reinitialize synths with new kit parameters
            const win = window as any;
            if (win.reinitSynths) {
                win.reinitSynths();
            }
        },

        setScale(scale: string): void {
            log.debug(' Setting scale:', scale);
            audioEngine.setScale(scale);
        },

        mutateSoundDesign(): void {
            log.debug(' Mutating sound design');
            const nexusSystem = (window as any).nexusSystem;
            if (nexusSystem && typeof nexusSystem.mutateSoundDesign === 'function') {
                nexusSystem.mutateSoundDesign();
            } else {
                log.warn(' NexusSystem not available for mutation');
            }
        }
    };
}

// ============================================================
// UI PANEL FUNCTIONS (window.openXXX)
// ============================================================

function createPanelFunctions() {
    return {
        // Drum & Beat panels
        openDrum808(): void {
            showPanel('drum808Panel', '808 Drum Machine', `
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    ${['Kick', 'Snare', 'HiHat', 'Clap', 'Tom', 'Rim', 'Cowbell', 'Crash'].map(drum =>
                        `<button class="btn" onclick="console.log('Trigger ${drum}')">${drum}</button>`
                    ).join('')}
                </div>
                <p style="margin-top: 15px; color: #666; font-size: 12px;">808 Drum synthesis panel</p>
            `, '400px');
        },

        openPianoRoll(): void {
            showPanel('pianoRollPanel', 'Piano Roll', `
                <div style="height: 300px; background: #111; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #666;">🎹 Piano Roll Editor</span>
                </div>
                <p style="margin-top: 15px; color: #666; font-size: 12px;">Note editing coming soon</p>
            `, '800px');
        },

        openSongEditor(): void {
            showPanel('songEditorPanel', 'Song Structure Editor', `
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${['Intro', 'Verse', 'Chorus', 'Bridge', 'Drop', 'Outro'].map(section =>
                        `<button class="btn">${section}</button>`
                    ).join('')}
                </div>
                <div style="margin-top: 15px; height: 100px; background: #0a0a0a; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #666;">Drag sections to arrange</span>
                </div>
            `, '600px');
        },

        // AI Panels
        openAIComposer(): void {
            showPanel('aiComposerPanel', 'AI Composer', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Genre</label>
                        <select class="btn" style="width: 100%;">
                            <option>Electronic</option>
                            <option>Hip Hop</option>
                            <option>Rock</option>
                            <option>Jazz</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Mood</label>
                        <select class="btn" style="width: 100%;">
                            <option>Energetic</option>
                            <option>Chill</option>
                            <option>Dark</option>
                            <option>Happy</option>
                        </select>
                    </div>
                    <button class="btn" style="background: var(--primary); color: #000;" onclick="window.arranger.generateFullSong()">
                        ✨ Generate Composition
                    </button>
                </div>
            `, '400px');
        },

        openNeuralVisualizer(): void {
            showPanel('neuralVizPanel', 'Neural Visualizer', `
                <div style="height: 300px; background: linear-gradient(135deg, #1a0030 0%, #000 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: var(--magenta);">🧠 Neural Network Visualization</span>
                </div>
                <p style="margin-top: 15px; color: #666; font-size: 12px;">Real-time AI processing visualization</p>
            `, '600px');
        },

        openAIVocalSynth(): void {
            showPanel('aiVocalPanel', 'AI Vocal Synthesizer', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Voice Type</label>
                        <select class="btn" style="width: 100%;">
                            <option>Female Soprano</option>
                            <option>Male Tenor</option>
                            <option>Choir</option>
                            <option>Robotic</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Lyrics</label>
                        <textarea class="btn" style="width: 100%; height: 80px; resize: none;" placeholder="Enter lyrics..."></textarea>
                    </div>
                    <button class="btn" style="background: var(--accent);">🎤 Synthesize Vocals</button>
                </div>
            `, '400px');
        },

        openAIMastering(): void {
            showPanel('aiMasterPanel', 'AI Mastering', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Preset</label>
                        <select class="btn" style="width: 100%;">
                            <option>Streaming (Spotify/Apple)</option>
                            <option>Club/Stage</option>
                            <option>YouTube</option>
                            <option>Podcast</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: space-between;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; color: var(--primary);">-14</div>
                            <div style="font-size: 10px; color: #666;">LUFS</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; color: var(--flux);">-1.0</div>
                            <div style="font-size: 10px; color: #666;">dB TP</div>
                        </div>
                    </div>
                    <button class="btn" style="background: var(--primary); color: #000;" onclick="window.mixer.remaster()">
                        🎛️ Apply AI Mastering
                    </button>
                </div>
            `, '400px');
        },

        // Loop & FX Panels
        openLoopStation(): void {
            showPanel('loopStationPanel', 'Loop Station', `
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    ${[1,2,3,4,5,6,7,8].map(i =>
                        `<button class="btn" style="height: 60px;">Loop ${i}</button>`
                    ).join('')}
                </div>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn" style="flex: 1; background: var(--flux);">⏺ Record</button>
                    <button class="btn" style="flex: 1;">⏹ Stop</button>
                </div>
            `, '500px');
        },

        openArpeggiatorPro(): void {
            if (!arpeggiator) {
                arpeggiator = createArpeggiatorPro();
            }
            showPanel('arpeggiatorPanel', 'Arpeggiator Pro', `
                <div style="display: grid; gap: 15px;">
                    <div style="display: flex; gap: 10px;">
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 5px; color: #888;">Mode</label>
                            <select class="btn" style="width: 100%;">
                                <option>Up</option>
                                <option>Down</option>
                                <option>Random</option>
                                <option>Up-Down</option>
                            </select>
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 5px; color: #888;">Speed</label>
                            <select class="btn" style="width: 100%;">
                                <option>1/4</option>
                                <option>1/8</option>
                                <option>1/16</option>
                                <option>1/32</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Gate</label>
                        <input type="range" min="0" max="100" value="80" style="width: 100%;">
                    </div>
                </div>
            `, '400px');
        },

        openChordGenerator(): void {
            if (!chordGenerator) {
                chordGenerator = createChordGenerator();
            }
            showPanel('chordPanel', 'Chord Generator', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Progression</label>
                        <select class="btn" style="width: 100%;">
                            <option>I - V - vi - IV (Pop)</option>
                            <option>ii - V - I (Jazz)</option>
                            <option>I - IV - V (Blues)</option>
                            <option>i - VI - III - VII (Emo)</option>
                        </select>
                    </div>
                    <button class="btn" style="background: var(--accent);">🎼 Generate Chords</button>
                </div>
            `, '400px');
        },

        openBasslineGenerator(): void {
            showPanel('bassPanel', 'Bassline Generator', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Style</label>
                        <select class="btn" style="width: 100%;">
                            <option>Walking Bass</option>
                            <option>Synth Bass</option>
                            <option>Finger Style</option>
                            <option>Slap Bass</option>
                        </select>
                    </div>
                    <button class="btn" style="background: #ff0055;">🎸 Generate Bassline</button>
                </div>
            `, '400px');
        },

        openSamplePad(): void {
            showPanel('samplePadPanel', 'Sample Pad', `
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    ${Array(16).fill(0).map((_, i) =>
                        `<button class="btn" style="height: 60px; font-size: 10px;" onclick="console.log('Sample ${i+1}')">Pad ${i+1}</button>`
                    ).join('')}
                </div>
            `, '500px');
        },

        openStemExport(): void {
            showPanel('stemExportPanel', 'Stem Export', `
                <div style="display: grid; gap: 10px;">
                    ${['Kick', 'Snare', 'HiHat', 'Bass', 'Lead', 'Pad', 'FX'].map(track =>
                        `<label style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" checked>
                            <span>${track}</span>
                        </label>`
                    ).join('')}
                    <button class="btn" style="margin-top: 10px; background: #00ccff;">📦 Export Stems</button>
                </div>
            `, '300px');
        },

        openQuantizePanel(): void {
            if (!quantizer) {
                quantizer = createQuantizer();
            }
            showPanel('quantizePanel', 'Quantize', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Grid</label>
                        <select class="btn" style="width: 100%;">
                            <option>1/16</option>
                            <option>1/8</option>
                            <option>1/4</option>
                            <option>1/2</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Strength</label>
                        <input type="range" min="0" max="100" value="100" style="width: 100%;">
                    </div>
                    <button class="btn">⏱️ Apply Quantize</button>
                </div>
            `, '300px');
        },

        openEffectRack(): void {
            showPanel('effectRackPanel', 'Effect Rack', `
                <div style="display: grid; gap: 10px;">
                    ${['Reverb', 'Delay', 'Distortion', 'Chorus', 'Phaser', 'Compressor'].map(fx =>
                        `<div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #111; border-radius: 8px;">
                            <input type="checkbox">
                            <span style="flex: 1;">${fx}</span>
                            <input type="range" min="0" max="100" value="50" style="width: 100px;">
                        </div>`
                    ).join('')}
                </div>
            `, '400px');
        },

        openRandomization(): void {
            if (!randomizationEngine) {
                randomizationEngine = createRandomizationEngine();
            }
            showPanel('randomPanel', 'Randomization Engine', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Mode</label>
                        <select class="btn" style="width: 100%;">
                            <option>Euclidean</option>
                            <option>Markov Chain</option>
                            <option>Cellular Automata</option>
                            <option>L-System</option>
                            <option>Genetic Algorithm</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Intensity</label>
                        <input type="range" min="0" max="100" value="50" style="width: 100%;">
                    </div>
                    <button class="btn" style="background: #00ff94; color: #000;">🎲 Randomize</button>
                </div>
            `, '400px');
        },

        openMIDILearn(): void {
            showPanel('midiLearnPanel', 'MIDI Learn', `
                <div style="text-align: center; padding: 20px;">
                    <p style="color: #888;">Click a control, then move your MIDI controller</p>
                    <div style="margin-top: 20px; padding: 20px; background: #111; border-radius: 8px;">
                        <span style="color: var(--primary);">Waiting for MIDI input...</span>
                    </div>
                </div>
            `, '400px');
        },

        openScaleLock(): void {
            if (!scaleLocker) {
                scaleLocker = createScaleLocker();
            }
            showPanel('scaleLockPanel', 'Scale Lock', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Root Note</label>
                        <select class="btn" style="width: 100%;">
                            ${['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(note =>
                                `<option>${note}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Scale</label>
                        <select class="btn" style="width: 100%;">
                            <option>Major</option>
                            <option>Minor</option>
                            <option>Pentatonic</option>
                            <option>Blues</option>
                            <option>Dorian</option>
                        </select>
                    </div>
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox">
                        <span>Enable Scale Lock</span>
                    </label>
                </div>
            `, '300px');
        },

        openSidechain(): void {
            showPanel('sidechainPanel', 'Sidechain Compressor', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Threshold</label>
                        <input type="range" min="-60" max="0" value="-20" style="width: 100%;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Attack</label>
                        <input type="range" min="0" max="100" value="10" style="width: 100%;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Release</label>
                        <input type="range" min="0" max="100" value="50" style="width: 100%;">
                    </div>
                </div>
            `, '300px');
        },

        openGroovePool(): void {
            showPanel('groovePoolPanel', 'Groove Pool', `
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    ${['Straight', 'Swing 16', 'Swing 8', 'Shuffle', 'Latin', 'Funk'].map(groove =>
                        `<button class="btn">${groove}</button>`
                    ).join('')}
                </div>
            `, '400px');
        },

        openNoteRepeat(): void {
            showPanel('noteRepeatPanel', 'Note Repeat', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Rate</label>
                        <select class="btn" style="width: 100%;">
                            <option>1/4</option>
                            <option>1/8</option>
                            <option>1/16</option>
                            <option>1/32</option>
                        </select>
                    </div>
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox">
                        <span>Hold to repeat</span>
                    </label>
                </div>
            `, '300px');
        },

        openVelocityEditor(): void {
            showPanel('velocityPanel', 'Velocity Editor', `
                <div style="height: 200px; background: #111; border-radius: 8px; display: flex; align-items: flex-end; padding: 10px; gap: 4px;">
                    ${Array(16).fill(0).map(() =>
                        `<div style="flex: 1; background: var(--primary); height: ${Math.random() * 80 + 20}%; border-radius: 2px;"></div>`
                    ).join('')}
                </div>
                <p style="margin-top: 15px; color: #666; font-size: 12px;">Drag to edit velocities</p>
            `, '600px');
        },

        openPatternLocker(): void {
            showPanel('patternLockPanel', 'Pattern Locker', `
                <div style="display: grid; gap: 10px;">
                    ${[1,2,3,4,5,6,7].map(track =>
                        `<label style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" checked>
                            <span>Track ${track}</span>
                        </label>`
                    ).join('')}
                </div>
            `, '300px');
        },

        openPatternVariations(): void {
            showPanel('patternVarPanel', 'Pattern Variations', `
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    ${['Original', 'Variance 1', 'Variance 2', 'Variance 3'].map((v, i) =>
                        `<button class="btn" style="${i === 0 ? 'border-color: var(--primary);' : ''}">${v}</button>`
                    ).join('')}
                </div>
                <button class="btn" style="margin-top: 15px; width: 100%;">🔀 Generate Variations</button>
            `, '400px');
        },

        openSpectralFreeze(): void {
            showPanel('spectralFreezePanel', 'Spectral Freeze', `
                <div style="text-align: center; padding: 20px;">
                    <button class="btn" style="font-size: 48px; padding: 30px; background: linear-gradient(135deg, #00ccff, #ff00cc);">
                        ❄️ FREEZE
                    </button>
                    <p style="margin-top: 15px; color: #666; font-size: 12px;">Click to freeze the current spectrum</p>
                </div>
            `, '300px');
        },

        openAutoArranger(): void {
            if (!autoArranger) {
                autoArranger = createAutoArranger();
            }
            showPanel('autoArrangerPanel', 'Auto Arranger', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Structure</label>
                        <select class="btn" style="width: 100%;">
                            <option>Intro - Verse - Chorus - Verse - Chorus - Outro</option>
                            <option>ABABCB (Standard Pop)</option>
                            <option>Build-Up - Drop - Breakdown - Drop</option>
                        </select>
                    </div>
                    <button class="btn" style="background: var(--magenta);" onclick="window.arranger.generateFullSong()">
                        🎵 Auto-Arrange Song
                    </button>
                </div>
            `, '400px');
        },

        // Social & Viral features
        openPhonkGenerator(): void {
            showPanel('phonkPanel', 'Phonk Generator', `
                <div style="background: linear-gradient(135deg, #1a0030, #000); padding: 20px; border-radius: 8px;">
                    <h4 style="color: #ff00ff; margin: 0 0 15px 0;">🐮 PHONK GENERATOR</h4>
                    <div style="display: grid; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: #888;">Style</label>
                            <select class="btn" style="width: 100%;">
                                <option>Drift Phonk</option>
                                <option>Dark Phonk</option>
                                <option>Aggressive Phonk</option>
                                <option>Chill Phonk</option>
                            </select>
                        </div>
                        <button class="btn" style="background: linear-gradient(90deg, #ff00ff, #ff0080);">
                            🔥 Generate Phonk
                        </button>
                    </div>
                </div>
            `, '400px');
        },

        openTikTokGenerator(): void {
            showPanel('tiktokPanel', 'TikTok / Reels Generator', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Format</label>
                        <select class="btn" style="width: 100%;">
                            <option>TikTok (15s)</option>
                            <option>TikTok (60s)</option>
                            <option>Instagram Reels (30s)</option>
                            <option>YouTube Shorts (60s)</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Hook Style</label>
                        <select class="btn" style="width: 100%;">
                            <option>Viral Bass Drop</option>
                            <option>Catchy Melody</option>
                            <option>Trending Sound</option>
                        </select>
                    </div>
                    <button class="btn" style="background: linear-gradient(90deg, #ff0050, #00f2ea);">
                        📱 Generate Viral Content
                    </button>
                </div>
            `, '400px');
        },

        openViralHookGenerator(): void {
            showPanel('viralHookPanel', 'Viral Hook Generator', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Hook Type</label>
                        <select class="btn" style="width: 100%;">
                            <option>Earworm Melody</option>
                            <option>Bass Drop</option>
                            <option>Vocal Chop</option>
                            <option>Catchy Riff</option>
                        </select>
                    </div>
                    <button class="btn" style="background: linear-gradient(90deg, #ffd700, #ff8c00); color: #000;">
                        🎵 Generate Viral Hook
                    </button>
                </div>
            `, '400px');
        },

        openSocialExport(): void {
            showPanel('socialExportPanel', 'Social Export', `
                <div style="display: grid; gap: 10px;">
                    ${[
                        {name: 'TikTok', icon: '📱'},
                        {name: 'Instagram Reels', icon: '📸'},
                        {name: 'YouTube Shorts', icon: '▶️'},
                        {name: 'Twitter/X', icon: '🐦'}
                    ].map(platform =>
                        `<button class="btn" style="display: flex; align-items: center; gap: 10px;">
                            <span>${platform.icon}</span>
                            <span>Export for ${platform.name}</span>
                        </button>`
                    ).join('')}
                </div>
            `, '400px');
        },

        openRiserGenerator(): void {
            showPanel('riserPanel', 'Riser/FX Generator', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Type</label>
                        <select class="btn" style="width: 100%;">
                            <option>Riser</option>
                            <option>Fall</option>
                            <option>Impact</option>
                            <option>Sweep</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Length</label>
                        <select class="btn" style="width: 100%;">
                            <option>2 bars</option>
                            <option>4 bars</option>
                            <option>8 bars</option>
                        </select>
                    </div>
                    <button class="btn" style="background: linear-gradient(90deg, #ff00ff, #ff0080);">
                        🚀 Generate FX
                    </button>
                </div>
            `, '400px');
        },

        openGlitchMachine(): void {
            showPanel('glitchPanel', 'Glitch Machine', `
                <div style="display: grid; gap: 15px;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        ${['Stutter', 'Reverse', 'Bitcrush', 'Tape Stop', 'Buffer', 'Freeze'].map(fx =>
                            `<button class="btn" style="padding: 15px;">${fx}</button>`
                        ).join('')}
                    </div>
                    <button class="btn" style="background: linear-gradient(90deg, #00ffcc, #00ff88); color: #000;">
                        👾 Random Glitch
                    </button>
                </div>
            `, '400px');
        },

        openVocalChops(): void {
            showPanel('vocalChopsPanel', 'Vocal Chops', `
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Sample</label>
                        <select class="btn" style="width: 100%;">
                            <option>Female Vocal 1</option>
                            <option>Male Vocal 1</option>
                            <option>Choir</option>
                            <option>Load Custom...</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Pattern</label>
                        <select class="btn" style="width: 100%;">
                            <option>Fast Staccato</option>
                            <option>Flowing</option>
                            <option>Rhythmic</option>
                        </select>
                    </div>
                    <button class="btn" style="background: linear-gradient(90deg, #ff8800, #ff4400);">
                        🎤 Generate Vocal Chops
                    </button>
                </div>
            `, '400px');
        },

        openPolyrhythm(): void {
            showPanel('polyrhythmPanel', 'Polyrhythm Generator', `
                <div style="display: grid; gap: 15px;">
                    <div style="display: flex; gap: 15px;">
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 5px; color: #888;">Layer 1</label>
                            <select class="btn" style="width: 100%;">
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                            </select>
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 5px; color: #888;">Layer 2</label>
                            <select class="btn" style="width: 100%;">
                                <option>4</option>
                                <option>5</option>
                                <option>7</option>
                            </select>
                        </div>
                    </div>
                    <button class="btn" style="background: linear-gradient(90deg, #6366f1, #8b5cf6);">
                        🌀 Generate Polyrhythm
                    </button>
                </div>
            `, '400px');
        },

        openBeatboxMode(): void {
            showPanel('beatboxPanel', 'Beatbox Mode', `
                <div style="text-align: center;">
                    <p style="color: #888; margin-bottom: 15px;">Use your microphone to beatbox and convert to drums!</p>
                    <button class="btn" style="font-size: 48px; padding: 30px; border-radius: 50%; background: var(--primary); color: #000;">
                        🎙️
                    </button>
                    <p style="margin-top: 15px; color: #666; font-size: 12px;">Click to start recording</p>
                </div>
            `, '400px');
        }
    };
}

// ============================================================
// UI HELPER (window.ui)
// ============================================================

function createUIAPI() {
    return {
        refreshGrid(): void {
            // Trigger a custom event that the grid can listen to
            document.dispatchEvent(new CustomEvent('nexus:refreshGrid'));
        }
    };
}

// ============================================================
// INITIALIZE ALL WINDOW APIs
// ============================================================

export function initializeWindowAPI(): void {
    log.debug(' Initializing...');

    // Create instances
    sequencerData = createSequencer();

    // Attach to window
    const win = window as any;

    // Core objects
    win.seq = sequencerData;
    win.arranger = createArrangerAPI();
    win.backgroundExporter = createBackgroundExporterAPI();
    win.wavExporter = createWavExporterAPI();
    win.mixer = createMixerAPI();

    // IMPORTANT: Only set window.sys if it doesn't exist (NexusSystem sets it first)
    // This prevents overwriting the real NexusSystem instance with a stub
    if (!win.sys || typeof win.sys.togglePlay !== 'function') {
        log.debug(' Setting window.sys stub (no NexusSystem found)');
        win.sys = createSystemAPI();
    } else {
        log.debug(' window.sys already exists - keeping NexusSystem instance');
    }

    // Merge engine API with existing window.engine if it exists
    if (!win.engine) {
        win.engine = createEngineAPI();
    } else {
        // Add any missing methods to existing engine
        const engineAPI = createEngineAPI();
        Object.assign(win.engine, engineAPI);
    }

    win.ui = createUIAPI();

    // Neural Dream is already a singleton
    win.neuralDream = neuralDream;

    // Panel functions
    const panels = createPanelFunctions();
    Object.assign(win, panels);

    log.debug(' Initialized successfully');
    log.debug(' Available:', Object.keys(panels).join(', '));
}

// Export for module usage
export {
    sequencerData,
    aiComposer,
    aiMasteringEngine,
    randomizationEngine,
    arpeggiator,
    quantizer,
    autoArranger,
    patternProcessor,
    scaleLocker,
    chordGenerator
};
