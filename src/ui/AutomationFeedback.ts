/**
 * AUTOMATION FEEDBACK - Visual indicators for automated parameters
 */

import * as Tone from 'tone';

interface AutomationIndicator {
  parameter: string;
  element: HTMLElement | null;
  isActive: boolean;
  value: number;
  lastChangeTime: number;
}

export class AutomationFeedback {
  private static instance: AutomationFeedback;
  private indicators: Map<string, AutomationIndicator> = new Map();
  private automationCallbacks: Map<string, ((value: number) => void)[]> = new Map();

  private constructor() {
    this.initializeIndicators();
    this.setupParameterListeners();
  }

  static getInstance(): AutomationFeedback {
    if (!AutomationFeedback.instance) {
      AutomationFeedback.instance = new AutomationFeedback();
    }
    return AutomationFeedback.instance;
  }

  /**
   * Initialize automation indicators for all controllable parameters
   */
  private initializeIndicators(): void {
    const parameters = [
      'eqLow', 'eqMid', 'eqHigh',
      'masterPitch', 'stereoWidth',
      'reverbWet', 'delayWet',
      'filterFreq', 'chebyWet', 'stutterWet',
      'bitcrushEnabled', 'bitcrushDepth', 'bitcrushFreq'
    ];

    parameters.forEach(param => {
      this.indicators.set(param, {
        parameter: param,
        element: this.createIndicatorElement(param),
        isActive: false,
        value: 0,
        lastChangeTime: 0
      });
    });
  }

  /**
   * Create indicator element for a parameter
   */
  private createIndicatorElement(parameter: string): HTMLElement | null {
    // Find the dial or control element
    const elementMap: Record<string, string> = {
      'eqLow': '#eqLowBtn',
      'eqMid': '#eqMidBtn',
      'eqHigh': '#eqHighBtn',
      'masterPitch': '#masterPitchDial',
      'stereoWidth': '#masterWidthDial',
      'reverbWet': '#verbWetDial',
      'delayWet': '#delayWetDial',
      'filterFreq': '#delayTimeDial', // Mapping
      'chebyWet': '#fluxBtn',
      'stutterWet': '#stuttBtn',
      'bitcrushEnabled': '#bitcrushToggleBtn',
      'bitcrushDepth': '#bitcrushDepthDial',
      'bitcrushFreq': '#bitcrushFreqDial'
    };

    const selector = elementMap[parameter];
    if (!selector) return null;

    const parent = document.querySelector(selector);
    if (!parent) return null;

    // Create LED indicator
    const led = document.createElement('div');
    led.className = 'automation-led';
    led.dataset.parameter = parameter;
    led.style.cssText = `
      position: absolute;
      top: -5px;
      right: -5px;
      width: 12px;
      height: 12px;
      background: #333;
      border: 2px solid #444;
      border-radius: 50%;
      pointer-events: none;
      transition: all 0.3s ease;
      z-index: 100;
    `;

    parent.style.position = 'relative';
    parent.appendChild(led);

    return led;
  }

  /**
   * Setup listeners for parameter changes
   */
  private setupParameterListeners(): void {
    if (!window.engine?.getEffects) return;

    const effects = window.engine.getEffects();
    const updateInterval = 100; // ms
    const automationThreshold = 2000; // ms

    // Poll for automated parameters
    setInterval(() => {
      const now = Date.now();

      // Check EQ
      this.checkAutomation('eqLow', effects.eq3.low.value, now, automationThreshold);
      this.checkAutomation('eqMid', effects.eq3.mid.value, now, automationThreshold);
      this.checkAutomation('eqHigh', effects.eq3.high.value, now, automationThreshold);

      // Check master effects
      this.checkAutomation('masterPitch', effects.masterPitch.pitch, now, automationThreshold);
      this.checkAutomation('stereoWidth', effects.stereoWidener.width.value, now, automationThreshold);

      // Check spatial effects
      this.checkAutomation('reverbWet', effects.reverb.wet.value, now, automationThreshold);
      this.checkAutomation('delayWet', effects.delay.wet.value, now, automationThreshold);

      // Check modulation
      if (effects.autoFilter.wet.value > 0) {
        this.checkAutomation('filterFreq', effects.autoFilter.baseFrequency.value, now, automationThreshold);
      }

      if (effects.cheby.wet.value > 0) {
        this.checkAutomation('chebyWet', effects.cheby.order, now, automationThreshold);
      }

      if (effects.stutter.wet.value > 0) {
        this.checkAutomation('stutterWet', effects.stutter.frequency.value, now, automationThreshold);
      }

      // Check bitcrusher
      if (effects.bitcrushEnabled) {
        this.checkAutomation('bitcrushEnabled', effects.bitcrushEnabled.value, now, automationThreshold);
      }
      if (effects.bitcrushDepth) {
        this.checkAutomation('bitcrushDepth', effects.bitcrushDepth.value, now, automationThreshold);
      }
      if (effects.bitcrushFreq) {
        this.checkAutomation('bitcrushFreq', effects.bitcrushFreq.value, now, automationThreshold);
      }
    }, updateInterval);
  }

