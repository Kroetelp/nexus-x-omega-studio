/**
 * PERFORMANCE RECORDER - Full State Capture System
 * Record and replay your entire performance with millisecond precision
 */

import * as Tone from 'tone';
import type { PerformanceEvent, PerformanceRecording } from '../types/index.js';
import { errorHandler } from './ErrorHandler.js';

export class PerformanceRecorder {
  private static instance: PerformanceRecorder;
  private isRecording = false;
  private isPlaying = false;
  private events: PerformanceEvent[] = [];
  private startTime: number = 0;
  private currentRecording: PerformanceRecording | null = null;
  private recordings: PerformanceRecording[] = [];
  private playTimeouts: ReturnType<typeof setTimeout>[] = [];
  private ghostModeActive = false;
  private ghostOverlay: HTMLElement | null = null;

  private constructor() {
    this.initializeUI();
    this.setupEventListeners();
  }

  static getInstance(): PerformanceRecorder {
    if (!PerformanceRecorder.instance) {
      PerformanceRecorder.instance = new PerformanceRecorder();
    }
    return PerformanceRecorder.instance;
  }

  /**
   * Start recording performance
   */
  startRecording(name: string = `Performance ${this.recordings.length + 1}`): void {
    if (this.isRecording) {
      errorHandler.showInfo('Already recording');
      return;
    }

    this.isRecording = true;
    this.events = [];
    this.startTime = Date.now();

    // Capture initial state
    this.captureInitialState();

    // Update UI
    this.updateRecordingUI(true);
    errorHandler.showSuccess('🔴 RECORDING PERFORMANCE');
  }

  /**
   * Stop recording and save
   */
  stopRecording(): void {
    if (!this.isRecording) return;

    this.isRecording = false;

    // Save recording
    this.currentRecording = {
      id: `rec-${Date.now()}`,
      name: `Performance ${this.recordings.length + 1}`,
      startTime: this.startTime,
      endTime: Date.now(),
      events: [...this.events],
      finalState: this.captureCurrentState()
    };

    this.recordings.push(this.currentRecording);

    // Update UI
    this.updateRecordingUI(false);
    this.updateRecordingsList();
    errorHandler.showSuccess(`✅ RECORDING SAVED (${this.events.length} events)`);
  }

  /**
   * Record an event
   */
  recordEvent(type: PerformanceEvent['type'], data: any): void {
    if (!this.isRecording) return;

    this.events.push({
      type,
      timestamp: Date.now() - this.startTime,
      data
    });
  }

  /**
   * Play back a recording
   */
  async playRecording(recordingId: string): Promise<void> {
    const recording = this.recordings.find(r => r.id === recordingId);
    if (!recording) {
      errorHandler.showInfo('Recording not found');
      return;
    }

    if (this.isPlaying) {
      this.stopPlayback();
    }

    this.isPlaying = true;
    this.updatePlaybackUI(true);
    errorHandler.showSuccess('▶️ PLAYING PERFORMANCE');

    // Clear current state
    await this.clearCurrentState();

    // Schedule events
    recording.events.forEach(event => {
      const timeout = setTimeout(() => {
        this.replayEvent(event);
      }, event.timestamp);

      this.playTimeouts.push(timeout);
    });

    // Schedule end
    const duration = recording.endTime - recording.startTime;
    const endTimeout = setTimeout(() => {
      this.stopPlayback();
      errorHandler.showSuccess('✅ PLAYBACK COMPLETE');
    }, duration);

    this.playTimeouts.push(endTimeout);
  }

  /**
   * Stop playback
   */
  stopPlayback(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;

    // Clear all timeouts
    this.playTimeouts.forEach(timeout => clearTimeout(timeout));
    this.playTimeouts = [];

    this.updatePlaybackUI(false);
  }

  /**
   * Replay a single event
   */
  private replayEvent(event: PerformanceEvent): void {
    switch (event.type) {
      case 'trigger':
        this.replayTrigger(event.data as { trackIndex: number; stepIndex: number; value: number });
        break;

      case 'parameter':
        this.replayParameter(event.data as { parameter: string; value: number });
        break;

      case 'transport':
        this.replayTransport(event.data as { action: string });
        break;

      case 'snapshot':
        this.replaySnapshot(event.data as { index: number });
        break;

      case 'mutation':
        this.replayMutation(event.data as { trackIndex: number; pattern: number[] });
        break;
    }
  }

  private replayTrigger(data: { trackIndex: number; stepIndex: number; value: number }): void {
    if (!window.engine?.trigger) return;

    const time = Tone.now();
    window.engine.trigger(data.trackIndex, time, data.value, data.stepIndex);

    // Visual feedback
    const label = document.getElementById(`label-${data.trackIndex}`);
    if (label) {
      label.style.color = '#fff';
      setTimeout(() => {
        label.style.color = '';
      }, 100);
    }
  }

