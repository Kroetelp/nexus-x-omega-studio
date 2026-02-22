/**
 * NEXUS-X Neural Audio Visualizer
 * AI-powered 3D audio visualization and reactive graphics
 *
 * This creates mind-bending visualizations that react to music in real-time
 * using WebGPU-inspired techniques and neural network concepts
 */

import { loggers } from '../utils/logger';

const log = loggers.ui;

export class NeuralVisualizer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private analyser: AnalyserNode | null = null;
    private audioContext: AudioContext | null = null;
    private animationId: number = 0;
    private isRunning: boolean = false;
    private mode: number = 0;
    private time: number = 0;
    private particles: Particle[] = [];
    private neurons: Neuron[] = [];
    private connections: Connection[] = [];
    private waveformHistory: number[][] = [];
    private spectralMemory: Float32Array | null = null;
    private beatDetector: BeatDetector;
    private lastBeat: number = 0;
    private energy: number = 0;
    private container: HTMLElement;

    private readonly MODES = [
        'Neural Network',
        'Spectral Fire',
        'Quantum Waves',
        'DNA Helix',
        'Black Hole',
        'Fractal Storm',
        'Synthetic Dreams',
        'Cosmic Pulse'
    ];

    constructor() {
        this.container = this.createUI();
        this.canvas = this.container.querySelector('#neuralCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.beatDetector = new BeatDetector();
        this.resize();
        this.initNeuralNetwork();
        window.addEventListener('resize', () => this.resize());
    }

    private createUI(): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'neural-visualizer';
        wrapper.innerHTML = `
            <style>
                .neural-visualizer {
                    position: fixed;
                    inset: 0;
                    background: #000;
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                }
                .nv-header {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    padding: 15px 20px;
                    background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    z-index: 10;
                }
                .nv-title {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 16px;
                    font-weight: 800;
                    color: #00ff94;
                    text-shadow: 0 0 20px rgba(0,255,148,0.5);
                    letter-spacing: 2px;
                }
                .nv-controls {
                    display: flex;
                    gap: 10px;
                }
                .nv-btn {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #fff;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .nv-btn:hover {
                    background: rgba(255,255,255,0.2);
                    border-color: #00ff94;
                }
                .nv-btn.active {
                    background: #00ff94;
                    color: #000;
                }
                .nv-canvas {
                    flex: 1;
                    width: 100%;
                }
                .nv-info {
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    color: rgba(255,255,255,0.5);
                }
                .nv-stats {
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    color: rgba(255,255,255,0.5);
                    text-align: right;
                }
                .nv-stat-value {
                    color: #00ff94;
                    font-weight: 700;
                }
                .nv-mode-selector {
                    position: absolute;
                    bottom: 60px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 5px;
                    flex-wrap: wrap;
                    justify-content: center;
                    max-width: 600px;
                }
                .nv-mode-btn {
                    background: rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.5);
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 9px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .nv-mode-btn:hover, .nv-mode-btn.active {
                    background: rgba(0,255,148,0.2);
                    border-color: #00ff94;
                    color: #00ff94;
                }
            </style>
            <div class="nv-header">
                <div class="nv-title">🧠 NEURAL AUDIO VISUALIZER</div>
                <div class="nv-controls">
                    <button class="nv-btn" id="nvStart">▶ START</button>
                    <button class="nv-btn" id="nvMic">🎤 MIC</button>
                    <button class="nv-btn" id="nvFullscreen">⛶ FULL</button>
                    <button class="nv-btn" id="nvClose">✕ CLOSE</button>
                </div>
            </div>
            <canvas id="neuralCanvas" class="nv-canvas"></canvas>
            <div class="nv-mode-selector" id="nvModes"></div>
            <div class="nv-info">
                AI-POWERED REAL-TIME AUDIO VISUALIZATION<br>
                Mode: <span id="nvModeName">Neural Network</span>
            </div>
            <div class="nv-stats">
                ENERGY: <span class="nv-stat-value" id="nvEnergy">0%</span><br>
                BEATS: <span class="nv-stat-value" id="nvBeats">0</span><br>
                FPS: <span class="nv-stat-value" id="nvFps">60</span>
            </div>
        `;

        // Mode buttons
        const modesContainer = wrapper.querySelector('#nvModes') as HTMLElement;
        this.MODES.forEach((mode, index) => {
            const btn = document.createElement('button');
            btn.className = 'nv-mode-btn' + (index === 0 ? ' active' : '');
            btn.textContent = mode;
            btn.onclick = () => this.setMode(index, btn);
            modesContainer.appendChild(btn);
        });

        // Event listeners
        wrapper.querySelector('#nvStart')?.addEventListener('click', (e) => this.toggleStart(e.target as HTMLElement));
        wrapper.querySelector('#nvMic')?.addEventListener('click', () => this.enableMicrophone());
        wrapper.querySelector('#nvFullscreen')?.addEventListener('click', () => this.toggleFullscreen());
        wrapper.querySelector('#nvClose')?.addEventListener('click', () => this.hide());

        return wrapper;
    }

    private resize(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    private initNeuralNetwork(): void {
        // Create neurons in a brain-like pattern
        const layers = [8, 16, 24, 16, 8];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        this.neurons = [];
        this.connections = [];

        let neuronId = 0;
        layers.forEach((count, layerIndex) => {
            const layerX = centerX + (layerIndex - 2) * 120;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const radius = 80 + layerIndex * 30;
                const neuron: Neuron = {
                    id: neuronId++,
                    x: layerX + Math.cos(angle) * radius * 0.3,
                    y: centerY + Math.sin(angle) * radius,
                    vx: 0,
                    vy: 0,
                    activation: 0,
                    layer: layerIndex,
                    pulsePhase: Math.random() * Math.PI * 2
                };
                this.neurons.push(neuron);
            }
        });

        // Create connections between adjacent layers
        for (let l = 0; l < layers.length - 1; l++) {
            const currentLayer = this.neurons.filter(n => n.layer === l);
            const nextLayer = this.neurons.filter(n => n.layer === l + 1);

            currentLayer.forEach(n1 => {
                nextLayer.forEach(n2 => {
                    if (Math.random() > 0.3) {
                        this.connections.push({
                            from: n1.id,
                            to: n2.id,
                            weight: Math.random(),
                            signal: 0
                        });
                    }
                });
            });
        }

        // Initialize particles
        this.particles = [];
        for (let i = 0; i < 200; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                hue: Math.random() * 60 + 140,
                life: 1,
                maxLife: 1
            });
        }
    }

    private setMode(index: number, btn: HTMLElement): void {
        this.mode = index;
        document.querySelectorAll('.nv-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        (this.container.querySelector('#nvModeName') as HTMLElement).textContent = this.MODES[index];
    }

    private toggleStart(btn: HTMLElement): void {
        if (this.isRunning) {
            this.stop();
            btn.textContent = '▶ START';
            btn.classList.remove('active');
        } else {
            this.start();
            btn.textContent = '⏹ STOP';
            btn.classList.add('active');
        }
    }

    private async enableMicrophone(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new AudioContext();
            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            source.connect(this.analyser);
            this.spectralMemory = new Float32Array(this.analyser.frequencyBinCount);

            if (!this.isRunning) {
                this.start();
                const btn = this.container.querySelector('#nvStart') as HTMLElement;
                btn.textContent = '⏹ STOP';
                btn.classList.add('active');
            }

            (this.container.querySelector('#nvMic') as HTMLElement).classList.add('active');
        } catch (err) {
            log.error('Microphone access denied:', err);
            alert('Mikrofon-Zugriff verweigert!');
        }
    }

    private toggleFullscreen(): void {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            this.container.requestFullscreen();
        }
    }

    public show(): void {
        document.body.appendChild(this.container);
        this.resize();
    }

    public hide(): void {
        this.stop();
        this.container.remove();
    }

    private start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }

    private stop(): void {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    private animate(): void {
        if (!this.isRunning) return;

        this.time += 0.016;
        let fps = 60;

        // Get audio data
        let frequencies: Float32Array | null = null;
        let waveformData: Float32Array | null = null;

        if (this.analyser) {
            frequencies = new Float32Array(this.analyser.frequencyBinCount);
            waveformData = new Float32Array(this.analyser.frequencyBinCount);
            this.analyser.getFloatFrequencyData(frequencies as Float32Array<ArrayBuffer>);
            this.analyser.getFloatTimeDomainData(waveformData as Float32Array<ArrayBuffer>);

            // Calculate energy
            this.energy = this.calculateEnergy(frequencies);

            // Beat detection
            if (this.beatDetector.detect(frequencies)) {
                this.lastBeat = this.time;
                const beatsEl = this.container.querySelector('#nvBeats');
                if (beatsEl) {
                    beatsEl.textContent = String(parseInt(beatsEl.textContent || '0') + 1);
                }
            }
        } else {
            // Demo mode with simulated audio
            this.energy = (Math.sin(this.time * 2) + 1) / 2 * 0.5 +
                          (Math.sin(this.time * 5) + 1) / 2 * 0.3 +
                          (Math.sin(this.time * 0.5) + 1) / 2 * 0.2;

            if (Math.random() < 0.02 && this.time - this.lastBeat > 0.3) {
                this.lastBeat = this.time;
            }
        }

        // Update stats
        (this.container.querySelector('#nvEnergy') as HTMLElement).textContent =
            Math.round(this.energy * 100) + '%';

        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render based on mode
        switch (this.mode) {
            case 0: this.renderNeuralNetwork(frequencies); break;
            case 1: this.renderSpectralFire(frequencies); break;
            case 2: this.renderQuantumWaves(frequencies, waveformData); break;
            case 3: this.renderDNAHelix(frequencies); break;
            case 4: this.renderBlackHole(frequencies); break;
            case 5: this.renderFractalStorm(frequencies); break;
            case 6: this.renderSyntheticDreams(frequencies); break;
            case 7: this.renderCosmicPulse(frequencies); break;
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    private calculateEnergy(frequencies: Float32Array): number {
        let sum = 0;
        for (let i = 0; i < frequencies.length; i++) {
            sum += Math.max(0, frequencies[i] + 100) / 100;
        }
        return sum / frequencies.length;
    }

    // ============== VISUALIZATION MODES ==============

    private renderNeuralNetwork(frequencies: Float32Array | null): void {
        const beatPulse = Math.max(0, 1 - (this.time - this.lastBeat) * 5);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Update neurons
        this.neurons.forEach((neuron, i) => {
            const freqIndex = Math.floor((i / this.neurons.length) * (frequencies?.length || 128));
            const freq = frequencies ? Math.max(0, (frequencies[freqIndex] + 100) / 100) : this.energy;

            neuron.activation = neuron.activation * 0.9 + freq * 0.1;

            // Pulse effect
            const pulse = Math.sin(this.time * 3 + neuron.pulsePhase) * 0.5 + 0.5;
            const activation = neuron.activation + pulse * 0.3 + beatPulse * 0.5;

            // Draw glow
            const gradient = this.ctx.createRadialGradient(
                neuron.x, neuron.y, 0,
                neuron.x, neuron.y, 20 + activation * 30
            );
            gradient.addColorStop(0, `hsla(${160 + neuron.layer * 20}, 100%, 60%, ${activation * 0.8})`);
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, 20 + activation * 30, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw neuron core
            this.ctx.fillStyle = `hsl(${160 + neuron.layer * 20}, 100%, ${50 + activation * 50}%)`;
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, 5 + activation * 8, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw connections
        this.connections.forEach(conn => {
            const from = this.neurons.find(n => n.id === conn.from);
            const to = this.neurons.find(n => n.id === conn.to);
            if (!from || !to) return;

            conn.signal = conn.signal * 0.95 + from.activation * conn.weight * 0.05;

            const gradient = this.ctx.createLinearGradient(from.x, from.y, to.x, to.y);
            gradient.addColorStop(0, `hsla(160, 100%, 50%, ${from.activation * 0.5})`);
            gradient.addColorStop(0.5, `hsla(180, 100%, 50%, ${conn.signal * 0.8})`);
            gradient.addColorStop(1, `hsla(200, 100%, 50%, ${to.activation * 0.5})`);

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1 + conn.signal * 3;
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            this.ctx.stroke();
        });
    }

    private renderSpectralFire(frequencies: Float32Array | null): void {
        const cols = 128;
        const colWidth = this.canvas.width / cols;

        for (let i = 0; i < cols; i++) {
            const freqIndex = Math.floor((i / cols) * (frequencies?.length || 128));
            const freq = frequencies ? Math.max(0, (frequencies[freqIndex] + 80) / 60) :
                          Math.sin(this.time + i * 0.1) * 0.5 + 0.5;

            const height = freq * this.canvas.height * 0.8;
            const x = i * colWidth;
            const y = this.canvas.height;

            // Fire gradient
            const gradient = this.ctx.createLinearGradient(x, y, x, y - height);
            gradient.addColorStop(0, 'rgba(255, 0, 50, 0.9)');
            gradient.addColorStop(0.3, 'rgba(255, 100, 0, 0.7)');
            gradient.addColorStop(0.6, 'rgba(255, 200, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y - height, colWidth, height);

            // Add flames
            for (let j = 0; j < 5; j++) {
                const flameX = x + colWidth / 2 + Math.sin(this.time * 10 + i + j) * 10;
                const flameY = y - height + j * 20;
                const flameSize = (height / 20) * (1 - j / 5);

                this.ctx.fillStyle = `rgba(255, ${150 - j * 30}, 0, ${0.5 - j * 0.1})`;
                this.ctx.beginPath();
                this.ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    private renderQuantumWaves(frequencies: Float32Array | null, waveformData: Float32Array | null): void {
        const centerY = this.canvas.height / 2;
        const points = 256;

        // Multiple wave layers
        for (let layer = 0; layer < 5; layer++) {
            const offset = layer * 50;
            const alpha = 1 - layer * 0.15;
            const hue = 180 + layer * 20;

            this.ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
            this.ctx.lineWidth = 3 - layer * 0.5;
            this.ctx.beginPath();

            for (let i = 0; i <= points; i++) {
                const x = (i / points) * this.canvas.width;
                const freqIndex = Math.floor((i / points) * (waveformData?.length || 128));
                const wave = waveformData ? waveformData[freqIndex] :
                             Math.sin(this.time * 3 + i * 0.05 + layer);

                const baseWave = Math.sin(this.time * 2 + i * 0.03 + layer * 0.5) * 50;
                const audioWave = wave * 100 * this.energy;
                const quantumNoise = Math.sin(this.time * 20 + i * 0.2 + layer) * 10 * this.energy;

                const y = centerY + offset + baseWave + audioWave + quantumNoise;

                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }

            this.ctx.stroke();

            // Glow effect
            this.ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
            this.ctx.shadowBlur = 20;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
    }

    private renderDNAHelix(frequencies: Float32Array | null): void {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const strands = 100;

        for (let strand = 0; strand < 2; strand++) {
            const hue = strand === 0 ? 160 : 280;
            const phase = strand * Math.PI;

            this.ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.8)`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();

            for (let i = 0; i <= strands; i++) {
                const t = i / strands;
                const y = t * this.canvas.height;
                const freqIndex = Math.floor(t * (frequencies?.length || 128));
                const freq = frequencies ? Math.max(0, (frequencies[freqIndex] + 80) / 60) : this.energy;

                const angle = t * Math.PI * 8 + this.time * 2 + phase;
                const radius = 150 + freq * 100;
                const x = centerX + Math.cos(angle) * radius;

                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }

            this.ctx.stroke();

            // Draw nodes
            for (let i = 0; i <= strands; i += 5) {
                const t = i / strands;
                const y = t * this.canvas.height;
                const freqIndex = Math.floor(t * (frequencies?.length || 128));
                const freq = frequencies ? Math.max(0, (frequencies[freqIndex] + 80) / 60) : this.energy;

                const angle = t * Math.PI * 8 + this.time * 2 + phase;
                const radius = 150 + freq * 100;
                const x = centerX + Math.cos(angle) * radius;

                this.ctx.fillStyle = `hsl(${hue}, 100%, ${50 + freq * 50}%)`;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 5 + freq * 10, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Connecting bars
        for (let i = 0; i <= strands; i += 10) {
            const t = i / strands;
            const y = t * this.canvas.height;
            const freqIndex = Math.floor(t * (frequencies?.length || 128));
            const freq = frequencies ? Math.max(0, (frequencies[freqIndex] + 80) / 60) : this.energy;

            const angle1 = t * Math.PI * 8 + this.time * 2;
            const angle2 = angle1 + Math.PI;
            const radius = 150 + freq * 100;

            const x1 = centerX + Math.cos(angle1) * radius;
            const x2 = centerX + Math.cos(angle2) * radius;

            this.ctx.strokeStyle = `hsla(220, 100%, 60%, ${0.3 + freq * 0.5})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y);
            this.ctx.lineTo(x2, y);
            this.ctx.stroke();
        }
    }

    private renderBlackHole(frequencies: Float32Array | null): void {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Event horizon
        const horizonRadius = 100 + this.energy * 50;

        // Accretion disk
        for (let ring = 0; ring < 20; ring++) {
            const radius = horizonRadius + ring * 30;
            const rotation = this.time * (2 - ring * 0.1);

            this.ctx.strokeStyle = `hsla(${30 + ring * 5}, 100%, ${60 - ring * 2}%, ${0.8 - ring * 0.03})`;
            this.ctx.lineWidth = 5 - ring * 0.2;
            this.ctx.beginPath();

            for (let i = 0; i <= 360; i += 5) {
                const angle = (i * Math.PI / 180) + rotation;
                const freqIndex = Math.floor((i / 360) * (frequencies?.length || 128));
                const freq = frequencies ? Math.max(0, (frequencies[freqIndex] + 80) / 60) : this.energy;

                const r = radius + freq * 50 + Math.sin(angle * 3 + this.time * 5) * 20;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r * 0.3;

                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }

            this.ctx.closePath();
            this.ctx.stroke();
        }

        // Black hole center
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, horizonRadius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.9)');
        gradient.addColorStop(1, 'rgba(20, 0, 30, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, horizonRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Gravitational lensing effect
        this.ctx.strokeStyle = `rgba(100, 50, 200, ${this.energy * 0.5})`;
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
            const r = horizonRadius * (1.2 + i * 0.1);
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    private renderFractalStorm(frequencies: Float32Array | null): void {
        this.particles.forEach((p, i) => {
            const freqIndex = Math.floor((i / this.particles.length) * (frequencies?.length || 128));
            const freq = frequencies ? Math.max(0, (frequencies[freqIndex] + 80) / 60) : this.energy;

            // Update position
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const dx = centerX - p.x;
            const dy = centerY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Vortex motion
            const angle = Math.atan2(dy, dx) + Math.PI / 2;
            const speed = (1 + this.energy * 3) * (1 + freq);

            p.vx += Math.cos(angle) * speed * 0.1 + (Math.random() - 0.5) * freq * 2;
            p.vy += Math.sin(angle) * speed * 0.1 + (Math.random() - 0.5) * freq * 2;

            p.vx *= 0.98;
            p.vy *= 0.98;

            p.x += p.vx;
            p.y += p.vy;

            // Reset if out of bounds
            if (p.x < 0 || p.x > this.canvas.width || p.y < 0 || p.y > this.canvas.height) {
                p.x = centerX + (Math.random() - 0.5) * 100;
                p.y = centerY + (Math.random() - 0.5) * 100;
            }

            // Draw
            const alpha = 0.5 + freq * 0.5;
            this.ctx.fillStyle = `hsla(${p.hue + this.time * 50}, 100%, 60%, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * (1 + freq), 0, Math.PI * 2);
            this.ctx.fill();

            // Trail
            this.ctx.strokeStyle = `hsla(${p.hue + this.time * 50}, 100%, 50%, ${alpha * 0.5})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x - p.vx * 5, p.y - p.vy * 5);
            this.ctx.stroke();
        });
    }

    private renderSyntheticDreams(frequencies: Float32Array | null): void {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Dreamy morphing shapes
        for (let shape = 0; shape < 8; shape++) {
            const baseRadius = 100 + shape * 40;
            const points = 64;
            const rotation = this.time * (0.5 + shape * 0.1) * (shape % 2 ? 1 : -1);

            const hue = (this.time * 20 + shape * 45) % 360;

            this.ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.6 - shape * 0.05})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();

            for (let i = 0; i <= points; i++) {
                const t = i / points;
                const angle = t * Math.PI * 2 + rotation;
                const freqIndex = Math.floor(t * (frequencies?.length || 128));
                const freq = frequencies ? Math.max(0, (frequencies[freqIndex] + 80) / 60) : this.energy;

                const morph = Math.sin(angle * 3 + this.time + shape) * 30 * this.energy;
                const morph2 = Math.sin(angle * 5 - this.time * 2 + shape) * 20 * freq;
                const radius = baseRadius + morph + morph2 + freq * 50;

                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;

                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }

            this.ctx.closePath();
            this.ctx.stroke();

            // Glow
            this.ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
            this.ctx.shadowBlur = 30;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }

        // Floating particles
        for (let i = 0; i < 50; i++) {
            const x = (Math.sin(this.time * 0.5 + i * 0.5) + 1) / 2 * this.canvas.width;
            const y = (Math.cos(this.time * 0.3 + i * 0.7) + 1) / 2 * this.canvas.height;
            const size = 2 + Math.sin(this.time + i) * 2;
            const alpha = 0.3 + Math.sin(this.time * 2 + i) * 0.2;

            this.ctx.fillStyle = `hsla(${(this.time * 30 + i * 10) % 360}, 100%, 70%, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    private renderCosmicPulse(frequencies: Float32Array | null): void {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Pulsing rings
        const beatTime = this.time - this.lastBeat;
        const numRings = 20;

        for (let i = 0; i < numRings; i++) {
            const age = (beatTime + i * 0.5) % 5;
            const radius = age * 200;
            const alpha = Math.max(0, 1 - age / 5);

            const freqIndex = Math.floor((i / numRings) * (frequencies?.length || 128));
            const freq = frequencies ? Math.max(0, (frequencies[freqIndex] + 80) / 60) : this.energy;

            const hue = (this.time * 50 + i * 20) % 360;

            this.ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${alpha * (0.3 + freq * 0.7)})`;
            this.ctx.lineWidth = 3 + freq * 5;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Stars
        for (let i = 0; i < 100; i++) {
            const angle = (i / 100) * Math.PI * 2 + this.time * 0.1;
            const dist = 200 + Math.sin(this.time + i) * 100 + i * 5;
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;

            const freqIndex = i % (frequencies?.length || 128);
            const freq = frequencies ? Math.max(0, (frequencies[freqIndex] + 80) / 60) : 0.5;

            const brightness = 0.5 + Math.sin(this.time * 5 + i) * 0.3 + freq * 0.5;

            this.ctx.fillStyle = `hsla(${200 + i}, 100%, ${50 + brightness * 50}%, ${brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2 + freq * 3, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Central pulse
        const pulseSize = 50 + this.energy * 100;
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
        gradient.addColorStop(0, `hsla(${(this.time * 100) % 360}, 100%, 80%, 0.9)`);
        gradient.addColorStop(0.5, `hsla(${(this.time * 100 + 60) % 360}, 100%, 50%, 0.5)`);
        gradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

// ============== HELPER TYPES ==============

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    hue: number;
    life: number;
    maxLife: number;
}

interface Neuron {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    activation: number;
    layer: number;
    pulsePhase: number;
}

interface Connection {
    from: number;
    to: number;
    weight: number;
    signal: number;
}

// ============== BEAT DETECTOR ==============

class BeatDetector {
    private energyHistory: number[] = [];
    private readonly HISTORY_SIZE = 43;
    private lastBeatTime: number = 0;
    private readonly MIN_BEAT_GAP = 0.2;

    detect(frequencies: Float32Array): boolean {
        // Calculate instant energy
        let energy = 0;
        const start = 0;
        const end = Math.floor(frequencies.length / 4);

        for (let i = start; i < end; i++) {
            const val = Math.max(0, frequencies[i] + 100) / 100;
            energy += val * val;
        }

        // Add to history
        this.energyHistory.push(energy);
        if (this.energyHistory.length > this.HISTORY_SIZE) {
            this.energyHistory.shift();
        }

        // Calculate average
        const avg = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;

        // Beat threshold
        const threshold = avg * 1.3;
        const now = performance.now() / 1000;

        if (energy > threshold && now - this.lastBeatTime > this.MIN_BEAT_GAP) {
            this.lastBeatTime = now;
            return true;
        }

        return false;
    }
}

// ============== GLOBAL INSTANCE ==============

let neuralVisualizerInstance: NeuralVisualizer | null = null;

export function createNeuralVisualizer(): NeuralVisualizer {
    if (!neuralVisualizerInstance) {
        neuralVisualizerInstance = new NeuralVisualizer();
    }
    return neuralVisualizerInstance;
}

export function getNeuralVisualizer(): NeuralVisualizer | null {
    return neuralVisualizerInstance;
}