  /**
   * Check if a parameter is being automated
   */
  private checkAutomation(parameter: string, value: number, now: number, threshold: number): void {
    const indicator = this.indicators.get(parameter);
    if (!indicator) return;

    const valueChanged = Math.abs(value - indicator.value) > 0.01;
    const timeSinceChange = now - indicator.lastChangeTime;

    if (valueChanged || timeSinceChange < threshold) {
      indicator.isActive = true;
      indicator.value = value;
      indicator.lastChangeTime = now;
    } else {
      indicator.isActive = false;
    }

    this.updateIndicatorUI(parameter, indicator);
  }

  /**
   * Update indicator UI based on automation state
   */
  private updateIndicatorUI(parameter: string, indicator: AutomationIndicator): void {
    if (!indicator.element) return;

    if (indicator.isActive) {
      // Active automation
      indicator.element.style.background = 'var(--primary)';
      indicator.element.style.boxShadow = `0 0 10px var(--primary), 0 0 20px var(--primary)`;
      indicator.element.style.animation = 'automationPulse 1s infinite';
    } else {
      // Inactive
      indicator.element.style.background = '#333';
      indicator.element.style.boxShadow = 'none';
      indicator.element.style.animation = 'none';
    }
  }

  /**
   * Manually trigger automation for a parameter
   */
  triggerAutomation(parameter: string, value: number): void {
    const indicator = this.indicators.get(parameter);
    if (indicator) {
      indicator.isActive = true;
      indicator.value = value;
      indicator.lastChangeTime = Date.now();
      this.updateIndicatorUI(parameter, indicator);
    }
  }

  /**
   * Stop automation for a parameter
   */
  stopAutomation(parameter: string): void {
    const indicator = this.indicators.get(parameter);
    if (indicator) {
      indicator.isActive = false;
      this.updateIndicatorUI(parameter, indicator);
    }
  }

  /**
   * Add callback for parameter automation
   */
  onParameterAutomation(parameter: string, callback: (value: number) => void): void {
    if (!this.automationCallbacks.has(parameter)) {
      this.automationCallbacks.set(parameter, []);
    }
    this.automationCallbacks.get(parameter)?.push(callback);
  }

  /**
   * Remove callback
   */
  removeParameterAutomation(parameter: string, callback: (value: number) => void): void {
    const callbacks = this.automationCallbacks.get(parameter);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Show automation curve overlay
   */
  showAutomationCurve(parameter: string, values: number[]): void {
    // Find the dial/control element
    const selector = this.getParameterSelector(parameter);
    if (!selector) return;

    const element = document.querySelector(selector);
    if (!element) return;

    const rect = element.getBoundingClientRect();

    // Create overlay canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'automation-overlay';
    canvas.style.cssText = `
      position: absolute;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height + 50}px;
      pointer-events: none;
      z-index: 200;
    `;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = rect.width;
    canvas.height = rect.height + 50;

    // Draw curve
    ctx.strokeStyle = 'var(--primary)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    values.forEach((value, index) => {
      const x = (index / (values.length - 1)) * rect.width;
      const y = rect.height - (value * rect.height);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Add glow
    ctx.shadowColor = 'var(--primary)';
    ctx.shadowBlur = 10;
    ctx.stroke();

    document.body.appendChild(canvas);

    // Remove after 3 seconds
    setTimeout(() => canvas.remove(), 3000);
  }

  /**
   * Get CSS selector for parameter
   */
  private getParameterSelector(parameter: string): string | null {
    const selectorMap: Record<string, string> = {
      'eqLow': '#eqLowBtn',
      'eqMid': '#eqMidBtn',
      'eqHigh': '#eqHighBtn',
      'masterPitch': '#masterPitchDial',
      'stereoWidth': '#masterWidthDial',
      'reverbWet': '#verbWetDial',
      'delayWet': '#delayWetDial',
      'filterFreq': '#delayTimeDial',
      'chebyWet': '#fluxBtn',
      'stutterWet': '#stuttBtn',
      'bitcrushEnabled': '#bitcrushToggleBtn',
      'bitcrushDepth': '#bitcrushDepthDial',
      'bitcrushFreq': '#bitcrushFreqDial'
    };

    return selectorMap[parameter] || null;
  }

  /**
   * Get all indicators
   */
  getIndicators(): Map<string, AutomationIndicator> {
    return new Map(this.indicators);
  }

  /**
   * Get indicator for specific parameter
   */
  getIndicator(parameter: string): AutomationIndicator | undefined {
    return this.indicators.get(parameter);
  }
}

export const automationFeedback = AutomationFeedback.getInstance();

// Add CSS for automation indicators
const style = document.createElement('style');
style.textContent = `
  @keyframes automationPulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }

  .automation-led {
    opacity: 0.5;
  }

  .automation-led[data-active="true"] {
    opacity: 1;
  }
`;
document.head.appendChild(style);
