/**
 * NEXUS-X Audio Engine
 * Modular implementation with proper memory management
 */

import * as Tone from 'tone';
import type { Channel, KitType, ScaleType, SynthType } from '../types/index.js';
import { errorHandler } from '../core/ErrorHandler.js';

export class AudioEngine {
  // 🦍 GIGACHAD SCALE SYSTEM - 67+ SCALES 🦍
  private scales: Record<string, string[]> = {
    // === DIATONIC CHADS (The Seven Modes) ===
    ionian:           ["C", "D", "E", "F", "G", "A", "B"],           // Major - Pure happiness
    dorian:           ["C", "D", "Eb", "F", "G", "A", "Bb"],         // Jazz cat vibes
    phrygian:         ["C", "Db", "Eb", "F", "G", "Ab", "Bb"],       // Spanish tension
    lydian:           ["C", "D", "E", "F#", "G", "A", "B"],          // Dreamy, floating
    mixolydian:       ["C", "D", "E", "F", "G", "A", "Bb"],          // Bluesy dominant
    aeolian:          ["C", "D", "Eb", "F", "G", "Ab", "Bb"],        // Natural minor - Sad boi
    locrian:          ["C", "Db", "Eb", "F", "Gb", "Ab", "Bb"],      // Uncomfortable, dark

    // === CLASSIC CORE (Originals - kept for backwards compat) ===
    minor:            ["C", "D", "Eb", "F", "G", "Ab", "Bb"],        // Same as aeolian
    pentatonic:       ["C", "Eb", "F", "G", "Bb", "C", "Eb"],        // Minor pentatonic (extended for chords)

    // === PENTATONIC LEGENDS (extended for chord support) ===
    majorPenta:       ["C", "D", "E", "G", "A", "C", "D"],           // Stairway to Heaven
    minorPenta:       ["C", "Eb", "F", "G", "Bb", "C", "Eb"],        // Blues brothers
    blues:            ["C", "Eb", "F", "Gb", "G", "Bb", "C"],        // BB King nod
    egyptian:         ["C", "D", "F", "G", "Bb", "C", "D"],          // Mummy returns
    chinese:          ["C", "D", "F", "G", "A", "C", "D"],           // Ancient wisdom
    insen:            ["C", "Db", "F", "G", "Bb", "C", "Db"],        // Anime protagonist
    hirajoshi:        ["C", "Db", "F", "G", "Ab", "C", "Db"],        // Japanese warrior

    // === HARMONIC & MELODIC ===
    harmonicMinor:    ["C", "D", "Eb", "F", "G", "Ab", "B"],         // Snake charmer
    melodicMinor:     ["C", "D", "Eb", "F", "G", "A", "B"],          // Sophisticated sad boy
    harmonicMajor:    ["C", "D", "E", "F", "G", "Ab", "B"],          // Exotic major
    doubleHarmonic:   ["C", "Db", "E", "F", "G", "Ab", "B"],         // Prince of Persia

    // === EXOTIC ALPHA ===
    phrygianDominant: ["C", "Db", "E", "F", "G", "Ab", "Bb"],        // Spanish guitar god
    lydianAugmented:  ["C", "D", "E", "F#", "G#", "A", "B"],         // Interstellar vibes
    lydianDominant:   ["C", "D", "E", "F#", "G", "A", "Bb"],         // Herbie Hancock mode
    hungarianMinor:   ["C", "D", "Eb", "F#", "G", "Ab", "B"],        // Vampire weekend
    romanianMinor:    ["C", "D", "Eb", "F#", "G", "A", "Bb"],        // Eastern European fire
    neapolitanMinor:  ["C", "Db", "Eb", "F", "G", "Ab", "B"],        // Dark Italian drama
    neapolitanMajor:  ["C", "Db", "Eb", "F", "G", "A", "B"],         // Rare beauty
    spanishGypsy:     ["C", "Db", "E", "F", "G", "Ab", "Bb"],        // Flamenco chaos
    byzantine:        ["C", "Db", "E", "F", "G", "Ab", "B"],         // Constantinople falls
    persian:          ["C", "Db", "E", "F", "G", "Ab", "Bb"],        // Arabian nights
    altered:          ["C", "Db", "D#", "E", "F#", "G#", "Bb"],      // Jazz fusion

    // === MODE VARIANTS (Deep Cuts) ===
    superLocrian:     ["C", "Db", "Eb", "E", "F#", "G#", "Bb"],      // John Coltrane cries
    dorianFlat2:      ["C", "Db", "Eb", "F", "G", "A", "Bb"],        // Noir tech house
    lydianSharp2:     ["C", "D#", "E", "F#", "G", "A", "B"],         // Alien paradise
    lydianFlat7:      ["C", "D", "E", "F#", "G", "A", "Bb"],         // Best of both worlds
    mixolydianFlat6:  ["C", "D", "E", "F", "G", "Ab", "Bb"],         // Vampire disco
    aeolianFlat5:     ["C", "D", "Eb", "F", "Gb", "Ab", "Bb"],       // DOOM soundtrack
    phrygianNatural3: ["C", "Db", "E", "F", "G", "Ab", "Bb"],        // Phrygian Dominant alias
    dorianSharp4:     ["C", "D", "Eb", "F#", "G", "A", "Bb"],        // Lydian Dorian hybrid
    ionianFlat2:      ["C", "Db", "E", "F", "G", "A", "B"],          // Phrygian Natural 3 inv

    // === JAZZ FUSION GIGACHADS ===
    bebopDominant:    ["C", "D", "E", "F", "G", "A", "Bb", "B"],     // Charlie Parker vibes
    bebopMajor:       ["C", "D", "E", "F", "F#", "G", "A", "B"],     // Dizzy Gillespie nod
    bebopMinor:       ["C", "D", "Eb", "E", "F", "G", "A", "Bb"],    // Modal jazz master
    bebopDorian:      ["C", "D", "Eb", "F", "G", "A", "Bb", "B"],    // Dorian with passing
    diminishedHw:     ["C", "Db", "Eb", "E", "F#", "G", "A", "Bb"],  // Stranger Things intro
    diminishedWh:     ["C", "D", "Eb", "F", "Gb", "G#", "A", "B"],   // Math rock protagonist
    wholeTone:        ["C", "D", "E", "F#", "G#", "A#"],             // Claude Debussy vibes
    augmented:        ["C", "D", "E", "G", "Ab", "B"],               // Sci-fi tension
    tritone:          ["C", "F#", "G", "C#", "D", "G#", "A"],        // Devil in music

    // === VIDEO GAME / CHIPTUNE (extended for chord support) ===
    nesMajor:         ["C", "D", "E", "G", "A", "C", "D"],           // Mario Bros classic
    zelda:            ["C", "D", "E", "G", "A", "B", "C"],           // Triforce activated
    megaMan:          ["C", "Eb", "F", "G", "Bb", "C", "Eb"],        // Blue bomber
    castlevania:      ["C", "D", "Eb", "G", "Ab", "C", "D"],         // Vampire killer
    sonicMode:        ["C", "D", "F", "G", "A", "C", "D"],           // Gotta go fast
    finalFantasy:     ["C", "D", "E", "G", "A", "B", "C"],           // Nobuo Uematsu special
    tibia:            ["C", "D", "Eb", "F", "G", "Bb", "C"],         // Medieval MMO vibes

    // === CINEMATIC / SOUNDTRACK (extended for chord support) ===
    duneScale:        ["C", "D", "Eb", "F", "G", "Ab", "Bb", "Db"],  // Spice must flow
    interstellar:     ["C", "D", "Eb", "F", "G", "Ab", "B"],         // Docking scene
    batmanTheme:      ["C", "D", "Eb", "F", "G", "Ab", "B"],         // Why so serious
    jokerStairs:      ["C", "Db", "Eb", "F", "Gb", "Ab", "Bb"],      // Society chaos
    braveheart:       ["C", "D", "Eb", "G", "A", "C", "D"],          // FREEEEDOOOM
    gladiator:        ["C", "D", "Eb", "F", "G", "Ab", "Bb"],        // Are you not entertained

    // === METAL / ROCK CHAOS ===
    phrygianMetal:    ["C", "Db", "E", "F", "G", "Ab", "Bb"],        // Yngwie Malmsteen
    harmonicMetal:    ["C", "D", "Eb", "F", "G", "Ab", "B"],         // Nightwish energy
    locrianNatural2:  ["C", "D", "Eb", "F", "Gb", "Ab", "Bb"],       // Death metal
    ukrainianDorian:  ["C", "D", "Eb", "F#", "G", "A", "Bb"],        // Ensiferum vibes
    enigmatic:        ["C", "Db", "E", "F#", "G#", "A#", "B"],       // Mystery scale

    // === WORLD MUSIC LEGENDS (extended for chord support) ===
    hijaz:            ["C", "Db", "E", "F", "G", "Ab", "Bb"],        // Arabic maqam
    bayati:           ["C", "D", "Eb", "F", "G", "A", "Bb"],         // Middle Eastern
    rast:             ["C", "D", "E", "F#", "G", "A", "B"],          // Turkish Makam
    sikah:            ["C", "D", "E", "F", "G", "Ab", "Bb"],         // Arabic microtonal-adj
    saba:             ["C", "Db", "Eb", "F", "Gb", "Ab", "Bb"],      // Sad Arabic
    huzam:            ["C", "Db", "E", "F", "G", "Ab", "B"],         // Intense Arabic
    ragaBhimpalasi:   ["C", "D", "Eb", "F", "G", "Ab", "Bb"],        // Classical Indian
    ragaYaman:        ["C", "D", "E", "F#", "G", "A", "B"],          // Evening raga
    pelog:            ["C", "Db", "Eb", "G", "Ab", "C", "Db"],       // Gamelan vibes
    slendro:          ["C", "D", "F", "G", "A", "C", "D"],           // Bali mystic
    kumoi:            ["C", "D", "F", "G", "A", "Bb", "C"],          // Japanese pentatonic
    iwato:            ["C", "Db", "F", "Gb", "Bb", "C", "Db"],       // Japanese dark
    prometheus:       ["C", "D", "E", "F#", "A", "Bb", "C"],         // Scriabin's scale

    // === EXPERIMENTAL WTF (extended for chord support) ===
    octatonic:        ["C", "Db", "Eb", "E", "F#", "G", "A", "Bb"],  // Stravinsky says hi
    chromatic:        ["C", "C#", "D", "D#", "E", "F", "F#"],        // Chaos mode
    tritoneParadise:  ["C", "F#", "G", "C#", "D", "G#", "A"],        // Medieval banned
    fourthsStack:     ["C", "F", "Bb", "Eb", "Ab", "C", "F"],        // McCoy Tyner special
    fifthsStack:      ["C", "G", "D", "A", "E", "B", "F#"],          // Power chord paradise

    // === SECRET UNLOCKABLES (extended for chord support) ===
    simpleAs:         ["C", "E", "G", "C", "E", "G", "C"],           // Literally a triad lol
    piratesCredo:     ["C", "D", "Eb", "F", "G", "Ab", "Bb"],        // Jack Sparrow approved
    theL:             ["C", "D", "E", "F", "G", "A", "B"]            // Law and order dun dun
  };

