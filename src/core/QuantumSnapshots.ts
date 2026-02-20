/**
 * QUANTUM SNAPSHOTS - Morphing State System
 * Advanced snapshot management with interpolation
 */

import type { Snapshot, MorphTarget, EasingFunction } from '../types/index.js';
import { errorHandler } from './ErrorHandler.js';
import * as Tone from 'tone';
import { interpolate, interpolateObject } from '../utils/easing.js';

export class QuantumSnapshots {
  private static instance: QuantumSnapshots;
  private snapshots: Snapshot[] = Array(8).fill(null);
  private maxSnapshots = 8;
  private activeMorph: MorphTarget | null = null;
  private morphAnimationId: number | null = null;

  private constructor() {
    this.initializeUI();
  }

  static getInstance(): QuantumSnapshots {
    if (!QuantumSnapshots.instance) {
      QuantumSnapshots.instance = new QuantumSnapshots();
    }
    return QuantumSnapshots.instance;
  }

  /**
   * Save a snapshot at the given index
   */
  saveSnapshot(index: number, sequencerData: number[][], parameters: Record<string, number>, effects: any): void {
    if (index < 0 || index >= this.maxSnapshots) {
      errorHandler.handleError({
        code: 'PARAMETER_OUT_OF_RANGE',
        message: `Invalid snapshot index: ${index}`,
        recoverable: true
      });
      return;
    }

    this.snapshots[index] = {
      id: `snap-${Date.now()}-${index}`,
      name: `Snapshot ${index + 1}`,
      timestamp: Date.now(),
      data: {
        sequencer: sequencerData,
        parameters: parameters,
        effects: effects
      }
    };

    this.updateSnapshotUI(index, true);
    errorHandler.showSuccess(`SNAP ${index + 1} SAVED`);
  }

  /**
   * Load a snapshot at the given index
   */
  loadSnapshot(index: number): Snapshot | null {
    if (index < 0 || index >= this.maxSnapshots || !this.snapshots[index]) {
      errorHandler.showInfo(`No snapshot saved at position ${index + 1}`);
      return null;
    }

    this.updateSnapshotUI(index, false);
    errorHandler.showSuccess(`SNAP ${index + 1} LOADED`);
    return this.snapshots[index];
  }

  /**
   * Morph between two snapshots
   */
  morph(fromIndex: number, toIndex: number, duration: number, easing: EasingFunction = 'easeInOutExpo'): void {
    if (!this.snapshots[fromIndex] || !this.snapshots[toIndex]) {
      errorHandler.handleError({
        code: 'PARAMETER_OUT_OF_RANGE',
        message: 'Cannot morph: one or both snapshots are empty',
        recoverable: true
      });
      return;
    }

    const from = this.snapshots[fromIndex];
    const to = this.snapshots[toIndex];

    // Cancel any existing morph
    this.cancelMorph();

    // Set up morph target
    this.activeMorph = {
      from,
      to,
      progress: 0,
      easing
    };

    // Start animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      let progress = Math.min(elapsed / duration, 1);
      progress = Math.pow(progress, 2); // Ease-in-out approximation

      if (this.activeMorph) {
        this.activeMorph.progress = progress;
        this.applyMorphProgress(progress);
      }

      if (progress < 1) {
        this.morphAnimationId = requestAnimationFrame(animate);
      } else {
        this.activeMorph = null;
        errorHandler.showSuccess(`MORPH COMPLETE: Snap ${fromIndex + 1} → ${toIndex + 1}`);
      }
    };

