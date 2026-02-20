/**
 * SPECTRAL WORKBENCH - Visual Audio Editor
 * Paint audio characteristics directly in the frequency domain
 */

import * as Tone from 'tone';
import { errorHandler } from './ErrorHandler.js';

interface SpectralZone {
  id: string;
  frequencyMin: number;
  frequencyMax: number;
  amplitude: number;
  parameter: string;
  color: string;
}

interface SpectralHistory {
  timestamp: number;
  fftData: Float32Array;
}

export class SpectralWorkbench {
  private static instance: SpectralWorkbench;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private isErasing = false;
  private spectralZones: SpectralZone[] = [];
  private history: SpectralHistory[] = [];
  private maxHistory = 50;
  private fftSize = 2048;
  private analyser: Tone.Analyser | null = null;

  private constructor() {
    this.initializeUI();
  }

  static getInstance(): SpectralWorkbench {
    if (!SpectralWorkbench.instance) {
      SpectralWorkbench.instance = new SpectralWorkbench();
    }
    return SpectralWorkbench.instance;
  }

  /**
   * Initialize spectral workbench UI
   */
  private initializeUI(): void {
    // Add spectral workbench panel to sidebar
    const sidebar = document.querySelector('aside.deck');
    if (!sidebar) return;

    // Create spectral panel
    const panel = document.createElement('div');
    panel.className = 'module';
    panel.innerHTML = `
      <div class="mod-title">SPECTRAL WORKBENCH <span>VISUAL</span></div>
      <div style="position: relative; width: 100%;">
        <canvas id="spectralCanvas" style="width: 100%; height: 200px; background: #000; border: 1px solid #333; border-radius: 4px; cursor: crosshair;"></canvas>
        <div id="spectralOverlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none;"></div>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
        <button id="spectralDrawBtn" class="action-btn" style="flex: 1; background: var(--primary); color: #000;">🎨 PAINT</button>
        <button id="spectralEraseBtn" class="action-btn" style="flex: 1;">🧼 ERASE</button>
        <button id="spectralClearBtn" class="action-btn" style="flex: 1;">🗑️ CLEAR</button>
      </div>
      <div style="margin-top: 10px; padding: 10px; background: #151515; border-radius: 4px;">
        <div style="font-size: 9px; color: #888; margin-bottom: 8px;">PARAMETER MAPPING</div>
        <div id="spectralParams" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 8px;">
          <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
            <input type="radio" name="spectralParam" value="filterFreq" checked>
            <span style="color: var(--primary);">FILTER</span>
          </label>
          <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
            <input type="radio" name="spectralParam" value="reverbWet">
            <span style="color: var(--accent);">REVERB</span>
          </label>
          <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
            <input type="radio" name="spectralParam" value="delayWet">
            <span style="color: var(--hyper);">DELAY</span>
          </label>
          <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
            <input type="radio" name="spectralParam" value="distortion">
            <span style="color: var(--flux);">DISTORTION</span>
          </label>
        </div>
      </div>
      <div style="margin-top: 10px; font-size: 8px; color: #666; text-align: center;">
        Draw on spectrum to paint audio energy zones
      </div>
    `;

    sidebar.appendChild(panel);

    // Get canvas and context
    this.canvas = document.getElementById('spectralCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas?.getContext('2d') || null;

    // Setup canvas
    this.setupCanvas();

    // Event listeners
    this.setupEventListeners();

    // Start rendering loop
    this.startRenderLoop();

    // Initialize analyser
    this.initializeAnalyser();
  }

  /**
   * Setup canvas dimensions
   */
  private setupCanvas(): void {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  /**
   * Initialize audio analyser for spectral analysis
   */
  private initializeAnalyser(): void {
    try {
      // Create dedicated analyser for spectral workbench
      this.analyser = new Tone.Analyser('fft', this.fftSize);

      // Connect to master output
      if (window.engine?.getEffects) {
        const effects = window.engine.getEffects();
        effects.limiter.connect(this.analyser);
      }
    } catch (error) {
      console.error('Failed to initialize spectral analyser:', error);
    }
  }

  /**
   * Setup mouse/touch event listeners for drawing
   */
  private setupEventListeners(): void {
    if (!this.canvas) return;

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startDrawing(e.touches[0]);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.draw(e.touches[0]);
    });
    this.canvas.addEventListener('touchend', () => this.stopDrawing());

    // Button events
    document.getElementById('spectralDrawBtn')?.addEventListener('click', () => {
      this.isDrawingMode = true;
      this.updateButtonStates();
    });

    document.getElementById('spectralEraseBtn')?.addEventListener('click', () => {
      this.isDrawingMode = false;
      this.updateButtonStates();
    });

    document.getElementById('spectralClearBtn')?.addEventListener('click', () => {
      this.clearZones();
      errorHandler.showSuccess('SPECTRAL ZONES CLEARED');
    });

    // Resize handler
    window.addEventListener('resize', () => this.setupCanvas());
  }

  private isDrawingMode = true;

