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
import { spectralWorkbench } from './core/SpectralWorkbench.js';
import { performanceRecorder } from './core/PerformanceRecorder.js';
import { aiProgressDialog, AISteps } from './core/AIProgressDialog.js';
import { automationFeedback } from './ui/AutomationFeedback.js';
import { audioEngine } from './audio/core/AudioEngineNew.js';

// --- AI ENGINE (New Module Structure) ---
import { neuralDream } from './ai-engine/NeuralDream.js';
import { createAIComposer } from './ai-engine/AIComposer.js';
import { createAIMasteringEngine } from './ai-engine/AIMasteringEngine.js';
import { createRandomizationEngine } from './ai-engine/RandomizationEngine.js';

// --- MUSIC THEORY (New Module Structure) ---
import { createScaleLocker, SCALES } from './music-theory/index.js';
import { createChordGenerator } from './music-theory/index.js';

// --- SEQUENCER (New Module Structure) ---
import { createArpeggiatorPro } from './sequencer/ArpeggiatorPro.js';
import { createQuantizer } from './sequencer/Quantizer.js';
import { createAutoArranger } from './sequencer/AutoArranger.js';
import { createPatternProcessor } from './sequencer/PatternProcessor.js';
import { createEmptyPattern } from './sequencer/patternUtils.js';

// --- UTILITIES ---
import { validateStoredState, sanitizeStoredState } from './utils/validators.js';
import { loggers } from './utils/logger.js';
import * as Tone from 'tone';

// --- CONFIGURATION ---
import {
    TRACK_DISPLAY_NAMES,
    TRACK_COLORS,
    NUM_TRACKS,
    STEPS_PER_PATTERN,
    TRACK,
    GENRES,
    DEFAULT_GENRE
} from './config/index.js';

// Logger instance
const log = loggers.system;

// --- WINDOW API (UI Integration) ---
import { initializeWindowAPI, sequencerData } from './ui/WindowAPI.js';
import { initializeNexusUI, startSequencer, stopSequencer, setSequencerData, clearSequencerData, getSequencerData, toggleStep, disposeNexusUI } from './ui/NexusUISetup.js';

// --- LOCAL CONFIGURATION ---
const CONFIG: Config = {
  tracks: [...TRACK_DISPLAY_NAMES],
  colors: [...TRACK_COLORS],
  steps: STEPS_PER_PATTERN
};

