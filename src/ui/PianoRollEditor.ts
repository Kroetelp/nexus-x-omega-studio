/**
 * NEXUS-X Piano Roll Editor v5.0
 * Professional MIDI-style note editor with real-time playback
 *
 * Features:
 * - Canvas-based rendering for smooth performance
 * - Note drawing, resizing, and moving
 * - Velocity editing
 * - Grid snapping
 * - Multiple instrument support
 * - Undo/Redo support
 */

import * as Tone from 'tone';
import { instrumentRegistry } from '../audio/core/InstrumentRegistry';
import { MessageType } from '../audio/core/types';

// ============================================================
// TYPES
// ============================================================

export interface PianoRollNote {
    id: string;
    pitch: number;          // 0-127 MIDI note
    start: number;          // Start time in beats
    duration: number;       // Duration in beats
    velocity: number;       // 0-127
    instrumentId: number;   // Which instrument plays this note
    selected: boolean;
}

export interface PianoRollConfig {
    minPitch?: number;      // Default: 36 (C2)
    maxPitch?: number;      // Default: 84 (C6)
    beatsPerMeasure?: number;
    totalMeasures?: number;
    gridSubdivision?: number; // 4 = 16th notes, 8 = 32nd notes
}

interface NoteEdit {
    type: 'add' | 'delete' | 'move' | 'resize' | 'velocity';
    note: PianoRollNote;
    oldValue?: any;
    newValue?: any;
}

// ============================================================
// PIANO ROLL EDITOR
// ============================================================

export class PianoRollEditor {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private pianoCanvas: HTMLCanvasElement;
    private pianoCtx: CanvasRenderingContext2D;
    private headerCanvas: HTMLCanvasElement;
    private headerCtx: CanvasRenderingContext2D;

    // Configuration
    private config: Required<PianoRollConfig>;

    // Dimensions
    private noteWidth: number = 20;     // Width per pitch row
    private beatWidth: number = 40;     // Width per beat
    private pianoWidth: number = 60;    // Width of piano key area
    private headerHeight: number = 30;  // Height of beat numbers

    // State
    private notes: Map<string, PianoRollNote> = new Map();
    private selectedNotes: Set<string> = new Set();
    private currentInstrumentId: number = 1;
    private playheadPosition: number = 0; // In beats
    private isPlaying: boolean = false;

    // Interaction
    private isDragging: boolean = false;
    private dragMode: 'draw' | 'select' | 'move' | 'resize-left' | 'resize-right' | 'velocity' = 'draw';
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private dragNote: PianoRollNote | null = null;
    private dragOriginalNote: PianoRollNote | null = null;
    private selectionBox: { x: number; y: number; width: number; height: number } | null = null;

    // Scroll
    private scrollX: number = 0;
    private scrollY: number = 0;

    // Undo/Redo
    private undoStack: NoteEdit[] = [];
    private redoStack: NoteEdit[] = [];
    private maxUndoSteps: number = 50;

    // Colors
    private readonly COLORS = {
        bg: '#0a0a0a',
        gridLight: '#1a1a1a',
        gridDark: '#222222',
        gridBeat: '#333333',
        pianoWhite: '#e8e8e8',
        pianoBlack: '#1a1a1a',
        pianoWhiteHover: '#ffffff',
        pianoBlackHover: '#333333',
        noteDefault: '#00ff94',
        noteSelected: '#ff00cc',
        noteHover: '#00e5ff',
        noteBorder: '#ffffff',
        playhead: '#ff0055',
        selection: 'rgba(0, 255, 148, 0.2)',
        selectionBorder: '#00ff94',
        text: '#888888',
        textLight: '#cccccc',
        // Velocity gradient colors (green -> yellow -> red)
        velocityLow: '#00ff00',      // 0-42
        velocityMid: '#ffff00',      // 43-84
        velocityHigh: '#ff4400',     // 85-127
        velocityLane: '#1a1a1a',
    };

    // Velocity lane height
    private velocityLaneHeight: number = 60;

    // Note names for display
    private static readonly NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    constructor(container: HTMLElement, config: PianoRollConfig = {}) {
        this.container = container;
        this.config = {
            minPitch: config.minPitch ?? 36,
            maxPitch: config.maxPitch ?? 84,
            beatsPerMeasure: config.beatsPerMeasure ?? 4,
            totalMeasures: config.totalMeasures ?? 16,
            gridSubdivision: config.gridSubdivision ?? 4,
        };

        // Create canvases
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;

        this.pianoCanvas = document.createElement('canvas');
        this.pianoCtx = this.pianoCanvas.getContext('2d')!;

        this.headerCanvas = document.createElement('canvas');
        this.headerCtx = this.headerCanvas.getContext('2d')!;

        // Setup
        this.setupDOM();
        this.setupEvents();
        this.resize();

        // Initial render
        this.render();
    }

