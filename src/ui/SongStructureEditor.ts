/**
 * NEXUS-X Song Structure Editor v5.0
 * Edit generated songs before playback
 *
 * Features:
 * - Add/remove bars
 * - Duplicate/reorder sections
 * - Edit section properties
 * - Extend song length
 */

export class SongStructureEditor {
    private container: HTMLElement;
    private structure: SongSection[] = [];
    private onStructureChange: ((structure: SongSection[]) => void) | null = null;
    private selectedSection: number = -1;
    private isDragging: boolean = false;
    private dragIndex: number = -1;

    private readonly SECTION_TYPES = [
        { type: 'intro', name: 'Intro', color: '#666', bars: 4 },
        { type: 'buildup', name: 'Build-Up', color: '#f59e0b', bars: 8 },
        { type: 'drop', name: 'Drop', color: '#ff0055', bars: 16 },
        { type: 'verse', name: 'Verse', color: '#00e5ff', bars: 8 },
        { type: 'chorus', name: 'Chorus', color: '#00ff94', bars: 16 },
        { type: 'breakdown', name: 'Breakdown', color: '#7c3aed', bars: 8 },
        { type: 'bridge', name: 'Bridge', color: '#5865F2', bars: 8 },
        { type: 'outro', name: 'Outro', color: '#444', bars: 4 },
        { type: 'fill', name: 'Fill', color: '#ff00cc', bars: 2 },
    ];

    constructor() {
        this.container = this.createUI();
    }

