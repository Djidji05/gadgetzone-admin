import { Setting } from '../models/index.js';
import sequelize from '../config/database.js';
import { healthCheck } from '../middleware/logging.js';
import os from 'os';

export const getSEOSettings = async (req, res) => {
    try {
        const settings = await Setting.findAll({
            where: { category: 'seo' }
        });

        // Transformer l'array en objet key-value
        const seoData = {};
        settings.forEach(s => {
            seoData[s.key] = s.value;
        });

        res.json(seoData);
    } catch (error) {
        console.error('Error fetching SEO settings:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des paramètres SEO' });
    }
};

export const updateSEOSettings = async (req, res) => {
    try {
        const settings = req.body;

        for (const [key, value] of Object.entries(settings)) {
            await Setting.upsert({
                category: 'seo',
                key,
                value: typeof value === 'string' ? value : JSON.stringify(value)
            });
        }

        res.json({ message: 'Paramètres SEO mis à jour avec succès' });
    } catch (error) {
        console.error('Error updating SEO settings:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres SEO' });
    }
};

export const getSystemHealth = async (req, res) => {
    try {
        const health = await healthCheck();
        
        // Infos système étendues
        const loadAvg = os.loadavg(); // [1 min, 5 min, 15 min]
        const cpuCount = os.cpus().length;
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
        
        // Facteur de charge CPU en pourcentage (approx)
        const cpuLoadPercent = (loadAvg[0] / cpuCount) * 100;

        const systemInfo = {
            ...health,
            os: {
                platform: os.platform(),
                release: os.release(),
                totalMem: totalMem,
                freeMem: freeMem,
                cpus: cpuCount,
                loadAvg: loadAvg,
                cpuLoadPercent: cpuLoadPercent
            },
            db: {
                status: 'Connected',
                dialect: sequelize.getDialect()
            }
        };

        // Dictionnaire Pédagogique
        const dictionary = {
            cpu: "Le processeur (CPU) est le cerveau du serveur. S'il atteint 100%, votre site répondra très lentement. Une charge normale se situe sous 70%.",
            ram: "La mémoire (RAM) est la zone de travail. Si elle est totalement pleine, le serveur va crasher ou tuer les processus (y compris le site).",
            db: "La base de données stocke toutes vos commandes et clients. Si elle tombe en panne, le site entier affiche une erreur critique."
        };

        // Analyse des problèmes potentiels et Prédictions
        const alerts = [];
        const predictions = [];

        // Analyse RAM
        if (memoryUsage > 85) {
            alerts.push({
                type: 'critical',
                message: 'Utilisation de la mémoire critique (>85%). Risque imminent de crash (Out Of Memory).'
            });
            predictions.push("Au rythme actuel d'allocation mémoire, le système pourrait s'interrompre sous peu. Action bloquante imminente.");
        } else if (memoryUsage > 70) {
            alerts.push({
                type: 'warning',
                message: 'Utilisation de la mémoire élevée (>70%). La situation est encore stable.'
            });
            predictions.push("La consommation système augmente. Un nettoyage des caches pourrait libérer de l'espace vital.");
        } else {
            predictions.push("Stabilité Mémoire : Parfaite. Aucun crash lié à la RAM n'est prévu à court terme.");
        }

        // Analyse CPU
        if (cpuLoadPercent > 80) {
            alerts.push({
                type: 'warning',
                message: `Le processeur est fortement sollicité (${cpuLoadPercent.toFixed(1)}%). Le site peut paraître lent.`
            });
        }

        // Analyse Uptime
        if (health.uptime < 3600) {
            alerts.push({
                type: 'info',
                message: 'Le système vient d\'être redémarré (Uptime < 1h).'
            });
        }

        // Suggestion de maintenance
        const lastMaintenance = await Setting.findOne({ where: { category: 'system', key: 'last_maintenance' } });
        if (!lastMaintenance || (Date.now() - new Date(lastMaintenance.value).getTime() > 7 * 24 * 60 * 60 * 1000)) {
            alerts.push({
                type: 'maintenance',
                message: 'Une maintenance préventive (nettoyer les temporaires, optimiser DB) est fortement recommandée.'
            });
        } else {
            predictions.push("Un entretien récent a été détecté. Votre base de données est actuellement optimisée.");
        }

        res.json({
            health: systemInfo,
            dictionary,
            alerts,
            predictions
        });
    } catch (error) {
        console.error('Error fetching health stats:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la santé système' });
    }
};

export const runMaintenance = async (req, res) => {
    try {
        // 1. Mettre à jour la date de dernière maintenance
        await Setting.upsert({
            category: 'system',
            key: 'last_maintenance',
            value: new Date().toISOString()
        });

        // 2. Nettoyage réel : Supprimer les notifications lues datant de plus de 30 jours
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let cleanedLogs = 0;
        
        try {
            // Nettoyage via des requêtes brutes pour éviter tout problème d'import
            const [deletedNotifs] = await sequelize.query(`
                DELETE FROM notifications 
                WHERE is_read = true AND created_at < :date
            `, {
                replacements: { date: thirtyDaysAgo }
            });
            cleanedLogs += deletedNotifs.rowCount || 0;
        } catch(e) {
            console.error('Erreur nettoyage notifications:', e);
        }

        try {
            // Nettoyage des paniers abandonnés depuis plus de 60 jours
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
            
            const [deletedCarts] = await sequelize.query(`
                DELETE FROM carts 
                WHERE updated_at < :date
            `, {
                replacements: { date: sixtyDaysAgo }
            });
            cleanedLogs += deletedCarts.rowCount || 0;
        } catch(e) {
            console.error('Erreur nettoyage carts:', e);
        }

        res.json({ 
            message: `Maintenance effectuée avec succès. Nettoyage de routine terminé.`,
            details: `Nettoyage des données obsolètes réalisé.`
        });
    } catch (error) {
        console.error('Error running maintenance:', error);
        res.status(500).json({ error: 'Erreur lors de l’exécution de la maintenance' });
    }
};
