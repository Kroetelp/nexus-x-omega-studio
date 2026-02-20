/**
 * NEXUS-X Piano Roll Dialog v5.0
 * Modal dialog wrapper for the Piano Roll Editor
 */

import { PianoRollEditor, PianoRollNote } from './PianoRollEditor';

interface PianoRollDialogOptions {
    title?: string;
    instrumentId?: number;
    onNotesChange?: (notes: PianoRollNote[]) => void;
}

export class PianoRollDialog {
    private dialog: HTMLDialogElement;
    private pianoRoll: PianoRollEditor;
    private options: PianoRollDialogOptions;
    private onNotesChange?: (notes: PianoRollNote[]) => void;

    constructor(options: PianoRollDialogOptions = {}) {
        this.options = options;
        this.onNotesChange = options.onNotesChange;

        this.dialog = this.createDialog();
        this.pianoRoll = this.createPianoRoll();

        this.dialog.appendChild(this.createContent());
        document.body.appendChild(this.dialog);

        this.setupEvents();
    }

    private createDialog(): HTMLDialogElement {
        const dialog = document.createElement('dialog');
        dialog.className = 'piano-roll-dialog';
        dialog.style.cssText = `
            width: 90vw;
            height: 85vh;
            max-width: 1400px;
            background: radial-gradient(circle at center, rgba(17,17,17,0.98) 0%, rgba(5,5,5,0.99) 100%);
            border: 1px solid #333;
            border-radius: 12px;
            padding: 0;
            color: #fff;
            overflow: hidden;
        `;
        return dialog;
    }

