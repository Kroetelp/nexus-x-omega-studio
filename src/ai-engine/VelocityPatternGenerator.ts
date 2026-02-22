/**
 * NEXUS-X Velocity Pattern Generator
 *
 * Generates patterns with realistic velocity curves
 * inspired by FL Studio's "Riff Machine" and Ableton's "Generate"
 */

import {
  NoteData,
  TrackPattern,
  FullPattern,
  createEmptyFullPattern,
  VELOCITY_PRESETS,
  DRUM_PITCHES,
  SCALE_TO_MIDI,
  humanizeVelocity,
  generateVelocityCurve
} from '../sequencer/NoteData';
import { loggers } from '../utils/logger';

const log = loggers.ai;

// Genre-specific velocity characteristics
const GENRE_VELOCITY_PROFILES = {
  TECHNO: {
    kick: { base: 127, variation: 5, pattern: 'four-on-floor' },
    snare: { base: 120, variation: 10, pattern: 'backbeat' },
    hihat: { base: 90, variation: 20, pattern: 'steady-8th' },
    bass: { base: 100, variation: 15, pattern: 'driving' },
    lead: { base: 95, variation: 25, pattern: 'rhythmic' }
  },
  HOUSE: {
    kick: { base: 127, variation: 3, pattern: 'four-on-floor' },
    snare: { base: 110, variation: 15, pattern: 'clap-heavy' },
    hihat: { base: 85, variation: 15, pattern: 'offbeat' },
    bass: { base: 95, variation: 10, pattern: 'deep' },
    lead: { base: 90, variation: 20, pattern: 'soulful' }
  },
  DNB: {
    kick: { base: 120, variation: 10, pattern: 'syncopated' },
    snare: { base: 127, variation: 8, pattern: 'breakbeat' },
    hihat: { base: 100, variation: 30, pattern: 'complex-16th' },
    bass: { base: 110, variation: 20, pattern: ' Reese' },
    lead: { base: 85, variation: 25, pattern: 'atmospheric' }
  },
  HIPHOP: {
    kick: { base: 110, variation: 15, pattern: 'boom-bap' },
    snare: { base: 100, variation: 20, pattern: 'loose' },
    hihat: { base: 70, variation: 35, pattern: 'swing-16th' },
    bass: { base: 95, variation: 15, pattern: 'sub-heavy' },
    lead: { base: 80, variation: 30, pattern: 'sample-based' }
  },
  TRAP: {
    kick: { base: 127, variation: 8, pattern: '808-long' },
    snare: { base: 120, variation: 10, pattern: 'roll-heavy' },
    hihat: { base: 85, variation: 40, pattern: 'rapid-fire' },
    bass: { base: 127, variation: 5, pattern: '808-slide' },
    lead: { base: 90, variation: 20, pattern: 'melodic-arpeggio' }
  },
  AMBIENT: {
    kick: { base: 80, variation: 30, pattern: 'sparse' },
    snare: { base: 70, variation: 25, pattern: 'soft' },
    hihat: { base: 50, variation: 30, pattern: 'evolving' },
    bass: { base: 75, variation: 20, pattern: 'pad-like' },
    lead: { base: 65, variation: 35, pattern: 'textural' }
  }
};

export type GenreType = keyof typeof GENRE_VELOCITY_PROFILES;

/**
 * Generate a velocity-aware drum pattern
 */
export function generateDrumPattern(
  trackIndex: number,
  genre: GenreType,
  density: number = 0.5,
  humanize: boolean = true
): TrackPattern {
  const pattern: TrackPattern = [];
  const profile = GENRE_VELOCITY_PROFILES[genre];

  // Track names to profile keys
  const trackNames = ['kick', 'snare', 'snare', 'hihat', 'bass', 'lead', 'pad'];
  const trackName = trackNames[trackIndex] || 'kick';
  const settings = profile[trackName as keyof typeof profile] || profile.kick;

  for (let step = 0; step < 32; step++) {
    const note: NoteData = {
      active: false,
      velocity: 0,
      pitch: DRUM_PITCHES.kick,
      duration: 1,
      pan: 0,
      expression: 1.0
    };

    // Determine if this step should be active based on density and pattern
    const shouldTrigger = shouldTriggerStep(step, trackIndex, settings.pattern, density);

    if (shouldTrigger) {
      note.active = true;

      // Calculate velocity based on position and settings
      let velocity = settings.base;

      // Apply pattern-specific velocity variations
      velocity = applyPatternVelocity(velocity, step, settings.pattern);

      // Humanize if requested
      if (humanize) {
        velocity = humanizeVelocity(velocity, settings.variation / 127);
      }

      note.velocity = Math.max(1, Math.min(127, Math.round(velocity)));

      // Set pitch based on track
      note.pitch = getDrumPitch(trackIndex, step);
    }

    pattern.push(note);
  }

  return pattern;
}