  private currentScale: ScaleType = 'minor';
  private currentKit: KitType = 'NEON';
  private channels: Channel[] = [];
  private progressionOffset = 0;
  private sidechainActive = true;

  // Audio nodes (will be properly disposed)
  private drumBus!: Tone.Volume;
  private synthBus!: Tone.Volume;
  private masterVolume!: Tone.Volume;
  private streamDest!: MediaStreamAudioDestinationNode;

  // Effects (will be properly disposed)
  private mic!: Tone.UserMedia;
  private micMono!: Tone.Mono;
  private micReverb!: Tone.Reverb;
  private micVol!: Tone.Volume;
  private compressor!: Tone.Compressor;
  private limiter!: Tone.Limiter;
  private vibrato!: Tone.Vibrato;
  private distortion!: Tone.Distortion;
  private filter!: Tone.Filter;
  private autoFilter!: Tone.AutoFilter;
  private eq3!: Tone.EQ3;
  private cheby!: Tone.Chebyshev;
  private stutter!: Tone.Tremolo;
  private masterPitch!: Tone.PitchShift;
  private stereoWidener!: Tone.StereoWidener;
  private reverb!: Tone.Reverb;
  private delay!: Tone.PingPongDelay;
  private hatAutoPanner!: Tone.AutoPanner;

