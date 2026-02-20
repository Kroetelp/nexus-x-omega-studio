/**
 * Centralized error handling for NEXUS-X
 */

import type { AppError } from '../types/index.js';
import { createAppError, getHumanReadableError } from '../utils/validators.js';

export class ErrorHandler {
  private static instance: ErrorHandler;
  private toastContainer: HTMLElement | null = null;
  private errorHistory: AppError[] = [];
  private maxHistorySize = 100;

  private constructor() {
    this.initializeToastContainer();
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private initializeToastContainer() {
    this.toastContainer = document.getElementById('toast-container');
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      document.body.appendChild(this.toastContainer);
    }
  }

  private setupGlobalErrorHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError(createAppError(
        'UNCAUGHT_ERROR',
        event.message || 'An unexpected error occurred',
        { filename: event.filename, lineno: event.lineno },
        false
      ));
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(createAppError(
        'UNHANDLED_PROMISE',
        event.reason?.message || 'An async operation failed',
        { reason: event.reason },
        false
      ));
    });
  }

  handleError(error: AppError | Error | string): void {
    let appError: AppError;

    if (typeof error === 'string') {
      appError = createAppError('GENERAL_ERROR', error);
    } else if (error instanceof Error) {
      appError = createAppError(
        'RUNTIME_ERROR',
        error.message,
        { stack: error.stack }
      );
    } else {
      appError = error;
    }

    // Log to console
    console.error(`[${appError.code}]`, appError.message, appError.details);

    // Add to history
    this.errorHistory.push(appError);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Show user notification
    this.showErrorToast(appError);

    // Send to error tracking service (if configured)
    // this.sendToErrorTracking(appError);
  }

  private showErrorToast(error: AppError): void {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.innerHTML = `
      <span class="toast-icon">${error.recoverable ? '⚠️' : '❌'}</span>
      <span class="toast-message">${getHumanReadableError(error)}</span>
    `;

    this.toastContainer.appendChild(toast);

    // Auto-remove after 4 seconds for recoverable errors, longer for critical
    const duration = error.recoverable ? 4000 : 8000;
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  showInfo(message: string, duration: number = 3000): void {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-info';
    toast.innerHTML = `
      <span class="toast-icon">ℹ️</span>
      <span class="toast-message">${message}</span>
    `;

    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  showSuccess(message: string, duration: number = 3000): void {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `
      <span class="toast-icon">✅</span>
      <span class="toast-message">${message}</span>
    `;

    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  getErrorHistory(): AppError[] {
    return [...this.errorHistory];
  }

  clearErrorHistory(): void {
    this.errorHistory = [];
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();