    // ============================================================
    // DOM SETUP
    // ============================================================

    private setupDOM(): void {
        this.container.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            background: ${this.COLORS.bg};
            overflow: hidden;
            font-family: 'JetBrains Mono', monospace;
        `;

        // Piano keys (left)
        this.pianoCanvas.style.cssText = `
            position: absolute;
            left: 0;
            top: ${this.headerHeight}px;
            z-index: 10;
            cursor: pointer;
        `;

        // Header (top)
        this.headerCanvas.style.cssText = `
            position: absolute;
            left: ${this.pianoWidth}px;
            top: 0;
            z-index: 10;
            cursor: pointer;
        `;

        // Main grid
        this.canvas.style.cssText = `
            position: absolute;
            left: ${this.pianoWidth}px;
            top: ${this.headerHeight}px;
            cursor: crosshair;
        `;

        this.container.appendChild(this.pianoCanvas);
        this.container.appendChild(this.headerCanvas);
        this.container.appendChild(this.canvas);

        // Add toolbar
        this.createToolbar();
    }

    private createToolbar(): void {
        const toolbar = document.createElement('div');
        toolbar.className = 'piano-roll-toolbar';
        toolbar.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            height: ${this.headerHeight}px;
            width: ${this.pianoWidth}px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            background: linear-gradient(180deg, #1a1a1a, #0f0f0f);
            border-bottom: 1px solid #333;
            z-index: 20;
        `;

        // Draw mode button
        const drawBtn = this.createToolButton('✏️', 'Draw Mode (D)', () => this.setDragMode('draw'));
        drawBtn.id = 'pr-draw-btn';
        drawBtn.classList.add('active');

        // Select mode button
        const selectBtn = this.createToolButton('⬚', 'Select Mode (S)', () => this.setDragMode('select'));
        selectBtn.id = 'pr-select-btn';

        // Eraser button
        const eraserBtn = this.createToolButton('🗑️', 'Eraser (E)', () => this.setDragMode('select'));
        eraserBtn.id = 'pr-eraser-btn';

        // Separator
        const sep = document.createElement('div');
        sep.style.cssText = `width: 1px; height: 20px; background: #333; margin: 0 4px;`;

        // Zoom buttons
        const zoomInBtn = this.createToolButton('➕', 'Zoom In (+)', () => this.zoom(1.2));
        const zoomOutBtn = this.createToolButton('➖', 'Zoom Out (-)', () => this.zoom(0.8));

        toolbar.appendChild(drawBtn);
        toolbar.appendChild(selectBtn);
        toolbar.appendChild(eraserBtn);
        toolbar.appendChild(sep);
        toolbar.appendChild(zoomInBtn);
        toolbar.appendChild(zoomOutBtn);

        this.container.appendChild(toolbar);
    }

