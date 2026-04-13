import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, '../../logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

class Logger {
    constructor(filename) {
        this.logFile = path.join(logDir, filename);
    }

    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    }

    log(level, message) {
        const formatted = this.formatMessage(level, message);
        console.log(formatted.trim()); // Still log to console for dev visibility
        fs.appendFileSync(this.logFile, formatted);
    }

    info(message) {
        this.log('info', message);
    }

    error(message, error = null) {
        const errorMessage = error ? `${message} - Error: ${error.message || error}` : message;
        this.log('error', errorMessage);
    }

    warn(message) {
        this.log('warn', message);
    }
}

export const apiLogger = new Logger('api.log');
export const workerLogger = new Logger('workers.log');

export default {
    api: apiLogger,
    worker: workerLogger
};
