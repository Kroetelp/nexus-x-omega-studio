/**
 * Validation utilities for NEXUS-X
 */

import type { StoredState, ValidationResult, AppError } from '../types/index.js';
import { loggers } from './logger';

const log = loggers.system;

const CURRENT_VERSION = '3.8.0';
const MIN_VERSION = '3.0.0';

export function validateStoredState(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data exists
  if (!data || typeof data !== 'object') {
    errors.push('Invalid state: data is null or not an object');
    return { valid: false, errors, warnings };
  }

  // Validate version
  if (!data.version) {
    warnings.push('No version information - assuming legacy format');
  } else if (!isVersionCompatible(data.version)) {
    warnings.push(`Version ${data.version} may not be fully compatible with current ${CURRENT_VERSION}`);
  }

  // Validate sequencer data
  if (!data.data || !Array.isArray(data.data)) {
    errors.push('Invalid sequencer data: missing or not an array');
  } else if (data.data.length !== 7) {
    errors.push(`Invalid track count: expected 7, got ${data.data.length}`);
  } else {
    data.data.forEach((track: number[], idx: number) => {
      if (!Array.isArray(track) || track.length !== 32) {
        errors.push(`Invalid track ${idx}: expected 32 steps, got ${track?.length || 0}`);
      } else {
        track.forEach((step: number, stepIdx: number) => {
          if (typeof step !== 'number' || step < 0 || step > 3) {
            errors.push(`Invalid step value at track ${idx}, step ${stepIdx}: ${step}`);
          }
        });
      }
    });
  }

  // Validate genre
  if (!data.genre || typeof data.genre !== 'string') {
    warnings.push('Missing or invalid genre, will default to SYNTHWAVE');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function sanitizeStoredState(data: any): StoredState | null {
  const validation = validateStoredState(data);

  if (!validation.valid) {
    log.error('Invalid stored state:', validation.errors);
    return null;
  }

  if (validation.warnings.length > 0) {
    log.warn('Stored state warnings:', validation.warnings);
  }

  return {
    data: data.data || Array(7).fill(null).map(() => Array(32).fill(0)),
    genre: data.genre || 'SYNTHWAVE',
    version: data.version || '3.0.0',
    timestamp: data.timestamp || Date.now()
  };
}

function isVersionCompatible(version: string): boolean {
  try {
    const currentParts = CURRENT_VERSION.split('.').map(Number);
    const minParts = MIN_VERSION.split('.').map(Number);
    const dataParts = version.split('.').map(Number);

    // Check if version is >= MIN_VERSION and <= CURRENT_VERSION
    for (let i = 0; i < 3; i++) {
      if (dataParts[i] < minParts[i]) return false;
      if (dataParts[i] > minParts[i]) break;
    }

    for (let i = 0; i < 3; i++) {
      if (dataParts[i] > currentParts[i]) return false;
      if (dataParts[i] < currentParts[i]) break;
    }

    return true;
  } catch {
    return false;
  }
}

export function createAppError(code: string, message: string, details?: any, recoverable: boolean = true) {
  return {
    code,
    message,
    details,
    recoverable
  };
}

export function isAudioContextError(error: any): boolean {
  return error && (
    error.name === 'InvalidStateError' ||
    error.name === 'NotSupportedError' ||
    error.message?.includes('AudioContext')
  );
}

export function isNetworkError(error: any): boolean {
  return error && (
    error.name === 'NetworkError' ||
    error.message?.includes('fetch') ||
    error.message?.includes('network')
  );
}

export function getHumanReadableError(error: AppError): string {
  const errorMessages: Record<string, string> = {
    'AUDIO_INIT_FAILED': 'Audio initialization failed. Please check your browser settings.',
    'WORKLET_LOAD_FAILED': 'DSP processor failed to load. Running in fallback mode.',
    'WASM_COMPILE_FAILED': 'Native acceleration unavailable. Using JavaScript processing.',
    'MAGENTA_INIT_FAILED': 'AI engine failed to initialize. Pattern generation unavailable.',
    'STORAGE_CORRUPT': 'Saved data corrupted. Starting with fresh session.',
    'MEMORY_LEAK_DETECTED': 'Performance warning: Memory usage high. Consider refreshing.',
    'GENRE_INVALID': 'Invalid genre selected. Falling back to SYNTHWAVE.',
    'PARAMETER_OUT_OF_RANGE': 'Parameter value out of valid range.',
    'SYNTH_CREATE_FAILED': 'Failed to create synthesizer. This may indicate insufficient resources.'
  };

  return errorMessages[error.code] || error.message;
}