    private createToolButton(icon: string, title: string, onClick: () => void): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.innerHTML = icon;
        btn.title = title;
        btn.style.cssText = `
            width: 24px;
            height: 24px;
            background: #222;
            border: 1px solid #333;
            border-radius: 4px;
            color: #888;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s;
        `;
        btn.onmouseenter = () => {
            btn.style.background = '#333';
            btn.style.color = '#fff';
        };
        btn.onmouseleave = () => {
            btn.style.background = '#222';
            btn.style.color = '#888';
        };
        btn.onclick = onClick;
        return btn;
    }

    // ============================================================
    // RESIZE & RENDER
    // ============================================================

    resize(): void {
        const rect = this.container.getBoundingClientRect();
        const width = rect.width - this.pianoWidth;
        const height = rect.height - this.headerHeight;

        // Main canvas
        this.canvas.width = width;
        this.canvas.height = height;

        // Piano canvas
        this.pianoCanvas.width = this.pianoWidth;
        this.pianoCanvas.height = height;

        // Header canvas
        this.headerCanvas.width = width;
        this.headerCanvas.height = this.headerHeight;

        this.render();
    }

    render(): void {
        this.renderGrid();
        this.renderNotes();
        this.renderVelocityLane();
        this.renderPiano();
        this.renderHeader();
    }

    /**
     * Render all notes
     */
    private renderNotes(): void {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(-this.scrollX, -this.scrollY);

        this.notes.forEach(note => {
            this.renderNote(ctx, note);
        });

        ctx.restore();
    }

    /**
     * Render velocity lane at bottom (FL Studio style)
     */
    private renderVelocityLane(): void {
        const ctx = this.ctx;
        const totalBeats = this.config.totalMeasures * this.config.beatsPerMeasure;
        const pitchRange = this.config.maxPitch - this.config.minPitch;
        const laneY = pitchRange * this.noteWidth + 10; // Below piano roll
        const laneHeight = this.velocityLaneHeight;

        ctx.save();
        ctx.translate(-this.scrollX, 0);

        // Background
        ctx.fillStyle = this.COLORS.velocityLane;
        ctx.fillRect(0, laneY, totalBeats * this.beatWidth, laneHeight);

        // Border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, laneY);
        ctx.lineTo(totalBeats * this.beatWidth, laneY);
        ctx.stroke();

        // Draw velocity bars for each note
        this.notes.forEach(note => {
            const x = note.start * this.beatWidth;
            const barHeight = (note.velocity / 127) * (laneHeight - 10);
            const barWidth = Math.max(3, note.duration * this.beatWidth - 2);

            // Velocity color
            const color = this.velocityToColor(note.velocity);

            // Bar
            ctx.fillStyle = color;
            ctx.fillRect(x + 1, laneY + laneHeight - barHeight - 5, barWidth, barHeight);

            // Highlight on selection
            if (note.selected) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 1, laneY + laneHeight - barHeight - 5, barWidth, barHeight);
            }
        });

        // Label
        ctx.fillStyle = '#666';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText('VELOCITY', 5, laneY + 15);

        // Velocity range labels
        ctx.fillText('127', 5, laneY + 30);
        ctx.fillText('0', 5, laneY + laneHeight - 5);

        ctx.restore();
    }

    private renderGrid(): void {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const totalBeats = this.config.totalMeasures * this.config.beatsPerMeasure;
        const pitchRange = this.config.maxPitch - this.config.minPitch;

        // Clear
        ctx.fillStyle = this.COLORS.bg;
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        ctx.save();
        ctx.translate(-this.scrollX, -this.scrollY);

        // Vertical lines (beats and subdivisions)
        const subWidth = this.beatWidth / this.config.gridSubdivision;
        for (let beat = 0; beat <= totalBeats; beat++) {
            const x = beat * this.beatWidth;

            // Subdivisions
            for (let sub = 1; sub < this.config.gridSubdivision; sub++) {
                const subX = x + sub * subWidth;
                ctx.strokeStyle = this.COLORS.gridLight;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(subX, 0);
                ctx.lineTo(subX, pitchRange * this.noteWidth);
                ctx.stroke();
            }

            // Beat line
            ctx.strokeStyle = (beat % this.config.beatsPerMeasure === 0)
                ? this.COLORS.gridBeat
                : this.COLORS.gridDark;
            ctx.lineWidth = (beat % this.config.beatsPerMeasure === 0) ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, pitchRange * this.noteWidth);
            ctx.stroke();
        }

        // Horizontal lines (pitches)
        for (let pitch = this.config.minPitch; pitch <= this.config.maxPitch; pitch++) {
            const y = (this.config.maxPitch - pitch) * this.noteWidth;
            const isBlack = this.isBlackKey(pitch);
            const isC = (pitch % 12) === 0;

            // Row background
            ctx.fillStyle = isBlack ? this.COLORS.gridDark : this.COLORS.gridLight;
            ctx.fillRect(0, y, totalBeats * this.beatWidth, this.noteWidth);

            // Separator line
            ctx.strokeStyle = this.COLORS.gridDark;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(totalBeats * this.beatWidth, y);
            ctx.stroke();

            // C note highlight
            if (isC) {
                ctx.fillStyle = 'rgba(0, 255, 148, 0.05)';
                ctx.fillRect(0, y, totalBeats * this.beatWidth, this.noteWidth);
            }
        }

        // Draw notes
        this.notes.forEach(note => {
            this.renderNote(ctx, note);
        });

        // Selection box
        if (this.selectionBox) {
            ctx.fillStyle = this.COLORS.selection;
            ctx.strokeStyle = this.COLORS.selectionBorder;
            ctx.lineWidth = 1;
            ctx.fillRect(
                this.selectionBox.x,
                this.selectionBox.y,
                this.selectionBox.width,
                this.selectionBox.height
            );
            ctx.strokeRect(
                this.selectionBox.x,
                this.selectionBox.y,
                this.selectionBox.width,
                this.selectionBox.height
            );
        }

        // Playhead
        if (this.playheadPosition >= 0) {
            const playheadX = this.playheadPosition * this.beatWidth;
            ctx.strokeStyle = this.COLORS.playhead;
            ctx.lineWidth = 2;
            ctx.shadowColor = this.COLORS.playhead;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(playheadX, 0);
            ctx.lineTo(playheadX, pitchRange * this.noteWidth);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    private renderNote(ctx: CanvasRenderingContext2D, note: PianoRollNote): void {
        const x = note.start * this.beatWidth;
        const y = (this.config.maxPitch - note.pitch) * this.noteWidth;
        const width = note.duration * this.beatWidth;
        const height = this.noteWidth - 2;

        // Note color based on velocity (FL Studio style gradient)
        let color = note.selected ? this.COLORS.noteSelected : this.velocityToColor(note.velocity);

        // Draw note body with gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.darkenColor(color, 0.3));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, width - 2, height, 3);
        ctx.fill();

        // Velocity bar at bottom of note (shows intensity)
        const velHeight = (note.velocity / 127) * (height - 4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(x + width - 6, y + height - velHeight + 1, 4, velHeight);

        // Border
        ctx.strokeStyle = note.selected ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = note.selected ? 2 : 1;
        ctx.stroke();

        // Note name (if wide enough)
        if (width > 30) {
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.fillText(this.getNoteName(note.pitch), x + 4, y + height - 4);
        }

        // Velocity value (if very wide)
        if (width > 60) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(`v${note.velocity}`, x + 4, y + 12);
        }
    }

    /**
     * Darken a color by a factor
     */
    private darkenColor(color: string, factor: number): string {
        // Parse rgb values
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return color;

        const r = Math.round(parseInt(match[1]) * (1 - factor));
        const g = Math.round(parseInt(match[2]) * (1 - factor));
        const b = Math.round(parseInt(match[3]) * (1 - factor));

        return `rgb(${r}, ${g}, ${b})`;
    }

    private renderPiano(): void {
        const ctx = this.pianoCtx;
        const width = this.pianoWidth;
        const height = this.pianoCanvas.height;
        const pitchRange = this.config.maxPitch - this.config.minPitch;

        ctx.clearRect(0, 0, width, height);

        for (let pitch = this.config.minPitch; pitch <= this.config.maxPitch; pitch++) {
            const y = (this.config.maxPitch - pitch) * this.noteWidth - this.scrollY;
            const isBlack = this.isBlackKey(pitch);
            const isC = (pitch % 12) === 0;

            // Skip if out of view
            if (y < -this.noteWidth || y > height) continue;

            // Key background
            ctx.fillStyle = isBlack ? this.COLORS.pianoBlack : this.COLORS.pianoWhite;
            ctx.fillRect(0, y, width, this.noteWidth);

            // Border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, y, width, this.noteWidth);

            // Note name for C notes
            if (isC || (pitch === this.config.minPitch)) {
                ctx.fillStyle = isBlack ? '#888' : '#333';
                ctx.font = '10px JetBrains Mono';
                ctx.fillText(this.getNoteName(pitch), 5, y + this.noteWidth - 5);
            }
        }
    }

    private renderHeader(): void {
        const ctx = this.headerCtx;
        const width = this.headerCanvas.width;
        const totalBeats = this.config.totalMeasures * this.config.beatsPerMeasure;

        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(0, 0, width, this.headerHeight);

        ctx.save();
        ctx.translate(-this.scrollX, 0);

        for (let beat = 0; beat <= totalBeats; beat++) {
            const x = beat * this.beatWidth;

            // Measure number
            if (beat % this.config.beatsPerMeasure === 0) {
                const measure = Math.floor(beat / this.config.beatsPerMeasure) + 1;
                ctx.fillStyle = this.COLORS.textLight;
                ctx.font = 'bold 11px JetBrains Mono';
                ctx.fillText(`${measure}`, x + 4, 18);

                // Measure line
                ctx.strokeStyle = '#444';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, this.headerHeight);
                ctx.lineTo(x, 0);
                ctx.stroke();
            } else {
                // Beat tick
                ctx.fillStyle = this.COLORS.text;
                ctx.font = '9px JetBrains Mono';
                ctx.fillText(`${(beat % this.config.beatsPerMeasure) + 1}`, x + 4, 18);
            }
        }

        ctx.restore();
    }

    // ============================================================
    // EVENT HANDLING
    // ============================================================

    private setupEvents(): void {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
        this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
        this.canvas.addEventListener('wheel', this.onWheel.bind(this));

        // Keyboard events
        this.container.addEventListener('keydown', this.onKeyDown.bind(this));
        this.container.tabIndex = 0; // Make focusable

        // Piano key clicks (preview notes)
        this.pianoCanvas.addEventListener('mousedown', this.onPianoClick.bind(this));

        // Header clicks (jump to position)
        this.headerCanvas.addEventListener('click', this.onHeaderClick.bind(this));

        // Window resize
        window.addEventListener('resize', () => this.resize());
    }

    private onMouseDown(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.scrollX;
        const y = e.clientY - rect.top + this.scrollY;

        this.dragStartX = x;
        this.dragStartY = y;
        this.isDragging = true;

        const clickedNote = this.getNoteAtPosition(x, y);

        if (e.button === 2) { // Right click - delete
            if (clickedNote) {
                this.deleteNote(clickedNote.id);
            }
            return;
        }

        switch (this.dragMode) {
            case 'draw':
                if (clickedNote) {
                    // Start moving existing note
                    this.dragMode = 'move';
                    this.dragNote = clickedNote;
                    this.dragOriginalNote = { ...clickedNote };
                    this.selectNote(clickedNote.id, !e.shiftKey);
                } else {
                    // Create new note
                    const pitch = this.yToPitch(y);
                    const start = this.snapToGrid(this.xToBeat(x));
                    const note = this.createNote(pitch, start, 1, 100);
                    this.dragNote = note;
                    this.dragOriginalNote = { ...note };
                    this.dragMode = 'resize-right';
                }
                break;

            case 'select':
                if (clickedNote) {
                    this.selectNote(clickedNote.id, !e.shiftKey);
                } else {
                    // Start selection box
                    this.selectionBox = { x, y, width: 0, height: 0 };
                }
                break;
        }
    }

    private onMouseMove(e: MouseEvent): void {
        if (!this.isDragging) {
            // Hover cursor
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left + this.scrollX;
            const y = e.clientY - rect.top + this.scrollY;
            const hoveredNote = this.getNoteAtPosition(x, y);

            if (hoveredNote) {
                const noteX = hoveredNote.start * this.beatWidth;
                const noteEnd = (hoveredNote.start + hoveredNote.duration) * this.beatWidth;

                if (x < noteX + 5) {
                    this.canvas.style.cursor = 'w-resize';
                } else if (x > noteEnd - 5) {
                    this.canvas.style.cursor = 'e-resize';
                } else {
                    this.canvas.style.cursor = 'move';
                }
            } else {
                this.canvas.style.cursor = this.dragMode === 'draw' ? 'crosshair' : 'default';
            }
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.scrollX;
        const y = e.clientY - rect.top + this.scrollY;

        if (this.dragMode === 'move' && this.dragNote && this.dragOriginalNote) {
            const deltaX = x - this.dragStartX;
            const deltaY = y - this.dragStartY;

            const newPitch = Math.max(this.config.minPitch,
                Math.min(this.config.maxPitch,
                    this.dragOriginalNote.pitch - Math.round(deltaY / this.noteWidth)));

            const newStart = Math.max(0,
                this.snapToGrid(this.dragOriginalNote.start + deltaX / this.beatWidth));

            this.dragNote.pitch = newPitch;
            this.dragNote.start = newStart;
            this.render();
        } else if (this.dragMode === 'resize-right' && this.dragNote && this.dragOriginalNote) {
            const deltaX = x - this.dragStartX;
            const newDuration = Math.max(0.25,
                this.snapToGrid(this.dragOriginalNote.duration + deltaX / this.beatWidth));
            this.dragNote.duration = newDuration;
            this.render();
        } else if (this.selectionBox) {
            this.selectionBox.width = x - this.selectionBox.x;
            this.selectionBox.height = y - this.selectionBox.y;
            this.render();
        }
    }

    private onMouseUp(e: MouseEvent): void {
        if (this.selectionBox) {
            this.selectNotesInBox();
            this.selectionBox = null;
        }

        if (this.dragNote && this.dragOriginalNote) {
            // Record edit for undo
            if (this.dragMode === 'resize-right' && this.notes.has(this.dragNote.id)) {
                this.recordEdit('add', this.dragNote);
            }
        }

        this.isDragging = false;
        this.dragNote = null;
        this.dragOriginalNote = null;
        this.dragMode = 'draw';
        this.render();
    }

    private onDoubleClick(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.scrollX;
        const y = e.clientY - rect.top + this.scrollY;

        const note = this.getNoteAtPosition(x, y);
        if (note) {
            this.deleteNote(note.id);
        }
    }

    private onWheel(e: WheelEvent): void {
        e.preventDefault();

        if (e.ctrlKey) {
            // Zoom
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom(factor);
        } else if (e.shiftKey) {
            // Horizontal scroll
            this.scrollX = Math.max(0, this.scrollX + e.deltaY);
        } else {
            // Vertical scroll
            this.scrollY = Math.max(0, this.scrollY + e.deltaY);
        }

        this.render();
    }

    private onKeyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case 'Delete':
            case 'Backspace':
                this.deleteSelectedNotes();
                break;
            case 'z':
                if (e.ctrlKey || e.metaKey) {
                    e.shiftKey ? this.redo() : this.undo();
                }
                break;
            case 'a':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.selectAll();
                }
                break;
            case 'd':
                this.setDragMode('draw');
                break;
            case 's':
                if (!e.ctrlKey) this.setDragMode('select');
                break;
            case 'Escape':
                this.clearSelection();
                break;
            case '+':
            case '=':
                this.zoom(1.2);
                break;
            case '-':
                this.zoom(0.8);
                break;
        }
    }

    private onPianoClick(e: MouseEvent): void {
        const rect = this.pianoCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top + this.scrollY;
        const pitch = this.yToPitch(y);

        // Play preview note
        this.playNotePreview(pitch);
    }

    private onHeaderClick(e: MouseEvent): void {
        const rect = this.headerCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.scrollX;
        const beat = this.xToBeat(x);

        this.setPlayheadPosition(beat);

        // Emit event
        this.container.dispatchEvent(new CustomEvent('seek', { detail: { beat } }));
    }

    // ============================================================
    // NOTE MANAGEMENT
    // ============================================================

    private createNote(pitch: number, start: number, duration: number, velocity: number): PianoRollNote {
        const id = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const note: PianoRollNote = {
            id,
            pitch,
            start,
            duration,
            velocity,
            instrumentId: this.currentInstrumentId,
            selected: false,
        };

        this.notes.set(id, note);
        this.container.dispatchEvent(new CustomEvent('noteadd', { detail: note }));

        return note;
    }

    private deleteNote(id: string): void {
        const note = this.notes.get(id);
        if (note) {
            this.recordEdit('delete', note);
            this.notes.delete(id);
            this.selectedNotes.delete(id);
            this.container.dispatchEvent(new CustomEvent('notedelete', { detail: note }));
            this.render();
        }
    }

    private deleteSelectedNotes(): void {
        const toDelete = Array.from(this.selectedNotes);
        toDelete.forEach(id => {
            const note = this.notes.get(id);
            if (note) {
                this.recordEdit('delete', note);
                this.notes.delete(id);
                this.container.dispatchEvent(new CustomEvent('notedelete', { detail: note }));
            }
        });
        this.selectedNotes.clear();
        this.render();
    }

    // ============================================================
    // SELECTION
    // ============================================================

    private selectNote(id: string, exclusive: boolean = true): void {
        if (exclusive) {
            this.selectedNotes.forEach(nid => {
                const note = this.notes.get(nid);
                if (note) note.selected = false;
            });
            this.selectedNotes.clear();
        }

        const note = this.notes.get(id);
        if (note) {
            note.selected = true;
            this.selectedNotes.add(id);
        }
        this.render();
    }

    private selectAll(): void {
        this.notes.forEach((note, id) => {
            note.selected = true;
            this.selectedNotes.add(id);
        });
        this.render();
    }

    private clearSelection(): void {
        this.selectedNotes.forEach(id => {
            const note = this.notes.get(id);
            if (note) note.selected = false;
        });
        this.selectedNotes.clear();
        this.render();
    }

    private selectNotesInBox(): void {
        if (!this.selectionBox) return;

        const box = {
            x1: Math.min(this.selectionBox.x, this.selectionBox.x + this.selectionBox.width),
            x2: Math.max(this.selectionBox.x, this.selectionBox.x + this.selectionBox.width),
            y1: Math.min(this.selectionBox.y, this.selectionBox.y + this.selectionBox.height),
            y2: Math.max(this.selectionBox.y, this.selectionBox.y + this.selectionBox.height),
        };

        this.notes.forEach((note, id) => {
            const noteX1 = note.start * this.beatWidth;
            const noteX2 = (note.start + note.duration) * this.beatWidth;
            const noteY = (this.config.maxPitch - note.pitch) * this.noteWidth;

            if (noteX1 < box.x2 && noteX2 > box.x1 &&
                noteY < box.y2 && noteY + this.noteWidth > box.y1) {
                note.selected = true;
                this.selectedNotes.add(id);
            }
        });
    }

    // ============================================================
    // UNDO / REDO
    // ============================================================

    private recordEdit(type: NoteEdit['type'], note: PianoRollNote, oldValue?: any, newValue?: any): void {
        this.undoStack.push({
            type,
            note: { ...note },
            oldValue,
            newValue,
        });

        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }

        this.redoStack = [];
    }

    undo(): void {
        const edit = this.undoStack.pop();
        if (!edit) return;

        switch (edit.type) {
            case 'add':
                this.notes.delete(edit.note.id);
                this.redoStack.push(edit);
                break;
            case 'delete':
                this.notes.set(edit.note.id, edit.note);
                this.redoStack.push(edit);
                break;
        }

        this.render();
    }

    redo(): void {
        const edit = this.redoStack.pop();
        if (!edit) return;

        switch (edit.type) {
            case 'add':
                this.notes.set(edit.note.id, edit.note);
                this.undoStack.push(edit);
                break;
            case 'delete':
                this.notes.delete(edit.note.id);
                this.undoStack.push(edit);
                break;
        }

        this.render();
    }

    // ============================================================
    // UTILITY METHODS
    // ============================================================

    private xToBeat(x: number): number {
        return x / this.beatWidth;
    }

    private yToPitch(y: number): number {
        return this.config.maxPitch - Math.floor(y / this.noteWidth);
    }

    private snapToGrid(beat: number): number {
        const snap = 1 / this.config.gridSubdivision;
        return Math.round(beat / snap) * snap;
    }

    private getNoteAtPosition(x: number, y: number): PianoRollNote | null {
        for (const note of this.notes.values()) {
            const noteX = note.start * this.beatWidth;
            const noteY = (this.config.maxPitch - note.pitch) * this.noteWidth;
            const noteWidth = note.duration * this.beatWidth;

            if (x >= noteX && x <= noteX + noteWidth &&
                y >= noteY && y <= noteY + this.noteWidth) {
                return note;
            }
        }
        return null;
    }

    private isBlackKey(pitch: number): boolean {
        const noteInOctave = pitch % 12;
        return [1, 3, 6, 8, 10].includes(noteInOctave);
    }

    private getNoteName(pitch: number): string {
        const octave = Math.floor(pitch / 12) - 1;
        const noteName = PianoRollEditor.NOTE_NAMES[pitch % 12];
        return `${noteName}${octave}`;
    }

    /**
     * Convert velocity (0-127) to color gradient
     * Green (soft) -> Yellow (medium) -> Red (loud)
     */
    private velocityToColor(velocity: number): string {
        const normalized = velocity / 127;

        if (normalized < 0.33) {
            // Green to Yellow-Green
            const t = normalized / 0.33;
            const r = Math.round(0 + t * 128);
            const g = Math.round(200 + t * 55);
            const b = 0;
            return `rgb(${r}, ${g}, ${b})`;
        } else if (normalized < 0.66) {
            // Yellow-Green to Yellow-Orange
            const t = (normalized - 0.33) / 0.33;
            const r = Math.round(128 + t * 127);
            const g = Math.round(255 - t * 85);
            const b = 0;
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            // Orange to Red
            const t = (normalized - 0.66) / 0.34;
            const r = 255;
            const g = Math.round(170 - t * 170);
            const b = Math.round(t * 50);
            return `rgb(${r}, ${g}, ${b})`;
        }
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    setDragMode(mode: 'draw' | 'select'): void {
        this.dragMode = mode;

        // Update toolbar buttons
        const drawBtn = document.getElementById('pr-draw-btn');
        const selectBtn = document.getElementById('pr-select-btn');

        if (drawBtn) drawBtn.classList.toggle('active', mode === 'draw');
        if (selectBtn) selectBtn.classList.toggle('active', mode === 'select');

        this.canvas.style.cursor = mode === 'draw' ? 'crosshair' : 'default';
    }

    zoom(factor: number): void {
        const oldBeatWidth = this.beatWidth;
        this.beatWidth = Math.max(20, Math.min(120, this.beatWidth * factor));

        // Adjust scroll to keep center
        const centerBeat = (this.scrollX + this.canvas.width / 2) / oldBeatWidth;
        this.scrollX = centerBeat * this.beatWidth - this.canvas.width / 2;
        this.scrollX = Math.max(0, this.scrollX);

        this.render();
    }

    setPlayheadPosition(beat: number): void {
        this.playheadPosition = beat;
        this.render();
    }

    setCurrentInstrument(id: number): void {
        this.currentInstrumentId = id;
    }

    getNotes(): PianoRollNote[] {
        return Array.from(this.notes.values());
    }

    setNotes(notes: PianoRollNote[]): void {
        this.notes.clear();
        this.selectedNotes.clear();
        notes.forEach(note => {
            this.notes.set(note.id, note);
        });
        this.render();
    }

    clearAll(): void {
        this.notes.clear();
        this.selectedNotes.clear();
        this.undoStack = [];
        this.redoStack = [];
        this.render();
    }

    setPlaying(playing: boolean): void {
        this.isPlaying = playing;
    }

    private playNotePreview(pitch: number): void {
        // Get instrument and play note
        const instrument = instrumentRegistry.getInstrument(this.currentInstrumentId);
        if (instrument) {
            instrument.noteOn(pitch, 0.8);

            // Note off after 200ms
            setTimeout(() => {
                instrument.noteOff(pitch);
            }, 200);
        }
    }

    // ============================================================
    // MIDI EXPORT / IMPORT
    // ============================================================

    exportToMidi(): Uint8Array {
        // Simple MIDI export
        const notes = this.getNotes();
        const tempo = Math.round(Tone.Transport.bpm.value) || 120;
        const ticksPerBeat = 480;

        // Build MIDI file structure
        const header = [
            0x4D, 0x54, 0x68, 0x64, // MThd
            0x00, 0x00, 0x00, 0x06, // Header length
            0x00, 0x00,             // Format 0
            0x00, 0x01,             // 1 track
            (ticksPerBeat >> 8) & 0xFF, ticksPerBeat & 0xFF, // Ticks per beat
        ];

        // Build track data
        const trackData: number[] = [];

        // Sort notes by start time
        const sortedNotes = [...notes].sort((a, b) => a.start - b.start);

        let lastTick = 0;
        sortedNotes.forEach(note => {
            const startTick = Math.round(note.start * ticksPerBeat);
            const endTick = Math.round((note.start + note.duration) * ticksPerBeat);

            // Note On
            const deltaOn = startTick - lastTick;
            this.writeVariableLength(trackData, deltaOn);
            trackData.push(0x90 | 0, note.pitch, Math.round(note.velocity));

            // Note Off
            const deltaOff = endTick - startTick;
            this.writeVariableLength(trackData, deltaOff);
            trackData.push(0x80 | 0, note.pitch, 0);

            lastTick = endTick;
        });

        // End of track
        this.writeVariableLength(trackData, 0);
        trackData.push(0xFF, 0x2F, 0x00);

        // Track header
        const trackHeader = [
            0x4D, 0x54, 0x72, 0x6B, // MTrk
            (trackData.length >> 24) & 0xFF,
            (trackData.length >> 16) & 0xFF,
            (trackData.length >> 8) & 0xFF,
            trackData.length & 0xFF,
        ];

        return new Uint8Array([...header, ...trackHeader, ...trackData]);
    }

    private writeVariableLength(data: number[], value: number): void {
        const bytes: number[] = [];
        bytes.push(value & 0x7F);
        value >>= 7;
        while (value > 0) {
            bytes.push((value & 0x7F) | 0x80);
            value >>= 7;
        }
        data.push(...bytes.reverse());
    }
}

// ============================================================
// STYLES
// ============================================================

const pianoRollStyles = document.createElement('style');
pianoRollStyles.textContent = `
    .piano-roll-toolbar button.active {
        background: var(--primary) !important;
        color: #000 !important;
        border-color: var(--primary) !important;
    }

    .piano-roll-container {
        background: #0a0a0a;
        border: 1px solid #333;
        border-radius: 8px;
        overflow: hidden;
    }

    .piano-roll-container:focus {
        outline: 2px solid var(--primary);
        outline-offset: -2px;
    }
`;
document.head.appendChild(pianoRollStyles);
