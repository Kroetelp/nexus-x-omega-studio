/**
 * NEXUS-X 808 Drum Pad UI
 * Interactive drum machine interface for TR-808
 */

export class Drum808Pad {
    private container: HTMLElement;
    private drum808: any;
    private pads: Map<number, HTMLElement> = new Map();
    private isRecording: boolean = false;
    private sequence: Array<{note: number, time: number, velocity: number}> = [];
    private recordStartTime: number = 0;

    private readonly DRUM_CONFIG = [
        { note: 36, name: 'KICK', color: '#00ff94', key: '1' },
        { note: 38, name: 'SNARE', color: '#f59e0b', key: '2' },
        { note: 39, name: 'CLAP', color: '#ff00cc', key: '3' },
        { note: 42, name: 'HH CLSD', color: '#00e5ff', key: '4' },
        { note: 46, name: 'HH OPEN', color: '#7c3aed', key: '5' },
        { note: 41, name: 'TOM LO', color: '#ff0055', key: 'Q' },
        { note: 45, name: 'TOM MID', color: '#5865F2', key: 'W' },
        { note: 48, name: 'TOM HI', color: '#00ccff', key: 'E' },
        { note: 56, name: 'COWBELL', color: '#f59e0b', key: 'R' },
        { note: 37, name: 'RIM', color: '#888', key: 'T' },
        { note: 75, name: 'CLAVE', color: '#aaa', key: 'Z' },
        { note: 70, name: 'MARACS', color: '#666', key: 'U' },
    ];

    constructor(drum808: any) {
        this.drum808 = drum808;
        this.container = this.createUI();
        this.setupKeyboard();
    }

    private createUI(): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'drum-808-panel';
        wrapper.innerHTML = `
            <style>
                .drum-808-panel {
                    background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 15px;
                    margin: 10px 0;
                }
                .drum-808-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #333;
                }
                .drum-808-title {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                    font-weight: 800;
                    color: #00ff94;
                    text-shadow: 0 0 10px rgba(0,255,148,0.3);
                }
                .drum-808-controls {
                    display: flex;
                    gap: 8px;
                }
                .drum-808-btn {
                    background: #222;
                    border: 1px solid #444;
                    color: #888;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .drum-808-btn:hover {
                    background: #333;
                    color: #fff;
                }
                .drum-808-btn.active {
                    background: #ff0055;
                    color: #fff;
                    border-color: #ff0055;
                }
                .drum-808-pads {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }
                .drum-pad {
                    aspect-ratio: 1;
                    background: #1a1a1a;
                    border: 2px solid #333;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.1s;
                    user-select: none;
                    position: relative;
                    overflow: hidden;
                }
                .drum-pad:hover {
                    border-color: #555;
                    transform: scale(1.02);
                }
                .drum-pad:active, .drum-pad.hit {
                    transform: scale(0.95);
                }
                .drum-pad.hit::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
                    animation: padFlash 0.15s ease-out;
                }
                @keyframes padFlash {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                .drum-pad-name {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    font-weight: 700;
                    color: #fff;
                    text-shadow: 0 0 5px currentColor;
                }
                .drum-pad-key {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 9px;
                    color: #666;
                    margin-top: 4px;
                }
                .drum-808-presets {
                    display: flex;
                    gap: 6px;
                    margin-top: 15px;
                    flex-wrap: wrap;
                }
                .preset-btn {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    color: #888;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .preset-btn:hover {
                    border-color: #00ff94;
                    color: #00ff94;
                }
                .preset-btn.selected {
                    background: #00ff94;
                    color: #000;
                    border-color: #00ff94;
                }
                .drum-808-info {
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid #333;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    color: #666;
                    text-align: center;
                }
            </style>
            <div class="drum-808-header">
                <div class="drum-808-title">🥁 TR-808 DRUM MACHINE</div>
                <div class="drum-808-controls">
                    <button class="drum-808-btn" id="record808">⏺ REC</button>
                    <button class="drum-808-btn" id="play808">▶ PLAY</button>
                    <button class="drum-808-btn" id="clear808">🗑️ CLEAR</button>
                </div>
            </div>
            <div class="drum-808-pads" id="drumPads"></div>
            <div class="drum-808-presets" id="presetBtns"></div>
            <div class="drum-808-info">
                Use keyboard keys (1-5, Q-R, Z) or click pads to play drums
            </div>
        `;

        // Create pads
        const padsContainer = wrapper.querySelector('#drumPads') as HTMLElement;
        this.DRUM_CONFIG.forEach(config => {
            const pad = document.createElement('div');
            pad.className = 'drum-pad';
            pad.style.borderColor = config.color;
            pad.innerHTML = `
                <span class="drum-pad-name" style="color: ${config.color}">${config.name}</span>
                <span class="drum-pad-key">[${config.key}]</span>
            `;

            pad.addEventListener('mousedown', () => this.hitPad(config.note, config.color));
            pad.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.hitPad(config.note, config.color);
            });