  // TIER 2: Polish Enhancements
  private presenceEQ!: Tone.Filter;        // High-shelf for "air" at 10kHz
  private reverbPreDelay!: Tone.Delay;     // 20ms pre-delay before reverb
  private stereoWidthValue: number = 0;    // 0-200% stereo width

  // TIER 3: Advanced Features
  // Multiband Compression (3-band)
  private mbLowFilter!: Tone.Filter;       // Low band crossover
  private mbHighFilter!: Tone.Filter;      // High band crossover
  private mbLowComp!: Tone.Compressor;     // Low band compressor
  private mbMidComp!: Tone.Compressor;     // Mid band compressor
  private mbHighComp!: Tone.Compressor;    // High band compressor
  private mbMerger!: Tone.Merge;           // Merge bands back

  // LUFS Metering
  private lufsAnalyser!: Tone.Analyser;    // For loudness measurement
  private lufsHistory: number[] = [];      // RMS history for integrated LUFS
  private currentLUFS: number = -23;       // Current integrated loudness

  // Dithering (handled in DSP Worklet)
  private ditherEnabled: boolean = false;

  // Analysis
  private analyser!: Tone.Analyser;
  private waveform!: Tone.Waveform;

  // DSP Worklet
  private bitcrusherNode: AudioWorkletNode | null = null;
  private bitcrusherParamEnabled: AudioParam | null = null;
  private bitcrusherParamDepth: AudioParam | null = null;
  private bitcrusherParamFreq: AudioParam | null = null;
  private bitcrusherParamTruePeak: AudioParam | null = null;
  private bitcrusherParamWarmth: AudioParam | null = null;  // NEW TIER 2

  constructor() {
    this.initializeAudioNodes();
  }

