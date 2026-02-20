/**
 * NEURAL DREAM - AI-Assisted Melodic Transformation
 * Intelligent pattern mutation using Magenta MusicRNN
 */

import * as mm from '@magenta/music';
import { errorHandler } from './ErrorHandler.js';
import { undoRedoManager, CommandFactory } from './UndoRedoManager.js';

export class NeuralDream {
  private static instance: NeuralDream;
  private musicRNN: mm.MusicRNN | null = null;
  private isReady = false;
  private isDreaming = false;

  private constructor() {
    this.initializeModel();
    this.initializeUI();
  }

  static getInstance(): NeuralDream {
    if (!NeuralDream.instance) {
      NeuralDream.instance = new NeuralDream();
    }
    return NeuralDream.instance;
  }

  /**
   * Initialize Magenta MusicRNN model
   */
  private async initializeModel(): Promise<void> {
    try {
      // Initialize Magenta MusicRNN for melodic sequences
      this.musicRNN = new mm.MusicRNN(
        'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn'
      );
      await this.musicRNN.initialize();
      this.isReady = true;
      console.log('NEURAL DREAM: Model loaded successfully');
    } catch (error) {
      errorHandler.handleError({
        code: 'MAGENTA_INIT_FAILED',
        message: 'Failed to initialize Neural Dream model',
        details: error,
        recoverable: true
      });
    }
  }

  /**
   * Transform a track pattern using AI
   */
  async dreamTransform(trackIndex: number, intensity: number = 0.5): Promise<void> {
    if (!this.isReady || !this.musicRNN || this.isDreaming) {
      errorHandler.showInfo(this.isReady ? 'Dream in progress...' : 'Model not ready');
      return;
    }

    if (!window.seq || !window.seq.data) {
      errorHandler.showInfo('No sequencer data available');
      return;
    }

    this.isDreaming = true;
    this.showDreamDialog(true, `Dreaming track ${trackIndex + 1}...`);

    try {
      // Get current pattern
      const originalPattern = [...window.seq.data[trackIndex]];

      // Convert to Magenta note sequence
      const noteSequence = this.patternToNoteSequence(originalPattern, trackIndex);

      // Generate continuation
      const temperature = 0.5 + (intensity * 0.8); // 0.5 to 1.3
      const continuation = await this.musicRNN.continueSequence(noteSequence, 32, temperature);

      // Convert back to pattern
      const newPattern = this.noteSequenceToPattern(continuation, trackIndex);

      // Show preview diff
      await this.showPreviewDiff(originalPattern, newPattern, trackIndex);

      // Apply transformation with undo support
      this.applyDreamTransformation(trackIndex, originalPattern, newPattern);

      this.showDreamDialog(false);
    } catch (error) {
      errorHandler.handleError({
        code: 'GENERATION_FAILED',
        message: 'Neural Dream transformation failed',
        details: error,
        recoverable: true
      });
      this.showDreamDialog(false);
    } finally {
      this.isDreaming = false;
    }
  }

  /**
   * Dream transform entire pattern set
   */
  async dreamAllTracks(intensity: number = 0.5): Promise<void> {
    if (!this.isReady || !this.musicRNN || this.isDreaming) {
      errorHandler.showInfo(this.isReady ? 'Dream in progress...' : 'Model not ready');
      return;
    }

    this.isDreaming = true;
    this.showDreamDialog(true, 'Dreaming all tracks...');

    try {
      // Transform tracks sequentially with visual feedback
      for (let i = 0; i < 7; i++) {
        await this.sleep(300); // Small delay between tracks
        this.showDreamDialog(true, `Dreaming track ${i + 1}...`);

        const originalPattern = [...window.seq.data[i]];
        const noteSequence = this.patternToNoteSequence(originalPattern, i);
        const continuation = await this.musicRNN.continueSequence(
          noteSequence,
          32,
          0.5 + (intensity * 0.8)
        );
        const newPattern = this.noteSequenceToPattern(continuation, i);

        this.applyDreamTransformation(i, originalPattern, newPattern);
      }

      errorHandler.showSuccess('✨ NEURAL DREAM COMPLETE');
      this.showDreamDialog(false);
    } catch (error) {
      errorHandler.handleError({
        code: 'GENERATION_FAILED',
        message: 'Neural Dream transformation failed',
        details: error,
        recoverable: true
      });
      this.showDreamDialog(false);
    } finally {
      this.isDreaming = false;
    }
  }

