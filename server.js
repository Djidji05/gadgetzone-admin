import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import des configurations et routes
import { initDatabase } from './src/backend/config/database.js';
import apiRoutes from './src/backend/routes/index.js';
import { advancedLogger, asyncErrorLogger, logError, healthCheck } from './src/backend/middleware/logging.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(advancedLogger);
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du frontend en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// Routes API
app.use('/api', apiRoutes);

// Route de santé
app.get('/health', async (req, res) => {
  try {
    const health = await healthCheck();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      ...health
    });
  } catch (error) {
    logError(error, req, { type: 'Health Check Error' });
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      message: 'Health check failed'
    });
  }
});

// Middleware de gestion des erreurs
app.use(asyncErrorLogger);

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  logError(err, req, { type: 'Global Error Handler' });

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Erreur serveur interne'
    : err.message;

  res.status(statusCode).json({
    error: 'Erreur serveur',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Catch-all handler pour SPA
app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.json({ message: 'Backend API is running' });
  }
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Initialiser la base de données
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log(`📊 API available at: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
