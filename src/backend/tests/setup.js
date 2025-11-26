// Configuration de l'environnement de test
import { config } from 'dotenv';

// Charger les variables d'environnement pour les tests
config({ path: '.env.test' });

// Variables d'environnement par défaut pour les tests
process.env.NODE_ENV = 'test';
process.env.BACKEND_PORT = '3002';
process.env.DB_NAME = 'gadgetzone_test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

// Configuration de la base de données pour les tests
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'admin';

// Désactiver les logs pendant les tests
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();
