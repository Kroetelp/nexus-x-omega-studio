/**
 * NEXUS-X Logger Utility
 * Centralized logging with levels and production mode
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_COLORS: Record<LogLevel, string> = {
    debug: 'color: #888',
    info: 'color: #4a9eff',
    warn: 'color: #ffaa00',
    error: 'color: #ff4444'
};

const LOG_PREFIXES: Record<LogLevel, string> = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌'
};

class Logger {
    private module: string;
    private static globalLevel: LogLevel = (typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD) ? 'warn' : 'debug';
    private static readonly LEVEL_PRIORITY: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    };

    constructor(module: string) {
        this.module = module;
    }

    private shouldLog(level: LogLevel): boolean {
        return Logger.LEVEL_PRIORITY[level] >= Logger.LEVEL_PRIORITY[Logger.globalLevel];
    }

    private formatMessage(level: LogLevel, ...args: unknown[]): unknown[] {
        const timestamp = new Date().toISOString().substr(11, 12);
        const prefix = `${LOG_PREFIXES[level]} [${timestamp}] [${this.module}]`;
        return [prefix, ...args];
    }

    debug(...args: unknown[]): void {
        if (this.shouldLog('debug')) {
            console.log(...this.formatMessage('debug', ...args));
        }
    }

    info(...args: unknown[]): void {
        if (this.shouldLog('info')) {
            console.info(...this.formatMessage('info', ...args));
        }
    }

    warn(...args: unknown[]): void {
        if (this.shouldLog('warn')) {
            console.warn(...this.formatMessage('warn', ...args));
        }
    }

    error(...args: unknown[]): void {
        if (this.shouldLog('error')) {
            console.error(...this.formatMessage('error', ...args));
        }
    }

    time(label: string): void {
        if (this.shouldLog('debug')) {
            console.time(`[${this.module}] ${label}`);
        }
    }

    timeEnd(label: string): void {
        if (this.shouldLog('debug')) {
            console.timeEnd(`[${this.module}] ${label}`);
        }
    }

    group(label: string): void {
        if (this.shouldLog('debug')) {
            console.group(`[${this.module}] ${label}`);
        }
    }

    groupEnd(): void {
        if (this.shouldLog('debug')) {
            console.groupEnd();
        }
    }

    static setGlobalLevel(level: LogLevel): void {
        Logger.globalLevel = level;
    }

    static getGlobalLevel(): LogLevel {
        return Logger.globalLevel;
    }
}

// Factory function
export function createLogger(module: string): Logger {
    return new Logger(module);
}

// Pre-created loggers for common modules
export const loggers = {
    audio: createLogger('AudioEngine'),
    sequencer: createLogger('Sequencer'),
    ai: createLogger('AI'),
    ui: createLogger('UI'),
    system: createLogger('System'),
    export: createLogger('Export')
};

export { Logger };
export type { LogLevel };
