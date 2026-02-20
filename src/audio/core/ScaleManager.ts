/**
 * NEXUS-X Scale Manager v5.0
 * 🦍 GIGACHAD SCALE SYSTEM - 67+ Scales
 * Extracted from AudioEngine for modularity
 */

export class ScaleManager {
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
        pentatonic:       ["C", "Eb", "F", "G", "Bb", "C", "Eb"],        // Minor pentatonic

        // === PENTATONIC LEGENDS ===
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

        // === VIDEO GAME / CHIPTUNE ===
        nesMajor:         ["C", "D", "E", "G", "A", "C", "D"],           // Mario Bros classic
        zelda:            ["C", "D", "E", "G", "A", "B", "C"],           // Triforce activated
        megaMan:          ["C", "Eb", "F", "G", "Bb", "C", "Eb"],        // Blue bomber
        castlevania:      ["C", "D", "Eb", "G", "Ab", "C", "D"],         // Vampire killer
        sonicMode:        ["C", "D", "F", "G", "A", "C", "D"],           // Gotta go fast
        finalFantasy:     ["C", "D", "E", "G", "A", "B", "C"],           // Nobuo Uematsu special
        tibia:            ["C", "D", "Eb", "F", "G", "Bb", "C"],         // Medieval MMO vibes

        // === CINEMATIC / SOUNDTRACK ===
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

        // === WORLD MUSIC LEGENDS ===
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

        // === EXPERIMENTAL WTF ===
        octatonic:        ["C", "Db", "Eb", "E", "F#", "G", "A", "Bb"],  // Stravinsky says hi
        chromatic:        ["C", "C#", "D", "D#", "E", "F", "F#"],        // Chaos mode
        tritoneParadise:  ["C", "F#", "G", "C#", "D", "G#", "A"],        // Medieval banned
        fourthsStack:     ["C", "F", "Bb", "Eb", "Ab", "C", "F"],        // McCoy Tyner special
        fifthsStack:      ["C", "G", "D", "A", "E", "B", "F#"],          // Power chord paradise

        // === SECRET UNLOCKABLES ===
        simpleAs:         ["C", "E", "G", "C", "E", "G", "C"],           // Literally a triad lol
        piratesCredo:     ["C", "D", "Eb", "F", "G", "Ab", "Bb"],        // Jack Sparrow approved
        theL:             ["C", "D", "E", "F", "G", "A", "B"]            // Law and order dun dun
    };

    private currentScale: string = 'minor';

    /**
     * Set the current scale by name
     */
    setScale(name: string): boolean {
        if (!this.scales[name]) {
            console.warn(`[ScaleManager] Unknown scale: ${name}, falling back to minor`);
            this.currentScale = 'minor';
            return false;
        }
        this.currentScale = name;
        console.log(`[ScaleManager] Scale set to: ${name}`);
        return true;
    }

    /**
     * Get the current scale name
     */
    getCurrentScaleName(): string {
        return this.currentScale;
    }

    /**
     * Get the current scale notes
     */
    getCurrentScale(): string[] {
        return this.scales[this.currentScale] || this.scales['minor'];
    }

    /**
     * Get all available scale names
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
     * Get the number of scales available
     */
    getScaleCount(): number {
        return Object.keys(this.scales).length;
    }

    /**
     * Convert scale index to MIDI note
     * @param scaleIndex - Index within the scale
     * @param octave - MIDI octave (0-9)
     * @param rootNote - Root MIDI note (default 60 = C4)
     * @returns MIDI note number
     */
    scaleIndexToMidi(scaleIndex: number, octave: number = 4, rootNote: number = 60): number {
        const scale = this.getCurrentScale();
        const scaleLen = scale.length;

        // Calculate semitones from root
        const noteInScale = scaleIndex % scaleLen;
        const octaveOffset = Math.floor(scaleIndex / scaleLen);

        // Map scale note to semitone offset
        const noteName = scale[noteInScale];
        const semitones = this.noteNameToSemitones(noteName);

        return rootNote + semitones + (octaveOffset * 12);
    }

    /**
     * Convert note name to semitones from C
     */
    private noteNameToSemitones(noteName: string): number {
        const noteMap: Record<string, number> = {
            'C': 0, 'C#': 1, 'Db': 1,
            'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4, 'Fb': 4,
            'F': 5, 'F#': 6, 'Gb': 6,
            'G': 7, 'G#': 8, 'Ab': 8,
            'A': 9, 'A#': 10, 'Bb': 10,
            'B': 11, 'Cb': 11
        };
        return noteMap[noteName] || 0;
    }

    /**
     * Get a random scale for variety
     */
    getRandomScale(): string {
        const scales = this.getAvailableScales();
        return scales[Math.floor(Math.random() * scales.length)];
    }
}

// Singleton export
export const scaleManager = new ScaleManager();