    private createUI(): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'song-structure-editor';
        wrapper.innerHTML = `
            <style>
                .song-structure-editor {
                    background: linear-gradient(180deg, #111 0%, #0a0a0a 100%);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 15px;
                    font-family: 'JetBrains Mono', monospace;
                }
                .sse-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #333;
                }
                .sse-title {
                    font-size: 14px;
                    font-weight: 800;
                    color: #00ff94;
                    text-shadow: 0 0 10px rgba(0,255,148,0.3);
                }
                .sse-toolbar {
                    display: flex;
                    gap: 8px;
                }
                .sse-btn {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    color: #888;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .sse-btn:hover {
                    background: #222;
                    color: #fff;
                    border-color: #555;
                }
                .sse-btn.primary {
                    background: #00ff94;
                    color: #000;
                    border-color: #00ff94;
                }
                .sse-btn.primary:hover {
                    background: #00cc77;
                }
                .sse-btn.danger {
                    border-color: #ff0055;
                    color: #ff0055;
                }
                .sse-btn.danger:hover {
                    background: #ff0055;
                    color: #fff;
                }
                .sse-timeline {
                    display: flex;
                    gap: 4px;
                    min-height: 80px;
                    background: #0a0a0a;
                    border-radius: 8px;
                    padding: 10px;
                    margin-bottom: 15px;
                    overflow-x: auto;
                    flex-wrap: wrap;
                }
                .sse-section {
                    min-width: 60px;
                    padding: 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.15s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    user-select: none;
                    position: relative;
                }
                .sse-section:hover {
                    transform: scale(1.02);
                    filter: brightness(1.2);
                }
                .sse-section.selected {
                    box-shadow: 0 0 0 2px #fff, 0 0 15px rgba(255,255,255,0.3);
                }
                .sse-section.dragging {
                    opacity: 0.5;
                }
                .sse-section-name {
                    font-size: 10px;
                    font-weight: 700;
                    color: #fff;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
                }
                .sse-section-bars {
                    font-size: 9px;
                    color: rgba(255,255,255,0.7);
                    margin-top: 4px;
                }
                .sse-section-bar {
                    width: 8px;
                    height: 8px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 2px;
                    margin: 1px;
                    display: inline-block;
                }
                .sse-add-section {
                    min-width: 100px;
                    border: 2px dashed #333;
                    background: transparent;
                    color: #555;
                    cursor: pointer;
                }
                .sse-add-section:hover {
                    border-color: #00ff94;
                    color: #00ff94;
                }
                .sse-add-menu {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 5px;
                    z-index: 100;
                    min-width: 120px;
                }
                .sse-add-menu.show {
                    display: block;
                }
                .sse-add-item {
                    padding: 8px 12px;
                    cursor: pointer;
                    border-radius: 4px;
                    font-size: 11px;
                    color: #888;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .sse-add-item:hover {
                    background: #222;
                    color: #fff;
                }
                .sse-add-item-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                .sse-details {
                    background: #0a0a0a;
                    border-radius: 8px;
                    padding: 15px;
                    display: none;
                }
                .sse-details.show {
                    display: block;
                }
                .sse-details-header {
                    font-size: 12px;
                    color: #888;
                    margin-bottom: 10px;
                }
                .sse-details-row {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 10px;
                }
                .sse-details-label {
                    font-size: 11px;
                    color: #666;
                    width: 80px;
                }
                .sse-details-input {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    color: #fff;
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    width: 100px;
                    font-family: 'JetBrains Mono', monospace;
                }
                .sse-details-input:focus {
                    outline: none;
                    border-color: #00ff94;
                }
                .sse-details-select {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    color: #fff;
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-family: 'JetBrains Mono', monospace;
                }
                .sse-info {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px;
                    background: #0a0a0a;
                    border-radius: 8px;
                    margin-top: 15px;
                    font-size: 11px;
                    color: #666;
                }
                .sse-info-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .sse-info-value {
                    color: #00ff94;
                    font-weight: 700;
                }
            </style>
            <div class="sse-header">
                <div class="sse-title">🎵 SONG STRUCTURE EDITOR</div>
                <div class="sse-toolbar">
                    <button class="sse-btn" id="sseClearAll">🗑️ Clear</button>
                    <button class="sse-btn" id="sseDuplicate">📋 Duplicate</button>
                    <button class="sse-btn danger" id="sseDelete">✕ Delete</button>
                    <button class="sse-btn primary" id="sseApply">✓ Apply</button>
                </div>
            </div>
            <div class="sse-timeline" id="sseTimeline"></div>
            <div class="sse-details" id="sseDetails">
                <div class="sse-details-header">Section Details</div>
                <div class="sse-details-row">
                    <span class="sse-details-label">Type:</span>
                    <select class="sse-details-select" id="sseTypeSelect"></select>
                </div>
                <div class="sse-details-row">
                    <span class="sse-details-label">Bars:</span>
                    <input type="number" class="sse-details-input" id="sseBarsInput" min="1" max="64" value="8">
                </div>
                <div class="sse-details-row">
                    <span class="sse-details-label">Energy:</span>
                    <input type="range" id="sseEnergyInput" min="0" max="100" value="50" style="flex: 1;">
                    <span id="sseEnergyValue" style="color: #00ff94; width: 30px; text-align: right;">50%</span>
                </div>
            </div>
            <div class="sse-info">
                <div class="sse-info-item">Sections: <span class="sse-info-value" id="sseSectionCount">0</span></div>
                <div class="sse-info-item">Total Bars: <span class="sse-info-value" id="sseTotalBars">0</span></div>
                <div class="sse-info-item">Est. Duration: <span class="sse-info-value" id="sseDuration">0:00</span></div>
            </div>
        `;

        // Populate type select
        const typeSelect = wrapper.querySelector('#sseTypeSelect') as HTMLSelectElement;
        this.SECTION_TYPES.forEach(st => {
            const opt = document.createElement('option');
            opt.value = st.type;
            opt.textContent = st.name;
            typeSelect.appendChild(opt);
        });

        this.setupEventListeners(wrapper);