  private replayParameter(data: { parameter: string; value: number }): void {
    const effects = window.engine?.getEffects?.() as Record<string, unknown> | undefined;
    if (!effects) return;

    // Helper to safely set nested value
    const setNested = (obj: unknown, prop: string, value: number): boolean => {
      if (obj && typeof obj === 'object' && prop in obj) {
        const o = obj as Record<string, unknown>;
        if (o[prop] && typeof o[prop] === 'object') {
          const p = o[prop] as Record<string, unknown>;
          if ('value' in p && typeof p.value === 'number') {
            p.value = value;
            return true;
          }
        }
      }
      return false;
    };

    // Apply parameter change
    switch (data.parameter) {
      case 'eqLow':
        setNested(effects.eq3, 'low', data.value);
        break;
      case 'eqMid':
        setNested(effects.eq3, 'mid', data.value);
        break;
      case 'eqHigh':
        setNested(effects.eq3, 'high', data.value);
        break;
      case 'reverbWet':
        setNested(effects.reverb, 'wet', data.value);
        break;
      case 'delayWet':
        setNested(effects.delay, 'wet', data.value);
        break;
      case 'masterPitch':
        if (effects.masterPitch && typeof effects.masterPitch === 'object') {
          (effects.masterPitch as Record<string, unknown>).pitch = data.value;
        }
        break;
      case 'stereoWidth':
        setNested(effects.stereoWidener, 'width', data.value);
        break;
    }
  }

  private replayTransport(data: { action: string }): void {
    if (data.action === 'play' && window.sys?.play) {
      window.sys.play();
    } else if (data.action === 'stop' && window.sys?.stop) {
      window.sys.stop();
    }
  }

  private replaySnapshot(data: { index: number }): void {
    if (typeof window.sys?.loadSnap === 'function') {
      window.sys.loadSnap(data.index);
    }
  }

  private replayMutation(data: { trackIndex: number; pattern: number[] }): void {
    if (!window.seq?.data) return;

    window.seq.data[data.trackIndex] = [...data.pattern];
    if (typeof window.ui?.refreshGrid === 'function') {
      window.ui.refreshGrid();
    }
  }

  /**
   * Toggle ghost mode (play alongside recording)
   */
  toggleGhostMode(recordingId: string): void {
    if (this.ghostModeActive) {
      this.stopGhostMode();
    } else {
      this.startGhostMode(recordingId);
    }
  }

  /**
   * Start ghost mode - play recording in background
   */
  private startGhostMode(recordingId: string): void {
    const recording = this.recordings.find(r => r.id === recordingId);
    if (!recording) return;

    this.ghostModeActive = true;
    this.createGhostOverlay();

    // Schedule ghost events
    recording.events.forEach(event => {
      setTimeout(() => {
        if (!this.ghostModeActive) return;

        // Show ghost indicator
        this.showGhostIndicator(event);

        // Replay event silently (no audio, just visual)
        this.replayEventGhost(event);
      }, event.timestamp);
    });

    errorHandler.showSuccess('👻 GHOST MODE ACTIVE - Play along!');
  }

  /**
   * Stop ghost mode
   */
  private stopGhostMode(): void {
    this.ghostModeActive = false;

    if (this.ghostOverlay) {
      this.ghostOverlay.remove();
      this.ghostOverlay = null;
    }

    errorHandler.showInfo('👻 Ghost mode disabled');
  }

  /**
   * Create ghost overlay UI
   */
  private createGhostOverlay(): void {
    this.ghostOverlay = document.createElement('div');
    this.ghostOverlay.id = 'ghostOverlay';
    this.ghostOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none; z-index: 500;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, transparent 100%);
    `;

    const indicator = document.createElement('div');
    indicator.id = 'ghostIndicator';
    indicator.style.cssText = `
      position: fixed; top: 60px; right: 20px;
      background: rgba(124, 58, 237, 0.9); color: #fff;
      padding: 10px 20px; border-radius: 20px;
      font-size: 12px; font-weight: 700;
      box-shadow: 0 0 20px rgba(124, 58, 237, 0.5);
      animation: pulse 2s infinite;
    `;
    indicator.innerHTML = '👻 GHOST MODE';

    this.ghostOverlay.appendChild(indicator);
    document.body.appendChild(this.ghostOverlay);

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(0.95); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Show ghost indicator for event
   */
  private showGhostIndicator(event: PerformanceEvent): void {
    if (!this.ghostOverlay) return;

    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: absolute;
      background: rgba(124, 58, 237, 0.5);
      border: 2px solid var(--accent);
      border-radius: 50%;
      pointer-events: none;
      animation: ghostFade 0.5s forwards;
    `;

