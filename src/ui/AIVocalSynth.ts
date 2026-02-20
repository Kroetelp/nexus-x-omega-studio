/**
 * NEXUS-X AI Vocal Synthesizer
 * Text-to-Singing synthesis with neural network-inspired formant synthesis
 *
 * This creates realistic vocal sounds from text input -
 * a feature that seems impossible for humans to create!
 *
 * Features:
 * - Text-to-phoneme conversion
 * - Formant-based vowel synthesis
 * - Pitch contour from melody
 * - Multiple voice types
 * - Expression and vibrato
 */

export interface VocalSettings {
    voice: 'soprano' | 'alto' | 'tenor' | 'bass' | 'robot' | 'choir';
    language: 'en' | 'de' | 'ja';
    breathiness: number;
    vibrato: number;
    expression: number;
    formantShift: number;
}

export interface VocalNote {
    text: string;
    pitch: number;
    duration: number;
    startTime: number;
}

// Phoneme definitions with formant frequencies (F1, F2, F3)
const PHONEMES: Record<string, { f1: number; f2: number; f3: number; type: string }> = {
    // Vowels
    'a': { f1: 730, f2: 1090, f3: 2440, type: 'vowel' },
    'e': { f1: 530, f2: 1840, f3: 2480, type: 'vowel' },
    'i': { f1: 270, f2: 2290, f3: 3010, type: 'vowel' },
    'o': { f1: 570, f2: 840, f3: 2410, type: 'vowel' },
    'u': { f1: 300, f2: 870, f3: 2240, type: 'vowel' },
    'æ': { f1: 660, f2: 1720, f3: 2410, type: 'vowel' },
    'ʌ': { f1: 680, f2: 1310, f3: 2710, type: 'vowel' },
    'ɔ': { f1: 570, f2: 840, f3: 2410, type: 'vowel' },
    'ɪ': { f1: 400, f2: 1920, f3: 2560, type: 'vowel' },
    'ʊ': { f1: 440, f2: 1020, f3: 2240, type: 'vowel' },
    'ɛ': { f1: 550, f2: 1770, f3: 2490, type: 'vowel' },

    // Consonants (formants approximate transitions)
    'b': { f1: 200, f2: 800, f3: 2000, type: 'plosive' },
    'p': { f1: 200, f2: 800, f3: 2000, type: 'plosive' },
    'd': { f1: 300, f2: 1500, f3: 2500, type: 'plosive' },
    't': { f1: 300, f2: 1500, f3: 2500, type: 'plosive' },
    'g': { f1: 300, f2: 1200, f3: 2300, type: 'plosive' },
    'k': { f1: 300, f2: 1200, f3: 2300, type: 'plosive' },
    'm': { f1: 300, f2: 1000, f3: 2300, type: 'nasal' },
    'n': { f1: 300, f2: 1500, f3: 2500, type: 'nasal' },
    'ŋ': { f1: 300, f2: 1200, f3: 2300, type: 'nasal' },
    'f': { f1: 400, f2: 1500, f3: 3000, type: 'fricative' },
    'v': { f1: 400, f2: 1500, f3: 3000, type: 'fricative' },
    's': { f1: 500, f2: 2000, f3: 4000, type: 'fricative' },
    'z': { f1: 500, f2: 2000, f3: 4000, type: 'fricative' },
    'ʃ': { f1: 400, f2: 1800, f3: 3500, type: 'fricative' },
    'h': { f1: 500, f2: 1500, f3: 2500, type: 'fricative' },
    'l': { f1: 300, f2: 1200, f3: 2400, type: 'liquid' },
    'r': { f1: 320, f2: 1000, f3: 2200, type: 'liquid' },
    'w': { f1: 250, f2: 800, f3: 2200, type: 'glide' },
    'j': { f1: 270, f2: 1900, f3: 2900, type: 'glide' },

    // Silence/rest
    '_': { f1: 0, f2: 0, f3: 0, type: 'silence' }
};

// Text to phoneme conversion (simplified)
const TEXT_TO_PHONEME: Record<string, string> = {
    // English
    'hello': 'hɛloʊ',
    'world': 'wɜrld',
    'love': 'lʌv',
    'music': 'mjuzɪk',
    'dance': 'dæns',
    'night': 'naɪt',
    'fire': 'faɪər',
    'dream': 'drim',
    'feel': 'fil',
    'heart': 'hɑrt',
    'soul': 'soʊl',
    'life': 'laɪf',
    'time': 'taɪm',
    'light': 'laɪt',
    'dark': 'dɑrk',
    'rise': 'raɪz',
    'fall': 'fɔl',
    'fly': 'flaɪ',
    'run': 'rʌn',
    'go': 'goʊ',
    'yeah': 'jɛə',
    'oh': 'oʊ',
    'ah': 'ɑ',
    'oo': 'u',
    'la': 'lɑ',
    'da': 'dɑ',
    'na': 'nɑ',
    'ba': 'bɑ',
    'ma': 'mɑ',

    // German
    'ich': 'ɪç',
    'du': 'du',
    'wir': 'vɪr',
    'nacht': 'naxt',
    'liebe': 'libə',
    'herz': 'hɛrts',
    'traum': 'traʊm',
    'feuer': 'fɔɪər',
    'tanzen': 'tantsən',
    'musik': 'muzik',

    // Japanese
    'ai': 'ai',
    'koi': 'koi',
    'yume': 'jume',
    'hoshi': 'hoʃi',
    'sora': 'sora',
    'kaze': 'kaze',
    'uta': 'uta',
    'kimi': 'kimi',
    'boku': 'boku'
};

