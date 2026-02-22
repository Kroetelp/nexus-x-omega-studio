/**
 * NEXUS-X NexusUI Setup
 * Initializes all NexusUI components and connects them to the audio engine
 *
 * ARCHITECTURE (Phase 3+4):
 * [UI] -> [Store.dispatch(action)] -> [StoreBridge] -> [Tone.js or Rust]
 */

import * as Tone from 'tone';
import { audioEngine } from '../audio/core/AudioEngine';
import { loggers } from '../utils/logger';
import { createEmptyPattern, TRACKS } from '../sequencer/patternUtils';
import { TRACK_NAMES, NUM_TRACKS, STEPS_PER_PATTERN, TRACK_COLORS } from '../config/index';
import { appStore } from '../core/AppStore';
import {
    generateFullPatternWithVelocity,
    toLegacyPattern,
    fromLegacyPattern,
    GenreType
} from '../ai-engine/VelocityPatternGenerator';
import type { NoteData, FullPattern } from '../sequencer/NoteData';

// Logger instance
const log = loggers.ui;

// Declare NexusUI global
declare const Nexus: any;

// ============================================================
// TRACK CHANNEL SYSTEM
// ============================================================

export interface TrackChannel {
    index: number;
    name: string;
    synth: Tone.PolySynth | null;
    gainNode: Tone.Volume;
    panner: Tone.Panner;
    muted: boolean;
    soloed: boolean;
    volume: number;      // 0-1
    pan: number;         // -1 to 1
}

// Track channels array - the SOURCE OF TRUTH for all track audio
const trackChannels: TrackChannel[] = [];

// Solo state management
let soloActive = false;

/**
 * Get all track channels
 */
export function getTrackChannels(): TrackChannel[] {
    return trackChannels;
}

/**
 * Get a specific track channel
 */
export function getTrackChannel(index: number): TrackChannel | undefined {
    return trackChannels[index];
}

/**
 * Set track volume (0-1)
 */
export function setTrackVolume(trackIndex: number, volume: number): void {
    const channel = trackChannels[trackIndex];
    if (channel) {
        channel.volume = volume;
        if (!channel.muted && !(soloActive && !channel.soloed)) {
            channel.gainNode.volume.value = Tone.gainToDb(volume);
        }
        log.debug(` Track ${trackIndex} volume: ${volume}`);
    }
}

/**
 * Set track pan (-1 to 1)
 */
export function setTrackPan(trackIndex: number, pan: number): void {
    const channel = trackChannels[trackIndex];
    if (channel) {
        channel.pan = Math.max(-1, Math.min(1, pan));
        channel.panner.pan.value = channel.pan;
        log.debug(` Track ${trackIndex} pan: ${channel.pan}`);
    }
}

/**
 * Toggle track mute
 */
export function toggleTrackMute(trackIndex: number): boolean {
    const channel = trackChannels[trackIndex];
    if (channel) {
        channel.muted = !channel.muted;
        updateTrackAudioState(trackIndex);
        log.debug(` Track ${trackIndex} muted: ${channel.muted}`);
        return channel.muted;
    }
    return false;
}

/**
 * Toggle track solo
 */
export function toggleTrackSolo(trackIndex: number): boolean {
    const channel = trackChannels[trackIndex];
    if (channel) {
        channel.soloed = !channel.soloed;

        // Check if any track is soloed
        soloActive = trackChannels.some(c => c.soloed);

        // Update all tracks
        trackChannels.forEach((_, i) => updateTrackAudioState(i));

        log.debug(` Track ${trackIndex} soloed: ${channel.soloed}, soloActive: ${soloActive}`);
        return channel.soloed;
    }
    return false;
}

/**
 * Update the actual audio state for a track based on mute/solo/volume
 */
function updateTrackAudioState(trackIndex: number): void {
    const channel = trackChannels[trackIndex];
    if (!channel) return;

    let effectiveVolume = channel.volume;

    // Mute logic
    if (channel.muted) {
        effectiveVolume = 0;
    }
    // Solo logic - if any track is soloed, non-soloed tracks are muted
    else if (soloActive && !channel.soloed) {
        effectiveVolume = 0;
    }

    channel.gainNode.volume.value = Tone.gainToDb(Math.max(0.001, effectiveVolume));
}

/**
 * Initialize track channels with gain and panner nodes
 */
function initializeTrackChannels(): void {
    if (trackChannels.length > 0) return; // Already initialized

    const effects = audioEngine.getEffects();
    const drumBus = effects.drumBus;
    const synthBus = effects.synthBus;

    log.debug(' Initializing track channels...');

    for (let i = 0; i < NUM_TRACKS; i++) {
        // Create gain node for volume control
        const gainNode = new Tone.Volume(0);

        // Create panner for stereo positioning
        const panner = new Tone.Panner(0);

        // Determine destination based on track type
        const destination = (i < 4) ? drumBus : synthBus;

        // Connect: panner -> gainNode -> bus
        panner.connect(gainNode);
        if (destination) {
            gainNode.connect(destination);
        } else {
            gainNode.toDestination();
        }

        trackChannels.push({
            index: i,
            name: TRACK_NAMES[i],
            synth: null,
            gainNode,
            panner,
            muted: false,
            soloed: false,
            volume: 0.7,
            pan: 0
        });

        log.debug(` Track ${i} (${TRACK_NAMES[i]}) channel created`);
    }
}

// ============================================================
// NEXUSUI INITIALIZATION
// ============================================================

export function initializeNexusUI(): void {
    log.debug(' Setting up components...');
    log.debug(' Nexus available?', typeof Nexus !== 'undefined');
    log.debug(' audioEngine ready?', audioEngine.isReady());

    // Wait for NexusUI to be loaded
    if (typeof Nexus === 'undefined') {
        log.warn(' NexusUI not loaded, retrying in 500ms...');
        setTimeout(initializeNexusUI, 500);
        return;
    }

    // Initialize all components
    try {
        setupEQButtons();
        log.debug(' ✓ EQ Buttons done');
    } catch (e) {
        log.error(' ✗ EQ Buttons failed:', e);
    }

    try {
        setupMasterDials();
        log.debug(' ✓ Master Dials done');
    } catch (e) {
        log.error(' ✗ Master Dials failed:', e);
    }

    try {
        setupMicControls();
        log.debug(' ✓ Mic Controls done');
    } catch (e) {
        log.error(' ✗ Mic Controls failed:', e);
    }

    try {
        setupSpaceControls();
        log.debug(' ✓ Space Controls done');
    } catch (e) {
        log.error(' ✗ Space Controls failed:', e);
    }

    try {
        setupMacroFX();
        log.debug(' ✓ Macro FX done');
    } catch (e) {
        log.error(' ✗ Macro FX failed:', e);
    }

    try {
        setupBitcrush();
        log.debug(' ✓ Bitcrush done');
    } catch (e) {
        log.error(' ✗ Bitcrush failed:', e);
    }

    try {
        setupVisualization();
        log.debug(' ✓ Visualization done');
    } catch (e) {
        log.error(' ✗ Visualization failed:', e);
    }

    log.debug(' All components initialized');
}