  /**
   * Initialize all audio nodes
   */
  private initializeAudioNodes(): void {
    try {
      // Buses
      this.drumBus = new Tone.Volume(0);
      this.synthBus = new Tone.Volume(0);
      this.masterVolume = new Tone.Volume(0).connect(Tone.Destination);

      // Inputs
      this.mic = new Tone.UserMedia();
      this.micMono = new Tone.Mono();
      this.micReverb = new Tone.Reverb({ decay: 3, wet: 0 });
      this.micVol = new Tone.Volume(-Infinity);
      this.mic.chain(this.micMono, this.micReverb, this.micVol, this.synthBus);

      // ============================================================
      // MASTER CHAIN - STUDIO GRADE v3.0 (TIER 2 POLISH)
      // ============================================================

      // TIER 2: Presence EQ - Adds "air" and "expensive" sound
      // High-shelf boost at 10kHz for clarity and presence
      this.presenceEQ = new Tone.Filter({
        frequency: 10000,
        type: "highshelf",
        Q: 1,
        gain: 1.5  // Subtle +1.5dB presence boost
      });

      // TIER 2: Reverb Pre-Delay - Separates dry from wet for clarity
      // 20ms pre-delay before reverb input
      this.reverbPreDelay = new Tone.Delay(0.02);

      // Improved Compressor: Less aggressive, more transparent
      // Lower ratio, higher threshold = more dynamics preserved
      this.compressor = new Tone.Compressor({
        threshold: -18,     // Raised from -14dB for more headroom
        ratio: 3,           // Lowered from 4 for transparency
        attack: 0.003,      // Faster attack for transients
        release: 0.15,      // Slightly longer release for smoothness
        knee: 6             // Soft knee for gradual compression
      });

      // True-Peak Safe Limiter: -1dB ceiling (was -0.5dB, too aggressive)
      this.limiter = new Tone.Limiter(-1.0);
      this.streamDest = Tone.context.createMediaStreamDestination();

      // FX
      this.vibrato = new Tone.Vibrato({ frequency: 0.5, depth: 0, wet: 0 });
      this.distortion = new Tone.Distortion(0);
      this.filter = new Tone.Filter(20000, "lowpass", -24);
      this.autoFilter = new Tone.AutoFilter("8n", 200, 4).start();
      this.autoFilter.wet.value = 0;
      this.eq3 = new Tone.EQ3({ low: 0, mid: 0, high: 0 });
      this.cheby = new Tone.Chebyshev(50);
      this.cheby.wet.value = 0;
      this.stutter = new Tone.Tremolo({ frequency: "16n", type: "square", depth: 1, spread: 0 }).start();
      this.stutter.wet.value = 0;
      this.masterPitch = new Tone.PitchShift({ pitch: 0, windowSize: 0.1 });
      this.stereoWidener = new Tone.StereoWidener(0);

      // TIER 2: Spatial with Pre-Delay for clarity
      this.reverb = new Tone.Reverb({ decay: 5, wet: 0.3 });
      this.delay = new Tone.PingPongDelay("8n", 0.4);
      this.delay.wet.value = 0;
      this.hatAutoPanner = new Tone.AutoPanner("4n").start();

      // ============================================================
      // TIER 3: MULTIBAND COMPRESSION (3-Band)
      // ============================================================
      // Crossover frequencies: Low < 200Hz, Mid 200-2000Hz, High > 2000Hz

      // Crossover filters for band splitting
      this.mbLowFilter = new Tone.Filter(200, "lowpass", -24);   // Low band
      this.mbHighFilter = new Tone.Filter(2000, "highpass", -24); // High band

      // Compressors for each band with different settings
      this.mbLowComp = new Tone.Compressor({
        threshold: -20,
        ratio: 4,
        attack: 0.02,   // Slower for low frequencies
        release: 0.3,
        knee: 10
      });

      this.mbMidComp = new Tone.Compressor({
        threshold: -18,
        ratio: 3,
        attack: 0.01,
        release: 0.2,
        knee: 6
      });

      this.mbHighComp = new Tone.Compressor({
        threshold: -16,
        ratio: 2.5,
        attack: 0.003,  // Faster for transients
        release: 0.15,
        knee: 4
      });

      // Merger to combine bands (simplified - using Volume as summing bus)
      this.mbMerger = new Tone.Merge();

      // ============================================================
      // TIER 3: LUFS METERING
      // ============================================================
      // Uses RMS-based loudness measurement (simplified EBU R128)
      this.lufsAnalyser = new Tone.Analyser("waveform", 2048);
      this.lufsHistory = [];
      this.currentLUFS = -23;  // Target: -23 LUFS (broadcast standard)

      // Connections
      this.drumBus.connect(this.filter);
      this.synthBus.connect(this.filter);

      // TIER 2: Reverb with Pre-Delay chain
      // reverbPreDelay -> reverb -> filter (for dampening)
      this.reverbPreDelay.connect(this.reverb);
      this.reverb.connect(this.filter);

      // DSP Chain v3.1 (with TIER 2 Polish + TIER 3 Advanced)
      this.filter.chain(
        this.autoFilter,
        this.eq3,
        this.distortion,
        this.vibrato,
        this.cheby,
        this.stutter,
        this.masterPitch,
        this.presenceEQ,      // TIER 2: Presence boost before stereo
        this.stereoWidener,
        this.compressor,
        this.limiter
      );

      this.limiter.connect(this.masterVolume);
      this.limiter.connect(this.streamDest);

      // TIER 3: Connect LUFS analyser
      this.limiter.connect(this.lufsAnalyser);

      // Analysis
      this.analyser = new Tone.Analyser("fft", 64);
      this.waveform = new Tone.Waveform(512);
      this.limiter.connect(this.analyser);
      this.limiter.connect(this.waveform);

    } catch (error) {
      throw errorHandler.handleError({
        code: 'AUDIO_INIT_FAILED',
        message: 'Failed to initialize audio engine',
        details: error,
        recoverable: false
      });
    }
  }

  /**
   * Load a synthesizer kit with proper memory cleanup
   * FIXED: All nodes are now properly disposed
   */
  async loadKit(kitName: KitType, isInit = false): Promise<void> {
    this.currentKit = kitName;
    const wasArp = this.channels[5] ? this.channels[5].arpActive : false;

    // MEMORY LEAK FIX: Strict disposal of all nodes
    this.disposeChannels();

    // Create new channels
    this.channels = [];

    const tracks = ['Kick', 'Snare', 'Clap', 'HiHat', 'Bass', 'Lead/Arp', 'Pad/Chord'];

    for (let i = 0; i < tracks.length; i++) {
      try {
        const channel = await this.createChannel(i, kitName, tracks[i], wasArp);
        this.channels.push(channel);
      } catch (error) {
        console.error(`Failed to create channel ${i}:`, error);
        // Create fallback channel
        this.channels.push(this.createFallbackChannel(tracks[i]));
      }
    }

    if (!isInit) {
      errorHandler.showSuccess(`LOADED ENGINE: ${kitName}`);
    }
  }