  /**
   * Convert sequencer pattern to Magenta note sequence
   */
  private patternToNoteSequence(pattern: number[], trackIndex: number): mm.NoteSequence {
    const notes: mm.NoteSequence.Note[] = [];
    const stepDuration = 0.25; // 16th note

    pattern.forEach((value, step) => {
      if (value > 0) {
        // Map track index to MIDI pitch
        const basePitch = 60; // Middle C
        const pitch = basePitch + (trackIndex * 2) + (value * 2);

        notes.push({
          pitch: pitch,
          startTime: step * stepDuration,
          endTime: (step + (value === 3 ? 0.333 : 0.5)) * stepDuration, // Shorter for ghost notes
          velocity: value === 2 ? 0.5 : 0.8 // Softer for accent notes
        });
      }
    });

    return {
      notes: notes,
      totalTime: 32 * stepDuration,
      timeSignatures: [{ time: 0, numerator: 4, denominator: 4 }],
      tempos: [{ time: 0, qpm: 120 }]
    };
  }

  /**
   * Convert Magenta note sequence back to sequencer pattern
   */
  private noteSequenceToPattern(noteSequence: mm.NoteSequence, trackIndex: number): number[] {
    const pattern = Array(32).fill(0);
    const stepDuration = 0.25;
    const basePitch = 60;

    noteSequence.notes.forEach(note => {
      const step = Math.floor(note.startTime / stepDuration);
      if (step >= 0 && step < 32) {
        // Calculate note type based on velocity and duration
        const velocity = note.velocity || 0.8;
        const duration = note.endTime - note.startTime;

        if (velocity < 0.6) {
          pattern[step] = 2; // Accent (softer)
        } else if (duration < stepDuration * 0.5) {
          pattern[step] = 3; // Ghost note (very short)
        } else {
          pattern[step] = 1; // Normal note
        }
      }
    });

    return pattern;
  }

  /**
   * Apply dream transformation with undo support
   */
  private applyDreamTransformation(trackIndex: number, oldPattern: number[], newPattern: number[]): void {
    const command = CommandFactory.mutation(trackIndex, oldPattern, newPattern, (idx, data) => {
      window.seq.data[idx] = [...data];
      window.ui.refreshGrid();
      window.sys.autoSave();
    });

    undoRedoManager.execute(command);
  }

