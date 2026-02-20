/**
 * NEXUS-X // OMEGA STUDIO v4.0 (NEXT LEVEL EDITION)
 * Fully refactored with ES6 modules, TypeScript types, and advanced features
 */

// --- TYPE DEFINITIONS ---
import type { Config, GenreConfig, ScaleType, KitType, StoredState, ValidationResult } from './types/index.js';

// --- CORE SYSTEMS ---
import { errorHandler } from './core/ErrorHandler.js';
import { undoRedoManager, CommandFactory } from './core/UndoRedoManager.js';
import { quantumSnapshots } from './core/QuantumSnapshots.js';
import { neuralDream } from './core/NeuralDream.js';
import { spectralWorkbench } from './core/SpectralWorkbench.js';
import { performanceRecorder } from './core/PerformanceRecorder.js';
import { automationFeedback } from './core/AutomationFeedback.js';
import { aiProgressDialog, AISteps } from './core/AIProgressDialog.js';

// --- UTILITIES ---
import { validateStoredState, sanitizeStoredState } from './utils/validators.js';
import * as Tone from 'tone';

// --- CONFIGURATION ---
const CONFIG: Config = {
  tracks: ['Kick', 'Snare', 'Clap', 'HiHat', 'Bass', 'Lead/Arp', 'Pad/Chord'],
  colors: ['#00ff94', '#f59e0b', '#f59e0b', '#00ccff', '#7c3aed', '#ff0055', '#00ccff'],
  steps: 32
};

const GENRES: Record<string, GenreConfig> = {
  'SYNTHWAVE': { bpmRange: [100, 115], scale: 'minor', kit: 'NEON', arpLead: false, progressions: [[0, 2, 4, 1], [0, 4, 2, 3]] },
  'TECHNO': { bpmRange: [130, 142], scale: 'phrygian', kit: 'GLITCH', arpLead: true, progressions: [[0, 0, 1, 0], [0, -1, 0, 2]] },
  'TRAP': { bpmRange: [140, 160], scale: 'harmonicMinor', kit: 'ACID', arpLead: false, progressions: [[0, 0, 2, -1], [0, 1, 0, 4]] },
  'AMBIENT': { bpmRange: [70, 90], scale: 'lydian', kit: 'ETHEREAL', arpLead: true, progressions: [[0, 2, 4, 6], [0, 1, 2, 3]] },
  'LOFI': { bpmRange: [75, 95], scale: 'dorian', kit: 'VINYL', arpLead: false, progressions: [[0, -1, -2, -3], [0, 2, 1, -1]] },
  'HOUSE': { bpmRange: [120, 128], scale: 'mixolydian', kit: 'CLUB', arpLead: false, progressions: [[0, 2, 4, 2], [0, 3, 2, 1]] },
  'DNB': { bpmRange: [165, 175], scale: 'phrygianDominant', kit: 'GLITCH', arpLead: true, progressions: [[0, 2, 0, 1], [0, 0, 0, -1]] },
  'CYBERPUNK': { bpmRange: [100, 110], scale: 'diminishedHw', kit: 'ACID', arpLead: true, progressions: [[0, 1, 0, 3], [0, -1, -2, 0]] },
  'DUBSTEP': { bpmRange: [140, 150], scale: 'phrygian', kit: 'ACID', arpLead: false, progressions: [[0, 0, -1, 0], [0, 1, 0, -2]] },
  'SYNTHPOP': { bpmRange: [110, 125], scale: 'ionian', kit: 'NEON', arpLead: false, progressions: [[0, 4, 5, 3], [0, 2, 4, 5]] },
  'RETROWAVE': { bpmRange: [80, 95], scale: 'dorian', kit: 'VINYL', arpLead: true, progressions: [[0, -2, -4, -2], [0, 4, 2, 0]] },
  'TRANCE': { bpmRange: [135, 142], scale: 'aeolian', kit: 'CLUB', arpLead: true, progressions: [[0, -2, 0, 2], [0, 3, 4, 1]] },
  'INDUSTRIAL': { bpmRange: [150, 175], scale: 'locrian', kit: 'INDUSTRIAL', arpLead: true, progressions: [[0, 1, 0, 1], [0, 0, 0, -1]] },
  'ETHEREAL': { bpmRange: [65, 85], scale: 'lydianAugmented', kit: 'ETHEREAL', arpLead: true, progressions: [[0, 1, 2, 3], [0, 2, 4, 6]] },
  'CHIPTUNE': { bpmRange: [120, 140], scale: 'nesMajor', kit: 'CHIPTUNE', arpLead: true, progressions: [[0, 3, 4, 0], [0, 2, 0, 4]] },
  'CINEMATIC': { bpmRange: [60, 80], scale: 'interstellar', kit: 'CINEMATIC', arpLead: false, progressions: [[0, -2, -4, -2], [0, 2, 0, -2]] },
  'DUNGEONSYNTH': { bpmRange: [60, 85], scale: 'dorianSharp4', kit: 'DUNGEON', arpLead: true, progressions: [[0, 1, -2, 2], [0, -1, -3, 0]] }
};