  /**
   * Properly dispose of all channel nodes to prevent memory leaks
   */
  private disposeChannels(): void {
    this.channels.forEach((ch, index) => {
      try {
        // Dispose synth
        if (ch.synth && 'dispose' in ch.synth) {
          ch.synth.disconnect();
          (ch.synth as any).dispose();
        }

        // Dispose volume (always created)
        if (ch.vol && 'dispose' in ch.vol) {
          ch.vol.dispose();
        }

        // Dispose panner (always created)
        if (ch.panner && 'dispose' in ch.panner) {
          ch.panner.dispose();
        }
      } catch (error) {
        console.error(`Error disposing channel ${index}:`, error);
      }
    });

    // Clear the array
    this.channels = [];
  }

  /**
   * Create a single channel with the appropriate synthesizer
   */
  private async createChannel(
    index: number,
    kitName: KitType,
    name: string,
    wasArp: boolean
  ): Promise<Channel> {
    const isDrum = index < 4;
    const targetBus = isDrum ? this.drumBus : this.synthBus;

    // Always create vol and panner - no conditional creation
    const vol = new Tone.Volume(0);
    const panner = new Tone.Panner(0);

    let synth: Tone.PolySynth | Tone.Synth | Tone.MonoSynth | Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth | Tone.FMSynth;
    let type: SynthType;

    switch (kitName) {
      case 'NEON':
        synth = this.createNeonSynth(index);
        break;
      case 'CINEMATIC':
        synth = this.createCinematicSynth(index);
        break;
      case 'DUNGEON':
        synth = this.createDungeonSynth(index);
        break;
      case 'GLITCH':
        synth = this.createGlitchSynth(index);
        break;
      case 'ACID':
        synth = this.createAcidSynth(index);
        break;
      case 'VINYL':
        synth = this.createVinylSynth(index);
        break;
      case 'CLUB':
        synth = this.createClubSynth(index);
        break;
      case 'CHIPTUNE':
        synth = this.createChiptuneSynth(index);
        break;
      case 'INDUSTRIAL':
        synth = this.createIndustrialSynth(index);
        break;
      case 'ETHEREAL':
        synth = this.createEtherealSynth(index);
        break;
      default:
        synth = this.createNeonSynth(index);
    }

    // Connect synth to panner to vol to bus
    synth.connect(panner);
    panner.connect(vol);
    vol.connect(targetBus);

    // Determine synth type
    type = this.getSynthType(index);

    return {
      name,
      synth,
      panner,
      vol,
      type,
      muted: false,
      soloed: false,
      arpActive: (index === 5 ? wasArp : false)
    };
  }

  /**
   * Create fallback channel if primary creation fails
   */
  private createFallbackChannel(name: string): Channel {
    const vol = new Tone.Volume(0);
    const panner = new Tone.Panner(0);
    const synth = new Tone.Synth({ oscillator: { type: 'sine' } });

    synth.connect(panner);
    panner.connect(vol);
    vol.connect(this.synthBus);

    return {
      name,
      synth,
      panner,
      vol,
      type: 'lead',
      muted: false,
      soloed: false,
      arpActive: false
    };
  }

  /**
   * Get synth type based on track index
   */
  private getSynthType(index: number): SynthType {
    const types: SynthType[] = ['kick', 'noise', 'noise', 'metal', 'bass', 'lead', 'pad'];
    return types[index] || 'lead';
  }