// ============================================================
// EQ BUTTONS (LOW / MID / HIGH)
// ============================================================

function setupEQButtons(): void {
    // Low EQ
    const eqLowBtn = new Nexus.Button('#eqLowBtn', {
        size: [40, 40],
        mode: 'toggle'
    });
    eqLowBtn.on('change', (v: boolean) => {
        log.debug(' EQ Low:', v);
        if (audioEngine.getEffects().filter) {
            // Kill low frequencies when active
            audioEngine.getEffects().filter.frequency.value = v ? 200 : 20000;
        }
    });

    // Mid EQ
    const eqMidBtn = new Nexus.Button('#eqMidBtn', {
        size: [40, 40],
        mode: 'toggle'
    });
    eqMidBtn.on('change', (v: boolean) => {
        log.debug(' EQ Mid:', v);
    });

    // High EQ
    const eqHighBtn = new Nexus.Button('#eqHighBtn', {
        size: [40, 40],
        mode: 'toggle'
    });
    eqHighBtn.on('change', (v: boolean) => {
        log.debug(' EQ High:', v);
        if (audioEngine.getEffects().filter) {
            // Kill high frequencies when active
            audioEngine.getEffects().filter.frequency.value = v ? 5000 : 20000;
        }
    });
}

// ============================================================
// MASTER DIALS (PITCH, WIDTH, VOLUME)
// ============================================================

function setupMasterDials(): void {
    // Master Pitch
    const masterPitchDial = new Nexus.Dial('#masterPitchDial', {
        size: [40, 40],
        min: -12,
        max: 12,
        value: 0
    });
    masterPitchDial.on('change', (v: number) => {
        log.debug(' Master Pitch changed:', v);
        // Detune by semitones - using detune on destination
        const detune = v * 100; // cents
        const effects = audioEngine.getEffects();
        if (effects.masterVolume) {
            // Apply detune to all synths via Tone.Transport
            Tone.Transport.bpm.value = Tone.Transport.bpm.value; // Trigger update
        }
    });

    // Master Width
    const masterWidthDial = new Nexus.Dial('#masterWidthDial', {
        size: [40, 40],
        min: 0,
        max: 1,
        value: 0.5
    });
    masterWidthDial.on('change', (v: number) => {
        log.debug(' Master Width changed:', v);
        const effects = audioEngine.getEffects();
        log.debug(' stereoWidener exists:', !!effects.stereoWidener);
        if (effects.stereoWidener) {
            effects.stereoWidener.width.value = v;
            log.debug(' Width set to:', effects.stereoWidener.width.value);
        }
    });

    // Master Volume - THIS IS THE KEY ONE
    const masterVolDial = new Nexus.Dial('#masterVolDial', {
        size: [40, 40],
        min: 0,
        max: 1,
        value: 0.8
    });
    masterVolDial.on('change', (v: number) => {
        log.debug(' Master Volume changed:', v);
        log.debug(' audioEngine.isReady():', audioEngine.isReady());

        const effects = audioEngine.getEffects();
        log.debug(' masterVolume exists:', !!effects.masterVolume);

        audioEngine.setMasterVolume(v);

        // Verify it was set
        if (effects.masterVolume) {
            log.debug(' Volume after set:', effects.masterVolume.volume.value, 'dB');
        }
    });

    log.debug(' Master dials created, volume dial:', !!masterVolDial);
}

// ============================================================
// MIC CONTROLS
// ============================================================

function setupMicControls(): void {
    // Mic Toggle
    const micBtn = new Nexus.Button('#micBtn', {
        size: [40, 40],
        mode: 'toggle'
    });
    micBtn.on('change', async (v: boolean) => {
        log.debug(' Mic:', v);
        if (v) {
            try {
                const mic = new Tone.UserMedia();
                await mic.open();
                log.debug(' Microphone enabled');
            } catch (e) {
                log.error(' Microphone access denied:', e);
            }
        }
    });

    // Mic Volume
    const micVolDial = new Nexus.Dial('#micVolDial', {
        size: [40, 40],
        min: 0,
        max: 1,
        value: 0.5
    });
    micVolDial.on('change', (v: number) => {
        log.debug(' Mic Volume:', v);
    });

    // Mic Reverb
    const micReverbDial = new Nexus.Dial('#micReverbDial', {
        size: [40, 40],
        min: 0,
        max: 1,
        value: 0.3
    });
    micReverbDial.on('change', (v: number) => {
        log.debug(' Mic Reverb:', v);
    });
}

// ============================================================
// SPACE CONTROLS (REVERB / DELAY)
// ============================================================

function setupSpaceControls(): void {
    // Reverb Wet
    const verbWetDial = new Nexus.Dial('#verbWetDial', {
        size: [40, 40],
        min: 0,
        max: 1,
        value: 0.3
    });
    verbWetDial.on('change', (v: number) => {
        log.debug(' Reverb Wet:', v);
        const reverb = audioEngine.getEffects().reverb;
        if (reverb) {
            reverb.wet.value = v;
        }
    });

    // Delay Wet
    const delayWetDial = new Nexus.Dial('#delayWetDial', {
        size: [40, 40],
        min: 0,
        max: 1,
        value: 0
    });
    delayWetDial.on('change', (v: number) => {
        log.debug(' Delay Wet:', v);
        const delay = audioEngine.getEffects().delay;
        if (delay) {
            delay.wet.value = v;
        }
    });

    // Delay Time
    const delayTimeDial = new Nexus.Dial('#delayTimeDial', {
        size: [40, 40],
        min: 0,
        max: 1,
        value: 0.5
    });
    delayTimeDial.on('change', (v: number) => {
        log.debug(' Delay Time:', v);
        const delay = audioEngine.getEffects().delay;
        if (delay) {
            delay.delayTime.value = v * 2; // 0-2 seconds
        }
    });

    // Delay Feedback
    const delayFbDial = new Nexus.Dial('#delayFbDial', {
        size: [40, 40],
        min: 0,
        max: 1,
        value: 0.4
    });
    delayFbDial.on('change', (v: number) => {
        log.debug(' Delay Feedback:', v);
        const delay = audioEngine.getEffects().delay;
        if (delay) {
            delay.feedback.value = v;
        }
    });
}