  private updateButtonStates(): void {
    const drawBtn = document.getElementById('spectralDrawBtn');
    const eraseBtn = document.getElementById('spectralEraseBtn');

    if (drawBtn) {
      drawBtn.style.background = this.isDrawingMode ? 'var(--primary)' : '#333';
      drawBtn.style.color = this.isDrawingMode ? '#000' : '#fff';
    }

    if (eraseBtn) {
      eraseBtn.style.background = this.isDrawingMode ? '#333' : 'var(--flux)';
      eraseBtn.style.color = this.isDrawingMode ? '#fff' : '#000';
    }
  }

  /**
   * Start drawing a spectral zone
   */
  private startDrawing(e: MouseEvent | Touch): void {
    this.isDrawing = true;
    this.isErasing = !this.isDrawingMode;
    this.createSpectralZone(e);
  }

  /**
   * Draw/update spectral zone
   */
  private draw(e: MouseEvent | Touch): void {
    if (!this.isDrawing || !this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.isErasing) {
      this.eraseAtPosition(x, y);
    } else {
      this.updateLastZone(x, y);
    }
  }

  /**
   * Stop drawing
   */
  private stopDrawing(): void {
    this.isDrawing = false;
    this.isErasing = false;
  }

  /**
   * Create a new spectral zone at position
   */
  private createSpectralZone(e: MouseEvent | Touch): void {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const freqRange = this.yToFrequency(y);
    const param = this.getSelectedParameter();
    const color = this.getParameterColor(param);

    const zone: SpectralZone = {
      id: `zone-${Date.now()}`,
      frequencyMin: freqRange.min,
      frequencyMax: freqRange.max,
      amplitude: 1 - (y / this.canvas.height),
      parameter: param,
      color
    };

    this.spectralZones.push(zone);
    this.applySpectralZone(zone);
  }

  /**
   * Update the last created zone
   */
  private updateLastZone(x: number, y: number): void {
    if (this.spectralZones.length === 0) return;

    const lastZone = this.spectralZones[this.spectralZones.length - 1];
    const freqRange = this.yToFrequency(y);

    lastZone.frequencyMin = Math.min(lastZone.frequencyMin, freqRange.min);
    lastZone.frequencyMax = Math.max(lastZone.frequencyMax, freqRange.max);
    lastZone.amplitude = Math.max(lastZone.amplitude, 1 - (y / this.canvas.height));

    this.applySpectralZone(lastZone);
  }

  /**
   * Erase zones at position
   */
  private eraseAtPosition(x: number, y: number): void {
    const freqRange = this.yToFrequency(y);

    this.spectralZones = this.spectralZones.filter(zone => {
      // Check if zone overlaps with erase position
      const overlaps =
        zone.frequencyMax >= freqRange.min &&
        zone.frequencyMin <= freqRange.max;

      if (overlaps) {
        // Remove zone effect
        this.removeSpectralZoneEffect(zone);
        return false;
      }
      return true;
    });
  }

  /**
   * Clear all spectral zones
   */
  private clearZones(): void {
    // Remove all effects
    this.spectralZones.forEach(zone => this.removeSpectralZoneEffect(zone));
    this.spectralZones = [];
  }

  /**
   * Convert Y position to frequency range
   */
  private yToFrequency(y: number): { min: number; max: number } {
    if (!this.canvas) return { min: 0, max: 0 };

    const nyquist = Tone.context.sampleRate / 2;
    const pixelToFreq = nyquist / this.canvas.height;

    const freq = y * pixelToFreq;
    const bandwidth = pixelToFreq * 20; // 20 pixel bandwidth

    return {
      min: Math.max(0, freq - bandwidth),
      max: Math.min(nyquist, freq + bandwidth)
    };
  }

  /**
   * Convert frequency to Y position
   */
  private frequencyToY(freq: number): number {
    if (!this.canvas) return 0;

    const nyquist = Tone.context.sampleRate / 2;
    return (freq / nyquist) * this.canvas.height;
  }

  /**
   * Get selected parameter from radio buttons
   */
  private getSelectedParameter(): string {
    const selected = document.querySelector('input[name="spectralParam"]:checked') as HTMLInputElement;
    return selected?.value || 'filterFreq';
  }

  /**
   * Get color for parameter
   */
  private getParameterColor(param: string): string {
    const colors: Record<string, string> = {
      filterFreq: 'var(--primary)',
      reverbWet: 'var(--accent)',
      delayWet: 'var(--hyper)',
      distortion: 'var(--flux)'
    };
    return colors[param] || 'var(--primary)';
  }

