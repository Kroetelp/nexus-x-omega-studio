/**
 * NEXUS-X UI Dialog Utilities
 * Helper functions for creating and managing UI dialogs
 */

/**
 * Create a modal dialog element
 */
export function createPanelDialog(
    id: string,
    title: string,
    content: string,
    width: string = '600px'
): HTMLDialogElement {
    const dialog = document.createElement('dialog');
    dialog.id = id;
    dialog.innerHTML = `
        <div class="dialog-header">
            <h3>${title}</h3>
            <button class="close-btn" onclick="this.closest('dialog').close()">&times;</button>
        </div>
        <div class="dialog-content">
            ${content}
        </div>
    `;
    dialog.style.cssText = `width: ${width}; max-width: 90vw; max-height: 90vh;`;

    // Add to document if not exists
    if (!document.getElementById(id)) {
        document.body.appendChild(dialog);
    }

    return dialog;
}

/**
 * Show a dialog by ID
 */
export function showDialog(id: string): void {
    const dialog = document.getElementById(id) as HTMLDialogElement;
    if (dialog) {
        dialog.showModal();
    }
}

/**
 * Close a dialog by ID
 */
export function closeDialog(id: string): void {
    const dialog = document.getElementById(id) as HTMLDialogElement;
    if (dialog) {
        dialog.close();
    }
}

/**
 * Toggle a dialog by ID
 */
export function toggleDialog(id: string): void {
    const dialog = document.getElementById(id) as HTMLDialogElement;
    if (dialog) {
        if (dialog.open) {
            dialog.close();
        } else {
            dialog.showModal();
        }
    }
}

/**
 * Create a toast notification
 */
export function showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons: Record<string, string> = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999;';
    document.body.appendChild(container);
    return container;
}

/**
 * Create a confirmation dialog
 */
export function confirm(message: string, onConfirm: () => void, onCancel?: () => void): void {
    const dialog = createPanelDialog(
        'confirm-dialog',
        'Confirm',
        `
            <p>${message}</p>
            <div class="dialog-buttons">
                <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
                <button class="btn btn-primary" id="confirm-ok">OK</button>
            </div>
        `,
        '400px'
    );

    dialog.querySelector('#confirm-ok')?.addEventListener('click', () => {
        onConfirm();
        dialog.close();
    });

    dialog.querySelector('#confirm-cancel')?.addEventListener('click', () => {
        onCancel?.();
        dialog.close();
    });

    dialog.showModal();
}