// ============================================================
// MACRO FX (FLUX / PUMP / STUTT / WOBBLE)
// ============================================================

function setupMacroFX(): void {
    // FLUX - Filter sweep
    const fluxBtn = new Nexus.Button('#fluxBtn', {
        size: [40, 40],
        mode: 'toggle'
    });
    fluxBtn.on('change', (v: boolean) => {
        log.debug(' FLUX:', v);
        const filter = audioEngine.getEffects().filter;
        if (filter) {
            if (v) {
                // LFO modulates filter frequency
                const lfo = new Tone.LFO(0.5, 200, 5000);
                lfo.connect(filter.frequency);
                lfo.start();
                (window as any).fluxLFO = lfo;
            } else {
                if ((window as any).fluxLFO) {
                    (window as any).fluxLFO.stop();
                    (window as any).fluxLFO.disconnect();
                }
            }
        }
    });

    // PUMP - Sidechain compression simulation
    const pumpBtn = new Nexus.Button('#pumpBtn', {
        size: [40, 40],
        mode: 'toggle'
    });
    pumpBtn.on('change', (v: boolean) => {
        log.debug(' PUMP:', v);
        // Simulate sidechain by modulating master volume
        if (v) {
            const lfo = new Tone.LFO(2, 0.3, 1);
            lfo.start();
            (window as any).pumpLFO = lfo;
        } else {
            if ((window as any).pumpLFO) {
                (window as any).pumpLFO.stop();
                (window as any).pumpLFO.disconnect();
            }
        }
    });

    // STUTT - Stutter effect
    const stuttBtn = new Nexus.Button('#stuttBtn', {
        size: [40, 40],
        mode: 'toggle'
    });
    stuttBtn.on('change', (v: boolean) => {
        log.debug(' STUTT:', v);
    });

    // WOBBLE - LFO on filter
    const wobbleBtn = new Nexus.Button('#wobbleBtn', {
        size: [40, 40],
        mode: 'toggle'
    });
    wobbleBtn.on('change', (v: boolean) => {
        log.debug(' WOBBLE:', v);
        const filter = audioEngine.getEffects().filter;
        if (filter) {
            if (v) {
                const lfo = new Tone.LFO(4, 200, 2000);
                lfo.connect(filter.frequency);
                lfo.start();
                (window as any).wobbleLFO = lfo;
            } else {
                if ((window as any).wobbleLFO) {
                    (window as any).wobbleLFO.stop();
                    (window as any).wobbleLFO.disconnect();
                }
            }
        }
    });
}

// ============================================================
// BITCRUSH
// ============================================================

function setupBitcrush(): void {
    // Bitcrush Toggle
    const bitcrushToggleBtn = new Nexus.Button('#bitcrushToggleBtn', {
        size: [40, 40],
        mode: 'toggle'
    });
    bitcrushToggleBtn.on('change', (v: boolean) => {
        log.debug(' Bitcrush:', v);
        const indicator = document.getElementById('bitcrush-indicator');
        if (indicator) {
            indicator.classList.toggle('active', v);
        }
    });

    // Bitcrush Depth
    const bitcrushDepthDial = new Nexus.Dial('#bitcrushDepthDial', {
        size: [40, 40],
        min: 1,
        max: 16,
        value: 8
    });
    bitcrushDepthDial.on('change', (v: number) => {
        log.debug(' Bitcrush Depth:', v);
    });

    // Bitcrush Frequency
    const bitcrushFreqDial = new Nexus.Dial('#bitcrushFreqDial', {
        size: [40, 40],
        min: 1000,
        max: 44100,
        value: 22050
    });
    bitcrushFreqDial.on('change', (v: number) => {
        log.debug(' Bitcrush Freq:', v);
    });
}

// ============================================================
// VISUALIZATION (OSCILLOSCOPE & FFT)
// ============================================================

function setupVisualization(): void {
    // Waveform canvas
    const waveformCanvas = document.getElementById('waveform') as HTMLCanvasElement;
    const vizCanvas = document.getElementById('viz') as HTMLCanvasElement;

    if (waveformCanvas && vizCanvas) {
        // Start visualization loop
        isVisualizationRunning = true;
        visualizationId = requestAnimationFrame(drawVisualization);
    }
}

function drawVisualization(): void {
    // Check if we should continue
    if (!isVisualizationRunning) return;

    const waveformCanvas = document.getElementById('waveform') as HTMLCanvasElement;
    const vizCanvas = document.getElementById('viz') as HTMLCanvasElement;

    if (waveformCanvas) {
        const ctx = waveformCanvas.getContext('2d');
        if (ctx) {
            const waveData = audioEngine.getWaveformData();
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);
            ctx.strokeStyle = '#00ff94';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const sliceWidth = waveformCanvas.width / waveData.length;
            let x = 0;
            for (let i = 0; i < waveData.length; i++) {
                const v = waveData[i];
                const y = (v + 1) / 2 * waveformCanvas.height;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                x += sliceWidth;
            }
            ctx.stroke();
        }
    }

    if (vizCanvas) {
        const ctx = vizCanvas.getContext('2d');
        if (ctx) {
            const fftData = audioEngine.getAnalyserData();
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, vizCanvas.width, vizCanvas.height);

            const centerX = vizCanvas.width / 2;
            const centerY = vizCanvas.height / 2;
            const radius = Math.min(centerX, centerY) - 10;

            for (let i = 0; i < fftData.length; i++) {
                const angle = (i / fftData.length) * Math.PI * 2;
                const amplitude = fftData[i] / 255;
                const barHeight = amplitude * radius;

                const x1 = centerX + Math.cos(angle) * (radius * 0.3);
                const y1 = centerY + Math.sin(angle) * (radius * 0.3);
                const x2 = centerX + Math.cos(angle) * (radius * 0.3 + barHeight);
                const y2 = centerY + Math.sin(angle) * (radius * 0.3 + barHeight);

                const hue = (i / fftData.length) * 120 + 100;
                ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
    }

    // Continue animation loop if still running
    if (isVisualizationRunning) {
        visualizationId = requestAnimationFrame(drawVisualization);
    }
}

// ============================================================
// SEQUENCER PLAYBACK
// ============================================================

let currentStep = 0;
let isPlaying = false;
let sequencerInterval: number | null = null;

// Local sequencer data - this is the SOURCE OF TRUTH
let localSequencerData: number[][] = createEmptyPattern(7, 32);

