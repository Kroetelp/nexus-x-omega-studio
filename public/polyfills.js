/**
 * NEXUS-X Browser Polyfills
 * Required for @magenta/music and other npm packages
 */

// Polyfill for Node.js globals
window.global = window;

window.process = window.process || {
    env: { NODE_ENV: 'production' },
    versions: {},
    hrtime: function(start) {
        const now = performance.now() * 1e-3;
        const seconds = Math.floor(now);
        const nanoseconds = Math.floor((now - seconds) * 1e9);
        if (!start) return [seconds, nanoseconds];
        return [seconds - start[0], nanoseconds - start[1]];
    }
};

window.Buffer = window.Buffer || {
    isBuffer: () => false,
    from: (arr) => arr
};

// Global helper for dropdown menus
window.toggleDropdown = function(id, event) {
    event.stopPropagation();
    const dropdown = document.getElementById(id);
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
};

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.remove('show'));
});

// Log loaded
console.log('[NEXUS-X] Polyfills loaded');