  /**
   * Apply spectral zone effect to audio
   */
  private applySpectralZone(zone: SpectralZone): void {
    if (!window.engine?.getEffects) return;

    const effects = window.engine.getEffects();

    switch (zone.parameter) {
      case 'filterFreq':
        // Apply filter frequency based on zone frequency
        const centerFreq = (zone.frequencyMin + zone.frequencyMax) / 2;
        effects.autoFilter.baseFrequency.value = centerFreq;
        effects.autoFilter.wet.value = zone.amplitude * 0.5;
        break;

      case 'reverbWet':
        // Increase reverb for this frequency range
        effects.reverb.wet.value = Math.min(1, zone.amplitude);
        break;

      case 'delayWet':
        // Increase delay wet
        effects.delay.wet.value = Math.min(1, zone.amplitude * 0.7);
        break;

      case 'distortion':
        // Add distortion
        effects.distortion.distortion = zone.amplitude * 0.5;
        effects.distortion.wet.value = zone.amplitude * 0.5;
        break;
    }
  }

  /**
   * Remove spectral zone effect
   */
  private removeSpectralZoneEffect(zone: SpectralZone): void {
    if (!window.engine?.getEffects) return;

    const effects = window.engine.getEffects();

    switch (zone.parameter) {
      case 'filterFreq':
        effects.autoFilter.wet.value = 0;
        break;

      case 'reverbWet':
        effects.reverb.wet.value = 0.3; // Return to default
        break;

      case 'delayWet':
        effects.delay.wet.value = 0;
        break;

      case 'distortion':
        effects.distortion.distortion = 0;
        effects.distortion.wet.value = 0;
        break;
    }
  }

  /**
   * Start render loop for spectral visualization
   */
  private startRenderLoop(): void {
    if (!this.ctx || !this.canvas) return;

    const render = () => {
      this.renderSpectrum();
      requestAnimationFrame(render);
    };

    render();
  }

  /**
   * Render spectrum visualization
   */
  private renderSpectrum(): void {
    if (!this.ctx || !this.canvas || !this.analyser) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, width, height);

    // Get FFT data
    const fftData = this.analyser.getValue();

    // Store in history for 3D effect
    this.history.unshift({ timestamp: Date.now(), fftData });
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    // Render history layers (3D tunnel effect)
    for (let z = this.history.length - 1; z >= 0; z--) {
      const layer = this.history[z];
      const alpha = 1 - (z / this.history.length);
      const perspective = 1 + (z * 0.05);

      this.ctx.beginPath();
      this.ctx.strokeStyle = `rgba(0, 255, 148, ${alpha * 0.3})`;
      this.ctx.lineWidth = 1;

      for (let i = 0; i < layer.fftData.length; i++) {
        const value = (layer.fftData[i] + 140) / 140;
        const x = (i / layer.fftData.length) * width * perspective;
        const y = height / 2 + (value * height / 4) * perspective;

        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      this.ctx.stroke();
    }

    // Render spectral zones
    this.renderSpectralZones();

    // Render frequency labels
    this.renderFrequencyLabels();
  }

  /**
   * Render spectral zones overlay
   */
  private renderSpectralZones(): void {
    if (!this.ctx || !this.canvas) return;

    const height = this.canvas.height;

    this.spectralZones.forEach(zone => {
      const yMin = this.frequencyToY(zone.frequencyMin);
      const yMax = this.frequencyToY(zone.frequencyMax);

      // Create gradient for zone
      const gradient = this.ctx.createLinearGradient(0, yMin, 0, yMax);
      gradient.addColorStop(0, `${zone.color}88`);
      gradient.addColorStop(0.5, `${zone.color}CC`);
      gradient.addColorStop(1, `${zone.color}88`);

      // Draw zone
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, yMin, this.canvas.width, yMax - yMin);

      // Draw zone indicator
      this.ctx.strokeStyle = zone.color;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, yMin);
      this.ctx.lineTo(this.canvas.width, yMin);
      this.ctx.moveTo(0, yMax);
      this.ctx.lineTo(this.canvas.width, yMax);
      this.ctx.stroke();

      // Draw zone label
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '8px JetBrains Mono';
      this.ctx.fillText(zone.parameter, 5, yMin + 10);
    });
  }

  /**
   * Render frequency labels
   */
  private renderFrequencyLabels(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.fillStyle = '#666';
    this.ctx.font = '8px JetBrains Mono';
    this.ctx.textAlign = 'right';

    const nyquist = Tone.context.sampleRate / 2;
    const labels = [
      { freq: 20, label: '20Hz' },
      { freq: 100, label: '100Hz' },
      { freq: 500, label: '500Hz' },
      { freq: 2000, label: '2kHz' },
      { freq: 10000, label: '10kHz' }
    ];

    labels.forEach(({ freq, label }) => {
      const y = this.frequencyToY(freq);
      if (y > 10 && y < this.canvas.height - 10) {
        this.ctx.fillText(label, this.canvas.width - 5, y);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width - 40, y);
        this.ctx.stroke();
      }
    });
  }

  /**
   * Get all spectral zones
   */
  getZones(): SpectralZone[] {
    return [...this.spectralZones];
  }

  /**
   * Set spectral zones
   */
  setZones(zones: SpectralZone[]): void {
    this.clearZones();
    zones.forEach(zone => {
      this.spectralZones.push(zone);
      this.applySpectralZone(zone);
    });
  }
}

export const spectralWorkbench = SpectralWorkbench.getInstance();