// Velocity-enhanced pattern data (for Piano Roll Pro)
let velocityPatternData: FullPattern | null = null;

// Current genre for velocity generation
let currentGenre: GenreType = 'TECHNO';

// Create synths for each track (only once)
let synths: Tone.PolySynth[] = [];
let drums: Tone.MembraneSynth | null = null;
let hiHat: Tone.MetalSynth | null = null;
let snare: Tone.NoiseSynth | null = null;

// DOM Cache for performance (populated on first use)
let stepButtonCache: NodeListOf<Element> | null = null;
let stepButtonsByStep: Map<number, NodeListOf<Element>> = new Map();

function getStepButtons(): NodeListOf<Element> {
    if (!stepButtonCache) {
        stepButtonCache = document.querySelectorAll('.step-btn');
    }
    return stepButtonCache;
}

function getStepButtonsByStep(step: number): NodeListOf<Element> {
    if (!stepButtonsByStep.has(step)) {
        stepButtonsByStep.set(step, document.querySelectorAll(`.step-btn[data-step="${step}"]`));
    }
    return stepButtonsByStep.get(step)!;
}

function clearStepButtonCache(): void {
    stepButtonCache = null;
    stepButtonsByStep.clear();
}

// ============================================================
// SONG STRUCTURE PLAYBACK SYSTEM
// ============================================================

interface SongSection {
    name: string;
    bars: number;
    color: string;
    pattern: number[][];  // 7 tracks x 32 steps per section
}

let songStructure: SongSection[] = [];
let currentSectionIndex = 0;
let currentBarInSection = 0;
let totalStepsPlayed = 0;

/**
 * Set the song structure for playback
 */
export function setSongStructure(sections: SongSection[]): void {
    songStructure = sections;
    currentSectionIndex = 0;
    currentBarInSection = 0;
    totalStepsPlayed = 0;

    // Initialize grid with first section pattern
    if (sections.length > 0 && sections[0].pattern) {
        updateGridFromPattern(sections[0].pattern);
    }

    log.debug(' Song structure set:', sections.length, 'sections');
    log.debug(' Grid initialized with first section pattern');
}

/**
 * Get current song structure
 */
export function getSongStructure(): SongSection[] {
    return songStructure;
}

/**
 * Generate a pattern for a specific section type
 */
function generateSectionPattern(sectionType: string, sectionIndex: number): number[][] {
    const pattern = createEmptyPattern(7, 32);

    // Get variation based on section index for variety
    const variation = sectionIndex % 4;

    switch (sectionType) {
        case 'INTRO':
            // Sparse intro - just kick and subtle elements
            for (let s = 0; s < 32; s += 8) pattern[0][s] = 1; // Kick every 2 bars
            for (let s = 16; s < 32; s += 4) pattern[3][s] = 1; // HiHat starts halfway
            break;

        case 'BUILD':
        case 'BUILDUP':
            // Building energy with more drums
            for (let s = 0; s < 32; s += 4) pattern[0][s] = 1; // Kick every beat
            for (let s = 4; s < 32; s += 8) pattern[1][s] = 1; // Snare on 2,4
            for (let s = 2; s < 32; s += 4) pattern[3][s] = 1; // Offbeat hi-hat
            // Add more intensity in second half
            for (let s = 16; s < 32; s += 2) pattern[3][s] = 1;
            break;

        case 'DROP':
            // Full energy!
            for (let s = 0; s < 32; s += 4) pattern[0][s] = 1; // Four on floor
            for (let s = 4; s < 32; s += 8) pattern[1][s] = 1; // Snare
            pattern[2][4] = 1; pattern[2][20] = 1; // Clap hits
            for (let s = 2; s < 32; s += 4) pattern[3][s] = 1; // Offbeat hat
            for (let s = 0; s < 32; s += 8) pattern[4][s] = 1; // Bass
            // Melody
            for (let s = 0; s < 32; s += 4 + (variation % 2) * 2) {
                pattern[5][s] = 1;
            }
            break;

        case 'VERSE':
            // Moderate energy
            for (let s = 0; s < 32; s += 4) pattern[0][s] = 1;
            for (let s = 4; s < 32; s += 8) pattern[1][s] = 1;
            for (let s = 2; s < 32; s += 4) pattern[3][s] = 1;
            for (let s = 0; s < 32; s += 8) pattern[4][s] = 1;
            break;

        case 'CHORUS':
        case 'HOOK':
            // High energy, memorable
            for (let s = 0; s < 32; s += 4) pattern[0][s] = 1;
            for (let s = 4; s < 32; s += 8) pattern[1][s] = 1;
            for (let s = 0; s < 32; s += 8) pattern[2][s] = 1; // Clap every 2 bars
            for (let s = 2; s < 32; s += 4) pattern[3][s] = 1;
            for (let s = 0; s < 32; s += 4) pattern[4][s] = 1; // More bass
            // Catchy melody
            for (let s = 0; s < 32; s += 4) {
                if (Math.random() > 0.3) pattern[5][s] = 1;
            }
            pattern[6][0] = 1; // Pad on downbeat
            break;

        case 'BREAK':
        case 'BREAKDOWN':
            // Strip back
            for (let s = 0; s < 32; s += 8) pattern[0][s] = 1; // Less kick
            // No snare, minimal hats
            for (let s = 16; s < 32; s += 8) pattern[3][s] = 1;
            // Atmospheric pad
            pattern[6][0] = 1;
            break;

        case 'BRIDGE':
            // Different feel
            for (let s = 0; s < 32; s += 8) pattern[0][s] = 1;
            for (let s = 12; s < 32; s += 16) pattern[1][s] = 1;
            for (let s = 0; s < 32; s += 2) pattern[3][s] = 1; // Fast hats
            break;

        case 'OUTRO':
            // Fading out
            for (let s = 0; s < 16; s += 4) pattern[0][s] = 1; // Only first half
            for (let s = 4; s < 16; s += 8) pattern[1][s] = 1;
            break;

        case 'THEME':
        case 'ANTHEM':
            // Full arrangement
            for (let s = 0; s < 32; s += 4) pattern[0][s] = 1;
            for (let s = 4; s < 32; s += 8) pattern[1][s] = 1;
            for (let s = 2; s < 32; s += 4) pattern[3][s] = 1;
            for (let s = 0; s < 32; s += 4) pattern[4][s] = 1;
            for (let s = 0; s < 32; s += 4) pattern[5][s] = 1;
            pattern[6][0] = 1; pattern[6][16] = 1;
            break;

        default:
            // Generic pattern
            for (let s = 0; s < 32; s += 4) pattern[0][s] = 1;
            for (let s = 4; s < 32; s += 8) pattern[1][s] = 1;
    }

    return pattern;
}