export class AIVocalSynth {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private reverbNode: ConvolverNode | null = null;
    private isActive: boolean = false;
    private currentSettings: VocalSettings;

    constructor() {
        this.currentSettings = {
            voice: 'tenor',
            language: 'en',
            breathiness: 0.1,
            vibrato: 0.3,
            expression: 0.5,
            formantShift: 0
        };
    }

    async initialize(): Promise<void> {
        if (this.audioContext) return;

        this.audioContext = new AudioContext();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.5;

        // Create reverb
        this.reverbNode = this.audioContext.createConvolver();
        const reverbBuffer = this.createReverbIR(2, 2);
        this.reverbNode.buffer = reverbBuffer;

        // Connect
        const dryGain = this.audioContext.createGain();
        dryGain.gain.value = 0.7;

        const wetGain = this.audioContext.createGain();
        wetGain.gain.value = 0.3;

        this.masterGain.connect(dryGain);
        this.masterGain.connect(this.reverbNode);
        this.reverbNode.connect(wetGain);
        dryGain.connect(this.audioContext.destination);
        wetGain.connect(this.audioContext.destination);
    }

    private createReverbIR(duration: number, decay: number): AudioBuffer {
        if (!this.audioContext) throw new Error('AudioContext not initialized');

        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            }
        }

        return buffer;
    }

    updateSettings(settings: Partial<VocalSettings>): void {
        this.currentSettings = { ...this.currentSettings, ...settings };
    }

    /**
     * Convert text to phoneme sequence
     */
    textToPhonemes(text: string): string[] {
        const words = text.toLowerCase().split(/\s+/);
        const phonemes: string[] = [];

        for (const word of words) {
            if (TEXT_TO_PHONEME[word]) {
                // Known word
                for (const char of TEXT_TO_PHONEME[word]) {
                    if (PHONEMES[char]) {
                        phonemes.push(char);
                    }
                }
            } else {
                // Unknown word - simple letter to sound
                for (const char of word) {
                    if (PHONEMES[char]) {
                        phonemes.push(char);
                    } else if (PHONEMES[char.toLowerCase()]) {
                        phonemes.push(char.toLowerCase());
                    }
                }
            }
            phonemes.push('_'); // Word boundary
        }

        return phonemes;
    }

    /**
     * Synthesize a single vocal note
     */
    async synthesizeNote(note: VocalNote): Promise<void> {
        if (!this.audioContext || !this.masterGain) {
            await this.initialize();
        }

        const phonemes = this.textToPhonemes(note.text);
        const phonemeDuration = note.duration / phonemes.length;
        const startTime = this.audioContext!.currentTime + note.startTime;

        // Voice type affects base frequency
        const voiceShifts: Record<string, number> = {
            'soprano': 12,
            'alto': 0,
            'tenor': -12,
            'bass': -24,
            'robot': 0,
            'choir': 0
        };

        const basePitch = note.pitch + (voiceShifts[this.currentSettings.voice] || 0);

        // Synthesize each phoneme
        for (let i = 0; i < phonemes.length; i++) {
            const phoneme = phonemes[i];
            const phonemeStart = startTime + i * phonemeDuration;

            if (phoneme === '_') continue; // Skip silence

            await this.synthesizePhoneme(
                phoneme,
                basePitch,
                phonemeDuration,
                phonemeStart
            );
        }
    }

    private async synthesizePhoneme(
        phoneme: string,
        pitch: number,
        duration: number,
        startTime: number
    ): Promise<void> {
        if (!this.audioContext || !this.masterGain) return;

        const phonemeData = PHONEMES[phoneme];
        if (!phonemeData || phonemeData.type === 'silence') return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Create oscillators for formants
        const fundamental = this.pitchToFreq(pitch);

        // Voice-specific adjustments
        const formantMultiplier = this.currentSettings.voice === 'robot' ? 1.5 :
                                   this.currentSettings.voice === 'choir' ? 0.9 : 1;
        const formantShift = this.currentSettings.formantShift;

        const f1 = (phonemeData.f1 + formantShift * 100) * formantMultiplier;
        const f2 = (phonemeData.f2 + formantShift * 50) * formantMultiplier;
        const f3 = (phonemeData.f3 + formantShift * 25) * formantMultiplier;

        // Create voice source (sawtooth for voice, noise for fricatives)
        const voiceGain = ctx.createGain();
        voiceGain.gain.value = phonemeData.type === 'fricative' ? 0.3 : 0.4;

        // Fundamental oscillator
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = fundamental;

        // Vibrato LFO
        const vibratoLFO = ctx.createOscillator();
        vibratoLFO.type = 'sine';
        vibratoLFO.frequency.value = 5 + Math.random() * 2;

        const vibratoGain = ctx.createGain();
        vibratoGain.gain.value = fundamental * this.currentSettings.vibrato * 0.02;

        vibratoLFO.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        // Breathiness (noise)
        const breathiness = ctx.createGain();
        breathiness.gain.value = this.currentSettings.breathiness * 0.5;

        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = f1 || 1000;
        noiseFilter.Q.value = 1;

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(breathiness);

        // Formant filters
        const formant1 = ctx.createBiquadFilter();
        formant1.type = 'bandpass';
        formant1.frequency.value = f1;
        formant1.Q.value = 10;

        const formant2 = ctx.createBiquadFilter();
        formant2.type = 'bandpass';
        formant2.frequency.value = f2;
        formant2.Q.value = 10;

        const formant3 = ctx.createBiquadFilter();
        formant3.type = 'bandpass';
        formant3.frequency.value = f3;
        formant3.Q.value = 8;

        // Mix formants
        const formant1Gain = ctx.createGain();
        formant1Gain.gain.value = 1.0;

        const formant2Gain = ctx.createGain();
        formant2Gain.gain.value = 0.63;

        const formant3Gain = ctx.createGain();
        formant3Gain.gain.value = 0.1;

        // Connect fundamental to formants
        osc.connect(formant1);
        osc.connect(formant2);
        osc.connect(formant3);

        formant1.connect(formant1Gain);
        formant2.connect(formant2Gain);
        formant3.connect(formant3Gain);

        formant1Gain.connect(voiceGain);
        formant2Gain.connect(voiceGain);
        formant3Gain.connect(voiceGain);

        // Expression envelope
        const envelope = ctx.createGain();
        const attackTime = 0.03;
        const releaseTime = 0.05;

        envelope.gain.setValueAtTime(0, startTime);
        envelope.gain.linearRampToValueAtTime(1, startTime + attackTime);
        envelope.gain.setValueAtTime(1, startTime + duration - releaseTime);
        envelope.gain.linearRampToValueAtTime(0, startTime + duration);

        // Expression (random variation)
        const expressionGain = ctx.createGain();
        expressionGain.gain.value = 0.8 + Math.random() * 0.4 * this.currentSettings.expression;

        // Connect all
        voiceGain.connect(envelope);
        breathiness.connect(envelope);
        envelope.connect(expressionGain);
        expressionGain.connect(this.masterGain!);

        // Choir effect (multiple voices detuned)
        if (this.currentSettings.voice === 'choir') {
            for (let v = 0; v < 3; v++) {
                const choirOsc = ctx.createOscillator();
                choirOsc.type = 'sawtooth';
                choirOsc.frequency.value = fundamental * (1 + (Math.random() - 0.5) * 0.02);
                choirOsc.detune.value = (Math.random() - 0.5) * 20;

                const choirGain = ctx.createGain();
                choirGain.gain.value = 0.3;

                choirOsc.connect(formant1);
                choirOsc.connect(formant2);
                choirOsc.connect(formant3);
                choirGain.connect(envelope);

                choirOsc.start(startTime);
                choirOsc.stop(startTime + duration + 0.1);
            }
        }

        // Start oscillators
        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
        vibratoLFO.start(startTime);
        vibratoLFO.stop(startTime + duration + 0.1);
        noiseSource.start(startTime);
        noiseSource.stop(startTime + duration + 0.1);
    }

    private pitchToFreq(pitch: number): number {
        return 440 * Math.pow(2, (pitch - 69) / 12);
    }

    /**
     * Sing a sequence of notes
     */
    async sing(notes: VocalNote[]): Promise<void> {
        await this.initialize();

        for (const note of notes) {
            await this.synthesizeNote(note);
        }
    }

    /**
     * Stop all synthesis
     */
    stop(): void {
        if (this.audioContext) {
            // Close and recreate
            this.audioContext.close();
            this.audioContext = null;
            this.masterGain = null;
            this.reverbNode = null;
        }
    }

    /**
     * Preview a single word
     */
    async previewWord(word: string, pitch: number = 60): Promise<void> {
        await this.synthesizeNote({
            text: word,
            pitch,
            duration: 0.5,
            startTime: 0
        });
    }
}

// ============== GLOBAL INSTANCE ==============

let aiVocalSynthInstance: AIVocalSynth | null = null;

export function createAIVocalSynth(): AIVocalSynth {
    if (!aiVocalSynthInstance) {
        aiVocalSynthInstance = new AIVocalSynth();
    }
    return aiVocalSynthInstance;
}

export function getAIVocalSynth(): AIVocalSynth | null {
    return aiVocalSynthInstance;
}
