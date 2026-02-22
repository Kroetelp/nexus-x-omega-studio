/**
 * NEXUS-X AI Composer Panel
 * Text-to-music interface for AI-powered song generation
 */

import { AIComposer, CompositionPrompt, GeneratedComposition } from '../ai-engine/AIComposer.js';
import { loggers } from '../utils/logger';

const log = loggers.ai;

export class AIComposerPanel {
    private container: HTMLElement;
    private composer: AIComposer;
    private currentComposition: GeneratedComposition | null = null;
    private isGenerating: boolean = false;
    private onCompositionReady: ((comp: GeneratedComposition) => void) | null = null;

    constructor() {
        this.composer = new AIComposer();
        this.container = this.createUI();
    }

    private createUI(): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'ai-composer-panel';
        wrapper.innerHTML = `
            <style>
                .ai-composer-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 600px;
                    max-width: 90vw;
                    max-height: 90vh;
                    background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%);
                    border: 1px solid #333;
                    border-radius: 16px;
                    box-shadow: 0 0 100px rgba(0,255,148,0.2), 0 0 50px rgba(0,0,0,0.8);
                    z-index: 10001;
                    font-family: 'JetBrains Mono', monospace;
                    overflow: hidden;
                }
                .aic-header {
                    padding: 20px;
                    background: linear-gradient(90deg, rgba(0,255,148,0.1) 0%, transparent 100%);
                    border-bottom: 1px solid #333;
                }
                .aic-title {
                    font-size: 18px;
                    font-weight: 800;
                    color: #00ff94;
                    text-shadow: 0 0 20px rgba(0,255,148,0.5);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .aic-title-icon {
                    font-size: 24px;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .aic-subtitle {
                    font-size: 11px;
                    color: #666;
                    margin-top: 5px;
                }
                .aic-body {
                    padding: 20px;
                    overflow-y: auto;
                    max-height: 60vh;
                }
                .aic-section {
                    margin-bottom: 20px;
                }
                .aic-section-title {
                    font-size: 11px;
                    color: #888;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .aic-prompt-input {
                    width: 100%;
                    height: 80px;
                    background: #111;
                    border: 1px solid #333;
                    border-radius: 8px;
                    color: #fff;
                    padding: 12px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 13px;
                    resize: none;
                    transition: all 0.2s;
                }
                .aic-prompt-input:focus {
                    outline: none;
                    border-color: #00ff94;
                    box-shadow: 0 0 20px rgba(0,255,148,0.2);
                }
                .aic-prompt-input::placeholder {
                    color: #555;
                }
                .aic-options {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                }
                .aic-option {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .aic-option-label {
                    font-size: 10px;
                    color: #666;
                }
                .aic-option-select, .aic-option-input {
                    background: #111;
                    border: 1px solid #333;
                    border-radius: 6px;
                    color: #fff;
                    padding: 8px 12px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                }
                .aic-option-select:focus, .aic-option-input:focus {
                    outline: none;
                    border-color: #00ff94;
                }
                .aic-genre-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }
                .aic-genre-btn {
                    background: #111;
                    border: 1px solid #333;
                    color: #888;
                    padding: 8px;
                    border-radius: 6px;
                    font-size: 10px;
                    cursor: pointer;
                    transition: all 0.15s;
                    text-align: center;
                }
                .aic-genre-btn:hover {
                    border-color: #00ff94;
                    color: #fff;
                }
                .aic-genre-btn.selected {
                    background: #00ff94;
                    color: #000;
                    border-color: #00ff94;
                }
                .aic-mood-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }
                .aic-mood-btn {
                    background: #111;
                    border: 1px solid #333;
                    color: #888;
                    padding: 8px;
                    border-radius: 6px;
                    font-size: 10px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .aic-mood-btn:hover {
                    border-color: #ff00cc;
                    color: #fff;
                }
                .aic-mood-btn.selected {
                    background: #ff00cc;
                    color: #fff;
                    border-color: #ff00cc;
                }
                .aic-slider-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .aic-slider {
                    flex: 1;
                    -webkit-appearance: none;
                    height: 4px;
                    background: #333;
                    border-radius: 2px;
                }
                .aic-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #00ff94;
                    border-radius: 50%;
                    cursor: pointer;
                }
                .aic-slider-value {
                    width: 40px;
                    text-align: right;
                    color: #00ff94;
                    font-size: 12px;
                }
                .aic-generate-btn {
                    width: 100%;
                    padding: 15px;
                    background: linear-gradient(90deg, #00ff94 0%, #00cc77 100%);
                    border: none;
                    border-radius: 8px;
                    color: #000;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .aic-generate-btn:hover:not(:disabled) {
                    transform: scale(1.02);
                    box-shadow: 0 0 30px rgba(0,255,148,0.5);
                }
                .aic-generate-btn:disabled {
                    background: #333;
                    color: #666;
                    cursor: not-allowed;
                }
                .aic-generate-btn.generating {
                    animation: generating 1s infinite;
                }
                @keyframes generating {
                    0%, 100% { background: linear-gradient(90deg, #00ff94 0%, #00cc77 100%); }
                    50% { background: linear-gradient(90deg, #00cc77 0%, #00ff94 100%); }
                }
                .aic-result {
                    margin-top: 20px;
                    padding: 15px;
                    background: #0a0a0a;
                    border-radius: 8px;
                    border: 1px solid #333;
                    display: none;
                }
                .aic-result.show {
                    display: block;
                }
                .aic-result-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .aic-result-title {
                    font-size: 12px;
                    color: #00ff94;
                    font-weight: 700;
                }
                .aic-result-stats {
                    display: flex;
                    gap: 15px;
                }
                .aic-stat {
                    font-size: 10px;
                    color: #666;
                }
                .aic-stat-value {
                    color: #00ff94;
                }
                .aic-waveform {
                    height: 60px;
                    background: #111;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .aic-waveform-canvas {
                    width: 100%;
                    height: 100%;
                }
                .aic-result-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                }
                .aic-action-btn {
                    flex: 1;
                    padding: 10px;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 6px;
                    color: #888;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .aic-action-btn:hover {
                    background: #222;
                    color: #fff;
                    border-color: #00ff94;
                }
                .aic-action-btn.primary {
                    background: #00ff94;
                    color: #000;
                    border-color: #00ff94;
                }
                .aic-close {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: none;
                    color: #666;
                    font-size: 20px;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .aic-close:hover {
                    color: #ff0055;
                }
                .aic-loading {
                    text-align: center;
                    padding: 30px;
                    display: none;
                }
                .aic-loading.show {
                    display: block;
                }
                .aic-spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid #333;
                    border-top-color: #00ff94;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .aic-loading-text {
                    color: #888;
                    font-size: 12px;
                }
            </style>
            <div class="aic-header">
                <div class="aic-title">
                    <span class="aic-title-icon">🧠</span>
                    AI COMPOSER
                </div>
                <div class="aic-subtitle">Generate complete songs from text descriptions</div>
                <button class="aic-close" id="aicClose">&times;</button>
            </div>
            <div class="aic-body">
                <div class="aic-section">
                    <div class="aic-section-title">Describe your song</div>
                    <textarea class="aic-prompt-input" id="aicPrompt" placeholder="A dark techno track with heavy bass, atmospheric pads, and a hypnotic melody that builds energy throughout..."></textarea>
                </div>

                <div class="aic-section">
                    <div class="aic-section-title">Genre</div>
                    <div class="aic-genre-grid" id="aicGenres"></div>
                </div>

                <div class="aic-section">
                    <div class="aic-section-title">Mood</div>
                    <div class="aic-mood-grid" id="aicMoods"></div>
                </div>

                <div class="aic-options">
                    <div class="aic-option">
                        <span class="aic-option-label">Tempo (BPM)</span>
                        <input type="number" class="aic-option-input" id="aicTempo" value="128" min="60" max="200">
                    </div>
                    <div class="aic-option">
                        <span class="aic-option-label">Key</span>
                        <select class="aic-option-select" id="aicKey">
                            <option value="C">C</option>
                            <option value="C#">C#</option>
                            <option value="D">D</option>
                            <option value="D#">D#</option>
                            <option value="E">E</option>
                            <option value="F">F</option>
                            <option value="F#">F#</option>
                            <option value="G">G</option>
                            <option value="G#">G#</option>
                            <option value="A">A</option>
                            <option value="A#">A#</option>
                            <option value="B">B</option>
                        </select>
                    </div>
                </div>

                <div class="aic-section">
                    <div class="aic-option-label">Complexity</div>
                    <div class="aic-slider-group">
                        <input type="range" class="aic-slider" id="aicComplexity" min="0" max="100" value="50">
                        <span class="aic-slider-value" id="aicComplexityValue">50%</span>
                    </div>
                </div>

                <button class="aic-generate-btn" id="aicGenerate">
                    🎵 GENERATE COMPOSITION
                </button>

                <div class="aic-loading" id="aicLoading">
                    <div class="aic-spinner"></div>
                    <div class="aic-loading-text">
                        Neural network composing...<br>
                        <small>Analyzing patterns, generating melody, harmony, and rhythm</small>
                    </div>
                </div>

                <div class="aic-result" id="aicResult">
                    <div class="aic-result-header">
                        <span class="aic-result-title">✓ Composition Generated</span>
                        <div class="aic-result-stats">
                            <span class="aic-stat">Coherence: <span class="aic-stat-value" id="aicCoherence">0%</span></span>
                            <span class="aic-stat">Originality: <span class="aic-stat-value" id="aicOriginality">0%</span></span>
                        </div>
                    </div>
                    <div class="aic-waveform">
                        <canvas id="aicWaveform" class="aic-waveform-canvas"></canvas>
                    </div>
                    <div class="aic-result-actions">
                        <button class="aic-action-btn" id="aicVariation">🔄 Variation</button>
                        <button class="aic-action-btn" id="aicStyleTransfer">🔀 Style Transfer</button>
                        <button class="aic-action-btn primary" id="aicUseComposition">▶ Use in Sequencer</button>
                    </div>
                </div>
            </div>
        `;