/**
 * Get the current pattern based on song position
 * SMOOTH TRANSITIONS: Only switch patterns at bar boundaries
 */
function getCurrentPattern(): number[][] {
    if (songStructure.length === 0) {
        // No song structure - use local sequencer data
        return localSequencerData;
    }

    // Calculate total bars in the song
    const totalBars = songStructure.reduce((sum, s) => sum + s.bars, 0);

    // Current bar in the song (looped using modulo)
    const currentBar = currentBarInSection % totalBars;

    // Find which section we're in based on current bar
    let barsElapsed = 0;
    for (let i = 0; i < songStructure.length; i++) {
        const section = songStructure[i];
        if (currentBar < barsElapsed + section.bars) {
            // We're in this section
            if (currentSectionIndex !== i) {
                // SMOOTH TRANSITION: Only switch at bar boundaries (step 0)
                if (currentStep === 0) {
                    currentSectionIndex = i;
                    log.debug(' Entered section:', section.name, `(bar ${currentBar + 1}/${totalBars})`);
                    updateMinimapHighlight(i);
                    // UPDATE GRID UI to show current section pattern
                    updateGridFromPattern(section.pattern);
                }
            }
            return section.pattern;
        }
        barsElapsed += section.bars;
    }

    // Fallback to first section
    currentSectionIndex = 0;
    return songStructure[0]?.pattern || localSequencerData;
}

/**
 * Update the grid UI to reflect the current pattern
 */