    private createContent(): HTMLElement {
        const content = document.createElement('div');
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            height: 100%;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
            background: linear-gradient(180deg, #1a1a1a, #0f0f0f);
            border-bottom: 1px solid #333;
        `;

        const titleEl = document.createElement('div');
        titleEl.className = 'font-mono';
        titleEl.style.cssText = `
            font-size: 16px;
            font-weight: 800;
            color: var(--primary);
        `;
        titleEl.innerHTML = `🎹 PIANO ROLL EDITOR <span style="color:#666;font-size:11px;">v5.0</span>`;

        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            gap: 10px;
            align-items: center;
        `;

        // Instrument selector
        const instLabel = document.createElement('label');
        instLabel.style.cssText = `
            font-size: 12px;
            color: #888;
            margin-right: 5px;
        `;
        instLabel.textContent = 'Instrument:';

        const instSelect = document.createElement('select');
        instSelect.id = 'pr-instrument-select';
        instSelect.style.cssText = `
            background: #1a1a1a;
            border: 1px solid #333;
            color: #fff;
            padding: 5px 10px;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
        `;
        instSelect.innerHTML = `
            <option value="1">1: Kick</option>
            <option value="2">2: Snare</option>
            <option value="3">3: Clap</option>
            <option value="4">4: HiHat</option>
            <option value="5">5: Bass</option>
            <option value="6" selected>6: Lead</option>
            <option value="7">7: Pad</option>
            <option value="8">8: FM Bell</option>
        `;
        instSelect.onchange = () => {
            this.pianoRoll.setCurrentInstrument(parseInt(instSelect.value));
        };

        // Grid size selector
        const gridLabel = document.createElement('label');
        gridLabel.style.cssText = `
            font-size: 12px;
            color: #888;
            margin-left: 15px;
            margin-right: 5px;
        `;
        gridLabel.textContent = 'Grid:';

        const gridSelect = document.createElement('select');
        gridSelect.id = 'pr-grid-select';
        gridSelect.style.cssText = `
            background: #1a1a1a;
            border: 1px solid #333;
            color: #fff;
            padding: 5px 10px;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
        `;
        gridSelect.innerHTML = `
            <option value="2">1/2 (Half)</option>
            <option value="4" selected>1/4 (Quarter)</option>
            <option value="8">1/8 (Eighth)</option>
            <option value="16">1/16 (Sixteenth)</option>
            <option value="32">1/32 (Thirty-second)</option>
        `;

        // Clear button
        const clearBtn = document.createElement('button');
        clearBtn.textContent = '🗑️ Clear';
        clearBtn.style.cssText = `
            background: #222;
            border: 1px solid #444;
            color: #888;
            padding: 5px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            transition: all 0.15s;
        `;
        clearBtn.onmouseenter = () => {
            clearBtn.style.background = '#333';
            clearBtn.style.color = '#fff';
        };
        clearBtn.onmouseleave = () => {
            clearBtn.style.background = '#222';
            clearBtn.style.color = '#888';
        };
        clearBtn.onclick = () => {
            if (confirm('Clear all notes?')) {
                this.pianoRoll.clearAll();
            }
        };

        // Done button
        const doneBtn = document.createElement('button');
        doneBtn.textContent = '✓ Done';
        doneBtn.style.cssText = `
            background: linear-gradient(45deg, var(--primary), #00cc77);
            border: none;
            color: #000;
            padding: 8px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            font-weight: 700;
        `;
        doneBtn.onclick = () => this.close();

        // Close button (X)
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            background: transparent;
            border: 1px solid #444;
            color: #666;
            width: 30px;
            height: 30px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
        `;
        closeBtn.onmouseenter = () => {
            closeBtn.style.color = '#ff0055';
            closeBtn.style.borderColor = '#ff0055';
        };
        closeBtn.onmouseleave = () => {
            closeBtn.style.color = '#666';
            closeBtn.style.borderColor = '#444';
        };
        closeBtn.onclick = () => this.close();

        controls.appendChild(instLabel);
        controls.appendChild(instSelect);
        controls.appendChild(gridLabel);
        controls.appendChild(gridSelect);
        controls.appendChild(clearBtn);
        controls.appendChild(doneBtn);
        controls.appendChild(closeBtn);

        header.appendChild(titleEl);
        header.appendChild(controls);

        // Piano roll container
        const rollContainer = document.createElement('div');
        rollContainer.className = 'piano-roll-container';
        rollContainer.style.cssText = `
            flex: 1;
            margin: 0;
            border: none;
            border-radius: 0;
        `;

        // Status bar
        const statusBar = document.createElement('div');
        statusBar.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 20px;
            background: #0a0a0a;
            border-top: 1px solid #222;
            font-size: 11px;
            color: #666;
            font-family: 'JetBrains Mono', monospace;
        `;
        statusBar.innerHTML = `
            <div>
                <span id="pr-note-count">0</span> notes |
                Duration: <span id="pr-duration">0</span> beats
            </div>
            <div>
                <span style="color:#888;">Shortcuts:</span>
                D=Draw | S=Select | Del=Delete | Ctrl+Z=Undo | A=Select All
            </div>
        `;

        content.appendChild(header);
        content.appendChild(rollContainer);
        content.appendChild(statusBar);

        // Initialize piano roll in container
        setTimeout(() => {
            this.pianoRoll = new PianoRollEditor(rollContainer, {
                minPitch: 36,
                maxPitch: 84,
                totalMeasures: 16,
                gridSubdivision: 4,
            });

            if (this.options.instrumentId) {
                this.pianoRoll.setCurrentInstrument(this.options.instrumentId);
                instSelect.value = String(this.options.instrumentId);
            }

            // Update status bar on changes
            this.pianoRoll['container'].addEventListener('noteadd', () => this.updateStatusBar());
            this.pianoRoll['container'].addEventListener('notedelete', () => this.updateStatusBar());
            this.updateStatusBar();

            // Grid change
            gridSelect.onchange = () => {
                const val = parseInt(gridSelect.value);
                (this.pianoRoll as any).config.gridSubdivision = val;
                this.pianoRoll.render();
            };
        }, 100);

        return content;
    }

    private createPianoRoll(): PianoRollEditor {
        // Placeholder - actual creation happens in createContent
        return null as any;
    }

    private setupEvents(): void {
        // Close on Escape
        this.dialog.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
            }
        });

        // Close on backdrop click
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this.close();
            }
        });
    }

    private updateStatusBar(): void {
        const notes = this.pianoRoll.getNotes();
        const noteCountEl = document.getElementById('pr-note-count');
        const durationEl = document.getElementById('pr-duration');

        if (noteCountEl) noteCountEl.textContent = String(notes.length);

        if (durationEl && notes.length > 0) {
            const maxEnd = Math.max(...notes.map(n => n.start + n.duration));
            durationEl.textContent = maxEnd.toFixed(1);
        } else if (durationEl) {
            durationEl.textContent = '0';
        }

        // Notify parent
        if (this.onNotesChange) {
            this.onNotesChange(notes);
        }
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    open(notes?: PianoRollNote[]): void {
        if (notes) {
            this.pianoRoll.setNotes(notes);
        }
        this.dialog.showModal();
        this.pianoRoll.resize();
    }

    close(): void {
        this.dialog.close();
    }

    getNotes(): PianoRollNote[] {
        return this.pianoRoll.getNotes();
    }

    setNotes(notes: PianoRollNote[]): void {
        this.pianoRoll.setNotes(notes);
    }

    destroy(): void {
        this.dialog.remove();
    }
}

// Global instance
let pianoRollDialogInstance: PianoRollDialog | null = null;

export function showPianoRoll(options?: PianoRollDialogOptions): PianoRollDialog {
    if (!pianoRollDialogInstance) {
        pianoRollDialogInstance = new PianoRollDialog(options);
    }
    pianoRollDialogInstance.open();
    return pianoRollDialogInstance;
}

export function getPianoRollDialog(): PianoRollDialog | null {
    return pianoRollDialogInstance;
}