        this.setupGenres(wrapper);
        this.setupMoods(wrapper);
        this.setupEventListeners(wrapper);

        return wrapper;
    }

    private setupGenres(wrapper: HTMLElement): void {
        const genres = ['Techno', 'House', 'Trance', 'DNB', 'HipHop', 'Trap', 'Uptempo', 'Deutsche Tekke'];
        const container = wrapper.querySelector('#aicGenres') as HTMLElement;

        genres.forEach((genre, i) => {
            const btn = document.createElement('button');
            btn.className = 'aic-genre-btn' + (i === 0 ? ' selected' : '');
            btn.textContent = genre;
            btn.dataset.genre = genre.toLowerCase().replace(' ', '');
            btn.onclick = () => this.selectGenre(btn, container);
            container.appendChild(btn);
        });
    }

    private setupMoods(wrapper: HTMLElement): void {
        const moods = ['Energetic', 'Dark', 'Happy', 'Sad', 'Aggressive', 'Chill', 'Mysterious', 'Epic'];
        const container = wrapper.querySelector('#aicMoods') as HTMLElement;

        moods.forEach((mood, i) => {
            const btn = document.createElement('button');
            btn.className = 'aic-mood-btn' + (i === 0 ? ' selected' : '');
            btn.textContent = mood;
            btn.dataset.mood = mood.toLowerCase();
            btn.onclick = () => this.selectMood(btn, container);
            container.appendChild(btn);
        });
    }

    private selectGenre(btn: HTMLElement, container: HTMLElement): void {
        container.querySelectorAll('.aic-genre-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    }

    private selectMood(btn: HTMLElement, container: HTMLElement): void {
        container.querySelectorAll('.aic-mood-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    }

    private setupEventListeners(wrapper: HTMLElement): void {
        // Close
        wrapper.querySelector('#aicClose')?.addEventListener('click', () => this.hide());

        // Complexity slider
        wrapper.querySelector('#aicComplexity')?.addEventListener('input', (e) => {
            const value = (e.target as HTMLInputElement).value;
            (wrapper.querySelector('#aicComplexityValue') as HTMLElement).textContent = value + '%';
        });

        // Generate
        wrapper.querySelector('#aicGenerate')?.addEventListener('click', () => this.generate());

        // Result actions
        wrapper.querySelector('#aicVariation')?.addEventListener('click', () => this.createVariation());
        wrapper.querySelector('#aicStyleTransfer')?.addEventListener('click', () => this.styleTransfer());
        wrapper.querySelector('#aicUseComposition')?.addEventListener('click', () => this.useComposition());

        // Close on background click
        wrapper.addEventListener('click', (e) => {
            if (e.target === wrapper) this.hide();
        });
    }

    private async generate(): Promise<void> {
        if (this.isGenerating) return;

        const promptInput = this.container.querySelector('#aicPrompt') as HTMLTextAreaElement;
        const genreBtn = this.container.querySelector('.aic-genre-btn.selected') as HTMLElement;
        const moodBtn = this.container.querySelector('.aic-mood-btn.selected') as HTMLElement;
        const tempoInput = this.container.querySelector('#aicTempo') as HTMLInputElement;
        const keySelect = this.container.querySelector('#aicKey') as HTMLSelectElement;
        const complexityInput = this.container.querySelector('#aicComplexity') as HTMLInputElement;

        const prompt: CompositionPrompt = {
            description: promptInput.value,
            genre: genreBtn?.dataset.genre || 'techno',
            mood: moodBtn?.dataset.mood || 'energetic',
            tempo: parseInt(tempoInput.value) || 128,
            key: keySelect.value || 'C',
            complexity: parseInt(complexityInput.value) / 100,
            instruments: []
        };

        this.isGenerating = true;
        const generateBtn = this.container.querySelector('#aicGenerate') as HTMLButtonElement;
        const loading = this.container.querySelector('#aicLoading') as HTMLElement;
        const result = this.container.querySelector('#aicResult') as HTMLElement;

        generateBtn.disabled = true;
        generateBtn.classList.add('generating');
        loading.classList.add('show');
        result.classList.remove('show');

        try {
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 2000));

            this.currentComposition = await this.composer.compose(prompt);

            // Show result
            loading.classList.remove('show');
            result.classList.add('show');

            // Update stats
            (this.container.querySelector('#aicCoherence') as HTMLElement).textContent =
                Math.round(this.currentComposition.metadata.coherenceScore * 100) + '%';
            (this.container.querySelector('#aicOriginality') as HTMLElement).textContent =
                Math.round(this.currentComposition.metadata.originalityScore * 100) + '%';

            // Draw waveform preview
            this.drawWaveform();

        } catch (error) {
            log.error('Generation failed:', error);
            alert('Generation failed. Please try again.');
        } finally {
            this.isGenerating = false;
            generateBtn.disabled = false;
            generateBtn.classList.remove('generating');
            loading.classList.remove('show');
        }
    }

    private drawWaveform(): void {
        if (!this.currentComposition) return;

        const canvas = this.container.querySelector('#aicWaveform') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        // Clear
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, width, height);

        // Draw melody as waveform
        const melody = this.currentComposition.melody;
        if (melody.length === 0) return;

        const maxTime = Math.max(...melody.map(n => n.startTime + n.duration));
        const centerY = height / 2;

        // Gradient for waveform
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#00ff94');
        gradient.addColorStop(0.5, '#00ccff');
        gradient.addColorStop(1, '#ff00cc');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Sort by start time
        const sortedMelody = [...melody].sort((a, b) => a.startTime - b.startTime);

        sortedMelody.forEach((note, i) => {
            const x = (note.startTime / maxTime) * width;
            const normalizedNote = (note.note - 36) / 72; // Assuming 6 octave range
            const y = height - normalizedNote * height;
            const noteWidth = (note.duration / maxTime) * width;

            // Draw note bar
            ctx.fillStyle = `hsla(${160 + normalizedNote * 60}, 100%, 50%, ${note.velocity * 0.8})`;
            ctx.fillRect(x, y - 3, Math.max(2, noteWidth), 6);
        });

        // Draw harmony
        ctx.globalAlpha = 0.3;
        this.currentComposition.harmony.forEach(note => {
            const x = (note.startTime / maxTime) * width;
            const normalizedNote = (note.note - 24) / 72;
            const y = height - normalizedNote * height;

            ctx.fillStyle = '#00ff94';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;
    }

    private async createVariation(): Promise<void> {
        if (!this.currentComposition) return;

        this.isGenerating = true;
        const btn = this.container.querySelector('#aicVariation') as HTMLButtonElement;
        btn.textContent = '⏳ Creating...';
        btn.disabled = true;

        try {
            this.currentComposition = await this.composer.createVariation(this.currentComposition, 0.3);
            this.drawWaveform();

            (this.container.querySelector('#aicCoherence') as HTMLElement).textContent =
                Math.round(this.currentComposition.metadata.coherenceScore * 100) + '%';
            (this.container.querySelector('#aicOriginality') as HTMLElement).textContent =
                Math.round(this.currentComposition.metadata.originalityScore * 100) + '%';
        } finally {
            this.isGenerating = false;
            btn.textContent = '🔄 Variation';
            btn.disabled = false;
        }
    }

    private async styleTransfer(): Promise<void> {
        if (!this.currentComposition) return;

        // Show genre selector
        const genres = ['house', 'trance', 'dnb', 'hiphop', 'trap'];
        const targetGenre = genres[Math.floor(Math.random() * genres.length)];

        this.isGenerating = true;
        const btn = this.container.querySelector('#aicStyleTransfer') as HTMLButtonElement;
        btn.textContent = '⏳ Transferring...';
        btn.disabled = true;

        try {
            this.currentComposition = await this.composer.styleTransfer(this.currentComposition, targetGenre);
            this.drawWaveform();

            // Update genre button
            const genreBtn = this.container.querySelector(`[data-genre="${targetGenre}"]`) as HTMLElement;
            if (genreBtn) {
                const container = this.container.querySelector('#aicGenres') as HTMLElement;
                this.selectGenre(genreBtn, container);
            }
        } finally {
            this.isGenerating = false;
            btn.textContent = '🔀 Style Transfer';
            btn.disabled = false;
        }
    }

    private useComposition(): void {
        if (this.currentComposition && this.onCompositionReady) {
            this.onCompositionReady(this.currentComposition);
            this.hide();
        }
    }

    public show(): void {
        document.body.appendChild(this.container);
    }

    public hide(): void {
        this.container.remove();
    }

    public onComposition(callback: (comp: GeneratedComposition) => void): void {
        this.onCompositionReady = callback;
    }

    public getCurrentComposition(): GeneratedComposition | null {
        return this.currentComposition;
    }
}

// Global instance
let aiComposerPanelInstance: AIComposerPanel | null = null;

export function createAIComposerPanel(): AIComposerPanel {
    if (!aiComposerPanelInstance) {
        aiComposerPanelInstance = new AIComposerPanel();
    }
    return aiComposerPanelInstance;
}

export function getAIComposerPanel(): AIComposerPanel | null {
    return aiComposerPanelInstance;
}