function updateGridFromPattern(pattern: number[][]): void {
    // Update local sequencer data
    for (let t = 0; t < 7; t++) {
        for (let s = 0; s < 32; s++) {
            localSequencerData[t][s] = pattern[t]?.[s] ?? 0;
        }
    }

    // Update grid buttons
    for (let t = 0; t < 7; t++) {
        for (let s = 0; s < 32; s++) {
            const btn = document.querySelector(`.step-btn[data-track="${t}"][data-step="${s}"]`);
            if (btn) {
                if (pattern[t]?.[s] === 1) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        }
    }

    log.debug(' Grid updated to match current section pattern');
}

/**
 * Update minimap to highlight current section
 */
function updateMinimapHighlight(sectionIndex: number): void {
    const minimap = document.getElementById('minimap');
    if (!minimap) return;

    const sections = minimap.querySelectorAll('.song-section');
    sections.forEach((el, i) => {
        if (i === sectionIndex) {
            (el as HTMLElement).style.boxShadow = '0 0 15px rgba(0,255,148,0.8)';
            (el as HTMLElement).style.transform = 'scaleY(1.1)';
        } else {
            (el as HTMLElement).style.boxShadow = 'none';
            (el as HTMLElement).style.transform = 'scaleY(1)';
        }
    });
}

/**
 * Get the local sequencer data (for external access)
 */
export function getSequencerData(): number[][] {
    return localSequencerData;
}

/**
 * Set sequencer data from external source
 */
export function setSequencerData(data: number[][]): void {
    for (let t = 0; t < Math.min(data.length, 7); t++) {
        for (let s = 0; s < Math.min(data[t].length, 32); s++) {
            localSequencerData[t][s] = data[t][s];
        }
    }
    log.debug(' Sequencer data updated');
}

/**
 * Clear all sequencer data
 */
export function clearSequencerData(): void {
    for (let t = 0; t < 7; t++) {
        for (let s = 0; s < 32; s++) {
            localSequencerData[t][s] = 0;
        }
    }
    log.debug(' Sequencer data cleared');
}

/**
 * Toggle a single step
 */
export function toggleStep(track: number, step: number): void {
    if (track >= 0 && track < 7 && step >= 0 && step < 32) {
        localSequencerData[track][step] = localSequencerData[track][step] === 0 ? 1 : 0;
    }
}

function initializeSynths(): void {
    if (synths.length > 0) return; // Already initialized

    log.debug(' Initializing synths with TrackChannel routing...');

    // Initialize track channels first
    initializeTrackChannels();

    // Get current kit for sound variation
    const currentKit = audioEngine.getCurrentKit?.() || 'NEON';
    log.debug(' Current kit for synth params:', currentKit);

    // Kit-specific synth parameters
    const kitParams = getKitSynthParams(currentKit);

    // Drum synths - connect through track channels
    // Track 0: Kick
    drums = new Tone.MembraneSynth({
        envelope: kitParams.kickEnvelope
    });
    drums.volume.value = kitParams.kickVolume;
    drums.connect(trackChannels[0].panner);
    trackChannels[0].synth = null; // Kick uses special synth
    log.debug(' Kick connected to Track 0 panner');

    // Track 1: Snare
    snare = new Tone.NoiseSynth({
        noise: { type: kitParams.snareNoiseType },
        envelope: kitParams.snareEnvelope
    });
    snare.volume.value = kitParams.snareVolume;
    snare.connect(trackChannels[1].panner);
    log.debug(' Snare connected to Track 1 panner');

    // Track 2: Clap (uses snare synth with lower volume)
    // Clap shares snare synth but through track 2 channel

    // Track 3: HiHat
    hiHat = new Tone.MetalSynth({
        harmonicity: kitParams.hihatHarmonicity,
        modulationIndex: kitParams.hihatModIndex,
        envelope: kitParams.hihatEnvelope
    });
    hiHat.volume.value = kitParams.hihatVolume;
    hiHat.connect(trackChannels[3].panner);
    log.debug(' HiHat connected to Track 3 panner');

    // Melodic synths for tracks 4-6 (Bass, Lead, Pad) - connect through their channels
    for (let i = 4; i < 7; i++) {
        const synth = new Tone.PolySynth(Tone.Synth);
        synth.maxPolyphony = 32;
        synth.volume.value = kitParams.synthVolume;
        synth.connect(trackChannels[i].panner);
        trackChannels[i].synth = synth;
        synths.push(synth);
        log.debug(` Synth ${i} (${trackChannels[i].name}) connected to channel`);
    }

    // Also create synths for tracks 0-3 to fill the array (for compatibility)
    for (let i = 0; i < 4; i++) {
        const synth = new Tone.PolySynth(Tone.Synth);
        synth.maxPolyphony = 32;
        synth.volume.value = -Infinity; // Muted by default - drums use special synths
        synth.connect(trackChannels[i].panner);
        synths.unshift(synth);
    }

    log.debug(' All synths initialized with kit:', currentKit);
    log.debug(' Track channels ready:', trackChannels.length);
}

/**
 * Get synth parameters based on kit type
 */
function getKitSynthParams(kit: string): {
    kickEnvelope: { attack: number; decay: number; sustain: number; release: number };
    kickVolume: number;
    hihatHarmonicity: number;
    hihatModIndex: number;
    hihatEnvelope: { attack: number; decay: number; release: number };
    hihatVolume: number;
    snareNoiseType: 'white' | 'pink' | 'brown';
    snareEnvelope: { attack: number; decay: number; release: number };
    snareVolume: number;
    synthVolume: number;
} {
    const params = {
        'NEON': {
            kickEnvelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 },
            kickVolume: -3,
            hihatHarmonicity: 5.1,
            hihatModIndex: 32,
            hihatEnvelope: { attack: 0.001, decay: 0.05, release: 0.01 },
            hihatVolume: -12,
            snareNoiseType: 'white' as const,
            snareEnvelope: { attack: 0.001, decay: 0.15, release: 0.05 },
            snareVolume: -6,
            synthVolume: -12
        },
        'GLITCH': {
            kickEnvelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
            kickVolume: -1,
            hihatHarmonicity: 8.2,
            hihatModIndex: 64,
            hihatEnvelope: { attack: 0.001, decay: 0.02, release: 0.01 },
            hihatVolume: -8,
            snareNoiseType: 'white' as const,
            snareEnvelope: { attack: 0.001, decay: 0.08, release: 0.02 },
            snareVolume: -4,
            synthVolume: -10
        },
        'ACID': {
            kickEnvelope: { attack: 0.001, decay: 0.5, sustain: 0.2, release: 0.3 },
            kickVolume: -2,
            hihatHarmonicity: 3.5,
            hihatModIndex: 20,
            hihatEnvelope: { attack: 0.001, decay: 0.1, release: 0.05 },
            hihatVolume: -14,
            snareNoiseType: 'pink' as const,
            snareEnvelope: { attack: 0.001, decay: 0.2, release: 0.1 },
            snareVolume: -8,
            synthVolume: -8
        },
        'VINYL': {
            kickEnvelope: { attack: 0.01, decay: 0.6, sustain: 0, release: 0.5 },
            kickVolume: -5,
            hihatHarmonicity: 4.0,
            hihatModIndex: 25,
            hihatEnvelope: { attack: 0.005, decay: 0.15, release: 0.1 },
            hihatVolume: -16,
            snareNoiseType: 'pink' as const,
            snareEnvelope: { attack: 0.005, decay: 0.25, release: 0.15 },
            snareVolume: -10,
            synthVolume: -14
        },
        'CLUB': {
            kickEnvelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.3 },
            kickVolume: -2,
            hihatHarmonicity: 5.5,
            hihatModIndex: 35,
            hihatEnvelope: { attack: 0.001, decay: 0.04, release: 0.02 },
            hihatVolume: -10,
            snareNoiseType: 'white' as const,
            snareEnvelope: { attack: 0.001, decay: 0.12, release: 0.04 },
            snareVolume: -5,
            synthVolume: -11
        },
        'CHIPTUNE': {
            kickEnvelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
            kickVolume: 0,
            hihatHarmonicity: 10,
            hihatModIndex: 50,
            hihatEnvelope: { attack: 0.001, decay: 0.01, release: 0.01 },
            hihatVolume: -6,
            snareNoiseType: 'white' as const,
            snareEnvelope: { attack: 0.001, decay: 0.05, release: 0.02 },
            snareVolume: -2,
            synthVolume: -8
        },
        'INDUSTRIAL': {
            kickEnvelope: { attack: 0.001, decay: 0.8, sustain: 0.3, release: 0.5 },
            kickVolume: 2,
            hihatHarmonicity: 2.0,
            hihatModIndex: 100,
            hihatEnvelope: { attack: 0.001, decay: 0.3, release: 0.1 },
            hihatVolume: -5,
            snareNoiseType: 'white' as const,
            snareEnvelope: { attack: 0.001, decay: 0.4, release: 0.2 },
            snareVolume: -2,
            synthVolume: -6
        },
        'ETHEREAL': {
            kickEnvelope: { attack: 0.02, decay: 0.8, sustain: 0, release: 0.6 },
            kickVolume: -8,
            hihatHarmonicity: 6.0,
            hihatModIndex: 15,
            hihatEnvelope: { attack: 0.01, decay: 0.3, release: 0.2 },
            hihatVolume: -20,
            snareNoiseType: 'pink' as const,
            snareEnvelope: { attack: 0.01, decay: 0.5, release: 0.3 },
            snareVolume: -14,
            synthVolume: -16
        },
        'PHONK': {
            kickEnvelope: { attack: 0.001, decay: 0.6, sustain: 0.1, release: 0.4 },
            kickVolume: 0,
            hihatHarmonicity: 4.5,
            hihatModIndex: 45,
            hihatEnvelope: { attack: 0.001, decay: 0.08, release: 0.03 },
            hihatVolume: -8,
            snareNoiseType: 'white' as const,
            snareEnvelope: { attack: 0.001, decay: 0.25, release: 0.1 },
            snareVolume: -3,
            synthVolume: -8
        },
        'DUNGEON': {
            kickEnvelope: { attack: 0.005, decay: 0.7, sustain: 0, release: 0.5 },
            kickVolume: -4,
            hihatHarmonicity: 3.0,
            hihatModIndex: 20,
            hihatEnvelope: { attack: 0.005, decay: 0.2, release: 0.1 },
            hihatVolume: -18,
            snareNoiseType: 'brown' as const,
            snareEnvelope: { attack: 0.005, decay: 0.4, release: 0.2 },
            snareVolume: -12,
            synthVolume: -14
        }
    };

    return params[kit as keyof typeof params] || params['NEON'];
}