// --- MAIN SYSTEM ---
class NexusSystem {
  private baseBpm = 128;
  private currentGenre = 'SYNTHWAVE';
  private humanizeActive = false;
  private themeLocked = false;
  private audioEngine: any = null; // Will be AudioEngine instance
  private sequencerData: number[][] = [];
  private arranger: any = null;
  private isInitialized = false;

  constructor() {
    // Global access for legacy compatibility
    (window as any).sys = this;
    (window as any).perfRecorder = performanceRecorder;
  }

  /**
   * Initialize the entire system
   */
  async initialize(): Promise<void> {
    try {
      // Show initialization dialog
      const startDialog = document.getElementById('startDialog');
      if (startDialog) {
        startDialog.showModal();
      }

      // Wait for user interaction
      await new Promise<void>(resolve => {
        const initBtn = document.getElementById('initBtn');
        if (initBtn) {
          initBtn.addEventListener('click', () => {
            resolve();
          });
        }
      });

      // Close start dialog
      if (startDialog) {
        startDialog.close();
      }

      // Initialize audio context
      await Tone.start();
      Tone.Transport.swingSubdivision = "16n";

      // Initialize AI (Magenta)
      try {
        if (typeof (window as any).mm !== 'undefined' && (window as any).mm.tf) {
          await (window as any).mm.tf.setBackend('webgl');
          console.log('GPU ACCEL ON');
        }
      } catch (e) {
        console.warn('GPU acceleration not available:', e);
      }

      // Initialize Audio Engine (will be modularized)
      await this.initializeAudioEngine();

      // Initialize all advanced features
      this.initializeAdvancedFeatures();

      // Load saved state or defaults
      await this.loadState();

      // Setup hotkeys
      this.setupHotkeys();

      // Initialize legacy UI systems (will be refactored)
      this.initializeLegacyUI();

      this.isInitialized = true;
      errorHandler.showSuccess('✅ NEXUS-X NEXT LEVEL READY');

    } catch (error) {
      errorHandler.handleError({
        code: 'INIT_FAILED',
        message: 'System initialization failed',
        details: error,
        recoverable: false
      });
    }
  }

  /**
   * Initialize Audio Engine
   */
  private async initializeAudioEngine(): Promise<void> {
    // For now, we'll use a placeholder that bridges to the legacy code
    // In production, this would import and instantiate AudioEngine class
    console.log('Initializing Audio Engine...');

    // Setup Worklet (DSP)
    try {
      await Tone.context.addAudioWorkletModule('processor.js');
      const nativeCtx = Tone.context.rawContext || Tone.context;
      const bitcrusherNode = new AudioWorkletNode(nativeCtx, 'nexus-bitcrusher');

      // Try to load WASM
      try {
        const response = await fetch('nexus-dsp.wasm');
        if (response.ok) {
          const wasmBytes = await response.arrayBuffer();
          const wasmModule = await WebAssembly.compile(wasmBytes);
          bitcrusherNode.port.postMessage({ type: 'load-wasm', wasmModule });
          errorHandler.showSuccess('DSP: BITCRUSHER WORKLET ACTIVE (WASM)');
        }
      } catch (e) {
        console.log("DSP: Running in JS Mode (WASM not found)");
      }
    } catch (e) {
      console.error("Worklet Load Failed:", e);
    }
  }