    // Position based on event type
    if (event.type === 'trigger') {
      const triggerData = event.data as { trackIndex: number };
      const track = document.getElementById(`track-${triggerData.trackIndex}`);
      if (track) {
        const rect = track.getBoundingClientRect();
        indicator.style.left = `${rect.left + 50}px`;
        indicator.style.top = `${rect.top + rect.height / 2}px`;
        indicator.style.width = '40px';
        indicator.style.height = '40px';
      }
    }

    this.ghostOverlay.appendChild(indicator);

    // Remove after animation
    setTimeout(() => indicator.remove(), 500);
  }

  /**
   * Replay event in ghost mode (visual only)
   */
  private replayEventGhost(event: PerformanceEvent): void {
    switch (event.type) {
      case 'trigger':
        // Visual only - no audio
        const triggerData = event.data as { trackIndex: number };
        const label = document.getElementById(`label-${triggerData.trackIndex}`);
        if (label) {
          label.style.color = 'var(--accent)';
          label.style.textShadow = '0 0 10px var(--accent)';
          setTimeout(() => {
            label.style.color = '';
            label.style.textShadow = '';
          }, 200);
        }
        break;
    }
  }

  /**
   * Capture initial state
   */
  private captureInitialState(): void {
    if (!window.seq) return;

    this.recordEvent('snapshot', {
      index: -1,
      data: JSON.parse(JSON.stringify(window.seq?.data ?? []))
    });
  }

  /**
   * Capture current state
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private captureCurrentState(): any {
    if (!window.seq || !window.engine) return {};

    return {
      sequencer: JSON.parse(JSON.stringify(window.seq.data)),
      parameters: this.captureParameters()
    };
  }

  /**
   * Capture current parameters
   */
  private captureParameters(): Record<string, number> {
    const effects = window.engine?.getEffects?.() as Record<string, unknown> | undefined;
    if (!effects) return {};

    // Helper to safely get nested value
    const getNested = (obj: unknown, ...props: string[]): number => {
      let current: unknown = obj;
      for (const prop of props) {
        if (current && typeof current === 'object' && prop in current) {
          current = (current as Record<string, unknown>)[prop];
        } else {
          return 0;
        }
      }
      return typeof current === 'number' ? current : 0;
    };

    return {
      eqLow: getNested(effects.eq3, 'low', 'value'),
      eqMid: getNested(effects.eq3, 'mid', 'value'),
      eqHigh: getNested(effects.eq3, 'high', 'value'),
      reverbWet: getNested(effects.reverb, 'wet', 'value'),
      delayWet: getNested(effects.delay, 'wet', 'value'),
      masterPitch: getNested(effects.masterPitch, 'pitch'),
      stereoWidth: getNested(effects.stereoWidener, 'width', 'value')
    };
  }

  /**
   * Clear current state
   */
  private async clearCurrentState(): Promise<void> {
    if (!window.seq) return;

    // Clear sequencer
    window.seq.data.forEach(track => track.fill(0));
    if (typeof window.ui?.refreshGrid === 'function') {
      window.ui.refreshGrid();
    }
  }

  /**
   * Initialize UI
   */
  private initializeUI(): void {
    // Add performance recorder panel
    const sidebar = document.querySelector('aside.deck');
    if (!sidebar) return;

    const panel = document.createElement('div');
    panel.className = 'module';
    panel.innerHTML = `
      <div class="mod-title">PERFORMANCE RECORDER <span>REC</span></div>
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <button id="perfRecordBtn" class="btn" style="flex: 1;">⏺ RECORD</button>
        <button id="perfStopBtn" class="btn" style="flex: 1; display: none;">⏹ STOP</button>
      </div>
      <div id="perfRecordingsList" style="max-height: 200px; overflow-y: auto;">
        <div style="text-align: center; color: #666; font-size: 10px; padding: 20px;">
          No recordings yet.<br>Click RECORD to capture your performance.
        </div>
      </div>
    `;

    sidebar.appendChild(panel);

    // Event listeners
    document.getElementById('perfRecordBtn')?.addEventListener('click', () => {
      this.startRecording();
      document.getElementById('perfRecordBtn')!.style.display = 'none';
      document.getElementById('perfStopBtn')!.style.display = 'block';
    });

    document.getElementById('perfStopBtn')?.addEventListener('click', () => {
      this.stopRecording();
      document.getElementById('perfRecordBtn')!.style.display = 'block';
      document.getElementById('perfStopBtn')!.style.display = 'none';
    });
  }

  /**
   * Setup event listeners for capturing performance
   */
  private setupEventListeners(): void {
    // Listen for note triggers
    document.addEventListener('sequencer:trigger', ((e: Event) => {
      this.recordEvent('trigger', (e as CustomEvent).detail);
    }) as EventListener);

    // Listen for parameter changes
    document.addEventListener('parameter:change', ((e: Event) => {
      this.recordEvent('parameter', (e as CustomEvent).detail);
    }) as EventListener);

    // Listen for transport changes
    document.addEventListener('transport:change', ((e: Event) => {
      this.recordEvent('transport', (e as CustomEvent).detail);
    }) as EventListener);

    // Listen for snapshot loads
    document.addEventListener('snapshot:load', ((e: Event) => {
      this.recordEvent('snapshot', (e as CustomEvent).detail);
    }) as EventListener);

    // Listen for mutations
    document.addEventListener('sequencer:mutation', ((e: Event) => {
      this.recordEvent('mutation', (e as CustomEvent).detail);
    }) as EventListener);
  }

  /**
   * Update recording UI
   */
  private updateRecordingUI(isRecording: boolean): void {
    const recordBtn = document.getElementById('perfRecordBtn');
    const stopBtn = document.getElementById('perfStopBtn');

    if (recordBtn) {
      recordBtn.className = isRecording ? 'btn btn-rec recording' : 'btn';
      recordBtn.innerHTML = isRecording ? '🔴 RECORDING' : '⏺ RECORD';
    }

    if (stopBtn) {
      stopBtn.className = isRecording ? 'btn' : 'btn';
      stopBtn.style.display = isRecording ? 'block' : 'none';
    }
  }

  /**
   * Update playback UI
   */
  private updatePlaybackUI(isPlaying: boolean): void {
    // Add visual indicator for playback
    const existingIndicator = document.getElementById('playbackIndicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    if (isPlaying) {
      const indicator = document.createElement('div');
      indicator.id = 'playbackIndicator';
      indicator.style.cssText = `
        position: fixed; top: 60px; left: 50%; transform: translateX(-50%);
        background: var(--primary); color: #000;
        padding: 8px 20px; border-radius: 20px;
        font-size: 11px; font-weight: 700;
        box-shadow: 0 0 20px var(--primary);
        z-index: 3000;
      `;
      indicator.innerHTML = '▶️ PLAYBACK';
      document.body.appendChild(indicator);
    }
  }

  /**
   * Update recordings list
   */
  private updateRecordingsList(): void {
    const list = document.getElementById('perfRecordingsList');
    if (!list) return;

    if (this.recordings.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; color: #666; font-size: 10px; padding: 20px;">
          No recordings yet.<br>Click RECORD to capture your performance.
        </div>
      `;
      return;
    }

    list.innerHTML = this.recordings.map(rec => {
      const duration = ((rec.endTime - rec.startTime) / 1000).toFixed(1);
      return `
        <div style="padding: 10px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; color: #fff; font-size: 11px;">${rec.name}</div>
            <div style="color: #666; font-size: 9px;">${duration}s • ${rec.events.length} events</div>
          </div>
          <div style="display: flex; gap: 5px;">
            <button class="action-btn" onclick="window.perfRecorder.playRecording('${rec.id}')">▶ PLAY</button>
            <button class="action-btn" onclick="window.perfRecorder.toggleGhostMode('${rec.id}')">👻 GHOST</button>
            <button class="action-btn" style="color: var(--flux);" onclick="window.perfRecorder.deleteRecording('${rec.id}')">🗑</button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Delete a recording
   */
  deleteRecording(recordingId: string): void {
    this.recordings = this.recordings.filter(r => r.id !== recordingId);
    this.updateRecordingsList();
    errorHandler.showInfo('Recording deleted');
  }

  /**
   * Export recording to file
   */
  exportRecording(recordingId: string): void {
    const recording = this.recordings.find(r => r.id === recordingId);
    if (!recording) return;

    const data = JSON.stringify(recording, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-performance-${recording.name.replace(/\s+/g, '-')}.json`;
    a.click();

    URL.revokeObjectURL(url);
    errorHandler.showSuccess('Recording exported');
  }

  /**
   * Import recording from file
   */
  async importRecording(file: File): Promise<void> {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as PerformanceRecording;

      // Validate structure
      if (!data.id || !data.events || !Array.isArray(data.events)) {
        throw new Error('Invalid recording format');
      }

      this.recordings.push(data);
      this.updateRecordingsList();
      errorHandler.showSuccess('Recording imported');
    } catch (error) {
      errorHandler.handleError({
        code: 'IMPORT_FAILED',
        message: 'Failed to import recording',
        details: error,
        recoverable: true
      });
    }
  }

  /**
   * Get all recordings
   */
  getRecordings(): PerformanceRecording[] {
    return [...this.recordings];
  }

  /**
   * Check if recording
   */
  get isRecordingActive(): boolean {
    return this.isRecording;
  }

  /**
   * Check if playing
   */
  get isPlayingActive(): boolean {
    return this.isPlaying;
  }
}

export const performanceRecorder = PerformanceRecorder.getInstance();