export function startSequencer(): void {
    log.debug(' startSequencer called, isPlaying:', isPlaying);
    if (isPlaying) {
        log.debug(' Already playing, ignoring');
        return;
    }

    // Dispatch to Store (Phase 3+4 architecture)
    appStore.dispatch({ type: 'TRANSPORT_PLAY' });

    // Initialize synths if needed
    initializeSynths();

    isPlaying = true;
    currentStep = 0;
    currentSectionIndex = 0;
    currentBarInSection = 0;
    totalStepsPlayed = 0;

    const bpm = Tone.Transport.bpm.value;

    // Dispatch BPM to Store
    appStore.dispatch({ type: 'TRANSPORT_SET_BPM', payload: bpm });

    log.debug(' Starting sequencer:');
    log.debug(' - BPM:', bpm);
    log.debug(' - Song sections:', songStructure.length);

    if (songStructure.length > 0) {
        log.debug(' - Total bars:', songStructure.reduce((sum, s) => sum + s.bars, 0));
    }

    // Count active steps
    let activeSteps = 0;
    for (let t = 0; t < 7; t++) {
        for (let s = 0; s < 32; s++) {
            if (localSequencerData[t][s] === 1) activeSteps++;
        }
    }
    log.debug(' - Active steps in current pattern:', activeSteps);

    // Sync pattern to Store
    appStore.dispatch({ type: 'SEQUENCER_SET_PATTERN', payload: localSequencerData });

    // Use Tone.Transport for SAMPLE-ACCURATE timing instead of setInterval
    // This ensures BPM is actually correct and stays synchronized
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.swingSubdivision = '16n';

    // Schedule the sequencer loop - 16th notes
    Tone.Transport.scheduleRepeat((time) => {
        // Use the time provided by Tone.Transport for sample-accurate triggering
        playStep(currentStep, time);
        currentStep = (currentStep + 1) % 32;

        // Dispatch step to Store
        appStore.dispatch({ type: 'TRANSPORT_STEP', payload: currentStep });

        // Track bar progress for song structure
        if (currentStep % 16 === 0) {
            currentBarInSection++;
            totalStepsPlayed += 16;
        }
    }, '16n', '0m'); // Repeat every 16th note, start immediately

    // Start the transport
    Tone.Transport.start();

    log.debug(' ✓ Sequencer started with Tone.Transport (sample-accurate)');
}

export function stopSequencer(): void {
    // Dispatch to Store (Phase 3+4 architecture)
    appStore.dispatch({ type: 'TRANSPORT_STOP' });

    isPlaying = false;

    // Stop Tone.Transport
    Tone.Transport.stop();
    Tone.Transport.cancel();

    currentStep = 0;

    // Remove all highlights (use cached buttons)
    getStepButtons().forEach(el => {
        el.classList.remove('playing');
    });

    log.debug(' Sequencer stopped');
}

function playStep(step: number, time?: number): void {
    // Get current pattern (either from song structure or local data)
    const currentPattern = getCurrentPattern();

    // Highlight current step in grid
    highlightStep(step);

    // Update playhead position in minimap
    updatePlayhead(step);

    // Play sounds for each track
    let soundsTriggered = 0;
    for (let trackIndex = 0; trackIndex < 7; trackIndex++) {
        if (currentPattern[trackIndex] && currentPattern[trackIndex][step] === 1) {
            triggerSound(trackIndex, step, time);
            soundsTriggered++;
        }
    }

    // Log every bar (16 steps)
    if (step === 0) {
        log.debug(` Bar ${Math.floor(totalStepsPlayed / 16) + 1} | Section: ${currentSectionIndex + 1}/${songStructure.length || 1} | Sounds: ${soundsTriggered}`);
    }
}

/**
 * Update playhead position in the minimap
 */
function updatePlayhead(step: number): void {
    const playhead = document.getElementById('playhead-bar');
    const minimap = document.getElementById('minimap');
    if (!playhead || !minimap) return;

    // Calculate position based on current step and song structure
    const totalBars = songStructure.length > 0
        ? songStructure.reduce((sum, s) => sum + s.bars, 0)
        : 2; // Default 2 bars if no structure

    const totalSteps = totalBars * 16;
    const currentAbsoluteStep = totalStepsPlayed + step;
    const position = (currentAbsoluteStep % totalSteps) / totalSteps * 100;

    playhead.style.left = `${position}%`;
}

function highlightStep(step: number): void {
    // Remove previous highlight (use cached buttons)
    getStepButtons().forEach(el => {
        el.classList.remove('playing');
    });

    // Add highlight to current step (use cached buttons)
    getStepButtonsByStep(step).forEach(el => {
        el.classList.add('playing');
    });
}

function triggerSound(trackIndex: number, step: number, scheduledTime?: number): void {
    // Check if track is muted or should be silenced due to solo
    const channel = trackChannels[trackIndex];
    if (channel) {
        // Check mute
        if (channel.muted) return;

        // Check solo - if any track is soloed, only play soloed tracks
        if (soloActive && !channel.soloed) return;
    }

    // Get velocity from velocityPatternData if available (Piano Roll Pro)
    let velocity = 100; // Default velocity
    let notePitch = 60; // Default pitch

    if (velocityPatternData && velocityPatternData[trackIndex] && velocityPatternData[trackIndex][step]) {
        const noteData = velocityPatternData[trackIndex][step];
        if (noteData.active) {
            velocity = noteData.velocity;
            notePitch = noteData.pitch;
        }
    }

    // Get current scale from audio engine for musical notes
    const currentScale = audioEngine.getCurrentScale?.() || ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const currentSection = songStructure[currentSectionIndex]?.name || 'VERSE';

    // Base note from current scale (changes with generation)
    const scaleIndex = Math.floor(Math.random() * currentScale.length);
    const baseNote = currentScale[scaleIndex];

    // Use scheduled time from Tone.Transport (sample-accurate) or fallback
    // Add small offset per track to avoid NoiseSynth timing conflicts
    const time = scheduledTime !== undefined
        ? scheduledTime + 0.001 * trackIndex
        : Tone.now() + 0.001 * trackIndex;

    // Convert MIDI velocity (0-127) to gain (0-1)
    const velocityGain = velocity / 127;

    try {
        switch (trackIndex) {
            case 0: // Kick
                drums?.triggerAttackRelease('C1', '16n', time, velocityGain * 0.9);
                break;
            case 1: // Snare
                snare?.triggerAttackRelease('16n', time, velocityGain * 0.7);
                break;
            case 2: // Clap - lighter snare variant
                snare?.triggerAttackRelease('32n', time, velocityGain * 0.4);
                break;
            case 3: // HiHat
                hiHat?.triggerAttackRelease('64n', time, velocityGain * 0.25);
                break;
            case 4: // Bass - varies by section and scale
                const bassOctave = currentSection === 'DROP' ? 2 : 2;
                const bassNotes = currentScale.slice(0, 5).map((n, i) => `${n}${bassOctave}`);
                // Vary note selection based on step and random
                const bassIndex = (step + Math.floor(Math.random() * 3)) % bassNotes.length;
                const bassNote = velocityPatternData ? notePitch.toString() : bassNotes[bassIndex];
                synths[4]?.triggerAttackRelease(bassNote, '8n', time, velocityGain * 0.6);
                break;
            case 5: // Lead/Arp - dynamic melody based on scale and section
                const leadOctave = currentSection === 'CHORUS' || currentSection === 'HOOK' ? 5 : 4;
                const leadNotes = currentScale.map((n, i) => `${n}${leadOctave}`);
                // Add some randomness to melody
                const leadIndex = (step + Math.floor(Math.random() * 4)) % leadNotes.length;
                const leadNote = velocityPatternData ? notePitch.toString() : leadNotes[leadIndex];
                // Vary duration by section
                const leadDuration = currentSection === 'DROP' ? '16n' : '8n';
                synths[5]?.triggerAttackRelease(leadNote, leadDuration, time, velocityGain * 0.4);
                break;
            case 6: // Pad - chords from current scale
                // Build chords from scale degrees
                const rootIdx = Math.floor(step / 8) % currentScale.length;
                const thirdIdx = (rootIdx + 2) % currentScale.length;
                const fifthIdx = (rootIdx + 4) % currentScale.length;
                const chordNotes = [
                    `${currentScale[rootIdx]}3`,
                    `${currentScale[thirdIdx]}3`,
                    `${currentScale[fifthIdx]}3`
                ];
                synths[6]?.triggerAttackRelease(chordNotes, '2n', time, velocityGain * 0.25);
                break;
        }
    } catch (e) {
        // Silently catch timing errors
        log.warn(' Audio trigger error:', e);
    }
}