            padsContainer.appendChild(pad);
            this.pads.set(config.note, pad);
        });

        // Create preset buttons
        const presetsContainer = wrapper.querySelector('#presetBtns') as HTMLElement;
        const presets = ['classic', 'hiphop', 'trap', 'deep-house', 'techno-808', 'boom-bap'];
        presets.forEach(preset => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.textContent = preset.toUpperCase();
            btn.onclick = () => this.loadPreset(preset, btn);
            presetsContainer.appendChild(btn);
        });

        // Setup control buttons
        wrapper.querySelector('#record808')?.addEventListener('click', (e) => {
            this.toggleRecording(e.target as HTMLElement);
        });
        wrapper.querySelector('#play808')?.addEventListener('click', () => this.playSequence());
        wrapper.querySelector('#clear808')?.addEventListener('click', () => this.clearSequence());

        return wrapper;
    }

    private hitPad(note: number, color: string): void {
        if (!this.drum808) return;

        // Play sound
        this.drum808.noteOn(note, 0.9);

        // Visual feedback
        const pad = this.pads.get(note);
        if (pad) {
            pad.classList.add('hit');
            pad.style.boxShadow = `0 0 30px ${color}, inset 0 0 20px ${color}`;

            setTimeout(() => {
                pad.classList.remove('hit');
                pad.style.boxShadow = '';
            }, 150);
        }

        // Record if recording
        if (this.isRecording) {
            this.sequence.push({
                note,
                time: Date.now() - this.recordStartTime,
                velocity: 0.9
            });
        }
    }

    private toggleRecording(btn: HTMLElement): void {
        this.isRecording = !this.isRecording;
        btn.classList.toggle('active', this.isRecording);
        btn.textContent = this.isRecording ? '⏹ STOP' : '⏺ REC';

        if (this.isRecording) {
            this.sequence = [];
            this.recordStartTime = Date.now();
        }
    }

    private playSequence(): void {
        if (this.sequence.length === 0) return;

        const sorted = [...this.sequence].sort((a, b) => a.time - b.time);
        const startTime = Date.now();

        sorted.forEach(event => {
            setTimeout(() => {
                const config = this.DRUM_CONFIG.find(c => c.note === event.note);
                if (config) {
                    this.hitPad(event.note, config.color);
                }
            }, event.time);
        });
    }

    private clearSequence(): void {
        this.sequence = [];
    }

    private loadPreset(preset: string, btn: HTMLElement): void {
        // Remove selected from all
        btn.parentElement?.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        // Apply preset to drum808
        if (this.drum808 && this.drum808.applyPreset) {
            // Import presets
            import('./audio/instruments/Drum808Controller').then(module => {
                const presets = module.DRUM_808_PRESETS;
                const p = presets[preset];
                if (p && this.drum808) {
                    if (p.kick) {
                        if (p.kick.tune !== undefined) this.drum808.setParam(0, p.kick.tune);
                        if (p.kick.decay !== undefined) this.drum808.setParam(1, p.kick.decay);
                        if (p.kick.attack !== undefined) this.drum808.setParam(2, p.kick.attack);
                        if (p.kick.comp !== undefined) this.drum808.setParam(3, p.kick.comp);
                        if (p.kick.level !== undefined) this.drum808.setParam(4, p.kick.level);
                    }
                    if (p.snare) {
                        if (p.snare.tune !== undefined) this.drum808.setParam(10, p.snare.tune);
                        if (p.snare.tone !== undefined) this.drum808.setParam(11, p.snare.tone);
                        if (p.snare.snappy !== undefined) this.drum808.setParam(12, p.snare.snappy);
                        if (p.snare.decay !== undefined) this.drum808.setParam(13, p.snare.decay);
                        if (p.snare.level !== undefined) this.drum808.setParam(14, p.snare.level);
                    }
                    if (p.hh) {
                        if (p.hh.tune !== undefined) this.drum808.setParam(30, p.hh.tune);
                        if (p.hh.closedDecay !== undefined) this.drum808.setParam(31, p.hh.closedDecay);
                        if (p.hh.openDecay !== undefined) this.drum808.setParam(35, p.hh.openDecay);
                    }
                    console.log(`[808] Loaded preset: ${preset}`);
                }
            }).catch(() => {
                console.log(`[808] Preset ${preset} selected (demo mode)`);
            });
        }
    }

    private setupKeyboard(): void {
        document.addEventListener('keydown', (e) => {
            const config = this.DRUM_CONFIG.find(c => c.key.toLowerCase() === e.key.toLowerCase());
            if (config) {
                e.preventDefault();
                this.hitPad(config.note, config.color);
            }
        });
    }

    public getContainer(): HTMLElement {
        return this.container;
    }

    public setDrum808(drum808: any): void {
        this.drum808 = drum808;
    }
}

// Global instance
let drum808PadInstance: Drum808Pad | null = null;

export function createDrum808Pad(drum808: any): Drum808Pad {
    if (!drum808PadInstance) {
        drum808PadInstance = new Drum808Pad(drum808);
    } else {
        drum808PadInstance.setDrum808(drum808);
    }
    return drum808PadInstance;
}

export function getDrum808Pad(): Drum808Pad | null {
    return drum808PadInstance;
}
