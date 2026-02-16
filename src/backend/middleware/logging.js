import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Middleware de logging avancé
 */
export const advancedLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Informations de base
  const logData = {
    timestamp,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length') || 0
  };

  // Log la requête entrante (sauf pour les notifications silencieuses)
  if (!(req.method === 'GET' && req.url.includes('/api/notifications'))) {
    console.log(`🔵 IN: ${req.method} ${req.url} - IP: ${logData.ip}`);
  }

  // Intercepter la réponse pour capturer le statut et le temps
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Log la réponse sortante (sauf pour les notifications silencieuses)
    if (!(req.method === 'GET' && req.url.includes('/api/notifications'))) {
      const statusIcon = statusCode < 400 ? '🟢' : statusCode < 500 ? '🟡' : '🔴';
      console.log(`${statusIcon} OUT: ${req.method} ${req.url} - ${statusCode} - ${duration}ms`);
    }

    // Logger dans un fichier en production
    if (process.env.NODE_ENV === 'production') {
      logToFile({
        ...logData,
        statusCode,
        duration,
        responseSize: Buffer.byteLength(data, 'utf8')
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Logger les erreurs avec contexte détaillé
 */
export const logError = (error, req = null, additionalContext = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    message: error.message,
    stack: error.stack,
    ...(req && {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      body: req.body,
      params: req.params,
      query: req.query
    }),
    ...additionalContext
  };

  console.error('❌ ERROR:', JSON.stringify(errorLog, null, 2));

  // Logger dans un fichier d'erreurs
  if (process.env.NODE_ENV === 'production') {
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const errorLogFile = path.join(logDir, `errors-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(errorLogFile, JSON.stringify(errorLog) + '\n');
  }
};

/**
 * Logger les événements de sécurité
 */
export const logSecurity = (event, req, details = {}) => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    level: 'SECURITY',
    event,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    url: req.url,
    method: req.method,
    ...details
  };

  console.warn('🔒 SECURITY:', JSON.stringify(securityLog, null, 2));

  // Logger dans un fichier de sécurité
  if (process.env.NODE_ENV === 'production') {
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const securityLogFile = path.join(logDir, `security-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(securityLogFile, JSON.stringify(securityLog) + '\n');
  }
};

/**
 * Logger les performances
 */
export const logPerformance = (operation, duration, metadata = {}) => {
  const perfLog = {
    timestamp: new Date().toISOString(),
    level: 'PERFORMANCE',
    operation,
    duration,
    ...metadata
  };

  console.log(`⚡ PERF: ${operation} - ${duration}ms`);

  if (process.env.NODE_ENV === 'production') {
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const perfLogFile = path.join(logDir, `performance-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(perfLogFile, JSON.stringify(perfLog) + '\n');
  }
};

/**
 * Logger les activités de l'API
 */
export const logActivity = (action, userId, details = {}) => {
  const activityLog = {
    timestamp: new Date().toISOString(),
    level: 'ACTIVITY',
    action,
    userId,
    ...details
  };

  console.log(`📝 ACTIVITY: ${action} - User: ${userId}`);

  if (process.env.NODE_ENV === 'production') {
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const activityLogFile = path.join(logDir, `activity-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(activityLogFile, JSON.stringify(activityLog) + '\n');
  }
};

/**
 * Fonction utilitaire pour logger dans un fichier
 */
const logToFile = (data) => {
  try {
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, `access-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(data) + '\n');
  } catch (error) {
    console.error('Erreur lors de l\'écriture du log fichier:', error);
  }
};

/**
 * Middleware pour capturer les erreurs asynchrones
 */
export const asyncErrorLogger = (err, req, res, next) => {
  logError(err, req, {
    type: 'Async Error',
    statusCode: res.statusCode
  });
  next(err);
};

/**
 * Monitoring de la santé du système
 */
export const healthCheck = async () => {
  const health = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    platform: process.platform,
    nodeVersion: process.version
  };

  console.log('🏥 Health Check:', JSON.stringify(health, null, 2));
  return health;
};