/**
 * Generate pattern with velocity (Piano Roll Pro)
 */
export function generatePatternWithVelocity(
    genre: string,
    scale: string,
    density: number = 0.5
): void {
    // Map genre string to GenreType
    const genreMap: Record<string, GenreType> = {
        'TECHNO': 'TECHNO',
        'HOUSE': 'HOUSE',
        'DNB': 'DNB',
        'DRUM AND BASS': 'DNB',
        'HIPHOP': 'HIPHOP',
        'HIP HOP': 'HIPHOP',
        'TRAP': 'TRAP',
        'AMBIENT': 'AMBIENT',
        'DUBSTEP': 'TRAP', // Similar velocity profile
        'DUB': 'AMBIENT',
        'TRANCE': 'TECHNO',
        'EDM': 'HOUSE'
    };

    const genreType = genreMap[genre.toUpperCase()] || 'TECHNO';
    currentGenre = genreType;

    log.info(`[VELOCITY] Generating ${genreType} pattern with density ${density}`);

    // Generate velocity pattern
    velocityPatternData = generateFullPatternWithVelocity(
        genreType,
        scale,
        density,
        true // Humanize
    );

    // Convert to legacy format for backward compatibility
    localSequencerData = toLegacyPattern(velocityPatternData);

    // Update grid UI
    updateGridFromPattern(localSequencerData);

    log.info(`[VELOCITY] Pattern generated with velocity data`);
}

/**
 * Get current velocity pattern data
 */
export function getVelocityPattern(): FullPattern | null {
    return velocityPatternData;
}

/**
 * Set velocity pattern data
 */
export function setVelocityPattern(pattern: FullPattern): void {
    velocityPatternData = pattern;
    localSequencerData = toLegacyPattern(pattern);
    updateGridFromPattern(localSequencerData);
}

// Export initialization function and sequencer functions globally
(window as any).initializeNexusUI = initializeNexusUI;
(window as any).startSequencer = startSequencer;
(window as any).stopSequencer = stopSequencer;
(window as any).setSequencerData = setSequencerData;
(window as any).getSequencerData = getSequencerData;
(window as any).setSongStructure = setSongStructure;
(window as any).getSongStructure = getSongStructure;
(window as any).reinitSynths = reinitSynths;
(window as any).generatePatternWithVelocity = generatePatternWithVelocity;
(window as any).getVelocityPattern = getVelocityPattern;
(window as any).setVelocityPattern = setVelocityPattern;

/**
 * Reinitialize synths (call when kit changes)
 */
export function reinitSynths(): void {
    log.debug(' Reinitializing synths for new kit...');

    // Dispose existing synths
    if (drums) {
        drums.disconnect();
        drums.dispose();
        drums = null;
    }
    if (hiHat) {
        hiHat.disconnect();
        hiHat.dispose();
        hiHat = null;
    }
    if (snare) {
        snare.disconnect();
        snare.dispose();
        snare = null;
    }
    synths.forEach(s => {
        s.disconnect();
        s.dispose();
    });
    synths = [];

    // Dispose track channels
    trackChannels.forEach(channel => {
        if (channel.synth) {
            channel.synth.disconnect();
            channel.synth.dispose();
        }
        channel.gainNode.disconnect();
        channel.gainNode.dispose();
        channel.panner.disconnect();
        channel.panner.dispose();
    });
    trackChannels.length = 0;
    soloActive = false;

    // Reinitialize with new kit parameters
    initializeSynths();
    log.debug(' Synths and track channels reinitialized');
}

// Export track control functions globally
(window as any).setTrackVolume = setTrackVolume;
(window as any).setTrackPan = setTrackPan;
(window as any).toggleTrackMute = toggleTrackMute;
(window as any).toggleTrackSolo = toggleTrackSolo;
(window as any).getTrackChannels = getTrackChannels;

// ============================================================
// CLEANUP / DISPOSE
// ============================================================

let visualizationId: number | null = null;
let isVisualizationRunning = false;

/**
 * Stop all running animations, LFOs, and free resources
 * Call this when the component unmounts or the app closes
 */
export function disposeNexusUI(): void {
    // Stop visualization loop
    isVisualizationRunning = false;
    if (visualizationId !== null) {
        cancelAnimationFrame(visualizationId);
        visualizationId = null;
    }

    // Stop and dispose all LFOs
    const lfos = ['fluxLFO', 'pumpLFO', 'wobbleLFO'] as const;
    lfos.forEach(name => {
        const lfo = (window as any)[name];
        if (lfo) {
            try {
                lfo.stop();
                lfo.disconnect();
                lfo.dispose();
            } catch (e) {
                // Ignore disposal errors
            }
            (window as any)[name] = null;
        }
    });

    // Stop sequencer if running
    if (sequencerInterval !== null) {
        clearInterval(sequencerInterval);
        sequencerInterval = null;
    }
    isPlaying = false;

    // Clear event listeners (track cleanup)
    // Note: Individual event listeners should be tracked for full cleanup

    log.debug(' Resources disposed');
}

// Make dispose function globally available
(window as any).disposeNexusUI = disposeNexusUI;

log.debug(' Global functions exported');
