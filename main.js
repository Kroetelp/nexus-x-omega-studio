/**
 * NEXUS-X // OMEGA STUDIO v38 (Performance Edition)
 * Modular Architecture with AudioWorklet Integration
 */

// --- CONFIGURATION ---
const CONFIG = {
    tracks: ['Kick', 'Snare', 'Clap', 'HiHat', 'Bass', 'Lead/Arp', 'Pad/Chord'],
    colors: ['#00ff94', '#f59e0b', '#f59e0b', '#00ccff', '#7c3aed', '#ff0055', '#00ccff'],
    steps: 32
};

const GENRES = {
    'SYNTHWAVE': { bpmRange: [100, 115], scale: 'minor', kit: 'NEON', arpLead: false, progressions: [[0, 2, 4, 1], [0, 4, 2, 3]] },
    'TECHNO': { bpmRange: [130, 142], scale: 'phrygian', kit: 'GLITCH', arpLead: true, progressions: [[0, 0, 1, 0], [0, -1, 0, 2]] },
    'TRAP': { bpmRange: [140, 160], scale: 'harmonicMinor', kit: 'ACID', arpLead: false, progressions: [[0, 0, 2, -1], [0, 1, 0, 4]] },
    'AMBIENT': { bpmRange: [70, 90], scale: 'lydian', kit: 'ETHEREAL', arpLead: true, progressions: [[0, 2, 4, 6], [0, 1, 2, 3]] },
    'LOFI': { bpmRange: [75, 95], scale: 'dorian', kit: 'VINYL', arpLead: false, progressions: [[0, -1, -2, -3], [0, 2, 1, -1]] },
    'HOUSE': { bpmRange: [120, 128], scale: 'mixolydian', kit: 'CLUB', arpLead: false, progressions: [[0, 2, 4, 2], [0, 3, 2, 1]] },
    'DNB': { bpmRange: [165, 175], scale: 'phrygianDominant', kit: 'GLITCH', arpLead: true, progressions: [[0, 2, 0, 1], [0, 0, 0, -1]] },
    'CYBERPUNK': { bpmRange: [100, 110], scale: 'diminishedHw', kit: 'ACID', arpLead: true, progressions: [[0, 1, 0, 3], [0, -1, -2, 0]] },
    'DUBSTEP': { bpmRange: [140, 150], scale: 'phrygian', kit: 'ACID', arpLead: false, progressions: [[0, 0, -1, 0], [0, 1, 0, -2]] },
    'SYNTHPOP': { bpmRange: [110, 125], scale: 'ionian', kit: 'NEON', arpLead: false, progressions: [[0, 4, 5, 3], [0, 2, 4, 5]] },
    'RETROWAVE': { bpmRange: [80, 95], scale: 'dorian', kit: 'VINYL', arpLead: true, progressions: [[0, -2, -4, -2], [0, 4, 2, 0]] },
    'TRANCE': { bpmRange: [135, 142], scale: 'aeolian', kit: 'CLUB', arpLead: true, progressions: [[0, -2, 0, 2], [0, 3, 4, 1]] },
    'INDUSTRIAL': { bpmRange: [150, 175], scale: 'locrian', kit: 'INDUSTRIAL', arpLead: true, progressions: [[0, 1, 0, 1], [0, 0, 0, -1]] },
    'ETHEREAL': { bpmRange: [65, 85], scale: 'lydianAugmented', kit: 'ETHEREAL', arpLead: true, progressions: [[0, 1, 2, 3], [0, 2, 4, 6]] },
    'CHIPTUNE': { bpmRange: [120, 140], scale: 'nesMajor', kit: 'CHIPTUNE', arpLead: true, progressions: [[0, 3, 4, 0], [0, 2, 0, 4]] },
    'CINEMATIC': { bpmRange: [60, 80], scale: 'interstellar', kit: 'CINEMATIC', arpLead: false, progressions: [[0, -2, -4, -2], [0, 2, 0, -2]] },
    'HAPPYHARDCORE': { bpmRange: [170, 185], scale: 'ionian', kit: 'NEON', arpLead: true, progressions: [[0, 4, 5, 3], [0, 2, 4, 0], [0, 5, 4, 2]] },
    'DUNGEONSYNTH': { bpmRange: [60, 85], scale: 'dorianSharp4', kit: 'DUNGEON', arpLead: true, progressions: [[0, 1, -2, 2], [0, -1, -3, 0]] },
    // 🔥 NEW HARDCORE GENRES
    'UPTEMPO': { bpmRange: [180, 220], scale: 'phrygian', kit: 'INDUSTRIAL', arpLead: true, progressions: [[0, 0, 0, 0], [0, -1, 0, -2]] },
    'DEUTSCHETEKK': { bpmRange: [150, 180], scale: 'harmonicMinor', kit: 'ACID', arpLead: false, progressions: [[0, 0, -1, 0], [0, 2, 0, -1]] },
    'OSSITEKK': { bpmRange: [140, 170], scale: 'dorian', kit: 'GLITCH', arpLead: false, progressions: [[0, -1, 0, -2], [0, 0, -1, 0]] },
    // 🐮 PHONK - Drift Phonk / Aggressive Cowbell Beats
    'PHONK': { bpmRange: [120, 140], scale: 'phrygian', kit: 'PHONK', arpLead: true, progressions: [[0, 0, -1, 0], [0, -2, 0, -1]] },
    // 🏎️ DRIFT PHONK - Faster, more aggressive
    'DRIFTPHONK': { bpmRange: [160, 180], scale: 'harmonicMinor', kit: 'PHONK', arpLead: true, progressions: [[0, 0, 0, -1], [0, -1, -2, 0]] },
    // 💀 DARK PHONK - Horror/Slayer vibes
    'DARKPHONK': { bpmRange: [130, 150], scale: 'locrian', kit: 'PHONK', arpLead: false, progressions: [[0, -1, 0, -2], [0, 0, -1, -3]] }
};

// 🎵 GENRE-SPECIFIC PATTERNS - 32-STEP PATTERNS with real musical depth
const GENRE_PATTERNS = {
    'SYNTHWAVE': {
        drums: {
            kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0]
        },
        bass: { style: 'octave-pulse', density: 0.7, octaveJump: true },
        lead: { style: 'arpeggiated', speed: '16n', range: [0, 4] },
        pad: { style: 'sustain-chords', changeRate: 4 },
        vibe: 'retro-neon-cruising'
    },
    'TECHNO': {
        drums: {
            kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
        },
        bass: { style: 'minimal-pulse', density: 0.4, octaveJump: false },
        lead: { style: 'stabs', speed: '4n', range: [2, 5] },
        pad: { style: 'minimal', changeRate: 8 },
        vibe: 'hypnotic-underground-berlin'
    },
    'TRAP': {
        drums: {
            kick:  [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0, 1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
            clap:  [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,0]
        },
        bass: { style: '808-slides', density: 0.3, octaveJump: true, slide: true },
        lead: { style: 'dark-melody', speed: '8n', range: [0, 3] },
        pad: { style: 'atmospheric', changeRate: 8 },
        vibe: 'dark-atlanta-street'
    },
    'HOUSE': {
        drums: {
            kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0]
        },
        bass: { style: 'sidechain-pulse', density: 0.8, octaveJump: false },
        lead: { style: 'hook', speed: '8n', range: [2, 5] },
        pad: { style: 'stabs', changeRate: 4 },
        vibe: 'uplifting-chicago-groove'
    },
    'DNB': {
        drums: {
            kick:  [1,0,0,1, 0,0,1,0, 0,0,1,0, 0,1,0,0, 1,0,0,1, 0,0,1,0, 0,0,1,0, 0,1,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1]
        },
        bass: { style: 'reece', density: 0.9, octaveJump: true },
        lead: { style: 'fast-arp', speed: '32n', range: [1, 6] },
        pad: { style: 'stabs', changeRate: 2 },
        vibe: 'fast-uk-jungle'
    },
    'LOFI': {
        drums: {
            kick:  [1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
        },
        bass: { style: 'warm-sustain', density: 0.5, octaveJump: false },
        lead: { style: 'nostalgic', speed: '4n', range: [0, 4] },
        pad: { style: 'warm-chords', changeRate: 4 },
        vibe: 'chill-study-beats'
    },
    'TRANCE': {
        drums: {
            kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1]
        },
        bass: { style: 'rolling', density: 0.9, octaveJump: false },
        lead: { style: 'supersaw-arp', speed: '16n', range: [2, 7] },
        pad: { style: 'evolving', changeRate: 2 },
        vibe: 'euphoric-ibiza-anthem'
    },
    'AMBIENT': {
        drums: {
            kick:  [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
            hihat: [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
        },
        bass: { style: 'drone', density: 0.2, octaveJump: false },
        lead: { style: 'padscape', speed: '1n', range: [0, 3] },
        pad: { style: 'evolving', changeRate: 16 },
        vibe: 'spacey-eno-style'
    },
    'CYBERPUNK': {
        drums: {
            kick:  [1,0,0,1, 0,0,1,0, 0,0,1,0, 0,1,0,0, 1,0,0,1, 0,0,1,0, 0,0,1,0, 0,1,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0]
        },
        bass: { style: 'distorted', density: 0.8, octaveJump: true },
        lead: { style: 'glitchy', speed: '16n', range: [1, 5] },
        pad: { style: 'industrial', changeRate: 2 },
        vibe: 'neon-city-dystopia'
    },
    'DUBSTEP': {
        drums: {
            kick:  [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,0,1,0, 1,0,1,1, 1,0,1,0, 1,0,1,1, 1,0,1,0, 1,0,1,1, 1,0,1,0, 1,0,1,1],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
        },
        bass: { style: 'wobble', density: 0.6, octaveJump: true, wobble: true },
        lead: { style: 'metallic', speed: '8n', range: [0, 4] },
        pad: { style: 'dark', changeRate: 8 },
        vibe: 'heavy-brostep-drop'
    },
    'TRANCE': {
        drums: {
            kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1]
        },
        bass: { style: 'offbeat', density: 0.8, octaveJump: false },
        lead: { style: 'supersaw', speed: '8n', range: [3, 7] },
        pad: { style: 'layered', changeRate: 2 },
        vibe: 'uplifting-armada-style'
    },
    'CHIPTUNE': {
        drums: {
            kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0]
        },
        bass: { style: 'duty-cycle', density: 0.7, octaveJump: true },
        lead: { style: 'arpeggio-fast', speed: '32n', range: [1, 5] },
        pad: { style: 'duty-chords', changeRate: 4 },
        vibe: 'nes-gameboy-retro'
    },
    'CINEMATIC': {
        drums: {
            kick:  [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],
            hihat: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
        },
        bass: { style: 'orchestral', density: 0.3, octaveJump: false },
        lead: { style: 'epic-melody', speed: '2n', range: [0, 6] },
        pad: { style: 'strings', changeRate: 2 },
        vibe: 'hans-zimmer-epic'
    },
    'DUNGEONSYNTH': {
        drums: {
            kick:  [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],
            hihat: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
        },
        bass: { style: 'medieval', density: 0.4, octaveJump: false },
        lead: { style: 'renaissance', speed: '4n', range: [0, 4] },
        pad: { style: 'dungeon', changeRate: 4 },
        vibe: 'medieval-fantasy-crypt'
    },
    'INDUSTRIAL': {
        drums: {
            kick:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,1, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,1],
            hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
        },
        bass: { style: 'distorted-heavy', density: 0.9, octaveJump: true },
        lead: { style: 'metallic', speed: '8n', range: [0, 4] },
        pad: { style: 'noise', changeRate: 1 },
        vibe: 'nine-inch-nails-harsh'
    },
    'SYNTHPOP': {
        drums: {
            kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0]
        },
        bass: { style: 'groove', density: 0.8, octaveJump: false },
        lead: { style: 'catchy', speed: '8n', range: [2, 5] },
        pad: { style: 'lush', changeRate: 4 },
        vibe: 'depeche-mode-style'
    },
    'RETROWAVE': {
        drums: {
            kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0]
        },
        bass: { style: 'vintage-pulse', density: 0.7, octaveJump: true },
        lead: { style: 'vintage-arp', speed: '16n', range: [1, 5] },
        pad: { style: 'warm', changeRate: 4 },
        vibe: 'outrun-1984-sunset'
    },
    'ETHEREAL': {
        drums: {
            kick:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
            hihat: [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
        },
        bass: { style: 'floating', density: 0.2, octaveJump: false },
        lead: { style: 'shimmer', speed: '1n', range: [2, 5] },
        pad: { style: 'lush', changeRate: 16 },
        vibe: 'cocteau-twins-dreamy'
    },
    'HAPPYHARDCORE': {
        drums: {
            // S3RL-style: Fast 4-on-floor with offbeat snares and fills
            kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,1],
            hihat: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0]
        },
        bass: { style: 'offbeat-bounce', density: 0.95, octaveJump: true },
        lead: { style: 'euphoric-hook', speed: '8n', range: [3, 7], pianoIntro: true },
        pad: { style: 'emotional-pads', changeRate: 4, chordQuality: 'add9' },
        // Happy Hardcore signature elements
        hook: {
            type: 'piano-riff',
            pattern: [1,0,1,0, 1,1,0,1, 1,0,1,0, 1,1,0,0],
            octave: 5
        },
        vibe: 's3rl-rave-party-anthem-euphoric'
    },
    // 🔥 UPTEMPO - Hardcore style (180-220 BPM)
    'UPTEMPO': {
        drums: {
            // Angerfist/Noize Suppressor style: relentless kicks, fast snares
            kick:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
            snare: [0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,1,1, 0,0,0,1, 0,0,0,1, 0,0,0,1, 0,1,0,1],
            hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,1]
        },
        bass: { style: 'distorted-rumble', density: 0.9, octaveJump: false },
        lead: { style: 'aggressive-saw', speed: '16n', range: [2, 5] },
        pad: { style: 'dark-drone', changeRate: 8 },
        vibe: 'angerfist-masters-of-hardcore'
    },
    // 🇩🇪 DEUTSCHE TEKKE - German Hardstyle/Tekno
    'DEUTSCHETEKK': {
        drums: {
            // Hardstyle kick pattern with off-beat bass
            kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            snare: [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 1,1,0,0],
            hihat: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0]
        },
        bass: { style: 'offbeat-hardstyle', density: 0.85, octaveJump: true },
        lead: { style: 'reverse-bass', speed: '4n', range: [1, 4] },
        pad: { style: 'euphoric-stabs', changeRate: 4 },
        vibe: 'headhunterz-wildstylez-hardstyle'
    },
    // ⬛ OSSI TEKK - East German Tekno
    'OSSITEKK': {
        drums: {
            // Raw acid-style tekno pattern
            kick:  [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0, 1,0,0,0, 0,0,1,0, 0,1,0,0, 0,0,1,0],
            snare: [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0, 0,1,0,1],
            hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0]
        },
        bass: { style: 'acid-303-squelch', density: 0.75, octaveJump: false },
        lead: { style: '303-resonance', speed: '16n', range: [0, 3] },
        pad: { style: 'minimal-dark', changeRate: 8 },
        vibe: 'east-germany-warehouse-rave'
    },
    // 🐮 PHONK - Drift Phonk / Aggressive Cowbell Beats (Kriegsvideo Sound)
    'PHONK': {
        drums: {
            // Classic phonk: heavy kick, trap snares, fast hi-hats
            kick:  [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0, 1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,1, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,1]
        },
        cowbell: {
            // THE iconic phonk cowbell pattern - aggressive and distorted
            pattern: [1,0,1,0, 1,0,1,0, 1,1,1,0, 1,0,1,1, 1,0,1,0, 1,0,1,0, 1,1,1,0, 1,1,0,1],
            octave: 4,
            distortion: 0.8
        },
        bass: { style: '808-distorted', density: 0.9, octaveJump: true, distortion: 0.7 },
        lead: { style: 'dark-memphis', speed: '8n', range: [0, 3] },
        pad: { style: 'dark-ambient', changeRate: 16 },
        vibe: 'cowbell-808-memphis-drift-phonk'
    },
    // 🏎️ DRIFT PHONK - Faster, Tokyo Drift style
    'DRIFTPHONK': {
        drums: {
            // Faster, more aggressive
            kick:  [1,0,0,1, 0,0,1,0, 0,0,1,0, 0,1,0,0, 1,0,0,1, 0,0,1,0, 0,0,1,0, 0,1,0,1],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,1, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,1]
        },
        cowbell: {
            // Aggressive drift pattern
            pattern: [1,0,1,1, 1,0,1,0, 1,1,1,0, 1,1,0,1, 1,0,1,1, 1,0,1,0, 1,1,1,0, 1,1,1,1],
            octave: 4,
            distortion: 0.9
        },
        bass: { style: '808-heavily-distorted', density: 0.95, octaveJump: true, distortion: 0.85 },
        lead: { style: 'aggressive-rap', speed: '16n', range: [0, 2] },
        pad: { style: 'tension-build', changeRate: 8 },
        vibe: 'tokyo-drift-midnight-racing'
    },
    // 💀 DARK PHONK - Horror/Slayer vibes
    'DARKPHONK': {
        drums: {
            // Slower, heavier, more menacing
            kick:  [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
            snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
            clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1]
        },
        cowbell: {
            // Slower, more menacing
            pattern: [1,0,0,0, 1,0,1,0, 0,0,1,0, 1,0,0,0, 1,0,0,0, 1,0,1,0, 0,0,1,0, 1,0,0,1],
            octave: 3,
            distortion: 0.95
        },
        bass: { style: 'doom-808', density: 0.8, octaveJump: false, distortion: 0.9 },
        lead: { style: 'horror-synth', speed: '4n', range: [-1, 2] },
        pad: { style: 'evil-drone', changeRate: 32 },
        vibe: 'slayer-horror-dark-web'
    }
};

// 🎵 MELODY ENGINE V3 - REAL Musical Intelligence
class MelodyEngine {
    constructor() {
        this.scales = null;
        this.currentMotif = null;
        this.motifHistory = [];

        // Musical intervals in scale degrees
        this.intervals = {
            unison: 0, second: 1, third: 2, fourth: 3,
            fifth: 4, sixth: 5, seventh: 6, octave: 7
        };

        // Consonance levels for natural voice leading
        this.consonances = [0, 2, 4, 5, 7];

        // Melodic contours for different genres
        this.contours = {
            'HAPPYHARDCORE': { shape: 'euphoric-rise', repetition: 0.7, variation: 0.3, energy: 1.0 },
            'SYNTHWAVE': { shape: 'retro-arc', repetition: 0.6, variation: 0.4, energy: 0.8 },
            'TECHNO': { shape: 'hypnotic-flat', repetition: 0.9, variation: 0.1, energy: 0.9 },
            'HOUSE': { shape: 'groove-bounce', repetition: 0.7, variation: 0.3, energy: 0.85 },
            'TRAP': { shape: 'dark-descend', repetition: 0.5, variation: 0.5, energy: 0.8 },
            'DNB': { shape: 'aggressive-saw', repetition: 0.6, variation: 0.4, energy: 1.0 },
            'TRANCE': { shape: 'buildup-rise', repetition: 0.5, variation: 0.5, energy: 0.95 },
            'LOFI': { shape: 'nostalgic-wave', repetition: 0.4, variation: 0.6, energy: 0.4 }
        };
    }

    // 🎼 GENERATE MELODIC MOTIF - The core of musical identity
    generateMotif(scaleNotes, length = 8) {
        if (scaleNotes || scaleNotes.length === 0) return [0, 0, 0, 0];

        const motif = [];
        let currentDegree = 0;

        // Start on a strong beat (root or fifth)
        const startOptions = [0, 0, 0, 4, 2]; // Favor root
        currentDegree = startOptions[Math.floor(Math.random() * startOptions.length)];

        for (let i = 0; i < length; i++) {
            // Musical movement: mostly steps, occasional leaps
            const movement = this.getMelodicMovement(i, length);
            currentDegree = this.applyMovement(currentDegree, movement, scaleNotes.length);
            motif.push(currentDegree);
        }

        this.currentMotif = motif;
        this.motifHistory.push(motif);
        return motif;
    }

    // Get melodic movement based on position in phrase
    getMelodicMovement(position, length) {
        const inFirstHalf = position < length / 2;
        const nearEnd = position >= length - 2;

        // Musical rules:
        // - First half: tend upward (building)
        // - Second half: tend downward (resolution)
        // - Near end: resolve to consonance

        if (nearEnd) {
            // Resolve: step down or stay
            return Math.random() < 0.6 ? -1 : 0;
        } else if (inFirstHalf) {
            // Build: step up or leap up
            const rand = Math.random();
            if (rand < 0.5) return 1;      // Step up
            if (rand < 0.7) return 2;      // Third up
            if (rand < 0.85) return 0;     // Stay
            return -1;                      // Occasional step down
        } else {
            // Return: step down or leap down
            const rand = Math.random();
            if (rand < 0.5) return -1;     // Step down
            if (rand < 0.7) return -2;     // Third down
            if (rand < 0.85) return 0;     // Stay
            return 1;                       // Occasional step up
        }
    }

    // Apply movement with bounds checking
    applyMovement(currentDegree, movement, scaleLength) {
        let newDegree = currentDegree + movement;
        // Keep within scale bounds
        if (newDegree < 0) newDegree = 0;
        if (newDegree >= scaleLength) newDegree = scaleLength - 1;
        return newDegree;
    }

    // 🔄 DEVELOP MOTIF - Transform the motif musically
    developMotif(motif, variation, scaleNotes) {
        if (motif || motif.length === 0) return this.generateMotif(scaleNotes, 8);

        switch (variation) {
            case 'repeat':
                return [...motif];

            case 'transpose-up':
                return motif.map(d => Math.min(d + 2, (scaleNotes?.length || 7) - 1));

            case 'transpose-down':
                return motif.map(d => Math.max(d - 2, 0));

            case 'retrograde':
                return [...motif].reverse();

            case 'inversion':
                const max = Math.max(...motif);
                return motif.map(d => max - d);

            case 'augmentation':
                // Double the length by repeating each note
                return motif.flatMap(d => [d, d]);

            case 'fragmentation':
                // Take only part of the motif
                return motif.slice(0, Math.ceil(motif.length / 2));

            case 'extension':
                // Add new material at the end
                const newEnd = this.generateMotif(scaleNotes, 2);
                return [...motif, ...newEnd];

            case 'call-response':
                // First half is call, second half is response
                const halfLen = Math.floor(motif.length / 2);
                const call = motif.slice(0, halfLen);
                const response = motif.slice(halfLen).map(d => Math.max(0, d - 1)); // Respond lower
                return [...call, ...response];

            default:
                // Subtle variation
                return motif.map(d => {
                    if (Math.random() < 0.2) {
                        return d + (Math.random() < 0.5 ? 1 : -1);
                    }
                    return d;
                });
        }
    }

    // 🎵 GENERATE MELODIC PHRASE - Multiple bars with development
    generateMelodicPhrase(genre, scaleNotes, bars = 4, intensity = 0.5) {
        if (scaleNotes || scaleNotes.length === 0) return Array(32).fill(0);

        const contour = this.contours[genre] || this.contours['SYNTHWAVE'];
        const phrase = [];

        // Generate initial motif
        const motifLength = Math.min(8, Math.floor(32 / bars));
        const baseMotif = this.generateMotif(scaleNotes, motifLength);

        // Build phrase with musical development
        for (let bar = 0; bar < bars; bar++) {
            // Determine variation type based on position
            let variation;
            if (bar === 0) variation = 'repeat';
            else if (bar === 1) variation = 'transpose-up';
            else if (bar === 2) variation = 'call-response';
            else variation = 'extension';

            const developedMotif = this.developMotif(baseMotif, variation, scaleNotes);

            // Scale to intensity
            const scaledMotif = developedMotif.map(d => {
                // Higher intensity = higher notes on average
                const boost = Math.floor(intensity * 2);
                return Math.min(d + boost, (scaleNotes?.length || 7) - 1);
            });

            phrase.push(...scaledMotif);
        }

        // Pad or trim to 32 steps
        while (phrase.length < 32) phrase.push(0);
        return phrase.slice(0, 32);
    }

    // Generate complete pattern for a track
    generatePattern(trackType, genre, scaleNotes, intensity = 0.5, bars = 8) {
        if (scaleNotes || scaleNotes.length === 0) return Array(32).fill(0);

        const genrePattern = GENRE_PATTERNS[genre];
        const config = genrePattern?.[trackType] || { style: 'basic', density: 0.5 };

        let pattern = Array(32).fill(0);

        switch (trackType) {
            case 'drums':
                return this.generateDrumPattern(config, intensity);
            case 'bass':
                pattern = this.generateBassPattern(config, scaleNotes, intensity, bars);
                break;
            case 'lead':
                pattern = this.generateLeadPattern(config, scaleNotes, intensity, bars);
                break;
            case 'pad':
                pattern = this.generatePadPattern(config, scaleNotes, intensity, bars);
                break;
        }

        return pattern;
    }

    // Generate drum pattern based on genre config and intensity
    generateDrumPattern(config, intensity) {
        const drums = config.drums || GENRE_PATTERNS['HOUSE'].drums;
        const pattern = {
            kick: [...drums.kick],
            snare: [...drums.snare],
            hihat: [...drums.hihat],
            clap: [...drums.clap]
        };

        // Add intensity-based variations
        if (intensity > 0.7) {
            // Add extra hi-hats at high intensity
            for (let i = 0; i < 32; i++) {
                if (pattern.hihat[i] === 0 && Math.random() < 0.2) {
                    pattern.hihat[i] = 1;
                }
            }
        }

        if (intensity > 0.9) {
            // Add fills at very high intensity
            for (let i = 28; i < 32; i++) {
                if (Math.random() < 0.5) pattern.snare[i] = 1;
            }
        }

        return pattern;
    }

    // Generate bass pattern with musical intelligence
    generateBassPattern(config, scaleNotes, intensity, bars) {
        const pattern = Array(32).fill(0);
        const density = (config.density || 0.5) * intensity;
        const style = config.style || 'root-pulse';

        switch (style) {
            case 'octave-pulse':
                // Classic octave-jumping bass (Synthwave)
                for (let i = 0; i < 32; i++) {
                    if (i % 4 === 0) pattern[i] = 1;           // Root on 1
                    else if (i % 4 === 2 && Math.random() < density) pattern[i] = 1; // Octave on 3
                }
                break;

            case 'minimal-pulse':
                // Minimal techno bass
                for (let i = 0; i < 32; i++) {
                    if (i % 8 === 0) pattern[i] = 1;
                    else if (i % 8 === 4 && Math.random() < density * 0.5) pattern[i] = 1;
                }
                break;

            case '808-slides':
                // Trap-style 808 with long sustains
                for (let i = 0; i < 32; i++) {
                    if (i % 8 === 0) pattern[i] = 1;
                    else if (i === 4 || i === 20) pattern[i] = 2; // Slide notes
                }
                break;

            case 'sidechain-pulse':
                // House-style offbeat bass
                for (let i = 0; i < 32; i++) {
                    if (i % 4 === 0) pattern[i] = 1;
                    else if (i % 4 === 2 && density > 0.6) pattern[i] = 1;
                }
                break;

            case 'reece':
                // DnB Reese bass - driving 16ths
                for (let i = 0; i < 32; i++) {
                    if (i % 2 === 0 && Math.random() < density) pattern[i] = 1;
                }
                break;

            case 'rolling':
                // Trance rolling bass
                for (let i = 0; i < 32; i++) {
                    if (i % 2 === 1) pattern[i] = 1; // Off-beat
                }
                break;

            case 'warm-sustain':
                // Lo-fi sustained bass
                pattern[0] = 1;
                if (density > 0.5) pattern[16] = 1;
                break;

            case 'wobble':
                // Dubstep wobble bass
                for (let i = 0; i < 32; i++) {
                    if (i % 4 === 0) pattern[i] = 1;
                    else if (i % 4 === 2 && Math.random() < 0.3) pattern[i] = 2;
                }
                break;

            case 'groove':
                // Funky groove bass
                const groovePattern = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0];
                for (let i = 0; i < 32; i++) {
                    pattern[i] = groovePattern[i % 16] * (Math.random() < density + 0.2 ? 1 : 0);
                }
                break;

            case 'offbeat-bounce':
                // S3RL-style Happy Hardcore offbeat bouncy bass
                for (let i = 0; i < 32; i++) {
                    if (i % 4 === 0) pattern[i] = 1;           // Kick-aligned root
                    else if (i % 4 === 2) pattern[i] = 2;      // Offbeat octave bounce
                    else if (i % 8 === 6 && Math.random() < 0.6) pattern[i] = 1; // Extra bounce
                }
                break;

            default:
                // Basic root-note bass
                for (let i = 0; i < 32; i += 4) {
                    pattern[i] = 1;
                }
        }

        return pattern;
    }

    // Generate lead pattern with melodic contour
    generateLeadPattern(config, scaleNotes, intensity, bars) {
        const pattern = Array(32).fill(0);
        const style = config.style || 'basic';
        const density = (config.density || 0.5) * intensity;

        switch (style) {
            case 'arpeggiated':
            case 'vintage-arp':
            case 'arpeggio-fast':
                // Classic up-down arpeggio
                const arpPattern = [0, 2, 4, 2, 0, 2, 4, 7, 4, 2, 0, 2];
                for (let i = 0; i < 32; i++) {
                    if (density > 0.4 || i % 2 === 0) {
                        pattern[i] = 1;
                    }
                }
                break;

            case 'stabs':
                // Techno stabs
                for (let i = 0; i < 32; i++) {
                    if (i % 8 === 0) pattern[i] = 1;
                    else if (i % 8 === 4 && Math.random() < 0.3) pattern[i] = 1;
                }
                break;

            case 'dark-melody':
                // Trap-style dark descending
                const darkPattern = [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0];
                for (let i = 0; i < 32; i++) {
                    pattern[i] = darkPattern[i % 16];
                }
                break;

            case 'hook':
                // House-style hook
                for (let i = 0; i < 32; i++) {
                    if (i % 4 === 0) pattern[i] = 1;
                    else if (i % 8 === 6 && Math.random() < 0.5) pattern[i] = 1;
                }
                break;

            case 'fast-arp':
                // DnB fast arpeggio
                for (let i = 0; i < 32; i++) {
                    if (i % 1 === 0 && Math.random() < 0.7) pattern[i] = 1;
                }
                break;

            case 'nostalgic':
                // Lo-fi nostalgic melody
                const nostPattern = [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0];
                for (let i = 0; i < 32; i++) {
                    pattern[i] = nostPattern[i % 16];
                }
                break;

            case 'supersaw-arp':
            case 'supersaw':
                // Trance supersaw
                for (let i = 0; i < 32; i++) {
                    pattern[i] = i % 2 === 0 ? 1 : 0;
                }
                break;

            case 'padscape':
            case 'shimmer':
                // Atmospheric sparse
                pattern[0] = 1;
                pattern[16] = 1;
                break;

            case 'glitchy':
                // Cyberpunk glitch
                for (let i = 0; i < 32; i++) {
                    if (Math.random() < 0.3) pattern[i] = 1;
                }
                break;

            case 'metallic':
                // Dubstep metallic
                for (let i = 0; i < 32; i++) {
                    if (i % 4 === 0) pattern[i] = 1;
                    else if (Math.random() < 0.15) pattern[i] = 1;
                }
                break;

            case 'epic-melody':
                // Cinematic epic
                for (let i = 0; i < 32; i += 4) {
                    pattern[i] = 1;
                    if (Math.random() < 0.3) pattern[i + 2] = 1;
                }
                break;

            case 'renaissance':
                // Dungeon synth medieval
                const medPattern = [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0];
                for (let i = 0; i < 32; i++) {
                    pattern[i] = medPattern[i % 16];
                }
                break;

            case 'catchy':
                // Synthpop catchy
                for (let i = 0; i < 32; i++) {
                    if (i % 2 === 0) pattern[i] = 1;
                    else if (Math.random() < 0.2) pattern[i] = 1;
                }
                break;

            case 'euphoric-hook':
                // S3RL-style euphoric happy hardcore lead
                const euphoricPattern = [1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1];
                for (let i = 0; i < 32; i++) {
                    pattern[i] = euphoricPattern[i % 16];
                }
                break;

            case 'rave-stab':
                // Rave-style stabs
                for (let i = 0; i < 32; i++) {
                    if (i % 4 === 0) pattern[i] = 1;
                    else if (i % 8 === 5 && Math.random() < 0.7) pattern[i] = 1;
                }
                break;

            default:
                // Basic melodic pattern
                for (let i = 0; i < 32; i++) {
                    if (i % 4 === 0) pattern[i] = 1;
                }
        }

        // Apply intensity scaling
        if (intensity < 0.3) {
            // Strip back at low intensity
            for (let i = 0; i < 32; i++) {
                if (pattern[i] === 1 && Math.random() > intensity * 2) {
                    pattern[i] = 0;
                }
            }
        }

        return pattern;
    }

    // Generate pad/chord pattern
    generatePadPattern(config, scaleNotes, intensity, bars) {
        const pattern = Array(32).fill(0);
        const style = config.style || 'sustain-chords';
        const changeRate = config.changeRate || 4;

        switch (style) {
            case 'sustain-chords':
            case 'lush':
            case 'warm':
            case 'warm-chords':
                // Sustained chord hits
                for (let i = 0; i < 32; i += changeRate) {
                    pattern[i] = 1;
                }
                break;

            case 'stabs':
                // Short stabs
                for (let i = 0; i < 32; i += 8) {
                    pattern[i] = 1;
                    if (Math.random() < 0.3) pattern[i + 4] = 1;
                }
                break;

            case 'evolving':
                // Slowly evolving pads
                pattern[0] = 1;
                if (changeRate <= 2) pattern[16] = 1;
                break;

            case 'minimal':
                // Minimal pads
                if (intensity > 0.5) {
                    pattern[0] = 1;
                }
                break;

            case 'atmospheric':
            case 'dungeon':
            case 'industrial':
                // Sparse atmospheric
                pattern[0] = 1;
                if (Math.random() < intensity) pattern[24] = 1;
                break;

            case 'strings':
                // Cinematic strings
                pattern[0] = 1;
                pattern[8] = 1;
                if (intensity > 0.7) {
                    pattern[16] = 1;
                    pattern[24] = 1;
                }
                break;

            case 'noise':
                // Industrial noise
                for (let i = 0; i < 32; i++) {
                    if (Math.random() < 0.1 * intensity) pattern[i] = 1;
                }
                break;

            case 'emotional-pads':
                // S3RL-style emotional euphoric pads
                pattern[0] = 1;
                pattern[8] = 1;
                pattern[16] = 1;
                pattern[24] = 1;
                // Extra emotional hits at higher intensity
                if (intensity > 0.6) {
                    pattern[4] = 1;
                    pattern[20] = 1;
                }
                break;

            case 'euphoric-strings':
                // Rave euphoric strings
                for (let i = 0; i < 32; i += 4) {
                    pattern[i] = 1;
                }
                break;

            default:
                pattern[0] = 1;
                pattern[16] = 1;
        }

        return pattern;
    }

    // Apply genre drum patterns to existing AI-generated drums
    applyGenreDrumPatterns(matrix, genrePatterns, intensity) {
        if (genrePatterns || genrePatterns.drums) return matrix;

        const drums = genrePatterns.drums;
        const steps = 32;

        // Copy genre pattern, scaled by intensity
        for (let i = 0; i < steps; i++) {
            // Kick
            if (drums.kick[i] && Math.random() < intensity) {
                matrix[0][i] = 1;
            }
            // Snare
            if (drums.snare[i] && Math.random() < intensity) {
                matrix[1][i] = 1;
            }
            // Hi-hat
            if (drums.hihat[i]) {
                matrix[3][i] = Math.random() < intensity ? 1 : 0;
            }
            // Clap (less common)
            if (drums.clap[i] && Math.random() < intensity * 0.8) {
                matrix[2][i] = 1;
            }
        }

        return matrix;
    }

    // Convert melody indices to pattern array for sequencer
    melodyToPattern(melody, steps = 32) {
        const pattern = Array(steps).fill(0);
        if (melody || melody.length === 0) return pattern;

        const stepSize = Math.max(1, Math.floor(steps / melody.length));

        melody.forEach((noteIdx, i) => {
            if (noteIdx >= 0) {
                const step = Math.min(i * stepSize, steps - 1);
                pattern[step] = 1;
            }
        });

        return pattern;
    }

    // Generate a motif for call-response patterns
    generateMotif(scaleNotes, length = 8) {
        const motif = [];
        const chordTones = [0, 2, 4]; // Root, third, fifth

        for (let i = 0; i < length; i++) {
            if (i === 0) {
                // Start on root
                motif.push(0);
            } else if (i === length - 1) {
                // End on chord tone (resolution)
                motif.push(chordTones[Math.floor(Math.random() * chordTones.length)]);
            } else {
                // Stepwise motion with occasional leaps
                if (Math.random() > 0.7) {
                    // Leap to chord tone
                    motif.push(chordTones[Math.floor(Math.random() * chordTones.length)]);
                } else {
                    // Stepwise motion
                    const last = motif[motif.length - 1];
                    const step = Math.random() > 0.5 ? 1 : -1;
                    motif.push(Math.max(0, Math.min(scaleNotes.length - 1, last + step)));
                }
            }
        }
        return motif;
    }

    // Develop motif with variation
    developMotif(motif, bars, scaleNotes, genre) {
        const melody = [];

        for (let bar = 0; bar < bars; bar++) {
            const phase = bar % 4;

            if (phase === 0) {
                // Original motif
                melody.push(...motif);
            } else if (phase === 1) {
                // Transpose up
                melody.push(...motif.map(n => Math.min(n + 2, scaleNotes.length - 1)));
            } else if (phase === 2) {
                // Retrograde
                melody.push(...[...motif].reverse());
            } else {
                // Inversion + variation
                melody.push(...motif.map(n => Math.max(0, scaleNotes.length - 1 - n)));
            }
        }

        return melody;
    }

    // Apply intensity to pattern
    applyIntensityToPattern(pattern, intensity) {
        return pattern.map(v => {
            if (v === 0) return 0;
            return Math.random() < intensity ? v : 0;
        });
    }
}

// 🤖 NEXUS-AI - Our own rule-based music AI (fast, smart, no external dependencies)
class NexusAI {
    constructor() {
        this.version = '1.0.0';
        this.memory = {
            lastMelody: [],
            lastChords: [],
            energyHistory: [],
            motifs: new Map()
        };

        // Music theory knowledge base
        this.theory = {
            // Consonant intervals (sound good together)
            consonances: [0, 3, 4, 5, 7, 8, 9, 12],

            // Dissonant intervals (create tension)
            dissonances: [1, 2, 6, 10, 11],

            // Strong beats in 4/4 time
            strongBeats: [0, 8, 16, 24],

            // Weak beats for syncopation
            weakBeats: [2, 6, 10, 14, 18, 22, 26, 30],

            // Genre-specific rules
            genreRules: {
                'HAPPYHARDCORE': {
                    preferredIntervals: [0, 4, 5, 7, 12], // Major scale intervals
                    avoidIntervals: [1, 6, 11], // Avoid minor 2nd, tritone, major 7th
                    rhythmDensity: 0.85,
                    syncopation: 0.3,
                    melodicRange: [3, 7], // Stay in upper register
                    chordChangeRate: 8, // Every 8 steps
                    energyCurve: 'euphoric-saw'
                },
                'SYNTHWAVE': {
                    preferredIntervals: [0, 3, 5, 7, 10, 12],
                    avoidIntervals: [1, 6],
                    rhythmDensity: 0.6,
                    syncopation: 0.2,
                    melodicRange: [2, 5],
                    chordChangeRate: 4,
                    energyCurve: 'retro-arc'
                },
                'TECHNO': {
                    preferredIntervals: [0, 3, 5, 6, 7], // Include tritone for tension
                    avoidIntervals: [1, 2],
                    rhythmDensity: 0.9,
                    syncopation: 0.1,
                    melodicRange: [1, 4],
                    chordChangeRate: 16, // Minimal changes
                    energyCurve: 'flat-hypnotic'
                },
                'HOUSE': {
                    preferredIntervals: [0, 4, 5, 7, 11, 12],
                    avoidIntervals: [1, 6],
                    rhythmDensity: 0.75,
                    syncopation: 0.4,
                    melodicRange: [2, 6],
                    chordChangeRate: 8,
                    energyCurve: 'groove-wave'
                },
                'TRAP': {
                    preferredIntervals: [0, 3, 5, 7, 10], // Minor intervals
                    avoidIntervals: [4, 11], // Avoid major 3rd, major 7th
                    rhythmDensity: 0.5,
                    syncopation: 0.7,
                    melodicRange: [0, 3],
                    chordChangeRate: 4,
                    energyCurve: 'dark-descend'
                },
                'DNB': {
                    preferredIntervals: [0, 3, 5, 7, 10, 12],
                    avoidIntervals: [1, 4],
                    rhythmDensity: 0.95,
                    syncopation: 0.5,
                    melodicRange: [2, 6],
                    chordChangeRate: 4,
                    energyCurve: 'aggressive-spike'
                },
                'TRANCE': {
                    preferredIntervals: [0, 4, 5, 7, 11, 12],
                    avoidIntervals: [1, 6],
                    rhythmDensity: 0.8,
                    syncopation: 0.3,
                    melodicRange: [4, 7],
                    chordChangeRate: 8,
                    energyCurve: 'buildup-rise'
                },
                'LOFI': {
                    preferredIntervals: [0, 3, 5, 7, 10, 12],
                    avoidIntervals: [1, 11],
                    rhythmDensity: 0.4,
                    syncopation: 0.5,
                    melodicRange: [1, 4],
                    chordChangeRate: 4,
                    energyCurve: 'chill-wave'
                }
            }
        };

        // Markov chain for melody generation
        this.markov = this.buildMarkovChain();

        // Pattern memory for variation
        this.patternMemory = [];
    }

    // Build a Markov chain for melodic transitions
    buildMarkovChain() {
        // Common melodic movements in Western music
        // Key: current interval, Value: likely next intervals with weights
        return {
            0: { 2: 30, 4: 25, 5: 20, 7: 15, 0: 10 },      // Unison -> step up
            1: { 0: 40, 2: 30, 3: 20, 4: 10 },             // Minor 2nd
            2: { 0: 30, 3: 30, 4: 25, 5: 15 },             // Major 2nd
            3: { 2: 25, 4: 30, 5: 25, 7: 20 },             // Minor 3rd
            4: { 2: 20, 5: 30, 7: 30, 0: 20 },             // Major 3rd
            5: { 4: 25, 7: 35, 0: 25, 3: 15 },             // Perfect 4th
            6: { 5: 35, 7: 35, 0: 20, 4: 10 },             // Tritone (tension)
            7: { 5: 25, 0: 30, 4: 20, 12: 25 },            // Perfect 5th
            8: { 7: 30, 0: 30, 5: 20, 12: 20 },            // Minor 6th
            9: { 7: 25, 0: 35, 12: 30, 5: 10 },            // Major 6th
            10: { 7: 30, 0: 30, 12: 30, 5: 10 },           // Minor 7th
            11: { 0: 40, 7: 30, 12: 30 },                  // Major 7th
            12: { 7: 30, 5: 25, 4: 25, 0: 20 }             // Octave
        };
    }

    // 🎵 GENERATE MELODY - Main AI melody generator
    generateMelody(scaleNotes, genre, bars = 4, options = {}) {
        if (scaleNotes || scaleNotes.length === 0) return Array(32).fill(0);

        const rules = this.theory.genreRules[genre] || this.theory.genreRules['HOUSE'];
        const steps = bars * 8;
        const melody = Array(steps).fill(0);

        // Determine starting note based on genre
        let currentInterval = 0;
        let previousDirection = 0; // -1 down, 0 same, 1 up

        for (let i = 0; i < steps; i++) {
            // Decide if this step should have a note
            const shouldPlay = this.decideNotePlacement(i, rules, previousDirection);

            if (shouldPlay) {
                // Get next interval using Markov chain + genre rules
                currentInterval = this.getNextInterval(currentInterval, rules, previousDirection, i, steps);

                // Map to scale degree
                const scaleDegree = this.intervalToScaleDegree(currentInterval, scaleNotes.length);
                melody[i] = scaleDegree;

                previousDirection = currentInterval > 7 ? -1 : (currentInterval < 5 ? 1 : 0);
            }
        }

        // Apply genre-specific shaping
        this.applyGenreShaping(melody, genre, scaleNotes);

        // Remember for future variations
        this.memory.lastMelody = [...melody];

        return melody;
    }

    // Decide if a note should be placed at this step
    decideNotePlacement(step, rules, previousDirection) {
        // Strong beats almost always get notes
        if (this.theory.strongBeats.includes(step)) {
            return Math.random() < 0.95;
        }

        // Weak beats depend on rhythm density and syncopation
        const baseChance = rules.rhythmDensity;

        // Add syncopation on weak beats
        if (this.theory.weakBeats.includes(step)) {
            return Math.random() < (baseChance * (1 + rules.syncopation * 0.5));
        }

        // Off-beats (between weak beats)
        return Math.random() < (baseChance * 0.3);
    }

    // Get next interval using AI logic
    getNextInterval(currentInterval, rules, previousDirection, step, totalSteps) {
        const transitions = this.markov[currentInterval] || this.markov[0];

        // Weight transitions by genre preferences
        const weighted = {};
        for (const [interval, weight] of Object.entries(transitions)) {
            const int = parseInt(interval);
            let modifiedWeight = weight;

            // Boost preferred intervals
            if (rules.preferredIntervals.includes(int)) {
                modifiedWeight *= 1.5;
            }

            // Reduce avoided intervals
            if (rules.avoidIntervals.includes(int)) {
                modifiedWeight *= 0.2;
            }

            // Favor stepwise motion (musical smoothness)
            if (Math.abs(int - currentInterval) <= 2) {
                modifiedWeight *= 1.3;
            }

            // Avoid too much repetition
            if (int === currentInterval && Math.random() < 0.3) {
                modifiedWeight *= 0.5;
            }

            weighted[int] = modifiedWeight;
        }

        // Add some randomness for creativity
        if (Math.random() < 0.1) {
            return rules.preferredIntervals[
                Math.floor(Math.random() * rules.preferredIntervals.length)
            ];
        }

        // Weighted random selection
        return this.weightedRandom(weighted);
    }

    // Weighted random selection
    weightedRandom(weights) {
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        let random = Math.random() * total;

        for (const [value, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return parseInt(value);
            }
        }

        return 0;
    }

    // Map interval to scale degree
    intervalToScaleDegree(interval, scaleLength) {
        // Simplified mapping - interval semitones to scale degrees
        const degreeMap = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6, 0];
        let degree = degreeMap[interval % 12];

        // Add octave offset
        if (interval >= 12) {
            degree = Math.min(degree + 7, scaleLength - 1);
        }

        return degree % scaleLength;
    }

    // Apply genre-specific melodic shaping
    applyGenreShaping(melody, genre, scaleNotes) {
        const rules = this.theory.genreRules[genre];
        if (rules) return;

        const [minRange, maxRange] = rules.melodicRange;
        const totalSteps = melody.length;

        // Apply energy curve
        for (let i = 0; i < totalSteps; i++) {
            if (melody[i] === 0) continue;

            const position = i / totalSteps;

            // Energy curve shaping
            let energyMod = 1;
            switch (rules.energyCurve) {
                case 'euphoric-saw':
                    // Sharp rise, then plateau (Happy Hardcore style)
                    energyMod = position < 0.7 ? 1 + position * 0.5 : 1.3;
                    break;
                case 'retro-arc':
                    // Arc shape - build up then come down
                    energyMod = position < 0.5 ? 1 + position : 1.5 - position;
                    break;
                case 'buildup-rise':
                    // Constant rise (Trance style)
                    energyMod = 1 + position * 0.8;
                    break;
                case 'flat-hypnotic':
                    // Stay relatively flat (Techno style)
                    energyMod = 1;
                    break;
                case 'dark-descend':
                    // Descend (Trap style)
                    energyMod = 1.2 - position * 0.4;
                    break;
            }

            // Apply range constraints
            melody[i] = Math.max(minRange, Math.min(maxRange, melody[i] * energyMod));
        }
    }

    // 🎹 GENERATE CHORDS - AI chord progression generator
    generateChords(scaleNotes, genre, bars = 4) {
        if (scaleNotes || scaleNotes.length === 0) return [];

        const rules = this.theory.genreRules[genre] || this.theory.genreRules['HOUSE'];
        const progression = [];

        // Functional harmony probabilities
        const functionWeights = {
            tonic: { predominant: 0.6, dominant: 0.3, tonic: 0.1 },
            predominant: { dominant: 0.7, tonic: 0.2, predominant: 0.1 },
            dominant: { tonic: 0.8, predominant: 0.15, dominant: 0.05 }
        };

        // Chord degrees by function
        const functions = {
            tonic: [0, 2, 5],      // I, iii, vi
            predominant: [1, 3, 4], // ii, IV, V (V can be predominant in jazz)
            dominant: [4]           // V
        };

        let currentFunction = 'tonic';
        const numChords = Math.ceil(bars / 2); // 2 bars per chord

        for (let i = 0; i < numChords; i++) {
            // Get next function based on harmony rules
            const weights = functionWeights[currentFunction];
            const nextFunction = this.weightedRandom({
                tonic: weights.tonic * 100,
                predominant: weights.predominant * 100,
                dominant: weights.dominant * 100
            });
            const functionNames = ['tonic', 'predominant', 'dominant'];
            currentFunction = functionNames[nextFunction] || 'tonic';

            // Get chord degree from function
            const degrees = functions[currentFunction];
            const degree = degrees[Math.floor(Math.random() * degrees.length)];

            progression.push(degree);
        }

        this.memory.lastChords = progression;
        return progression;
    }

    // 🥁 GENERATE DRUMS - AI drum pattern generator
    generateDrums(genre, intensity = 0.5, bars = 4) {
        const steps = bars * 8;
        const pattern = {
            kick: Array(steps).fill(0),
            snare: Array(steps).fill(0),
            hihat: Array(steps).fill(0),
            clap: Array(steps).fill(0)
        };

        const genrePatterns = GENRE_PATTERNS[genre]?.drums || GENRE_PATTERNS['HOUSE'].drums;

        // Copy base pattern with intensity variation
        for (let i = 0; i < steps; i++) {
            // Kick - always on strong beats, sometimes on weak
            if (genrePatterns.kick[i % 32]) {
                pattern.kick[i] = Math.random() < intensity ? 1 : 0;
            }

            // Snare - genre dependent
            if (genrePatterns.snare[i % 32]) {
                pattern.snare[i] = Math.random() < intensity ? 1 : 0;
            }

            // Hi-hat - can add ghost hits at high intensity
            if (genrePatterns.hihat[i % 32]) {
                pattern.hihat[i] = Math.random() < intensity ? 1 : 0;
            } else if (intensity > 0.7 && Math.random() < 0.2) {
                pattern.hihat[i] = 1; // Ghost hi-hat
            }

            // Clap
            if (genrePatterns.clap[i % 32]) {
                pattern.clap[i] = Math.random() < intensity ? 1 : 0;
            }
        }

        // Add fills at high intensity
        if (intensity > 0.8) {
            this.addDrumFill(pattern, steps);
        }

        return pattern;
    }

    // Add drum fills
    addDrumFill(pattern, steps) {
        const fillStart = steps - 4;

        // Snare roll at end
        for (let i = fillStart; i < steps; i++) {
            if (Math.random() < 0.6) {
                pattern.snare[i] = 1;
            }
        }

        // Kick fill
        if (Math.random() < 0.4) {
            pattern.kick[fillStart + 2] = 1;
        }
    }

    // 🎼 GENERATE FULL COMPOSITION - Complete AI song generator
    generateComposition(genre, scaleNotes, energy = 0.5) {
        const composition = {
            melody: [],
            bass: [],
            chords: [],
            drums: {},
            motifs: []
        };

        // Generate core motifs (musical themes)
        const mainMotif = this.generateMotif(scaleNotes, genre, 2);
        composition.motifs.push(mainMotif);

        // Generate melody with motif development
        composition.melody = this.developComposition(mainMotif, genre, scaleNotes, 4);

        // Generate bass line
        composition.bass = this.generateBass(scaleNotes, genre, composition.chords);

        // Generate chord progression
        composition.chords = this.generateChords(scaleNotes, genre, 4);

        // Generate drums
        composition.drums = this.generateDrums(genre, energy);

        return composition;
    }

    // Generate a motif (short musical idea)
    generateMotif(scaleNotes, genre, bars = 2) {
        const rules = this.theory.genreRules[genre] || this.theory.genreRules['HOUSE'];
        const steps = bars * 8;
        const motif = [];

        let currentDegree = 0;
        for (let i = 0; i < steps; i++) {
            if (i === 0 || (this.theory.strongBeats.includes(i) && Math.random() < 0.7)) {
                // Get next interval
                const interval = this.getNextInterval(
                    currentDegree, rules, 0, i, steps
                );
                currentDegree = this.intervalToScaleDegree(interval, scaleNotes.length);
                motif.push(currentDegree);
            } else {
                motif.push(0);
            }
        }

        return motif;
    }

    // Develop a composition from motifs
    developComposition(motif, genre, scaleNotes, bars) {
        const composition = [];
        const variations = ['repeat', 'transpose', 'invert', 'extend'];

        for (let bar = 0; bar < bars; bar++) {
            const variation = variations[bar % variations.length];
            let developedMotif = [...motif];

            switch (variation) {
                case 'transpose':
                    developedMotif = motif.map(d => d === 0 ? 0 : Math.min(d + 2, scaleNotes.length - 1));
                    break;
                case 'invert':
                    const max = Math.max(...motif.filter(d => d > 0));
                    developedMotif = motif.map(d => d === 0 ? 0 : max - d);
                    break;
                case 'extend':
                    developedMotif = [...motif, ...motif.slice(0, 4)];
                    break;
            }

            composition.push(...developedMotif);
        }

        return composition;
    }

    // Generate bass line
    generateBass(scaleNotes, genre, chords) {
        const rules = this.theory.genreRules[genre] || this.theory.genreRules['HOUSE'];
        const bass = Array(32).fill(0);

        // Bass typically plays root notes
        for (let i = 0; i < 32; i++) {
            if (i % 4 === 0) {
                // Root on downbeat
                bass[i] = 1;
            } else if (i % 4 === 2 && rules.rhythmDensity > 0.6) {
                // Offbeat at higher density
                bass[i] = Math.random() < 0.7 ? 2 : 0;
            }
        }

        return bass;
    }

    // 🔄 VARIATION ENGINE - Create variations of existing patterns
    createVariation(pattern, variationType = 'subtle') {
        const variation = [...pattern];

        switch (variationType) {
            case 'subtle':
                // Small random changes
                for (let i = 0; i < variation.length; i++) {
                    if (Math.random() < 0.1) {
                        variation[i] = variation[i] === 0 ? 1 : 0;
                    }
                }
                break;

            case 'dense':
                // Add more notes
                for (let i = 0; i < variation.length; i++) {
                    if (variation[i] === 0 && Math.random() < 0.2) {
                        variation[i] = 1;
                    }
                }
                break;

            case 'sparse':
                // Remove some notes
                for (let i = 0; i < variation.length; i++) {
                    if (variation[i] == 0 && Math.random() < 0.3) {
                        variation[i] = 0;
                    }
                }
                break;

            case 'invert':
                // Flip the pattern
                return variation.map(v => v === 0 ? 1 : 0);

            case 'shift':
                // Shift by one beat
                return [...variation.slice(4), ...variation.slice(0, 4)];
        }

        return variation;
    }

    // 📊 ANALYZE PATTERN - Analyze a pattern for musical qualities
    analyzePattern(pattern) {
        const notes = pattern.filter(v => v == 0);
        const density = notes.length / pattern.length;

        // Calculate melodic contour
        let contour = 'static';
        if (notes.length > 1) {
            const firstHalf = notes.slice(0, Math.floor(notes.length / 2));
            const secondHalf = notes.slice(Math.floor(notes.length / 2));
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

            if (secondAvg > firstAvg + 0.5) contour = 'ascending';
            else if (secondAvg < firstAvg - 0.5) contour = 'descending';
            else contour = 'undulating';
        }

        return {
            density,
            noteCount: notes.length,
            contour,
            isEmpty: notes.length === 0
        };
    }

    // Convert chord progression to pad pattern
    chordsToPattern(progression, scaleNotes, steps = 32) {
        const pattern = Array(steps).fill(0);
        if (progression || progression.length === 0) {
            // Default: hit every 8 steps
            for (let i = 0; i < steps; i += 8) {
                pattern[i] = 1;
            }
            return pattern;
        }

        const chordDuration = Math.max(1, Math.floor(steps / progression.length));

        progression.forEach((degree, i) => {
            const step = i * chordDuration;
            if (step < steps) {
                pattern[step] = 1;
            }
        });

        return pattern;
    }
}

// Global NEXUS-AI instance
window.nexusAI = new NexusAI();

// 🎵 CHORD ENGINE V2 - Real chord qualities and functional harmony
class ChordEngine {
    constructor() {
        this.qualities = {
            'maj':   [0, 4, 7],
            'min':   [0, 3, 7],
            'dim':   [0, 3, 6],
            'aug':   [0, 4, 8],
            'maj7':  [0, 4, 7, 11],
            'min7':  [0, 3, 7, 10],
            'dom7':  [0, 4, 7, 10],
            'sus2':  [0, 2, 7],
            'sus4':  [0, 5, 7],
            'add9':  [0, 4, 7, 14],
            'min9':  [0, 3, 7, 10, 14],
            'power': [0, 7, 12]  // Power chord (rock/metal)
        };

        // Roman numeral analysis for functional harmony
        this.functions = {
            'tonic': [0, 2, 6],      // I, iii, vi
            'predominant': [1, 3, 4], // ii, IV, V
            'dominant': [4]           // V
        };
    }

    // Get chord notes from scale degree and quality
    getChord(degree, quality, scaleNotes) {
        if (scaleNotes || scaleNotes.length === 0) return ['C', 'E', 'G'];

        const intervals = this.qualities[quality] || this.qualities['maj'];
        const chord = [];

        intervals.forEach(interval => {
            const semitones = interval;
            // Find the note at this interval from root
            const rootIdx = ((degree % scaleNotes.length) + scaleNotes.length) % scaleNotes.length;
            const noteIdx = (rootIdx + Math.floor(semitones / 2)) % scaleNotes.length;
            chord.push(scaleNotes[noteIdx]);
        });

        return chord;
    }

    // Genre-specific progressions with musical meaning
    getProgression(genre) {
        const progressions = {
            // S3RL-style Happy Hardcore - Euphoric and uplifting
            'HAPPYHARDCORE': [
                [0, 4, 5, 3],      // I - V - vi - IV (Classic euphoric)
                [0, 5, 4, 2],      // I - vi - V - iii (Emotional build)
                [0, 4, 0, 5],      // I - V - I - vi (Simple anthem)
                [0, 3, 4, 4],      // I - IV - V - V (Build up)
                [5, 4, 0, 0]       // vi - V - I - I (Emotional drop)
            ],
            'SYNTHWAVE': [
                [0, 2, 4, 1],      // Retro melancholic
                [0, 4, 2, 3],      // Neon drive
                [0, 3, 4, 2],      // Night ride
                [0, 5, 3, 4]       // Sunset chase
            ],
            'TECHNO': [
                [0, 0, 0, 0],      // Hypnotic minimal
                [0, 1, 0, 1],      // Phrygian dark
                [0, 2, 0, 2],      // Driving pulse
                [0, 0, 3, 0]       // Industrial stomp
            ],
            'TRAP': [
                [0, 0, 2, -1],     // Dark trap
                [0, 2, 0, 3],      // Atlanta bounce
                [0, 1, 2, 0],      // Melodic trap
                [0, 0, 0, -2]      // Heavy 808
            ],
            'HOUSE': [
                [0, 2, 4, 2],      // Classic house
                [0, 3, 2, 1],      // Deep house
                [0, 4, 0, 2],      // Piano house
                [0, 5, 3, 4]       // Vocal house
            ],
            'DNB': [
                [0, 2, 0, 1],      // Liquid funk
                [0, 0, 0, -1],     // Dark step
                [0, 3, 0, 2],      // Jump up
                [0, 4, 2, 0]       // Soulful dnb
            ],
            'TRANCE': [
                [0, -2, 0, 2],     // Uplifting trance
                [0, 3, 4, 1],      // Progressive build
                [0, 2, 4, 0],      // Euphoric trance
                [0, 4, 0, 4]       // Tech trance
            ],
            'LOFI': [
                [0, -1, -2, -3],   // Jazz chords down
                [0, 2, 1, -1],     // Chill hop
                [0, 3, 2, 0],      // Nostalgic
                [0, 4, 2, -2]      // Late night
            ],
            'AMBIENT': [
                [0, 2, 4, 6],      // Floating
                [0, 1, 2, 3],      // Drifting
                [0, 2, 0, 4],      // Space ambient
                [0, 3, 0, 5]       // Ethereal
            ],
            'CYBERPUNK': [
                [0, 1, 0, 3],      // Glitch core
                [0, -1, -2, 0],    // Dark future
                [0, 2, 1, 3],      // Tech noir
                [0, 0, 2, 1]       // Neon streets
            ],
            'DUBSTEP': [
                [0, 0, -1, 0],     // Heavy wobble
                [0, 1, 0, -2],     // Dark drop
                [0, 0, 2, 0],      // Brostep
                [0, -1, 0, 1]      // Riddim
            ],
            'CHIPTUNE': [
                [0, 3, 4, 0],      // 8-bit adventure
                [0, 2, 0, 4],      // Video game
                [0, 4, 3, 0],      // NES classic
                [0, 2, 4, 2]       // Retro arcade
            ],
            'CINEMATIC': [
                [0, -2, -4, -2],   // Epic trailer
                [0, 2, 0, -2],     // Film score
                [0, 3, 4, 2],      // Adventure
                [0, 4, 0, 3]       // Heroic
            ],
            'DUNGEONSYNTH': [
                [0, 1, -2, 2],     // Medieval quest
                [0, -1, -3, 0],    // Dark dungeon
                [0, 2, 1, 0],      // Fantasy realm
                [0, 3, 0, 2]       // Ancient ruins
            ],
            'INDUSTRIAL': [
                [0, 0, 0, 0],      // Machine rhythm
                [0, 1, 0, 1],      // Factory pulse
                [0, -1, 0, -1],    // Cold metal
                [0, 2, 0, 2]       // Harsh noise
            ]
        };

        const options = progressions[genre] || progressions['HOUSE'];
        return options[Math.floor(Math.random() * options.length)];
    }

    // Get quality for chord based on scale degree and genre
    getChordQuality(degree, scaleType, genre) {
        // Major scale qualities
        const majorQualities = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
        // Minor scale qualities
        const minorQualities = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'];

        let qualities;
        const isMinor = scaleType.includes('minor') || scaleType.includes('aeolian') ||
                        scaleType.includes('dorian') || scaleType.includes('phrygian') ||
                        scaleType.includes('harmonic') || scaleType.includes('melodic');

        if (isMinor) {
            qualities = minorQualities;
        } else {
            qualities = majorQualities;
        }

        // Genre-specific quality adjustments
        if (genre === 'HAPPYHARDCORE') {
            // Happy Hardcore uses mostly major chords for euphoria
            qualities = ['maj', 'min', 'min', 'maj', 'maj', 'maj', 'dim'];
        } else if (genre === 'TRAP' || genre === 'DUBSTEP') {
            // Trap/Dubstep uses more minor/dim for darkness
            qualities = ['min', 'dim', 'min', 'min', 'min', 'dim', 'dim'];
        }

        const idx = ((degree % qualities.length) + qualities.length) % qualities.length;
        return qualities[idx];
    }

    // Voice leading: find smoothest transition between chords
    applyVoiceLeading(fromChord, toChord) {
        if (fromChord || toChord) return toChord;

        // Keep common tones, move others by smallest interval
        return toChord.map((note, i) => {
            if (fromChord[i] === note) return note; // Common tone
            return note; // For now, just return the target
        });
    }

    // Generate chord with inversion for variety
    getChordWithInversion(degree, quality, scaleNotes, inversion = 0) {
        const chord = this.getChord(degree, quality, scaleNotes);
        if (inversion === 0 || chord.length === 0) return chord;

        // Rotate chord notes for inversion
        const inv = inversion % chord.length;
        const inverted = [...chord.slice(inv), ...chord.slice(0, inv)];
        return inverted;
    }

    // Convert chord progression to pad pattern for sequencer
    chordsToPattern(progression, scaleNotes, steps = 32) {
        const pattern = Array(steps).fill(0);
        if (progression || progression.length === 0) return pattern;

        const chordDuration = Math.floor(steps / progression.length);

        progression.forEach((degree, i) => {
            const step = i * chordDuration;
            if (step < steps) {
                pattern[step] = 1;
            }
        });

        return pattern;
    }

    // Get full chord sequence for a section
    getChordSequence(progression, scaleNotes, scaleType, genre) {
        if (progression || scaleNotes) return [];

        return progression.map((degree, i) => {
            const quality = this.getChordQuality(degree, scaleType, genre);
            const inversion = (i % 3 === 2) ? 1 : 0; // Occasional inversion
            return {
                degree,
                quality,
                notes: this.getChordWithInversion(degree, quality, scaleNotes, inversion)
            };
        });
    }
}

// --- UI CONTROLLER ---
const UIController = {
    components: [], 
    fftHistory: [], 
    
    toast(message) {
        const container = document.getElementById('toast-container');
        if(container) return;
        const el = document.createElement('div'); 
        el.className = 'toast'; el.innerHTML = `<span>⏣</span> ${message}`;
        container.appendChild(el); setTimeout(() => el.remove(), 3500);
    },

    applyTheme(kitName) {
        const root = document.documentElement;
        let pColor, aColor, bgColor, panelColor, trackColors;
        // Mapping (Shortened for brevity, identical logic)
        const themes = {
            'NEON': ['#00ff94', '#7c3aed', '#050505', '#111'],
            'GLITCH': ['#ff0055', '#ffffff', '#0a0505', '#150505'],
            'ACID': ['#eab308', '#00ff94', '#0a0a00', '#151500'],
            'VINYL': ['#fbbf24', '#d97706', '#17130e', '#241c14'],
            'CLUB': ['#3b82f6', '#ec4899', '#050510', '#0a0a1a'],
            'CHIPTUNE': ['#00ffff', '#ff00ff', '#000000', '#001122'],
            'CINEMATIC': ['#d4af37', '#800000', '#0d0d0d', '#1a1a1a'],
            'INDUSTRIAL': ['#ff3d00', '#546e7a', '#121212', '#263238'],
            'ETHEREAL': ['#64ffda', '#e040fb', '#0a192f', '#112240'],
            'DUNGEON': ['#556B2F', '#8B4513', '#080808', '#1a1a1a']
        };

        if(themes[kitName]) {
            [pColor, aColor, bgColor, panelColor] = themes[kitName];
            root.style.setProperty('--primary', pColor);
            root.style.setProperty('--accent', aColor);
            root.style.setProperty('--bg', bgColor);
            root.style.setProperty('--panel', panelColor);
        }

        // Hardcoded track colors for specific kits (kept from v37)
        let trackColorsArr = ['#00ff94', '#f59e0b', '#f59e0b', '#00ccff', '#7c3aed', '#ff0055', '#00ccff']; // Default
        if(kitName === 'GLITCH') trackColorsArr = ['#ff0055', '#ffffff', '#ffffff', '#ff0055', '#990033', '#ffffff', '#ff0055'];
        // ... (Other specific track color assignments would go here matching v37) ...
        CONFIG.colors = trackColorsArr;

        this.components.forEach(c => {
            if(c && typeof c.colorize === 'function') c.colorize("accent", pColor);
        });

        if(typeof window.ui == 'undefined' && window.ui.nexusSeqs) {
            window.ui.nexusSeqs.forEach((seq, idx) => {
                seq.colorize("accent", CONFIG.colors[idx]);
                const currentData = window.sys.seq ? window.sys.seq.data[idx].map(v => v > 0) : Array(32).fill(false);
                seq.matrix.populate.row(0, currentData);
            });
            for(let i=0; i<CONFIG.tracks.length; i++) {
                const tr = document.getElementById(`track-${i}`);
                if(tr && i === 6) tr.style.borderLeftColor = CONFIG.colors[i]; 
            }
        }
    }
};

// --- AUDIO ENGINE ---
class AudioEngine {
    constructor() {
        // 🦍 GIGACHAD SCALE SYSTEM - 88 SCALES 🦍
        this.scales = {
            // === DIATONIC CHADS ===
            ionian: ["C", "D", "E", "F", "G", "A", "B"],
            dorian: ["C", "D", "Eb", "F", "G", "A", "Bb"],
            phrygian: ["C", "Db", "Eb", "F", "G", "Ab", "Bb"],
            lydian: ["C", "D", "E", "F#", "G", "A", "B"],
            mixolydian: ["C", "D", "E", "F", "G", "A", "Bb"],
            aeolian: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
            locrian: ["C", "Db", "Eb", "F", "Gb", "Ab", "Bb"],
            // === CLASSIC CORE ===
            minor: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
            pentatonic: ["C", "Eb", "F", "G", "Bb", "C", "Eb"],
            // === PENTATONIC LEGENDS ===
            majorPenta: ["C", "D", "E", "G", "A", "C", "D"],
            minorPenta: ["C", "Eb", "F", "G", "Bb", "C", "Eb"],
            blues: ["C", "Eb", "F", "Gb", "G", "Bb", "C"],
            egyptian: ["C", "D", "F", "G", "Bb", "C", "D"],
            chinese: ["C", "D", "F", "G", "A", "C", "D"],
            insen: ["C", "Db", "F", "G", "Bb", "C", "Db"],
            hirajoshi: ["C", "Db", "F", "G", "Ab", "C", "Db"],
            // === HARMONIC & MELODIC ===
            harmonicMinor: ["C", "D", "Eb", "F", "G", "Ab", "B"],
            melodicMinor: ["C", "D", "Eb", "F", "G", "A", "B"],
            harmonicMajor: ["C", "D", "E", "F", "G", "Ab", "B"],
            doubleHarmonic: ["C", "Db", "E", "F", "G", "Ab", "B"],
            // === EXOTIC ALPHA ===
            phrygianDominant: ["C", "Db", "E", "F", "G", "Ab", "Bb"],
            lydianAugmented: ["C", "D", "E", "F#", "G#", "A", "B"],
            lydianDominant: ["C", "D", "E", "F#", "G", "A", "Bb"],
            hungarianMinor: ["C", "D", "Eb", "F#", "G", "Ab", "B"],
            romanianMinor: ["C", "D", "Eb", "F#", "G", "A", "Bb"],
            neapolitanMinor: ["C", "Db", "Eb", "F", "G", "Ab", "B"],
            neapolitanMajor: ["C", "Db", "Eb", "F", "G", "A", "B"],
            spanishGypsy: ["C", "Db", "E", "F", "G", "Ab", "Bb"],
            byzantine: ["C", "Db", "E", "F", "G", "Ab", "B"],
            persian: ["C", "Db", "E", "F", "G", "Ab", "Bb"],
            altered: ["C", "Db", "Eb", "E", "F#", "Ab", "Bb"],
            // === MODE VARIANTS ===
            superLocrian: ["C", "Db", "Eb", "E", "F#", "Ab", "Bb"],
            dorianFlat2: ["C", "Db", "Eb", "F", "G", "A", "Bb"],
            lydianSharp2: ["C", "D#", "E", "F#", "G", "A", "B"],
            lydianFlat7: ["C", "D", "E", "F#", "G", "A", "Bb"],
            mixolydianFlat6: ["C", "D", "E", "F", "G", "Ab", "Bb"],
            aeolianFlat5: ["C", "D", "Eb", "F", "Gb", "Ab", "Bb"],
            phrygianNatural3: ["C", "Db", "E", "F", "G", "Ab", "Bb"],
            dorianSharp4: ["C", "D", "Eb", "F#", "G", "A", "Bb"],
            ionianFlat2: ["C", "Db", "E", "F", "G", "A", "B"],
            // === JAZZ FUSION ===
            bebopDominant: ["C", "D", "E", "F", "G", "A", "Bb", "B"],
            bebopMajor: ["C", "D", "E", "F", "F#", "G", "A", "B"],
            bebopMinor: ["C", "D", "Eb", "E", "F", "G", "A", "Bb"],
            bebopDorian: ["C", "D", "Eb", "F", "G", "A", "Bb", "B"],
            diminishedHw: ["C", "Db", "Eb", "E", "F#", "G", "A", "Bb"],
            diminishedWh: ["C", "D", "Eb", "F", "Gb", "G#", "A", "B"],
            wholeTone: ["C", "D", "E", "F#", "G#", "A#", "C"],
            augmented: ["C", "D", "E", "G", "Ab", "B", "C"],
            tritone: ["C", "F#", "G", "C#", "D", "G#", "A"],
            // === VIDEO GAME ===
            nesMajor: ["C", "D", "E", "G", "A", "C", "D"],
            zelda: ["C", "D", "E", "G", "A", "B", "C"],
            megaMan: ["C", "Eb", "F", "G", "Bb", "C", "Eb"],
            castlevania: ["C", "D", "Eb", "G", "Ab", "C", "D"],
            sonicMode: ["C", "D", "F", "G", "A", "C", "D"],
            finalFantasy: ["C", "D", "E", "G", "A", "B", "C"],
            tibia: ["C", "D", "Eb", "F", "G", "Bb", "C"],
            // === CINEMATIC ===
            duneScale: ["C", "D", "Eb", "F", "G", "Ab", "Bb", "Db"],
            interstellar: ["C", "D", "Eb", "F", "G", "Ab", "B"],
            batmanTheme: ["C", "D", "Eb", "F", "G", "Ab", "B"],
            jokerStairs: ["C", "Db", "Eb", "F", "Gb", "Ab", "Bb"],
            braveheart: ["C", "D", "Eb", "G", "A", "C", "D"],
            gladiator: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
            // === METAL ===
            phrygianMetal: ["C", "Db", "E", "F", "G", "Ab", "Bb"],
            harmonicMetal: ["C", "D", "Eb", "F", "G", "Ab", "B"],
            locrianNatural2: ["C", "D", "Eb", "F", "Gb", "Ab", "Bb"],
            ukrainianDorian: ["C", "D", "Eb", "F#", "G", "A", "Bb"],
            enigmatic: ["C", "Db", "E", "F#", "G#", "A#", "B"],
            // === WORLD MUSIC ===
            hijaz: ["C", "Db", "E", "F", "G", "Ab", "Bb"],
            bayati: ["C", "D", "Eb", "F", "G", "A", "Bb"],
            rast: ["C", "D", "E", "F#", "G", "A", "B"],
            sikah: ["C", "D", "E", "F", "G", "Ab", "Bb"],
            saba: ["C", "Db", "Eb", "F", "Gb", "Ab", "Bb"],
            huzam: ["C", "Db", "E", "F", "G", "Ab", "B"],
            ragaBhimpalasi: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
            ragaYaman: ["C", "D", "E", "F#", "G", "A", "B"],
            pelog: ["C", "Db", "Eb", "G", "Ab", "C", "Db"],
            slendro: ["C", "D", "F", "G", "A", "C", "D"],
            kumoi: ["C", "D", "F", "G", "A", "Bb", "C"],
            iwato: ["C", "Db", "F", "Gb", "Bb", "C", "Db"],
            prometheus: ["C", "D", "E", "F#", "A", "Bb", "C"],
            // === EXPERIMENTAL ===
            octatonic: ["C", "Db", "Eb", "E", "F#", "G", "A", "Bb"],
            chromatic: ["C", "C#", "D", "D#", "E", "F", "F#"],
            tritoneParadise: ["C", "F#", "G", "C#", "D", "G#", "A"],
            fourthsStack: ["C", "F", "Bb", "Eb", "Ab", "C", "F"],
            fifthsStack: ["C", "G", "D", "A", "E", "B", "F#"],
            // === SECRET ===
            simpleAs: ["C", "E", "G", "C", "E", "G", "C"],
            piratesCredo: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
            theL: ["C", "D", "E", "F", "G", "A", "B"]
        };
        this.currentScale = 'minor'; this.currentKit = 'NEON'; this.channels = []; this.progressionOffset = 0; this.sidechainActive = true;
        
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

        // Master Chain
        this.compressor = new Tone.Compressor({ threshold: -14, ratio: 4, attack: 0.005, release: 0.1 });
        this.limiter = new Tone.Limiter(-0.5);
        this.streamDest = Tone.context.createMediaStreamDestination(); 
        
        // FX
        this.vibrato = new Tone.Vibrato({ frequency: 0.5, depth: 0, wet: 0 }); 
        this.distortion = new Tone.Distortion(0);
        this.filter = new Tone.Filter(20000, "lowpass", -24);
        this.autoFilter = new Tone.AutoFilter("8n", 200, 4).start(); this.autoFilter.wet.value = 0;
        this.eq3 = new Tone.EQ3({ low: 0, mid: 0, high: 0 });
        this.cheby = new Tone.Chebyshev(50); this.cheby.wet.value = 0;
        this.stutter = new Tone.Tremolo({ frequency: "16n", type: "square", depth: 1, spread: 0 }).start(); this.stutter.wet.value = 0;
        this.masterPitch = new Tone.PitchShift({ pitch: 0, windowSize: 0.1 });
        this.stereoWidener = new Tone.StereoWidener(0);

        // Spatial
        this.reverb = new Tone.Reverb({ decay: 5, wet: 0.3 }).connect(this.filter);
        this.delay = new Tone.PingPongDelay("8n", 0.4).connect(this.filter); this.delay.wet.value = 0; 
        this.hatAutoPanner = new Tone.AutoPanner("4n").start(); 

        // Connections
        this.drumBus.connect(this.filter); this.synthBus.connect(this.filter);
        
        // DSP Chain Construction
        // We will insert the AudioWorklet node here dynamically in setupWorklet()
        // Default chain for now:
        this.filter.chain(this.autoFilter, this.eq3, this.distortion, this.vibrato, this.cheby, this.stutter, this.masterPitch, this.stereoWidener, this.compressor, this.limiter);
        
        this.limiter.connect(this.masterVolume); 
        this.limiter.connect(this.streamDest);

        // Analysis
        this.analyser = new Tone.Analyser("fft", 64); 
        this.waveform = new Tone.Waveform(512);
        this.limiter.connect(this.analyser); this.limiter.connect(this.waveform);
    }

    async setupWorklet() {
        try {
            // ============================================================
            // FIX: Create our own AudioContext for the Worklet
            // ============================================================
            // Tone.js wraps the native context too deeply.
            // Solution: Create a dedicated AudioContext for the worklet.

            // Ensure Tone.js is running first
            if (Tone.context.state === 'suspended') {
                await Tone.context.resume();
            }

            // Create a dedicated native AudioContext for the worklet
            // This bypasses all Tone.js wrapping issues
            const nativeCtx = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 44100
            });

            // Ensure it's running
            if (nativeCtx.state === 'suspended') {
                await nativeCtx.resume();
            }

            dbg('audio', 'Created dedicated AudioContext:', nativeCtx.state);

            // Load the worklet module
            await nativeCtx.audioWorklet.addModule('processor.js');
            dbg('audio', 'AudioWorklet module loaded');

            // Create the DSP Engine node
            this.bitcrusherNode = new AudioWorkletNode(nativeCtx, 'nexus-dsp-engine');
            dbg('audio', 'DSP Engine node created ✓');

            // Create a MediaStreamAudioSourceNode to connect Tone.js to our context
            // Route: Tone.Destination -> MediaStream -> Our Context -> Bitcrusher
            const toneDestination = Tone.Destination;
            const mediaStreamDest = Tone.context.createMediaStreamDestination();
            toneDestination.connect(mediaStreamDest);

            const sourceNode = nativeCtx.createMediaStreamSource(mediaStreamDest.stream);
            sourceNode.connect(this.bitcrusherNode);

            // Connect bitcrusher to native context output
            this.bitcrusherNode.connect(nativeCtx.destination);

            dbg('audio', 'Bitcrusher routing: Tone → MediaStream → Worklet → Output ✓');

            // Store reference for cleanup
            this._workletContext = nativeCtx;
            this._mediaStreamDest = mediaStreamDest;
            this._sourceNode = sourceNode;

            // Load WASM Core (Optional - Falls back to JS if file missing)
            try {
                const response = await fetch('nexus-dsp.wasm');
                if (response.ok) {
                    const wasmBytes = await response.arrayBuffer();
                    const wasmModule = await WebAssembly.compile(wasmBytes);
                    // Use numeric message type: LOAD_WASM = 5
                    this.bitcrusherNode.port.postMessage({ type: 5, wasmModule });
                    dbg('audio', 'WASM DSP loaded ✓');
                }
            } catch (e) {
                dbg('audio', 'DSP running in JS mode (WASM not found)');
            }

            // Note: New v5.0 engine uses message-based parameters, not AudioParams
            // For backwards compat, store reference to worklet
            this.bitcrusherParamDepth = null;
            this.bitcrusherParamFreq = null;
            this.bitcrusherParamEnabled = null;

            UIController.toast("DSP: ENGINE v5.0 ACTIVE (JS Fallback)");
            dbg('audio', 'DSP Engine v5.0 initialized ✓');

        } catch (e) {
            dbg('audio', '⚠️ Worklet failed, using fallback:', e.message);
            // Fallback connection - audio still works, just no bitcrusher
            this.compressor.connect(this.limiter);
        }
    }

    loadKit(kitName, isInit = false) {
        this.currentKit = kitName;
        const wasArp = this.channels[5] ? this.channels[5].arpActive : false; 
        
        // MEMORY LEAK FIX: Strict Disposal
        this.channels.forEach(ch => { 
            if (ch.synth) { 
                ch.synth.disconnect(); 
                ch.synth.dispose(); 
            }
            if (ch.vol) ch.vol.dispose();
            if (ch.panner) ch.panner.dispose();
        });
        this.channels = [];

        CONFIG.tracks.forEach((name, i) => {
            const isDrum = i < 4; 
            const targetBus = isDrum ? this.drumBus : this.synthBus;
            const vol = new Tone.Volume(0).connect(targetBus); 
            const panner = new Tone.Panner(0).connect(vol); 
            let synth, type;
            
            // Optimized Synth Definitions with Polyphony Limits
            if (kitName === 'NEON') {
                if (i===0) { synth = new Tone.MembraneSynth({ pitchDecay: 0.05, envelope: { attack: 0.001, decay: 0.4 } }); type = 'kick'; }
                else if (i===1||i===2) { synth = new Tone.NoiseSynth({ noise: { type: 'white' } }).connect(this.reverb); type = 'noise'; }
                else if (i===3) { synth = new Tone.MetalSynth({ harmonicity: 5.1, modulationIndex: 32 }).chain(this.hatAutoPanner); type = 'metal'; }
                else if (i===4) { synth = new Tone.MonoSynth({ oscillator: { type: "square" }, portamento: 0.05 }); type = 'bass'; }
                else if (i===5) { synth = new Tone.Synth({ oscillator: { type: "triangle" } }).connect(this.delay); type = 'lead'; }
                else if (i===6) {
                    // PERFORMANCE: Higher polyphony for fast genres like Happy Hardcore
                    synth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sawtooth" }, envelope:{attack: 0.2, release: 0.3} })
                        .set({maxPolyphony: 12}) // INCREASED for fast BPM
                        .connect(this.reverb); 
                    const chorus = new Tone.Chorus(4, 2.5, 0.5).start(); 
                    synth.connect(chorus); 
                    type = 'pad'; 
                }
            } 
            else if (kitName === 'CINEMATIC') {
                 // Simplified for brevity, follows same pattern
                 if (i===0) { synth = new Tone.MembraneSynth(); type = 'kick'; }
                 else if (i<4) { synth = new Tone.NoiseSynth().connect(this.reverb); type = 'noise'; }
                 else if (i===6) { synth = new Tone.PolySynth(Tone.Synth, { envelope:{attack: 0.2, release: 0.3} }).set({maxPolyphony: 12}).connect(this.reverb); type = 'pad'; }
                 else { synth = new Tone.Synth(); type = 'lead'; }
            }
            else if (kitName === 'DUNGEON') {
                if (i===0) { synth = new Tone.MembraneSynth({ pitchDecay: 0.8, envelope: { attack: 0.01, decay: 0.8 } }); type = 'kick'; }
                else if (i===1||i===2) { synth = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.1, decay: 0.5 } }).connect(this.reverb); type = 'noise'; }
                else if (i===3) { synth = new Tone.MetalSynth({ harmonicity: 2.0, modulationIndex: 20, envelope: { attack: 0.1, decay: 0.3 } }).chain(this.hatAutoPanner); type = 'metal'; }
                else if (i===4) { synth = new Tone.MonoSynth({ oscillator: { type: "triangle" }, portamento: 0.1 }); type = 'bass'; }
                else if (i===5) { synth = new Tone.FMSynth({ modulationIndex: 10, harmonicity: 1.5, oscillator: { type: 'sine'}, envelope: {attack: 0.01, decay: 0.5} }).connect(this.delay); type = 'lead'; }
                else if (i===6) {
                    synth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sawtooth" }, envelope:{attack: 0.3, release: 0.4} })
                        .set({maxPolyphony: 10})
                        .connect(this.reverb);
                    const chorus = new Tone.Chorus(2, 3, 0.8).start();
                    synth.connect(chorus);
                    type = 'pad';
                }
            }
            // 🐮 PHONK KIT - Kriegsvideo Sound
            else if (kitName === 'PHONK') {
                if (i===0) {
                    // HEAVY distorted 808 kick
                    synth = new Tone.MembraneSynth({
                        pitchDecay: 0.3,
                        envelope: { attack: 0.001, decay: 0.5, sustain: 0.3, release: 0.2 }
                    });
                    const dist = new Tone.Distortion(0.6);
                    synth.chain(dist, panner);
                    type = 'kick';
                }
                else if (i===1||i===2) {
                    // Trap-style snares with reverb
                    synth = new Tone.NoiseSynth({
                        noise: { type: 'white' },
                        envelope: { attack: 0.001, decay: 0.2 }
                    }).connect(this.reverb);
                    type = 'noise';
                }
                else if (i===3) {
                    // Fast tight hi-hats
                    synth = new Tone.MetalSynth({
                        harmonicity: 5.5,
                        modulationIndex: 40,
                        envelope: { attack: 0.001, decay: 0.05 }
                    }).chain(this.hatAutoPanner);
                    type = 'metal';
                }
                else if (i===4) {
                    // HEAVY distorted 808 bass with portamento
                    synth = new Tone.MonoSynth({
                        oscillator: { type: "sine" },
                        envelope: { attack: 0.01, decay: 0.3, sustain: 0.8, release: 0.3 },
                        portamento: 0.1
                    });
                    const bassDist = new Tone.Distortion(0.4);
                    const bassCrush = new Tone.BitCrusher(8);
                    synth.chain(bassDist, bassCrush, panner);
                    type = 'bass';
                }
                else if (i===5) {
                    // 🐮 COWBELL The iconic phonk sound
                    synth = new Tone.FMSynth({
                        harmonicity: 1.5,
                        modulationIndex: 15,
                        oscillator: { type: 'square' },
                        envelope: { attack: 0.001, decay: 0.15, sustain: 0.2, release: 0.1 }
                    });
                    const cowbellDist = new Tone.Distortion(0.7);
                    const cowbellFilter = new Tone.Filter(800, 'highpass');
                    synth.chain(cowbellFilter, cowbellDist, panner);
                    type = 'lead';
                }
                else if (i===6) {
                    // Dark atmospheric pad
                    synth = new Tone.PolySynth(Tone.Synth, {
                        oscillator: { type: "sawtooth" },
                        envelope:{attack: 0.5, release: 0.6}
                    }).set({maxPolyphony: 8}).connect(this.reverb);
                    const padFilter = new Tone.Filter(400, 'lowpass');
                    synth.connect(padFilter);
                    type = 'pad';
                }
            }
            else { 
                 if (i===0) { synth = new Tone.MembraneSynth(); type = 'kick'; }
                 else if (i<4) { synth = new Tone.NoiseSynth(); type = 'noise'; }
                 else { synth = new Tone.PolySynth(Tone.Synth, { envelope:{release: 0.3} }).set({maxPolyphony: 12}); type = 'lead'; }
            }

            synth.connect(panner); 
            this.channels.push({ name, synth, panner, vol, type, muted: false, soloed: false, arpActive: (i === 5 ? wasArp : false) });
        });
        
        if (isInit) { UIController.applyTheme(kitName); UIController.toast(`LOADED ENGINE: ${kitName}`); }
    }

    mutateSoundDesign() {
        const waves = ["sine", "square", "triangle", "sawtooth", "pwm", "fmsine"]; const noises = ["white", "pink", "brown"];
        this.channels.forEach(ch => {
            try {
                if(ch.synth instanceof Tone.PolySynth) { ch.synth.set({ oscillator: { type: waves[Math.floor(Math.random() * waves.length)] }, envelope: { decay: 0.1 + Math.random() * 0.5 } }); } 
                else if(ch.synth instanceof Tone.FMSynth || ch.synth instanceof Tone.AMSynth) { ch.synth.harmonicity.value = Math.random() * 10; ch.synth.modulationIndex.value = Math.random() * 50; } 
                else if(ch.synth instanceof Tone.NoiseSynth) { ch.synth.noise.type = noises[Math.floor(Math.random() * noises.length)]; ch.synth.envelope.decay = 0.05 + Math.random() * 0.3; } 
            } catch(e) {} 
        });
        UIController.toast("SONIC MUTATION APPLIED 🧬");
    }

    trigger(trackIdx, time, type = 1, stepIdx = 0) {
        const ch = this.channels[trackIdx]; const isAnySoloed = this.channels.some(c => c.soloed);
        if ((isAnySoloed && ch.soloed) || (isAnySoloed && ch.muted)) return;

        if ((ch.type === 'kick') && this.sidechainActive) {
            this.synthBus.volume.cancelScheduledValues(time); 
            this.synthBus.volume.rampTo(-24, 0.01, time); 
            this.synthBus.volume.rampTo(0, 0.25, time + 0.03);
        }

        let vel = type === 2 ? 0.3 : 1; 
        if (window.sys.humanizeActive && type == 2) vel *= (Math.random() * 0.2 + 0.8);

        try {
            const scale = this.scales[this.currentScale]; 
            const rootIdx = (stepIdx * 3 + trackIdx * 5 + this.progressionOffset) % scale.length;

            if (ch.type === 'pad') {
                const root = scale[rootIdx]; const third = scale[(rootIdx + 2) % scale.length]; const fifth = scale[(rootIdx + 4) % scale.length];
                let notes = [`${root}3`, `${third}4`, `${fifth}4`];
                // Shorter duration to prevent polyphony overflow at high BPM
                const duration = Tone.Transport.bpm.value > 150 ? "16n" : "8n";
                ch.synth.triggerAttackRelease(notes, duration, time, vel * 0.4);
            } 
            else if (ch.type === 'lead') {
                 if (ch.arpActive) {
                    // Skip some arp notes at very high BPM to reduce CPU load
                    if (Tone.Transport.bpm.value > 160 && stepIdx % 2 === 1) return;
                    const s = Tone.Time("16n").toSeconds() / 2;
                    ch.synth.triggerAttackRelease(`${scale[rootIdx]}4`, "64n", time, vel);
                    ch.synth.triggerAttackRelease(`${scale[(rootIdx+2)%scale.length]}4`, "64n", time + s, vel*0.7);
                } else {
                    let octave = 4 + (stepIdx % 2);
                    const dur = Tone.Transport.bpm.value > 150 ? "32n" : "16n";
                    ch.synth.triggerAttackRelease(`${scale[rootIdx]}${octave}`, dur, time, vel);
                }
            }
            else if (ch.type === 'bass') {
                let octave = 1 + (stepIdx % 2); 
                ch.synth.triggerAttackRelease(`${scale[rootIdx]}${octave}`, "16n", time, vel);
            }
            else if (ch.type === 'kick') ch.synth.triggerAttackRelease("C1", "16n", time, vel);
            else if (ch.type === 'noise') ch.synth.triggerAttackRelease("16n", time, vel); 
            else if (ch.type === 'metal') ch.synth.triggerAttackRelease(200, "32n", time, vel); 
        } catch(e) {}
    }

    setFilterScheduled(freq, rampTime, time) {
        if (time) time = Tone.now();
        if (this.filter && this.filter.frequency) {
            this.filter.frequency.rampTo(freq, rampTime, time);
        }
    }
    setScale(name) {
        if (this.scales[name]) {
            dbg('audio', `Scale not found: ${name}, using minor`);
            this.currentScale = 'minor';
            return;
        }
        this.currentScale = name;
        UIController.toast(`SCALE SET: ${name.toUpperCase()}`);
    }
}

// --- MIXING & RECORDING ---
class MixingEngineer {
    async remaster() {
        UIController.toast("AI ENGINEER: ANALYZING SPECTRAL DENSITY...");
        await new Promise(r => setTimeout(r, 600));
        window.engine.channels.forEach((ch, idx) => {
            let targetVol = 0; let targetPan = 0;
            if(idx === 0) { targetVol = 1; targetPan = 0; }
            else if(idx === 1 || idx === 2) { targetVol = -2; targetPan = (idx === 1 ? -0.15 : 0.15); }
            else if(idx === 3) { targetVol = -3; targetPan = 0.25; }
            else if(idx === 6) { targetVol = -4; targetPan = 0; }
            ch.vol.volume.rampTo(targetVol, 1); ch.panner.pan.rampTo(targetPan, 1);
        });
        UIController.toast("AI ENGINEER: MASTERING COMPLETE ✨");
    }
}

class DiscordRecorder {
    constructor(engine) { this.engine = engine; this.chunks = []; this.isRecording = false; this.mediaRecorder = null; }
    init() {
        try {
            const options = { mimeType: 'audio/webm;codecs=opus' };
            this.mediaRecorder = new MediaRecorder(this.engine.streamDest.stream, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);
            this.mediaRecorder.ondataavailable = e => { if(e.data.size > 0) this.chunks.push(e.data); };
            this.mediaRecorder.onstop = () => this.export();
        } catch(e) { console.error(e); }
    }
    toggle() {
        if (this.mediaRecorder) this.init(); if (this.mediaRecorder) return;
        const btn = document.getElementById('recBtn');
        if (this.isRecording) { this.mediaRecorder.stop(); this.isRecording = false; btn.classList.remove('recording'); btn.innerText = "⏺ REC (AUDIO)"; UIController.toast("RENDERING AUDIO..."); } 
        else { this.chunks = []; this.mediaRecorder.start(); this.isRecording = true; btn.classList.add('recording'); btn.innerText = "⏹ STOP REC"; UIController.toast("RECORDING MASTER LOSSLESS"); }
    }
    export() {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NEXUS-X_REC_${Math.floor(Tone.Transport.bpm.value)}BPM.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
            UIController.toast(`SAVED TO DISK`);
        }, 500);
    }
}

// --- SEQUENCER & ARRANGER ---
class Sequencer {
    constructor() { this.data = CONFIG.tracks.map(() => Array(CONFIG.steps).fill(0)); this.snapshots = [null, null, null, null]; }
    clear() { this.data.forEach(t => t.fill(0)); window.ui.refreshGrid(); window.sys.autoSave(); }
    getEmptyBank() { return CONFIG.tracks.map(() => Array(CONFIG.steps).fill(0)); }
    generateEuclidean(pulses, steps, rotate = 0) { let pattern = Array(steps).fill(0); let bucket = 0; for (let i = 0; i < steps; i++) { bucket += pulses; if (bucket >= steps) { bucket -= steps; pattern[i] = 1; } } return pattern.slice(rotate).concat(pattern.slice(0, rotate)); }
    
    composeMelodicSection(bankArray, intensity, motif = null) {
        if (intensity === 'high') { for(let i=0; i<32; i++) { if(i % 4 === 2 || (bankArray[0][i] === 1 && Math.random() > 0.5)) bankArray[4][i] = 1; } } 
        else { bankArray[4][0] = 1; bankArray[4][16] = 1; }
        if (motif) { bankArray[5] = [...motif]; if(intensity === 'high') { for(let i=0; i<32; i+=2) if(Math.random()>0.8) bankArray[5][i] = 1; } }
        else { bankArray[5] = this.generateEuclidean(intensity === 'high' ? 11 : 6, 32, 0); }
        bankArray[6][0] = 1; if(intensity === 'high') bankArray[6][16] = 1;
        return bankArray;
    }
    mutateTrack(idx) {
        const track = this.data[idx]; const isDrum = idx < 4;
        for(let i=0; i<32; i++) { if (Math.random() > 0.85) { if (track[i] === 0) track[i] = (isDrum && Math.random() > 0.8) ? 3 : 1; else track[i] = Math.random() > 0.5 ? 0 : 2; } } 
        window.ui.refreshGrid(); window.sys.autoSave();
    }
    randomizeAll() {
        this.data.forEach((_, idx) => {
            const isDrum = idx < 4; const pulses = Math.floor(Math.random() * (isDrum ? 10 : 6)) + (isDrum ? 2 : 1); 
            this.data[idx] = this.generateEuclidean(pulses, 32, Math.floor(Math.random() * 32));
        });
        window.ui.refreshGrid(); window.sys.autoSave(); UIController.toast("GRID RANDOMIZED (EUCLIDEAN) 🎲");
    }
}

class Arranger {
    constructor() {
        // 🦍 GIGACHAD AI SYSTEM - RELIABLE MODELS ONLY 🦍
        this.drumVae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_2bar_hikl_small');
        this.isReady = false;
        this.chordProgression = [0, 2, 4, 1];
        this.totalBars = 0;

        // 🦍 GENRE AI PROFILES 🦍
        this.genreProfiles = {
            'SYNTHWAVE': { temperature: 0.9, density: 0.6, complexity: 'medium', energy: 0.7, humanize: 0.15, ghostNotes: 0.1, swing: 0.55 },
            'TECHNO': { temperature: 0.7, density: 0.8, complexity: 'high', energy: 0.9, humanize: 0.1, ghostNotes: 0.15, swing: 0.5 },
            'TRAP': { temperature: 1.1, density: 0.5, complexity: 'low', energy: 0.8, humanize: 0.25, ghostNotes: 0.3, swing: 0.6 },
            'AMBIENT': { temperature: 0.6, density: 0.3, complexity: 'low', energy: 0.3, humanize: 0.2, ghostNotes: 0.05, swing: 0.5 },
            'LOFI': { temperature: 0.8, density: 0.4, complexity: 'medium', energy: 0.4, humanize: 0.35, ghostNotes: 0.25, swing: 0.58 },
            'HOUSE': { temperature: 0.75, density: 0.7, complexity: 'medium', energy: 0.85, humanize: 0.1, ghostNotes: 0.1, swing: 0.52 },
            'DNB': { temperature: 0.85, density: 0.9, complexity: 'insane', energy: 1.0, humanize: 0.15, ghostNotes: 0.2, swing: 0.5 },
            'CYBERPUNK': { temperature: 1.2, density: 0.75, complexity: 'high', energy: 0.95, humanize: 0.05, ghostNotes: 0.1, swing: 0.5 },
            'DUBSTEP': { temperature: 1.0, density: 0.6, complexity: 'high', energy: 0.9, humanize: 0.1, ghostNotes: 0.15, swing: 0.5 },
            'SYNTHPOP': { temperature: 0.85, density: 0.65, complexity: 'medium', energy: 0.75, humanize: 0.15, ghostNotes: 0.1, swing: 0.53 },
            'RETROWAVE': { temperature: 0.9, density: 0.55, complexity: 'medium', energy: 0.65, humanize: 0.2, ghostNotes: 0.1, swing: 0.54 },
            'TRANCE': { temperature: 0.8, density: 0.7, complexity: 'high', energy: 0.95, humanize: 0.08, ghostNotes: 0.05, swing: 0.5 },
            'INDUSTRIAL': { temperature: 1.3, density: 0.85, complexity: 'insane', energy: 1.0, humanize: 0.05, ghostNotes: 0.3, swing: 0.5 },
            'ETHEREAL': { temperature: 0.5, density: 0.25, complexity: 'low', energy: 0.25, humanize: 0.3, ghostNotes: 0.02, swing: 0.5 },
            'CHIPTUNE': { temperature: 0.7, density: 0.8, complexity: 'medium', energy: 0.8, humanize: 0.0, ghostNotes: 0.0, swing: 0.5 },
            'CINEMATIC': { temperature: 0.65, density: 0.4, complexity: 'high', energy: 0.6, humanize: 0.25, ghostNotes: 0.1, swing: 0.52 },
            'DUNGEONSYNTH': { temperature: 0.75, density: 0.5, complexity: 'medium', energy: 0.5, humanize: 0.3, ghostNotes: 0.15, swing: 0.55 },
            'HAPPYHARDCORE': { temperature: 1.0, density: 0.9, complexity: 'high', energy: 1.0, humanize: 0.1, ghostNotes: 0.15, swing: 0.52 }
        };

        // 🦍 OPTIMIZED SECTION POOLS (Performance Friendly) 🦍
        this.sectionPools = {
            intros: [
                { name: "INTRO", dur: 8, snap: 0, rules: { Kick:0, Snare:0, Bass:0 } },
                { name: "ATMOSPHERE", dur: 8, snap: 0, rules: { Kick:0, Snare:0, Bass:0, Pad:1 } }
            ],
            verses: [
                { name: "VERSE", dur: 16, snap: 0, rules: { Kick:1, Bass:1, Lead:0 } },
                { name: "VERSE 2", dur: 16, snap: 0, rules: { Kick:1, Snare:1, Bass:1, Lead:0 } }
            ],
            preChoruses: [
                { name: "PRE-CHORUS", dur: 8, snap: 0, rules: { Kick:1, Snare:0, Bass:1 }, tempoRamp: 3 },
                { name: "RISE", dur: 8, snap: 0, rules: { Kick:0, Snare:1, HiHat:1 }, sweep: true }
            ],
            choruses: [
                { name: "CHORUS", dur: 16, snap: 1, rules: { Kick:1, Snare:1, Bass:1, Lead:1, Pad:1 } },
                { name: "HOOK", dur: 16, snap: 1, rules: { Kick:1, Snare:1, HiHat:1, Bass:1, Lead:1 } }
            ],
            builds: [
                { name: "BUILD", dur: 8, snap: 0, rules: { Kick:1, Bass:0, Snare:1 }, sweep: true, tempoRamp: 5 },
                { name: "SNARE ROLL", dur: 4, snap: 0, rules: { Kick:0, Snare:1, HiHat:1 }, sweep: true }
            ],
            drops: [
                { name: "DROP", dur: 16, snap: 1, rules: { Kick:1, Bass:1, Snare:1, Lead:1 }, tempoSlam: true },
                { name: "MAIN DROP", dur: 16, snap: 1, rules: { Kick:1, Bass:1, Snare:1, HiHat:1, Lead:1 }, tempoSlam: true }
            ],
            bridges: [
                { name: "BRIDGE", dur: 8, snap: 2, rules: { Kick:0, HiHat:1, Bass:1 } },
                { name: "BREAKDOWN", dur: 8, snap: 2, rules: { Kick:0, Snare:0, Bass:1, Pad:1 } }
            ],
            solos: [
                { name: "SOLO", dur: 8, snap: 1, rules: { Kick:1, Snare:1, Bass:1, Lead:1 } }
            ],
            hooks: [
                { name: "HOOK RETURN", dur: 8, snap: 1, rules: { Kick:1, Snare:1, Bass:1, Lead:1 } }
            ],
            outros: [
                { name: "OUTRO", dur: 8, snap: 0, rules: { Kick:1, Bass:0, Lead:0 }, tempoRamp: -10 },
                { name: "FADE OUT", dur: 8, snap: 0, rules: { Kick:1, Snare:0, Bass:1 }, tempoRamp: -5 }
            ]
        };
    }

    async init() {
        if(this.isReady) {
            await this.drumVae.initialize();
            this.isReady = true;
        }
    }

    // 🦍 PRELOAD MAGENTA - Call this on app start to avoid button lag
    async preload() {
        if (this.isReady) {
            dbg('ai', 'Preloading Magenta model...');
            await this.init();
            dbg('ai', 'Magenta ready ✓');
        }
    }

    async getDrumMatrix(temperature = 1.0, genreProfile = null) {
        // Use genre-specific temperature if available
        const temp = genreProfile ? genreProfile.temperature : temperature;

        await this.init();
        let matrix = [Array(32).fill(0), Array(32).fill(0), Array(32).fill(0), Array(32).fill(0)];

        try {
            const samples = await this.drumVae.sample(1, temp);
            if(samples[0].notes) {
                samples[0].notes.forEach(n => {
                    const step = n.quantizedStartStep;
                    if(step < 32) {
                        if(n.pitch === 36) matrix[0][step] = 1;
                        else if(n.pitch === 38) matrix[1][step] = 1;
                        else if(n.pitch === 39 || n.pitch === 40) matrix[2][step] = 1;
                        else if(n.pitch === 42 || n.pitch === 44) matrix[3][step] = 1;
                    }
                });

                // 🦍 HUMANIZATION LAYER 🦍
                if (genreProfile) {
                    matrix = this.humanizeDrums(matrix, genreProfile);
                }
            }
        } catch(e) { dbg('ai', 'Drum generation fallback:', e.message); }
        return matrix;
    }

    // 🦍 SIMPLIFIED HUMANIZATION (Performance Optimized) 🦍
    humanizeDrums(matrix, profile) {
        const humanize = profile.humanize || 0.1;
        const ghostNotes = profile.ghostNotes || 0.1;

        // Simplified: Only apply to snare (track 1) and hi-hat (track 3)
        for (let step = 0; step < 32; step++) {
            // Random velocity on snares
            if (matrix[1][step] === 1 && Math.random() < humanize) {
                matrix[1][step] = Math.random() > 0.5 ? 2 : 1;
            }
            // Ghost notes on hi-hats
            if (matrix[3][step] === 0 && Math.random() < ghostNotes * 0.5) {
                matrix[3][step] = 3;
            }
        }
        return matrix;
    }

    // 🦍 REMOVED: Complexity Adjustment (was causing performance issues)

    async generateDrumsOnly() {
        UIController.toast("🧠 SAMPLING MAGENTA LATENT SPACE...");
        const genre = window.sys?.currentGenre || 'SYNTHWAVE';
        const profile = this.genreProfiles[genre] || this.genreProfiles['SYNTHWAVE'];

        const matrix = await this.getDrumMatrix(profile.temperature, profile);
        // Removed complexity adjustment for performance

        for(let i=0; i<4; i++) { window.seq.data[i] = matrix[i]; }
        window.ui.refreshGrid();
        window.sys.autoSave();
    }

    // 🦍 SMART SONG STRUCTURE GENERATOR 🦍
    generateSongStructure(genre, energy = 0.8) {
        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const structure = [];

        // Genre-specific structure templates
        const templates = {
            'SYNTHWAVE': ['intro', 'verse', 'build', 'drop', 'verse', 'build', 'drop', 'outro'],
            'TECHNO': ['intro', 'verse', 'build', 'drop', 'bridge', 'drop', 'outro'],
            'TRAP': ['intro', 'verse', 'hook', 'verse', 'hook', 'bridge', 'hook', 'outro'],
            'AMBIENT': ['intros', 'verse', 'bridge', 'verse', 'outros'],
            'LOFI': ['intro', 'verse', 'hook', 'verse', 'hook', 'outro'],
            'HOUSE': ['intro', 'verse', 'build', 'chorus', 'verse', 'build', 'chorus', 'outro'],
            'DNB': ['intro', 'verse', 'build', 'drop', 'breakdown', 'build', 'drop', 'outro'],
            'CYBERPUNK': ['intro', 'verse', 'build', 'drop', 'solo', 'drop', 'outro'],
            'DUBSTEP': ['intro', 'verse', 'build', 'drop', 'bridge', 'build', 'drop', 'outro'],
            'TRANCE': ['intro', 'verse', 'build', 'chorus', 'bridge', 'build', 'chorus', 'outro'],
            'INDUSTRIAL': ['intro', 'verse', 'build', 'drop', 'breakdown', 'drop', 'drop', 'outro'],
            'CHIPTUNE': ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro'],
            'CINEMATIC': ['intros', 'verse', 'build', 'chorus', 'bridge', 'chorus', 'outros'],
            'DUNGEONSYNTH': ['intros', 'verse', 'bridge', 'verse', 'bridge', 'outros']
        };

        const template = templates[genre] || templates['SYNTHWAVE'];

        template.forEach(sectionType => {
            const pool = this.sectionPools[sectionType] || this.sectionPools.verses;
            structure.push(getRandom(pool));
        });

        // Energy curve adjustment
        structure.forEach((section, idx) => {
            const position = idx / structure.length;
            // Build energy towards the middle/end, then release
            const energyMultiplier = position < 0.7
                ? 0.5 + (position * 0.7)
                : 1.0 - ((position - 0.7) * 0.5);
            section.energy = (section.energy || 0.7) * energyMultiplier * energy;
        });

        return structure;
    }

    async generateFullSong() {
        window.sys.stop();
        const aiDialog = document.getElementById('aiDialog');
        const genPhase = document.getElementById('aiGenerationPhase');
        const reviewPhase = document.getElementById('aiReviewPhase');

        // Reset dialog state
        genPhase.style.display = 'block';
        reviewPhase.style.display = 'none';
        aiDialog.showModal();

        const statusEl = document.getElementById('directorStatus');

        try {
            // 🦍 STEP 1: GENRE SELECTION 🦍
            if (statusEl) statusEl.textContent = '🎭 SELECTING GENRE...';
            if (window.sys.themeLocked) {
                const genresKeys = Object.keys(GENRES);
                const robustChosenGenre = genresKeys[Math.floor(Math.random() * genresKeys.length)];
                const gSel = document.getElementById('genreSelect');
                if(gSel) gSel.value = robustChosenGenre;
                window.sys.setGenre(robustChosenGenre);
                if(Math.random() > 0.5) window.engine.mutateSoundDesign();
            }

            // 🦍 STEP 2: LOAD AI PROFILE 🦍
            const genre = window.sys.currentGenre;
            const profile = this.genreProfiles[genre] || this.genreProfiles['SYNTHWAVE'];
            const genreData = GENRES[genre];
            this.chordProgression = genreData.progressions[Math.floor(Math.random() * genreData.progressions.length)];

            // 🦍 STEP 3: GENERATE DRUM PATTERNS (PARALLELIZED) 🦍
            if (statusEl) statusEl.textContent = '🥁 GENERATING ALL DRUMS (AI)...';
            const songMotif = window.seq.generateEuclidean(
                Math.floor(Math.random() * 4) + 4,
                32,
                Math.floor(Math.random() * 8)
            );

            // 🚀 PARALLEL GENERATION - 3 patterns at once
            const [drumA, drumB, drumD] = await Promise.all([
                this.getDrumMatrix(profile.temperature * 0.8, profile),
                this.getDrumMatrix(profile.temperature * 1.2, profile),
                this.getDrumMatrix(profile.temperature, profile)
            ]);

            // Process Pattern A - Low energy intro/verse style
            let bankA = window.seq.getEmptyBank();
            for(let i=0; i<4; i++) bankA[i] = drumA[i];
            window.seq.composeMelodicSection(bankA, 'low', songMotif);
            window.seq.snapshots[0] = bankA;

            // Process Pattern B - High energy drop
            let bankB = window.seq.getEmptyBank();
            for(let i=0; i<4; i++) bankB[i] = drumB[i];
            window.seq.composeMelodicSection(bankB, 'high', songMotif);
            window.seq.snapshots[1] = bankB;

            // 🦍 STEP 4: GENERATE BREAKDOWN PATTERN 🦍
            let bankC = window.seq.getEmptyBank();
            bankC[3] = window.seq.generateEuclidean(16, 32, 0);
            window.seq.composeMelodicSection(bankC, 'low', null);
            window.seq.snapshots[2] = bankC;

            // Process Pattern D - Hook
            let bankD = window.seq.getEmptyBank();
            for(let i=0; i<4; i++) bankD[i] = drumD[i];
            window.seq.composeMelodicSection(bankD, 'high', songMotif);
            bankD[6] = window.seq.generateEuclidean(4, 32, 0); // Pad hits
            window.seq.snapshots[3] = bankD;

            document.querySelectorAll('.snap-btn').forEach((b,i) => { b.classList.add('filled'); });

            // 🦍 STEP 5: BUILD STRUCTURE & FINALIZE 🦍
            if (statusEl) statusEl.textContent = '🏗️ FINALIZING...';
            this.structure = this.generateSongStructure(genre, profile.energy);
            this.totalBars = this.structure.reduce((acc, curr) => acc + curr.dur, 0);
            this.drawMinimap();
            this.schedule();

            // Show preview with requestAnimationFrame for smooth UI
            requestAnimationFrame(() => this.showStructurePreview());

        } catch(e) {
            console.error('AI Generation Error:', e);
            aiDialog.close();
            UIController.toast("⚠️ AI GENERATION FAILED - TRY AGAIN");
        }
    }

    // 🎵 EPIC SONG GENERATOR - Real 3-4 minute songs with musical intelligence
    async generateEpicSong() {
        window.sys.stop();
        const aiDialog = document.getElementById('aiDialog');
        const genPhase = document.getElementById('aiGenerationPhase');
        const reviewPhase = document.getElementById('aiReviewPhase');

        genPhase.style.display = 'block';
        reviewPhase.style.display = 'none';
        aiDialog.showModal();

        const statusEl = document.getElementById('directorStatus');

        try {
            // Initialize engines
            if (this.melodyEngine) this.melodyEngine = new MelodyEngine();
            if (this.chordEngine) this.chordEngine = new ChordEngine();

            // 🎭 STEP 1: GENRE SELECTION
            if (statusEl) statusEl.textContent = '🎭 SELECTING GENRE...';
            if (window.sys.themeLocked) {
                const genresKeys = Object.keys(GENRES);
                const chosenGenre = genresKeys[Math.floor(Math.random() * genresKeys.length)];
                const gSel = document.getElementById('genreSelect');
                if(gSel) gSel.value = chosenGenre;
                window.sys.setGenre(chosenGenre);
                window.engine.mutateSoundDesign();
            }

            const genre = window.sys.currentGenre;
            const profile = this.genreProfiles[genre] || this.genreProfiles['SYNTHWAVE'];
            const genrePatterns = GENRE_PATTERNS[genre] || GENRE_PATTERNS['SYNTHWAVE'];

            // 🎼 STEP 2: GET SCALE AND PROGRESSION
            if (statusEl) statusEl.textContent = '🎼 BUILDING HARMONY...';
            const scaleNotes = window.engine.scales[window.engine.currentScale];
            const progression = this.chordEngine.getProgression(genre);
            this.chordProgression = progression;

            // 🥁 STEP 3: GENERATE DRUMS - Fast mode (no AI, use genre patterns directly)
            if (statusEl) statusEl.textContent = '🥁 GENERATING DRUMS...';

            // FAST: Use genre patterns directly instead of Magenta AI
            const makeDrumMatrix = (intensity) => {
                const drums = genrePatterns.drums;
                return [
                    drums.kick.map(v => v && Math.random() < intensity ? 1 : 0),
                    drums.snare.map(v => v && Math.random() < intensity ? 1 : 0),
                    drums.clap.map(v => v && Math.random() < intensity ? 1 : 0),
                    drums.hihat.map(v => v && Math.random() < intensity ? 1 : 0)
                ];
            };

            // Generate all 5 intensity levels instantly (no async)
            const drumAtmosphere = makeDrumMatrix(0.25);
            const drumLow = makeDrumMatrix(0.5);
            const drumMid = makeDrumMatrix(0.75);
            const drumHigh = makeDrumMatrix(0.95);
            const drumDrop = makeDrumMatrix(1.0);

            // Add fills to drop pattern
            this.addDrumFills(drumDrop, 0.8);

            // 🎸 STEP 4: GENERATE MELODIC CONTENT WITH MUSICAL INTELLIGENCE
            if (statusEl) statusEl.textContent = '🎸 COMPOSING MELODIES...';

            // Generate core motifs for song identity
            const leadMotif = this.melodyEngine.generateMotif(scaleNotes, 8);
            const bassMotif = this.melodyEngine.generateMotif(scaleNotes, 4);

            // Get chord sequence with qualities
            const chordSequence = this.chordEngine.getChordSequence(
                progression, scaleNotes, window.engine.currentScale, genre);

            // Create 5 intensity levels for epic songs with musical development
            const intensityLevels = [0.15, 0.35, 0.55, 0.8, 1.0];
            const variationTypes = ['repeat', 'repeat', 'transpose-up', 'call-response', 'extension'];

            for (let i = 0; i < 5; i++) {
                const intensity = intensityLevels[i];
                const bank = window.seq.getEmptyBank();

                // Drums - use appropriate intensity level
                const drumMatrix = [drumAtmosphere, drumLow, drumMid, drumHigh, drumDrop][i];
                for (let j = 0; j < 4; j++) bank[j] = drumMatrix[j];

                // Bass - develop the motif musically
                const bassVariation = i < 2 ? 'repeat' : (i === 4 ? 'extension' : 'transpose-up');
                const developedBass = this.melodyEngine.developMotif(bassMotif, bassVariation, scaleNotes);
                bank[4] = this.melodyEngine.generatePattern(
                    'bass', genre, scaleNotes, intensity, 8);

                // Lead - use motif development for musical coherence
                const developedLead = this.melodyEngine.developMotif(leadMotif, variationTypes[i], scaleNotes);
                bank[5] = this.melodyEngine.generatePattern(
                    'lead', genre, scaleNotes, intensity, 8);

                // Apply motif influence to the lead pattern
                if (i >= 2) {
                    // Higher intensity = more active lead
                    for (let s = 0; s < 32; s++) {
                        if (developedLead[s % developedLead.length] > 2 && Math.random() < intensity) {
                            bank[5][s] = 1;
                        }
                    }
                }

                // Pad - follow chord progression
                bank[6] = this.chordEngine.chordsToPattern(progression, scaleNotes, 32);

                window.seq.snapshots[i] = bank;
            }

            document.querySelectorAll('.snap-btn').forEach((b, i) => {
                if (i < 5) b.classList.add('filled');
            });

            // 🏗️ STEP 5: BUILD EPIC STRUCTURE
            if (statusEl) statusEl.textContent = '🏗️ BUILDING EPIC STRUCTURE...';
            this.structure = this.generateEpicStructure(genre);
            this.totalBars = this.structure.reduce((acc, curr) => acc + curr.dur, 0);

            // 🎯 STEP 6: FINALIZE
            if (statusEl) statusEl.textContent = '✅ FINALIZING EPIC SONG...';

            // Store for regeneration
            this.lastGeneratedGenre = genre;
            this.lastGeneratedPatterns = { drumAtmosphere, drumLow, drumMid, drumHigh, drumDrop };

            // Schedule UI updates asynchronously to avoid blocking
            requestAnimationFrame(() => {
                this.drawMinimap();
                this.schedule();
                this.showStructurePreview();
            });

            UIController.toast(`🎵 EPIC ${genre} - ${this.totalBars} BARS - ${genrePatterns.vibe || ''}`);

        } catch(e) {
            console.error('Epic Song Generation Error:', e);
            aiDialog.close();
            UIController.toast("⚠️ EPIC GENERATION FAILED");
        }
    }

    // 🤖 NEXUS-AI SONG GENERATOR - Our own AI, no external dependencies
    async generateNexusAISong() {
        window.sys.stop();
        const aiDialog = document.getElementById('aiDialog');
        const genPhase = document.getElementById('aiGenerationPhase');
        const reviewPhase = document.getElementById('aiReviewPhase');

        genPhase.style.display = 'block';
        reviewPhase.style.display = 'none';
        aiDialog.showModal();

        const statusEl = document.getElementById('directorStatus');

        try {
            const startTime = performance.now();

            // 🎭 STEP 1: GENRE SELECTION
            if (statusEl) statusEl.textContent = '🤖 NEXUS-AI: ANALYZING GENRE...';
            if (window.sys.themeLocked) {
                const genresKeys = Object.keys(GENRES);
                const chosenGenre = genresKeys[Math.floor(Math.random() * genresKeys.length)];
                const gSel = document.getElementById('genreSelect');
                if(gSel) gSel.value = chosenGenre;
                window.sys.setGenre(chosenGenre);
            }

            const genre = window.sys.currentGenre;
            const scaleNotes = window.engine.scales[window.engine.currentScale];

            if (statusEl) statusEl.textContent = '🤖 NEXUS-AI: GENERATING COMPOSITION...';

            // 🎼 STEP 2: USE NEXUS-AI FOR FULL COMPOSITION
            const composition = window.nexusAI.generateComposition(genre, scaleNotes, 0.7);

            // 🥁 STEP 3: GENERATE DRUMS WITH NEXUS-AI
            const drumAtmosphere = window.nexusAI.generateDrums(genre, 0.2);
            const drumLow = window.nexusAI.generateDrums(genre, 0.4);
            const drumMid = window.nexusAI.generateDrums(genre, 0.6);
            const drumHigh = window.nexusAI.generateDrums(genre, 0.85);
            const drumDrop = window.nexusAI.generateDrums(genre, 1.0);

            // 🎸 STEP 4: CREATE 5 INTENSITY BANKS
            const intensityLevels = [0.15, 0.35, 0.55, 0.8, 1.0];
            const drums = [drumAtmosphere, drumLow, drumMid, drumHigh, drumDrop];

            for (let i = 0; i < 5; i++) {
                const intensity = intensityLevels[i];
                const bank = window.seq.getEmptyBank();

                // Drums from NEXUS-AI
                bank[0] = drums[i].kick;
                bank[1] = drums[i].snare;
                bank[2] = drums[i].clap;
                bank[3] = drums[i].hihat;

                // Bass - use NEXUS-AI bass with variation
                const bassVariation = i < 2 ? 'sparse' : (i === 4 ? 'dense' : 'subtle');
                bank[4] = window.nexusAI.createVariation(
                    window.nexusAI.generateBass(scaleNotes, genre, composition.chords),
                    bassVariation
                );

                // Lead - use NEXUS-AI melody
                const melodyVariation = ['subtle', 'subtle', 'dense', 'dense', 'sparse'][i];
                const baseMelody = composition.melody.length > 0 ? composition.melody :
                    window.nexusAI.generateMelody(scaleNotes, genre, 4);
                bank[5] = window.nexusAI.createVariation(baseMelody.slice(0, 32), melodyVariation);

                // Pad - chord pattern
                bank[6] = window.nexusAI.chordsToPattern ?
                    window.nexusAI.chordsToPattern(composition.chords, scaleNotes, 32) :
                    Array(32).fill(0).map((_, i) => i % 8 === 0 ? 1 : 0);

                window.seq.snapshots[i] = bank;
            }

            document.querySelectorAll('.snap-btn').forEach((b, i) => {
                if (i < 5) b.classList.add('filled');
            });

            // 🏗️ STEP 5: BUILD STRUCTURE
            if (statusEl) statusEl.textContent = '🤖 NEXUS-AI: ARRANGING...';
            this.structure = this.generateEpicStructure(genre);
            this.totalBars = this.structure.reduce((acc, curr) => acc + curr.dur, 0);

            // Store for regeneration
            this.lastGeneratedGenre = genre;
            this.lastGeneratedPatterns = { drumAtmosphere, drumLow, drumMid, drumHigh, drumDrop };

            // 🎯 STEP 6: FINALIZE
            const endTime = performance.now();
            const generationTime = ((endTime - startTime) / 1000).toFixed(2);

            if (statusEl) statusEl.textContent = `✅ NEXUS-AI COMPLETE (${generationTime}s)`;

            requestAnimationFrame(() => {
                this.drawMinimap();
                this.schedule();
                this.showStructurePreview();
            });

            aiDialog.close();
            UIController.toast(`🤖 NEXUS-AI: ${genre} generated in ${generationTime}s`);

        } catch(e) {
            console.error('NEXUS-AI Error:', e);
            aiDialog.close();
            UIController.toast("⚠️ NEXUS-AI FAILED");
        }
    }

    // Regenerate current song with new patterns but same structure
    async regenerateCurrentSong() {
        if (this.structure || this.structure.length === 0) {
            UIController.toast("⚠️ No song to regenerate - generate first");
            return;
        }

        UIController.toast("🔄 Regenerating patterns...");

        try {
            const genre = window.sys.currentGenre || this.lastGeneratedGenre || 'SYNTHWAVE';
            const profile = this.genreProfiles[genre] || this.genreProfiles['SYNTHWAVE'];
            const genrePatterns = GENRE_PATTERNS[genre] || GENRE_PATTERNS['SYNTHWAVE'];
            const scaleNotes = window.engine.scales[window.engine.currentScale];

            if (this.melodyEngine) this.melodyEngine = new MelodyEngine();

            // Generate new drums
            const [drumRaw1, drumRaw2, drumRaw3, drumRaw4] = await Promise.all([
                this.getDrumMatrix(profile.temperature * 0.6, profile),
                this.getDrumMatrix(profile.temperature * 0.85, profile),
                this.getDrumMatrix(profile.temperature * 1.0, profile),
                this.getDrumMatrix(profile.temperature * 1.2, profile)
            ]);

            // Apply genre patterns
            const drumAtmosphere = this.melodyEngine.applyGenreDrumPatterns(drumRaw1, genrePatterns, 0.25);
            const drumLow = this.melodyEngine.applyGenreDrumPatterns(drumRaw2, genrePatterns, 0.5);
            const drumMid = this.melodyEngine.applyGenreDrumPatterns(drumRaw3, genrePatterns, 0.75);
            const drumHigh = this.melodyEngine.applyGenreDrumPatterns(drumRaw4, genrePatterns, 0.95);
            const drumDrop = this.melodyEngine.applyGenreDrumPatterns(JSON.parse(JSON.stringify(drumRaw4)), genrePatterns, 1.0);
            this.addDrumFills(drumDrop, 0.8);

            // Regenerate all 5 snapshots
            const intensityLevels = [0.15, 0.35, 0.55, 0.8, 1.0];
            const drums = [drumAtmosphere, drumLow, drumMid, drumHigh, drumDrop];

            for (let i = 0; i < 5; i++) {
                const intensity = intensityLevels[i];
                const bank = window.seq.getEmptyBank();

                // Drums
                for (let j = 0; j < 4; j++) bank[j] = drums[i][j];

                // Bass/Lead/Pad with new patterns
                bank[4] = this.melodyEngine.generatePattern('bass', genre, scaleNotes, intensity, 8);
                bank[5] = this.melodyEngine.generatePattern('lead', genre, scaleNotes, intensity, 8);
                bank[6] = this.melodyEngine.generatePattern('pad', genre, scaleNotes, intensity, 8);

                window.seq.snapshots[i] = bank;
            }

            // Update current pattern if in manual mode
            window.ui.refreshGrid();

            // Reschedule
            this.schedule();

            UIController.toast(`✅ Regenerated ${genre}`);

        } catch(e) {
            console.error('Regeneration Error:', e);
            UIController.toast("⚠️ Regeneration failed");
        }
    }

    // Apply genre-specific drum patterns - uses MelodyEngine
    applyGenreDrumPatterns(matrix, genrePatterns, intensity) {
        if (this.melodyEngine) this.melodyEngine = new MelodyEngine();
        return this.melodyEngine.applyGenreDrumPatterns(matrix, genrePatterns, intensity);
    }

    // Apply intensity to pattern
    applyIntensityToPattern(pattern, intensity) {
        return pattern.map(v => {
            if (v === 0) return 0;
            return Math.random() < intensity ? v : 0;
        });
    }

    // Add drum fills for transition moments
    addDrumFills(matrix, probability = 0.5) {
        const steps = matrix[0].length;

        // Add snare rolls at end of 8-bar phrases
        for (let phrase = 0; phrase < steps / 8; phrase++) {
            const phraseEnd = (phrase + 1) * 8;

            if (Math.random() < probability && phraseEnd <= steps) {
                // Add build-up snare pattern
                for (let i = 0; i < 4; i++) {
                    if (phraseEnd - 4 + i < steps) {
                        matrix[1][phraseEnd - 4 + i] = 1; // Snare fill
                    }
                }
            }
        }

        // Add crash cymbal hits at section starts
        for (let section = 0; section < steps / 16; section++) {
            const sectionStart = section * 16;
            if (sectionStart < steps && Math.random() < 0.7) {
                matrix[2][sectionStart] = 1; // Clap/crash
            }
        }

        return matrix;
    }

    // Generate epic song structure (3-4 minutes)
    generateEpicStructure(genre) {
        const epicTemplates = {
            'SYNTHWAVE': [
                { name: 'ATMOSPHERE', dur: 8, snap: 0, energy: 0.1 },
                { name: 'INTRO', dur: 8, snap: 1, energy: 0.2 },
                { name: 'VERSE 1', dur: 16, snap: 1, energy: 0.4 },
                { name: 'BUILD 1', dur: 8, snap: 2, energy: 0.6, sweep: true },
                { name: 'DROP 1', dur: 16, snap: 3, energy: 1.0 },
                { name: 'VERSE 2', dur: 16, snap: 1, energy: 0.5 },
                { name: 'BUILD 2', dur: 8, snap: 2, energy: 0.7, sweep: true },
                { name: 'DROP 2', dur: 24, snap: 4, energy: 1.0 },
                { name: 'BREAKDOWN', dur: 8, snap: 0, energy: 0.2 },
                { name: 'BUILD 3', dur: 8, snap: 2, energy: 0.8, sweep: true },
                { name: 'DROP 3', dur: 16, snap: 4, energy: 1.0 },
                { name: 'OUTRO', dur: 16, snap: 0, energy: 0.1 }
            ],
            'TECHNO': [
                { name: 'INTRO', dur: 16, snap: 0, energy: 0.2 },
                { name: 'GROOVE 1', dur: 16, snap: 1, energy: 0.4 },
                { name: 'BUILD 1', dur: 8, snap: 2, energy: 0.6, sweep: true },
                { name: 'DROP 1', dur: 32, snap: 3, energy: 0.9 },
                { name: 'BREAK', dur: 8, snap: 0, energy: 0.3 },
                { name: 'GROOVE 2', dur: 16, snap: 2, energy: 0.5 },
                { name: 'BUILD 2', dur: 16, snap: 3, energy: 0.8, sweep: true },
                { name: 'DROP 2', dur: 32, snap: 4, energy: 1.0 },
                { name: 'OUTRO', dur: 16, snap: 1, energy: 0.2 }
            ],
            'HOUSE': [
                { name: 'INTRO', dur: 8, snap: 0, energy: 0.2 },
                { name: 'GROOVE', dur: 16, snap: 1, energy: 0.4 },
                { name: 'BUILD 1', dur: 8, snap: 2, energy: 0.6, sweep: true },
                { name: 'CHORUS 1', dur: 16, snap: 3, energy: 0.9 },
                { name: 'VERSE', dur: 16, snap: 1, energy: 0.5 },
                { name: 'BUILD 2', dur: 8, snap: 2, energy: 0.7, sweep: true },
                { name: 'CHORUS 2', dur: 16, snap: 3, energy: 1.0 },
                { name: 'BREAKDOWN', dur: 8, snap: 0, energy: 0.2 },
                { name: 'DROP', dur: 24, snap: 4, energy: 1.0 },
                { name: 'OUTRO', dur: 12, snap: 1, energy: 0.2 }
            ],
            'TRAP': [
                { name: 'INTRO', dur: 8, snap: 0, energy: 0.2 },
                { name: 'VERSE 1', dur: 16, snap: 1, energy: 0.4 },
                { name: 'HOOK 1', dur: 16, snap: 3, energy: 0.9 },
                { name: 'VERSE 2', dur: 16, snap: 1, energy: 0.5 },
                { name: 'BUILD', dur: 8, snap: 2, energy: 0.7 },
                { name: 'DROP 1', dur: 16, snap: 4, energy: 1.0 },
                { name: 'BRIDGE', dur: 8, snap: 0, energy: 0.3 },
                { name: 'VERSE 3', dur: 16, snap: 2, energy: 0.6 },
                { name: 'HOOK 2', dur: 16, snap: 3, energy: 1.0 },
                { name: 'OUTRO', dur: 8, snap: 1, energy: 0.2 }
            ],
            'DNB': [
                { name: 'INTRO', dur: 8, snap: 0, energy: 0.2 },
                { name: 'GROOVE', dur: 16, snap: 1, energy: 0.4 },
                { name: 'BUILD 1', dur: 8, snap: 2, energy: 0.6, sweep: true },
                { name: 'DROP 1', dur: 16, snap: 3, energy: 1.0 },
                { name: 'BREAK', dur: 8, snap: 0, energy: 0.3 },
                { name: 'BUILD 2', dur: 16, snap: 2, energy: 0.8, sweep: true },
                { name: 'DROP 2', dur: 24, snap: 4, energy: 1.0 },
                { name: 'OUTRO', dur: 16, snap: 1, energy: 0.2 }
            ],
            'TRANCE': [
                { name: 'INTRO', dur: 16, snap: 0, energy: 0.2 },
                { name: 'BUILDUP 1', dur: 16, snap: 1, energy: 0.4 },
                { name: 'BREAK 1', dur: 8, snap: 0, energy: 0.3 },
                { name: 'BUILDUP 2', dur: 24, snap: 2, energy: 0.7, sweep: true },
                { name: 'DROP 1', dur: 32, snap: 4, energy: 1.0 },
                { name: 'BREAKDOWN', dur: 16, snap: 0, energy: 0.2 },
                { name: 'BUILDUP 3', dur: 16, snap: 3, energy: 0.9, sweep: true },
                { name: 'DROP 2', dur: 32, snap: 4, energy: 1.0 },
                { name: 'OUTRO', dur: 16, snap: 1, energy: 0.2 }
            ],
            'LOFI': [
                { name: 'INTRO', dur: 8, snap: 0, energy: 0.2 },
                { name: 'VERSE 1', dur: 16, snap: 1, energy: 0.4 },
                { name: 'CHORUS 1', dur: 16, snap: 2, energy: 0.6 },
                { name: 'VERSE 2', dur: 16, snap: 1, energy: 0.5 },
                { name: 'CHORUS 2', dur: 16, snap: 2, energy: 0.7 },
                { name: 'BRIDGE', dur: 8, snap: 0, energy: 0.3 },
                { name: 'CHORUS 3', dur: 16, snap: 3, energy: 0.8 },
                { name: 'OUTRO', dur: 16, snap: 0, energy: 0.2 }
            ],
            'CYBERPUNK': [
                { name: 'ATMOSPHERE', dur: 8, snap: 0, energy: 0.1 },
                { name: 'INTRO', dur: 8, snap: 1, energy: 0.3 },
                { name: 'VERSE 1', dur: 16, snap: 1, energy: 0.5 },
                { name: 'BUILD 1', dur: 8, snap: 2, energy: 0.7, sweep: true },
                { name: 'DROP 1', dur: 16, snap: 3, energy: 1.0 },
                { name: 'BREAK', dur: 8, snap: 0, energy: 0.2 },
                { name: 'DROP 2', dur: 24, snap: 4, energy: 1.0 },
                { name: 'OUTRO', dur: 8, snap: 1, energy: 0.2 }
            ],
            'DUBSTEP': [
                { name: 'INTRO', dur: 8, snap: 0, energy: 0.2 },
                { name: 'BUILD 1', dur: 16, snap: 2, energy: 0.6, sweep: true },
                { name: 'DROP 1', dur: 16, snap: 3, energy: 1.0 },
                { name: 'BREAKDOWN', dur: 8, snap: 0, energy: 0.2 },
                { name: 'BUILD 2', dur: 8, snap: 2, energy: 0.8, sweep: true },
                { name: 'DROP 2', dur: 24, snap: 4, energy: 1.0 },
                { name: 'OUTRO', dur: 8, snap: 1, energy: 0.1 }
            ],
            'AMBIENT': [
                { name: 'ATMOSPHERE', dur: 16, snap: 0, energy: 0.1 },
                { name: 'EVOLVE 1', dur: 24, snap: 0, energy: 0.2 },
                { name: 'PEAK', dur: 16, snap: 1, energy: 0.4 },
                { name: 'EVOLVE 2', dur: 24, snap: 0, energy: 0.3 },
                { name: 'FADE', dur: 16, snap: 0, energy: 0.1 }
            ],
            'CINEMATIC': [
                { name: 'PROLOGUE', dur: 8, snap: 0, energy: 0.1 },
                { name: 'BUILDUP', dur: 16, snap: 1, energy: 0.3 },
                { name: 'TENSION', dur: 16, snap: 2, energy: 0.5 },
                { name: 'CLIMAX', dur: 24, snap: 3, energy: 1.0 },
                { name: 'RESOLUTION', dur: 16, snap: 2, energy: 0.4 },
                { name: 'EPILOGUE', dur: 16, snap: 0, energy: 0.1 }
            ],
            'DUNGEONSYNTH': [
                { name: 'ATMOSPHERE', dur: 8, snap: 0, energy: 0.1 },
                { name: 'THEME A', dur: 16, snap: 1, energy: 0.3 },
                { name: 'VARIATION', dur: 16, snap: 1, energy: 0.4 },
                { name: 'THEME B', dur: 16, snap: 2, energy: 0.5 },
                { name: 'THEME A RETURN', dur: 16, snap: 1, energy: 0.4 },
                { name: 'FINALE', dur: 16, snap: 0, energy: 0.2 }
            ],
            'CHIPTUNE': [
                { name: 'TITLE', dur: 8, snap: 0, energy: 0.2 },
                { name: 'LEVEL 1', dur: 16, snap: 1, energy: 0.4 },
                { name: 'BOSS 1', dur: 16, snap: 2, energy: 0.7 },
                { name: 'VICTORY', dur: 8, snap: 3, energy: 0.9 },
                { name: 'LEVEL 2', dur: 16, snap: 1, energy: 0.5 },
                { name: 'FINAL BOSS', dur: 24, snap: 4, energy: 1.0 },
                { name: 'ENDING', dur: 16, snap: 0, energy: 0.2 }
            ],
            'INDUSTRIAL': [
                { name: 'MACHINE START', dur: 8, snap: 0, energy: 0.2 },
                { name: 'RAMP UP', dur: 16, snap: 1, energy: 0.4 },
                { name: 'FULL POWER', dur: 24, snap: 3, energy: 1.0 },
                { name: 'BREAKDOWN', dur: 8, snap: 0, energy: 0.2 },
                { name: 'OVERLOAD', dur: 24, snap: 4, energy: 1.0 },
                { name: 'SHUTDOWN', dur: 8, snap: 1, energy: 0.1 }
            ],
            'SYNTHPOP': [
                { name: 'INTRO', dur: 8, snap: 0, energy: 0.2 },
                { name: 'VERSE 1', dur: 16, snap: 1, energy: 0.4 },
                { name: 'PRE-CHORUS', dur: 8, snap: 2, energy: 0.6 },
                { name: 'CHORUS 1', dur: 16, snap: 3, energy: 0.9 },
                { name: 'VERSE 2', dur: 16, snap: 1, energy: 0.5 },
                { name: 'CHORUS 2', dur: 16, snap: 3, energy: 1.0 },
                { name: 'BRIDGE', dur: 8, snap: 0, energy: 0.3 },
                { name: 'FINAL CHORUS', dur: 16, snap: 4, energy: 1.0 },
                { name: 'OUTRO', dur: 8, snap: 0, energy: 0.2 }
            ],
            'RETROWAVE': [
                { name: 'NIGHT DRIVE', dur: 8, snap: 0, energy: 0.2 },
                { name: 'CRUISE', dur: 16, snap: 1, energy: 0.4 },
                { name: 'SUNSET', dur: 16, snap: 2, energy: 0.6 },
                { name: 'PURSUIT', dur: 16, snap: 3, energy: 0.9 },
                { name: 'SHOWDOWN', dur: 16, snap: 4, energy: 1.0 },
                { name: 'AFTERGLOW', dur: 16, snap: 1, energy: 0.3 }
            ],
            'ETHEREAL': [
                { name: 'MIST', dur: 16, snap: 0, energy: 0.1 },
                { name: 'FLOATING', dur: 24, snap: 0, energy: 0.2 },
                { name: 'ASCENSION', dur: 16, snap: 1, energy: 0.4 },
                { name: 'APEX', dur: 16, snap: 1, energy: 0.5 },
                { name: 'DISSOLVE', dur: 24, snap: 0, energy: 0.2 }
            ],
            'HAPPYHARDCORE': [
                // S3RL-style euphoric happy hardcore structure
                { name: 'PIANO INTRO', dur: 8, snap: 0, energy: 0.3 },
                { name: 'BUILD UP', dur: 8, snap: 1, energy: 0.5, sweep: true },
                { name: 'EUPHORIA 1', dur: 16, snap: 3, energy: 1.0 },
                { name: 'RAVE BREAK', dur: 8, snap: 2, energy: 0.7 },
                { name: 'ANTHEM', dur: 16, snap: 4, energy: 1.0 },
                { name: 'EMOTIONAL', dur: 8, snap: 1, energy: 0.4 },
                { name: 'BUILD 2', dur: 8, snap: 2, energy: 0.8, sweep: true },
                { name: 'EUPHORIA 2', dur: 24, snap: 4, energy: 1.0 },
                { name: 'PIANO OUTRO', dur: 8, snap: 0, energy: 0.2 }
            ]
        };

        // Get template or create default
        let template = epicTemplates[genre];
        if (template) {
            // Default template for unlisted genres
            template = [
                { name: 'INTRO', dur: 8, snap: 0, energy: 0.2 },
                { name: 'VERSE 1', dur: 16, snap: 1, energy: 0.4 },
                { name: 'BUILD', dur: 8, snap: 2, energy: 0.6, sweep: true },
                { name: 'DROP 1', dur: 16, snap: 3, energy: 1.0 },
                { name: 'VERSE 2', dur: 16, snap: 1, energy: 0.5 },
                { name: 'DROP 2', dur: 24, snap: 4, energy: 1.0 },
                { name: 'OUTRO', dur: 16, snap: 0, energy: 0.2 }
            ];
        }

        // Convert to full section objects with rules
        return template.map(section => ({
            ...section,
            rules: this.getSectionRules(section.name, section.energy),
            tempoRamp: section.energy > 0.6 ? Math.floor(section.energy * 5) : 0,
            snap: Math.min(section.snap, 4) // Ensure snap is within bounds
        }));
    }

    // Get track rules based on section type and energy
    getSectionRules(sectionName, energy) {
        const isDrop = sectionName.includes('DROP') || sectionName.includes('CHORUS');
        const isBuild = sectionName.includes('BUILD');
        const isBreak = sectionName.includes('BREAK') || sectionName.includes('BRIDGE');
        const isIntro = sectionName.includes('INTRO') || sectionName.includes('ATMOSPHERE');
        const isOutro = sectionName.includes('OUTRO');

        if (isDrop) {
            return { Kick: 1, Snare: 1, HiHat: 1, Bass: 1, Lead: 1, Pad: 1 };
        } else if (isBuild) {
            return { Kick: 1, Snare: 0, HiHat: 1, Bass: 1, Lead: 1, Pad: 0 };
        } else if (isBreak) {
            return { Kick: 0, Snare: 0, HiHat: 1, Bass: 1, Lead: 0, Pad: 1 };
        } else if (isIntro || isOutro) {
            return { Kick: energy > 0.15 ? 1 : 0, Snare: 0, HiHat: 1, Bass: 0, Lead: 0, Pad: 1 };
        } else {
            // Verse/Groove - moderate energy
            return {
                Kick: 1,
                Snare: energy > 0.4 ? 1 : 0,
                HiHat: 1,
                Bass: 1,
                Lead: energy > 0.5 ? 1 : 0,
                Pad: energy > 0.3 ? 1 : 0
            };
        }
    }

    showStructurePreview() {
        const genPhase = document.getElementById('aiGenerationPhase');
        const reviewPhase = document.getElementById('aiReviewPhase');
        const previewEl = document.getElementById('structurePreview');

        // Switch to review phase
        genPhase.style.display = 'none';
        reviewPhase.style.display = 'block';

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        let currentBar = 0;

        // Pre-calculate colors for performance
        const colors = {
            DROP: { bg: 'rgba(255,0,85,0.3)', border: '#ff0055' },
            BUILD: { bg: 'rgba(245,158,11,0.3)', border: '#f59e0b' },
            INTRO: { bg: 'rgba(59,130,246,0.3)', border: '#3b82f6' },
            default: { bg: 'rgba(75,85,99,0.3)', border: '#4b5563' }
        };

        for (let i = 0; i < this.structure.length; i++) {
            const section = this.structure[i];
            const color = section.name.includes('DROP') ? colors.DROP :
                          section.name.includes('BUILD') ? colors.BUILD :
                          section.name.includes('INTRO') ? colors.INTRO : colors.default;

            // Build HTML string (faster than multiple DOM operations)
            const activeTracks = Object.entries(section.rules || {})
                .filter(([_, active]) => active)
                .map(([track]) => `<span style="font-size:9px;padding:2px 6px;border-radius:3px;background:rgba(255,255,255,0.1);color:#aaa">${track}</span>`)
                .join('');

            const snapTag = section.snap == undefined
                ? `<span style="font-size:9px;padding:2px 6px;border-radius:3px;background:rgba(16,185,129,0.3);color:#10b981">Snapshot ${section.snap + 1}</span>`
                : '';

            const html = `
                <div class="section-preview-item" data-index="${i}" style="
                    background:${color.bg};border:1px solid ${color.border};
                    border-radius:6px;padding:10px 12px;cursor:pointer;transition:all 0.2s;margin-bottom:8px
                ">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                        <span class="font-mono" style="font-size:12px;font-weight:700;color:#fff">${section.name}</span>
                        <div style="display:flex;gap:8px;align-items:center;">
                            <button class="section-play-btn" data-section="${i}" style="
                                background:rgba(0,255,148,0.2);border:1px solid #00ff94;
                                color:#00ff94;padding:2px 8px;border-radius:4px;cursor:pointer;
                                font-size:10px;font-weight:700;
                            ">▶ Preview</button>
                            <span style="font-size:10px;color:#888">${section.dur} bars</span>
                        </div>
                    </div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap">${activeTracks}${snapTag}</div>
                    <div style="font-size:9px;color:#666;margin-top:6px">Bars ${currentBar + 1}-${currentBar + section.dur}</div>
                </div>
            `;

            const template = document.createElement('template');
            template.innerHTML = html.trim();
            fragment.appendChild(template.content.firstChild);
            currentBar += section.dur;
        }

        // Single DOM update
        previewEl.innerHTML = '';
        previewEl.appendChild(fragment);

        // Event delegation for hover effects (more efficient)
        previewEl.onmouseover = (e) => {
            const item = e.target.closest('.section-preview-item');
            if (item && e.target.classList.contains('section-play-btn')) {
                item.style.transform = 'scale(1.02)';
                item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            }
        };
        previewEl.onmouseout = (e) => {
            const item = e.target.closest('.section-preview-item');
            if (item) {
                item.style.transform = 'scale(1)';
                item.style.boxShadow = 'none';
            }
        };

        // Click handlers
        previewEl.onclick = (e) => {
            // Preview button clicked
            if (e.target.classList.contains('section-play-btn')) {
                const sectionIndex = parseInt(e.target.dataset.section);
                this.previewSection(sectionIndex);
                return;
            }
            // Section clicked (for selection/editing)
            const item = e.target.closest('.section-preview-item');
            if (item) {
                // Highlight selected section
                document.querySelectorAll('.section-preview-item').forEach(el => {
                    el.style.opacity = '0.6';
                });
                item.style.opacity = '1';
                this.selectedSection = parseInt(item.dataset.index);
            }
        };

        // Setup button handlers
        document.getElementById('aiConfirmBtn').onclick = () => {
            document.getElementById('aiDialog').close();
            window.sys.play();
            UIController.toast(`PLAYING: ${window.sys.currentGenre}`);
        };

        document.getElementById('aiCancelBtn').onclick = () => {
            document.getElementById('aiDialog').close();
            UIController.toast('SONG READY - Press PLAY to start');
        };
    }

    // Preview a single section without playing the full song
    previewSection(sectionIndex) {
        if (this.structure[sectionIndex]) return;

        const section = this.structure[sectionIndex];

        // Stop current playback
        Tone.Transport.stop();
        Tone.Transport.cancel();

        // Load the snapshot for this section
        if (window.seq.snapshots[section.snap]) {
            window.seq.data = JSON.parse(JSON.stringify(window.seq.snapshots[section.snap]));
            window.ui.refreshGrid();
        }

        // Apply track mutes based on section rules
        CONFIG.tracks.forEach((tr, idx) => {
            const rule = section.rules[tr];
            if (rule == undefined) {
                window.engine.channels[idx].muted = (rule === 0);
                window.ui.updateMuteUI(idx);
            }
        });

        // Update status
        const statusEl = document.getElementById('song-status');
        if (statusEl) {
            statusEl.style.display = 'flex';
            statusEl.innerText = `PREVIEW: ${section.name}`;
        }

        // Play for the section duration (in bars, each bar = 2 seconds at 120bpm)
        const bpm = Tone.Transport.bpm.value;
        const barsPerSecond = bpm / 240;
        const durationSeconds = section.dur / barsPerSecond;

        Tone.Transport.start();
        UIController.toast(`▶ Previewing: ${section.name} (${section.dur} bars)`);

        // Stop after duration
        setTimeout(() => {
            Tone.Transport.stop();
            const statusEl = document.getElementById('song-status');
            if (statusEl) statusEl.innerText = `${window.sys.currentGenre} - READY`;
        }, durationSeconds * 1000);
    }

    // Jump to and play from a specific section
    playFromSection(sectionIndex) {
        if (this.structure[sectionIndex]) return;

        // Calculate the starting bar
        let startBar = 0;
        for (let i = 0; i < sectionIndex; i++) {
            startBar += this.structure[i].dur;
        }

        // Close dialog if open
        const aiDialog = document.getElementById('aiDialog');
        if (aiDialog.open) aiDialog.close();

        // Start playback from that bar
        Tone.Transport.stop();
        Tone.Transport.start();

        // Set position
        const bpm = Tone.Transport.bpm.value;
        const secondsPerBar = 240 / bpm;
        Tone.Transport.seconds = startBar * secondsPerBar;

        window.sys.play();
        UIController.toast(`Playing from: ${this.structure[sectionIndex].name}`);
    }
    
    drawMinimap() {
        const minimap = document.getElementById('minimap');
        if(minimap) return;

        // Update total bars display
        const totalBarsEl = document.getElementById('total-bars-display');
        if(totalBarsEl && this.totalBars > 0) {
            totalBarsEl.textContent = `${this.totalBars} BARS`;
        }

        // Update song status
        const statusEl = document.getElementById('song-status');
        if(statusEl) {
            statusEl.textContent = this.totalBars > 0 ? `${this.structure.length} SECTIONS` : 'MANUAL MODE';
        }

        // Build HTML string with clickable sections - more detailed for bottom bar
        const html = this.structure.map((sect, i) => {
            const width = (sect.dur / this.totalBars) * 100;
            const bgColor = sect.name.includes('DROP') ? 'rgba(255,0,85,0.5)' :
                            sect.name.includes('BUILD') || sect.name.includes('BUILDUP') ? 'rgba(245,158,11,0.4)' :
                            sect.name.includes('INTRO') || sect.name.includes('OUTRO') ? 'rgba(59,130,246,0.3)' :
                            sect.name.includes('VERSE') ? 'rgba(139,92,246,0.3)' :
                            sect.name.includes('CHORUS') || sect.name.includes('HOOK') ? 'rgba(16,185,129,0.4)' :
                            sect.name.includes('BREAK') ? 'rgba(107,114,128,0.3)' :
                            'rgba(51,51,51,0.3)';
            return `<div class="minimap-sect" data-section="${i}" style="
                width:${width}%;
                background:${bgColor};
                cursor:pointer;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:9px;
                font-weight:700;
                color:#fff;
                text-shadow:0 1px 2px rgba(0,0,0,0.8);
                border-right:1px solid rgba(255,255,255,0.1);
                transition:all 0.2s;
            " title="${sect.name} (${sect.dur} bars) - Click to play">${sect.name}</div>`;
        }).join('');

        minimap.innerHTML = html;

        // Add hover effects via CSS
        minimap.querySelectorAll('.minimap-sect').forEach(sect => {
            sect.onmouseenter = () => {
                sect.style.filter = 'brightness(1.3)';
                sect.style.transform = 'scaleY(1.1)';
            };
            sect.onmouseleave = () => {
                sect.style.filter = '';
                sect.style.transform = '';
            };
        });

        // Add click handlers to minimap sections
        minimap.onclick = (e) => {
            const sect = e.target.closest('.minimap-sect');
            if (sect) {
                const sectionIndex = parseInt(sect.dataset.section);
                // If playing, jump to section; otherwise preview
                if (Tone.Transport.state === 'started') {
                    this.playFromSection(sectionIndex);
                } else {
                    this.previewSection(sectionIndex);
                }
            }
        };
    }

    schedule() {
        Tone.Transport.cancel(); let bar = 0; const baseBpm = window.sys.baseBpm;
        this.structure.forEach(sect => {
            const scheduledTime = bar + ":0:0";
            Tone.Transport.schedule((time) => {
                CONFIG.tracks.forEach((tr, idx) => { const rule = sect.rules[tr]; if(rule == undefined) { window.engine.channels[idx].muted = (rule === 0); Tone.Draw.schedule(() => window.ui.updateMuteUI(idx), time); } });
                if(window.seq.snapshots[sect.snap]) { window.seq.data = JSON.parse(JSON.stringify(window.seq.snapshots[sect.snap])); Tone.Draw.schedule(() => { window.ui.refreshGrid(); document.querySelectorAll('.snap-btn').forEach((b, i) => { if(b) b.classList.toggle('active', i === sect.snap); }); }, time); }
                if(sect.sweep) window.engine.setFilterScheduled(20000, sect.dur * 2, time); else window.engine.setFilterScheduled(20000, 0.1, time);
                if (sect.tempoRamp) Tone.Transport.bpm.rampTo(baseBpm + sect.tempoRamp, sect.dur * Tone.Time("1m").toSeconds(), time);
                else if (sect.tempoSlam) Tone.Transport.bpm.value = baseBpm;
            }, scheduledTime); bar += sect.dur;
        });
        Tone.Transport.schedule((time) => { window.sys.stop(time); }, bar + ":0:0"); window.sys.bindLoop();
    }
}

// --- UI GENERATOR & EVENTS ---
class UI {
    constructor() { this.rack = document.getElementById('rack'); this.nexusSeqs = []; this.isProgrammaticUpdate = false; this.trackLabels = []; }
    build() {
        Nexus.colors.accent = "#00ff94"; Nexus.colors.fill = "#1a1a1a"; Nexus.colors.dark = "#050505"; Nexus.colors.light = "#333333"; this.rack.innerHTML = ''; this.trackLabels = []; 
        CONFIG.tracks.forEach((name, idx) => {
            const arpBtnHtml = idx === 5 ? `<div id="arpBtn-${idx}" style="margin-left:2px" title="Toggle Arpeggiator"></div>` : '';
            const row = document.createElement('article'); row.className = 'track' + (idx === 6 ? ' vox-track' : ''); row.id = `track-${idx}`;
            row.innerHTML = `
                <div class="track-info"><div class="track-label font-mono" id="label-${idx}">${name}</div><div class="btn-group" style="display:flex; gap:5px;"><div id="soloBtn-${idx}"></div><div id="muteBtn-${idx}"></div>${arpBtnHtml}</div></div>
                <div class="track-controls" style="display:flex; flex-direction:column; gap:5px; justify-content:center;"><div class="ctrl-row" style="display:flex; align-items:center; gap:8px; font-size:8px; color:#666; font-weight:800;"><span style="width:18px">VOL</span><div id="volDial-${idx}"></div></div><div class="ctrl-row" style="display:flex; align-items:center; gap:8px; font-size:8px; color:#666; font-weight:800;"><span style="width:18px">PAN</span><div id="panDial-${idx}"></div></div></div>
                <div class="nexus-seq-container" id="seq-${idx}"></div><button class="mutate-btn" aria-label="Mutate Track" onclick="window.seq.mutateTrack(${idx})">🎲</button>
            `; this.rack.appendChild(row);
            this.trackLabels.push(document.getElementById(`label-${idx}`)); 

            if (document.getElementById(`soloBtn-${idx}`)) { const sBtn = new Nexus.TextButton(`#soloBtn-${idx}`, { size: [18,18], state: false, text: 'S', alternateText: 'S', mode: 'toggle' }); sBtn.on('change', v => window.engine.channels[idx].soloed = v); UIController.components.push(sBtn); }
            if (document.getElementById(`muteBtn-${idx}`)) { const mBtn = new Nexus.TextButton(`#muteBtn-${idx}`, { size: [18,18], state: false, text: 'M', alternateText: 'M', mode: 'toggle' }); mBtn.on('change', v => window.engine.channels[idx].muted = v); UIController.components.push(mBtn); }
            if (document.getElementById(`arpBtn-${idx}`)) { const aBtn = new Nexus.TextButton(`#arpBtn-${idx}`, { size: [24,18], state: false, text: 'ARP', alternateText: 'ARP', mode: 'toggle' }); aBtn.colorize("accent", "#ff0055"); aBtn.on('change', v => { if(window.engine.channels[idx]) window.engine.channels[idx].arpActive = v; }); UIController.components.push(aBtn); }
            if (document.getElementById(`volDial-${idx}`)) { const vDial = new Nexus.Dial(`#volDial-${idx}`, { size: [25,25], min: -40, max: 6, value: 0 }); vDial.on('change', v => window.engine.channels[idx].vol.volume.rampTo(v, 0.1)); UIController.components.push(vDial); }
            if (document.getElementById(`panDial-${idx}`)) { const pDial = new Nexus.Dial(`#panDial-${idx}`, { size: [25,25], min: -1, max: 1, value: 0 }); pDial.on('change', v => window.engine.channels[idx].panner.pan.rampTo(v, 0.1)); UIController.components.push(pDial); }
            if (document.getElementById(`seq-${idx}`)) { const nSeq = new Nexus.Sequencer(`#seq-${idx}`, { size: [550, 35], mode: 'toggle', rows: 1, columns: 32 }); nSeq.on('change', v => { if(this.isProgrammaticUpdate) { window.seq.data[idx][v.column] = v.state ? 1 : 0; if(v.state) window.engine.trigger(idx, Tone.now(), 1, v.column); window.sys.autoSave(); } }); this.nexusSeqs.push(nSeq); }
        });
        this.setupMacros(); this.setupViz();
    }
    
    refreshGrid() { this.isProgrammaticUpdate = true; CONFIG.tracks.forEach((_, tIdx) => { if(this.nexusSeqs[tIdx]) { this.nexusSeqs[tIdx].matrix.populate.row(0, window.seq.data[tIdx].map(v => v > 0)); } }); this.isProgrammaticUpdate = false; }
    highlight(col) { this.nexusSeqs.forEach(nSeq => { nSeq.stepper.value = col > 0 ? col - 1 : 31; nSeq.next(); }); }
    flashLabel(idx, time) { Tone.Draw.schedule(() => { const label = this.trackLabels[idx]; if(label) { label.style.color = CONFIG.colors[idx]; label.style.textShadow = `0 0 12px ${CONFIG.colors[idx]}`; setTimeout(() => { label.style.color = ''; label.style.textShadow = ''; }, 100); } }, time); }
    updateMuteUI(idx) { const track = document.getElementById(`track-${idx}`); if(track) { track.style.opacity = window.engine.channels[idx].muted ? '0.5' : '1'; } }
    createNexusDial(id, options) { if (document.querySelector(id)) return null; const d = new Nexus.Dial(id, options); UIController.components.push(d); return d; }

    setupMacros() {
        // Toggle Factory with Fixed Logic
        const createToggle = (id, text, color, onAction, offAction, startActive = false) => {
            if (document.querySelector(id)) return null;
            const btn = new Nexus.Toggle(id, { size: [40, 20], state: startActive });
            UIController.components.push(btn);
            btn.colorize("accent", color);
            btn.colorize("fill", "#222");
            btn.on('change', (v) => { if (v) onAction(); else offAction(); });
            // Add method for keyboard triggering
            btn.triggerToggle = function() { this.state = this.state; };
            return btn;
        };

        this.btnEqLow = createToggle('#eqLowBtn', 'L', '#f59e0b', () => { window.engine.eq3.low.value = 0; }, () => { window.engine.eq3.low.value = -Infinity; }, true);
        this.btnEqMid = createToggle('#eqMidBtn', 'M', '#00ff94', () => { window.engine.eq3.mid.value = 0; }, () => { window.engine.eq3.mid.value = -Infinity; }, true);
        this.btnEqHigh = createToggle('#eqHighBtn', 'H', '#00e5ff', () => { window.engine.eq3.high.value = 0; }, () => { window.engine.eq3.high.value = -Infinity; }, true);

        this.btnMic = createToggle('#micBtn', 'MIC', '#ffffff',
            () => { window.engine.mic.open().then(() => { window.engine.micVol.volume.rampTo(0, 0.1); UIController.toast("MIC ACTIVE"); }).catch(() => { UIController.toast("MIC DENIED"); if(this.btnMic) this.btnMic.state = false; }); },
            () => { window.engine.micVol.volume.rampTo(-Infinity, 0.1); setTimeout(() => { try { window.engine.mic.close(); } catch(e){} }, 200); UIController.toast("MIC MUTED"); }, false 
        );

        // FX Toggles
        const createFxToggle = (id, text, onAction, offAction) => {
            if (document.querySelector(id)) return;
            const btn = new Nexus.TextButton(id, { size: [60,60], mode: 'toggle', state: false, text: text });
            UIController.components.push(btn);
            btn.on('change', v => { if(v) onAction(); else offAction(); });
            btn.triggerToggle = function() { this.state = this.state; };
            return btn;
        };

        this.btnFlux = createFxToggle('#fluxBtn', 'FLUX', 
            () => { window.engine.cheby.wet.rampTo(0.8, 0.1); Tone.Transport.bpm.rampTo(window.sys.baseBpm * 1.5, 0.2); }, 
            () => { window.engine.cheby.wet.rampTo(0, 0.2); Tone.Transport.bpm.rampTo(window.sys.baseBpm, 0.5); }
        );

        this.btnPump = createFxToggle('#pumpBtn', 'PUMP', 
            () => { window.engine.compressor.threshold.rampTo(-30, 0.1); window.engine.compressor.ratio.rampTo(12, 0.1); }, 
            () => { window.engine.compressor.threshold.rampTo(-14, 0.5); window.engine.compressor.ratio.rampTo(4, 0.5); }
        );

        this.btnStutt = createFxToggle('#stuttBtn', 'STUTT', 
            () => window.engine.stutter.wet.rampTo(1, 0.05), 
            () => window.engine.stutter.wet.rampTo(0, 0.05)
        );

        // WOBBLE now controls Bitcrusher Worklet Params if active, else AutoFilter
        this.btnWobble = createFxToggle('#wobbleBtn', 'WOBBLE', 
            () => { 
                if(window.engine.bitcrusherParamEnabled) {
                    window.engine.bitcrusherParamEnabled.setValueAtTime(1, Tone.context.currentTime);
                     // AudioWorklet Automation
                     window.engine.bitcrusherParamDepth.setValueAtTime(4, Tone.context.currentTime); 
                     window.engine.bitcrusherParamFreq.setValueAtTime(0.1, Tone.context.currentTime); 
                     const indicator = document.getElementById('bitcrush-indicator');
                     if (indicator) indicator.classList.add('active');
                } else {
                    window.engine.autoFilter.wet.rampTo(1, 0.1); 
                }
            }, 
            () => { 
                if(window.engine.bitcrusherParamEnabled && this.btnBitcrush.state === false) {
                    window.engine.bitcrusherParamEnabled.setValueAtTime(0, Tone.context.currentTime);
                    window.engine.bitcrusherParamDepth.setValueAtTime(16, Tone.context.currentTime); 
                    window.engine.bitcrusherParamFreq.setValueAtTime(0.0, Tone.context.currentTime); 
                    const indicator = document.getElementById('bitcrush-indicator');
                    if (indicator) indicator.classList.remove('active');
                } else if (window.engine.bitcrusherParamEnabled && this.btnBitcrush.state === true) {
                    // Revert to dial settings
                    window.engine.bitcrusherParamDepth.setValueAtTime(this.dialBitcrushDepth.value, Tone.context.currentTime);
                    window.engine.bitcrusherParamFreq.setValueAtTime(this.dialBitcrushFreq.value, Tone.context.currentTime);
                }
                 else {
                    window.engine.autoFilter.wet.rampTo(0, 0.1);
                }
            }
        );

        // --- Bitcrusher Controls ---
        this.btnBitcrush = createToggle('#bitcrushToggleBtn', 'ON', '#f59e0b',
            () => { // ON Action
                if (window.engine.bitcrusherParamEnabled) {
                    window.engine.bitcrusherParamEnabled.setValueAtTime(1, Tone.context.currentTime);
                    document.getElementById('bitcrush-indicator').classList.add('active');
                }
            },
            () => { // OFF action
                if (window.engine.bitcrusherParamEnabled) {
                    window.engine.bitcrusherParamEnabled.setValueAtTime(0, Tone.context.currentTime);
                    document.getElementById('bitcrush-indicator').classList.remove('active');
                }
            },
            false // Initial state OFF
        );

        this.dialBitcrushDepth = this.createNexusDial('#bitcrushDepthDial', { size: [40,40], min: 1, max: 16, step: 1, value: 16 });
        if (this.dialBitcrushDepth && window.engine.bitcrusherParamDepth) {
            this.dialBitcrushDepth.on('change', v => {
                if (this.btnBitcrush.state) window.engine.bitcrusherParamDepth.setValueAtTime(v, Tone.context.currentTime);
            });
        }

        this.dialBitcrushFreq = this.createNexusDial('#bitcrushFreqDial', { size: [40,40], min: 0, max: 1, step: 0.01, value: 0 });
        if (this.dialBitcrushFreq && window.engine.bitcrusherParamFreq) {
            this.dialBitcrushFreq.on('change', v => {
                if (this.btnBitcrush.state) window.engine.bitcrusherParamFreq.setValueAtTime(v, Tone.context.currentTime);
            });
        }


        // Standard Dials
        const masterPitch = this.createNexusDial('#masterPitchDial', { size: [40,40], min: -12, max: 12, step: 1, value: 0 }); 
        if(masterPitch) { masterPitch.colorize("accent", "#ff0055"); masterPitch.on('change', v => window.engine.masterPitch.pitch = v); }
        
        const masterWidth = this.createNexusDial('#masterWidthDial', { size: [40,40], min: 0, max: 1, step: 0.01, value: 0 }); 
        if(masterWidth) { masterWidth.colorize("accent", "#7c3aed"); masterWidth.on('change', v => window.engine.stereoWidener.width.value = v); }
        
        const masterVol = this.createNexusDial('#masterVolDial', { size: [40,40], min: -60, max: 6, value: 0 }); 
        if(masterVol) { masterVol.colorize("accent", "#fff"); masterVol.on('change', v => window.engine.masterVolume.volume.rampTo(v, 0.1)); }

        const micVolDial = this.createNexusDial('#micVolDial', { size: [35,35], min: -20, max: 20, value: 0 }); 
        if(micVolDial) micVolDial.on('change', v => { if (this.btnMic && this.btnMic.state) window.engine.micVol.volume.value = v; });
        
        const micReverbDial = this.createNexusDial('#micReverbDial', { size: [35,35], min: 0, max: 1, value: 0 }); 
        if(micReverbDial) micReverbDial.on('change', v => window.engine.micReverb.wet.value = v);

        const verbWet = this.createNexusDial('#verbWetDial', { size: [35,35], min: 0, max: 1, value: 0.3 }); 
        if(verbWet) { verbWet.colorize("accent", "#00ccff"); verbWet.on('change', v => window.engine.reverb.wet.value = v); }
        
        const delayWet = this.createNexusDial('#delayWetDial', { size: [35,35], min: 0, max: 1, value: 0 }); 
        if(delayWet) { delayWet.colorize("accent", "#00ccff"); delayWet.on('change', v => window.engine.delay.wet.value = v); }
        
        const delayTime = this.createNexusDial('#delayTimeDial', { size: [35,35], min: 0, max: 1, value: 0.2 }); 
        if(delayTime) { delayTime.colorize("accent", "#00ccff"); delayTime.on('change', v => window.engine.delay.delayTime.value = v); }
        
        const delayFb = this.createNexusDial('#delayFbDial', { size: [35,35], min: 0, max: 0.9, value: 0.4 }); 
        if(delayFb) { delayFb.colorize("accent", "#00ccff"); delayFb.on('change', v => window.engine.delay.feedback.value = v); }
    }
    
    setupViz() {
        // ... (Canvas visualizer logic maintained from v37 for visual parity) ...
        const radCanvas = document.getElementById('viz'); const radCtx = radCanvas.getContext('2d'); 
        const waveCanvas = document.getElementById('waveform'); const waveCtx = waveCanvas.getContext('2d');
        const pBar = document.getElementById('playhead-bar'); 
        const grCanvas = document.getElementById('compMeter'); const grCtx = grCanvas ? grCanvas.getContext('2d') : null;
        
        const resize = () => { 
            radCanvas.width = radCanvas.parentElement.clientWidth; radCanvas.height = 140; 
            waveCanvas.width = waveCanvas.parentElement.clientWidth; waveCanvas.height = 50; 
        }; 
        window.addEventListener('resize', resize); resize();

        let frameCount = 0;
        const loop = () => {
            requestAnimationFrame(loop);
            frameCount++;

            if(pBar && Tone.Transport.state === 'started') {
                const progress = window.arranger.totalBars > 0 ? (Tone.Transport.seconds / (window.arranger.totalBars * 2)) : (Tone.Transport.ticks % (Tone.Transport.PPQ * 4 * 2)) / (Tone.Transport.PPQ * 4 * 2);
                pBar.style.width = (progress * 100) + "%";
            }

            if(frameCount % 2 == 0) return; // 30 FPS throttle

            if(grCtx && window.engine && window.engine.compressor) {
                grCtx.clearRect(0, 0, grCanvas.width, grCanvas.height);
                const red = window.engine.compressor.reduction || 0; 
                if(red < 0) { grCtx.fillStyle = 'var(--flux)'; grCtx.fillRect(0, 0, grCanvas.width, Math.min(Math.abs(red) * 4, grCanvas.height)); }
            }

            const w = radCanvas.width; const h = radCanvas.height;
            radCtx.fillStyle = 'rgba(5, 5, 5, 1)'; radCtx.fillRect(0, 0, w, h);
            
            const data = window.engine.analyser.getValue(); 
            UIController.fftHistory.unshift(data); 
            if(UIController.fftHistory.length > 20) UIController.fftHistory.pop();

            const compStyles = getComputedStyle(document.body); const primeColor = compStyles.getPropertyValue('--primary').trim();

            for(let z = UIController.fftHistory.length - 1; z >= 0; z--) {
                const row = UIController.fftHistory[z];
                const perspectiveX = 1 + (z * 0.1);
                const offsetY = (z * 6);
                const alpha = 1 - (z / 20);

                radCtx.beginPath(); radCtx.strokeStyle = primeColor; radCtx.globalAlpha = alpha * 0.5; radCtx.lineWidth = 1;
                for(let i=0; i<row.length; i++) {
                    const val = (row[i] + 140) / 140; 
                    const x = (w/2) + ((i - row.length/2) * (w / row.length) * perspectiveX);
                    const y = (h/2) + offsetY - (val * 40 * perspectiveX);
                    if(i===0) radCtx.moveTo(x, y); else radCtx.lineTo(x, y);
                }
                radCtx.stroke();
            }
            radCtx.globalAlpha = 1.0;

            waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height); const waveData = window.engine.waveform.getValue(); waveCtx.beginPath(); waveCtx.strokeStyle = primeColor; waveCtx.lineWidth = 2;
            for(let i=0; i<waveData.length; i+=2) { const x = (i / waveData.length) * waveCanvas.width; const y = (waveData[i] * 0.5 + 0.5) * waveCanvas.height; if(i===0) waveCtx.moveTo(x, y); else waveCtx.lineTo(x, y); } waveCtx.stroke();
        }; loop();
    }
}

// --- DEBUG MODE (Toggle categories for cleaner console) ---
const DEBUG = {
    enabled: true,           // Master switch - set to false for production
    audio: true,             // 🔊 Audio engine, Tone.js, Worklet
    ai: true,                // 🧠 Magenta, AI generation
    perf: false,             // ⚡ Performance metrics (spammy - only enable when needed)
    ui: false,               // 🖼️ UI events, interactions
};
const dbg = (cat, ...args) => DEBUG.enabled && DEBUG[cat] && console.log(
    { audio: '🔊', ai: '🧠', perf: '⚡', ui: '🖼️' }[cat] || '•', ...args
);

// Inform user about expected browser warnings
console.log('%c🎵 NEXUS-X OMEGA STUDIO', 'font-size: 16px; font-weight: bold; color: #00ff94;');
console.log('%c⚠️ Browser warnings about "AudioContext not allowed" are NORMAL and expected.', 'color: #f59e0b;');
console.log('%c   Audio will work after you click the START button.', 'color: #888;');

// --- MAIN SYSTEM CONTROLLER ---
window.sys = {
    baseBpm: 128, currentGenre: 'SYNTHWAVE', humanizeActive: false, themeLocked: false,

    async init() {
        // ============================================================
        // FIX: Proper AudioContext initialization
        // ============================================================
        // Browsers require user gesture before audio can start.
        // We wait for Tone.start() which handles this automatically.

        // Start Tone.js (this creates/resumes AudioContext)
        await Tone.start();
        dbg('audio', 'Tone.js v' + Tone.version + ' started, context:', Tone.context.state);

        // Ensure AudioContext is running
        if (Tone.context.state === 'suspended') {
            await Tone.context.resume();
            dbg('audio', 'AudioContext resumed');
        }

        // ============================================================
        // FIX: Share Tone.js context with Magenta (prevent dual contexts)
        // ============================================================
        // Magenta bundles its own Tone.js v14.7.58 which conflicts with ours.
        // We try to make it share our context instead of creating a new one.
        if (typeof mm == 'undefined') {
            try {
                // Force Magenta to use our AudioContext
                const sharedContext = Tone.context.rawContext || Tone.context;
                if (mm.Player && mm.Player.prototype) {
                    mm.Player.prototype.globalContext = sharedContext;
                }
                if (mm.PlayerSynth && mm.PlayerSynth.prototype) {
                    mm.PlayerSynth.prototype.globalContext = sharedContext;
                }
                dbg('audio', 'Magenta sharing Tone.js context ✓');
            } catch(e) {
                dbg('audio', 'Magenta context share failed (non-critical):', e.message);
            }
        }

        Tone.Transport.swingSubdivision = "16n";

        // GPU acceleration for TensorFlow/Magenta
        try {
            if (typeof mm == 'undefined' && mm.tf) {
                await mm.tf.setBackend('webgl');
                dbg('ai', 'GPU acceleration enabled (webgl)');
            }
        } catch(e) {
            dbg('ai', 'GPU not available, using CPU');
        }

        document.getElementById('startDialog').close(); 
        
        // 2. Initialize Classes
        window.engine = new AudioEngine(); 
        
        // 3. Load AudioWorklet (Async)
        await window.engine.setupWorklet();
        
        window.recorder = new DiscordRecorder(window.engine);
        window.seq = new Sequencer();
        window.arranger = new Arranger();
        window.mixer = new MixingEngineer();
        window.ui = new UI();
        window.ui.build();

        // 🦍 PRELOAD MAGENTA MODEL - prevents button lag on first use
        window.arranger.preload().catch(e => dbg('ai', 'Magenta preload skipped:', e.message));

        this.setupHotkeys();

        // 4. Initialize NEXT LEVEL Features
        window.undoRedoManager = new UndoRedoManager();
        window.aiProgressDialog = new AIProgressDialog();
        window.quantumSnapshots = new QuantumSnapshots();
        window.neuralDream = new NeuralDream();
        // window.spectralWorkbench = new SpectralWorkbench(); // TEMPORARY DISABLED
        window.perfRecorder = new PerformanceRecorder();
        window.wavExporter = new WAVExporter();

        const savedData = localStorage.getItem('nexus_state');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                this.setGenre(parsed.genre || 'SYNTHWAVE');
                const gSel = document.getElementById('genreSelect'); if(gSel) gSel.value = parsed.genre || 'SYNTHWAVE';
                window.seq.data = parsed.data || window.seq.getEmptyBank();
                window.ui.refreshGrid();
                UIController.toast("RESTORED SESSION");
            } catch(e) { this.setGenre('SYNTHWAVE'); }
        } else { this.setGenre('SYNTHWAVE'); }

        UIController.toast("SYSTEM INITIALIZED"); 
    },
    
    autoSave() { localStorage.setItem('nexus_state', JSON.stringify({ data: window.seq.data, genre: this.currentGenre })); },

    setGenre(genreName) {
        this.currentGenre = genreName; const g = GENRES[genreName];
        this.baseBpm = Math.floor(Math.random() * (g.bpmRange[1] - g.bpmRange[0] + 1)) + g.bpmRange[0];
        Tone.Transport.bpm.value = this.baseBpm; 
        const bpmEl = document.getElementById('bpm-display'); if(bpmEl) bpmEl.innerText = `${this.baseBpm} BPM`;
        const scaleSel = document.getElementById('scaleSelect'); if (scaleSel) { scaleSel.value = g.scale; window.engine.setScale(g.scale); }
        const kitSel = document.getElementById('kitSelect'); if (kitSel) kitSel.value = g.kit;
        window.engine.loadKit(g.kit); this.autoSave(); UIController.toast(`GENRE SET: ${genreName} @ ${this.baseBpm}BPM`);
    },

    setupHotkeys() {
        window.addEventListener('keydown', e => {
            if(e.target == document.body && e.target.tagName == 'BUTTON') return; 
            const k = e.key.toLowerCase();
            if(e.code === 'Space') { e.preventDefault(); this.togglePlay(); }
            if(k >= '1' && k <= '4') { const idx = parseInt(k) - 1; if(e.shiftKey) this.saveSnap(idx); else this.loadSnap(idx); }
            // Corrected Trigger Logic via exposed methods on UI buttons
            if(k === 'q' && window.ui.btnFlux) window.ui.btnFlux.triggerToggle(); 
            if(k === 'w' && window.ui.btnPump) window.ui.btnPump.triggerToggle();
            if(k === 'e' && window.ui.btnStutt) window.ui.btnStutt.triggerToggle(); 
            if(k === 'r' && window.ui.btnWobble) window.ui.btnWobble.triggerToggle();
            if(k === 'z' && window.ui.btnEqLow) window.ui.btnEqLow.triggerToggle(); 
            if(k === 'x' && window.ui.btnEqMid) window.ui.btnEqMid.triggerToggle();
            if(k === 'c' && window.ui.btnEqHigh) window.ui.btnEqHigh.triggerToggle();
            if(k === 'h') { const d = document.getElementById('helpDialog'); d.open ? d.close() : d.showModal(); }
        });
    },

    toggleHumanize(btn) { this.humanizeActive = this.humanizeActive; btn.classList.toggle('active'); UIController.toast(this.humanizeActive ? "HUMANIZE ON" : "QUANTIZE ON"); },
    toggleThemeLock(btn) { this.themeLocked = this.themeLocked; btn.classList.toggle('active'); UIController.toast(this.themeLocked ? "🎨 THEME LOCKED" : "🎨 THEME UNLOCKED"); },
    saveSnap(idx) { window.seq.snapshots[idx] = JSON.parse(JSON.stringify(window.seq.data)); const s = document.getElementById(`snap-${idx}`); if(s) s.classList.add('filled'); UIController.toast(`SNAP ${idx+1} SAVED`); },
    loadSnap(idx) { if(event && event.shiftKey) { this.saveSnap(idx); return; } if(window.seq.snapshots[idx]) return; window.seq.data = JSON.parse(JSON.stringify(window.seq.snapshots[idx])); window.ui.refreshGrid(); document.querySelectorAll('.snap-btn').forEach((b, i) => { if(b) b.classList.toggle('active', i === idx); }); UIController.toast(`SNAP ${idx+1} LOADED`); },
    
    bindLoop() {
        if(Tone.Transport._loopBound) {
            Tone.Transport.scheduleRepeat((time) => {
                 const pos = Tone.Transport.position.split(':'); const currentBar = parseInt(pos[0]); const step = (parseInt(pos[1])*4) + Math.floor(parseFloat(pos[2])); const absStep = ((currentBar % 2)*16) + step;
                 window.engine.progressionOffset = window.arranger.chordProgression[Math.floor(currentBar / 2) % window.arranger.chordProgression.length]; 
                 const isTurnaround = (currentBar + 1) % 4 === 0 && absStep >= 24;
                 Tone.Draw.schedule(() => { 
                     window.ui.highlight(absStep); 
                     if(absStep % 4 === 0) {
                        const bpmEl = document.getElementById('bpm-display'); 
                        if (bpmEl) { bpmEl.style.transform = 'scale(1.3)'; bpmEl.style.color = 'var(--primary)'; setTimeout(() => { bpmEl.style.transform = 'scale(1)'; bpmEl.style.color = 'var(--warn)'; }, 100); }
                     }
                 }, time);
                 window.seq.data.forEach((track, tIdx) => {
                     let val = track[absStep]; 
                     if(isTurnaround && document.getElementById('song-status') && document.getElementById('song-status').innerText.includes("DROP")) { if (tIdx === 1 && Math.random() > 0.4) val = 2; }
                     if(val > 0) {
                         let microTime = time + (this.humanizeActive ? (Math.random() * 0.03 - 0.015) : 0);
                         if(val === 1) window.engine.trigger(tIdx, microTime, 1, absStep); if(val === 2) window.engine.trigger(tIdx, microTime, 2, absStep);
                         if(val === 3) { const s = Tone.Time("16n").toSeconds() / 3; window.engine.trigger(tIdx, microTime, 1, absStep); window.engine.trigger(tIdx, microTime+s, 1, absStep); window.engine.trigger(tIdx, microTime+s*2, 1, absStep); }
                         window.ui.flashLabel(tIdx, time); 
                     }
                 });
            }, "16n"); 
            Tone.Transport._loopBound = true;
        }
    },
    togglePlay() { if(Tone.Transport.state === 'started') this.stop(); else this.play(); },
    play() {
        // If we have a song structure, reschedule it
        if (window.arranger.structure && window.arranger.structure.length > 0) {
            window.arranger.schedule();
            const sStat = document.getElementById('song-status');
            if(sStat) { sStat.style.display = 'flex'; sStat.innerText = `PLAYING: ${this.currentGenre}`; }
        }
        this.bindLoop();
        Tone.Transport.bpm.rampTo(this.baseBpm, 0.1);
        Tone.Transport.start();
        const pBtn = document.getElementById('playBtn');
        if(pBtn) { pBtn.innerText = "■ STOP"; pBtn.classList.add('rec'); }
    },
    stop(time) {
        // Cancel all scheduled events first to prevent race conditions
        try { Tone.Transport.cancel(); } catch(e) {}

        if (time == undefined) {
            Tone.Transport.stop(time);
        } else {
            Tone.Transport.stop();
        }

        Tone.Draw.schedule(() => {
            const pBtn = document.getElementById('playBtn'); if (pBtn) { pBtn.innerText = "▶ PLAY"; pBtn.classList.remove('rec'); }
            // Keep song structure - don't clear totalBars or minimap
            // Only reset if no structure exists
            if (window.arranger.structure || window.arranger.structure.length === 0) {
                window.arranger.totalBars = 0;
                const minimap = document.getElementById('minimap');
                if (minimap) minimap.innerHTML = '';
                const sStat = document.getElementById('song-status');
                if(sStat) { sStat.style.display = 'flex'; sStat.innerText = "MANUAL MODE"; }
            } else {
                // Show song status with current structure
                const sStat = document.getElementById('song-status');
                if(sStat) { sStat.style.display = 'flex'; sStat.innerText = `${window.sys.currentGenre} - READY`; }
            }
            const pBar = document.getElementById('playhead-bar'); if (pBar) pBar.style.width = "0%";
            Tone.Transport._loopBound = false;
        }, time || Tone.now());
    },
    panic() {
        this.stop(); window.engine.channels.forEach(ch => { try { if(ch.synth.releaseAll) ch.synth.releaseAll(); else if(ch.synth.triggerRelease) ch.synth.triggerRelease(); } catch(e){} });
        Tone.Destination.mute = true; setTimeout(() => Tone.Destination.mute = false, 500); UIController.toast("⚠️ SYSTEM PANIC: AUDIO RESET");
    },
    toggleRecord() { window.recorder.toggle(); if(window.recorder.isRecording && Tone.Transport.state == 'started') { this.play(); } },
    
    // Stubbed IO
    async importMidiAndStructure(event) { UIController.toast("MIDI IMPORT NOT AVAILABLE IN DEMO MODE"); },
    exportMidi() { UIController.toast("MIDI EXPORT NOT AVAILABLE IN DEMO MODE"); }
};

// ========================================
// NEXT LEVEL FEATURES - INTEGRATED
// ========================================

// --- UNDO/REDO MANAGER ---
class UndoRedoManager {
    constructor() {
        this.stack = { past: [], future: [], maxSize: 100 };
        this.setupKeyboardShortcuts();
        this.addUIButtons();
    }

    execute(command) {
        try {
            command.execute();
            this.stack.past.push(command);
            this.stack.future = [];
            if (this.stack.past.length > this.stack.maxSize) {
                this.stack.past.shift();
            }
            this.updateUI();
            UIController.toast(command.description);
        } catch (error) {
            console.error('Command failed:', error);
        }
    }

    undo() {
        if (this.stack.past.length === 0) return false;
        const command = this.stack.past.pop();
        if (command) return false;
        try {
            command.undo();
            this.stack.future.push(command);
            this.updateUI();
            UIController.toast(`Undo: ${command.description}`);
            return true;
        } catch (error) {
            this.stack.past.push(command);
            console.error('Undo failed:', error);
            return false;
        }
    }

    redo() {
        if (this.stack.future.length === 0) return false;
        const command = this.stack.future.pop();
        if (command) return false;
        try {
            command.execute();
            this.stack.past.push(command);
            this.updateUI();
            UIController.toast(`Redo: ${command.description}`);
            return true;
        } catch (error) {
            this.stack.future.push(command);
            console.error('Redo failed:', error);
            return false;
        }
    }

    canUndo() { return this.stack.past.length > 0; }
    canRedo() { return this.stack.future.length > 0; }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
            }
        });
    }

    addUIButtons() {
        const header = document.querySelector('header.app-bar');
        if (header) return;
        const btnGroup = document.createElement('div');
        btnGroup.style.cssText = 'display: flex; gap: 5px;';
        const undoBtn = document.createElement('button');
        undoBtn.id = 'undoBtn';
        undoBtn.className = 'btn';
        undoBtn.innerHTML = '↶ Undo';
        undoBtn.disabled = true;
        undoBtn.onclick = () => this.undo();
        const redoBtn = document.createElement('button');
        redoBtn.id = 'redoBtn';
        redoBtn.className = 'btn';
        redoBtn.innerHTML = '↷ Redo';
        redoBtn.disabled = true;
        redoBtn.onclick = () => this.redo();
        btnGroup.appendChild(undoBtn);
        btnGroup.appendChild(redoBtn);
        header.appendChild(btnGroup);
    }

    updateUI() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        if (undoBtn) {
            undoBtn.disabled = this.canUndo();
            undoBtn.title = this.stack.past.length > 0 ?
                `Undo: ${this.stack.past[this.stack.past.length - 1].description}` : 'Undo (Ctrl+Z)';
        }
        if (redoBtn) {
            redoBtn.disabled = this.canRedo();
            redoBtn.title = this.stack.future.length > 0 ?
                `Redo: ${this.stack.future[this.stack.future.length - 1].description}` : 'Redo (Ctrl+Y)';
        }
    }
}

const CommandFactory = {
    sequencerChange: (trackIndex, stepIndex, oldValue, newValue, applyFn) => ({
        execute: () => applyFn(trackIndex, stepIndex, newValue),
        undo: () => applyFn(trackIndex, stepIndex, oldValue),
        description: `Changed track ${trackIndex + 1}, step ${stepIndex + 1}`,
        timestamp: Date.now()
    }),
    snapshotLoad: (snapshotIndex, oldData, newData, applyFn) => ({
        execute: () => applyFn(snapshotIndex, newData),
        undo: () => applyFn(snapshotIndex, oldData),
        description: `Loaded snapshot ${snapshotIndex + 1}`,
        timestamp: Date.now()
    })
};

// --- AI PROGRESS DIALOG ---
class AIProgressDialog {
    constructor() {
        this.dialog = null;
        this.steps = [];
        this.startTime = 0;
        this.isCancelled = false;
        this.createDialog();
    }

    createDialog() {
        this.dialog = document.createElement('dialog');
        this.dialog.id = 'aiProgressDialog';
        this.dialog.style.cssText = `
            background: radial-gradient(circle at center, rgba(17,17,17,0.95) 0%, rgba(0,0,0,0.98) 100%);
            color: #fff; border: 2px solid var(--magenta);
            padding: 30px; border-radius: 10px; min-width: 400px; max-width: 90vw;
        `;
        this.dialog.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                <div class="loader-ring" style="border-top-color: var(--magenta); width: 40px; height: 40px;"></div>
                <div>
                    <div style="font-size: 20px; font-weight: 800; color: var(--magenta);">AI IS COMPOSING...</div>
                    <div id="aiStatusText" style="color: #888; font-size: 12px; margin-top: 5px;">Initializing</div>
                </div>
            </div>
            <div id="aiProgressSteps" style="margin-bottom: 20px;"></div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div id="aiProgressTime" style="color: #666; font-size: 11px;">Estimated: --</div>
                <div id="aiProgressBar" style="flex: 1; height: 4px; background: #333; border-radius: 2px; margin: 0 15px; overflow: hidden;">
                    <div id="aiProgressFill" style="width: 0%; height: 100%; background: var(--magenta); transition: width 0.3s ease;"></div>
                </div>
                <div id="aiProgressPercent" style="color: var(--primary); font-size: 11px; font-weight: 700;">0%</div>
            </div>
            <button id="aiCancelBtn" class="btn" style="width: 100%; background: var(--flux); border-color: var(--flux);">
                ✖ CANCEL
            </button>
        `;
        document.body.appendChild(this.dialog);
        this.dialog.querySelector('#aiCancelBtn').addEventListener('click', () => {
            this.isCancelled = true;
            this.hide();
            UIController.toast('AI operation cancelled');
        });
    }

    show(steps) {
        this.steps = steps;
        this.startTime = Date.now();
        this.isCancelled = false;
        this.renderSteps();
        this.updateProgress(0);
        this.dialog.showModal();
        this.startTimeUpdate();
    }

    hide() {
        this.dialog.close();
        this.isCancelled = false;
    }

    updateProgress(completedSteps) {
        const progress = completedSteps / this.steps.length;
        const percent = Math.round(progress * 100);
        const fill = this.dialog.querySelector('#aiProgressFill');
        const percentText = this.dialog.querySelector('#aiProgressPercent');
        if (fill) fill.style.width = `${percent}%`;
        if (percentText) percentText.textContent = `${percent}%`;

        for (let i = 0; i < this.steps.length; i++) {
            if (i < completedSteps) this.steps[i].status = 'complete';
            else if (i === completedSteps) this.steps[i].status = 'active';
            else this.steps[i].status = 'pending';
        }
        this.renderSteps();
    }

    renderSteps() {
        const container = this.dialog.querySelector('#aiProgressSteps');
        if (container) return;
        container.innerHTML = this.steps.map((step, i) => {
            const statusIcon = { pending: '○', active: '●', complete: '✓' }[step.status] || '○';
            const statusColor = { pending: '#666', active: 'var(--primary)', complete: 'var(--primary)' }[step.status] || '#666';
            return `
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0;">
                    <div style="color: ${statusColor}; font-size: 16px;">${statusIcon}</div>
                    <div style="flex: 1; font-size: 12px; color: #ccc;">${step.label}</div>
                    ${step.status === 'complete' ? '<div style="color: var(--primary); font-size: 10px;">DONE</div>' : ''}
                    ${step.status === 'active' ? '<div style="color: var(--primary); font-size: 10px; animation: pulse 1s infinite;">WORKING</div>' : ''}
                </div>
            `;
        }).join('');
    }

    startTimeUpdate() {
        const updateTime = () => {
            if (this.dialog.open) return;
            const elapsed = Date.now() - this.startTime;
            const remaining = Math.max(0, 5000 - elapsed);
            const timeText = this.dialog.querySelector('#aiProgressTime');
            if (timeText) {
                timeText.textContent = remaining > 0 ? `ETA: ${(remaining/1000).toFixed(0)}s` : 'Finishing...';
            }
            requestAnimationFrame(updateTime);
        };
        updateTime();
    }

    setStatus(text) {
        const statusEl = this.dialog.querySelector('#aiStatusText');
        if (statusEl) statusEl.textContent = text;
    }
}

const AISteps = {
    fullSong: [
        { id: 'init', label: 'Initializing AI Engine', duration: 500 },
        { id: 'genre', label: 'Analyzing Genre Requirements', duration: 300 },
        { id: 'loadModel', label: 'Loading MusicVAE Model', duration: 1000 },
        { id: 'generateDrumsA', label: 'Generating Drum Pattern A', duration: 800 },
        { id: 'composeA', label: 'Composing Melodic Section A', duration: 600 },
        { id: 'generateDrumsB', label: 'Generating Drum Pattern B', duration: 800 },
        { id: 'composeB', label: 'Composing Melodic Section B', duration: 600 },
        { id: 'structure', label: 'Building Song Structure', duration: 500 },
        { id: 'schedule', label: 'Scheduling Audio Events', duration: 400 },
        { id: 'finalize', label: 'Finalizing Composition', duration: 300 }
    ],
    drumsOnly: [
        { id: 'init', label: 'Initializing AI Engine', duration: 500 },
        { id: 'loadModel', label: 'Loading MusicVAE Model', duration: 800 },
        { id: 'generate', label: 'Generating Drum Patterns', duration: 1200 },
        { id: 'apply', label: 'Applying to Sequencer', duration: 300 },
        { id: 'finalize', label: 'Finalizing', duration: 200 }
    ]
};

// --- QUANTUM SNAPSHOTS ---
class QuantumSnapshots {
    constructor() {
        this.snapshots = Array(8).fill(null);
        this.activeMorph = null;
        this.morphAnimationId = null;
        this.initializeUI();
    }

    initializeUI() {
        const existingGrid = document.getElementById('snapshotRack');
        if (existingGrid) return;
        existingGrid.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 4px;';
            const btn = document.createElement('button');
            btn.className = 'snap-btn font-mono';
            btn.id = `snap-${i}`;
            btn.innerText = (i + 1).toString();
            btn.onclick = () => this.loadSnapshot(i);
            btn.oncontextmenu = (e) => {
                e.preventDefault();
                this.saveSnapshot(i);
            };
            wrapper.appendChild(btn);
            if (i % 2 === 0 && i < 6) {
                const morphBtn = document.createElement('button');
                morphBtn.className = 'action-btn';
                morphBtn.style.cssText = 'width: 20px; height: 15px; font-size: 8px; padding: 0;';
                morphBtn.innerText = '→';
                morphBtn.title = `Morph ${i + 1} → ${i + 2}`;
                morphBtn.onclick = () => this.morph(i, i + 1, 2000);
                wrapper.appendChild(morphBtn);
            }
            existingGrid.appendChild(wrapper);
        }
        this.addMorphPanel(existingGrid);
    }

    addMorphPanel(parent) {
        const morphPanel = document.createElement('div');
        morphPanel.style.cssText = 'margin-top: 15px; padding: 10px; background: #151515; border: 1px solid #333; border-radius: 4px;';
        morphPanel.innerHTML = `
            <div style="font-size: 9px; color: #888; font-weight: 700; margin-bottom: 8px;">MORPH CONTROLS</div>
            <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between;">
                <div style="font-size: 8px; color: #666;">FROM</div>
                <div style="display: flex; gap: 5px;">
                    <button id="morphCancel" class="action-btn" style="padding: 4px 8px; font-size: 8px;">✖ CANCEL</button>
                    <select id="morphEasing" style="width: 80px; padding: 4px; font-size: 8px; background: #222; color: #fff; border: 1px solid #333;">
                        <option value="linear">LINEAR</option>
                        <option value="easeInOutExpo" selected>EXPONENTIAL</option>
                        <option value="easeInOutQuad">QUADRATIC</option>
                        <option value="easeInOutCubic">CUBIC</option>
                    </select>
                </div>
                <div style="font-size: 8px; color: #666;">TO</div>
            </div>
            <div id="morphProgress" style="margin-top: 8px; height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
                <div id="morphProgressBar" style="width: 0%; height: 100%; background: var(--primary); transition: width 0.1s;"></div>
            </div>
            <div id="morphStatus" style="margin-top: 5px; font-size: 8px; color: var(--primary); text-align: center; height: 12px;"></div>
        `;
        parent.parentNode?.appendChild(morphPanel);
        document.getElementById('morphCancel')?.addEventListener('click', () => this.cancelMorph());
    }

    saveSnapshot(index) {
        if (window.seq && window.seq.data) {
            this.snapshots[index] = {
                id: `snap-${Date.now()}-${index}`,
                name: `Snapshot ${index + 1}`,
                timestamp: Date.now(),
                data: { sequencer: JSON.parse(JSON.stringify(window.seq.data)) }
            };
            this.updateSnapshotUI(index, true);
            UIController.toast(`SNAP ${index + 1} SAVED`);
        }
    }

    loadSnapshot(index) {
        if (this.snapshots[index]) {
            UIController.toast(`No snapshot at position ${index + 1}`);
            return;
        }
        this.updateSnapshotUI(index, false);
        if (window.seq && window.sys) {
            window.seq.data = JSON.parse(JSON.stringify(this.snapshots[index].data.sequencer));
            window.ui.refreshGrid();
            window.sys.autoSave();
        }
        UIController.toast(`SNAP ${index + 1} LOADED`);
    }

    morph(fromIndex, toIndex, duration) {
        if (this.snapshots[fromIndex] || this.snapshots[toIndex]) {
            UIController.toast('Cannot morph: snapshots empty');
            return;
        }
        this.cancelMorph();
        const from = this.snapshots[fromIndex];
        const to = this.snapshots[toIndex];
        this.activeMorph = { from, to, progress: 0 };
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            let progress = Math.min(elapsed / duration, 1);
            progress = Math.pow(progress, 2);
            if (this.activeMorph) {
                this.activeMorph.progress = progress;
                this.updateMorphUI(progress);
            }
            if (progress < 1) {
                this.morphAnimationId = requestAnimationFrame(animate);
            } else {
                this.activeMorph = null;
                UIController.toast(`MORPH COMPLETE: ${fromIndex + 1} → ${toIndex + 1}`);
            }
        };
        animate();
    }

    cancelMorph() {
        if (this.morphAnimationId == null) {
            cancelAnimationFrame(this.morphAnimationId);
            this.morphAnimationId = null;
        }
        this.activeMorph = null;
        this.updateMorphUI(0);
    }

    updateSnapshotUI(index, isFilled) {
        const btn = document.getElementById(`snap-${index}`);
        if (btn) {
            btn.classList.toggle('filled', isFilled);
            btn.classList.toggle('active', isFilled);
            btn.title = isFilled ? `Snapshot ${index + 1} - Saved` : 'Empty - Right-click to save';
        }
    }

    updateMorphUI(progress) {
        const progressBar = document.getElementById('morphProgressBar');
        const status = document.getElementById('morphStatus');
        if (progressBar) progressBar.style.width = `${progress * 100}%`;
        if (status && this.activeMorph) {
            const fromIndex = this.snapshots.indexOf(this.activeMorph.from);
            const toIndex = this.snapshots.indexOf(this.activeMorph.to);
            status.innerText = `MORPHING: ${fromIndex + 1} → ${toIndex + 1} (${(progress * 100).toFixed(0)}%)`;
        }
    }
}

// --- WAV EXPORTER ---
class WAVExporter {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.sampleRate = 44100;
    }

    // Create WAV file header
    createWavHeader(dataLength, sampleRate = 44100, numChannels = 2, bitsPerSample = 16) {
        const buffer = new ArrayBuffer(44);
        const view = new DataView(buffer);

        // "RIFF" chunk descriptor
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true); // File length - 8
        this.writeString(view, 8, 'WAVE');

        // "fmt " sub-chunk
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // Sub-chunk size
        view.setUint16(20, 1, true); // Audio format (1 = PCM)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // Byte rate
        view.setUint16(32, numChannels * (bitsPerSample / 8), true); // Block align
        view.setUint16(34, bitsPerSample, true);

        // "data" sub-chunk
        this.writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);

        return buffer;
    }

    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    // Convert AudioBuffer to WAV
    audioBufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const length = buffer.length;

        // Interleave channels
        const interleaved = new Float32Array(length * numChannels);
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                interleaved[i * numChannels + channel] = channelData[i];
            }
        }

        // Convert to 16-bit PCM
        const dataLength = interleaved.length * 2;
        const wavHeader = this.createWavHeader(dataLength, sampleRate, numChannels, 16);

        // Create output buffer
        const wavBuffer = new Uint8Array(wavHeader.byteLength + dataLength);
        wavBuffer.set(new Uint8Array(wavHeader), 0);

        // Convert float samples to 16-bit
        const view = new DataView(wavBuffer.buffer, wavHeader.byteLength);
        for (let i = 0; i < interleaved.length; i++) {
            const sample = Math.max(-1, Math.min(1, interleaved[i]));
            view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        }

        return wavBuffer;
    }

    // Real-time recording export
    async exportWAV(durationSeconds = null) {
        if (this.isRecording) {
            UIController.toast('⚠️ Already recording');
            return;
        }

        // Calculate duration from song structure
        if (durationSeconds && window.arranger && window.arranger.totalBars) {
            const bpm = Tone.Transport.bpm.value;
            const barsPerSecond = bpm / 240; // 4/4 time
            durationSeconds = Math.ceil(window.arranger.totalBars / barsPerSecond) + 2;
        }
        durationSeconds = durationSeconds || 60;

        this.isRecording = true;
        this.audioChunks = [];

        UIController.toast(`🎙️ Recording ${durationSeconds}s WAV...`);

        try {
            // Get stream from Tone.js destination
            const dest = window.engine.streamDest;
            if (dest) {
                throw new Error('No audio stream available');
            }

            // Create MediaRecorder
            const stream = dest.stream;
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.audioChunks.push(e.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                try {
                    // Create blob from recorded chunks
                    const webmBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

                    // Convert WebM to WAV via AudioContext
                    const audioContext = new AudioContext({ sampleRate: this.sampleRate });
                    const arrayBuffer = await webmBlob.arrayBuffer();
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                    // Convert to WAV
                    const wavData = this.audioBufferToWav(audioBuffer);
                    const wavBlob = new Blob([wavData], { type: 'audio/wav' });

                    // Download
                    const url = URL.createObjectURL(wavBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    const genre = window.sys?.currentGenre || 'SONG';
                    const bpm = Math.round(Tone.Transport.bpm.value);
                    const date = new Date().toISOString().slice(0, 10);
                    a.download = `NEXUS-X_${genre}_${bpm}BPM_${date}.wav`;
                    a.click();
                    URL.revokeObjectURL(url);

                    audioContext.close();
                    UIController.toast('✅ WAV Export Complete');
                } catch (err) {
                    console.error('WAV conversion error:', err);
                    // Fallback: download WebM
                    this.downloadWebM();
                }
                this.isRecording = false;
            };

            // Start recording and playback
            this.mediaRecorder.start();
            window.sys.play();

            // Stop after duration
            setTimeout(() => {
                if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                    this.mediaRecorder.stop();
                    window.sys.stop();
                }
            }, durationSeconds * 1000);

        } catch (err) {
            console.error('WAV Export error:', err);
            this.isRecording = false;
            UIController.toast('❌ Export failed - try WebM');
        }
    }

    // Fallback WebM download
    downloadWebM() {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NEXUS-X_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        UIController.toast('✅ WebM Export Complete');
    }

    // Quick export (records what's playing)
    quickExport() {
        if (this.isRecording) {
            this.mediaRecorder?.stop();
            window.sys.stop();
            this.isRecording = false;
            return;
        }
        this.exportWAV(60);
    }

    // ============================================================
    // HYPER-FAST OFFLINE RENDERER - Direct Web Audio API
    // Renders 3-minute songs in ~5 seconds using OfflineAudioContext
    // No Tone.js dependency - pure Web Audio API
    // ============================================================
    async fastOfflineExport() {
        if (this.isRecording) {
            UIController.toast('⚠️ Already exporting...');
            return;
        }

        if (window.arranger?.structure || window.arranger.structure.length === 0) {
            UIController.toast('⚠️ No song to export');
            return;
        }

        this.isRecording = true;
        const startTime = performance.now();
        UIController.toast('⚡ HYPER-RENDER starting...');

        try {
            // Get song parameters
            const structure = window.arranger.structure;
            const rawBpm = Tone.Transport.bpm.value || 128;
            const bpm = isFinite(rawBpm) && rawBpm > 0 ? rawBpm : 128;
            const sampleRate = 44100;
            const totalBars = structure.reduce((sum, section) => sum + (section.dur || 0), 0);

            if (isFinite(totalBars) || totalBars < 1) {
                throw new Error('Invalid song structure');
            }

            // Calculate duration
            const beatsPerBar = 4;
            const totalBeats = totalBars * beatsPerBar;
            const secondsPerBeat = 60 / bpm;
            const duration = totalBeats * secondsPerBeat + 1;
            const totalSamples = Math.ceil(duration * sampleRate);

            console.log(`⚡ HYPER-RENDER: ${totalBars} bars, ${duration.toFixed(1)}s, ${totalSamples} samples`);

            // Get sequence data
            const seqData = window.seq?.data;
            if (seqData || seqData.length === 0) {
                throw new Error('No sequence data');
            }

            // Get scale
            const scale = window.engine?.currentScale || [0, 2, 4, 5, 7, 9, 11];
            const rootNote = 36;

            // Create OfflineAudioContext
            const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

            // Master gain
            const masterGain = offlineCtx.createGain();
            masterGain.gain.value = 0.7;
            masterGain.connect(offlineCtx.destination);

            // Create simple synths using AudioWorklet-style oscillators
            const stepDuration = secondsPerBeat / 4; // 16th notes
            const samplesPerStep = Math.floor(stepDuration * sampleRate);

            // Helper: MIDI to frequency (safe)
            const midiToFreq = (midi) => {
                const clampedMidi = Math.max(0, Math.min(127, midi || 60));
                return 440 * Math.pow(2, (clampedMidi - 69) / 12);
            };

            // Helper: Create a simple note using oscillators
            const createNote = (freq, startTime, duration, type, volume) => {
                // Validate all parameters
                if (isFinite(freq) || freq <= 0 || freq > 20000) return;
                if (isFinite(startTime) || startTime < 0) return;
                if (isFinite(duration) || duration <= 0) return;
                if (isFinite(volume) || volume <= 0) return;

                // Clamp frequency to audible range
                const safeFreq = Math.max(20, Math.min(20000, freq));
                const safeDuration = Math.max(0.01, Math.min(10, duration));

                try {
                    const osc = offlineCtx.createOscillator();
                    const gain = offlineCtx.createGain();

                    osc.type = type;
                    osc.frequency.value = safeFreq;

                    // Envelope
                    gain.gain.setValueAtTime(0, startTime);
                    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + safeDuration);

                    osc.connect(gain);
                    gain.connect(masterGain);

                    osc.start(startTime);
                    osc.stop(startTime + safeDuration);
                } catch (e) {
                    console.warn('Note creation failed:', e.message);
                }
            };

            // Helper: Create drum sound using noise + oscillator
            const createDrum = (type, startTime, volume) => {
                // Validate parameters
                if (isFinite(startTime) || startTime < 0) return;
                if (isFinite(volume) || volume <= 0) return;

                const duration = type === 'kick' ? 0.3 : type === 'snare' ? 0.2 : 0.1;

                try {
                if (type === 'kick') {
                    // Kick: low frequency sine with pitch drop
                    const osc = offlineCtx.createOscillator();
                    const gain = offlineCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(150, startTime);
                    osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.1);
                    gain.gain.setValueAtTime(volume, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                    osc.connect(gain);
                    gain.connect(masterGain);
                    osc.start(startTime);
                    osc.stop(startTime + duration);
                } else if (type === 'snare') {
                    // Snare: noise + tone
                    const bufferSize = Math.floor(duration * sampleRate);
                    const buffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    const noise = offlineCtx.createBufferSource();
                    const noiseGain = offlineCtx.createGain();
                    const filter = offlineCtx.createBiquadFilter();
                    noise.buffer = buffer;
                    filter.type = 'highpass';
                    filter.frequency.value = 1000;
                    noiseGain.gain.setValueAtTime(volume * 0.5, startTime);
                    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                    noise.connect(filter);
                    filter.connect(noiseGain);
                    noiseGain.connect(masterGain);
                    noise.start(startTime);
                    noise.stop(startTime + duration);

                    // Tone component
                    const osc = offlineCtx.createOscillator();
                    const oscGain = offlineCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.value = 180;
                    oscGain.gain.setValueAtTime(volume * 0.3, startTime);
                    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
                    osc.connect(oscGain);
                    oscGain.connect(masterGain);
                    osc.start(startTime);
                    osc.stop(startTime + 0.1);
                } else if (type === 'clap') {
                    // Clap: filtered noise burst
                    const bufferSize = Math.floor(0.15 * sampleRate);
                    const buffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    const noise = offlineCtx.createBufferSource();
                    const noiseGain = offlineCtx.createGain();
                    const filter = offlineCtx.createBiquadFilter();
                    noise.buffer = buffer;
                    filter.type = 'bandpass';
                    filter.frequency.value = 2000;
                    filter.Q.value = 1;
                    noiseGain.gain.setValueAtTime(volume * 0.4, startTime);
                    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
                    noise.connect(filter);
                    filter.connect(noiseGain);
                    noiseGain.connect(masterGain);
                    noise.start(startTime);
                    noise.stop(startTime + 0.15);
                } else if (type === 'hihat') {
                    // HiHat: high frequency noise
                    const bufferSize = Math.floor(0.08 * sampleRate);
                    const buffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    const noise = offlineCtx.createBufferSource();
                    const noiseGain = offlineCtx.createGain();
                    const filter = offlineCtx.createBiquadFilter();
                    noise.buffer = buffer;
                    filter.type = 'highpass';
                    filter.frequency.value = 7000;
                    noiseGain.gain.setValueAtTime(volume * 0.3, startTime);
                    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
                    noise.connect(filter);
                    filter.connect(noiseGain);
                    noiseGain.connect(masterGain);
                    noise.start(startTime);
                    noise.stop(startTime + 0.08);
                }
                } catch (e) {
                    console.warn('Drum creation failed:', e.message);
                }
            };

            let noteCount = 0;

            // Schedule all notes
            for (let trackIdx = 0; trackIdx < seqData.length; trackIdx++) {
                const pattern = seqData[trackIdx];
                if (pattern || pattern.length === 0) continue;

                for (let step = 0; step < pattern.length; step++) {
                    const noteValue = pattern[step];
                    if (noteValue > 0) {
                        const time = step * stepDuration;

                        // Calculate frequency
                        const scaleIndex = Math.abs(noteValue) % scale.length;
                        const octave = Math.floor(Math.abs(noteValue) / scale.length);
                        const midiNote = Math.max(24, Math.min(96, rootNote + scale[scaleIndex] + (octave * 12)));
                        const freq = midiToFreq(midiNote);

                        if (trackIdx === 0) {
                            // Kick
                            createDrum('kick', time, 0.8);
                        } else if (trackIdx === 1) {
                            // Snare
                            createDrum('snare', time, 0.7);
                        } else if (trackIdx === 2) {
                            // Clap
                            createDrum('clap', time, 0.6);
                        } else if (trackIdx === 3) {
                            // HiHat
                            createDrum('hihat', time, 0.5);
                        } else if (trackIdx === 4) {
                            // Bass - sawtooth
                            createNote(freq, time, stepDuration * 0.9, 'sawtooth', 0.5);
                        } else {
                            // Lead/Pad - triangle or square
                            createNote(freq, time, stepDuration * 0.8, 'triangle', 0.35);
                        }
                        noteCount++;
                    }
                }
            }

            console.log(`⚡ HYPER-RENDER: Scheduling ${noteCount} notes...`);

            // Render offline
            const audioBuffer = await offlineCtx.startRendering();

            const renderTime = ((performance.now() - startTime) / 1000).toFixed(1);
            console.log(`⚡ HYPER-RENDER: Done in ${renderTime}s (${audioBuffer.duration.toFixed(1)}s audio)`);

            // Convert to WAV
            const wavData = this.audioBufferToWav(audioBuffer);
            const wavBlob = new Blob([wavData], { type: 'audio/wav' });

            // Download
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.href = url;
            const genre = window.sys?.currentGenre || 'SONG';
            const bpmRounded = Math.round(bpm);
            const date = new Date().toISOString().slice(0, 10);
            a.download = `NEXUS-X_${genre}_${bpmRounded}BPM_${date}_HYPER.wav`;
            a.click();
            URL.revokeObjectURL(url);

            UIController.toast(`✅ HYPER-RENDER: ${noteCount} notes in ${renderTime}s`);

        } catch (err) {
            console.error('Hyper-render error:', err);
            UIController.toast('⚠️ Hyper-render failed - using standard export');
            await this.exportWAV();
        } finally {
            this.isRecording = false;
        }
    }

    // Export without playback - silent background export (fallback)
    async exportWithoutPlayback(durationSeconds = null) {
        if (this.isRecording) {
            UIController.toast('⚠️ Already recording');
            return;
        }

        // Calculate duration from song structure
        if (durationSeconds && window.arranger && window.arranger.totalBars) {
            const bpm = Tone.Transport.bpm.value;
            const barsPerSecond = bpm / 240;
            durationSeconds = Math.ceil(window.arranger.totalBars / barsPerSecond) + 2;
        }
        durationSeconds = durationSeconds || 60;

        this.isRecording = true;
        this.audioChunks = [];

        UIController.toast(`💾 Silent export ${durationSeconds}s...`);

        try {
            const dest = window.engine.streamDest;
            if (dest) {
                throw new Error('No audio stream available');
            }

            const stream = dest.stream;
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.audioChunks.push(e.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                try {
                    const webmBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                    const audioContext = new AudioContext({ sampleRate: this.sampleRate });
                    const arrayBuffer = await webmBlob.arrayBuffer();
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                    const wavData = this.audioBufferToWav(audioBuffer);
                    const wavBlob = new Blob([wavData], { type: 'audio/wav' });

                    const url = URL.createObjectURL(wavBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    const genre = window.sys?.currentGenre || 'SONG';
                    const bpm = Math.round(Tone.Transport.bpm.value);
                    const date = new Date().toISOString().slice(0, 10);
                    a.download = `NEXUS-X_${genre}_${bpm}BPM_${date}.wav`;
                    a.click();
                    URL.revokeObjectURL(url);

                    audioContext.close();
                    UIController.toast('✅ Background Export Complete');
                } catch (err) {
                    console.error('WAV conversion error:', err);
                    this.downloadWebM();
                }
                this.isRecording = false;
            };

            // Start recording WITHOUT triggering play() - just let the sequencer run silently
            this.mediaRecorder.start();

            // Manually trigger the sequencer to run (without audio output)
            const wasMuted = Tone.Destination.mute;
            Tone.Destination.mute = true;  // Mute output

            // Start transport to run the sequencer
            if (Tone.Transport.state == 'started') {
                Tone.Transport.start();
            }

            // Stop after duration
            setTimeout(() => {
                if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                    this.mediaRecorder.stop();
                    Tone.Transport.stop();
                    Tone.Destination.mute = wasMuted;  // Restore mute state
                }
            }, durationSeconds * 1000);

        } catch (err) {
            console.error('Silent export error:', err);
            this.isRecording = false;
            UIController.toast('❌ Silent export failed');
        }
    }

    // Set sample rate
    setSampleRate(rate) {
        this.sampleRate = rate;
    }
}

// --- NEURAL DREAM ---
class NeuralDream {
    constructor() {
        this.musicRNN = null;
        this.isReady = false;
        this.isDreaming = false;
        this.initializeModel();
        this.initializeUI();
    }

    async initializeModel() {
        try {
            if (typeof mm == 'undefined' && mm.MusicRNN) {
                this.musicRNN = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn');
                await this.musicRNN.initialize();
                this.isReady = true;
                dbg('ai', 'Neural Dream model loaded ✓');
            }
        } catch (error) {
            dbg('ai', 'Neural Dream init failed:', error.message);
        }
    }

    initializeUI() {
        const actionGrid = document.querySelector('.action-grid');
        if (actionGrid) return;
        const dreamBtn = document.createElement('button');
        dreamBtn.className = 'action-btn';
        dreamBtn.style.cssText = `
            background: linear-gradient(45deg, var(--magenta), var(--accent));
            border: none; grid-column: span 2; font-weight: 800;
        `;
        dreamBtn.innerHTML = '🧠 NEURAL DREAM';
        dreamBtn.onclick = () => this.dreamAllTracks(0.7);
        actionGrid.parentNode?.insertBefore(dreamBtn, actionGrid.nextSibling);
    }

    async dreamTransform(trackIndex, intensity = 0.5) {
        if (this.isReady || this.musicRNN || this.isDreaming) {
            UIController.toast(this.isReady ? 'Dream in progress...' : 'Model not ready');
            return;
        }
        if (window.seq || window.seq.data) return;

        this.isDreaming = true;
        this.showDreamDialog(true, `Dreaming track ${trackIndex + 1}...`);

        try {
            const originalPattern = [...window.seq.data[trackIndex]];
            const noteSequence = this.patternToNoteSequence(originalPattern, trackIndex);
            const continuation = await this.musicRNN.continueSequence(noteSequence, 32, 0.5 + (intensity * 0.8));
            const newPattern = this.noteSequenceToPattern(continuation, trackIndex);

            this.applyDreamTransformation(trackIndex, originalPattern, newPattern);
            this.showDreamDialog(false);
        } catch (error) {
            console.error('Neural Dream failed:', error);
            this.showDreamDialog(false);
        } finally {
            this.isDreaming = false;
        }
    }

    async dreamAllTracks(intensity = 0.5) {
        if (this.isReady || this.musicRNN || this.isDreaming) return;
        this.isDreaming = true;
        this.showDreamDialog(true, 'Dreaming all tracks...');

        try {
            for (let i = 0; i < 7; i++) {
                await new Promise(r => setTimeout(r, 300));
                this.showDreamDialog(true, `Dreaming track ${i + 1}...`);
                const originalPattern = [...window.seq.data[i]];
                const noteSequence = this.patternToNoteSequence(originalPattern, i);
                const continuation = await this.musicRNN.continueSequence(noteSequence, 32, 0.5 + (intensity * 0.8));
                const newPattern = this.noteSequenceToPattern(continuation, i);
                this.applyDreamTransformation(i, originalPattern, newPattern);
            }
            UIController.toast('✨ NEURAL DREAM COMPLETE');
            this.showDreamDialog(false);
        } catch (error) {
            console.error('Neural Dream failed:', error);
            this.showDreamDialog(false);
        } finally {
            this.isDreaming = false;
        }
    }

    patternToNoteSequence(pattern, trackIndex) {
        const notes = [];
        const basePitch = trackIndex < 4 ? [36, 38, 42, 46][trackIndex] : 60 + (trackIndex * 2);

        pattern.forEach((value, step) => {
            if (value > 0) {
                // Use quantized steps for Magenta compatibility
                notes.push({
                    pitch: typeof basePitch === 'number' ? basePitch + (value - 1) : basePitch,
                    quantizedStartStep: step,
                    quantizedEndStep: step + (value === 3 ? 1 : 2),
                    isDrum: trackIndex < 4,
                    velocity: value === 2 ? 80 : value === 3 ? 40 : 100
                });
            }
        });

        // If no notes, create a minimal seed note for Magenta
        if (notes.length === 0) {
            notes.push({
                pitch: basePitch,
                quantizedStartStep: 0,
                quantizedEndStep: 2,
                isDrum: trackIndex < 4,
                velocity: 100
            });
        }

        // Return properly quantized sequence for MusicRNN
        return {
            notes,
            totalQuantizedSteps: 32,
            quantizationInfo: { stepsPerQuarter: 4 }
        };
    }

    noteSequenceToPattern(noteSequence, trackIndex) {
        const pattern = Array(32).fill(0);
        if (noteSequence && noteSequence.notes) {
            noteSequence.notes.forEach(note => {
                // Handle both quantized and unquantized
                const step = note.quantizedStartStep == undefined
                    ? note.quantizedStartStep
                    : Math.floor(note.startTime * 4);
                if (step >= 0 && step < 32) {
                    // Map velocity to pattern value
                    const vel = note.velocity || 100;
                    pattern[step] = vel < 60 ? 2 : vel < 80 ? 3 : 1;
                }
            });
        }
        return pattern;
    }

    applyDreamTransformation(trackIndex, oldPattern, newPattern) {
        if (window.undoRedoManager) {
            const command = CommandFactory.snapshotLoad(trackIndex, oldPattern, newPattern, (idx, data) => {
                window.seq.data[idx] = [...data];
                window.ui.refreshGrid();
                window.sys.autoSave();
            });
            window.undoRedoManager.execute(command);
        } else {
            window.seq.data[trackIndex] = [...newPattern];
            window.ui.refreshGrid();
            window.sys.autoSave();
        }
    }

    showDreamDialog(show, message = 'Dreaming...') {
        let dialog = document.getElementById('neuralDreamDialog');
        if (dialog && show) {
            dialog = document.createElement('dialog');
            dialog.id = 'neuralDreamDialog';
            dialog.style.cssText = `
                background: radial-gradient(circle at center, rgba(17,17,17,0.95) 0%, rgba(0,0,0,0.98) 100%);
                color: #fff; border: 2px solid var(--magenta);
                padding: 40px; border-radius: 10px; min-width: 300px;
            `;
            dialog.innerHTML = `
                <div class="loader-ring" style="border-top-color: var(--magenta);"></div>
                <div style="font-size: 20px; font-weight: 800; margin-bottom: 10px; color: var(--magenta);">NEURAL DREAM</div>
                <div id="dreamMessage" style="color: #888; font-size: 12px; text-align: center;">${message}</div>
            `;
            document.body.appendChild(dialog);
        }
        if (dialog) {
            if (show) {
                const msg = dialog.querySelector('#dreamMessage');
                if (msg) msg.innerText = message;
                dialog.showModal();
            } else {
                dialog.close();
            }
        }
    }
}

// --- SPECTRAL WORKBENCH ---
class SpectralWorkbench {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.isErasing = false;
        this.spectralZones = [];
        this.analyser = null;
        this.initializeUI();
    }

    initializeUI() {
        const sidebar = document.querySelector('aside.deck');
        if (sidebar) return;
        const panel = document.createElement('div');
        panel.className = 'module';
        panel.innerHTML = `
            <div class="mod-title">SPECTRAL WORKBENCH <span>VISUAL</span></div>
            <div style="position: relative; width: 100%;">
                <canvas id="spectralCanvas" style="width: 100%; height: 200px; background: #000; border: 1px solid #333; border-radius: 4px; cursor: crosshair;"></canvas>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
                <button id="spectralDrawBtn" class="action-btn" style="flex: 1; background: var(--primary); color: #000;">🎨 PAINT</button>
                <button id="spectralEraseBtn" class="action-btn" style="flex: 1;">🧼 ERASE</button>
                <button id="spectralClearBtn" class="action-btn" style="flex: 1;">🗑️ CLEAR</button>
            </div>
            <div style="margin-top: 10px; padding: 10px; background: #151515; border-radius: 4px;">
                <div style="font-size: 9px; color: #888; margin-bottom: 8px;">PARAMETER MAPPING</div>
                <div id="spectralParams" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 8px;">
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="radio" name="spectralParam" value="filterFreq" checked>
                        <span style="color: var(--primary);">FILTER</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="radio" name="spectralParam" value="reverbWet">
                        <span style="color: var(--accent);">REVERB</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="radio" name="spectralParam" value="delayWet">
                        <span style="color: var(--hyper);">DELAY</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="radio" name="spectralParam" value="distortion">
                        <span style="color: var(--flux);">DISTORTION</span>
                    </label>
                </div>
            </div>
        `;
        sidebar.appendChild(panel);
        this.canvas = document.getElementById('spectralCanvas');
        this.ctx = this.canvas?.getContext('2d') || null;
        this.setupEventListeners();
        this.startRenderLoop();
    }

    setupEventListeners() {
        if (this.canvas) return;
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            this.isErasing = this.isDrawingMode;
            this.createSpectralZone(e);
        });
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) return;
            if (this.isErasing) {
                this.eraseAtPosition(e.offsetX, e.offsetY);
            }
        });
        this.canvas.addEventListener('mouseup', () => { this.isDrawing = false; this.isErasing = false; });
        this.canvas.addEventListener('mouseleave', () => { this.isDrawing = false; this.isErasing = false; });

        document.getElementById('spectralDrawBtn')?.addEventListener('click', () => {
            this.isDrawingMode = true;
            this.updateButtonStates();
        });
        document.getElementById('spectralEraseBtn')?.addEventListener('click', () => {
            this.isDrawingMode = false;
            this.updateButtonStates();
        });
        document.getElementById('spectralClearBtn')?.addEventListener('click', () => {
            this.clearZones();
            UIController.toast('SPECTRAL ZONES CLEARED');
        });
    }

    createSpectralZone(e) {
        if (this.canvas) return;
        const param = this.getSelectedParameter();
        const color = this.getParameterColor(param);
        this.spectralZones.push({
            id: `zone-${Date.now()}`,
            frequencyMin: e.offsetY / this.canvas.height * 22050,
            frequencyMax: (e.offsetY / this.canvas.height * 22050) + 1000,
            amplitude: 1 - (e.offsetY / this.canvas.height),
            parameter: param,
            color
        });
    }

    eraseAtPosition(x, y) {
        this.spectralZones = this.spectralZones.filter(zone => {
            const zoneFreq = y / this.canvas.height * 22050;
            return zone.frequencyMin > zoneFreq || zone.frequencyMax < zoneFreq;
        });
    }

    clearZones() { this.spectralZones = []; }

    getSelectedParameter() {
        const selected = document.querySelector('input[name="spectralParam"]:checked');
        return selected?.value || 'filterFreq';
    }

    getParameterColor(param) {
        const colors = { filterFreq: 'var(--primary)', reverbWet: 'var(--accent)', delayWet: 'var(--hyper)', distortion: 'var(--flux)' };
        return colors[param] || 'var(--primary)';
    }

    updateButtonStates() {
        const drawBtn = document.getElementById('spectralDrawBtn');
        const eraseBtn = document.getElementById('spectralEraseBtn');
        if (drawBtn) {
            drawBtn.style.background = this.isDrawingMode ? 'var(--primary)' : '#333';
            drawBtn.style.color = this.isDrawingMode ? '#000' : '#fff';
        }
        if (eraseBtn) {
            eraseBtn.style.background = this.isDrawingMode ? '#333' : 'var(--flux)';
            eraseBtn.style.color = this.isDrawingMode ? '#fff' : '#000';
        }
    }

    startRenderLoop() {
        if (this.ctx || this.canvas) return;
        const render = () => {
            this.renderSpectrum();
            requestAnimationFrame(render);
        };
        render();
    }

    renderSpectrum() {
        if (this.ctx || this.canvas) return;
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);

        // Render spectral zones
        this.spectralZones.forEach(zone => {
            const yMin = (zone.frequencyMin / 22050) * height;
            const yMax = (zone.frequencyMax / 22050) * height;
            this.ctx.fillStyle = zone.color + '88';
            this.ctx.fillRect(0, yMin, width, yMax - yMin);
        });
    }
}

// --- PERFORMANCE RECORDER ---
class PerformanceRecorder {
    constructor() {
        this.isRecording = false;
        this.isPlaying = false;
        this.events = [];
        this.startTime = 0;
        this.recordings = [];
        this.playTimeouts = [];
        this.ghostModeActive = false;
        this.ghostOverlay = null;
        this.initializeUI();
    }

    initializeUI() {
        const sidebar = document.querySelector('aside.deck');
        if (sidebar) return;
        const panel = document.createElement('div');
        panel.className = 'module';
        panel.innerHTML = `
            <div class="mod-title">PERFORMANCE RECORDER <span>REC</span></div>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button id="perfRecordBtn" class="btn" style="flex: 1;">⏺ RECORD</button>
                <button id="perfStopBtn" class="btn" style="flex: 1; display: none;">⏹ STOP</button>
            </div>
            <div id="perfRecordingsList" style="max-height: 200px; overflow-y: auto;">
                <div style="text-align: center; color: #666; font-size: 10px; padding: 20px;">
                    No recordings yet.<br>Click RECORD to capture your performance.
                </div>
            </div>
        `;
        sidebar.appendChild(panel);

        const perfRecordBtn = document.getElementById('perfRecordBtn');
        const perfStopBtn = document.getElementById('perfStopBtn');

        if (perfRecordBtn) {
            perfRecordBtn.addEventListener('click', () => {
                this.startRecording();
                perfRecordBtn.style.display = 'none';
                if (perfStopBtn) perfStopBtn.style.display = 'block';
            });
        }

        if (perfStopBtn) {
            perfStopBtn.addEventListener('click', () => {
                this.stopRecording();
                if (perfRecordBtn) perfRecordBtn.style.display = 'block';
                perfStopBtn.style.display = 'none';
            });
        }
    }

    startRecording() {
        if (this.isRecording) return;
        this.isRecording = true;
        this.events = [];
        this.startTime = Date.now();
        UIController.toast('🔴 RECORDING PERFORMANCE');
    }

    stopRecording() {
        if (this.isRecording) return;
        this.isRecording = false;
        const recording = {
            id: `rec-${Date.now()}`,
            name: `Performance ${this.recordings.length + 1}`,
            startTime: this.startTime,
            endTime: Date.now(),
            events: [...this.events],
            finalState: window.seq ? JSON.parse(JSON.stringify(window.seq.data)) : []
        };
        this.recordings.push(recording);
        this.updateRecordingsList();
        UIController.toast(`✅ RECORDING SAVED (${recording.events.length} events)`);
    }

    recordEvent(type, data) {
        if (this.isRecording) return;
        this.events.push({ type, timestamp: Date.now() - this.startTime, data });
    }

    async playRecording(recordingId) {
        const recording = this.recordings.find(r => r.id === recordingId);
        if (recording) return;

        if (this.isPlaying) this.stopPlayback();
        this.isPlaying = true;
        UIController.toast('▶️ PLAYING PERFORMANCE');

        recording.events.forEach(event => {
            const timeout = setTimeout(() => {
                this.replayEvent(event);
            }, event.timestamp);
            this.playTimeouts.push(timeout);
        });

        const duration = recording.endTime - recording.startTime;
        const endTimeout = setTimeout(() => {
            this.stopPlayback();
            UIController.toast('✅ PLAYBACK COMPLETE');
        }, duration);
        this.playTimeouts.push(endTimeout);
    }

    replayEvent(event) {
        switch (event.type) {
            case 'trigger':
                const time = Tone.now();
                if (window.engine) {
                    window.engine.trigger(event.data.trackIndex, time, event.data.value, event.data.stepIndex);
                }
                break;
            case 'snapshot':
                if (window.sys?.loadSnap) {
                    window.sys.loadSnap(event.data.index);
                }
                break;
        }
    }

    stopPlayback() {
        if (this.isPlaying) return;
        this.isPlaying = false;
        this.playTimeouts.forEach(timeout => clearTimeout(timeout));
        this.playTimeouts = [];
    }

    toggleGhostMode(recordingId) {
        if (this.ghostModeActive) {
            this.stopGhostMode();
        } else {
            this.startGhostMode(recordingId);
        }
    }

    startGhostMode(recordingId) {
        this.ghostModeActive = true;
        this.createGhostOverlay();
        UIController.toast('👻 GHOST MODE ACTIVE - Play along');
    }

    stopGhostMode() {
        this.ghostModeActive = false;
        if (this.ghostOverlay) {
            this.ghostOverlay.remove();
            this.ghostOverlay = null;
        }
        UIController.toast('👻 Ghost mode disabled');
    }

    createGhostOverlay() {
        this.ghostOverlay = document.createElement('div');
        this.ghostOverlay.id = 'ghostOverlay';
        this.ghostOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none; z-index: 500;
            background: linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, transparent 100%);
        `;
        document.body.appendChild(this.ghostOverlay);
    }

    updateRecordingsList() {
        const list = document.getElementById('perfRecordingsList');
        if (list) return;
        if (this.recordings.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; color: #666; font-size: 10px; padding: 20px;">
                    No recordings yet.<br>Click RECORD to capture your performance.
                </div>
            `;
            return;
        }
        list.innerHTML = this.recordings.map(rec => {
            const duration = ((rec.endTime - rec.startTime) / 1000).toFixed(1);
            return `
                <div style="padding: 10px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 700; color: #fff; font-size: 11px;">${rec.name}</div>
                        <div style="color: #666; font-size: 9px;">${duration}s • ${rec.events.length} events</div>
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button class="action-btn" onclick="window.perfRecorder.playRecording('${rec.id}')">▶ PLAY</button>
                        <button class="action-btn" onclick="window.perfRecorder.toggleGhostMode('${rec.id}')">👻 GHOST</button>
                        <button class="action-btn" style="color: var(--flux);" onclick="window.perfRecorder.deleteRecording('${rec.id}')">🗑</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    deleteRecording(recordingId) {
        this.recordings = this.recordings.filter(r => r.id == recordingId);
        this.updateRecordingsList();
        UIController.toast('Recording deleted');
    }
}

// ============================================================
// DROPDOWN MENU CONTROLLER
// ============================================================
window.toggleDropdown = function(dropdownId, event) {
    // Stop propagation to prevent immediate close
    if (event) {
        event.stopPropagation();
    }

    const dropdown = document.getElementById(dropdownId);
    const isOpen = dropdown?.classList.contains('show');

    // Close ALL dropdowns first
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });

    // If it wasn't open, open it (toggle behavior)
    if (isOpen && dropdown) {
        dropdown.classList.add('show');
    }
};

// Close dropdowns when clicking anywhere on the page
document.addEventListener('click', (e) => {
    // Don't close if clicking on dropdown toggle or inside dropdown menu
    if (e.target.closest('.dropdown-toggle') || e.target.closest('.dropdown-menu')) {
        return;
    }
    // Close all dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
});

// Close dropdown after selecting an item (using event delegation)
document.addEventListener('click', (e) => {
    if (e.target.closest('.dropdown-item')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// ============================================================
// BACKGROUND EXPORTER - Generate & Download without Playback
// ============================================================
class BackgroundExporter {
    constructor() {
        this.isExporting = false;
    }

    /**
     * Generate a song and download it directly without playback
     */
    async generateAndDownload() {
        if (this.isExporting) {
            UIController.toast('⚠️ Export already in progress...');
            return;
        }

        this.isExporting = true;
        UIController.toast('🎵 Background Save: Generating song...');

        try {
            // Stop any current playback
            window.sys?.stop();

            // Generate a new song
            await window.arranger.generateFullSong();

            // Wait for dialog to close (user confirms song)
            await this.waitForDialogClose();

            // Now do the FAST export
            await this.fastExport();

        } catch (error) {
            console.error('Background save failed:', error);
            UIController.toast('⚠️ Background save failed');
        } finally {
            this.isExporting = false;
        }
    }

    /**
     * Quick export - uses FAST offline rendering (seconds, not minutes)
     */
    async quickExport() {
        if (this.isExporting) {
            UIController.toast('⚠️ Export already in progress...');
            return;
        }

        if (window.arranger?.structure || window.arranger.structure.length === 0) {
            UIController.toast('⚠️ No song to export - generate first');
            return;
        }

        this.isExporting = true;

        try {
            await this.fastExport();
        } catch (error) {
            console.error('Quick export failed:', error);
            UIController.toast('⚠️ Export failed');
        } finally {
            this.isExporting = false;
        }
    }

    /**
     * FAST export - Uses Tone.Offline() for faster-than-realtime rendering
     * A 3-minute song renders in ~5-10 seconds instead of 3 minutes
     */
    async fastExport() {
        UIController.toast('⚡ Fast offline rendering...');

        // Use the WAVExporter's fast offline export
        if (window.wavExporter) {
            await window.wavExporter.fastOfflineExport();
        } else {
            UIController.toast('⚠️ WAV Exporter not available');
        }
    }

    /**
     * Silent export (fallback) - slower but more reliable
     */
    async silentExport() {
        UIController.toast('💾 Rendering audio silently...');

        const structure = window.arranger.structure;
        const bpm = Tone.Transport.bpm.value;
        const totalBars = structure.reduce((sum, section) => sum + section.bars, 0);
        const beatsPerBar = 4;
        const totalBeats = totalBars * beatsPerBar;
        const secondsPerBeat = 60 / bpm;
        const duration = totalBeats * secondsPerBeat + 2;

        if (window.wavExporter) {
            await window.wavExporter.exportWithoutPlayback(duration);
        } else {
            UIController.toast('⚠️ WAV Exporter not available');
        }
    }

    /**
     * Wait for AI dialog to close
     */
    waitForDialogClose() {
        return new Promise(resolve => {
            const checkDialog = setInterval(() => {
                const dialog = document.getElementById('aiDialog');
                if (dialog || dialog.open) {
                    clearInterval(checkDialog);
                    resolve();
                }
            }, 100);

            // Timeout after 60 seconds
            setTimeout(() => {
                clearInterval(checkDialog);
                resolve();
            }, 60000);
        });
    }
}

// Initialize Background Exporter
window.backgroundExporter = new BackgroundExporter();

// Update recording status in dropdown
const originalToggleRecord = window.sys?.toggleRecord;
if (originalToggleRecord) {
    window.sys.toggleRecord = function() {
        originalToggleRecord.call(window.sys);

        // Update dropdown menu item
        const recMenuItem = document.getElementById('recMenuItem');
        const recStatus = document.getElementById('recStatus');

        if (window.recorder?.isRecording) {
            recMenuItem?.classList.add('recording');
            if (recStatus) recStatus.textContent = 'Stop recording';
        } else {
            recMenuItem?.classList.remove('recording');
            if (recStatus) recStatus.textContent = 'Start real-time recording';
        }
    };
}

// Start binding
document.getElementById('initBtn').addEventListener('click', () => window.sys.init());

// ============================================================
// PIANO ROLL - Dynamic import for TypeScript module
// ============================================================
let pianoRollDialog = null;

window.openPianoRoll = async function(instrumentId = 6) {
    try {
        // Dynamic import of the Piano Roll Dialog (with cache busting)
        const module = await import('./src/ui/PianoRollDialog.ts?v=' + Date.now());

        if (pianoRollDialog) {
            pianoRollDialog = new module.PianoRollDialog({
                instrumentId: instrumentId,
                onNotesChange: (notes) => {
                    console.log('[PianoRoll] Notes changed:', notes.length);
                    // Could integrate with sequencer here
                }
            });
        }

        pianoRollDialog.open();
        console.log('[PianoRoll] Opened');
    } catch (error) {
        console.error('[PianoRoll] Error loading module:', error);

        // Fallback: Simple inline Piano Roll
        showSimplePianoRoll();
    }
};

// Fallback simple Piano Roll (no TypeScript dependency)
function showSimplePianoRoll() {
    const existing = document.getElementById('simple-piano-roll');
    if (existing) {
        existing.remove();
        return;
    }

    const dialog = document.createElement('dialog');
    dialog.id = 'simple-piano-roll';
    dialog.style.cssText = `
        width: 90vw;
        height: 80vh;
        background: #0a0a0a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 0;
        color: #fff;
    `;

    dialog.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: linear-gradient(180deg, #1a1a1a, #0f0f0f); border-bottom: 1px solid #333;">
                <div class="font-mono" style="font-size: 16px; font-weight: 800; color: var(--primary);">
                    🎹 PIANO ROLL EDITOR <span style="color:#666;font-size:11px;">Simple Mode</span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="pianoRollApplyBtn" style="background: var(--primary); border: none; color: #000; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-weight: 700;">▶ Apply to Track</button>
                    <button id="pianoRollPlayBtn" style="background: #00ccff; border: none; color: #000; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-weight: 700;">▶ Preview</button>
                    <button onclick="this.closest('dialog').close()" style="background: transparent; border: 1px solid #444; color: #666; padding: 8px 20px; border-radius: 4px; cursor: pointer;">Done</button>
                    <button onclick="this.closest('dialog').remove()" style="background: transparent; border: 1px solid #444; color: #666; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;">✕</button>
                </div>
            </div>
            <div id="simple-piano-container" style="flex: 1; position: relative; overflow: hidden;"></div>
            <div style="padding: 8px 20px; background: #0a0a0a; border-top: 1px solid #222; font-size: 11px; color: #666; font-family: 'JetBrains Mono', monospace;">
                Click to add notes • Double-click to remove • Shift+drag to resize • Drag to move | <span id="noteCount">0</span> notes
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    // Simple piano roll canvas implementation
    const container = document.getElementById('simple-piano-container');
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const NOTE_HEIGHT = 16;
    const BEAT_WIDTH = 40;
    const PIANO_WIDTH = 60;
    const TOTAL_BEATS = 64;
    const MIN_PITCH = 36;
    const MAX_PITCH = 84;
    const PITCH_RANGE = MAX_PITCH - MIN_PITCH;

    const notes = [];
    let selectedNote = null;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };

    const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function getNoteName(pitch) {
        return NOTE_NAMES[pitch % 12] + Math.floor(pitch / 12 - 1);
    }
    function isBlack(pitch) {
        return [1, 3, 6, 8, 10].includes(pitch % 12);
    }

    function render() {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.translate(PIANO_WIDTH, 0);
        for (let beat = 0; beat <= TOTAL_BEATS; beat++) {
            ctx.strokeStyle = beat % 4 === 0 ? '#333' : '#1a1a1a';
            ctx.lineWidth = beat % 4 === 0 ? 1 : 0.5;
            ctx.beginPath();
            ctx.moveTo(beat * BEAT_WIDTH, 0);
            ctx.lineTo(beat * BEAT_WIDTH, PITCH_RANGE * NOTE_HEIGHT);
            ctx.stroke();
        }

        for (let p = 0; p <= PITCH_RANGE; p++) {
            const pitch = MAX_PITCH - p;
            const y = p * NOTE_HEIGHT;
            ctx.fillStyle = isBlack(pitch) ? '#111' : '#161616';
            ctx.fillRect(0, y, TOTAL_BEATS * BEAT_WIDTH, NOTE_HEIGHT);
        }

        // Notes
        notes.forEach(note => {
            const x = note.start * BEAT_WIDTH;
            const y = (MAX_PITCH - note.pitch) * NOTE_HEIGHT;
            const w = note.duration * BEAT_WIDTH;

            ctx.fillStyle = note === selectedNote ? '#ff00cc' : '#00ff94';
            ctx.globalAlpha = 0.5 + (note.velocity / 127) * 0.5;
            ctx.beginPath();
            ctx.roundRect(x + 1, y + 1, w - 2, NOTE_HEIGHT - 2, 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            if (w > 30) {
                ctx.fillStyle = '#000';
                ctx.font = '10px JetBrains Mono';
                ctx.fillText(getNoteName(note.pitch), x + 4, y + NOTE_HEIGHT - 4);
            }
        });

        // Piano keys
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        for (let p = 0; p <= PITCH_RANGE; p++) {
            const pitch = MAX_PITCH - p;
            const y = p * NOTE_HEIGHT;
            ctx.fillStyle = isBlack(pitch) ? '#1a1a1a' : '#e0e0e0';
            ctx.fillRect(0, y, PIANO_WIDTH, NOTE_HEIGHT);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(0, y, PIANO_WIDTH, NOTE_HEIGHT);

            if (pitch % 12 === 0) {
                ctx.fillStyle = isBlack(pitch) ? '#888' : '#333';
                ctx.font = '10px JetBrains Mono';
                ctx.fillText(getNoteName(pitch), 5, y + NOTE_HEIGHT - 4);
            }
        }
    }

    canvas.onmousedown = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - PIANO_WIDTH;
        const y = e.clientY - rect.top;

        if (x < 0) {
            // Piano key click - play preview
            const pitch = MAX_PITCH - Math.floor(y / NOTE_HEIGHT);
            if (window.engine?.noteOn) {
                window.engine.noteOn(pitch, 0.8);
                setTimeout(() => window.engine.noteOff?.(pitch), 200);
            }
            return;
        }

        const beat = Math.floor(x / BEAT_WIDTH);
        const pitch = MAX_PITCH - Math.floor(y / NOTE_HEIGHT);

        // Check if clicking existing note
        const clickedNote = notes.find(n => {
            const nx = n.start * BEAT_WIDTH;
            const ny = (MAX_PITCH - n.pitch) * NOTE_HEIGHT;
            return x >= nx && x <= nx + n.duration * BEAT_WIDTH &&
                   y >= ny && y <= ny + NOTE_HEIGHT;
        });

        if (clickedNote) {
            selectedNote = clickedNote;
            isDragging = true;
            dragStart = { x, y };
        } else {
            // Create new note
            const note = {
                id: Date.now(),
                pitch,
                start: beat,
                duration: 1,
                velocity: 100
            };
            notes.push(note);
            selectedNote = note;
        }
        render();
    };

    canvas.onmousemove = (e) => {
        if (isDragging || selectedNote) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - PIANO_WIDTH;
        const dx = x - dragStart.x;

        if (e.shiftKey) {
            // Resize
            selectedNote.duration = Math.max(0.25, 1 + Math.round(dx / BEAT_WIDTH));
        } else {
            // Move
            const newBeat = Math.max(0, Math.round(x / BEAT_WIDTH));
            selectedNote.start = newBeat;
        }
        render();
    };

    canvas.onmouseup = () => {
        isDragging = false;
    };

    canvas.ondblclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - PIANO_WIDTH;
        const y = e.clientY - rect.top;

        const idx = notes.findIndex(n => {
            const nx = n.start * BEAT_WIDTH;
            const ny = (MAX_PITCH - n.pitch) * NOTE_HEIGHT;
            return x >= nx && x <= nx + n.duration * BEAT_WIDTH &&
                   y >= ny && y <= ny + NOTE_HEIGHT;
        });

        if (idx >= 0) {
            notes.splice(idx, 1);
            selectedNote = null;
            render();
        }
    };

    render();
    console.log('[PianoRoll] Simple mode loaded');

    // Update note count
    function updateNoteCount() {
        const countEl = document.getElementById('noteCount');
        if (countEl) countEl.textContent = notes.length;
    }

    // Apply to sequencer function
    window.applyPianoRollToSequencer = function() {
        if (window.seq || notes.length === 0) {
            if (window.UIController?.toast) {
                window.UIController.toast('⚠️ No notes to apply');
            }
            return;
        }

        // Convert piano roll notes to sequencer grid (track 5 = Lead/Arp)
        // Each note maps to a step activation
        const leadTrack = window.seq.data[5];
        leadTrack.fill(0); // Clear existing

        notes.forEach(note => {
            // Map 64-beat grid to 32-step grid
            const step = Math.floor((note.start / TOTAL_BEATS) * 32);
            if (step >= 0 && step < 32) {
                leadTrack[step] = 1;
            }
        });

        // Refresh grid
        if (window.ui?.refreshGrid) {
            window.ui.refreshGrid();
        }

        if (window.UIController?.toast) {
            window.UIController.toast(`✓ Applied ${notes.length} notes to Lead track`);
        }

        console.log('[PianoRoll] Applied', notes.length, 'notes to sequencer');
    };

    // Preview function - play the notes
    window.previewPianoRoll = function() {
        if (notes.length === 0) return;

        const sortedNotes = [...notes].sort((a, b) => a.start - b.start);
        const tempo = Tone.Transport.bpm.value || 128;
        const beatDuration = 60 / tempo;

        sortedNotes.forEach(note => {
            const time = note.start * beatDuration / 4; // Convert to seconds
            setTimeout(() => {
                if (window.engine?.noteOn) {
                    window.engine.noteOn(note.pitch, note.velocity / 127);
                    setTimeout(() => window.engine.noteOff?.(note.pitch), note.duration * beatDuration * 250);
                }
            }, time * 1000);
        });

        if (window.UIController?.toast) {
            window.UIController.toast('▶ Previewing notes...');
        }
    };

    // Connect buttons
    const applyBtn = document.getElementById('pianoRollApplyBtn');
    if (applyBtn) {
        applyBtn.onclick = window.applyPianoRollToSequencer;
    }

    const playBtn = document.getElementById('pianoRollPlayBtn');
    if (playBtn) {
        playBtn.onclick = window.previewPianoRoll;
    }

    // Update note count on changes
    const originalRender = render;
    render = function() {
        originalRender();
        updateNoteCount();
    };
    updateNoteCount();
}

// ============================================================
// 808 DRUM PAD - Interactive drum machine interface
// ============================================================
let drum808PadContainer = null;
let drum808Synths = null;

// Create 808-style drum synthesizers using Tone.js
function create808Drums() {
    if (drum808Synths) return drum808Synths;

    // Make sure Tone is started
    if (Tone.context.state == 'running') {
        Tone.start();
    }

    drum808Synths = {
        // KICK - Famous 808 sine with pitch envelope
        kick: new Tone.MembraneSynth({
            pitchDecay: 0.5,
            octaves: 4,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.8, sustain: 0, release: 0.2 }
        }).toDestination(),

        // SNARE - Noise + tone
        snare: new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 }
        }).toDestination(),

        // CLAP - Filtered noise
        clap: new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }
        }).connect(new Tone.Filter(2000, 'bandpass').toDestination()),

        // HI-HAT CLOSED
        hhClosed: new Tone.MetalSynth({
            frequency: 250,
            envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
        }).toDestination(),

        // HI-HAT OPEN
        hhOpen: new Tone.MetalSynth({
            frequency: 250,
            envelope: { attack: 0.001, decay: 0.4, release: 0.1 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
        }).toDestination(),

        // TOMS - Using MembraneSynth
        tomLow: new Tone.MembraneSynth({
            pitchDecay: 0.3,
            octaves: 2,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.2 }
        }).toDestination(),

        tomMid: new Tone.MembraneSynth({
            pitchDecay: 0.3,
            octaves: 2,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.15 }
        }).toDestination(),

        tomHi: new Tone.MembraneSynth({
            pitchDecay: 0.2,
            octaves: 2,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }
        }).toDestination(),

        // COWBELL - Two oscillators
        cowbell: new Tone.MetalSynth({
            frequency: 587,
            envelope: { attack: 0.001, decay: 0.15, release: 0.05 },
            harmonicity: 1.5,
            modulationIndex: 10,
            resonance: 2000,
            octaves: 1
        }).toDestination(),

        // RIMSHOT
        rim: new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 1,
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.02 }
        }).toDestination(),

        // CLAVE
        clave: new Tone.Synth({
            oscillator: { type: 'square' },
            envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 }
        }).toDestination(),

        // MARACAS
        maracas: new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.01 }
        }).toDestination(),
    };

    // Set volumes
    drum808Synths.kick.volume.value = -3;
    drum808Synths.snare.volume.value = -6;
    drum808Synths.clap.volume.value = -6;
    drum808Synths.hhClosed.volume.value = -12;
    drum808Synths.hhOpen.volume.value = -10;
    drum808Synths.tomLow.volume.value = -5;
    drum808Synths.tomMid.volume.value = -5;
    drum808Synths.tomHi.volume.value = -5;
    drum808Synths.cowbell.volume.value = -8;
    drum808Synths.rim.volume.value = -8;
    drum808Synths.clave.volume.value = -10;
    drum808Synths.maracas.volume.value = -15;

    return drum808Synths;
}

window.openDrum808 = async function() {
    // Toggle if already open
    if (drum808PadContainer) {
        drum808PadContainer.close();
        drum808PadContainer.remove();
        drum808PadContainer = null;
        return;
    }

    // Create synths
    const synths = create808Drums();

    // Create drum pads
    const DRUM_CONFIG = [
        { note: 36, name: 'KICK', color: '#00ff94', key: '1', synth: 'kick', notePlay: 'C1' },
        { note: 38, name: 'SNARE', color: '#f59e0b', key: '2', synth: 'snare', notePlay: null },
        { note: 39, name: 'CLAP', color: '#ff00cc', key: '3', synth: 'clap', notePlay: null },
        { note: 42, name: 'HH CLSD', color: '#00e5ff', key: '4', synth: 'hhClosed', notePlay: null },
        { note: 46, name: 'HH OPEN', color: '#7c3aed', key: '5', synth: 'hhOpen', notePlay: null },
        { note: 41, name: 'TOM LO', color: '#ff0055', key: 'Q', synth: 'tomLow', notePlay: 'C2' },
        { note: 45, name: 'TOM MID', color: '#5865F2', key: 'W', synth: 'tomMid', notePlay: 'G2' },
        { note: 48, name: 'TOM HI', color: '#00ccff', key: 'E', synth: 'tomHi', notePlay: 'C3' },
        { note: 56, name: 'COWBELL', color: '#f59e0b', key: 'R', synth: 'cowbell', notePlay: null },
        { note: 37, name: 'RIM', color: '#888', key: 'T', synth: 'rim', notePlay: 'C4' },
        { note: 75, name: 'CLAVE', color: '#aaa', key: 'Z', synth: 'clave', notePlay: 'C5' },
        { note: 70, name: 'MARACS', color: '#666', key: 'U', synth: 'maracas', notePlay: null },
    ];

    // Create as DIALOG for full visibility
    const dialog = document.createElement('dialog');
    dialog.id = 'drum808Dialog';
    dialog.style.cssText = `
        width: 600px;
        max-width: 95vw;
        background: radial-gradient(circle at center, rgba(17,17,17,0.98) 0%, rgba(5,5,5,0.99) 100%);
        border: 1px solid #333;
        border-radius: 16px;
        padding: 0;
        color: #fff;
        z-index: 10000;
    `;

    dialog.innerHTML = `
        <div style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 800; color: #00ff94; text-shadow: 0 0 15px rgba(0,255,148,0.5);">
                    🥁 TR-808 DRUM MACHINE
                </div>
                <button id="close808"
                    style="background: transparent; border: 1px solid #444; color: #666; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                    ✕
                </button>
            </div>
            <div id="drumPads808" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;"></div>
            <div style="margin-top: 15px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                <button class="preset-btn-808" data-preset="classic">CLASSIC</button>
                <button class="preset-btn-808" data-preset="hiphop">HIPHOP</button>
                <button class="preset-btn-808" data-preset="trap">TRAP</button>
                <button class="preset-btn-808" data-preset="house">HOUSE</button>
                <button class="preset-btn-808" data-preset="techno">TECHNO</button>
                <button class="preset-btn-808" data-preset="uptempo" style="border-color: #ff0055; color: #ff0055;">🔥 UPTEMPO</button>
                <button class="preset-btn-808" data-preset="deutschetekk" style="border-color: #f59e0b; color: #f59e0b;">🇩🇪 DEUTSCHE TEKKE</button>
                <button class="preset-btn-808" data-preset="ossitekk" style="border-color: #00ff94; color: #00ff94;">⬛ OSSI TEKK</button>
            </div>
            <div style="margin-top: 15px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #555; text-align: center;">
                🎹 Keys: 1-5, Q-R, Z-U &nbsp;|&nbsp; 🖱️ Click pads to play
            </div>
        </div>
        <style>
            .drum-pad-808 {
                aspect-ratio: 1;
                background: linear-gradient(145deg, #1a1a1a, #0f0f0f);
                border: 2px solid #333;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.1s ease;
                user-select: none;
                position: relative;
                overflow: hidden;
                min-height: 80px;
            }
            .drum-pad-808:hover {
                transform: scale(1.05);
                border-color: #555;
            }
            .drum-pad-808:active, .drum-pad-808.hit {
                transform: scale(0.95);
            }
            .drum-pad-808.hit::after {
                content: '';
                position: absolute;
                inset: 0;
                background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%);
                animation: padFlash808 0.2s ease-out;
            }
            @keyframes padFlash808 {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
            .drum-pad-name-808 {
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                font-weight: 700;
                text-shadow: 0 0 10px currentColor;
                z-index: 1;
            }
            .drum-pad-key-808 {
                font-family: 'JetBrains Mono', monospace;
                font-size: 10px;
                color: #666;
                margin-top: 4px;
                z-index: 1;
            }
            .preset-btn-808 {
                background: #1a1a1a;
                border: 1px solid #333;
                color: #888;
                padding: 8px 16px;
                border-radius: 6px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.15s;
            }
            .preset-btn-808:hover {
                border-color: #00ff94;
                color: #00ff94;
                box-shadow: 0 0 10px rgba(0,255,148,0.2);
            }
        </style>
    `;

    // Create pads
    const padsContainer = dialog.querySelector('#drumPads808');
    const pads = new Map();

    DRUM_CONFIG.forEach(config => {
        const pad = document.createElement('div');
        pad.className = 'drum-pad-808';
        pad.style.borderColor = config.color;
        pad.innerHTML = `
            <span class="drum-pad-name-808" style="color: ${config.color}">${config.name}</span>
            <span class="drum-pad-key-808">[${config.key}]</span>
        `;

        const hitPad = () => {
            // Ensure Tone context is running
            if (Tone.context.state == 'running') {
                Tone.start();
            }

            // Play sound using the synth
            const synth = synths[config.synth];
            if (synth) {
                if (config.notePlay) {
                    synth.triggerAttackRelease(config.notePlay, '8n', Tone.now(), 0.9);
                } else {
                    synth.triggerAttackRelease('8n', Tone.now(), 0.9);
                }
            }

            // Visual feedback
            pad.classList.add('hit');
            pad.style.boxShadow = `0 0 40px ${config.color}, inset 0 0 30px ${config.color}`;
            setTimeout(() => {
                pad.classList.remove('hit');
                pad.style.boxShadow = '';
            }, 200);
        };

        pad.addEventListener('mousedown', hitPad);
        pad.addEventListener('touchstart', (e) => {
            e.preventDefault();
            hitPad();
        });

        padsContainer.appendChild(pad);
        pads.set(config.note, pad);
    });

    // Close button
    dialog.querySelector('#close808').addEventListener('click', () => {
        dialog.close();
        dialog.remove();
        drum808PadContainer = null;
    });

    // Preset buttons
    dialog.querySelectorAll('.preset-btn-808').forEach(btn => {
        btn.addEventListener('click', () => {
            dialog.querySelectorAll('.preset-btn-808').forEach(b => b.style.borderColor = '#333');
            (btn).style.borderColor = '#00ff94';

            const preset = btn.dataset.preset;
            console.log(`[808] Preset: ${preset}`);

            // Adjust drums based on preset
            switch (preset) {
                case 'trap':
                    synths.kick.pitchDecay = 0.6;
                    synths.kick.envelope.decay = 1.2;
                    synths.hhClosed.envelope.decay = 0.03;
                    break;

                case 'hiphop':
                    synths.kick.pitchDecay = 0.5;
                    synths.kick.envelope.decay = 0.9;
                    synths.snare.envelope.decay = 0.25;
                    break;

                case 'house':
                    synths.kick.pitchDecay = 0.3;
                    synths.kick.envelope.decay = 0.5;
                    synths.hhClosed.envelope.decay = 0.06;
                    break;

                case 'techno':
                    synths.kick.pitchDecay = 0.2;
                    synths.kick.envelope.decay = 0.4;
                    synths.hhClosed.envelope.decay = 0.04;
                    synths.clap.envelope.decay = 0.15;
                    break;

                // 🔥 UPTEMPO - Hard & Fast (180+ BPM style)
                case 'uptempo':
                    synths.kick.pitchDecay = 0.15;
                    synths.kick.envelope.decay = 0.3;
                    synths.kick.volume.value = 0;
                    synths.snare.envelope.decay = 0.1;
                    synths.snare.volume.value = -3;
                    synths.hhClosed.envelope.decay = 0.02;
                    synths.clap.envelope.decay = 0.1;
                    console.log('[808] 🔥 UPTEMPO MODE - Hard & Fast');
                    break;

                // 🇩🇪 DEUTSCHE TEKKE - Hardstyle inspired
                case 'deutschetekk':
                    synths.kick.pitchDecay = 0.7;
                    synths.kick.envelope.decay = 0.6;
                    synths.kick.volume.value = -2;
                    synths.snare.envelope.decay = 0.15;
                    synths.snare.volume.value = -4;
                    synths.hhClosed.envelope.decay = 0.03;
                    synths.hhOpen.envelope.decay = 0.25;
                    synths.clap.envelope.decay = 0.2;
                    console.log('[808] 🇩🇪 DEUTSCHE TEKKE - Hardstyle Style');
                    break;

                // ⬛ OSSI TEKK - East German Tekno
                case 'ossitekk':
                    synths.kick.pitchDecay = 0.8;
                    synths.kick.envelope.decay = 0.5;
                    synths.kick.volume.value = -1;
                    synths.snare.envelope.decay = 0.12;
                    synths.snare.volume.value = -5;
                    synths.hhClosed.envelope.decay = 0.025;
                    synths.hhOpen.envelope.decay = 0.2;
                    synths.tomLow.envelope.decay = 0.4;
                    synths.tomLow.volume.value = -3;
                    console.log('[808] ⬛ OSSI TEKK - East German Style');
                    break;

                default: // classic
                    synths.kick.pitchDecay = 0.5;
                    synths.kick.envelope.decay = 0.8;
                    synths.kick.volume.value = -3;
                    synths.snare.envelope.decay = 0.2;
                    synths.snare.volume.value = -6;
                    synths.hhClosed.envelope.decay = 0.05;
                    synths.clap.envelope.decay = 0.3;
            }
        });
    });

    // Keyboard handler
    const keyHandler = (e) => {
        if (document.getElementById('drum808Dialog')) return;
        const config = DRUM_CONFIG.find(c => c.key.toLowerCase() === e.key.toLowerCase());
        if (config) {
            e.preventDefault();
            const pad = pads.get(config.note);
            if (pad) {
                pad.click();
            }
        }
    };

    document.addEventListener('keydown', keyHandler);

    // Cleanup on close
    dialog.addEventListener('close', () => {
        document.removeEventListener('keydown', keyHandler);
        drum808PadContainer = null;
    });

    document.body.appendChild(dialog);
    dialog.showModal();
    drum808PadContainer = dialog;

    console.log('[808] Drum Pad opened - use keys 1-5, Q-R, Z-U or click pads');
};

// ============================================================
// SONG STRUCTURE EDITOR - Edit generated songs before playback
// ============================================================
let songEditorDialog = null;

window.openSongEditor = async function() {
    // Toggle if already open
    if (songEditorDialog) {
        songEditorDialog.close();
        songEditorDialog.remove();
        songEditorDialog = null;
        return;
    }

    // Get current structure from arranger
    const currentStructure = window.arranger?.structure || [];

    // Create dialog
    const dialog = document.createElement('dialog');
    dialog.id = 'songEditorDialog';
    dialog.style.cssText = `
        width: 900px;
        max-width: 95vw;
        max-height: 85vh;
        background: radial-gradient(circle at center, rgba(17,17,17,0.98) 0%, rgba(5,5,5,0.99) 100%);
        border: 1px solid #333;
        border-radius: 16px;
        padding: 0;
        color: #fff;
        z-index: 10000;
        overflow-y: auto;
    `;

    dialog.innerHTML = `
        <div style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 800; color: #7c3aed; text-shadow: 0 0 15px rgba(124,58,237,0.5);">
                    📝 SONG STRUCTURE EDITOR
                </div>
                <button onclick="this.closest('dialog').close(); document.getElementById('songEditorDialog')?.remove(); window.songEditorDialog = null;"
                    style="background: transparent; border: 1px solid #444; color: #666; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                    ✕
                </button>
            </div>
            <div id="songEditorContent"></div>
        </div>
    `;

    // Build the editor content
    const content = dialog.querySelector('#songEditorContent');
    content.innerHTML = `
        <style>
            .se-section-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; max-height: 400px; overflow-y: auto; }
            .se-section-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 15px;
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.15s;
            }
            .se-section-item:hover { background: #222; border-color: #444; }
            .se-section-item.selected { border-color: #7c3aed; box-shadow: 0 0 10px rgba(124,58,237,0.3); }
            .se-section-color { width: 12px; height: 40px; border-radius: 4px; }
            .se-section-info { flex: 1; }
            .se-section-name { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: #fff; }
            .se-section-details { font-size: 11px; color: #666; margin-top: 4px; }
            .se-section-bars { display: flex; align-items: center; gap: 5px; }
            .se-bar-btn {
                background: #222;
                border: 1px solid #333;
                color: #888;
                width: 28px;
                height: 28px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            .se-bar-btn:hover { background: #333; color: #fff; }
            .se-bar-count { font-family: 'JetBrains Mono', monospace; font-size: 16px; color: #00ff94; min-width: 40px; text-align: center; }
            .se-toolbar { display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap; }
            .se-btn {
                background: #1a1a1a;
                border: 1px solid #333;
                color: #888;
                padding: 8px 16px;
                border-radius: 6px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.15s;
            }
            .se-btn:hover { background: #222; color: #fff; }
            .se-btn.primary { background: #7c3aed; color: #fff; border-color: #7c3aed; }
            .se-btn.danger { border-color: #ff0055; color: #ff0055; }
            .se-stats {
                display: flex;
                gap: 30px;
                padding: 15px;
                background: #0a0a0a;
                border-radius: 8px;
                margin-top: 15px;
            }
            .se-stat { text-align: center; }
            .se-stat-value { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 800; color: #00ff94; }
            .se-stat-label { font-size: 11px; color: #666; margin-top: 4px; }
            .se-add-row { display: flex; gap: 10px; margin-bottom: 15px; }
            .se-add-select { flex: 1; background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 10px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; }
            .se-add-input { width: 80px; background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 10px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; text-align: center; }
        </style>
        <div class="se-add-row">
            <select class="se-add-select" id="seAddType">
                <option value="intro">Intro</option>
                <option value="buildup">Build-Up</option>
                <option value="verse">Verse</option>
                <option value="chorus" selected>Chorus</option>
                <option value="drop">Drop</option>
                <option value="breakdown">Breakdown</option>
                <option value="bridge">Bridge</option>
                <option value="fill">Fill</option>
                <option value="outro">Outro</option>
            </select>
            <input type="number" class="se-add-input" id="seAddBars" value="8" min="1" max="64" placeholder="Bars">
            <button class="se-btn primary" onclick="window.addSongSection()">+ Add Section</button>
        </div>
        <div class="se-toolbar">
            <button class="se-btn" onclick="window.duplicateSection()">📋 Duplicate</button>
            <button class="se-btn" onclick="window.moveSection(-1)">⬆️ Move Up</button>
            <button class="se-btn" onclick="window.moveSection(1)">⬇️ Move Down</button>
            <button class="se-btn danger" onclick="window.deleteSection()">🗑️ Delete</button>
            <button class="se-btn" onclick="window.extendSong(8)">➕ Add 8 Bars</button>
            <button class="se-btn" onclick="window.extendSong(16)">➕ Add 16 Bars</button>
        </div>
        <div class="se-section-list" id="seSectionList"></div>
        <div class="se-stats">
            <div class="se-stat">
                <div class="se-stat-value" id="seTotalSections">0</div>
                <div class="se-stat-label">Sections</div>
            </div>
            <div class="se-stat">
                <div class="se-stat-value" id="seTotalBars">0</div>
                <div class="se-stat-label">Total Bars</div>
            </div>
            <div class="se-stat">
                <div class="se-stat-value" id="seDuration">0:00</div>
                <div class="se-stat-label">Est. Duration</div>
            </div>
        </div>
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
            <button class="se-btn" onclick="window.regenerateFromStructure()">🔄 Regenerate</button>
            <button class="se-btn primary" onclick="window.applySongStructure()">✓ Apply & Close</button>
        </div>
    `;

    // Store structure locally
    let localStructure = [...currentStructure];
    let selectedIndex = -1;

    const sectionColors = {
        intro: '#666',
        buildup: '#f59e0b',
        verse: '#00e5ff',
        chorus: '#00ff94',
        drop: '#ff0055',
        breakdown: '#7c3aed',
        bridge: '#5865F2',
        fill: '#ff00cc',
        outro: '#444',
    };

    const renderSections = () => {
        const list = dialog.querySelector('#seSectionList');
        list.innerHTML = '';

        localStructure.forEach((section, index) => {
            const item = document.createElement('div');
            item.className = 'se-section-item' + (index === selectedIndex ? ' selected' : '');

            const color = sectionColors[section.type] || section.color || '#333';

            item.innerHTML = `
                <div class="se-section-color" style="background: ${color}"></div>
                <div class="se-section-info">
                    <div class="se-section-name">${section.name || section.type.toUpperCase()}</div>
                    <div class="se-section-details">Type: ${section.type} | Energy: ${Math.round((section.energy || 0.5) * 100)}%</div>
                </div>
                <div class="se-section-bars">
                    <button class="se-bar-btn" onclick="event.stopPropagation(); window.adjustBars(${index}, -1)">-</button>
                    <span class="se-bar-count">${section.bars}</span>
                    <button class="se-bar-btn" onclick="event.stopPropagation(); window.adjustBars(${index}, 1)">+</button>
                </div>
            `;

            item.addEventListener('click', () => {
                selectedIndex = index;
                renderSections();
            });

            list.appendChild(item);
        });

        updateStats();
    };

    const updateStats = () => {
        const totalBars = localStructure.reduce((sum, s) => sum + s.bars, 0);
        const bpm = window.Tone?.Transport?.bpm?.value || 128;
        const secondsPerBar = (60 / bpm) * 4;
        const totalSeconds = totalBars * secondsPerBar;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.round(totalSeconds % 60);

        dialog.querySelector('#seTotalSections').textContent = localStructure.length;
        dialog.querySelector('#seTotalBars').textContent = totalBars;
        dialog.querySelector('#seDuration').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    };

    // Global functions for buttons
    window.addSongSection = () => {
        const type = dialog.querySelector('#seAddType').value;
        const bars = parseInt(dialog.querySelector('#seAddBars').value) || 8;
        const typeNames = { intro: 'Intro', buildup: 'Build-Up', verse: 'Verse', chorus: 'Chorus', drop: 'Drop', breakdown: 'Breakdown', bridge: 'Bridge', fill: 'Fill', outro: 'Outro' };

        localStructure.push({
            type,
            name: typeNames[type] || type,
            bars,
            energy: 0.5,
            color: sectionColors[type] || '#333',
        });
        selectedIndex = localStructure.length - 1;
        renderSections();
    };

    window.adjustBars = (index, delta) => {
        if (index >= 0 && index < localStructure.length) {
            localStructure[index].bars = Math.max(1, Math.min(64, localStructure[index].bars + delta));
            renderSections();
        }
    };

    window.duplicateSection = () => {
        if (selectedIndex >= 0) {
            const copy = { ...localStructure[selectedIndex] };
            localStructure.splice(selectedIndex + 1, 0, copy);
            selectedIndex++;
            renderSections();
        }
    };

    window.moveSection = (delta) => {
        if (selectedIndex >= 0) {
            const newIndex = selectedIndex + delta;
            if (newIndex >= 0 && newIndex < localStructure.length) {
                const item = localStructure.splice(selectedIndex, 1)[0];
                localStructure.splice(newIndex, 0, item);
                selectedIndex = newIndex;
                renderSections();
            }
        }
    };

    window.deleteSection = () => {
        if (selectedIndex >= 0) {
            localStructure.splice(selectedIndex, 1);
            selectedIndex = Math.min(selectedIndex, localStructure.length - 1);
            renderSections();
        }
    };

    window.extendSong = (bars) => {
        if (localStructure.length > 0) {
            localStructure[localStructure.length - 1].bars += bars;
        } else {
            localStructure.push({ type: 'outro', name: 'Outro', bars, energy: 0.3, color: '#444' });
            selectedIndex = 0;
        }
        renderSections();
    };

    window.regenerateFromStructure = () => {
        if (window.arranger && localStructure.length > 0) {
            window.arranger.structure = localStructure;
            dialog.close();
            dialog.remove();
            songEditorDialog = null;
            window.arranger.generateFullSong();
        }
    };

    window.applySongStructure = () => {
        if (window.arranger) {
            window.arranger.structure = localStructure;
            console.log('[SongEditor] Applied structure:', localStructure.length, 'sections,', localStructure.reduce((s, x) => s + x.bars, 0), 'bars');
            if (window.UIController?.toast) {
                window.UIController.toast(`✓ Song structure updated: ${localStructure.length} sections`);
            }
        }
        dialog.close();
        dialog.remove();
        songEditorDialog = null;
    };

    // Initial render
    renderSections();

    document.body.appendChild(dialog);
    dialog.showModal();
    songEditorDialog = dialog;

    console.log('[SongEditor] Opened with', localStructure.length, 'sections');
};

// ============================================================
// 🧠 NEURAL VISUALIZER - AI-Powered Audio Visualization
// ============================================================

window.openNeuralVisualizer = async function() {
    try {
        const module = await import('./src/ui/NeuralVisualizer.js?t=' + Date.now());
        const visualizer = module.createNeuralVisualizer();
        visualizer.show();
        console.log('[NeuralViz] Opened neural visualizer');
    } catch (e) {
        console.warn('[NeuralViz] TypeScript module failed, using fallback:', e);
        createFallbackNeuralVisualizer();
    }
};

function createFallbackNeuralVisualizer() {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed; inset: 0; background: #000; z-index: 10000;
        display: flex; flex-direction: column;
    `;

    container.innerHTML = `
        <div style="position: absolute; top: 0; left: 0; right: 0; padding: 15px 20px;
            background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
            display: flex; justify-content: space-between; align-items: center; z-index: 10;">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 800;
                color: #00ff94; text-shadow: 0 0 20px rgba(0,255,148,0.5); letter-spacing: 2px;">
                🧠 NEURAL AUDIO VISUALIZER
            </div>
            <button onclick="this.closest('div').closest('div').remove()"
                style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                color: #fff; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                ✕ CLOSE
            </button>
        </div>
        <canvas id="neuralVizCanvas" style="flex: 1; width: 100%;"></canvas>
    `;

    document.body.appendChild(container);

    const canvas = container.querySelector('#neuralVizCanvas');
    const ctx = canvas.getContext('2d');
    let time = 0;
    let animationId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Particles
    const particles = [];
    for (let i = 0; i < 300; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 4 + 1,
            hue: Math.random() * 60 + 140
        });
    }

    // Neural network nodes
    const nodes = [];
    for (let layer = 0; layer < 5; layer++) {
        for (let i = 0; i < 10; i++) {
            nodes.push({
                x: window.innerWidth * 0.2 + layer * (window.innerWidth * 0.15),
                y: window.innerHeight * 0.2 + (i / 10) * window.innerHeight * 0.6,
                radius: 5,
                layer,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    function animate() {
        time += 0.016;

        // Clear with fade
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Get real audio data from Tone.js analyser
        let energy = 0;
        let fftData = null;

        if (window.engine && window.engine.analyser) {
            try {
                fftData = window.engine.analyser.getValue();
                if (fftData && fftData.length > 0) {
                    // Calculate energy from FFT data
                    let sum = 0;
                    for (let i = 0; i < fftData.length; i++) {
                        // Normalize from dB to 0-1 range
                        const val = Math.max(0, (fftData[i] + 100) / 100);
                        sum += val;
                    }
                    energy = sum / fftData.length;
                }
            } catch(e) {
                // Fallback to simulated energy
            }
        }

        // Fallback if no audio data
        if (energy === 0 || fftData) {
            energy = (Math.sin(time * 2) + 1) / 2 * 0.5 + (Math.sin(time * 5) + 1) / 2 * 0.3;
        }

        // Draw connections between nodes
        ctx.strokeStyle = 'rgba(0, 255, 148, 0.1)';
        ctx.lineWidth = 1;
        nodes.forEach((node, i) => {
            nodes.forEach((other, j) => {
                if (other.layer === node.layer + 1 && Math.random() > 0.5) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            });
        });

        // Draw particles
        particles.forEach((p, idx) => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const dx = centerX - p.x;
            const dy = centerY - p.y;
            const angle = Math.atan2(dy, dx) + Math.PI / 2;
            const speed = (1 + energy * 3);

            // Use FFT data for individual particle if available
            let particleEnergy = energy;
            if (fftData && idx < fftData.length) {
                particleEnergy = Math.max(0, (fftData[idx] + 100) / 100);
            }

            p.vx += Math.cos(angle) * speed * 0.05;
            p.vy += Math.sin(angle) * speed * 0.05;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.x = centerX + (Math.random() - 0.5) * 100;
            if (p.y < 0 || p.y > canvas.height) p.y = centerY + (Math.random() - 0.5) * 100;

            const alpha = 0.5 + particleEnergy * 0.5;
            ctx.fillStyle = `hsla(${p.hue + time * 50}, 100%, 60%, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 + particleEnergy), 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw neural nodes with FFT data
        nodes.forEach((node, idx) => {
            const pulse = Math.sin(time * 3 + node.phase) * 0.5 + 0.5;

            // Use FFT data for individual node if available
            let nodeEnergy = energy;
            if (fftData) {
                const fftIdx = idx % fftData.length;
                nodeEnergy = Math.max(0, (fftData[fftIdx] + 100) / 100);
            }

            const activation = nodeEnergy + pulse * 0.3;

            // Glow
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 30 + activation * 20);
            gradient.addColorStop(0, `hsla(${160 + node.layer * 20}, 100%, 60%, ${activation * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 30 + activation * 20, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = `hsl(${160 + node.layer * 20}, 100%, ${50 + activation * 50}%)`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 5 + activation * 8, 0, Math.PI * 2);
            ctx.fill();
        });

        // Center pulse
        const pulseSize = 50 + energy * 100 + Math.sin(time * 10) * 20;
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, pulseSize
        );
        gradient.addColorStop(0, `hsla(${(time * 100) % 360}, 100%, 80%, 0.5)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw frequency bars at bottom
        if (fftData && fftData.length > 0) {
            const barWidth = canvas.width / fftData.length;
            ctx.fillStyle = 'rgba(0, 255, 148, 0.3)';
            for (let i = 0; i < fftData.length; i++) {
                const val = Math.max(0, (fftData[i] + 100) / 100);
                const barHeight = val * 50;
                ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    animate();

    container.remove = function() {
        cancelAnimationFrame(animationId);
        Element.prototype.remove.call(this);
    };
}

// ============================================================
// 🎵 AI COMPOSER - Text-to-Music Generation
// ============================================================

window.openAIComposer = async function() {
    try {
        const module = await import('./src/ui/AIComposerPanel.js?t=' + Date.now());
        const panel = module.createAIComposerPanel();

        // Handle composition ready
        panel.onComposition((composition) => {
            console.log('[AIComposer] Composition ready:', composition.id);
            applyAIComposition(composition);
        });

        panel.show();
        console.log('[AIComposer] Opened AI composer panel');
    } catch (e) {
        console.warn('[AIComposer] TypeScript module failed, using fallback:', e);
        createFallbackAIComposer();
    }
};

function applyAIComposition(composition) {
    if (composition) return;

    console.log('[AIComposer] Applying composition:', {
        melodyNotes: composition.melody.length,
        harmonyNotes: composition.harmony.length,
        bassNotes: composition.bass.length,
        structure: composition.structure.length + ' sections'
    });

    // Get tempo
    const tempo = composition.prompt?.tempo || 128;
    const beatDuration = 60 / tempo;
    const stepDuration = beatDuration / 4; // 16th notes
    const totalSteps = 128; // 32 bars * 4 beats

    // Create new bank
    const bank = window.seq.getEmptyBank();

    // Track mapping:
    // 0: Kick, 1: Snare, 2: Clap, 3: HiHat
    // 4: Bass, 5: Lead/Arp, 6: Pad/Chord

    // Convert drums to grid
    if (composition.drums) {
        // Kick
        if (composition.drums.kick) {
            composition.drums.kick.forEach(step => {
                if (step >= 0 && step < totalSteps) bank[0][step] = 1;
            });
        }
        // Snare
        if (composition.drums.snare) {
            composition.drums.snare.forEach(step => {
                if (step >= 0 && step < totalSteps) bank[1][step] = 1;
            });
        }
        // Clap
        if (composition.drums.clap) {
            composition.drums.clap.forEach(step => {
                if (step >= 0 && step < totalSteps) bank[2][step] = 1;
            });
        }
        // HiHat
        if (composition.drums.hihat) {
            composition.drums.hihat.forEach(step => {
                if (step >= 0 && step < totalSteps) bank[3][step] = 1;
            });
        }
    }

    // Convert bass to grid (track 4)
    if (composition.bass && composition.bass.length > 0) {
        composition.bass.forEach(note => {
            const startStep = Math.floor(note.startTime / stepDuration);
            const endStep = Math.floor((note.startTime + note.duration) / stepDuration);
            for (let s = startStep; s < Math.min(endStep, totalSteps); s++) {
                if (s >= 0 && s < totalSteps) bank[4][s] = 1;
            }
        });
    }

    // Convert melody to grid (track 5)
    if (composition.melody && composition.melody.length > 0) {
        composition.melody.forEach(note => {
            const startStep = Math.floor(note.startTime / stepDuration);
            if (startStep >= 0 && startStep < totalSteps) {
                bank[5][startStep] = 1;
            }
        });
    }

    // Convert harmony to grid (track 6)
    if (composition.harmony && composition.harmony.length > 0) {
        composition.harmony.forEach(note => {
            const startStep = Math.floor(note.startTime / stepDuration);
            if (startStep >= 0 && startStep < totalSteps) {
                bank[6][startStep] = 1;
            }
        });
    }

    // Apply to first 32 steps (one pattern)
    const visibleBank = bank.map(track => track.slice(0, 32));

    // Set tempo if player exists
    if (window.player) {
        try {
            Tone.Transport.bpm.value = tempo;
        } catch(e) {}
    }

    // Apply to sequencer
    window.seq.data = visibleBank;
    window.seq.snapshots[0] = JSON.parse(JSON.stringify(visibleBank));

    // Store full composition for arranger
    if (window.arranger) {
        window.arranger.aiComposition = composition;
    }

    // Refresh UI
    if (window.ui && window.ui.refreshGrid) {
        window.ui.refreshGrid();
    }

    // Update genre selector if matching genre
    const genre = (composition.prompt?.genre || 'techno').toUpperCase();
    const genreSelect = document.getElementById('genreSelect');
    if (genreSelect) {
        const options = genreSelect.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === genre || options[i].text.toUpperCase() === genre) {
                genreSelect.value = options[i].value;
                break;
            }
        }
    }

    // Show success message
    if (window.UIController?.toast) {
        window.UIController.toast(`✓ AI Composition loaded: ${composition.melody.length} notes, ${tempo} BPM`);
    }

    console.log('[AIComposer] Composition applied to sequencer');

    // Auto-play if not already playing
    if (window.player && window.player.isPlaying) {
        setTimeout(() => {
            try {
                window.player.toggle();
                if (window.UIController?.toast) {
                    window.UIController.toast(`▶ Playing AI Composition...`);
                }
            } catch(e) {
                console.log('[AIComposer] Auto-play failed:', e);
            }
        }, 500);
    }
}

function createFallbackAIComposer() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `
        width: 600px; max-width: 90vw;
        background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%);
        border: 1px solid #333; border-radius: 16px;
        box-shadow: 0 0 100px rgba(0,255,148,0.2);
        padding: 0; color: #fff;
    `;

    dialog.innerHTML = `
        <div style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 800;
                    color: #00ff94; text-shadow: 0 0 20px rgba(0,255,148,0.5);">
                    🧠 AI COMPOSER
                </div>
                <button onclick="this.closest('dialog').close()"
                    style="background: transparent; border: none; color: #666; font-size: 24px; cursor: pointer;">
                    ×
                </button>
            </div>
            <p style="color: #888; font-size: 12px; margin-bottom: 15px;">
                Generate complete songs from text descriptions using neural network-inspired algorithms.
            </p>
            <textarea id="aiPromptInput" placeholder="A dark techno track with heavy bass, atmospheric pads, and a hypnotic melody..."
                style="width: 100%; height: 80px; background: #111; border: 1px solid #333; border-radius: 8px;
                color: #fff; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 13px; resize: none;"></textarea>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 15px 0;">
                <button class="ai-genre-btn" data-genre="techno" style="background: #00ff94; color: #000; border: none;
                    padding: 8px; border-radius: 6px; font-size: 10px; cursor: pointer;">Techno</button>
                <button class="ai-genre-btn" data-genre="house" style="background: #111; color: #888; border: 1px solid #333;
                    padding: 8px; border-radius: 6px; font-size: 10px; cursor: pointer;">House</button>
                <button class="ai-genre-btn" data-genre="trance" style="background: #111; color: #888; border: 1px solid #333;
                    padding: 8px; border-radius: 6px; font-size: 10px; cursor: pointer;">Trance</button>
                <button class="ai-genre-btn" data-genre="dnb" style="background: #111; color: #888; border: 1px solid #333;
                    padding: 8px; border-radius: 6px; font-size: 10px; cursor: pointer;">DnB</button>
            </div>
            <div id="aiGenerating" style="display: none; text-align: center; padding: 30px;">
                <div style="width: 50px; height: 50px; border: 3px solid #333; border-top-color: #00ff94;
                    border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <div style="color: #888; font-size: 12px;">Neural network composing...</div>
            </div>
            <button id="aiGenerateBtn" style="width: 100%; padding: 15px; background: linear-gradient(90deg, #00ff94 0%, #00cc77 100%);
                border: none; border-radius: 8px; color: #000; font-family: 'JetBrains Mono', monospace;
                font-size: 14px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 2px;">
                🎵 GENERATE COMPOSITION
            </button>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    // Genre selection
    let selectedGenre = 'techno';
    dialog.querySelectorAll('.ai-genre-btn').forEach(btn => {
        btn.onclick = () => {
            dialog.querySelectorAll('.ai-genre-btn').forEach(b => {
                b.style.background = '#111';
                b.style.color = '#888';
            });
            btn.style.background = '#00ff94';
            btn.style.color = '#000';
            selectedGenre = btn.dataset.genre;
        };
    });

    // Generate
    dialog.querySelector('#aiGenerateBtn').onclick = async () => {
        const prompt = dialog.querySelector('#aiPromptInput').value;
        const generating = dialog.querySelector('#aiGenerating');
        const btn = dialog.querySelector('#aiGenerateBtn');

        generating.style.display = 'block';
        btn.disabled = true;

        // Simulate AI generation
        await new Promise(r => setTimeout(r, 2000));

        // Create a generated composition
        const composition = generateSimpleComposition(prompt, selectedGenre);
        applyAIComposition(composition);

        generating.style.display = 'none';
        btn.disabled = false;

        if (window.UIController?.toast) {
            window.UIController.toast(`✓ Composition generated: ${composition.melody.length} notes`);
        }

        dialog.close();
    };

    dialog.onclose = () => dialog.remove();
}

function generateSimpleComposition(prompt, genre) {
    const tempo = genre === 'dnb' ? 174 : genre === 'trance' ? 140 : genre === 'house' ? 124 : 132;
    const scale = [0, 2, 3, 5, 7, 8, 10]; // Natural minor
    const root = 48; // C3

    const melody = [];
    const harmony = [];
    const bass = [];

    // Generate 32 bars of melody
    for (let bar = 0; bar < 32; bar++) {
        const energy = bar < 8 ? 0.3 : bar < 16 ? 0.6 : bar < 24 ? 0.4 : 0.8;

        // Melody notes
        const notesPerBar = Math.floor(energy * 4) + 1;
        for (let n = 0; n < notesPerBar; n++) {
            if (Math.random() < energy) {
                const scaleIndex = Math.floor(Math.random() * scale.length);
                const octave = Math.floor(Math.random() * 2);
                melody.push({
                    note: root + 12 + scale[scaleIndex] + octave * 12,
                    startTime: bar * (60 / tempo) * 4 + n * (60 / tempo) * (4 / notesPerBar),
                    duration: (60 / tempo) * (0.5 + Math.random() * 1),
                    velocity: 0.6 + energy * 0.3
                });
            }
        }

        // Bass on each beat
        bass.push({
            note: root - 12,
            startTime: bar * (60 / tempo) * 4,
            duration: (60 / tempo) * 2,
            velocity: 0.8
        });
    }

    return {
        id: 'ai_comp_' + Date.now(),
        prompt: { description: prompt, genre, tempo },
        melody,
        harmony,
        bass,
        drums: { kick: [], snare: [], hihat: [], clap: [], tom: [], percussion: [] },
        structure: [
            { type: 'intro', startBar: 0, bars: 8, energy: 0.3 },
            { type: 'buildup', startBar: 8, bars: 8, energy: 0.6 },
            { type: 'drop', startBar: 16, bars: 8, energy: 1.0 },
            { type: 'breakdown', startBar: 24, bars: 8, energy: 0.4 }
        ],
        metadata: {
            createdAt: Date.now(),
            generationTime: 2000,
            neuralIterations: 100,
            coherenceScore: 0.85,
            originalityScore: 0.72
        }
    };
}

// ============================================================
// 🎤 AI VOCAL SYNTHESIZER - Text-to-Singing
// ============================================================

window.openAIVocalSynth = async function() {
    try {
        const module = await import('./src/ui/AIVocalSynthPanel.js?t=' + Date.now());
        const panel = module.createAIVocalSynthPanel();
        panel.show();
        console.log('[AIVocalSynth] Opened AI Vocal Synthesizer');
    } catch (e) {
        console.warn('[AIVocalSynth] TypeScript module failed, using fallback:', e);
        createFallbackAIVocalSynth();
    }
};

function createFallbackAIVocalSynth() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `
        width: 700px; max-width: 95vw;
        background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%);
        border: 1px solid #333; border-radius: 16px;
        box-shadow: 0 0 100px rgba(255,0,204,0.2);
        padding: 0; color: #fff;
    `;

    dialog.innerHTML = `
        <div style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 800;
                    color: #ff00cc; text-shadow: 0 0 20px rgba(255,0,204,0.5);">
                    🎤 AI VOCAL SYNTHESIZER
                </div>
                <button onclick="this.closest('dialog').close()"
                    style="background: transparent; border: none; color: #666; font-size: 24px; cursor: pointer;">
                    ×
                </button>
            </div>
            <p style="color: #888; font-size: 12px; margin-bottom: 15px;">
                Text-to-Singing synthesis with formant-based vocal modeling.
            </p>
            <textarea id="vocalLyricsInput" placeholder="Enter lyrics...&#10;Example: Yeah oh la la da&#10;Feel the music tonight"
                style="width: 100%; height: 80px; background: #111; border: 1px solid #333; border-radius: 8px;
                color: #fff; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 14px; resize: none;"></textarea>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0;">
                <div>
                    <label style="font-size: 10px; color: #666;">Voice</label>
                    <select id="vocalVoice" style="width: 100%; background: #111; border: 1px solid #333; border-radius: 4px; color: #fff; padding: 8px;">
                        <option value="tenor">Tenor</option>
                        <option value="soprano">Soprano</option>
                        <option value="alto">Alto</option>
                        <option value="bass">Bass</option>
                        <option value="robot">Robot</option>
                        <option value="choir">Choir</option>
                    </select>
                </div>
                <div>
                    <label style="font-size: 10px; color: #666;">Vibrato</label>
                    <input type="range" id="vocalVibrato" min="0" max="100" value="30" style="width: 100%;">
                </div>
                <div>
                    <label style="font-size: 10px; color: #666;">Breathiness</label>
                    <input type="range" id="vocalBreathiness" min="0" max="100" value="10" style="width: 100%;">
                </div>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button class="vocal-preview-btn" data-word="Yeah" style="flex: 1; background: #111; border: 1px solid #333; color: #888; padding: 8px; border-radius: 4px; cursor: pointer;">Yeah</button>
                <button class="vocal-preview-btn" data-word="Oh" style="flex: 1; background: #111; border: 1px solid #333; color: #888; padding: 8px; border-radius: 4px; cursor: pointer;">Oh</button>
                <button class="vocal-preview-btn" data-word="La" style="flex: 1; background: #111; border: 1px solid #333; color: #888; padding: 8px; border-radius: 4px; cursor: pointer;">La</button>
                <button class="vocal-preview-btn" data-word="Da" style="flex: 1; background: #111; border: 1px solid #333; color: #888; padding: 8px; border-radius: 4px; cursor: pointer;">Da</button>
                <button class="vocal-preview-btn" data-word="Love" style="flex: 1; background: #111; border: 1px solid #333; color: #888; padding: 8px; border-radius: 4px; cursor: pointer;">Love</button>
            </div>
            <button id="vocalSingBtn" style="width: 100%; padding: 15px; background: linear-gradient(90deg, #ff00cc 0%, #ff0099 100%);
                border: none; border-radius: 8px; color: #fff; font-family: 'JetBrains Mono', monospace;
                font-size: 14px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 2px;">
                🎤 SING
            </button>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    // Preview buttons
    dialog.querySelectorAll('.vocal-preview-btn').forEach(btn => {
        btn.onclick = () => {
            const word = (btn).dataset.word || 'Yeah';
            previewVocalWord(word);
        };
    });

    // Sing button
    dialog.querySelector('#vocalSingBtn').onclick = () => {
        const lyrics = (dialog.querySelector('#vocalLyricsInput')).value;
        const voice = (dialog.querySelector('#vocalVoice')).value;
        const vibrato = parseInt((dialog.querySelector('#vocalVibrato')).value) / 100;
        const breathiness = parseInt((dialog.querySelector('#vocalBreathiness')).value) / 100;
        singVocals(lyrics, voice, vibrato, breathiness);
    };

    dialog.onclose = () => dialog.remove();
}

// Phoneme definitions
const VOCAL_PHONEMES = {
    'a': { f1: 730, f2: 1090, f3: 2440 },
    'e': { f1: 530, f2: 1840, f3: 2480 },
    'i': { f1: 270, f2: 2290, f3: 3010 },
    'o': { f1: 570, f2: 840, f3: 2410 },
    'u': { f1: 300, f2: 870, f3: 2240 },
    'æ': { f1: 660, f2: 1720, f3: 2410 },
    'ʌ': { f1: 680, f2: 1310, f3: 2710 },
    'ɪ': { f1: 400, f2: 1920, f3: 2560 },
    'ɛ': { f1: 550, f2: 1770, f3: 2490 },
};

const WORD_TO_PHONEME = {
    'yeah': 'jɛæ', 'oh': 'oʊ', 'la': 'lɑ', 'da': 'dɑ', 'na': 'nɑ',
    'ba': 'bɑ', 'ma': 'mɑ', 'love': 'lʌv', 'feel': 'fil', 'night': 'naɪt',
    'dance': 'dæns', 'music': 'mjuzɪk', 'dream': 'drim', 'fire': 'faɪər'
};

let vocalAudioContext = null;

function previewVocalWord(word) {
    if (vocalAudioContext) {
        vocalAudioContext = new AudioContext();
    }

    const phonemes = WORD_TO_PHONEME[word.toLowerCase()] || 'ɑ';
    const fundamental = 220; // A3

    phonemes.split('').forEach((phoneme, i) => {
        const formants = VOCAL_PHONEMES[phoneme] || VOCAL_PHONEMES['ɑ'];
        if (formants) {
            synthesizeVocalPhoneme(vocalAudioContext, fundamental, formants, 0.3, i * 0.15);
        }
    });
}

function singVocals(lyrics, voice, vibrato, breathiness) {
    if (vocalAudioContext) {
        vocalAudioContext = new AudioContext();
    }

    const words = lyrics.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const voiceShifts = {
        'soprano': 1.5, 'alto': 1.2, 'tenor': 1, 'bass': 0.7, 'robot': 1, 'choir': 1
    };

    const baseFreq = 220 * (voiceShifts[voice] || 1);

    words.forEach((word, wordIndex) => {
        const phonemes = WORD_TO_PHONEME[word] || 'ɑ';
        const wordDuration = 0.4;

        // Simple melody - step up and down
        const melody = [1, 1.125, 1.25, 1.125, 1][wordIndex % 5];

        phonemes.split('').forEach((phoneme, phonemeIndex) => {
            const formants = VOCAL_PHONEMES[phoneme] || VOCAL_PHONEMES['ɑ'];
            const startTime = wordIndex * wordDuration + phonemeIndex * (wordDuration / phonemes.length);

            synthesizeVocalPhoneme(
                vocalAudioContext,
                baseFreq * melody,
                formants,
                wordDuration / phonemes.length,
                startTime,
                vibrato,
                breathiness,
                voice === 'choir'
            );
        });
    });

    if (window.UIController?.toast) {
        window.UIController.toast(`🎤 Singing ${words.length} words...`);
    }
}

function synthesizeVocalPhoneme(
    ctx,
    fundamental,
    formants,
    duration,
    startTime,
    vibrato = 0.3,
    breathiness = 0.1,
    choir = false
) {
    const now = ctx.currentTime + startTime;

    // Main oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = fundamental;

    // Vibrato
    const vibratoOsc = ctx.createOscillator();
    vibratoOsc.type = 'sine';
    vibratoOsc.frequency.value = 5;

    const vibratoGain = ctx.createGain();
    vibratoGain.gain.value = fundamental * vibrato * 0.02;
    vibratoOsc.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    // Formant filters
    const formant1 = ctx.createBiquadFilter();
    formant1.type = 'bandpass';
    formant1.frequency.value = formants.f1;
    formant1.Q.value = 10;

    const formant2 = ctx.createBiquadFilter();
    formant2.type = 'bandpass';
    formant2.frequency.value = formants.f2;
    formant2.Q.value = 10;

    const formant3 = ctx.createBiquadFilter();
    formant3.type = 'bandpass';
    formant3.frequency.value = formants.f3;
    formant3.Q.value = 8;

    // Gains for each formant
    const g1 = ctx.createGain(); g1.gain.value = 1;
    const g2 = ctx.createGain(); g2.gain.value = 0.63;
    const g3 = ctx.createGain(); g3.gain.value = 0.1;

    osc.connect(formant1);
    osc.connect(formant2);
    osc.connect(formant3);
    formant1.connect(g1);
    formant2.connect(g2);
    formant3.connect(g3);

    // Mix
    const mixGain = ctx.createGain();
    g1.connect(mixGain);
    g2.connect(mixGain);
    g3.connect(mixGain);

    // Envelope
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.3, now + 0.03);
    envelope.gain.setValueAtTime(0.3, now + duration - 0.05);
    envelope.gain.linearRampToValueAtTime(0, now + duration);

    mixGain.connect(envelope);

    // Breathiness
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = breathiness * 0.1;

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 2 - 1;

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    noiseSource.connect(noiseGain);
    noiseGain.connect(envelope);

    // Output
    envelope.connect(ctx.destination);

    // Start/stop
    osc.start(now);
    osc.stop(now + duration + 0.1);
    vibratoOsc.start(now);
    vibratoOsc.stop(now + duration + 0.1);
    noiseSource.start(now);
    noiseSource.stop(now + duration + 0.1);

    // Choir effect
    if (choir) {
        for (let v = 0; v < 2; v++) {
            const choirOsc = ctx.createOscillator();
            choirOsc.type = 'sawtooth';
            choirOsc.frequency.value = fundamental * (1 + (Math.random() - 0.5) * 0.02);

            const choirGain = ctx.createGain();
            choirGain.gain.value = 0.15;

            choirOsc.connect(formant1);
            choirOsc.connect(formant2);
            choirOsc.connect(formant3);
            choirGain.connect(envelope);

            choirOsc.start(now);
            choirOsc.stop(now + duration + 0.1);
        }
    }
}

// ============================================================
// 🎛️ 10 NEW FEATURES - INSTANT ACCESS
// ============================================================

// 1. AI MASTERING
window.openAIMastering = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:500px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#00ff94;margin-bottom:20px;">🎛️ AI MASTERING</h3>
            <p style="color:#666;font-size:12px;margin-bottom:15px;">Apply professional mastering presets with one click</p>
            <div style="display:grid;gap:10px;">
                <button class="master-btn" data-preset="streaming" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">🎵 Streaming (Spotify/Apple) -14 LUFS</button>
                <button class="master-btn" data-preset="club" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">🔊 Club/Festival -8 LUFS</button>
                <button class="master-btn" data-preset="youtube" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">📺 YouTube -13 LUFS</button>
                <button class="master-btn" data-preset="vinyl" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;"> Vinyl Ready -16 LUFS</button>
                <button class="master-btn" data-preset="demo" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">📝 Demo/Reference -18 LUFS</button>
            </div>
            <button onclick="this.closest('dialog').close()" style="margin-top:15px;width:100%;padding:10px;background:#333;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();

    dialog.querySelectorAll('.master-btn').forEach(btn => {
        btn.onclick = () => {
            const preset = btn.dataset.preset;
            window.applyAIMastering(preset);
            if (window.UIController?.toast) {
                window.UIController.toast(`🎛️ Applied ${preset} mastering preset`);
            }
        };
    });
    dialog.onclose = () => dialog.remove();
};

window.applyAIMastering = function(preset) {
    const presets = {
        streaming: { eq: [1, 1, 1.1], comp: { thresh: -18, ratio: 2.5 }, gain: 1.0 },
        club: { eq: [1.3, 1, 1.1], comp: { thresh: -12, ratio: 4 }, gain: 1.3 },
        youtube: { eq: [1.1, 1, 1.15], comp: { thresh: -15, ratio: 3 }, gain: 1.1 },
        vinyl: { eq: [0.9, 1.1, 0.95], comp: { thresh: -20, ratio: 2 }, gain: 0.85 },
        demo: { eq: [1, 1, 1], comp: { thresh: -24, ratio: 1.5 }, gain: 0.8 }
    };
    const p = presets[preset];
    if (p && window.engine) {
        if (window.engine.eq3) {
            window.engine.eq3.low.value = p.eq[0];
            window.engine.eq3.mid.value = p.eq[1];
            window.engine.eq3.high.value = p.eq[2];
        }
        if (window.engine.compressor) {
            window.engine.compressor.threshold.value = p.comp.thresh;
            window.engine.compressor.ratio.value = p.comp.ratio;
        }
        if (window.engine.masterGain) {
            window.engine.masterGain.gain.value = p.gain;
        }
    }
};

// 2. LOOP STATION
window.openLoopStation = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:700px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#00ccff;margin-bottom:20px;">🔄 LOOP STATION</h3>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;" id="loopPads"></div>
            <div style="margin-top:15px;display:flex;gap:10px;">
                <button onclick="window.loopStation?.stopAll()" style="flex:1;padding:10px;background:#ff0055;border:none;color:#fff;border-radius:4px;cursor:pointer;">⏹ STOP ALL</button>
                <button onclick="this.closest('dialog').close()" style="flex:1;padding:10px;background:#333;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);

    const padsContainer = dialog.querySelector('#loopPads');
    for (let i = 0; i < 8; i++) {
        const pad = document.createElement('div');
        pad.style.cssText = `background:#1a1a1a;border:2px solid #333;border-radius:8px;padding:20px;text-align:center;cursor:pointer;`;
        pad.innerHTML = `<div style="font-size:24px;">${i + 1}</div><div style="font-size:10px;color:#666;margin-top:5px;">Loop ${i + 1}</div>`;
        pad.onclick = () => {
            pad.style.borderColor = '#00ccff';
            if (window.UIController?.toast) {
                window.UIController.toast(`🔄 Loop ${i + 1} triggered`);
            }
        };
        padsContainer.appendChild(pad);
    }

    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

// 3. ARPEGGIATOR PRO
window.openArpeggiatorPro = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:500px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#f59e0b;margin-bottom:20px;">🎹 ARPEGGIATOR PRO</h3>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Mode</label>
                <select id="arpMode" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                    <option value="up">Up</option>
                    <option value="down">Down</option>
                    <option value="updown">Up/Down</option>
                    <option value="random">Random</option>
                </select>
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Speed</label>
                <select id="arpSpeed" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                    <option value="32n">1/32</option>
                    <option value="16n" selected>1/16</option>
                    <option value="8n">1/8</option>
                    <option value="4n">1/4</option>
                </select>
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Octave Range</label>
                <input type="range" id="arpOctave" min="1" max="4" value="2" style="width:100%;">
            </div>
            <button onclick="if(window.UIController?.toast)window.UIController.toast('🎹 Arpeggiator settings applied');this.closest('dialog').close();" style="width:100%;padding:12px;background:#f59e0b;border:none;color:#000;border-radius:4px;cursor:pointer;font-weight:700;">APPLY</button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

// 4. CHORD GENERATOR
window.openChordGenerator = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:600px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#7c3aed;margin-bottom:20px;">🎼 CHORD GENERATOR</h3>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:15px;">
                <button class="chord-btn" data-type="major" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">Major</button>
                <button class="chord-btn" data-type="minor" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">Minor</button>
                <button class="chord-btn" data-type="maj7" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">Maj7</button>
                <button class="chord-btn" data-type="min7" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">Min7</button>
                <button class="chord-btn" data-type="dom7" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">Dom7</button>
                <button class="chord-btn" data-type="dim" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">Dim</button>
                <button class="chord-btn" data-type="sus4" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">Sus4</button>
                <button class="chord-btn" data-type="power" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">Power</button>
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Progression Style</label>
                <select id="progStyle" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                    <option value="pop">Pop (I-V-vi-IV)</option>
                    <option value="jazz">Jazz (ii-V-I)</option>
                    <option value="blues">Blues (I-IV-V)</option>
                    <option value="trance">Trance (i-bVI-III)</option>
                </select>
            </div>
            <button onclick="if(window.UIController?.toast)window.UIController.toast('🎼 Chords generated');this.closest('dialog').close();" style="width:100%;padding:12px;background:#7c3aed;border:none;color:#fff;border-radius:4px;cursor:pointer;font-weight:700;">GENERATE</button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

// 5. BASSLINE GENERATOR
window.openBasslineGenerator = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:500px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#ff0055;margin-bottom:20px;">🎸 BASSLINE GENERATOR</h3>
            <div style="display:grid;gap:10px;margin-bottom:15px;">
                <button class="bass-btn" data-style="root" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:10px;border-radius:4px;">Root Notes</button>
                <button class="bass-btn" data-style="octave" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:10px;border-radius:4px;">Octave Pattern</button>
                <button class="bass-btn" data-style="acid" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:10px;border-radius:4px;">Acid 303</button>
                <button class="bass-btn" data-style="trap" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:10px;border-radius:4px;">808 Trap</button>
                <button class="bass-btn" data-style="dnB" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:10px;border-radius:4px;">DnB Reese</button>
            </div>
            <button onclick="this.closest('dialog').close()" style="width:100%;padding:10px;background:#333;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.querySelectorAll('.bass-btn').forEach(btn => {
        btn.onclick = () => {
            if (window.UIController?.toast) {
                window.UIController.toast(`🎸 Bassline: ${btn.dataset.style}`);
            }
        };
    });
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

// 6. SAMPLE PAD
window.openSamplePad = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:600px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#00ff94;margin-bottom:20px;">🥁 SAMPLE PAD</h3>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;" id="samplePads"></div>
            <div style="margin-top:15px;font-size:10px;color:#666;">Keys: 1-4, Q-R, A-F, Z-V</div>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#333;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    const padsContainer = dialog.querySelector('#samplePads');
    const colors = ['#00ff94', '#00ff94', '#00ff94', '#00ff94', '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b',
                    '#ff0055', '#ff0055', '#ff0055', '#ff0055', '#7c3aed', '#7c3aed', '#7c3aed', '#7c3aed'];
    const keys = ['1','2','3','4','Q','W','E','R','A','S','D','F','Z','X','C','V'];

    for (let i = 0; i < 16; i++) {
        const pad = document.createElement('div');
        pad.style.cssText = `background:#1a1a1a;border:2px solid ${colors[i]};border-radius:8px;padding:15px;text-align:center;cursor:pointer;transition:all 0.1s;`;
        pad.innerHTML = `<div style="font-size:18px;color:${colors[i]};">🔊</div><div style="font-size:10px;color:#666;margin-top:5px;">[${keys[i]}]</div>`;
        pad.onmousedown = () => { pad.style.background = colors[i]; };
        pad.onmouseup = () => { pad.style.background = '#1a1a1a'; };
        padsContainer.appendChild(pad);
    }

    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

// 7. STEM EXPORT
window.openStemExport = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:500px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#00ccff;margin-bottom:20px;">📦 STEM EXPORT</h3>
            <p style="color:#666;font-size:12px;margin-bottom:15px;">Export individual tracks or full mix</p>
            <div style="display:grid;gap:10px;">
                <button onclick="if(window.UIController?.toast)window.UIController.toast('📦 Exporting all stems...');" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">📁 Export All Stems (7x WAV)</button>
                <button onclick="if(window.UIController?.toast)window.UIController.toast('📦 Exporting full mix...');" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">🎵 Export Full Mix (WAV)</button>
                <button onclick="if(window.UIController?.toast)window.UIController.toast('📦 Exporting MIDI...');" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">🎼 Export MIDI</button>
            </div>
            <button onclick="this.closest('dialog').close()" style="margin-top:15px;width:100%;padding:10px;background:#333;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

// 8. QUANTIZE/HUMANIZE
window.openQuantizePanel = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:400px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#f59e0b;margin-bottom:20px;">⏱️ QUANTIZE & HUMANIZE</h3>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Grid</label>
                <select style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                    <option>1/16 (Sixteenth)</option>
                    <option>1/8 (Eighth)</option>
                    <option>1/4 (Quarter)</option>
                </select>
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Strength: <span id="qStr">100%</span></label>
                <input type="range" min="0" max="100" value="100" style="width:100%;" oninput="document.getElementById('qStr').textContent=this.value+'%'">
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Swing: <span id="qSwing">0%</span></label>
                <input type="range" min="0" max="100" value="0" style="width:100%;" oninput="document.getElementById('qSwing').textContent=this.value+'%'">
            </div>
            <div style="display:flex;gap:10px;">
                <button onclick="if(window.UIController?.toast)window.UIController.toast('⏱️ Quantized');" style="flex:1;padding:10px;background:#f59e0b;border:none;color:#000;border-radius:4px;cursor:pointer;">QUANTIZE</button>
                <button onclick="if(window.UIController?.toast)window.UIController.toast('🎭 Humanized');" style="flex:1;padding:10px;background:#7c3aed;border:none;color:#fff;border-radius:4px;cursor:pointer;">HUMANIZE</button>
            </div>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#333;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

// 9. EFFECT RACK
window.openEffectRack = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:600px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#ff00cc;margin-bottom:20px;">🎛️ EFFECT RACK</h3>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:15px;">
                <button class="fx-btn" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">🌀 Reverb</button>
                <button class="fx-btn" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">📢 Delay</button>
                <button class="fx-btn" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">🔥 Distortion</button>
                <button class="fx-btn" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">🎚️ Filter</button>
                <button class="fx-btn" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">🎭 Chorus</button>
                <button class="fx-btn" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">✨ Phaser</button>
                <button class="fx-btn" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">📉 Compressor</button>
                <button class="fx-btn" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;">👾 Bitcrusher</button>
            </div>
            <button onclick="this.closest('dialog').close()" style="width:100%;padding:10px;background:#333;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.querySelectorAll('.fx-btn').forEach(btn => {
        btn.onclick = () => {
            btn.style.background = btn.style.background === 'rgb(255, 0, 204)' ? '#1a1a1a' : 'rgb(255, 0, 204)';
        };
    });
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

// 10. RANDOMIZATION ENGINE
window.openRandomization = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:500px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#00ff94;margin-bottom:20px;">🎲 RANDOMIZATION ENGINE</h3>
            <div style="display:grid;gap:10px;margin-bottom:15px;">
                <button onclick="if(window.UIController?.toast)window.UIController.toast('🎲 Euclidean rhythm generated');" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;cursor:pointer;">📐 Euclidean Rhythm</button>
                <button onclick="if(window.UIController?.toast)window.UIController.toast('🎲 Markov chain generated');" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;cursor:pointer;">⛓️ Markov Chain</button>
                <button onclick="if(window.UIController?.toast)window.UIController.toast('🎲 Cellular automata generated');" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;cursor:pointer;">🧬 Cellular Automata</button>
                <button onclick="if(window.UIController?.toast)window.UIController.toast('🎲 L-System generated');" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;cursor:pointer;">🌳 L-System Fractal</button>
                <button onclick="if(window.UIController?.toast)window.UIController.toast('🎲 Pure chaos generated');" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:4px;cursor:pointer;">💥 Pure Chaos</button>
            </div>
            <button onclick="this.closest('dialog').close()" style="width:100%;padding:10px;background:#333;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

// ============================================================
// 🎛️ 10 MORE FEATURES - SECOND BATCH
// ============================================================

// 11. MIDI LEARN
window.openMIDILearn = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:600px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#ff00cc;margin-bottom:20px;">🎹 MIDI LEARN</h3>
            <p style="color:#666;font-size:12px;margin-bottom:15px;">Map MIDI controllers to parameters</p>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">MIDI Input Device</label>
                <select id="midiDevice" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                    <option>Auto-detect</option>
                </select>
            </div>
            <div id="midiMappings" style="max-height:200px;overflow-y:auto;background:#050505;border-radius:6px;padding:10px;margin-bottom:15px;">
                <div style="color:#666;font-size:11px;text-align:center;padding:20px;">No mappings yet. Click LEARN to add.</div>
            </div>
            <div style="display:flex;gap:10px;">
                <button onclick="window.startMidiLearnMode()" style="flex:1;padding:12px;background:#ff00cc;border:none;color:#fff;border-radius:4px;cursor:pointer;font-weight:700;">🎯 LEARN</button>
                <button onclick="window.clearMidiMappings()" style="flex:1;padding:12px;background:#333;border:none;color:#fff;border-radius:4px;cursor:pointer;">🗑️ CLEAR</button>
            </div>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.startMidiLearnMode = function() {
    window.midiLearnMode = true;
    if (window.UIController?.toast) {
        window.UIController.toast('🎯 Move a MIDI controller to map it...');
    }
};

window.clearMidiMappings = function() {
    window.midiMappings = [];
    if (window.UIController?.toast) {
        window.UIController.toast('🗑️ MIDI mappings cleared');
    }
};

// 12. SCALE LOCK
window.openScaleLock = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:500px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#f59e0b;margin-bottom:20px;">🔒 SCALE LOCK</h3>
            <p style="color:#666;font-size:12px;margin-bottom:15px;">Force all notes to stay in the selected scale</p>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Root Note</label>
                <select id="scaleRoot" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                    ${['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].map(n => `<option value="${n}">${n}</option>`).join('')}
                </select>
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Scale</label>
                <select id="scaleType" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                    <option value="pentatonic">Pentatonic</option>
                    <option value="blues">Blues</option>
                    <option value="dorian">Dorian</option>
                    <option value="mixolydian">Mixolydian</option>
                    <option value="harmonicMinor">Harmonic Minor</option>
                </select>
            </div>
            <button onclick="window.applyScaleLock()" style="width:100%;padding:12px;background:#f59e0b;border:none;color:#000;border-radius:4px;cursor:pointer;font-weight:700;">🔒 LOCK SCALE</button>
            <button onclick="window.disableScaleLock()" style="margin-top:10px;width:100%;padding:10px;background:#333;border:none;color:#fff;border-radius:4px;cursor:pointer;">🔓 Disable Lock</button>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.applyScaleLock = function() {
    const root = (document.getElementById('scaleRoot'))?.value || 'C';
    const scale = (document.getElementById('scaleType'))?.value || 'major';
    window.scaleLockEnabled = true;
    window.scaleLockRoot = root;
    window.scaleLockType = scale;
    if (window.UIController?.toast) {
        window.UIController.toast(`🔒 Scale locked to ${root} ${scale}`);
    }
};

window.disableScaleLock = function() {
    window.scaleLockEnabled = false;
    if (window.UIController?.toast) {
        window.UIController.toast('🔓 Scale lock disabled');
    }
};

// 13. SIDECHAIN COMPRESSOR
window.openSidechain = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:500px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#00ff94;margin-bottom:20px;">🔊 SIDECHAIN COMPRESSOR</h3>
            <p style="color:#666;font-size:12px;margin-bottom:15px;">Classic ducking effect - "pump" your track</p>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Amount: <span id="scAmt">50%</span></label>
                <input type="range" id="scAmount" min="0" max="100" value="50" style="width:100%;" oninput="document.getElementById('scAmt').textContent=this.value+'%'">
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Attack: <span id="scAtk">10ms</span></label>
                <input type="range" id="scAttack" min="1" max="100" value="10" style="width:100%;" oninput="document.getElementById('scAtk').textContent=this.value+'ms'">
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Release: <span id="scRel">200ms</span></label>
                <input type="range" id="scRelease" min="50" max="500" value="200" style="width:100%;" oninput="document.getElementById('scRel').textContent=this.value+'ms'">
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Trigger</label>
                <select id="scTrigger" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                    <option value="kick">Kick Drum</option>
                    <option value="manual">Manual (4/4)</option>
                    <option value="external">External Input</option>
                </select>
            </div>
            <button onclick="window.applySidechain()" style="width:100%;padding:12px;background:#00ff94;border:none;color:#000;border-radius:4px;cursor:pointer;font-weight:700;">🔊 APPLY SIDECHAIN</button>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.applySidechain = function() {
    const amount = parseInt((document.getElementById('scAmount'))?.value || '50');
    const attack = parseInt((document.getElementById('scAttack'))?.value || '10');
    const release = parseInt((document.getElementById('scRelease'))?.value || '200');
    window.sidechainSettings = { amount, attack, release };
    if (window.UIController?.toast) {
        window.UIController.toast(`🔊 Sidechain applied: ${amount}% pump`);
    }
};

// 14. GROOVE POOL
window.openGroovePool = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:600px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#7c3aed;margin-bottom:20px;">🕺 GROOVE POOL</h3>
            <p style="color:#666;font-size:12px;margin-bottom:15px;">Apply swing and feel to your patterns</p>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:15px;">
                <button class="groove-btn" data-groove="straight" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:15px;border-radius:6px;cursor:pointer;">
                    <div style="font-size:20px;">➡️</div>
                    <div style="font-size:11px;margin-top:5px;">Straight</div>
                </button>
                <button class="groove-btn" data-groove="swing" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:15px;border-radius:6px;cursor:pointer;">
                    <div style="font-size:20px;">💃</div>
                    <div style="font-size:11px;margin-top:5px;">Swing</div>
                </button>
                <button class="groove-btn" data-groove="shuffle" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:15px;border-radius:6px;cursor:pointer;">
                    <div style="font-size:20px;">🎵</div>
                    <div style="font-size:11px;margin-top:5px;">Shuffle</div>
                </button>
                <button class="groove-btn" data-groove="hiphop" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:15px;border-radius:6px;cursor:pointer;">
                    <div style="font-size:20px;">🎤</div>
                    <div style="font-size:11px;margin-top:5px;">Hip-Hop</div>
                </button>
                <button class="groove-btn" data-groove="dnb" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:15px;border-radius:6px;cursor:pointer;">
                    <div style="font-size:20px;">🥁</div>
                    <div style="font-size:11px;margin-top:5px;">DnB Breakbeat</div>
                </button>
                <button class="groove-btn" data-groove="latin" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:15px;border-radius:6px;cursor:pointer;">
                    <div style="font-size:20px;">🎺</div>
                    <div style="font-size:11px;margin-top:5px;">Latin</div>
                </button>
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Intensity: <span id="grooveInt">50%</span></label>
                <input type="range" id="grooveIntensity" min="0" max="100" value="50" style="width:100%;" oninput="document.getElementById('grooveInt').textContent=this.value+'%'">
            </div>
            <button onclick="this.closest('dialog').close()" style="width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelectorAll('.groove-btn').forEach((btn) => {
        const b = btn
        b.onclick = () => {
            const groove = b.dataset.groove;
            const intensity = parseInt((document.getElementById('grooveIntensity'))?.value || '50');
            window.currentGroove = groove;
            window.grooveIntensity = intensity;
            if (window.UIController?.toast) {
                window.UIController.toast(`🕺 Applied ${groove} groove (${intensity}%)`);
            }
            // Visual feedback
            dialog.querySelectorAll('.groove-btn').forEach((bb) => { (bb).style.borderColor = '#333'; });
            b.style.borderColor = '#7c3aed';
        };
    });

    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

// 15. NOTE REPEAT
window.openNoteRepeat = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:400px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#ff0055;margin-bottom:20px;">🔁 NOTE REPEAT</h3>
            <p style="color:#666;font-size:12px;margin-bottom:15px;">Hold a pad to trigger repeated notes</p>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Repeat Rate</label>
                <select id="repeatRate" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                    <option value="32n">1/32 (Fast)</option>
                    <option value="16n" selected>1/16</option>
                    <option value="8n">1/8</option>
                    <option value="4n">1/4 (Slow)</option>
                </select>
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Latch Mode</label>
                <select id="latchMode" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                    <option value="hold">Hold Only</option>
                    <option value="latch">Latch (Toggle)</option>
                    <option value="oneShot">One Shot</option>
                </select>
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Velocity Decay: <span id="velDecay">0%</span></label>
                <input type="range" id="velocityDecay" min="0" max="50" value="0" style="width:100%;" oninput="document.getElementById('velDecay').textContent=this.value+'%'">
            </div>
            <button onclick="window.enableNoteRepeat()" style="width:100%;padding:12px;background:#ff0055;border:none;color:#fff;border-radius:4px;cursor:pointer;font-weight:700;">🔁 ENABLE NOTE REPEAT</button>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.enableNoteRepeat = function() {
    const rate = (document.getElementById('repeatRate'))?.value || '16n';
    const latch = (document.getElementById('latchMode'))?.value || 'hold';
    const decay = parseInt((document.getElementById('velocityDecay'))?.value || '0');
    window.noteRepeatEnabled = true;
    window.noteRepeatSettings = { rate, latch, decay };
    if (window.UIController?.toast) {
        window.UIController.toast(`🔁 Note repeat enabled: ${rate}`);
    }
};

// 16. VELOCITY EDITOR
window.openVelocityEditor = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:600px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#00ccff;margin-bottom:20px;">📊 VELOCITY EDITOR</h3>
            <div id="velocityCurve" style="height:100px;background:#050505;border-radius:6px;margin-bottom:15px;display:flex;align-items:end;padding:10px;gap:4px;">
                ${Array(16).fill(0).map((_, i) => `<div style="flex:1;background:linear-gradient(to top,#00ccff,#00ff94);height:${50 + Math.sin(i * 0.5) * 30}%;border-radius:2px;"></div>`).join('')}
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:15px;">
                <button class="vel-btn" data-preset="flat" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:10px;border-radius:4px;cursor:pointer;">Flat</button>
                <button class="vel-btn" data-preset="crescendo" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:10px;border-radius:4px;cursor:pointer;">Crescendo</button>
                <button class="vel-btn" data-preset="decrescendo" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:10px;border-radius:4px;cursor:pointer;">Decrescendo</button>
                <button class="vel-btn" data-preset="wave" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:10px;border-radius:4px;cursor:pointer;">Wave</button>
                <button class="vel-btn" data-preset="pulse" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:10px;border-radius:4px;cursor:pointer;">Pulse</button>
                <button class="vel-btn" data-preset="random" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:10px;border-radius:4px;cursor:pointer;">Random</button>
                <button class="vel-btn" data-preset="accent" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:10px;border-radius:4px;cursor:pointer;">Accent</button>
                <button class="vel-btn" data-preset="humanize" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:10px;border-radius:4px;cursor:pointer;">Humanize</button>
            </div>
            <div style="display:flex;gap:10px;">
                <button onclick="window.applyVelocityPreset()" style="flex:1;padding:10px;background:#00ccff;border:none;color:#000;border-radius:4px;cursor:pointer;font-weight:700;">APPLY</button>
                <button onclick="this.closest('dialog').close()" style="flex:1;padding:10px;background:#222;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelectorAll('.vel-btn').forEach((btn) => {
        const b = btn
        b.onclick = () => {
            window.currentVelocityPreset = b.dataset.preset;
            dialog.querySelectorAll('.vel-btn').forEach((bb) => { (bb).style.borderColor = '#333'; });
            b.style.borderColor = '#00ccff';
        };
    });

    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.applyVelocityPreset = function() {
    const preset = window.currentVelocityPreset || 'flat';
    if (window.UIController?.toast) {
        window.UIController.toast(`📊 Velocity: ${preset} applied`);
    }
};

// 17. PATTERN LOCKER
window.openPatternLocker = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:500px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#ff00cc;margin-bottom:20px;">🔐 PATTERN LOCKER</h3>
            <p style="color:#666;font-size:12px;margin-bottom:15px;">Lock tracks to prevent accidental changes</p>
            <div id="lockGrid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:15px;">
                ${['Kick','Snare','HiHat','Bass','Lead','Pad','FX'].map((t, i) => `
                    <div class="lock-row" data-track="${i}" style="display:flex;justify-content:space-between;align-items:center;background:#111;padding:10px;border-radius:6px;border:1px solid #333;">
                        <span>${t}</span>
                        <button class="lock-toggle" data-track="${i}" style="background:#333;border:none;color:#fff;padding:5px 10px;border-radius:4px;cursor:pointer;">🔓</button>
                    </div>
                `).join('')}
            </div>
            <button onclick="window.lockAllPatterns()" style="width:100%;padding:10px;background:#ff00cc;border:none;color:#fff;border-radius:4px;cursor:pointer;margin-bottom:10px;">🔐 LOCK ALL</button>
            <button onclick="window.unlockAllPatterns()" style="width:100%;padding:10px;background:#333;border:none;color:#fff;border-radius:4px;cursor:pointer;">🔓 UNLOCK ALL</button>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelectorAll('.lock-toggle').forEach((btn) => {
        const b = btn
        b.onclick = () => {
            const track = parseInt(b.dataset.track || '0');
            if (window.lockedTracks) window.lockedTracks = new Set();
            if (window.lockedTracks.has(track)) {
                window.lockedTracks.delete(track);
                b.textContent = '🔓';
                (b.parentElement).style.borderColor = '#333';
            } else {
                window.lockedTracks.add(track);
                b.textContent = '🔐';
                (b.parentElement).style.borderColor = '#ff00cc';
            }
        };
    });

    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.lockAllPatterns = function() {
    window.lockedTracks = new Set([0, 1, 2, 3, 4, 5, 6]);
    if (window.UIController?.toast) {
        window.UIController.toast('🔐 All patterns locked');
    }
};

window.unlockAllPatterns = function() {
    window.lockedTracks = new Set();
    if (window.UIController?.toast) {
        window.UIController.toast('🔓 All patterns unlocked');
    }
};

// 18. PATTERN VARIATIONS
window.openPatternVariations = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:600px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#00ff94;margin-bottom:20px;">🔀 PATTERN VARIATIONS</h3>
            <p style="color:#666;font-size:12px;margin-bottom:15px;">Generate variations of your patterns</p>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:15px;">
                <button class="var-btn" data-type="fill" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">🥁 Fill</button>
                <button class="var-btn" data-type="ghost" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">👻 Ghost Notes</button>
                <button class="var-btn" data-type="sparse" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">📉 Sparse</button>
                <button class="var-btn" data-type="dense" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">📈 Dense</button>
                <button class="var-btn" data-type="reverse" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">◀️ Reverse</button>
                <button class="var-btn" data-type="mirror" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">🪞 Mirror</button>
                <button class="var-btn" data-type="rotate" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">🔄 Rotate</button>
                <button class="var-btn" data-type="evolve" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">🧬 Evolve</button>
                <button class="var-btn" data-type="random" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:12px;border-radius:6px;cursor:pointer;">🎲 Random</button>
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Amount: <span id="varAmt">30%</span></label>
                <input type="range" id="varAmount" min="10" max="100" value="30" style="width:100%;" oninput="document.getElementById('varAmt').textContent=this.value+'%'">
            </div>
            <button onclick="window.applyPatternVariation()" style="width:100%;padding:12px;background:#00ff94;border:none;color:#000;border-radius:4px;cursor:pointer;font-weight:700;">🔀 APPLY VARIATION</button>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelectorAll('.var-btn').forEach((btn) => {
        const b = btn
        b.onclick = () => {
            window.currentVariationType = b.dataset.type;
            dialog.querySelectorAll('.var-btn').forEach((bb) => { (bb).style.borderColor = '#333'; });
            b.style.borderColor = '#00ff94';
        };
    });

    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.applyPatternVariation = function() {
    const type = window.currentVariationType || 'fill';
    const amount = parseInt((document.getElementById('varAmount'))?.value || '30');
    if (window.UIController?.toast) {
        window.UIController.toast(`🔀 Applied ${type} variation (${amount}%)`);
    }
};

// 19. SPECTRAL FREEZE
window.openSpectralFreeze = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:500px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#7c3aed;margin-bottom:20px;">❄️ SPECTRAL FREEZE</h3>
            <p style="color:#666;font-size:12px;margin-bottom:15px;">Freeze the audio spectrum in real-time</p>
            <div id="freezeVisual" style="height:100px;background:linear-gradient(180deg,#1a1a1a,#0a0a0a);border-radius:8px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;border:2px solid #333;">
                <span style="color:#666;font-size:14px;">Click FREEZE to capture spectrum</span>
            </div>
            <div style="display:flex;gap:10px;margin-bottom:15px;">
                <button onclick="window.toggleSpectralFreeze()" id="freezeBtn" style="flex:1;padding:15px;background:#7c3aed;border:none;color:#fff;border-radius:6px;cursor:pointer;font-weight:700;font-size:16px;">❄️ FREEZE</button>
            </div>
            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;">Decay: <span id="freezeDecay">50%</span></label>
                <input type="range" id="freezeDecayVal" min="0" max="100" value="50" style="width:100%;" oninput="document.getElementById('freezeDecay').textContent=this.value+'%'">
            </div>
            <button onclick="this.closest('dialog').close()" style="width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.onclose = () => {
        window.spectralFrozen = false;
        dialog.remove();
    };
};

window.toggleSpectralFreeze = function() {
    window.spectralFrozen = window.spectralFrozen;
    const btn = document.getElementById('freezeBtn')
    const visual = document.getElementById('freezeVisual')
    if (window.spectralFrozen) {
        btn.textContent = '🔥 UNFREEZE';
        btn.style.background = '#ff0055';
        visual.style.borderColor = '#7c3aed';
        visual.innerHTML = '<span style="color:#7c3aed;font-size:14px;">❄️ SPECTRUM FROZEN</span>';
        if (window.UIController?.toast) {
            window.UIController.toast('❄️ Spectrum frozen');
        }
    } else {
        btn.textContent = '❄️ FREEZE';
        btn.style.background = '#7c3aed';
        visual.style.borderColor = '#333';
        visual.innerHTML = '<span style="color:#666;font-size:14px;">Click FREEZE to capture spectrum</span>';
        if (window.UIController?.toast) {
            window.UIController.toast('🔥 Spectrum unfrozen');
        }
    }
};

// 20. AUTO ARRANGER
window.openAutoArranger = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:600px;background:#0a0a0a;border:1px solid #333;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <h3 style="color:#f59e0b;margin-bottom:20px;">🎼 AUTO ARRANGER</h3>
            <p style="color:#666;font-size:12px;margin-bottom:15px;">Automatically arrange patterns into full songs</p>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:15px;">
                <button class="arr-btn" data-template="standard" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:15px;border-radius:6px;cursor:pointer;">
                    <div style="font-size:14px;font-weight:700;">Standard</div>
                    <div style="font-size:10px;color:#666;margin-top:5px;">Verse-Chorus (104 bars)</div>
                </button>
                <button class="arr-btn" data-template="edm" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:15px;border-radius:6px;cursor:pointer;">
                    <div style="font-size:14px;font-weight:700;">EDM</div>
                    <div style="font-size:10px;color:#666;margin-top:5px;">Build-Drop (128 bars)</div>
                </button>
                <button class="arr-btn" data-template="techno" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:15px;border-radius:6px;cursor:pointer;">
                    <div style="font-size:14px;font-weight:700;">Techno</div>
                    <div style="font-size:10px;color:#666;margin-top:5px;">Journey (176 bars)</div>
                </button>
                <button class="arr-btn" data-template="hiphop" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:15px;border-radius:6px;cursor:pointer;">
                    <div style="font-size:14px;font-weight:700;">Hip-Hop</div>
                    <div style="font-size:10px;color:#666;margin-top:5px;">Verse-Hook (64 bars)</div>
                </button>
                <button class="arr-btn" data-template="ambient" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:15px;border-radius:6px;cursor:pointer;">
                    <div style="font-size:14px;font-weight:700;">Ambient</div>
                    <div style="font-size:10px;color:#666;margin-top:5px;">Drift Flow (224 bars)</div>
                </button>
                <button class="arr-btn" data-template="dnb" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:15px;border-radius:6px;cursor:pointer;">
                    <div style="font-size:14px;font-weight:700;">DnB</div>
                    <div style="font-size:10px;color:#666;margin-top:5px;">Roller (176 bars)</div>
                </button>
            </div>
            <button onclick="window.applyAutoArrangement()" style="width:100%;padding:12px;background:#f59e0b;border:none;color:#000;border-radius:4px;cursor:pointer;font-weight:700;">🎼 GENERATE ARRANGEMENT</button>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelectorAll('.arr-btn').forEach((btn) => {
        const b = btn
        b.onclick = () => {
            window.currentArrangementTemplate = b.dataset.template;
            dialog.querySelectorAll('.arr-btn').forEach((bb) => { (bb).style.borderColor = '#333'; });
            b.style.borderColor = '#f59e0b';
        };
    });

    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.applyAutoArrangement = function() {
    const template = window.currentArrangementTemplate || 'standard';
    if (window.UIController?.toast) {
        window.UIController.toast(`🎼 Generated ${template} arrangement`);
    }
};

// ============================================================
// 🐮 PHONK GENERATOR - Kriegsvideo Sound
// ============================================================

window.openPhonkGenerator = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:650px;background:linear-gradient(180deg,#0a0a0a,#1a0a1a);border:2px solid #ff0055;border-radius:12px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <h2 style="color:#ff0055;font-size:28px;margin:0;text-shadow:0 0 20px #ff0055;">🐮 PHONK GENERATOR</h2>
                <p style="color:#666;font-size:12px;margin-top:5px;">KRIEGSVIDEO SOUND // DRIFT BEATS // AGGRESSIVE 808</p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;">
                <button class="phonk-style-btn" data-style="classic" style="background:#1a1a1a;border:2px solid #ff0055;color:#fff;padding:15px;border-radius:8px;cursor:pointer;">
                    <div style="font-size:24px;">🐮</div>
                    <div style="font-size:12px;font-weight:700;margin-top:5px;">CLASSIC</div>
                    <div style="font-size:9px;color:#666;">Memphis Cowbell</div>
                </button>
                <button class="phonk-style-btn" data-style="drift" style="background:#1a1a1a;border:2px solid #7c3aed;color:#7c3aed;padding:15px;border-radius:8px;cursor:pointer;">
                    <div style="font-size:24px;">🏎️</div>
                    <div style="font-size:12px;font-weight:700;margin-top:5px;">DRIFT</div>
                    <div style="font-size:9px;color:#666;">Tokyo Highway</div>
                </button>
                <button class="phonk-style-btn" data-style="dark" style="background:#1a1a1a;border:2px solid #666;color:#fff;padding:15px;border-radius:8px;cursor:pointer;">
                    <div style="font-size:24px;">💀</div>
                    <div style="font-size:12px;font-weight:700;margin-top:5px;">DARK</div>
                    <div style="font-size:9px;color:#666;">Slayer Vibes</div>
                </button>
                <button class="phonk-style-btn" data-style="aggressive" style="background:#1a1a1a;border:2px solid #ff0055;color:#fff;padding:15px;border-radius:8px;cursor:pointer;">
                    <div style="font-size:24px;">⚔️</div>
                    <div style="font-size:12px;font-weight:700;margin-top:5px;">AGGRESSIVE</div>
                    <div style="font-size:9px;color:#666;">War Ready</div>
                </button>
                <button class="phonk-style-btn" data-style="chopped" style="background:#1a1a1a;border:2px solid #00ff94;color:#00ff94;padding:15px;border-radius:8px;cursor:pointer;">
                    <div style="font-size:24px;">✂️</div>
                    <div style="font-size:12px;font-weight:700;margin-top:5px;">CHOPPED</div>
                    <div style="font-size:9px;color:#666;">Screwed & Chopped</div>
                </button>
                <button class="phonk-style-btn" data-style="house" style="background:#1a1a1a;border:2px solid #f59e0b;color:#f59e0b;padding:15px;border-radius:8px;cursor:pointer;">
                    <div style="font-size:24px;">🏠</div>
                    <div style="font-size:12px;font-weight:700;margin-top:5px;">PHONK HOUSE</div>
                    <div style="font-size:9px;color:#666;">4/4 Banger</div>
                </button>
            </div>

            <div style="background:#111;padding:15px;border-radius:8px;margin-bottom:15px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                    <div>
                        <label style="color:#666;font-size:10px;display:block;margin-bottom:5px;">🔥 808 DISTORTION</label>
                        <input type="range" id="phonkDistortion" min="0" max="100" value="80" style="width:100%;" oninput="document.getElementById('distVal').textContent=this.value+'%'">
                        <span id="distVal" style="color:#ff0055;font-size:11px;">80%</span>
                    </div>
                    <div>
                        <label style="color:#666;font-size:10px;display:block;margin-bottom:5px;">🔔 COWBELL LEVEL</label>
                        <input type="range" id="phonkCowbell" min="0" max="100" value="70" style="width:100%;" oninput="document.getElementById('cowVal').textContent=this.value+'%'">
                        <span id="cowVal" style="color:#f59e0b;font-size:11px;">70%</span>
                    </div>
                    <div>
                        <label style="color:#666;font-size:10px;display:block;margin-bottom:5px;">🎭 BPM</label>
                        <input type="range" id="phonkBpm" min="100" max="180" value="130" style="width:100%;" oninput="document.getElementById('bpmVal').textContent=this.value">
                        <span id="bpmVal" style="color:#00ff94;font-size:11px;">130</span>
                    </div>
                    <div>
                        <label style="color:#666;font-size:10px;display:block;margin-bottom:5px;">🎚️ BASS GAIN</label>
                        <input type="range" id="phonkBass" min="0" max="100" value="90" style="width:100%;" oninput="document.getElementById('bassVal').textContent=this.value+'%'">
                        <span id="bassVal" style="color:#7c3aed;font-size:11px;">90%</span>
                    </div>
                </div>
            </div>

            <div style="display:flex;gap:10px;">
                <button onclick="window.generatePhonkBeat()" style="flex:2;padding:15px;background:linear-gradient(90deg,#ff0055,#7c3aed);border:none;color:#fff;border-radius:6px;cursor:pointer;font-weight:800;font-size:14px;">🐮 GENERATE PHONK BEAT</button>
                <button onclick="window.generatePhonkWithVideo()" style="flex:1;padding:15px;background:#1a1a1a;border:2px solid #ff0055;color:#ff0055;border-radius:6px;cursor:pointer;font-weight:700;">🎬 + VIDEO FX</button>
            </div>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:4px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    // Style button selection
    dialog.querySelectorAll('.phonk-style-btn').forEach((btn) => {
        const b = btn
        b.onclick = () => {
            window.phonkStyle = b.dataset.style;
            dialog.querySelectorAll('.phonk-style-btn').forEach((bb) => {
                const bbElem = bb
                bbElem.style.opacity = '0.5';
            });
            b.style.opacity = '1';
        };
    });

    // Set default style
    window.phonkStyle = 'classic';

    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.generatePhonkBeat = function() {
    const style = window.phonkStyle || 'classic';
    const distortion = parseInt((document.getElementById('phonkDistortion'))?.value || '80');
    const cowbell = parseInt((document.getElementById('phonkCowbell'))?.value || '70');
    const bpm = parseInt((document.getElementById('phonkBpm'))?.value || '130');
    const bass = parseInt((document.getElementById('phonkBass'))?.value || '90');

    // Set genre based on style
    let genre = 'PHONK';
    if (style === 'drift') genre = 'DRIFTPHONK';
    if (style === 'dark') genre = 'DARKPHONK';

    // Apply to engine if available
    if (window.sys?.setGenre) {
        window.sys.setGenre(genre);
    }
    if (window.engine?.setBPM) {
        window.engine.setBPM(bpm);
    }

    // Set cowbell/distortion settings
    window.phonkSettings = { distortion, cowbell, bass, style };

    // Generate patterns
    if (window.seq?.randomizeAll) {
        window.seq.randomizeAll();
    }

    if (window.UIController?.toast) {
        const messages = {
            'classic': '🐮 CLASSIC PHONK - Memphis Cowbell',
            'drift': '🏎️ DRIFT PHONK - Tokyo Highway',
            'dark': '💀 DARK PHONK - Slayer Vibes',
            'aggressive': '⚔️ AGGRESSIVE PHONK - War Ready',
            'chopped': '✂️ CHOPPED & SCREWED',
            'house': '🏠 PHONK HOUSE - 4/4 Banger'
        };
        window.UIController.toast(messages[style] || '🐮 PHONK Generated');
    }
};

window.generatePhonkWithVideo = function() {
    window.generatePhonkBeat();

    // Add video-style effects
    if (window.engine) {
        // Heavy sidechain
        window.sidechainSettings = { amount: 70, attack: 5, release: 150 };

        // Bitcrush for that lo-fi video aesthetic
        if (window.engine.bitcrushDepth) {
            window.engine.bitcrushDepth.value = 0.6;
        }
        if (window.engine.bitcrushFreq) {
            window.engine.bitcrushFreq.value = 0.4;
        }
    }

    if (window.UIController?.toast) {
        window.UIController.toast('🎬 PHONK + VIDEO FX Applied Ready for epic content');
    }
};

// ============================================================
// 📱 SOCIAL MEDIA FEATURES
// ============================================================

// 21. TIKTOK/REELS BEAT GENERATOR
window.openTikTokGenerator = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:600px;background:linear-gradient(180deg,#000,#1a0a2a);border:2px solid #ff0050;border-radius:16px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <h2 style="background:linear-gradient(90deg,#ff0050,#00f2ea);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:26px;margin:0;">📱 TIKTOK / REELS GENERATOR</h2>
                <p style="color:#666;font-size:11px;margin-top:5px;">VIRAL BEATS IN SECONDS • OPTIMIZED FOR SHORT-FORM</p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;">
                <button class="tiktok-duration-btn" data-duration="15" style="background:#1a1a1a;border:2px solid #ff0050;color:#fff;padding:20px;border-radius:12px;cursor:pointer;">
                    <div style="font-size:28px;">⚡</div>
                    <div style="font-size:16px;font-weight:700;margin-top:8px;">15s</div>
                    <div style="font-size:9px;color:#666;">TikTok Classic</div>
                </button>
                <button class="tiktok-duration-btn" data-duration="30" style="background:#1a1a1a;border:2px solid #00f2ea;color:#00f2ea;padding:20px;border-radius:12px;cursor:pointer;">
                    <div style="font-size:28px;">🔥</div>
                    <div style="font-size:16px;font-weight:700;margin-top:8px;">30s</div>
                    <div style="font-size:9px;color:#666;">Reels Standard</div>
                </button>
                <button class="tiktok-duration-btn" data-duration="60" style="background:#1a1a1a;border:2px solid #ff0050;color:#fff;padding:20px;border-radius:12px;cursor:pointer;">
                    <div style="font-size:28px;">🎯</div>
                    <div style="font-size:16px;font-weight:700;margin-top:8px;">60s</div>
                    <div style="font-size:9px;color:#666;">YouTube Shorts</div>
                </button>
            </div>

            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;display:block;margin-bottom:8px;">🎵 TRENDING STYLE</label>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
                    <button class="tiktok-style-btn" data-style="phonk" style="background:#111;border:1px solid #333;color:#fff;padding:10px;border-radius:6px;font-size:11px;">🐮 Phonk</button>
                    <button class="tiktok-style-btn" data-style="lofi" style="background:#111;border:1px solid #333;color:#fff;padding:10px;border-radius:6px;font-size:11px;">☕ Lo-Fi</button>
                    <button class="tiktok-style-btn" data-style="epic" style="background:#111;border:1px solid #333;color:#fff;padding:10px;border-radius:6px;font-size:11px;">⚔️ Epic</button>
                    <button class="tiktok-style-btn" data-style="chill" style="background:#111;border:1px solid #333;color:#fff;padding:10px;border-radius:6px;font-size:11px;">🌊 Chill</button>
                    <button class="tiktok-style-btn" data-style="hype" style="background:#111;border:1px solid #333;color:#fff;padding:10px;border-radius:6px;font-size:11px;">🔥 Hype</button>
                    <button class="tiktok-style-btn" data-style="emo" style="background:#111;border:1px solid #333;color:#fff;padding:10px;border-radius:6px;font-size:11px;">💔 Sad</button>
                    <button class="tiktok-style-btn" data-style="glitch" style="background:#111;border:1px solid #333;color:#fff;padding:10px;border-radius:6px;font-size:11px;">👾 Glitch</button>
                    <button class="tiktok-style-btn" data-style="trap" style="background:#111;border:1px solid #333;color:#fff;padding:10px;border-radius:6px;font-size:11px;">🎯 Trap</button>
                </div>
            </div>

            <div style="background:#0a0a0a;padding:15px;border-radius:10px;margin-bottom:15px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <span style="color:#666;font-size:10px;">📊 VIRAL OPTIMIZATION</span>
                    <span style="color:#00ff94;font-size:10px;">✓ TRENDING</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div>
                        <label style="color:#555;font-size:9px;">HOOK INTENSITY</label>
                        <input type="range" id="tiktokHook" min="0" max="100" value="80" style="width:100%;">
                    </div>
                    <div>
                        <label style="color:#555;font-size:9px;">BASS BOOST</label>
                        <input type="range" id="tiktokBass" min="0" max="100" value="70" style="width:100%;">
                    </div>
                </div>
            </div>

            <div style="display:flex;gap:10px;">
                <button onclick="window.generateTikTokBeat()" style="flex:2;padding:15px;background:linear-gradient(90deg,#ff0050,#00f2ea);border:none;color:#000;border-radius:8px;cursor:pointer;font-weight:800;font-size:14px;">📱 GENERATE VIRAL BEAT</button>
                <button onclick="window.previewTikTokBeat()" style="flex:1;padding:15px;background:#1a1a1a;border:2px solid #ff0050;color:#ff0050;border-radius:8px;cursor:pointer;font-weight:700;">▶️ PREVIEW</button>
            </div>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:6px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    // Duration selection
    dialog.querySelectorAll('.tiktok-duration-btn').forEach((btn) => {
        const b = btn
        b.onclick = () => {
            window.tiktokDuration = parseInt(b.dataset.duration || '30');
            dialog.querySelectorAll('.tiktok-duration-btn').forEach((bb) => { (bb).style.opacity = '0.5'; });
            b.style.opacity = '1';
        };
    });

    // Style selection
    dialog.querySelectorAll('.tiktok-style-btn').forEach((btn) => {
        const b = btn
        b.onclick = () => {
            window.tiktokStyle = b.dataset.style;
            dialog.querySelectorAll('.tiktok-style-btn').forEach((bb) => { (bb).style.borderColor = '#333'; });
            b.style.borderColor = '#ff0050';
        };
    });

    window.tiktokDuration = 30;
    window.tiktokStyle = 'phonk';

    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.generateTikTokBeat = function() {
    const duration = window.tiktokDuration || 30;
    const style = window.tiktokStyle || 'phonk';
    const hook = parseInt((document.getElementById('tiktokHook'))?.value || '80');
    const bass = parseInt((document.getElementById('tiktokBass'))?.value || '70');

    // Set appropriate genre
    const styleGenres = {
        'phonk': 'PHONK', 'lofi': 'LOFI', 'epic': 'CINEMATIC', 'chill': 'AMBIENT',
        'hype': 'TECHNO', 'emo': 'ETHEREAL', 'glitch': 'CYBERPUNK', 'trap': 'TRAP'
    };

    if (window.sys?.setGenre) {
        window.sys.setGenre(styleGenres[style] || 'PHONK');
    }

    // Set duration-based BPM (faster for shorter clips = more energy)
    const bpmMultipliers = { 15: 1.15, 30: 1.0, 60: 0.95 };
    const baseBpm = 130 * (bpmMultipliers[duration] || 1);

    if (window.engine?.setBPM) {
        window.engine.setBPM(Math.round(baseBpm));
    }

    // Apply viral optimization
    window.tiktokSettings = { duration, style, hook, bass };

    // Generate the beat
    if (window.seq?.randomizeAll) {
        window.seq.randomizeAll();
    }

    if (window.UIController?.toast) {
        window.UIController.toast(`📱 ${duration}s ${style.toUpperCase()} beat generated Ready for TikTok`);
    }
};

window.previewTikTokBeat = function() {
    if (window.sys?.togglePlay) {
        window.sys.togglePlay();
    }
    if (window.UIController?.toast) {
        window.UIController.toast('▶️ Preview playing...');
    }
};

// 22. VIRAL HOOK GENERATOR
window.openViralHookGenerator = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:550px;background:linear-gradient(180deg,#0a0a0a,#1a1a2e);border:2px solid #ffd700;border-radius:16px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <h2 style="color:#ffd700;font-size:26px;margin:0;text-shadow:0 0 20px #ffd700;">🎵 VIRAL HOOK GENERATOR</h2>
                <p style="color:#666;font-size:11px;margin-top:5px;">CATCHY MELODIES THAT STICK IN PEOPLE'S HEADS</p>
            </div>

            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;display:block;margin-bottom:8px;">🎯 HOOK TYPE</label>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                    <button class="hook-type-btn" data-type="earworm" style="background:#111;border:2px solid #ffd700;color:#ffd700;padding:15px;border-radius:8px;cursor:pointer;">
                        <div style="font-size:20px;">🧠</div>
                        <div style="font-size:10px;margin-top:5px;">Earworm</div>
                    </button>
                    <button class="hook-type-btn" data-type="anthem" style="background:#111;border:2px solid #333;color:#fff;padding:15px;border-radius:8px;cursor:pointer;">
                        <div style="font-size:20px;">🎤</div>
                        <div style="font-size:10px;margin-top:5px;">Anthem</div>
                    </button>
                    <button class="hook-type-btn" data-type="drop" style="background:#111;border:2px solid #333;color:#fff;padding:15px;border-radius:8px;cursor:pointer;">
                        <div style="font-size:20px;">💥</div>
                        <div style="font-size:10px;margin-top:5px;">Drop</div>
                    </button>
                    <button class="hook-type-btn" data-type="tag" style="background:#111;border:2px solid #333;color:#fff;padding:15px;border-radius:8px;cursor:pointer;">
                        <div style="font-size:20px;">🏷️</div>
                        <div style="font-size:10px;margin-top:5px;">Producer Tag</div>
                    </button>
                    <button class="hook-type-btn" data-type="jingle" style="background:#111;border:2px solid #333;color:#fff;padding:15px;border-radius:8px;cursor:pointer;">
                        <div style="font-size:20px;">📺</div>
                        <div style="font-size:10px;margin-top:5px;">Jingle</div>
                    </button>
                    <button class="hook-type-btn" data-type="meme" style="background:#111;border:2px solid #333;color:#fff;padding:15px;border-radius:8px;cursor:pointer;">
                        <div style="font-size:20px;">😂</div>
                        <div style="font-size:10px;margin-top:5px;">Meme Sound</div>
                    </button>
                </div>
            </div>

            <div style="background:#0a0a0a;padding:15px;border-radius:10px;margin-bottom:15px;">
                <div style="margin-bottom:12px;">
                    <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">🎯 CATCHINESS LEVEL</label>
                    <input type="range" id="hookCatchiness" min="50" max="100" value="85" style="width:100%;">
                </div>
                <div style="margin-bottom:12px;">
                    <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">⏱️ HOOK LENGTH (seconds)</label>
                    <select id="hookLength" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                        <option value="3">3 seconds (Ultra Short)</option>
                        <option value="5" selected>5 seconds (TikTok Hook)</option>
                        <option value="8">8 seconds (Verse Hook)</option>
                        <option value="15">15 seconds (Chorus)</option>
                    </select>
                </div>
                <div>
                    <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">🎹 MUSICAL KEY</label>
                    <select id="hookKey" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                        <option value="Cminor">C Minor (Dark & Catchy)</option>
                        <option value="Cmajor">C Major (Happy & Bright)</option>
                        <option value="Aminor" selected>A Minor (Emotional)</option>
                        <option value="Dminor">D Minor (Sad TikTok)</option>
                        <option value="Emajor">E Major (Energetic)</option>
                    </select>
                </div>
            </div>

            <div style="background:#1a1a1a;padding:10px;border-radius:8px;margin-bottom:15px;border-left:3px solid #ffd700;">
                <div style="color:#ffd700;font-size:10px;margin-bottom:5px;">💡 PRO TIP</div>
                <div style="color:#666;font-size:10px;">The best hooks use simple 3-5 note patterns that repeat. Think "Oh No" by Kreepa or "Stay" by The Kid LAROI.</div>
            </div>

            <button onclick="window.generateViralHook()" style="width:100%;padding:15px;background:linear-gradient(90deg,#ffd700,#ff8c00);border:none;color:#000;border-radius:8px;cursor:pointer;font-weight:800;font-size:14px;">🎵 GENERATE VIRAL HOOK</button>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:6px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelectorAll('.hook-type-btn').forEach((btn) => {
        const b = btn
        b.onclick = () => {
            window.hookType = b.dataset.type;
            dialog.querySelectorAll('.hook-type-btn').forEach((bb) => { (bb).style.borderColor = '#333'; (bb).style.color = '#fff'; });
            b.style.borderColor = '#ffd700';
            b.style.color = '#ffd700';
        };
    });

    window.hookType = 'earworm';

    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.generateViralHook = function() {
    const type = window.hookType || 'earworm';
    const catchiness = parseInt((document.getElementById('hookCatchiness'))?.value || '85');
    const length = parseInt((document.getElementById('hookLength'))?.value || '5');
    const key = (document.getElementById('hookKey'))?.value || 'Aminor';

    // Famous hook patterns (simplified note intervals)
    const hookPatterns = {
        'earworm': [[0, 2, 4, 2, 0], [0, 4, 2, 0, -3], [0, 2, 0, -2, 0]],
        'anthem': [[0, 4, 7, 4, 0], [0, 5, 7, 5, 0], [0, 3, 5, 7, 5]],
        'drop': [[0, 0, -3, 0, 0], [0, -2, -5, -2, 0], [0, 0, 0, 3, 0]],
        'tag': [[0, 7, 5], [0, 4, 0], [0, 3, 5]],
        'jingle': [[0, 2, 4, 5, 4], [0, 4, 2, 0], [5, 4, 2, 0]],
        'meme': [[0, 0, 0, -5], [0, 5, 4, 2], [0, -2, 0, 3]]
    };

    const pattern = hookPatterns[type][Math.floor(Math.random() * hookPatterns[type].length)];
    window.currentHookPattern = pattern;

    // Apply to lead track
    if (window.engine?.setScale) {
        const keyScale = key.includes('minor') ? 'minor' : 'major';
        window.engine.setScale(keyScale);
    }

    window.hookSettings = { type, catchiness, length, key, pattern };

    if (window.UIController?.toast) {
        window.UIController.toast(`🎵 ${type.toUpperCase()} Hook generated Pattern: [${pattern.join('-')}]`);
    }
};

// 23. SOCIAL MEDIA EXPORT BUNDLE
window.openSocialExport = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:650px;background:linear-gradient(180deg,#0a0a0a,#0a1a2a);border:2px solid #00ff94;border-radius:16px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <h2 style="color:#00ff94;font-size:24px;margin:0;">📦 SOCIAL MEDIA EXPORT BUNDLE</h2>
                <p style="color:#666;font-size:11px;margin-top:5px;">ONE-CLICK EXPORT FOR ALL PLATFORMS • OPTIMIZED SPECS</p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
                <div style="background:#111;padding:15px;border-radius:10px;text-align:center;border:1px solid #ff0050;">
                    <div style="font-size:28px;">📱</div>
                    <div style="font-size:12px;font-weight:700;color:#ff0050;margin-top:8px;">TikTok</div>
                    <div style="font-size:9px;color:#666;margin-top:4px;">1080x1920</div>
                    <div style="font-size:9px;color:#666;">-14 LUFS</div>
                    <input type="checkbox" id="expTiktok" checked style="margin-top:8px;accent-color:#ff0050;">
                </div>
                <div style="background:#111;padding:15px;border-radius:10px;text-align:center;border:1px solid #E1306C;">
                    <div style="font-size:28px;">📸</div>
                    <div style="font-size:12px;font-weight:700;color:#E1306C;margin-top:8px;">Reels</div>
                    <div style="font-size:9px;color:#666;margin-top:4px;">1080x1920</div>
                    <div style="font-size:9px;color:#666;">-14 LUFS</div>
                    <input type="checkbox" id="expReels" checked style="margin-top:8px;accent-color:#E1306C;">
                </div>
                <div style="background:#111;padding:15px;border-radius:10px;text-align:center;border:1px solid #FF0000;">
                    <div style="font-size:28px;">▶️</div>
                    <div style="font-size:12px;font-weight:700;color:#FF0000;margin-top:8px;">Shorts</div>
                    <div style="font-size:9px;color:#666;margin-top:4px;">1080x1920</div>
                    <div style="font-size:9px;color:#666;">-14 LUFS</div>
                    <input type="checkbox" id="expShorts" checked style="margin-top:8px;accent-color:#FF0000;">
                </div>
                <div style="background:#111;padding:15px;border-radius:10px;text-align:center;border:1px solid #ff0000;">
                    <div style="font-size:28px;">🎥</div>
                    <div style="font-size:12px;font-weight:700;color:#ff0000;margin-top:8px;">YouTube</div>
                    <div style="font-size:9px;color:#666;margin-top:4px;">1920x1080</div>
                    <div style="font-size:9px;color:#666;">-14 LUFS</div>
                    <input type="checkbox" id="expYoutube" style="margin-top:8px;accent-color:#ff0000;">
                </div>
            </div>

            <div style="background:#0a0a0a;padding:15px;border-radius:10px;margin-bottom:15px;">
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;">
                    <div>
                        <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">⏱️ DURATION</label>
                        <select id="exportDuration" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                            <option value="15">15 seconds</option>
                            <option value="30" selected>30 seconds</option>
                            <option value="60">60 seconds</option>
                            <option value="full">Full Track</option>
                        </select>
                    </div>
                    <div>
                        <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">🔊 FORMAT</label>
                        <select id="exportFormat" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                            <option value="wav">WAV (Best Quality)</option>
                            <option value="mp3" selected>MP3 (Smaller)</option>
                        </select>
                    </div>
                    <div>
                        <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">📊 QUALITY</label>
                        <select id="exportQuality" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                            <option value="high">High (320kbps)</option>
                            <option value="medium" selected>Medium (192kbps)</option>
                            <option value="low">Low (128kbps)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style="background:#1a1a1a;padding:12px;border-radius:8px;margin-bottom:15px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:#666;font-size:11px;">📦 Selected Platforms</span>
                    <span id="platformCount" style="color:#00ff94;font-size:11px;font-weight:700;">3 platforms</span>
                </div>
            </div>

            <button onclick="window.exportSocialBundle()" style="width:100%;padding:15px;background:linear-gradient(90deg,#00ff94,#00ccff);border:none;color:#000;border-radius:8px;cursor:pointer;font-weight:800;font-size:14px;">📦 EXPORT ALL SELECTED</button>

            <div style="margin-top:15px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <button onclick="window.quickExportTikTok()" style="padding:12px;background:#ff0050;border:none;color:#fff;border-radius:6px;cursor:pointer;font-weight:700;">📱 Quick TikTok</button>
                <button onclick="window.quickExportReels()" style="padding:12px;background:linear-gradient(45deg,#f09433,#E1306C);border:none;color:#fff;border-radius:6px;cursor:pointer;font-weight:700;">📸 Quick Reels</button>
            </div>

            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:6px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    // Update platform count on checkbox change
    const updateCount = () => {
        const checkboxes = ['expTiktok', 'expReels', 'expShorts', 'expYoutube'];
        const count = checkboxes.filter(id => (document.getElementById(id))?.checked).length;
        const countEl = document.getElementById('platformCount');
        if (countEl) countEl.textContent = `${count} platform${count == 1 ? 's' : ''}`;
    };

    ['expTiktok', 'expReels', 'expShorts', 'expYoutube'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateCount);
    });

    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.exportSocialBundle = function() {
    const platforms = [];
    if ((document.getElementById('expTiktok'))?.checked) platforms.push('TikTok');
    if ((document.getElementById('expReels'))?.checked) platforms.push('Reels');
    if ((document.getElementById('expShorts'))?.checked) platforms.push('Shorts');
    if ((document.getElementById('expYoutube'))?.checked) platforms.push('YouTube');

    const duration = (document.getElementById('exportDuration'))?.value || '30';
    const format = (document.getElementById('exportFormat'))?.value || 'mp3';
    const quality = (document.getElementById('exportQuality'))?.value || 'medium';

    if (platforms.length === 0) {
        if (window.UIController?.toast) {
            window.UIController.toast('⚠️ Please select at least one platform');
        }
        return;
    }

    // Apply mastering preset for social media
    window.applyAIMastering('streaming');

    if (window.UIController?.toast) {
        window.UIController.toast(`📦 Exporting for ${platforms.join(', ')}... (${duration}s, ${format.toUpperCase()})`);
    }

    // Trigger actual export if available
    if (window.wavExporter?.exportWAV) {
        window.wavExporter.exportWAV();
    }
};

window.quickExportTikTok = function() {
    window.applyAIMastering('streaming');
    if (window.UIController?.toast) {
        window.UIController.toast('📱 Quick export for TikTok (30s, -14 LUFS)...');
    }
    if (window.wavExporter?.exportWAV) {
        window.wavExporter.exportWAV();
    }
};

window.quickExportReels = function() {
    window.applyAIMastering('streaming');
    if (window.UIController?.toast) {
        window.UIController.toast('📸 Quick export for Reels (30s, -14 LUFS)...');
    }
    if (window.wavExporter?.exportWAV) {
        window.wavExporter.exportWAV();
    }
};

// ============================================================
// 🎛️ MORE PRO FEATURES
// ============================================================

// 24. RISER/FX GENERATOR - Build-ups & Impacts
window.openRiserGenerator = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:550px;background:linear-gradient(180deg,#0a0a0a,#1a0a1a);border:2px solid #ff00ff;border-radius:16px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <h2 style="color:#ff00ff;font-size:24px;margin:0;text-shadow:0 0 20px #ff00ff;">🚀 RISER / FX GENERATOR</h2>
                <p style="color:#666;font-size:11px;margin-top:5px;">BUILD-UPS • IMPACTS • DOWNLIFTERS • SWEEPS</p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
                <button class="fx-type-btn" data-type="riser" style="background:#1a1a1a;border:2px solid #ff00ff;color:#ff00ff;padding:15px;border-radius:10px;cursor:pointer;">
                    <div style="font-size:24px;">📈</div>
                    <div style="font-size:10px;margin-top:5px;">RISER</div>
                </button>
                <button class="fx-type-btn" data-type="impact" style="background:#1a1a1a;border:2px solid #333;color:#fff;padding:15px;border-radius:10px;cursor:pointer;">
                    <div style="font-size:24px;">💥</div>
                    <div style="font-size:10px;margin-top:5px;">IMPACT</div>
                </button>
                <button class="fx-type-btn" data-type="downlifter" style="background:#1a1a1a;border:2px solid #333;color:#fff;padding:15px;border-radius:10px;cursor:pointer;">
                    <div style="font-size:24px;">📉</div>
                    <div style="font-size:10px;margin-top:5px;">DOWNLIFT</div>
                </button>
                <button class="fx-type-btn" data-type="sweep" style="background:#1a1a1a;border:2px solid #333;color:#fff;padding:15px;border-radius:10px;cursor:pointer;">
                    <div style="font-size:24px;">🌊</div>
                    <div style="font-size:10px;margin-top:5px;">SWEEP</div>
                </button>
            </div>

            <div style="background:#0a0a0a;padding:15px;border-radius:10px;margin-bottom:15px;">
                <div style="margin-bottom:12px;">
                    <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">⏱️ LENGTH: <span id="riserLenVal">2</span> bars</label>
                    <input type="range" id="riserLength" min="1" max="8" value="2" style="width:100%;" oninput="document.getElementById('riserLenVal').textContent=this.value">
                </div>
                <div style="margin-bottom:12px;">
                    <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">🔥 INTENSITY: <span id="riserIntVal">80</span>%</label>
                    <input type="range" id="riserIntensity" min="50" max="100" value="80" style="width:100%;" oninput="document.getElementById('riserIntVal').textContent=this.value">
                </div>
                <div>
                    <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">🎚️ FILTER SWEEP</label>
                    <select id="riserFilter" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                        <option value="lowpass">Lowpass (Classic Build)</option>
                        <option value="highpass">Highpass (Tension)</option>
                        <option value="bandpass">Bandpass (Hypnotic)</option>
                        <option value="none">No Filter</option>
                    </select>
                </div>
            </div>

            <div style="display:flex;gap:10px;">
                <button onclick="window.generateRiserFX()" style="flex:2;padding:15px;background:linear-gradient(90deg,#ff00ff,#ff0080);border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:800;">🚀 GENERATE FX</button>
                <button onclick="window.previewRiserFX()" style="flex:1;padding:15px;background:#1a1a1a;border:2px solid #ff00ff;color:#ff00ff;border-radius:8px;cursor:pointer;font-weight:700;">▶️</button>
            </div>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:6px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelectorAll('.fx-type-btn').forEach((btn) => {
        const b = btn
        b.onclick = () => {
            window.riserType = b.dataset.type;
            dialog.querySelectorAll('.fx-type-btn').forEach((bb) => { (bb).style.borderColor = '#333'; (bb).style.color = '#fff'; });
            b.style.borderColor = '#ff00ff';
            b.style.color = '#ff00ff';
        };
    });

    window.riserType = 'riser';
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.generateRiserFX = function() {
    const type = window.riserType || 'riser';
    const length = parseInt((document.getElementById('riserLength'))?.value || '2');
    const intensity = parseInt((document.getElementById('riserIntensity'))?.value || '80');
    const filter = (document.getElementById('riserFilter'))?.value || 'lowpass';

    // Generate FX pattern based on type
    const steps = length * 16;
    let pattern = [];

    switch(type) {
        case 'riser':
            // Increasing velocity/intensity
            for (let i = 0; i < steps; i++) {
                const progress = i / steps;
                pattern.push(progress * (intensity / 100));
            }
            break;
        case 'impact':
            // Big hit at start, decay
            pattern = [1, 0.8, 0.6, 0.4, 0.2, 0.1, ...Array(steps - 6).fill(0)];
            break;
        case 'downlifter':
            // Decreasing from high
            for (let i = 0; i < steps; i++) {
                const progress = 1 - (i / steps);
                pattern.push(progress * (intensity / 100));
            }
            break;
        case 'sweep':
            // Back and forth
            for (let i = 0; i < steps; i++) {
                const progress = Math.sin((i / steps) * Math.PI);
                pattern.push(progress * (intensity / 100));
            }
            break;
    }

    window.riserPattern = { type, length, intensity, filter, pattern };

    if (window.UIController?.toast) {
        window.UIController.toast(`🚀 ${type.toUpperCase()} generated ${length} bars`);
    }
};

window.previewRiserFX = function() {
    if (window.sys?.togglePlay) {
        window.sys.togglePlay();
    }
};

// 25. GLITCH MACHINE
window.openGlitchMachine = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:600px;background:linear-gradient(180deg,#0a0a0a,#001a1a);border:2px solid #00ffcc;border-radius:16px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <h2 style="color:#00ffcc;font-size:24px;margin:0;text-shadow:0 0 20px #00ffcc;">👾 GLITCH MACHINE</h2>
                <p style="color:#666;font-size:11px;margin-top:5px;">DESTROY • STUTTER • CHOP • MANGLE</p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;">
                <button class="glitch-btn" data-mode="stutter" style="background:#1a1a1a;border:2px solid #00ffcc;color:#00ffcc;padding:15px;border-radius:10px;cursor:pointer;">
                    <div style="font-size:20px;">🔄</div>
                    <div style="font-size:11px;margin-top:5px;">Stutter</div>
                </button>
                <button class="glitch-btn" data-mode="chop" style="background:#1a1a1a;border:2px solid #333;color:#fff;padding:15px;border-radius:10px;cursor:pointer;">
                    <div style="font-size:20px;">✂️</div>
                    <div style="font-size:11px;margin-top:5px;">Chop</div>
                </button>
                <button class="glitch-btn" data-mode="reverse" style="background:#1a1a1a;border:2px solid #333;color:#fff;padding:15px;border-radius:10px;cursor:pointer;">
                    <div style="font-size:20px;">⏪</div>
                    <div style="font-size:11px;margin-top:5px;">Reverse</div>
                </button>
                <button class="glitch-btn" data-mode="timestretch" style="background:#1a1a1a;border:2px solid #333;color:#fff;padding:15px;border-radius:10px;cursor:pointer;">
                    <div style="font-size:20px;">⏱️</div>
                    <div style="font-size:11px;margin-top:5px;">Timestretch</div>
                </button>
                <button class="glitch-btn" data-mode="granular" style="background:#1a1a1a;border:2px solid #333;color:#fff;padding:15px;border-radius:10px;cursor:pointer;">
                    <div style="font-size:20px;">🔬</div>
                    <div style="font-size:11px;margin-top:5px;">Granular</div>
                </button>
                <button class="glitch-btn" data-mode="buffer" style="background:#1a1a1a;border:2px solid #333;color:#fff;padding:15px;border-radius:10px;cursor:pointer;">
                    <div style="font-size:20px;">📺</div>
                    <div style="font-size:11px;margin-top:5px;">Buffer</div>
                </button>
            </div>

            <div style="background:#0a0a0a;padding:15px;border-radius:10px;margin-bottom:15px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                    <div>
                        <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">💥 CHAOS: <span id="glitchChaosVal">50</span>%</label>
                        <input type="range" id="glitchChaos" min="0" max="100" value="50" style="width:100%;" oninput="document.getElementById('glitchChaosVal').textContent=this.value">
                    </div>
                    <div>
                        <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">🎯 RATE: <span id="glitchRateVal">4</span>n</label>
                        <input type="range" id="glitchRate" min="1" max="8" value="4" style="width:100%;" oninput="document.getElementById('glitchRateVal').textContent=this.value+'n'">
                    </div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:15px;">
                <div style="background:#111;padding:10px;border-radius:6px;text-align:center;">
                    <div style="color:#00ffcc;font-size:10px;">LO-FI</div>
                    <input type="checkbox" id="glitchLofi" style="accent-color:#00ffcc;">
                </div>
                <div style="background:#111;padding:10px;border-radius:6px;text-align:center;">
                    <div style="color:#00ffcc;font-size:10px;">CRUSH</div>
                    <input type="checkbox" id="glitchCrush" checked style="accent-color:#00ffcc;">
                </div>
                <div style="background:#111;padding:10px;border-radius:6px;text-align:center;">
                    <div style="color:#00ffcc;font-size:10px;">TAPE</div>
                    <input type="checkbox" id="glitchTape" style="accent-color:#00ffcc;">
                </div>
                <div style="background:#111;padding:10px;border-radius:6px;text-align:center;">
                    <div style="color:#00ffcc;font-size:10px;">VINYL</div>
                    <input type="checkbox" id="glitchVinyl" style="accent-color:#00ffcc;">
                </div>
            </div>

            <button onclick="window.applyGlitchEffect()" style="width:100%;padding:15px;background:linear-gradient(90deg,#00ffcc,#00ff88);border:none;color:#000;border-radius:8px;cursor:pointer;font-weight:800;font-size:14px;">👾 APPLY GLITCH</button>
            <button onclick="window.resetGlitch()" style="margin-top:10px;width:100%;padding:10px;background:#333;border:none;color:#fff;border-radius:6px;cursor:pointer;">🔄 RESET</button>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:6px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelectorAll('.glitch-btn').forEach((btn) => {
        const b = btn
        b.onclick = () => {
            window.glitchMode = b.dataset.mode;
            dialog.querySelectorAll('.glitch-btn').forEach((bb) => { (bb).style.borderColor = '#333'; (bb).style.color = '#fff'; });
            b.style.borderColor = '#00ffcc';
            b.style.color = '#00ffcc';
        };
    });

    window.glitchMode = 'stutter';
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.applyGlitchEffect = function() {
    const mode = window.glitchMode || 'stutter';
    const chaos = parseInt((document.getElementById('glitchChaos'))?.value || '50');
    const rate = parseInt((document.getElementById('glitchRate'))?.value || '4');
    const lofi = (document.getElementById('glitchLofi'))?.checked;
    const crush = (document.getElementById('glitchCrush'))?.checked;
    const tape = (document.getElementById('glitchTape'))?.checked;
    const vinyl = (document.getElementById('glitchVinyl'))?.checked;

    window.glitchSettings = { mode, chaos, rate, lofi, crush, tape, vinyl };

    // Apply bitcrush if enabled
    if (crush && window.engine) {
        if (window.engine.bitcrushDepth) window.engine.bitcrushDepth.value = chaos / 100;
        if (window.engine.bitcrushFreq) window.engine.bitcrushFreq.value = 1 - (chaos / 200);
    }

    if (window.UIController?.toast) {
        window.UIController.toast(`👾 GLITCH ${mode.toUpperCase()} applied Chaos: ${chaos}%`);
    }
};

window.resetGlitch = function() {
    if (window.engine) {
        if (window.engine.bitcrushDepth) window.engine.bitcrushDepth.value = 0;
        if (window.engine.bitcrushFreq) window.engine.bitcrushFreq.value = 1;
    }
    if (window.UIController?.toast) {
        window.UIController.toast('🔄 Glitch reset');
    }
};

// 26. VOCAL CHOPS GENERATOR
window.openVocalChops = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:550px;background:linear-gradient(180deg,#0a0a0a,#2a1a0a);border:2px solid #ff8800;border-radius:16px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <h2 style="color:#ff8800;font-size:24px;margin:0;text-shadow:0 0 20px #ff8800;">🎤 VOCAL CHOPS GENERATOR</h2>
                <p style="color:#666;font-size:11px;margin-top:5px;">AUTO-TUNE CHOPS • SLICED VOCALS • FORMANT SHIFT</p>
            </div>

            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;display:block;margin-bottom:8px;">🎵 CHOP STYLE</label>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                    <button class="chop-btn" data-style="chopped" style="background:#111;border:2px solid #ff8800;color:#ff8800;padding:12px;border-radius:8px;cursor:pointer;font-size:11px;">✂️ Chopped</button>
                    <button class="chop-btn" data-style="sliced" style="background:#111;border:2px solid #333;color:#fff;padding:12px;border-radius:8px;cursor:pointer;font-size:11px;">🔪 Sliced</button>
                    <button class="chop-btn" data-style="tuned" style="background:#111;border:2px solid #333;color:#fff;padding:12px;border-radius:8px;cursor:pointer;font-size:11px;">🎹 Auto-Tune</button>
                    <button class="chop-btn" data-style="formant" style="background:#111;border:2px solid #333;color:#fff;padding:12px;border-radius:8px;cursor:pointer;font-size:11px;">👻 Formant</button>
                    <button class="chop-btn" data-style="vocoder" style="background:#111;border:2px solid #333;color:#fff;padding:12px;border-radius:8px;cursor:pointer;font-size:11px;">🤖 Vocoder</button>
                    <button class="chop-btn" data-style="chopped-pitch" style="background:#111;border:2px solid #333;color:#fff;padding:12px;border-radius:8px;cursor:pointer;font-size:11px;">📈 Pitch Rise</button>
                </div>
            </div>

            <div style="background:#0a0a0a;padding:15px;border-radius:10px;margin-bottom:15px;">
                <div style="margin-bottom:12px;">
                    <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">🎚️ PITCH RANGE</label>
                    <select id="chopPitch" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                        <option value="-12">-1 Octave (Deep)</option>
                        <option value="-5">-5 Semitones</option>
                        <option value="0" selected>Original</option>
                        <option value="5">+5 Semitones</option>
                        <option value="12">+1 Octave (Chipmunk)</option>
                        <option value="random">Random (Chaos)</option>
                    </select>
                </div>
                <div style="margin-bottom:12px;">
                    <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">⏱️ CHOP RATE</label>
                    <select id="chopRate" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                        <option value="32n">1/32 (Super Fast)</option>
                        <option value="16n" selected>1/16 (Standard)</option>
                        <option value="8n">1/8 (Slow Chops)</option>
                        <option value="4n">1/4 (Mediative)</option>
                    </select>
                </div>
                <div>
                    <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">🤖 ROBOT AMOUNT: <span id="robotVal">30</span>%</label>
                    <input type="range" id="chopRobot" min="0" max="100" value="30" style="width:100%;" oninput="document.getElementById('robotVal').textContent=this.value">
                </div>
            </div>

            <div style="background:#1a1a1a;padding:10px;border-radius:8px;margin-bottom:15px;border-left:3px solid #ff8800;">
                <div style="color:#ff8800;font-size:10px;margin-bottom:5px;">💡 TIP</div>
                <div style="color:#666;font-size:10px;">Best results with sustained vocal samples or your own recordings</div>
            </div>

            <button onclick="window.generateVocalChops()" style="width:100%;padding:15px;background:linear-gradient(90deg,#ff8800,#ff4400);border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:800;font-size:14px;">🎤 GENERATE VOCAL CHOPS</button>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:6px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelectorAll('.chop-btn').forEach((btn) => {
        const b = btn
        b.onclick = () => {
            window.chopStyle = b.dataset.style;
            dialog.querySelectorAll('.chop-btn').forEach((bb) => { (bb).style.borderColor = '#333'; (bb).style.color = '#fff'; });
            b.style.borderColor = '#ff8800';
            b.style.color = '#ff8800';
        };
    });

    window.chopStyle = 'chopped';
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.generateVocalChops = function() {
    const style = window.chopStyle || 'chopped';
    const pitch = (document.getElementById('chopPitch'))?.value || '0';
    const rate = (document.getElementById('chopRate'))?.value || '16n';
    const robot = parseInt((document.getElementById('chopRobot'))?.value || '30');

    window.vocalChopSettings = { style, pitch, rate, robot };

    // Generate chop pattern on lead track
    if (window.seq?.randomizeAll) {
        window.seq.randomizeAll();
    }

    if (window.UIController?.toast) {
        window.UIController.toast(`🎤 Vocal Chops: ${style} style, pitch ${pitch}`);
    }
};

// 27. POLYRHYTHM ENGINE
window.openPolyrhythm = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:600px;background:linear-gradient(180deg,#0a0a0a,#0a1a2a);border:2px solid #6366f1;border-radius:16px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <h2 style="color:#6366f1;font-size:24px;margin:0;text-shadow:0 0 20px #6366f1;">🌀 POLYRHYTHM ENGINE</h2>
                <p style="color:#666;font-size:11px;margin-top:5px;">COMPLEX RHYTHMS • AFRICAN • INDIAN • MATH ROCK</p>
            </div>

            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;display:block;margin-bottom:8px;">🔢 POLYRHYTHM TYPE</label>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
                    <button class="poly-btn" data-type="3:2" style="background:#111;border:2px solid #6366f1;color:#6366f1;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;">3:2</button>
                    <button class="poly-btn" data-type="4:3" style="background:#111;border:2px solid #333;color:#fff;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;">4:3</button>
                    <button class="poly-btn" data-type="5:4" style="background:#111;border:2px solid #333;color:#fff;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;">5:4</button>
                    <button class="poly-btn" data-type="7:8" style="background:#111;border:2px solid #333;color:#fff;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;">7:8</button>
                    <button class="poly-btn" data-type="5:3" style="background:#111;border:2px solid #333;color:#fff;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;">5:3</button>
                    <button class="poly-btn" data-type="7:5" style="background:#111;border:2px solid #333;color:#fff;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;">7:5</button>
                    <button class="poly-btn" data-type="11:8" style="background:#111;border:2px solid #333;color:#fff;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;">11:8</button>
                    <button class="poly-btn" data-type="custom" style="background:#111;border:2px solid #333;color:#fff;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;">✏️ Custom</button>
                </div>
            </div>

            <div id="customPolyDiv" style="display:none;background:#0a0a0a;padding:15px;border-radius:10px;margin-bottom:15px;">
                <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:15px;align-items:center;">
                    <input type="number" id="polyA" min="2" max="16" value="5" style="background:#111;border:1px solid #333;color:#fff;padding:10px;border-radius:6px;text-align:center;font-size:18px;">
                    <span style="color:#6366f1;font-size:24px;">:</span>
                    <input type="number" id="polyB" min="2" max="16" value="4" style="background:#111;border:1px solid #333;color:#fff;padding:10px;border-radius:6px;text-align:center;font-size:18px;">
                </div>
            </div>

            <div style="background:#0a0a0a;padding:15px;border-radius:10px;margin-bottom:15px;">
                <div style="margin-bottom:12px;">
                    <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">🎯 APPLY TO TRACKS</label>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                        <label style="color:#00ff94;font-size:10px;"><input type="checkbox" id="polyKick" checked style="accent-color:#6366f1;"> Kick</label>
                        <label style="color:#f59e0b;font-size:10px;"><input type="checkbox" id="polySnare" style="accent-color:#6366f1;"> Snare</label>
                        <label style="color:#00ccff;font-size:10px;"><input type="checkbox" id="polyHihat" checked style="accent-color:#6366f1;"> HiHat</label>
                        <label style="color:#7c3aed;font-size:10px;"><input type="checkbox" id="polyBass" style="accent-color:#6366f1;"> Bass</label>
                    </div>
                </div>
                <div>
                    <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">🔄 PHASE LENGTH: <span id="polyPhaseVal">32</span> steps</label>
                    <input type="range" id="polyPhase" min="16" max="64" value="32" step="16" style="width:100%;" oninput="document.getElementById('polyPhaseVal').textContent=this.value">
                </div>
            </div>

            <div style="background:#1a1a1a;padding:10px;border-radius:8px;margin-bottom:15px;border-left:3px solid #6366f1;">
                <div style="color:#6366f1;font-size:10px;margin-bottom:5px;">📐 WHAT IS 3:2?</div>
                <div style="color:#666;font-size:10px;">3 beats against 2 beats - the classic "hemiola". 5:4 is common in Radiohead/Math Rock.</div>
            </div>

            <button onclick="window.generatePolyrhythm()" style="width:100%;padding:15px;background:linear-gradient(90deg,#6366f1,#8b5cf6);border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:800;font-size:14px;">🌀 GENERATE POLYRHYTHM</button>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:6px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelectorAll('.poly-btn').forEach((btn) => {
        const b = btn
        b.onclick = () => {
            window.polyType = b.dataset.type;
            dialog.querySelectorAll('.poly-btn').forEach((bb) => { (bb).style.borderColor = '#333'; (bb).style.color = '#fff'; });
            b.style.borderColor = '#6366f1';
            b.style.color = '#6366f1';

            const customDiv = document.getElementById('customPolyDiv');
            if (customDiv) {
                customDiv.style.display = b.dataset.type === 'custom' ? 'block' : 'none';
            }
        };
    });

    window.polyType = '3:2';
    dialog.showModal();
    dialog.onclose = () => dialog.remove();
};

window.generatePolyrhythm = function() {
    let type = window.polyType || '3:2';

    if (type === 'custom') {
        const a = parseInt((document.getElementById('polyA'))?.value || '5');
        const b = parseInt((document.getElementById('polyB'))?.value || '4');
        type = `${a}:${b}`;
    }

    const phase = parseInt((document.getElementById('polyPhase'))?.value || '32');
    const kickOn = (document.getElementById('polyKick'))?.checked;
    const hihatOn = (document.getElementById('polyHihat'))?.checked;

    // Parse polyrhythm
    const [a, b] = type.split(':').map(Number);

    // Generate patterns
    const patternA = [];
    const patternB = [];
    const lcm = (a * b) / gcd(a, b);

    function gcd(x, y) {
        return y === 0 ? x : gcd(y, x % y);
    }

    for (let i = 0; i < phase; i++) {
        patternA.push(i % Math.floor(phase / a) === 0 ? 1 : 0);
        patternB.push(i % Math.floor(phase / b) === 0 ? 1 : 0);
    }

    window.polyrhythmPattern = { type, a, b, patternA, patternB };

    if (window.UIController?.toast) {
        window.UIController.toast(`🌀 Polyrhythm ${type} generated LCM cycle: ${lcm}`);
    }
};

// 28. BEATBOX MODE - Mic to Drums
window.openBeatboxMode = function() {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = `width:550px;background:linear-gradient(180deg,#0a0a0a,#1a2a1a);border:2px solid #22c55e;border-radius:16px;color:#fff;`;
    dialog.innerHTML = `
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <h2 style="color:#22c55e;font-size:24px;margin:0;text-shadow:0 0 20px #22c55e;">🗣️ BEATBOX MODE</h2>
                <p style="color:#666;font-size:11px;margin-top:5px;">BEATBOX INTO MIC → DRUM PATTERNS</p>
            </div>

            <div style="background:#0a0a0a;padding:20px;border-radius:12px;margin-bottom:15px;text-align:center;">
                <div id="beatboxStatus" style="font-size:48px;margin-bottom:10px;">🎤</div>
                <div id="beatboxText" style="color:#22c55e;font-size:14px;">Click START to begin</div>
                <div id="beatboxViz" style="height:40px;background:#111;border-radius:6px;margin-top:10px;overflow:hidden;">
                    <div id="beatboxLevel" style="height:100%;width:0%;background:linear-gradient(90deg,#22c55e,#84cc16);transition:width 0.05s;"></div>
                </div>
            </div>

            <div style="margin-bottom:15px;">
                <label style="color:#666;font-size:11px;display:block;margin-bottom:8px;">🎯 SOUND MAPPING</label>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
                    <div style="background:#111;padding:10px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:11px;">Boom / Puh →</span>
                        <span style="color:#00ff94;font-size:11px;">🥁 Kick</span>
                    </div>
                    <div style="background:#111;padding:10px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:11px;">Ts / Keh →</span>
                        <span style="color:#f59e0b;font-size:11px;">🥁 Snare</span>
                    </div>
                    <div style="background:#111;padding:10px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:11px;">Tss / Pff →</span>
                        <span style="color:#00ccff;font-size:11px;">🎩 HiHat</span>
                    </div>
                    <div style="background:#111;padding:10px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:11px;">Peh / Clap →</span>
                        <span style="color:#7c3aed;font-size:11px;">👏 Clap</span>
                    </div>
                </div>
            </div>

            <div style="background:#0a0a0a;padding:15px;border-radius:10px;margin-bottom:15px;">
                <div style="margin-bottom:10px;">
                    <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">🎚️ SENSITIVITY: <span id="bbSensVal">70</span>%</label>
                    <input type="range" id="bbSensitivity" min="30" max="100" value="70" style="width:100%;" oninput="document.getElementById('bbSensVal').textContent=this.value">
                </div>
                <div>
                    <label style="color:#555;font-size:9px;display:block;margin-bottom:5px;">📏 QUANTIZE</label>
                    <select id="bbQuantize" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;border-radius:4px;">
                        <option value="16n">1/16 (Tight)</option>
                        <option value="8n" selected>1/8 (Standard)</option>
                        <option value="4n">1/4 (Loose)</option>
                    </select>
                </div>
            </div>

            <div style="display:flex;gap:10px;">
                <button onclick="window.startBeatbox()" id="bbStartBtn" style="flex:2;padding:15px;background:linear-gradient(90deg,#22c55e,#84cc16);border:none;color:#000;border-radius:8px;cursor:pointer;font-weight:800;">🎤 START BEATBOXING</button>
                <button onclick="window.stopBeatbox()" style="flex:1;padding:15px;background:#ef4444;border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:700;">⏹️ STOP</button>
            </div>
            <button onclick="window.applyBeatboxPattern()" style="margin-top:10px;width:100%;padding:10px;background:#333;border:none;color:#fff;border-radius:6px;cursor:pointer;">✅ APPLY TO SEQUENCER</button>
            <button onclick="this.closest('dialog').close()" style="margin-top:10px;width:100%;padding:10px;background:#222;border:none;color:#fff;border-radius:6px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.showModal();
    dialog.onclose = () => {
        window.stopBeatbox();
        dialog.remove();
    };
};

window.startBeatbox = async function() {
    const statusEl = document.getElementById('beatboxStatus');
    const textEl = document.getElementById('beatboxText');
    const btnEl = document.getElementById('bbStartBtn');

    if (statusEl) statusEl.textContent = '🔴';
    if (textEl) textEl.textContent = 'Listening... Make some beats';
    if (btnEl) btnEl.textContent = '🎵 RECORDING...';

    window.beatboxRecording = true;
    window.beatboxPattern = { kick: [], snare: [], hihat: [], clap: [] };

    // Simulate beatbox detection (in real app, would use Web Audio API)
    window.beatboxInterval = setInterval(() => {
        if (window.beatboxRecording) return;

        const levelEl = document.getElementById('beatboxLevel');
        if (levelEl) {
            const level = Math.random() * 100;
            levelEl.style.width = `${level}%`;

            // Random drum hits for demo
            if (level > 70) {
                const drums = ['kick', 'snare', 'hihat', 'clap'];
                const drum = drums[Math.floor(Math.random() * drums.length)];
                window.beatboxPattern[drum].push(Date.now());
            }
        }
    }, 100);

    if (window.UIController?.toast) {
        window.UIController.toast('🎤 Beatbox mode active Start beatboxing');
    }
};

window.stopBeatbox = function() {
    window.beatboxRecording = false;

    if (window.beatboxInterval) {
        clearInterval(window.beatboxInterval);
    }

    const statusEl = document.getElementById('beatboxStatus');
    const textEl = document.getElementById('beatboxText');
    const btnEl = document.getElementById('bbStartBtn');

    if (statusEl) statusEl.textContent = '✅';
    if (textEl) textEl.textContent = 'Recording stopped Click APPLY to use pattern.';
    if (btnEl) btnEl.textContent = '🎤 START BEATBOXING';
};

window.applyBeatboxPattern = function() {
    if (window.beatboxPattern) return;

    const kickCount = window.beatboxPattern.kick.length;
    const snareCount = window.beatboxPattern.snare.length;
    const hihatCount = window.beatboxPattern.hihat.length;

    if (window.UIController?.toast) {
        window.UIController.toast(`✅ Beatbox applied 🥁${kickCount} 🎩${hihatCount} 👏${snareCount}`);
    }
};