    animate();
  }

  /**
   * Apply current morph progress to all parameters
   */
  private applyMorphProgress(progress: number): void {
    if (!this.activeMorph) return;

    const { from, to, easing } = this.activeMorph;

    // Morph parameters
    const currentParams = interpolateObject(
      from.data.parameters,
      to.data.parameters,
      progress,
      easing
    );

    // Apply to Tone.js parameters
    Object.entries(currentParams).forEach(([key, value]) => {
      try {
        // Find the corresponding Tone.js node and apply
        if (key.startsWith('master') || key.startsWith('eq') || key.startsWith('filter')) {
          const node = this.findToneNode(key);
          if (node) {
            if (typeof value === 'number') {
              if (node.value !== undefined) {
                node.value = value;
              } else if (node.volume !== undefined) {
                node.volume.value = value;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error morphing parameter ${key}:`, error);
      }
    });

    // Morph effects
    const effects = this.activeMorph!.from.data.effects;
    const toEffects = this.activeMorph!.to.data.effects;

    if (effects && toEffects) {
      if (effects.reverb !== undefined) {
        const currentVerb = interpolate(effects.reverb, toEffects.reverb, progress, easing);
        // Apply reverb wet
      }
      if (effects.delay !== undefined) {
        const currentDelay = interpolate(effects.delay, toEffects.delay, progress, easing);
        // Apply delay wet
      }
    }

    // Update UI indicators
    this.updateMorphUI(progress);
  }

  /**
   * Find Tone.js node by parameter name
   */
  private findToneNode(paramName: string): any {
    if (!window.engine) return null;

    const effects = window.engine.getEffects();
    const map: Record<string, any> = {
      'masterVolume': effects.limiter,
      'eqLow': effects.eq3.low,
      'eqMid': effects.eq3.mid,
      'eqHigh': effects.eq3.high,
      'filterFreq': effects.autoFilter.baseFrequency,
      'reverbWet': effects.reverb.wet,
      'delayWet': effects.delay.wet,
      'masterPitch': effects.masterPitch,
      'stereoWidth': effects.stereoWidener.width
    };

    return map[paramName] || null;
  }

  /**
   * Cancel active morph
   */
  cancelMorph(): void {
    if (this.morphAnimationId !== null) {
      cancelAnimationFrame(this.morphAnimationId);
      this.morphAnimationId = null;
    }
    this.activeMorph = null;
    this.updateMorphUI(0);
  }

  /**
   * Get snapshot data by index
   */
  getSnapshot(index: number): Snapshot | null {
    return this.snapshots[index] || null;
  }

  /**
   * Get all snapshots
   */
  getAllSnapshots(): Snapshot[] {
    return this.snapshots;
  }

  /**
   * Clear a snapshot
   */
  clearSnapshot(index: number): void {
    this.snapshots[index] = null;
    this.updateSnapshotUI(index, false);
    errorHandler.showInfo(`SNAP ${index + 1} CLEARED`);
  }

  /**
   * Clear all snapshots
   */
  clearAll(): void {
    this.snapshots = Array(8).fill(null);
    for (let i = 0; i < 8; i++) {
      this.updateSnapshotUI(i, false);
    }
    errorHandler.showInfo('ALL SNAPSHOTS CLEARED');
  }

  /**
   * Get current morph progress
   */
  getMorphProgress(): { from: number; to: number; progress: number } | null {
    if (!this.activeMorph) return null;

    const fromIndex = this.snapshots.indexOf(this.activeMorph.from);
    const toIndex = this.snapshots.indexOf(this.activeMorph.to);

    return {
      from: fromIndex,
      to: toIndex,
      progress: this.activeMorph.progress
    };
  }

  /**
   * Initialize UI for quantum snapshots
   */
  private initializeUI(): void {
    // Replace existing snapshot grid with quantum version
    const existingGrid = document.getElementById('snapshotRack');
    if (!existingGrid) return;

    // Create enhanced grid with morph controls
    existingGrid.innerHTML = '';

    for (let i = 0; i < 8; i++) {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 4px;';

      const btn = document.createElement('button');
      btn.className = 'snap-btn font-mono';
      btn.id = `snap-${i}`;
      btn.innerText = (i + 1).toString();
      btn.onclick = () => this.loadSnapshot(i);

      // Shift+click to save
      btn.oncontextmenu = (e) => {
        e.preventDefault();
        this.saveSnapshot(i, window.seq.data, this.captureParameters(), this.captureEffects());
      };

      wrapper.appendChild(btn);

      // Add morph target for even indices
      if (i % 2 === 0 && i < 6) {
        const morphBtn = document.createElement('button');
        morphBtn.className = 'action-btn';
        morphBtn.style.cssText = 'width: 20px; height: 15px; font-size: 8px; padding: 0;';
        morphBtn.innerText = '→';
        morphBtn.title = `Morph ${i + 1} → ${i + 2}`;
        morphBtn.onclick = () => this.morph(i, i + 1, 2000, 'easeInOutExpo');
        wrapper.appendChild(morphBtn);
      }

      existingGrid.appendChild(wrapper);
    }

    // Add morph control panel
    const morphPanel = document.createElement('div');
    morphPanel.style.cssText = 'margin-top: 15px; padding: 10px; background: #151515; border: 1px solid #333; border-radius: 4px;';
    morphPanel.innerHTML = `
      <div style="font-size: 9px; color: #888; font-weight: 700; margin-bottom: 8px;">MORPH CONTROLS</div>
      <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between;">
        <div style="font-size: 8px; color: #666;">FROM</div>
        <div style="display: flex; gap: 5px;">
          <button id="morphCancel" class="action-btn" style="padding: 4px 8px; font-size: 8px;">✖ CANCEL</button>
          <select id="morphEasing" style="width: 80px; padding: 4px; font-size: 8px; background: #222; color: #fff; border: 1px solid #333;">
            <option value="linear">LINEAR</option>
            <option value="easeInOutExpo" selected>EXPONENTIAL</option>
            <option value="easeInOutQuad">QUADRATIC</option>
            <option value="easeInOutCubic">CUBIC</option>
          </select>
        </div>
        <div style="font-size: 8px; color: #666;">TO</div>
      </div>
      <div id="morphProgress" style="margin-top: 8px; height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
        <div id="morphProgressBar" style="width: 0%; height: 100%; background: var(--primary); transition: width 0.1s;"></div>
      </div>
      <div id="morphStatus" style="margin-top: 5px; font-size: 8px; color: var(--primary); text-align: center; height: 12px;"></div>
    `;

    existingGrid.parentNode?.appendChild(morphPanel);

    // Event listeners
    document.getElementById('morphCancel')?.addEventListener('click', () => this.cancelMorph());
  }

  /**
   * Update snapshot UI
   */
  private updateSnapshotUI(index: number, isFilled: boolean): void {
    const btn = document.getElementById(`snap-${index}`);
    if (btn) {
      if (isFilled) {
        btn.classList.add('filled');
        btn.title = `Snapshot ${index + 1} - Saved`;
      } else {
        btn.classList.remove('filled');
        btn.classList.remove('active');
        btn.title = `Empty - Right-click to save`;
      }
    }
  }

  /**
   * Update morph progress UI
   */
  private updateMorphUI(progress: number): void {
    const progressBar = document.getElementById('morphProgressBar');
    const status = document.getElementById('morphStatus');

    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }

    if (status && this.activeMorph) {
      const fromIndex = this.snapshots.indexOf(this.activeMorph.from);
      const toIndex = this.snapshots.indexOf(this.activeMorph.to);
      status.innerText = `MORPHING: ${fromIndex + 1} → ${toIndex + 1} (${(progress * 100).toFixed(0)}%)`;
    }
  }

  /**
   * Capture current parameters
   */
  private captureParameters(): Record<string, number> {
    if (!window.engine) return {};

    const effects = window.engine.getEffects();
    return {
      masterVolume: window.engine.getChannels().reduce((sum, ch) => sum + ch.vol.volume.value, 0),
      eqLow: effects.eq3.low.value,
      eqMid: effects.eq3.mid.value,
      eqHigh: effects.eq3.high.value,
      reverbWet: effects.reverb.wet.value,
      delayWet: effects.delay.wet.value,
      masterPitch: effects.masterPitch.pitch,
      stereoWidth: effects.stereoWidener.width.value
    };
  }

  /**
   * Capture current effects state
   */
  private captureEffects(): any {
    if (!window.engine) return {};

    const effects = window.engine.getEffects();
    return {
      reverb: effects.reverb.wet.value,
      delay: effects.delay.wet.value,
      distortion: effects.distortion.distortion,
      cheby: effects.cheby.order
    };
  }
}

export const quantumSnapshots = QuantumSnapshots.getInstance();