/**
 * Generate a melodic pattern with velocity
 */
export function generateMelodicPattern(
  trackIndex: number,
  genre: GenreType,
  scale: string,
  density: number = 0.3,
  humanize: boolean = true
): TrackPattern {
  const pattern: TrackPattern = [];
  const scaleNotes = SCALE_TO_MIDI[scale as keyof typeof SCALE_TO_MIDI] || SCALE_TO_MIDI.minor;
  const profile = GENRE_VELOCITY_PROFILES[genre];

  const trackNames = ['kick', 'snare', 'snare', 'hihat', 'bass', 'lead', 'pad'];
  const trackName = trackNames[trackIndex] || 'lead';
  const settings = profile[trackName as keyof typeof profile] || profile.lead;

  // Generate melodic contour
  const melodyContour = generateMelodyContour(32, genre);

  for (let step = 0; step < 32; step++) {
    const note: NoteData = {
      active: false,
      velocity: 0,
      pitch: 60,
      duration: 1,
      pan: 0,
      expression: 1.0
    };

    // Determine if this step should trigger
    if (Math.random() < density && melodyContour[step] > 0) {
      note.active = true;

      // Velocity based on melodic contour and settings
      let velocity = settings.base * melodyContour[step];

      if (humanize) {
        velocity = humanizeVelocity(velocity, settings.variation / 127);
      }

      note.velocity = Math.max(1, Math.min(127, Math.round(velocity)));

      // Pick a note from the scale
      const scaleIndex = (step + Math.floor(Math.random() * scaleNotes.length)) % scaleNotes.length;
      note.pitch = scaleNotes[scaleIndex];

      // Duration based on note type
      if (trackName === 'bass') {
        note.duration = Math.random() > 0.7 ? 2 : 1;
      } else if (trackName === 'pad') {
        note.duration = 4; // Longer for pads
      } else {
        note.duration = 1;
      }
    }

    pattern.push(note);
  }

  return pattern;
}

/**
 * Generate full pattern with velocity
 */
export function generateFullPatternWithVelocity(
  genre: GenreType,
  scale: string,
  density: number = 0.5,
  humanize: boolean = true
): FullPattern {
  const pattern = createEmptyFullPattern();

  for (let track = 0; track < 7; track++) {
    if (track < 4) {
      // Drum tracks
      pattern[track] = generateDrumPattern(track, genre, density, humanize);
    } else {
      // Melodic tracks
      pattern[track] = generateMelodicPattern(track, genre, scale, density * 0.7, humanize);
    }
  }

  log.info(`[VELOCITY] Generated ${genre} pattern with velocity for ${scale} scale`);
  return pattern;
}

/**
 * Determine if a step should trigger based on pattern type
 */
function shouldTriggerStep(
  step: number,
  trackIndex: number,
  patternType: string,
  density: number
): boolean {
  const stepInBar = step % 16;
  const bar = Math.floor(step / 16);

  // Base probability from density
  let probability = density;

  switch (patternType) {
    case 'four-on-floor':
      // Kick on 1, 5, 9, 13
      if (trackIndex === 0) {
        return stepInBar % 4 === 0;
      }
      break;

    case 'backbeat':
      // Snare on 5, 13
      return stepInBar === 4 || stepInBar === 12;

    case 'steady-8th':
      return stepInBar % 2 === 0 && Math.random() < density;

    case 'offbeat':
      return stepInBar % 2 === 1 && Math.random() < density;

    case 'syncopated':
      // DnB-style syncopation
      const dnbPattern = [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0];
      return dnbPattern[stepInBar] === 1;

    case 'breakbeat':
      // Classic breakbeat pattern
      const breakPattern = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0];
      return breakPattern[stepInBar] === 1;

    case 'swing-16th':
      // Swing feel
      const swingPattern = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0];
      return swingPattern[stepInBar] === 1;

    case 'boom-bap':
      const boomBap = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0];
      return boomBap[stepInBar] === 1;

    case '808-long':
      // Trap-style long 808s
      if (stepInBar === 0) return true;
      if (stepInBar === 8 && Math.random() < 0.5) return true;
      return false;

    case 'rapid-fire':
      // Fast hi-hats
      return Math.random() < density * 1.5;

    case 'sparse':
      // Ambient - very sparse
      return Math.random() < density * 0.3;

    case 'evolving':
      // Evolving pattern
      const evolution = Math.sin(bar * 0.5) * 0.5 + 0.5;
      return Math.random() < density * evolution;
  }

  // Default: random based on density
  return Math.random() < density;
}