// --- MAIN SYSTEM ---
class NexusSystem {
  private baseBpm = 128;
  private currentGenre = DEFAULT_GENRE;
  private humanizeActive = false;
  private themeLocked = false;
  private audioEngine: import('./audio/core/AudioEngineNew').AudioEngine | null = null;
  private sequencerData: number[][] = [];
  private arranger: import('./sequencer/AutoArranger').AutoArranger | null = null;
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
      const startDialog = document.getElementById('startDialog') as HTMLDialogElement | null;
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
          log.info('GPU ACCEL ON');
        }
      } catch (e) {
        log.warn('GPU acceleration not available:', e);
      }

      // Initialize Audio Engine (will be modularized)
      await this.initializeAudioEngine();

      // Initialize Window API (connects all UI buttons to core modules)
      initializeWindowAPI();
      log.debug('Window API initialized');

      // Initialize all advanced features
      this.initializeAdvancedFeatures();

      // Load saved state or defaults
      await this.loadState();

      // Setup hotkeys
      this.setupHotkeys();

      // Initialize legacy UI systems (will be refactored)
      this.initializeLegacyUI();

      // Initialize NexusUI components (dials, buttons, visualization)
      initializeNexusUI();
      log.debug('NexusUI components initialized');

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
    log.debug('Initializing Audio Engine...');

    // Use the modular AudioEngine from audio/core/AudioEngineNew.ts
    try {
      await audioEngine.initialize();
      this.audioEngine = audioEngine;

      // Check if WASM is loaded
      audioEngine.on('wasmReady', (ready: boolean) => {
        if (ready) {
          errorHandler.showSuccess('DSP: WASM ENGINE ACTIVE');
        }
      });

      errorHandler.showSuccess('DSP: AUDIO ENGINE INITIALIZED');
    } catch (e) {
      log.error('Audio Engine initialization failed:', e);
      errorHandler.handleError({
        code: 'AUDIO_INIT_FAILED',
        message: 'Audio engine initialization failed',
        details: e,
        recoverable: true
      });
    }
  }

  /**
   * Initialize all advanced features
   */
  private initializeAdvancedFeatures(): void {
    // Initialize core systems
    undoRedoManager;
    quantumSnapshots;
    spectralWorkbench;
    performanceRecorder;
    automationFeedback;
    aiProgressDialog;

    // Initialize AI Engine modules
    const aiComposer = createAIComposer();
    const aiMastering = createAIMasteringEngine();
    const randomization = createRandomizationEngine();

    // Initialize Music Theory modules
    const scaleLocker = createScaleLocker();
    const chordGenerator = createChordGenerator();

    // Initialize Sequencer modules
    const arpeggiator = createArpeggiatorPro();
    const quantizer = createQuantizer();
    const autoArranger = createAutoArranger();
    const patternProcessor = createPatternProcessor();

    // Make modules globally accessible for legacy compatibility
    (window as any).neuralDream = neuralDream;
    (window as any).aiComposer = aiComposer;
    (window as any).aiMastering = aiMastering;
    (window as any).randomization = randomization;
    (window as any).scaleLocker = scaleLocker;
    (window as any).chordGenerator = chordGenerator;
    (window as any).arpeggiator = arpeggiator;
    (window as any).quantizer = quantizer;
    (window as any).autoArranger = autoArranger;
    (window as any).patternProcessor = patternProcessor;

    log.debug('Advanced features initialized');
    log.debug('AI Engine: AIComposer, NeuralDream, AIMastering, Randomization');
    log.debug('Music Theory: ScaleLocker, ChordGenerator');
    log.debug('Sequencer: Arpeggiator, Quantizer, AutoArranger, PatternProcessor');
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
    log.debug(' setGenre called:', genreName);

    if (!GENRES[genreName]) {
      log.error(' Invalid genre:', genreName);
      errorHandler.handleError({
        code: 'GENRE_INVALID',
        message: `Invalid genre: ${genreName}`,
        recoverable: true
      });
      return;
    }

    this.currentGenre = genreName;
    const genre = GENRES[genreName];
    log.debug(' Genre config:', genre);

    // Set BPM
    this.baseBpm = Math.floor(
      Math.random() * (genre.bpmRange[1] - genre.bpmRange[0] + 1) + genre.bpmRange[0]
    );
    Tone.Transport.bpm.value = this.baseBpm;
    log.debug(' BPM set to:', this.baseBpm);

    // Update UI
    const bpmEl = document.getElementById('bpm-display');
    if (bpmEl) {
      bpmEl.innerText = `${this.baseBpm} BPM`;
    }

    // Load kit (if audio engine initialized)
    if (this.audioEngine?.loadKit) {
      log.debug(' Loading kit:', genre.kit);
      this.audioEngine.loadKit(genre.kit);
    } else {
      log.warn(' AudioEngine.loadKit not available');
    }

    // Set scale (if audio engine initialized)
    if ((window as any).engine?.setScale) {
      log.debug(' Setting scale:', genre.scale);
      (window as any).engine.setScale(genre.scale);
      // Update scale dropdown UI
      const scaleSelect = document.getElementById('scaleSelect') as HTMLSelectElement;
      if (scaleSelect) {
        scaleSelect.value = genre.scale;
      }
    } else {
      log.warn(' window.engine.setScale not available');
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
      if (e.target !== document.body && (e.target as HTMLElement).tagName !== 'BUTTON') return;

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
        const helpDialog = document.getElementById('helpDialog') as HTMLDialogElement | null;
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
    log.debug('Legacy UI initialized');

    // Initialize sequencer data
    this.sequencerData = this.getEmptyBank();

    // Build the visual sequencer grid
    this.buildSequencerGrid();
  }

  /**
   * Build the visual sequencer grid with bars/steps
   */
  private buildSequencerGrid(): void {
    const rack = document.getElementById('rack');
    if (!rack) {
      log.error(' Rack element not found!');
      return;
    }

    // Clear existing content
    rack.innerHTML = '';

    // Create track rows with mixer controls
    CONFIG.tracks.forEach((trackName, trackIndex) => {
      const trackRow = document.createElement('div');
      trackRow.className = 'track-row';
      trackRow.dataset.track = trackIndex.toString();

      // MIXER CONTROLS SECTION
      const mixerSection = document.createElement('div');
      mixerSection.className = 'track-mixer';
      mixerSection.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        min-width: 70px;
        padding: 4px;
        background: rgba(0,0,0,0.3);
        border-radius: 4px;
        margin-right: 8px;
      `;

      // Track label
      const label = document.createElement('div');
      label.className = 'track-label';
      label.style.cssText = `
        color: ${CONFIG.colors[trackIndex]};
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 4px;
      `;
      label.textContent = trackName;
      mixerSection.appendChild(label);

      // Mute/Solo buttons row
      const msRow = document.createElement('div');
      msRow.style.cssText = `display: flex; gap: 4px; margin-bottom: 4px;`;

      // Mute button
      const muteBtn = document.createElement('button');
      muteBtn.id = `mute-${trackIndex}`;
      muteBtn.className = 'track-btn mute-btn';
      muteBtn.textContent = 'M';
      muteBtn.title = 'Mute Track';
      muteBtn.style.cssText = `
        width: 22px; height: 22px;
        background: #222;
        border: 1px solid #444;
        color: #888;
        font-size: 10px;
        font-weight: 700;
        cursor: pointer;
        border-radius: 3px;
        transition: all 0.15s;
      `;
      muteBtn.addEventListener('click', () => {
        const isMuted = (window as any).toggleTrackMute?.(trackIndex) ?? false;
        muteBtn.style.background = isMuted ? '#ff0055' : '#222';
        muteBtn.style.color = isMuted ? '#fff' : '#888';
        muteBtn.style.borderColor = isMuted ? '#ff0055' : '#444';
      });
      msRow.appendChild(muteBtn);

      // Solo button
      const soloBtn = document.createElement('button');
      soloBtn.id = `solo-${trackIndex}`;
      soloBtn.className = 'track-btn solo-btn';
      soloBtn.textContent = 'S';
      soloBtn.title = 'Solo Track';
      soloBtn.style.cssText = `
        width: 22px; height: 22px;
        background: #222;
        border: 1px solid #444;
        color: #888;
        font-size: 10px;
        font-weight: 700;
        cursor: pointer;
        border-radius: 3px;
        transition: all 0.15s;
      `;
      soloBtn.addEventListener('click', () => {
        const isSoloed = (window as any).toggleTrackSolo?.(trackIndex) ?? false;
        soloBtn.style.background = isSoloed ? '#f59e0b' : '#222';
        soloBtn.style.color = isSoloed ? '#000' : '#888';
        soloBtn.style.borderColor = isSoloed ? '#f59e0b' : '#444';
        // Update all solo buttons (in case another track was unsoloed)
        CONFIG.tracks.forEach((_, i) => {
          const btn = document.getElementById(`solo-${i}`);
          if (btn) {
            const channels = (window as any).getTrackChannels?.() ?? [];
            const soloed = channels[i]?.soloed ?? false;
            (btn as HTMLElement).style.background = soloed ? '#f59e0b' : '#222';
            (btn as HTMLElement).style.color = soloed ? '#000' : '#888';
          }
        });
      });
      msRow.appendChild(soloBtn);

      mixerSection.appendChild(msRow);

      // Volume slider
      const volContainer = document.createElement('div');
      volContainer.style.cssText = `display: flex; align-items: center; gap: 4px; width: 100%;`;
      const volLabel = document.createElement('span');
      volLabel.textContent = 'V';
      volLabel.style.cssText = `font-size: 8px; color: #666;`;
      const volSlider = document.createElement('input');
      volSlider.type = 'range';
      volSlider.min = '0';
      volSlider.max = '100';
      volSlider.value = '70';
      volSlider.className = 'track-volume-slider';
      volSlider.style.cssText = `
        flex: 1;
        height: 4px;
        -webkit-appearance: none;
        background: #333;
        border-radius: 2px;
        cursor: pointer;
      `;
      volSlider.addEventListener('input', (e) => {
        const value = parseInt((e.target as HTMLInputElement).value) / 100;
        (window as any).setTrackVolume?.(trackIndex, value);
      });
      volContainer.appendChild(volLabel);
      volContainer.appendChild(volSlider);
      mixerSection.appendChild(volContainer);

      // Pan slider
      const panContainer = document.createElement('div');
      panContainer.style.cssText = `display: flex; align-items: center; gap: 4px; width: 100%; margin-top: 2px;`;
      const panLabel = document.createElement('span');
      panLabel.textContent = 'P';
      panLabel.style.cssText = `font-size: 8px; color: #666;`;
      const panSlider = document.createElement('input');
      panSlider.type = 'range';
      panSlider.min = '-100';
      panSlider.max = '100';
      panSlider.value = '0';
      panSlider.className = 'track-pan-slider';
      panSlider.style.cssText = `
        flex: 1;
        height: 4px;
        -webkit-appearance: none;
        background: linear-gradient(to right, #ff0055, #333, #00ccff);
        border-radius: 2px;
        cursor: pointer;
      `;
      panSlider.addEventListener('input', (e) => {
        const value = parseInt((e.target as HTMLInputElement).value) / 100;
        (window as any).setTrackPan?.(trackIndex, value);
      });
      panContainer.appendChild(panLabel);
      panContainer.appendChild(panSlider);
      mixerSection.appendChild(panContainer);

      trackRow.appendChild(mixerSection);

      // Steps container
      const stepsContainer = document.createElement('div');
      stepsContainer.className = 'steps-container';

      // Create 32 steps (2 bars of 16th notes)
      for (let step = 0; step < CONFIG.steps; step++) {
        const stepBtn = document.createElement('button');
        stepBtn.className = 'step-btn';
        stepBtn.dataset.track = trackIndex.toString();
        stepBtn.dataset.step = step.toString();

        // Add bar marker every 16 steps
        if (step % 16 === 0) {
          stepBtn.classList.add('bar-start');
        }
        // Add beat marker every 4 steps
        if (step % 4 === 0) {
          stepBtn.classList.add('beat-marker');
        }

        // Click handler
        stepBtn.addEventListener('click', () => {
          this.toggleStep(trackIndex, step);
          stepBtn.classList.toggle('active');
          this.autoSave();
        });

        stepsContainer.appendChild(stepBtn);
      }

      trackRow.appendChild(stepsContainer);
      rack.appendChild(trackRow);
    });

    log.debug(` Built sequencer grid with mixer controls: ${CONFIG.tracks.length} tracks × ${CONFIG.steps} steps`);
  }

  /**
   * Toggle a step in the sequencer
   */
  private toggleStep(track: number, step: number): void {
    if (!this.sequencerData[track]) {
      this.sequencerData[track] = Array(CONFIG.steps).fill(0);
    }
    this.sequencerData[track][step] = this.sequencerData[track][step] === 0 ? 1 : 0;

    // SYNC: Update NexusUI sequencer data
    toggleStep(track, step);

    log.debug(` Step ${track},${step} = ${this.sequencerData[track][step]}`);
  }

  /**
   * Preview a step sound (silent fallback - sounds will play during sequencer playback)
   */
  private previewStep(track: number): void {
    // Sound preview disabled for now - will play during sequencer playback
    // The registry methods require the AudioEngine to be fully initialized with instruments
    log.debug(` Step toggled on track ${track}`);
  }

  /**
   * Refresh the grid UI from sequencer data
   */
  refreshGridUI(): void {
    const rack = document.getElementById('rack');
    if (!rack) return;

    this.sequencerData.forEach((track, trackIndex) => {
      track.forEach((value, stepIndex) => {
        const stepBtn = rack.querySelector(`[data-track="${trackIndex}"][data-step="${stepIndex}"]`);
        if (stepBtn) {
          if (value === 1) {
            stepBtn.classList.add('active');
          } else {
            stepBtn.classList.remove('active');
          }
        }
      });
    });
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
    log.debug(' togglePlay called, current state:', Tone.Transport.state);
    log.debug(' sequencerData sample:', this.sequencerData[0]?.slice(0, 8));

    if (Tone.Transport.state === 'started') {
      log.debug(' Stopping playback...');
      Tone.Transport.stop();
      stopSequencer();
      const playBtn = document.getElementById('playBtn');
      if (playBtn) {
        playBtn.innerHTML = '▶ PLAY';
        playBtn.classList.remove('rec');
      }
    } else {
      log.debug(' Starting playback...');
      log.debug(' BPM:', Tone.Transport.bpm.value);
      log.debug(' Context state:', Tone.context.state);

      Tone.Transport.start();
      startSequencer();

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
      await this.sleep(300);

      // Step 2: Select genre
      aiProgressDialog.updateProgress(2);
      aiProgressDialog.setStatus('Analyzing Genre Requirements...');
      await this.sleep(200);

      if (!this.themeLocked) {
        const genres = Object.keys(GENRES);
        const randomGenre = genres[Math.floor(Math.random() * genres.length)];
        this.setGenre(randomGenre);
      }

      // Randomly select a scale for musical variety
      const scales = [
        'major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian',
        'pentatonic', 'blues', 'harmonicMinor', 'melodicMinor',
        'jazzMinor', 'bebop', 'wholetone', 'diminished',
        'persian', 'byzantine', 'phrygianDominant', 'doubleHarmonic'
      ];
      const randomScale = scales[Math.floor(Math.random() * scales.length)];
      this.audioEngine?.setScale(randomScale);
      log.debug(' Random scale selected:', randomScale);

      // Update scale dropdown UI
      const scaleSelect = document.getElementById('scaleSelect') as HTMLSelectElement;
      if (scaleSelect) {
        scaleSelect.value = randomScale;
      }

      // Step 3: Generate patterns
      aiProgressDialog.updateProgress(3);
      aiProgressDialog.setStatus('Generating Drum Patterns...');
      this.generateDrumPattern();
      await this.sleep(200);

      aiProgressDialog.updateProgress(4);
      aiProgressDialog.setStatus('Generating Bass Line...');
      this.generateBassPattern();
      await this.sleep(200);

      aiProgressDialog.updateProgress(5);
      aiProgressDialog.setStatus('Generating Melody...');
      this.generateMelodyPattern();
      await this.sleep(200);

      aiProgressDialog.updateProgress(6);
      aiProgressDialog.setStatus('Adding Chords...');
      this.generateChordPattern();
      await this.sleep(200);

      // Step 7: Update UI
      aiProgressDialog.updateProgress(7);
      aiProgressDialog.setStatus('Updating Sequencer...');
      this.refreshGridUI();
      this.updateWindowSequencerData();

      // UPDATE SONG STRUCTURE MINIMAP
      this.updateSongStructureUI();

      await this.sleep(200);

      // Finalize
      aiProgressDialog.updateProgress(8);
      aiProgressDialog.setStatus('Finalizing Composition...');
      await this.sleep(200);

      // Hide dialog
      aiProgressDialog.hide();
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
   * Update the song structure minimap UI
   */
  private updateSongStructureUI(): void {
    const minimap = document.getElementById('minimap');
    const totalBarsDisplay = document.getElementById('total-bars-display');

    if (!minimap) {
      log.warn(' Minimap element not found');
      return;
    }

    // Clear existing
    minimap.innerHTML = '';

    // Create song sections based on current genre
    const sections = this.generateSongSections();

    // Calculate total bars
    const totalBars = sections.reduce((sum, s) => sum + s.bars, 0);

    // Update display
    if (totalBarsDisplay) {
      totalBarsDisplay.textContent = `${totalBars} BARS`;
    }

    // Build song structure for playback
    const songStructureForPlayback: Array<{name: string, bars: number, color: string, pattern: number[][]}> = [];

    // Create section elements
    sections.forEach((section, index) => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'song-section';
      sectionEl.style.cssText = `
        flex: ${section.bars};
        min-width: ${Math.max(20, section.bars * 5)}px;
        background: ${section.color};
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        font-weight: 700;
        color: #fff;
        text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        border-right: 1px solid rgba(255,255,255,0.1);
        cursor: pointer;
        transition: all 0.2s;
      `;
      sectionEl.textContent = section.name;
      sectionEl.title = `${section.name} - ${section.bars} bars`;

      // Hover effect
      sectionEl.addEventListener('mouseenter', () => {
        sectionEl.style.filter = 'brightness(1.3)';
      });
      sectionEl.addEventListener('mouseleave', () => {
        sectionEl.style.filter = 'brightness(1)';
      });

      minimap.appendChild(sectionEl);

      // Generate pattern for this section (will be used by playback system)
      // We'll use the NexusUISetup's generateSectionPattern function
      songStructureForPlayback.push({
        name: section.name,
        bars: section.bars,
        color: section.color,
        pattern: this.generatePatternForSection(section.name, index)
      });
    });

    // Send song structure to sequencer
    const win = window as any;
    if (win.setSongStructure) {
      win.setSongStructure(songStructureForPlayback);
    }

    log.debug(' Updated song structure UI with', sections.length, 'sections');
    log.debug(' Total bars:', totalBars);
  }

  /**
   * Generate a pattern for a specific section
   */
  private generatePatternForSection(sectionType: string, sectionIndex: number): number[][] {
    const pattern = createEmptyPattern(7, 32);

    const variation = sectionIndex % 4;
    const genre = this.currentGenre;

    // Add some randomness for variation
    const randomOffset = Math.floor(Math.random() * 4);
    const randomDensity = 0.7 + Math.random() * 0.3;

    // Helper function for probabilistic triggers
    const maybe = (probability: number = 0.7) => Math.random() < probability * randomDensity;

    switch (sectionType) {
      case 'INTRO':
        // Intro should have SOME sound - not empty!
        for (let s = 0; s < 32; s += 4) {
          if (maybe(0.7)) pattern[0][s] = 1; // Kick
        }
        for (let s = 16; s < 32; s += 8) {
          if (maybe(0.6)) pattern[1][s] = 1; // Snare in second half
        }
        // Hi-hat fades in
        for (let s = 8; s < 32; s += 4) {
          if (maybe(0.5)) pattern[3][s] = 1;
        }
        // Atmospheric pad
        pattern[6][0] = 1;
        break;

      case 'BUILD':
      case 'BUILDUP':
        // Increasing energy
        for (let s = 0; s < 32; s += 4) {
          if (maybe(0.9)) pattern[0][s] = 1;
        }
        for (let s = 4; s < 32; s += 8) {
          if (maybe(0.85)) pattern[1][s] = 1;
        }
        for (let s = 2; s < 32; s += 4) {
          if (maybe(0.7)) pattern[3][s] = 1;
        }
        // More hats in second half (build-up effect)
        for (let s = 16; s < 32; s += 2) {
          if (maybe(0.5)) pattern[3][s] = 1;
        }
        // Rising snare rolls
        if (variation % 2 === 0) {
          for (let s = 28; s < 32; s++) {
            if (maybe(0.6)) pattern[1][s] = 1;
          }
        }
        break;

      case 'DROP':
        // Full energy - main moment!
        for (let s = 0; s < 32; s += 4) {
          pattern[0][s] = 1; // Kick always on the beat
        }
        for (let s = 4; s < 32; s += 8) {
          if (maybe(0.95)) pattern[1][s] = 1;
        }
        // Clap hits
        [4, 12, 20, 28].forEach(s => {
          if (maybe(0.8)) pattern[2][s] = 1;
        });
        for (let s = 2; s < 32; s += 4) {
          if (maybe(0.85)) pattern[3][s] = 1;
        }
        // Bass pattern
        for (let s = 0; s < 32; s += 4 + (variation % 2) * 4) {
          if (maybe(0.9)) pattern[4][s] = 1;
        }
        // Lead melody - sparse but catchy
        for (let s = 0; s < 32; s += 8) {
          if (maybe(0.7)) pattern[5][s] = 1;
        }
        if (maybe(0.6)) pattern[6][0] = 1;
        break;

      case 'VERSE':
        for (let s = 0; s < 32; s += 4) {
          if (maybe(0.9)) pattern[0][s] = 1;
        }
        for (let s = 4; s < 32; s += 8) {
          if (maybe(0.85)) pattern[1][s] = 1;
        }
        for (let s = 2; s < 32; s += 4) {
          if (maybe(0.6)) pattern[3][s] = 1;
        }
        for (let s = 0; s < 32; s += 8) {
          if (maybe(0.7)) pattern[4][s] = 1;
        }
        break;

      case 'CHORUS':
      case 'HOOK':
        // Maximum catchiness
        for (let s = 0; s < 32; s += 4) {
          pattern[0][s] = 1;
        }
        for (let s = 4; s < 32; s += 8) {
          pattern[1][s] = 1;
        }
        for (let s = 0; s < 32; s += 8) {
          if (maybe(0.85)) pattern[2][s] = 1;
        }
        for (let s = 2; s < 32; s += 4) {
          pattern[3][s] = 1;
        }
        for (let s = 0; s < 32; s += 4) {
          if (maybe(0.8)) pattern[4][s] = 1;
        }
        // Catchy melody pattern
        for (let s = 0; s < 32; s += 4) {
          if ((s + variation) % 8 < 4 && maybe(0.75)) {
            pattern[5][s] = 1;
          }
        }
        if (maybe(0.7)) pattern[6][0] = 1;
        break;

      case 'BREAK':
      case 'BREAKDOWN':
        // Strip back - tension building
        for (let s = 0; s < 32; s += 8) {
          if (maybe(0.5)) pattern[0][s] = 1;
        }
        for (let s = 16; s < 32; s += 8) {
          if (maybe(0.4)) pattern[3][s] = 1;
        }
        // Atmospheric pad
        if (maybe(0.8)) pattern[6][0] = 1;
        if (maybe(0.6)) pattern[6][16] = 1;
        break;

      case 'BRIDGE':
        // Different feel - surprise element
        for (let s = 0; s < 32; s += 8) {
          if (maybe(0.7)) pattern[0][s] = 1;
        }
        for (let s = 12; s < 32; s += 16) {
          if (maybe(0.8)) pattern[1][s] = 1;
        }
        // Fast hi-hats for energy
        for (let s = 0; s < 32; s += 2) {
          if (maybe(0.5)) pattern[3][s] = 1;
        }
        break;

      case 'OUTRO':
        // Fading out
        for (let s = 0; s < 16; s += 4) {
          if (maybe(0.8 - s/32)) pattern[0][s] = 1;
        }
        for (let s = 4; s < 16; s += 8) {
          if (maybe(0.6)) pattern[1][s] = 1;
        }
        break;

      case 'THEME':
      case 'ANTHEM':
        // Full arrangement - main theme
        for (let s = 0; s < 32; s += 4) {
          pattern[0][s] = 1;
        }
        for (let s = 4; s < 32; s += 8) {
          pattern[1][s] = 1;
        }
        for (let s = 2; s < 32; s += 4) {
          if (maybe(0.85)) pattern[3][s] = 1;
        }
        for (let s = 0; s < 32; s += 4) {
          if (maybe(0.8)) pattern[4][s] = 1;
        }
        for (let s = 0; s < 32; s += 4) {
          if (maybe(0.7)) pattern[5][s] = 1;
        }
        pattern[6][0] = 1;
        pattern[6][16] = 1;
        break;

      case 'A':
        // Section A - main groove
        for (let s = 0; s < 32; s += 4) {
          pattern[0][s] = 1; // Always kick
        }
        for (let s = 4; s < 32; s += 8) {
          if (maybe(0.9)) pattern[1][s] = 1; // Snare
        }
        for (let s = 2; s < 32; s += 4) {
          if (maybe(0.7)) pattern[3][s] = 1; // HiHat
        }
        for (let s = 0; s < 32; s += 8) {
          if (maybe(0.6)) pattern[4][s] = 1; // Bass
        }
        break;

      case 'B':
        // Section B - variation with bass
        for (let s = 0; s < 32; s += 4) {
          pattern[0][s] = 1; // Always kick
        }
        for (let s = 4; s < 32; s += 8) {
          if (maybe(0.9)) pattern[1][s] = 1; // Snare
        }
        for (let s = 2; s < 32; s += 4) {
          if (maybe(0.75)) pattern[3][s] = 1; // HiHat
        }
        for (let s = 0; s < 32; s += 4) {
          if (maybe(0.8)) pattern[4][s] = 1; // More bass
        }
        // Add some melody
        for (let s = 0; s < 32; s += 8) {
          if (maybe(0.5)) pattern[5][s] = 1;
        }
        break;

      default:
        for (let s = 0; s < 32; s += 4) {
          if (maybe(0.8)) pattern[0][s] = 1;
        }
        for (let s = 4; s < 32; s += 8) {
          if (maybe(0.75)) pattern[1][s] = 1;
        }
    }

    // Genre-specific modifications
    this.applyGenrePatternMods(pattern, genre, sectionType);

    return pattern;
  }

  /**
   * Apply genre-specific pattern modifications
   */
  private applyGenrePatternMods(pattern: number[][], genre: string, sectionType: string): void {
    switch (genre) {
      case 'TRAP':
      case 'PHONK':
      case 'DRIFTPHONK':
      case 'DARKPHONK':
        // Trap/Phonk: rapid hi-hats in second half
        if (sectionType === 'DROP' || sectionType === 'CHORUS' || sectionType === 'HOOK') {
          for (let s = 16; s < 32; s++) {
            if (Math.random() > 0.4) pattern[3][s] = 1;
          }
        }
        break;

      case 'DNB':
        // DnB: breakbeat-style patterns
        if (sectionType === 'DROP') {
          pattern[0][10] = 1;
          pattern[1][4] = 1;
          pattern[1][20] = 1;
        }
        break;

      case 'HOUSE':
      case 'TECHNO':
      case 'TRANCE':
        // Four-on-the-floor emphasis
        for (let s = 0; s < 32; s += 4) {
          pattern[0][s] = 1; // Always kick on beat
        }
        break;

      case 'LOFI':
      case 'AMBIENT':
      case 'ETHEREAL':
        // Remove some hits for chill vibe
        for (let s = 0; s < 32; s++) {
          if (Math.random() > 0.7) {
            for (let t = 0; t < 7; t++) {
              pattern[t][s] = 0;
            }
          }
        }
        break;

      case 'INDUSTRIAL':
        // Add noise and chaos
        for (let s = 0; s < 32; s += 2) {
          if (Math.random() > 0.6) pattern[3][s] = 1;
        }
        break;
    }
  }

  /**
   * Generate song sections based on current genre
   */
  private generateSongSections(): Array<{name: string, bars: number, color: string}> {
    const genre = this.currentGenre;

    // Genre-specific song structures
    const structures: Record<string, Array<{name: string, bars: number, color: string}>> = {
      'TECHNO': [
        { name: 'INTRO', bars: 8, color: '#666' },
        { name: 'BUILD', bars: 8, color: '#f59e0b' },
        { name: 'DROP', bars: 16, color: '#ff0055' },
        { name: 'BREAK', bars: 8, color: '#7c3aed' },
        { name: 'DROP', bars: 16, color: '#ff0055' },
        { name: 'OUTRO', bars: 8, color: '#444' },
      ],
      'HOUSE': [
        { name: 'INTRO', bars: 8, color: '#666' },
        { name: 'VERSE', bars: 16, color: '#00e5ff' },
        { name: 'CHORUS', bars: 16, color: '#00ff94' },
        { name: 'VERSE', bars: 16, color: '#00e5ff' },
        { name: 'CHORUS', bars: 16, color: '#00ff94' },
        { name: 'OUTRO', bars: 8, color: '#444' },
      ],
      'TRAP': [
        { name: 'INTRO', bars: 4, color: '#666' },
        { name: 'VERSE', bars: 16, color: '#00e5ff' },
        { name: 'HOOK', bars: 8, color: '#ff00cc' },
        { name: 'VERSE', bars: 16, color: '#00e5ff' },
        { name: 'HOOK', bars: 16, color: '#ff00cc' },
        { name: 'OUTRO', bars: 4, color: '#444' },
      ],
      'DNB': [
        { name: 'INTRO', bars: 8, color: '#666' },
        { name: 'BUILD', bars: 8, color: '#f59e0b' },
        { name: 'DROP', bars: 16, color: '#ff0055' },
        { name: 'BREAK', bars: 8, color: '#7c3aed' },
        { name: 'DROP', bars: 24, color: '#ff0055' },
        { name: 'OUTRO', bars: 8, color: '#444' },
      ],
      'DUBSTEP': [
        { name: 'INTRO', bars: 8, color: '#666' },
        { name: 'BUILD', bars: 8, color: '#f59e0b' },
        { name: 'DROP', bars: 16, color: '#ff0055' },
        { name: 'BREAK', bars: 8, color: '#7c3aed' },
        { name: 'DROP', bars: 16, color: '#ff0055' },
        { name: 'OUTRO', bars: 8, color: '#444' },
      ],
      'AMBIENT': [
        { name: 'INTRO', bars: 16, color: '#666' },
        { name: 'THEME', bars: 32, color: '#00ccff' },
        { name: 'THEME', bars: 32, color: '#00ccff' },
        { name: 'OUTRO', bars: 16, color: '#444' },
      ],
      'LOFI': [
        { name: 'INTRO', bars: 4, color: '#666' },
        { name: 'A', bars: 16, color: '#f59e0b' },
        { name: 'B', bars: 16, color: '#00ccff' },
        { name: 'A', bars: 16, color: '#f59e0b' },
        { name: 'OUTRO', bars: 4, color: '#444' },
      ],
      'TRANCE': [
        { name: 'INTRO', bars: 16, color: '#666' },
        { name: 'BUILD', bars: 16, color: '#f59e0b' },
        { name: 'BREAKDOWN', bars: 16, color: '#7c3aed' },
        { name: 'ANTHEM', bars: 32, color: '#00ff94' },
        { name: 'OUTRO', bars: 16, color: '#444' },
      ],
      'PHONK': [
        { name: 'INTRO', bars: 4, color: '#666' },
        { name: 'BUILD', bars: 4, color: '#f59e0b' },
        { name: 'DROP', bars: 16, color: '#ff0055' },
        { name: 'BREAK', bars: 4, color: '#7c3aed' },
        { name: 'DROP', bars: 24, color: '#ff0055' },
        { name: 'OUTRO', bars: 4, color: '#444' },
      ],
      'DRIFTPHONK': [
        { name: 'INTRO', bars: 4, color: '#666' },
        { name: 'DROP', bars: 32, color: '#ff0055' },
        { name: 'BREAK', bars: 4, color: '#7c3aed' },
        { name: 'DROP', bars: 32, color: '#ff0055' },
        { name: 'OUTRO', bars: 4, color: '#444' },
      ],
      'DARKPHONK': [
        { name: 'INTRO', bars: 8, color: '#666' },
        { name: 'BUILD', bars: 8, color: '#f59e0b' },
        { name: 'DROP', bars: 24, color: '#ff0055' },
        { name: 'DROP', bars: 24, color: '#ff0055' },
        { name: 'OUTRO', bars: 8, color: '#444' },
      ],
      'INDUSTRIAL': [
        { name: 'INTRO', bars: 8, color: '#666' },
        { name: 'BUILD', bars: 8, color: '#f59e0b' },
        { name: 'DROP', bars: 16, color: '#ff0055' },
        { name: 'BREAK', bars: 8, color: '#7c3aed' },
        { name: 'DROP', bars: 24, color: '#ff0055' },
        { name: 'OUTRO', bars: 8, color: '#444' },
      ],
      'CYBERPUNK': [
        { name: 'INTRO', bars: 8, color: '#666' },
        { name: 'BUILD', bars: 8, color: '#f59e0b' },
        { name: 'DROP', bars: 16, color: '#ff0055' },
        { name: 'BRIDGE', bars: 8, color: '#5865F2' },
        { name: 'DROP', bars: 16, color: '#ff0055' },
        { name: 'OUTRO', bars: 8, color: '#444' },
      ],
      'SYNTHWAVE': [
        { name: 'INTRO', bars: 8, color: '#666' },
        { name: 'VERSE', bars: 16, color: '#00e5ff' },
        { name: 'CHORUS', bars: 16, color: '#00ff94' },
        { name: 'VERSE', bars: 16, color: '#00e5ff' },
        { name: 'CHORUS', bars: 16, color: '#00ff94' },
        { name: 'OUTRO', bars: 8, color: '#444' },
      ],
      'SYNTHPOP': [
        { name: 'INTRO', bars: 4, color: '#666' },
        { name: 'VERSE', bars: 16, color: '#00e5ff' },
        { name: 'CHORUS', bars: 16, color: '#00ff94' },
        { name: 'VERSE', bars: 16, color: '#00e5ff' },
        { name: 'CHORUS', bars: 16, color: '#00ff94' },
        { name: 'BRIDGE', bars: 8, color: '#7c3aed' },
        { name: 'CHORUS', bars: 16, color: '#00ff94' },
        { name: 'OUTRO', bars: 4, color: '#444' },
      ],
      'CHIPTUNE': [
        { name: 'INTRO', bars: 4, color: '#666' },
        { name: 'A', bars: 16, color: '#f59e0b' },
        { name: 'B', bars: 16, color: '#00ccff' },
        { name: 'A', bars: 16, color: '#f59e0b' },
        { name: 'OUTRO', bars: 4, color: '#444' },
      ],
      'CINEMATIC': [
        { name: 'INTRO', bars: 16, color: '#666' },
        { name: 'BUILD', bars: 16, color: '#f59e0b' },
        { name: 'ANTHEM', bars: 32, color: '#00ff94' },
        { name: 'OUTRO', bars: 16, color: '#444' },
      ],
      'ETHEREAL': [
        { name: 'INTRO', bars: 16, color: '#666' },
        { name: 'THEME', bars: 32, color: '#00ccff' },
        { name: 'THEME', bars: 32, color: '#00ccff' },
        { name: 'OUTRO', bars: 16, color: '#444' },
      ],
      'DUNGEONSYNTH': [
        { name: 'INTRO', bars: 8, color: '#666' },
        { name: 'A', bars: 16, color: '#7c3aed' },
        { name: 'B', bars: 16, color: '#5865F2' },
        { name: 'A', bars: 16, color: '#7c3aed' },
        { name: 'OUTRO', bars: 8, color: '#444' },
      ],
    };

    // Default structure for other genres
    const defaultStructure: Array<{name: string, bars: number, color: string}> = [
      { name: 'INTRO', bars: 8, color: '#666' },
      { name: 'VERSE', bars: 16, color: '#00e5ff' },
      { name: 'CHORUS', bars: 16, color: '#00ff94' },
      { name: 'VERSE', bars: 16, color: '#00e5ff' },
      { name: 'CHORUS', bars: 16, color: '#00ff94' },
      { name: 'BRIDGE', bars: 8, color: '#7c3aed' },
      { name: 'CHORUS', bars: 16, color: '#00ff94' },
      { name: 'OUTRO', bars: 8, color: '#444' },
    ];

    return structures[genre] || defaultStructure;
  }

  /**
   * Generate drum pattern based on genre
   */
  private generateDrumPattern(): void {
    const genre = this.currentGenre;

    // Clear drum tracks (0-3: Kick, Snare, Clap, HiHat)
    for (let t = 0; t < 4; t++) {
      for (let s = 0; s < 32; s++) {
        this.sequencerData[t][s] = 0;
      }
    }

    // Genre-specific patterns
    switch (genre) {
      case 'TECHNO':
      case 'HOUSE':
      case 'TRANCE':
        // Four-on-the-floor kick
        for (let s = 0; s < 32; s += 4) {
          this.sequencerData[0][s] = 1;
        }
        // Snare on 2 and 4
        for (let s = 4; s < 32; s += 8) {
          this.sequencerData[1][s] = 1;
        }
        // HiHat on off-beats
        for (let s = 2; s < 32; s += 4) {
          this.sequencerData[3][s] = 1;
        }
        break;

      case 'TRAP':
      case 'DUBSTEP':
      case 'PHONK':
      case 'DRIFTPHONK':
      case 'DARKPHONK':
        // Trap-style kick pattern
        this.sequencerData[0][0] = 1;
        this.sequencerData[0][6] = 1;
        this.sequencerData[0][12] = 1;
        this.sequencerData[0][20] = 1;
        this.sequencerData[0][28] = 1;
        // Snare on 3
        this.sequencerData[1][8] = 1;
        this.sequencerData[1][24] = 1;
        // Rapid hi-hats
        for (let s = 16; s < 32; s++) {
          if (Math.random() > 0.3) this.sequencerData[3][s] = 1;
        }
        break;

      case 'DNB':
        // D&B breakbeat pattern
        this.sequencerData[0][0] = 1;
        this.sequencerData[0][10] = 1;
        this.sequencerData[0][16] = 1;
        this.sequencerData[0][24] = 1;
        this.sequencerData[1][4] = 1;
        this.sequencerData[1][20] = 1;
        break;

      case 'LOFI':
      case 'AMBIENT':
      case 'ETHEREAL':
        // Laid-back pattern
        this.sequencerData[0][0] = 1;
        this.sequencerData[0][16] = 1;
        this.sequencerData[1][8] = 1;
        this.sequencerData[1][24] = 1;
        for (let s = 4; s < 32; s += 8) {
          this.sequencerData[3][s] = Math.random() > 0.5 ? 1 : 0;
        }
        break;

      default:
        // Standard EDM pattern - SYNTHWAVE, etc.
        // Kick on 1, 5, 9, etc (every quarter note)
        for (let s = 0; s < 32; s += 4) {
          this.sequencerData[0][s] = 1;
        }
        // Snare on 2 and 4 (every 8 steps starting at 4)
        for (let s = 4; s < 32; s += 8) {
          this.sequencerData[1][s] = 1;
        }
        // HiHat on off-beats (2, 6, 10, etc.) - not every beat
        for (let s = 2; s < 32; s += 4) {
          this.sequencerData[3][s] = 1;
        }
    }
  }

  /**
   * Generate bass pattern - sparse and groovy
   */
  private generateBassPattern(): void {
    // Track 4 = Bass
    for (let s = 0; s < 32; s++) {
      this.sequencerData[4][s] = 0;
    }

    const genre = this.currentGenre;

    // Genre-specific bass patterns
    switch (genre) {
      case 'TECHNO':
      case 'HOUSE':
      case 'TRANCE':
        // Four-on-the-floor bass
        for (let s = 0; s < 32; s += 8) {
          this.sequencerData[4][s] = 1;
        }
        break;

      case 'DNB':
        // D&B Reese bass - sparse
        this.sequencerData[4][0] = 1;
        this.sequencerData[4][16] = 1;
        break;

      case 'TRAP':
      case 'DUBSTEP':
        // Heavy bass on drop
        this.sequencerData[4][0] = 1;
        this.sequencerData[4][4] = 1;
        this.sequencerData[4][12] = 1;
        this.sequencerData[4][16] = 1;
        this.sequencerData[4][20] = 1;
        break;

      case 'AMBIENT':
      case 'ETHEREAL':
      case 'LOFI':
        // Very sparse - drone style
        this.sequencerData[4][0] = 1;
        this.sequencerData[4][16] = 1;
        break;

      default:
        // Standard bass - every 8 steps
        for (let s = 0; s < 32; s += 8) {
          this.sequencerData[4][s] = 1;
        }
        // Add slight variation
        if (Math.random() > 0.5) {
          this.sequencerData[4][12] = 1;
        }
    }
  }

  /**
   * Generate melody pattern - sparse and musical
   */
  private generateMelodyPattern(): void {
    // Track 5 = Lead/Arp
    for (let s = 0; s < 32; s++) {
      this.sequencerData[5][s] = 0;
    }

    // Genre-specific melody patterns
    const genre = this.currentGenre;

    if (GENRES[genre]?.arpLead) {
      // Fast arpeggio style - but still sparse
      for (let s = 0; s < 32; s += 4) {
        // Only 1 in 4 steps on average
        if (Math.random() > 0.6) {
          this.sequencerData[5][s] = 1;
          // Sometimes add a second note
          if (Math.random() > 0.7) {
            this.sequencerData[5][s + 2] = 1;
          }
        }
      }
    } else {
      // Melodic style - even sparser
      // Add notes mainly on strong beats with some variation
      const strongBeats = [0, 8, 16, 24];
      strongBeats.forEach(beat => {
        if (Math.random() > 0.3) {
          this.sequencerData[5][beat] = 1;
        }
      });
      // Add a few off-beat embellishments
      for (let i = 0; i < 4; i++) {
        const pos = Math.floor(Math.random() * 32);
        if (this.sequencerData[5][pos] === 0) {
          this.sequencerData[5][pos] = 1;
        }
      }
    }
  }

  /**
   * Generate chord/pad pattern - atmospheric and sparse
   */
  private generateChordPattern(): void {
    // Track 6 = Pad/Chord
    for (let s = 0; s < 32; s++) {
      this.sequencerData[6][s] = 0;
    }

    const genre = this.currentGenre;

    switch (genre) {
      case 'AMBIENT':
      case 'ETHEREAL':
      case 'CINEMATIC':
        // Long pads - only 2 chord changes per 32 steps
        this.sequencerData[6][0] = 1;
        this.sequencerData[6][16] = 1;
        break;

      case 'TECHNO':
      case 'HOUSE':
      case 'TRANCE':
        // Stabs on bar starts
        this.sequencerData[6][0] = 1;
        this.sequencerData[6][16] = 1;
        break;

      case 'DNB':
        // Very sparse - atmospheric
        if (Math.random() > 0.5) {
          this.sequencerData[6][0] = 1;
        }
        break;

      case 'LOFI':
        // Lo-fi chords - bar starts, sometimes skip
        this.sequencerData[6][0] = Math.random() > 0.3 ? 1 : 0;
        this.sequencerData[6][8] = Math.random() > 0.5 ? 1 : 0;
        this.sequencerData[6][16] = Math.random() > 0.3 ? 1 : 0;
        this.sequencerData[6][24] = Math.random() > 0.5 ? 1 : 0;
        break;

      default:
        // Standard - chord on bar starts
        this.sequencerData[6][0] = 1;
        this.sequencerData[6][16] = 1;
    }
  }

  /**
   * Update sequencer data for playback (sync to NexusUI)
   */
  private updateWindowSequencerData(): void {
    // SYNC: Update NexusUI sequencer data (this is where playback reads from)
    setSequencerData(this.sequencerData);

    // Also update window.seq for legacy compatibility
    const win = window as any;
    if (win.seq && win.seq.data) {
      for (let t = 0; t < 7; t++) {
        for (let s = 0; s < 32; s++) {
          win.seq.data[t][s] = this.sequencerData[t][s];
        }
      }
    }
    log.debug(' Sequencer data synced');
  }

  /**
   * Generate drums only
   */
  async generateDrumsOnly(): Promise<void> {
    aiProgressDialog.show(AISteps.drumsOnly);

    try {
      for (let i = 1; i <= 3; i++) {
        if (aiProgressDialog.cancelled) return;

        aiProgressDialog.updateProgress(i);
        aiProgressDialog.setStatus(`Generating drum pattern...`);
        await this.sleep(300);
      }

      // Generate drums
      this.generateDrumPattern();
      this.refreshGridUI();
      this.updateWindowSequencerData();

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
   * Mutate sound design - randomize synth parameters
   */
  mutateSoundDesign(): void {
    log.debug(' Mutating sound design...');

    // Get audio engine effects and mutate them
    const effects = this.audioEngine?.getEffects();
    if (!effects) return;

    // Randomize filter
    if (effects.filter) {
      const newFreq = 1000 + Math.random() * 15000;
      effects.filter.frequency.value = newFreq;
      log.debug(' Filter freq:', newFreq);
    }

    // Randomize reverb
    if (effects.reverb) {
      const newReverb = 0.1 + Math.random() * 0.5;
      effects.reverb.wet.value = newReverb;
      log.debug(' Reverb wet:', newReverb);
    }

    // Randomize delay
    if (effects.delay) {
      const newDelay = Math.random() * 0.4;
      effects.delay.wet.value = newDelay;
      const newFeedback = 0.1 + Math.random() * 0.5;
      effects.delay.feedback.value = newFeedback;
      log.debug(' Delay wet:', newDelay, 'feedback:', newFeedback);
    }

    // Randomize stereo width
    if (effects.stereoWidener) {
      const newWidth = 0.3 + Math.random() * 0.7;
      effects.stereoWidener.width.value = newWidth;
      log.debug(' Stereo width:', newWidth);
    }

    // Randomize presence EQ
    if (effects.presenceEQ) {
      const newPresence = -3 + Math.random() * 6;
      effects.presenceEQ.gain.value = newPresence;
      log.debug(' Presence:', newPresence);
    }

    // Reinitialize synths with new random parameters
    const win = window as any;
    if (win.reinitSynths) {
      // Set a random kit for synth params
      const kits = ['NEON', 'GLITCH', 'ACID', 'VINYL', 'CLUB', 'CHIPTUNE', 'INDUSTRIAL', 'ETHEREAL', 'PHONK', 'DUNGEON'] as const;
      const randomKit = kits[Math.floor(Math.random() * kits.length)];
      this.audioEngine?.loadKit(randomKit as KitType);
      win.reinitSynths();
      log.debug(' Random kit:', randomKit);
    }

    errorHandler.showSuccess('🧬 SOUND MUTATION APPLIED');
  }

  /**
   * Clear grid
   */
  clear(): void {
    const oldData = this.sequencerData.map(track => [...track]);
    this.sequencerData = this.getEmptyBank();

    // SYNC: Clear NexusUI data
    clearSequencerData();

    // Update grid UI
    this.refreshGridUI();

    this.saveState();

    // Add to undo stack
    const command = CommandFactory.clearGrid(oldData, (newData: number[][]) => {
      this.sequencerData = newData;
      setSequencerData(newData);
      this.refreshGridUI();
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

  /**
   * Cleanup all resources on shutdown
   */
  dispose(): void {
    loggers.system.info('Disposing NEXUS-X system...');

    // Stop sequencer if running
    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop();
      stopSequencer();
    }

    // Dispose audio engine
    this.audioEngine?.dispose();

    // Dispose UI (Tone.js synths, event listeners, etc.)
    disposeNexusUI();

    loggers.system.info('NEXUS-X disposed successfully');
  }
}

// Initialize system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    const system = new NexusSystem();
    (window as any).nexusSystem = system;
    await system.initialize();
  });
} else {
  const system = new NexusSystem();
  (window as any).nexusSystem = system;
  system.initialize();
}

// Cleanup on page unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
  const system = (window as any).nexusSystem as NexusSystem | undefined;
  system?.dispose();
});

// Export for module usage
export { NexusSystem };
export type { Config, GenreConfig, ScaleType, KitType, StoredState, ValidationResult };