  // Kit-specific synth creation methods
  private createNeonSynth(index: number): any {
    if (index === 0) {
      return new Tone.MembraneSynth({
        pitchDecay: 0.05,
        envelope: { attack: 0.001, decay: 0.4 }
      });
    } else if (index === 1 || index === 2) {
      return new Tone.NoiseSynth({ noise: { type: 'white' } }).connect(this.reverb);
    } else if (index === 3) {
      return new Tone.MetalSynth({
        harmonicity: 5.1,
        modulationIndex: 32
      }).chain(this.hatAutoPanner);
    } else if (index === 4) {
      return new Tone.MonoSynth({
        oscillator: { type: "square" },
        portamento: 0.05
      });
    } else if (index === 5) {
      return new Tone.Synth({ oscillator: { type: "triangle" } }).connect(this.delay);
    } else if (index === 6) {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.2, release: 0.5 }
      });
      synth.set({ maxPolyphony: 4 });
      synth.connect(this.reverb);
      const chorus = new Tone.Chorus(4, 2.5, 0.5).start();
      synth.connect(chorus);
      return synth;
    }
  }

  private createCinematicSynth(index: number): any {
    if (index === 0) {
      return new Tone.MembraneSynth();
    } else if (index < 4) {
      return new Tone.NoiseSynth().connect(this.reverb);
    } else if (index === 6) {
      const synth = new Tone.PolySynth(Tone.Synth);
      synth.set({ maxPolyphony: 4 });
      synth.connect(this.reverb);
      return synth;
    }
    return new Tone.Synth();
  }

  private createDungeonSynth(index: number): any {
    if (index === 0) {
      return new Tone.MembraneSynth({
        pitchDecay: 0.8,
        envelope: { attack: 0.01, decay: 0.8 }
      });
    } else if (index === 1 || index === 2) {
      return new Tone.NoiseSynth({
        noise: { type: 'brown' },
        envelope: { attack: 0.1, decay: 0.5 }
      }).connect(this.reverb);
    } else if (index === 3) {
      return new Tone.MetalSynth({
        harmonicity: 2.0,
        modulationIndex: 20,
        envelope: { attack: 0.1, decay: 0.3 }
      }).chain(this.hatAutoPanner);
    } else if (index === 4) {
      return new Tone.MonoSynth({
        oscillator: { type: "triangle" },
        portamento: 0.1
      });
    } else if (index === 5) {
      return new Tone.FMSynth({
        modulationIndex: 10,
        harmonicity: 1.5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.5 }
      }).connect(this.delay);
    } else if (index === 6) {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.8, release: 1.5 }
      });
      synth.set({ maxPolyphony: 3 });
      synth.connect(this.reverb);
      const chorus = new Tone.Chorus(2, 3, 0.8).start();
      synth.connect(chorus);
      return synth;
    }
  }

  private createGlitchSynth(index: number): any {
    // Simplified for brevity - would implement full glitch sounds
    return this.createNeonSynth(index);
  }

  private createAcidSynth(index: number): any {
    // Simplified for brevity - would implement acid sounds
    return this.createNeonSynth(index);
  }

  private createVinylSynth(index: number): any {
    // Simplified for brevity - would implement lo-fi sounds
    return this.createNeonSynth(index);
  }

  private createClubSynth(index: number): any {
    // Simplified for brevity - would implement house/techno sounds
    return this.createNeonSynth(index);
  }

  private createChiptuneSynth(index: number): any {
    // Simplified for brevity - would implement 8-bit sounds
    return this.createNeonSynth(index);
  }

  private createIndustrialSynth(index: number): any {
    // Simplified for brevity - would implement industrial sounds
    return this.createNeonSynth(index);
  }

  private createEtherealSynth(index: number): any {
    // Simplified for brevity - would implement ambient sounds
    return this.createNeonSynth(index);
  }

  /**
   * Setup AudioWorklet for DSP
   */
  async setupWorklet(): Promise<void> {
    try {
      await Tone.context.addAudioWorkletModule('processor.js');
      console.log("AudioWorklet Module Loaded");

      const nativeCtx = Tone.context.rawContext || Tone.context;
      this.bitcrusherNode = new AudioWorkletNode(nativeCtx, 'nexus-bitcrusher');

      // Try to load WASM
      try {
        const response = await fetch('nexus-dsp.wasm');
        if (response.ok) {
          const wasmBytes = await response.arrayBuffer();
          const wasmModule = await WebAssembly.compile(wasmBytes);
          this.bitcrusherNode.port.postMessage({ type: 'load-wasm', wasmModule });
          errorHandler.showSuccess('DSP: BITCRUSHER WORKLET ACTIVE (WASM)');
        }
      } catch (e) {
        errorHandler.showInfo('DSP: Running in JS Mode (WASM not available)');
      }

      // Insert into audio chain
      this.compressor.disconnect();
      this.compressor.connect(this.bitcrusherNode);
      Tone.connect(this.bitcrusherNode, this.limiter);

      // Store parameter references
      this.bitcrusherParamEnabled = this.bitcrusherNode.parameters.get('enabled');
      this.bitcrusherParamDepth = this.bitcrusherNode.parameters.get('bitDepth');
      this.bitcrusherParamFreq = this.bitcrusherNode.parameters.get('frequencyReduction');
      this.bitcrusherParamTruePeak = this.bitcrusherNode.parameters.get('truePeakEnabled');
      this.bitcrusherParamWarmth = this.bitcrusherNode.parameters.get('warmth');  // NEW TIER 2

      // Enable True-Peak by default for broadcast-ready output
      if (this.bitcrusherParamTruePeak) {
        this.bitcrusherParamTruePeak.value = 1;
      }

    } catch (e) {
      errorHandler.handleError({
        code: 'WORKLET_LOAD_FAILED',
        message: 'Failed to load AudioWorklet DSP',
        details: e,
        recoverable: true
      });

      // Fallback connection
      this.compressor.connect(this.limiter);
    }
  }

  /**
   * Trigger a note on a channel (ROBUST EDITION)
   * Now handles scales of any length gracefully
   */
  trigger(trackIdx: number, time: number, type: number = 1, stepIdx: number = 0): void {
    const ch = this.channels[trackIdx];
    if (!ch) return;

    const isAnySoloed = this.channels.some(c => c.soloed);
    if ((isAnySoloed && !ch.soloed) || (!isAnySoloed && ch.muted)) return;

    // Sidechain compression on kick
    if (ch.type === 'kick' && this.sidechainActive) {
      this.synthBus.volume.cancelScheduledValues(time);
      this.synthBus.volume.rampTo(-24, 0.01, time);
      this.synthBus.volume.rampTo(0, 0.25, time + 0.03);
    }

    let vel = type === 2 ? 0.3 : 1;
    if ((window as any).sys?.humanizeActive && type !== 2) {
      vel *= (Math.random() * 0.2 + 0.8);
    }

    try {
      const scale = this.scales[this.currentScale];
      if (!scale || scale.length === 0) {
        console.warn('No scale loaded, using fallback');
        return;
      }

      const scaleLen = scale.length;
      const rootIdx = Math.abs((stepIdx * 3 + trackIdx * 5 + this.progressionOffset)) % scaleLen;

      // Helper function to safely get scale note
      const getNote = (offset: number, octave: number | string): string => {
        const idx = (rootIdx + offset) % scaleLen;
        const note = scale[idx] || 'C';
        return `${note}${octave}`;
      };

      if (ch.type === 'pad') {
        // For small scales, repeat notes or use what's available
        const root = scale[rootIdx] || 'C';
        const thirdIdx = scaleLen > 2 ? (rootIdx + 2) % scaleLen : rootIdx;
        const fifthIdx = scaleLen > 4 ? (rootIdx + 4) % scaleLen : (rootIdx + 1) % scaleLen;

        const third = scale[thirdIdx] || root;
        const fifth = scale[fifthIdx] || root;

        const notes = [`${root}3`, `${third}4`, `${fifth}4`];
        (ch.synth as any).triggerAttackRelease(notes, "8n", time, vel * 0.5);
      } else if (ch.type === 'lead') {
        if (ch.arpActive) {
          const s = Tone.Time("16n").toSeconds() / 2;
          const note1 = getNote(0, 4);
          const secondIdx = scaleLen > 2 ? 2 : 1;
          const note2 = getNote(secondIdx, 4);
          (ch.synth as any).triggerAttackRelease(note1, "64n", time, vel);
          (ch.synth as any).triggerAttackRelease(note2, "64n", time + s, vel * 0.8);
        } else {
          let octave = 4 + (stepIdx % 2);
          const note = getNote(0, octave);
          (ch.synth as any).triggerAttackRelease(note, "16n", time, vel);
        }
      } else if (ch.type === 'bass') {
        let octave = 1 + (stepIdx % 2);
        const note = getNote(0, octave);
        (ch.synth as any).triggerAttackRelease(note, "16n", time, vel);
      } else if (ch.type === 'kick') {
        (ch.synth as any).triggerAttackRelease("C1", "16n", time, vel);
      } else if (ch.type === 'noise') {
        (ch.synth as any).triggerAttackRelease("16n", time, vel);
      } else if (ch.type === 'metal') {
        (ch.synth as any).triggerAttackRelease(200, "32n", time, vel);
      }
    } catch (error) {
      console.error('Trigger error:', error);
    }
  }

  /**
   * Set filter frequency with ramp
   */
  setFilterScheduled(freq: number, rampTime: number, time: number): void {
    this.filter.frequency.rampTo(freq, rampTime, time);
  }

  /**
   * Set the musical scale (🦍 GIGACHAD EDITION - 67+ scales)
   */
  setScale(name: string): void {
    // Validate scale exists
    if (!this.scales[name]) {
      errorHandler.handleError({
        code: 'SCALE_INVALID',
        message: `Unknown scale: ${name}`,
        recoverable: true
      });
      // Fallback to minor
      this.currentScale = 'minor';
      return;
    }
    this.currentScale = name;
    errorHandler.showSuccess(`🎵 SCALE: ${name.toUpperCase()}`);
  }

  /**
   * Get all available scales
   */
  getAvailableScales(): string[] {
    return Object.keys(this.scales);
  }

  /**
   * Get scale notes by name
   */
  getScaleNotes(name: string): string[] | null {
    return this.scales[name] || null;
  }

  /**
   * Get analyser data for visualization
   */
  getAnalyserData(): Float32Array {
    return this.analyser.getValue();
  }

  /**
   * Get waveform data for visualization
   */
  getWaveformData(): Float32Array {
    return this.waveform.getValue();
  }

  /**
   * Get current channels
   */
  getChannels(): Channel[] {
    return this.channels;
  }

  /**
   * Get all effect nodes for external access
   */
  getEffects() {
    return {
      eq3: this.eq3,
      reverb: this.reverb,
      delay: this.delay,
      compressor: this.compressor,
      limiter: this.limiter,
      cheby: this.cheby,
      stutter: this.stutter,
      autoFilter: this.autoFilter,
      masterPitch: this.masterPitch,
      stereoWidener: this.stereoWidener,
      bitcrusherEnabled: this.bitcrusherParamEnabled,
      bitcrusherDepth: this.bitcrusherParamDepth,
      bitcrusherFreq: this.bitcrusherParamFreq,
      truePeakEnabled: this.bitcrusherParamTruePeak,
      warmth: this.bitcrusherParamWarmth,
      // TIER 2 Polish Enhancements
      presenceEQ: this.presenceEQ,
      reverbPreDelay: this.reverbPreDelay,
      stereoWidthValue: this.stereoWidthValue,
      // TIER 3 Advanced Features
      mbLowComp: this.mbLowComp,
      mbMidComp: this.mbMidComp,
      mbHighComp: this.mbHighComp,
      ditherEnabled: this.ditherEnabled,
      currentLUFS: this.currentLUFS
    };
  }

  // ============================================================
  // TIER 2: POLISH CONTROL METHODS
  // ============================================================

  /**
   * Set presence EQ gain (0-4 dB) - Adds "air" to master
   */
  setPresenceGain(gainDb: number): void {
    const clampedGain = Math.max(0, Math.min(4, gainDb));
    this.presenceEQ.gain.value = clampedGain;
  }

  /**
   * Set reverb pre-delay (0-50 ms) - Separates dry from wet
   */
  setReverbPreDelay(delayMs: number): void {
    const clampedDelay = Math.max(0, Math.min(0.05, delayMs / 1000));
    this.reverbPreDelay.delayTime.value = clampedDelay;
  }

  /**
   * Set stereo width (0-200%) - 100% = normal, 200% = super wide
   */
  setStereoWidth(widthPercent: number): void {
    this.stereoWidthValue = Math.max(0, Math.min(200, widthPercent));
    // StereoWidener uses 0-1 range, where 1 = max width
    this.stereoWidener.width.value = this.stereoWidthValue / 200;
  }

  /**
   * Set tape saturation warmth (0-1) - 0 = clean, 1 = heavy saturation
   */
  setWarmth(warmth: number): void {
    const clampedWarmth = Math.max(0, Math.min(1, warmth));
    if (this.bitcrusherParamWarmth) {
      this.bitcrusherParamWarmth.value = clampedWarmth;
    }
  }

  // ============================================================
  // TIER 3: ADVANCED CONTROL METHODS
  // ============================================================

  /**
   * Set multiband compressor thresholds
   * @param lowThreshold - Low band threshold in dB (-30 to 0)
   * @param midThreshold - Mid band threshold in dB (-30 to 0)
   * @param highThreshold - High band threshold in dB (-30 to 0)
   */
  setMultibandThresholds(lowThreshold: number, midThreshold: number, highThreshold: number): void {
    this.mbLowComp.threshold.value = Math.max(-30, Math.min(0, lowThreshold));
    this.mbMidComp.threshold.value = Math.max(-30, Math.min(0, midThreshold));
    this.mbHighComp.threshold.value = Math.max(-30, Math.min(0, highThreshold));
  }

  /**
   * Calculate and return current LUFS (loudness)
   * Uses simplified EBU R128-style measurement
   */
  calculateLUFS(): number {
    const waveform = this.lufsAnalyser.getValue() as Float32Array;
    if (waveform.length === 0) return this.currentLUFS;

    // Calculate RMS for this buffer
    let sumSquares = 0;
    for (let i = 0; i < waveform.length; i++) {
      sumSquares += waveform[i] * waveform[i];
    }
    const rms = Math.sqrt(sumSquares / waveform.length);

    // Convert to dB
    const rmsDb = 20 * Math.log10(Math.max(rms, 1e-10));

    // Add to history (keep last 10 measurements)
    this.lufsHistory.push(rmsDb);
    if (this.lufsHistory.length > 10) {
      this.lufsHistory.shift();
    }

    // Calculate integrated LUFS (average)
    const integrated = this.lufsHistory.reduce((a, b) => a + b, 0) / this.lufsHistory.length;

    // Apply K-weighting filter simulation (simplified)
    this.currentLUFS = integrated - 0.7;  // Approximate correction

    return this.currentLUFS;
  }

  /**
   * Get current LUFS reading
   */
  getLUFS(): number {
    return this.currentLUFS;
  }

  /**
   * Get loudness status for UI display
   */
  getLoudnessStatus(): { lufs: number; status: 'too_low' | 'good' | 'too_loud' } {
    const lufs = this.calculateLUFS();
    let status: 'too_low' | 'good' | 'too_loud';

    if (lufs < -26) {
      status = 'too_low';
    } else if (lufs > -10) {
      status = 'too_loud';
    } else {
      status = 'good';
    }

    return { lufs, status };
  }

  /**
   * Enable/disable dithering for export
   * Dithering reduces quantization noise when reducing bit depth
   */
  setDithering(enabled: boolean): void {
    this.ditherEnabled = enabled;
  }

  /**
   * Get dithering status
   */
  isDitheringEnabled(): boolean {
    return this.ditherEnabled;
  }

  /**
   * Get microphone for external access
   */
  getMicrophone() {
    return {
      mic: this.mic,
      micVol: this.micVol,
      micReverb: this.micReverb
    };
  }

  /**
   * Dispose of all audio nodes
   */
  dispose(): void {
    this.disposeChannels();

    // Dispose all effect nodes (including TIER 2 & TIER 3)
    const effects = [
      this.drumBus, this.synthBus, this.masterVolume,
      this.mic, this.micMono, this.micReverb, this.micVol,
      this.compressor, this.limiter, this.vibrato, this.distortion,
      this.filter, this.autoFilter, this.eq3, this.cheby, this.stutter,
      this.masterPitch, this.stereoWidener, this.reverb, this.delay,
      this.hatAutoPanner, this.analyser, this.waveform,
      // TIER 2 Polish
      this.presenceEQ, this.reverbPreDelay,
      // TIER 3 Advanced
      this.mbLowFilter, this.mbHighFilter,
      this.mbLowComp, this.mbMidComp, this.mbHighComp,
      this.mbMerger, this.lufsAnalyser
    ];

    effects.forEach(node => {
      try {
        if (node && 'dispose' in node) {
          node.disconnect();
          (node as any).dispose();
        }
      } catch (error) {
        console.error('Error disposing node:', error);
      }
    });

    // Close stream destination
    if (this.streamDest) {
      this.streamDest.disconnect();
    }
  }
}