  /**
   * Show preview diff of transformation
   */
  private async showPreviewDiff(oldPattern: number[], newPattern: number[], trackIndex: number): Promise<void> {
    return new Promise((resolve) => {
      // Create overlay showing changes
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); z-index: 4000;
        display: flex; align-items: center; justify-content: center;
        font-family: 'JetBrains Mono', monospace;
      `;

      const content = document.createElement('div');
      content.style.cssText = `
        background: #111; padding: 30px; border-radius: 10px;
        border: 2px solid var(--primary); max-width: 90%;
      `;

      content.innerHTML = `
        <div style="color: var(--primary); font-size: 18px; margin-bottom: 20px; text-align: center;">
          🧠 NEURAL DREAM PREVIEW
        </div>
        <div style="color: #888; margin-bottom: 15px; font-size: 12px;">Track ${trackIndex + 1} Transformation</div>
        <div style="display: grid; grid-template-columns: 32px 1fr; gap: 10px; margin-bottom: 20px;">
          <div style="color: var(--flux); font-size: 10px; font-weight: 700;">OLD</div>
          <div style="display: grid; grid-template-columns: repeat(32, 1fr); gap: 2px;">
            ${oldPattern.map(v => `<div style="background: ${v > 0 ? 'var(--flux)' : '#333'}; height: 10px;"></div>`).join('')}
          </div>
          <div style="color: var(--primary); font-size: 10px; font-weight: 700;">NEW</div>
          <div style="display: grid; grid-template-columns: repeat(32, 1fr); gap: 2px;">
            ${newPattern.map((v, i) => {
              const changed = v !== oldPattern[i];
              const color = changed ? 'var(--primary)' : (v > 0 ? '#333' : '#222');
              return `<div style="background: ${color}; height: 10px; ${changed ? 'box-shadow: 0 0 5px var(--primary);' : ''}"></div>`;
            }).join('')}
          </div>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button id="acceptDream" class="btn" style="background: var(--primary); color: #000;">✓ ACCEPT</button>
          <button id="rejectDream" class="btn" style="background: var(--flux);">✗ REJECT</button>
        </div>
      `;

      overlay.appendChild(content);
      document.body.appendChild(overlay);

      // Event listeners
      document.getElementById('acceptDream')?.addEventListener('click', () => {
        overlay.remove();
        resolve();
      });

      document.getElementById('rejectDream')?.addEventListener('click', () => {
        overlay.remove();
        // Revert changes
        window.seq.data[trackIndex] = [...oldPattern];
        window.ui.refreshGrid();
        resolve();
      });

      // Auto-accept after 3 seconds
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          overlay.remove();
          resolve();
        }
      }, 3000);
    });
  }

  /**
   * Show/hide dream progress dialog
   */
  private showDreamDialog(show: boolean, message: string = 'Dreaming...'): void {
    const dialog = document.getElementById('neuralDreamDialog');

    if (!dialog) {
      if (!show) return;

      // Create dialog
      const newDialog = document.createElement('dialog');
      newDialog.id = 'neuralDreamDialog';
      newDialog.style.cssText = `
        background: radial-gradient(circle at center, rgba(17,17,17,0.95) 0%, rgba(0,0,0,0.98) 100%);
        color: #fff; border: 2px solid var(--magenta);
        padding: 40px; border-radius: 10px; min-width: 300px;
      `;
      newDialog.innerHTML = `
        <div class="loader-ring" style="border-top-color: var(--magenta);"></div>
        <div style="font-size: 20px; font-weight: 800; margin-bottom: 10px; color: var(--magenta);">NEURAL DREAM</div>
        <div id="dreamMessage" style="color: #888; font-size: 12px; text-align: center;">${message}</div>
      `;
      document.body.appendChild(newDialog);
      newDialog.showModal();
    } else {
      if (show) {
        const msg = document.getElementById('dreamMessage');
        if (msg) msg.innerText = message;
        dialog.showModal();
      } else {
        dialog.close();
      }
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if model is ready
   */
  get isModelReady(): boolean {
    return this.isReady;
  }

  /**
   * Check if currently dreaming
   */
  get isTransforming(): boolean {
    return this.isDreaming;
  }

  /**
   * Initialize UI for Neural Dream
   */
  private initializeUI(): void {
    // Add Neural Dream button to sidebar
    const actionGrid = document.querySelector('.action-grid');
    if (!actionGrid) return;

    const dreamBtn = document.createElement('button');
    dreamBtn.className = 'action-btn';
    dreamBtn.style.cssText = `
      background: linear-gradient(45deg, var(--magenta), var(--accent));
      border: none; grid-column: span 2; font-weight: 800;
    `;
    dreamBtn.innerHTML = '🧠 NEURAL DREAM';
    dreamBtn.onclick = () => this.dreamAllTracks(0.7);

    // Add track-specific dream buttons
    const tracks = document.querySelectorAll('article.track');
    tracks.forEach((track, idx) => {
      const dreamTrackBtn = document.createElement('button');
      dreamTrackBtn.className = 'btn';
      dreamTrackBtn.style.cssText = `
        background: transparent; border: 1px solid var(--magenta);
        color: var(--magenta); padding: 2px 8px; font-size: 8px;
      `;
      dreamTrackBtn.innerHTML = '🧠';
      dreamTrackBtn.title = 'Dream this track';
      dreamTrackBtn.onclick = () => this.dreamTransform(idx, 0.5);

      // Add to track controls
      const controls = track.querySelector('.track-controls');
      if (controls) {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display: flex; gap: 4px; margin-top: 5px;';
        wrapper.appendChild(dreamTrackBtn);
        controls.appendChild(wrapper);
      }
    });

    actionGrid.parentNode?.insertBefore(dreamBtn, actionGrid.nextSibling);
  }
}

export const neuralDream = NeuralDream.getInstance();
