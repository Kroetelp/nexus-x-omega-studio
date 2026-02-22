/**
 * NEXUS-X Note Data System
 *
 * Piano Roll Pro - Velocity, Pitch, Duration per Note
 * Compatible with MIDI standard (0-127)
 */

// Single note data structure
export interface NoteData {
  active: boolean;       // Note on/off
  velocity: number;      // 0-127 (MIDI standard)
  pitch: number;         // 0-127 (MIDI note number, 60 = C4)
  duration: number;      // In steps (1 = 16th, 4 = quarter)
  pan?: number;          // -1 to 1 (stereo position)
  expression?: number;   // 0-1 (additional modulation)
}

// Track pattern (32 steps)
export type TrackPattern = NoteData[];

// Full pattern (7 tracks x 32 steps)
export type FullPattern = TrackPattern[];

// Velocity presets for common drum patterns
export const VELOCITY_PRESETS = {
  // Human-like velocity variations
  HUMAN: {
    kick: [100, 95, 90, 85, 100, 95, 90, 85],
    snare: [110, 100, 105, 95],
    hihat: [80, 60, 70, 50, 75, 55, 65, 45],
  },

  // Electronic/Techno (consistent)
  ELECTRONIC: {
    kick: [127, 127, 127, 127],
    snare: [120, 120, 120, 120],
    hihat: [90, 90, 90, 90],
  },

  // Acoustic feel (more variation)
  ACOUSTIC: {
    kick: [90, 75, 85, 70, 95, 80, 88, 72],
    snare: [100, 85, 95, 80],
    hihat: [70, 50, 60, 40, 75, 55, 65, 45],
  },

  // Ghost notes pattern (jazz/funk)
  GHOST: {
    kick: [100, 40, 80, 35],
    snare: [110, 30, 95, 25],
    hihat: [80, 30, 70, 25, 75, 35, 65, 20],
  }
};

// MIDI note numbers for common drums (General MIDI)
export const DRUM_PITCHES = {
  kick: 36,      // C1
  snare: 38,     // D1
  clap: 39,      // D#1
  hihat: 42,     // F#1
  openHiHat: 46, // A#1
  tom1: 48,      // C2
  tom2: 45,      // A1
  crash: 49,     // C#2
  ride: 51,      // D#2
};

// Scale to MIDI note mapping
export const SCALE_TO_MIDI = {
  // C major scale starting from C3 (48)
  major: [48, 50, 52, 53, 55, 57, 59, 60],
  minor: [48, 50, 51, 53, 55, 56, 58, 60],
  pentatonic: [48, 50, 52, 55, 57, 60, 62, 64],
  blues: [48, 51, 53, 54, 55, 58, 60],
  dorian: [48, 50, 51, 53, 55, 57, 58, 60],
  phrygian: [48, 49, 51, 53, 55, 56, 58, 60],
  lydian: [48, 50, 52, 54, 55, 57, 59, 60],
  mixolydian: [48, 50, 52, 53, 55, 57, 58, 60],
  locrian: [48, 49, 51, 53, 54, 56, 58, 60],
};

/**
 * Create empty note data
 */
export function createEmptyNote(): NoteData {
  return {
    active: false,
    velocity: 100,
    pitch: 60,
    duration: 1,
    pan: 0,
    expression: 1.0
  };
}

/**
 * Create empty track pattern (32 steps)
 */
export function createEmptyTrackPattern(): TrackPattern {
  return Array(32).fill(null).map(() => createEmptyNote());
}

/**
 * Create empty full pattern (7 tracks)
 */
export function createEmptyFullPattern(): FullPattern {
  return Array(7).fill(null).map(() => createEmptyTrackPattern());
}

/**
 * Convert legacy pattern (0/1) to NoteData pattern
 */
export function convertLegacyPattern(legacy: number[][]): FullPattern {
  const pattern = createEmptyFullPattern();

  for (let track = 0; track < Math.min(legacy.length, 7); track++) {
    for (let step = 0; step < Math.min(legacy[track].length, 32); step++) {
      if (legacy[track][step] === 1) {
        pattern[track][step] = {
          active: true,
          velocity: 100,
          pitch: 60,
          duration: 1,
          pan: 0,
          expression: 1.0
        };
      }
    }
  }

  return pattern;
}

/**
 * Convert NoteData pattern to legacy format (for backward compatibility)
 */
export function toLegacyPattern(pattern: FullPattern): number[][] {
  return pattern.map(track =>
    track.map(note => note.active ? 1 : 0)
  );
}

/**
 * Apply velocity humanization (random variation)
 */
export function humanizeVelocity(velocity: number, amount: number = 0.1): number {
  const variation = (Math.random() - 0.5) * 2 * amount * 127;
  return Math.max(1, Math.min(127, Math.round(velocity + variation)));
}

/**
 * Apply accent pattern to velocities
 */
export function applyAccentPattern(
  pattern: TrackPattern,
  accents: number[] // Array of 0-1 multipliers per step
): TrackPattern {
  return pattern.map((note, i) => ({
    ...note,
    velocity: Math.round(note.velocity * (accents[i % accents.length] || 1))
  }));
}

/**
 * Generate velocity curve for a track
 */
export function generateVelocityCurve(
  steps: number,
  style: 'flat' | 'buildup' | 'drop' | 'wave' | 'random'
): number[] {
  const velocities: number[] = [];

  for (let i = 0; i < steps; i++) {
    switch (style) {
      case 'flat':
        velocities.push(100);
        break;

      case 'buildup':
        // Crescendo from 60 to 127
        velocities.push(Math.round(60 + (67 * i / steps)));
        break;

      case 'drop':
        // Decrescendo from 127 to 60
        velocities.push(Math.round(127 - (67 * i / steps)));
        break;

      case 'wave':
        // Sinusoidal velocity
        velocities.push(Math.round(90 + 30 * Math.sin(i * Math.PI / 8)));
        break;

      case 'random':
        // Random between 70-120
        velocities.push(Math.round(70 + Math.random() * 50));
        break;
    }
  }

  return velocities;
}

/**
 * Get velocity color for UI display (green to red gradient)
 */
export function velocityToColor(velocity: number): string {
  const normalized = velocity / 127;

  if (normalized < 0.5) {
    // Green to Yellow
    const r = Math.round(normalized * 2 * 255);
    const g = 200;
    return `rgb(${r}, ${g}, 0)`;
  } else {
    // Yellow to Red
    const g = Math.round((1 - normalized) * 2 * 200);
    const r = 255;
    return `rgb(${r}, ${g}, 0)`;
  }
}

/**
 * MIDI Note number to note name
 */
export function midiToNoteName(midi: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = notes[midi % 12];
  return `${note}${octave}`;
}

/**
 * Note name to MIDI number
 */
export function noteNameToMidi(name: string): number {
  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60; // Default to C4

  const notes: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };

  const note = notes[match[1]] ?? 0;
  const octave = parseInt(match[2], 10);

  return (octave + 1) * 12 + note;
}
