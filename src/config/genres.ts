/**
 * NEXUS-X Genre Configuration
 * All supported genres with their audio characteristics
 */

import type { GenreConfig, ScaleType, KitType } from '../types/index';

export interface GenreDefinition extends GenreConfig {
    name: string;
    description: string;
}

/**
 * All supported genres with their configurations
 */
export const GENRES: Record<string, GenreDefinition> = {
    'SYNTHWAVE': {
        name: 'Synthwave',
        description: '80s inspired electronic music with vintage synths',
        bpmRange: [100, 115],
        scale: 'minor' as ScaleType,
        kit: 'NEON' as KitType,
        arpLead: false,
        progressions: [[0, 2, 4, 1], [0, 4, 2, 3]]
    },
    'TECHNO': {
        name: 'Techno',
        description: 'Driving 4/4 beats with repetitive patterns',
        bpmRange: [130, 142],
        scale: 'phrygian' as ScaleType,
        kit: 'GLITCH' as KitType,
        arpLead: true,
        progressions: [[0, 0, 1, 0], [0, -1, 0, 2]]
    },
    'TRAP': {
        name: 'Trap',
        description: 'Heavy 808s and hi-hat rolls',
        bpmRange: [140, 160],
        scale: 'harmonicMinor' as ScaleType,
        kit: 'ACID' as KitType,
        arpLead: false,
        progressions: [[0, 0, 2, -1], [0, 1, 0, 4]]
    },
    'AMBIENT': {
        name: 'Ambient',
        description: 'Atmospheric soundscapes and textures',
        bpmRange: [70, 90],
        scale: 'lydian' as ScaleType,
        kit: 'ETHEREAL' as KitType,
        arpLead: true,
        progressions: [[0, 2, 4, 6], [0, 1, 2, 3]]
    },
    'LOFI': {
        name: 'Lo-Fi',
        description: 'Chill beats with vinyl warmth',
        bpmRange: [75, 95],
        scale: 'dorian' as ScaleType,
        kit: 'VINYL' as KitType,
        arpLead: false,
        progressions: [[0, -1, -2, -3], [0, 2, 1, -1]]
    },
    'HOUSE': {
        name: 'House',
        description: 'Four-on-the-floor dance music',
        bpmRange: [120, 128],
        scale: 'mixolydian' as ScaleType,
        kit: 'CLUB' as KitType,
        arpLead: false,
        progressions: [[0, 2, 4, 2], [0, 3, 2, 1]]
    },
    'DNB': {
        name: 'Drum & Bass',
        description: 'Fast breakbeats and heavy bass',
        bpmRange: [165, 175],
        scale: 'phrygianDominant' as ScaleType,
        kit: 'GLITCH' as KitType,
        arpLead: true,
        progressions: [[0, 2, 0, 1], [0, 0, 0, -1]]
    },
    'CYBERPUNK': {
        name: 'Cyberpunk',
        description: 'Dark futuristic industrial sounds',
        bpmRange: [100, 110],
        scale: 'diminishedHw' as ScaleType,
        kit: 'ACID' as KitType,
        arpLead: true,
        progressions: [[0, 1, 0, 3], [0, -1, -2, 0]]
    },
    'DUBSTEP': {
        name: 'Dubstep',
        description: 'Heavy drops and wobble bass',
        bpmRange: [140, 150],
        scale: 'phrygian' as ScaleType,
        kit: 'ACID' as KitType,
        arpLead: false,
        progressions: [[0, 0, -1, 0], [0, 1, 0, -2]]
    },
    'SYNTHPOP': {
        name: 'Synth Pop',
        description: 'Catchy electronic pop music',
        bpmRange: [110, 125],
        scale: 'ionian' as ScaleType,
        kit: 'NEON' as KitType,
        arpLead: false,
        progressions: [[0, 4, 5, 3], [0, 2, 4, 5]]
    },
    'RETROWAVE': {
        name: 'Retro Wave',
        description: 'Nostalgic 80s vibes',
        bpmRange: [80, 95],
        scale: 'dorian' as ScaleType,
        kit: 'VINYL' as KitType,
        arpLead: true,
        progressions: [[0, -2, -4, -2], [0, 4, 2, 0]]
    },
    'TRANCE': {
        name: 'Trance',
        description: 'Uplifting melodic electronic music',
        bpmRange: [135, 142],
        scale: 'aeolian' as ScaleType,
        kit: 'CLUB' as KitType,
        arpLead: true,
        progressions: [[0, -2, 0, 2], [0, 3, 4, 1]]
    },
    'INDUSTRIAL': {
        name: 'Industrial',
        description: 'Harsh mechanical sounds and rhythms',
        bpmRange: [150, 175],
        scale: 'locrian' as ScaleType,
        kit: 'INDUSTRIAL' as KitType,
        arpLead: true,
        progressions: [[0, 1, 0, 1], [0, 0, 0, -1]]
    },
    'ETHEREAL': {
        name: 'Ethereal',
        description: 'Dreamy atmospheric soundscapes',
        bpmRange: [65, 85],
        scale: 'lydianAugmented' as ScaleType,
        kit: 'ETHEREAL' as KitType,
        arpLead: true,
        progressions: [[0, 1, 2, 3], [0, 2, 4, 6]]
    },
    'CHIPTUNE': {
        name: 'Chiptune',
        description: '8-bit video game sounds',
        bpmRange: [120, 140],
        scale: 'nesMajor' as ScaleType,
        kit: 'CHIPTUNE' as KitType,
        arpLead: true,
        progressions: [[0, 3, 4, 0], [0, 2, 0, 4]]
    },
    'CINEMATIC': {
        name: 'Cinematic',
        description: 'Epic film score style',
        bpmRange: [60, 80],
        scale: 'interstellar' as ScaleType,
        kit: 'CINEMATIC' as KitType,
        arpLead: false,
        progressions: [[0, -2, -4, -2], [0, 2, 0, -2]]
    },
    'DUNGEONSYNTH': {
        name: 'Dungeon Synth',
        description: 'Medieval fantasy atmospheres',
        bpmRange: [60, 85],
        scale: 'dorianSharp4' as ScaleType,
        kit: 'DUNGEON' as KitType,
        arpLead: true,
        progressions: [[0, 1, -2, 2], [0, -1, -3, 0]]
    },
    'PHONK': {
        name: 'Phonk',
        description: 'Dark Memphis rap inspired beats',
        bpmRange: [130, 160],
        scale: 'phrygian' as ScaleType,
        kit: 'PHONK' as KitType,
        arpLead: false,
        progressions: [[0, 0, -2, 0], [0, -1, 0, -3]]
    }
};

/**
 * Get all genre names
 */
export function getGenreNames(): string[] {
    return Object.keys(GENRES);
}

/**
 * Get a genre configuration
 */
export function getGenre(name: string): GenreDefinition | undefined {
    return GENRES[name];
}

/**
 * Default genre
 */
export const DEFAULT_GENRE = 'SYNTHWAVE';
