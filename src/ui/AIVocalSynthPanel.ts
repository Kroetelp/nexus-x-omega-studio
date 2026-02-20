/**
 * NEXUS-X AI Vocal Synth Panel
 * UI for text-to-singing synthesis
 */

import { AIVocalSynth, VocalNote, VocalSettings, createAIVocalSynth } from './AIVocalSynth';

export class AIVocalSynthPanel {
    private container: HTMLElement;
    private synth: AIVocalSynth;
    private lyrics: Array<{ text: string; pitch: number; duration: number }> = [];
    private melody: Array<{ note: number; time: number }> = [];
    private isPlaying: boolean = false;

    constructor() {
        this.synth = createAIVocalSynth();
        this.container = this.createUI();
    }

    private createUI(): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'ai-vocal-panel';
        wrapper.innerHTML = `
            <style>
                .ai-vocal-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 800px;
                    max-width: 95vw;
                    max-height: 90vh;
                    background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%);
                    border: 1px solid #333;
                    border-radius: 16px;
                    box-shadow: 0 0 100px rgba(255,0,204,0.2), 0 0 50px rgba(0,0,0,0.8);
                    z-index: 10001;
                    font-family: 'JetBrains Mono', monospace;
                    overflow: hidden;
                }
                .aiv-header {
                    padding: 20px;
                    background: linear-gradient(90deg, rgba(255,0,204,0.1) 0%, transparent 100%);
                    border-bottom: 1px solid #333;
                }
                .aiv-title {
                    font-size: 18px;
                    font-weight: 800;
                    color: #ff00cc;
                    text-shadow: 0 0 20px rgba(255,0,204,0.5);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .aiv-subtitle {
                    font-size: 11px;
                    color: #666;
                    margin-top: 5px;
                }
                .aiv-body {
                    padding: 20px;
                    overflow-y: auto;
                    max-height: 60vh;
                }
                .aiv-section {
                    margin-bottom: 20px;
                }
                .aiv-section-title {
                    font-size: 11px;
                    color: #888;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .aiv-lyrics-input {
                    width: 100%;
                    height: 100px;
                    background: #111;
                    border: 1px solid #333;
                    border-radius: 8px;
                    color: #fff;
                    padding: 12px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                    resize: none;
                    line-height: 1.6;
                }
                .aiv-lyrics-input:focus {
                    outline: none;
                    border-color: #ff00cc;
                    box-shadow: 0 0 20px rgba(255,0,204,0.2);
                }
                .aiv-options {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                }
                .aiv-option {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .aiv-option-label {
                    font-size: 10px;
                    color: #666;
                }
                .aiv-option-select {
                    background: #111;
                    border: 1px solid #333;
                    border-radius: 6px;
                    color: #fff;
                    padding: 8px 12px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                }
                .aiv-slider-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .aiv-slider {
                    flex: 1;
                    -webkit-appearance: none;
                    height: 4px;
                    background: #333;
                    border-radius: 2px;
                }
                .aiv-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #ff00cc;
                    border-radius: 50%;
                    cursor: pointer;
                }
                .aiv-slider-value {
                    width: 40px;
                    text-align: right;
                    color: #ff00cc;
                    font-size: 12px;
                }
                .aiv-melody-grid {
                    display: grid;
                    grid-template-columns: 60px repeat(16, 1fr);
                    gap: 2px;
                    background: #0a0a0a;
                    padding: 10px;
                    border-radius: 8px;
                    margin-top: 10px;
                }
                .aiv-piano-key {
                    height: 24px;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 2px;
                    font-size: 9px;
                    color: #666;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    padding-left: 5px;
                }
                .aiv-piano-key.black {
                    background: #0a0a0a;
                    color: #444;
                }
                .aiv-note-cell {
                    height: 24px;
                    background: #111;
                    border: 1px solid #222;
                    border-radius: 2px;
                    cursor: pointer;
                    transition: all 0.1s;
                }
                .aiv-note-cell:hover {
                    background: #1a1a1a;
                    border-color: #ff00cc;
                }
                .aiv-note-cell.active {
                    background: #ff00cc;
                    border-color: #ff00cc;
                    box-shadow: 0 0 10px rgba(255,0,204,0.5);
                }
                .aiv-buttons {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }
                .aiv-btn {
                    flex: 1;
                    padding: 12px;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    color: #888;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .aiv-btn:hover {
                    background: #222;
                    color: #fff;
                    border-color: #ff00cc;
                }
                .aiv-btn.primary {
                    background: linear-gradient(90deg, #ff00cc 0%, #ff0099 100%);
                    color: #fff;
                    border-color: #ff00cc;
                }
                .aiv-btn.primary:hover {
                    box-shadow: 0 0 30px rgba(255,0,204,0.5);
                }
                .aiv-close {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: none;
                    color: #666;
                    font-size: 20px;
                    cursor: pointer;
                }
                .aiv-close:hover {
                    color: #ff0055;
                }
                .aiv-preview-words {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-top: 10px;
                }
                .aiv-word-btn {
                    background: #111;
                    border: 1px solid #333;
                    color: #888;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .aiv-word-btn:hover {
                    border-color: #ff00cc;
                    color: #fff;
                }
                .aiv-presets {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-bottom: 15px;
                }
                .aiv-preset-btn {
                    background: #111;
                    border: 1px solid #333;
                    color: #888;
                    padding: 8px 14px;
                    border-radius: 4px;
                    font-size: 10px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .aiv-preset-btn:hover {
                    border-color: #ff00cc;
                    color: #ff00cc;
                }
            </style>
            <div class="aiv-header">
                <div class="aiv-title">🎤 AI VOCAL SYNTHESIZER</div>
                <div class="aiv-subtitle">Text-to-Singing Neural Synthesis</div>
                <button class="aiv-close" id="aivClose">&times;</button>
            </div>
            <div class="aiv-body">
                <div class="aiv-section">
                    <div class="aiv-section-title">Quick Presets</div>
                    <div class="aiv-presets" id="aivPresets">
                        <button class="aiv-preset-btn" data-preset="techno">🎵 Techno Chant</button>
                        <button class="aiv-preset-btn" data-preset="trance">🌟 Trance Vocal</button>
                        <button class="aiv-preset-btn" data-preset="house">🏠 House Diva</button>
                        <button class="aiv-preset-btn" data-preset="choir">⛪ Choir</button>
                        <button class="aiv-preset-btn" data-preset="robot">🤖 Robot Voice</button>
                    </div>
                </div>

                <div class="aiv-section">
                    <div class="aiv-section-title">Lyrics</div>
                    <textarea class="aiv-lyrics-input" id="aivLyrics" placeholder="Enter lyrics here...&#10;Example: Yeah oh la la da&#10;Feel the music in the night&#10;Dance until the morning light"></textarea>
                </div>

                <div class="aiv-section">
                    <div class="aiv-section-title">Melody Grid (Click to add notes)</div>
                    <div class="aiv-melody-grid" id="aivMelodyGrid"></div>
                </div>

                <div class="aiv-options">
                    <div class="aiv-option">
                        <span class="aiv-option-label">Voice Type</span>
                        <select class="aiv-option-select" id="aivVoice">
                            <option value="soprano">Soprano</option>
                            <option value="alto">Alto</option>
                            <option value="tenor" selected>Tenor</option>
                            <option value="bass">Bass</option>
                            <option value="robot">Robot</option>
                            <option value="choir">Choir</option>
                        </select>
                    </div>
                    <div class="aiv-option">
                        <span class="aiv-option-label">Vibrato</span>
                        <div class="aiv-slider-group">
                            <input type="range" class="aiv-slider" id="aivVibrato" min="0" max="100" value="30">
                            <span class="aiv-slider-value" id="aivVibratoValue">30%</span>
                        </div>
                    </div>
                    <div class="aiv-option">
                        <span class="aiv-option-label">Breathiness</span>
                        <div class="aiv-slider-group">
                            <input type="range" class="aiv-slider" id="aivBreathiness" min="0" max="100" value="10">
                            <span class="aiv-slider-value" id="aivBreathinessValue">10%</span>
                        </div>
                    </div>
                </div>

                <div class="aiv-options">
                    <div class="aiv-option">
                        <span class="aiv-option-label">Expression</span>
                        <div class="aiv-slider-group">
                            <input type="range" class="aiv-slider" id="aivExpression" min="0" max="100" value="50">
                            <span class="aiv-slider-value" id="aivExpressionValue">50%</span>
                        </div>
                    </div>
                    <div class="aiv-option">
                        <span class="aiv-option-label">Formant Shift</span>
                        <div class="aiv-slider-group">
                            <input type="range" class="aiv-slider" id="aivFormant" min="-100" max="100" value="0">
                            <span class="aiv-slider-value" id="aivFormantValue">0</span>
                        </div>
                    </div>
                    <div class="aiv-option">
                        <span class="aiv-option-label">Root Note</span>
                        <select class="aiv-option-select" id="aivRootNote">
                            <option value="48">C3</option>
                            <option value="50">D3</option>
                            <option value="52">E3</option>
                            <option value="53">F3</option>
                            <option value="55">G3</option>
                            <option value="57">A3</option>
                            <option value="59">B3</option>
                            <option value="60" selected>C4</option>
                            <option value="62">D4</option>
                            <option value="64">E4</option>
                        </select>
                    </div>
                </div>

                <div class="aiv-section">
                    <div class="aiv-section-title">Quick Preview Words</div>
                    <div class="aiv-preview-words" id="aivPreviewWords"></div>
                </div>

                <div class="aiv-buttons">
                    <button class="aiv-btn" id="aivPreview">🔊 Preview Word</button>
                    <button class="aiv-btn" id="aivPlayMelody">▶️ Play Melody</button>
                    <button class="aiv-btn" id="aivStop">⏹️ Stop</button>
                    <button class="aiv-btn primary" id="aivSing">🎤 SING!</button>
                </div>
            </div>
        `;