        return wrapper;
    }

    private setupEventListeners(wrapper: HTMLElement): void {
        // Clear all
        wrapper.querySelector('#sseClearAll')?.addEventListener('click', () => {
            if (confirm('Clear all sections?')) {
                this.structure = [];
                this.selectedSection = -1;
                this.render();
            }
        });

        // Duplicate selected
        wrapper.querySelector('#sseDuplicate')?.addEventListener('click', () => {
            if (this.selectedSection >= 0 && this.selectedSection < this.structure.length) {
                const section = { ...this.structure[this.selectedSection] };
                this.structure.splice(this.selectedSection + 1, 0, section);
                this.selectedSection++;
                this.render();
            }
        });

        // Delete selected
        wrapper.querySelector('#sseDelete')?.addEventListener('click', () => {
            if (this.selectedSection >= 0) {
                this.structure.splice(this.selectedSection, 1);
                this.selectedSection = -1;
                this.render();
            }
        });

        // Apply changes
        wrapper.querySelector('#sseApply')?.addEventListener('click', () => {
            if (this.onStructureChange) {
                this.onStructureChange([...this.structure]);
            }
            this.notifyChange();
        });

        // Type change
        wrapper.querySelector('#sseTypeSelect')?.addEventListener('change', (e) => {
            if (this.selectedSection >= 0) {
                const newType = (e.target as HTMLSelectElement).value;
                const typeInfo = this.SECTION_TYPES.find(t => t.type === newType);
                this.structure[this.selectedSection].type = newType;
                if (typeInfo) {
                    this.structure[this.selectedSection].color = typeInfo.color;
                }
                this.render();
            }
        });

        // Bars change
        wrapper.querySelector('#sseBarsInput')?.addEventListener('input', (e) => {
            if (this.selectedSection >= 0) {
                const bars = parseInt((e.target as HTMLInputElement).value) || 1;
                this.structure[this.selectedSection].bars = Math.max(1, Math.min(64, bars));
                this.render();
            }
        });

        // Energy change
        wrapper.querySelector('#sseEnergyInput')?.addEventListener('input', (e) => {
            if (this.selectedSection >= 0) {
                const energy = parseInt((e.target as HTMLInputElement).value);
                this.structure[this.selectedSection].energy = energy / 100;
                (wrapper.querySelector('#sseEnergyValue') as HTMLElement).textContent = `${energy}%`;
            }
        });
    }

    private render(): void {
        const timeline = this.container.querySelector('#sseTimeline') as HTMLElement;
        timeline.innerHTML = '';

        // Render sections
        this.structure.forEach((section, index) => {
            const sectionEl = document.createElement('div');
            sectionEl.className = 'sse-section' + (index === this.selectedSection ? ' selected' : '');
            sectionEl.style.background = section.color || '#333';
            sectionEl.style.flex = `${section.bars}`;

            // Scale width based on bars (min 60px, max flexible)
            const minWidth = 60;
            const widthPerBar = 20;
            const width = Math.max(minWidth, section.bars * widthPerBar);
            sectionEl.style.minWidth = `${width}px`;

            // Bar indicators
            let barIndicators = '';
            const maxBars = Math.min(section.bars, 16);
            for (let i = 0; i < maxBars; i++) {
                barIndicators += '<span class="sse-section-bar"></span>';
            }
            if (section.bars > 16) {
                barIndicators += `<span style="font-size:8px;color:rgba(255,255,255,0.5);">+${section.bars - 16}</span>`;
            }

            sectionEl.innerHTML = `
                <span class="sse-section-name">${section.name || this.getTypeName(section.type)}</span>
                <span class="sse-section-bars">${section.bars} bars</span>
                <div style="margin-top:4px;">${barIndicators}</div>
            `;

            sectionEl.addEventListener('click', () => {
                this.selectedSection = index;
                this.render();
                this.showDetails(section);
            });

            // Drag and drop
            sectionEl.draggable = true;
            sectionEl.addEventListener('dragstart', (e) => {
                this.isDragging = true;
                this.dragIndex = index;
                sectionEl.classList.add('dragging');
            });
            sectionEl.addEventListener('dragend', () => {
                this.isDragging = false;
                sectionEl.classList.remove('dragging');
            });
            sectionEl.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            sectionEl.addEventListener('drop', (e) => {
                e.preventDefault();
                if (this.dragIndex !== index && this.dragIndex >= 0) {
                    const item = this.structure.splice(this.dragIndex, 1)[0];
                    this.structure.splice(index, 0, item);
                    this.selectedSection = index;
                    this.render();
                }
            });

            timeline.appendChild(sectionEl);
        });

        // Add section button
        const addBtn = document.createElement('div');
        addBtn.className = 'sse-section sse-add-section';
        addBtn.innerHTML = '+ Add Section';
        addBtn.style.position = 'relative';

        const addMenu = document.createElement('div');
        addMenu.className = 'sse-add-menu';
        this.SECTION_TYPES.forEach(st => {
            const item = document.createElement('div');
            item.className = 'sse-add-item';
            item.innerHTML = `<span class="sse-add-item-dot" style="background: ${st.color}"></span>${st.name}`;
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addSection(st.type, st.bars);
                addMenu.classList.remove('show');
            });
            addMenu.appendChild(item);
        });

        addBtn.appendChild(addMenu);
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addMenu.classList.toggle('show');
        });

        timeline.appendChild(addBtn);

        // Close menu when clicking elsewhere
        document.addEventListener('click', () => {
            addMenu.classList.remove('show');
        });

        // Update info
        this.updateInfo();
    }

    private showDetails(section: SongSection): void {
        const details = this.container.querySelector('#sseDetails') as HTMLElement;
        details.classList.add('show');

        (this.container.querySelector('#sseTypeSelect') as HTMLSelectElement).value = section.type;
        (this.container.querySelector('#sseBarsInput') as HTMLInputElement).value = String(section.bars);
        (this.container.querySelector('#sseEnergyInput') as HTMLInputElement).value = String(Math.round((section.energy || 0.5) * 100));
        (this.container.querySelector('#sseEnergyValue') as HTMLElement).textContent = `${Math.round((section.energy || 0.5) * 100)}%`;
    }

    private getTypeName(type: string): string {
        const found = this.SECTION_TYPES.find(t => t.type === type);
        return found ? found.name : type;
    }

    private addSection(type: string, bars: number): void {
        const typeInfo = this.SECTION_TYPES.find(t => t.type === type);
        const section: SongSection = {
            type,
            name: typeInfo?.name || type,
            bars,
            energy: 0.5,
            color: typeInfo?.color || '#333',
        };
        this.structure.push(section);
        this.selectedSection = this.structure.length - 1;
        this.render();
    }

    private updateInfo(): void {
        const totalBars = this.structure.reduce((sum, s) => sum + s.bars, 0);
        const bpm = 128; // Default, could be dynamic
        const secondsPerBar = (60 / bpm) * 4;
        const totalSeconds = totalBars * secondsPerBar;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.round(totalSeconds % 60);

        (this.container.querySelector('#sseSectionCount') as HTMLElement).textContent = String(this.structure.length);
        (this.container.querySelector('#sseTotalBars') as HTMLElement).textContent = String(totalBars);
        (this.container.querySelector('#sseDuration') as HTMLElement).textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    }

    private notifyChange(): void {
        this.container.dispatchEvent(new CustomEvent('structurechange', {
            detail: { structure: this.structure }
        }));
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    getContainer(): HTMLElement {
        return this.container;
    }

    setStructure(structure: SongSection[]): void {
        this.structure = [...structure];
        this.selectedSection = -1;
        this.render();
    }

    getStructure(): SongSection[] {
        return [...this.structure];
    }

    on_change(callback: (structure: SongSection[]) => void): void {
        this.onStructureChange = callback;
    }

    // Quick add methods
    addBars(count: number): void {
        if (this.selectedSection >= 0) {
            this.structure[this.selectedSection].bars += count;
            this.render();
        }
    }

    removeBars(count: number): void {
        if (this.selectedSection >= 0) {
            this.structure[this.selectedSection].bars = Math.max(1, this.structure[this.selectedSection].bars - count);
            this.render();
        }
    }

    extendSong(additionalBars: number): void {
        // Add bars to the last section or create new outro
        if (this.structure.length > 0) {
            this.structure[this.structure.length - 1].bars += additionalBars;
        } else {
            this.addSection('outro', additionalBars);
        }
        this.render();
    }
}

// ============================================================
// TYPES
// ============================================================

export interface SongSection {
    type: string;
    name: string;
    bars: number;
    energy?: number;
    color?: string;
}

// ============================================================
// GLOBAL INSTANCE
// ============================================================

let songEditorInstance: SongStructureEditor | null = null;

export function createSongEditor(): SongStructureEditor {
    if (!songEditorInstance) {
        songEditorInstance = new SongStructureEditor();
    }
    return songEditorInstance;
}

export function getSongEditor(): SongStructureEditor | null {
    return songEditorInstance;
}
