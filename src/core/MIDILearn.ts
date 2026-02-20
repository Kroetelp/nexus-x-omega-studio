/**
 * NEXUS-X MIDI Learn System
 * Map MIDI controllers to parameters
 */

export class MIDILearn {
    private mappings: Map<string, MIDIMapping> = new Map();
    private isLearning: boolean = false;
    private currentParam: string | null = null;
    private midiAccess: MIDIAccess | null = null;
    private onMappingChange: ((mappings: MIDIMapping[]) => void) | null = null;

    async initialize(): Promise<void> {
        try {
            this.midiAccess = await navigator.requestMIDIAccess();

            this.midiAccess.inputs.forEach(input => {
                input.onmidimessage = (e) => this.handleMIDIMessage(e);
            });

            this.midiAccess.onstatechange = (e) => {
                const port = (e as any).port;
                if (port.type === 'input' && port.state === 'connected') {
                    port.onmidimessage = (e: MIDIMessageEvent) => this.handleMIDIMessage(e);
                }
            };

            console.log('[MIDILearn] Initialized');
        } catch (e) {
            console.warn('[MIDILearn] MIDI not available:', e);
        }
    }

    startLearn(paramId: string): void {
        this.isLearning = true;
        this.currentParam = paramId;
        console.log(`[MIDILearn] Learning for: ${paramId}`);
    }

    stopLearn(): void {
        this.isLearning = false;
        this.currentParam = null;
    }

    private handleMIDIMessage(event: MIDIMessageEvent): void {
        const data = event.data;
        if (!data || data.length < 3) return;

        const status = data[0];
        const channel = status & 0x0f;
        const message = status >> 4;

        // Control Change
        if (message === 0xb && this.isLearning && this.currentParam) {
            const controller = data[1];
            const value = data[2];

            this.mappings.set(this.currentParam, {
                paramId: this.currentParam,
                controller,
                channel,
                minValue: 0,
                maxValue: 127,
                curve: 'linear'
            });

            console.log(`[MIDILearn] Mapped ${this.currentParam} to CC${controller}`);
            this.stopLearn();

            if (this.onMappingChange) {
                this.onMappingChange(this.getMappings());
            }
        }

        // Handle mapped controls
        if (message === 0xb) {
            const controller = data[1];
            const value = data[2];
            this.applyMapping(controller, channel, value);
        }

        // Note On/Off for keyboard
        if (message === 0x9 || message === 0x8) {
            const note = data[1];
            const velocity = message === 0x9 ? data[2] : 0;
            this.handleNote(note, velocity);
        }
    }

    private applyMapping(controller: number, channel: number, value: number): void {
        this.mappings.forEach((mapping, paramId) => {
            if (mapping.controller === controller && mapping.channel === channel) {
                const normalizedValue = value / 127;

                let mappedValue: number;
                switch (mapping.curve) {
                    case 'logarithmic':
                        mappedValue = Math.pow(normalizedValue, 2);
                        break;
                    case 'exponential':
                        mappedValue = Math.sqrt(normalizedValue);
                        break;
                    default:
                        mappedValue = normalizedValue;
                }

                // Apply to parameter
                this.setParameter(paramId, mapping.minValue + mappedValue * (mapping.maxValue - mapping.minValue));
            }
        });
    }

    private setParameter(paramId: string, value: number): void {
        // Try to apply to engine
        if (window.engine) {
            const parts = paramId.split('.');
            if (parts.length === 2) {
                const [object, property] = parts;
                if ((window.engine as any)[object]) {
                    (window.engine as any)[object][property] = value;
                }
            }
        }
    }

    private handleNote(note: number, velocity: number): void {
        if (window.engine?.noteOn && velocity > 0) {
            window.engine.noteOn(note, velocity / 127);
        } else if (window.engine?.noteOff) {
            window.engine.noteOff(note);
        }
    }

    getMappings(): MIDIMapping[] {
        return Array.from(this.mappings.values());
    }

    removeMapping(paramId: string): void {
        this.mappings.delete(paramId);
        if (this.onMappingChange) {
            this.onMappingChange(this.getMappings());
        }
    }

    clearAll(): void {
        this.mappings.clear();
        if (this.onMappingChange) {
            this.onMappingChange([]);
        }
    }

    setCallback(callback: (mappings: MIDIMapping[]) => void): void {
        this.onMappingChange = callback;
    }

    isLearningActive(): boolean {
        return this.isLearning;
    }
}

interface MIDIMapping {
    paramId: string;
    controller: number;
    channel: number;
    minValue: number;
    maxValue: number;
    curve: 'linear' | 'logarithmic' | 'exponential';
}

// Global
let midiLearnInstance: MIDILearn | null = null;

export function createMIDILearn(): MIDILearn {
    if (!midiLearnInstance) {
        midiLearnInstance = new MIDILearn();
    }
    return midiLearnInstance;
}
