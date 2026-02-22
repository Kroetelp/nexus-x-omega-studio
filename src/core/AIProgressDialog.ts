/**
 * AI Progress Dialog - Enhanced loading states for AI operations
 */

import { errorHandler } from './ErrorHandler.js';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  duration?: number;
}

export class AIProgressDialog {
  private static instance: AIProgressDialog;
  private dialog: HTMLDialogElement | null = null;
  private steps: ProgressStep[] = [];
  private startTime: number = 0;
  private estimatedDuration: number = 0;
  private cancelButton: HTMLElement | null = null;
  private isCancelled = false;

  private constructor() {
    this.createDialog();
  }

  static getInstance(): AIProgressDialog {
    if (!AIProgressDialog.instance) {
      AIProgressDialog.instance = new AIProgressDialog();
    }
    return AIProgressDialog.instance;
  }

  /**
   * Create the AI progress dialog
   */
  private createDialog(): void {
    this.dialog = document.createElement('dialog');
    this.dialog.id = 'aiProgressDialog';
    this.dialog.style.cssText = `
      background: radial-gradient(circle at center, rgba(17,17,17,0.95) 0%, rgba(0,0,0,0.98) 100%);
      color: #fff;
      border: 2px solid var(--magenta);
      padding: 30px;
      border-radius: 10px;
      min-width: 400px;
      max-width: 90vw;
    `;

    this.dialog.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
        <div class="loader-ring" style="border-top-color: var(--magenta); width: 40px; height: 40px;"></div>
        <div>
          <div style="font-size: 20px; font-weight: 800; color: var(--magenta);">AI IS COMPOSING...</div>
          <div id="aiStatusText" style="color: #888; font-size: 12px; margin-top: 5px;">Initializing</div>
        </div>
      </div>

      <div id="aiProgressSteps" style="margin-bottom: 20px;"></div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <div id="aiProgressTime" style="color: #666; font-size: 11px;">Estimated: --</div>
        <div id="aiProgressBar" style="flex: 1; height: 4px; background: #333; border-radius: 2px; margin: 0 15px; overflow: hidden;">
          <div id="aiProgressFill" style="width: 0%; height: 100%; background: var(--magenta); transition: width 0.3s ease;"></div>
        </div>
        <div id="aiProgressPercent" style="color: var(--primary); font-size: 11px; font-weight: 700;">0%</div>
      </div>

      <button id="aiCancelBtn" class="btn" style="width: 100%; background: var(--flux); border-color: var(--flux);">
        ✖ CANCEL
      </button>
    `;

    document.body.appendChild(this.dialog);

    // Setup cancel button
    this.cancelButton = document.getElementById('aiCancelBtn');
    if (this.cancelButton) {
      this.cancelButton.addEventListener('click', () => this.cancel());
    }
  }

  /**
   * Show dialog with steps
   */
  show(steps: ProgressStep[]): void {
    this.steps = steps;
    this.startTime = Date.now();
    this.estimatedDuration = this.calculateEstimatedDuration(steps);
    this.isCancelled = false;

    this.renderSteps();
    this.updateProgress(0);
    this.dialog?.showModal();

    // Start time update
    this.startTimeUpdate();
  }

  /**
   * Hide dialog
   */
  hide(): void {
    this.dialog?.close();
    this.isCancelled = false;
  }

  /**
   * Update progress
   */
  updateProgress(completedSteps: number): void {
    const progress = completedSteps / this.steps.length;
    const percent = Math.round(progress * 100);

    // Update progress bar
    const fill = document.getElementById('aiProgressFill');
    const percentText = document.getElementById('aiProgressPercent');

    if (fill) fill.style.width = `${percent}%`;
    if (percentText) percentText.textContent = `${percent}%`;

    // Update step statuses
    for (let i = 0; i < this.steps.length; i++) {
      if (i < completedSteps) {
        this.steps[i].status = 'complete';
      } else if (i === completedSteps) {
        this.steps[i].status = 'active';
      } else {
        this.steps[i].status = 'pending';
      }
    }

    this.renderSteps();
  }

  /**
   * Update step status
   */
  updateStep(stepId: string, status: ProgressStep['status']): void {
    const step = this.steps.find(s => s.id === stepId);
    if (step) {
      step.status = status;
      this.renderSteps();
    }
  }

  /**
   * Set current status text
   */
  setStatus(text: string): void {
    const statusEl = document.getElementById('aiStatusText');
    if (statusEl) {
      statusEl.textContent = text;
    }
  }

  /**
   * Cancel operation
   */
  cancel(): void {
    this.isCancelled = true;
    this.hide();

    // Dispatch cancel event
    window.dispatchEvent(new CustomEvent('ai:cancel', {
      detail: { cancelled: true }
    }));

    errorHandler.showInfo('AI operation cancelled');
  }

  /**
   * Check if cancelled
   */
  get cancelled(): boolean {
    return this.isCancelled;
  }

  /**
   * Render steps
   */
  private renderSteps(): void {
    const container = document.getElementById('aiProgressSteps');
    if (!container) return;

    container.innerHTML = this.steps.map(step => {
      const statusIcon = {
        pending: '○',
        active: '●',
        complete: '✓',
        error: '✗'
      }[step.status];

      const statusColor = {
        pending: '#666',
        active: 'var(--primary)',
        complete: 'var(--primary)',
        error: 'var(--flux)'
      }[step.status];

      return `
        <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0;">
          <div style="color: ${statusColor}; font-size: 16px;">${statusIcon}</div>
          <div style="flex: 1; font-size: 12px; color: #ccc;">${step.label}</div>
          ${step.status === 'complete' ? '<div style="color: var(--primary); font-size: 10px;">DONE</div>' : ''}
          ${step.status === 'active' ? '<div style="color: var(--primary); font-size: 10px; animation: pulse 1s infinite;">WORKING</div>' : ''}
        </div>
      `;
    }).join('');
  }

  /**
   * Start time update loop
   */
  private startTimeUpdate(): void {
    const updateTime = () => {
      if (!this.dialog?.open) return;

      const elapsed = Date.now() - this.startTime;
      const remaining = Math.max(0, this.estimatedDuration - elapsed);

      const timeText = document.getElementById('aiProgressTime');
      if (timeText) {
        if (remaining > 0) {
          timeText.textContent = `ETA: ${this.formatTime(remaining)}`;
        } else {
          timeText.textContent = 'Finishing...';
        }
      }

      requestAnimationFrame(updateTime);
    };

    updateTime();
  }

  /**
   * Calculate estimated duration
   */
  private calculateEstimatedDuration(steps: ProgressStep[]): number {
    return steps.reduce((sum, step) => sum + (step.duration || 1000), 0);
  }

  /**
   * Format time as mm:ss
   */
  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  /**
   * Show error in dialog
   */
  showError(message: string): void {
    const container = document.getElementById('aiProgressSteps');
    if (container) {
      container.innerHTML += `
        <div style="padding: 10px; background: rgba(255, 0, 85, 0.1); border: 1px solid var(--flux); border-radius: 4px; margin-top: 10px; font-size: 11px; color: var(--flux);">
          ❌ ${message}
        </div>
      `;
    }

    const cancelBtn = document.getElementById('aiCancelBtn');
    if (cancelBtn) {
      cancelBtn.textContent = 'CLOSE';
      cancelBtn.style.background = '#333';
    }
  }
}

export const aiProgressDialog = AIProgressDialog.getInstance();

// Helper to create steps with default status
const createSteps = (steps: Array<{ id: string; label: string; duration?: number }>): ProgressStep[] =>
  steps.map(step => ({ ...step, status: 'pending' as const }));

// Predefined progress steps for common AI operations
export const AISteps = {
  fullSong: createSteps([
    { id: 'init', label: 'Initializing AI Engine', duration: 500 },
    { id: 'genre', label: 'Analyzing Genre Requirements', duration: 300 },
    { id: 'loadModel', label: 'Loading MusicVAE Model', duration: 1000 },
    { id: 'generateDrumsA', label: 'Generating Drum Pattern A', duration: 800 },
    { id: 'composeA', label: 'Composing Melodic Section A', duration: 600 },
    { id: 'generateDrumsB', label: 'Generating Drum Pattern B', duration: 800 },
    { id: 'composeB', label: 'Composing Melodic Section B', duration: 600 },
    { id: 'structure', label: 'Building Song Structure', duration: 500 },
    { id: 'schedule', label: 'Scheduling Audio Events', duration: 400 },
    { id: 'finalize', label: 'Finalizing Composition', duration: 300 }
  ]),

  drumsOnly: createSteps([
    { id: 'init', label: 'Initializing AI Engine', duration: 500 },
    { id: 'loadModel', label: 'Loading MusicVAE Model', duration: 800 },
    { id: 'generate', label: 'Generating Drum Patterns', duration: 1200 },
    { id: 'apply', label: 'Applying to Sequencer', duration: 300 },
    { id: 'finalize', label: 'Finalizing', duration: 200 }
  ]),

  neuralDream: createSteps([
    { id: 'init', label: 'Initializing Neural Dream', duration: 300 },
    { id: 'loadModel', label: 'Loading MusicRNN Model', duration: 600 },
    { id: 'convert', label: 'Converting Pattern', duration: 200 },
    { id: 'generate', label: 'AI Dreaming (✨)', duration: 1500 },
    { id: 'preview', label: 'Generating Preview', duration: 500 },
    { id: 'apply', label: 'Applying Transformation', duration: 300 }
  ])
};
