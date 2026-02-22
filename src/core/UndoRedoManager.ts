/**
 * Undo/Redo Manager for NEXUS-X
 */

import type { Command, UndoStack } from '../types/index.js';
import { errorHandler } from './ErrorHandler.js';

export class UndoRedoManager {
  private static instance: UndoRedoManager;
  private stack: UndoStack = {
    past: [],
    future: [],
    maxSize: 100
  };

  private constructor() {
    this.setupKeyboardShortcuts();
    this.addUIButtons();
  }

  static getInstance(): UndoRedoManager {
    if (!UndoRedoManager.instance) {
      UndoRedoManager.instance = new UndoRedoManager();
    }
    return UndoRedoManager.instance;
  }

  execute(command: Command): void {
    try {
      command.execute();
      this.stack.past.push(command);
      this.stack.future = [];

      if (this.stack.past.length > this.stack.maxSize) {
        this.stack.past.shift();
      }

      this.updateUI();
    } catch (error) {
      errorHandler.handleError({
        code: 'COMMAND_FAILED',
        message: `Failed to execute: ${command.description}`,
        details: error,
        recoverable: true
      });
    }
  }

  undo(): boolean {
    if (this.stack.past.length === 0) {
      return false;
    }

    const command = this.stack.past.pop();
    if (!command) return false;

    try {
      command.undo();
      this.stack.future.push(command);
      this.updateUI();
      return true;
    } catch (error) {
      this.stack.past.push(command);
      errorHandler.handleError({
        code: 'UNDO_FAILED',
        message: `Failed to undo: ${command.description}`,
        details: error,
        recoverable: true
      });
      return false;
    }
  }

  redo(): boolean {
    if (this.stack.future.length === 0) {
      return false;
    }

    const command = this.stack.future.pop();
    if (!command) return false;

    try {
      command.execute();
      this.stack.past.push(command);
      this.updateUI();
      return true;
    } catch (error) {
      this.stack.future.push(command);
      errorHandler.handleError({
        code: 'REDO_FAILED',
        message: `Failed to redo: ${command.description}`,
        details: error,
        recoverable: true
      });
      return false;
    }
  }

  canUndo(): boolean {
    return this.stack.past.length > 0;
  }

  canRedo(): boolean {
    return this.stack.future.length > 0;
  }

  clear(): void {
    this.stack.past = [];
    this.stack.future = [];
    this.updateUI();
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        this.undo();
      }

      if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        this.redo();
      }
    });
  }

  private addUIButtons(): void {
    const header = document.querySelector('header.app-bar');
    if (!header) return;

    // Create button container
    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display: flex; gap: 5px;';

    // Undo button
    const undoBtn = document.createElement('button');
    undoBtn.id = 'undoBtn';
    undoBtn.className = 'btn';
    undoBtn.innerHTML = '↶ Undo';
    undoBtn.disabled = true;
    undoBtn.onclick = () => this.undo();

    // Redo button
    const redoBtn = document.createElement('button');
    redoBtn.id = 'redoBtn';
    redoBtn.className = 'btn';
    redoBtn.innerHTML = '↷ Redo';
    redoBtn.disabled = true;
    redoBtn.onclick = () => this.redo();

    btnGroup.appendChild(undoBtn);
    btnGroup.appendChild(redoBtn);
    header.appendChild(btnGroup);
  }

  private updateUI(): void {
    const undoBtn = document.getElementById('undoBtn') as HTMLButtonElement | null;
    const redoBtn = document.getElementById('redoBtn') as HTMLButtonElement | null;

    if (undoBtn) {
      undoBtn.disabled = !this.canUndo();
      undoBtn.title = this.stack.past.length > 0
        ? `Undo: ${this.stack.past[this.stack.past.length - 1].description}`
        : 'Undo (Ctrl+Z)';
    }

    if (redoBtn) {
      redoBtn.disabled = !this.canRedo();
      redoBtn.title = this.stack.future.length > 0
        ? `Redo: ${this.stack.future[this.stack.future.length - 1].description}`
        : 'Redo (Ctrl+Y)';
    }
  }
}

export const undoRedoManager = UndoRedoManager.getInstance();

export const CommandFactory = {
  sequencerChange: (trackIndex: number, stepIndex: number, oldValue: number, newValue: number, applyFn: Function) => ({
    execute: () => applyFn(trackIndex, stepIndex, newValue),
    undo: () => applyFn(trackIndex, stepIndex, oldValue),
    description: `Changed track ${trackIndex + 1}, step ${stepIndex + 1}`,
    timestamp: Date.now()
  }),

  parameterChange: (parameterName: string, oldValue: number, newValue: number, applyFn: Function) => ({
    execute: () => applyFn(parameterName, newValue),
    undo: () => applyFn(parameterName, oldValue),
    description: `Changed ${parameterName}`,
    timestamp: Date.now()
  }),

  snapshotLoad: (snapshotIndex: number, oldData: number[][], newData: number[][], applyFn: Function) => ({
    execute: () => applyFn(snapshotIndex, newData),
    undo: () => applyFn(snapshotIndex, oldData),
    description: `Loaded snapshot ${snapshotIndex + 1}`,
    timestamp: Date.now()
  }),

  mutation: (trackIndex: number, oldData: number[], newData: number[], applyFn: Function) => ({
    execute: () => applyFn(trackIndex, newData),
    undo: () => applyFn(trackIndex, oldData),
    description: `Mutated track ${trackIndex + 1}`,
    timestamp: Date.now()
  }),

  clearGrid: (oldData: number[][], applyFn: Function) => {
    const newData = Array(7).fill(null).map(() => Array(32).fill(0));
    return {
      execute: () => applyFn(newData),
      undo: () => applyFn(oldData),
      description: 'Cleared all grid patterns',
      timestamp: Date.now()
    };
  },

  composite: (commands: Command[], description: string): Command => ({
    execute: () => commands.forEach(cmd => cmd.execute()),
    undo: () => [...commands].reverse().forEach(cmd => cmd.undo()),
    description,
    timestamp: Date.now()
  })
};
