import * as Sentry from '@sentry/node';

/**
 * Initialize Sentry for error tracking and monitoring
 */
export const initSentry = (app) => {
    // Only initialize in production or if DSN is provided
    if (process.env.SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV || 'development',

            // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
            // We recommend adjusting this value in production
            tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

            // Capture errors
            beforeSend(event, hint) {
                // Don't send errors in development unless explicitly enabled
                if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
                    return null;
                }
                return event;
            },

            // Integrations
            integrations: [
                // Enable HTTP calls tracing
                new Sentry.Integrations.Http({ tracing: true }),
                // Enable Express.js middleware tracing
                new Sentry.Integrations.Express({ app }),
            ],
        });

        console.log('✅ Sentry monitoring initialized');
    } else {
        console.log('ℹ️  Sentry not initialized (no DSN provided)');
    }
};

/**
 * Sentry request handler middleware
 * Must be the first middleware
 */
export const sentryRequestHandler = () => {
    if (process.env.SENTRY_DSN) {
        return Sentry.Handlers.requestHandler();
    }
    return (req, res, next) => next();
};

/**
 * Sentry tracing middleware
 */
export const sentryTracingHandler = () => {
    if (process.env.SENTRY_DSN) {
        return Sentry.Handlers.tracingHandler();
    }
    return (req, res, next) => next();
};

/**
 * Sentry error handler middleware
 * Must be before other error handlers
 */
export const sentryErrorHandler = () => {
    if (process.env.SENTRY_DSN) {
        return Sentry.Handlers.errorHandler();
    }
    return (req, res, next) => next();
};

/**
 * Capture exception manually
 */
export const captureException = (error, context = {}) => {
    if (process.env.SENTRY_DSN) {
        Sentry.captureException(error, {
            extra: context
        });
    } else {
        console.error('Error:', error, 'Context:', context);
    }
};

/**
 * Capture message manually
 */
export const captureMessage = (message, level = 'info') => {
    if (process.env.SENTRY_DSN) {
        Sentry.captureMessage(message, level);
    } else {
        console.log(`[${level.toUpperCase()}]`, message);
    }
};

export default Sentry;