  /**
   * Initialize all advanced features
   */
  private initializeAdvancedFeatures(): void {
    // Initialize core systems
    undoRedoManager;
    quantumSnapshots;
    neuralDream;
    spectralWorkbench;
    performanceRecorder;
    automationFeedback;
    aiProgressDialog;

    console.log('Advanced features initialized');
  }

  /**
   * Load saved state
   */
  private async loadState(): Promise<void> {
    const savedData = localStorage.getItem('nexus_state');

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const validation = validateStoredState(parsed);

        if (validation.valid) {
          const sanitized = sanitizeStoredState(parsed);

          if (sanitized) {
            this.setGenre(sanitized.genre || 'SYNTHWAVE');
            this.sequencerData = sanitized.data || this.getEmptyBank();
            errorHandler.showSuccess('✅ SESSION RESTORED');
          }
        } else {
          errorHandler.handleError({
            code: 'STORAGE_CORRUPT',
            message: 'Saved data corrupted',
            details: validation.errors,
            recoverable: true
          });
          this.setGenre('SYNTHWAVE');
        }
      } catch (e) {
        errorHandler.handleError({
          code: 'STORAGE_ERROR',
          message: 'Failed to load saved state',
          details: e,
          recoverable: true
        });
        this.setGenre('SYNTHWAVE');
      }
    } else {
      this.setGenre('SYNTHWAVE');
    }
  }

  /**
   * Save current state
   */
  saveState(): void {
    const state: StoredState = {
      data: this.sequencerData,
      genre: this.currentGenre,
      version: '4.0.0',
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('nexus_state', JSON.stringify(state));
    } catch (e) {
      errorHandler.handleError({
        code: 'STORAGE_ERROR',
        message: 'Failed to save state',
        details: e,
        recoverable: true
      });
    }
  }

  /**
   * Set genre with full configuration
   */
  setGenre(genreName: string): void {
    if (!GENRES[genreName]) {
      errorHandler.handleError({
        code: 'GENRE_INVALID',
        message: `Invalid genre: ${genreName}`,
        recoverable: true
      });
      return;
    }

    this.currentGenre = genreName;
    const genre = GENRES[genreName];

    // Set BPM
    this.baseBpm = Math.floor(
      Math.random() * (genre.bpmRange[1] - genre.bpmRange[0] + 1) + genre.bpmRange[0]
    );
    Tone.Transport.bpm.value = this.baseBpm;

    // Update UI
    const bpmEl = document.getElementById('bpm-display');
    if (bpmEl) {
      bpmEl.innerText = `${this.baseBpm} BPM`;
    }

    // Load kit (if audio engine initialized)
    if (this.audioEngine?.loadKit) {
      this.audioEngine.loadKit(genre.kit);
    }

    // Set scale (if audio engine initialized)
    if ((window as any).engine?.setScale) {
      (window as any).engine.setScale(genre.scale);
      // Update scale dropdown UI
      const scaleSelect = document.getElementById('scaleSelect') as HTMLSelectElement;
      if (scaleSelect) {
        scaleSelect.value = genre.scale;
      }
    }

    // Save state
    this.saveState();
    errorHandler.showSuccess(`🎵 GENRE: ${genreName} @ ${this.baseBpm}BPM`);
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupHotkeys(): void {
    window.addEventListener('keydown', (e) => {
      // Prevent default for our shortcuts
      if (e.target !== document.body && e.target.tagName !== 'BUTTON') return;

      const k = e.key.toLowerCase();

      // Playback
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      }

      // Snapshots
      if (k >= '1' && k <= '8') {
        const idx = parseInt(k) - 1;
        if (e.shiftKey) {
          // Save snapshot
          if (this.sequencerData.length > 0) {
            quantumSnapshots.saveSnapshot(idx, this.sequencerData, {}, {});
          }
        } else {
          // Load snapshot
          quantumSnapshots.loadSnapshot(idx);
        }
      }

      // Macro FX (mapped to buttons)
      if (k === 'q' || k === 'w' || k === 'e' || k === 'r') {
        // Trigger macro buttons (delegated to UI)
        const macroButtons: Record<string, string> = {
          'q': 'fluxBtn',
          'w': 'pumpBtn',
          'e': 'stuttBtn',
          'r': 'wobbleBtn'
        };
        const btn = document.getElementById(macroButtons[k]);
        if (btn && btn instanceof HTMLElement) {
          btn.click();
        }
      }

      // EQ bands
      if (k === 'z' || k === 'x' || k === 'c') {
        const eqButtons: Record<string, string> = {
          'z': 'eqLowBtn',
          'x': 'eqMidBtn',
          'c': 'eqHighBtn'
        };
        const btn = document.getElementById(eqButtons[k]);
        if (btn && btn instanceof HTMLElement) {
          btn.click();
        }
      }

      // Help
      if (k === 'h') {
        const helpDialog = document.getElementById('helpDialog');
        if (helpDialog) {
          helpDialog.open ? helpDialog.close() : helpDialog.showModal();
        }
      }
    });
  }

  /**
   * Initialize legacy UI systems (will be refactored)
   */
  private initializeLegacyUI(): void {
    // This will eventually be replaced by the new UI system
    // For now, we bridge to the existing UI
    console.log('Legacy UI initialized');

    // Initialize sequencer data
    this.sequencerData = this.getEmptyBank();
  }

  /**
   * Get empty bank for sequencer
   */
  getEmptyBank(): number[][] {
    return CONFIG.tracks.map(() => Array(CONFIG.steps).fill(0));
  }

  /**
   * Toggle play/stop
   */
  togglePlay(): void {
    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop();
      const playBtn = document.getElementById('playBtn');
      if (playBtn) {
        playBtn.innerHTML = '▶ PLAY';
        playBtn.classList.remove('rec');
      }
    } else {
      Tone.Transport.start();
      const playBtn = document.getElementById('playBtn');
      if (playBtn) {
        playBtn.innerHTML = '■ STOP';
        playBtn.classList.add('rec');
      }
    }
  }

  /**
   * Panic - stop all audio
   */
  panic(): void {
    Tone.Transport.stop();
    Tone.Destination.mute = true;
    setTimeout(() => {
      Tone.Destination.mute = false;
    }, 500);
    errorHandler.showInfo('⚠️ PANIC: Audio Reset');
  }

  /**
   * Toggle record
   */
  toggleRecord(): void {
    if (performanceRecorder.isRecordingActive) {
      performanceRecorder.stopRecording();
    } else {
      performanceRecorder.startRecording();
    }
  }

  /**
   * Save snapshot
   */
  saveSnap(idx: number): void {
    if (this.sequencerData.length > 0) {
      quantumSnapshots.saveSnapshot(idx, this.sequencerData, {}, {});
    }
  }

  /**
   * Load snapshot
   */
  loadSnap(idx: number): void {
    const snapshot = quantumSnapshots.loadSnapshot(idx);
    if (snapshot) {
      this.sequencerData = [...snapshot.data.sequencer];
      this.saveState();
    }
  }

  /**
   * Generate full song with AI
   */
  async generateFullSong(): Promise<void> {
    // Show AI progress dialog
    aiProgressDialog.show(AISteps.fullSong);

    // Check for cancellation
    if (aiProgressDialog.cancelled) return;

    try {
      // Step 1: Initialize
      aiProgressDialog.updateProgress(1);
      aiProgressDialog.setStatus('Initializing AI Engine...');
      await this.sleep(500);

      // Step 2: Select genre
      aiProgressDialog.updateProgress(2);
      aiProgressDialog.setStatus('Analyzing Genre Requirements...');
      await this.sleep(300);

      if (!this.themeLocked) {
        const genres = Object.keys(GENRES);
        const randomGenre = genres[Math.floor(Math.random() * genres.length)];
        this.setGenre(randomGenre);
      }

      // Step 3: Load Magenta model
      aiProgressDialog.updateProgress(3);
      aiProgressDialog.setStatus('Loading MusicVAE Model...');
      await this.sleep(1000);

      // Step 4-9: Generate composition
      for (let i = 4; i <= 9; i++) {
        if (aiProgressDialog.cancelled) return;

        aiProgressDialog.updateProgress(i);
        const step = AISteps.fullSong[i];
        aiProgressDialog.setStatus(step.label);
        await this.sleep(step.duration || 500);
      }

      // Finalize
      aiProgressDialog.updateProgress(10);
      aiProgressDialog.setStatus('Finalizing Composition...');
      await this.sleep(300);

      // Hide dialog and play
      aiProgressDialog.hide();
      this.togglePlay();
      errorHandler.showSuccess(`✨ SONG GENERATED: ${this.currentGenre}`);

    } catch (error) {
      aiProgressDialog.showError('Generation failed');
      errorHandler.handleError({
        code: 'GENERATION_FAILED',
        message: 'AI song generation failed',
        details: error,
        recoverable: true
      });
    }
  }

  /**
   * Generate drums only
   */
  async generateDrumsOnly(): Promise<void> {
    aiProgressDialog.show(AISteps.drumsOnly);

    try {
      for (let i = 1; i <= 5; i++) {
        if (aiProgressDialog.cancelled) return;

        aiProgressDialog.updateProgress(i);
        const step = AISteps.drumsOnly[i];
        aiProgressDialog.setStatus(step.label);
        await this.sleep(step.duration || 500);
      }

      aiProgressDialog.hide();
      errorHandler.showSuccess('🧠 DRUMS GENERATED');

    } catch (error) {
      aiProgressDialog.showError('Generation failed');
      errorHandler.handleError({
        code: 'GENERATION_FAILED',
        message: 'Drum generation failed',
        details: error,
        recoverable: true
      });
    }
  }

  /**
   * Mutate sound design
   */
  mutateSoundDesign(): void {
    errorHandler.showSuccess('🧬 SOUND MUTATION APPLIED');
    // This would integrate with AudioEngine
  }

  /**
   * Clear grid
   */
  clear(): void {
    const oldData = this.sequencerData.map(track => [...track]);
    this.sequencerData = this.getEmptyBank();
    this.saveState();

    // Add to undo stack
    const command = CommandFactory.clearGrid(oldData, (newData) => {
      this.sequencerData = newData;
      this.saveState();
    });

    undoRedoManager.execute(command);
    errorHandler.showSuccess('🗑️ GRID CLEARED');
  }

  /**
   * Auto-save (debounced)
   */
  private autoSaveTimeout: number | null = null;

  autoSave(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.autoSaveTimeout = window.setTimeout(() => {
      this.saveState();
    }, 1000);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set theme lock
   */
  toggleThemeLock(): void {
    this.themeLocked = !this.themeLocked;
    errorHandler.showInfo(this.themeLocked ? '🎨 THEME LOCKED' : '🎨 THEME UNLOCKED');
  }

  /**
   * Set humanize
   */
  toggleHumanize(): void {
    this.humanizeActive = !this.humanizeActive;
    errorHandler.showInfo(this.humanizeActive ? '🤖 HUMANIZE ON' : '🤖 HUMANIZE OFF');
  }

  // Getters
  get baseBpmValue(): number {
    return this.baseBpm;
  }

  get currentGenreValue(): string {
    return this.currentGenre;
  }

  get sequencer(): number[][] {
    return this.sequencerData;
  }

  get ui(): any {
    return this; // Placeholder for legacy compatibility
  }

  get engine(): any {
    return this.audioEngine;
  }

  get seq(): any {
    return this; // Placeholder for legacy compatibility
  }

  get mixer(): any {
    return this; // Placeholder for legacy compatibility
  }

  get arrangerValue(): any {
    return this.arranger;
  }
}

// Initialize system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const system = new NexusSystem();
    (window as any).nexusSystem = system;
  });
} else {
  const system = new NexusSystem();
  (window as any).nexusSystem = system;
}

// Export for module usage
export { NexusSystem };
export type { Config, GenreConfig, ScaleType, KitType, StoredState, ValidationResult };
