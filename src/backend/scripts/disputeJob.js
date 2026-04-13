import { checkStaleDisputes } from '../utils/notificationHelper.js';
import { workerLogger } from '../utils/logger.js';

/**
 * Script à exécuter périodiquement pour vérifier les litiges stagnants
 */
async function run() {
    try {
        workerLogger.info('⏳ Démarrage de la vérification des litiges stagnants...');
        await checkStaleDisputes();
        workerLogger.info('✅ Vérification des litiges terminée.');
        process.exit(0);
    } catch (error) {
        workerLogger.error('❌ Erreur lors de l\'exécution du job de litiges:', error);
        process.exit(1);
    }
}

run();
