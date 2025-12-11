import rateLimit from 'express-rate-limit';

/**
 * Rate limiter général pour toutes les routes API
 * Limite: 1000 requêtes par 15 minutes par IP (augmenté pour le développement)
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limite de 1000 requêtes par fenêtre (augmenté pour dev)
    message: {
        error: 'Trop de requêtes',
        message: 'Vous avez dépassé la limite de requêtes. Veuillez réessayer dans 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Retourne les headers `RateLimit-*`
    legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
});

/**
 * Rate limiter strict pour les routes d'authentification
 * Limite: 50 tentatives par 15 minutes par IP (augmenté pour dev)
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limite de 50 tentatives (augmenté pour dev)
    message: {
        error: 'Trop de tentatives de connexion',
        message: 'Vous avez dépassé le nombre de tentatives autorisées. Veuillez réessayer dans 15 minutes.',
        retryAfter: '15 minutes'
    },
    skipSuccessfulRequests: true, // Ne compte pas les requêtes réussies
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter pour les opérations de création
 * Limite: 20 créations par heure par IP
 */
export const createLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 20, // Limite de 20 créations
    message: {
        error: 'Trop de créations',
        message: 'Vous avez dépassé la limite de créations. Veuillez réessayer dans 1 heure.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter pour les opérations de mise à jour/suppression
 * Limite: 30 modifications par heure par IP
 */
export const modifyLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 30, // Limite de 30 modifications
    message: {
        error: 'Trop de modifications',
        message: 'Vous avez dépassé la limite de modifications. Veuillez réessayer dans 1 heure.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter pour les endpoints de recherche/listing
 * Limite: 60 requêtes par minute par IP
 */
export const searchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limite de 60 requêtes
    message: {
        error: 'Trop de requêtes de recherche',
        message: 'Vous avez dépassé la limite de recherches. Veuillez réessayer dans 1 minute.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter pour les uploads de fichiers
 * Limite: 10 uploads par heure par IP
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // Limite de 10 uploads
    message: {
        error: 'Trop d\'uploads',
        message: 'Vous avez dépassé la limite d\'uploads. Veuillez réessayer dans 1 heure.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default {
    generalLimiter,
    authLimiter,
    createLimiter,
    modifyLimiter,
    searchLimiter,
    uploadLimiter
};