/**
 * Apply pattern-specific velocity variations
 */
function applyPatternVelocity(baseVelocity: number, step: number, patternType: string): number {
  const stepInBar = step % 16;

  switch (patternType) {
    case 'four-on-floor':
      // Slight emphasis on downbeats
      if (stepInBar === 0) return baseVelocity;
      if (stepInBar % 4 === 0) return baseVelocity * 0.95;
      return baseVelocity * 0.9;

    case 'backbeat':
      // Strong snare on 2 and 4
      if (stepInBar === 4 || stepInBar === 12) return baseVelocity;
      return baseVelocity * 0.7;

    case 'driving':
      // Building intensity
      return baseVelocity * (0.85 + (stepInBar / 16) * 0.15);

    case 'deep':
      // Consistent, slightly softer
      return baseVelocity * 0.9;

    case 'complex-16th':
      // Varying dynamics
      const accentPattern = [1, 0.6, 0.8, 0.5, 0.9, 0.5, 0.7, 0.4];
      return baseVelocity * (accentPattern[stepInBar % 8] || 0.7);

    case 'swing-16th':
      // Swing dynamics
      const swingAccent = [1, 0.5, 0.7, 0.5];
      return baseVelocity * (swingAccent[stepInBar % 4] || 0.6);

    default:
      return baseVelocity;
  }
}

/**
 * Get drum pitch based on track
 */
function getDrumPitch(trackIndex: number, step: number): number {
  switch (trackIndex) {
    case 0: return DRUM_PITCHES.kick;
    case 1: return DRUM_PITCHES.snare;
    case 2: return DRUM_PITCHES.clap;
    case 3:
      // Alternating open/closed hi-hat
      return step % 2 === 0 ? DRUM_PITCHES.hihat : DRUM_PITCHES.openHiHat;
    default:
      return DRUM_PITCHES.kick;
  }
}

/**
 * Generate melody contour (0-1 values for each step)
 */
function generateMelodyContour(steps: number, genre: GenreType): number[] {
  const contour: number[] = [];

  for (let i = 0; i < steps; i++) {
    let value = 0.5;

    switch (genre) {
      case 'TECHNO':
      case 'HOUSE':
        // Repetitive with builds
        value = 0.6 + Math.sin(i * 0.1) * 0.3;
        break;

      case 'DNB':
        // Complex, breakbeat-like
        value = 0.3 + Math.random() * 0.5 + Math.sin(i * 0.2) * 0.2;
        break;

      case 'HIPHOP':
      case 'TRAP':
        // Groove-based
        const groovePattern = [0.8, 0.3, 0.5, 0.4, 0.9, 0.2, 0.6, 0.3];
        value = groovePattern[i % 8] || 0.5;
        break;

      case 'AMBIENT':
        // Very smooth, evolving
        value = 0.3 + Math.sin(i * 0.05) * 0.2 + Math.sin(i * 0.02) * 0.2;
        break;
    }

    contour.push(Math.max(0, Math.min(1, value)));
  }

  return contour;
}

/**
 * Convert NoteData pattern to legacy format (for backward compatibility)
 */
export function toLegacyPattern(pattern: FullPattern): number[][] {
  return pattern.map(track =>
    track.map(note => {
      if (!note.active) return 0;
      // Encode velocity info in value
      if (note.velocity < 60) return 2;  // Ghost
      if (note.velocity < 90) return 1;  // Normal
      return 1; // Always return 1 for active notes in legacy format
    })
  );
}

/**
 * Convert legacy pattern to NoteData pattern
 */
export function fromLegacyPattern(legacy: number[][]): FullPattern {
  const pattern = createEmptyFullPattern();

  for (let track = 0; track < Math.min(legacy.length, 7); track++) {
    for (let step = 0; step < Math.min(legacy[track].length, 32); step++) {
      const value = legacy[track][step];
      if (value > 0) {
        pattern[track][step] = {
          active: true,
          velocity: value === 2 ? 60 : value === 3 ? 40 : 100,
          pitch: 60,
          duration: value === 3 ? 0.5 : 1,
          pan: 0,
          expression: 1.0
        };
      }
    }
  }

  return pattern;
}

// Export for global access
(window as any).velocityGenerator = {
  generateDrumPattern,
  generateMelodicPattern,
  generateFullPatternWithVelocity,
  toLegacyPattern,
  fromLegacyPattern
};