        this.setupMelodyGrid(wrapper);
        this.setupPreviewWords(wrapper);
        this.setupPresets(wrapper);
        this.setupEventListeners(wrapper);

        return wrapper;
    }

    private setupMelodyGrid(wrapper: HTMLElement): void {
        const grid = wrapper.querySelector('#aivMelodyGrid') as HTMLElement;
        const notes = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'];
        const noteValues = [72, 71, 69, 67, 65, 64, 62, 60];

        // Initialize melody array
        this.melody = Array(16).fill(0).map(() => ({ note: 0, time: 0 }));

        notes.forEach((note, row) => {
            // Piano key
            const key = document.createElement('div');
            key.className = 'aiv-piano-key' + (note.includes('#') ? ' black' : '');
            key.textContent = note;
            grid.appendChild(key);

            // Note cells
            for (let col = 0; col < 16; col++) {
                const cell = document.createElement('div');
                cell.className = 'aiv-note-cell';
                cell.dataset.row = String(row);
                cell.dataset.col = String(col);
                cell.dataset.note = String(noteValues[row]);

                cell.addEventListener('click', () => {
                    // Clear other notes in same column
                    grid.querySelectorAll(`[data-col="${col}"].aiv-note-cell.active`).forEach(c => {
                        c.classList.remove('active');
                    });

                    cell.classList.add('active');
                    this.melody[col] = { note: noteValues[row], time: col };
                });

                grid.appendChild(cell);
            }
        });
    }

    private setupPreviewWords(wrapper: HTMLElement): void {
        const container = wrapper.querySelector('#aivPreviewWords') as HTMLElement;
        const words = ['Yeah', 'Oh', 'La', 'Da', 'Na', 'Ba', 'Ma', 'Love', 'Dance', 'Night'];

        words.forEach(word => {
            const btn = document.createElement('button');
            btn.className = 'aiv-word-btn';
            btn.textContent = word;
            btn.onclick = () => this.previewWord(word);
            container.appendChild(btn);
        });
    }

    private setupPresets(wrapper: HTMLElement): void {
        const presets: Record<string, { settings: Partial<VocalSettings>; melody: number[] }> = {
            techno: {
                settings: { voice: 'robot', vibrato: 10, breathiness: 5, expression: 30 },
                melody: [60, 0, 0, 0, 67, 0, 0, 0, 60, 0, 0, 0, 67, 0, 0, 0]
            },
            trance: {
                settings: { voice: 'soprano', vibrato: 50, breathiness: 15, expression: 70 },
                melody: [72, 0, 71, 0, 69, 67, 0, 65, 64, 0, 62, 0, 60, 0, 0, 0]
            },
            house: {
                settings: { voice: 'alto', vibrato: 40, breathiness: 20, expression: 60 },
                melody: [67, 0, 0, 67, 0, 0, 69, 0, 67, 0, 0, 65, 0, 0, 64, 0]
            },
            choir: {
                settings: { voice: 'choir', vibrato: 30, breathiness: 5, expression: 50 },
                melody: [60, 64, 67, 72, 67, 64, 60, 0, 62, 65, 69, 72, 69, 65, 62, 0]
            },
            robot: {
                settings: { voice: 'robot', vibrato: 0, breathiness: 0, expression: 10 },
                melody: [60, 60, 60, 60, 72, 72, 72, 72, 60, 60, 60, 60, 48, 48, 48, 48]
            }
        };

        wrapper.querySelectorAll('.aiv-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const presetName = (btn as HTMLElement).dataset.preset!;
                const preset = presets[presetName];
                if (!preset) return;

                // Apply settings
                if (preset.settings.voice) {
                    (wrapper.querySelector('#aivVoice') as HTMLSelectElement).value = preset.settings.voice;
                }
                if (preset.settings.vibrato !== undefined) {
                    (wrapper.querySelector('#aivVibrato') as HTMLInputElement).value = String(preset.settings.vibrato);
                    (wrapper.querySelector('#aivVibratoValue') as HTMLElement).textContent = preset.settings.vibrato + '%';
                }
                if (preset.settings.breathiness !== undefined) {
                    (wrapper.querySelector('#aivBreathiness') as HTMLInputElement).value = String(preset.settings.breathiness);
                    (wrapper.querySelector('#aivBreathinessValue') as HTMLElement).textContent = preset.settings.breathiness + '%';
                }
                if (preset.settings.expression !== undefined) {
                    (wrapper.querySelector('#aivExpression') as HTMLInputElement).value = String(preset.settings.expression);
                    (wrapper.querySelector('#aivExpressionValue') as HTMLElement).textContent = preset.settings.expression + '%';
                }

                // Apply melody
                const grid = wrapper.querySelector('#aivMelodyGrid') as HTMLElement;
                grid.querySelectorAll('.aiv-note-cell.active').forEach(c => c.classList.remove('active'));

                preset.melody.forEach((note, col) => {
                    if (note > 0) {
                        const row = [72, 71, 69, 67, 65, 64, 62, 60].indexOf(note);
                        if (row >= 0) {
                            const cell = grid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                            if (cell) {
                                cell.classList.add('active');
                                this.melody[col] = { note, time: col };
                            }
                        }
                    }
                });

                this.updateSynthSettings();
            });
        });
    }

    private setupEventListeners(wrapper: HTMLElement): void {
        // Close
        wrapper.querySelector('#aivClose')?.addEventListener('click', () => this.hide());

        // Sliders
        ['Vibrato', 'Breathiness', 'Expression', 'Formant'].forEach(name => {
            const slider = wrapper.querySelector(`#aiv${name}`) as HTMLInputElement;
            const value = wrapper.querySelector(`#aiv${name}Value`) as HTMLElement;

            slider?.addEventListener('input', () => {
                value.textContent = slider.value + (name === 'Formant' ? '' : '%');
                this.updateSynthSettings();
            });
        });

        // Voice select
        wrapper.querySelector('#aivVoice')?.addEventListener('change', () => this.updateSynthSettings());

        // Buttons
        wrapper.querySelector('#aivPreview')?.addEventListener('click', () => {
            const lyrics = (wrapper.querySelector('#aivLyrics') as HTMLTextAreaElement).value;
            const words = lyrics.split(/\s+/).filter(w => w.length > 0);
            if (words.length > 0) {
                this.previewWord(words[0]);
            }
        });

        wrapper.querySelector('#aivPlayMelody')?.addEventListener('click', () => this.playMelody());
        wrapper.querySelector('#aivStop')?.addEventListener('click', () => this.stop());
        wrapper.querySelector('#aivSing')?.addEventListener('click', () => this.sing());
    }

    private updateSynthSettings(): void {
        const voice = (this.container.querySelector('#aivVoice') as HTMLSelectElement).value as VocalSettings['voice'];
        const vibrato = parseInt((this.container.querySelector('#aivVibrato') as HTMLInputElement).value) / 100;
        const breathiness = parseInt((this.container.querySelector('#aivBreathiness') as HTMLInputElement).value) / 100;
        const expression = parseInt((this.container.querySelector('#aivExpression') as HTMLInputElement).value) / 100;
        const formantShift = parseInt((this.container.querySelector('#aivFormant') as HTMLInputElement).value);

        this.synth.updateSettings({
            voice,
            vibrato,
            breathiness,
            expression,
            formantShift
        });
    }

    private async previewWord(word: string): Promise<void> {
        const rootNote = parseInt((this.container.querySelector('#aivRootNote') as HTMLSelectElement).value);
        await this.synth.previewWord(word, rootNote);
    }

    private async playMelody(): Promise<void> {
        if (this.isPlaying) return;
        this.isPlaying = true;

        const rootNote = parseInt((this.container.querySelector('#aivRootNote') as HTMLSelectElement).value);
        const tempo = Tone.Transport.bpm.value || 128;
        const beatDuration = 60 / tempo;

        for (let i = 0; i < this.melody.length; i++) {
            if (!this.isPlaying) break;

            const note = this.melody[i];
            if (note.note > 0) {
                // Play a preview tone
                if (window.engine?.noteOn) {
                    window.engine.noteOn(note.note, 0.5);
                    setTimeout(() => window.engine.noteOff?.(note.note), beatDuration * 250);
                }
            }

            await new Promise(r => setTimeout(r, beatDuration * 250));
        }

        this.isPlaying = false;
    }

    private stop(): void {
        this.isPlaying = false;
        this.synth.stop();
    }

    private async sing(): Promise<void> {
        if (this.isPlaying) return;
        this.isPlaying = true;

        const lyrics = (this.container.querySelector('#aivLyrics') as HTMLTextAreaElement).value;
        const words = lyrics.split(/\s+/).filter(w => w.length > 0);

        if (words.length === 0) {
            alert('Please enter some lyrics first!');
            this.isPlaying = false;
            return;
        }

        const rootNote = parseInt((this.container.querySelector('#aivRootNote') as HTMLSelectElement).value);
        const tempo = Tone.Transport.bpm.value || 128;
        const beatDuration = 60 / tempo;

        // Map words to melody
        const notes: VocalNote[] = [];
        let wordIndex = 0;

        for (let i = 0; i < this.melody.length; i++) {
            const melodyNote = this.melody[i];

            if (melodyNote.note > 0 && wordIndex < words.length) {
                notes.push({
                    text: words[wordIndex % words.length],
                    pitch: melodyNote.note,
                    duration: beatDuration,
                    startTime: i * beatDuration * 0.25
                });
                wordIndex++;
            }
        }

        // If no melody set, create simple pattern
        if (notes.length === 0) {
            for (let i = 0; i < words.length; i++) {
                notes.push({
                    text: words[i],
                    pitch: rootNote + (i % 5) * 2,
                    duration: beatDuration,
                    startTime: i * beatDuration * 0.5
                });
            }
        }

        await this.synth.sing(notes);

        // Wait for singing to complete
        const totalDuration = notes.length > 0 ?
            Math.max(...notes.map(n => n.startTime + n.duration)) * 1000 + 1000 : 0;

        setTimeout(() => {
            this.isPlaying = false;
        }, totalDuration);
    }

    public show(): void {
        document.body.appendChild(this.container);
        this.updateSynthSettings();
    }

    public hide(): void {
        this.stop();
        this.container.remove();
    }
}

// Global instance
let aiVocalSynthPanelInstance: AIVocalSynthPanel | null = null;

export function createAIVocalSynthPanel(): AIVocalSynthPanel {
    if (!aiVocalSynthPanelInstance) {
        aiVocalSynthPanelInstance = new AIVocalSynthPanel();
    }
    return aiVocalSynthPanelInstance;
}

export function getAIVocalSynthPanel(): AIVocalSynthPanel | null {
    return aiVocalSynthPanelInstance;
}
